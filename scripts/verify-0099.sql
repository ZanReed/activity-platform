-- verify-0099.sql — photo answers for pilot teachers only (migration 0099;
-- author ruling 2026-11-19). Run with
-- `pnpm verify:auth --target live|local --only verify-0099`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block, so
-- nothing persists (P7) — photo_clearance included: it is flipped inside the
-- block and the rollback restores it.

-- @section A-posture
-- @expect-rows
select 'pilot_flag_defaults_off',
       exists (select 1 from information_schema.columns
                where table_schema = 'public' and table_name = 'users' and column_name = 'photo_pilot'
                  and is_nullable = 'NO' and column_default = 'false'),
       'users.photo_pilot exists, NOT NULL, default false';
select 'pilot_flag_guarded',
       exists (select 1 from pg_trigger where tgrelid = 'public.users'::regclass
                and tgname = 'users_photo_pilot_guard' and not tgisinternal),
       'users_photo_pilot_guard refuses a client change to photo_pilot';
select 'rule_is_server_only',
       not has_function_privilege('authenticated', 'public.photos_allowed_for(uuid)', 'execute')
       and not has_function_privilege('anon', 'public.photos_allowed_for(uuid)', 'execute')
       and has_function_privilege('authenticated', 'public.photo_answers_on(uuid)', 'execute')
       and not has_function_privilege('anon', 'public.photo_answers_on(uuid)', 'execute'),
       'photos_allowed_for is called only inside definer functions; photo_answers_on(uuid) is signed-in only';
-- The guard is bound to the DEPLOYED definitions: no gate may read the bare
-- switch any more, or a non-pilot teacher's students could add photos.
select 'no_gate_reads_the_bare_switch',
       coalesce(array_agg(p.proname::text || '(' || pg_get_function_identity_arguments(p.oid) || ')' order by p.proname)
                  filter (where not (p.proname = 'photos_allowed_for'
                                     or (p.proname = 'photo_answers_on' and p.pronargs = 0))), '{}') = '{}',
       'only photos_allowed_for and the zero-argument photo_answers_on read photo_clearance'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and pg_get_functiondef(p.oid) ~ 'photo_clearance';
