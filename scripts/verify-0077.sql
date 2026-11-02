-- verify-0077.sql — repeat the one matching template first and last (migration
-- 0077, C-167's wish, TP-3 as amended).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).
--
--   §A — dol_practice_repeat_row is service-role only, definer-free, pinned.
--   §B — the repeat row never equals the first row; the plan repeats only when
--        exactly one servable template binds a shown misconception and has two
--        or more rows; the dose doesn't grow; the two slots are separate.

-- @section A-posture
-- @expect-rows
select 'repeat_row_service_only',
       not has_function_privilege('authenticated', 'dol_practice_repeat_row(uuid, text, integer)', 'execute')
       and not has_function_privilege('anon', 'dol_practice_repeat_row(uuid, text, integer)', 'execute')
       and (select proconfig @> array['search_path=public'] from pg_proc
             where proname = 'dol_practice_repeat_row'),
       'dol_practice_repeat_row is private and pinned';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();
  v_cap integer := dol_practice_cap();
  v_doc jsonb := '{"sections":[{"id":"dol-sec","isCheckpoint":true,"rows":[],"dol":{"skills":["s"],"retake":true}}]}';
  v_plan text[];
  v_rows integer[];
  v_sess uuid;
begin
  -- ---- B1 the repeat row can't land on the first row --------------------------
  if exists (
    select 1 from generate_series(2, 40) n, generate_series(1, 200) i, lateral (select gen_random_uuid() as s) u
     where dol_practice_repeat_row(u.s, 'x#t' || i, n) = mixed_row_index(u.s, 'x#t' || i, n)
        or dol_practice_repeat_row(u.s, 'x#t' || i, n) not between 0 and n - 1) then
    raise exception 'FAIL B1: a repeat row matched the first row or fell outside the table';
  end if;

  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0077-t@vfy0077.example', '{}'::jsonb);
  update users set role = 'teacher', timezone = 'UTC' where id = v_t;

  -- One bank per case. t(n) binds mis.vfy.<bind[n]>; '' binds nothing.
  create function pg_temp.vfy_plan(p_case text, p_teacher uuid, p_doc jsonb, p_binds text[], p_rows integer[],
                                   p_tiers text[], p_shown text[])
  returns uuid language plpgsql as $f$
  declare
    v_s uuid := gen_random_uuid();
    v_a uuid;
    v_v uuid;
    v_res jsonb;
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values (v_s, 'vfy0077-' || p_case || '@vfy0077.example', '{}'::jsonb);
    update users set role = 'student' where id = v_s;
    insert into activities (owner_id, title, slug, status, source_path, primary_skill)
    values (p_teacher, 'dol', 'vfy-0077-' || p_case, 'published', 'c/77-chain.vfy/' || p_case || '.md', 's.vfy0077.' || p_case)
    returning id into v_a;
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_a, 1, p_doc, p_teacher) returning id into v_v;
    update activities set current_version_id = v_v where id = v_a;
    insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id, status, position,
                               document, seed_spec, value_table, fingerprint, tier)
    select p_teacher, 'vfy0077-' || p_case || '#t' || n, 'banks/77-chain.vfy/' || p_case || '.md', 'skill',
           's.vfy0077.' || p_case, 'chain.vfy', 'ratified', n,
           case when p_binds[n] = '' then '{"sections":[]}'::jsonb
                else jsonb_build_object('misconceptionId', 'mis.vfy.' || p_binds[n]) end,
           '{"drawn":[],"derived":[],"where":[]}'::jsonb,
           jsonb_build_object('columns', '["a"]'::jsonb, 'rows',
                              (select jsonb_agg(jsonb_build_array(r)) from generate_series(1, p_rows[n]) r),
                              'total', p_rows[n]),
           repeat('a', 64), nullif(p_tiers[n], '')
      from generate_series(1, array_length(p_binds, 1)) n;
    insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
    values (v_s, v_a, v_v, 'dol-sec', 1, '{}',
            jsonb_build_object('b1', jsonb_build_object('verdict', 'incorrect', 'misconceptionIds',
              (select coalesce(jsonb_agg('mis.vfy.' || m), '[]'::jsonb) from unnest(p_shown) m))));
    perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
    v_res := start_dol_practice(v_a, v_v);
    if v_res->>'state' <> 'started' then
      raise exception 'FAIL %: state %', p_case, v_res->>'state';
    end if;
    return (v_res->'session'->>'session_id')::uuid;
  end;
  $f$;

  -- ---- B2 one binder with rows: first and last, a different row, same dose ----
  v_sess := pg_temp.vfy_plan('one', v_t, v_doc,
    array['', '', 'a', '', '', '', '', '', ''], array[3,3,5,3,3,3,3,3,3],
    array['','','','','','','','',''], array['a']);
  select array_agg(split_part(item_id, '#', 2) order by seq), array_agg(row_index order by seq)
    into v_plan, v_rows from dol_practice_items where session_id = v_sess;
  if cardinality(v_plan) <> v_cap or v_plan[1] <> 't3' or v_plan[v_cap] <> 't3'
     or (select planned from dol_practice_sessions where id = v_sess) <> v_cap then
    raise exception 'FAIL B2: plan % under a cap of %', v_plan, v_cap;
  end if;
  if v_rows[1] = v_rows[v_cap] then
    raise exception 'FAIL B2: both slots drew row %', v_rows[1];
  end if;
  if (select count(distinct item_id) from dol_practice_items where session_id = v_sess) <> v_cap - 1 then
    raise exception 'FAIL B2: another template repeated: %', v_plan;
  end if;
  if (select count(*) from dol_practice_items i
       where i.session_id = v_sess and i.seq in (1, v_cap)
         and i.row_values->'a' = ((select p.value_table from practice_item p where p.item_id = i.item_id and p.owner_id = v_t)
                                   ->'rows'->i.row_index->0)) <> 2 then
    raise exception 'FAIL B2: a slot''s values are not its own row';
  end if;

  -- ---- B3 two binders: no repeat ----------------------------------------------
  v_sess := pg_temp.vfy_plan('two', v_t, v_doc,
    array['a', 'a', '', '', '', '', '', '', ''], array[3,3,3,3,3,3,3,3,3],
    array['','','','','','','','',''], array['a']);
  if (select count(distinct item_id) from dol_practice_items where session_id = v_sess) <> v_cap then
    raise exception 'FAIL B3: two binders repeated';
  end if;

  -- ---- B4 the one binder has a single row: no repeat --------------------------
  v_sess := pg_temp.vfy_plan('single', v_t, v_doc,
    array['a', '', '', '', '', '', '', '', ''], array[1,3,3,3,3,3,3,3,3],
    array['','','','','','','','',''], array['a']);
  if (select count(distinct item_id) from dol_practice_items where session_id = v_sess) <> v_cap then
    raise exception 'FAIL B4: a one-row template repeated';
  end if;

  -- ---- B5 nothing shown: no repeat --------------------------------------------
  v_sess := pg_temp.vfy_plan('none', v_t, v_doc,
    array['a', '', '', '', '', '', '', '', ''], array[3,3,3,3,3,3,3,3,3],
    array['','','','','','','','',''], array[]::text[]);
  if (select count(distinct item_id) from dol_practice_items where session_id = v_sess) <> v_cap then
    raise exception 'FAIL B5: repeated with no misconception shown';
  end if;

  -- ---- B6 a gated binder doesn't count: the one servable binder still repeats --
  v_sess := pg_temp.vfy_plan('gated', v_t, v_doc,
    array['a', 'a', '', '', '', '', '', '', ''], array[3,3,3,3,3,3,3,3,3],
    array['P','','','','','','','',''], array['a']);
  select array_agg(split_part(item_id, '#', 2) order by seq) into v_plan
    from dol_practice_items where session_id = v_sess;
  if v_plan[1] <> 't2' or v_plan[v_cap] <> 't2' or 't1' = any (v_plan) then
    raise exception 'FAIL B6: plan %', v_plan;
  end if;

  -- ---- B7 a bank of one: the template twice ---------------------------------------
  v_sess := pg_temp.vfy_plan('only', v_t, v_doc, array['a'], array[3], array[''], array['a']);
  select array_agg(split_part(item_id, '#', 2) order by seq) into v_plan
    from dol_practice_items where session_id = v_sess;
  if v_plan <> array['t1', 't1'] then
    raise exception 'FAIL B7: plan %', v_plan;
  end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;
