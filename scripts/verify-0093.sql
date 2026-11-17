-- verify-0093.sql — students' photos of their working: storage and record
-- (migration 0093, docs/design/media-submissions.md slice 1). Run with
-- `pnpm verify:auth --target live|local --only verify-0093`. §A reads the
-- catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block, so nothing
-- persists (P7). §B proves the RLS predicates by direct INSERT/SELECT on
-- storage.objects, which bypasses the Storage API — the API half (that the
-- bytes really leave) is scripts/verify-student-work-e2e.mjs.

-- @section A-posture
-- @expect-rows
select 'bucket_private_jpeg_only',
       exists (select 1 from storage.buckets
                where id = 'student-work' and not public
                  and file_size_limit = 1572864
                  and allowed_mime_types = array['image/jpeg']::text[]),
       'student-work: private, 1.5 MB, image/jpeg only';
-- Fails while the switch is on. REMOVE this row on purpose when the slice-5
-- checklist is done and the author turns photos on (the verify-0078 pattern).
select 'photo_clearance_off',
       not coalesce((select cleared from photo_clearance), false),
       'photo_clearance is OFF (slice 5 turns it on, after Q14, the plan move and the armed sweep)';
select 'tables_closed_to_clients',
       (select bool_and(relrowsecurity and relforcerowsecurity) from pg_class
         where relname in ('work_photos', 'work_photo_deletions', 'photo_clearance')
           and relnamespace = 'public'::regnamespace)
       and not has_table_privilege('authenticated', 'work_photos', 'select')
       and not has_table_privilege('authenticated', 'work_photos', 'insert')
       and not has_table_privilege('authenticated', 'work_photo_deletions', 'select')
       and not has_table_privilege('authenticated', 'photo_clearance', 'update')
       and not has_table_privilege('anon', 'work_photos', 'select'),
       'work_photos, work_photo_deletions, photo_clearance: RLS forced, no client grant';
select 'client_functions_definer_signed_in_only',
       count(*) = 3
       and bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'reserve_work_photo, work_photo_reserved, work_photo_readable: DEFINER, search_path pinned, signed-in only'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('reserve_work_photo', 'work_photo_reserved', 'work_photo_readable');
select 'sweep_functions_service_only',
       count(*) = 5
       and bool_and(p.prosecdef)
       and not bool_or(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(has_function_privilege('service_role', p.oid, 'execute')),
       'the sweep''s five functions and the cost meter: DEFINER, service_role only'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('sweep_work_photos_due', 'work_photo_deletion_batch',
                    'work_photo_deletions_done', 'work_photo_orphans', 'work_photo_usage');
select 'sweep_dry_run_by_default',
       (select pg_get_function_arguments(oid) from pg_proc
         where proname = 'sweep_work_photos_due' and pronamespace = 'public'::regnamespace)
         = 'p_dry_run boolean DEFAULT true',
       'sweep_work_photos_due removes nothing unless told to';
select 'storage_policies_insert_and_select_only',
       (select count(*) from pg_policies
         where schemaname = 'storage' and tablename = 'objects'
           and (qual ilike '%student-work%' or with_check ilike '%student-work%')) = 2
       and exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
                    and policyname = 'student_work_insert_reserved' and cmd = 'INSERT'
                    and with_check ilike '%work_photo_reserved(name)%')
       and exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
                    and policyname = 'student_work_select_owner_or_grader' and cmd = 'SELECT'
                    and qual ilike '%work_photo_readable(name)%')
       and not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
                        and cmd in ('UPDATE', 'DELETE', 'ALL')
                        and (coalesce(qual, '') ilike '%student-work%'
                             or coalesce(with_check, '') ilike '%student-work%')),
       'student-work has exactly an INSERT (reservation) and a SELECT (owner/grader) policy; no UPDATE, no DELETE';
select 'readable_never_uses_can_read_activity',
       pg_get_functiondef('public.work_photo_readable(text)'::regprocedure) not ilike '%can_read_activity%'
       and pg_get_functiondef('public.work_photo_readable(text)'::regprocedure) ilike '%can_edit_activity%',
       'the teacher branch is can_edit_activity, never the widenable read helper (0034 G3)';
