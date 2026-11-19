-- verify-0095.sql — the phone QR handoff (migration 0095, media-submissions.md
-- §4.1, slice 2c). Run with `pnpm verify:auth --target live|local --only verify-0095`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block, so
-- nothing persists (P7). The Edge Function's HTTP half (the multipart upload,
-- the metadata strip, Storage) is verify-student-work-e2e.mjs's H rows.

-- @section A-posture
-- @expect-rows
select 'student_calls_definer_signed_in_only',
       count(*) = 3
       and bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'start_photo_handoff, photo_handoff_status, end_photo_handoff: DEFINER, search_path pinned, signed-in only'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('start_photo_handoff', 'photo_handoff_status', 'end_photo_handoff');
select 'function_calls_service_only',
       count(*) = 9
       and not bool_or(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(has_function_privilege('service_role', p.oid, 'execute')),
       'the code-bearing calls, the shared gate, reserve_photo_for and the prune: service role only (the phone has no session; a student must never reserve for another student)'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('handoff_peek', 'handoff_reserve', 'handoff_confirm', 'handoff_release',
                    'handoff_row_for', 'photo_block_gate', 'reserve_photo_for',
                    'photo_handoff_allowed', 'prune_photo_handoffs');
select 'table_closed_to_clients',
       (select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.photo_handoffs'::regclass)
       and not has_table_privilege('authenticated', 'public.photo_handoffs', 'select')
       and not has_table_privilege('anon', 'public.photo_handoffs', 'select')
       and not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'photo_handoffs'),
       'photo_handoffs: RLS forced, zero policies, no client grant';
select 'code_never_stored',
       not exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'photo_handoffs'
                      and column_name in ('code', 'code_text'))
       and exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'photo_handoffs'
                      and column_name = 'code_hash' and data_type = 'bytea'),
       'only the code''s sha256 is kept';
select 'one_gate_for_both_paths',
       pg_get_functiondef('public.reserve_work_photo(uuid, uuid, uuid)'::regprocedure) ilike '%reserve_photo_for(auth.uid()%''device''%'
       and pg_get_functiondef('public.handoff_reserve(text)'::regprocedure) ilike '%reserve_photo_for(%''handoff''%',
       'a device upload and a phone upload pass the same reservation gate';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
