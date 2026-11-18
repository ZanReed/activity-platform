-- verify-0098.sql — a teacher's own photo storage (migration 0098). Run with
-- `pnpm verify:auth --target live|local --only verify-0098`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block (P7).

-- @section A-posture
-- @expect-rows
select 'usage_definer_signed_in_only',
       p.prosecdef
       and has_function_privilege('authenticated', p.oid, 'execute')
       and not has_function_privilege('anon', p.oid, 'execute')
       and exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'),
       'my_work_photo_usage: DEFINER, search_path pinned, signed-in only'
from pg_proc p where p.oid = 'public.my_work_photo_usage()'::regprocedure;

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();   -- the owning teacher
  v_t2  uuid := gen_random_uuid();   -- another teacher
  v_s   uuid := gen_random_uuid();
  v_act uuid;
  v_ver uuid;
  v_pb  uuid := gen_random_uuid();
  v_p1  uuid := gen_random_uuid();
  v_p2  uuid := gen_random_uuid();
  v_row record;
  n     integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0098-' || o || '@vfy0098.example', '{}'::jsonb
    from unnest(array[v_t, v_t2, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_t2);
  update users set role = 'student' where id = v_s;
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0098', 'vfy-0098', 'published') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, '{"sections":[]}'::jsonb, v_t) returning id into v_ver;

  insert into work_photos (id, student_id, activity_id, activity_version_id, block_id, keep_until, attached_at)
  values (v_p1, v_s, v_act, v_ver, v_pb, now() + interval '7 days', now()),
         (v_p2, v_s, v_act, v_ver, v_pb, now() + interval '7 days', null);
  -- p1's bytes are stored (Storage's own size); p2 was reserved, never uploaded
  insert into storage.objects (bucket_id, name, owner_id, version, metadata)
  select 'student-work', object_name, v_s::text, gen_random_uuid()::text, '{"size": 4096}'::jsonb
    from work_photos where id = v_p1;

  -- B1 the owner sees their STORED photos (p2, reserved and never uploaded,
  -- is not one), how many were handed in, and the bytes
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  select * into v_row from my_work_photo_usage();
  if v_row.photos <> 1 or v_row.attached <> 1 or v_row.bytes <> 4096 then
    raise exception 'FAIL B1: %', to_jsonb(v_row);
  end if;
  n := n + 1;

  -- B2 another teacher and the student see none of it
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2)::text, true);
  select * into v_row from my_work_photo_usage();
  if v_row.photos <> 0 or v_row.bytes <> 0 then raise exception 'FAIL B2: other teacher %', to_jsonb(v_row); end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  select * into v_row from my_work_photo_usage();
  if v_row.photos <> 0 or v_row.bytes <> 0 then raise exception 'FAIL B2: student %', to_jsonb(v_row); end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0098 B: % checks passed', n;
end;
$vfy$;
