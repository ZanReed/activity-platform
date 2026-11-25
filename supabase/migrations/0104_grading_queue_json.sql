-- =============================================================================
-- 0104_grading_queue_json.sql — the teacher's grading queue (and its AI
-- suggestions) as ONE jsonb each (code review 2026-11-26, defect A5)
-- -----------------------------------------------------------------------------
-- `list_grading_queue` (latest body: 0099) RETURNS TABLE, one row per
-- student × version × section × hand-graded block, every version, released
-- rows included. PostgREST stops a row set at max_rows (1,000 by default;
-- supabase/config.toml sets none) and says NOTHING: HTTP 200,
-- `Content-Range: 0-999/*`. 150 students × 4 written answers × 2 versions is
-- 1,200 rows, and the rows dropped are the older version's students
-- (reproduced on the local stack 2026-11-26: 1,200 in SQL, 1,000 over HTTP).
-- The same trap was closed case by case in 0043 (one jsonb) and 0060 (a row
-- bound by construction); this is the third instance.
--
-- WHY ONE JSONB AND NOT PAGING. The responses screen needs the WHOLE queue at
-- once: it groups by question, counts "to grade" and "stale", and re-reads
-- after every save. Paging would need a total keyset order across
-- (version_num, section_id, block_id, email, …) and N round trips to rebuild
-- the same array. A scalar return is never cut by max_rows, so one call is
-- complete by construction.
--
-- WHY A WRAPPER AND NOT A RESTATEMENT. `list_grading_queue` is left exactly
-- as 0099 wrote it. Thirty-three verify-script call sites (verify-0034, -0035,
-- -0096, -0097, -0099) read it as a table, and restating it as jsonb would
-- turn every one red for no behaviour change. `grading_queue` aggregates it in
-- its own order (WITH ORDINALITY, so the array keeps 0099's ORDER BY). It is
-- SECURITY INVOKER: every gate (signed in, can_read_activity, the roster's
-- identity rule) is the inner function's, and its error strings
-- (authContract.json → gradeErrors) reach the client unchanged.
--
-- `grade_suggestions` does the same for 0042's `list_grade_suggestions`,
-- which the same screen reads: at most one row per queue row, so it passes
-- 1,000 exactly when the queue does. It is dormant today (the model half is
-- parked, provider off), which is the cheapest time to close it. 0042 gives
-- it no ORDER BY, so neither does the wrapper.
--
-- The old row-set functions keep their grants (verify-0034/0096/0097 pin them)
-- but the app no longer calls them; scripts/tests/rowset-rpc-bounds.test.mjs
-- fails if any app source calls a row-set RPC without a stated row bound.
--
-- No table, column or personal-data change (the same fields, to the same
-- caller): docs/compliance is untouched.
--
-- ORDER: apply BEFORE pushing the app change that calls `grading_queue` and
-- `grade_suggestions`
-- (Cloudflare Pages deploys main on push; OV-7). Verify: verify-0104.
-- =============================================================================

create function public.grading_queue(p_activity_id uuid)
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(q) - 'ordinality' order by q.ordinality), '[]'::jsonb)
  from list_grading_queue(p_activity_id) with ordinality as q;
$function$;

revoke execute on function public.grading_queue(uuid) from public, anon;
grant  execute on function public.grading_queue(uuid) to authenticated, service_role;

comment on function public.grading_queue(uuid) is
  'The teacher''s grading queue (0104, review A5) as ONE jsonb array of '
  'list_grading_queue''s rows in its order. A row set is cut at PostgREST''s '
  'max_rows with no error; a scalar is not. Invoker: the gates are the inner '
  'function''s.';

create function public.grade_suggestions(p_activity_id uuid)
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb)
  from list_grade_suggestions(p_activity_id) as s;
$function$;

revoke execute on function public.grade_suggestions(uuid) from public, anon;
grant  execute on function public.grade_suggestions(uuid) to authenticated, service_role;

comment on function public.grade_suggestions(uuid) is
  'The responses screen''s AI grading suggestions (0104, review A5) as ONE '
  'jsonb array of list_grade_suggestions''s rows: a row set is cut at '
  'max_rows with no error. Invoker: the gates are the inner function''s.';