-- SCHEDULED by 0095 itself (author's yes, 2026-11-18): exactly one nightly
-- job, the real run, at 03:50 UTC. It removes codes, never photos.
select 'prune_is_scheduled_nightly',
       (select count(*) from cron.job where command ilike '%prune_photo_handoffs%') = 1
       and exists (select 1 from cron.job
                    where jobname = 'prune-photo-handoffs' and schedule = '50 3 * * *'
                      and command = 'select prune_photo_handoffs(false);' and active),
       'one nightly job runs prune_photo_handoffs(false) at 03:50 UTC';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t     uuid := gen_random_uuid();   -- the teacher who owns the activities
  v_s     uuid := gen_random_uuid();   -- the student, in a class holding both
  v_s2    uuid := gen_random_uuid();   -- another student in the same class
  v_act   uuid;
  v_ver   uuid;
  v_quiz  uuid;                        -- a quiz activity
  v_qver  uuid;
  v_cls   uuid;
  v_pb    uuid := gen_random_uuid();   -- a photo block, maxPhotos 2
  v_qb    uuid := gen_random_uuid();   -- the quiz's photo block
  v_r     jsonb;
  v_r2    jsonb;
  v_code  text;
  v_id    uuid;
  v_p1    uuid;
  v_p2    uuid;
  v_got   text;
  v_n     integer;
  n       integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0095-' || o || '@vfy0095.example', '{}'::jsonb
    from unnest(array[v_t, v_s, v_s2]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  -- 0099: photo answers are for pilot teachers; the fixture teacher is one.
  update users set photo_pilot = true where id = v_t;
  update users set role = 'student' where id in (v_s, v_s2);

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0095', 'vfy-0095', 'published') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, jsonb_build_object(
            'meta', jsonb_build_object('title', 'Linear equations'),
            'sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_pb, 'type', 'photo_response', 'maxPhotos', 2,
                  'prompt', '[{"type":"paragraph","content":[{"type":"text","text":"Solve "},{"type":"math","latex":"x"},{"type":"text","text":" and show working"}]}]'::jsonb))))))))),
          v_t)
  returning id into v_ver;
  update activities set current_version_id = v_ver where id = v_act;

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0095 quiz', 'vfy-0095-quiz', 'published') returning id into v_quiz;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_quiz, 1, jsonb_build_object(
            'meta', jsonb_build_object('title', 'Quiz', 'activityType', 'quiz'),
            'sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_qb, 'type', 'photo_response', 'prompt', '[]'::jsonb))))))))),
          v_t)
  returning id into v_qver;
  update activities set current_version_id = v_qver where id = v_quiz;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0095', v_t, 'vfy', current_date + 100) returning id into v_cls;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_act, v_t), (v_cls, v_quiz, v_t);
  insert into class_members (class_id, student_id) values (v_cls, v_s), (v_cls, v_s2);

  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);

  -- B1 the shared gate still refuses while photos are off, on both paths
  update photo_clearance set cleared = false;
  v_got := null;
  begin perform start_photo_handoff(v_act, v_ver, v_pb, 2); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B1 start: %', v_got; end if;
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B1 reserve: %', v_got; end if;
  update photo_clearance set cleared = true;
  n := n + 1;

  -- B2 a quiz refuses the phone (the author's ruling), but not Add a photo
  v_got := null;
  begin perform start_photo_handoff(v_quiz, v_qver, v_qb, 1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_not_here' then raise exception 'FAIL B2: %', v_got; end if;
  perform reserve_work_photo(v_quiz, v_qver, v_qb);
  n := n + 1;

  -- B3 start returns a 43-character code, stores only its hash, clamps slots
  v_r := start_photo_handoff(v_act, v_ver, v_pb, 9);
  v_code := v_r->>'code';
  v_id := (v_r->>'id')::uuid;
  if length(v_code) <> 43 or v_code !~ '^[A-Za-z0-9_-]+$' then raise exception 'FAIL B3: code %', v_code; end if;
  if (v_r->>'slots')::int <> 2 then raise exception 'FAIL B3: slots % (max is 2)', v_r->>'slots'; end if;
  if (select code_hash from photo_handoffs where id = v_id) <> sha256(convert_to(v_code, 'UTF8')) then
    raise exception 'FAIL B3: hash';
  end if;
  if (select expires_at from photo_handoffs where id = v_id) > now() + interval '10 minutes 1 second' then
    raise exception 'FAIL B3: lives longer than 10 minutes';
  end if;
  n := n + 1;

  -- B4 the peek shows the title and prompt text, nothing about the student
  v_r2 := handoff_peek(v_code);
  if v_r2->>'title' <> 'Linear equations' or v_r2->>'prompt' <> 'Solve  and show working'
     or (v_r2->>'slots_left')::int <> 2 then
    raise exception 'FAIL B4: %', v_r2;
  end if;
  if v_r2::text ilike '%' || v_s::text || '%' or v_r2::text ilike '%vfy0095-%' or v_r2 ? 'student_id' then
    raise exception 'FAIL B4: the peek names the student: %', v_r2;
  end if;
  v_got := null;
  begin perform handoff_peek('not-a-code'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_expired' then raise exception 'FAIL B4 bad code: %', v_got; end if;
  n := n + 1;

  -- B5 reserve makes the CODE'S student's photo, source handoff, and takes a slot;
  -- confirm needs the bytes, then the Chromebook's status shows the arrival
  v_r2 := handoff_reserve(v_code);
  v_p1 := (v_r2->>'photo_id')::uuid;
  if not exists (select 1 from work_photos where id = v_p1 and student_id = v_s and block_id = v_pb
                  and source = 'handoff' and attached_at is null
                  and object_name = v_r2->>'object_name') then
    raise exception 'FAIL B5: reservation %', v_r2;
  end if;
  if (select slots_left from photo_handoffs where id = v_id) <> 1 then raise exception 'FAIL B5: slot not taken'; end if;
  v_got := null;
  begin perform handoff_confirm(v_code, v_p1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_expired' then raise exception 'FAIL B5: confirmed with no bytes: %', v_got; end if;
  insert into storage.objects (bucket_id, name, owner_id, version)
  values ('student-work', v_r2->>'object_name', null, gen_random_uuid()::text);
  perform handoff_confirm(v_code, v_p1);
  perform handoff_confirm(v_code, v_p1); -- twice is once
  v_r2 := photo_handoff_status(v_id);
  if v_r2->'photos' <> jsonb_build_array(v_p1) or not (v_r2->>'live')::boolean then
    raise exception 'FAIL B5: status %', v_r2;
  end if;
  n := n + 1;

  -- B6 a failed upload gives the slot back and removes the reservation
  v_r2 := handoff_reserve(v_code);
  v_p2 := (v_r2->>'photo_id')::uuid;
  if (select slots_left from photo_handoffs where id = v_id) <> 0 then raise exception 'FAIL B6: slot'; end if;
  perform handoff_release(v_code, v_p2);
  if exists (select 1 from work_photos where id = v_p2) then raise exception 'FAIL B6: row kept'; end if;
  if (select slots_left from photo_handoffs where id = v_id) <> 1 then raise exception 'FAIL B6: slot not back'; end if;
  -- release cannot delete an ARRIVED photo
  perform handoff_release(v_code, v_p1);
  if not exists (select 1 from work_photos where id = v_p1) then raise exception 'FAIL B6: arrived photo deleted'; end if;
  n := n + 1;

  -- B7 the slots are a hard ceiling
  v_r2 := handoff_reserve(v_code);
  v_got := null;
  begin perform handoff_reserve(v_code); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_full' then raise exception 'FAIL B7: %', v_got; end if;
  n := n + 1;

  -- B8 another student cannot read or end this handoff
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_r2 := photo_handoff_status(v_id);
  if (v_r2->>'live')::boolean or jsonb_array_length(v_r2->'photos') <> 0 then
    raise exception 'FAIL B8: another student read it: %', v_r2;
  end if;
  perform end_photo_handoff(v_id);
  if (select ended_at from photo_handoffs where id = v_id) is not null then
    raise exception 'FAIL B8: another student ended it';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  n := n + 1;

  -- B9 the clearance and class are re-read at upload, not only at start
  v_r := start_photo_handoff(v_act, v_ver, v_pb, 2);
  if (select ended_at from photo_handoffs where id = v_id) is null then
    raise exception 'FAIL B9: the older code is still live after a new start';
  end if;
  v_got := null;
  begin perform handoff_peek(v_code); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_expired' then raise exception 'FAIL B9: old code still peeks: %', v_got; end if;
  v_code := v_r->>'code';
  v_id := (v_r->>'id')::uuid;
  update photo_clearance set cleared = false;
  v_got := null;
  begin perform handoff_reserve(v_code); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B9 off: %', v_got; end if;
  update photo_clearance set cleared = true;
  update class_members set removed_at = now() where student_id = v_s;
  v_got := null;
  begin perform handoff_reserve(v_code); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_in_class' then raise exception 'FAIL B9 class: %', v_got; end if;
  update class_members set removed_at = null where student_id = v_s;
  n := n + 1;

  -- B10 the mode is re-read at upload: a version republished as a quiz refuses
  update activity_versions set content = jsonb_set(content, '{meta,activityType}', '"exam"') where id = v_ver;
  v_got := null;
  begin perform handoff_reserve(v_code); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_not_here' then raise exception 'FAIL B10: %', v_got; end if;
  update activity_versions set content = content #- '{meta,activityType}' where id = v_ver;
  n := n + 1;

  -- B11 closing the panel revokes the code; an expired one is refused too
  perform end_photo_handoff(v_id);
  v_got := null;
  begin perform handoff_reserve(v_code); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_expired' then raise exception 'FAIL B11 ended: %', v_got; end if;
  v_r := start_photo_handoff(v_act, v_ver, v_pb, 1);
  update photo_handoffs set expires_at = now() - interval '1 second' where id = (v_r->>'id')::uuid;
  v_got := null;
  begin perform handoff_reserve(v_r->>'code'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_expired' then raise exception 'FAIL B11 expired: %', v_got; end if;
  n := n + 1;

  -- B12 the start cap bounds the table
  delete from photo_handoffs where student_id = v_s;
  insert into photo_handoffs (student_id, activity_id, activity_version_id, block_id, code_hash, slots_left, expires_at)
  select v_s, v_act, v_ver, v_pb, sha256(convert_to(g::text || 'vfy', 'UTF8')), 1, now()
    from generate_series(1, 20) g;
  v_got := null;
  begin perform start_photo_handoff(v_act, v_ver, v_pb, 1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'handoff_cap' then raise exception 'FAIL B12: %', v_got; end if;
  n := n + 1;

  -- B13 the prune removes rows a day past expiry and nothing else; dry-run by default
  update photo_handoffs set expires_at = now() - interval '25 hours'
   where student_id = v_s and code_hash = sha256(convert_to('1vfy', 'UTF8'));
  select count(*) into v_n from photo_handoffs where expires_at < now() - interval '1 day';
  if (prune_photo_handoffs()->>'handoffs')::int <> v_n or v_n < 1 then raise exception 'FAIL B13: dry count'; end if;
  if not exists (select 1 from photo_handoffs where code_hash = sha256(convert_to('1vfy', 'UTF8'))) then
    raise exception 'FAIL B13: the dry run deleted';
  end if;
  perform prune_photo_handoffs(false);
  if exists (select 1 from photo_handoffs where code_hash = sha256(convert_to('1vfy', 'UTF8'))) then
    raise exception 'FAIL B13: not pruned';
  end if;
  if (select count(*) from photo_handoffs where student_id = v_s) <> 19 then
    raise exception 'FAIL B13: pruned a live row';
  end if;
  if not exists (select 1 from work_photos where id = v_p1) then raise exception 'FAIL B13: a photo went with it'; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0095 B: % checks passed', n;
end;
$vfy$;
