-- verify-0094.sql — handing a photo in (migration 0094, media-submissions.md
-- slice 2). Run with `pnpm verify:auth --target live|local --only verify-0094`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block, so
-- nothing persists (P7). §B calls record_check itself: the trigger's refusals
-- and its attach are proved on the real write path, not on a copy of it.

-- @section A-posture
-- @expect-rows
select 'attach_trigger_enabled',
       exists (select 1 from pg_trigger t
                where t.tgrelid = 'public.section_checks'::regclass
                  and t.tgname = 'section_checks_attach_photos'
                  and t.tgenabled = 'O'
                  and (t.tgtype & 2) = 2      -- BEFORE
                  and (t.tgtype & 4) = 4),    -- INSERT
       'section_checks_attach_photos is a live BEFORE INSERT trigger on section_checks';
-- 0099 adds photo_answers_on(uuid) beside the zero-argument form: three rows.
select 'student_reads_definer_signed_in_only',
       count(*) = 3
       and bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'photo_answers_on (both forms), discard_work_photo: DEFINER, search_path pinned, signed-in only'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('photo_answers_on', 'discard_work_photo');
select 'discard_only_unattached',
       pg_get_functiondef('public.discard_work_photo(uuid)'::regprocedure) ilike '%attached_at is null%'
       and pg_get_functiondef('public.discard_work_photo(uuid)'::regprocedure) ilike '%student_id = auth.uid()%',
       'a student can discard only their own photo that no check has handed in';
select 'dol_optional_knows_photos',
       pg_get_functiondef('public.dol_optional_block(jsonb, text)'::regprocedure) ilike '%''photo_response''%',
       'the LIVE dol_optional_block counts a photo of working as gradable and optional-marked (MS-23)';
select 'teacher_read_bound_to_handed_in_version',
       exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
                and policyname = 'student_work_select_owner_or_grader' and cmd = 'SELECT'
                and qual ilike '%work_photo_readable(name, version)%')
       and pg_get_functiondef('public.work_photo_readable(text, text)'::regprocedure)
             ilike '%attached_object_version = p_version%'
       and not exists (select 1 from pg_proc where proname = 'work_photo_readable'
                        and pronamespace = 'public'::regnamespace and pronargs = 1),
       'a teacher reads a photo only while its bytes are the ones a check handed in (G18), and the one-argument helper is gone';
