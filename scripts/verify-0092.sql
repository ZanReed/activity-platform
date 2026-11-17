-- verify-0092.sql — the review period's reads (migration 0092,
-- docs/design/review-period.md slice 4). Run with
-- `pnpm verify:auth --target live|local`. §A reads the catalog only; §B is a
-- self-fixturing EXPECTED-ROLLBACK block (P7).

-- @section A-posture
-- @expect-rows
select 'review_preview_teacher_only',
       has_function_privilege('authenticated', 'review_preview(uuid, boolean, date)', 'execute')
       and not has_function_privilege('anon', 'review_preview(uuid, boolean, date)', 'execute')
       and (select prosecdef from pg_proc where proname = 'review_preview'),
       'signed-in only, DEFINER (it checks is_class_teacher itself)';
select 'reads_keep_their_grants',
       has_function_privilege('authenticated', 'class_plan(uuid, date, date)', 'execute')
       and not has_function_privilege('anon', 'class_plan(uuid, date, date)', 'execute')
       and has_function_privilege('authenticated', 'class_today(uuid)', 'execute')
       and not has_function_privilege('anon', 'class_today(uuid)', 'execute')
       and has_function_privilege('authenticated', 'mixed_class_summary(uuid)', 'execute')
       and not has_function_privilege('anon', 'mixed_class_summary(uuid)', 'execute'),
       'class_plan, class_today and mixed_class_summary: signed in only, as before';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_base  jsonb := '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1,
                     "mixed_items_per_session": 6, "mixed_max_discrimination": 1,
                     "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
                     "mixed_struggling_min_right": 3, "mixed_seconds_per_item": [60, 90],
                     "period_shapes": {"lengths": {"50": [{"kind": "fluency", "minutes": [5, 5]}]}}}'::jsonb;
  v_rev   jsonb := '{"review_items_max": 36, "review_max_items_per_skill": 2,
                     "review_same_skill_min_gap": 5, "review_retry_after_wrong": 1,
                     "review_max_discrimination_share": 0.33, "review_pull_order": "elapsed_share",
                     "review_pulled_step_up": false, "review_pulled_moves_due": false,
                     "review_min_fill": 0.67, "review_focus_share": 0.6}'::jsonb;
  v_zone  text := 'Pacific/Auckland';
  v_today date;
  v_t     uuid := gen_random_uuid();
  v_x     uuid := gen_random_uuid();   -- another teacher
  v_s     uuid := gen_random_uuid();
  v_k     uuid;
  v_res   jsonb;
  v_raised boolean;
  v_src   uuid;
  v_copy  uuid;
  n       integer := 0;
begin
  v_today := (now() at time zone v_zone)::date;
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0092-' || o || '@vfy0092.example', '{}'::jsonb
    from unnest(array[v_t, v_x, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_x);
  update users set role = 'student' where id = v_s;
  update users set timezone = v_zone where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0092', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s);

  -- Settings WITHOUT the review keys first.
  perform sync_mixed_settings(jsonb_build_object('revision', repeat('a', 64), 'graph_version', 'vfy',
                                                 'settings', v_base), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = repeat('a', 64);

  -- One activity in a chain's folder (owned by another teacher, used here as a
  -- Bank copy would be: the source's folder is what counts).
  insert into activities (owner_id, title, slug, status, source_path, primary_skill)
  values (v_x, 'vfy src', 'vfy-0092-src', 'published', '904-chain.vfy.x/01.md', 'skill.vfy0092.a')
  returning id into v_src;
  insert into activities (owner_id, title, slug, status, copied_from_activity_id)
  values (v_t, 'vfy copy', 'vfy-0092-copy', 'published', v_src) returning id into v_copy;
  insert into class_activities (class_id, activity_id, added_by) values (v_k, v_copy, v_t);
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_class_review(v_k, v_today, true, array['chain.vfy.x']);
  perform set_class_review(v_k, v_today + 2, true, '{}', true);

  -- B1 the plan lists a day that holds only a review, with its focus and double
  v_res := class_plan(v_k, v_today, v_today + 5);
  if (select count(*) from jsonb_array_elements(v_res->'days') d where d->'review' is not null
        and jsonb_typeof(d->'review') = 'object') <> 2
     or (select d->'review'->>'is_double' from jsonb_array_elements(v_res->'days') d
          where d->>'on_date' = (v_today + 2)::text) <> 'true'
     or (select d->'review'->'focus_chains'->>0 from jsonb_array_elements(v_res->'days') d
          where d->>'on_date' = v_today::text) <> 'chain.vfy.x' then
    raise exception 'FAIL B1: the plan gave %', v_res->'days';
  end if;
  n := n + 1;

  -- B2 before the review keys are mirrored: today says no review, the summary
  -- says review_on false, and the preview says so too
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if (class_today(v_k)->>'review')::boolean then raise exception 'FAIL B2: today said review before the keys'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if (mixed_class_summary(v_k)->>'review_on')::boolean
     or (review_preview(v_k)->>'review_on')::boolean then
    raise exception 'FAIL B2: summary or preview said review_on before the keys';
  end if;
  -- the chains are listed even before the keys, a Bank copy under its source's chain
  if review_preview(v_k)->'chains' is distinct from '[{"chain_id": "chain.vfy.x", "activities": 1}]'::jsonb then
    raise exception 'FAIL B2: chains were %', review_preview(v_k)->'chains';
  end if;
  n := n + 1;

  -- B3 with the keys mirrored: today says review; the preview sizes it (50 min,
  -- sprint off, 90 s → 33) and counts the one student as empty and thin
  perform sync_mixed_settings(jsonb_build_object('revision', repeat('b', 64), 'graph_version', 'vfy',
                                                 'settings', v_base || v_rev), true);
  update mixed_settings_revision set mirrored_at = '2999-01-02' where revision = repeat('b', 64);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if not (class_today(v_k)->>'review')::boolean then raise exception 'FAIL B3: today missed the review'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_res := review_preview(v_k);
  if v_res is distinct from '{"review_on": true, "capacity": 33, "students": 1, "thin": 1, "empty": 1,
                              "chains": [{"chain_id": "chain.vfy.x", "activities": 1}]}'::jsonb then
    raise exception 'FAIL B3: preview gave %', v_res;
  end if;
  if (review_preview(v_k, true)->>'capacity')::integer <> 36 then
    raise exception 'FAIL B3: a double should cap at 36';
  end if;
  perform set_class_period_minutes(v_k, 50);
  if (mixed_class_summary(v_k)->>'period_minutes')::integer <> 50
     or not (mixed_class_summary(v_k)->>'review_on')::boolean then
    raise exception 'FAIL B3: the summary gave %', mixed_class_summary(v_k);
  end if;
  n := n + 1;

  -- B4 the preview is the class teacher's only, and names no student
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  v_raised := false;
  begin perform review_preview(v_k); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'FAIL B4: another teacher read the preview'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_raised := false;
  begin perform review_preview(v_k); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'FAIL B4: a student read the preview'; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-behavioral: %/4', n;
end
$vfy$;
