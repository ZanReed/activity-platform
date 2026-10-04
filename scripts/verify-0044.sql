-- verify-0044.sql — the fact-scope mirror (migration 0044, D43 ER-13).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0042/0043 idiom): a small synthetic
-- revision through the real function, everything rolled back — durable-write-
-- free on every path (P7). Its revision id is a fixed run-scoped value no real
-- registry can produce (all 'e'), so it can never meet a mirrored revision.
--
--   §A — catalog posture: three tables, RLS forced on each, NO policy, no
--        client privilege of any kind, six insert-only triggers, the sync is
--        SECURITY DEFINER with a pinned search_path and service-role only.
--   §B — the sync: the dry run writes nothing; apply writes; an identical
--        re-mirror is a no-op (graph_version is NOT content); a divergent fact,
--        family or probe value is refused; rows refuse UPDATE and DELETE; a
--        fact_count that does not match is refused; a row the CHECKs refuse
--        fails the DRY run too; a malformed payload is refused.

-- @section A-catalog-posture
-- @expect-rows
select 'fact_scope_tables_exist',
       to_regclass('public.fact_scope_revision') is not null
       and to_regclass('public.fact_scope_family') is not null
       and to_regclass('public.fact_scope_fact') is not null,
       'ER-13: revision, family, fact';
select 'fact_scope_rls_forced',
       (select bool_and(relrowsecurity and relforcerowsecurity) and count(*) = 3
          from pg_class
         where relname in ('fact_scope_revision', 'fact_scope_family', 'fact_scope_fact')
           and relkind = 'r'),
       'RLS enabled AND forced on all three';
select 'fact_scope_no_policies',
       not exists (select 1 from pg_policies
                    where tablename in ('fact_scope_revision', 'fact_scope_family', 'fact_scope_fact')),
       'decision 2: no client reads directly — the absence of a policy is the control';
select 'fact_scope_no_client_privileges',
       not exists (
         select 1
         from unnest(array['fact_scope_revision', 'fact_scope_family', 'fact_scope_fact']) t,
              unnest(array['anon', 'authenticated']) r,
              unnest(array['select', 'insert', 'update', 'delete']) p
         where has_table_privilege(r, t, p)),
       'anon and authenticated hold nothing on any of the three';
select 'fact_scope_insert_only_triggers',
       (select count(*) = 6 from pg_trigger
         where tgfoid = 'fact_scope_insert_only'::regproc and not tgisinternal),
       'UPDATE/DELETE row triggers + TRUNCATE statement triggers on all three';
select 'fact_scope_sync_definer_pinned',
       (select prosecdef and proconfig @> array['search_path=public']
          from pg_proc where proname = 'sync_fact_scope'),
       'SECURITY DEFINER with a pinned search_path (0009)';
select 'fact_scope_sync_service_only',
       has_function_privilege('service_role', 'sync_fact_scope(jsonb,boolean)', 'execute')
       and not has_function_privilege('authenticated', 'sync_fact_scope(jsonb,boolean)', 'execute')
       and not has_function_privilege('anon', 'sync_fact_scope(jsonb,boolean)', 'execute'),
       'the importer (service role) is the only writer';

-- @section B-sync
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev    text := repeat('e', 64);
  v_mirror jsonb;
  v_bad    jsonb;
  v_res    jsonb;
  v_stamp  timestamptz;
  v_raised boolean;
  n        integer := 0;
