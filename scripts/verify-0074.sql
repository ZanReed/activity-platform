-- verify-0074.sql — the student unit tracker (migration 0074, curriculum D67).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block: its own users, activities, bank and checks, all
-- rolled back (P7). docs/design/student-unit-tracker.md (UT-1…UT-12).
--
--   §A — posture: tracker_wording locked with no policy or client grant; the
--        reads and the write signed-in, definer, pinned; the rows helper private.
--   §B — every status and UT-3's precedence; the words' keys; UT-2 rows (order,
--        ungiven activity, consolidation excluded); UT-7 letters; UT-5 wording
--        privacy and the 200 cap; UT-12 with and without a DoL; UT-8's next
--        kinds in order; a non-member refused; the teacher read has no status.

-- @section A-catalog-posture
-- @expect-rows
select 'tracker_wording_locked',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'tracker_wording')
       and not exists (select 1 from pg_policies where tablename = 'tracker_wording')
       and not has_table_privilege('authenticated', 'tracker_wording', 'select')
       and not has_table_privilege('authenticated', 'tracker_wording', 'insert'),
       'UT-5: no policy, no client grant';
select 'tracker_rpcs_posture',
       has_function_privilege('authenticated', 'my_unit_tracker(uuid)', 'execute')
       and has_function_privilege('authenticated', 'class_unit_tracker(uuid)', 'execute')
       and has_function_privilege('authenticated', 'set_tracker_wording(text, text)', 'execute')
       and not has_function_privilege('anon', 'my_unit_tracker(uuid)', 'execute')
       and not has_function_privilege('anon', 'class_unit_tracker(uuid)', 'execute')
       and not has_function_privilege('anon', 'set_tracker_wording(text, text)', 'execute')
       and not has_function_privilege('authenticated', 'unit_tracker_rows(uuid)', 'execute')
       and (select bool_and(prosecdef and proconfig @> array['search_path=public']) from pg_proc
             where proname in ('my_unit_tracker', 'class_unit_tracker', 'set_tracker_wording', 'unit_tracker_rows')),
       'signed-in, definer, pinned; the rows helper private';

-- @section B-behaviour
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();
  v_t2  uuid := gen_random_uuid();
  v_s   uuid := gen_random_uuid();
  v_x   uuid := gen_random_uuid();
  v_k   uuid;
  v_k2  uuid;
  v_dol jsonb := '{"schemaVersion": 2, "meta": {}, "sections": [
                   {"id": "dol-sec", "isCheckpoint": true, "rows": [],
                    "dol": {"skills": ["s.vfy74.dol"], "retake": true}}]}';
  v_plain jsonb := '{"schemaVersion": 2, "meta": {}, "sections": [{"id": "s1", "rows": []}]}';
  a_plain uuid; a_stuck uuid; a_pass uuid; a_ungiven uuid; a_cons uuid; a_dol uuid;
  v_plain_v uuid; v_dol_v uuid; v_sess uuid;
  v_res jsonb; v_unit jsonb; v_rows jsonb; v_n jsonb;
  i integer;

begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0074-' || o || '@vfy0074.example', '{}'::jsonb
    from unnest(array[v_t, v_t2, v_s, v_x]) with ordinality x(u, o);
  update users set role = 'teacher', timezone = 'UTC' where id in (v_t, v_t2);
  update users set role = 'student' where id in (v_s, v_x);
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0074', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t2, 'vfy 0074 b', v_t2, 'vfy', current_date + 100) returning id into v_k2;
  insert into class_members (class_id, student_id) values (v_k, v_s);
  insert into skill_label (id, label) values ('s.vfy74.plain', 'Plain label'), ('s.vfy74.stuck', 'Stuck label'),
    ('s.vfy74.pass', 'Pass label'), ('s.vfy74.ungiven', 'Ungiven label'), ('s.vfy74.dol', 'Dol label')
    on conflict (id) do update set label = excluded.label;

  -- The unit, in teaching order: plain, stuck, pass, dol, ungiven, + a consolidation.
  insert into activities (owner_id, title, slug, status, source_path, primary_skill, unit)
  values (v_t, 'Plain', 'vfy74-a', 'published', 'c/01.md', 's.vfy74.plain', 'Vfy unit') returning id into a_plain;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill, unit)
  values (v_t, 'Stuck', 'vfy74-b', 'published', 'c/02.md', 's.vfy74.stuck', 'Vfy unit') returning id into a_stuck;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill, unit)
  values (v_t, 'Pass', 'vfy74-c', 'published', 'c/03.md', 's.vfy74.pass', 'Vfy unit') returning id into a_pass;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill, unit)
  values (v_t, 'Dol', 'vfy74-d', 'published', 'c/04.md', 's.vfy74.dol', 'Vfy unit') returning id into a_dol;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill, unit)
  values (v_t, 'Ungiven', 'vfy74-e', 'published', 'c/05.md', 's.vfy74.ungiven', 'Vfy unit') returning id into a_ungiven;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill, unit, consolidates_chain)
  values (v_t, 'Cons', 'vfy74-f', 'published', 'c/06.md', 's.vfy74.cons-only', 'Vfy unit', 'chain.vfy74') returning id into a_cons;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (a_dol, 1, v_dol, v_t) returning id into v_dol_v;
  update activities set current_version_id = v_dol_v where id = a_dol;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (a_plain, 1, v_plain, v_t) returning id into v_plain_v;
  update activities set current_version_id = v_plain_v where id = a_plain;
  for i in 1..3 loop
    insert into activity_versions (activity_id, version_num, content, created_by)
    values ((array[a_stuck, a_pass, a_cons])[i], 1, v_plain, v_t);
    update activities set current_version_id =
      (select id from activity_versions where activity_id = (array[a_stuck, a_pass, a_cons])[i])
     where id = (array[a_stuck, a_pass, a_cons])[i];
  end loop;

  insert into class_activities (class_id, activity_id, added_by)
  select v_k, a, v_t from unnest(array[a_plain, a_stuck, a_pass, a_dol]) a;

  -- UT-7: letters from ratified templates only, in D C P E order.
  insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id, status, position,
                             document, seed_spec, value_table, fingerprint, tier)
  select v_t, 'vfy74#' || h, 'banks/c/s.md', 'skill', sk, 'chain.vfy74', st, pos, '{"sections":[]}'::jsonb,
         '{"drawn":[],"derived":[],"where":[]}'::jsonb, '{"columns":["a"],"rows":[[1]],"total":1}'::jsonb,
         repeat('a', 64), tr
    from (values ('t1', 's.vfy74.pass', 'ratified', 0, 'C'), ('t2', 's.vfy74.pass', 'ratified', 1, 'P'),
                 ('t3', 's.vfy74.pass', 'ratified', 2, 'D'), ('t4', 's.vfy74.pass', 'draft', 3, 'E'),
                 ('t5', 's.vfy74.stuck', 'ratified', 4, null)) x(h, sk, st, pos, tr);

  -- ---- UT-12 first: no check by anyone, nothing passable taught → up_next ------
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_res := my_unit_tracker(v_k);
  v_unit := v_res->'units'->0;
  if jsonb_array_length(v_res->'units') <> 1 or v_unit->>'unit' <> 'Vfy unit' then
    raise exception 'FAIL B1: units %', v_res;
  end if;
  v_rows := v_unit->'rows';
  -- UT-2: 5 rows in teaching order, the ungiven one included, the consolidation not.
  if (select array_agg(r->>'skill_id' order by o) from jsonb_array_elements(v_rows) with ordinality x(r, o))
     <> array['s.vfy74.plain','s.vfy74.stuck','s.vfy74.pass','s.vfy74.dol','s.vfy74.ungiven'] then
    raise exception 'FAIL B1: rows %', v_rows;
  end if;
  if exists (select 1 from jsonb_array_elements(v_rows) r where r->>'status' <> 'not_started') then
    raise exception 'FAIL B1: a row started with no checks: %', v_rows;
  end if;
  if v_unit->'next'->>'kind' <> 'up_next' or v_unit->'next'->>'title' <> 'Plain' then
    raise exception 'FAIL B1: next %', v_unit->'next';
  end if;
  -- UT-7.
  if (v_rows->2->'letters') <> '["D","C","P"]'::jsonb or (v_rows->1->'letters') <> '[]'::jsonb then
    raise exception 'FAIL B2: letters %', v_rows;
  end if;

  -- ---- statuses and precedence (UT-3) ------------------------------------------
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  select v_s, a, (select current_version_id from activities where id = a), 's1', 1, '{}', '{}'
    from unnest(array[a_plain, a_stuck, a_pass]) a;
  -- Settings at PRODUCTION values (window 5, min right 3), newest on purpose.
  insert into mixed_settings_revision (revision, graph_version, settings, mirrored_at)
  values (repeat('7', 64), 'vfy', '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1,
    "mixed_items_per_session": 6, "mixed_max_discrimination": 1, "mixed_new_skills_per_session": 2,
    "mixed_struggling_window": 5, "mixed_struggling_min_right": 3}'::jsonb, '2999-01-01');
  -- stuck: 3 wrong of 5 on s.vfy74.stuck; pass: also stuck, but passed.
  insert into dol_pass (student_id, skill_id, source) values (v_s, 's.vfy74.pass', 'auto');
  for i in 1..5 loop
    insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded, planned, keep_until)
    values (v_k, v_s, current_date - i, 1, repeat('7', 64), false, 2, current_date + 100) returning id into v_sess;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id, item_id, fingerprint, row_index, document, row_values)
    values (v_sess, 1, v_s, 'skill', 's.vfy74.stuck', v_t, 'vfy74#t5', repeat('0', 64), 0, '{}', '{}'),
           (v_sess, 2, v_s, 'skill', 's.vfy74.pass',  v_t, 'vfy74#t1', repeat('0', 64), 0, '{}', '{}');
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind, bank_key, correct, skipped, saved_at)
    values (v_sess, 1, v_s, v_k, current_date - i, 'skill', 's.vfy74.stuck', i > 3, false, now() - make_interval(days => i)),
           (v_sess, 2, v_s, v_k, current_date - i, 'skill', 's.vfy74.pass', false, false, now() - make_interval(days => i));
  end loop;
  v_res := my_unit_tracker(v_k); v_unit := v_res->'units'->0; v_rows := v_unit->'rows';
  if v_rows->0->>'status' <> 'learning' or v_rows->1->>'status' <> 'keep_practising'
     or v_rows->2->>'status' <> 'passed' or v_rows->3->>'status' <> 'not_started' then
    raise exception 'FAIL B3: statuses %', v_rows;
  end if;
  -- The unlock note: passed with a ratified P template; never on an unpassed row.
  if not (v_rows->2->>'harder')::boolean or (v_rows->0->>'harder')::boolean then
    raise exception 'FAIL B3: harder %', v_rows;
  end if;

  -- ---- UT-12 + UT-8 -------------------------------------------------------------
  -- dol is passable but untaught: next is up_next (the unchecked Dol activity).
  if v_unit->'next'->>'kind' <> 'up_next' or v_unit->'next'->>'title' <> 'Dol' then
    raise exception 'FAIL B4: untaught passable next %', v_unit->'next';
  end if;
  -- Taught through a non-DoL section of its version: next is the check.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, a_dol, v_dol_v, 'other', 1, '{}', '{}');
  v_n := my_unit_tracker(v_k)->'units'->0->'next';
  if v_n->>'kind' <> 'check' or v_n->>'title' <> 'Dol' then raise exception 'FAIL B4: check %', v_n; end if;
  -- First try today, no bank: wait.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, a_dol, v_dol_v, 'dol-sec', 1, '{}', '{}');
  v_n := my_unit_tracker(v_k)->'units'->0->'next';
  if v_n->>'kind' <> 'wait' then raise exception 'FAIL B4: wait %', v_n; end if;
  -- A ratified template: practice, with the version to link to.
  insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id, status, position,
                             document, seed_spec, value_table, fingerprint)
  values (v_t, 'vfy74#t9', 'banks/c/d.md', 'skill', 's.vfy74.dol', 'chain.vfy74', 'ratified', 9,
          '{"sections":[]}', '{"drawn":[],"derived":[],"where":[]}', '{"columns":["a"],"rows":[[1]],"total":1}', repeat('a', 64));
  v_n := my_unit_tracker(v_k)->'units'->0->'next';
  if v_n->>'kind' <> 'practice' or (v_n->>'version_id')::uuid <> v_dol_v then raise exception 'FAIL B4: practice %', v_n; end if;
  -- Practice finished, a day on: retake.
  insert into dol_practice_sessions (student_id, activity_id, version_id, skill_id, planned, finished_at)
  values (v_s, a_dol, v_dol_v, 's.vfy74.dol', 4, now());
  update section_checks set created_at = now() - interval '2 days'
   where student_id = v_s and activity_id = a_dol and section_id = 'dol-sec';
  v_n := my_unit_tracker(v_k)->'units'->0->'next';
  if v_n->>'kind' <> 'retake' then raise exception 'FAIL B4: retake %', v_n; end if;
  -- Tries used up: the walk moves on, and "all passed" must NOT fire.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, a_dol, v_dol_v, 'dol-sec', 2, '{}', '{}');
  v_n := my_unit_tracker(v_k)->'units'->0->'next';
  if v_n is not null and v_n->>'kind' = 'all_passed' then raise exception 'FAIL B4: all_passed with tries used up'; end if;
  -- Passed: every taught passable row passed → all_passed.
  insert into dol_pass (student_id, skill_id, source) values (v_s, 's.vfy74.dol', 'auto');
  v_n := my_unit_tracker(v_k)->'units'->0->'next';
  if v_n->>'kind' <> 'all_passed' then raise exception 'FAIL B4: all_passed %', v_n; end if;

  -- ---- UT-5: wording ---------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2)::text, true);
  perform set_tracker_wording('s.vfy74.plain', 'Other teacher''s words');
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_tracker_wording('s.vfy74.plain', '  School words  ');
  begin
    perform set_tracker_wording('s.vfy74.plain', repeat('x', 201));
    raise exception 'FAIL B5: 201 characters accepted';
  exception when others then
    if sqlerrm <> 'wording_too_long' then raise; end if;
  end;
  v_res := class_unit_tracker(v_k); v_rows := v_res->'units'->0->'rows';
  if v_rows->0->>'wording' <> 'School words' then raise exception 'FAIL B5: teacher read %', v_rows; end if;
  if exists (select 1 from jsonb_array_elements(v_rows) r where r ? 'status') then
    raise exception 'FAIL B6: the teacher read carries a status';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if (my_unit_tracker(v_k)->'units'->0->'rows'->0->>'wording') <> 'School words' then
    raise exception 'FAIL B5: the student does not get their class teacher''s wording';
  end if;
  begin
    perform set_tracker_wording('s.vfy74.plain', 'student words');
    raise exception 'FAIL B5: a student wrote wording';
  exception when others then
    if sqlerrm <> 'not_a_teacher' then raise; end if;
  end;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_tracker_wording('s.vfy74.plain', '');
  if exists (select 1 from tracker_wording where teacher_id = v_t) then raise exception 'FAIL B5: clearing kept the row'; end if;

  -- ---- refusals ---------------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  begin
    perform my_unit_tracker(v_k);
    raise exception 'FAIL B7: a non-member read the tracker';
  exception when others then
    if sqlerrm <> 'Not available' then raise; end if;
  end;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2)::text, true);
  begin
    perform class_unit_tracker(v_k);
    raise exception 'FAIL B7: another teacher read the class';
  exception when others then
    if sqlerrm <> 'not_class_teacher' then raise; end if;
  end;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;
