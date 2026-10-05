-- verify-0047.sql — a long check runs in two parts (migration 0047).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0045 idiom): its own synthetic fact-scope
-- revisions stamped mirrored_at in 2999, real functions, everything rolled back
-- (P7). Nothing depends on which registry revision is really mirrored.
--
--   §A — catalog posture: the four mirror columns and their all-or-none
--        constraint; the new functions are internal; the client RPCs keep
--        their grants.
--   §B — the mirror stores and compares the new fields (an identical re-mirror
--        is a no-op, a changed threshold is refused); a year over the threshold
--        opens in TWO ordered parts with the two-part count per family and a
--        short family capped at its facts; a year under it stays one part; a
--        year whose scope leaves a part empty stays one part; a revision with
--        no settings behaves as before; the entry and the overview carry the
--        parts.

-- @section A-catalog-posture
-- @expect-rows
select 'mirror_two_part_columns',
       (select count(*) = 4 from information_schema.columns
         where table_name = 'fact_scope_revision'
           and column_name in ('two_part_above', 'two_part_items_per_family', 'family_groups', 'probe_parts')
           and is_nullable = 'YES'),
       'four NULLABLE columns: every revision mirrored before 0047 reads as "no two-part settings"';
select 'mirror_two_part_all_or_none',
       exists (select 1 from pg_constraint
                where conrelid = 'public.fact_scope_revision'::regclass
                  and conname = 'fact_scope_two_part_all_or_none'),
       'the two settings and the two lists are present together or not at all';
select 'mirror_still_insert_only',
       (select count(*) = 6 from pg_trigger
         where tgfoid = 'fact_scope_insert_only'::regproc and not tgisinternal),
       '0044''s insert-only triggers survive the ALTER';
select 'two_part_internals_not_client_callable',
       (select bool_and(prosecdef and proconfig @> array['search_path=public']) and count(*) = 3
          from pg_proc
         where proname in ('fact_probe_allocate', 'fact_probe_allocate_single', 'fact_probe_family_parts'))
       and not has_function_privilege('authenticated', 'fact_probe_allocate(text,integer,integer)', 'execute')
       and not has_function_privilege('authenticated', 'fact_probe_allocate_single(text,integer,integer)', 'execute')
       and not has_function_privilege('authenticated', 'fact_probe_family_parts(text,integer)', 'execute'),
       'definer, pinned, and reachable only from the definer RPCs';
select 'two_part_rpcs_keep_their_grants',
       (select bool_and(has_function_privilege('authenticated', f, 'execute')
                        and not has_function_privilege('anon', f, 'execute'))
          from unnest(array['open_fact_probe(uuid,integer)', 'fact_probe_entry(text)',
                            'fact_probe_overview(uuid)']) f)
       and has_function_privilege('service_role', 'sync_fact_scope(jsonb,boolean)', 'execute')
       and not has_function_privilege('authenticated', 'sync_fact_scope(jsonb,boolean)', 'execute'),
       'the re-created functions are still signed-in only; the mirror still service-role only';

