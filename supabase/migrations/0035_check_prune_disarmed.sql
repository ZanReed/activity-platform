-- =============================================================================
-- 0035_check_prune_disarmed.sql — the check prune, DISARMED, and the
--                                 schema-encoded arming gate
-- -----------------------------------------------------------------------------
-- Plan + the full ruling trail: docs/design/check-retention-and-rollup.md
-- (eng-reviewed 2026-08-16, D2–D12; the outside voice overturned the draft's
-- build-the-rollup-now frame at D10).
--
-- WHAT THIS SHIPS, and the one idea holding it together:
--
--   §A  section_checks_latest — THE definition of "the student's current
--       attempt". The prune's first clause is its negation BY CONSTRUCTION.
--   §B  analytics_job_runs.rolled_through — nullable, and NOTHING writes it.
--       Only the future rollup step (the arming arc) may. The prune refuses
--       every row while it is NULL, so ARMING THE PRUNE BEFORE THE ROLLUP
--       EXISTS IS MECHANICALLY INERT (ruling D11). The ordering invariant
--       "pruning must never lead the rollup" lives in the schema, not in a
--       checklist a future session must find and honor.
--   §C  prune_section_checks(p_dry_run default true) — the four-clause
--       predicate, disarmed by default, service-role only.
--
-- WHAT THIS DELIBERATELY DOES NOT SHIP (all designed, all deferred to the
-- arming arc with rulings recorded in the plan doc §5 — inherit, don't
-- re-derive): the two item-grain rollup tables, the rollup step in
-- run_analytics_maintenance(), rebuild_check_rollup, users.timezone +
-- analytics_day(), purge_soft_deleted v4, any get_activity_analytics change.
--
-- THE ARMING CHECKLIST (also in the plan doc §4 — the cron flip comes LAST):
--   1. Build the rollup per the plan's §5 rulings; backfill; watermark
--      advancing nightly for ≥ N green runs (read the ledger, not the
--      registration — P3).
--   2. Re-run verify-0035 plus the arming arc's own matrix.
--   3. Counsel packet Q10 (small-cohort aggregates) answered.
--   4. PRUNE_HORIZON re-checked against the split-day re-roll constraint.
--   5. Only then: point the cron at prune_section_checks(false).
--
-- STANDING CLAIM for the arming arc (checkable, cite this header): no RPC may
-- read any future rollup table without an activity-scoped ownership gate
-- (can_read_activity — the helper, never inlined). A class-of-one aggregate is
-- a student's daily record; the roster relationship is what carries consent.
--
-- WHY PRUNING IS SAFE FOR EVERY READER (F1, verified against shipped SQL at
-- the review): get_activity_analytics's latest CTE, list_grading_queue's
-- latest CTE, totals.students, last_check_at, and record_check's max+1 all
-- read ONLY rows clause 1 never touches. G2's stale flag reads the GRADED
-- check (clause 2 protects it) against the LATEST check (clause 1 protects
-- it). The rate ceiling (60 s window) and idempotency replay (seconds) are
-- cleared by any horizon measured in days. verify-0035 §C proves each leg.

-- -----------------------------------------------------------------------------
-- A. section_checks_latest — one definition of "latest", shared by construction
-- -----------------------------------------------------------------------------
-- ⚠ ORDERING BOND (D7): this distinct-on shape is byte-parallel with
-- list_grading_queue's `latest` CTE (0034 lines 488–492). 0034 is applied and
-- immutable, so the bond is enforced the only durable way: verify-0035 §C(H)
-- asserts the queue's row set is unchanged by a prune — if either definition
-- drifts, that row goes red. If you change this ordering, the queue's CTE must
-- change in lockstep via a new migration, and vice versa.
create view section_checks_latest as
select distinct on (student_id, activity_version_id, section_id) *
from section_checks
order by student_id, activity_version_id, section_id,
         attempt_number desc, created_at desc;

comment on view section_checks_latest is
  'The student''s current attempt per (student, version, section) — G2''s unit. '
  'prune_section_checks deletes only rows NOT in this view (among other gates). '
  'Bonded to list_grading_queue''s latest CTE; see 0035 header + verify-0035.';

-- Internal definition, not a client surface (0028 posture). The DEFINER
-- functions that use it run as owner; service_role keeps diagnostic access.
revoke all on section_checks_latest from public, anon, authenticated;
grant select on section_checks_latest to service_role;

