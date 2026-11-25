-- verify-0104.sql — the grading queue and its suggestions as one jsonb each
-- (migration 0104; code review 2026-11-26, A5). Run with
-- `pnpm verify:auth --target live|local --only verify-0104`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block,
-- so nothing persists (P7). §B builds a queue PAST 1,000 rows on purpose: the
-- defect only exists above PostgREST's max_rows, so a smaller fixture would
-- prove nothing about it (P3: force the limit at production values).

-- @section A-posture
-- @expect-rows
select 'returns_one_jsonb',
       bool_and(pg_get_function_result(f) = 'jsonb' and not p.proretset),
       'grading_queue and grade_suggestions return a scalar jsonb, which max_rows never cuts'
from unnest(array['public.grading_queue(uuid)'::regprocedure, 'public.grade_suggestions(uuid)'::regprocedure]) f
join pg_proc p on p.oid = f;
select 'invoker_not_definer',
       bool_and(not p.prosecdef),
       'both wrappers are SECURITY INVOKER: every gate is the inner function''s'
from unnest(array['public.grading_queue(uuid)'::regprocedure, 'public.grade_suggestions(uuid)'::regprocedure]) f
join pg_proc p on p.oid = f;
select 'signed_in_only',
       has_function_privilege('authenticated', 'public.grading_queue(uuid)', 'execute')
       and not has_function_privilege('anon', 'public.grading_queue(uuid)', 'execute')
       and has_function_privilege('authenticated', 'public.grade_suggestions(uuid)', 'execute')
       and not has_function_privilege('anon', 'public.grade_suggestions(uuid)', 'execute'),
       'authenticated may call both wrappers; anon may not';
