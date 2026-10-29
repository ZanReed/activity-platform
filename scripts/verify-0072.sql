-- verify-0072.sql — targeted practice between DoL attempts (migration 0072).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0070 idiom): its own users, activity,
-- version, bank items and checks, everything rolled back (P7).
-- docs/design/dol-targeted-practice.md (TP-1…TP-9).
--
--   §A — posture: the three tables RLS forced with NO policy and no client
--        grant (TP-2: no client read path); the caller RPCs signed-in, definer,
--        pinned; the payload and the record write service-role only.
--   §B — the engine: TP-1 who may start (first try recorded, not passed, a
--        retake left; one "Not available" for everyone else); TP-3 four
--        RATIFIED templates of the primary skill, the one binding the first
--        try's misconception first, no draft / other-skill / gated-tier item;
--        TP-6 nothing to practise; resume; the check pair's replay, its
--        two-key return, record-before-verdict, finish after the last slot;
--        another student refused; the users cascade.

-- @section A-catalog-posture
-- @expect-rows
select 'dol_practice_tables_locked',
       (select bool_and(relrowsecurity and relforcerowsecurity) from pg_class
         where relname in ('dol_practice_sessions', 'dol_practice_items', 'dol_practice_attempts'))
       and not exists (select 1 from pg_policies
                        where tablename in ('dol_practice_sessions', 'dol_practice_items', 'dol_practice_attempts'))
       and not has_table_privilege('authenticated', 'dol_practice_attempts', 'select')
       and not has_table_privilege('authenticated', 'dol_practice_items', 'select')
       and not has_table_privilege('authenticated', 'dol_practice_sessions', 'select'),
       'TP-2: no policy, no client grant — every access is a definer function';
select 'dol_practice_caller_rpcs',
       has_function_privilege('authenticated', 'start_dol_practice(uuid, uuid)', 'execute')
       and has_function_privilege('authenticated', 'dol_practice_item_for_check(uuid, integer)', 'execute')
       and not has_function_privilege('anon', 'start_dol_practice(uuid, uuid)', 'execute')
       and (select bool_and(prosecdef and proconfig @> array['search_path=public']) from pg_proc
             where proname in ('start_dol_practice', 'dol_practice_item_for_check',
                               'record_dol_practice_attempt', 'dol_practice_session_payload')),
       'the caller RPCs: signed-in, definer, pinned';
select 'dol_practice_service_only',
       not has_function_privilege('authenticated',
         'record_dol_practice_attempt(uuid, uuid, integer, boolean, boolean, jsonb, jsonb)', 'execute')
       and not has_function_privilege('authenticated', 'dol_practice_session_payload(uuid)', 'execute'),
       'the verdict write and the payload: service role only';

