-- grading-study-report.sql — the D7 blind-agreement report (design §5.2),
-- run by `pnpm study:report` (or by hand). Reads STUDY rows only
-- (source = 'study' — the queue UI and edit-rate telemetry never see them)
-- against the teacher's hand grades, per criterion.
--
-- The decision rule is "model within the human band", never a bare
-- percentage: run the ~20% delayed re-grade first (§5.1's reliability
-- anchor) and compare these rates against the teacher-vs-teacher
-- self-consistency you measured there.
--
-- MISCONCEPTION PRECISION/RECALL needs the teacher's own step-1 tags, which
-- the grading surface deliberately does not store — load them first:
--   create temp table study_teacher_mis (check_id uuid, block_id uuid, mis_id text);
--   \copy study_teacher_mis from 'teacher-mis-tags.csv' with (format csv);
-- then the second query below reports against them (it no-ops politely when
-- the temp table is absent).

-- ---- 1. Per-criterion point agreement --------------------------------------
with pairs as (
  select s.id as suggestion_id,
         s.check_id, s.block_id, s.model_id, s.prompt_rev, s.schema_rev,
         s.machine_confidence,
         (mc->>'criterionId')          as criterion_id,
         (mc->>'earned')::numeric      as model_earned,
         (tc->>'earned')::numeric      as teacher_earned,
         (tc->>'maxPoints')::numeric   as max_points
  from check_grade_suggestions s
  join check_grades g on g.check_id = s.check_id and g.block_id = s.block_id
  cross join lateral jsonb_array_elements(s.criteria) mc
  cross join lateral jsonb_array_elements(g.criteria) tc
  where s.source = 'study'
    and tc->>'criterionId' = mc->>'criterionId'
)
select model_id, prompt_rev, schema_rev,
       count(*)                                                   as criteria_compared,
       round(avg((model_earned = teacher_earned)::int)::numeric, 3)          as exact_match_rate,
       round(avg((abs(model_earned - teacher_earned) <= 1)::int)::numeric, 3) as within_one_rate,
       round(avg(model_earned - teacher_earned)::numeric, 3)      as mean_signed_diff,
       count(*) filter (where machine_confidence = 'low')         as low_confidence_rows
from pairs
group by model_id, prompt_rev, schema_rev
order by model_id, prompt_rev, schema_rev;

-- ---- 2. Abstain + coverage --------------------------------------------------
select s.model_id, s.prompt_rev, s.schema_rev,
       count(*)                                              as study_rows,
       count(*) filter (where s.machine_confidence = 'low')  as abstained,
       count(*) filter (where s.machine_confidence = 'high') as full_drafts
from check_grade_suggestions s
where s.source = 'study'
group by s.model_id, s.prompt_rev, s.schema_rev
order by s.model_id, s.prompt_rev, s.schema_rev;

-- ---- 3. Misconception precision / recall (needs study_teacher_mis) ---------
do $$
begin
  if to_regclass('pg_temp.study_teacher_mis') is null then
    raise notice 'study_teacher_mis not loaded — misconception precision/recall skipped (see header)';
    return;
  end if;
end $$;

with model_mis as (
  select s.check_id, s.block_id, m->>'misId' as mis_id
  from check_grade_suggestions s
  cross join lateral jsonb_array_elements(s.misconception_notes) m
  where s.source = 'study'
),
teacher_mis as (
  select check_id, block_id, mis_id from pg_temp.study_teacher_mis
)
select coalesce(mm.mis_id, tm.mis_id) as mis_id,
       count(*) filter (where mm.mis_id is not null and tm.mis_id is not null) as true_positive,
       count(*) filter (where mm.mis_id is not null and tm.mis_id is null)     as false_positive,
       count(*) filter (where mm.mis_id is null and tm.mis_id is not null)     as false_negative
from model_mis mm
full outer join teacher_mis tm
  on tm.check_id = mm.check_id and tm.block_id = mm.block_id and tm.mis_id = mm.mis_id
group by coalesce(mm.mis_id, tm.mis_id)
order by mis_id;
