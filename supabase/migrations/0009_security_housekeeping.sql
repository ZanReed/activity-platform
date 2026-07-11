-- =============================================================================
-- 0009_security_housekeeping.sql — advisor-driven security + performance pass
-- -----------------------------------------------------------------------------
-- Source: Supabase security + performance advisors (get_advisors), run
-- 2026-07-11 and re-verified against the live database before writing this.
-- Every change below was checked against the actual call sites in
-- packages/app and supabase/functions — nothing here is a blind lint fix.
--
-- What this migration does:
--   1. activity_aggregate_stats view → security_invoker (advisor ERROR).
--   2. Locks down EXECUTE on the SECURITY DEFINER RPCs (advisor WARNs) —
--      including revoking from PUBLIC, which held an implicit grant that
--      would have made anon/authenticated-only revokes ineffective.
--   3. Pins search_path on the three SECURITY INVOKER RLS helpers.
--   4. Rewrites auth.uid() → (select auth.uid()) in 9 RLS policies so the
--      planner evaluates it once per query (initplan) instead of per row.
--   5. Adds covering indexes for the 5 unindexed foreign keys.
--
-- Deliberately NOT changed (see docs/DECISIONS.md → "Supabase security/
-- performance housekeeping (0009)"):
--   * allowlist + audit_log keep RLS-with-no-policies — deny-by-default,
--     service-role-only by design (0002's explicit intent).
--   * The two permissive SELECT policies on submissions stay separate.
--   * unused_index INFOs ignored (no meaningful traffic yet).
--   * Leaked-password protection not enabled (Google OAuth only; there are
--     no passwords to protect).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. activity_aggregate_stats — respect the querying user's RLS
-- -----------------------------------------------------------------------------
-- The view was created in 0003 without security_invoker, so (as all Postgres
-- views default) it ran with the DEFINER rights of its owner (postgres, which
-- bypasses RLS). Combined with Supabase's default grant of SELECT to anon and
-- authenticated, any signed-in user could read submission counts, average
-- scores, and owner_id for EVERY teacher's activities — a real cross-teacher
-- leak, even with no PII in the columns. Nothing in the app queries this view
-- today (it is Phase 5 marketplace prep, grep-verified), so flipping it is
-- observably free.
--
-- With security_invoker, the underlying activities/submissions policies
-- apply: an owner sees aggregates over exactly the submissions they could
-- read row-by-row. The 0003 comment already planned a SECURITY DEFINER
-- *function* for the Phase 5 cross-teacher case; that remains the plan —
-- deliberate definer semantics belong in a function with an explicit
-- authorization check, never in a view's implicit default.
alter view activity_aggregate_stats set (security_invoker = true);

-- Tighten the default table-wide grants while we're here: anon has no
-- business reading aggregates (and with security_invoker would see zero rows
-- anyway), and nobody INSERTs into an aggregate view.
revoke all on activity_aggregate_stats from anon, authenticated;
grant select on activity_aggregate_stats to authenticated;

-- -----------------------------------------------------------------------------
-- 2. EXECUTE lockdown on the SECURITY DEFINER RPCs
-- -----------------------------------------------------------------------------
-- Supabase grants EXECUTE on new public functions to PUBLIC, anon,
-- authenticated, and service_role by default, and PostgREST exposes every
-- executable function at /rest/v1/rpc/<name>. The advisor flagged all six
-- SECURITY DEFINER functions as anon+authenticated-executable. Verified call
-- sites before revoking:
--
--   publish_activity      — publish-activity Edge Function, via the USER's
--                           JWT (anon key + Authorization header → the
--                           `authenticated` role). NOT service role — the
--                           function's own header comments document that
--                           SUPABASE_SERVICE_ROLE_KEY was removed. Keeps
--                           `authenticated`; loses PUBLIC + anon. Its
--                           internal can_edit_activity check remains the
--                           real authorization.
--   soft_delete_activity  — called client-side (Activities.tsx) with the
--                           user's JWT. Keeps `authenticated` (the 0008
--                           grant); loses PUBLIC + anon.
--   ingest_submission     — ingest-submission Edge Function only, via the
--                           service role. No browser caller: students POST
--                           to the Edge Function, never to PostgREST. Loses
--                           everything except service_role. (Before this, a
--                           student who found /rest/v1/rpc/ingest_submission
--                           could bypass the Edge Function's Zod validation,
--                           rate context, and ip-hashing entirely.)
--   handle_new_auth_user  — auth trigger; fired by the auth service, never
--                           called via RPC. Postgres checks EXECUTE at
--                           trigger-creation time, not fire time, but we
--                           grant supabase_auth_admin explicitly (the
--                           standard Supabase pattern) so a future trigger
--                           re-create doesn't trip over the revoke.
--   purge_soft_deleted    — pg_cron job (runs as the function's owner once
--                           scheduled); no client caller. No grant needed.
--   rls_auto_enable       — the `ensure_rls` EVENT TRIGGER's function (a
--                           safety net that auto-enables RLS on new public
--                           tables). Created via the dashboard, not by a
--                           migration — recorded here for provenance. Event
--                           triggers don't check EXECUTE at fire time; no
--                           grant needed.
--
-- service_role keeps its explicit grants throughout (revoking PUBLIC does
-- not touch them; re-stated below where it is the sole intended caller).
-- NOTE for future RPC migrations: Supabase's default privileges still grant
-- new functions to PUBLIC/anon/authenticated — every new RPC needs its own
-- revoke/grant stanza like this one.