-- The wrapper is only sound while the inner function it reads still is what
-- 0099 left: a row set, executable by the invoker.
select 'inner_unchanged',
       (select proretset from pg_proc where oid = 'public.list_grading_queue(uuid)'::regprocedure)
       and has_function_privilege('authenticated', 'public.list_grading_queue(uuid)', 'execute')
       and pg_get_functiondef('public.list_grading_queue(uuid)'::regprocedure) ~ 'hand_grade_owed'
       and (select proretset from pg_proc where oid = 'public.list_grade_suggestions(uuid)'::regprocedure)
       and has_function_privilege('authenticated', 'public.list_grade_suggestions(uuid)', 'execute'),
       'list_grading_queue (0099) and list_grade_suggestions (0042) are still row sets, granted to authenticated';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t      uuid := gen_random_uuid();   -- the owner
  v_x      uuid := gen_random_uuid();   -- a stranger teacher
  v_act    uuid;
  v_cls    uuid;
  v_ver    uuid;
  v_blocks jsonb;
  v_resp   jsonb;
  v_j      jsonb;
  v_inner  integer;
  v_got    text;
  v       integer;
  n        integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0104-t@vfy0104.example', '{}'::jsonb),
         (v_x, 'vfy0104-x@vfy0104.example', '{}'::jsonb);
  insert into auth.users (id, email, raw_user_meta_data)
  select gen_random_uuid(), 'vfy0104-s' || g || '@vfy0104.example', '{}'::jsonb
    from generate_series(1, 150) g;
  update users set role = 'teacher' where id in (v_t, v_x);
  update users set role = 'student' where email like 'vfy0104-s%@vfy0104.example';

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0104', 'vfy-0104', 'published') returning id into v_act;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0104', v_t, 'vfy', current_date + 200) returning id into v_cls;
  insert into class_activities (class_id, activity_id, added_by) values (v_cls, v_act, v_t);
  insert into class_members (class_id, student_id)
  select v_cls, id from users where email like 'vfy0104-s%@vfy0104.example';

  -- Two versions × one section × four written answers, every student checked
  -- on both: 150 × 4 × 2 = 1,200 queue rows (the review's arithmetic).
  for v in 1..2 loop
    select jsonb_agg(jsonb_build_object('id', gen_random_uuid(), 'type', 'short_answer', 'prompt', '[]'::jsonb))
      into v_blocks from generate_series(1, 4);
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_act, v, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
              'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
                jsonb_build_object('blocks', v_blocks))))))), v_t)
    returning id into v_ver;
    select jsonb_build_object('freeText', jsonb_object_agg(b->>'id', 'answer'))
      into v_resp from jsonb_array_elements(v_blocks) b;
    insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                                attempt_number, responses, verdicts)
    select u.id, v_act, v_ver, 's1', 1, v_resp, '{}'::jsonb
      from users u where u.email like 'vfy0104-s%@vfy0104.example';
  end loop;
  update activities set current_version_id = v_ver where id = v_act;

  -- B1 every row arrives: the array holds all 1,200, the same count the row
  -- set has, and more than PostgREST's 1,000
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  v_j := grading_queue(v_act);
  select count(*) into v_inner from list_grading_queue(v_act);
  if jsonb_typeof(v_j) <> 'array' or jsonb_array_length(v_j) <> 1200 or v_inner <> 1200 then
    raise exception 'FAIL B1: array % (%), row set %', jsonb_array_length(v_j), jsonb_typeof(v_j), v_inner;
  end if;
  n := n + 1;

  -- B1b the same read AS THE CLIENT ROLE: an invoker wrapper is only as
  -- callable as its inner function is to `authenticated` (§A checks the grant;
  -- this proves the call path end to end)
  execute 'set local role authenticated';
  v_j := grading_queue(v_act);
  execute 'reset role';
  if jsonb_array_length(v_j) <> 1200 then
    raise exception 'FAIL B1b: as authenticated the array holds %', jsonb_array_length(v_j);
  end if;
  n := n + 1;

  -- B2 the older version is present: it is the part the cap used to drop
  if (select count(*) from jsonb_array_elements(v_j) e where (e->>'version_num')::int = 1) <> 600 then
    raise exception 'FAIL B2: version 1 rows = %',
      (select count(*) from jsonb_array_elements(v_j) e where (e->>'version_num')::int = 1);
  end if;
  n := n + 1;

  -- B3 the inner order survives aggregation (newest version first), and each
  -- element carries the row set's columns and nothing else
  if exists (select 1 from jsonb_array_elements(v_j) with ordinality a(e, i)
               join jsonb_array_elements(v_j) with ordinality b(e, i) on b.i = a.i + 1
              where (b.e->>'version_num')::int > (a.e->>'version_num')::int) then
    raise exception 'FAIL B3: versions out of order';
  end if;
  if (select array_agg(k order by k) from jsonb_object_keys(v_j->0) k)
     is distinct from
     (select array_agg(a.attname::text order by a.attname::text)
        from pg_proc p, unnest(p.proargnames, p.proargmodes) with ordinality a(attname, mode, i)
       where p.oid = 'public.list_grading_queue(uuid)'::regprocedure and a.mode = 't') then
    raise exception 'FAIL B3: element keys %', (select array_agg(k) from jsonb_object_keys(v_j->0) k);
  end if;
  n := n + 1;

  -- B4 the inner gate still refuses a stranger, with the contract's string
  perform set_config('request.jwt.claims', json_build_object('sub', v_x, 'role', 'authenticated')::text, true);
  v_got := null;
  begin perform grading_queue(v_act); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your activity' then
    raise exception 'FAIL B4: a stranger read the queue (%)', v_got;
  end if;
  n := n + 1;

  -- B5 suggestions: one production suggestion per queue row, all 1,200
  -- arrive in one value (the suggestion list has the queue's cardinality)
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  insert into check_grade_suggestions (check_id, block_id, source, status,
                                       source_text_hash, lease_expires_at)
  select (e->>'check_id')::uuid, (e->>'block_id')::uuid, 'production', 'pending',
         md5('answer'), now()
    from jsonb_array_elements(v_j) e;
  v_j := grade_suggestions(v_act);
  select count(*) into v_inner from list_grade_suggestions(v_act);
  if jsonb_typeof(v_j) <> 'array' or jsonb_array_length(v_j) <> 1200 or v_inner <> 1200 then
    raise exception 'FAIL B5: suggestions array %, row set %', jsonb_array_length(v_j), v_inner;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_x, 'role', 'authenticated')::text, true);
  v_got := null;
  begin perform grade_suggestions(v_act); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your activity' then
    raise exception 'FAIL B5: a stranger read the suggestions (%)', v_got;
  end if;
  n := n + 1;

  -- B6 an activity with nothing to grade is an empty array, not NULL
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0104 empty', 'vfy-0104-empty', 'published') returning id into v_act;
  if grading_queue(v_act) is distinct from '[]'::jsonb
     or grade_suggestions(v_act) is distinct from '[]'::jsonb then
    raise exception 'FAIL B6: empty queue = %, suggestions = %', grading_queue(v_act), grade_suggestions(v_act);
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0104 B: % checks passed', n;
end;
$vfy$;
