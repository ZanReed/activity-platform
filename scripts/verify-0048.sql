-- verify-0048.sql — the school year's end and the DISARMED practice prune
-- (migration 0048; practice-blocks.md → "Roll-up and prune: as ruled").
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0045 idiom): its own synthetic fact-scope
-- revision stamped mirrored_at in 2999, real functions, everything rolled back
-- (P7). The prune's report is GLOBAL, so §B reads a dry-run baseline first and
-- asserts only the difference its own fixtures make; an armed run inside the
-- block touches live candidates too, and the rollback undoes it.
--
--   §A — catalog posture: the columns, the backfill's backstop holds on every
--        live row, the prune is definer + service-role only + dry-run by
--        default, and NO cron job names it (arming flips that row — P5).
--   §B — the end date's refusals; keep_until at open (grace, backstop); the
--        prune's matrix at PRODUCTION values (P3): dry-run deletes nothing, an
--        open check is never a candidate, a passed keep_until is, a class
--        deleted 29 days ago is not and 31 days ago is, a due check is
--        finalised before its data goes, an armed run removes exactly the
--        candidates' sessions and attempts and keeps the class result, audits
--        the counts, a second run finds nothing, and the teacher's read of a
--        pruned check lists no students.

-- @section A-catalog-posture
-- @expect-rows
select 'class_year_end_column',
       exists (select 1 from information_schema.columns
                where table_name = 'classes' and column_name = 'school_year_ends_on'
                  and data_type = 'date' and is_nullable = 'YES'),
       'classes.school_year_ends_on: a date, empty until the teacher gives it (RP-1, RP-2)';
select 'probe_keep_until_and_pruned_at',
       exists (select 1 from information_schema.columns
                where table_name = 'class_probes' and column_name = 'keep_until'
                  and data_type = 'date' and is_nullable = 'NO')
       and exists (select 1 from information_schema.columns
                    where table_name = 'class_probes' and column_name = 'pruned_at'
                      and is_nullable = 'YES'),
       'every check carries keep_until; pruned_at is set only by the prune';
select 'backstop_holds_on_every_live_check',
       not exists (select 1 from class_probes
                    where keep_until > (opened_at at time zone 'UTC')::date + 400),
       'no check keeps its data more than 400 days after it opened (RP-8)';
select 'pruned_only_after_close',
       not exists (select 1 from class_probes where pruned_at is not null and closed_at is null),
       'a pruned check is always a finalised one';
select 'prune_service_role_only',
       (select prosecdef and proconfig @> array['search_path=public']
          from pg_proc where proname = 'prune_fact_practice')
       and not has_function_privilege('authenticated', 'prune_fact_practice(boolean)', 'execute')
       and not has_function_privilege('anon', 'prune_fact_practice(boolean)', 'execute')
       and has_function_privilege('service_role', 'prune_fact_practice(boolean)', 'execute'),
       'a deletion primitive over student work is never client-callable (0009)';
select 'prune_dry_run_by_default',
       (select pg_get_function_arguments(oid) from pg_proc where proname = 'prune_fact_practice')
         = 'p_dry_run boolean DEFAULT true',
       'calling it with no argument deletes nothing';
select 'prune_is_unscheduled',
       not exists (select 1 from cron.job where command ilike '%prune_fact_practice%'),
       'DISARMED: no cron job runs the prune. Arming flips this row, with the author''s yes';
select 'year_end_rpc_signed_in_only',
       has_function_privilege('authenticated', 'set_class_year_end(uuid,date)', 'execute')
       and not has_function_privilege('anon', 'set_class_year_end(uuid,date)', 'execute')
       and (select bool_and(has_function_privilege('authenticated', f, 'execute')
                            and not has_function_privilege('anon', f, 'execute'))
              from unnest(array['open_fact_probe(uuid,integer)', 'fact_probe_overview(uuid)',
                                'fact_probe_results(uuid)']) f),
       'the teacher''s write and the re-created reads are signed-in only';

