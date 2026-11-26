-- =============================================================================
-- verify-0022.sql — the purge deletes section_checks before versions (0022)
-- -----------------------------------------------------------------------------
-- PORTED TO THE RUNNER 2026-11-26 (code review E3). The original was an author
-- walkthrough with prose EXPECTs; each surviving one is now a check row against
-- TODAY's purge_soft_deleted (rewritten five times since: 0023, 0024, 0025,
-- 0029, 0036, 0045, 0050, 0066).
-- Run with `pnpm verify:auth --target live|local --only verify-0022`.
--
-- RETIRED in the port: D1 (the submissions.student_id RESTRICT hazard). 0029
-- dropped that column and its FK; verify-0029 is the living proof.
--
-- §C runs the REAL purge inside a transaction that always ends in a raise, so
-- it is @local-only (review B5): live skips it.
-- =============================================================================

-- @section A-shape
-- @expect-rows
-- Checks go BEFORE activity_versions: section_checks.activity_version_id is
-- ON DELETE RESTRICT, so the other order aborts the whole nightly run.
select 'checks_deleted_before_versions',
       strpos(prosrc, 'delete from section_checks') > 0
       and strpos(prosrc, 'delete from section_checks') < strpos(prosrc, 'delete from activity_versions'),
       'purge_soft_deleted deletes section_checks before activity_versions'
from pg_proc where proname = 'purge_soft_deleted';
select 'both_check_deletes_counted',
       (length(prosrc) - length(replace(prosrc, 'delete from section_checks', '')))
         / length('delete from section_checks') = 2
       and strpos(prosrc, 'get diagnostics') > 0,
       'two section_checks deletes (by activity, by student), both counted'
from pg_proc where proname = 'purge_soft_deleted';
select 'purge_is_definer_pinned',
       prosecdef and array_to_string(coalesce(proconfig, '{}'), ',') like '%search_path=public%',
       'SECURITY DEFINER with search_path=public'
from pg_proc where proname = 'purge_soft_deleted';
select 'purge_not_client_callable',
       not has_function_privilege('anon', 'public.purge_soft_deleted()', 'execute')
       and not has_function_privilege('authenticated', 'public.purge_soft_deleted()', 'execute'),
       'no client role can run the function that hard-deletes student data';
-- The RESTRICT this works around is load-bearing (0020 ruling S4-2: a version
-- must never vanish from under the checks whose block ids it minted).
select 'version_fk_still_restricts',
       (select confdeltype from pg_constraint
         where conname = 'section_checks_activity_version_id_fkey') = 'r',
       'section_checks.activity_version_id is ON DELETE RESTRICT';

-- @section C-purge-reproduction
-- @expect-error VERIFY-0022 PASS
-- @local-only
-- Self-fixturing: a teacher, a student, an activity with a version and one
-- check; the activity is soft-deleted past its window and the real purge runs.
-- Before 0022 the purge died on the RESTRICT (23503). checks_before must be 1
-- or the block proves nothing (the original once ran vacuously on empty data).
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_s uuid := gen_random_uuid();
  v_act uuid; v_ver uuid;
  v_result text; v_before int; v_remaining int; v_left int;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0022-' || o || '@vfy0022.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id = v_s;
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0022', 'vfy-0022-' || substr(gen_random_uuid()::text, 1, 8), 'published')
  returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, '{"sections":[{"id":"s1"}]}'::jsonb, v_t) returning id into v_ver;
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts)
  values (v_s, v_act, v_ver, 'verify-0022-fixture', 1, '{}'::jsonb, '{}'::jsonb);
  select count(*) into v_before from section_checks where activity_id = v_act;
  update activities set deleted_at = now() - interval '31 days' where id = v_act;

  begin
    perform purge_soft_deleted();
    v_result := 'purge SUCCEEDED';
  exception when others then
    v_result := 'purge FAILED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  select count(*) into v_remaining from section_checks where activity_id = v_act;
  select count(*) into v_left from activities where id = v_act;
  if v_result = 'purge SUCCEEDED' and v_before = 1 and v_remaining = 0 and v_left = 0 then
    raise exception 'VERIFY-0022 PASS (rolled back) >>> % | checks_before=% | checks_remaining=% | activity_rows_left=%',
      v_result, v_before, v_remaining, v_left;
  end if;
  raise exception 'VERIFY-0022 FAIL (rolled back) >>> % | checks_before=% | checks_remaining=% | activity_rows_left=%',
    v_result, v_before, v_remaining, v_left;
end $vfy$;

-- @section D-residue
-- @expect-rows
select 'no_fixture_residue',
       (select count(*) from section_checks where section_id = 'verify-0022-fixture') = 0
       and (select count(*) from users where email like '%@vfy0022.example') = 0,
       'the purge reproduction left nothing behind';
