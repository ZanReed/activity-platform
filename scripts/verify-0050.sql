-- verify-0050.sql — the daily number-facts practice's engine (migration 0050).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0045 idiom): its own synthetic fact-scope
-- revision stamped mirrored_at in 2999, real functions, everything rolled back
-- (P7). "Yesterday" is made by moving the fixture's own rows back in time.
--
--   §A — catalog posture: the tables are RLS-forced with no policy and no
--        client grant; the internals are service-role only; the three client
--        RPCs are signed-in only; the prune is still unscheduled.
--   §B — the judgment bond with fact_probe_judged; the switch; labels, modes
--        and the working pair; steps and due days; the list; start, resume,
--        a second session; the save and the re-ask rule; one step a day and
--        the miss rules; reviews; the two bars; the strategy shown once;
--        spot-checks; a NOT JUDGED family's first window; the score; the
--        prune's and the purge's counted deletes.
--
-- The fixture. Four families of 10 facts, Year 7, a 30-item check (8/8/7/7):
--   A  every answer quick and right            → FLUENT
--   B  every answer wrong                      → NEEDS STRATEGY
--   C  every answer right but slow             → SLOW
--   D  only two answers (both quick and right) → NOT JUDGED
-- Throughout: with a 200 ms/keystroke baseline, an answer of 2 characters has
-- NET time X when rt = X + 600.

-- @section A-catalog-posture
-- @expect-rows
select 'sprint_tables_rls_forced_no_policy',
       (select bool_and(c.relrowsecurity and c.relforcerowsecurity) and count(*) = 2
          from pg_class c where c.relname in ('sprint_sessions', 'sprint_attempts')
                            and c.relnamespace = 'public'::regnamespace)
       and not exists (select 1 from pg_policies
                        where tablename in ('sprint_sessions', 'sprint_attempts')),
       'every read and write goes through the definer RPCs (ER-8)';
select 'sprint_tables_no_client_grant',
       not has_table_privilege('authenticated', 'sprint_sessions', 'select')
       and not has_table_privilege('authenticated', 'sprint_attempts', 'select')
       and not has_table_privilege('anon', 'sprint_sessions', 'select')
       and not has_table_privilege('authenticated', 'sprint_attempts', 'insert'),
       'no client role reads or writes either table';
select 'sprint_internals_not_client_callable',
       (select bool_and(not has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute'))
               and count(*) = 9
          from pg_proc p
         where p.proname in ('fact_attempt_judgment', 'fact_class_zone', 'fact_sprint_log',
                             'fact_sprint_families', 'fact_sprint_state', 'fact_sprint_build',
                             'fact_sprint_basis', 'fact_sprint_score', 'fact_sprint_payload')),
       'the nine internal functions are reachable only from the definer RPCs';
select 'sprint_rpcs_signed_in_only',
       (select bool_and(has_function_privilege('authenticated', f, 'execute')
                        and not has_function_privilege('anon', f, 'execute'))
          from unnest(array['set_fact_sprint(uuid,boolean)', 'fact_sprint_entry(text,boolean)',
                            'save_sprint_attempts(uuid,jsonb,jsonb,boolean,text)']) f),
       'the switch, the entry and the save';
select 'sprint_definers_pinned',
       (select bool_and(prosecdef and proconfig @> array['search_path=public'])
          from pg_proc
         where proname in ('set_fact_sprint', 'fact_sprint_entry', 'save_sprint_attempts',
                           'fact_sprint_log', 'fact_sprint_families', 'fact_sprint_state',
                           'fact_sprint_build')),
       'definer, with a pinned search path';
select 'prune_still_unscheduled_and_service_only',
       not exists (select 1 from cron.job where command ilike '%prune_fact_practice%')
       and not has_function_privilege('authenticated', 'prune_fact_practice(boolean)', 'execute')
       and (select pg_get_function_arguments(oid) from pg_proc where proname = 'prune_fact_practice')
             = 'p_dry_run boolean DEFAULT true',
       'the re-created prune is still disarmed (0048''s posture)';
select 'purge_counts_sprint_rows',
       (select prosrc ilike '%sprint purged%' and prosrc ilike '%delete from sprint_attempts%'
               and strpos(prosrc, 'purge_soft_deleted: section_checks %+%') > 0
          from pg_proc where proname = 'purge_soft_deleted'),
       'purge_soft_deleted v6 deletes the sprint''s rows explicitly and counts them (ER-16)';
select 'no_sprint_on_without_a_year_end',
       not exists (select 1 from classes
                    where fact_sprint_on_at is not null and school_year_ends_on is null),
       'a class cannot have practice on without a school-year end';

-- @section B-engine
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('3', 64);
  v_sprint  jsonb := '{"sprint_max_misses": 1, "sprint_minutes": 5,
                       "sprint_step_intervals": [1, 2, 4, 8, 16], "sprint_mastered_step": 2,
                       "sprint_new_facts_per_session": 5, "sprint_working_families": 2,
                       "sprint_reask_gap": 3}'::jsonb;
  v_teacher uuid := gen_random_uuid();
  v_other   uuid := gen_random_uuid();
  v_s1      uuid := gen_random_uuid();   -- took the check
  v_s2      uuid := gen_random_uuid();   -- did not: every family NOT JUDGED
  v_s3      uuid := gen_random_uuid();   -- took the check with no baseline (the bond)
  v_class   uuid;
  v_code    text;
  v_probe   uuid;
  v_items   jsonb;
  v_att     jsonb;
  v_res     jsonb;
  v_sess    uuid;
  v_sess2   uuid;
  v_list    jsonb;
  v_got     text;
  v_x       integer;   -- the item missed in session 1 (in B)
  v_y       integer;   -- an item answered right in session 1
  v_raised  boolean;
  v_base    jsonb;
  v_n       integer;
  n         integer := 0;
