-- verify-0058.sql — the practice-bank item store (migration 0058).
--
-- Run with `pnpm verify:auth --target live|local`. §B–§C are self-fixturing
-- EXPECTED-ROLLBACK blocks (the verify-0043 idiom): real rows through the real
-- function, claims-switched reads, everything rolled back — durable-write-free
-- on every path (P7).
--
--   §A — catalog posture: table exists, RLS forced, exactly ONE policy and it
--        is an authenticated SELECT, no client write grants, anon reads
--        nothing, the sync is SECURITY DEFINER and service-role only, the owner
--        FK cascades.
--   §B — reads (BE-8): the owner reads their own rows; another teacher, a
--        student and an anonymous caller read none; client writes and a client
--        sync are refused. Answer-key-class content never reaches a student.
--   §C — the sync: dry run writes nothing; apply upserts; a no-op re-import
--        leaves updated_at alone; an item missing from the file RETIRES (never
--        deletes); a RETURNING retired id is REFUSED (PB-3) — listed by the dry
--        run, raised by an apply, written only with p_allow_unretire; duplicate
--        ids, an unknown owner and a malformed row are refused; the owner purge
--        cascades.

-- @section A-catalog-posture
-- @expect-rows
select 'practice_item_table_exists',
       to_regclass('public.practice_item') is not null,
       '0058: the practice-bank item store';
select 'practice_item_rls_forced',
       (select relrowsecurity and relforcerowsecurity
          from pg_class where relname = 'practice_item'),
       'RLS enabled AND forced';
select 'practice_item_one_select_policy',
       (select count(*) = 1
               and bool_and(cmd = 'SELECT' and roles = '{authenticated}')
          from pg_policies where tablename = 'practice_item'),
       'BE-8: ONE authenticated SELECT policy (the 0043 posture)';
select 'practice_item_no_client_writes',
       not has_table_privilege('authenticated', 'practice_item', 'insert')
       and not has_table_privilege('authenticated', 'practice_item', 'update')
       and not has_table_privilege('authenticated', 'practice_item', 'delete')
       and not has_table_privilege('anon', 'practice_item', 'select'),
       'the importer (service role) is the only writer; anon reads nothing';
select 'practice_item_sync_definer',
       (select prosecdef from pg_proc where proname = 'sync_practice_items'),
       'SECURITY DEFINER';
select 'practice_item_sync_service_only',
       has_function_privilege('service_role', 'sync_practice_items(uuid,jsonb,boolean,boolean)', 'execute')
       and not has_function_privilege('authenticated', 'sync_practice_items(uuid,jsonb,boolean,boolean)', 'execute')
       and not has_function_privilege('anon', 'sync_practice_items(uuid,jsonb,boolean,boolean)', 'execute'),
       'BE-8: the mirror is service-role only';
select 'practice_item_owner_cascade_fk',
       (select confdeltype = 'c' from pg_constraint
         where conrelid = 'public.practice_item'::regclass and contype = 'f'),
       'only the owner purge removes rows';

