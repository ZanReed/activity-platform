-- =============================================================================
-- verify-0023.sql — author walkthrough for the account retention clock
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0023_account_retention_clock.sql (SQL editor, service
-- role). Every query states its EXPECTED result. Anything else = stop.
--
-- ⚠ RUN SECTION 0 FIRST. It answers "is the migration actually live?" — every
-- other section is meaningless if it is not, and section C in particular
-- MISREPORTS a not-applied migration as a failing fix.
--
-- ⚠ Section C reports success as a Postgres ERROR (`P0001`), same convention
-- as verify-0022: the `raise exception` is what forces the rollback that
-- protects live data. Judge C by the TEXT of the message, never by the fact
-- that the editor calls it an error. A P0001 opening with EXPECTED ROLLBACK
-- is always a pass.
--
-- No redeploy involved — pg_cron calls purge_soft_deleted inside the database.
-- =============================================================================

-- ===================== 0. PRECONDITION — run this FIRST ======================
--
-- Is 0023 actually live? If the migration has not been applied, section C
-- reports `job ABORTED -> 23503 ... activities_owner_id_fkey`, which looks
-- like the fix failing when it is really the OLD function still running. That
-- exact confusion cost a round-trip on 2026-08-04, hence this gate.
--
-- EXPECT: applied = t. If it says f, STOP — run `supabase db push`, confirm
-- 0023 appears in `supabase migration list`, and start over from here.
select strpos(prosrc, 'delete from auth.users') > 0 as applied,
       case when strpos(prosrc, 'delete from auth.users') > 0
            then 'OK — 0023 is live, continue to section A'
            else 'STOP — 0023 NOT APPLIED. Run: supabase db push'
       end as verdict
from pg_proc where proname = 'purge_soft_deleted';

-- ========================= A. Function shape =================================

-- A1. Account deletion targets auth.users (public.users + class_members +
--     section_checks + the auth.* children fall via CASCADE behind it). The
--     old `delete from users where deleted_at` line must be GONE — that was
--     the bug that stranded the Google identity. EXPECT: t / f
select strpos(prosrc, 'delete from auth.users') > 0            as deletes_auth_row,
       strpos(prosrc, 'delete from users where deleted_at') > 0 as old_wrong_delete
from pg_proc where proname = 'purge_soft_deleted';

-- A2. The ruled precedence is present: eligibility is checked per account and
--     a blocked account is skipped, not fatal. EXPECT: t / t
select strpos(prosrc, 'continue') > 0        as skips_blocked_accounts,
       strpos(prosrc, 'accounts blocked') > 0 as reports_blocked_count
from pg_proc where proname = 'purge_soft_deleted';

-- A3. Posture unchanged by REPLACE. EXPECT: prosecdef = t, search_path=public
select proname, prosecdef, proconfig
from pg_proc where proname = 'purge_soft_deleted';

-- ============================ B. Grants + FKs ================================

-- B1. EXPECT: service_role (+postgres) ONLY. This function hard-deletes
--     accounts and student work.
select coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.proname = 'purge_soft_deleted'
order by 1;

-- B2. The FK layout the ruling depends on is unchanged. EXPECT, in order:
--     submissions.student_id      = RESTRICT  (now the ENFORCEMENT of the
--                                              ruling, not an obstacle to it)
--     section_checks.student_id   = CASCADE
--     users.id -> auth.users      = CASCADE   (why deleting auth.users works,
--                                              and why deleting public.users
--                                              stranded the identity)
--     audit_log.actor_id          = NO ACTION (the remaining blocker — see D1)
select conname,
       case confdeltype when 'r' then 'RESTRICT' when 'c' then 'CASCADE'
            when 'a' then 'NO ACTION' when 'n' then 'SET NULL' end as on_delete
from pg_constraint
where conname in ('submissions_student_id_fkey', 'section_checks_student_id_fkey',
                  'users_id_fkey', 'audit_log_actor_id_fkey')
order by conname;

-- ===================== C. Behavior — the actual proof =========================

-- C1. Worst case: mark EVERY account past its window and run the real job.
--     Before 0023 this aborted the whole nightly run on the first blocked
--     account; now every account must be skipped and reported, and the job
--     must complete.
--
--     EXPECT: EXPECTED ROLLBACK >>> job SURVIVED (no abort) | users_remaining=3
--     BEFORE 0023 the same block returned:
--       job ABORTED -> 23503: ... violates foreign key constraint
--       "activities_owner_id_fkey" on table "activities"
--
--     users_remaining should equal your current account count — every account
--     is blocked by its own audit_log trail today (see D1), so none purge.
--     The trailing RAISE is what guarantees the rollback. Do not remove it.
do $outer$
declare
  v_result     text;
  v_users_left int;
begin
  update users set deleted_at = now() - interval '31 days';

  begin
    perform purge_soft_deleted();
    v_result := 'job SURVIVED (no abort)';
  exception when others then
    v_result := 'job ABORTED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  select count(*) into v_users_left from users;
  raise exception 'EXPECTED ROLLBACK >>> % | users_remaining=%', v_result, v_users_left;
end $outer$;

-- C2. Confirm C1 left nothing behind. EXPECT: your account count, and 0
--     soft-deleted users (C1's UPDATE must have rolled back).
select (select count(*) from users) as users,
       (select count(*) from users where deleted_at is not null) as soft_deleted_users,
       (select count(*) from section_checks) as checks;

-- ===================== D. Known-remaining, deliberately ======================

-- D1. THE ACCOUNT PURGE STILL CANNOT COMPLETE FOR ANY ACCOUNT. Every account
--     gets a `user.create` audit row at signup, and audit_log.actor_id is
--     NO ACTION, so every account blocks on its own audit trail. 0023 makes
--     this VISIBLE (reported, non-fatal) rather than a nightly crash; it does
--     not resolve it, because the resolution is a compliance ruling on
--     audit_log's 2-year security window. Queued in STATE.
--     EXPECT: accounts = accounts_blocked_by_audit (all of them).
select (select count(*) from users) as accounts,
       (select count(*) from users u
          where exists (select 1 from audit_log al where al.actor_id = u.id))
         as accounts_blocked_by_audit;

-- D2. Nothing sets users.deleted_at yet — no soft-delete-student flow exists,
--     so the account purge is inert regardless of D1. The marking step lands
--     with the S4/S7 purge-job work. EXPECT: 0
select count(*) as soft_deleted_accounts from users where deleted_at is not null;
