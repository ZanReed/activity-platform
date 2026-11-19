-- verify-0097.sql — an empty photo answer is not "to grade" while photo
-- answers are off (migration 0097; author ruling 2026-11-19). Run with
-- `pnpm verify:auth --target live|local --only verify-0097`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block, so
-- nothing persists (P7) — photo_clearance included: it is flipped inside the
-- block and the rollback restores it.

-- @section A-posture
-- @expect-rows
select 'owed_rule_is_server_only',
       not has_function_privilege('authenticated', 'public.hand_grade_owed(text, uuid, uuid, boolean, boolean)', 'execute')
       and not has_function_privilege('anon', 'public.hand_grade_owed(text, uuid, uuid, boolean, boolean)', 'execute'),
       'hand_grade_owed: called only from inside the definer functions';
select 'every_to_grade_reader_asks_the_rule',
       pg_get_functiondef('public.activity_progress(uuid)'::regprocedure) ~ 'hand_grade_owed'
       and pg_get_functiondef('public.class_progress(uuid)'::regprocedure) ~ 'hand_grade_owed'
       and pg_get_functiondef('public.list_grading_queue(uuid)'::regprocedure) ~ 'hand_grade_owed'
       and pg_get_functiondef('public.class_student_work(uuid, uuid, uuid)'::regprocedure) ~ '''photos_on'', photos_allowed_for\(p_activity_id\)',
       'activity_progress, class_progress and the queue ask hand_grade_owed; class_student_work reports photos_on';
select 'queue_still_signed_in_only',
       has_function_privilege('authenticated', 'public.list_grading_queue(uuid)', 'execute')
       and not has_function_privilege('anon', 'public.list_grading_queue(uuid)', 'execute')
       and has_function_privilege('authenticated', 'public.class_student_work(uuid, uuid, uuid)', 'execute')
       and not has_function_privilege('anon', 'public.class_student_work(uuid, uuid, uuid)', 'execute'),
       'the re-created reads kept their grants';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t    uuid := gen_random_uuid();
  v_s    uuid := gen_random_uuid();
  v_act  uuid;
  v_ver  uuid;
  v_cls  uuid;
  v_pb   uuid := gen_random_uuid();   -- photo_response (section s1)
  v_sb   uuid := gen_random_uuid();   -- short_answer (section s2)
  v_c1   uuid;
  v_p1   uuid;
  v_act3 uuid;
  v_ver3 uuid;
  v_db   uuid := gen_random_uuid();   -- photo_response, the DoL primary
  v_j    jsonb;
  n      integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0097-' || o || '@vfy0097.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  -- 0099: photo answers are for pilot teachers; the fixture teacher is one.
  update users set photo_pilot = true where id = v_t;
  update users set role = 'student' where id = v_s;

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0097', 'vfy-0097', 'published') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_pb, 'type', 'photo_response', 'prompt', '[]'::jsonb,
                  'rubric', jsonb_build_object('criteria', jsonb_build_array(
                    jsonb_build_object('id', 'c1', 'label', 'Working', 'maxPoints', 2)))))))))),
            jsonb_build_object(
            'id', 's2', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_sb, 'type', 'short_answer', 'prompt', '[]'::jsonb))))))))),
          v_t)
  returning id into v_ver;
  update activities set current_version_id = v_ver where id = v_act;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0097', v_t, 'vfy', current_date + 200) returning id into v_cls;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_act, v_t);
  insert into class_members (class_id, student_id) values (v_cls, v_s);

  -- Photo answers OFF. The student checks both sections, both left empty.
  update photo_clearance set cleared = false;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  perform record_check(v_s, v_act, v_ver, 's1', '{}'::jsonb,
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  perform record_check(v_s, v_act, v_ver, 's2', '{}'::jsonb,
    jsonb_build_object(v_sb::text, jsonb_build_object('verdict', 'recorded')));
  select id into v_c1 from section_checks where student_id = v_s and activity_id = v_act and section_id = 's1';
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);

  -- B1 off + empty photo answer: not owed anywhere; the blank short answer
  -- still is (a blank essay is owed, and nothing about it changed)
  if exists (select 1 from list_grading_queue(v_act) q where q.block_id = v_pb) then
    raise exception 'FAIL B1: the empty photo answer is in the queue while off';
  end if;
  if not exists (select 1 from list_grading_queue(v_act) q where q.block_id = v_sb) then
    raise exception 'FAIL B1: the blank short answer left the queue';
  end if;
  v_j := activity_progress(v_act);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1 then raise exception 'FAIL B1: activity %', v_j; end if;
  v_j := class_progress(v_cls);
  if (select sum((c->>'to_grade')::int) from jsonb_array_elements(v_j->'cells') c) is distinct from 1::bigint then
    raise exception 'FAIL B1: class grid %', v_j;
  end if;
  if (class_student_work(v_cls, v_s, v_act)->>'photos_on')::boolean then raise exception 'FAIL B1: photos_on'; end if;
  n := n + 1;

  -- B2 on: the same empty photo answer is owed again, like a blank essay
  update photo_clearance set cleared = true;
  if not exists (select 1 from list_grading_queue(v_act) q where q.block_id = v_pb) then
    raise exception 'FAIL B2: the empty photo answer is missing while on';
  end if;
  v_j := activity_progress(v_act);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 2 then raise exception 'FAIL B2: activity %', v_j; end if;
  v_j := class_progress(v_cls);
  if (select sum((c->>'to_grade')::int) from jsonb_array_elements(v_j->'cells') c) is distinct from 2::bigint then
    raise exception 'FAIL B2: class grid %', v_j;
  end if;
  if not (class_student_work(v_cls, v_s, v_act)->>'photos_on')::boolean then raise exception 'FAIL B2: photos_on'; end if;
  n := n + 1;

  -- B3 a photo answer that HOLDS a photo (handed in while on) is still owed
  -- once answers go off
  update photo_clearance set cleared = true;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_p1 := reserve_work_photo(v_act, v_ver, v_pb);
  insert into storage.objects (bucket_id, name, owner_id, version)
  select 'student-work', object_name, v_s::text, gen_random_uuid()::text from work_photos where id = v_p1;
  perform record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p1)))),
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  update photo_clearance set cleared = false;
  if not exists (select 1 from list_grading_queue(v_act) q
                 where q.block_id = v_pb and q.response_photos = jsonb_build_array(jsonb_build_object('id', v_p1))) then
    raise exception 'FAIL B3: the handed-in photo left the queue while off';
  end if;
  select id into v_c1 from section_checks
   where student_id = v_s and activity_id = v_act and section_id = 's1' order by attempt_number desc limit 1;
  v_j := activity_progress(v_act);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 2 then raise exception 'FAIL B3: activity %', v_j; end if;
  n := n + 1;

  -- B4 a GRADED photo answer stays listed while answers are off (a grade
  -- never vanishes from the queue), and is no longer owed
  perform upsert_check_grade(v_c1, v_pb,
    jsonb_build_array(jsonb_build_object('criterionId', 'c1', 'earned', 0)), 'Graded.');
  if not exists (select 1 from list_grading_queue(v_act) q where q.block_id = v_pb and q.graded) then
    raise exception 'FAIL B4: a graded photo answer left the queue';
  end if;
  v_j := activity_progress(v_act);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1 then raise exception 'FAIL B4: activity %', v_j; end if;
  n := n + 1;

  -- B5 the queue's "already graded" branch: the student re-checks the section
  -- with the photo removed while answers are off. The answer is empty (not
  -- owed by the rule), but it has a grade, so it stays listed, as stale.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  perform record_check(v_s, v_act, v_ver, 's1', '{}'::jsonb,
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if not exists (select 1 from list_grading_queue(v_act) q
                 where q.block_id = v_pb and q.graded and q.stale and q.response_photos is null) then
    raise exception 'FAIL B5: a graded answer, emptied while off, left the queue: %',
      (select jsonb_agg(to_jsonb(q)) from list_grading_queue(v_act) q);
  end if;
  v_j := activity_progress(v_act);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1 then raise exception 'FAIL B5: activity %', v_j; end if;
  n := n + 1;

  -- B6 (Fable review) in a DoL section an empty photo answer stays OWED while
  -- answers are off: a rubric-primary retake opens only once attempt 1's
  -- grade is released (0070, 0072), so the teacher must be able to grade it
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0097 dol', 'vfy-0097-dol', 'published') returning id into v_act3;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act3, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 'dol', 'isCheckpoint', true, 'dol', '{"skills":["s"],"retake":true}'::jsonb,
            'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_db, 'type', 'photo_response', 'prompt', '[]'::jsonb))))))))),
          v_t)
  returning id into v_ver3;
  update activities set current_version_id = v_ver3 where id = v_act3;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_act3, v_t);
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, v_act3, v_ver3, 'dol', 1, '{}', jsonb_build_object(v_db::text, jsonb_build_object('verdict', 'recorded')));
  if (select cleared from photo_clearance) then raise exception 'FAIL B6 setup: clearance on'; end if;
  if not exists (select 1 from list_grading_queue(v_act3) q where q.block_id = v_db and not q.graded) then
    raise exception 'FAIL B6: an empty DoL photo answer left the queue while off (the retake would be stranded)';
  end if;
  v_j := activity_progress(v_act3);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1 then raise exception 'FAIL B6: activity %', v_j; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0097 B: % checks passed', n;
end;
$vfy$;
