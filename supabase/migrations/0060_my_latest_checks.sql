-- =============================================================================
-- 0060_my_latest_checks.sql — the restore reads, server-side and own-rows only
-- (docs/design/student-experience-review.md; Fable review F1 + F6, 2026-10-15)
-- -----------------------------------------------------------------------------
-- Restore (S3) read section_checks through PostgREST with every attempt in the
-- result, and PostgREST stops at max_rows (1000 by default) WITHOUT an error.
-- A student who re-checks a worksheet often enough (every press of a group
-- records a row per member section) would have their alphabetically-last
-- sections silently dropped from the restore, while Home still said "Done"
-- (Fable F1). Both reads now happen here, where "the latest attempt per
-- section" is one DISTINCT ON and the result is at most one row per section.
--
--   §A  my_checked_section_ids(version) — the cheap "anything to restore?"
--       read (eng review D5): DISTINCT section ids, no payload.
--   §B  my_latest_checks(version, section_ids) — check-activity's restore read:
--       the latest attempt per requested section, responses + verdicts.
--   §C  grants
--
-- OWN ROWS BY CONSTRUCTION (Fable F6). Both are SECURITY DEFINER and filter on
-- auth.uid() in the SQL itself. The previous read relied on RLS plus a client
-- `.eq('student_id', …)`, and the class-teacher SELECT policy (0020) meant the
-- `.eq` was the only thing keeping a teacher's token to the teacher's own rows —
-- a filter that lived in deploy-only Deno wiring no test could reach. Here a
-- teacher's token returns the teacher's own rows (normally none), and
-- verify-0060 proves it with a real class teacher.
--
-- No new table or column; no personal data beyond what section_checks already
-- holds, returned only to the student it belongs to.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- §A — which sections have I checked on this version?
-- -----------------------------------------------------------------------------
create or replace function my_checked_section_ids(p_version_id uuid)
returns table (section_id text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct sc.section_id
  from section_checks sc
  where sc.student_id = auth.uid()
    and sc.activity_version_id = p_version_id;
$$;

-- -----------------------------------------------------------------------------
-- §B — my latest check per section (restore's payload)
-- -----------------------------------------------------------------------------
-- The same ordering as section_checks_latest (0035): attempt_number desc, then
-- created_at desc. Pruning superseded attempts (0035, unscheduled) never removes
-- the row this returns.
create or replace function my_latest_checks(
  p_version_id  uuid,
  p_section_ids text[]
)
returns table (
  section_id     text,
  attempt_number integer,
  responses      jsonb,
  verdicts       jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (sc.section_id)
         sc.section_id, sc.attempt_number, sc.responses, sc.verdicts
  from section_checks sc
  where sc.student_id = auth.uid()
    and sc.activity_version_id = p_version_id
    and sc.section_id = any (p_section_ids)
  order by sc.section_id, sc.attempt_number desc, sc.created_at desc;
$$;

-- -----------------------------------------------------------------------------
-- §C — grants (0009's standing rule: every function carries its own stanza)
-- -----------------------------------------------------------------------------
revoke execute on function my_checked_section_ids(uuid) from public, anon;
grant execute on function my_checked_section_ids(uuid) to authenticated, service_role;
revoke execute on function my_latest_checks(uuid, text[]) from public, anon;
grant execute on function my_latest_checks(uuid, text[]) to authenticated, service_role;

comment on function my_checked_section_ids(uuid) is
  'Restore (0060): the CALLER''s distinct checked section ids on one version. '
  'Own rows by auth.uid(), not by RLS (a class teacher''s policy reads students).';
comment on function my_latest_checks(uuid, text[]) is
  'Restore (0060): the CALLER''s latest attempt per requested section on one '
  'version (responses + verdicts). One row per section, so PostgREST max_rows '
  'can never truncate it; own rows by auth.uid().';