begin
  v_mirror := jsonb_build_object(
    'registry_rev', v_rev,
    'fact_grammar_rev', 1,
    'graph_version', '0.0.1',
    'fact_probe', jsonb_build_object(
      'floor_factor_k', 0.8, 'accuracy_threshold', 0.9, 'facts_met_threshold', 0.8,
      'response_ceiling_s', 15, 'min_items_per_family', 5, 'practice_window', 10),
    'year_scope', '{"7": {"adds": ["fact.vfy.mult"], "cumulative": ["fact.vfy.mult"], "description": null}}'::jsonb,
    'fraction_names', '{}'::jsonb,
    'families', jsonb_build_array(jsonb_build_object(
      'family_id', 'fact.vfy.mult', 'ord', 0, 'kind', 'generated', 'name', 'Verify',
      'source_year', 5, 'operation', 'multiply', 'criterion_s', 3, 'turnaround', true,
      'weight', 1, 'fact_count', 2, 'strategy', null)),
    'facts', jsonb_build_array(
      jsonb_build_object('fact_id', 'fact.vfy.mult:2,3', 'family_id', 'fact.vfy.mult', 'ord', 0,
        'operands', '[2,3]'::jsonb, 'answer', '6', 'display', '2 × 3 = __', 'spoken', 'two times three',
        'display_swapped', '3 × 2 = __', 'spoken_swapped', 'three times two'),
      jsonb_build_object('fact_id', 'fact.vfy.mult:-2,3', 'family_id', 'fact.vfy.mult', 'ord', 1,
        'operands', '[-2,3]'::jsonb, 'answer', '-6', 'display', '−2 × 3 = __', 'spoken', 'negative two times three',
        'display_swapped', '3 × (−2) = __', 'spoken_swapped', 'three times negative two')));

  -- B1 the dry run reports 'new' and writes nothing
  v_res := sync_fact_scope(v_mirror, false);
  if v_res->>'status' <> 'new' or (v_res->>'applied')::boolean or (v_res->>'facts')::int <> 2 then
    raise exception 'FAIL B1: dry-run report %', v_res;
  end if;
  if exists (select 1 from fact_scope_revision where registry_rev = v_rev) then
    raise exception 'FAIL B1: the dry run wrote a revision';
  end if;
  n := n + 1;

  -- B2 apply writes the revision, the family and both facts, operands as int[]
  v_res := sync_fact_scope(v_mirror, true);
  if v_res->>'status' <> 'mirrored'
     or (select count(*) from fact_scope_fact where registry_rev = v_rev) <> 2
     or (select operands from fact_scope_fact where registry_rev = v_rev and fact_id = 'fact.vfy.mult:-2,3') <> array[-2, 3]
     or (select display_swapped from fact_scope_fact where registry_rev = v_rev and fact_id = 'fact.vfy.mult:-2,3') <> '3 × (−2) = __'
     or (select response_ceiling_s from fact_scope_revision where registry_rev = v_rev) <> 15 then
    raise exception 'FAIL B2: apply %', v_res;
  end if;
  select mirrored_at into v_stamp from fact_scope_revision where registry_rev = v_rev;
  n := n + 1;

  -- B3 an identical re-mirror is a no-op — and a NEW graph_version on the same
  -- revision is still identical (the header moves on every graph bump)
  v_res := sync_fact_scope(jsonb_set(v_mirror, '{graph_version}', '"9.9.9"'), true);
  if v_res->>'status' <> 'unchanged'
     or (select count(*) from fact_scope_revision where registry_rev = v_rev) <> 1
     or (select mirrored_at from fact_scope_revision where registry_rev = v_rev) <> v_stamp
     or (select graph_version from fact_scope_revision where registry_rev = v_rev) <> '0.0.1' then
    raise exception 'FAIL B3: re-mirror %', v_res;
  end if;
  n := n + 1;

  -- B4 a divergent FACT under the same pair is refused
  v_raised := false;
  begin
    perform sync_fact_scope(jsonb_set(v_mirror, '{facts,0,answer}', '"7"'), false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%';
  end;
  if not v_raised then raise exception 'FAIL B4: a divergent fact was accepted'; end if;
  n := n + 1;

  -- B5 a divergent FAMILY, and a divergent probe value, are refused too
  v_raised := false;
  begin
    perform sync_fact_scope(jsonb_set(v_mirror, '{families,0,criterion_s}', '4'), false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%';
  end;
  if not v_raised then raise exception 'FAIL B5: a divergent family was accepted'; end if;
  v_raised := false;
  begin
    perform sync_fact_scope(jsonb_set(v_mirror, '{fact_probe,response_ceiling_s}', '16'), false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%';
  end;
  if not v_raised then raise exception 'FAIL B5: a divergent probe value was accepted'; end if;
  n := n + 1;

  -- B6 the rows are insert-only: UPDATE and DELETE raise
  v_raised := false;
  begin
    update fact_scope_fact set answer = '7' where registry_rev = v_rev and fact_id = 'fact.vfy.mult:2,3';
  exception when others then v_raised := sqlerrm ilike '%insert-only%';
  end;
  if not v_raised then raise exception 'FAIL B6: an UPDATE was allowed'; end if;
  v_raised := false;
  begin
    delete from fact_scope_revision where registry_rev = v_rev;
  exception when others then v_raised := sqlerrm ilike '%insert-only%';
  end;
  if not v_raised then raise exception 'FAIL B6: a DELETE was allowed'; end if;
  n := n + 1;

  -- B7 a family whose fact_count does not match its facts is refused
  v_bad := jsonb_set(jsonb_set(v_mirror, '{registry_rev}', to_jsonb(repeat('d', 64))),
                     '{families,0,fact_count}', '3');
  v_raised := false;
  begin
    perform sync_fact_scope(v_bad, true);
  exception when others then v_raised := sqlerrm ilike '%fact_count does not match%';
  end;
  if not v_raised then raise exception 'FAIL B7: a fact_count mismatch was accepted'; end if;
  n := n + 1;

  -- B8 a row the CHECKs refuse fails the DRY run as well as the write
  v_bad := jsonb_set(jsonb_set(v_mirror, '{registry_rev}', to_jsonb(repeat('c', 64))),
                     '{facts,0,answer}', '"1/2"');
  v_raised := false;
  begin
    perform sync_fact_scope(v_bad, false);
  exception when check_violation then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL B8: the dry run passed a row the write would refuse'; end if;
  if exists (select 1 from fact_scope_revision where registry_rev = repeat('c', 64)) then
    raise exception 'FAIL B8: the refused dry run left a row';
  end if;
  n := n + 1;

  -- B9 a malformed payload is refused
  v_raised := false;
  begin
    perform sync_fact_scope(v_mirror - 'facts', false);
  exception when others then v_raised := sqlerrm ilike '%malformed mirror%';
  end;
  if not v_raised then raise exception 'FAIL B9: a malformed payload was accepted'; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-sync: %/9', n;
end
$vfy$;