-- @section B-prune
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev      text := repeat('8', 64);
  v_teacher  uuid := gen_random_uuid();
  v_other    uuid := gen_random_uuid();
  v_s1       uuid := gen_random_uuid();
  v_s2       uuid := gen_random_uuid();
  v_s3       uuid := gen_random_uuid();
  v_a        uuid;  -- class A: pruned by its year end
  v_b        uuid;  -- class B: pruned because it was deleted
  v_c        uuid;  -- class C: the control, never a candidate
  v_code_a   text;
  v_pa       uuid;
  v_pb       uuid;
  v_pc       uuid;
  v_base     jsonb;
  v_res      jsonb;
  v_snap_a   jsonb;
  v_raised   boolean;
  n          integer := 0;
begin
  -- ---- fixtures ---------------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0048-' || row_number() over () || '@vfy0048.example', '{}'::jsonb
    from unnest(array[v_teacher, v_other, v_s1, v_s2, v_s3]) u;
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id in (v_s1, v_s2, v_s3);

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0048 A', v_teacher, 'vfy') returning id, join_code into v_a, v_code_a;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0048 B', v_teacher, 'vfy') returning id into v_b;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0048 C', v_teacher, 'vfy') returning id into v_c;
  insert into class_members (class_id, student_id) values (v_a, v_s1), (v_b, v_s2), (v_c, v_s3);

  -- One family of 30 facts; Year 7 = 30 items.
  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at)
  values (v_rev, 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.a"], "cumulative": ["fact.vfy.a"], "description": "vfy"}}'::jsonb,
    '{}'::jsonb, 1, 30, '2999-01-01');
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  values (v_rev, 1, 'fact.vfy.a', 0, 'generated', 'Fam A', 5, 'square', 3, false, 1, 30);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken, display_swapped, spoken_swapped)
  select v_rev, 1, 'fact.vfy.a:' || g, 'fact.vfy.a', g, array[g],
         (g + 10)::text, 'A' || g || ' = __', 'a ' || g, null, null
    from generate_series(1, 30) g;

  v_base := prune_fact_practice();

  -- B1 no check opens without the class's school-year end (RP-2)
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_raised := false;
  begin perform open_fact_probe(v_a, 7);
  exception when others then v_raised := sqlerrm = 'school_year_end_missing'; end;
  if not v_raised then raise exception 'FAIL B1: a check opened with no school-year end'; end if;
  n := n + 1;

  -- B2 set_class_year_end: only the class's teacher; today up to 400 days ahead
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  v_raised := false;
  begin perform set_class_year_end(v_a, current_date + 100);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B2: another teacher set the end date'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_raised := false;
  begin perform set_class_year_end(v_a, current_date - 1);
  exception when others then v_raised := sqlerrm = 'year_end_out_of_range'; end;
  if not v_raised then raise exception 'FAIL B2: a past end date was accepted'; end if;
  v_raised := false;
  begin perform set_class_year_end(v_a, current_date + 401);
  exception when others then v_raised := sqlerrm = 'year_end_out_of_range'; end;
  if not v_raised then raise exception 'FAIL B2: an end date 401 days ahead was accepted'; end if;
  if set_class_year_end(v_a, current_date + 400) <> current_date + 400
     or set_class_year_end(v_a, current_date + 100) <> current_date + 100
     or (select school_year_ends_on from classes where id = v_a) <> current_date + 100 then
    raise exception 'FAIL B2: the end date was not stored';
  end if;
  n := n + 1;

  -- B3 a class whose year has ended opens nothing until the date moves on
  update classes set school_year_ends_on = current_date - 1 where id = v_a;
  v_raised := false;
  begin perform open_fact_probe(v_a, 7);
  exception when others then v_raised := sqlerrm = 'school_year_ended'; end;
  if not v_raised then raise exception 'FAIL B3: a check opened after the year ended'; end if;
  perform set_class_year_end(v_a, current_date + 100);
  n := n + 1;

  -- B4 keep_until at open: end + 30 (RP-3), capped at 400 days (RP-8); the
  --    class's date moving later never moves an opened check's
  v_res := open_fact_probe(v_a, 7);
  v_pa := (v_res->>'probe_id')::uuid;
  perform set_class_year_end(v_b, current_date + 390);
  v_pb := (open_fact_probe(v_b, 7)->>'probe_id')::uuid;
  perform set_class_year_end(v_c, current_date + 10);
  v_pc := (open_fact_probe(v_c, 7)->>'probe_id')::uuid;
  perform set_class_year_end(v_c, current_date + 300);
  if (select keep_until from class_probes where id = v_pa) <> current_date + 130
     or (v_res->>'keep_until')::date <> current_date + 130
     or (select keep_until from class_probes where id = v_pb) <> current_date + 400
     or (select keep_until from class_probes where id = v_pc) <> current_date + 40 then
    raise exception 'FAIL B4: keep_until at open';
  end if;
  n := n + 1;

  -- Saves: 3 attempts in A, 2 in B, 1 in C, each through the real RPC.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  perform save_fact_attempts(v_pa,
    (select jsonb_agg(jsonb_build_object('n', g, 'typed', '1', 'skipped', false, 'interrupted', false,
                      'rt_ms', 1500, 'offset_ms', g * 2000, 'modality', 'keyboard')) from generate_series(1, 3) g),
    '{"keyboard": 200, "keypad": null}'::jsonb, false, 'vfy');
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  perform save_fact_attempts(v_pb,
    (select jsonb_agg(jsonb_build_object('n', g, 'typed', '1', 'skipped', false, 'interrupted', false,
                      'rt_ms', 1500, 'offset_ms', g * 2000, 'modality', 'keyboard')) from generate_series(1, 2) g),
    '{"keyboard": 200, "keypad": null}'::jsonb, false, 'vfy');
  perform set_config('request.jwt.claims', json_build_object('sub', v_s3)::text, true);
  perform save_fact_attempts(v_pc,
    (select jsonb_agg(jsonb_build_object('n', 1, 'typed', '1', 'skipped', false, 'interrupted', false,
                      'rt_ms', 1500, 'offset_ms', 2000, 'modality', 'keyboard'))),
    '{"keyboard": 200, "keypad": null}'::jsonb, false, 'vfy');
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);

  -- B5 an OPEN check is never a candidate, even past its keep_until
  update class_probes set keep_until = current_date - 1 where id = v_pa;
  v_res := prune_fact_practice();
  if (v_res->>'checks')::int <> (v_base->>'checks')::int then
    raise exception 'FAIL B5: an open check became a candidate %', v_res;
  end if;
  n := n + 1;

  -- B6 closed and past keep_until: a candidate — and a dry run deletes nothing
  perform close_fact_probe(v_pa);
  perform close_fact_probe(v_pc);
  v_snap_a := (select snapshot from class_probes where id = v_pa);
  v_res := prune_fact_practice();
  if (v_res->>'checks')::int <> (v_base->>'checks')::int + 1
     or (v_res->>'by_year_end')::int <> (v_base->>'by_year_end')::int + 1
     or (v_res->>'sessions')::int <> (v_base->>'sessions')::int + 1
     or (v_res->>'attempts')::int <> (v_base->>'attempts')::int + 3
     or (v_res->>'dry_run')::boolean is not true
     or (select count(*) from fact_attempts a join practice_sessions s on s.id = a.session_id
          where s.probe_id = v_pa) <> 3
     or (select pruned_at from class_probes where id = v_pa) is not null then
    raise exception 'FAIL B6: the dry run %', v_res;
  end if;
  n := n + 1;

  -- B7 a deleted class: 29 days is not enough, 31 days is (RP-5); its check is
  --    DUE (closes_at passed) but not finalised
  update class_probes set opened_at = now() - interval '9 days', closes_at = now() - interval '2 days'
   where id = v_pb;
  update classes set deleted_at = now() - interval '29 days' where id = v_b;
  if (prune_fact_practice()->>'checks')::int <> (v_base->>'checks')::int + 1 then
    raise exception 'FAIL B7: a class deleted 29 days ago was a candidate';
  end if;
  update classes set deleted_at = now() - interval '31 days' where id = v_b;
  v_res := prune_fact_practice();
  if (v_res->>'checks')::int <> (v_base->>'checks')::int + 2
     or (v_res->>'by_class_deleted')::int <> (v_base->>'by_class_deleted')::int + 1 then
    raise exception 'FAIL B7: a class deleted 31 days ago was not a candidate %', v_res;
  end if;
  n := n + 1;

  -- B8 ARMED, at production values: exactly the candidates' sessions and
  --    attempts go; the control keeps its data; snapshots kept; B finalised
  --    first; pruned_at stamped; one audit row per check with its counts
  v_res := prune_fact_practice(false);
  if (v_res->>'checks')::int <> (v_base->>'checks')::int + 2
     or (v_res->>'attempts')::int < 5
     or exists (select 1 from practice_sessions where probe_id in (v_pa, v_pb))
     or exists (select 1 from fact_attempts where student_id in (v_s1, v_s2))
     or (select count(*) from fact_attempts where student_id = v_s3) <> 1
     or (select count(*) from practice_sessions where probe_id = v_pc) <> 1
     or (select pruned_at from class_probes where id = v_pc) is not null
     or (select count(*) from class_probes where id in (v_pa, v_pb) and pruned_at is not null) <> 2
     or (select snapshot from class_probes where id = v_pa) is distinct from v_snap_a
     or (select snapshot from class_probes where id = v_pb) is null
     or (select closed_at from class_probes where id = v_pb) is null then
    raise exception 'FAIL B8: the armed run %', v_res;
  end if;
  if (select string_agg((metadata->>'reason') || ':' || (metadata->>'sessions') || ':' || (metadata->>'attempts'),
                        ',' order by metadata->>'reason')
        from audit_log where action = 'fact_practice.prune' and target_id in (v_pa, v_pb))
     <> 'class_deleted:1:2,year_end:1:3' then
    raise exception 'FAIL B8: the audit rows';
  end if;
  n := n + 1;

  -- B9 a second run finds nothing
  if (prune_fact_practice(false)->>'checks')::int <> 0 or (prune_fact_practice()->>'checks')::int <> 0 then
    raise exception 'FAIL B9: a second run found candidates';
  end if;
  n := n + 1;

  -- B10 the teacher's read of a pruned check: the class result, the dates, NO
  --     student rows (not every member as "did not start"); the overview
  --     carries pruned_at and the class's end date
  v_res := fact_probe_results(v_pa);
  if jsonb_array_length(v_res->'students') <> 0
     or v_res->'class' is distinct from v_snap_a
     or (v_res->'probe'->>'pruned_at') is null
     or (v_res->'probe'->>'keep_until')::date <> current_date - 1 then
    raise exception 'FAIL B10: results of a pruned check %', v_res;
  end if;
  v_res := fact_probe_overview(v_a);
  if (v_res->>'school_year_ends_on')::date <> current_date + 100
     or (select p->>'pruned_at' from jsonb_array_elements(v_res->'probes') p
          where (p->>'id')::uuid = v_pa) is null then
    raise exception 'FAIL B10: the overview %', v_res;
  end if;
  if jsonb_array_length(fact_probe_results(v_pc)->'students') <> 1 then
    raise exception 'FAIL B10: the control check lost its student row';
  end if;
  n := n + 1;

  -- B11 the student whose data went sees no check, never a half-state
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  if fact_probe_entry(v_code_a)->>'state' <> 'none_open' then
    raise exception 'FAIL B11: the student entry after a prune';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-prune: %/11', n;
end
$vfy$;
