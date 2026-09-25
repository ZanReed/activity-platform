-- grading-edit-rates.sql — the standing quality signal (design §5.3, DR-2),
-- run by `pnpm telemetry:edit-rates`. PRODUCTION rows only: study rows are
-- never teacher-actioned (EH-10) and would poison every denominator here.
--
-- Read per (model, prompt_rev, schema_rev): confirmed-unchanged vs edited vs
-- rejected IS the quality curve per revision. Chip strikes are the per-tag
-- production continuation of the study's misconception precision metric
-- (DR-4); reject reasons are DR-8's one-tap telemetry.

-- ---- 1. Resolution rates per revision --------------------------------------
select model_id, prompt_rev, schema_rev,
       count(*)                                        as drafts,
       count(*) filter (where status = 'confirmed')    as confirmed_unchanged,
       count(*) filter (where status = 'edited')       as edited,
       count(*) filter (where status = 'rejected')     as rejected,
       count(*) filter (where status = 'pending')      as awaiting_teacher,
       count(*) filter (where status = 'superseded')   as superseded,
       count(*) filter (where machine_confidence = 'low') as abstained,
       round(
         count(*) filter (where status = 'confirmed')::numeric
           / nullif(count(*) filter (where status in ('confirmed','edited','rejected')), 0),
         3)                                            as confirm_unchanged_rate
from check_grade_suggestions
where source = 'production'
  and submitted_at is not null
group by model_id, prompt_rev, schema_rev
order by model_id, prompt_rev, schema_rev;

-- ---- 2. Chip strikes per tag (DR-4) ----------------------------------------
select s.model_id, s.prompt_rev,
       m->>'misId'                                     as mis_id,
       count(*)                                        as emitted,
       count(*) filter (
         where exists (
           select 1 from jsonb_array_elements_text(s.struck_mis) x
           where x = m->>'misId'
         ))                                            as struck_by_teacher
from check_grade_suggestions s
cross join lateral jsonb_array_elements(s.misconception_notes) m
where s.source = 'production'
  and s.status in ('confirmed', 'edited', 'rejected')
group by s.model_id, s.prompt_rev, m->>'misId'
order by s.model_id, s.prompt_rev, mis_id;

-- ---- 3. Reject reasons (DR-8) ----------------------------------------------
select model_id, prompt_rev, coalesce(reject_reason, '(none given)') as reason, count(*)
from check_grade_suggestions
where source = 'production' and status = 'rejected'
group by model_id, prompt_rev, reject_reason
order by model_id, prompt_rev, reason;
