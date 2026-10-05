-- verify-0045.sql — the class-entry number-facts check (migration 0045).
--
-- Run with `pnpm verify:auth --target live|local`. §B–§D are self-fixturing
-- EXPECTED-ROLLBACK blocks (the verify-0042/0043/0044 idiom): real rows through
-- the real functions, claims-switched calls, everything rolled back — durable-
-- write-free on every path (P7). Each block mirrors its OWN synthetic
-- fact-scope revision, stamped mirrored_at in the year 2999 so it is "the
-- latest" whatever a database really holds; no row here depends on which
-- registry revision is mirrored, on roster data, or on the time of day.
--
--   §A — catalog posture: three tables, RLS forced, NO policy, no client
--        privilege; the internal functions are not client-callable; the six
--        RPCs are callable signed-in and never anonymously; the save takes
--        FOR SHARE and the close FOR UPDATE; the purge keeps its NOTICE prefix
--        and names the practice tables.
--   §B — the allocation (their items 20, 22): equal shares, largest
--        remainder, a family smaller than its share, unequal weights, the
--        per-family minimum.
--   §C — the lifecycle: open (access, items re-derived from the probe id,
--        the floor, one open per class, audit), the entry states, the save
--        (idempotence, first write wins, server-derived correctness, every
--        malformed shape, non-members), every judgment and the statistic with
--        hand-computed rates, the snapshot, saves after close, auto-close by
--        rule, and who may read results.
--   §D — the purge: practice data of a deleted account and of a dormant
--        student is deleted and COUNTED; the probe row survives.

-- @section A-catalog-posture
-- @expect-rows
select 'probe_tables_exist',
       to_regclass('public.class_probes') is not null
       and to_regclass('public.practice_sessions') is not null
       and to_regclass('public.fact_attempts') is not null,
       'slice 1: probes, sessions, attempts';
select 'probe_rls_forced_no_policies',
       (select bool_and(relrowsecurity and relforcerowsecurity) and count(*) = 3
          from pg_class
         where relname in ('class_probes', 'practice_sessions', 'fact_attempts') and relkind = 'r')
       and not exists (select 1 from pg_policies
                        where tablename in ('class_probes', 'practice_sessions', 'fact_attempts')),
       'ER-8: RLS forced and NO policy — every access is a definer RPC';
select 'probe_no_client_privileges',
       not exists (
         select 1
         from unnest(array['class_probes', 'practice_sessions', 'fact_attempts']) t,
              unnest(array['anon', 'authenticated']) r,
              unnest(array['select', 'insert', 'update', 'delete']) p
         where has_table_privilege(r, t, p)),
       'anon and authenticated hold nothing on any of the three';
select 'probe_one_open_index',
       exists (select 1 from pg_indexes
                where indexname = 'class_probes_one_open'
                  and indexdef ilike '%unique%' and indexdef ilike '%closed_at is null%'),
       'at most one unfinalised probe per class';
select 'probe_functions_definer_pinned',
       (select count(*) = 10 and bool_and(prosecdef and proconfig @> array['search_path=public'])
          from pg_proc
         where proname in ('fact_probe_allocate', 'fact_probe_judged', 'fact_probe_stat',
                           'finalise_fact_probe', 'open_fact_probe', 'close_fact_probe',
                           'fact_probe_entry', 'save_fact_attempts', 'fact_probe_results',
                           'fact_probe_overview')),
       'all ten are SECURITY DEFINER with a pinned search_path (0009)';
select 'probe_internals_not_client_callable',
       not has_function_privilege('authenticated', 'fact_probe_allocate(text,integer,integer)', 'execute')
       and not has_function_privilege('authenticated', 'fact_probe_judged(uuid)', 'execute')
       and not has_function_privilege('authenticated', 'fact_probe_stat(uuid)', 'execute')
       and not has_function_privilege('authenticated', 'finalise_fact_probe(uuid,boolean)', 'execute'),
       'a student must never call the statistic or the finalise directly';
select 'probe_rpcs_signed_in_only',
       (select bool_and(has_function_privilege('authenticated', f, 'execute')
                        and not has_function_privilege('anon', f, 'execute'))
          from unnest(array[
            'open_fact_probe(uuid,integer)', 'close_fact_probe(uuid)', 'fact_probe_entry(text)',
            'save_fact_attempts(uuid,jsonb,jsonb,boolean,text)', 'fact_probe_results(uuid)',
            'fact_probe_overview(uuid)']) f),
       'callable signed in, never anonymously (verify-0017''s anon roster stays at two)';
select 'probe_save_share_close_update',
       (select prosrc ilike '%for share%' from pg_proc where proname = 'save_fact_attempts')
       and (select prosrc ilike '%for update%' from pg_proc where proname = 'finalise_fact_probe'),
       'a close waits for saves in flight; a save sees a close that got there first';
select 'probe_audit_actions',
       (select count(*) = 2 from pg_enum e join pg_type t on t.oid = e.enumtypid
         where t.typname = 'audit_action' and e.enumlabel in ('fact_probe.open', 'fact_probe.close')),
       'ER-24: open and close are audited';
select 'purge_counts_practice_data',
       (select strpos(prosrc, 'purge_soft_deleted: section_checks %+%') > 0
               and prosrc ilike '%delete from fact_attempts%'
               and prosrc ilike '%delete from practice_sessions%'
               and prosrc ilike '%practice purged%'
          from pg_proc where proname = 'purge_soft_deleted'),
       'ER-16: an explicit, counted delete; the NOTICE prefix verify-0029 greps is intact';

-- @section B-allocation
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev text := repeat('b', 64);
  n     integer := 0;
  v_got text;
