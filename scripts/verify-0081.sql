-- verify-0081.sql — a second session the same day tops up (migration 0081).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).

-- @section A-posture
-- @expect-rows
select 'early_columns_default_false',
       (select count(*) = 2 from information_schema.columns
         where table_schema = 'public' and column_name = 'early'
           and table_name in ('mixed_session_items', 'mixed_attempts')
           and is_nullable = 'NO' and column_default = 'false'),
       'the marker is on the item and the attempt, not null, default false';
select 'scheduler_functions_stay_service_only',
       not has_function_privilege('authenticated', 'mixed_steps(uuid, uuid, integer[], integer)', 'execute')
       and not has_function_privilege('anon', 'mixed_steps(uuid, uuid, integer[], integer)', 'execute')
       and not has_function_privilege('authenticated', 'mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text)', 'execute')
       and not has_function_privilege('anon', 'mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text)', 'execute'),
       'dropping and recreating them did not reopen them to clients';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev    text := repeat('d', 64);
  v_set    jsonb := '{"mixed_step_intervals": [1, 30, 60, 90, 120], "mixed_wrong_drop": 1,
                      "mixed_items_per_session": 6, "mixed_max_discrimination": 1,
                      "mixed_new_skills_per_session": 1, "mixed_struggling_window": 5,
                      "mixed_struggling_min_right": 3}'::jsonb;
  v_ivs    integer[] := array[1, 3, 7, 14, 28];
  v_zone   text := 'Pacific/Auckland';
  v_today  date;
  v_t      uuid := gen_random_uuid();
  v_o      uuid := gen_random_uuid();
  v_s1     uuid := gen_random_uuid();   -- the step rules
  v_s2     uuid := gen_random_uuid();   -- the plan
  v_k      uuid;
  v_id     uuid;
  v_ver    uuid;
  v_i      integer;
  v_key    text;
  v_got    text;
  v_res    jsonb;
  v_sess   uuid;
  v_step   integer;
  v_due    date;
  v_last   date;
  v_any    date;
  v_table  jsonb := '{"columns": ["x"], "rows": [[1], [2], [3]], "total": 3}'::jsonb;
  n        integer := 0;
