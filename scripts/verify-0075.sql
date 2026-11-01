-- verify-0075.sql — a DoL's written explanation is optional (migration 0075, D77).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).
--
--   §A — dol_optional_block private.
--   §B — the rule's truth table, then to_grade end to end: an explanation after
--        an auto primary doesn't count, a rubric primary and a plain section's
--        short answer do, and class and activity reads agree.

-- @section A-posture
-- @expect-rows
select 'dol_optional_private',
       not has_function_privilege('authenticated', 'dol_optional_block(jsonb, text)', 'execute')
       and not has_function_privilege('anon', 'dol_optional_block(jsonb, text)', 'execute'),
       'the rule is internal to the reads';

-- @section B-behaviour
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_s uuid := gen_random_uuid();
  v_k uuid; v_a uuid; v_b uuid; v_av uuid; v_bv uuid;
  p1 uuid := gen_random_uuid(); e1 uuid := gen_random_uuid(); pl uuid := gen_random_uuid();
  r1 uuid := gen_random_uuid(); r2 uuid := gen_random_uuid();
  v_dol jsonb; v_rub jsonb; v_j jsonb;
  function_sec jsonb;
begin
  -- ---- truth table ---------------------------------------------------------
  function_sec := jsonb_build_object('dol', '{}'::jsonb, 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
    jsonb_build_object('blocks', jsonb_build_array(
      jsonb_build_object('id', 'stim', 'type', 'paragraph'),
      jsonb_build_object('id', 'tbl0', 'type', 'table', 'rows', '[]'::jsonb),
      jsonb_build_object('id', 'g0', 'type', 'interactive_graph', 'interaction', '{"type":"display"}'::jsonb),
      jsonb_build_object('id', 'prim', 'type', 'short_answer'))),
    jsonb_build_object('blocks', jsonb_build_array(
      jsonb_build_object('id', 'expl', 'type', 'short_answer'),
      jsonb_build_object('id', 'ess', 'type', 'essay'),
      jsonb_build_object('id', 'fib', 'type', 'fill_in_blank')))))));
  -- Stimuli before it don't make the first short answer non-primary.
  if dol_optional_block(function_sec, 'prim') then raise exception 'FAIL B1: the primary is optional'; end if;
  if not dol_optional_block(function_sec, 'expl') or not dol_optional_block(function_sec, 'ess') then
    raise exception 'FAIL B1: a later rubric item is not optional';
  end if;
  if dol_optional_block(function_sec, 'fib') then raise exception 'FAIL B1: an auto item is optional'; end if;
  if dol_optional_block(function_sec - 'dol', 'expl') then raise exception 'FAIL B1: optional outside a DoL'; end if;

  -- ---- to_grade end to end -------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0075-' || o || '@vfy0075.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher', timezone = 'UTC' where id = v_t;
  update users set role = 'student' where id = v_s;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0075', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s);

  v_dol := jsonb_build_object('schemaVersion', 2, 'meta', '{}'::jsonb, 'sections', jsonb_build_array(
    jsonb_build_object('id', 'dol', 'isCheckpoint', true, 'dol', '{"skills":["s"],"retake":false}'::jsonb,
      'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(jsonb_build_object('blocks', jsonb_build_array(
        jsonb_build_object('id', p1, 'type', 'fill_in_blank'), jsonb_build_object('id', e1, 'type', 'short_answer'))))))),
    jsonb_build_object('id', 'plain', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(jsonb_build_object('blocks', jsonb_build_array(
        jsonb_build_object('id', pl, 'type', 'short_answer')))))))));
  v_rub := jsonb_build_object('schemaVersion', 2, 'meta', '{}'::jsonb, 'sections', jsonb_build_array(
    jsonb_build_object('id', 'dol', 'isCheckpoint', true, 'dol', '{"skills":["s"],"retake":false}'::jsonb,
      'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(jsonb_build_object('blocks', jsonb_build_array(
        jsonb_build_object('id', r1, 'type', 'short_answer'), jsonb_build_object('id', r2, 'type', 'short_answer')))))))));

  insert into activities (owner_id, title, slug, status) values (v_t, 'A', 'vfy75-a', 'published') returning id into v_a;
  insert into activities (owner_id, title, slug, status) values (v_t, 'B', 'vfy75-b', 'published') returning id into v_b;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 1, v_dol, v_t) returning id into v_av;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_b, 1, v_rub, v_t) returning id into v_bv;
  update activities set current_version_id = v_av where id = v_a;
  update activities set current_version_id = v_bv where id = v_b;
  insert into class_activities (class_id, activity_id, added_by) values (v_k, v_a, v_t), (v_k, v_b, v_t);
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, v_a, v_av, 'dol', 1, '{}', '{}'), (v_s, v_a, v_av, 'plain', 1, '{}', '{}'), (v_s, v_b, v_bv, 'dol', 1, '{}', '{}');

  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  -- A: the explanation is out, the plain section's short answer is in → 1.
  -- B: the rubric primary is in, the later one is out → 1.
  v_j := activity_progress(v_a);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1 then raise exception 'FAIL B2: activity A %', v_j; end if;
  v_j := activity_progress(v_b);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1 then raise exception 'FAIL B2: activity B %', v_j; end if;
  v_j := class_progress(v_k);
  if (select sum((c->>'to_grade')::int) from jsonb_array_elements(v_j->'cells') c) is distinct from 2::bigint then
    raise exception 'FAIL B3: class grid %', v_j;
  end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;
