-- verify-0057.sql — chain hooks: store, sync, the one teacher read, class
-- marks, and the copy-provenance guard (migration 0057;
-- docs/design/chain-hooks-view.md).
--
-- Run with `pnpm verify:auth --target live|local`. §B–§E are self-fixturing
-- EXPECTED-ROLLBACK blocks (the verify-0043 idiom): real rows through the real
-- functions, claims-switched calls as the `authenticated` role, everything
-- rolled back. Durable-write-free on every path (P7).
--
--   §A — catalog posture: both tables exist with RLS forced; chain_hook has NO
--        policy and NO client privilege (D1); class_hook_use has exactly four
--        authenticated policies; both functions SECURITY DEFINER with a pinned
--        search_path; only service_role runs the sync; anon runs neither; the
--        provenance trigger is attached to activities.
--   §B — the sync (CH-3, CH-5): dry run writes nothing; apply upserts in pool
--        order; a missing hook retires (never deletes); a returning hook
--        un-retires; a no-op re-import leaves updated_at alone; duplicate ids
--        and an unknown owner are refused; the owner purge cascades.
--   §C — the read gate (D1, D2, D4, own-wins): owner reads their pool; a
--        copier reads the original's; the copier KEEPS it after the original
--        is soft-deleted; a hand-set source_path with no own pool reads
--        nothing; a teacher with no activity in the chain reads nothing; a
--        student reads nothing; retired hooks are excluded; the caller's own
--        pool wins over a copy's; no claims raises.
--   §D — marks RLS (CH-9): the class teacher marks, edits the date (one row),
--        and unmarks; marked_by must be the caller; another teacher and a
--        student read nothing and cannot write.
--   §E — the provenance guard (D4): a client INSERT carrying
--        copied_from_activity_id is refused; a client UPDATE changing it is
--        refused; the real copy_bank_activity still copies.

-- @section A-catalog-posture
-- @expect-rows
select 'hooks_tables_exist',
       to_regclass('public.chain_hook') is not null
       and to_regclass('public.class_hook_use') is not null,
       'chain_hook + class_hook_use';
select 'hooks_rls_forced',
       (select bool_and(relrowsecurity and relforcerowsecurity)
          from pg_class where relname in ('chain_hook', 'class_hook_use')),
       'RLS enabled AND forced on both';
select 'chain_hook_no_policy_no_client_grant',
       (select count(*) = 0 from pg_policies where tablename = 'chain_hook')
       and not has_table_privilege('authenticated', 'chain_hook', 'select')
       and not has_table_privilege('authenticated', 'chain_hook', 'insert')
       and not has_table_privilege('anon', 'chain_hook', 'select'),
       'D1: one read path, my_chain_hooks';
select 'class_hook_use_four_policies',
       (select count(*) = 4 and bool_and(roles = '{authenticated}')
          from pg_policies where tablename = 'class_hook_use')
       and not has_table_privilege('anon', 'class_hook_use', 'select'),
       'select/insert/update/delete, authenticated only';
select 'hooks_functions_definer_pinned',
       (select count(*) = 2
               and bool_and(p.prosecdef and p.proconfig @> array['search_path=public'])
          from pg_proc p where p.proname in ('my_chain_hooks', 'sync_chain_hooks')),
       'both SECURITY DEFINER, search_path pinned';
select 'sync_service_only',
       (select not has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
               and has_function_privilege('service_role', p.oid, 'execute')
          from pg_proc p where p.proname = 'sync_chain_hooks'),
       'the importer is the store''s sole writer';
select 'read_rpc_signed_in_only',
       (select has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
          from pg_proc p where p.proname = 'my_chain_hooks'),
       'anon cannot execute';
select 'provenance_trigger_attached',
       (select count(*) = 1 from pg_trigger t
          join pg_class c on c.oid = t.tgrelid
         where c.relname = 'activities' and t.tgname = 'activities_provenance_guard'
           and not t.tgisinternal),
       'D4 guard on activities';

