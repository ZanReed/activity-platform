-- verify-0087.sql — a due date on a class's activity (migration 0087,
-- docs/design/due-dates.md). Run with `pnpm verify:auth --target live|local`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block,
-- so nothing persists (P7).

-- @section A-catalog-posture
-- @expect-rows
select 'due_on_column',
       exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'class_activities'
                 and column_name = 'due_on' and data_type = 'date' and is_nullable = 'YES'),
       '0087: class_activities.due_on is a nullable date';
select 'definer_and_grants',
       bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute')),
       'set_class_activity_due, list_class_activities, class_local_date: DEFINER, signed-in only'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('set_class_activity_due', 'list_class_activities', 'class_local_date')
having count(*) = 3;
select 'search_path_pinned',
       bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'every DEFINER function pins its search_path'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('set_class_activity_due', 'list_class_activities', 'class_local_date');
select 'no_client_writes',
       not has_table_privilege('authenticated', 'class_activities', 'update')
       and not has_table_privilege('authenticated', 'class_activities', 'insert'),
       'the date is written only through set_class_activity_due (0030''s posture)';
select 'student_list_shape',
       pg_get_function_result('list_class_activities()'::regprocedure)
         like '%due_on date%class_today date%',
       'list_class_activities returns due_on and the class''s today';

-- @section B-set-and-read
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t  uuid := gen_random_uuid();
  v_o  uuid := gen_random_uuid();
  v_s  uuid := gen_random_uuid();
  v_x  uuid := gen_random_uuid();
  v_k  uuid;
  v_a  uuid;
  v_ver uuid;
  v_got text;
  v_due date;
  v_today date;
  v_n  integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0087-t@vfy0087.example', '{}'::jsonb),
         (v_o, 'vfy0087-o@vfy0087.example', '{}'::jsonb),
         (v_s, 'vfy0087-s@vfy0087.example', '{}'::jsonb),
         (v_x, 'vfy0087-x@vfy0087.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_t, v_o);
  update users set timezone = 'Pacific/Auckland' where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0087', v_t, 'vfy') returning id into v_k;
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0087 activity', 'vfy-0087-a', 'draft') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, '{}'::jsonb, v_t) returning id into v_ver;
  update activities set status = 'published', current_version_id = v_ver where id = v_a;
  insert into class_members (class_id, student_id) values (v_k, v_s);

  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform share_activity_to_class(v_k, v_a);
  if (select due_on from class_activities where class_id = v_k and activity_id = v_a) is not null then
    raise exception 'FAIL B1: a new row has a due date';
  end if;

  -- Set, audited; setting the same date again writes no second audit row.
  v_due := set_class_activity_due(v_k, v_a, date '2026-11-20');
  if v_due <> date '2026-11-20' then raise exception 'FAIL B2: returned %', v_due; end if;
  perform set_class_activity_due(v_k, v_a, date '2026-11-20');
  select count(*) into v_n from audit_log
   where target_id = v_k and metadata->>'op' = 'set_due' and actor_id = v_t;
  if v_n <> 1 then raise exception 'FAIL B3: % audit rows for one change', v_n; end if;

  -- An activity not in the class is refused.
  v_got := null;
  begin perform set_class_activity_due(v_k, gen_random_uuid(), date '2026-11-20'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'That activity is not in this class' then raise exception 'FAIL B4: gave %', v_got; end if;

  -- Another teacher can't set it; a student can't either.
  perform set_config('request.jwt.claims', json_build_object('sub', v_o)::text, true);
  v_got := null;
  begin perform set_class_activity_due(v_k, v_a, null); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B5: other teacher gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform set_class_activity_due(v_k, v_a, null); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B6: student gave %', v_got; end if;

  -- The class's zone IS the teacher's (not the app default, which can share
  -- Auckland's date for hours a day and would let a zone bug pass).
  if fact_class_zone(v_k) <> 'Pacific/Auckland' then raise exception 'FAIL B7a: class zone is %', fact_class_zone(v_k); end if;
  if not exists (select 1 from audit_log where target_id = v_k and metadata->>'op' = 'set_due'
                   and metadata->>'due_on' = '2026-11-20' and metadata->'was' = 'null'::jsonb) then
    raise exception 'FAIL B3a: audit row lacks the new date and the old one';
  end if;

  -- The student reads it, with the class's today (Auckland), on their list.
  select count(*) into v_n from list_class_activities()
   where activity_id = v_a and due_on = date '2026-11-20'
     and class_today = (now() at time zone 'Pacific/Auckland')::date;
  if v_n <> 1 then raise exception 'FAIL B7: student list missing due_on / class_today'; end if;
  v_today := class_local_date(v_k);
  if v_today <> (now() at time zone 'Pacific/Auckland')::date then raise exception 'FAIL B8: class_local_date %', v_today; end if;

  -- An outsider can't read the class's date.
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  v_got := null;
  begin perform class_local_date(v_k); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: outsider gave %', v_got; end if;

  -- Clearing works; removing the activity takes its date with it.
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_class_activity_due(v_k, v_a, null);
  if (select due_on from class_activities where class_id = v_k and activity_id = v_a) is not null then
    raise exception 'FAIL B10: not cleared';
  end if;
  select count(*) into v_n from audit_log where target_id = v_k and metadata->>'op' = 'set_due';
  if v_n <> 2 then raise exception 'FAIL B10a: clearing wrote % audit rows in all, expected 2', v_n; end if;
  perform unshare_activity_from_class(v_k, v_a);
  perform share_activity_to_class(v_k, v_a);
  if (select due_on from class_activities where class_id = v_k and activity_id = v_a) is not null then
    raise exception 'FAIL B11: a re-added activity kept an old date';
  end if;

  -- A deleted class refuses a date.
  update classes set deleted_at = now() where id = v_k;
  v_got := null;
  begin perform set_class_activity_due(v_k, v_a, date '2026-11-21'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B12: deleted class gave %', v_got; end if;

  raise exception 'EXPECTED ROLLBACK >>> B-set-and-read: 12/12';
end
$vfy$;