begin
  -- One synthetic revision; each "year" is a different family mix.
  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at)
  values (v_rev, 1, '0.0.0', 0.8, 0.9, 0.8, 15, 5, 10,
    jsonb_build_object(
      '7',  jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
              '["fact.vfy.e1","fact.vfy.e2","fact.vfy.e3","fact.vfy.e4","fact.vfy.e5","fact.vfy.e6","fact.vfy.e7","fact.vfy.e8"]'::jsonb),
      '8',  jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
              '["fact.vfy.e1","fact.vfy.e2","fact.vfy.e3","fact.vfy.e4"]'::jsonb),
      '9',  jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
              '["fact.vfy.e1","fact.vfy.e2","fact.vfy.e3","fact.vfy.small"]'::jsonb),
      '10', jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
              '["fact.vfy.e1","fact.vfy.e2","fact.vfy.e3","fact.vfy.heavy"]'::jsonb)),
    '{}'::jsonb, 10, 1000, '2999-01-01');

  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  select v_rev, 1, 'fact.vfy.e' || i, i, 'generated', 'E' || i, 5, 'multiply', 3, false, 1, 100
    from generate_series(1, 8) i;
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  values (v_rev, 1, 'fact.vfy.small', 20, 'generated', 'Small', 5, 'multiply', 3, false, 1, 3),
         (v_rev, 1, 'fact.vfy.heavy', 21, 'generated', 'Heavy', 5, 'multiply', 3, false, 27, 100);

  -- B1 eight equal families: 5 each, 40 items (max(30, 5 × 8))
  select string_agg(n_items::text, ',' order by family_id) into v_got
    from fact_probe_allocate(v_rev, 1, 7);
  if v_got <> '5,5,5,5,5,5,5,5' then raise exception 'FAIL B1: %', v_got; end if;
  n := n + 1;

  -- B2 four equal families: 30 items, 7.5 each → 8,8,7,7 by largest remainder,
  --    ties in the registry's family order
  select string_agg(n_items::text, ',' order by family_id) into v_got
    from fact_probe_allocate(v_rev, 1, 8);
  if v_got <> '8,8,7,7' then raise exception 'FAIL B2: %', v_got; end if;
  n := n + 1;

  -- B3 a family with 3 facts contributes all 3; the other 27 are shared: 9,9,9
  select string_agg(family_id || '=' || n_items, ',' order by family_id) into v_got
    from fact_probe_allocate(v_rev, 1, 9);
  if v_got <> 'fact.vfy.e1=9,fact.vfy.e2=9,fact.vfy.e3=9,fact.vfy.small=3' then
    raise exception 'FAIL B3: %', v_got;
  end if;
  n := n + 1;

  -- B4 weights 1,1,1,27: by weight alone 1,1,1,27 — the minimum of 5 lifts the
  --    three light families, taken from the heavy one: 5,5,5,15; total still 30
  select string_agg(family_id || '=' || n_items, ',' order by family_id) into v_got
    from fact_probe_allocate(v_rev, 1, 10);
  if v_got <> 'fact.vfy.e1=5,fact.vfy.e2=5,fact.vfy.e3=5,fact.vfy.heavy=15' then
    raise exception 'FAIL B4: %', v_got;
  end if;
  n := n + 1;

  -- B5 a year the revision does not have allocates nothing
  if exists (select 1 from fact_probe_allocate(v_rev, 1, 11)) then
    raise exception 'FAIL B5: allocated for an unknown year';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-allocation: %/5', n;
end
$vfy$;

-- @section C-lifecycle
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('c', 64);
  v_teacher uuid := gen_random_uuid();
  v_other   uuid := gen_random_uuid();
  v_s       uuid[] := array[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
                            gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
                            gen_random_uuid(), gen_random_uuid()];
  v_out     uuid := gen_random_uuid();   -- a student who is not in the class
  v_class   uuid;
  v_code    text;
  v_probe   uuid;
  v_probe2  uuid;
  v_row     class_probes%rowtype;
  v_res     jsonb;
  v_stat    jsonb;
  v_live    jsonb;
  v_items   jsonb;
  v_att     jsonb;
  v_raised  boolean;
  v_stamp   timestamptz;
  v_bad     jsonb;
  n         integer := 0;
