-- verify-0106.sql — the seven growing reads as one jsonb each (migration 0106;
-- code review 2026-11-26, A5 follow-up). Run with
-- `pnpm verify:auth --target live|local --only verify-0106`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block,
-- so nothing persists (P7). §B puts the two reads that share a fixture PAST
-- 1,000 rows (1,001 public activities, every one assigned to one class), since
-- the defect only exists above PostgREST's max_rows (P3). Each wrapper is
-- checked against an INDEPENDENT expectation (a count or the fixture's own
-- ids, never only its own expression re-run), so the rows hold on a database
-- with real data too.

-- @section A-posture
-- @expect-rows
select 'all_return_one_jsonb',
       count(*) = 7 and bool_and(pg_get_function_result(p.oid) = 'jsonb' and not p.proretset),
       'the seven *_json wrappers exist and return a scalar jsonb, which max_rows never cuts'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('list_bank_json', 'my_activity_progress_json', 'list_class_activities_json',
                    'list_class_members_json', 'dol_pass_status_json', 'list_deleted_classes_json',
                    'list_deleted_activities_json');
select 'all_invoker_signed_in_only',
       bool_and(not p.prosecdef
                and has_function_privilege('authenticated', p.oid, 'execute')
                and not has_function_privilege('anon', p.oid, 'execute')),
       'every wrapper is SECURITY INVOKER, callable by authenticated, not by anon'
from pg_proc p
where p.pronamespace = 'public'::regnamespace and p.proname like '%\_json'
  and p.proname in ('list_bank_json', 'my_activity_progress_json', 'list_class_activities_json',
                    'list_class_members_json', 'dol_pass_status_json', 'list_deleted_classes_json',
                    'list_deleted_activities_json');
