-- =============================================================================
-- 0016_helper_grant_lockdown.sql — the last four functions without a stanza
-- -----------------------------------------------------------------------------
-- Closes the set opened by 0009 and continued by 0015: every function in
-- `public` now has an explicit revoke/grant stanza, so Supabase's default
-- PUBLIC grant is nowhere load-bearing.
--
-- The four RLS helpers — can_read_activity, can_edit_activity,
-- can_access_assignment (0002, redefined 0009) and can_grade_submission
-- (0010) — still carried PUBLIC + anon EXECUTE. **No advisor lint ever showed
-- this**: the function lints (0028/0029) only examine SECURITY DEFINER
-- functions, and 0009 deliberately made these SECURITY INVOKER. Found by
-- querying pg_proc ACLs directly (the check in scripts/verify-0013-0014.sql
-- §B1) — recorded in DECISIONS.md so the next pass runs the ACL query rather
-- than trusting a clean advisor report.
--
-- WHY IT WAS HARMLESS, AND WHY IT STILL GETS CLOSED
-- Called as `anon`, an INVOKER helper runs with anon's privileges: the tables
-- it reads have RLS, `auth.uid()` is NULL, so it returns false for every input
-- and discloses nothing. This migration is hygiene, not a fix — but leaving
-- one unstanza'd function invites the next one, which is exactly how the
-- restore_activity gap (0012 → 0015) happened.
--
-- BEHAVIOR CHANGE, deliberate and safe: the helpers are called inside RLS
-- policies on activity_versions, assignment_students, submissions and grades.
-- Before, an `anon` SELECT against those tables evaluated the helper and got
-- an empty result; now it raises "permission denied for function ...". No real
-- path is affected — every app query is authenticated, and the published-page
-- surfaces (ingest-submission, get-feedback) reach the DB through SECURITY
-- DEFINER RPCs owned by postgres, which keeps EXECUTE regardless of these
-- grants. An anon PostgREST hit on those tables is not a supported path in
-- either regime; it just fails louder now.
-- =============================================================================

revoke execute on function can_read_activity(uuid)      from public, anon;
revoke execute on function can_edit_activity(uuid)      from public, anon;
revoke execute on function can_access_assignment(uuid)  from public, anon;
revoke execute on function can_grade_submission(uuid)   from public, anon;

grant execute on function can_read_activity(uuid)       to authenticated, service_role;
grant execute on function can_edit_activity(uuid)       to authenticated, service_role;
grant execute on function can_access_assignment(uuid)   to authenticated, service_role;
grant execute on function can_grade_submission(uuid)    to authenticated, service_role;

-- =============================================================================
-- Verification
-- =============================================================================
--
-- -- 1. THE completeness check: no function in `public` is executable by
-- --    anon or PUBLIC. EXPECT: 0 rows. (This is the query the advisor cannot
-- --    replace — it covers INVOKER and DEFINER alike.)
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.pronamespace = 'public'::regnamespace
--   and coalesce(g.rolname, 'PUBLIC') in ('anon', 'PUBLIC');
--
-- -- 2. The authenticated teacher path still works — sign in to the app and
-- --    open an activity (exercises activity_versions_select_own →
-- --    can_read_activity) and the submissions dashboard (→
-- --    can_access_assignment / can_grade_submission). A "permission denied
-- --    for function" error anywhere there means a grant above was missed.
