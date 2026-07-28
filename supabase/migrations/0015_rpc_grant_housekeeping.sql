-- =============================================================================
-- 0015_rpc_grant_housekeeping.sql — advisor follow-up to 0013/0014
-- -----------------------------------------------------------------------------
-- Post-0014 security advisor run (2026-07-28) surfaced two gaps, both instances
-- of the same rule from DECISIONS.md → "Supabase security/performance
-- housekeeping (0009)": *Supabase's default privileges grant every NEW function
-- to PUBLIC, so each RPC migration needs its own revoke/grant stanza.*
--
--   1. restore_activity (0012) — PRE-EXISTING. 0012 granted `authenticated`
--      but never revoked PUBLIC, so `anon` inherited EXECUTE and the function
--      is reachable unauthenticated at /rest/v1/rpc/restore_activity. Impact is
--      bounded (its inline owner check compares owner_id = auth.uid(), which is
--      NULL for anon, so every anonymous call raises 'Activity is not
--      restorable' without touching a row) — but an anon-callable SECURITY
--      DEFINER function is exactly what the 0009 pass cleared, and it should
--      not have come back.
--
--   2. generate_join_code (0014) — same missing stanza, plus an unpinned
--      search_path (advisor: function_search_path_mutable). It is not SECURITY
--      DEFINER, so a hijacked search_path would run with the caller's own
--      privileges rather than the owner's; the fix is cheap regardless and
--      keeps every function in this schema on one discipline.
--
-- No behavior change for legitimate callers: the classes UI calls
-- generate_join_code as `authenticated`, and column DEFAULTs execute as the
-- inserting role (also `authenticated`), both of which keep EXECUTE below.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. restore_activity — close the anon path (keep the authenticated caller)
-- -----------------------------------------------------------------------------
revoke execute on function restore_activity(uuid) from public, anon;
grant execute on function restore_activity(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. generate_join_code — pin search_path + lock the grants
-- -----------------------------------------------------------------------------
-- Body references only built-ins (string_agg / substr / random /
-- generate_series), which resolve from the implicitly-searched pg_catalog even
-- with an empty search_path — same posture as the 0009 helpers.
create or replace function generate_join_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (random() * 30)::int + 1, 1),
    ''
  )
  from generate_series(1, 6);
$$;

revoke execute on function generate_join_code() from public, anon;
grant execute on function generate_join_code() to authenticated, service_role;

-- =============================================================================
-- Intentional advisor residue after this migration (do NOT "fix" these)
-- -----------------------------------------------------------------------------
--   * rls_enabled_no_policy (INFO) on allowlist, audit_log, and — new in 0013 —
--     student_domain. All three are deny-by-default, service-role-only tables;
--     having zero policies IS the access control. Same design as 0002/0009.
--   * authenticated_security_definer_function_executable (WARN) on
--     publish_activity, soft_delete_activity, restore_activity and — new in
--     0013/0014 — current_user_is_teacher, is_class_teacher, is_class_member,
--     join_class, list_class_members, soft_delete_class. Every one is called
--     BY a signed-in user and MUST be DEFINER (they exist precisely to do what
--     the caller's RLS forbids: read users/class_members across policies, write
--     audited rows, mutate soft-deleted rows). Their real gate is the inline
--     ownership/role check, not the grant. Documented in DECISIONS.md.
--   * auth_leaked_password_protection (WARN) — Google OAuth only, no passwords.
--
-- Verification — EXPECT no row with grantee in ('anon','PUBLIC'):
--
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.pronamespace = 'public'::regnamespace
-- order by 1, 2;
--
-- EXPECT proconfig = {search_path=""}:
-- select proname, proconfig from pg_proc
-- where pronamespace = 'public'::regnamespace and proname = 'generate_join_code';
