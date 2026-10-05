-- verify-0051.sql — the teacher's view of the daily practice (migration 0051).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0045 idiom): a synthetic revision
-- stamped mirrored_at in 2999, real functions, everything rolled back (P7).
--
--   §A — the function is definer, pinned, signed-in only.
--   §B — only the class's teacher; who practised (a session with no answer
--        does not count); each family and each student by state; what a class
--        that cannot switch on gets.
--
-- The fixture. Two families of 10 facts, Year 7, a 20-item check. S1: family
-- A quick and right (FLUENT), family B all wrong (NEEDS STRATEGY). S2 took no
-- check (both NOT JUDGED → practising).

-- @section A-catalog-posture
-- @expect-rows
select 'overview_signed_in_only_definer',
       has_function_privilege('authenticated', 'fact_sprint_overview(uuid)', 'execute')
       and not has_function_privilege('anon', 'fact_sprint_overview(uuid)', 'execute')
       and (select prosecdef and proconfig @> array['search_path=public']
              from pg_proc where proname = 'fact_sprint_overview'),
       'the teacher''s read: definer, pinned, never anonymous';

-- @section B-overview
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('2', 64);
  v_teacher uuid := gen_random_uuid();
  v_other   uuid := gen_random_uuid();
  v_s1      uuid := gen_random_uuid();
  v_s2      uuid := gen_random_uuid();
  v_class   uuid;
  v_empty   uuid;
  v_code    text;
  v_probe   uuid;
  v_items   jsonb;
  v_att     jsonb;
  v_res     jsonb;
  v_got     text;
  v_raised  boolean;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0051-' || row_number() over () || '@vfy0051.example', '{}'::jsonb
    from unnest(array[v_teacher, v_other, v_s1, v_s2]) u;
  update users set role = 'teacher', timezone = 'UTC' where id in (v_teacher, v_other);
  update users set role = 'student' where id in (v_s1, v_s2);
  update users set display_name = 'Vfy Alpha' where id = v_s1;
  update users set display_name = 'Vfy Beta' where id = v_s2;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_teacher, 'vfy 0051 class', v_teacher, 'vfy', current_date + 100)
  returning id, join_code into v_class, v_code;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_teacher, 'vfy 0051 empty', v_teacher, 'vfy', current_date + 100) returning id into v_empty;
  insert into class_members (class_id, student_id) values (v_class, v_s1), (v_class, v_s2);

  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at, sprint)
  values (v_rev, 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.a","fact.vfy.b"], "cumulative": ["fact.vfy.a","fact.vfy.b"], "description": "vfy"}}'::jsonb,
    '{}'::jsonb, 2, 20, '2999-01-01',
    '{"sprint_max_misses": 1, "sprint_minutes": 5, "sprint_step_intervals": [1, 2, 4, 8, 16],
      "sprint_mastered_step": 2, "sprint_new_facts_per_session": 5, "sprint_working_families": 2,
      "sprint_reask_gap": 3}'::jsonb);
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count, strategy)
  select v_rev, 1, 'fact.vfy.' || c, o - 1, 'generated', 'Fam ' || upper(c), 5, 'square', 3, false, 1, 10, null
    from unnest(array['a','b']) with ordinality t(c, o);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken, display_swapped, spoken_swapped)
  select v_rev, 1, 'fact.vfy.' || c || ':' || g, 'fact.vfy.' || c, g, array[g],
         (g + 10)::text, upper(c) || g || ' = __', c || ' ' || g, null, null
    from unnest(array['a','b']) c, generate_series(1, 10) g;

  -- B1 a class that cannot switch on: the reason by name, and nothing derived
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := fact_sprint_overview(v_empty);
  if v_res->>'blocked_by' <> 'no_closed_check' or (v_res->>'on')::boolean
     or jsonb_array_length(v_res->'families') <> 0 or jsonb_array_length(v_res->'students') <> 0
     or (v_res->>'in_class')::int <> 0 then
    raise exception 'FAIL B1: a class with no check %', v_res;
  end if;
  n := n + 1;

  -- the check, three days ago; S1 only
  v_probe := (open_fact_probe(v_class, 7)->>'probe_id')::uuid;
  select items into v_items from class_probes where id = v_probe;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  select jsonb_agg(jsonb_build_object(
           'n', (e->>'n')::int,
           'typed', case when e->>'family_id' = 'fact.vfy.b' then '99' else e->>'answer' end,
           'skipped', false, 'interrupted', false, 'rt_ms', 1600,
           'offset_ms', (e->>'n')::int * 2000, 'modality', 'keyboard'))
    into v_att from jsonb_array_elements(v_items) e;
  perform save_fact_attempts(v_probe, v_att, '{"keyboard": 200, "keypad": null}'::jsonb, true, 'vfy');
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  perform close_fact_probe(v_probe);
  update fact_attempts set saved_at = saved_at - interval '3 days'
   where session_id in (select id from practice_sessions where probe_id = v_probe);

  -- B2 before the switch: it can be switched on, and the states are already read
  v_res := fact_sprint_overview(v_class);
  if (v_res->>'on')::boolean or v_res->>'blocked_by' is not null
     or (v_res->>'year_level')::int <> 7 or v_res->>'join_code' <> v_code
     or (v_res->>'in_class')::int <> 2 or (v_res->>'practised_today')::int <> 0 then
    raise exception 'FAIL B2: before the switch %', v_res;
  end if;
  n := n + 1;

  -- S1 practises (answers saved); S2 starts and answers nothing
  perform set_fact_sprint(v_class, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := fact_sprint_entry(v_code, true);
  select jsonb_agg(jsonb_build_object(
           'n', (i->>'n')::int, 'reask', false,
           -- two of B's ten are wrong again, so B stays in strategy mode
           'typed', case when i->>'fact_id' in ('fact.vfy.b:1', 'fact.vfy.b:2') then '99' else i->>'answer' end,
           'skipped', false, 'interrupted', false, 'rt_ms', 1600,
           'offset_ms', (i->>'n')::int * 2000, 'modality', 'keyboard'))
    into v_att
    from jsonb_array_elements((select items from sprint_sessions
                                where id = (v_res->'session'->>'session_id')::uuid)) i;
  perform save_sprint_attempts((v_res->'session'->>'session_id')::uuid, v_att, null, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  perform fact_sprint_entry(v_code, true);

  -- B3 only the class's teacher
  v_raised := false;
  begin perform fact_sprint_overview(v_class);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B3: a student read the overview'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  v_raised := false;
  begin perform fact_sprint_overview(v_class);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B3: another teacher read the overview'; end if;
  n := n + 1;

  -- B4 who practised: a session with no answer does not count
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := fact_sprint_overview(v_class);
  if not (v_res->>'on')::boolean or (v_res->>'practised_today')::int <> 1
     or (v_res->>'practised_week')::int <> 1 then
    raise exception 'FAIL B4: who practised %', v_res;
  end if;
  n := n + 1;

  -- B5 each family by state, and it agrees with 0050's own reading of S1 and S2
  select string_agg(right(f->>'family_id', 1) || ':' || (f->>'strategy') || ':' || (f->>'practising') || ':' || (f->>'fluent'),
                    ' ' order by f->>'family_id')
    into v_got from jsonb_array_elements(v_res->'families') f;
  -- A: S1 fluent, S2 practising. B: S1 in strategy mode, S2 practising.
  if v_got <> 'a:0:1:1 b:1:1:0' then raise exception 'FAIL B5: families %', v_got; end if;
  if (select mode from fact_sprint_families(v_class, v_s1, v_rev, 1, 7) where family_id = 'fact.vfy.b') <> 'strategy' then
    raise exception 'FAIL B5: the fixture''s own reading moved';
  end if;
  n := n + 1;

  -- B6 each student: days practised and families by state, in name order,
  --    with no time, rate or rank among the keys
  select string_agg((s->>'name') || ':' || (s->>'days_practised') || ':' || (s->>'strategy') || ':'
                    || (s->>'practising') || ':' || (s->>'fluent'), ' ' order by ord)
    into v_got from jsonb_array_elements(v_res->'students') with ordinality t(s, ord);
  if v_got <> 'Vfy Alpha:1:1:0:1 Vfy Beta:0:0:2:0' then raise exception 'FAIL B6: students %', v_got; end if;
  if exists (select 1 from jsonb_array_elements(v_res->'students') s, jsonb_object_keys(s) k
              where k not in ('student_id', 'name', 'days_practised', 'last_day',
                              'strategy', 'practising', 'fluent')) then
    raise exception 'FAIL B6: a student row carries something else';
  end if;
  n := n + 1;

  -- B7 a student removed from the class is not listed or counted
  update class_members set removed_at = now() where class_id = v_class and student_id = v_s1;
  v_res := fact_sprint_overview(v_class);
  if (v_res->>'in_class')::int <> 1 or (v_res->>'practised_today')::int <> 0
     or jsonb_array_length(v_res->'students') <> 1 then
    raise exception 'FAIL B7: a removed student %', v_res;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-overview: %/7', n;
end
$vfy$;