begin
  -- ---- fixtures ---------------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0050-' || row_number() over () || '@vfy0050.example', '{}'::jsonb
    from unnest(array[v_teacher, v_other, v_s1, v_s2, v_s3]) u;
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id in (v_s1, v_s2, v_s3);
  update users set timezone = 'UTC' where id = v_teacher;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_teacher, 'vfy 0050 class', v_teacher, 'vfy', current_date + 100)
  returning id, join_code into v_class, v_code;
  insert into class_members (class_id, student_id) values (v_class, v_s1), (v_class, v_s2), (v_class, v_s3);

  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at, sprint)
  values (v_rev, 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    '{"7": {"adds": ["fact.vfy.a","fact.vfy.b","fact.vfy.c","fact.vfy.d"], "cumulative": ["fact.vfy.a","fact.vfy.b","fact.vfy.c","fact.vfy.d"], "description": "vfy"}}'::jsonb,
    '{}'::jsonb, 4, 40, '2999-01-01', v_sprint);
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count, strategy)
  select v_rev, 1, 'fact.vfy.' || c, o - 1, 'generated', 'Fam ' || upper(c), 5, 'square', 3, false, 1, 10,
         jsonb_build_object('intro', 'Strategy ' || c, 'lines', '[]'::jsonb, 'example', null)
    from unnest(array['a','b','c','d']) with ordinality t(c, o);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken, display_swapped, spoken_swapped)
  select v_rev, 1, 'fact.vfy.' || c || ':' || g, 'fact.vfy.' || c, g, array[g],
         (g + 10)::text, upper(c) || g || ' = __', c || ' ' || g, null, null
    from unnest(array['a','b','c','d']) c, generate_series(1, 10) g;

  -- ---- the check --------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);

  -- B1 the switch: not before a closed check; not by another teacher
  v_raised := false;
  begin perform set_fact_sprint(v_class, true);
  exception when others then v_raised := sqlerrm = 'no_closed_check'; end;
  if not v_raised then raise exception 'FAIL B1: practice switched on with no closed check'; end if;
  n := n + 1;

  v_probe := (open_fact_probe(v_class, 7)->>'probe_id')::uuid;
  select items into v_items from class_probes where id = v_probe;
  if (select string_agg(c::text, ',' order by f)
        from (select e->>'family_id' f, count(*) c from jsonb_array_elements(v_items) e group by 1) x)
     <> '8,8,7,7' then
    raise exception 'FAIL fixture: the check''s allocation is not 8/8/7/7';
  end if;

  -- S1: A quick and right, B wrong, C right but slow, D two quick and right.
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  select jsonb_agg(jsonb_build_object(
           'n', (e->>'n')::int,
           'typed', case when e->>'family_id' = 'fact.vfy.b' then '99' else e->>'answer' end,
           'skipped', false, 'interrupted', false,
           'rt_ms', case when e->>'family_id' = 'fact.vfy.c' then 5000 + 600 else 1000 + 600 end,
           'offset_ms', (e->>'n')::int * 2000, 'modality', 'keyboard') order by (e->>'n')::int)
    into v_att
    from jsonb_array_elements(v_items) e
   where e->>'family_id' <> 'fact.vfy.d'
      or (e->>'n')::int in (select (d->>'n')::int from jsonb_array_elements(v_items) d
                             where d->>'family_id' = 'fact.vfy.d' order by 1 limit 2);
  perform save_fact_attempts(v_probe, v_att, '{"keyboard": 200, "keypad": null}'::jsonb, true, 'vfy');

  -- S3: no baseline at all; one of each remaining outcome (skip, interrupt,
  -- timeout, and right-but-over-the-criterion = unjudged).
  perform set_config('request.jwt.claims', json_build_object('sub', v_s3)::text, true);
  perform save_fact_attempts(v_probe, jsonb_build_array(
    jsonb_build_object('n', 1, 'typed', '', 'skipped', true, 'interrupted', false, 'rt_ms', 900, 'offset_ms', 0, 'modality', null),
    jsonb_build_object('n', 2, 'typed', '1', 'skipped', false, 'interrupted', true, 'rt_ms', 900, 'offset_ms', 1, 'modality', 'keypad'),
    jsonb_build_object('n', 3, 'typed', v_items->2->>'answer', 'skipped', false, 'interrupted', false, 'rt_ms', 20000, 'offset_ms', 2, 'modality', 'keyboard'),
    jsonb_build_object('n', 4, 'typed', v_items->3->>'answer', 'skipped', false, 'interrupted', false, 'rt_ms', 5000, 'offset_ms', 3, 'modality', 'mixed'),
    jsonb_build_object('n', 5, 'typed', v_items->4->>'answer', 'skipped', false, 'interrupted', false, 'rt_ms', 1000, 'offset_ms', 4, 'modality', 'keypad')),
    null, false, 'vfy');

  -- B2 THE BOND: every stored attempt of the check gets the same judgment from
  --    fact_attempt_judgment as from fact_probe_judged, and all seven occur
  select count(*), string_agg(distinct j.judgment, ',' order by j.judgment) into v_n, v_got
    from fact_probe_judged(v_probe) j
    join fact_attempts fa on fa.session_id = j.session_id and fa.seq = j.seq
    join practice_sessions s on s.id = fa.session_id
   where j.judgment is distinct from fact_attempt_judgment(
           fa.rt_ms, fa.typed, fa.skipped, fa.interrupted, fa.correct, fa.modality,
           s.baseline_keyboard_ms, s.baseline_keypad_ms, 3000, 15000);
  if v_n <> 0 then raise exception 'FAIL B2: % attempt(s) judged differently (%)', v_n, v_got; end if;
  if (select string_agg(distinct judgment, ',' order by judgment) from fact_probe_judged(v_probe))
     <> 'interrupted,met,skipped,slow,timeout,unjudged,wrong' then
    raise exception 'FAIL B2: the fixture does not exercise all seven judgments';
  end if;
  n := n + 1;

  -- The check happened three days ago.
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  perform close_fact_probe(v_probe);
  update fact_attempts set saved_at = saved_at - interval '3 days'
   where session_id in (select id from practice_sessions where probe_id = v_probe);

  -- B3 the switch: only the class's teacher; on writes the time and an audit
  --    row; a second on changes nothing; off clears it
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  v_raised := false;
  begin perform set_fact_sprint(v_class, true);
  exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B3: another teacher switched practice on'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  update classes set school_year_ends_on = null where id = v_class;
  v_raised := false;
  begin perform set_fact_sprint(v_class, true);
  exception when others then v_raised := sqlerrm = 'school_year_end_missing'; end;
  if not v_raised then raise exception 'FAIL B3: switched on with no school-year end'; end if;
  update classes set school_year_ends_on = current_date + 100 where id = v_class;
  v_res := set_fact_sprint(v_class, true);
  perform set_fact_sprint(v_class, true);
  if (v_res->>'on')::boolean is not true
     or (select fact_sprint_on_at from classes where id = v_class) is null
     or (select count(*) from audit_log where action = 'fact_sprint.on' and target_id = v_class) <> 1 then
    raise exception 'FAIL B3: switching on %', v_res;
  end if;
  perform set_fact_sprint(v_class, false);
  if (select fact_sprint_on_at from classes where id = v_class) is not null
     or (select count(*) from audit_log where action = 'fact_sprint.off' and target_id = v_class) <> 1 then
    raise exception 'FAIL B3: switching off';
  end if;
  n := n + 1;

  -- B4 off: the student is told so, and nothing is created
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  if fact_sprint_entry(v_code, true)->>'state' <> 'off'
     or exists (select 1 from sprint_sessions where class_id = v_class) then
    raise exception 'FAIL B4: an off class started a session';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  perform set_fact_sprint(v_class, true);
  if fact_sprint_entry(v_code)->>'state' <> 'teacher' then
    raise exception 'FAIL B4: a teacher was not told so';
  end if;
  n := n + 1;

  -- B5 labels, modes and the working pair (SP-8, SP-13)
  select string_agg(right(family_id, 1) || ':' || label || ':' || mode || ':' || working, ' ' order by ord)
    into v_got from fact_sprint_families(v_class, v_s1, v_rev, 1, 7);
  if v_got <> 'a:fluent:review:false b:needs_strategy:strategy:true c:slow:practice:true d:not_judged:practice:false' then
    raise exception 'FAIL B5: S1''s families %', v_got;
  end if;
  select string_agg(right(family_id, 1) || ':' || label || ':' || working, ' ' order by ord)
    into v_got from fact_sprint_families(v_class, v_s2, v_rev, 1, 7);
  if v_got <> 'a:not_judged:true b:not_judged:true c:not_judged:false d:not_judged:false' then
    raise exception 'FAIL B5: S2''s families (no check) %', v_got;
  end if;
  n := n + 1;

  -- B6 the seeded state (SP-6): a FLUENT family's facts start at the mastered
  --    step, unscheduled; a wrong or slow answer is step 0; a fact quick and
  --    right in a family that is not FLUENT is step 1, due the next day
  if exists (select 1 from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
              where s.family_id = 'fact.vfy.a' and (s.step <> 2 or s.due_day is not null or s.asked))
     or exists (select 1 from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
                 where s.family_id in ('fact.vfy.b', 'fact.vfy.c') and (s.step <> 0 or s.due_day is not null))
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.b' and s.seen and s.missed) <> 8
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.c' and s.seen and not s.missed) <> 7
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.d' and s.step = 1 and s.due_day = current_date - 2) <> 2
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.d' and not s.seen and s.step = 0) <> 8 then
    raise exception 'FAIL B6: the seeded state';
  end if;
  n := n + 1;

  -- B7 the list (SP-7, SP-13): D's two due reviews; every seen step-0 fact of
  --    the working pair (8 + 7); the 5 newest by working order (B's 2, then
  --    C's first 3 by fact order); no spot-check while the cap is used
  select string_agg(kind || ':' || c, ' ' order by kind) into v_got
    from (select kind, count(*) c from fact_sprint_build(v_class, v_s1, v_rev, 1, 7, current_date) group by 1) x;
  if v_got <> 'learning:15 new:5 review:2' then raise exception 'FAIL B7: the list %', v_got; end if;
  if (select string_agg(right(family_id, 1), '' order by pick)
        from fact_sprint_build(v_class, v_s1, v_rev, 1, 7, current_date) where kind = 'new') <> 'bbccc'
     or exists (select 1 from fact_sprint_build(v_class, v_s1, v_rev, 1, 7, current_date)
                 where family_id = 'fact.vfy.d' and kind <> 'review') then
    raise exception 'FAIL B7: the new facts or a non-working family';
  end if;
  n := n + 1;

  -- B8 the entry: asking does not start; starting creates ONE session with the
  --    list, the strategies to show (B in strategy mode, C once), the check's
  --    baseline; asking again resumes it
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := fact_sprint_entry(v_code);
  if v_res->>'state' <> 'ready' or (v_res->>'due')::int <> 22 or v_res ? 'session'
     or (v_res->>'minutes')::numeric <> 5
     or exists (select 1 from sprint_sessions where class_id = v_class) then
    raise exception 'FAIL B8: asking %', v_res;
  end if;
  v_res := fact_sprint_entry(v_code, true);
  v_sess := (v_res->'session'->>'session_id')::uuid;
  v_list := (select items from sprint_sessions where id = v_sess);
  if v_res->>'state' <> 'ready' or jsonb_array_length(v_res->'session'->'items') <> 22
     or (v_res->'session'->>'total')::int <> 22
     or (v_res->'session'->'baselines'->>'keyboard')::int <> 200
     or (v_res->'session'->>'reask_gap')::int <> 3
     or (v_res->'session'->'items'->0) ? 'fact_id'
     or (select string_agg(right(f->>'family_id', 1) || ':' || (f->>'mode') || ':' || (f->>'show_strategy'), ' '
                           order by f->>'family_id')
           from jsonb_array_elements(v_res->'session'->'families') f)
        <> 'b:strategy:true c:practice:true d:practice:true'
     or (select count(*) from sprint_sessions where class_id = v_class and student_id = v_s1) <> 1
     or (select keep_until from sprint_sessions where id = v_sess) <> current_date + 130
     or (select count(distinct (i->>'n')::int) from jsonb_array_elements(v_list) i
          where (i->>'n')::int between 1 and 22) <> 22 then
    raise exception 'FAIL B8: starting %', v_res;
  end if;
  v_res := fact_sprint_entry(v_code, true);
  if v_res->>'state' <> 'resume' or (v_res->'session'->>'session_id')::uuid <> v_sess
     or (select count(*) from sprint_sessions where class_id = v_class and student_id = v_s1) <> 1 then
    raise exception 'FAIL B8: resuming %', v_res;
  end if;
  n := n + 1;

  -- Session 1's answers: everything quick and right, except in B one item
  -- wrong (X) and two right but slow.
  select (i->>'n')::int into v_x from jsonb_array_elements(v_list) i
   where i->>'family_id' = 'fact.vfy.b' order by (i->>'n')::int limit 1;
  select (i->>'n')::int into v_y from jsonb_array_elements(v_list) i
   where i->>'family_id' = 'fact.vfy.c' order by (i->>'n')::int limit 1;
  select jsonb_agg(jsonb_build_object(
           'n', (i->>'n')::int, 'reask', false,
           'typed', case when (i->>'n')::int = v_x then '99' else i->>'answer' end,
           'skipped', false, 'interrupted', false,
           'rt_ms', case when i->>'family_id' = 'fact.vfy.b' and (i->>'n')::int in (
                              select (b->>'n')::int from jsonb_array_elements(v_list) b
                               where b->>'family_id' = 'fact.vfy.b' order by 1 offset 1 limit 2)
                         then 5600 else 1600 end,
           'offset_ms', (i->>'n')::int * 2000, 'modality', 'keyboard') order by (i->>'n')::int)
    into v_att from jsonb_array_elements(v_list) i;

  -- B9 the save: malformed payloads and another student's session are refused
  foreach v_base in array array[
    '[{"n": 99, "reask": false, "typed": "1", "skipped": false, "interrupted": false, "rt_ms": 5, "offset_ms": 0}]'::jsonb,
    '[{"n": 1, "typed": "1", "skipped": false, "interrupted": false, "rt_ms": 5, "offset_ms": 0}]'::jsonb,
    '[{"n": 1, "reask": false, "typed": "1a", "skipped": false, "interrupted": false, "rt_ms": 5, "offset_ms": 0}]'::jsonb,
    '[{"n": 1, "reask": false, "typed": "1", "skipped": true, "interrupted": true, "rt_ms": 5, "offset_ms": 0}]'::jsonb,
    '[{"n": 1, "reask": false, "typed": "1", "skipped": false, "interrupted": false, "rt_ms": 0, "offset_ms": 0}]'::jsonb,
    '[{"n": 1, "reask": false, "typed": "", "skipped": false, "interrupted": false, "rt_ms": 5, "offset_ms": 0}]'::jsonb,
    '[]'::jsonb]
  loop
    v_raised := false;
    begin perform save_sprint_attempts(v_sess, v_base);
    exception when others then v_raised := sqlerrm = 'malformed'; end;
    if not v_raised then raise exception 'FAIL B9: accepted %', v_base; end if;
  end loop;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_raised := false;
  begin perform save_sprint_attempts(v_sess, v_att);
  exception when others then v_raised := sqlerrm = 'not_your_session'; end;
  if not v_raised then raise exception 'FAIL B9: another student saved into the session'; end if;
  if exists (select 1 from sprint_attempts where session_id = v_sess) then
    raise exception 'FAIL B9: a refused save wrote rows';
  end if;
  n := n + 1;

  -- B10 the save proper: correctness is the server's; a replay is a no-op and
  --     the first write wins; a re-ask is kept ONLY for the missed item (SP-11)
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := save_sprint_attempts(v_sess, v_att, '{"keyboard": 999, "keypad": 150}'::jsonb, false, 'vfy-build');
  if v_res->>'state' <> 'saved' or (v_res->>'saved')::int <> 22
     or (select count(*) from sprint_attempts where session_id = v_sess and not correct) <> 1
     or (select correct from sprint_attempts where session_id = v_sess and seq = v_x) is not false
     or (select baseline_keyboard_ms from sprint_sessions where id = v_sess) <> 200
     or (select baseline_keypad_ms from sprint_sessions where id = v_sess) <> 150 then
    raise exception 'FAIL B10: the save %', v_res;
  end if;
  v_res := save_sprint_attempts(v_sess, jsonb_build_array(
    jsonb_build_object('n', v_y, 'reask', false, 'typed', '99', 'skipped', false, 'interrupted', false, 'rt_ms', 9, 'offset_ms', 0),
    jsonb_build_object('n', v_x, 'reask', true, 'typed', (select i->>'answer' from jsonb_array_elements(v_list) i where (i->>'n')::int = v_x),
                       'skipped', false, 'interrupted', false, 'rt_ms', 1600, 'offset_ms', 60000, 'modality', 'keyboard'),
    jsonb_build_object('n', v_y, 'reask', true, 'typed', '1', 'skipped', false, 'interrupted', false, 'rt_ms', 1600, 'offset_ms', 61000)),
    null, true);
  if (v_res->>'saved')::int <> 23 or (v_res->>'finished')::boolean is not true
     or (select correct from sprint_attempts where session_id = v_sess and seq = v_y and not reask) is not true
     or (select count(*) from sprint_attempts where session_id = v_sess and reask) <> 1
     or (select correct from sprint_attempts where session_id = v_sess and seq = v_x and reask) is not true
     -- quick and right: 22 first asks, less X and the two slow ones
     or (v_res->>'quick_right')::int <> 19 or v_res->>'best_before' is not null then
    raise exception 'FAIL B10: the replay, the re-ask or the score %', v_res;
  end if;
  n := n + 1;

  -- Everything in one transaction shares now(); give session 1 a real earlier
  -- time ON THE SAME DAY, so "after the miss" is a fact and not a tie. (The
  -- direction depends on the clock so this never crosses midnight — the
  -- verify-0036 lesson.)
  if (now() at time zone 'UTC')::time >= time '12:00' then
    update sprint_attempts set saved_at = saved_at - interval '1 hour' where session_id = v_sess;
  end if;

  -- B11 steps after session 1 (SP-5): a fact missed three days ago and quick
  --     and right today is step 1; the fact missed TODAY is step 0 although
  --     its re-ask was right; a slow answer leaves the step; D's reviews
  --     moved to step 2
  if (select step from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
       where s.fact_id = (select i->>'fact_id' from jsonb_array_elements(v_list) i where (i->>'n')::int = v_x)) <> 0
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.b' and s.step = 1 and s.due_day = current_date + 1) <> 7
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.b' and s.step = 0 and s.seen) <> 3
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.c' and s.step = 1) <> 10
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.d' and s.step = 2 and s.due_day = current_date + 2) <> 2 then
    raise exception 'FAIL B11: steps after session 1';
  end if;
  n := n + 1;

  -- B12 the bars (SP-8, SP-10): B's ten first asks hold one miss → the
  --     accuracy bar is met and B leaves strategy mode; three were not quick
  --     and right → not the fluency bar. C's ten were all quick and right →
  --     fluent in practice, out of the working pair; D takes its place.
  select string_agg(right(family_id, 1) || ':' || mode || ':' || accuracy_bar || ':' || fluency_bar || ':' || working,
                    ' ' order by ord)
    into v_got from fact_sprint_families(v_class, v_s1, v_rev, 1, 7);
  if v_got <> 'a:review:false:false:false b:practice:true:false:true c:review:true:true:false d:practice:false:false:true' then
    raise exception 'FAIL B12: the bars %', v_got;
  end if;
  n := n + 1;

  -- B13 a second session the same day: ordinal 2; B's strategy is NOT shown
  --     again (it left strategy mode and was shown before); D's is not shown
  --     twice; with no new fact left in B, the cap goes to D's unseen facts
  v_res := fact_sprint_entry(v_code, true);
  v_sess2 := (v_res->'session'->>'session_id')::uuid;
  if v_res->>'state' <> 'ready' or v_sess2 = v_sess or (v_res->>'done_today')::int <> 1
     or (v_res->>'best')::int <> 19
     or (select ordinal from sprint_sessions where id = v_sess2) <> 2
     or exists (select 1 from jsonb_array_elements(v_res->'session'->'families') f
                 where (f->>'show_strategy')::boolean)
     or (select string_agg(i->>'kind', ',' order by i->>'kind')
           from (select distinct i->>'kind' as k, i from jsonb_array_elements(
                   (select items from sprint_sessions where id = v_sess2)) i) q(k, i)) is null then
    raise exception 'FAIL B13: the second session %', v_res;
  end if;
  select string_agg(k || ':' || c, ' ' order by k) into v_got
    from (select i->>'kind' k, count(*) c
            from jsonb_array_elements((select items from sprint_sessions where id = v_sess2)) i group by 1) x;
  -- learning: B's 3 at step 0; new: D's first 5 unseen
  if v_got <> 'learning:3 new:5' then raise exception 'FAIL B13: the second list %', v_got; end if;
  n := n + 1;

  -- B14 one step a day (SP-5): quick and right AGAIN today raises nothing
  select jsonb_agg(jsonb_build_object(
           'n', (i->>'n')::int, 'reask', false, 'typed', i->>'answer', 'skipped', false,
           'interrupted', false, 'rt_ms', 1600, 'offset_ms', (i->>'n')::int * 2000,
           'modality', 'keyboard'))
    into v_att from jsonb_array_elements((select items from sprint_sessions where id = v_sess2)) i;
  v_res := save_sprint_attempts(v_sess2, v_att, null, true);
  if (now() at time zone 'UTC')::time < time '12:00' then
    update sprint_attempts set saved_at = saved_at + interval '1 hour' where session_id = v_sess2;
  end if;
  -- X was missed in session 1 and answered quick and right, LATER THE SAME
  -- DAY, in session 2: the miss's own day raises nothing (asserted below).
  -- And should one fact ever hold two quick-and-right first asks on one day,
  -- it is still one step: a duplicate row for one of D's new facts.
  insert into sprint_attempts (session_id, seq, reask, student_id, fact_id, family_id, shown,
                               correct, typed, skipped, interrupted, rt_ms, offset_ms, modality, saved_at)
  select a.session_id, 900, false, a.student_id, a.fact_id, a.family_id, a.shown, true, a.typed,
         false, false, 1600, 0, 'keyboard', a.saved_at + interval '1 second'
    from sprint_attempts a
   where a.session_id = v_sess2 and a.family_id = 'fact.vfy.d' order by a.seq limit 1;
  if (select max(step) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
       where s.fact_id in (select fact_id from sprint_attempts where session_id = v_sess2 and seq = 900)) <> 1 then
    raise exception 'FAIL B14: two quick-and-right answers on one day made two steps';
  end if;
  delete from sprint_attempts where session_id = v_sess2 and seq = 900;
  if (v_res->>'quick_right')::int <> 8 or (v_res->>'best_before')::int <> 19
     or (select step from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.fact_id = (select i->>'fact_id' from jsonb_array_elements(v_list) i where (i->>'n')::int = v_x)) <> 0
     or (select count(*) from fact_sprint_state(v_class, v_s1, v_rev, 1, 7) s
          where s.family_id = 'fact.vfy.b' and s.step = 1) <> 9 then
    raise exception 'FAIL B14: a second session raised a step, or the score %', v_res;
  end if;
  n := n + 1;

  -- B15 the next day: yesterday's step-1 facts are due as reviews; the fact
  --     missed yesterday is still learning; spot-checks of the FLUENT family
  --     take what is left of the new-fact cap
  update sprint_attempts set saved_at = saved_at - interval '1 day' where student_id = v_s1;
  update sprint_sessions set practice_day = practice_day - 1, started_at = started_at - interval '1 day'
   where student_id = v_s1;
  update fact_attempts set saved_at = saved_at - interval '1 day'
   where session_id in (select id from practice_sessions where probe_id = v_probe);
  select string_agg(kind || ':' || c, ' ' order by kind) into v_got
    from (select kind, count(*) c from fact_sprint_build(v_class, v_s1, v_rev, 1, 7, current_date) group by 1) x;
  -- review: B 9 + C 10 + D's 5 new ones (step 1); learning: X; new: D's last 3;
  -- spot: 2 of A's
  if v_got <> 'learning:1 new:3 review:24 spot:2' then raise exception 'FAIL B15: the next day %', v_got; end if;
  if exists (select 1 from fact_sprint_build(v_class, v_s1, v_rev, 1, 7, current_date)
              where kind = 'spot' and family_id <> 'fact.vfy.a') then
    raise exception 'FAIL B15: a spot-check outside the FLUENT family';
  end if;
  n := n + 1;

  -- B16 a NOT JUDGED family's first full window (SP-8): S2 misses ten in a row
  --     in A → A enters strategy mode, and its strategy is shown
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  for v_n in 1..2 loop
    v_res := fact_sprint_entry(v_code, true);
    select jsonb_agg(jsonb_build_object(
             'n', (i->>'n')::int, 'reask', false, 'typed', '99', 'skipped', false,
             'interrupted', false, 'rt_ms', 1600, 'offset_ms', (i->>'n')::int * 2000,
             'modality', 'keyboard'))
      into v_att from jsonb_array_elements(v_res->'session'->'items') i;
    perform save_sprint_attempts((v_res->'session'->>'session_id')::uuid, v_att,
                                 '{"keyboard": 200, "keypad": null}'::jsonb, true);
    -- (older sessions first: two sessions may not share a day and an ordinal)
    update sprint_attempts set saved_at = saved_at - interval '1 day' where student_id = v_s2;
    update sprint_sessions set practice_day = practice_day - 1, started_at = started_at - interval '1 day'
     where student_id = v_s2 and practice_day < current_date;
    update sprint_sessions set practice_day = practice_day - 1, started_at = started_at - interval '1 day'
     where student_id = v_s2 and practice_day = current_date;
  end loop;
  if (select mode from fact_sprint_families(v_class, v_s2, v_rev, 1, 7) where family_id = 'fact.vfy.a') <> 'strategy'
     or (select mode from fact_sprint_families(v_class, v_s2, v_rev, 1, 7) where family_id = 'fact.vfy.b') <> 'practice' then
    raise exception 'FAIL B16: the first-window rule';
  end if;
  v_res := fact_sprint_entry(v_code, true);
  if not (select (f->>'show_strategy')::boolean from jsonb_array_elements(v_res->'session'->'families') f
           where f->>'family_id' = 'fact.vfy.a') then
    raise exception 'FAIL B16: strategy mode did not show the strategy';
  end if;
  n := n + 1;

  -- B17 the prune (SP-3), at production values: a dry run deletes nothing; a
  --     session inside its window is not a candidate; past keep_until it is;
  --     an armed run removes exactly those sessions and attempts and audits
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_base := prune_fact_practice();
  update sprint_sessions set keep_until = current_date - 1 where student_id = v_s1;
  if (prune_fact_practice()->>'sprint_sessions')::int <> (v_base->>'sprint_sessions')::int then
    raise exception 'FAIL B17: a session that may still be taking saves was a candidate';
  end if;
  update sprint_sessions set started_at = started_at - interval '2 days' where student_id = v_s1;
  v_res := prune_fact_practice();
  if (v_res->>'sprint_sessions')::int <> (v_base->>'sprint_sessions')::int + 2
     or (v_res->>'sprint_attempts')::int <> (v_base->>'sprint_attempts')::int + 31
     or (select count(*) from sprint_attempts where student_id = v_s1) <> 31 then
    raise exception 'FAIL B17: the dry run % (base %)', v_res, v_base;
  end if;
  v_res := prune_fact_practice(false);
  if exists (select 1 from sprint_sessions where student_id = v_s1)
     or exists (select 1 from sprint_attempts where student_id = v_s1)
     or not exists (select 1 from sprint_sessions where student_id = v_s2)
     or (select (metadata->>'sessions') || ':' || (metadata->>'attempts') from audit_log
          where action = 'fact_practice.prune' and target_id = v_class and metadata->>'kind' = 'sprint'
          order by created_at desc limit 1) is null then
    raise exception 'FAIL B17: the armed run %', v_res;
  end if;
  n := n + 1;

  -- B18 the purge (ER-16): an account deleted 31 days ago loses its sprint
  --     rows by an explicit, counted delete
  select count(*) into v_n from sprint_attempts where student_id = v_s2;
  update users set deleted_at = now() - interval '31 days' where id = v_s2;
  perform purge_soft_deleted();
  if exists (select 1 from sprint_attempts where student_id = v_s2)
     or exists (select 1 from sprint_sessions where student_id = v_s2)
     or (select (regexp_match(notes, 'sprint purged ([0-9]+) attempts'))[1]::int
           from analytics_job_runs where job_name = 'purge' order by id desc limit 1) < v_n then
    raise exception 'FAIL B18: the purge''s counted delete';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-engine: %/18', n;
end
$vfy$;
