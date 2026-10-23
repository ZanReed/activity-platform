-- =============================================================================
-- 0067_mixed_misconceptions.sql — mixed practice: the misconceptions a first
--                                 try showed (build slice 2 of 4, W-5)
-- -----------------------------------------------------------------------------
-- docs/design/mixed-practice-teacher-panel.md → W-5 (ruled 2026-10-23): the
-- teacher panel's "Who to see first" group 2 (the same misconception on ≥ 2 of
-- a student's last `mixed_struggling_window` first tries, W-4 as revised by
-- C-162) needs the misconception ids per first try, readable per class and
-- practice day without unpacking every verdicts blob.
--
--   §A  mixed_attempts.misconception_ids text[] — DERIVED BY THE DATABASE from
--       the verdicts record_mixed_attempt stores: the distinct `mis.*` tags of
--       every item's `misconceptionIds`, the SAME ids a section check's
--       verdicts carry (grading/index.ts emits them only on an incorrect
--       verdict whose matched mistake or choice is bound). No new grading and
--       no new argument: the handler cannot send ids that disagree with the
--       verdicts, because it sends none.
--   §B  record_mixed_attempt v2 — 0066's body plus the derivation.
--   §C  the (class_id, practice_day) index the panel's reads use.
--
-- ⚠ C-162 (curriculum, 2026-10-23): under §7's form rule (D60), a blank in a
-- form-skill item carries NO misconception id by design. An empty array there
-- is the authored truth, not a grading gap.
--
-- ⚠ STUDENT-DERIVED PERSONAL DATA (which misconceptions a student's answers
-- showed). data-map.md and retention-policy.md move in this commit. Same rows,
-- same window, same (disarmed) prune as the rest of mixed_attempts: the column
-- leaves with its row.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. the column
-- -----------------------------------------------------------------------------
alter table mixed_attempts
  add column misconception_ids text[] not null default '{}'::text[];

comment on column mixed_attempts.misconception_ids is
  'The distinct misconception ids (mis.*) the grader bound to this first try''s incorrect verdicts, sorted (0067, W-5). DERIVED by record_mixed_attempt from the stored verdicts, never sent separately. Empty for a right try, a skip, or an item whose mistakes carry no binding (C-162: a form-skill blank carries none by design). STUDENT-DERIVED.';

-- The derivation, one place: the stored verdicts → the sorted distinct ids.
-- Anything that is not a short `mis.` tag is dropped (a number or an object
-- renders as text that cannot start with `mis.`, so the prefix covers type):
-- the verdicts are the grader's output, but this column is read by a teacher
-- view and must hold only registry-shaped ids.
create or replace function mixed_misconceptions_of(p_verdicts jsonb)
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(array_agg(distinct m.id order by m.id), '{}'::text[])
    from jsonb_each(case when jsonb_typeof(p_verdicts) = 'object' then p_verdicts
                         else '{}'::jsonb end) v(item, verdict)
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(v.verdict->'misconceptionIds') = 'array'
           then v.verdict->'misconceptionIds' else '[]'::jsonb end) e(x)
    cross join lateral (select e.x #>> '{}' as id) m
   where m.id like 'mis.%'
     and length(m.id) <= 200;
$$;

-- Backfill: no session has been served (slice 2 is what serves them), so this
-- touches no row on the day it ships; it is here so the column is true for
-- every row whatever the order of events.
update mixed_attempts
   set misconception_ids = mixed_misconceptions_of(verdicts)
 where misconception_ids is distinct from mixed_misconceptions_of(verdicts);

-- -----------------------------------------------------------------------------
-- B. record_mixed_attempt v2 (0066 G3 + the derivation)
-- -----------------------------------------------------------------------------
-- Unchanged signature, so 0066's grants stand (service role only). Unchanged
-- rules: first write wins, a replay returns the stored row and changes
-- nothing, the backstop refuses a NEW try on a finished or expired session.
create or replace function record_mixed_attempt(
  p_student_id uuid, p_session_id uuid, p_seq integer, p_correct boolean,
  p_skipped boolean, p_responses jsonb, p_verdicts jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_s   mixed_sessions%rowtype;
  v_i   mixed_session_items%rowtype;
  v_a   mixed_attempts%rowtype;
  v_new boolean := false;
begin
  select * into v_s from mixed_sessions where id = p_session_id for update;
  select * into v_i from mixed_session_items where session_id = p_session_id and seq = p_seq;
  if v_s.id is null or v_i.session_id is null or v_s.student_id is distinct from p_student_id
     or p_correct is null or (coalesce(p_skipped, false) and p_correct) then
    raise exception 'record_mixed_attempt: refused';
  end if;
  if not exists (select 1 from mixed_attempts where session_id = p_session_id and seq = p_seq)
     and (v_s.finished_at is not null or now() > v_s.started_at + interval '1 day') then
    raise exception 'record_mixed_attempt: refused (session closed)';
  end if;

  insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind,
                              bank_key, correct, skipped, responses, verdicts,
                              misconception_ids)
  values (p_session_id, p_seq, v_s.student_id, v_s.class_id, v_s.practice_day, v_i.kind,
          v_i.bank_key, p_correct, coalesce(p_skipped, false),
          coalesce(p_responses, '{}'::jsonb), coalesce(p_verdicts, '{}'::jsonb),
          -- W-5. A right try or a skip carries none whatever the verdicts
          -- say: the step and the panel must agree on what "showed a
          -- misconception" means, and a skip showed nothing.
          case when p_correct or coalesce(p_skipped, false) then '{}'::text[]
               else mixed_misconceptions_of(coalesce(p_verdicts, '{}'::jsonb)) end)
  on conflict (session_id, seq) do nothing;
  v_new := found;

  if v_new then
    update mixed_sessions s
       set score_right    = (select count(*) filter (where correct) from mixed_attempts where session_id = s.id),
           score_answered = (select count(*) filter (where not skipped) from mixed_attempts where session_id = s.id),
           last_saved_at  = now(),
           finished_at    = case when (select count(*) from mixed_attempts where session_id = s.id) >= s.planned
                                 then coalesce(s.finished_at, now()) else s.finished_at end
     where s.id = p_session_id;
  end if;

  select * into v_a from mixed_attempts where session_id = p_session_id and seq = p_seq;
  return jsonb_build_object('replayed', not v_new, 'correct', v_a.correct,
                            'skipped', v_a.skipped, 'verdicts', v_a.verdicts,
                            'misconception_ids', to_jsonb(v_a.misconception_ids));
end;
$$;

-- -----------------------------------------------------------------------------
-- C. the panel's index (W-5)
-- -----------------------------------------------------------------------------
-- "Who practised today" and "their last window of first tries" both start from
-- (class, day); the step index leads with student and bank, so it cannot serve
-- a whole-class day read.
create index mixed_attempts_class_day_idx on mixed_attempts (class_id, practice_day);

-- -----------------------------------------------------------------------------
-- D. grants
-- -----------------------------------------------------------------------------
revoke execute on function mixed_misconceptions_of(jsonb) from public, anon, authenticated;
grant  execute on function mixed_misconceptions_of(jsonb) to service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0067.sql (registered in the verify
-- runner): the column's shape, the index, the helper's posture; the derivation
-- (distinct + sorted, wrong tries only, junk dropped, replay unchanged).
-- =============================================================================
