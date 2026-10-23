-- verify-0068.sql — mixed practice's teacher panel (migration 0068).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0051/0066 idiom): its own mixed settings
-- revision and fact-scope revision stamped mirrored_at in 2999, real
-- functions, everything rolled back (P7).
--
--   §A — posture: the reads are definer, pinned, signed-in only; the roster
--        helper is service-role only; skill_label is read-only to clients.
--   §B — W-10: only the class's teacher (a student and another teacher get
--        not_class_teacher; the drawer refuses a non-member). P3: each group
--        FIRES at production values (window 5, min right 3). C-162: getting
--        stuck but not practising today is NOT listed; a misconception's second
--        hit outside the window is NOT listed. S4-3: a number-facts
--        needs-strategy row, only when the sprint is on. Everyone else is a
--        count; started today; the drawer; labels; finished-only scores (S4-5).
--
-- The fixture (UTC class, today = D). Mixed first tries, newest last:
--   Alpha  skill a: D-4 R, D-3 W, D-2 R, D-1 W, D W      → stuck on a, today
--   Beta   skill a: D-5 W, D-4 W, D-3 R, D-2 W, D-1 R    → stuck, NOT today
--   Gamma  skill b: D-4 W(mis.x), D-2 W(mis.x), D R      → same mistake twice
--   Delta  skill b: D-6 W(mis.x), D-5 R, D-4 R, D-3 R, D-2 R, D W(mis.x)
--                                                       → mis.x once in window
--          + a session TODAY on a, nothing tried       → still NOT listed
--   Echo   no mixed; number facts today, family B needs a strategy
--   Fox    nothing
--   Golf   skill a as Beta (stuck); today one try on b  → NOT listed: a was
--          not served today
--   Hotel  no mixed; number facts today: B needs_strategy but now right
--          (out of strategy mode), A never judged but failed today (strategy
--          mode, not needs_strategy) → NOT listed (S4-3: both conditions)
--   India  a DISCRIMINATION bank: D-1 W(mis.y), D W(mis.y) → same mistake
--          twice; its key is never shown, it reads "Choosing between skills"
--          (DM-13; Fable review P2-1)

-- @section A-catalog-posture
-- @expect-rows
select 'reads_signed_in_only_definer',
       bool_and(has_function_privilege('authenticated', f, 'execute')
                and not has_function_privilege('anon', f, 'execute'))
       and (select bool_and(prosecdef and proconfig @> array['search_path=public'])
              from pg_proc where proname in ('mixed_who_first', 'mixed_student_recent',
                                             'mixed_class_summary', 'mixed_class_students', 'mixed_roster')),
       'the teacher reads: definer, pinned, never anonymous'
  from unnest(array['mixed_who_first(uuid)', 'mixed_student_recent(uuid, uuid)',
                    'mixed_class_summary(uuid)', 'mixed_class_students(uuid)']) f;
select 'roster_helper_service_only',
       not has_function_privilege('authenticated', 'mixed_roster(uuid)', 'execute')
       and not has_function_privilege('anon', 'mixed_roster(uuid)', 'execute'),
       'the name-bearing helper is reachable only through the guarded reads';
select 'skill_label_read_only_to_clients',
       has_table_privilege('authenticated', 'skill_label', 'select')
       and not has_table_privilege('authenticated', 'skill_label', 'insert')
       and not has_table_privilege('authenticated', 'skill_label', 'update')
       and not has_table_privilege('anon', 'skill_label', 'select')
       and (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'skill_label'),
       'labels: signed-in read, importer write';

