-- grading-study-checks.sql — the COMMITTED study query (design §5.2, W-5):
-- generates the check-id list `pnpm study:run --checks <file>` consumes.
--
-- The population is D7 step 1's ground truth: checks the teacher has ALREADY
-- hand-graded (a check_grades row exists), latest-per-(student, version,
-- section) — the same "current work" definition the queue uses. The standard
-- worker pull SKIPS graded checks, which is exactly why the study path takes
-- an explicit list.
--
-- Usage (id-per-line output for the worker):
--   psql "$GRADING_DATABASE_URL" -Atc "$(cat scripts/grading-study-checks.sql)" \
--     > /tmp/study-checks.txt
-- Scope to one activity by uncommenting the filter and substituting the id.

with latest as (
  select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.id
  from section_checks sc
  -- and a.id = '<activity-uuid>'   -- optional: one activity
  join activities a on a.id = sc.activity_id and a.deleted_at is null
  order by sc.student_id, sc.activity_version_id, sc.section_id,
           sc.attempt_number desc, sc.created_at desc
)
select l.id
from latest l
where exists (select 1 from check_grades cg where cg.check_id = l.id)
order by l.id;
