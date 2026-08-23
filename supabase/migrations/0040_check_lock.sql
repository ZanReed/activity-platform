-- =============================================================================
-- 0040_check_lock.sql — `submissionMode: 'locked'` becomes real, in the RPC
-- -----------------------------------------------------------------------------
-- Plan + rulings: docs/design/activity-flow-modes.md (R2, eng review T1, OV#9,
-- OV#10). ONE function changes. No table, column, index, policy or grant
-- semantics change.
--
-- WHAT IT DOES. `record_check` grows `p_locked`. When true, a section that
-- ALREADY has a row for this (student, activity_version) is refused with
-- `section_locked`; the Edge Function maps that to a 409 whose client copy
-- never invites a retry, because there is no unlock in v1 — not for the
-- student, not for the teacher. A republish is the only unlock there is, and
-- it resets every student.
--
-- WHERE THE REFUSAL SITS, AND WHY THAT IS THE WHOLE DESIGN (OV#9). It is
-- AFTER the idempotent-replay lookup and inside the same transaction. The
-- dominant Chromebook failure is: request sent → Wi-Fi drops → response lost →
-- student presses Check again. That retry carries the SAME idempotency key and
-- must replay the recorded verdicts. If the lock were checked first, the one
-- failure mode the idempotency key exists for would turn into a permanent
-- lockout of work that was already recorded and already graded — the student
-- would see "already locked" for a check whose result they never saw.
--
-- WHY THE SERVER DERIVES THE FLAG RATHER THAN RECEIVING IT (T1). `p_locked` is
-- computed by the Edge Function from the STORED document's
-- `meta.submissionMode`, off a document it already loads to grade. The eng
-- review originally ruled the opposite — the client would send `lock: true` —
-- and the outside voice pointed out that a flag the student's browser sends is
-- a flag the student's browser can omit. Nothing was added to the wire; there
-- is no column, and `CHECK_WIRE_VERSION` does not move.
--
-- ⚠ THE SIGNATURE CHANGES, SO THE OLD OVERLOAD IS DROPPED FIRST (OV#10).
-- `create or replace function` matches on name AND argument types: adding
-- `p_locked` creates a SECOND function rather than replacing the first, and a
-- freshly created function carries PostgreSQL's default `EXECUTE to PUBLIC`.
-- On a service-role-only function that accepts VERDICTS as an argument, a
-- second overload reachable by `authenticated` is a student able to write
-- themselves a row of correct answers. The old 9-argument signature is dropped
-- before the new one is created, and the revoke/grant pair is restated against
-- the new 10-argument signature (the pattern at 0020:336-339). Re-run
-- `scripts/verify-0020.sql` after applying: its D1 assertion is exactly the
-- one that would catch a botched version of this.
--
-- Backwards compatible for every existing caller: `p_locked` defaults to
-- false, which is the pre-migration behaviour exactly.
-- =============================================================================

-- The old signature goes first. Inside the migration transaction there is no
-- window in which neither exists.
drop function if exists record_check(
  uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer
);

create function record_check(
  p_student_id          uuid,
  p_activity_id         uuid,
  p_activity_version_id uuid,
  p_section_id          text,
  p_responses           jsonb,
  p_verdicts            jsonb,
  p_idempotency_key     text default null,
  p_rate_limit          integer default 60,
  p_rate_window_seconds integer default 60,
  p_locked              boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing        section_checks%rowtype;
  v_check_id        uuid;
  v_attempt_number  integer;
  v_recent          integer;
  v_retries         integer := 0;
  v_locked_hit      boolean;
begin
  -- 0. Idempotent replay (S4-B2). Returns the ORIGINAL verdicts so a retried
  --    request produces a byte-identical response to the one that was lost.
  if p_idempotency_key is not null then
    select * into v_existing
    from section_checks
    where student_id = p_student_id
      and idempotency_key = p_idempotency_key;

    if found then
      return jsonb_build_object(
        'check_id',       v_existing.id,
        'attempt_number', v_existing.attempt_number,
        'verdicts',       v_existing.verdicts,
        'replayed',       true
      );
    end if;
  end if;

  -- 0b. THE LOCK (0040). Deliberately AFTER the replay above and BEFORE the
  --     rate ceiling below: a replay is a retry of an accepted request and
  --     must never 409, and a locked section deserves the sentence that names
  --     its actual cause rather than "you are checking too quickly".
  --
  --     Note this reads the SAME fact the client's freeze derives from — a
  --     recorded check for this (student, version, section). Neither side
  --     stores a lock flag, so the two cannot disagree, and a student on a
  --     second device (or with a cleared buffer) discovers the lock here: they
  --     press Check, get this refusal, and their inputs freeze on its arrival.
  if p_locked then
    select true into v_locked_hit
    from section_checks
    where student_id = p_student_id
      and activity_version_id = p_activity_version_id
      and section_id = p_section_id
    limit 1;

    if v_locked_hit then
      raise exception 'section_locked'
        using errcode = 'P0001',
              hint = 'this section is already checked and locked';
    end if;
  end if;

  -- 1. Rate ceiling (S4-5). Enforced HERE rather than in the Edge Function
  --    because this is durable per-student state: it survives isolate
  --    recycling, which is exactly what the read path's limiter does not.
  select count(*) into v_recent
  from section_checks
  where student_id = p_student_id
    and created_at > now() - make_interval(secs => p_rate_window_seconds);

  if v_recent >= p_rate_limit then
    -- Distinguishable by the handler (mapped to 429), not a generic failure.
    raise exception 'rate_limited'
      using errcode = 'P0001', hint = 'check rate ceiling reached';
  end if;

  -- 2 + 3. Attempt derivation and insert, in the 0005 retry loop. The unique
  --        index turns the SELECT-max → INSERT race into a unique_violation we
  --        recompute on, rather than two students' tabs both claiming attempt 3.
  loop
    select coalesce(max(attempt_number), 0) + 1
      into v_attempt_number
      from section_checks
      where student_id = p_student_id
        and activity_version_id = p_activity_version_id
        and section_id = p_section_id;

    begin
      insert into section_checks (
        student_id, activity_id, activity_version_id, section_id,
        attempt_number, responses, verdicts, idempotency_key
      )
      values (
        p_student_id, p_activity_id, p_activity_version_id, p_section_id,
        v_attempt_number, p_responses, p_verdicts, p_idempotency_key
      )
      returning id into v_check_id;

      exit;  -- success
    exception
      when unique_violation then
        -- Two shapes reach here. The attempt index means a concurrent check
        -- took our number: recompute. The idempotency index means a concurrent
        -- request with the SAME key won the race: replay its row rather than
        -- failing the student's retry.
        if p_idempotency_key is not null then
          select * into v_existing
          from section_checks
          where student_id = p_student_id
            and idempotency_key = p_idempotency_key;

          if found then
            return jsonb_build_object(
              'check_id',       v_existing.id,
              'attempt_number', v_existing.attempt_number,
              'verdicts',       v_existing.verdicts,
              'replayed',       true
            );
          end if;
        end if;

        -- A locked activity reaching here means a concurrent FIRST check for
        -- this section won the attempt race under a different idempotency key
        -- (two devices, same second). It is the same refusal as 0b, decided a
        -- moment later; recomputing max+1 and inserting would record the
        -- second row the lock exists to prevent.
        if p_locked then
          raise exception 'section_locked'
            using errcode = 'P0001',
                  hint = 'this section is already checked and locked';
        end if;

        v_retries := v_retries + 1;
        if v_retries > 3 then
          raise;  -- give up; very unlikely to reach here
        end if;
        -- loop and recompute with a fresh max
    end;
  end loop;

  return jsonb_build_object(
    'check_id',       v_check_id,
    'attempt_number', v_attempt_number,
    'verdicts',       p_verdicts,
    'replayed',       false
  );
end;
$$;

-- ⚠ SERVICE-ROLE ONLY — this is a security boundary, not housekeeping, and it
-- is restated here because the function above is a NEW one (see the header):
-- a created function starts with EXECUTE granted to PUBLIC. record_check takes
-- VERDICTS as an argument; a student able to call it directly could write
-- themselves a row of 'correct' answers, and that row is what a teacher reads.
revoke execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean)
  from public, anon, authenticated;
grant execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean)
  to service_role;

comment on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean) is
  'Records one section check. Service-role only (it accepts verdicts). '
  'p_locked is DERIVED BY THE SERVER from the stored document''s '
  'meta.submissionMode — never sent by the client — and refuses a second '
  'check for a (student, version, section) that already has one. The refusal '
  'sits after the idempotent-replay lookup so a lost-response retry replays '
  'rather than 409s. See docs/design/activity-flow-modes.md.';
