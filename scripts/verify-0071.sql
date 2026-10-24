-- verify-0071.sql — mixed_who_first v3: "Same mistake twice" across skills.
-- Migration 0071 (curriculum C-164 item 3, author-ruled 2026-10-25).
--
-- Run with `pnpm verify:auth --target live|local`. One self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0066/0068 idiom): its own mixed settings
-- revision stamped mirrored_at in 2999, real functions, everything rolled
-- back (P7).
--
-- The fixture (UTC class, today = D):
--   Juliet  skill a: D-1 W(mis.z)   skill b: D W(mis.z)   → listed ONCE for
--           mis.z, on BOTH skills (C-164 item 3; 0068 listed nobody)
--   Kilo    skill a: D-1 W(mis.z)   skill b: D R           → mis.z once: NOT
--           listed
--   Lima    skill a: D-2 W(mis.z)   skill b: D-1 W(mis.z)  → twice, but did
--           NOT practise today: NOT listed (C-162 row, kept)

-- @section B-cross-skill
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_mrev    text := repeat('7', 64);
  v_t       uuid := gen_random_uuid();
  v_juliet  uuid := gen_random_uuid();
  v_kilo    uuid := gen_random_uuid();
  v_lima    uuid := gen_random_uuid();
  v_k       uuid;
  v_today   date := (now() at time zone 'UTC')::date;
  v_res     jsonb;
  v_sess    uuid;
  v_got     text;
  r         record;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0071-' || o || '@vfy0071.example', '{}'::jsonb
    from unnest(array[v_t, v_juliet, v_kilo, v_lima]) with ordinality x(u, o);
  update users set role = 'teacher', timezone = 'UTC' where id = v_t;
  update users set role = 'student' where id in (v_juliet, v_kilo, v_lima);
  update users set display_name = 'Vfy ' || n.nm
    from (values (v_juliet, 'Juliet'), (v_kilo, 'Kilo'), (v_lima, 'Lima')) n(id, nm)
   where users.id = n.id;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0071 class', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into class_members (class_id, student_id)
  select v_k, s from unnest(array[v_juliet, v_kilo, v_lima]) s;

  perform sync_mixed_settings(jsonb_build_object('revision', v_mrev, 'graph_version', 'vfy', 'settings',
    '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1, "mixed_items_per_session": 6,
      "mixed_max_discrimination": 1, "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
      "mixed_struggling_min_right": 3}'::jsonb), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_mrev;
  update classes set mixed_on_at = now() where id = v_k;
  insert into skill_label (id, label) values ('skill.vfy0071.a', 'Label for a'), ('skill.vfy0071.b', 'Label for b')
  on conflict (id) do update set label = excluded.label;
  insert into misconception_registry (id, skill, description)
  values ('mis.vfy0071.z', null, 'Expands the first term only')
  on conflict (id) do update set description = excluded.description;

  -- One FINISHED session per (student, day, skill) with one first try.
  for r in
    select * from (values
      (v_juliet, -1, 'skill.vfy0071.a', false, '{mis.vfy0071.z}'::text[]),
      (v_juliet,  0, 'skill.vfy0071.b', false, '{mis.vfy0071.z}'),
      (v_kilo,   -1, 'skill.vfy0071.a', false, '{mis.vfy0071.z}'),
      (v_kilo,    0, 'skill.vfy0071.b', true,  '{}'),
      (v_lima,   -2, 'skill.vfy0071.a', false, '{mis.vfy0071.z}'),
      (v_lima,   -1, 'skill.vfy0071.b', false, '{mis.vfy0071.z}')
    ) t(student, d, bank_key, ok, mis)
  loop
    insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                                planned, keep_until, started_at, finished_at, score_right, score_answered)
    values (v_k, r.student, v_today + r.d, 1, v_mrev, false, 1, current_date + 100,
            now() + make_interval(days => r.d), now() + make_interval(days => r.d),
            case when r.ok then 1 else 0 end, 1)
    returning id into v_sess;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                     item_id, fingerprint, row_index, document, row_values)
    values (v_sess, 1, r.student, 'skill', r.bank_key, v_t, 'vfy0071#one', repeat('0', 64), 0, '{}', '{}');
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind, bank_key,
                                correct, skipped, misconception_ids, saved_at)
    values (v_sess, 1, r.student, v_k, v_today + r.d, 'skill', r.bank_key, r.ok, false, r.mis,
            now() + make_interval(days => r.d));
  end loop;

  -- B1 group 2 combines ACROSS skills (C-164 item 3): Juliet, once, both
  --    skills. Kilo (once) and Lima (not today) are NOT listed ---------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_res := mixed_who_first(v_k);
  select string_agg((e->>'name') || ':' || (m->>'id') || '=' || coalesce(m->>'label', '∅') || '@'
                    || (select string_agg(s->>'label', '+' order by s->>'id')
                          from jsonb_array_elements(m->'skills') s), ' ')
    into v_got from jsonb_array_elements(v_res->'same_mistake') e, jsonb_array_elements(e->'mistakes') m;
  if v_got is distinct from 'Vfy Juliet:mis.vfy0071.z=Expands the first term only@Label for a+Label for b' then
    raise exception 'FAIL B1: same mistake across skills %', v_got;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-cross-skill: %/1', n;
end
$vfy$;
