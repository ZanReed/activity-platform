-- verify-0049.sql — the mirror holds the sprint's seven settings (migration 0049).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0047 idiom): synthetic revisions through
-- the REAL mirror function, everything rolled back (P7).
--
--   §A — catalog posture: the nullable column and its shape check; the mirror
--        is still insert-only and service-role only.
--   §B — a revision with the seven keys is stored exactly and re-mirrors as
--        unchanged; a changed key under the same revision is refused; a
--        partial set and each malformed value are refused by the column's
--        check; a revision without the keys stores NULL and behaves as
--        before; the function answers schema 3.

-- @section A-catalog-posture
-- @expect-rows
select 'sprint_column_nullable_jsonb',
       exists (select 1 from information_schema.columns
                where table_name = 'fact_scope_revision' and column_name = 'sprint'
                  and data_type = 'jsonb' and is_nullable = 'YES'),
       'every revision mirrored before 0049 reads as "no sprint settings"';
select 'sprint_shape_check',
       exists (select 1 from pg_constraint
                where conrelid = 'public.fact_scope_revision'::regclass
                  and conname = 'fact_scope_sprint_shape'),
       'the seven keys, all or none, each of the agreed type and range';
select 'mirror_still_insert_only',
       (select count(*) = 6 from pg_trigger
         where tgfoid = 'fact_scope_insert_only'::regproc and not tgisinternal),
       '0044''s insert-only triggers survive the ALTER';
select 'mirror_still_service_role_only',
       has_function_privilege('service_role', 'sync_fact_scope(jsonb,boolean)', 'execute')
       and not has_function_privilege('authenticated', 'sync_fact_scope(jsonb,boolean)', 'execute')
       and not has_function_privilege('anon', 'sync_fact_scope(jsonb,boolean)', 'execute'),
       'the re-created mirror function keeps its grants';
select 'no_live_revision_breaks_the_shape',
       not exists (select 1 from fact_scope_revision where not fact_scope_sprint_ok(sprint)),
       'every stored revision passes the shape check';

-- @section B-sprint-keys
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev    text := repeat('6', 64);
  v_sprint jsonb := '{"sprint_max_misses": 1, "sprint_minutes": 5,
                      "sprint_step_intervals": [1, 2, 4, 8, 16], "sprint_mastered_step": 2,
                      "sprint_new_facts_per_session": 5, "sprint_working_families": 2,
                      "sprint_reask_gap": 3}'::jsonb;
  v_base   jsonb;
  v_mirror jsonb;
  v_res    jsonb;
  v_bad    jsonb;
  v_raised boolean;
  n        integer := 0;
