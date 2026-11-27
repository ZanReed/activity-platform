-- verify-0108.sql — the class grid's and the "who to see first" panel's reads,
-- restated to cost less (migration 0108, review 2026-11-26 D2 and D3). Run with
-- `pnpm verify:auth --target live|local`. §A reads the catalog only; §B is a
-- self-fixturing EXPECTED-ROLLBACK block, so nothing persists (P7).
--
-- The results were proven equal to the old bodies' (jsonb =) at size on the
-- local stack when 0108 was written; these rows pin the cases the new SHAPE
-- could get wrong: a block id matched to the wrong version, a re-try or a
-- clip pause counted wrongly in a window, and a long-unpractised skill's old
-- tries — the case a date floor would have dropped.

-- @section A-posture
-- @expect-rows
select 'three_reads_definer_pinned_teacher_callable',
       count(*) = 3
       and bool_and(p.prosecdef)
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'))
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and bool_and(not has_function_privilege('anon', p.oid, 'execute')),
       'class_progress, activity_progress, mixed_who_first: DEFINER, search_path pinned, signed-in only'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('class_progress', 'activity_progress', 'mixed_who_first');
select 'grids_walk_each_version_once',
       (select bool_and(prosrc like '%version_blocks%'
                        and prosrc not like '%photos_allowed_for(l.activity_id)%')
          from pg_proc where proname in ('class_progress', 'activity_progress')),
       'both grids join a once-per-version block walk; no per-block-row photo rule';
select 'panel_reads_no_whole_history',
       (select prosrc not like '%mixed_recent(%' and prosrc like '%limit v_win%'
          from pg_proc where proname = 'mixed_who_first'),
       'mixed_who_first reads each window in index order (limit v_win), not mixed_recent''s whole ranking';