-- An invoker wrapper is only as callable as its inner function is.
select 'inner_still_row_sets_and_granted',
       bool_and(p.proretset and has_function_privilege('authenticated', p.oid, 'execute')),
       'the seven inner functions are still row sets, granted to authenticated'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('list_bank', 'my_activity_progress', 'list_class_activities',
                    'list_class_members', 'dol_pass_status', 'list_deleted_classes',
                    'list_deleted_activities');

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t    uuid := gen_random_uuid();   -- the teacher
  v_s    uuid := gen_random_uuid();   -- a student in the class
  v_gone uuid := gen_random_uuid();   -- a student removed from it
  v_cls  uuid;
  v_act  uuid;
  v_j    jsonb;
  v_rows jsonb;
  n      integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0106-t@vfy0106.example', '{}'::jsonb),
         (v_s, 'vfy0106-s@vfy0106.example', '{}'::jsonb),
         (v_gone, 'vfy0106-g@vfy0106.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id in (v_s, v_gone);

  -- 1,001 published, public activities, each with a current version. Three
  -- statements, not one CTE: an UPDATE cannot see rows inserted by the same
  -- statement's CTEs.
  insert into activities (owner_id, title, slug, status, visibility, course)
  select v_t, 'vfy 0106 #' || g, 'vfy-0106-' || g, 'published', 'public', 'vfy'
    from generate_series(1, 1001) g;
  insert into activity_versions (activity_id, version_num, content, created_by)
  select id, 1, '{"sections": []}'::jsonb, v_t from activities where owner_id = v_t;
  update activities x set current_version_id = v.id
    from activity_versions v where v.activity_id = x.id and x.owner_id = v_t;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0106', v_t, 'vfy', current_date + 200) returning id into v_cls;
  insert into class_activities (class_id, activity_id, added_by)
  select v_cls, id, v_t from activities where owner_id = v_t;
  insert into class_members (class_id, student_id) values (v_cls, v_s), (v_cls, v_gone);
  update class_members set removed_at = now() where class_id = v_cls and student_id = v_gone;
  -- Two soft-deleted classes for Recently deleted.
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on, deleted_at)
  values (v_t, 'vfy 0106 gone 1', v_t, 'vfy', current_date + 200, now()),
         (v_t, 'vfy 0106 gone 2', v_t, 'vfy', current_date + 200, now());
  select id into v_act from activities where owner_id = v_t order by id limit 1;
  -- v_act grants a DoL pass (dol_pass_skill: the last and only part of its
  -- skill), and both students hold it after a check on it.
  update activities set primary_skill = 'vfy0106.skill', source_path = 'vfy0106/1' where id = v_act;
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts)
  select st, v_act, (select current_version_id from activities where id = v_act), 'dol', 1, '{}'::jsonb, '{}'::jsonb
    from unnest(array[v_s, v_gone]) st;
  insert into dol_pass (student_id, skill_id, activity_id, source)
  values (v_s, 'vfy0106.skill', v_act, 'auto'), (v_gone, 'vfy0106.skill', v_act, 'auto');
  -- Two soft-deleted activities for Recently deleted.
  insert into activities (owner_id, title, slug, status, deleted_at)
  values (v_t, 'vfy 0106 deleted 1', 'vfy-0106-del-1', 'draft', now()),
         (v_t, 'vfy 0106 deleted 2', 'vfy-0106-del-2', 'draft', now());

  -- Every call below runs AS THE CLIENT ROLE (the invoker path end to end).

  -- B1 the Bank, as the teacher: past 1,000, identical to the row set
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_j := list_bank_json();
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]') into v_rows
    from list_bank() with ordinality r;
  execute 'reset role';
  if jsonb_array_length(v_j) < 1001 or v_j is distinct from v_rows
     or (select count(*) from jsonb_array_elements(v_j) e
          where (e->>'id')::uuid in (select id from activities where owner_id = v_t and deleted_at is null)) <> 1001 then
    raise exception 'FAIL B1: list_bank_json % rows; all 1,001 fixture activities present: %',
      jsonb_array_length(v_j),
      (select count(*) from jsonb_array_elements(v_j) e
        where (e->>'id')::uuid in (select id from activities where owner_id = v_t and deleted_at is null));
  end if;
  n := n + 1;

  -- B2 the roster: the removed member is in it (that is why it grows)
  execute 'set local role authenticated';
  v_j := list_class_members_json(v_cls);
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]') into v_rows
    from list_class_members(v_cls) with ordinality r;
  execute 'reset role';
  if jsonb_array_length(v_j) <> 2 or v_j is distinct from v_rows
     or not exists (select 1 from jsonb_array_elements(v_j) e
                     where (e->>'student_id')::uuid = v_gone and e->>'removed_at' is not null) then
    raise exception 'FAIL B2: list_class_members_json = %', v_j;
  end if;
  n := n + 1;

  -- B3 Recently deleted: both soft-deleted classes
  execute 'set local role authenticated';
  v_j := list_deleted_classes_json();
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]') into v_rows
    from list_deleted_classes() with ordinality r;
  execute 'reset role';
  if jsonb_array_length(v_j) <> 2 or v_j is distinct from v_rows
     or (select array_agg(e->>'name' order by e->>'name') from jsonb_array_elements(v_j) e)
        is distinct from array['vfy 0106 gone 1', 'vfy 0106 gone 2'] then
    raise exception 'FAIL B3: list_deleted_classes_json = %', v_j;
  end if;
  n := n + 1;

  -- B4 a DoL's passes: the row-returning path (plpgsql RETURN QUERY) gives
  -- both students; an activity that grants none is an empty array, not NULL
  execute 'set local role authenticated';
  v_j := dol_pass_status_json(v_act);
  v_rows := dol_pass_status_json((select id from activities where owner_id = v_t and id <> v_act
                                   and deleted_at is null order by id limit 1));
  execute 'reset role';
  if jsonb_array_length(v_j) <> 2
     or (select array_agg((e->>'student_id')::uuid order by (e->>'student_id')) from jsonb_array_elements(v_j) e)
        is distinct from (select array_agg(x order by x::text) from unnest(array[v_s, v_gone]) x)
     or v_rows is distinct from '[]'::jsonb then
    raise exception 'FAIL B4: dol_pass_status_json = % (none-granting: %)', v_j, v_rows;
  end if;
  n := n + 1;

  -- B4b Recently deleted ACTIVITIES: both soft-deleted ones, by id
  execute 'set local role authenticated';
  v_j := list_deleted_activities_json();
  execute 'reset role';
  if jsonb_array_length(v_j) <> 2
     or exists (select 1 from jsonb_array_elements(v_j) e
                 where (e->>'id')::uuid not in (select id from activities where owner_id = v_t and deleted_at is not null)) then
    raise exception 'FAIL B4b: list_deleted_activities_json = %', v_j;
  end if;
  n := n + 1;

  -- B5 the student's class list: past 1,000, identical to the row set
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_j := list_class_activities_json();
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]') into v_rows
    from list_class_activities() with ordinality r;
  execute 'reset role';
  if jsonb_array_length(v_j) <> 1001 or v_j is distinct from v_rows
     or (select count(distinct e->>'activity_id') from jsonb_array_elements(v_j) e) <> 1001 then
    raise exception 'FAIL B5: list_class_activities_json % rows', jsonb_array_length(v_j);
  end if;
  n := n + 1;

  -- B6 the student's Home status: identical to the row set, and not vacuous
  -- (three checked activities, so the row set cannot be empty)
  execute 'reset role';
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts)
  select v_s, a.id, a.current_version_id, 's1', 1, '{}'::jsonb, '{}'::jsonb
    from activities a where a.owner_id = v_t order by a.id limit 3;
  execute 'set local role authenticated';
  v_j := my_activity_progress_json();
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]') into v_rows
    from my_activity_progress() with ordinality r;
  execute 'reset role';
  if jsonb_typeof(v_j) <> 'array' or v_j is distinct from v_rows
     or (select count(*) from jsonb_array_elements(v_j) e where (e->>'sections_checked')::int > 0) < 3 then
    raise exception 'FAIL B6: my_activity_progress_json differs from the row set (% vs % rows)',
      jsonb_array_length(v_j), jsonb_array_length(v_rows);
  end if;
  n := n + 1;

  -- B7 the inner gates still refuse: a student reading the teacher's roster
  -- gets the same answer through the wrapper as through the row set
  execute 'set local role authenticated';
  select coalesce(jsonb_agg(to_jsonb(r)), '[]') into v_rows from list_class_members(v_cls) r;
  v_j := list_class_members_json(v_cls);
  execute 'reset role';
  if v_j is distinct from '[]'::jsonb or v_rows is distinct from '[]'::jsonb then
    raise exception 'FAIL B7: a student read a roster (wrapper %, row set %)', v_j, v_rows;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0106 B: % checks passed', n;
end;
$vfy$;
