-- =============================================================================
-- verify-0040.sql — the check LOCK, at the predicate layer
-- -----------------------------------------------------------------------------
-- Plan + rulings: docs/design/activity-flow-modes.md (R2, T1, OV#9, OV#10).
--
-- Proves what 0040 must be true about, inside one rolled-back
-- transaction: the refusal fires, it does NOT fire for `free`, a replay of the
-- locking check still replays rather than 409s, and the signature change left
-- exactly one overload with the grants intact.
--
-- Run as postgres (SQL editor / MCP) AFTER 0040 is applied. Expect
-- `=== verify-0040: 7 PASS, 0 FAIL ===`; any FAIL raises, so the transaction
-- can never be mistaken for green.
--
-- ⚠ ALSO RE-RUN scripts/verify-0020.sql. Its D1 assertion (record_check is not
-- executable by authenticated/anon/PUBLIC) is precisely what catches a botched
-- signature change — a new overload starts with EXECUTE granted to PUBLIC, and
-- record_check accepts VERDICTS as an argument. D2 (DEFINER + pinned
-- search_path) is the other one this migration could silently drop.
--
-- Requires: one published activity with a version, and at least one
-- non-deleted user who does not own it. Same fixture shape as verify-0020,
-- for the same reasons documented there.
-- =============================================================================

-- @section check-lock-matrix
-- @expect-log === verify-0040: 7 PASS, 0 FAIL ===
begin;

do $$
declare
  v_activity uuid;
  v_owner    uuid;
  v_version  uuid;
  v_student  uuid;
  v_pass     int := 0;
  v_fail     int := 0;
  v_result   jsonb;
  v_n        int;
begin
  -- ======================= Fixtures =========================================
  select a.id, a.owner_id, a.current_version_id
    into v_activity, v_owner, v_version
  from public.activities a
  where a.deleted_at is null
    and a.status = 'published'
    and a.current_version_id is not null
  order by a.created_at desc
  limit 1;
  if v_activity is null then
    raise exception 'No published activity with a current version — publish one, then re-run.';
  end if;

  select u.id into v_student
  from public.users u
  where u.deleted_at is null and u.id <> v_owner
  limit 1;
  if v_student is null then
    raise exception 'No non-owner user found — need a second account to stand in as the student.';
  end if;

  raise notice 'Fixture: activity %, version %, student %', v_activity, v_version, v_student;

  -- ======================= A. The refusal ===================================

  -- A1. In a LOCKED activity the first check of a section still records.
  v_result := record_check(v_student, v_activity, v_version, 'lock-A',
    '{"blanks":{"b1":"7"}}'::jsonb, '{"b1":{"verdict":"correct"}}'::jsonb,
    null, 60, 60, true);
  if (v_result->>'attempt_number')::int = 1 and (v_result->>'replayed')::boolean = false then
    v_pass := v_pass + 1; raise notice 'PASS A1: locked mode records the FIRST check normally';
  else
    v_fail := v_fail + 1; raise warning 'FAIL A1: got %', v_result;
  end if;

  -- A2. A SECOND check of that section is refused, distinguishably.
  begin
    perform record_check(v_student, v_activity, v_version, 'lock-A',
      '{"blanks":{"b1":"8"}}'::jsonb, '{"b1":{"verdict":"incorrect"}}'::jsonb,
      null, 60, 60, true);
    v_fail := v_fail + 1;
    raise warning 'FAIL A2: a locked section accepted a SECOND check';
  exception when others then
    if sqlerrm like '%section_locked%' then
      v_pass := v_pass + 1; raise notice 'PASS A2: second check refused with section_locked';
    else
      v_fail := v_fail + 1; raise warning 'FAIL A2: wrong error %', sqlerrm;
    end if;
  end;

  -- A3. ...and NO second row was written. The refusal that leaves a row is
  --     worse than no refusal: the teacher would see two attempts for work the
  --     student was told was locked after one.
  select count(*) into v_n from section_checks
  where student_id = v_student and activity_version_id = v_version
    and section_id = 'lock-A';
  if v_n = 1 then
    v_pass := v_pass + 1; raise notice 'PASS A3: exactly one row survives the refused check';
  else
    v_fail := v_fail + 1; raise warning 'FAIL A3: % rows for a locked section', v_n;
  end if;

  -- A4. The lock is PER SECTION, not per activity — a different section in the
  --     same locked activity still checks.
  v_result := record_check(v_student, v_activity, v_version, 'lock-B',
    '{}'::jsonb, '{}'::jsonb, null, 60, 60, true);
  if (v_result->>'attempt_number')::int = 1 then
    v_pass := v_pass + 1; raise notice 'PASS A4: the lock is scoped to the section';
  else
    v_fail := v_fail + 1; raise warning 'FAIL A4: got %', v_result;
  end if;

  -- ======================= B. What it must NOT break ========================

  -- B1. `free` is unchanged: p_locked defaults to false, and re-checking still
  --     increments. This is the pre-migration behaviour, restated so a future
  --     edit cannot quietly make every activity locked.
  perform record_check(v_student, v_activity, v_version, 'free-A',
    '{}'::jsonb, '{}'::jsonb, null, 60, 60);
  v_result := record_check(v_student, v_activity, v_version, 'free-A',
    '{}'::jsonb, '{}'::jsonb, null, 60, 60);
  if (v_result->>'attempt_number')::int = 2 then
    v_pass := v_pass + 1; raise notice 'PASS B1: default (free) still allows re-checking';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B1: got %', v_result;
  end if;

  -- B2. ⚠ THE ONE THAT MATTERS MOST (OV#9). A lost-response retry of the
  --     LOCKING check carries the same idempotency key and must REPLAY, not
  --     409. Getting this wrong turns the exact failure the idempotency key
  --     exists for — request sent, Wi-Fi drops, response lost — into a
  --     permanent lockout of work that was already recorded and graded.
  perform record_check(v_student, v_activity, v_version, 'lock-C',
    '{}'::jsonb, '{"b9":{"verdict":"correct"}}'::jsonb, 'idem-lock-1', 60, 60, true);
  begin
    v_result := record_check(v_student, v_activity, v_version, 'lock-C',
      '{}'::jsonb, '{"b9":{"verdict":"correct"}}'::jsonb, 'idem-lock-1', 60, 60, true);
    if (v_result->>'replayed')::boolean = true
       and v_result->'verdicts'->'b9'->>'verdict' = 'correct' then
      v_pass := v_pass + 1;
      raise notice 'PASS B2: a lost-response retry of the LOCKING check replays, never 409s';
    else
      v_fail := v_fail + 1; raise warning 'FAIL B2: replay returned %', v_result;
    end if;
  exception when others then
    v_fail := v_fail + 1;
    raise warning 'FAIL B2: the replay was REFUSED (%) — the lock is checked before the replay lookup', sqlerrm;
  end;

  -- ======================= C. The signature change ==========================

  -- C1. EXACTLY ONE record_check exists. Two would mean `create or replace`
  --     left the old overload behind — and the new one would carry PostgreSQL's
  --     default EXECUTE to PUBLIC on a function that accepts verdicts (OV#10).
  select count(*) into v_n from pg_proc where proname = 'record_check';
  if v_n = 1 then
    v_pass := v_pass + 1; raise notice 'PASS C1: exactly one record_check overload';
  else
    v_fail := v_fail + 1;
    raise warning 'FAIL C1: % record_check overloads — the old signature was not dropped', v_n;
  end if;

  -- ======================= Verdict ==========================================
  raise notice '=== verify-0040: % PASS, % FAIL ===', v_pass, v_fail;
  if v_fail > 0 then
    raise exception 'verify-0040 failed % of % assertions', v_fail, v_pass + v_fail;
  end if;
end;
$$;

rollback;