-- @section B-reads
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_other   uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_count   integer;
  v_raised  boolean;
  n         integer := 0;
  v_row     jsonb := jsonb_build_object(
    'item_id', 'rate.unit-rate#t1', 'bank_path', 'banks/801-chain.rate.proportional/rate.unit-rate.md',
    'role', 'skill', 'skill_id', 'rate.unit-rate', 'chain_id', 'chain.rate.proportional',
    'discriminates', '[]'::jsonb, 'status', 'draft', 'position', 0,
    'document', '{"schemaVersion":2,"sections":[]}'::jsonb,
    'seed_spec', '{"drawn":[],"derived":[],"where":[]}'::jsonb,
    'value_table', '{"columns":[],"rows":[[]],"total":1}'::jsonb,
    'fingerprint', repeat('a', 64));
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0058b-t@vfy0058.example', '{}'::jsonb),
         (v_other,   'vfy0058b-o@vfy0058.example', '{}'::jsonb),
         (v_student, 'vfy0058b-s@vfy0058.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = v_student;
  perform sync_practice_items(v_teacher, jsonb_build_array(v_row), true);

  execute 'set local role authenticated';

  -- B1 the owner reads their own row
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  select count(*) into v_count from practice_item;
  if v_count <> 1 then raise exception 'FAIL B1: owner read % rows', v_count; end if;
  n := n + 1;

  -- B2 another teacher reads none
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  select count(*) into v_count from practice_item;
  if v_count <> 0 then raise exception 'FAIL B2: other teacher read % rows', v_count; end if;
  n := n + 1;

  -- B3 a student reads none — answer-key-class content
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  select count(*) into v_count from practice_item;
  if v_count <> 0 then raise exception 'FAIL B3: student read % rows', v_count; end if;
  n := n + 1;

  -- B4 the owner cannot write, even their own rows
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_raised := false;
  begin
    update practice_item set status = 'ratified' where owner_id = v_teacher;
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL B4: client update allowed'; end if;
  n := n + 1;

  v_raised := false;
  begin
    delete from practice_item where owner_id = v_teacher;
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL B5: client delete allowed'; end if;
  n := n + 1;

  -- B6 a signed-in client cannot run the sync
  v_raised := false;
  begin
    perform sync_practice_items(v_teacher, '[]'::jsonb, true);
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL B6: authenticated ran the sync'; end if;
  n := n + 1;

  execute 'reset role';

  -- B7 an anonymous caller reads nothing (no grant at all)
  execute 'set local role anon';
  perform set_config('request.jwt.claims', '', true);
  v_raised := false;
  begin
    select count(*) into v_count from practice_item;
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL B7: anon read the table'; end if;
  n := n + 1;
  execute 'reset role';

  raise exception 'EXPECTED ROLLBACK >>> B-reads: %/7', n;
end
$vfy$;

-- @section C-sync
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_res     jsonb;
  v_before  timestamptz;
  v_after   timestamptz;
  v_raised  boolean;
  n         integer := 0;
  v_a jsonb := jsonb_build_object(
    'item_id', 'rate.unit-rate#t1', 'bank_path', 'banks/801-chain.rate.proportional/rate.unit-rate.md',
    'role', 'skill', 'skill_id', 'rate.unit-rate', 'chain_id', 'chain.rate.proportional',
    'discriminates', '[]'::jsonb, 'status', 'draft', 'position', 0,
    'document', '{"schemaVersion":2,"sections":[]}'::jsonb,
    'seed_spec', '{"drawn":[],"derived":[],"where":[]}'::jsonb,
    'value_table', '{"columns":["a"],"rows":[[2],[3]],"total":2}'::jsonb,
    'fingerprint', repeat('a', 64));
  v_d jsonb := jsonb_build_object(
    'item_id', 'chain.rate.proportional.discrimination#d1',
    'bank_path', 'banks/801-chain.rate.proportional/chain.rate.proportional.discrimination.md',
    'role', 'discrimination', 'skill_id', null, 'chain_id', 'chain.rate.proportional',
    'discriminates', '["rate.unit-rate","rate.proportional-graph"]'::jsonb, 'status', 'draft', 'position', 0,
    'document', '{"schemaVersion":2,"sections":[]}'::jsonb,
    'seed_spec', '{"drawn":[],"derived":[],"where":[]}'::jsonb,
    'value_table', '{"columns":[],"rows":[[]],"total":1}'::jsonb,
    'fingerprint', repeat('d', 64));
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0058c-t@vfy0058.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;

  -- C1 a dry run reports and writes nothing
  v_res := sync_practice_items(v_teacher, jsonb_build_array(v_a, v_d), false);
  if jsonb_array_length(v_res->'new') <> 2 or exists (select 1 from practice_item where owner_id = v_teacher) then
    raise exception 'FAIL C1: dry run %', v_res;
  end if;
  n := n + 1;

  -- C2 apply writes both, discrimination row with its skills
  v_res := sync_practice_items(v_teacher, jsonb_build_array(v_a, v_d), true);
  if (select count(*) from practice_item where owner_id = v_teacher and retired_at is null) <> 2
     or (select discriminates from practice_item where item_id = 'chain.rate.proportional.discrimination#d1')
        <> array['rate.unit-rate', 'rate.proportional-graph'] then
    raise exception 'FAIL C2: apply %', v_res;
  end if;
  n := n + 1;

  -- C3 a no-op re-import: nothing new or changed, updated_at untouched
  select updated_at into v_before from practice_item where owner_id = v_teacher and item_id = 'rate.unit-rate#t1';
  v_res := sync_practice_items(v_teacher, jsonb_build_array(v_a, v_d), true);
  select updated_at into v_after from practice_item where owner_id = v_teacher and item_id = 'rate.unit-rate#t1';
  if jsonb_array_length(v_res->'new') + jsonb_array_length(v_res->'changed') <> 0 or v_before <> v_after then
    raise exception 'FAIL C3: no-op re-import %', v_res;
  end if;
  n := n + 1;

  -- C4 a fingerprint change is a change
  v_res := sync_practice_items(v_teacher,
    jsonb_build_array(v_a || jsonb_build_object('fingerprint', repeat('b', 64), 'status', 'ratified'), v_d), true);
  if v_res->'changed' <> '["rate.unit-rate#t1"]'::jsonb
     or (select status from practice_item where item_id = 'rate.unit-rate#t1') <> 'ratified' then
    raise exception 'FAIL C4: change %', v_res;
  end if;
  n := n + 1;

  -- C5 an item missing from the file RETIRES (the row stays)
  v_res := sync_practice_items(v_teacher, jsonb_build_array(v_d), true);
  if v_res->'retired' <> '["rate.unit-rate#t1"]'::jsonb
     or (select retired_at from practice_item where item_id = 'rate.unit-rate#t1') is null then
    raise exception 'FAIL C5: retire %', v_res;
  end if;
  n := n + 1;

  -- C6 a RETURNING retired id: the dry run lists it as refused …
  v_res := sync_practice_items(v_teacher, jsonb_build_array(v_a, v_d), false);
  if v_res->'refused' <> '["rate.unit-rate#t1"]'::jsonb or v_res->'unretired' <> '[]'::jsonb then
    raise exception 'FAIL C6: dry run of a returning id %', v_res;
  end if;
  n := n + 1;

  -- C7 … an apply RAISES and writes nothing (PB-3)
  v_raised := false;
  begin
    perform sync_practice_items(v_teacher, jsonb_build_array(v_a, v_d), true);
  exception when others then
    v_raised := sqlerrm like '%never reused%';
  end;
  if not v_raised or (select retired_at from practice_item where item_id = 'rate.unit-rate#t1') is null then
    raise exception 'FAIL C7: a returning retired id was not refused';
  end if;
  n := n + 1;

  -- C8 … and only p_allow_unretire (--force) writes it
  v_res := sync_practice_items(v_teacher, jsonb_build_array(v_a, v_d), true, true);
  if v_res->'unretired' <> '["rate.unit-rate#t1"]'::jsonb
     or (select retired_at from practice_item where item_id = 'rate.unit-rate#t1') is not null then
    raise exception 'FAIL C8: forced un-retire %', v_res;
  end if;
  n := n + 1;

  -- C9 duplicate ids, an unknown owner, a malformed row are refused
  v_raised := false;
  begin perform sync_practice_items(v_teacher, jsonb_build_array(v_a, v_a), false);
  exception when others then v_raised := sqlerrm like '%duplicate item_id%'; end;
  if not v_raised then raise exception 'FAIL C9a: duplicate ids'; end if;
  v_raised := false;
  begin perform sync_practice_items(gen_random_uuid(), '[]'::jsonb, false);
  exception when others then v_raised := sqlerrm like '%unknown owner%'; end;
  if not v_raised then raise exception 'FAIL C9b: unknown owner'; end if;
  v_raised := false;
  begin perform sync_practice_items(v_teacher,
    jsonb_build_array(v_a || '{"item_id": "Bad Id"}'::jsonb), true, true);
  exception when check_violation then v_raised := true; end;
  if not v_raised then raise exception 'FAIL C9c: malformed item id accepted'; end if;
  v_raised := false;
  begin perform sync_practice_items(v_teacher,
    jsonb_build_array(v_d || '{"discriminates": ["rate.unit-rate"]}'::jsonb), true, true);
  exception when check_violation then v_raised := true; end;
  if not v_raised then raise exception 'FAIL C9d: one-skill discrimination accepted'; end if;
  n := n + 1;

  -- C10 the owner purge cascades
  delete from users where id = v_teacher;
  if exists (select 1 from practice_item where owner_id = v_teacher) then
    raise exception 'FAIL C10: rows survived the owner purge';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> C-sync: %/10', n;
end
$vfy$;
