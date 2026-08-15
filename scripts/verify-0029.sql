-- verify-0029.sql — anonymous-wire demolition (migration 0029, S9 Drop 3).
--
-- Run with `pnpm verify:auth --target live|local` (the runner executes each
-- marked section and prints per-check PASS/FAIL), or a section at a time in
-- the SQL editor. §D runs purge_soft_deleted inside a rolled-back
-- transaction — durable-write-free on every path (P7), same idiom as the
-- 0022-arc proofs.
--
-- WHY EACH SECTION EXISTS:
--   §A — the D-6 wipe left both tables EMPTY. Asserted live rather than
--        trusted from the apply-time NOTICE, because the local rehearsal
--        wipes 0 rows and proves only mechanics (OV-DX-5).
--   §B — the account-backed identity branch is gone AND the survivors are
--        intact: a demolition that also took the frozen-row CHECK or the
--        teacher-read policies would be a different (wrong) migration.
--   §C — the ingest RPC no longer exists in any signature.
--   §D — the recreated purge function carries no submissions.student_id
--        reference and STILL RUNS end to end (P3: the 0022 arc began with a
--        purge that would have died on its first real fire; a purge edited by
--        0029 and never executed would be the same gap reopened).

-- @section A-wipe
-- @expect-rows
select 'submissions_empty',
       (select count(*) from submissions) = 0,
       'D-6 wipe: anonymous-wire test rows deleted';
-- P5 FLIP (0034, not a deletion): this row asserted `count(*) from grades = 0`
-- while 0029 kept the emptied table "for the parked teacher-grading slice to
-- re-decide". That slice decided — check_grades — so 0034 dropped the table and
-- this assertion would now fail on a missing relation rather than on a real
-- regression. The claim that REPLACED it is that the table is gone for good, so
-- the row stays load-bearing instead of quietly disappearing with its subject.
select 'grades_table_retired',
       to_regclass('public.grades') is null,
       '0034 dropped it once check_grades superseded it (the 0029 placeholder is discharged)';
select 'no_ip_hash_rows_remain',
       not exists (select 1 from submissions where ip_hash is not null),
       'the disclosed ip_hash-scrub gap is closed by data removal';

-- @section B-identity-branch-demolished
-- @expect-rows
select 'student_id_column_gone',
       not exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'submissions'
                      and column_name = 'student_id'), '';
select 'identity_check_back_to_two_branches',
       (select pg_get_constraintdef(oid) from pg_constraint
         where conname = 'submissions_identity_present')
       like all (array['%opaque_token%', '%display_name%'])
       and (select pg_get_constraintdef(oid) from pg_constraint
             where conname = 'submissions_identity_present')
           not like '%student_id%',
       'CHECK survives as tripwire, minus the account branch';
select 'both_partial_indexes_gone',
       not exists (select 1 from pg_indexes
                    where indexname in ('submissions_student_idx',
                                        'submissions_account_attempt_idx')), '';
select 'student_fk_gone',
       not exists (select 1 from pg_constraint
                    where conname = 'submissions_student_id_fkey'), '';
-- Anti-vacuity: the demolition took ONLY its targets. The frozen table keeps
-- RLS forced and both teacher-read policies.
select 'submissions_rls_still_forced',
       (select relrowsecurity and relforcerowsecurity
          from pg_class where relname = 'submissions'), '';
select 'teacher_read_policies_survive',
       (select count(*) from pg_policies
         where schemaname = 'public' and tablename = 'submissions') = 2,
       'submissions_select_teacher + submissions_select_activity_owner';

-- @section C-ingest-rpc-gone
-- @expect-rows
select 'ingest_submission_dropped',
       not exists (select 1 from pg_proc
                    where pronamespace = 'public'::regnamespace
                      and proname = 'ingest_submission'),
       'any signature — the caller Edge Function is deleted in the same drop';

-- @section D-purge-survives-the-demolition
-- @expect-rows
-- NB: not `%submissions%student_id%` — the surviving def legitimately has
-- `from submissions` (step 2) followed later by `cm.student_id` etc., and a
-- loose pattern would fail the CORRECT function. Match the exact removed
-- phrases instead.
select 'purge_no_longer_reads_submissions_student_id',
       (select pg_get_functiondef(p.oid) from pg_proc p
         where p.pronamespace = 'public'::regnamespace
           and p.proname = 'purge_soft_deleted')
       not like all (array['%from submissions s where s.student_id%',
                           '%from submissions x where x.student_id%',
                           '%from submissions      x where x.student_id%']),
       '0029 removed both references (step-6 guard, step-7 blocker)';
select 'purge_still_guards_section_checks',
       (select pg_get_functiondef(p.oid) from pg_proc p
         where p.pronamespace = 'public'::regnamespace
           and p.proname = 'purge_soft_deleted')
       like '%section_checks   x where x.student_id%',
       'anti-vacuity: the surviving blockers were not swept along';

-- @section D2-purge-liveness
-- @expect-log purge_soft_deleted: section_checks
-- P3: the recreated function must RUN, not merely read back — inside a
-- rolled-back transaction so no durable row is touched on any path (P7).
-- The NOTICE grep doubles as proof the counted-report contract survived.
begin;
select purge_soft_deleted();
rollback;
