-- verify-0088.sql — the period planner (migration 0088,
-- docs/design/period-planner.md). Run with `pnpm verify:auth --target live|local`.
-- §A reads the catalog only; §B and §C are self-fixturing EXPECTED-ROLLBACK
-- blocks, so nothing persists (P7).

-- @section A-catalog-posture
-- @expect-rows
select 'minutes_column',
       exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'activities'
                 and column_name = 'minutes' and data_type = 'smallint' and is_nullable = 'YES')
       and exists (select 1 from pg_constraint where conrelid = 'activities'::regclass
                    and pg_get_constraintdef(oid) ilike '%minutes%120%'),
       '0088: activities.minutes is a nullable smallint, 1–120';
select 'planner_definer_signed_in_only',
       bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'class_plan, set_class_plan, move_class_plan_item, reorder_class_plan, my_timezone, set_my_timezone: DEFINER, search_path pinned, signed-in only'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('class_plan', 'set_class_plan', 'move_class_plan_item', 'reorder_class_plan',
                    'my_timezone', 'set_my_timezone')
having count(*) = 6;
select 'helpers_not_client_callable',
       not bool_or(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute')),
       'the planner''s internal helpers are reachable only through the functions above'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('class_plan_prune', 'class_plan_limit', 'class_plan_visible',
                    'class_plan_begin', 'class_plan_check_day')
having count(*) = 5;
select 'period_items_still_no_client_grant',
       not has_table_privilege('authenticated', 'class_period_items', 'select')
       and not has_table_privilege('authenticated', 'class_period_items', 'insert')
       and not exists (select 1 from pg_policies where tablename = 'class_period_items'),
       'the functions are still the only doors (0082)';
select 'set_class_today_calls_the_planner',
       pg_get_functiondef('set_class_today(uuid, uuid, boolean)'::regprocedure) like '%set_class_plan(%',
       'one write path, so today and the plan cannot drift (PP-3)';

-- @section B-plan
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t  uuid := gen_random_uuid();   -- the class's teacher, Auckland
  v_o  uuid := gen_random_uuid();   -- another teacher
  v_s  uuid := gen_random_uuid();   -- a student in the class
  v_k  uuid;
  v_a  uuid[] := '{}';
  v_id uuid;
  v_v  uuid;
  v_i  integer;
  v_r  jsonb;
  v_got text;
  v_today date;
  v_n  integer;
  n    integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0088-' || o || '@vfy0088.example', '{}'::jsonb
    from unnest(array[v_t, v_o, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_o);
  update users set role = 'student' where id = v_s;
  update users set timezone = 'Pacific/Auckland' where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0088', v_t, 'vfy') returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s);
  for v_i in 1..8 loop
    insert into activities (owner_id, title, slug, status, minutes)
    values (v_t, 'A' || v_i, 'vfy-0088-' || v_i, 'published', 10 * v_i) returning id into v_id;
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_id, 1, '{"sections":[]}'::jsonb, v_t) returning id into v_v;
    update activities set current_version_id = v_v where id = v_id;
    insert into class_activities (class_id, activity_id, added_by) values (v_k, v_id, v_t);
    v_a := v_a || v_id;
  end loop;
  -- The class's day is Auckland's (not the Chicago default, which shares
  -- Auckland's date for hours a day and would let a zone bug pass).
  v_today := (now() at time zone 'Pacific/Auckland')::date;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);

  -- B1 a future day is planned, with minutes; students' today doesn't show it
  v_r := set_class_plan(v_k, v_today + 3, v_a[1], true);
  if v_r->'days'->0->>'on_date' <> (v_today + 3)::text
     or (v_r->'days'->0->'activities'->0->>'minutes')::int <> 10
     or (v_r->'days'->0->'activities'->0->>'available')::boolean is not true then
    raise exception 'FAIL B1: %', v_r;
  end if;
  if jsonb_array_length(class_today(v_k)->'activities') <> 0 then
    raise exception 'FAIL B1: a future day showed as today';
  end if;
  if not exists (select 1 from audit_log where target_id = v_k and metadata->>'op' = 'plan_add'
                   and metadata->>'on_date' = (v_today + 3)::text)
     or exists (select 1 from audit_log where target_id = v_k and metadata->>'op' = 'use_today') then
    raise exception 'FAIL B1: a future day was not audited as plan_add';
  end if;
  n := n + 1;

  -- B2 a student or another teacher can neither read nor write the plan
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform class_plan(v_k, v_today, v_today + 7); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B2: student read gave %', v_got; end if;
  v_got := null;
  begin perform set_class_plan(v_k, v_today + 1, v_a[2], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B2: student write gave %', v_got; end if;
  v_got := null;
  begin perform move_class_plan_item(v_k, v_today + 3, v_a[1], v_today + 4); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B2: student move gave %', v_got; end if;
  v_got := null;
  begin perform reorder_class_plan(v_k, v_today + 3, array[v_a[1]]); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B2: student reorder gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_o)::text, true);
  v_got := null;
  begin perform set_class_plan(v_k, v_today + 1, v_a[2], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B2: other teacher gave %', v_got; end if;
  v_got := null;
  begin perform class_plan(v_k, v_today, v_today + 7); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B2: other teacher read gave %', v_got; end if;
  v_got := null;
  begin perform move_class_plan_item(v_k, v_today + 3, v_a[1], v_today + 4); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B2: other teacher move gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  n := n + 1;

  -- B3 a past day and a day past the year's end are refused; the end itself is fine
  v_got := null;
  begin perform set_class_plan(v_k, v_today - 1, v_a[2], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'past_day' then raise exception 'FAIL B3: past gave %', v_got; end if;
  update classes set school_year_ends_on = v_today + 10 where id = v_k;
  v_got := null;
  begin perform set_class_plan(v_k, v_today + 11, v_a[2], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'too_far' then raise exception 'FAIL B3: past the end gave %', v_got; end if;
  perform set_class_plan(v_k, v_today + 10, v_a[2], true);
  perform set_class_plan(v_k, v_today + 9, v_a[4], true);
  -- The year end is shortened under planned rows: they can still leave.
  update classes set school_year_ends_on = v_today + 5 where id = v_k;
  perform set_class_plan(v_k, v_today + 10, v_a[2], false);
  perform move_class_plan_item(v_k, v_today + 9, v_a[4], v_today + 2);
  if exists (select 1 from class_period_items where class_id = v_k and on_date > v_today + 5) then
    raise exception 'FAIL B3: a row beyond a shortened year end was stuck';
  end if;
  v_got := null;
  begin perform move_class_plan_item(v_k, v_today + 2, v_a[4], v_today + 9); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'too_far' then raise exception 'FAIL B3: a move past the end gave %', v_got; end if;
  perform set_class_plan(v_k, v_today + 2, v_a[4], false);
  update classes set school_year_ends_on = v_today + 10 where id = v_k;
  perform set_class_plan(v_k, v_today + 10, v_a[2], true);
  -- A year end already passed falls back to a year from today.
  update classes set school_year_ends_on = v_today - 30 where id = v_k;
  perform set_class_plan(v_k, v_today + 200, v_a[2], true);
  v_got := null;
  begin perform set_class_plan(v_k, v_today + 366, v_a[2], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'too_far' then raise exception 'FAIL B3: a year and a day gave %', v_got; end if;
  perform set_class_plan(v_k, v_today + 200, v_a[2], false);
  perform set_class_plan(v_k, v_today + 10, v_a[2], false);
  update classes set school_year_ends_on = null where id = v_k;
  n := n + 1;

  -- B4 the cap counts only activities the class can still use
  for v_i in 1..6 loop
    perform set_class_plan(v_k, v_today + 5, v_a[v_i], true);
  end loop;
  v_got := null;
  begin perform set_class_plan(v_k, v_today + 5, v_a[7], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'day_full' then raise exception 'FAIL B4: the seventh gave %', v_got; end if;
  update activities set deleted_at = now() where id = v_a[3];
  v_r := set_class_plan(v_k, v_today + 5, v_a[7], true);
  select count(*) into v_n from jsonb_array_elements(v_r->'days'->0->'activities') e
   where (e->>'available')::boolean = false and (e->>'activity_id')::uuid = v_a[3];
  if v_n <> 1 or jsonb_array_length(v_r->'days'->0->'activities') <> 7 then
    raise exception 'FAIL B4: a hidden row is not flagged, or blocked the seventh: %', v_r;
  end if;
  -- ...and a hidden row can still be removed.
  v_r := set_class_plan(v_k, v_today + 5, v_a[3], false);
  if jsonb_array_length(v_r->'days'->0->'activities') <> 6 then raise exception 'FAIL B4: hidden row not removed'; end if;
  update activities set deleted_at = null where id = v_a[3];
  n := n + 1;

  -- B4b a restored pick can leave seven rows; students still see six, first by position
  v_r := set_class_today(v_k, v_a[8], true);
  for v_i in 1..5 loop
    perform set_class_today(v_k, v_a[v_i], true);
  end loop;
  update activities set deleted_at = now() where id = v_a[8];
  perform set_class_today(v_k, v_a[6], true);
  update activities set deleted_at = null where id = v_a[8];
  v_r := class_today(v_k);
  if jsonb_array_length(v_r->'activities') <> 6 or v_r->'activities'->0->>'title' <> 'A8' then
    raise exception 'FAIL B4b: a restore showed %', v_r;
  end if;
  for v_i in 1..6 loop
    perform set_class_today(v_k, v_a[v_i], false);
  end loop;
  perform set_class_today(v_k, v_a[8], false);
  n := n + 1;

  -- B5 a move: last on the new day, audited, refused onto a full day, a no-op onto itself
  v_r := move_class_plan_item(v_k, v_today + 3, v_a[1], v_today + 4);
  if exists (select 1 from class_period_items where class_id = v_k and on_date = v_today + 3)
     or not exists (select 1 from class_period_items where class_id = v_k and on_date = v_today + 4
                     and activity_id = v_a[1] and position = 1)
     or not exists (select 1 from audit_log where target_id = v_k and metadata->>'op' = 'move_plan') then
    raise exception 'FAIL B5: move %', v_r;
  end if;
  v_got := null;
  begin perform move_class_plan_item(v_k, v_today + 4, v_a[1], v_today + 5); exception when others then v_got := sqlerrm; end;
  -- a[1] is already on +5, so this one is allowed (it just leaves +4); a[8] onto the full day is not.
  if v_got is not null then raise exception 'FAIL B5: onto a day that has it gave %', v_got; end if;
  perform set_class_plan(v_k, v_today + 4, v_a[8], true);
  v_got := null;
  begin perform move_class_plan_item(v_k, v_today + 4, v_a[8], v_today + 5); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'day_full' then raise exception 'FAIL B5: onto a full day gave %', v_got; end if;
  v_got := null;
  begin perform move_class_plan_item(v_k, v_today + 9, v_a[8], v_today + 6); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_planned' then raise exception 'FAIL B5: an unplanned move gave %', v_got; end if;
  n := n + 1;

  -- B6 reorder: the exact set is required; a good order is stored and audited once
  v_got := null;
  begin perform reorder_class_plan(v_k, v_today + 5, array[v_a[1], v_a[2]]); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'reorder_mismatch' then raise exception 'FAIL B6: a partial list gave %', v_got; end if;
  v_got := null;
  begin perform reorder_class_plan(v_k, v_today + 5,
          array[v_a[7], v_a[6], v_a[5], v_a[4], v_a[2], v_a[1], v_a[1]]); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'reorder_mismatch' then raise exception 'FAIL B6: a duplicate gave %', v_got; end if;
  v_r := reorder_class_plan(v_k, v_today + 5, array[v_a[7], v_a[6], v_a[5], v_a[4], v_a[2], v_a[1]]);
  select string_agg(e->>'title', ',' order by o) into v_got
    from jsonb_array_elements(v_r->'days'->0->'activities') with ordinality x(e, o);
  if v_got is distinct from 'A7,A6,A5,A4,A2,A1' then raise exception 'FAIL B6: order %', v_got; end if;
  perform reorder_class_plan(v_k, v_today + 5, array[v_a[7], v_a[6], v_a[5], v_a[4], v_a[2], v_a[1]]);
  select count(*) into v_n from audit_log where target_id = v_k and metadata->>'op' = 'reorder_plan';
  if v_n <> 1 then raise exception 'FAIL B6: % audit rows for one change', v_n; end if;
  n := n + 1;

  -- B7 only the latest past day survives a write, and it is "last_day"
  insert into class_period_items (class_id, on_date, activity_id, position)
  values (v_k, v_today - 9, v_a[1], 1), (v_k, v_today - 5, v_a[2], 1);
  perform set_class_plan(v_k, v_today + 6, v_a[3], true);
  if exists (select 1 from class_period_items where class_id = v_k and on_date = v_today - 9)
     or not exists (select 1 from class_period_items where class_id = v_k and on_date = v_today - 5) then
    raise exception 'FAIL B7: the wrong past days survived';
  end if;
  v_r := class_plan(v_k, v_today, v_today + 7);
  if v_r->'last_day'->>'on_date' <> (v_today - 5)::text
     or v_r->'last_day'->'activities'->0->>'title' <> 'A2' then
    raise exception 'FAIL B7: last_day %', v_r->'last_day';
  end if;
  -- A past day is read-only: no move off it.
  v_got := null;
  begin perform move_class_plan_item(v_k, v_today - 5, v_a[2], v_today); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'past_day' then raise exception 'FAIL B7: moved off a past day: %', v_got; end if;
  n := n + 1;

  -- B8 hooks dated on a day come back by id, and a hook-only day is a day
  insert into class_hook_use (class_id, hook_id, used_on, marked_by)
  values (v_k, 'hook.vfy.one', v_today + 6, v_t), (v_k, 'hook.vfy.two', v_today + 2, v_t);
  v_r := class_plan(v_k, v_today, v_today + 7);
  if not exists (select 1 from jsonb_array_elements(v_r->'days') d
                  where d->>'on_date' = (v_today + 6)::text and d->'hook_ids' = '["hook.vfy.one"]'::jsonb)
     or not exists (select 1 from jsonb_array_elements(v_r->'days') d
                     where d->>'on_date' = (v_today + 2)::text
                       and jsonb_array_length(d->'activities') = 0
                       and d->'hook_ids' = '["hook.vfy.two"]'::jsonb) then
    raise exception 'FAIL B8: %', v_r->'days';
  end if;
  v_got := null;
  begin perform class_plan(v_k, v_today, v_today + 93); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'bad_range' then raise exception 'FAIL B8: a 94-day range gave %', v_got; end if;
  n := n + 1;

  -- B9 today still works as 0084: the today_full error, the class_today shape, minutes for students
  for v_i in 1..6 loop
    v_r := set_class_today(v_k, v_a[v_i], true);
  end loop;
  v_got := null;
  begin perform set_class_today(v_k, v_a[7], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'today_full' then raise exception 'FAIL B9: the seventh today gave %', v_got; end if;
  if v_r->>'on_date' <> v_today::text or jsonb_array_length(v_r->'activities') <> 6 then
    raise exception 'FAIL B9: shape %', v_r;
  end if;
  v_got := null;
  begin perform set_class_today(v_k, gen_random_uuid(), true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_in_class' then raise exception 'FAIL B9: outside activity gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_o)::text, true);
  v_got := null;
  begin perform set_class_today(v_k, v_a[7], true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B9: other teacher gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if not exists (select 1 from audit_log where target_id = v_k and metadata->>'op' = 'use_today'
                   and metadata->>'on_date' = v_today::text) then
    raise exception 'FAIL B9: today was not audited as use_today';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_r := class_today(v_k);
  if (v_r->'activities'->0->>'minutes')::int <> 10 then raise exception 'FAIL B9: student minutes %', v_r; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-plan: %/10', n;
end
$vfy$;

-- @section C-copy-and-zone
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_author  uuid := gen_random_uuid();
  v_teacher uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_doc     jsonb := jsonb_build_object(
    'schemaVersion', 2,
    'meta', jsonb_build_object('title', 'vfy 0088', 'course', 'Y7', 'activityType', 'worksheet'),
    'sections', '[]'::jsonb);
  v_src  uuid;
  v_copy uuid;
  v_k    uuid;
  v_r    jsonb;
  v_got  text;
  v_n    integer;
  n      integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0088c-' || o || '@vfy0088.example', '{}'::jsonb
    from unnest(array[v_author, v_teacher, v_student]) with ordinality x(u, o);
  update users set role = 'teacher', teacher_caps_exempt = true where id in (v_author, v_teacher);
  update users set role = 'student' where id = v_student;
  update users set timezone = null where id = v_teacher;

  -- C1 a Bank copy carries minutes
  insert into activities (owner_id, title, slug, course, draft_content, minutes)
  values (v_author, 'vfy 0088 src', 'vfy-0088-src', 'Y7', v_doc, 35) returning id into v_src;
  perform set_config('request.jwt.claims', json_build_object('sub', v_author)::text, true);
  perform publish_activity(v_src);
  update activities set visibility = 'public' where id = v_src;
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_copy := copy_bank_activity(v_src);
  if (select minutes from activities where id = v_copy) is distinct from 35 then
    raise exception 'FAIL C1: the copy has % minutes', (select minutes from activities where id = v_copy);
  end if;
  n := n + 1;

  -- C2 out-of-range minutes are refused by the column
  v_got := null;
  begin update activities set minutes = 121 where id = v_copy; exception when check_violation then v_got := 'refused'; end;
  if v_got is distinct from 'refused' then raise exception 'FAIL C2: 121 minutes stored'; end if;
  n := n + 1;

  -- C3 an unset zone reads as the default and says so
  v_r := my_timezone();
  if (v_r->>'is_set')::boolean or v_r->>'zone' <> 'America/Chicago' then raise exception 'FAIL C3: %', v_r; end if;
  n := n + 1;

  -- C4 setting it: stored, audited once, a repeat writes nothing, a bad name refused
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0088 zone', v_teacher, 'vfy') returning id into v_k;
  v_r := set_my_timezone('Pacific/Auckland');
  if not (v_r->>'is_set')::boolean or v_r->>'zone' <> 'Pacific/Auckland' then raise exception 'FAIL C4: %', v_r; end if;
  perform set_my_timezone('Pacific/Auckland');
  select count(*) into v_n from audit_log
   where actor_id = v_teacher and metadata->>'op' = 'set_timezone';
  if v_n <> 1 then raise exception 'FAIL C4: % audit rows', v_n; end if;
  if exists (select 1 from audit_log where actor_id = v_teacher and metadata::text like '%Auckland%') then
    raise exception 'FAIL C4: the zone was copied into the audit log';
  end if;
  v_got := null;
  begin perform set_my_timezone('Mars/Olympus'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'bad_zone' then raise exception 'FAIL C4: a bad zone gave %', v_got; end if;
  n := n + 1;

  -- C5 a change moves the class's day mid-day, for every class of that teacher
  if fact_class_zone(v_k) <> 'Pacific/Auckland'
     or class_today(v_k)->>'on_date' <> (now() at time zone 'Pacific/Auckland')::date::text then
    raise exception 'FAIL C5: the class did not follow the new zone';
  end if;
  perform set_my_timezone('America/Los_Angeles');
  if fact_class_zone(v_k) <> 'America/Los_Angeles' or class_today(v_k)->>'on_date' <> (now() at time zone 'America/Los_Angeles')::date::text then
    raise exception 'FAIL C5: the class kept the old day';
  end if;
  n := n + 1;

  -- C6 a student can't set one
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_got := null;
  begin perform set_my_timezone('Pacific/Auckland'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Only teachers set a timezone' then raise exception 'FAIL C6: student gave %', v_got; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> C-copy-and-zone: %/6', n;
end
$vfy$;