-- The retention alarm (Fable review 2026-11-18): retention rests on a nightly
-- job, so a broken job must turn a row red rather than go unseen. Green
-- whenever the sweep is keeping up (and trivially before any photo exists).
select 'photos_not_overdue',
       not exists (select 1 from work_photos where keep_until < now() - interval '1 day')
       and not exists (select 1 from work_photo_deletions where queued_at < now() - interval '2 days'),
       'no photo row is a day past its keep_until, and no queued byte-deletion is two days old';
select 'every_fk_cascades',
       (select count(*) from pg_constraint
         where conrelid = 'public.work_photos'::regclass and contype = 'f' and confdeltype = 'c') = 3,
       'work_photos -> users, activities, activity_versions are all ON DELETE CASCADE (the purge deletes versions first)';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
-- Replaced by a schedule pin when the author arms the sweep (slice 5).
select 'sweep_is_unscheduled',
       not exists (select 1 from cron.job
                    where command ilike '%sweep-work-photos%' or command ilike '%sweep_work_photos%'),
       'NOT ARMED: no cron job calls the sweep yet';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t    uuid := gen_random_uuid();   -- teacher who owns the activity
  v_t2   uuid := gen_random_uuid();   -- another teacher
  v_s    uuid := gen_random_uuid();   -- the student, in a class holding the activity
  v_s2   uuid := gen_random_uuid();   -- a student in no such class
  v_s3   uuid := gen_random_uuid();   -- a student removed from the class
  v_act  uuid;
  v_ver  uuid;
  v_ver2 uuid;                        -- a second version, deleted in B8
  v_cls  uuid;
  v_pb   uuid := gen_random_uuid();   -- the photo_response block (maxPhotos 2)
  v_sa   uuid := gen_random_uuid();   -- a short_answer block
  v_p1   uuid;
  v_p2   uuid;
  v_name text;
  v_name2 text;
  v_got  text;
  v_ok   boolean;
  v_r    jsonb;
  i      integer;
  n      integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0093-' || o || '@vfy0093.example', '{}'::jsonb
    from unnest(array[v_t, v_t2, v_s, v_s2, v_s3]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_t2);
  update users set role = 'student' where id in (v_s, v_s2, v_s3);

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0093', 'vfy-0093', 'published') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_pb, 'type', 'photo_response', 'maxPhotos', 2, 'prompt', '[]'::jsonb),
                jsonb_build_object('id', v_sa, 'type', 'short_answer', 'prompt', '[]'::jsonb))))))))),
          v_t)
  returning id into v_ver;
  insert into activity_versions (activity_id, version_num, content, created_by)
  select v_act, 2, content, v_t from activity_versions where id = v_ver
  returning id into v_ver2;
  update activities set current_version_id = v_ver where id = v_act;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0093', v_t, 'vfy') returning id into v_cls;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_act, v_t);
  insert into class_members (class_id, student_id) values (v_cls, v_s);
  insert into class_members (class_id, student_id, removed_at) values (v_cls, v_s3, now());

  -- B1 the switch is off: nobody can reserve, whoever they are
  update photo_clearance set cleared = false;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photos_off' then raise exception 'FAIL B1: %', v_got; end if;
  n := n + 1;

  update photo_clearance set cleared = true;

  -- B2 refusals: a teacher, a student in no class, a removed member, a block
  -- that is not a photo block, an unknown block, a version of another activity
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_a_student' then raise exception 'FAIL B2 teacher: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_in_class' then raise exception 'FAIL B2 no class: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s3)::text, true);
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_in_class' then raise exception 'FAIL B2 removed: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, v_sa); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_available' then raise exception 'FAIL B2 short_answer: %', v_got; end if;
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, gen_random_uuid()); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_available' then raise exception 'FAIL B2 unknown block: %', v_got; end if;
  v_got := null;
  begin perform reserve_work_photo(gen_random_uuid(), v_ver, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_available' then raise exception 'FAIL B2 foreign version: %', v_got; end if;
  n := n + 1;

  -- B3 a member reserves; the row is the caller's, 7 days, key derived
  v_p1 := reserve_work_photo(v_act, v_ver, v_pb);
  select object_name into v_name from work_photos
   where id = v_p1 and student_id = v_s and attached_at is null
     and keep_until between now() + interval '6 days 23 hours' and now() + interval '7 days 1 minute';
  if v_name is distinct from v_act || '/' || v_s || '/' || v_p1 || '.jpg' then
    raise exception 'FAIL B3: reservation row %', v_name;
  end if;
  n := n + 1;

  -- B4 the per-block cap is maxPhotos x 3 = 6 live reservations
  for i in 2..6 loop
    v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  end loop;
  v_got := null;
  begin perform reserve_work_photo(v_act, v_ver, v_pb); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'photo_cap' then raise exception 'FAIL B4: 7th reservation %', v_got; end if;
  -- a handed-in photo frees its slot (the cap counts unattached photos only)
  update work_photos set attached_at = now() where id = v_p2;
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  -- an expired reservation frees its slot
  update work_photos set keep_until = now() - interval '1 second' where id = v_p2;
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  select object_name into v_name2 from work_photos where id = v_p2;
  n := n + 1;

  -- B5 the INSERT policy, as the authenticated role: the caller's own open
  -- reservation goes in; nothing else does
  execute 'set local role authenticated';
  begin
    insert into storage.objects (bucket_id, name, owner_id) values ('student-work', v_name, v_s::text);
  exception when others then
    execute 'reset role';
    raise exception 'FAIL B5: own reservation refused: %', sqlerrm;
  end;
  v_ok := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values ('student-work', v_act || '/' || v_s || '/' || gen_random_uuid() || '.jpg', v_s::text);
  exception when others then v_ok := true;
  end;
  if not v_ok then execute 'reset role'; raise exception 'FAIL B5: unreserved key accepted'; end if;
  v_ok := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values ('student-work', 'x/' || v_name2, v_s::text);
  exception when others then v_ok := true;
  end;
  if not v_ok then execute 'reset role'; raise exception 'FAIL B5: nested key accepted'; end if;
  execute 'reset role';
  -- another student cannot upload into v_s's reservation
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id) values ('student-work', v_name2, v_s2::text);
  exception when others then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B5: another student uploaded into the reservation'; end if;
  -- the switch going off closes reservations already made
  update photo_clearance set cleared = false;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id) values ('student-work', v_name2, v_s::text);
  exception when others then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B5: upload accepted with the switch off'; end if;
  update photo_clearance set cleared = true;
  -- a handed-in photo's key is closed to further uploads
  update work_photos set attached_at = now() where id = v_p2;
  execute 'set local role authenticated';
  v_ok := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id) values ('student-work', v_name2, v_s::text);
  exception when others then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B5: upload accepted into an attached key'; end if;
  n := n + 1;

  -- B6 the SELECT policy: the student sees their own photo; the owning
  -- teacher only once it is attached; another teacher and another student never
  insert into storage.objects (bucket_id, name, owner_id) values ('student-work', v_name2, v_s::text);
  update work_photos set attached_at = null where id = v_p2;
  execute 'set local role authenticated';
  if (select count(*) from storage.objects where bucket_id = 'student-work' and name in (v_name, v_name2)) <> 2 then
    execute 'reset role'; raise exception 'FAIL B6: the student cannot read their own photos';
  end if;
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  execute 'set local role authenticated';
  if exists (select 1 from storage.objects where bucket_id = 'student-work' and name = v_name2) then
    execute 'reset role'; raise exception 'FAIL B6: the teacher reads an unattached photo';
  end if;
  execute 'reset role';
  update work_photos set attached_at = now() where id = v_p2;
  execute 'set local role authenticated';
  if not exists (select 1 from storage.objects where bucket_id = 'student-work' and name = v_name2) then
    execute 'reset role'; raise exception 'FAIL B6: the owning teacher cannot read an attached photo';
  end if;
  execute 'reset role';
  foreach v_got in array array[v_t2::text, v_s2::text] loop
    perform set_config('request.jwt.claims', json_build_object('sub', v_got)::text, true);
    execute 'set local role authenticated';
    if exists (select 1 from storage.objects where bucket_id = 'student-work' and name = v_name2) then
      execute 'reset role'; raise exception 'FAIL B6: % reads another student''s photo', v_got;
    end if;
    execute 'reset role';
  end loop;
  n := n + 1;

  -- B7 a deleted row queues its bytes, once
  delete from work_photos where id = v_p1;
  if not exists (select 1 from work_photo_deletions where object_name = v_name) then
    raise exception 'FAIL B7: deleting the row did not queue its bytes';
  end if;
  n := n + 1;

  -- B8 the purge paths queue bytes too: a deleted version (the activity purge
  -- deletes versions first), then a deleted account
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_p1 := reserve_work_photo(v_act, v_ver2, v_pb);
  select object_name into v_name from work_photos where id = v_p1;
  delete from activity_versions where id = v_ver2;
  if exists (select 1 from work_photos where id = v_p1)
     or not exists (select 1 from work_photo_deletions where object_name = v_name) then
    raise exception 'FAIL B8: the version cascade left the row or queued nothing';
  end if;
  delete from auth.users where id = v_s;
  if exists (select 1 from work_photos where student_id = v_s)
     or not exists (select 1 from work_photo_deletions where object_name = v_name2) then
    raise exception 'FAIL B8: the account cascade left rows or queued nothing';
  end if;
  n := n + 1;

  -- B9 the sweep: dry-run reports and removes nothing; the real run removes
  -- exactly the due rows
  insert into class_members (class_id, student_id) values (v_cls, v_s2);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_p1 := reserve_work_photo(v_act, v_ver, v_pb);
  v_p2 := reserve_work_photo(v_act, v_ver, v_pb);
  update work_photos set keep_until = now() - interval '1 minute' where id = v_p1;
  v_r := sweep_work_photos_due();
  if (v_r->>'dry_run')::boolean is not true or (v_r->>'removed')::int <> 0
     or (v_r->>'due')::int < 1 or not exists (select 1 from work_photos where id = v_p1) then
    raise exception 'FAIL B9: dry run %', v_r;
  end if;
  v_r := sweep_work_photos_due(false);
  if exists (select 1 from work_photos where id = v_p1)
     or not exists (select 1 from work_photos where id = v_p2)
     or exists (select 1 from work_photos where keep_until <= now()) then
    raise exception 'FAIL B9: real run %', v_r;
  end if;
  n := n + 1;

  -- B10 the queue clears only what Storage really removed: v_name2's object
  -- still exists (direct deletes are refused by protect_objects_delete), so it
  -- stays queued; v_name never had an object, so it clears
  i := work_photo_deletions_done(array[v_name, v_name2]);
  if i <> 1
     or exists (select 1 from work_photo_deletions where object_name = v_name)
     or not exists (select 1 from work_photo_deletions where object_name = v_name2) then
    raise exception 'FAIL B10: done cleared % (queued: %; object % exists: %)', i,
      (select array_agg(object_name) from work_photo_deletions where object_name in (v_name, v_name2)),
      v_name2, exists (select 1 from storage.objects where bucket_id = 'student-work' and name = v_name2);
  end if;
  if not exists (select 1 from work_photo_deletion_batch(1000) b where b = v_name2) then
    raise exception 'FAIL B10: the batch does not offer the waiting object';
  end if;
  n := n + 1;

  -- B11 the backstop: an object with no row, older than an hour, is an orphan;
  -- a queued one and a fresh one are not
  insert into storage.objects (bucket_id, name, created_at)
  values ('student-work', v_act || '/' || v_t2 || '/' || gen_random_uuid() || '.jpg', now() - interval '2 hours')
  returning name into v_got;
  insert into storage.objects (bucket_id, name)
  values ('student-work', v_act || '/' || v_t2 || '/' || gen_random_uuid() || '.jpg');
  if (select count(*) from work_photo_orphans(1000) o
       where o like v_act || '/%') <> 1
     or not exists (select 1 from work_photo_orphans(1000) o where o = v_got) then
    raise exception 'FAIL B11: orphans %', (select array_agg(o) from work_photo_orphans(1000) o);
  end if;
  n := n + 1;

  -- B12 the meter counts by owning teacher
  if not exists (select 1 from work_photo_usage() u where u.teacher_id = v_t and u.photos >= 1) then
    raise exception 'FAIL B12: usage has no row for the owning teacher';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0093 B: % checks passed', n;
end;
$vfy$;