begin
  -- One family of three facts; no two-part settings.
  v_base := jsonb_build_object(
    'registry_rev', v_rev, 'fact_grammar_rev', 1, 'graph_version', '0.0.0',
    'fact_probe', jsonb_build_object(
      'floor_factor_k', 0.8, 'accuracy_threshold', 0.8, 'facts_met_threshold', 0.8,
      'response_ceiling_s', 15, 'min_items_per_family', 5, 'practice_window', 10),
    'year_scope', '{"7": {"adds": ["fact.vfy.a"], "cumulative": ["fact.vfy.a"], "description": null}}'::jsonb,
    'fraction_names', '{}'::jsonb,
    'family_groups', null, 'probe_parts', null,
    'families', jsonb_build_array(jsonb_build_object(
      'family_id', 'fact.vfy.a', 'ord', 0, 'kind', 'generated', 'name', 'Fam A',
      'source_year', 5, 'operation', 'square', 'criterion_s', 3, 'turnaround', false,
      'weight', 1, 'fact_count', 3, 'strategy', null)),
    'facts', (select jsonb_agg(jsonb_build_object(
        'fact_id', 'fact.vfy.a:' || g, 'family_id', 'fact.vfy.a', 'ord', g - 1,
        'operands', jsonb_build_array(g), 'answer', (g + 10)::text,
        'display', 'A' || g || ' = __', 'spoken', 'a ' || g,
        'display_swapped', null, 'spoken_swapped', null)) from generate_series(1, 3) g));
  v_mirror := jsonb_set(v_base, '{fact_probe}', (v_base->'fact_probe') || v_sprint);

  -- B1 stored exactly; the function says schema 3
  v_res := sync_fact_scope(v_mirror, true);
  if v_res->>'status' <> 'mirrored' or (v_res->>'schema')::int <> 3
     or (select sprint from fact_scope_revision where registry_rev = v_rev) is distinct from v_sprint then
    raise exception 'FAIL B1: the sprint keys were not stored %', v_res;
  end if;
  n := n + 1;

  -- B2 an identical re-mirror is a no-op
  v_res := sync_fact_scope(v_mirror, true);
  if v_res->>'status' <> 'unchanged' or (v_res->>'schema')::int <> 3 then
    raise exception 'FAIL B2: an identical re-mirror was not a no-op %', v_res;
  end if;
  n := n + 1;

  -- B3 a changed sprint key, or the keys dropped, under the same revision is refused
  v_raised := false;
  begin perform sync_fact_scope(jsonb_set(v_mirror, '{fact_probe,sprint_max_misses}', '2'), false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%'; end;
  if not v_raised then raise exception 'FAIL B3: a changed sprint_max_misses was accepted'; end if;
  v_raised := false;
  begin perform sync_fact_scope(jsonb_set(v_mirror, '{fact_probe,sprint_step_intervals}', '[1, 2, 4, 8, 32]'), false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%'; end;
  if not v_raised then raise exception 'FAIL B3: a changed interval list was accepted'; end if;
  v_raised := false;
  begin perform sync_fact_scope(v_base, false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%'; end;
  if not v_raised then raise exception 'FAIL B3: the same revision without the keys was accepted'; end if;
  n := n + 1;

  -- B4 a partial set is refused (a new revision id, so only the shape can refuse it)
  v_raised := false;
  begin
    perform sync_fact_scope(
      jsonb_set(v_mirror, '{registry_rev}', to_jsonb(repeat('5', 64))) #- '{fact_probe,sprint_reask_gap}', false);
  exception when check_violation then v_raised := sqlerrm ilike '%fact_scope_sprint_shape%'; end;
  if not v_raised then raise exception 'FAIL B4: a partial sprint set was accepted'; end if;
  n := n + 1;

  -- B5 each malformed value is refused by the shape check
  for v_bad in
    select * from jsonb_array_elements('[
      {"sprint_max_misses": -1}, {"sprint_max_misses": 1.5}, {"sprint_minutes": 0},
      {"sprint_step_intervals": []}, {"sprint_step_intervals": [1, 2, 2]},
      {"sprint_step_intervals": [0, 1]}, {"sprint_step_intervals": [1, 2.5]},
      {"sprint_step_intervals": "1,2"}, {"sprint_mastered_step": 0},
      {"sprint_mastered_step": 6}, {"sprint_new_facts_per_session": -1},
      {"sprint_working_families": 0}, {"sprint_reask_gap": 0}, {"sprint_extra": 1}]'::jsonb)
  loop
    if fact_scope_sprint_ok(v_sprint || v_bad) then
      raise exception 'FAIL B5: the shape check accepted %', v_bad;
    end if;
  end loop;
  if not fact_scope_sprint_ok(v_sprint) or not fact_scope_sprint_ok(null)
     or not fact_scope_sprint_ok(v_sprint || '{"sprint_minutes": 7.5, "sprint_max_misses": 0}') then
    raise exception 'FAIL B5: the shape check refused a valid set';
  end if;
  n := n + 1;

  -- B6 a revision without the keys stores NULL and re-mirrors as unchanged
  v_res := sync_fact_scope(jsonb_set(v_base, '{registry_rev}', to_jsonb(repeat('4', 64))), true);
  if v_res->>'status' <> 'mirrored'
     or (select sprint from fact_scope_revision where registry_rev = repeat('4', 64)) is not null
     or sync_fact_scope(jsonb_set(v_base, '{registry_rev}', to_jsonb(repeat('4', 64))), true)->>'status' <> 'unchanged' then
    raise exception 'FAIL B6: a revision without the keys %', v_res;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-sprint-keys: %/6', n;
end
$vfy$;