revoke execute on function publish_activity(uuid) from public, anon;

revoke execute on function soft_delete_activity(uuid) from public, anon;

revoke execute on function ingest_submission(uuid, text, text, jsonb, numeric, text, text)
  from public, anon, authenticated;
grant execute on function ingest_submission(uuid, text, text, jsonb, numeric, text, text)
  to service_role;

revoke execute on function handle_new_auth_user() from public, anon, authenticated;
grant execute on function handle_new_auth_user() to supabase_auth_admin;

revoke execute on function purge_soft_deleted() from public, anon, authenticated;

revoke execute on function rls_auto_enable() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Pin search_path on the RLS helper functions
-- -----------------------------------------------------------------------------
-- The 0002 helpers were created without a SET search_path clause (the six
-- DEFINER functions already pin one; these three were the only mutable ones).
-- They are SECURITY INVOKER, so the injection risk is far smaller than the
-- DEFINER case, but pinning is still correct: an RLS helper must never
-- resolve `activities` to anything but public.activities, whatever the
-- session's search_path says. Pinned to '' (strictest form) with
-- schema-qualified bodies, per current Supabase guidance.
--
-- Bodies are otherwise byte-identical to 0002 (owner checks; Phase 3+ grows
-- them). CREATE OR REPLACE preserves the function OID, so every RLS policy
-- referencing them is untouched. Known trade: a SET clause disables SQL
-- function inlining, so the planner calls these as real functions now —
-- irrelevant at current row counts, and the policies that call them were
-- never in the advisor's initplan list.

create or replace function can_read_activity(p_activity_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.activities a
    where a.id = p_activity_id
      and a.owner_id = auth.uid()
      and a.deleted_at is null
  );
$$;

create or replace function can_edit_activity(p_activity_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.activities a
    where a.id = p_activity_id
      and a.owner_id = auth.uid()
      and a.deleted_at is null
  );
$$;

create or replace function can_access_assignment(p_assignment_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.assignments a
    where a.id = p_assignment_id
      and a.teacher_id = auth.uid()
      and a.deleted_at is null
  );
$$;

-- -----------------------------------------------------------------------------
-- 4. auth_rls_initplan — evaluate auth.uid() once per query, not per row
-- -----------------------------------------------------------------------------
-- A bare auth.uid() in a policy is re-evaluated for every candidate row;
-- wrapping it as (select auth.uid()) lets the planner run it once as an
-- InitPlan. Semantics are identical — auth.uid() is stable within a query.
-- All nine advisor-flagged policies, rewritten with every occurrence wrapped
-- (including the ones inside subselects).
--
-- ALTER POLICY replaces a policy's USING/WITH CHECK atomically — no window
-- where the policy is absent. (0006's comment claimed drop + recreate was
-- the only way to change a policy's clauses; that was wrong — ALTER POLICY
-- has supported this since Postgres 9.5.)
--
-- Expressions mirror the LIVE policy definitions (pg_policies, 2026-07-11),
-- which is 0002 plus 0006's account_tier guard on users_update_self.

alter policy users_select_self on users
  using (
    id = (select auth.uid())
    or exists (
      select 1 from users u
      where u.id = (select auth.uid()) and u.role = 'admin'
    )
  );

alter policy users_update_self on users
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = (select role from users where id = (select auth.uid()))
    and account_tier = (select account_tier from users where id = (select auth.uid()))
  );

alter policy activities_select_own on activities
  using (owner_id = (select auth.uid()) and deleted_at is null);

alter policy activities_insert_own on activities
  with check (owner_id = (select auth.uid()));

