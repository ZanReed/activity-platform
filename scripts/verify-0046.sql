-- verify-0046.sql — per-family grouping (migration 0046).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0045 idiom): its own synthetic fact-scope
-- revision stamped mirrored_at in 2999, real rows through the real functions,
-- everything rolled back (P7). Nothing depends on which registry revision is
-- mirrored or on roster data.
--
--   §A — the function still has 0045's posture, and names both thresholds.
--   §B — every label, per student and family, at 0.8 and again at 0.9 on the
--        same attempts (the thresholds are the PROBE's); the not-judged floor;
--        met IS fluent; the summary counts; a label without an overall rate;
--        and the pre-0046 keys still present (expand, not replace).

-- @section A-catalog-posture
-- @expect-rows
select 'stat_fn_definer_pinned_internal',
       (select prosecdef and proconfig @> array['search_path=public']
          from pg_proc where proname = 'fact_probe_stat')
       and not has_function_privilege('authenticated', 'fact_probe_stat(uuid)', 'execute')
       and not has_function_privilege('anon', 'fact_probe_stat(uuid)', 'execute'),
       '0045''s posture survives the re-create: definer, pinned, not client-callable';
select 'stat_fn_reads_probe_thresholds',
       (select prosrc ilike '%v_probe.accuracy_threshold%'
               and prosrc ilike '%v_probe.facts_met_threshold%'
               and prosrc ilike '%family_summary%'
          from pg_proc where proname = 'fact_probe_stat'),
       'the per-family label reads the thresholds copied onto the probe at open';

-- @section B-family-labels
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('f', 64);
  v_teacher uuid := gen_random_uuid();
  v_s       uuid[] := array[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
  v_class   uuid;
  v_probe   uuid;
  v_items   jsonb;
  v_stat    jsonb;
  v_got     jsonb;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0046-' || row_number() over () || '@vfy0046.example', '{}'::jsonb
    from unnest(array[v_teacher] || v_s) u;
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id = any (v_s);
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0046 class', v_teacher, 'vfy') returning id into v_class;
  insert into class_members (class_id, student_id) select v_class, u from unnest(v_s) u;

  -- Three families: A and B have 5 facts (5 items each), C has 3 (its minimum
  -- is 3). Thresholds 0.8 / 0.8, as after the 2026-10-05 revision.
  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at)
  values (v_rev, 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.a","fact.vfy.b","fact.vfy.c"], "cumulative": ["fact.vfy.a","fact.vfy.b","fact.vfy.c"], "description": null}}'::jsonb,
    '{}'::jsonb, 3, 13, '2999-01-01');
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  values (v_rev, 1, 'fact.vfy.a', 0, 'generated', 'Fam A', 5, 'square', 3, false, 1, 5),
         (v_rev, 1, 'fact.vfy.b', 1, 'generated', 'Fam B', 5, 'square', 3, false, 1, 5),
         (v_rev, 1, 'fact.vfy.c', 2, 'generated', 'Fam C', 5, 'cube',   3, false, 1, 3);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken)
  select v_rev, 1, 'fact.vfy.' || fam || ':' || g, 'fact.vfy.' || fam, g, array[g],
         (g + 10)::text, upper(fam) || g || ' = __', fam || ' ' || g
    from (values ('a', 5), ('b', 5), ('c', 3)) f(fam, cnt), generate_series(1, f.cnt) g;

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_probe := (open_fact_probe(v_class, 7)->>'probe_id')::uuid;
  -- Each item with its position WITHIN its family (k = 1..5), so a fixture can
  -- say "the first 4 of family B".
  select jsonb_agg(x.e || jsonb_build_object('k', x.k))
    into v_items
    from (select e,
                 row_number() over (partition by e->>'family_id' order by (e->>'n')::int) as k
            from jsonb_array_elements((select items from class_probes where id = v_probe)) e) x;
  if jsonb_array_length(v_items) <> 13 then raise exception 'FAIL fixture: % items', jsonb_array_length(v_items); end if;

  -- A 100 ms/keystroke baseline: "quick" is net 1000 ms, "slow" is net 8000 ms.
  -- Student 1: A 5 quick-right · B 4 quick-right + 1 wrong · C 3 quick-right
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[1])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int,
       'typed', case when e->>'family_id' = 'fact.vfy.b' and (e->>'k')::int = 5 then '99' else e->>'answer' end,
       'skipped', false, 'interrupted', false,
       'rt_ms', 1000 + 100 * 3, 'offset_ms', 0, 'modality', 'keyboard'))
     from jsonb_array_elements(v_items) e),
    '{"keyboard": 100}'::jsonb, true);

  -- Student 2: A 5 right, only 3 quick · B 3 right + 2 wrong · C 2 right + 1 wrong
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[2])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int,
       'typed', case when e->>'family_id' = 'fact.vfy.b' and (e->>'k')::int >= 4 then '99'
                     when e->>'family_id' = 'fact.vfy.c' and (e->>'k')::int = 3 then '99'
                     else e->>'answer' end,
       'skipped', false, 'interrupted', false,
       'rt_ms', case when e->>'family_id' = 'fact.vfy.a' and (e->>'k')::int >= 4 then 8000 else 1000 end + 100 * 3,
       'offset_ms', 0, 'modality', 'keyboard'))
     from jsonb_array_elements(v_items) e),
    '{"keyboard": 100}'::jsonb, true);

  -- Student 3: A 3 interrupted (2 counted, under the minimum of 5) · B every
  -- answer right but over the ceiling (a timeout is never correct) · C 3 quick-right
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[3])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int,
       'typed', case when e->>'family_id' = 'fact.vfy.a' and (e->>'k')::int <= 3 then '' else e->>'answer' end,
       'skipped', false,
       'interrupted', e->>'family_id' = 'fact.vfy.a' and (e->>'k')::int <= 3,
       'rt_ms', case when e->>'family_id' = 'fact.vfy.b' then 20000 else 1000 end + 100 * 3,
       'offset_ms', 0,
       'modality', case when e->>'family_id' = 'fact.vfy.a' and (e->>'k')::int <= 3 then null else 'keyboard' end))
     from jsonb_array_elements(v_items) e),
    '{"keyboard": 100}'::jsonb, true);

  -- Student 4: answers ONLY family C (3 quick-right) and stops — no overall
  -- rate (3 attempts, 3 seconds), but C has met its own minimum.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[4])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int, 'typed', e->>'answer',
       'skipped', false, 'interrupted', false, 'rt_ms', 1000 + 100 * 3, 'offset_ms', 0,
       'modality', 'keyboard'))
     from jsonb_array_elements(v_items) e where e->>'family_id' = 'fact.vfy.c'),
    '{"keyboard": 100}'::jsonb);

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_stat := fact_probe_stat(v_probe);

  -- B1 every label, per student and family, at 0.8 / 0.8
  select jsonb_object_agg(array_position(v_s, (s->>'student_id')::uuid) || ':' || right(f->>'family_id', 1),
                          coalesce(f->>'group', 'not_judged'))
    into v_got
    from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f;
  if v_got <> '{"1:a": "fluent", "1:b": "fluent", "1:c": "fluent",
                "2:a": "slow", "2:b": "needs_strategy", "2:c": "needs_strategy",
                "3:a": "not_judged", "3:b": "needs_strategy", "3:c": "fluent",
                "4:a": "not_judged", "4:b": "not_judged", "4:c": "fluent"}'::jsonb then
    raise exception 'FAIL B1: labels %', v_got;
  end if;
  n := n + 1;

  -- B2 the numbers behind a label: right and quick-and-right out of counted
  if (select jsonb_build_array(f->'counted', f->'right', f->'met')
        from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
       where (s->>'student_id')::uuid = v_s[2] and f->>'family_id' = 'fact.vfy.a') <> '[5, 5, 3]'::jsonb
     or (select jsonb_build_array(f->'counted', f->'right', f->'met')
           from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
          where (s->>'student_id')::uuid = v_s[3] and f->>'family_id' = 'fact.vfy.b') <> '[5, 0, 0]'::jsonb
     or (select jsonb_build_array(f->'counted', f->'right', f->'met')
           from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
          where (s->>'student_id')::uuid = v_s[3] and f->>'family_id' = 'fact.vfy.a') <> '[2, 2, 2]'::jsonb then
    raise exception 'FAIL B2: the counts behind a label';
  end if;
  n := n + 1;

  -- B3 met IS fluent; not met is slow or needs strategy; no label is not judged
  if exists (select 1
       from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
      where f->>'status' <> case when f->>'group' is null then 'not_judged'
                                 when f->>'group' = 'fluent' then 'met' else 'not_met' end) then
    raise exception 'FAIL B3: status disagrees with the label';
  end if;
  n := n + 1;

  -- B4 the summary line's counts are the labels, counted
  select jsonb_object_agg(array_position(v_s, (s->>'student_id')::uuid)::text, s->'family_summary')
    into v_got from jsonb_array_elements(v_stat->'students') s;
  if v_got <> jsonb_build_object(
       '1', '{"fluent": 3, "slow": 0, "needs_strategy": 0, "not_judged": 0}'::jsonb,
       '2', '{"fluent": 0, "slow": 1, "needs_strategy": 2, "not_judged": 0}'::jsonb,
       '3', '{"fluent": 1, "slow": 0, "needs_strategy": 1, "not_judged": 1}'::jsonb,
       '4', '{"fluent": 1, "slow": 0, "needs_strategy": 0, "not_judged": 2}'::jsonb) then
    raise exception 'FAIL B4: summaries %', v_got;
  end if;
  n := n + 1;

  -- B5 a family is labelled on its OWN minimum: student 4 has no overall rate
  if (select (s->>'has_rate')::boolean from jsonb_array_elements(v_stat->'students') s
       where (s->>'student_id')::uuid = v_s[4]) is not false then
    raise exception 'FAIL B5: fixture — student 4 was meant to have no rate';
  end if;
  n := n + 1;

  -- B6 the thresholds are the PROBE's: the same attempts at 0.9 — 4 of 5 right
  --    is no longer accurate enough, and 3 of 3 still is
  update class_probes set accuracy_threshold = 0.9 where id = v_probe;
  v_stat := fact_probe_stat(v_probe);
  if (select f->>'group' from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
       where (s->>'student_id')::uuid = v_s[1] and f->>'family_id' = 'fact.vfy.b') <> 'needs_strategy'
     or (select f->>'status' from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
          where (s->>'student_id')::uuid = v_s[1] and f->>'family_id' = 'fact.vfy.b') <> 'not_met'
     or (select f->>'group' from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
          where (s->>'student_id')::uuid = v_s[1] and f->>'family_id' = 'fact.vfy.c') <> 'fluent' then
    raise exception 'FAIL B6: the label did not follow the probe''s threshold';
  end if;
  n := n + 1;

  -- B7 expand, not replace: the keys the page deployed before 0046 reads are
  --    still there (the old per-student group, the class group counts)
  if not (v_stat->'class' ? 'groups') or not (v_stat->'class' ? 'verdict')
     or exists (select 1 from jsonb_array_elements(v_stat->'students') s
                 where not (s ?& array['group', 'families', 'family_summary', 'rate', 'status'])) then
    raise exception 'FAIL B7: a pre-0046 key is missing';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-family-labels: %/7', n;
end
$vfy$;
