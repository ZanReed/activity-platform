-- =============================================================================
-- 0017_read_api.sql — the viewer read API's database surface (S2)
-- -----------------------------------------------------------------------------
-- First server lane slice of the components-as-data re-architecture (rulings
-- 1B/4A/TV4-A/3.2A in ~/.gstack/.../user-main-design-20260728-components-as-
-- data.md; the eight S2 decisions in DECISIONS.md → "Read API S2"). Three
-- pieces:
--
--   1. activity_version_reads — the DURABLE per-version cache (ruling 4A named
--      a DB table over an R2 object: the R2 bucket is public, and a cached
--      sanitized document must stay behind the same auth the live read has).
--      Keyed (version_id, sanitizer_rev); sanitizer_rev is COMPUTED from the
--      registry's sanitize declarations (viewer-server bundle), so a spec
--      change orphans stale rows automatically instead of serving them.
--      Service-role only: written and read exclusively by the get-activity
--      Edge Function. allowlist/audit_log/student_domain posture — RLS forced,
--      ZERO policies, deny-by-default IS the access control.
--
--   2. get_published_activity(uuid) — the authenticated read gate. Runs as the
--      CALLER via the user-scoped client, so the DB (not the Edge Function)
--      enforces the access rule: any authenticated user may resolve the
--      published CURRENT version of a non-deleted activity — the R2
--      link-share model moved behind sign-in (S2 decision 2; classes carry
--      the 13+ assertion, they are not activity ACLs). Draft content and
--      non-current versions are unreachable through this surface. SECURITY
--      DEFINER because activities/activity_versions RLS is owner-scoped and
--      students own nothing; the WHERE clause is the real gate.
--
--   3. get_activity_public_meta(uuid) — the ANONYMOUS pre-auth contract
--      (design ruling 3.2A): title + teacher display name ONLY, for the
--      sign-in interstitial ("use your @district.org account"). Deliberately
--      anon-callable (documented residue below) — the same two facts every
--      published R2 page already shows without auth. Rate limiting lives in
--      the Edge Function (best-effort per-isolate; proportionate to what this
--      exposes).
--
-- Reads write NO audit_log rows — P3A's census aggregates from
-- submissions/audit_log on the write path; per-read audit at student scale
-- would be hot-path bloat for no ruled requirement.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. activity_version_reads — durable upgraded+sanitized per-version cache
-- -----------------------------------------------------------------------------
-- content is the UPGRADED (current-schema) + SANITIZED document — the
-- student-independent artifact. Per-student serve shuffles are applied at
-- serve time by the Edge Function, never stored. ON DELETE CASCADE: a cache
-- row is derived data; it must never block deleting its source version.
create table activity_version_reads (
  version_id     uuid not null references activity_versions(id) on delete cascade,
  sanitizer_rev  text not null,
  schema_version integer not null,
  content        jsonb not null,
  created_at     timestamptz not null default now(),

  primary key (version_id, sanitizer_rev)
);

alter table activity_version_reads enable row level security;
alter table activity_version_reads force row level security;
-- Zero policies, deliberately: service-role (which bypasses RLS) is the only
-- intended reader/writer. Shows up as rls_enabled_no_policy INFO — intentional,
-- same as allowlist / audit_log / student_domain.

-- -----------------------------------------------------------------------------
-- 2. get_published_activity — authenticated resolve of the current version
-- -----------------------------------------------------------------------------
create function get_published_activity(p_activity_id uuid)
returns table (version_id uuid, version_num integer, title text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Belt-and-suspenders: EXECUTE is revoked from anon below, so an anonymous
  -- caller is refused before this runs; this guards a future grant mistake.
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;

  return query
  select v.id, v.version_num, a.title
  from activities a
  join activity_versions v on v.id = a.current_version_id
  where a.id = p_activity_id
    and a.deleted_at is null
    and a.status = 'published';

  if not found then
    -- One message for missing / unpublished / deleted — an authenticated
    -- stranger learns nothing about which it was.
    raise exception 'Not available';
  end if;
end;
$$;

revoke execute on function get_published_activity(uuid) from public, anon;
grant execute on function get_published_activity(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. get_activity_public_meta — the anonymous pre-auth interstitial contract
-- -----------------------------------------------------------------------------
-- Title + teacher display name and NOTHING else (no content, no counts, no
-- emails). users RLS is self-only, hence the DEFINER read of display_name —
-- the same reason list_class_members exists (0014). teacher_name may be null
-- (display_name is nullable); the client supplies its own fallback copy.
create function get_activity_public_meta(p_activity_id uuid)
returns table (title text, teacher_name text)
language sql
stable
security definer
set search_path = public
as $$
  select a.title, u.display_name as teacher_name
  from activities a
  join users u on u.id = a.owner_id
  where a.id = p_activity_id
    and a.deleted_at is null
    and a.status = 'published';
$$;

revoke execute on function get_activity_public_meta(uuid) from public;
grant execute on function get_activity_public_meta(uuid) to anon, authenticated, service_role;

-- =============================================================================
-- Intentional advisor residue after this migration (do NOT "fix" these)
-- -----------------------------------------------------------------------------
--   * rls_enabled_no_policy (INFO) on activity_version_reads — deny-by-default,
--     zero policies IS the design (joins allowlist / audit_log /
--     student_domain in the documented set).
--   * authenticated_security_definer_function_executable (WARN) on
--     get_published_activity — DEFINER with an inline gate (auth.uid() +
--     published-only WHERE) is the same accepted pattern as publish_activity
--     et al. (0015 footer lists the set; this joins it).
--   * get_activity_public_meta is DEFINER and ANON-callable BY DESIGN (ruling
--     3.2A) — the one deliberate exception to 0009's "no anon-executable
--     functions" cleanup, in the same class as the postgres-owned published-
--     page RPCs: it exposes exactly the two facts any published page shows
--     publicly today. If an advisor run flags it, this footer is the triage.
-- =============================================================================

-- =============================================================================
-- Verification — spot checks (run scripts/verify-0017.sql for the full pass)
-- =============================================================================
--
-- -- 1. Grants. EXPECT get_published_activity: {authenticated, service_role}
-- --    (+postgres); get_activity_public_meta: {anon, authenticated,
-- --    service_role} (+postgres); NO PUBLIC row for either.
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname in ('get_published_activity', 'get_activity_public_meta')
-- order by 1, 2;
--
-- -- 2. Cache table locked down. EXPECT: rowsecurity=t, forcerowsecurity=t, 0
-- --    policies.
-- select relrowsecurity, relforcerowsecurity from pg_class
-- where relname = 'activity_version_reads';
-- select count(*) from pg_policies where tablename = 'activity_version_reads';
--
-- -- 3. The post-DDL ACL completeness routine (0016 footer): EXPECT 0 rows
-- --    OTHER than get_activity_public_meta (the documented anon exception).
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where n.nspname = 'public'
--   and (g.rolname = 'anon' or a.grantee = 0)
-- order by 1, 2;