alter policy activities_update_own on activities
  using (owner_id = (select auth.uid()) and deleted_at is null)
  with check (owner_id = (select auth.uid()));

alter policy activity_versions_insert_own on activity_versions
  with check (
    created_by = (select auth.uid())
    and can_edit_activity(activity_id)
  );

alter policy assignments_select_own on assignments
  using (teacher_id = (select auth.uid()) and deleted_at is null);

alter policy assignments_insert_own on assignments
  with check (teacher_id = (select auth.uid()));

alter policy assignments_update_own on assignments
  using (teacher_id = (select auth.uid()) and deleted_at is null)
  with check (teacher_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- 5. Covering indexes for unindexed foreign keys
-- -----------------------------------------------------------------------------
-- Postgres indexes the referenced side of an FK automatically (the PK) but
-- not the referencing column. These five FKs had no covering index, which
-- makes referenced-side DELETEs (e.g. purge_soft_deleted's hard-deletes) and
-- reverse joins scan. Full indexes, not partial — the advisor's covering
-- check and the FK-constraint lookups both want the unfiltered column.
-- Column names verified against the live constraints.

create index activities_current_version_idx   on activities (current_version_id);
create index activity_versions_created_by_idx on activity_versions (created_by);
create index allowlist_added_by_idx           on allowlist (added_by);
create index assignments_activity_version_idx on assignments (activity_version_id);
create index submissions_activity_version_idx on submissions (activity_version_id);

-- =============================================================================
-- Verification — run after `supabase db push` (or after pasting this file in
-- the SQL editor). Every query lists its expected result.
-- =============================================================================
--
-- -- 1. View runs as invoker. EXPECT: {security_invoker=true}
-- select reloptions from pg_class
-- where relname = 'activity_aggregate_stats';
--
-- -- 2. RPC grants. EXPECT exactly:
-- --    publish_activity      → {authenticated, service_role} (+postgres)
-- --    soft_delete_activity  → {authenticated, service_role} (+postgres)
-- --    ingest_submission     → {service_role} (+postgres)
-- --    handle_new_auth_user  → {supabase_auth_admin, service_role} (+postgres)
-- --    purge_soft_deleted    → {service_role} (+postgres)
-- --    rls_auto_enable       → {service_role} (+postgres)
-- --    and NO row anywhere with grantee in ('anon', 'PUBLIC').
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.pronamespace = 'public'::regnamespace and p.prosecdef
-- order by 1, 2;
--
-- -- 3. Helper search_path pinned. EXPECT: 3 rows, each {search_path=""}
-- select proname, proconfig from pg_proc
-- where pronamespace = 'public'::regnamespace
--   and proname in ('can_read_activity', 'can_edit_activity', 'can_access_assignment');
--
-- -- 4. No policy still evaluates auth.uid() per row. EXPECT: 0 rows
-- --    (the initplan form deparses as "( SELECT auth.uid() AS uid)"; strip
-- --    it and any auth.uid() left over is a bare per-row call).
-- select tablename, policyname from pg_policies
-- where schemaname = 'public'
--   and replace(coalesce(qual, '') || coalesce(with_check, ''),
--               '( SELECT auth.uid() AS uid)', '') like '%auth.uid()%';
--
-- -- 5. FK covering indexes exist. EXPECT: 5 rows
-- select indexname from pg_indexes
-- where schemaname = 'public'
--   and indexname in ('activities_current_version_idx', 'activity_versions_created_by_idx',
--                     'allowlist_added_by_idx', 'assignments_activity_version_idx',
--                     'submissions_activity_version_idx');
--
-- -- 6. RLS still intact: re-run the two-teacher test in migrations/README.md
-- --    ("Test plan" section) — all EXPECTs unchanged.
--
-- -- 7. App smoke (author, via the running app):
-- --    * Publish an activity (exercises publish_activity as `authenticated`
-- --      through the Edge Function).
-- --    * Delete a scratch activity (soft_delete_activity, client-side RPC).
-- --    * Submit answers on a published page anonymously (ingest_submission
-- --      via the Edge Function's service role).
-- --    No Edge Function redeploy is needed — no function code changed.
--
-- -- 8. Re-run both advisors (dashboard → Advisors). EXPECT remaining:
-- --    * INFO rls_enabled_no_policy on allowlist + audit_log   (by design)
-- --    * INFO unused_index (various)                           (no traffic yet)
-- --    * WARN auth_leaked_password_protection                  (OAuth-only)
-- --    * WARN multiple_permissive_policies on submissions      (kept; see
-- --      DECISIONS.md)
-- --    Everything else from the 2026-07-11 run should be gone.