-- @section B-sync
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_owner uuid := gen_random_uuid();
  v_hooks jsonb := '[
    {"hook_id":"hook.vfy.one","chain_id":"chain.vfy.x","position":0,"connects_to":[{"id":"vfy.skill","label":"A skill"}],"prompt":"P1 costs $4","note":"N1"},
    {"hook_id":"hook.vfy.two","chain_id":"chain.vfy.x","position":1,"connects_to":[],"prompt":"P2","note":"N2"}
  ]'::jsonb;
  v_r jsonb;
  v_n integer;
  v_t timestamptz;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_owner, 'vfy0057-b@vfy0057.example', '{}'::jsonb);

  -- B1: dry run writes nothing and reports two new.
  v_r := sync_chain_hooks(v_owner, v_hooks, false);
  if (select count(*) from chain_hook where owner_id = v_owner) <> 0
     or jsonb_array_length(v_r->'new') is distinct from 2 or (v_r->>'applied')::boolean is distinct from false then
    raise exception 'FAIL B1: dry run %', v_r;
  end if;

  -- B2: apply upserts in pool order.
  v_r := sync_chain_hooks(v_owner, v_hooks, true);
  if (select array_agg(hook_id order by position) from chain_hook where owner_id = v_owner)
     is distinct from array['hook.vfy.one', 'hook.vfy.two'] then
    raise exception 'FAIL B2: apply';
  end if;

  -- B3: a no-op re-import leaves updated_at alone and reports nothing changed.
  select updated_at into v_t from chain_hook where owner_id = v_owner and hook_id = 'hook.vfy.one';
  perform pg_sleep(0.01);
  v_r := sync_chain_hooks(v_owner, v_hooks, true);
  if jsonb_array_length(v_r->'changed') is distinct from 0
     or (select updated_at from chain_hook where owner_id = v_owner and hook_id = 'hook.vfy.one') is distinct from v_t then
    raise exception 'FAIL B3: no-op re-import moved something %', v_r;
  end if;

  -- B4: a missing hook RETIRES (row kept).
  v_r := sync_chain_hooks(v_owner, jsonb_build_array(v_hooks->0), true);
  if (v_r->'retired') is distinct from '["hook.vfy.two"]'::jsonb
     or (select retired_at from chain_hook where owner_id = v_owner and hook_id = 'hook.vfy.two') is null then
    raise exception 'FAIL B4: retire %', v_r;
  end if;

  -- B5: a returning hook UN-RETIRES.
  v_r := sync_chain_hooks(v_owner, v_hooks, true);
  if (v_r->'unretired') is distinct from '["hook.vfy.two"]'::jsonb
     or (select retired_at from chain_hook where owner_id = v_owner and hook_id = 'hook.vfy.two') is not null then
    raise exception 'FAIL B5: un-retire %', v_r;
  end if;

  -- B6: duplicate ids and an unknown owner are refused.
  begin
    perform sync_chain_hooks(v_owner, v_hooks || jsonb_build_array(v_hooks->0), false);
    raise exception 'FAIL B6a: duplicate accepted';
  exception when others then
    if sqlerrm not like '%duplicate hook_id%' then raise; end if;
  end;
  begin
    perform sync_chain_hooks(gen_random_uuid(), v_hooks, false);
    raise exception 'FAIL B6b: unknown owner accepted';
  exception when others then
    if sqlerrm not like '%unknown owner%' then raise; end if;
  end;

  -- B7: the owner purge cascades.
  delete from auth.users where id = v_owner;
  select count(*) into v_n from chain_hook where owner_id = v_owner;
  if v_n <> 0 then raise exception 'FAIL B7: % rows survived the owner delete', v_n; end if;

  raise exception 'EXPECTED ROLLBACK >>> B-sync: 7/7';
end
$vfy$;

