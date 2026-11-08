-- verify-0084.sql — a class can pick up to six activities for a day (migration
-- 0084). Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).

-- @section B-cap
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t  uuid := gen_random_uuid();
  v_k  uuid;
  v_a  uuid[] := '{}';
  v_id uuid;
  v_v  uuid;
  v_i  integer;
  v_r  jsonb;
  v_got text;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0084-t@vfy0084.example', '{}'::jsonb);
  update users set role = 'teacher', timezone = 'Pacific/Auckland' where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0084', v_t, 'vfy') returning id into v_k;
  for v_i in 1..7 loop
    insert into activities (owner_id, title, slug, status)
    values (v_t, 'A' || v_i, 'vfy-0084-' || v_i, 'published') returning id into v_id;
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_id, 1, '{"sections":[]}'::jsonb, v_t) returning id into v_v;
    update activities set current_version_id = v_v where id = v_id;
    insert into class_activities (class_id, activity_id, added_by) values (v_k, v_id, v_t);
    v_a := v_a || v_id;
  end loop;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);

  for v_i in 1..6 loop
    v_r := set_class_today(v_k, v_a[v_i], true);
  end loop;
  if jsonb_array_length(v_r->'activities') <> 6 then raise exception 'FAIL B1: six picks gave %', v_r; end if;

  v_got := null;
  begin perform set_class_today(v_k, v_a[7], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'today_full' then raise exception 'FAIL B2: the seventh gave %', v_got; end if;

  -- A repeat pick on a full day is still a no-op, and unpicking frees a slot.
  perform set_class_today(v_k, v_a[6], true);
  perform set_class_today(v_k, v_a[1], false);
  v_r := set_class_today(v_k, v_a[7], true);
  if v_r->'activities'->5->>'title' <> 'A7' then raise exception 'FAIL B3: %', v_r; end if;

  raise exception 'EXPECTED ROLLBACK >>> B-cap: 3/3';
end
$vfy$;
