-- verify-0067.sql — mixed_attempts.misconception_ids (migration 0067, W-5).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0045/0050/0066 idiom): its own settings
-- revision, class, student and session, written directly (the planner is
-- verify-0066's), real record_mixed_attempt, everything rolled back (P7).
--
--   §A — catalog posture: the column is text[] NOT NULL default '{}'; the
--        (class_id, practice_day) index exists; the derivation helper and the
--        verdict write stay service-role only.
--   §B — the derivation: a wrong try's ids are the DISTINCT, SORTED `mis.*`
--        tags across all its verdicts; junk (non-strings, non-`mis.` tags)
--        is dropped; a right try and a skip carry none; a replay changes
--        nothing; the RPC returns what it stored.

-- @section A-catalog-posture
-- @expect-rows
select 'misconception_ids_column_shape',
       exists (select 1 from information_schema.columns
                where table_schema = 'public' and table_name = 'mixed_attempts'
                  and column_name = 'misconception_ids' and data_type = 'ARRAY'
                  and udt_name = '_text' and is_nullable = 'NO'
                  and column_default like '''{}''%'),
       'text[], never null, empty by default (W-5)';
select 'class_day_index_exists',
       exists (select 1 from pg_indexes
                where schemaname = 'public' and tablename = 'mixed_attempts'
                  and indexname = 'mixed_attempts_class_day_idx'
                  and indexdef like '%(class_id, practice_day)%'),
       'the panel''s whole-class day reads have an index (W-5)';
select 'derivation_and_write_service_only',
       (select bool_and(not has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute')
                        and has_function_privilege('service_role', p.oid, 'execute'))
               and count(*) = 2
          from pg_proc p
         where p.pronamespace = 'public'::regnamespace
           and p.proname in ('mixed_misconceptions_of', 'record_mixed_attempt')),
       'no client role can write a verdict or call the helper';

-- @section B-derivation
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev   text := repeat('f', 64);
  v_set   jsonb := '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1,
                     "mixed_items_per_session": 6, "mixed_max_discrimination": 1,
                     "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
                     "mixed_struggling_min_right": 3}'::jsonb;
  v_t     uuid := gen_random_uuid();
  v_s     uuid := gen_random_uuid();
  v_k     uuid;
  v_sess  uuid := gen_random_uuid();
  v_res   jsonb;
  v_got   text[];
  n       integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0067-' || o || '@vfy0067.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id = v_s;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0067 class', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s);
  perform sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy',
                                                 'settings', v_set), true);
  insert into mixed_sessions (id, class_id, student_id, practice_day, ordinal, revision,
                              graded, planned, keep_until)
  values (v_sess, v_k, v_s, current_date, 1, v_rev, false, 4, current_date + 130);
  insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                   item_id, fingerprint, row_index, document, row_values)
  select v_sess, i, v_s, 'skill', 'skill.vfy0067.' || i, v_t, 'vfy0067#t' || i,
         repeat('1', 64), 0, '{}'::jsonb, '{}'::jsonb
    from generate_series(1, 4) i;

  -- B1 a wrong try: distinct, sorted, across items; junk dropped ------------
  v_res := record_mixed_attempt(v_s, v_sess, 1, false, false, '{}',
    '{"b1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy.z", "mis.vfy.a"]},
      "b2": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy.a", 7, "not-a-tag", {"x": "mis.vfy.obj"}]},
      "b5": {"verdict": "incorrect", "misconceptionIds": ["mis.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"]},
      "b3": {"verdict": "correct"},
      "b4": {"verdict": "incorrect", "misconceptionIds": "mis.vfy.scalar"}}');
  select misconception_ids into v_got from mixed_attempts where session_id = v_sess and seq = 1;
  if v_got is distinct from array['mis.vfy.a', 'mis.vfy.z'] then
    raise exception 'FAIL B1: a wrong try stored %', v_got;
  end if;
  if v_res->'misconception_ids' is distinct from '["mis.vfy.a", "mis.vfy.z"]'::jsonb then
    raise exception 'FAIL B1: the RPC returned %', v_res;
  end if;
  n := n + 1;

  -- B2 a replay changes nothing, even with different verdicts ---------------
  v_res := record_mixed_attempt(v_s, v_sess, 1, false, false, '{}',
    '{"b1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy.other"]}}');
  select misconception_ids into v_got from mixed_attempts where session_id = v_sess and seq = 1;
  if not (v_res->>'replayed')::boolean or v_got is distinct from array['mis.vfy.a', 'mis.vfy.z'] then
    raise exception 'FAIL B2: a replay rewrote the ids to % (%)', v_got, v_res;
  end if;
  n := n + 1;

  -- B3 a right try and a skip carry none ------------------------------------
  -- A right try whose verdicts carry an id anyway (a correct part beside a
  -- wrong one cannot make the item right, but the column must not depend on
  -- the grader never emitting one).
  perform record_mixed_attempt(v_s, v_sess, 2, true, false, '{}',
    '{"b1": {"verdict": "correct", "misconceptionIds": ["mis.vfy.a"]}}');
  perform record_mixed_attempt(v_s, v_sess, 3, false, true, '{}',
    '{"b1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy.a"]}}');
  if exists (select 1 from mixed_attempts
              where session_id = v_sess and seq in (2, 3) and misconception_ids <> '{}') then
    raise exception 'FAIL B3: a right try or a skip carries misconception ids';
  end if;
  n := n + 1;

  -- B4 a wrong try with no bound mistake (C-162: a form-skill blank) --------
  perform record_mixed_attempt(v_s, v_sess, 4, false, false, '{}',
    '{"b1": {"verdict": "incorrect"}}');
  if (select misconception_ids from mixed_attempts where session_id = v_sess and seq = 4)
       is distinct from '{}'::text[] then
    raise exception 'FAIL B4: an unbound wrong try carries ids';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-derivation: %/4', n;
end
$vfy$;