begin
  -- Throughout: with a 200 ms/keystroke baseline, an attempt's NET time is
  -- exactly X when rt = X + 200 × (characters typed + 1 for Enter).
  -- ---- fixtures -------------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0045-' || row_number() over () || '@vfy0045.example', '{}'::jsonb
    from unnest(array[v_teacher, v_other, v_out] || v_s) u;
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = any (v_s) or id = v_out;
  update users set display_name = 'Vfy Student ' || array_position(v_s, id) where id = any (v_s);

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0045 class', v_teacher, 'vfy')
  returning id, join_code into v_class, v_code;
  insert into class_members (class_id, student_id) select v_class, u from unnest(v_s) u;

  -- A synthetic revision: A (40 facts, turnaround, 3 s), B (40 facts, 4 s),
  -- C (3 facts, 5 s). Year 7 = all three → 30 items: A 14, B 13, C 3.
  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at)
  values (v_rev, 1, '0.0.0', 0.8, 0.9, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.a","fact.vfy.b","fact.vfy.c"], "cumulative": ["fact.vfy.a","fact.vfy.b","fact.vfy.c"], "description": "vfy"}}'::jsonb,
    '{}'::jsonb, 3, 83, '2999-01-01');
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  values (v_rev, 1, 'fact.vfy.a', 0, 'generated', 'Fam A', 5, 'multiply', 3, true,  1, 40),
         (v_rev, 1, 'fact.vfy.b', 1, 'generated', 'Fam B', 5, 'divide',   4, false, 1, 40),
         (v_rev, 1, 'fact.vfy.c', 2, 'generated', 'Fam C', 6, 'cube',     5, false, 1, 3);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken, display_swapped, spoken_swapped)
  select v_rev, 1, 'fact.vfy.a:' || g || ',' || (g + 100), 'fact.vfy.a', g, array[g, g + 100],
         (g + 100)::text, 'A' || g || ' = __', 'a ' || g, 'swA' || g || ' = __', 'sw a ' || g
    from generate_series(1, 40) g
  union all
  select v_rev, 1, 'fact.vfy.b:' || g, 'fact.vfy.b', g, array[g],
         (g + 200)::text, 'B' || g || ' = __', 'b ' || g, null, null
    from generate_series(1, 40) g
  union all
  select v_rev, 1, 'fact.vfy.c:' || g, 'fact.vfy.c', g, array[g],
         (g + 300)::text, 'C' || g || ' = __', 'c ' || g, null, null
    from generate_series(1, 3) g;

  -- ---- open -------------------------------------------------------------------
  -- C1 only the class's own teacher may open
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  v_raised := false;
  begin perform open_fact_probe(v_class, 7);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL C1: another teacher opened a probe'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[1])::text, true);
  v_raised := false;
  begin perform open_fact_probe(v_class, 7);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL C1: a student opened a probe'; end if;
  n := n + 1;

  -- C2 a year outside 7–10, or not in the revision, is refused by name
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_raised := false;
  begin perform open_fact_probe(v_class, 8);
  exception when others then v_raised := sqlerrm = 'year_not_available'; end;
  if not v_raised then raise exception 'FAIL C2: year 8 (not in the revision) opened'; end if;
  v_raised := false;
  begin perform open_fact_probe(v_class, 6);
  exception when others then v_raised := sqlerrm = 'year_not_available'; end;
  if not v_raised then raise exception 'FAIL C2: year 6 opened'; end if;
  n := n + 1;

  -- C3 open: 30 items numbered 1..30, A 14 / B 13 / C 3, closing in 7 days
  v_res := open_fact_probe(v_class, 7);
  v_probe := (v_res->>'probe_id')::uuid;
  select * into v_row from class_probes where id = v_probe;
  v_items := v_row.items;
  if v_row.item_count <> 30 or jsonb_array_length(v_items) <> 30
     or (select count(distinct (e->>'n')::int) from jsonb_array_elements(v_items) e
          where (e->>'n')::int between 1 and 30) <> 30
     or (select count(distinct e->>'fact_id') from jsonb_array_elements(v_items) e) <> 30
     or (select string_agg(c::text, ',' order by f)
           from (select e->>'family_id' f, count(*) c
                   from jsonb_array_elements(v_items) e group by 1) x) <> '14,13,3'
     or v_row.closes_at <> v_row.opened_at + interval '7 days'
     or v_row.registry_rev <> v_rev or v_row.ceiling_s <> 15 then
    raise exception 'FAIL C3: probe row %', v_res;
  end if;
  n := n + 1;

  -- C4 the pick and the order re-derive from the probe id alone (S-2), and a
  --    swapped item carries the swapped strings
  if exists (
       select 1
       from (select x.fact_id,
                    row_number() over (partition by x.family_id
                                       order by md5(v_probe::text || ':' || x.fact_id), x.fact_id) rk,
                    case x.family_id when 'fact.vfy.a' then 14 when 'fact.vfy.b' then 13 else 3 end want
               from fact_scope_fact x where x.registry_rev = v_rev) r
       where (r.rk <= r.want) <> exists (
               select 1 from jsonb_array_elements(v_items) e where e->>'fact_id' = r.fact_id)) then
    raise exception 'FAIL C4: the picked facts are not the hash ranking''s';
  end if;
  if (select string_agg(e->>'fact_id', ',' order by (e->>'n')::int)
        from jsonb_array_elements(v_items) e)
     <> (select string_agg(e->>'fact_id', ',' order by md5(v_probe::text || ':s:' || (e->>'fact_id')), e->>'fact_id')
           from jsonb_array_elements(v_items) e) then
    raise exception 'FAIL C4: the order is not the second hash''s';
  end if;
  if exists (
       select 1 from jsonb_array_elements(v_items) e
       join fact_scope_fact x on x.registry_rev = v_rev and x.fact_id = e->>'fact_id'
       where (e->>'shown' = 'swapped' and (e->>'display' <> x.display_swapped or x.display_swapped is null))
          or (e->>'shown' = 'canonical' and e->>'display' <> x.display)
          or e->>'shown' not in ('canonical', 'swapped')
          or e->>'answer' <> x.answer) then
    raise exception 'FAIL C4: an item''s strings do not match its fact and order';
  end if;
  n := n + 1;

  -- C5 the floor is k × 60 × Σn ÷ Σ(n × t) = 0.8 × 60 × 30 ÷ (14×3 + 13×4 + 3×5)
  if round(v_row.floor_per_min, 4) <> round(0.8 * 60 * 30 / 109.0, 4) then
    raise exception 'FAIL C5: floor %', v_row.floor_per_min;
  end if;
  n := n + 1;

  -- C6 one open probe per class, by name; and the open is audited
  v_raised := false;
  begin perform open_fact_probe(v_class, 7);
  exception when others then v_raised := sqlerrm = 'probe_already_open'; end;
  if not v_raised then raise exception 'FAIL C6: a second probe opened'; end if;
  if (select count(*) from audit_log
       where action = 'fact_probe.open' and target_id = v_probe and actor_id = v_teacher) <> 1 then
    raise exception 'FAIL C6: no audit row for the open';
  end if;
  n := n + 1;

  -- ---- entry ------------------------------------------------------------------
  -- C7 a teacher is told the link is for students
  if fact_probe_entry(v_code)->>'state' <> 'teacher' then raise exception 'FAIL C7'; end if;
  n := n + 1;

  -- C8 a non-member, and a code that matches no class, both get not_member
  perform set_config('request.jwt.claims', json_build_object('sub', v_out)::text, true);
  if fact_probe_entry(v_code) <> '{"state": "not_member"}'::jsonb
     or fact_probe_entry('ZZZZZZ') <> '{"state": "not_member"}'::jsonb then
    raise exception 'FAIL C8: %', fact_probe_entry(v_code);
  end if;
  n := n + 1;

  -- C9 a member is ready: 30 items of {n, display, spoken, answer, part} (part
  --    since 0047) and nothing
  --    about the class (no verdict, no floor, no other student)
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[1])::text, true);
  v_res := fact_probe_entry(lower(v_code));
  if v_res->>'state' <> 'ready' or jsonb_array_length(v_res->'items') <> 30
     or (v_res->>'ceiling_s')::numeric <> 15 or (v_res->>'next_n')::int <> 1
     or exists (select 1 from jsonb_array_elements(v_res->'items') e
                 where (select array_agg(k order by k) from jsonb_object_keys(e) k)
                       <> array['answer', 'display', 'n', 'part', 'spoken'])
     or v_res ?| array['class', 'verdict', 'floor', 'students', 'snapshot'] then
    raise exception 'FAIL C9: entry %', v_res - 'items';
  end if;
  n := n + 1;

  -- C10 no claims → refused
  perform set_config('request.jwt.claims', '', true);
  v_raised := false;
  begin perform fact_probe_entry(v_code);
  exception when others then v_raised := sqlerrm = 'not_signed_in'; end;
  if not v_raised then raise exception 'FAIL C10: anonymous entry'; end if;
  n := n + 1;

  -- ---- save -------------------------------------------------------------------
  -- Student 1 (FLUENT): every item right, net time exactly 1000 ms with a
  -- 200 ms/keystroke keyboard baseline → 60 correct a minute.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[1])::text, true);
  select jsonb_agg(jsonb_build_object(
           'n', (e->>'n')::int, 'typed', e->>'answer', 'skipped', false, 'interrupted', false,
           'rt_ms', 1000 + 200 * (length(e->>'answer') + 1), 'offset_ms', (e->>'n')::int * 2000,
           'modality', 'keyboard') order by (e->>'n')::int)
    into v_att from jsonb_array_elements(v_items) e;

  -- C11 the first three items, with the baselines
  v_res := save_fact_attempts(v_probe,
    (select jsonb_agg(a) from jsonb_array_elements(v_att) a where (a->>'n')::int <= 3),
    '{"keyboard": 200, "keypad": null}'::jsonb, false, 'vfy-build');
  if v_res <> '{"state": "saved", "saved": 3, "finished": false}'::jsonb then
    raise exception 'FAIL C11: %', v_res;
  end if;
  n := n + 1;

  -- C12 a replay is a no-op and the FIRST write wins (attempt and baseline)
  v_res := save_fact_attempts(v_probe,
    jsonb_build_array(jsonb_build_object('n', 1, 'typed', '99999', 'skipped', false,
      'interrupted', false, 'rt_ms', 5, 'offset_ms', 0, 'modality', 'keypad')),
    '{"keyboard": 999, "keypad": 999}'::jsonb);
  if (v_res->>'saved')::int <> 3
     or (select typed from fact_attempts a join practice_sessions s on s.id = a.session_id
          where s.probe_id = v_probe and s.student_id = v_s[1] and a.seq = 1)
        <> (v_att->0->>'typed')
     or (select baseline_keyboard_ms from practice_sessions
          where probe_id = v_probe and student_id = v_s[1]) <> 200
     or (select baseline_keypad_ms from practice_sessions
          where probe_id = v_probe and student_id = v_s[1]) <> 999 then
    raise exception 'FAIL C12: replay changed something %', v_res;
  end if;
  n := n + 1;

  -- C13 fact_id, shown and correct are the SERVER's, from the probe's list
  if exists (
       select 1 from fact_attempts a join practice_sessions s on s.id = a.session_id
       join jsonb_array_elements(v_items) e on (e->>'n')::int = a.seq
       where s.probe_id = v_probe and s.student_id = v_s[1]
         and (a.fact_id <> e->>'fact_id' or a.shown <> e->>'shown' or not a.correct
              or a.student_id <> v_s[1])) then
    raise exception 'FAIL C13: stored attempt fields';
  end if;
  n := n + 1;

  -- C14 the entry now resumes after the last saved item, with the baselines
  v_res := fact_probe_entry(v_code);
  if v_res->>'state' <> 'resume' or (v_res->>'next_n')::int <> 4 or (v_res->>'saved')::int <> 3
     or (v_res->'baselines'->>'keyboard')::int <> 200
     or (v_res->'counts'->>'right')::int <> 3 then
    raise exception 'FAIL C14: resume %', v_res - 'items';
  end if;
  n := n + 1;

  -- C15 every malformed shape is refused, and writes nothing (ER-22, CR-17)
  for v_bad in select * from jsonb_array_elements(jsonb_build_array(
      jsonb_build_object('n', 31,  'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 0,   'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5.5, 'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', 'abc',  'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '1.2.3','skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '123456789', 'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 0, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 3600001, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 900.5, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '1',    'skipped', true,  'interrupted', true,  'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '',     'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '-',    'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0, 'modality', 'voice'),
      jsonb_build_object('n', 5,   'typed', '1',    'skipped', 'no',  'interrupted', false, 'rt_ms', 900, 'offset_ms', 0),
      jsonb_build_object('n', 5,   'typed', '1',    'skipped', false, 'interrupted', false, 'rt_ms', 900),
      to_jsonb('not an object'::text)))
  loop
    v_raised := false;
    begin perform save_fact_attempts(v_probe, jsonb_build_array(v_bad));
    exception when others then v_raised := sqlerrm like 'malformed:%'; end;
    if not v_raised then raise exception 'FAIL C15: accepted %', v_bad; end if;
  end loop;
  v_raised := false;
  begin perform save_fact_attempts(v_probe, '{"n": 1}'::jsonb);
  exception when others then v_raised := sqlerrm like 'malformed:%'; end;
  if not v_raised then raise exception 'FAIL C15: a non-array was accepted'; end if;
  v_raised := false;
  begin perform save_fact_attempts(v_probe, v_att, '{"keyboard": 0}'::jsonb);
  exception when others then v_raised := sqlerrm like 'malformed:%'; end;
  if not v_raised then raise exception 'FAIL C15: a zero baseline was accepted'; end if;
  if (select count(*) from fact_attempts a join practice_sessions s on s.id = a.session_id
       where s.probe_id = v_probe) <> 3 then
    raise exception 'FAIL C15: a refused save wrote rows';
  end if;
  n := n + 1;

  -- C16 a non-member cannot save, and a REMOVED member cannot either
  perform set_config('request.jwt.claims', json_build_object('sub', v_out)::text, true);
  v_raised := false;
  begin perform save_fact_attempts(v_probe, v_att);
  exception when others then v_raised := sqlerrm = 'not_member'; end;
  if not v_raised then raise exception 'FAIL C16: a non-member saved'; end if;
  update class_members set removed_at = now() where class_id = v_class and student_id = v_s[8];
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[8])::text, true);
  v_raised := false;
  begin perform save_fact_attempts(v_probe, v_att);
  exception when others then v_raised := sqlerrm = 'not_member'; end;
  if not v_raised then raise exception 'FAIL C16: a removed member saved'; end if;
  update class_members set removed_at = null where class_id = v_class and student_id = v_s[8];
  n := n + 1;

  -- Student 1 finishes.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[1])::text, true);
  v_res := save_fact_attempts(v_probe, v_att, null, true);
  if v_res <> '{"state": "saved", "saved": 30, "finished": true}'::jsonb then
    raise exception 'FAIL C16b: finish %', v_res;
  end if;

  -- Student 2 (NEEDS STRATEGY): 10 right, 10 wrong, 10 skipped, all net 1000.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[2])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object(
       'n', (e->>'n')::int,
       'typed', case when (e->>'n')::int <= 10 then e->>'answer'
                     when (e->>'n')::int <= 20 then '7' else '' end,
       'skipped', (e->>'n')::int > 20, 'interrupted', false,
       'rt_ms', 1000 + 200 * case when (e->>'n')::int <= 10 then length(e->>'answer') + 1
                                  when (e->>'n')::int <= 20 then 2 else 0 end,
       'offset_ms', 0,
       'modality', case when (e->>'n')::int > 20 then null else 'keyboard' end))
     from jsonb_array_elements(v_items) e),
    '{"keyboard": 200}'::jsonb, true);

  -- Student 3 (SLOW): all right, net 8000 — past every criterion, inside the ceiling.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[3])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int, 'typed', e->>'answer',
       'skipped', false, 'interrupted', false,
       'rt_ms', 8000 + 200 * (length(e->>'answer') + 1), 'offset_ms', 0, 'modality', 'keyboard'))
     from jsonb_array_elements(v_items) e),
    '{"keyboard": 200}'::jsonb, true);

  -- Student 4 (TOO LITTLE): three quick right answers, then stops.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[4])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int, 'typed', e->>'answer',
       'skipped', false, 'interrupted', false,
       'rt_ms', 1000 + 200 * (length(e->>'answer') + 1), 'offset_ms', 0, 'modality', 'keyboard'))
     from jsonb_array_elements(v_items) e where (e->>'n')::int <= 3),
    '{"keyboard": 200}'::jsonb);

  -- Student 5 (TIMEOUTS): every answer right, but 20 s each — over the ceiling.
  -- C17 a slow answer is ACCEPTED by the save (a timeout is judged at read time)
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[5])::text, true);
  v_res := save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int, 'typed', e->>'answer',
       'skipped', false, 'interrupted', false, 'rt_ms', 20000 + 200 * (length(e->>'answer') + 1),
       'offset_ms', 0, 'modality', 'keyboard'))
     from jsonb_array_elements(v_items) e),
    '{"keyboard": 200}'::jsonb, true);
  if (v_res->>'saved')::int <> 30 then raise exception 'FAIL C17: slow answers refused %', v_res; end if;
  n := n + 1;

  -- Student 6 (NO BASELINE): all right in 6000 ms raw, keypad, no baseline at all.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[6])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int, 'typed', e->>'answer',
       'skipped', false, 'interrupted', false, 'rt_ms', 6000, 'offset_ms', 0, 'modality', 'keypad'))
     from jsonb_array_elements(v_items) e),
    null, true);

  -- Student 7 (INTERRUPTED ×5): 25 right at net 1000, 5 interrupted. Typed in
  -- numeric forms that are not the stored string (CR-18): "x.0" and "0x".
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[7])::text, true);
  perform save_fact_attempts(v_probe,
    (select jsonb_agg(jsonb_build_object('n', (e->>'n')::int,
       'typed', case when (e->>'n')::int <= 5 then ''
                     when (e->>'n')::int % 2 = 0 then (e->>'answer') || '.0'
                     else '0' || (e->>'answer') end,
       'skipped', false, 'interrupted', (e->>'n')::int <= 5,
       'rt_ms', case when (e->>'n')::int <= 5 then 4000
                     when (e->>'n')::int % 2 = 0 then 1000 + 200 * (length(e->>'answer') + 3)
                     else 1000 + 200 * (length(e->>'answer') + 2) end,
       'offset_ms', 0,
       'modality', case when (e->>'n')::int <= 5 then null else 'keyboard' end))
     from jsonb_array_elements(v_items) e),
    '{"keyboard": 200}'::jsonb, true);
  -- Student 8 never starts.

  -- ---- judgments and the statistic --------------------------------------------
  -- C18 every judgment, per student, exactly
  if (select jsonb_object_agg(k, v) from (
        select array_position(v_s, j.student_id) || ':' || j.judgment as k, count(*) as v
          from fact_probe_judged(v_probe) j group by 1) x)
     <> '{"1:met": 30, "2:met": 10, "2:wrong": 10, "2:skipped": 10, "3:slow": 30,
          "4:met": 3, "5:timeout": 30, "6:unjudged": 30, "7:met": 25, "7:interrupted": 5}'::jsonb then
    raise exception 'FAIL C18: judgments %', (select jsonb_object_agg(k, v) from (
        select array_position(v_s, j.student_id) || ':' || j.judgment as k, count(*) as v
          from fact_probe_judged(v_probe) j group by 1) x);
  end if;
  n := n + 1;

  -- C19 a timeout's time is counted AT the ceiling; an unjudged attempt is flagged
  if (select count(*) from fact_probe_judged(v_probe) j
       where j.student_id = v_s[5] and j.counted_ms = 15000) <> 30
     or (select bool_and(j.flagged) from fact_probe_judged(v_probe) j where j.student_id = v_s[6]) is not true
     or (select bool_or(j.flagged) from fact_probe_judged(v_probe) j where j.student_id = v_s[1]) is not false then
    raise exception 'FAIL C19: counted time or the typing flag';
  end if;
  n := n + 1;

  -- C20 the per-student rows: rate, group, flag, run status — hand-computed.
  --   s1 30 right in 30 000 ms → 60    fluent
  --   s2 10 right in 30 000 ms → 20    needs_strategy (accuracy 1/3)
  --   s3 30 right in 240 000 ms → 7.5  slow
  --   s4 3 attempts, 3 000 ms          no rate
  --   s5 0 right in 450 000 ms → 0     needs_strategy (a timeout is never correct)
  --   s6 30 right in 180 000 ms → 10   slow (unjudged counts as not met), flagged
  --   s7 25 right in 25 000 ms → 60    fluent, 5 not counted
  --   s8 not started
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_stat := fact_probe_stat(v_probe);
  if (select jsonb_object_agg(array_position(v_s, (s->>'student_id')::uuid)::text,
            jsonb_build_array(s->'rate', s->'group', s->'status', s->'has_rate',
                              s->'typing_flag', s->'not_counted', s->'right', s->'skipped'))
        from jsonb_array_elements(v_stat->'students') s)
     <> jsonb_build_object(
          '1', '[60.00, "fluent", "finished", true, false, 0, 30, 0]'::jsonb,
          '2', '[20.00, "needs_strategy", "finished", true, false, 0, 10, 10]'::jsonb,
          '3', '[7.50, "slow", "finished", true, false, 0, 30, 0]'::jsonb,
          '4', '[null, null, "in_progress", false, false, 0, 3, 0]'::jsonb,
          '5', '[0.00, "needs_strategy", "finished", true, false, 0, 0, 0]'::jsonb,
          '6', '[10.00, "slow", "finished", true, true, 0, 30, 0]'::jsonb,
          '7', '[60.00, "fluent", "finished", true, false, 5, 25, 0]'::jsonb,
          '8', '[null, null, "not_started", false, false, 0, 0, 0]'::jsonb) then
    raise exception 'FAIL C20: student rows %',
      (select jsonb_object_agg(array_position(v_s, (s->>'student_id')::uuid)::text,
            jsonb_build_array(s->'rate', s->'group', s->'status', s->'has_rate',
                              s->'typing_flag', s->'not_counted', s->'right', s->'skipped'))
        from jsonb_array_elements(v_stat->'students') s);
  end if;
  n := n + 1;

  -- C21 names follow the roster's rule and rows sort by name (S-5)
  if (select string_agg(s->>'name', '|' order by ord)
        from jsonb_array_elements(v_stat->'students') with ordinality as t(s, ord))
     <> (select string_agg('Vfy Student ' || g, '|' order by g) from generate_series(1, 8) g) then
    raise exception 'FAIL C21: names';
  end if;
  n := n + 1;

  -- C22 per family (their item 23): met / not_met / not_judged below the minimum
  if (select jsonb_agg(f->>'status' order by f->>'family_id')
        from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
       where (s->>'student_id')::uuid = v_s[1]) <> '["met", "met", "met"]'::jsonb
     or (select jsonb_agg(f->>'status' order by f->>'family_id')
           from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
          where (s->>'student_id')::uuid = v_s[3]) <> '["not_met", "not_met", "not_met"]'::jsonb
     or exists (select 1
           from jsonb_array_elements(v_stat->'students') s, jsonb_array_elements(s->'families') f
          where (s->>'student_id')::uuid = v_s[4]
            and (f->>'counted')::int < case f->>'family_id' when 'fact.vfy.c' then 3 else 5 end
            and f->>'status' <> 'not_judged') then
    raise exception 'FAIL C22: family readings';
  end if;
  n := n + 1;

  -- C23 the class: median of 0, 7.5, 10, 20, 60, 60 = 15, against a floor of 13.21
  if v_stat->'class' <> jsonb_build_object(
       'in_class', 8, 'started', 7, 'finished', 6, 'with_rate', 6, 'left_out', 1,
       'median_rate', 15.00, 'floor', 13.21, 'min_students', 5, 'verdict', 'at_or_above',
       'groups', '{"fluent": 2, "slow": 2, "needs_strategy": 2}'::jsonb) then
    raise exception 'FAIL C23: class %', v_stat->'class';
  end if;
  n := n + 1;

  -- C24 a student removed from the class keeps their row and leaves the class
  --     numbers: median of 0, 7.5, 10, 20, 60 = 10 → below the floor
  update class_members set removed_at = now() where class_id = v_class and student_id = v_s[1];
  v_live := fact_probe_stat(v_probe);
  if (v_live->'class'->>'median_rate')::numeric <> 10 or v_live->'class'->>'verdict' <> 'below'
     or (v_live->'class'->>'in_class')::int <> 7
     or not exists (select 1 from jsonb_array_elements(v_live->'students') s
                     where (s->>'student_id')::uuid = v_s[1] and not (s->>'is_member')::boolean
                       and (s->>'rate')::numeric = 60) then
    raise exception 'FAIL C24: removed student %', v_live->'class';
  end if;
  update class_members set removed_at = null where class_id = v_class and student_id = v_s[1];
  n := n + 1;

  -- ---- results, close, snapshot -------------------------------------------------
  -- C25 only the class's teacher reads results or the overview, or closes
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  v_raised := false;
  begin perform fact_probe_results(v_probe);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL C25: another teacher read results'; end if;
  v_raised := false;
  begin perform close_fact_probe(v_probe);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL C25: another teacher closed'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[1])::text, true);
  v_raised := false;
  begin perform fact_probe_results(v_probe);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL C25: a student read results'; end if;
  v_raised := false;
  begin perform fact_probe_overview(v_class);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL C25: a student read the overview'; end if;
  n := n + 1;

  -- C26 the live results are the statistic; the overview lists the probe and the year
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := fact_probe_results(v_probe);
  if v_res->'class' <> v_stat->'class' or v_res->'students' <> v_stat->'students'
     or v_res->'probe'->>'state' <> 'open' or v_res->'probe'->>'join_code' <> v_code then
    raise exception 'FAIL C26: live results';
  end if;
  v_res := fact_probe_overview(v_class);
  if not (v_res->>'mirrored')::boolean or jsonb_array_length(v_res->'probes') <> 1
     or v_res->'probes'->0->>'state' <> 'open'
     or v_res->'years' <> '[{"year": 7, "description": "vfy", "adds": ["Fam A", "Fam B", "Fam C"], "families": 3, "items": 30, "parts": [30]}]'::jsonb then
    raise exception 'FAIL C26: overview %', v_res;
  end if;
  n := n + 1;

  -- C27 close: the snapshot IS the live class statistic at that moment
  v_res := close_fact_probe(v_probe);
  select * into v_row from class_probes where id = v_probe;
  if v_row.closed_at is null or v_row.auto_closed
     or v_row.snapshot <> (v_stat->'class') || '{"closed_by": "teacher"}'::jsonb
     or v_res <> v_row.snapshot then
    raise exception 'FAIL C27: snapshot %', v_row.snapshot;
  end if;
  n := n + 1;

  -- C28 a second close changes nothing and audits nothing more
  v_stamp := v_row.closed_at;
  perform close_fact_probe(v_probe);
  if (select closed_at from class_probes where id = v_probe) <> v_stamp
     or (select count(*) from audit_log
          where action = 'fact_probe.close' and target_id = v_probe) <> 1 then
    raise exception 'FAIL C28: the close is not idempotent';
  end if;
  n := n + 1;

  -- C29 a save after the close writes NOTHING and says closed (ER-10)
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[4])::text, true);
  v_res := save_fact_attempts(v_probe,
    (select jsonb_agg(a) from jsonb_array_elements(v_att) a where (a->>'n')::int between 4 and 9));
  if v_res <> '{"state": "closed", "saved": 3, "finished": false}'::jsonb
     or (select count(*) from fact_attempts a join practice_sessions s on s.id = a.session_id
          where s.probe_id = v_probe and s.student_id = v_s[4]) <> 3 then
    raise exception 'FAIL C29: a save after close %', v_res;
  end if;
  n := n + 1;

  -- C30 entry after the close: part-way → closed; finished → finished; never
  --     started → none_open
  if fact_probe_entry(v_code)->>'state' <> 'closed'
     or (fact_probe_entry(v_code)->>'saved')::int <> 3 then
    raise exception 'FAIL C30: part-way student %', fact_probe_entry(v_code);
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[7])::text, true);
  v_res := fact_probe_entry(v_code);
  if v_res->>'state' <> 'finished'
     or v_res->'counts' <> '{"right": 25, "skipped": 0, "not_counted": 5}'::jsonb then
    raise exception 'FAIL C30: finished student %', v_res;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[8])::text, true);
  if fact_probe_entry(v_code)->>'state' <> 'none_open' then raise exception 'FAIL C30: never started'; end if;
  n := n + 1;

  -- C31 the stored verdict stands against a later roster change (results read
  --     the snapshot; the student rows still show who was removed)
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  update class_members set removed_at = now() where class_id = v_class and student_id = v_s[1];
  v_res := fact_probe_results(v_probe);
  if v_res->'class' <> v_row.snapshot or v_res->'probe'->>'state' <> 'closed' then
    raise exception 'FAIL C31: the closed verdict moved';
  end if;
  update class_members set removed_at = null where class_id = v_class and student_id = v_s[1];
  n := n + 1;

  -- C32 below the minimum number of students with a rate there is no verdict
  update class_probes set min_students = 99 where id = v_probe;
  if fact_probe_stat(v_probe)->'class'->>'verdict' <> 'not_enough' then
    raise exception 'FAIL C32: verdict with too few students';
  end if;
  n := n + 1;

  -- ---- auto-close by rule (ER-9) -------------------------------------------------
  -- C33 a new probe can be opened once the last is closed; pushed past its
  --     closes_at it is closed BY RULE: a save is refused before anything has
  --     finalised it, and the entry treats it as closed
  --     (now() is transaction-constant, so every probe in this block would
  --     share one opened_at and "the latest probe" would be a coin toss; in
  --     production each open is its own transaction. The first is backdated.)
  update class_probes set opened_at = now() - interval '30 days', closes_at = now() - interval '23 days'
   where id = v_probe;
  v_probe2 := (open_fact_probe(v_class, 7)->>'probe_id')::uuid;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s[1])::text, true);
  perform save_fact_attempts(v_probe2,
    (select jsonb_agg(jsonb_build_object('n', g, 'typed', '1', 'skipped', false,
       'interrupted', false, 'rt_ms', 900, 'offset_ms', 0, 'modality', 'keyboard'))
       from generate_series(1, 2) g));
  update class_probes set opened_at = now() - interval '8 days', closes_at = now() - interval '1 day'
   where id = v_probe2;
  v_res := save_fact_attempts(v_probe2,
    jsonb_build_array(jsonb_build_object('n', 3, 'typed', '1', 'skipped', false,
      'interrupted', false, 'rt_ms', 900, 'offset_ms', 0, 'modality', 'keyboard')));
  if v_res->>'state' <> 'closed' or (v_res->>'saved')::int <> 2
     or (select closed_at from class_probes where id = v_probe2) is not null
     or fact_probe_entry(v_code)->>'state' <> 'closed' then
    raise exception 'FAIL C33: past closes_at %', v_res;
  end if;
  n := n + 1;

  -- C34 the teacher's next read finalises it: closed AT closes_at, labelled
  --     automatic, audited; and a new open is then allowed
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := fact_probe_overview(v_class);
  select * into v_row from class_probes where id = v_probe2;
  if v_row.closed_at is distinct from v_row.closes_at or not v_row.auto_closed
     or v_row.snapshot->>'closed_by' <> 'auto'
     or (select count(*) from audit_log
          where action = 'fact_probe.close' and target_id = v_probe2
            and (metadata->>'auto')::boolean) <> 1
     or v_res->'probes'->0->>'state' <> 'closed' then
    raise exception 'FAIL C34: auto-close %', v_row.snapshot;
  end if;
  perform open_fact_probe(v_class, 7);
  n := n + 1;

  -- C35 with nothing mirrored, an open says so by name
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_other, 'vfy 0045 other', v_other, 'vfy') returning id into v_class;
  -- (the mirror tables are insert-only, so "nothing mirrored" is proven on the
  --  function's source instead of by emptying them)
  if (select prosrc not ilike '%fact_scope_not_mirrored%' from pg_proc where proname = 'open_fact_probe') then
    raise exception 'FAIL C35: the open has no named error for an empty mirror';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> C-lifecycle: %/35', n;
end
$vfy$;

-- @section D-purge
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('d', 64);
  v_teacher uuid := gen_random_uuid();
  v_deleted uuid := gen_random_uuid();
  v_dormant uuid := gen_random_uuid();
  v_keeps   uuid := gen_random_uuid();
  v_class   uuid;
  v_probe   uuid;
  v_notes   text;
  v_att     jsonb;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0045d-t@vfy0045.example', '{}'::jsonb),
         (v_deleted, 'vfy0045d-x@vfy0045.example', '{}'::jsonb),
         (v_dormant, 'vfy0045d-y@vfy0045.example', '{}'::jsonb),
         (v_keeps,   'vfy0045d-z@vfy0045.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id in (v_deleted, v_dormant, v_keeps);
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0045 purge', v_teacher, 'vfy') returning id into v_class;
  insert into class_members (class_id, student_id)
  values (v_class, v_deleted), (v_class, v_dormant), (v_class, v_keeps);

  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at)
  values (v_rev, 1, '0.0.0', 0.8, 0.9, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.p"], "cumulative": ["fact.vfy.p"], "description": null}}'::jsonb,
    '{}'::jsonb, 1, 30, '2999-01-01');
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  values (v_rev, 1, 'fact.vfy.p', 0, 'generated', 'Fam P', 5, 'square', 3, false, 1, 30);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken)
  select v_rev, 1, 'fact.vfy.p:' || g, 'fact.vfy.p', g, array[g], g::text, 'P' || g || ' = __', 'p ' || g
    from generate_series(1, 30) g;

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_probe := (open_fact_probe(v_class, 7)->>'probe_id')::uuid;
  select jsonb_agg(jsonb_build_object('n', g, 'typed', '1', 'skipped', false, 'interrupted', false,
           'rt_ms', 900, 'offset_ms', 0, 'modality', 'keyboard'))
    into v_att from generate_series(1, 4) g;
  perform set_config('request.jwt.claims', json_build_object('sub', v_deleted)::text, true);
  perform save_fact_attempts(v_probe, v_att, '{"keyboard": 150}'::jsonb);
  perform set_config('request.jwt.claims', json_build_object('sub', v_dormant)::text, true);
  perform save_fact_attempts(v_probe, v_att);
  perform set_config('request.jwt.claims', json_build_object('sub', v_keeps)::text, true);
  perform save_fact_attempts(v_probe, v_att);
  perform set_config('request.jwt.claims', '', true);

  -- One account explicitly deleted 31 days ago; one student dormant for 401
  -- days (no active membership); one ordinary student.
  update users set deleted_at = now() - interval '31 days' where id = v_deleted;
  update class_members set removed_at = now() - interval '401 days'
   where class_id = v_class and student_id = v_dormant;

  perform purge_soft_deleted();

  -- D1 the deleted account's practice data is gone
  if exists (select 1 from fact_attempts where student_id = v_deleted)
     or exists (select 1 from practice_sessions where student_id = v_deleted) then
    raise exception 'FAIL D1: a deleted account''s practice data survived the purge';
  end if;
  n := n + 1;

  -- D2 practice data does not BLOCK the purge: both accounts are gone
  if exists (select 1 from users where id in (v_deleted, v_dormant))
     or exists (select 1 from fact_attempts where student_id = v_dormant) then
    raise exception 'FAIL D2: practice data blocked an account purge';
  end if;
  n := n + 1;

  -- D3 it was COUNTED: the purge's ledger row carries at least these 8
  --    attempts and 2 sessions (more, if this database had others due)
  select notes into v_notes from analytics_job_runs
   where job_name = 'purge' order by id desc limit 1;
  if v_notes !~ 'practice purged [0-9]+ attempts, [0-9]+ sessions'
     or (regexp_match(v_notes, 'practice purged ([0-9]+) attempts'))[1]::int < 8
     or (regexp_match(v_notes, 'attempts, ([0-9]+) sessions'))[1]::int < 2 then
    raise exception 'FAIL D3: ledger notes %', v_notes;
  end if;
  n := n + 1;

  -- D4 the ordinary student's data, and the probe row, are untouched
  if (select count(*) from fact_attempts where student_id = v_keeps) <> 4
     or not exists (select 1 from class_probes where id = v_probe) then
    raise exception 'FAIL D4: the purge took more than it should';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> D-purge: %/4', n;
end
$vfy$;