-- -----------------------------------------------------------------------------
-- B. The arming gate: rolled_through, nullable, UNWRITTEN (D11)
-- -----------------------------------------------------------------------------
-- Nothing in this migration — and nothing live — ever writes this column.
-- The arming arc's rollup step will stamp it coalesce-forward on every ledger
-- row (plan §5). Until then every row is NULL, and §C's watermark read returns
-- NULL, and the prune refuses everything, ARMED OR NOT. verify-0035 §A pins
-- "never written" as a live assertion; the arming arc flips that row to its
-- own expectations (P5 — flip, don't delete).
alter table analytics_job_runs add column rolled_through timestamptz;

comment on column analytics_job_runs.rolled_through is
  'Rollup watermark: checks with created_at < this are aggregated durably. '
  'NULL on every row until the arming arc''s rollup step exists — and while it '
  'is NULL everywhere, prune_section_checks refuses all rows (D11: the prune '
  'physically cannot run ahead of a rollup that does not exist).';

-- -----------------------------------------------------------------------------
-- C. prune_section_checks — four clauses, disarmed by default (D2/D10, G12)
-- -----------------------------------------------------------------------------
-- A row is a candidate only when ALL hold:
--   1. it is NOT the student's latest attempt for its (student, version,
--      section) — the §A view's negation, so this clause cannot drift from
--      the readers it protects;
--   2. NO check_grades row references it (G12: check_grades.check_id is
--      ON DELETE CASCADE from section_checks — the cascade that makes
--      retention free would make an unguarded prune silently destroy the
--      teacher's grade with the check);
--   3. created_at < the newest rolled_through — the D11 gate above. Read by
--      id desc, NOT ran_at desc: two ledger rows written in one transaction
--      share now() (the 0034 graded_at tie, same lesson), while bigserial ids
--      are assignment-ordered;
--   4. created_at < now() - c_prune_horizon.
--
-- ⚠ HORIZON BOND: c_prune_horizon must NEVER go below 7 days. The arming
-- arc's rollup re-rolls a still-open owner-zone day by delete-then-insert,
-- which is only correct if the full day is recomputable from RAW rows — so
-- the horizon must far exceed the day-completion lag (outside-voice finding
-- 6; the full constraint is in the plan doc §5). 30 days also keeps the
-- prune comfortably clear of the 60-second rate window and idempotency
-- replays (F1).
--
-- Returns a jsonb report either way; p_dry_run => false is the ONLY deleting
-- form, and today it still deletes nothing (NULL watermark). Candidate ids
-- are collected into an array — fine at nightly scale; if the table ever
-- holds millions of prunable rows, batch by LIMIT before arming.
create function prune_section_checks(p_dry_run boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_prune_horizon constant interval := interval '30 days';  -- floor 7d, see bond
  v_watermark timestamptz;
  v_ids       uuid[];
  v_candidates int := 0;
  v_deleted    int := 0;
begin
  select rolled_through into v_watermark
  from analytics_job_runs
  where rolled_through is not null
  order by id desc
  limit 1;

  if v_watermark is null then
    -- The D11 gate: no rollup has ever run, so nothing is provably aggregated,
    -- so nothing may be destroyed. This is the designed state until the
    -- arming arc lands — not an error.
    return jsonb_build_object(
      'dry_run', p_dry_run, 'watermark', null,
      'candidates', 0, 'deleted', 0,
      'note', 'no watermark — rollup has never run; prune inert (D11)');
  end if;

  select array_agg(sc.id) into v_ids
  from section_checks sc
  where sc.created_at < v_watermark                          -- clause 3
    and sc.created_at < now() - c_prune_horizon              -- clause 4
    and not exists (select 1 from check_grades cg            -- clause 2 (G12)
                     where cg.check_id = sc.id)
    and not exists (select 1 from section_checks_latest l    -- clause 1 (F1)
                     where l.id = sc.id);
  v_candidates := coalesce(array_length(v_ids, 1), 0);

  if not p_dry_run and v_candidates > 0 then
    delete from section_checks where id = any(v_ids);
    get diagnostics v_deleted = row_count;
  end if;

  return jsonb_build_object(
    'dry_run', p_dry_run, 'watermark', v_watermark,
    'candidates', v_candidates, 'deleted', v_deleted);
end;
$$;

-- 0009 stanza: a deletion primitive over student work is never client-callable.
revoke execute on function prune_section_checks(boolean) from public, anon, authenticated;
grant execute on function prune_section_checks(boolean) to service_role;

-- =============================================================================
-- Verification — scripts/verify-0035.sql is the full pass (11 rows; §C is the
-- self-fixturing EXPECTED-ROLLBACK matrix: the D11 gate armed, both watermark
-- clauses at production values, a real deletion, G12 survival, the stale flag
-- post-prune, the D7 queue pin, the analytics F1/F2 split, and max+1).
-- Spot check after apply:
--
-- -- 1. The gate is closed. EXPECT: {"dry_run": true, ..., "note": "no watermark …"}
-- select prune_section_checks();
--
-- -- 2. Nothing has ever written the watermark. EXPECT: 0
-- select count(*) from analytics_job_runs where rolled_through is not null;
-- =============================================================================