-- @section B-two-parts
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('7', 64);
  v_teacher uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_class   uuid;
  v_code    text;
  v_mirror  jsonb;
  v_res     jsonb;
  v_probe   uuid;
  v_items   jsonb;
  v_got     text;
  v_raised  boolean;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0047-t@vfy0047.example', '{}'::jsonb),
         (v_student, 'vfy0047-s@vfy0047.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id = v_student;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version,
                       school_year_ends_on)  -- 0048: a check needs one
  values (v_teacher, 'vfy 0047 class', v_teacher, 'vfy', current_date + 100) returning id, join_code into v_class, v_code;
  insert into class_members (class_id, student_id) values (v_class, v_student);

  -- A synthetic revision through the REAL mirror function. Ten families of 20
  -- facts (a..j) and one of 3 (k). Groups: g1 = a b c, g2 = d e, g3 = f g h,
  -- g4 = i j k. Parts: [g1, g2] and [g3, g4].
  --   year 7: a..f (6 families)  → single length 30, NOT over 40 → one part
  --   year 8: a..k (11 families) → single length 55, over 40     → two parts:
  --           part 1 = a b c d e (5 × 8 = 40), part 2 = f g h i j (5 × 8) + k (3) = 43
  -- (The empty-part and no-settings cases use their own revisions in B7, B8.)
  select jsonb_build_object(
    'registry_rev', v_rev, 'fact_grammar_rev', 1, 'graph_version', '0.0.0',
    'fact_probe', jsonb_build_object(
      'floor_factor_k', 0.8, 'accuracy_threshold', 0.8, 'facts_met_threshold', 0.8,
      'response_ceiling_s', 15, 'min_items_per_family', 5, 'practice_window', 10,
      'two_part_above', 40, 'two_part_items_per_family', 8),
    'year_scope', jsonb_build_object(
      '7', jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
           (select jsonb_agg('fact.vfy.' || c) from unnest(array['a','b','c','d','e','f']) c)),
      '8', jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
           (select jsonb_agg('fact.vfy.' || c) from unnest(array['a','b','c','d','e','f','g','h','i','j','k']) c))),
    'fraction_names', '{}'::jsonb,
    'family_groups', jsonb_build_array(
      jsonb_build_object('id', 'group.g1', 'label', 'G1', 'families', '["fact.vfy.a","fact.vfy.b","fact.vfy.c"]'::jsonb),
      jsonb_build_object('id', 'group.g2', 'label', 'G2', 'families', '["fact.vfy.d","fact.vfy.e"]'::jsonb),
      jsonb_build_object('id', 'group.g3', 'label', 'G3', 'families', '["fact.vfy.f","fact.vfy.g","fact.vfy.h"]'::jsonb),
      jsonb_build_object('id', 'group.g4', 'label', 'G4', 'families', '["fact.vfy.i","fact.vfy.j","fact.vfy.k"]'::jsonb)),
    'probe_parts', '[["group.g1","group.g2"],["group.g3","group.g4"]]'::jsonb,
    'families', (select jsonb_agg(jsonb_build_object(
        'family_id', 'fact.vfy.' || c, 'ord', ord - 1, 'kind', 'generated', 'name', 'Fam ' || upper(c),
        'source_year', 5, 'operation', 'square', 'criterion_s', 3, 'turnaround', false, 'weight', 1,
        'fact_count', case when c = 'k' then 3 else 20 end, 'strategy', null) order by ord)
      from unnest(array['a','b','c','d','e','f','g','h','i','j','k']) with ordinality as t(c, ord)),
    'facts', (select jsonb_agg(jsonb_build_object(
        'fact_id', 'fact.vfy.' || c || ':' || g, 'family_id', 'fact.vfy.' || c, 'ord', g - 1,
        'operands', jsonb_build_array(g), 'answer', (g + 10)::text,
        'display', upper(c) || g || ' = __', 'spoken', c || ' ' || g,
        'display_swapped', null, 'spoken_swapped', null))
      from unnest(array['a','b','c','d','e','f','g','h','i','j','k']) c,
           generate_series(1, case when c = 'k' then 3 else 20 end) g))
    into v_mirror;

  -- B1 the mirror stores the settings; an identical re-mirror is a no-op; a
  --    changed two-part value under the same revision is refused
  v_res := sync_fact_scope(v_mirror, true);
  if v_res->>'status' <> 'mirrored'
     or (select two_part_above from fact_scope_revision where registry_rev = v_rev) <> 40
     or (select two_part_items_per_family from fact_scope_revision where registry_rev = v_rev) <> 8
     or (select jsonb_array_length(family_groups) from fact_scope_revision where registry_rev = v_rev) <> 4
     or (select probe_parts from fact_scope_revision where registry_rev = v_rev)
        <> '[["group.g1","group.g2"],["group.g3","group.g4"]]'::jsonb then
    raise exception 'FAIL B1: the mirror did not store the two-part settings %', v_res;
  end if;
  if sync_fact_scope(v_mirror, true)->>'status' <> 'unchanged' then
    raise exception 'FAIL B1: an identical re-mirror was not a no-op';
  end if;
  v_raised := false;
  begin perform sync_fact_scope(jsonb_set(v_mirror, '{fact_probe,two_part_items_per_family}', '9'), false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%'; end;
  if not v_raised then raise exception 'FAIL B1: a changed two-part count was accepted'; end if;
  v_raised := false;
  begin perform sync_fact_scope(jsonb_set(v_mirror, '{probe_parts}', '[["group.g1"],["group.g2","group.g3","group.g4"]]'), false);
  exception when others then v_raised := sqlerrm ilike '%DIFFERENT content%'; end;
  if not v_raised then raise exception 'FAIL B1: a changed part cut was accepted'; end if;
  n := n + 1;

  -- The synthetic revision must be "the latest" for open: it was mirrored
  -- just now, after anything real. Guard the assumption instead of trusting it.
  if (select registry_rev from fact_scope_revision order by mirrored_at desc, registry_rev desc limit 1) <> v_rev then
    raise exception 'FAIL fixture: the synthetic revision is not the latest';
  end if;

  -- B2 the allocation: year 7 (single length 30, not over 40) is ONE part by
  --    item 20's rule; year 8 (55, over 40) is two parts at 8 a family, the
  --    3-fact family capped at 3
  select string_agg(right(family_id, 1) || n_items || 'p' || part, ' ' order by family_id) into v_got
    from fact_probe_allocate(v_rev, 1, 7);
  if v_got <> 'a5p1 b5p1 c5p1 d5p1 e5p1 f5p1' then raise exception 'FAIL B2: year 7 %', v_got; end if;
  select string_agg(right(family_id, 1) || n_items || 'p' || part, ' ' order by family_id) into v_got
    from fact_probe_allocate(v_rev, 1, 8);
  if v_got <> 'a8p1 b8p1 c8p1 d8p1 e8p1 f8p2 g8p2 h8p2 i8p2 j8p2 k3p2' then
    raise exception 'FAIL B2: year 8 %', v_got;
  end if;
  n := n + 1;

  -- B3 open year 8: 83 items; every Part 1 item comes before every Part 2
  --    item; 40 then 43; and the open's own answer says so
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := open_fact_probe(v_class, 8);
  v_probe := (v_res->>'probe_id')::uuid;
  select items into v_items from class_probes where id = v_probe;
  if jsonb_array_length(v_items) <> 83 or v_res->'parts' <> '[40, 43]'::jsonb
     or (select max((e->>'n')::int) from jsonb_array_elements(v_items) e where (e->>'part')::int = 1) <> 40
     or (select min((e->>'n')::int) from jsonb_array_elements(v_items) e where (e->>'part')::int = 2) <> 41
     or exists (select 1 from jsonb_array_elements(v_items) e
                 where (e->>'part')::int <> case when right(e->>'family_id', 1) in ('a','b','c','d','e') then 1 else 2 end) then
    raise exception 'FAIL B3: the two-part item list %', v_res;
  end if;
  n := n + 1;

  -- B4 inside a part the families are MIXED, not in blocks, and the order is
  --    the second hash within the part (re-derived from the probe id)
  if (select string_agg(e->>'fact_id', ',' order by (e->>'n')::int) from jsonb_array_elements(v_items) e)
     <> (select string_agg(e->>'fact_id', ',' order by (e->>'part')::int,
                           md5(v_probe::text || ':s:' || (e->>'fact_id')), e->>'fact_id')
           from jsonb_array_elements(v_items) e) then
    raise exception 'FAIL B4: the order within a part is not the hash''s';
  end if;
  n := n + 1;

  -- B5 the probe row keeps the "not judged" minimum at 5 (3 for the short
  --    family) and records each family's part; the floor is from all 83 items
  if exists (select 1 from jsonb_array_elements((select families from class_probes where id = v_probe)) f
              where (f->>'min_items')::int <> case when f->>'family_id' = 'fact.vfy.k' then 3 else 5 end
                 or (f->>'part')::int <> case when right(f->>'family_id', 1) in ('a','b','c','d','e') then 1 else 2 end
                 or (f->>'n_items')::int <> case when f->>'family_id' = 'fact.vfy.k' then 3 else 8 end)
     or round((select floor_per_min from class_probes where id = v_probe), 4) <> round(0.8 * 60 / 3.0, 4) then
    raise exception 'FAIL B5: the probe row''s family settings or floor';
  end if;
  n := n + 1;

  -- B6 the student's entry carries each item's part; the overview gives the
  --    facts per part for each year
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_res := fact_probe_entry(v_code);
  if v_res->>'state' <> 'ready'
     or (select count(*) from jsonb_array_elements(v_res->'items') e where (e->>'part')::int = 1) <> 40
     or (select count(*) from jsonb_array_elements(v_res->'items') e where (e->>'part')::int = 2) <> 43 then
    raise exception 'FAIL B6: the entry''s parts';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := fact_probe_overview(v_class);
  if (select jsonb_object_agg(y->>'year', y->'parts') from jsonb_array_elements(v_res->'years') y)
     <> '{"7": [30], "8": [40, 43]}'::jsonb
     or (select (y->>'items')::int from jsonb_array_elements(v_res->'years') y where y->>'year' = '8') <> 83 then
    raise exception 'FAIL B6: the overview''s parts %', v_res->'years';
  end if;
  n := n + 1;

  -- B7 a year whose scope leaves one part EMPTY stays single-part, however
  --    long: nine families all in part 1's groups
  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count,
    two_part_above, two_part_items_per_family, family_groups, probe_parts)
  values (repeat('8', 64), 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    jsonb_build_object('7', jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
      (select jsonb_agg('fact.vfy.m' || g) from generate_series(1, 9) g))),
    '{}'::jsonb, 9, 180, 40, 8,
    jsonb_build_array(
      jsonb_build_object('id', 'group.all', 'label', 'All', 'families', (select jsonb_agg('fact.vfy.m' || g) from generate_series(1, 9) g)),
      jsonb_build_object('id', 'group.none', 'label', 'None', 'families', '["fact.vfy.zz"]'::jsonb)),
    '[["group.all"],["group.none"]]'::jsonb);
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  select repeat('8', 64), 1, 'fact.vfy.m' || g, g, 'generated', 'M' || g, 5, 'square', 3, false, 1, 20
    from generate_series(1, 9) g;
  if (select count(distinct part) from fact_probe_allocate(repeat('8', 64), 1, 7)) <> 1
     or (select sum(n_items) from fact_probe_allocate(repeat('8', 64), 1, 7)) <> 45 then
    raise exception 'FAIL B7: an empty part did not fall back to one part';
  end if;
  n := n + 1;

  -- B8 a revision with NO two-part settings behaves exactly as before 0047
  insert into fact_scope_revision (
    registry_rev, fact_grammar_rev, graph_version, floor_factor_k, accuracy_threshold,
    facts_met_threshold, response_ceiling_s, min_items_per_family, practice_window,
    year_scope, fraction_names, family_count, fact_count)
  values (repeat('9', 64), 1, '0.0.0', 0.8, 0.8, 0.8, 15, 5, 10,
    jsonb_build_object('7', jsonb_build_object('adds', '[]'::jsonb, 'description', null, 'cumulative',
      (select jsonb_agg('fact.vfy.n' || g) from generate_series(1, 11) g))),
    '{}'::jsonb, 11, 220);
  insert into fact_scope_family (registry_rev, fact_grammar_rev, family_id, ord, kind, name,
    source_year, operation, criterion_s, turnaround, weight, fact_count)
  select repeat('9', 64), 1, 'fact.vfy.n' || g, g, 'generated', 'N' || g, 5, 'square', 3, false, 1, 20
    from generate_series(1, 11) g;
  if (select string_agg(distinct n_items || 'p' || part, ',') from fact_probe_allocate(repeat('9', 64), 1, 7)) <> '5p1'
     or (select sum(n_items) from fact_probe_allocate(repeat('9', 64), 1, 7)) <> 55 then
    raise exception 'FAIL B8: a revision without settings did not stay single-part';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-two-parts: %/8', n;
end
$vfy$;
