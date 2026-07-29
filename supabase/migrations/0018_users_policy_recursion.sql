-- =============================================================================
-- 0018_users_policy_recursion.sql — fix self-recursion in users_select_self
-- -----------------------------------------------------------------------------
-- FOUND 2026-07-29 during Drop 0 §6b verification (an RLS-isolation spot check
-- as a newly-created teacher), NOT by any test or advisor run.
--
-- THE BUG. users_select_self (0002, initplan-rewritten by 0009) reads:
--
--   id = (select auth.uid())
--   or exists (select 1 from users u
--              where u.id = (select auth.uid()) and u.role = 'admin')
--
-- The admin branch queries `users` from inside `users`' OWN select policy, so
-- evaluating the policy re-enters the policy. Postgres detects this and aborts
-- the whole statement:
--
--   ERROR: 42P17: infinite recursion detected in policy for relation "users"
--
-- This is not "the admin branch returns false" — the SELECT fails outright, for
-- every caller, including a plain self-read that would have matched on the
-- first disjunct.
--
-- WHY IT HAS NEVER BITTEN. Two independent reasons, both accidental:
--   1. The app never selects from `users` directly — grep finds zero
--      `from('users')` call sites. Display names reach the client through
--      SECURITY DEFINER RPCs (list_class_members, 0014) precisely because
--      "users RLS is self-only, so a client cannot join" (DECISIONS, S1).
--   2. Every server-side read of `users` runs inside a SECURITY DEFINER
--      function owned by postgres. postgres is superuser, so RLS is bypassed
--      entirely and the policy is never evaluated — which is why
--      current_user_is_teacher() works today and publish/sign-in are unaffected
--      (verified 2026-07-29: the helper returns true for a live teacher while a
--      direct authenticated SELECT on the same row raises 42P17).
--
-- WHY IT MATTERS NOW. S3/T6 puts identity on screen: the design's chip shows
-- the signed-in student (ruling 2.4A). The obvious implementation —
-- `supabase.from('users').select('display_name')` as the authenticated student
-- — hits this immediately, and the failure is a hard 42P17 with a message that
-- points at RLS rather than at the admin branch that caused it. Fixing it
-- before the viewer lane starts costs one migration; fixing it mid-lane costs a
-- confusing debug session inside unrelated new code.
--
-- THE FIX. Move the admin check into a SECURITY DEFINER helper — the repo's own
-- established idiom for exactly this hazard (current_user_is_teacher 0013;
-- is_class_teacher / is_class_member 0014, whose header notes that invoker
-- helpers "would re-enter each other's policies — the 0002 recursion hazard in
-- cross-table form"). This is that same hazard in SAME-table form; 0002 shipped
-- it inline before the helper pattern existed, and the pattern never got
-- applied back to it.
--
-- BEHAVIOR CHANGE: none for anyone who works today. A self-read starts
-- SUCCEEDING where it previously raised. The admin branch keeps its intended
-- meaning (an admin may read every user row); there are currently ZERO admin
-- users (3 teachers, 0 admins), so nothing depends on it either way right now.
--
-- NOTE: this migration was NOT rehearsed against the live database — a
-- rolled-back DDL test was blocked by tooling policy — so the author's run is
-- its first execution. The verification block at the bottom is the check.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. current_user_is_admin — the recursion-breaking helper
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER (owned by postgres) so the inner read of `users` bypasses
-- RLS instead of re-entering the policy that calls it. STABLE: one evaluation
-- per statement, not per row. search_path pinned, per the standing rule.
create or replace function current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users
    where id = auth.uid()
      and role = 'admin'
      and deleted_at is null
  );
$$;

-- Grant stanza (0009's rule, re-learned in 0015/0016: Supabase default-grants
-- every new function to PUBLIC, so each one needs its own revoke).
revoke execute on function current_user_is_admin() from public, anon;
grant execute on function current_user_is_admin() to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. users_select_self — same intent, no self-reference
-- -----------------------------------------------------------------------------
-- `deleted_at is null` is deliberately NOT added to the self-branch: it is not
-- in the current policy, and a soft-deleted user losing sight of their own row
-- is a separate product decision, not a side effect of a recursion fix.
alter policy users_select_self on users
  using (
    id = (select auth.uid())
    or current_user_is_admin()
  );

-- =============================================================================
-- Verification (expected results inline; full pass in scripts/verify-0018.sql)
-- =============================================================================
--
-- -- 1. The policy no longer references `users`. EXPECT: no 'FROM users' in the
-- --    expression — just the uid compare and the helper call.
-- select pg_get_expr(polqual, polrelid) from pg_policy
-- where polrelid = 'users'::regclass and polname = 'users_select_self';
--
-- -- 2. Grants. EXPECT: {authenticated, service_role} (+postgres), no PUBLIC/anon.
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'current_user_is_admin';
--
-- -- 3. THE REGRESSION TEST — a direct authenticated SELECT on users. Before
-- --    this migration it raised 42P17; EXPECT 1 row (the caller's own), and
-- --    NOT an error. Substitute a real user id.
-- begin;
-- set local role authenticated;
-- set local request.jwt.claims = '{"sub":"<real-user-uuid>","role":"authenticated"}';
-- select count(*) as should_be_1, email from users group by email;
-- rollback;
--
-- -- 4. Isolation still holds (the fix must not widen visibility). EXPECT 1 —
-- --    the caller sees ONLY themselves, not the other teachers.
-- --    (Run inside the same impersonation block as #3.)
--
-- -- 5. ACL completeness (0016 post-DDL routine). EXPECT exactly one row:
-- --    get_activity_public_meta / anon.
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where n.nspname = 'public' and (g.rolname = 'anon' or a.grantee = 0)
-- order by 1, 2;