select 'every_gate_asks_the_rule',
       pg_get_functiondef('public.work_photo_reserved(text)'::regprocedure) ~ 'photos_allowed_for'
       and pg_get_functiondef('public.photo_block_gate(uuid, uuid, uuid, uuid)'::regprocedure) ~ 'photos_allowed_for'
       and pg_get_functiondef('public.section_checks_attach_photos()'::regprocedure) ~ 'photos_allowed_for'
       and pg_get_functiondef('public.activity_progress(uuid)'::regprocedure) ~ 'photos_allowed_for'
       and pg_get_functiondef('public.class_progress(uuid)'::regprocedure) ~ 'photos_allowed_for'
       and pg_get_functiondef('public.list_grading_queue(uuid)'::regprocedure) ~ 'photos_allowed_for'
       and pg_get_functiondef('public.class_student_work(uuid, uuid, uuid)'::regprocedure) ~ 'photos_allowed_for',
       'the upload policy, the shared gate, the hand-in trigger and every to-grade reader ask photos_allowed_for';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_p    uuid := gen_random_uuid();   -- a pilot teacher
  v_n    uuid := gen_random_uuid();   -- a non-pilot teacher (e.g. a Bank copier)
  v_s    uuid := gen_random_uuid();
  v_actp uuid;  v_verp uuid;
  v_actn uuid;  v_vern uuid;
  v_cls  uuid;
  v_pb   uuid := gen_random_uuid();
  v_got  text;
  v_id   uuid;
  v_j    jsonb;
  v_blocked boolean := false;
  n      integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0099-' || o || '@vfy0099.example', '{}'::jsonb
    from unnest(array[v_p, v_n, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_p, v_n);
  update users set role = 'student' where id = v_s;
  update users set photo_pilot = true where id = v_p;   -- the author's SQL

  -- The same photo question in a pilot's activity and in a non-pilot's copy.
  insert into activities (owner_id, title, slug, status) values (v_p, 'vfy 0099 p', 'vfy-0099-p', 'published') returning id into v_actp;
  insert into activities (owner_id, title, slug, status) values (v_n, 'vfy 0099 n', 'vfy-0099-n', 'published') returning id into v_actn;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_actp, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_pb, 'type', 'photo_response', 'prompt', '[]'::jsonb))))))))), v_p)
  returning id into v_verp;
  insert into activity_versions (activity_id, version_num, content, created_by)
  select v_actn, 1, content, v_n from activity_versions where id = v_verp returning id into v_vern;
  update activities set current_version_id = v_verp where id = v_actp;
  update activities set current_version_id = v_vern where id = v_actn;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_p, 'vfy 0099', v_p, 'vfy', current_date + 200) returning id into v_cls;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_actp, v_p), (v_cls, v_actn, v_p);
  insert into class_members (class_id, student_id) values (v_cls, v_s);
  update photo_clearance set cleared = true;

  -- B1 a client cannot make themselves a pilot. Two layers refuse it: today
  -- EVERY client UPDATE on users dies on the users_update_self policy's own
  -- recursion ("infinite recursion detected in policy"), and behind that the
  -- users_photo_pilot_guard trigger refuses the column. Either refusal passes;
  -- what is asserted is the property: the flag did not move.
  perform set_config('request.jwt.claims', json_build_object('sub', v_n, 'role', 'authenticated')::text, true);
  begin
    execute 'set local role authenticated';
    update users set photo_pilot = true where id = v_n;
  exception when others then
    v_blocked := sqlerrm like '%photo_pilot is not client-writable%'
              or sqlerrm like '%infinite recursion detected in policy%';
  end;
  execute 'reset role';
  if not v_blocked or (select photo_pilot from users where id = v_n) then
    raise exception 'FAIL B1: a client set its own photo_pilot (blocked=%)', v_blocked;
  end if;
  n := n + 1;

  -- B2 with the switch on: the pilot's activity takes photos, the non-pilot's
  -- copy refuses at reservation, and the display read says so
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_id := reserve_work_photo(v_actp, v_verp, v_pb);
  if v_id is null then raise exception 'FAIL B2: the pilot activity refused a photo'; end if;
  v_got := null;
  begin perform reserve_work_photo(v_actn, v_vern, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B2: non-pilot copy reserved (%)', v_got; end if;
  if not photo_answers_on(v_actp) or photo_answers_on(v_actn) then
    raise exception 'FAIL B2: display read pilot=% nonpilot=%', photo_answers_on(v_actp), photo_answers_on(v_actn);
  end if;
  n := n + 1;

  -- B3 the phone handoff refuses the non-pilot copy too (the shared gate)
  v_got := null;
  begin perform start_photo_handoff(v_actn, v_vern, v_pb, 1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B3: handoff on a non-pilot copy (%)', v_got; end if;
  n := n + 1;

  -- B4 the Storage upload policy: a reservation on the pilot activity is open,
  -- and closes the moment the owner stops being a pilot
  if not work_photo_reserved((select object_name from work_photos where id = v_id)) then
    raise exception 'FAIL B4: the pilot reservation is not open';
  end if;
  update users set photo_pilot = false where id = v_p;
  if work_photo_reserved((select object_name from work_photos where id = v_id)) then
    raise exception 'FAIL B4: the reservation stayed open after the pilot ended';
  end if;
  update users set photo_pilot = true where id = v_p;
  n := n + 1;

  -- B5 handing in: a check on the pilot activity attaches the photo; the same
  -- refs on the non-pilot copy are refused (as the switch being off is)
  insert into storage.objects (bucket_id, name, owner_id, version)
  select 'student-work', object_name, v_s::text, gen_random_uuid()::text from work_photos where id = v_id;
  v_j := record_check(v_s, v_actp, v_verp, 's1',
    jsonb_build_object('photos', jsonb_build_object(v_pb::text, jsonb_build_array(jsonb_build_object('id', v_id)))),
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  if (select attached_at from work_photos where id = v_id) is null then raise exception 'FAIL B5: not attached'; end if;
  n := n + 1;

  -- B6 not owed for the non-pilot teacher: an empty photo answer on their copy
  -- is never "to grade", even with the global switch on (0097 per activity)
  perform record_check(v_s, v_actn, v_vern, 's1', '{}'::jsonb,
    jsonb_build_object(v_pb::text, jsonb_build_object('verdict', 'recorded')));
  perform set_config('request.jwt.claims', json_build_object('sub', v_n)::text, true);
  if exists (select 1 from list_grading_queue(v_actn) q where q.block_id = v_pb) then
    raise exception 'FAIL B6: the non-pilot copy queues an empty photo answer';
  end if;
  n := n + 1;

  -- B7 the global switch is still the master: off, the pilot is off too
  update photo_clearance set cleared = false;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if photo_answers_on(v_actp) then raise exception 'FAIL B7: pilot on with the switch off'; end if;
  v_got := null;
  begin perform reserve_work_photo(v_actp, v_verp, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B7: reserved with the switch off (%)', v_got; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0099 B: % checks passed', n;
end;
$vfy$;
