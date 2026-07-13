-- =============================================================================
-- 0011_grades_security.sql — lock down the grades audit trigger function
-- -----------------------------------------------------------------------------
-- 0010 created `grades_touch_and_audit()` as SECURITY DEFINER (it must insert
-- into audit_log, which has no client insert policy). But a SECURITY DEFINER
-- function in the `public` schema is EXECUTE-able by anon/authenticated via
-- PostgREST's `/rest/v1/rpc/...` endpoint by default — flagged by the security
-- advisor after 0010 applied, the same finding the 0009 housekeeping pass fixed
-- for the other SECURITY DEFINER functions.
--
-- The fix is to REVOKE EXECUTE from PUBLIC/anon/authenticated. A TRIGGER
-- function does NOT need an EXECUTE grant to fire — the trigger mechanism
-- invokes it as the definer regardless — so this closes the RPC surface without
-- affecting the grade upsert path. There are no legitimate direct callers, so
-- (unlike 0009's RPCs) nothing is re-granted.
--
-- Switching the function to SECURITY INVOKER is NOT an option: the audit_log
-- insert would then run as the teacher, who has no insert policy there, and the
-- grade upsert would fail.
-- =============================================================================

revoke execute on function public.grades_touch_and_audit()
  from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Verification (expected results noted):
--   -- no EXECUTE for anon/authenticated (empty result = good):
--   select grantee, privilege_type
--     from information_schema.role_routine_grants
--    where routine_name = 'grades_touch_and_audit'
--      and grantee in ('anon', 'authenticated', 'public');   -- 0 rows
--   -- the trigger still fires: an upsert as a teacher writes updated_at + an
--   -- audit_log row (test from the app after deploy).
-- -----------------------------------------------------------------------------
