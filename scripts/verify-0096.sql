-- verify-0096.sql — teacher grading of photos of working (migration 0096,
-- media-submissions.md slice 3). Run with
-- `pnpm verify:auth --target live|local --only verify-0096`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block, so
-- nothing persists (P7). §B grades and releases through the real RPCs as the
-- teacher; the check and its photos are made by record_check, as the
-- check-activity function makes them.

-- @section A-posture
-- @expect-rows
select 'the_set_is_one_immutable_helper',
       (select provolatile = 'i' from pg_proc where oid = 'public.is_manually_graded_type(text)'::regprocedure)
       and is_manually_graded_type('short_answer') and is_manually_graded_type('essay')
       and is_manually_graded_type('photo_response')
       and not is_manually_graded_type('self_explanation') and not is_manually_graded_type(null),
       'is_manually_graded_type: IMMUTABLE; short_answer, essay, photo_response and nothing else';
-- The guard is bound to the DEPLOYED definitions, not the migration files
-- (§7). Two bodies may still spell the pair, each for a stated reason.
select 'no_inline_pair_left',
       coalesce(array_agg(p.proname order by p.proname)
                  filter (where p.proname not in ('claim_grade_suggestions', 'dol_optional_block',
                                                  'is_manually_graded_type')), '{}') = '{}',
       'no live function spells (''short_answer'', ''essay'') except the AI claim (text only, by design), dol_optional_block''s gradable list (bound to isGradeable) and the helper itself'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and pg_get_functiondef(p.oid) ~ '''short_answer'', *''essay''';
select 'claim_excludes_photos',
       pg_get_functiondef((select oid from pg_proc where proname = 'claim_grade_suggestions' and pronamespace = 'public'::regnamespace)) !~ 'photo_response'
       and pg_get_functiondef((select oid from pg_proc where proname = 'claim_grade_suggestions' and pronamespace = 'public'::regnamespace)) !~ 'is_manually_graded_type'
       and pg_get_functiondef((select oid from pg_proc where proname = 'claim_grade_suggestions' and pronamespace = 'public'::regnamespace)) ~ '''short_answer'', *''essay''',
       'the AI grading claim still names its TEXT types only: a photo can never be sent to the text worker (§7)';
select 'queue_carries_photos',
       pg_get_function_result('public.list_grading_queue(uuid)'::regprocedure) ilike '%response_photos jsonb%'
       and has_function_privilege('authenticated', 'public.list_grading_queue(uuid)', 'execute')
       and not has_function_privilege('anon', 'public.list_grading_queue(uuid)', 'execute'),
       'list_grading_queue returns response_photos and is still signed-in only after its re-creation';
select 'photo_states_definer_signed_in_only',
       p.prosecdef
       and has_function_privilege('authenticated', p.oid, 'execute')
       and not has_function_privilege('anon', p.oid, 'execute')
       and exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'),
       'work_photo_states: DEFINER, search_path pinned, signed-in only'
