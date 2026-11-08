-- verify-0082.sql — which activity a class is doing today (migration 0082).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).

-- @section A-posture
-- @expect-rows
select 'period_items_rls_forced_no_client_grant',
       (select relrowsecurity and relforcerowsecurity from pg_class where oid = 'class_period_items'::regclass)
       and not exists (select 1 from pg_policies where tablename = 'class_period_items')
       and not has_table_privilege('authenticated', 'class_period_items', 'select')
       and not has_table_privilege('anon', 'class_period_items', 'select'),
       'the two functions are the only doors';
select 'today_functions_signed_in_only',
       has_function_privilege('authenticated', 'class_today(uuid)', 'execute')
       and has_function_privilege('authenticated', 'set_class_today(uuid, uuid, boolean)', 'execute')
       and not has_function_privilege('anon', 'class_today(uuid)', 'execute')
       and not has_function_privilege('anon', 'set_class_today(uuid, uuid, boolean)', 'execute'),
       'no anonymous read or write';
select 'only_activity_kind',
       exists (select 1 from pg_constraint where conrelid = 'class_period_items'::regclass
                and pg_get_constraintdef(oid) ilike '%kind%activity%'),
       'review and the other kinds wait for their own pass';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t  uuid := gen_random_uuid();
  v_x  uuid := gen_random_uuid();
  v_s  uuid := gen_random_uuid();
  v_o  uuid := gen_random_uuid();   -- a student in no class
  v_k  uuid;
  v_a  uuid[] := '{}';
  v_id uuid;
  v_v  uuid;
  v_i  integer;
  v_r  jsonb;
  v_got text;
  v_today date;
  v_audit integer;
  n    integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0082-' || o || '@vfy0082.example', '{}'::jsonb
    from unnest(array[v_t, v_x, v_s, v_o]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_x);
  update users set role = 'student' where id in (v_s, v_o);
  update users set timezone = 'Pacific/Auckland' where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0082', v_t, 'vfy') returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s);
  for v_i in 1..4 loop
    insert into activities (owner_id, title, slug, status)
    values (v_t, 'A' || v_i, 'vfy-0082-' || v_i, 'published') returning id into v_id;
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_id, 1, '{"sections":[]}'::jsonb, v_t) returning id into v_v;
    update activities set current_version_id = v_v where id = v_id;
    v_a := v_a || v_id;
    if v_i <= 3 then
      insert into class_activities (class_id, activity_id, added_by) values (v_k, v_id, v_t);
    end if;
  end loop;
  v_today := (now() at time zone 'Pacific/Auckland')::date;

  -- B1 nothing picked is an empty list, on the class's own day
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_r := class_today(v_k);
  if v_r->'activities' <> '[]'::jsonb or (v_r->>'on_date')::date <> v_today then
    raise exception 'FAIL B1: %', v_r;
  end if;
  n := n + 1;

  -- B2 pick two, in order; a repeat pick is a no-op with no audit row (the cap: verify-0084)
  perform set_class_today(v_k, v_a[2], true);
  v_r := set_class_today(v_k, v_a[1], true);
  select string_agg(e->>'title', ',' order by o) into v_got
    from jsonb_array_elements(v_r->'activities') with ordinality x(e, o);
  if v_got is distinct from 'A2,A1' then raise exception 'FAIL B2: order %', v_got; end if;
  select count(*) into v_audit from audit_log where target_id = v_k and metadata->>'op' = 'use_today';
  perform set_class_today(v_k, v_a[1], true);
  if (select count(*) from audit_log where target_id = v_k and metadata->>'op' = 'use_today') <> v_audit
     or v_audit <> 2 then
    raise exception 'FAIL B2: audit rows';
  end if;
  n := n + 1;

  -- B3 an activity not in the class refuses; so does an unpublished one
  v_got := null;
  begin perform set_class_today(v_k, v_a[4], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_in_class' then raise exception 'FAIL B3: outside gave %', v_got; end if;
  update activities set status = 'draft' where id = v_a[3];
  v_got := null;
  begin perform set_class_today(v_k, v_a[3], false); perform set_class_today(v_k, v_a[1], false);
        perform set_class_today(v_k, v_a[3], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_in_class' then raise exception 'FAIL B3: unpublished gave %', v_got; end if;
  update activities set status = 'published' where id = v_a[3];
  perform set_class_today(v_k, v_a[1], true);
  n := n + 1;

  -- B4 a student reads it and can't write; another teacher and an outsider can do neither
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if jsonb_array_length(class_today(v_k)->'activities') <> 2 then raise exception 'FAIL B4: student read'; end if;
  v_got := null;
  begin perform set_class_today(v_k, v_a[3], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B4: student write gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  v_got := null;
  begin perform set_class_today(v_k, v_a[3], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B4: other teacher gave %', v_got; end if;
  foreach v_id in array array[v_x, v_o] loop
    perform set_config('request.jwt.claims', json_build_object('sub', v_id)::text, true);
    v_got := null;
    begin perform class_today(v_k); exception when others then v_got := sqlerrm; end;
    if v_got is distinct from 'Not available' then raise exception 'FAIL B4: outsider read gave %', v_got; end if;
  end loop;
  n := n + 1;

  -- B5 a removed student loses the read
  update class_members set removed_at = now() where class_id = v_k and student_id = v_s;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform class_today(v_k); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B5: removed student got %', v_got; end if;
  n := n + 1;

  -- B6 yesterday's pick has lapsed, and the next write clears it
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  insert into class_period_items (class_id, on_date, activity_id, position)
  values (v_k, v_today - 1, v_a[3], 1);
  if exists (select 1 from jsonb_array_elements(class_today(v_k)->'activities') e
              where (e->>'activity_id')::uuid = v_a[3]) then
    raise exception 'FAIL B6: yesterday''s pick is still today';
  end if;
  perform set_class_today(v_k, v_a[1], false);
  if exists (select 1 from class_period_items where class_id = v_k and on_date < v_today) then
    raise exception 'FAIL B6: the write left an earlier day';
  end if;
  n := n + 1;

  -- B7 unpicking frees a slot, and the order stays stable
  v_r := set_class_today(v_k, v_a[3], true);
  select string_agg(e->>'title', ',' order by o) into v_got
    from jsonb_array_elements(v_r->'activities') with ordinality x(e, o);
  if v_got is distinct from 'A2,A3' then raise exception 'FAIL B7: %', v_got; end if;
  n := n + 1;

  -- B8 an unpublished activity drops out of the read; removing it from the class takes the row
  update activities set deleted_at = now() where id = v_a[2];
  if jsonb_array_length(class_today(v_k)->'activities') <> 1 then raise exception 'FAIL B8: deleted still read'; end if;
  update activities set deleted_at = null where id = v_a[2];
  perform unshare_activity_from_class(v_k, v_a[2]);
  if exists (select 1 from class_period_items where class_id = v_k and activity_id = v_a[2]) then
    raise exception 'FAIL B8: unsharing left the pick';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-behavioral: %/8', n;
end
$vfy$;
