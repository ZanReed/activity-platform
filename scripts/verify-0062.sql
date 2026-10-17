-- verify-0062.sql — first tries (migration 0062; docs/design/first-try-view.md).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0061 idiom). Durable-write-free (P7).
-- ⚠ ALSO RE-RUN verify-0061: 0062 re-creates class_student_work.
--
--   §A — catalog posture: activity_first_tries is SECURITY DEFINER with a
--        pinned search_path, authenticated yes / anon no; class_student_work
--        still callable the same way.
--   §B — one fixture:
--        B1  the scope: a removed student, an outsider (checked the activity,
--            in no live class of the teacher's) and a deleted class's roster
--            never appear in any count or student list
--        B2  multiple choice: first / right / wrong / right-now / picked, and
--            one group per PICKED choice with its count and right-now count
--        B3  a blank: first-try wrong answers grouped (" 0.75" = ".75"), with
--            the right-now count; correct first tries are not a group
--        B4  recorded items (short answers) are not marked, so not listed
--        B5  sections: students with a first try per section; older_only
--            counts a rostered student who checked only an older version;
--            no_first counts one whose attempt 1 is gone (B5b)
--        (B2 includes a multi-select student; B7a an unassigned activity the
--         student HAS checked, so the assignment gate is really tested)
--        B6  class_student_work carries attempt 1 beside the latest
--        B7  refusals: another teacher, no claims; an unassigned activity of
--            the teacher's reads empty

-- @section A-catalog-posture
-- @expect-rows
select 'first_tries_definer_pinned',
       (select p.prosecdef and p.proconfig @> array['search_path=public']
          from pg_proc p where p.proname = 'activity_first_tries'),
       'SECURITY DEFINER, search_path pinned';
select 'first_tries_signed_in_only',
       (select has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
          from pg_proc p where p.proname = 'activity_first_tries'),
       'authenticated may call, anon may not';
select 'student_work_grants_kept',
       (select count(*) = 1
               and bool_and(has_function_privilege('authenticated', p.oid, 'execute')
                            and not has_function_privilege('anon', p.oid, 'execute')
                            and p.prosecdef)
          from pg_proc p where p.proname = 'class_student_work'),
       'one overload, definer, same grants after the re-create';

-- @section B-first-tries
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();
  v_t2  uuid := gen_random_uuid();
  v_s   uuid := gen_random_uuid();  -- wrong first, right now
  v_p   uuid := gen_random_uuid();  -- wrong first, still wrong
  v_q   uuid := gen_random_uuid();  -- right first
  v_m   uuid := gen_random_uuid();  -- multi-select: ticks the right AND a wrong choice
  v_r   uuid := gen_random_uuid();  -- rostered, only the older version
  v_g   uuid := gen_random_uuid();  -- removed
  v_o   uuid := gen_random_uuid();  -- outsider (only in the deleted class)
  v_k   uuid; v_k2 uuid;
  v_a   uuid; v_a1 uuid; v_a2 uuid;
  v_c   uuid; v_c1 uuid;
  v_ca  text := 'choice-a-correct';
  v_cb  text := 'choice-b';
  v_j   jsonb;
  v_it  jsonb;
  v_ok  boolean;
  v_doc jsonb := '{"schemaVersion": 2, "meta": {"title": "v"}, "sections": []}'::jsonb;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t,  'vfy0062-t@vfy0062.example',  '{}'::jsonb), (v_t2, 'vfy0062-t2@vfy0062.example', '{}'::jsonb),
         (v_s,  'vfy0062-s@vfy0062.example',  '{}'::jsonb), (v_p,  'vfy0062-p@vfy0062.example',  '{}'::jsonb),
         (v_q,  'vfy0062-q@vfy0062.example',  '{}'::jsonb), (v_r,  'vfy0062-r@vfy0062.example',  '{}'::jsonb),
         (v_m,  'vfy0062-m@vfy0062.example',  '{}'::jsonb),
         (v_g,  'vfy0062-g@vfy0062.example',  '{}'::jsonb), (v_o,  'vfy0062-o@vfy0062.example',  '{}'::jsonb);
  update users set role = 'teacher' where id in (v_t, v_t2);
  update users set role = 'student' where id in (v_s, v_p, v_q, v_r, v_m, v_g, v_o);

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0062', v_t, 'vfy') returning id into v_k;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, deleted_at)
  values (v_t, 'vfy 0062 gone', v_t, 'vfy', now()) returning id into v_k2;
  insert into class_members (class_id, student_id) values (v_k, v_s), (v_k, v_p), (v_k, v_q), (v_k, v_r), (v_k, v_m), (v_k2, v_o);
  insert into class_members (class_id, student_id, removed_at) values (v_k, v_g, now());

  insert into activities (owner_id, title, slug, status) values (v_t, 'A', 'vfy-0062-a', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 1, v_doc, v_t) returning id into v_a1;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 2, v_doc, v_t) returning id into v_a2;
  update activities set current_version_id = v_a2 where id = v_a;
  insert into activities (owner_id, title, slug, status) values (v_t, 'C', 'vfy-0062-c', 'published') returning id into v_c;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_c, 1, v_doc, v_t) returning id into v_c1;
  update activities set current_version_id = v_c1 where id = v_c;
  insert into class_activities (class_id, activity_id, added_by) values (v_k, v_a, v_t), (v_k2, v_a, v_t);

  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, created_at)
  values
    -- S: wrong first (B, " 0.75"), right on attempt 2.
    (v_s, v_a, v_a2, 's1', 1, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_cb)), 'blanks', '{"b1": " 0.75"}'::jsonb),
          '{"mc1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0062.x"]}, "b1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0062.y"]}}', now() - interval '2 hours'),
    (v_s, v_a, v_a2, 's1', 2, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_ca)), 'blanks', '{"b1": "0.8"}'::jsonb),
          '{"mc1": {"verdict": "correct"}, "b1": {"verdict": "correct"}}', now() - interval '1 hour'),
    -- P: wrong first (B, ".75"), never re-checked.
    (v_p, v_a, v_a2, 's1', 1, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_cb)), 'blanks', '{"b1": ".75"}'::jsonb),
          '{"mc1": {"verdict": "incorrect"}, "b1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0062.y"]}}', now() - interval '2 hours'),
    -- Q: right first; a recorded short answer in s2.
    (v_q, v_a, v_a2, 's1', 1, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_ca)), 'blanks', '{"b1": "0.8"}'::jsonb),
          '{"mc1": {"verdict": "correct"}, "b1": {"verdict": "correct"}}', now() - interval '2 hours'),
    (v_q, v_a, v_a2, 's2', 1, '{"freeText": {"sa": "because"}}', '{"sa": {"verdict": "recorded"}}', now() - interval '2 hours'),
    -- M: multi-select, ticks A and B on attempt 1 (wrong), never re-checked.
    (v_m, v_a, v_a2, 's1', 1, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_ca, v_cb))),
          '{"mc1": {"verdict": "incorrect"}}', now() - interval '2 hours'),
    -- S also checked C (owned by the teacher, NOT assigned): must never count.
    (v_s, v_c, v_c1, 's1', 1, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_cb))),
          '{"mc1": {"verdict": "incorrect"}}', now() - interval '2 hours'),
    -- R: only the older version.
    (v_r, v_a, v_a1, 's1', 1, '{}', '{"x": {"verdict": "incorrect"}}', now() - interval '3 hours'),
    -- G (removed) and O (outsider): wrong first, both would swell every count.
    (v_g, v_a, v_a2, 's1', 1, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_cb)), 'blanks', '{"b1": ".75"}'::jsonb),
          '{"mc1": {"verdict": "incorrect"}, "b1": {"verdict": "incorrect"}}', now() - interval '2 hours'),
    (v_o, v_a, v_a2, 's1', 1, jsonb_build_object('choices', jsonb_build_object('mc1', jsonb_build_array(v_cb)), 'blanks', '{"b1": ".75"}'::jsonb),
          '{"mc1": {"verdict": "incorrect"}, "b1": {"verdict": "incorrect"}}', now() - interval '2 hours');

  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_j := activity_first_tries(v_a);
  execute 'reset role';

  -- B1: nobody out of scope, anywhere.
  if v_j::text like '%' || v_g || '%' or v_j::text like '%' || v_o || '%' then
    raise exception 'FAIL B1: a removed or outside student is in the output %', v_j;
  end if;

  -- B2: multiple choice.
  select i into v_it from jsonb_array_elements(v_j->'items') i where i->>'item_id' = 'mc1';
  -- (M ticked two choices: counted once in first/wrong/picked, once in EACH group.)
  if (v_it->>'first')::int is distinct from 4 or (v_it->>'right_first')::int is distinct from 1
     or (v_it->>'wrong_first')::int is distinct from 3 or (v_it->>'wrong_right_now')::int is distinct from 1
     or (v_it->>'picked')::int is distinct from 4 or v_it->>'family' is distinct from 'choices'
     or jsonb_array_length(v_it->'groups') <> 2
     or v_it->'groups'->0->'answer' is distinct from to_jsonb(v_cb)
     or (v_it->'groups'->0->>'count')::int is distinct from 3
     or (v_it->'groups'->0->>'right_now')::int is distinct from 1
     or v_it->'groups'->1->'answer' is distinct from to_jsonb(v_ca)
     or (v_it->'groups'->1->>'count')::int is distinct from 2
     or jsonb_array_length(v_it->'groups'->0->'students') <> 3 then
    raise exception 'FAIL B2: multiple choice %', v_it;
  end if;

  -- B3: the blank — one wrong group (" 0.75" = ".75"), right now 1, tagged.
  select i into v_it from jsonb_array_elements(v_j->'items') i where i->>'item_id' = 'b1';
  if (v_it->>'first')::int is distinct from 3 or (v_it->>'right_first')::int is distinct from 1
     or (v_it->>'wrong_right_now')::int is distinct from 1
     or jsonb_array_length(v_it->'groups') <> 1
     or (v_it->'groups'->0->>'count')::int is distinct from 2
     or (v_it->'groups'->0->>'right_now')::int is distinct from 1
     or v_it->'groups'->0->'misconception_ids' is distinct from '["mis.vfy0062.y"]'::jsonb then
    raise exception 'FAIL B3: blank %', v_it;
  end if;

  -- B4: the recorded short answer is not an item.
  if exists (select 1 from jsonb_array_elements(v_j->'items') i where i->>'item_id' = 'sa') then
    raise exception 'FAIL B4: a recorded item was listed';
  end if;

  -- B5: sections and older_only.
  if (select (s->>'students')::int from jsonb_array_elements(v_j->'sections') s where s->>'section_id' = 's1') is distinct from 4
     or (select (s->>'students')::int from jsonb_array_elements(v_j->'sections') s where s->>'section_id' = 's2') is distinct from 1
     or (v_j->>'older_only')::int is distinct from 1
     or (v_j->>'no_first')::int is distinct from 0 then
    raise exception 'FAIL B5: sections % older_only %', v_j->'sections', v_j->'older_only';
  end if;

  -- B5b: a student with a later attempt but no attempt 1 kept is counted in
  --      no_first, and nowhere else.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_q, v_a, v_a2, 's3', 2, '{}', '{"z": {"verdict": "incorrect"}}');
  execute 'set local role authenticated';
  v_j := activity_first_tries(v_a);
  execute 'reset role';
  if (v_j->>'no_first')::int is distinct from 1
     or exists (select 1 from jsonb_array_elements(v_j->'items') i where i->>'item_id' = 'z') then
    raise exception 'FAIL B5b: no_first % items %', v_j->'no_first', v_j->'items';
  end if;

  -- B6: the answer panel's first attempt beside the latest.
  execute 'set local role authenticated';
  v_j := class_student_work(v_k, v_s, v_a);
  execute 'reset role';
  select s into v_it from jsonb_array_elements(v_j->'versions'->0->'sections') s where s->>'section_id' = 's1';
  if v_it->'responses'->'choices'->'mc1' is distinct from jsonb_build_array(v_ca)
     or v_it->'first'->'responses'->'choices'->'mc1' is distinct from jsonb_build_array(v_cb)
     or v_it->'first'->'verdicts'->'mc1'->>'verdict' is distinct from 'incorrect' then
    raise exception 'FAIL B6: first attempt %', v_it;
  end if;

  -- B7: refusals and the unassigned activity.
  execute 'set local role authenticated';
  v_j := activity_first_tries(v_c);
  execute 'reset role';
  -- (S HAS a check on C, so this row fails if the assignment gate goes.)
  if jsonb_array_length(v_j->'items') <> 0 or (v_j->>'older_only')::int <> 0 then
    raise exception 'FAIL B7a: unassigned activity read %', v_j;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    perform activity_first_tries(v_a);
  exception when insufficient_privilege then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B7b: another teacher read first tries'; end if;
  perform set_config('request.jwt.claims', '', true);
  v_ok := false;
  begin
    perform activity_first_tries(v_a);
  exception when insufficient_privilege then v_ok := true;
  end;
  if not v_ok then raise exception 'FAIL B7c: no claims read first tries'; end if;

  raise exception 'EXPECTED ROLLBACK';
end
$vfy$;