from pg_proc p where p.oid = 'public.work_photo_states(uuid, uuid[])'::regprocedure;
select 'release_sets_the_photo_clock',
       pg_get_functiondef('public.release_check_grades(uuid, uuid)'::regprocedure) ilike '%least(w.keep_until, first_release.at + interval ''30 days'')%',
       'release_check_grades caps each released photo at release + 30 days (MS-10)';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t     uuid := gen_random_uuid();   -- the teacher who owns the activity
  v_t2    uuid := gen_random_uuid();   -- another teacher
  v_s     uuid := gen_random_uuid();   -- the student
  v_act   uuid;
  v_ver   uuid;
  v_cls   uuid;
  v_pb    uuid := gen_random_uuid();   -- a photo_response block with a rubric
  v_sb    uuid := gen_random_uuid();   -- a short_answer block (section s2)
  v_act2  uuid;                        -- another activity of the same teacher
  v_ver2  uuid;
  v_pb2   uuid := gen_random_uuid();
  v_px    uuid;                        -- the student's photo on v_act2
  v_p4    uuid;
  v_p5    uuid;
  v_p6    uuid;
  v_c4    uuid;
  v_p1    uuid;
  v_p2    uuid;
  v_p3    uuid;
  v_c1    uuid;
  v_c2    uuid;
  v_row   record;
  v_keep  timestamptz;
  v_got   text;
  v_j     jsonb;
  n       integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0096-' || o || '@vfy0096.example', '{}'::jsonb
    from unnest(array[v_t, v_t2, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_t2);
  -- 0099: photo answers are for pilot teachers; the fixture teacher is one.
  update users set photo_pilot = true where id in (v_t, v_t2);
  update users set role = 'student' where id = v_s;

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0096', 'vfy-0096', 'published') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_pb, 'type', 'photo_response', 'maxPhotos', 2, 'prompt', '[]'::jsonb,
                  'rubric', jsonb_build_object('criteria', jsonb_build_array(
                    jsonb_build_object('id', 'c1', 'label', 'Working', 'maxPoints', 2)))))))))),
            jsonb_build_object(
            'id', 's2', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_sb, 'type', 'short_answer', 'prompt', '[]'::jsonb,
                  'rubric', jsonb_build_object('criteria', jsonb_build_array(
                    jsonb_build_object('id', 'k1', 'label', 'Reason', 'maxPoints', 1)))))))))))),
          v_t)
  returning id into v_ver;
  update activities set current_version_id = v_ver where id = v_act;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0096', v_t, 'vfy', current_date + 200) returning id into v_cls;
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0096 b', 'vfy-0096-b', 'published') returning id into v_act2;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act2, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_pb2, 'type', 'photo_response', 'prompt', '[]'::jsonb))))))))),
          v_t)
  returning id into v_ver2;
  update activities set current_version_id = v_ver2 where id = v_act2;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_act, v_t), (v_cls, v_act2, v_t);
  insert into class_members (class_id, student_id) values (v_cls, v_s);

  update photo_clearance set cleared = true;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_p1 := reserve_work_photo(v_act, v_ver, v_pb);
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  v_p3 := reserve_work_photo(v_act, v_ver, v_pb);
  v_px := reserve_work_photo(v_act2, v_ver2, v_pb2);
  insert into storage.objects (bucket_id, name, owner_id, version)
  select 'student-work', object_name, v_s::text, gen_random_uuid()::text
    from work_photos where id in (v_p1, v_p2, v_p3, v_px);

  -- The student's first check hands in p1.
  v_j := record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p1)))),
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  select id into v_c1 from section_checks where student_id = v_s and activity_id = v_act order by attempt_number desc limit 1;

  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);

  -- B1 the photo answer is in the teacher's queue, with its photo ids
  select * into v_row from list_grading_queue(v_act) q where q.block_id = v_pb;
  if v_row.check_id is distinct from v_c1 or v_row.block_type <> 'photo_response'
     or v_row.response_photos <> jsonb_build_array(jsonb_build_object('id', v_p1))
     or v_row.response_text is not null or v_row.graded or v_row.stale then
    raise exception 'FAIL B1: %', to_jsonb(v_row);
  end if;
  n := n + 1;

  -- B2 class progress counts it "to grade"
  v_j := activity_progress(v_act);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1 then
    raise exception 'FAIL B2: to_grade %', v_j->'classes'->0->'students'->0;
  end if;
  n := n + 1;

  -- B3 the teacher grades it through the real RPC (it used to refuse:
  -- "Only written-answer questions can be graded")
  perform upsert_check_grade(v_c1, v_pb,
    jsonb_build_array(jsonb_build_object('criterionId', 'c1', 'earned', 2)), 'Clear working.');
  select * into v_row from list_grading_queue(v_act) q where q.block_id = v_pb;
  if not v_row.graded or v_row.stale then raise exception 'FAIL B3: %', to_jsonb(v_row); end if;
  v_j := activity_progress(v_act);
  if (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 0 then raise exception 'FAIL B3: still to grade'; end if;
  n := n + 1;

  -- B4 release caps the photo at release + 30 days, and a second release
  -- never extends it
  select keep_until into v_keep from work_photos where id = v_p1;
  if v_keep < now() + interval '100 days' then raise exception 'FAIL B4 setup: keep_until %', v_keep; end if;
  perform release_check_grades(v_act, v_s);
  select keep_until into v_keep from work_photos where id = v_p1;
  if v_keep > now() + interval '30 days' or v_keep < now() + interval '29 days' then
    raise exception 'FAIL B4: keep_until % after release', v_keep;
  end if;
  update work_photos set keep_until = now() + interval '3 days' where id = v_p1;
  update check_grades set released_at = null where check_id = v_c1;
  perform release_check_grades(v_act, v_s);
  if (select keep_until from work_photos where id = v_p1) > now() + interval '3 days 1 minute' then
    raise exception 'FAIL B4: a re-release extended the clock';
  end if;
  -- an unattached photo of the same student is not touched
  if (select keep_until from work_photos where id = v_p3) > now() + interval '7 days 1 minute'
     or (select keep_until from work_photos where id = v_p3) < now() + interval '6 days' then
    raise exception 'FAIL B4: an unattached photo''s clock moved';
  end if;
  n := n + 1;

  -- B5 the same photos again is NOT stale (a re-check to retry other
  -- questions must not cry wolf); different photos ARE, for the teacher and
  -- for the student's released feedback (MS-18)
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  perform record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p1)))),
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  if (select stale from get_my_released_feedback(v_act) where block_id = v_pb) then
    raise exception 'FAIL B5: same photos read as stale for the student';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if (select stale from list_grading_queue(v_act) q where q.block_id = v_pb) then
    raise exception 'FAIL B5: same photos read as stale';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  perform record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(
      jsonb_build_object('id', v_p2), jsonb_build_object('id', v_p1)))),
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  if not (select stale from get_my_released_feedback(v_act) where block_id = v_pb) then
    raise exception 'FAIL B5: new photos not stale for the student';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if not (select stale from list_grading_queue(v_act) q where q.block_id = v_pb) then
    raise exception 'FAIL B5: new photos not stale for the teacher';
  end if;
  n := n + 1;

  -- B5b a photo the sweep removed comes back on a re-check as {id, removed}
  -- (0094): that is not a change the student made, so not stale. Grade the
  -- current check first, then remove p1 and re-check with the same ids.
  select check_id into v_c2 from list_grading_queue(v_act) q where q.block_id = v_pb;
  perform upsert_check_grade(v_c2, v_pb,
    jsonb_build_array(jsonb_build_object('criterionId', 'c1', 'earned', 1)), null);
  perform release_check_grades(v_act, v_s);
  delete from work_photos where id = v_p1;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  perform record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(
      jsonb_build_object('id', v_p2), jsonb_build_object('id', v_p1)))),
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  if (select responses->'photos'->v_pb::text->1->>'removed' from section_checks
        where student_id = v_s and activity_id = v_act order by attempt_number desc limit 1) is distinct from 'true' then
    raise exception 'FAIL B5b setup: the trigger did not mark p1 removed';
  end if;
  if (select stale from get_my_released_feedback(v_act) where block_id = v_pb) then
    raise exception 'FAIL B5b: a removed flag read as stale for the student';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if (select stale from list_grading_queue(v_act) q where q.block_id = v_pb) then
    raise exception 'FAIL B5b: a removed flag read as stale for the teacher';
  end if;
  n := n + 1;

  -- B6 why a photo cannot be shown: ok, changed after hand-in, removed
  update storage.objects set version = gen_random_uuid()::text
   where bucket_id = 'student-work' and name = (select object_name from work_photos where id = v_p2);
  select jsonb_object_agg(photo_id::text, state) into v_j
    from work_photo_states(v_act, array[v_p1, v_p2, gen_random_uuid(), v_px]);
  -- v_px is a REAL photo of this student on another activity: it must read as
  -- removed (absent), never ok — the activity join is the leak guard.
  if v_j->>v_p1::text <> 'removed' or v_j->>v_p2::text <> 'changed' or v_j->>v_px::text <> 'removed'
     or (select count(*) from jsonb_object_keys(v_j)) <> 4 then
    raise exception 'FAIL B6: %', v_j;
  end if;
  -- the current photo reads ok
  update work_photos w set attached_object_version = (select o.version from storage.objects o
     where o.bucket_id = 'student-work' and o.name = w.object_name) where id = v_p2;
  if (select state from work_photo_states(v_act, array[v_p2])) <> 'ok' then raise exception 'FAIL B6: ok'; end if;
  n := n + 1;

  -- B7 nobody but the activity's editor may ask
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2)::text, true);
  v_got := null;
  begin perform work_photo_states(v_act, array[v_p2]); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your activity' then raise exception 'FAIL B7 teacher: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform work_photo_states(v_act, array[v_p2]); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your activity' then raise exception 'FAIL B7 student: %', v_got; end if;
  n := n + 1;

  -- B8 a short answer is still graded through the real RPC, and a block that
  -- is not hand-graded is still refused
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  perform record_check(v_s, v_act, v_ver, 's2',
    jsonb_build_object('freeText', jsonb_build_object(v_sb::text, 'because')),
    jsonb_build_object(v_sb::text, jsonb_build_object('verdict', 'recorded')));
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  select check_id into v_c4 from list_grading_queue(v_act) q where q.block_id = v_sb;
  if v_c4 is null or (select response_text from list_grading_queue(v_act) q where q.block_id = v_sb) <> 'because'
     or (select response_photos from list_grading_queue(v_act) q where q.block_id = v_sb) is not null then
    raise exception 'FAIL B8: the short answer is not in the queue as text';
  end if;
  perform upsert_check_grade(v_c4, v_sb, jsonb_build_array(jsonb_build_object('criterionId', 'k1', 'earned', 1)), null);
  if not (select graded from list_grading_queue(v_act) q where q.block_id = v_sb) then
    raise exception 'FAIL B8: the short answer did not grade';
  end if;
  n := n + 1;

  -- B9 the release clock covers every handed-in photo of the question that a
  -- release came after (a photo replaced before grading included), and never
  -- one handed in AFTER the release
  v_p4 := gen_random_uuid(); v_p5 := gen_random_uuid(); v_p6 := gen_random_uuid();
  insert into work_photos (id, student_id, activity_id, activity_version_id, block_id, keep_until, attached_at)
  values (v_p4, v_s, v_act, v_ver, v_pb, now() + interval '300 days', now() - interval '3 days'),  -- superseded before grading
         (v_p6, v_s, v_act, v_ver, v_pb, now() + interval '300 days', now() + interval '1 hour'); -- handed in after the release
  update check_grades set released_at = now() - interval '1 day'
   where check_id in (select id from section_checks where student_id = v_s and activity_id = v_act);
  perform release_check_grades(v_act, v_s);
  if (select keep_until from work_photos where id = v_p4) > now() + interval '30 days' then
    raise exception 'FAIL B9: a superseded photo kept its school-year clock';
  end if;
  if (select keep_until from work_photos where id = v_p6) < now() + interval '299 days' then
    raise exception 'FAIL B9: a photo handed in after the release was capped by it';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0096 B: % checks passed', n;
end;
$vfy$;
