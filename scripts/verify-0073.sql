-- verify-0073.sql — the graph's dol_practice_items (migration 0073, C-167/C-168).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0071/0072 idiom): its own settings
-- revision stamped mirrored_at in 2999, its own users, activity and bank,
-- everything rolled back (P7).
--
--   §A — posture: dol_practice_cap is service-role only, definer, pinned.
--   §B — mixed_settings_ok v2 takes seven keys or seven + dol_practice_items
--        (whole, 2–8) and nothing else; dol_practice_cap is 4 with no key and
--        the latest revision's value with one; start_dol_practice plans that
--        many templates.

-- @section A-catalog-posture
-- @expect-rows
select 'dol_practice_cap_service_only',
       not has_function_privilege('authenticated', 'dol_practice_cap()', 'execute')
       and not has_function_privilege('anon', 'dol_practice_cap()', 'execute')
       and (select prosecdef and proconfig @> array['search_path=public'] from pg_proc
             where proname = 'dol_practice_cap'),
       'the dose read: service role (and the definer RPCs) only';

-- @section B-dose
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_seven jsonb := '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1,
                     "mixed_items_per_session": 6, "mixed_max_discrimination": 1,
                     "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
                     "mixed_struggling_min_right": 3}';
  v_rev7  text := repeat('7', 63) || '3';
  v_rev8  text := repeat('8', 63) || '3';
  v_t     uuid := gen_random_uuid();
  v_s     uuid := gen_random_uuid();
  v_doc   jsonb := '{"schemaVersion": 2, "meta": {}, "sections": [
                    {"id": "dol-sec", "isCheckpoint": true, "rows": [],
                     "dol": {"skills": ["s.vfy0073"], "retake": true}}]}';
  v_a     uuid;  v_v uuid;
  v_res   jsonb;
  v_bad   jsonb;
begin
  -- ---- B1 mixed_settings_ok v2 ------------------------------------------------
  if not mixed_settings_ok(v_seven) or not mixed_settings_ok(v_seven || '{"dol_practice_items": 4}') then
    raise exception 'FAIL B1: seven keys, or seven + dol_practice_items 4, refused';
  end if;
  foreach v_bad in array array['{"dol_practice_items": 1}', '{"dol_practice_items": 9}',
                               '{"dol_practice_items": 4.5}', '{"dol_practice_items": "4"}',
                               '{"mixed_extra": 4}']::jsonb[] loop
    if mixed_settings_ok(v_seven || v_bad) then raise exception 'FAIL B1: accepted %', v_bad; end if;
  end loop;

  -- ---- B2 the cap: 4 without the key, the value with it -----------------------
  perform sync_mixed_settings(jsonb_build_object('revision', v_rev7, 'graph_version', 'vfy', 'settings', v_seven), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_rev7;
  if dol_practice_cap() <> 4 then raise exception 'FAIL B2: no key gave %', dol_practice_cap(); end if;
  perform sync_mixed_settings(jsonb_build_object('revision', v_rev8, 'graph_version', 'vfy',
            'settings', v_seven || '{"dol_practice_items": 2}'), true);
  update mixed_settings_revision set mirrored_at = '2999-01-02' where revision = v_rev8;
  if dol_practice_cap() <> 2 then raise exception 'FAIL B2: the key 2 gave %', dol_practice_cap(); end if;

  -- ---- B3 start_dol_practice plans the cap's count ----------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0073-' || o || '@vfy0073.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher', timezone = 'UTC' where id = v_t;
  update users set role = 'student' where id = v_s;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill)
  values (v_t, 'dol', 'vfy-0073', 'published', 'c/01-chain.vfy/01.md', 's.vfy0073') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, v_doc, v_t) returning id into v_v;
  update activities set current_version_id = v_v where id = v_a;
  insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id, status, position,
                             document, seed_spec, value_table, fingerprint)
  select v_t, 'vfy0073#t' || n, 'banks/01-chain.vfy/s.md', 'skill', 's.vfy0073', 'chain.vfy', 'ratified', n,
         '{"sections":[]}'::jsonb, '{"drawn":[],"derived":[],"where":[]}'::jsonb,
         '{"columns":["a"],"rows":[[1],[2]],"total":2}'::jsonb, repeat('a', 64)
    from generate_series(1, 5) n;
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, v_a, v_v, 'dol-sec', 1, '{}', '{}');
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_res := start_dol_practice(v_a, v_v);
  if v_res->>'state' <> 'started' or (v_res->'session'->>'planned')::int <> 2 then
    raise exception 'FAIL B3: planned % under a cap of 2', v_res->'session'->>'planned';
  end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;
