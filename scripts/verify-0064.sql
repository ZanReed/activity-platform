-- verify-0064.sql — five read-path costs (migration 0064;
-- docs/reviews/2026-10-efficiency-audit.md #1, #2, #3, #10, #11).
--
-- Run with `pnpm verify:auth --target live|local`. §B and §C are
-- self-fixturing EXPECTED-ROLLBACK blocks. Durable-write-free (P7).
-- ⚠ ALSO RE-RUN verify-0050, verify-0051 (fact_sprint_entry), verify-0061
-- (class_progress, activity_progress, class_misconceptions — its agreement rows
-- hold the numbers) and verify-0036 (get_activity_analytics).
--
-- No wall-clock rows on purpose (decision 7): the live instance is ~40× slower
-- than local on the same query, so a millisecond ceiling either never fires or
-- fires at random. What is pinned instead is the SHAPE that made each cost:
--
--   §A — catalog posture: the helper is SECURITY DEFINER, pinned, service-role
--        only; the five re-created functions keep their grants; both indexes
--        exist; and the bodies no longer contain the costly shapes (the
--        per-session score loop, the correlated per-cell subqueries, the view
--        reads, the answer-carrying select).
--   §B — B1: fact_sprint_best equals max over finished sessions of
--        fact_sprint_score, ignores unfinished sessions and re-asks, and is
--        NULL with no finished session.
--   §C — C3: get_activity_analytics' latest-attempt set agrees with the
--        section_checks_latest view (0035) for the activity: students, last
--        check time and the latest verdict count — with another activity's
--        checks present, and a re-check that changes which attempt is latest.

-- @section A-catalog-posture
-- @expect-rows
select 'best_definer_service_only',
       (select p.prosecdef and p.proconfig @> array['search_path=public']
               and not has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
          from pg_proc p where p.proname = 'fact_sprint_best'),
       'fact_sprint_best: SECURITY DEFINER, pinned, not client-callable';
select 'recreated_grants_kept',
       (select count(*) = 5
               and bool_and(p.prosecdef
                            and p.proconfig @> array['search_path=public']
                            and has_function_privilege('authenticated', p.oid, 'execute')
                            and not has_function_privilege('anon', p.oid, 'execute'))
          from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public'
           and p.proname in ('fact_sprint_entry', 'class_progress', 'activity_progress',
                             'class_misconceptions', 'get_activity_analytics')),
       'the five re-created functions: one overload each, definer, signed-in only';
select 'indexes_present',
       exists (select 1 from pg_indexes where schemaname = 'public'
                 and indexname = 'section_checks_created_brin'
                 and indexdef ilike '%using brin (created_at)%')
       and exists (select 1 from pg_indexes where schemaname = 'public'
                 and indexname = 'section_checks_version_idx'
                 and indexdef ilike '%(activity_version_id)%'),
       'BRIN on created_at, btree on activity_version_id';
select 'entry_best_is_one_pass',
       (select p.prosrc ilike '%fact_sprint_best(v_class.id, v_uid)%'
               and p.prosrc not ilike '%lateral fact_sprint_score%'
          from pg_proc p where p.proname = 'fact_sprint_entry'),
       'fact_sprint_entry no longer scores every session once per session';
select 'progress_no_correlated_cells',
       (select count(*) = 2
               and bool_and(p.prosrc !~ 'from per_version pv\s+where pv\.student_id'
                            and p.prosrc not ilike '%select sc.*%')
          from pg_proc p where p.proname in ('class_progress', 'activity_progress')),
       'class_progress / activity_progress: no per-student subqueries over per_version, no sc.*';
select 'misconceptions_no_answers_in_sorts',
       (select p.prosrc not ilike '%select sc.*%'
               and p.prosrc not ilike '%c.responses%'
               and p.prosrc ilike '%join section_checks rs on rs.id = it.check_id%'
          from pg_proc p where p.proname = 'class_misconceptions'),
       'class_misconceptions reads answers back by id only where it shows them';
select 'analytics_scoped_latest',
       (select p.prosrc not ilike '%from section_checks_latest%'
               and p.prosrc ~ 'where sc\.activity_id = p_activity_id\s+order by sc\.student_id, sc\.activity_version_id, sc\.section_id,\s+sc\.attempt_number desc, sc\.created_at desc'
          from pg_proc p where p.proname = 'get_activity_analytics'),
       'get_activity_analytics filters by activity before the distinct, in the view''s order';
select 'view_kept_for_prune',
       exists (select 1 from pg_views where schemaname = 'public'
                 and viewname = 'section_checks_latest'),
       'section_checks_latest still exists (0035''s prune bond)';

-- @section B-sprint-best
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('6', 64);
  v_sprint  jsonb := '{"sprint_max_misses": 1, "sprint_minutes": 5,
                       "sprint_step_intervals": [1, 2, 4, 8, 16], "sprint_mastered_step": 2,
                       "sprint_new_facts_per_session": 5, "sprint_working_families": 2,
                       "sprint_reask_gap": 3}'::jsonb;
  v_t     uuid := gen_random_uuid();
  v_s     uuid := gen_random_uuid();   -- five finished sessions + one open
  v_e     uuid := gen_random_uuid();   -- only an open session
  v_class uuid;
  v_best  integer;
  v_want  integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0064-t@vfy0064.example', '{}'::jsonb),
         (v_s, 'vfy0064-s@vfy0064.example', '{}'::jsonb),
         (v_e, 'vfy0064-e@vfy0064.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_t;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0064 class', v_t, 'vfy', current_date + 100)
  returning id into v_class;
  insert into class_members (class_id, student_id) values (v_class, v_s), (v_class, v_e);

  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at, sprint)
  values (v_rev, 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.a"], "cumulative": ["fact.vfy.a"], "description": "vfy"}}'::jsonb,
    '{}'::jsonb, 1, 10, '2999-01-01', v_sprint);

  -- Six sessions for v_s (day 6 left open), one open session for v_e.
  insert into sprint_sessions (class_id, student_id, practice_day, ordinal, year_level,
    registry_rev, fact_grammar_rev, ceiling_s, practice_window, sprint, families, items,
    item_count, baseline_keyboard_ms, finished_at, keep_until)
  select v_class, st, current_date - d, 1, 7, v_rev, 1, 15, 10, v_sprint,
         '[{"family_id": "fact.vfy.a", "criterion_s": 3}, {"family_id": "fact.vfy.b", "criterion_s": 2}]'::jsonb,
         '[{}]'::jsonb, 20, 700,
         case when st = v_s and d < 6 then now() - (d || ' days')::interval end,
         current_date + 300
    from (values (v_s), (v_e)) x(st), generate_series(1, 6) d
   where st = v_s or d = 1;

  -- Attempts with different quick-and-right counts per session; every 4th a
  -- re-ask (never counted), a mix of fast/slow, right/wrong, skipped.
  insert into sprint_attempts (session_id, seq, reask, student_id, fact_id, family_id, shown,
                               correct, typed, skipped, interrupted, rt_ms, offset_ms, modality)
  select ss.id, q, q % 4 = 0, ss.student_id, 'f' || q,
         case when q % 2 = 0 then 'fact.vfy.a' else 'fact.vfy.b' end, 'canonical',
         (q + ss.practice_day - current_date) % 3 <> 0, '12', q % 11 = 0, false,
         1000 + ((q * 37 + (current_date - ss.practice_day) * 500) % 3000), q * 2000, 'keyboard'
    from sprint_sessions ss, generate_series(1, 20) q
   where ss.class_id = v_class;

  select max(q.quick_right) into v_want
    from sprint_sessions s cross join lateral fact_sprint_score(s.id) q
   where s.class_id = v_class and s.student_id = v_s and s.finished_at is not null;
  v_best := fact_sprint_best(v_class, v_s);
  if v_want is null or v_best is distinct from v_want then
    raise exception 'VERIFY FAIL B1: best % vs fact_sprint_score max %', v_best, v_want;
  end if;
  -- The open session must not count: give it every answer quick and right.
  update sprint_attempts a set correct = true, skipped = false, rt_ms = 50, reask = false
    from sprint_sessions s
   where s.id = a.session_id and s.student_id = v_s and s.finished_at is null;
  if fact_sprint_best(v_class, v_s) is distinct from v_want then
    raise exception 'VERIFY FAIL B1: an unfinished session changed the best';
  end if;
  if fact_sprint_best(v_class, v_e) is not null then
    raise exception 'VERIFY FAIL B1: no finished session should give NULL';
  end if;

  raise exception 'EXPECTED ROLLBACK';
