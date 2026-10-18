-- verify-0065.sql — fact_probe_judged, optionally per student (migration 0065;
-- efficiency audit 2026-10 #6, TODOS item 2).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block. Durable-write-free (P7).
-- ⚠ ALSO RE-RUN verify-0045, 0046, 0047 (the teacher-side callers, now on the
-- defaulted form), verify-0050 (§B2 is the judgment bond) and verify-0051.
--
--   §A — one judging function (two arguments, the second defaulted), still
--        SECURITY DEFINER + pinned, service-role only; the two per-student
--        readers pass the student.
--   §B — B1: for every student of a check, the per-student result equals the
--        whole-check result filtered to that student (same rows, same
--        judgments); NULL gives the whole check; the fixture is not vacuous
--        (several students, several judgments).

-- @section A-catalog-posture
-- @expect-rows
select 'judged_one_overload',
       (select count(*) = 1
               and bool_and(pg_get_function_identity_arguments(p.oid) = 'p_probe_id uuid, p_student_id uuid'
                            and p.pronargdefaults = 1)
          from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'fact_probe_judged'),
       'one fact_probe_judged(probe, student default null); the one-argument form is gone';
select 'judged_definer_service_only',
       (select p.prosecdef and p.proconfig @> array['search_path=public']
               and not has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
               and has_function_privilege('service_role', p.oid, 'execute')
          from pg_proc p where p.proname = 'fact_probe_judged'),
       'still SECURITY DEFINER, pinned, service-role only';
select 'per_student_readers_pass_student',
       (select bool_and(p.prosrc ~ 'fact_probe_judged\((p\.id|l\.probe_id), p_student_id\)')
               and count(*) = 2
          from pg_proc p where p.proname in ('fact_sprint_log', 'fact_sprint_families')),
       'fact_sprint_log and fact_sprint_families judge only their student';

-- @section B-per-student-agreement
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('5', 64);
  v_sprint  jsonb := '{"sprint_max_misses": 1, "sprint_minutes": 5,
                       "sprint_step_intervals": [1, 2, 4, 8, 16], "sprint_mastered_step": 2,
                       "sprint_new_facts_per_session": 5, "sprint_working_families": 2,
                       "sprint_reask_gap": 3}'::jsonb;
  v_t       uuid := gen_random_uuid();
  v_students uuid[] := array[gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
  v_class   uuid;
  v_probe   uuid;
  v_items   jsonb;
  v_att     jsonb;
  s         uuid;
  i         integer := 0;
  v_diff    integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0065-t@vfy0065.example', '{}'::jsonb);
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0065-' || row_number() over () || '@vfy0065.example', '{}'::jsonb
    from unnest(v_students) u;
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id = any (v_students);

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0065 class', v_t, 'vfy', current_date + 100) returning id into v_class;
  insert into class_members (class_id, student_id) select v_class, u from unnest(v_students) u;

  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at, sprint)
  values (v_rev, 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.a","fact.vfy.b"], "cumulative": ["fact.vfy.a","fact.vfy.b"], "description": "vfy"}}'::jsonb,
    '{}'::jsonb, 2, 20, '2999-01-01', v_sprint);
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count, strategy)
  select v_rev, 1, 'fact.vfy.' || c, o - 1, 'generated', 'Fam ' || upper(c), 5, 'square', 3, false, 1, 10,
         jsonb_build_object('intro', 'Strategy ' || c, 'lines', '[]'::jsonb, 'example', null)
    from unnest(array['a','b']) with ordinality t(c, o);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken, display_swapped, spoken_swapped)
  select v_rev, 1, 'fact.vfy.' || c || ':' || g, 'fact.vfy.' || c, g, array[g],
         (g + 10)::text, upper(c) || g || ' = __', c || ' ' || g, null, null
    from unnest(array['a','b']) c, generate_series(1, 10) g;

  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_probe := (open_fact_probe(v_class, 7)->>'probe_id')::uuid;
  select items into v_items from class_probes where id = v_probe;

  -- Each student answers differently: right-and-quick, wrong, right-but-slow.
  foreach s in array v_students loop
    i := i + 1;
    perform set_config('request.jwt.claims', json_build_object('sub', s)::text, true);
    select jsonb_agg(jsonb_build_object(
             'n', (e->>'n')::int,
             'typed', case when ((e->>'n')::int + i) % 3 = 0 then '99' else e->>'answer' end,
             'skipped', false, 'interrupted', false,
             'rt_ms', case when ((e->>'n')::int + i) % 3 = 1 then 6000 else 1200 end,
             'offset_ms', (e->>'n')::int * 2000, 'modality', 'keyboard') order by (e->>'n')::int)
      into v_att from jsonb_array_elements(v_items) e;
    perform save_fact_attempts(v_probe, v_att, '{"keyboard": 200, "keypad": null}'::jsonb, true, 'vfy');
  end loop;

  -- B1: per student = the whole check filtered to that student.
  foreach s in array v_students loop
    select count(*) into v_diff from (
      (select * from fact_probe_judged(v_probe, s)
       except all
       select * from fact_probe_judged(v_probe) where student_id = s)
      union all
      (select * from fact_probe_judged(v_probe) where student_id = s
       except all
       select * from fact_probe_judged(v_probe, s))) d;
    if v_diff <> 0 then
      raise exception 'VERIFY FAIL B1: student % differs from the whole check by % row(s)', s, v_diff;
    end if;
  end loop;
  if (select count(*) from fact_probe_judged(v_probe, null))
     <> (select count(*) from fact_probe_judged(v_probe)) then
    raise exception 'VERIFY FAIL B1: NULL is not the whole check';
  end if;
  -- Not vacuous: three students' rows, and more than one judgment.
  if (select count(distinct student_id) from fact_probe_judged(v_probe)) <> 3
     or (select count(distinct judgment) from fact_probe_judged(v_probe)) < 2
     or (select count(*) from fact_probe_judged(v_probe, v_students[1])) = 0 then
    raise exception 'VERIFY FAIL B1: the fixture is vacuous';
  end if;

  raise exception 'EXPECTED ROLLBACK';
end;
$vfy$;
