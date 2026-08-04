-- =============================================================================
-- verify-0022.sql — author walkthrough for the purge-job section_checks fix
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0022_purge_section_checks.sql (SQL editor, service role).
-- Every query states its EXPECTED result. Anything else = stop and report.
--
-- Section C is the one that matters: it REPRODUCES the bug scenario against
-- the real function and rolls the whole thing back, so it proves the fix
-- rather than inspecting it. Safe to run on the live project — the DO block
-- ends in a RAISE, which aborts the transaction. Nothing commits.
--
-- ⚠ Consequence of that design: **C1 reports success as a Postgres ERROR**
-- (`P0001`). It is not a failure — see the banner above C1. Judge C1 by the
-- text of its message, never by the fact that the editor calls it an error.
--
-- No Edge Function redeploy is involved: purge_soft_deleted is called by
-- pg_cron inside the database.
-- =============================================================================

-- ===================== 0. PRECONDITION — run this FIRST ======================
--
-- Is 0022 actually live? A not-applied migration makes section C report the
-- ORIGINAL bug, which reads as "the fix does not work" rather than "the fix is
-- not installed". EXPECT: applied = t; if f, run `supabase db push` first.
select strpos(prosrc, 'get diagnostics') > 0 as applied,
       case when strpos(prosrc, 'get diagnostics') > 0
            then 'OK — 0022 is live, continue to section A'
            else 'STOP — 0022 NOT APPLIED. Run: supabase db push'
       end as verdict
from pg_proc where proname = 'purge_soft_deleted';

-- ========================= A. Function shape =================================

-- A1. Checks are deleted BEFORE activity_versions (the whole point — the
--     activity_version_id FK is RESTRICT and aborts the run otherwise).
--     EXPECT: t
select strpos(prosrc, 'delete from section_checks')
         < strpos(prosrc, 'delete from activity_versions') as checks_deleted_first
from pg_proc where proname = 'purge_soft_deleted';

-- A2. Both explicit deletes are present (by-activity and by-student), and the
--     counters that make them visible. EXPECT: 2 / t
select (length(prosrc) - length(replace(prosrc, 'delete from section_checks', '')))
         / length('delete from section_checks') as section_check_deletes,
       strpos(prosrc, 'get diagnostics') > 0 as counts_rows
from pg_proc where proname = 'purge_soft_deleted';

-- A3. Posture unchanged by REPLACE. EXPECT: 1 row, prosecdef = t,
--     proconfig contains search_path=public.
select proname, prosecdef, proconfig
from pg_proc where proname = 'purge_soft_deleted';

-- ============================ B. Grants survived =============================

-- B1. EXPECT: service_role (+postgres) ONLY. No PUBLIC, no anon, no
--     authenticated — this function hard-deletes student data.
select coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.proname = 'purge_soft_deleted'
order by 1;

-- B2. The RESTRICT this migration works around is STILL RESTRICT. It is
--     load-bearing (0020 ruling S4-2: a version must never vanish from under
--     the checks whose block ids it minted). EXPECT: RESTRICT
select case confdeltype when 'r' then 'RESTRICT' when 'c' then 'CASCADE'
       when 'a' then 'NO ACTION' when 'n' then 'SET NULL' end as on_delete
from pg_constraint where conname = 'section_checks_activity_version_id_fkey';

-- ===================== C. Behavior — the actual proof =========================
--
--  ⚠ READ THIS BEFORE RUNNING C1 ⚠
--  C1 REPORTS ITS RESULT AS A POSTGRES ERROR. That is by design and is not a
--  failure. The block ends in `raise exception` because raising is the only
--  way to guarantee the transaction aborts — that RAISE is what protects your
--  live data. The SQL editor has no choice but to render it as:
--
--      Failed to run sql query: ERROR: P0001: EXPECTED ROLLBACK ...
--
--  Read the TEXT of the message, not the fact that it is an error:
--    • contains `purge SUCCEEDED`  → PASS (this is what you want)
--    • contains `purge FAILED`     → the bug is present; stop and report
--  A P0001 whose message starts with EXPECTED ROLLBACK is always a pass.
--
-- C1. Reproduce the bug scenario end to end and roll it back. Soft-deletes an
--     activity that HAS checks, backdates it past the 30-day window, runs the
--     real purge, then aborts.
--
--     EXPECT (after the fix), delivered as a P0001 error per the note above:
--       EXPECTED ROLLBACK — this "error" IS the pass >>> purge SUCCEEDED |
--       checks_remaining=0 | activity_rows_left=0
--     BEFORE the fix this same block returned:
--       purge FAILED -> 23503: ... violates foreign key constraint
--       "section_checks_activity_version_id_fkey" on table "section_checks"
--
--     Substitute any activity id that has section_checks rows. As of
--     2026-08-04 that is the author's E2E activity, with 44 of them:
--       select activity_id, count(*) from section_checks group by 1;
--
--     The trailing RAISE is what guarantees the rollback. Do not remove it.
do $outer$
declare
  v_activity  uuid := '6a84c8cb-fc49-4338-ab49-927ba6254f20';
  v_result    text;
  v_remaining int;
  v_left      int;
begin
  update activities set deleted_at = now() - interval '31 days' where id = v_activity;

  begin
    perform purge_soft_deleted();
    v_result := 'purge SUCCEEDED';
  exception when others then
    v_result := 'purge FAILED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  select count(*) into v_remaining from section_checks where activity_id = v_activity;
  select count(*) into v_left      from activities     where id = v_activity;

  raise exception
    'EXPECTED ROLLBACK — this "error" IS the pass >>> % | checks_remaining=% | activity_rows_left=%',
    v_result, v_remaining, v_left;
end $outer$;

-- C2. Confirm C1 left nothing behind. EXPECT: the same check count you started
--     with, the activity present, deleted_at still null.
select (select count(*) from section_checks) as checks,
       (select count(*) from activities
         where id = '6a84c8cb-fc49-4338-ab49-927ba6254f20') as activity_present,
       (select deleted_at is null from activities
         where id = '6a84c8cb-fc49-4338-ab49-927ba6254f20') as not_soft_deleted;

-- ===================== D. Known-remaining, deliberately ======================

-- D1. The submissions.student_id RESTRICT hazard is NOT addressed by 0022 —
--     it is a retention decision (the account's 30-day clock vs the
--     submissions' 400-day clock), flagged in STATE for the purge-job work.
--     EXPECT: RESTRICT, and 0 account-backed submissions (harmless today).
select (select case confdeltype when 'r' then 'RESTRICT' when 'c' then 'CASCADE' end
        from pg_constraint where conname = 'submissions_student_id_fkey') as on_delete,
       (select count(*) from submissions where student_id is not null) as account_backed_rows;
