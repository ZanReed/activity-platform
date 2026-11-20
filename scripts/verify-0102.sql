-- verify-0102.sql — class_gradebook, the gradebook file's marks (migration
-- 0102; docs/design/gradebook-export.md GB-1..GB-13). Run with
-- `pnpm verify:auth --target live|local --only verify-0102`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block,
-- so nothing persists (P7).

-- @section A-posture
-- @expect-rows
select 'signed_in_only',
       has_function_privilege('authenticated', 'public.class_gradebook(uuid)', 'execute')
       and not has_function_privilege('anon', 'public.class_gradebook(uuid)', 'execute'),
       'class_gradebook is callable signed in, never anonymously';
select 'definer_with_fixed_path',
       (select prosecdef and proconfig @> array['search_path=public']
          from pg_proc where oid = 'public.class_gradebook(uuid)'::regprocedure),
       'SECURITY DEFINER with search_path pinned';
select 'teacher_gate_is_the_class',
       pg_get_functiondef('public.class_gradebook(uuid)'::regprocedure) ~ 'is_class_teacher\(p_class_id\)',
       'gated on is_class_teacher, not on activity ownership (the class-progress access trap)';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t    uuid := gen_random_uuid();   -- the class's teacher
  v_t2   uuid := gen_random_uuid();   -- another teacher
  v_s1   uuid := gen_random_uuid();   -- on the roster, checked and graded
  v_s2   uuid := gen_random_uuid();   -- on the roster, never checked A
  v_s3   uuid := gen_random_uuid();   -- removed from the roster
  v_o    uuid := gen_random_uuid();   -- in another teacher's class only
  v_k    uuid;  v_k2 uuid;
  v_a    uuid;  v_va uuid;            -- hand-graded activity
  v_d    uuid;  v_vd uuid;            -- DoL activity with a skill
  v_sa   uuid := gen_random_uuid();
  v_es   uuid := gen_random_uuid();
  v_ph   uuid := gen_random_uuid();
  v_mc   uuid := gen_random_uuid();
  v_c1   uuid;  v_c2 uuid;  v_cs3 uuid;  v_co uuid;
  v_mrev text := repeat('a', 64);
  v_sess uuid;
  v_g    jsonb;
  v_h    jsonb;
  v_p    jsonb;
  v_got  text;
  n      integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0102-' || o || '@vfy0102.example', '{}'::jsonb
    from unnest(array[v_t, v_t2, v_s1, v_s2, v_s3, v_o]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_t2);
  update users set role = 'student' where id in (v_s1, v_s2, v_s3, v_o);

  -- A: short answer (rubric 3 + 1), essay (rubric 6), a photo answer while
  -- photo answers are off (not in the denominator), one auto-marked choice.
  insert into activities (owner_id, title, slug, status) values (v_t, 'vfy 0102 a', 'vfy-0102-a', 'published')
  returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
            'id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_sa, 'type', 'short_answer', 'prompt', '[]'::jsonb,
                  'rubric', jsonb_build_object('criteria', jsonb_build_array(
                    jsonb_build_object('id', 'c1', 'maxPoints', 3),
                    jsonb_build_object('id', 'c2', 'maxPoints', 1)))),
                jsonb_build_object('id', v_es, 'type', 'essay', 'prompt', '[]'::jsonb,
                  'rubric', jsonb_build_object('criteria', jsonb_build_array(
                    jsonb_build_object('id', 'e1', 'maxPoints', 6)))),
                jsonb_build_object('id', v_ph, 'type', 'photo_response', 'prompt', '[]'::jsonb),
                jsonb_build_object('id', v_mc, 'type', 'multiple_choice', 'prompt', '[]'::jsonb))))))))), v_t)
  returning id into v_va;
  update activities set current_version_id = v_va where id = v_a;

  -- D: a one-part catalogue skill, so dol_pass_skill names it.
  insert into activities (owner_id, title, slug, status, source_path, primary_skill)
  values (v_t, 'vfy 0102 d', 'vfy-0102-d', 'published', 'vfy0102/d.md', 'skill.vfy0102')
  returning id into v_d;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_d, 1, '{"sections": []}'::jsonb, v_t) returning id into v_vd;
  update activities set current_version_id = v_vd where id = v_d;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0102', v_t, 'vfy', current_date + 200) returning id into v_k;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t2, 'vfy 0102 other', v_t2, 'vfy', current_date + 200) returning id into v_k2;
  insert into class_activities (class_id, activity_id, added_by) values (v_k, v_a, v_t), (v_k, v_d, v_t);
  insert into class_activities (class_id, activity_id, added_by) values (v_k2, v_a, v_t2);
  insert into class_members (class_id, student_id) values (v_k, v_s1), (v_k, v_s2), (v_k2, v_o);
  insert into class_members (class_id, student_id, removed_at) values (v_k, v_s3, now());

  -- S1: attempt 1, short answer RELEASED 3 + 1, essay graded but NOT released;
  -- attempt 2 changes the short answer and is graded 0, NOT released.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number,
                              responses, verdicts, section_total, created_at)
  values (v_s1, v_a, v_va, 's1', 1, jsonb_build_object('freeText', jsonb_build_object(v_sa::text, 'first')),
          '{}'::jsonb, 1, now() - interval '2 hours')
  returning id into v_c1;
  insert into check_grades (check_id, block_id, criteria, graded_at, released_at) values
    (v_c1, v_sa, '[{"criterionId":"c1","earned":3,"maxPoints":3},{"criterionId":"c2","earned":1,"maxPoints":1}]',
     now() - interval '90 minutes', now() - interval '80 minutes'),
    (v_c1, v_es, '[{"criterionId":"e1","earned":5,"maxPoints":6}]', now() - interval '90 minutes', null);
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number,
                              responses, verdicts, section_total, created_at)
  values (v_s1, v_a, v_va, 's1', 2, jsonb_build_object('freeText', jsonb_build_object(v_sa::text, 'second')),
          '{}'::jsonb, 1, now() - interval '1 hour')
  returning id into v_c2;
  insert into check_grades (check_id, block_id, criteria, graded_at, released_at) values
    (v_c2, v_sa, '[{"criterionId":"c1","earned":0,"maxPoints":3},{"criterionId":"c2","earned":0,"maxPoints":1}]',
     now() - interval '30 minutes', null);

  -- S3 (removed) and O (another teacher's class) both checked A, graded and
  -- released: neither may appear.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number,
                              responses, verdicts, section_total)
  values (v_s3, v_a, v_va, 's1', 1, '{}'::jsonb, '{}'::jsonb, 1) returning id into v_cs3;
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number,
                              responses, verdicts, section_total)
  values (v_o, v_a, v_va, 's1', 1, '{}'::jsonb, '{}'::jsonb, 1) returning id into v_co;
  insert into check_grades (check_id, block_id, criteria, released_at) values
    (v_cs3, v_sa, '[{"criterionId":"c1","earned":3,"maxPoints":3}]', now()),
    (v_co,  v_sa, '[{"criterionId":"c1","earned":3,"maxPoints":3}]', now());

  -- DoL: S1 passed with a check on D; S2 passed the same skill elsewhere
  -- (a teacher tick, no check on D); O passed with a check on D.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number,
                              responses, verdicts, section_total)
  values (v_s1, v_d, v_vd, 'x', 1, '{}'::jsonb, '{}'::jsonb, 1),
         (v_o,  v_d, v_vd, 'x', 1, '{}'::jsonb, '{}'::jsonb, 1);
  insert into dol_pass (student_id, skill_id, source, granted_by) values
    (v_s1, 'skill.vfy0102', 'auto', null),
    (v_s2, 'skill.vfy0102', 'teacher', v_t),
    (v_o,  'skill.vfy0102', 'auto', null);

  -- Practice, at a scored class. S1's sessions:
  --   a  finished yesterday 3/6           counts (latest)
  --   b  open, 2 days old, one answer 1/6 counts (closed by time)
  --   c  open, 2 days old, no answer      not a session
  --   r  review, finished 2/4             counts, separately
  --   u  UNgraded, finished 6/6           never
  perform sync_mixed_settings(jsonb_build_object('revision', v_mrev, 'graph_version', 'vfy', 'settings',
    '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1, "mixed_items_per_session": 6,
      "mixed_max_discrimination": 1, "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
      "mixed_struggling_min_right": 3}'::jsonb), true);
  update classes set mixed_on_at = now(), mixed_graded = true where id = v_k;
  insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded, planned,
                              keep_until, started_at, finished_at, score_right, score_answered, review)
  values (v_k, v_s1, current_date - 1, 1, v_mrev, true, 6, current_date + 100,
          now() - interval '1 day', now() - interval '1 day', 3, 6, false),
         (v_k, v_s1, current_date - 3, 1, v_mrev, true, 6, current_date + 100,
          now() - interval '3 days', null, 0, 0, false),
         (v_k, v_s1, current_date - 4, 1, v_mrev, true, 4, current_date + 100,
          now() - interval '4 days', now() - interval '4 days', 2, 4, true),
         (v_k, v_s1, current_date - 5, 1, v_mrev, false, 6, current_date + 100,
          now() - interval '5 days', now() - interval '5 days', 6, 6, false);
  insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded, planned,
                              keep_until, started_at, finished_at, score_right, score_answered)
  values (v_k, v_s1, current_date - 2, 1, v_mrev, true, 6, current_date + 100,
          now() - interval '2 days', null, 1, 1)
  returning id into v_sess;
  insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                   item_id, fingerprint, row_index, document, row_values)
  values (v_sess, 1, v_s1, 'skill', 'skill.vfy0102', v_t, 'vfy0102#one', repeat('0', 64), 0, '{}', '{}');
  insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind, bank_key,
                              correct, skipped, misconception_ids, saved_at)
  values (v_sess, 1, v_s1, v_k, current_date - 2, 'skill', 'skill.vfy0102', true, false, '{}',
          now() - interval '2 days');

  -- S3 (removed) has a closed graded session too: it must not appear (B7b).
  insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded, planned,
                              keep_until, started_at, finished_at, score_right, score_answered)
  values (v_k, v_s3, current_date - 1, 1, v_mrev, true, 6, current_date + 100,
          now() - interval '1 day', now() - interval '1 day', 6, 6);

  -- B1 another teacher cannot read this class
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_got := null;
  begin perform class_gradebook(v_k); exception when others then v_got := sqlerrm; end;
  execute 'reset role';
  if v_got is distinct from 'not_class_teacher' then
    raise exception 'FAIL B1: another teacher read the class (%)', v_got;
  end if;
  n := n + 1;

  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_g := class_gradebook(v_k);
  execute 'reset role';

  -- B2 the ownership trap: only S1 has hand rows (S3 removed, O elsewhere)
  if (select count(*) from jsonb_array_elements(v_g->'hand') h
       where (h->>'student_id')::uuid is distinct from v_s1) <> 0 then
    raise exception 'FAIL B2: hand rows for students off the live roster: %', v_g->'hand';
  end if;
  n := n + 1;

  -- B3 released only, latest RELEASED wins, one denominator from the rubric
  select h into v_h from jsonb_array_elements(v_g->'hand') h
   where (h->>'student_id')::uuid = v_s1 and (h->>'activity_id')::uuid = v_a;
  if v_h is null
     or (v_h->>'points')::numeric <> 4
     or (v_h->>'possible')::numeric <> 10
     or (v_h->>'pending')::numeric <> 6 then
    raise exception 'FAIL B3: S1 on A expected 4 of 10, 6 points pending (the unreleased essay); got %', v_h;
  end if;
  n := n + 1;

  -- B4 the released short answer's answer changed since it was graded
  if (v_h->>'stale')::int <> 1 then
    raise exception 'FAIL B4: expected 1 stale grade; got %', v_h;
  end if;
  n := n + 1;

  -- B5 A has points columns; only D has a DoL column
  if not (v_g->'hand_activities') @> to_jsonb(array[v_a])
     or (v_g->'hand_activities') @> to_jsonb(array[v_d])
     or (v_g->'dol_activities') <> to_jsonb(array[v_d]) then
    raise exception 'FAIL B5: hand_activities=% dol_activities=%', v_g->'hand_activities', v_g->'dol_activities';
  end if;
  n := n + 1;

  -- B6 GB-4: a pass counts only with a check on THIS activity, roster only
  if jsonb_array_length(v_g->'dol') <> 1
     or (v_g->'dol'->0->>'student_id')::uuid <> v_s1
     or v_g->'dol'->0->>'source' <> 'auto' then
    raise exception 'FAIL B6: dol rows %', v_g->'dol';
  end if;
  n := n + 1;

  -- B7 GB-5: closed graded sessions, pooled; the open-and-abandoned one counts
  select p into v_p from jsonb_array_elements(v_g->'practice') p
   where (p->>'student_id')::uuid = v_s1 and not (p->>'review')::boolean;
  if v_p is null or (v_p->>'right')::int <> 4 or (v_p->>'planned')::int <> 12
     or (v_p->>'sessions')::int <> 2
     or (v_p->>'latest_right')::int <> 3 or (v_p->>'latest_planned')::int <> 6 then
    raise exception 'FAIL B7: practice expected 4/12 over 2, latest 3/6; got %', v_p;
  end if;
  n := n + 1;

  -- B7b practice is roster-scoped too
  if exists (select 1 from jsonb_array_elements(v_g->'practice') p
              where (p->>'student_id')::uuid is distinct from v_s1) then
    raise exception 'FAIL B7b: practice rows off the live roster: %', v_g->'practice';
  end if;
  n := n + 1;

  -- B8 reviews kept apart
  select p into v_p from jsonb_array_elements(v_g->'practice') p
   where (p->>'student_id')::uuid = v_s1 and (p->>'review')::boolean;
  if v_p is null or (v_p->>'right')::int <> 2 or (v_p->>'planned')::int <> 4
     or (v_p->>'sessions')::int <> 1 then
    raise exception 'FAIL B8: review expected 2/4 over 1; got %', v_p;
  end if;
  n := n + 1;

  -- B9 the practice group is shown for a class with scores on
  if not (v_g->>'practice_shown')::boolean then
    raise exception 'FAIL B9: practice_shown is false';
  end if;
  n := n + 1;

  -- B10 the other class: O's marks are there, S1's are not
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_g := class_gradebook(v_k2);
  execute 'reset role';
  if jsonb_array_length(v_g->'hand') <> 1 or (v_g->'hand'->0->>'student_id')::uuid <> v_o
     or (v_g->'hand'->0->>'points')::numeric <> 3
     or (v_g->>'practice_shown')::boolean then
    raise exception 'FAIL B10: other class got %', v_g;
  end if;
  n := n + 1;

  -- B11 GB-8: the live roster's emails, and nobody else's
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_g := class_gradebook(v_k);
  execute 'reset role';
  if (select array_agg(st->>'email' order by st->>'email') from jsonb_array_elements(v_g->'students') st)
     is distinct from array['vfy0102-3@vfy0102.example', 'vfy0102-4@vfy0102.example'] then
    raise exception 'FAIL B11: students %', v_g->'students';
  end if;
  n := n + 1;

  -- B12 a republish keeps the marks the student has seen: v2 keeps the
  -- short answer's block id, S1 checks v2, and the released 4 points carry
  -- over (flagged) while the denominator is v2's.
  declare v_va2 uuid;
  begin
    insert into activity_versions (activity_id, version_num, content, created_by)
    select v_a, 2, content, v_t from activity_versions where id = v_va returning id into v_va2;
    update activities set current_version_id = v_va2 where id = v_a;
    insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number,
                                responses, verdicts, section_total)
    values (v_s1, v_a, v_va2, 's1', 1, jsonb_build_object('freeText', jsonb_build_object(v_sa::text, 'second')),
            '{}'::jsonb, 1);
    perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
    execute 'set local role authenticated';
    v_g := class_gradebook(v_k);
    execute 'reset role';
    select h into v_h from jsonb_array_elements(v_g->'hand') h
     where (h->>'student_id')::uuid = v_s1 and (h->>'activity_id')::uuid = v_a;
    if v_h is null or (v_h->>'points')::numeric <> 4 or (v_h->>'possible')::numeric <> 10
       or (v_h->>'from_older')::int <> 1 then
      raise exception 'FAIL B12: after a republish expected 4 of 10 from an older version; got %', v_h;
    end if;
  end;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0102 B: % checks passed', n;
end;
$vfy$;