begin
  v_today := (now() at time zone v_zone)::date;

  -- One first try: its own session, numbered after that student's others that day.
  create function pg_temp.vfy_try(p_k uuid, p_s uuid, p_o uuid, p_day date, p_key text,
                                  p_ok boolean, p_skip boolean, p_early boolean, p_rev text)
  returns void language plpgsql as $f$
  declare v uuid;
  begin
    insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                                planned, keep_until, started_at, finished_at)
    select p_k, p_s, p_day,
           coalesce((select max(ordinal) from mixed_sessions
                      where class_id = p_k and student_id = p_s and practice_day = p_day), 0) + 1,
           p_rev, false, 1, current_date + 100, now(), now()
    returning id into v;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                     item_id, fingerprint, row_index, document, row_values, early)
    values (v, 1, p_s, 'skill', p_key, p_o, 'vfy0081-x#one', repeat('0', 64), 0, '{}', '{}', p_early);
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind,
                                bank_key, correct, skipped, early)
    values (v, 1, p_s, p_k, p_day, 'skill', p_key, p_ok, p_skip, p_early);
  end $f$;

  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0081-' || o || '@vfy0081.example', '{}'::jsonb
    from unnest(array[v_t, v_o, v_s1, v_s2]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_o);
  update users set role = 'student' where id in (v_s1, v_s2);
  update users set timezone = v_zone where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0081', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s1), (v_k, v_s2);

  -- Six taught skills, a to f, in chain order, each with one ratified template.
  for v_i in 1..6 loop
    v_key := 'skill.vfy0081.' || chr(96 + v_i);
    insert into activities (owner_id, title, slug, status, source_path, primary_skill)
    values (v_o, 'vfy ' || v_i, 'vfy-0081-' || v_i, 'published', 'p/0' || v_i || '.md', v_key)
    returning id into v_id;
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_id, 1, '{"sections": [], "meta": {}}'::jsonb, v_o) returning id into v_ver;
    update activities set current_version_id = v_ver where id = v_id;
    insert into class_activities (class_id, activity_id, added_by) values (v_k, v_id, v_t);
    insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                                attempt_number, responses, verdicts, created_at)
    values (v_s2, v_id, v_ver, 's1', 1, '{}', '{}', now() - interval '60 days');
    insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id,
                               discriminates, status, position, document, seed_spec,
                               value_table, fingerprint, retired_at)
    values (v_o, 'vfy0081-' || chr(96 + v_i) || '#one', 'banks/vfy/x.md', 'skill', v_key,
            'chain.vfy0081', '{}', 'ratified', 0, '{"t":"x"}', '{}', v_table, repeat('7', 64), null);
  end loop;

  -- A session's revision must exist, and this one must be the newest mirrored.
  perform sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy',
                                                 'settings', v_set), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_rev;

  -- ---- the step rules (v_s1) -----------------------------------------------
  -- Shared history on a, b, c, d: right at -10, -9, -6 → step 3, due at -6+14.
  foreach v_key in array array['a', 'b', 'c', 'd'] loop
    perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today - 10, 'skill.vfy0081.' || v_key, true, false, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today - 9,  'skill.vfy0081.' || v_key, true, false, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today - 6,  'skill.vfy0081.' || v_key, true, false, false, v_rev);
  end loop;
  -- e: the same history, nothing early (the control).
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today - 10, 'skill.vfy0081.e', true, false, false, v_rev);
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today - 9,  'skill.vfy0081.e', true, false, false, v_rev);
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today - 6,  'skill.vfy0081.e', true, false, false, v_rev);

  -- B1 a right early item: step, schedule and due date unchanged; staleness moves
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today, 'skill.vfy0081.a', true, false, true, v_rev);
  select step, due_on, last_day, last_any into v_step, v_due, v_last, v_any
    from mixed_steps(v_k, v_s1, v_ivs, 1) where bank_key = 'skill.vfy0081.a';
  if v_step <> 3 or v_due <> v_today + 8 or v_last <> v_today - 6 or v_any <> v_today then
    raise exception 'FAIL B1: right early gave step %, due %, set %, last any %', v_step, v_due, v_last, v_any;
  end if;
  n := n + 1;

  -- B2 a wrong early item: drops one step, and the schedule restarts today
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today, 'skill.vfy0081.b', false, false, true, v_rev);
  select step, due_on, last_day into v_step, v_due, v_last
    from mixed_steps(v_k, v_s1, v_ivs, 1) where bank_key = 'skill.vfy0081.b';
  if v_step <> 2 or v_due <> v_today + 7 or v_last <> v_today then
    raise exception 'FAIL B2: wrong early gave step %, due %, set %', v_step, v_due, v_last;
  end if;
  n := n + 1;

  -- B3 a skipped early item: no drop (author ruling), but staleness still moves
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today, 'skill.vfy0081.c', false, true, true, v_rev);
  select step, due_on, last_any into v_step, v_due, v_any
    from mixed_steps(v_k, v_s1, v_ivs, 1) where bank_key = 'skill.vfy0081.c';
  if v_step <> 3 or v_due <> v_today + 8 or v_any <> v_today then
    raise exception 'FAIL B3: skipped early gave step %, due %, last any %', v_step, v_due, v_any;
  end if;
  n := n + 1;

  -- B4 right early, then a right scheduled-looking repeat the same day: a day
  -- with ANY early item can't step up
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today, 'skill.vfy0081.d', true, false, true, v_rev);
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today, 'skill.vfy0081.d', true, false, false, v_rev);
  select step, due_on into v_step, v_due
    from mixed_steps(v_k, v_s1, v_ivs, 1) where bank_key = 'skill.vfy0081.d';
  if v_step <> 3 or v_due <> v_today + 8 then
    raise exception 'FAIL B4: an early day stepped up: step %, due %', v_step, v_due;
  end if;
  n := n + 1;

  -- B5 the control: a scheduled right day still steps up, a scheduled skip still drops
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today, 'skill.vfy0081.e', true, false, false, v_rev);
  select step, due_on into v_step, v_due
    from mixed_steps(v_k, v_s1, v_ivs, 1) where bank_key = 'skill.vfy0081.e';
  if v_step <> 4 or v_due <> v_today + 28 then
    raise exception 'FAIL B5: a scheduled right day gave step %, due %', v_step, v_due;
  end if;
  perform pg_temp.vfy_try(v_k, v_s1, v_o, v_today + 1, 'skill.vfy0081.e', false, true, false, v_rev);
  select step into v_step from mixed_steps(v_k, v_s1, v_ivs, 1) where bank_key = 'skill.vfy0081.e';
  if v_step <> 3 then raise exception 'FAIL B5: a scheduled skip gave step %', v_step; end if;
  n := n + 1;

  -- ---- the plan (v_s2), intervals [1, 30, ...], one new skill per session -----
  -- a: wrong at -5 → step 0, DUE. b: right at -9, not due, stalest.
  -- c: right at -4, not due. d: right at -6, then early today → last resort.
  -- e: right today (scheduled) → last resort. f: never practised → NEW.
  perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today - 5, 'skill.vfy0081.a', false, false, false, v_rev);
  perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today - 9, 'skill.vfy0081.b', true, false, false, v_rev);
  perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today - 4, 'skill.vfy0081.c', true, false, false, v_rev);
  perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today - 6, 'skill.vfy0081.d', true, false, false, v_rev);
  perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today,     'skill.vfy0081.d', true, false, true, v_rev);
  perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today,     'skill.vfy0081.e', true, false, false, v_rev);

  -- B6 the first session of the day doesn't top up: new + due, and it ends early
  select string_agg(right(p.bank_key, 1), '' order by p.bank_key) into v_got
    from mixed_plan(v_k, v_s2, gen_random_uuid(), v_today, 1, v_set, 8, v_zone) p;
  if v_got is distinct from 'af' then raise exception 'FAIL B6: first session gave %', v_got; end if;
  n := n + 1;

  -- B7 a later session fills in order: due, stalest not-yet-due, then today's
  select string_agg(right(p.bank_key, 1), '' order by p.bank_key) into v_got
    from mixed_plan(v_k, v_s2, gen_random_uuid(), v_today, 2, v_set, 3, v_zone) p;
  if v_got is distinct from 'abf' then raise exception 'FAIL B7: 3 items gave % (want the stalest, b)', v_got; end if;
  select string_agg(right(p.bank_key, 1), '' order by p.bank_key) into v_got
    from mixed_plan(v_k, v_s2, gen_random_uuid(), v_today, 2, v_set, 4, v_zone) p;
  if v_got is distinct from 'abcf' then raise exception 'FAIL B7: 4 items gave % (no repeat before c)', v_got; end if;
  n := n + 1;

  -- B8 one item per skill, and the marker: only not-yet-due items and a repeat
  -- of a skill pulled forward today are early
  select string_agg(right(p.bank_key, 1) || ':' || p.early::text, ',' order by p.bank_key) into v_got
    from mixed_plan(v_k, v_s2, gen_random_uuid(), v_today, 2, v_set, 8, v_zone) p;
  if v_got is distinct from 'a:false,b:true,c:true,d:true,e:false,f:false' then
    raise exception 'FAIL B8: the plan and its marker were %', v_got;
  end if;
  n := n + 1;

  -- B10 staleness reads the last practice of ANY kind: b, pulled forward
  -- yesterday, is now fresher than c, though the schedule still dates b from -9
  perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today - 1, 'skill.vfy0081.b', true, false, true, v_rev);
  select string_agg(right(p.bank_key, 1), '' order by p.bank_key) into v_got
    from mixed_plan(v_k, v_s2, gen_random_uuid(), v_today, 2, v_set, 3, v_zone) p;
  if v_got is distinct from 'acf' then raise exception 'FAIL B10: 3 items gave % (want c)', v_got; end if;
  n := n + 1;

  -- B9 end to end: the session stores the marker, the attempt copies it, and a
  -- right answer on it leaves the skill's schedule alone
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_mixed_practice(v_k, true);
  perform set_mixed_settings(v_k, 8, false);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_res := start_mixed_session(v_k, true);
  if v_res->>'state' <> 'started' then raise exception 'FAIL B9: start gave %', v_res; end if;
  v_sess := (v_res->'session'->>'session_id')::uuid;
  select string_agg(right(si.bank_key, 1), '' order by si.bank_key) into v_got
    from mixed_session_items si where si.session_id = v_sess and si.early;
  if v_got is distinct from 'bcd' then raise exception 'FAIL B9: stored early items were %', v_got; end if;
  select si.seq into v_i from mixed_session_items si
   where si.session_id = v_sess and si.bank_key = 'skill.vfy0081.b';
  perform record_mixed_attempt(v_s2, v_sess, v_i, true, false, '{}', '{}');
  if not (select a.early from mixed_attempts a where a.session_id = v_sess and a.seq = v_i) then
    raise exception 'FAIL B9: the attempt did not copy the marker';
  end if;
  select step, last_day, last_any into v_step, v_last, v_any
    from mixed_steps(v_k, v_s2, array[1, 30, 60, 90, 120], 1) where bank_key = 'skill.vfy0081.b';
  if v_step <> 1 or v_last <> v_today - 9 or v_any <> v_today then
    raise exception 'FAIL B9: b after its early answer: step %, set %, last any %', v_step, v_last, v_any;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-behavioral: %/10', n;
end
$vfy$;