-- @section B-panel
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_mrev    text := repeat('6', 64);
  v_frev    text := repeat('8', 64);
  v_t       uuid := gen_random_uuid();
  v_x       uuid := gen_random_uuid();
  v_alpha   uuid := gen_random_uuid();
  v_beta    uuid := gen_random_uuid();
  v_gamma   uuid := gen_random_uuid();
  v_delta   uuid := gen_random_uuid();
  v_echo    uuid := gen_random_uuid();
  v_fox     uuid := gen_random_uuid();
  v_golf    uuid := gen_random_uuid();
  v_hotel   uuid := gen_random_uuid();
  v_india   uuid := gen_random_uuid();
  v_k       uuid;
  v_code    text;
  v_today   date := (now() at time zone 'UTC')::date;
  v_probe   uuid;
  v_items   jsonb;
  v_att     jsonb;
  v_res     jsonb;
  v_sess    uuid;
  v_got     text;
  v_raised  boolean;
  r         record;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0068-' || o || '@vfy0068.example', '{}'::jsonb
    from unnest(array[v_t, v_x, v_alpha, v_beta, v_gamma, v_delta, v_echo, v_fox, v_golf, v_hotel, v_india]) with ordinality x(u, o);
  update users set role = 'teacher', timezone = 'UTC' where id in (v_t, v_x);
  update users set role = 'student' where id in (v_alpha, v_beta, v_gamma, v_delta, v_echo, v_fox, v_golf, v_hotel, v_india);
  update users set display_name = 'Vfy ' || n.nm
    from (values (v_alpha, 'Alpha'), (v_beta, 'Beta'), (v_gamma, 'Gamma'), (v_delta, 'Delta'),
                 (v_echo, 'Echo'), (v_fox, 'Fox'), (v_golf, 'Golf'), (v_hotel, 'Hotel'), (v_india, 'India')) n(id, nm)
   where users.id = n.id;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0068 class', v_t, 'vfy', current_date + 100) returning id, join_code into v_k, v_code;
  insert into class_members (class_id, student_id)
  select v_k, s from unnest(array[v_alpha, v_beta, v_gamma, v_delta, v_echo, v_fox, v_golf, v_hotel, v_india]) s;

  -- Mixed settings at PRODUCTION values (window 5, min right 3).
  perform sync_mixed_settings(jsonb_build_object('revision', v_mrev, 'graph_version', 'vfy', 'settings',
    '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1, "mixed_items_per_session": 6,
      "mixed_max_discrimination": 1, "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
      "mixed_struggling_min_right": 3}'::jsonb), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_mrev;
  update classes set mixed_on_at = now(), mixed_graded = true where id = v_k;
  insert into skill_label (id, label) values ('skill.vfy0068.a', 'Label for a'), ('skill.vfy0068.b', 'Label for b')
  on conflict (id) do update set label = excluded.label;
  insert into misconception_registry (id, skill, description)
  values ('mis.vfy0068.x', 'skill.vfy0068.b', 'Adds instead of scaling'),
         ('mis.vfy0068.y', null, 'Mixes up the two rates')
  on conflict (id) do update set description = excluded.description;

  -- One finished session per (student, day) with one first try. Today's
  -- sessions are OPEN; Alpha's today and Gamma's D-2 are graded.
  for r in
    select * from (values
      (v_alpha, -4, 'skill.vfy0068.a', true,  '{}'::text[]),
      (v_alpha, -3, 'skill.vfy0068.a', false, '{}'),
      (v_alpha, -2, 'skill.vfy0068.a', true,  '{}'),
      (v_alpha, -1, 'skill.vfy0068.a', false, '{}'),
      (v_alpha,  0, 'skill.vfy0068.a', false, '{}'),
      (v_beta,  -5, 'skill.vfy0068.a', false, '{}'),
      (v_beta,  -4, 'skill.vfy0068.a', false, '{}'),
      (v_beta,  -3, 'skill.vfy0068.a', true,  '{}'),
      (v_beta,  -2, 'skill.vfy0068.a', false, '{}'),
      (v_beta,  -1, 'skill.vfy0068.a', true,  '{}'),
      (v_gamma, -4, 'skill.vfy0068.b', false, '{mis.vfy0068.x}'),
      (v_gamma, -2, 'skill.vfy0068.b', false, '{mis.vfy0068.x}'),
      (v_gamma,  0, 'skill.vfy0068.b', true,  '{}'),
      (v_delta, -6, 'skill.vfy0068.b', false, '{mis.vfy0068.x}'),
      (v_delta, -5, 'skill.vfy0068.b', true,  '{}'),
      (v_delta, -4, 'skill.vfy0068.b', true,  '{}'),
      (v_delta, -3, 'skill.vfy0068.b', true,  '{}'),
      (v_delta, -2, 'skill.vfy0068.b', true,  '{}'),
      (v_delta,  0, 'skill.vfy0068.b', false, '{mis.vfy0068.x}'),
      (v_golf,  -5, 'skill.vfy0068.a', false, '{}'),
      (v_golf,  -4, 'skill.vfy0068.a', false, '{}'),
      (v_golf,  -3, 'skill.vfy0068.a', true,  '{}'),
      (v_golf,  -2, 'skill.vfy0068.a', false, '{}'),
      (v_golf,  -1, 'skill.vfy0068.a', true,  '{}'),
      (v_golf,   0, 'skill.vfy0068.b', true,  '{}')
    ) t(student, d, bank_key, ok, mis)
  loop
    insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                                planned, keep_until, started_at, finished_at, score_right, score_answered)
    values (v_k, r.student, v_today + r.d, 1, v_mrev,
            (r.student = v_alpha and r.d = 0) or (r.student = v_gamma and r.d = -2),
            1, current_date + 100, now() + make_interval(days => r.d),
            case when r.d = 0 then null else now() + make_interval(days => r.d) end,
            case when r.ok then 1 else 0 end, 1)
    returning id into v_sess;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                     item_id, fingerprint, row_index, document, row_values)
    values (v_sess, 1, r.student, 'skill', r.bank_key, v_t, 'vfy0068#one', repeat('0', 64), 0, '{}', '{}');
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind, bank_key,
                                correct, skipped, misconception_ids, saved_at)
    values (v_sess, 1, r.student, v_k, v_today + r.d, 'skill', r.bank_key, r.ok, false, r.mis,
            now() + make_interval(days => r.d));
  end loop;

  -- India: two first tries on a DISCRIMINATION bank, the same mistake both.
  for r in select * from (values (-1), (0)) t(d) loop
    insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                                planned, keep_until, started_at, finished_at, score_right, score_answered)
    values (v_k, v_india, v_today + r.d, 1, v_mrev, false, 1, current_date + 100,
            now() + make_interval(days => r.d), now() + make_interval(days => r.d), 0, 1)
    returning id into v_sess;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                     item_id, fingerprint, row_index, document, row_values)
    values (v_sess, 1, v_india, 'discrimination', 'chain.vfy0068.discrimination', v_t,
            'chain.vfy0068.discrimination#d1', repeat('0', 64), 0, '{}', '{}');
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind, bank_key,
                                correct, skipped, misconception_ids, saved_at)
    values (v_sess, 1, v_india, v_k, v_today + r.d, 'discrimination', 'chain.vfy0068.discrimination',
            false, false, '{mis.vfy0068.y}', now() + make_interval(days => r.d));
  end loop;

  -- Beta starts a session today and tries nothing: served a, practised nothing.
  insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                              planned, keep_until)
  values (v_k, v_beta, v_today, 1, v_mrev, false, 1, current_date + 100) returning id into v_sess;
  insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                   item_id, fingerprint, row_index, document, row_values)
  values (v_sess, 1, v_beta, 'skill', 'skill.vfy0068.a', v_t, 'vfy0068#one', repeat('0', 64), 0, '{}', '{}');

  -- B1 W-10: only the class's teacher --------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_alpha)::text, true);
  v_raised := false;
  begin perform mixed_who_first(v_k); exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B1: a student read the list'; end if;
  v_raised := false;
  begin perform mixed_student_recent(v_k, v_alpha); exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B1: a student read the drawer'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  v_raised := false;
  begin perform mixed_who_first(v_k); exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B1: another teacher read the list'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_raised := false;
  begin perform mixed_student_recent(v_k, v_x); exception when others then v_raised := sqlerrm = 'not_class_teacher'; end;
  if not v_raised then raise exception 'FAIL B1: the drawer opened for a non-member'; end if;
  n := n + 1;

  -- B2 group 1 FIRES (P3): Alpha, with the skill's label; Beta (stuck, not
  --    today) is NOT listed (C-162); Delta (4 of 5 right) is not stuck --------
  v_res := mixed_who_first(v_k);
  select string_agg((e->>'name') || ':' || (s->>'id') || '=' || coalesce(s->>'label', '∅'), ' ')
    into v_got from jsonb_array_elements(v_res->'stuck') e, jsonb_array_elements(e->'skills') s;
  if v_got is distinct from 'Vfy Alpha:skill.vfy0068.a=Label for a' then
    raise exception 'FAIL B2: getting stuck %', v_got;
  end if;
  n := n + 1;

  -- B3 group 2 FIRES (P3): Gamma, mis.x with its label and skill; Delta's
  --    first mis.x is the 6th try back, outside the window: NOT listed ------
  select string_agg((e->>'name') || ':' || (m->>'id') || '=' || coalesce(m->>'label', '∅') || '@'
                    || (m->'skills'->0->>'label'), ' ')
    into v_got from jsonb_array_elements(v_res->'same_mistake') e, jsonb_array_elements(e->'mistakes') m;
  if v_got is distinct from
     'Vfy Gamma:mis.vfy0068.x=Adds instead of scaling@Label for b '
     'Vfy India:mis.vfy0068.y=Mixes up the two rates@Choosing between skills' then
    raise exception 'FAIL B3: same mistake %', v_got;
  end if;
  n := n + 1;

  -- B4 no number-facts rows while the sprint is off ------------------------
  if jsonb_array_length(v_res->'facts') <> 0 or (v_res->>'facts_on')::boolean
     or not (v_res->>'mixed_on')::boolean then
    raise exception 'FAIL B4: facts rows with the sprint off %', v_res->'facts';
  end if;
  n := n + 1;

  -- The number-facts fixture (verify-0051's shape): two families of 10 facts,
  -- Year 7. Echo's check: A right, B all wrong (needs_strategy). Then the
  -- sprint today, every B wrong again, so B stays in strategy mode.
  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count, mirrored_at, sprint)
  -- practice_window 5 (not 0051's 10): one session's first asks fill a window,
  -- so Hotel's never-judged family A can reach strategy mode today.
  values (v_frev, 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 5,
    '{"7": {"adds": ["fact.vfy68.a","fact.vfy68.b"], "cumulative": ["fact.vfy68.a","fact.vfy68.b"], "description": "vfy"}}'::jsonb,
    '{}'::jsonb, 2, 20, '2999-01-01',
    '{"sprint_max_misses": 1, "sprint_minutes": 5, "sprint_step_intervals": [1, 2, 4, 8, 16],
      "sprint_mastered_step": 2, "sprint_new_facts_per_session": 5, "sprint_working_families": 2,
      "sprint_reask_gap": 3}'::jsonb);
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count, strategy)
  select v_frev, 1, 'fact.vfy68.' || c, o - 1, 'generated', 'Fam ' || upper(c), 5, 'square', 3, false, 1, 10, null
    from unnest(array['a','b']) with ordinality t(c, o);
  insert into fact_scope_fact (registry_rev, fact_grammar_rev, fact_id, family_id, ord,
    operands, answer, display, spoken, display_swapped, spoken_swapped)
  select v_frev, 1, 'fact.vfy68.' || c || ':' || g, 'fact.vfy68.' || c, g, array[g],
         (g + 10)::text, upper(c) || g || ' = __', c || ' ' || g, null, null
    from unnest(array['a','b']) c, generate_series(1, 10) g;
  v_probe := (open_fact_probe(v_k, 7)->>'probe_id')::uuid;
  select items into v_items from class_probes where id = v_probe;
  perform set_config('request.jwt.claims', json_build_object('sub', v_echo)::text, true);
  select jsonb_agg(jsonb_build_object(
           'n', (e->>'n')::int,
           'typed', case when e->>'family_id' = 'fact.vfy68.b' then '99' else e->>'answer' end,
           'skipped', false, 'interrupted', false, 'rt_ms', 1600,
           'offset_ms', (e->>'n')::int * 2000, 'modality', 'keyboard'))
    into v_att from jsonb_array_elements(v_items) e;
  perform save_fact_attempts(v_probe, v_att, '{"keyboard": 200, "keypad": null}'::jsonb, true, 'vfy');
  -- Hotel's check: family B all wrong, family A not answered (not judged).
  perform set_config('request.jwt.claims', json_build_object('sub', v_hotel)::text, true);
  select jsonb_agg(jsonb_build_object(
           'n', (e->>'n')::int, 'typed', '99',
           'skipped', false, 'interrupted', false, 'rt_ms', 1600,
           'offset_ms', (e->>'n')::int * 2000, 'modality', 'keyboard'))
    into v_att from jsonb_array_elements(v_items) e where e->>'family_id' = 'fact.vfy68.b';
  perform save_fact_attempts(v_probe, v_att, '{"keyboard": 200, "keypad": null}'::jsonb, true, 'vfy');
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform close_fact_probe(v_probe);
  update fact_attempts set saved_at = saved_at - interval '3 days'
   where session_id in (select id from practice_sessions where probe_id = v_probe);
  perform set_fact_sprint(v_k, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_echo)::text, true);
  v_res := fact_sprint_entry(v_code, true);
  select jsonb_agg(jsonb_build_object(
           'n', (i->>'n')::int, 'reask', false,
           'typed', case when i->>'fact_id' like 'fact.vfy68.b:%' then '99' else i->>'answer' end,
           'skipped', false, 'interrupted', false, 'rt_ms', 1600,
           'offset_ms', (i->>'n')::int * 2000, 'modality', 'keyboard'))
    into v_att
    from jsonb_array_elements((select items from sprint_sessions
                                where id = (v_res->'session'->>'session_id')::uuid)) i;
  perform save_sprint_attempts((v_res->'session'->>'session_id')::uuid, v_att, null, true);
  -- Hotel's sprint today: every A wrong, every B right.
  perform set_config('request.jwt.claims', json_build_object('sub', v_hotel)::text, true);
  v_res := fact_sprint_entry(v_code, true);
  select jsonb_agg(jsonb_build_object(
           'n', (i->>'n')::int, 'reask', false,
           'typed', case when i->>'fact_id' like 'fact.vfy68.a:%' then '99' else i->>'answer' end,
           'skipped', false, 'interrupted', false, 'rt_ms', 1600,
           'offset_ms', (i->>'n')::int * 2000, 'modality', 'keyboard'))
    into v_att
    from jsonb_array_elements((select items from sprint_sessions
                                where id = (v_res->'session'->>'session_id')::uuid)) i;
  perform save_sprint_attempts((v_res->'session'->>'session_id')::uuid, v_att, null, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  -- The fixture's own reading of Hotel (else B5 proves nothing).
  select string_agg(right(family_id, 1) || '=' || label || '/' || mode, ' ' order by family_id) into v_got
    from fact_sprint_families(v_k, v_hotel, v_frev, 1, 7);
  if v_got is distinct from 'a=not_judged/strategy b=needs_strategy/review' then
    raise exception 'FAIL B5: Hotel''s fixture reads %', v_got;
  end if;

  -- B5 the number-facts row FIRES (S4-3): Echo, family B only, beside —
  --    never inside — the mixed rows ------------------------------------------
  v_res := mixed_who_first(v_k);
  select string_agg((e->>'name') || ':' || (e->'families')::text, ' ') into v_got
    from jsonb_array_elements(v_res->'facts') e;
  if v_got is distinct from 'Vfy Echo:["Fam B"]' or not (v_res->>'facts_on')::boolean then
    raise exception 'FAIL B5: number facts rows %', v_got;
  end if;
  if (select mode from fact_sprint_families(v_k, v_echo, v_frev, 1, 7) where family_id = 'fact.vfy68.b')
       is distinct from 'strategy' then
    raise exception 'FAIL B5: the fixture''s own reading moved';
  end if;
  if exists (select 1 from jsonb_array_elements(v_res->'stuck') e where e->>'name' = 'Vfy Echo') then
    raise exception 'FAIL B5: a number-facts row was merged into the mixed rows';
  end if;
  n := n + 1;

  -- B6 everyone else is a COUNT (Beta, Delta, Fox, Golf, Hotel); started
  --    today counts either practice (Alpha, Gamma, Delta, Echo, Golf, Hotel)
  --    and not Beta's untried session; no list carries a number -----------------
  if (v_res->>'everyone_else')::int <> 5 or (v_res->>'started_today')::int <> 7 then
    raise exception 'FAIL B6: everyone else % / started %', v_res->>'everyone_else', v_res->>'started_today';
  end if;
  if exists (select 1 from jsonb_array_elements(v_res->'stuck' || v_res->'facts' || v_res->'same_mistake') e,
                           jsonb_object_keys(e) k
              where k not in ('student_id', 'name', 'skills', 'families', 'mistakes')) then
    raise exception 'FAIL B6: a row carries something else';
  end if;
  n := n + 1;

  -- B7 the drawer: newest first, at most 10, labels for skill and mistake ---
  v_res := mixed_student_recent(v_k, v_gamma);
  select string_agg((e->>'practice_day')::date - v_today || ':' || (e->>'correct') || ':'
                    || coalesce(e->>'skill_label', '∅') || ':' || coalesce(e->'mistakes'->0->>'label', '-'),
                    ' ' order by ord)
    into v_got from jsonb_array_elements(v_res) with ordinality t(e, ord);
  if v_got is distinct from
     '0:true:Label for b:- -2:false:Label for b:Adds instead of scaling -4:false:Label for b:Adds instead of scaling' then
    raise exception 'FAIL B7: the drawer %', v_got;
  end if;
  if (mixed_student_recent(v_k, v_india)->0->>'skill_label') is distinct from 'Choosing between skills' then
    raise exception 'FAIL B7: a discrimination try shows its key';
  end if;
  if jsonb_array_length(mixed_student_recent(v_k, v_delta)) <> 6
     or jsonb_array_length(mixed_student_recent(v_k, v_fox)) <> 0 then
    raise exception 'FAIL B7: the drawer lengths';
  end if;
  n := n + 1;

  -- B8 the summary's label; the students' getting stuck as {id, label};
  --    finished-only scores and "in progress" (S4-5) -------------------------
  select string_agg((s->>'skill_id') || '=' || coalesce(s->>'label', '∅') || '/' || (s->>'struggling'), ' '
                    order by s->>'skill_id')
    into v_got from jsonb_array_elements(mixed_class_summary(v_k)->'skills') s;
  if v_got is distinct from 'skill.vfy0068.a=Label for a/3 skill.vfy0068.b=Label for b/0' then
    raise exception 'FAIL B8: summary %', v_got;
  end if;
  select string_agg((s->>'name') || ':' || coalesce(s->'struggling'->0->>'label', '-') || ':'
                    || coalesce(s->'latest_score'->>'right', '-') || ':' || (s->>'score_in_progress'),
                    ' ' order by ord)
    into v_got from jsonb_array_elements(mixed_class_students(v_k)) with ordinality t(s, ord);
  -- Alpha: today's graded session is OPEN → no score yet, in progress.
  -- Gamma: the finished graded D-2 session (wrong) → 0.
  if v_got is distinct from
     'Vfy Alpha:Label for a:-:true Vfy Beta:Label for a:-:false Vfy Delta:-:-:false '
     'Vfy Echo:-:-:false Vfy Fox:-:-:false Vfy Gamma:-:0:false Vfy Golf:Label for a:-:false '
     'Vfy Hotel:-:-:false Vfy India:-:-:false' then
    raise exception 'FAIL B8: students %', v_got;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-panel: %/8', n;
end
$vfy$;