end;
$vfy$;

-- @section C-analytics-latest
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();
  v_s1  uuid := gen_random_uuid();
  v_s2  uuid := gen_random_uuid();
  v_a   uuid; v_a1 uuid; v_a2 uuid;
  v_b   uuid; v_b1 uuid;
  v_res jsonb;
  v_doc jsonb := '{"sections": []}'::jsonb;
  v_n   integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t,  'vfy0064c-t@vfy0064.example',  '{}'::jsonb),
         (v_s1, 'vfy0064c-s1@vfy0064.example', '{}'::jsonb),
         (v_s2, 'vfy0064c-s2@vfy0064.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_t;

  insert into activities (owner_id, title, slug, status) values (v_t, 'A', 'vfy-0064-a', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 1, v_doc, v_t) returning id into v_a1;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 2, v_doc, v_t) returning id into v_a2;
  update activities set current_version_id = v_a2 where id = v_a;
  insert into activities (owner_id, title, slug, status) values (v_t, 'B', 'vfy-0064-b', 'published') returning id into v_b;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_b, 1, v_doc, v_t) returning id into v_b1;
  update activities set current_version_id = v_b1 where id = v_b;

  -- A: s1 checks section x on v1 twice (attempt 2 changes the verdicts), then v2;
  -- s2 checks v2 once. B: a later check by s2 (must not leak into A's totals).
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts, created_at)
  values
    (v_s1, v_a, v_a1, 'x', 1, '{}', '{"i1": {"verdict": "incorrect"}, "i2": {"verdict": "incorrect"}}', now() - interval '5 hours'),
    (v_s1, v_a, v_a1, 'x', 2, '{}', '{"i1": {"verdict": "correct"}}',                                     now() - interval '4 hours'),
    (v_s1, v_a, v_a2, 'x', 1, '{}', '{"i1": {"verdict": "correct"}, "i2": {"verdict": "recorded"}}',     now() - interval '3 hours'),
    (v_s2, v_a, v_a2, 'x', 1, '{}', '{"i1": {"verdict": "incorrect"}}',                                   now() - interval '2 hours'),
    (v_s2, v_b, v_b1, 'x', 1, '{}', '{"i1": {"verdict": "correct"}}',                                     now() - interval '1 hour');

  perform set_config('request.jwt.claims',
                     json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_res := get_activity_analytics(v_a);
  execute 'reset role';

  if (v_res->'totals'->>'students')::integer
       is distinct from (select count(distinct student_id)::integer from section_checks_latest where activity_id = v_a) then
    raise exception 'VERIFY FAIL C3: students % vs view', v_res->'totals'->>'students';
  end if;
  if (v_res->'totals'->>'last_check_at')::timestamptz
       is distinct from (select max(created_at) from section_checks_latest where activity_id = v_a) then
    raise exception 'VERIFY FAIL C3: last_check_at % vs view', v_res->'totals'->>'last_check_at';
  end if;
  select coalesce(sum(jsonb_object_length_count), 0)::integer into v_n
    from (select (select count(*) from jsonb_each(l.verdicts)) as jsonb_object_length_count
            from section_checks_latest l where l.activity_id = v_a) x;
  if (select sum((k->>'verdicts_latest')::integer) from jsonb_array_elements(v_res->'keys') k)
       is distinct from v_n then
    raise exception 'VERIFY FAIL C3: verdicts_latest % vs view %',
      (select sum((k->>'verdicts_latest')::integer) from jsonb_array_elements(v_res->'keys') k), v_n;
  end if;
  -- The fixture is not vacuous: 3 latest rows (s1·v1, s1·v2, s2·v2), 4 verdicts.
  if v_n <> 4 or (v_res->'totals'->>'students')::integer <> 2 then
    raise exception 'VERIFY FAIL C3: fixture expected 4 latest verdicts / 2 students, got % / %',
      v_n, v_res->'totals'->>'students';
  end if;

  raise exception 'EXPECTED ROLLBACK';
end;
$vfy$;