-- @section B-behavioral
-- @local-only (builds users, classes and checks; the catalog rows above run live)
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();
  v_s1  uuid := gen_random_uuid();   -- grid: two versions checked
  v_s2  uuid := gen_random_uuid();   -- grid: one version, one block graded
  v_x   uuid := gen_random_uuid();   -- panel: stuck on old tries
  v_y   uuid := gen_random_uuid();   -- panel: re-tries must not count
  v_z   uuid := gen_random_uuid();   -- panel: clip pauses DO count
  v_w   uuid := gen_random_uuid();   -- panel: a discrimination bank's mistake
  v_v   uuid := gen_random_uuid();   -- panel: a mistake outside the window
  v_k   uuid;
  v_a   uuid; v_v1 uuid; v_v2 uuid;
  v_sa1 uuid := gen_random_uuid();   -- v1 s1 short answer
  v_sa2 uuid := gen_random_uuid();   -- v2 s1 short answer
  v_ph  uuid := gen_random_uuid();   -- v2 s1 photo question (photos are off)
  v_es  uuid := gen_random_uuid();   -- v2 s2 essay
  v_vid uuid := gen_random_uuid();   -- a clip pause block id
  v_rev text := repeat('8', 64);
  v_today date;
  v_sess uuid;
  v_chk uuid;
  v_r   jsonb;
  r     record;
  n     integer := 0;
  q     integer := 0;
  v_cells jsonb;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0108-' || o || '@vfy0108.example', '{}'::jsonb
    from unnest(array[v_t, v_s1, v_s2, v_x, v_y, v_z, v_w, v_v]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id <> v_t and email like 'vfy0108-%';
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0108', v_t, 'vfy') returning id into v_k;
  insert into class_members (class_id, student_id)
  select v_k, s from unnest(array[v_s1, v_s2, v_x, v_y, v_z, v_w, v_v]) s;
  v_today := (now() at time zone fact_class_zone(v_k))::date;

  -- ---- the grid fixture: v1 s1 = [short answer]; v2 s1 = [short answer,
  -- photo, choice], v2 s2 = [essay]. BOTH versions name their section 's1'.
  insert into activities (owner_id, title, slug, status) values (v_t, 'G', 'vfy-0108-g', 'published')
    returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, jsonb_build_object('schemaVersion', 2, 'meta', '{"title": "G"}'::jsonb, 'sections', jsonb_build_array(
            jsonb_build_object('id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(jsonb_build_object('id', v_sa1, 'type', 'short_answer'))))))))), v_t)
  returning id into v_v1;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 2, jsonb_build_object('schemaVersion', 2, 'meta', '{"title": "G"}'::jsonb, 'sections', jsonb_build_array(
            jsonb_build_object('id', 's1', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(
                jsonb_build_object('id', v_sa2, 'type', 'short_answer'),
                jsonb_build_object('id', v_ph, 'type', 'photo_response'),
                jsonb_build_object('id', gen_random_uuid(), 'type', 'multiple_choice'))))))),
            jsonb_build_object('id', 's2', 'rows', jsonb_build_array(jsonb_build_object('columns', jsonb_build_array(
              jsonb_build_object('blocks', jsonb_build_array(jsonb_build_object('id', v_es, 'type', 'essay'))))))))), v_t)
  returning id into v_v2;
  update activities set current_version_id = v_v2 where id = v_a;
  insert into class_activities (class_id, activity_id, added_by) values (v_k, v_a, v_t);

  -- S1: v1 s1 once; v2 s1 twice (the latest counts once), v2 s2 once. Owed:
  -- v1 sa1 + v2 sa2 + v2 essay = 3 (the empty photo is not owed while off).
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total, created_at)
  values (v_s1, v_a, v_v1, 's1', 1, '{}', '{}', 1, now() - interval '3 hours'),
         (v_s1, v_a, v_v2, 's1', 1, '{}', '{}', 2, now() - interval '2 hours'),
         (v_s1, v_a, v_v2, 's1', 2, '{}', '{}', 2, now() - interval '1 hour'),
         (v_s1, v_a, v_v2, 's2', 1, '{}', '{}', 2, now() - interval '1 hour');
  -- S2: v2 s1 once, its short answer graded. Owed: 0.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total)
  values (v_s2, v_a, v_v2, 's1', 1, '{}', '{}', 2) returning id into v_chk;
  insert into check_grades (check_id, block_id) values (v_chk, v_sa2);

  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);

  -- B1 class_progress: per-version block matching, latest attempt, graded, photo-off
  v_cells := class_progress(v_k)->'cells';
  if (select (c->>'to_grade')::int from jsonb_array_elements(v_cells) c where c->>'student_id' = v_s1::text) is distinct from 3
     or (select (c->>'to_grade')::int from jsonb_array_elements(v_cells) c where c->>'student_id' = v_s2::text) is distinct from 0 then
    raise exception 'FAIL B1: cells %', v_cells;
  end if;
  n := n + 1;

  -- B2 activity_progress: the same counts through the activity's own read
  v_r := activity_progress(v_a);
  if (select (s->>'to_grade')::int from jsonb_array_elements(v_r->'classes'->0->'students') s where s->>'student_id' = v_s1::text) is distinct from 3
     or (select (s->>'to_grade')::int from jsonb_array_elements(v_r->'classes'->0->'students') s where s->>'student_id' = v_s2::text) is distinct from 0 then
    raise exception 'FAIL B2: %', v_r->'classes';
  end if;
  n := n + 1;

  -- ---- the panel fixture, at production settings (window 5, min right 3:
  -- listed when wrong tries in the window > 2).
  perform sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy', 'settings',
    '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1, "mixed_items_per_session": 6,
      "mixed_max_discrimination": 1, "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
      "mixed_struggling_min_right": 3}'::jsonb), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_rev;
  update classes set mixed_on_at = now() where id = v_k;

  -- One session per (student, day); one item per try. d = days ago.
  for r in
    select * from (values
      -- X: four wrong tries 200 days ago, one right today → 4 wrong in the
      --    window: STUCK. A date floor would have dropped the old four.
      --    Two of the old tries carry mis.vfy0108.m → SAME MISTAKE.
      (v_x, 200, 1, 'skill', 'skill.vfy0108.k', false, false, '{mis.vfy0108.m}'::text[]),
      (v_x, 200, 2, 'skill', 'skill.vfy0108.k', false, false, '{mis.vfy0108.m}'),
      (v_x, 199, 1, 'skill', 'skill.vfy0108.k', false, false, '{}'),
      (v_x, 199, 2, 'skill', 'skill.vfy0108.k', false, false, '{}'),
      (v_x,   0, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      -- Y: today right + 2 right + 2 wrong earlier → 2 wrong: not stuck. Three
      --    wrong RE-TRIES today would make it 5 wrong if they counted.
      (v_y,   3, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      --    In group 2 the mistake is on one try in the window; with the re-try
      --    that carries it too, it would be two.
      (v_y,   3, 2, 'skill', 'skill.vfy0108.k', false, false, '{}'),
      (v_y,   2, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      (v_y,   2, 2, 'skill', 'skill.vfy0108.k', false, false, '{mis.vfy0108.m}'),
      (v_y,   0, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      (v_y,   0, 2, 'skill', 'skill.vfy0108.k', false, true,  '{mis.vfy0108.m}'),
      (v_y,   0, 3, 'skill', 'skill.vfy0108.k', false, true,  '{}'),
      (v_y,   0, 4, 'skill', 'skill.vfy0108.k', false, true,  '{}'),
      -- Z: two right tries (one today); three wrong CLIP PAUSES (below) → 3
      --    wrong in the window: STUCK only if the pauses count.
      (v_z,   5, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      (v_z,   0, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      -- W: a discrimination bank, the same mistake twice, practised today.
      (v_w,   1, 1, 'discrimination', 'chain.vfy0108.d', false, false, '{mis.vfy0108.m}'),
      (v_w,   0, 1, 'discrimination', 'chain.vfy0108.d', false, false, '{mis.vfy0108.m}'),
      -- V: the mistake on its 6th-newest try and its newest: one in the window.
      (v_v,  10, 1, 'skill', 'skill.vfy0108.k', false, false, '{mis.vfy0108.m}'),
      (v_v,   4, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      (v_v,   3, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      (v_v,   2, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      (v_v,   1, 1, 'skill', 'skill.vfy0108.k', true,  false, '{}'),
      (v_v,   0, 1, 'skill', 'skill.vfy0108.k', false, false, '{mis.vfy0108.m}')
    ) t(student, d, seq, kind, bank_key, ok, retry, mis)
  loop
    select id into v_sess from mixed_sessions
     where class_id = v_k and student_id = r.student and practice_day = v_today - r.d;
    if v_sess is null then
      insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                                  planned, keep_until, started_at, finished_at, score_right, score_answered)
      values (v_k, r.student, v_today - r.d, 1, v_rev, false, 4, current_date + 100,
              now() - make_interval(days => r.d), now() - make_interval(days => r.d), 0, 0)
      returning id into v_sess;
    end if;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                     item_id, fingerprint, row_index, document, row_values,
                                     retry_of)
    values (v_sess, r.seq, r.student, r.kind, r.bank_key, v_t, 'vfy0108#' || r.seq, repeat('0', 64), 0,
            '{}', '{}', case when r.retry then 1 end);
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind, bank_key,
                                correct, skipped, misconception_ids, saved_at, retry)
    values (v_sess, r.seq, r.student, v_k, v_today - r.d, r.kind, r.bank_key, r.ok, false, r.mis,
            now() - make_interval(days => r.d) + make_interval(secs => r.seq), r.retry);
    v_sess := null;
  end loop;
  -- Z's three wrong clip pauses on the same skill, in a class activity.
  insert into video_pause_tries (student_id, activity_version_id, block_id, skill_id, correct, saved_at)
  values (v_z, v_v2, v_vid, 'skill.vfy0108.k', false, now() - interval '1 day'),
         (v_z, v_v1, v_vid, 'skill.vfy0108.k', false, now() - interval '2 days'),
         (v_z, v_v2, gen_random_uuid(), 'skill.vfy0108.k', false, now() - interval '3 days');

  v_r := mixed_who_first(v_k);

  -- B3 group 1 reads a whole window however old (no date floor)
  if not exists (select 1 from jsonb_array_elements(v_r->'stuck') e where e->>'student_id' = v_x::text) then
    raise exception 'FAIL B3: X is not stuck: %', v_r->'stuck';
  end if;
  n := n + 1;
  -- B4 re-tries stay out of the window
  if exists (select 1 from jsonb_array_elements(v_r->'stuck') e where e->>'student_id' = v_y::text) then
    raise exception 'FAIL B4: Y is stuck on re-tries: %', v_r->'stuck';
  end if;
  n := n + 1;
  -- B5 clip pauses count, as in mixed_recent
  if not exists (select 1 from jsonb_array_elements(v_r->'stuck') e where e->>'student_id' = v_z::text) then
    raise exception 'FAIL B5: Z''s clip pauses did not count: %', v_r->'stuck';
  end if;
  n := n + 1;
  -- B6 group 2: old tries in the window, and a discrimination bank, are listed;
  -- a mistake outside the window and one only on a re-try are not
  select count(*) into q from jsonb_array_elements(v_r->'same_mistake') e
   where e->>'student_id' in (v_x::text, v_w::text);
  if q <> 2
     or exists (select 1 from jsonb_array_elements(v_r->'same_mistake') e
                 where e->>'student_id' in (v_v::text, v_y::text, v_z::text)) then
    raise exception 'FAIL B6: same_mistake %', v_r->'same_mistake';
  end if;
  n := n + 1;
  -- B7 the head counts are unchanged in meaning
  if (v_r->>'started_today')::int <> 5 or (v_r->>'everyone_else')::int <> 7 - 3 then
    raise exception 'FAIL B7: started % everyone_else % (listed: %)', v_r->>'started_today', v_r->>'everyone_else', v_r;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-grid-and-panel: %/7', n;
end
$vfy$;