-- @section C-read-gate
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_author  uuid := gen_random_uuid();
  v_copier  uuid := gen_random_uuid();
  v_forger  uuid := gen_random_uuid();
  v_nobody  uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_doc     jsonb := '{"schemaVersion":2,"meta":{"title":"vfy","activityType":"worksheet"},"sections":[]}'::jsonb;
  v_orig    uuid;
  v_copy    uuid;
  v_own     uuid;
  v_forged  uuid;
  v_r       jsonb;
  v_raised  boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    (v_author,  'vfy0057-c1@vfy0057.example', '{}'::jsonb),
    (v_copier,  'vfy0057-c2@vfy0057.example', '{}'::jsonb),
    (v_forger,  'vfy0057-c3@vfy0057.example', '{}'::jsonb),
    (v_nobody,  'vfy0057-c4@vfy0057.example', '{}'::jsonb),
    (v_student, 'vfy0057-c5@vfy0057.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_author, v_copier, v_forger, v_nobody);
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, draft_content, source_path)
  values (v_author, 'orig', 'vfy0057-orig', v_doc, '713-chain.vfy.x/01.md')
  returning id into v_orig;
  -- The copy, inserted as the migration owner (the copy_bank_activity stand-in;
  -- §E proves the real RPC path).
  insert into activities (owner_id, title, slug, draft_content, copied_from_activity_id)
  values (v_copier, 'copy', 'vfy0057-copy', v_doc, v_orig)
  returning id into v_copy;
  insert into activities (owner_id, title, slug, draft_content, source_path)
  values (v_forger, 'forged', 'vfy0057-forged', v_doc, '713-chain.vfy.x/99.md')
  returning id into v_forged;

  perform sync_chain_hooks(v_author, '[
    {"hook_id":"hook.vfy.a","chain_id":"chain.vfy.x","position":0,"connects_to":[],"prompt":"Author A","note":"Note A"},
    {"hook_id":"hook.vfy.b","chain_id":"chain.vfy.x","position":1,"connects_to":[],"prompt":"Author B","note":"Note B"},
    {"hook_id":"hook.vfy.gone","chain_id":"chain.vfy.x","position":2,"connects_to":[],"prompt":"Gone","note":"Gone"}
  ]'::jsonb, true);
  perform sync_chain_hooks(v_author, '[
    {"hook_id":"hook.vfy.a","chain_id":"chain.vfy.x","position":0,"connects_to":[],"prompt":"Author A","note":"Note A"},
    {"hook_id":"hook.vfy.b","chain_id":"chain.vfy.x","position":1,"connects_to":[],"prompt":"Author B","note":"Note B"}
  ]'::jsonb, true);  -- retires hook.vfy.gone

  -- C1: the owner reads their pool, in order, retired excluded (C6).
  perform set_config('request.jwt.claims', json_build_object('sub', v_author, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_r := my_chain_hooks();
  execute 'reset role';
  if v_r->'activityChains'->>v_orig::text is distinct from 'chain.vfy.x'
     or jsonb_array_length(v_r->'chains'->'chain.vfy.x') is distinct from 2
     or v_r->'chains'->'chain.vfy.x'->0->>'id' is distinct from 'hook.vfy.a' then
    raise exception 'FAIL C1/C6: owner read %', v_r;
  end if;

  -- C2: the copier reads the original's pool through the copy.
  perform set_config('request.jwt.claims', json_build_object('sub', v_copier, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_r := my_chain_hooks();
  execute 'reset role';
  if v_r->'activityChains'->>v_copy::text is distinct from 'chain.vfy.x'
     or v_r->'chains'->'chain.vfy.x'->0->>'prompt' is distinct from 'Author A' then
    raise exception 'FAIL C2: copier read %', v_r;
  end if;

  -- C3 (D2): the copier KEEPS the pool after the original is soft-deleted.
  update activities set deleted_at = now() where id = v_orig;
  execute 'set local role authenticated';
  v_r := my_chain_hooks();
  execute 'reset role';
  if jsonb_array_length(coalesce(v_r->'chains'->'chain.vfy.x', '[]'::jsonb)) <> 2 then
    raise exception 'FAIL C3: soft-deleted original dropped the copier''s pool %', v_r;
  end if;

  -- C7: own pool wins over the copy's.
  insert into activities (owner_id, title, slug, draft_content, source_path)
  values (v_copier, 'own', 'vfy0057-own', v_doc, '713-chain.vfy.x/02.md')
  returning id into v_own;
  perform sync_chain_hooks(v_copier, '[
    {"hook_id":"hook.vfy.mine","chain_id":"chain.vfy.x","position":0,"connects_to":[],"prompt":"Copier own","note":"Mine"}
  ]'::jsonb, true);
  execute 'set local role authenticated';
  v_r := my_chain_hooks();
  execute 'reset role';
  if jsonb_array_length(v_r->'chains'->'chain.vfy.x') is distinct from 1
     or v_r->'chains'->'chain.vfy.x'->0->>'prompt' is distinct from 'Copier own' then
    raise exception 'FAIL C7: own pool did not win %', v_r;
  end if;

  -- C4: a hand-set source_path with no own pool reads nothing.
  perform set_config('request.jwt.claims', json_build_object('sub', v_forger, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_r := my_chain_hooks();
  execute 'reset role';
  if v_r->'activityChains'->>v_forged::text is distinct from 'chain.vfy.x' or v_r->'chains' is distinct from '{}'::jsonb then
    raise exception 'FAIL C4: hand-set source_path read another owner''s pool %', v_r;
  end if;

  -- C5: a teacher with no activity in the chain reads nothing; so does a student.
  perform set_config('request.jwt.claims', json_build_object('sub', v_nobody, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_r := my_chain_hooks();
  execute 'reset role';
  if v_r is distinct from '{"activityChains":{},"chains":{}}'::jsonb then
    raise exception 'FAIL C5a: no-activity teacher read %', v_r;
  end if;
  -- C5b: a student reads nothing EVEN WITH a planted owned row in the chain,
  -- plus their own synced pool (0013 stops a student inserting one; this row is
  -- planted as the migration owner so the teacher gate itself is what's tested).
  insert into activities (owner_id, title, slug, draft_content, source_path)
  values (v_student, 'planted', 'vfy0057-planted', v_doc, '713-chain.vfy.x/03.md');
  perform sync_chain_hooks(v_student, '[
    {"hook_id":"hook.vfy.planted","chain_id":"chain.vfy.x","position":0,"connects_to":[],"prompt":"Planted","note":"Planted"}
  ]'::jsonb, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_r := my_chain_hooks();
  execute 'reset role';
  if v_r is distinct from '{"activityChains":{},"chains":{}}'::jsonb then
    raise exception 'FAIL C5b: student read %', v_r;
  end if;

  -- C8: no claims raises.
  perform set_config('request.jwt.claims', '', true);
  v_raised := false;
  begin
    perform my_chain_hooks();
  exception when others then
    v_raised := sqlerrm like '%Not authorized%';
  end;
  if not v_raised then raise exception 'FAIL C8: no-claims call did not raise'; end if;

  raise exception 'EXPECTED ROLLBACK >>> C-read-gate: 8/8';
end
$vfy$;

-- @section D-marks-rls
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_other   uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_class   uuid;
  v_n       integer;
  v_refused boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    (v_teacher, 'vfy0057-d1@vfy0057.example', '{}'::jsonb),
    (v_other,   'vfy0057-d2@vfy0057.example', '{}'::jsonb),
    (v_student, 'vfy0057-d3@vfy0057.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = v_student;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy0057 class', v_teacher, 'vfy')
  returning id into v_class;

  -- D1: the class teacher marks a hook used.
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into class_hook_use (class_id, hook_id, used_on, marked_by)
  values (v_class, 'hook.vfy.a', date '2026-02-12', v_teacher);

  -- D2: editing the date keeps ONE row (the PostgREST upsert path).
  insert into class_hook_use (class_id, hook_id, used_on, marked_by)
  values (v_class, 'hook.vfy.a', date '2026-02-11', v_teacher)
  on conflict (class_id, hook_id) do update
    set used_on = excluded.used_on, marked_by = excluded.marked_by, updated_at = now();
  select count(*) into v_n from class_hook_use where class_id = v_class;
  if v_n <> 1 or (select used_on from class_hook_use where class_id = v_class) is distinct from date '2026-02-11' then
    raise exception 'FAIL D2: date edit rows=%', v_n;
  end if;

  -- D3: marked_by must be the caller.
  begin
    insert into class_hook_use (class_id, hook_id, used_on, marked_by)
    values (v_class, 'hook.vfy.b', current_date, v_other);
    v_refused := false;
  exception when others then v_refused := true;
  end;
  if not v_refused then raise exception 'FAIL D3: marked_by forged'; end if;
  execute 'reset role';

  -- D4: another teacher reads nothing, cannot insert, cannot delete.
  perform set_config('request.jwt.claims', json_build_object('sub', v_other, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from class_hook_use where class_id = v_class;
  if v_n <> 0 then raise exception 'FAIL D4a: other teacher read % marks', v_n; end if;
  begin
    insert into class_hook_use (class_id, hook_id, used_on, marked_by)
    values (v_class, 'hook.vfy.b', current_date, v_other);
    v_refused := false;
  exception when others then v_refused := true;
  end;
  if not v_refused then raise exception 'FAIL D4b: other teacher wrote a mark'; end if;
  delete from class_hook_use where class_id = v_class;
  execute 'reset role';
  if (select count(*) from class_hook_use where class_id = v_class) <> 1 then
    raise exception 'FAIL D4c: other teacher deleted a mark';
  end if;

  -- D5: a student reads nothing.
  perform set_config('request.jwt.claims', json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from class_hook_use where class_id = v_class;
  execute 'reset role';
  if v_n <> 0 then raise exception 'FAIL D5: student read % marks', v_n; end if;

  -- D6: the class teacher unmarks: the row is gone.
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  delete from class_hook_use where class_id = v_class and hook_id = 'hook.vfy.a';
  execute 'reset role';
  if (select count(*) from class_hook_use where class_id = v_class) <> 0 then
    raise exception 'FAIL D6: unmark left a row';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> D-marks-rls: 6/6';
end
$vfy$;

-- @section E-provenance-guard
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_author  uuid := gen_random_uuid();
  v_teacher uuid := gen_random_uuid();
  v_doc     jsonb := '{"schemaVersion":2,"meta":{"title":"vfy","activityType":"worksheet"},"sections":[]}'::jsonb;
  v_orig    uuid;
  v_mine    uuid;
  v_copy    uuid;
  v_refused boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    (v_author,  'vfy0057-e1@vfy0057.example', '{}'::jsonb),
    (v_teacher, 'vfy0057-e2@vfy0057.example', '{}'::jsonb);
  update users set role = 'teacher', teacher_caps_exempt = true where id = v_author;
  update users set role = 'teacher' where id = v_teacher;

  perform set_config('request.jwt.claims', json_build_object('sub', v_author, 'role', 'authenticated')::text, true);
  insert into activities (owner_id, title, slug, draft_content, source_path)
  values (v_author, 'orig', 'vfy0057-e-orig', v_doc, '713-chain.vfy.x/01.md')
  returning id into v_orig;
  perform publish_activity(v_orig);
  perform set_activity_listing(v_orig, true);

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  -- E1: a client INSERT carrying copied_from_activity_id is refused.
  begin
    insert into activities (owner_id, title, slug, draft_content, copied_from_activity_id)
    values (v_teacher, 'forged', 'vfy0057-e-forged', v_doc, v_orig);
    v_refused := false;
  exception when others then
    v_refused := sqlerrm like '%not client-writable%';
  end;
  if not v_refused then raise exception 'FAIL E1: forged insert accepted'; end if;

  -- E2: a client UPDATE that sets it on an owned row is refused.
  insert into activities (owner_id, title, slug, draft_content)
  values (v_teacher, 'mine', 'vfy0057-e-mine', v_doc)
  returning id into v_mine;
  begin
    update activities set copied_from_activity_id = v_orig where id = v_mine;
    v_refused := false;
  exception when others then
    v_refused := sqlerrm like '%not client-writable%';
  end;
  if not v_refused then raise exception 'FAIL E2: forged update accepted'; end if;

  -- E3: an ordinary client update of an owned row still works.
  update activities set title = 'mine renamed' where id = v_mine;

  -- E4: the real copy path still copies (definer), provenance set.
  v_copy := copy_bank_activity(v_orig);
  execute 'reset role';
  if (select copied_from_activity_id from activities where id = v_copy) is distinct from v_orig then
    raise exception 'FAIL E4: copy_bank_activity did not record provenance';
  end if;
  if (select title from activities where id = v_mine) is distinct from 'mine renamed' then
    raise exception 'FAIL E3: ordinary update refused';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> E-provenance-guard: 4/4';
end
$vfy$;