select 'record_check_still_service_only',
       not has_function_privilege('authenticated',
         'public.record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer, integer, integer, boolean, boolean)'::regprocedure,
         'execute'),
       'record_check accepts verdicts, so it stays service-role only (0020, 0070)';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t    uuid := gen_random_uuid();   -- the teacher who owns the activity
  v_s    uuid := gen_random_uuid();   -- the student, in a class holding the activity
  v_s2   uuid := gen_random_uuid();   -- another student in the same class
  v_act  uuid;
  v_ver  uuid;
  v_cls  uuid;
  v_pb   uuid := gen_random_uuid();   -- the photo_response block
  v_pb2  uuid := gen_random_uuid();   -- a second photo_response block
  v_p1   uuid;
  v_p2   uuid;
  v_p3   uuid;
  v_px   uuid;                        -- v_s2's photo
  v_keep timestamptz;
  v_got  text;
  v_r    jsonb;
  v_resp jsonb;
  v_ok   boolean;
  n      integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0094-' || o || '@vfy0094.example', '{}'::jsonb
    from unnest(array[v_t, v_s, v_s2]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  -- 0099: photo answers are for pilot teachers; the fixture teacher is one.
  update users set photo_pilot = true where id = v_t;
  update users set role = 'student' where id in (v_s, v_s2);

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0094', 'vfy-0094', 'published') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_pb, 'type', 'photo_response', 'maxPhotos', 3, 'prompt', '[]'::jsonb),
                jsonb_build_object('id', v_pb2, 'type', 'photo_response', 'prompt', '[]'::jsonb))))))))),
          v_t)
  returning id into v_ver;
  update activities set current_version_id = v_ver where id = v_act;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0094', v_t, 'vfy', current_date + 100) returning id into v_cls;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_act, v_t);
  insert into class_members (class_id, student_id) values (v_cls, v_s), (v_cls, v_s2);

  update photo_clearance set cleared = true;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_p1 := reserve_work_photo(v_act, v_ver, v_pb);
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  v_p3 := reserve_work_photo(v_act, v_ver, v_pb2);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_px := reserve_work_photo(v_act, v_ver, v_pb);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);

  -- B1 the display read follows the switch
  if not photo_answers_on() then raise exception 'FAIL B1: on reads false'; end if;
  update photo_clearance set cleared = false;
  if photo_answers_on() then raise exception 'FAIL B1: off reads true'; end if;
  n := n + 1;

  -- B2 while the switch is off, no check may carry a photo (the G17 half: an
  -- upload that landed through a URL signed earlier is still not handed in)
  -- (each with a version, as Storage writes one on every upload: the teacher's
  -- read compares it with the one recorded at hand-in)
  insert into storage.objects (bucket_id, name, owner_id, version)
  select 'student-work', object_name, v_s::text, gen_random_uuid()::text from work_photos where id in (v_p1, v_p3, v_px);
  v_got := null;
  begin
    perform record_check(v_s, v_act, v_ver, 's1',
      jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p1)))),
      '{}'::jsonb);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B2: %', v_got; end if;
  if (select attached_at from work_photos where id = v_p1) is not null then
    raise exception 'FAIL B2: attached while off';
  end if;
  -- a check with an empty photos map, or none, still records while off
  perform record_check(v_s, v_act, v_ver, 's1', '{"freeText": {}}'::jsonb, '{}'::jsonb);
  perform record_check(v_s, v_act, v_ver, 's1', '{"photos": {}}'::jsonb, '{}'::jsonb);
  n := n + 1;

  update photo_clearance set cleared = true;

  -- B3 a reserved photo whose bytes never arrived is refused
  v_got := null;
  begin
    perform record_check(v_s, v_act, v_ver, 's1',
      jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p2)))),
      '{}'::jsonb);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photo_not_uploaded' then raise exception 'FAIL B3: %', v_got; end if;
  n := n + 1;

  -- B4 tampering: another student's photo; my photo under the wrong block
  v_got := null;
  begin
    perform record_check(v_s, v_act, v_ver, 's1',
      jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_px)))),
      '{}'::jsonb);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photo_not_yours' then raise exception 'FAIL B4 other student: %', v_got; end if;
  v_got := null;
  begin
    perform record_check(v_s, v_act, v_ver, 's1',
      jsonb_build_object('photos', jsonb_build_object(v_pb2::text, jsonb_build_array(jsonb_build_object('id', v_p1)))),
      '{}'::jsonb);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photo_not_yours' then raise exception 'FAIL B4 wrong block: %', v_got; end if;
  n := n + 1;

  -- B5 malformed maps and a repeated id are refused
  v_got := null;
  begin perform record_check(v_s, v_act, v_ver, 's1', '{"photos": []}'::jsonb, '{}'::jsonb);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'bad_photos' then raise exception 'FAIL B5 array map: %', v_got; end if;
  v_got := null;
  begin perform record_check(v_s, v_act, v_ver, 's1',
      jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', 'not-a-uuid')))),
      '{}'::jsonb);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'bad_photos' then raise exception 'FAIL B5 bad id: %', v_got; end if;
  v_got := null;
  begin perform record_check(v_s, v_act, v_ver, 's1',
      -- (inside one block: across two blocks, jsonb's key order decides whether
      -- the repeat or the wrong-block refusal fires first; either refuses)
      jsonb_build_object('photos', jsonb_build_object(
        v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p1), jsonb_build_object('id', v_p1)))),
      '{}'::jsonb);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'bad_photos' then raise exception 'FAIL B5 repeated id: %', v_got; end if;
  n := n + 1;

  -- B6 the hand-in: both uploaded photos attach, on the school-year ceiling
  -- (ends_on + 30 = today + 130, inside the 400-day cap), and the stored refs
  -- are normalized (the client's extra field does not survive)
  v_r := record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(
      v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p1, 'name', 'IMG_0042.jpg')),
      v_pb2::text, jsonb_build_array(jsonb_build_object('id', v_p3)))),
    '{}'::jsonb);
  if (select count(*) from work_photos
       where id in (v_p1, v_p3) and attached_at is not null
         and keep_until = (current_date + 130)::timestamptz) <> 2 then
    raise exception 'FAIL B6: attach %', (select jsonb_agg(jsonb_build_object('a', attached_at, 'k', keep_until))
                                           from work_photos where id in (v_p1, v_p3));
  end if;
  select responses into v_resp from section_checks where id = (v_r ->> 'check_id')::uuid;
  if v_resp -> 'photos' -> v_pb::text <> jsonb_build_array(jsonb_build_object('id', v_p1)) then
    raise exception 'FAIL B6: stored refs %', v_resp -> 'photos';
  end if;
  if (select w.attached_object_version is distinct from o.version
        from work_photos w join storage.objects o on o.bucket_id = 'student-work' and o.name = w.object_name
       where w.id = v_p1) then
    raise exception 'FAIL B6: the handed-in version was not recorded';
  end if;
  n := n + 1;

  -- B6b bytes replaced after hand-in (G18's write) never reach the teacher;
  -- the student still reads their own object
  update storage.objects set version = gen_random_uuid()::text
   where bucket_id = 'student-work' and name = (select object_name from work_photos where id = v_p1);
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if exists (select 1 from storage.objects o
              where o.bucket_id = 'student-work' and o.name = (select object_name from work_photos where id = v_p3)
                and not work_photo_readable(o.name, o.version)) then
    raise exception 'FAIL B6b: the teacher cannot read an unchanged handed-in photo';
  end if;
  if exists (select 1 from storage.objects o
              where o.bucket_id = 'student-work' and o.name = (select object_name from work_photos where id = v_p1)
                and work_photo_readable(o.name, o.version)) then
    raise exception 'FAIL B6b: the teacher can read a photo replaced after hand-in';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if not exists (select 1 from storage.objects o
                  where o.bucket_id = 'student-work' and o.name = (select object_name from work_photos where id = v_p1)
                    and work_photo_readable(o.name, o.version)) then
    raise exception 'FAIL B6b: the student cannot read their own photo';
  end if;
  n := n + 1;

  -- B7 a re-check that hands the same photo in again never extends its clock
  update work_photos set keep_until = now() + interval '5 days' where id = v_p1;
  select keep_until into v_keep from work_photos where id = v_p1;
  perform record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p1)))),
    '{}'::jsonb);
  if (select keep_until from work_photos where id = v_p1) <> v_keep then
    raise exception 'FAIL B7: re-check moved the clock';
  end if;
  n := n + 1;

  -- B8 removed by retention: no row, or an unattached row past its 7 days, is
  -- stored as removed and the check proceeds; the expired row is NOT rescued
  update work_photos set keep_until = now() - interval '1 second' where id = v_p2;
  insert into storage.objects (bucket_id, name, owner_id)
  select 'student-work', object_name, v_s::text from work_photos where id = v_p2;
  v_r := record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(
      jsonb_build_object('id', v_p2), jsonb_build_object('id', gen_random_uuid())))),
    '{}'::jsonb);
  select responses into v_resp from section_checks where id = (v_r ->> 'check_id')::uuid;
  if (select count(*) from jsonb_array_elements(v_resp -> 'photos' -> v_pb::text) e
       where (e ->> 'removed')::boolean) <> 2 then
    raise exception 'FAIL B8: stored %', v_resp -> 'photos';
  end if;
  if (select attached_at from work_photos where id = v_p2) is not null then
    raise exception 'FAIL B8: an expired reservation was rescued by a check';
  end if;
  n := n + 1;

  -- B9 the clock's floor and fallback: a class past its year-end + 30 still
  -- gives 30 days; no year-end at all gives 400
  update classes set school_year_ends_on = current_date - 60 where id = v_cls;
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  insert into storage.objects (bucket_id, name, owner_id)
  select 'student-work', object_name, v_s::text from work_photos where id = v_p2;
  perform record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p2)))),
    '{}'::jsonb);
  if (select keep_until from work_photos where id = v_p2)
       not between now() + interval '29 days 23 hours' and now() + interval '30 days 1 minute' then
    raise exception 'FAIL B9 floor: %', (select keep_until from work_photos where id = v_p2);
  end if;
  update classes set school_year_ends_on = null where id = v_cls;
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  insert into storage.objects (bucket_id, name, owner_id)
  select 'student-work', object_name, v_s::text from work_photos where id = v_p2;
  perform record_check(v_s, v_act, v_ver, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_p2)))),
    '{}'::jsonb);
  if (select keep_until from work_photos where id = v_p2)
       not between now() + interval '399 days 23 hours' and now() + interval '400 days 1 minute' then
    raise exception 'FAIL B9 fallback: %', (select keep_until from work_photos where id = v_p2);
  end if;
  n := n + 1;

  -- B10 Remove before a check: my own unattached photo goes (and its bytes are
  -- queued); an attached one, or another student's, does not
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  -- (each call is its own statement: a volatile function's delete is not
  -- visible to a sibling subquery of the same statement)
  v_ok := discard_work_photo(v_p2);
  if not v_ok or exists (select 1 from work_photos where id = v_p2) then
    raise exception 'FAIL B10: own unattached photo not discarded';
  end if;
  if not exists (select 1 from work_photo_deletions d
                  where d.object_name = v_act || '/' || v_s || '/' || v_p2 || '.jpg') then
    raise exception 'FAIL B10: discarded bytes not queued';
  end if;
  v_ok := discard_work_photo(v_p1);
  if v_ok or not exists (select 1 from work_photos where id = v_p1) then
    raise exception 'FAIL B10: an attached photo was discarded';
  end if;
  v_ok := discard_work_photo(v_px);
  if v_ok or not exists (select 1 from work_photos where id = v_px) then
    raise exception 'FAIL B10: another student''s photo was discarded';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0094 B: % checks passed', n;
end;
$vfy$;