-- @section B-engine
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t    uuid := gen_random_uuid();
  v_s    uuid := gen_random_uuid();
  v_s2   uuid := gen_random_uuid();
  v_s3   uuid := gen_random_uuid();
  v_x    uuid := gen_random_uuid();
  v_doc  jsonb := '{"schemaVersion": 2, "meta": {}, "sections": [
                    {"id": "dol-sec", "isCheckpoint": true, "rows": [],
                     "dol": {"skills": ["s.vfy0072"], "retake": true}}]}';
  v_a    uuid;  v_v uuid;
  v_res  jsonb;
  v_sess uuid;
  v_got  text;
  v_keys text[];
  i      integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0072-' || o || '@vfy0072.example', '{}'::jsonb
    from unnest(array[v_t, v_s, v_s2, v_s3, v_x]) with ordinality x(u, o);
  update users set role = 'teacher', timezone = 'UTC' where id = v_t;
  update users set role = 'student' where id in (v_s, v_s2, v_s3, v_x);

  insert into activities (owner_id, title, slug, status, source_path, primary_skill)
  values (v_t, 'dol', 'vfy-0072', 'published', 'c/01-chain.vfy/01.md', 's.vfy0072') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, v_doc, v_t) returning id into v_v;
  update activities set current_version_id = v_v where id = v_a;
  insert into skill_part_count (id, parts) values ('s.vfy0072', 1) on conflict (id) do update set parts = 1;

  -- The bank: 5 ratified templates of the skill (t5 binds the first try's
  -- misconception), one draft, one of another skill, one tier P (gated: no pass).
  insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id, status, position,
                             document, seed_spec, value_table, fingerprint, tier)
  select v_t, 'vfy0072#' || h, 'banks/01-chain.vfy/s.md', 'skill', sk, 'chain.vfy', st, pos,
         case when h = 't5' then '{"sections":[{"rows":[{"columns":[{"blocks":[{"type":"fill_in_blank","content":[{"type":"blank","mistakeFeedback":[{"match":"2","misconceptionId":"mis.vfy.shown"}]}]}]}]}]}]}'::jsonb
              else '{"sections":[]}'::jsonb end,
         '{"drawn":[],"derived":[],"where":[]}'::jsonb,
         '{"columns":["a"],"rows":[[1],[2],[3]],"total":3}'::jsonb,
         repeat('a', 64), tr
    from (values ('t1', 's.vfy0072', 'ratified', 0, null), ('t2', 's.vfy0072', 'ratified', 1, 'D'),
                 ('t3', 's.vfy0072', 'ratified', 2, null), ('t4', 's.vfy0072', 'ratified', 3, null),
                 ('t5', 's.vfy0072', 'ratified', 4, null), ('t6', 's.vfy0072', 'draft', 5, null),
                 ('t7', 's.other0072', 'ratified', 6, null), ('t8', 's.vfy0072', 'ratified', 7, 'P'))
         x(h, sk, st, pos, tr);

  -- First tries: s (misconception shown), s2 (two attempts), s3 (passed).
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, v_a, v_v, 'dol-sec', 1, '{}', '{"b1":{"verdict":"incorrect","misconceptionIds":["mis.vfy.shown"]}}'),
         (v_s2, v_a, v_v, 'dol-sec', 1, '{}', '{}'), (v_s2, v_a, v_v, 'dol-sec', 2, '{}', '{}'),
         (v_s3, v_a, v_v, 'dol-sec', 1, '{}', '{}');
  insert into dol_pass (student_id, skill_id, source) values (v_s3, 's.vfy0072', 'auto');

  -- ---- TP-1: who may start --------------------------------------------------
  foreach v_got in array array[v_x::text, v_s2::text, v_s3::text] loop
    perform set_config('request.jwt.claims', json_build_object('sub', v_got)::text, true);
    begin
      perform start_dol_practice(v_a, v_v);
      raise exception 'FAIL B1: % started practice', v_got;
    exception when others then
      if sqlerrm <> 'Not available' then raise exception 'FAIL B1: % got %', v_got, sqlerrm; end if;
    end;
  end loop;

  -- ---- TP-3: the pick ---------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_res := start_dol_practice(v_a, v_v);
  if v_res->>'state' <> 'started' or (v_res->'session'->>'planned')::int <> 4 then
    raise exception 'FAIL B2: start %', v_res;
  end if;
  v_sess := (v_res->'session'->>'session_id')::uuid;
  if (select item_id from dol_practice_items where session_id = v_sess and seq = 1) <> 'vfy0072#t5' then
    raise exception 'FAIL B2: the misconception-binding template is not first';
  end if;
  if exists (select 1 from dol_practice_items where session_id = v_sess
              and item_id in ('vfy0072#t6', 'vfy0072#t7', 'vfy0072#t8')) then
    raise exception 'FAIL B2: a draft, other-skill or gated-tier item was picked';
  end if;
  if (v_res->'session') ? 'items' and jsonb_path_exists(v_res, '$.**.document') then
    raise exception 'FAIL B2: the payload carries a document';
  end if;
  -- Resume, not a second session.
  if start_dol_practice(v_a, v_v)->>'state' <> 'resume' then raise exception 'FAIL B2: no resume'; end if;

  -- ---- the check pair -----------------------------------------------------------
  v_res := dol_practice_item_for_check(v_sess, 1);
  select array_agg(k order by k) into v_keys from jsonb_object_keys(v_res) k;
  if v_keys <> array['replay', 'student_id'] or (v_res->>'replay')::boolean then
    raise exception 'FAIL B3: item_for_check %', v_res;
  end if;
  for i in 1..4 loop
    v_res := record_dol_practice_attempt(v_s, v_sess, i, i = 1, false, '{}', '{}');
    if (v_res->>'replayed')::boolean then raise exception 'FAIL B3: a first try replayed'; end if;
  end loop;
  if (record_dol_practice_attempt(v_s, v_sess, 1, false, false, '{}', '{}')->>'correct')::boolean is not true then
    raise exception 'FAIL B3: a second try overwrote the first';
  end if;
  if (select finished_at from dol_practice_sessions where id = v_sess) is null then
    raise exception 'FAIL B3: not finished after the last slot';
  end if;
  if not (dol_practice_item_for_check(v_sess, 2)->>'replay')::boolean then
    raise exception 'FAIL B3: a tried slot did not replay';
  end if;
  -- Another student cannot touch the session.
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  begin
    perform dol_practice_item_for_check(v_sess, 1);
    raise exception 'FAIL B3: another student read the session';
  exception when others then
    if sqlerrm <> 'Not available' then raise exception 'FAIL B3: got %', sqlerrm; end if;
  end;

  -- ---- TP-6: nothing to practise ---------------------------------------------------
  update practice_item set status = 'draft' where owner_id = v_t and item_id like 'vfy0072#%';
  delete from section_checks where student_id = v_s2 and attempt_number = 2;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  if start_dol_practice(v_a, v_v)->>'state' <> 'nothing_to_practise' then
    raise exception 'FAIL B4: an empty bank still offered practice';
  end if;

  -- ---- the users cascade ----------------------------------------------------------
  delete from auth.users where id = v_s;
  if exists (select 1 from dol_practice_sessions where id = v_sess)
     or exists (select 1 from dol_practice_attempts where session_id = v_sess) then
    raise exception 'FAIL B5: the account delete left practice rows';
  end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;
