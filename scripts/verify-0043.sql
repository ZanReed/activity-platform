-- verify-0043.sql — course glossary store + RPCs (migration 0043).
--
-- Run with `pnpm verify:auth --target live|local`. §B–§E are self-fixturing
-- EXPECTED-ROLLBACK blocks (the verify-0042 idiom): real rows through the real
-- functions, claims-switched calls, everything rolled back — durable-write-free
-- on every path (P7).
--
--   §A — catalog posture: table exists, RLS forced, exactly ONE policy and it
--        is an authenticated SELECT, no client write grants, both functions
--        SECURITY DEFINER, the read RPC never cites can_read_activity (R1),
--        anon cannot execute either function, only service_role runs the sync.
--   §B — the read gate (R1): a student gets a published activity's owner
--        glossary, retired rows flagged; draft and soft-deleted activities
--        yield NULL; no claims raises; another owner's rows never appear.
--   §C — direct table reads (R7): the owner reads their own rows; another
--        teacher and a student read none; client writes are refused.
--   §D — EN-1 at scale: 1,001+ entries come back in ONE jsonb, all of them,
--        uncapped; 2,001 comes back capped at exactly 2,000.
--   §E — the sync (EN-2): dry run writes nothing, apply upserts, a missing
--        term retires (never deletes), a returning term un-retires, a no-op
--        re-import leaves updated_at alone, duplicate ids and over-cap input
--        refused, unknown owner refused; and the owner purge cascades (R8).

-- @section A-catalog-posture
-- @expect-rows
select 'glossary_table_exists',
       to_regclass('public.glossary_entry') is not null,
       'R7: the course glossary store';
select 'glossary_rls_forced',
       (select relrowsecurity and relforcerowsecurity
          from pg_class where relname = 'glossary_entry'),
       'RLS enabled AND forced';
select 'glossary_one_select_policy',
       (select count(*) = 1
               and bool_and(cmd = 'SELECT' and roles = '{authenticated}')
          from pg_policies where tablename = 'glossary_entry'),
       'the misconception_registry posture: ONE authenticated SELECT policy';
select 'glossary_no_client_writes',
       not has_table_privilege('authenticated', 'glossary_entry', 'insert')
       and not has_table_privilege('authenticated', 'glossary_entry', 'update')
       and not has_table_privilege('authenticated', 'glossary_entry', 'delete')
       and not has_table_privilege('anon', 'glossary_entry', 'select'),
       'the importer (service role) is the only writer; anon reads nothing';
select 'glossary_read_rpc_definer',
       (select prosecdef from pg_proc where proname = 'glossary_for_activity'),
       'SECURITY DEFINER: the one cross-owner read path';
select 'glossary_read_rpc_gate_not_can_read',
       (select prosrc not ilike '%can_read_activity%'
               and prosrc ilike '%status = ''published''%'
               and prosrc ilike '%deleted_at is null%'
          from pg_proc where proname = 'glossary_for_activity'),
       'R1: gated on 0017''s predicate, never the owner-only helper';
select 'glossary_read_rpc_grants',
       has_function_privilege('authenticated', 'glossary_for_activity(uuid)', 'execute')
       and not has_function_privilege('anon', 'glossary_for_activity(uuid)', 'execute'),
       'signed-in only; verify-0017''s anon roster stays at two';
select 'glossary_sync_service_only',
       has_function_privilege('service_role', 'sync_glossary_entries(uuid,jsonb,boolean)', 'execute')
       and not has_function_privilege('authenticated', 'sync_glossary_entries(uuid,jsonb,boolean)', 'execute')
       and not has_function_privilege('anon', 'sync_glossary_entries(uuid,jsonb,boolean)', 'execute'),
       'EN-2: the mirror is service-role only';
select 'glossary_owner_cascade_fk',
       (select confdeltype = 'c' from pg_constraint
         where conrelid = 'public.glossary_entry'::regclass and contype = 'f'),
       'R8: only the owner purge removes rows';

-- @section B-read-gate
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_other    uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_pub      uuid;
  v_draft    uuid;
  v_deleted  uuid;
  v_res      jsonb;
  v_raised   boolean;
  n          integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0043b-t@vfy0043.example', '{}'::jsonb),
         (v_other,   'vfy0043b-o@vfy0043.example', '{}'::jsonb),
         (v_student, 'vfy0043b-s@vfy0043.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0043b pub', 'vfy-0043b-pub', 'published') returning id into v_pub;
  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0043b draft', 'vfy-0043b-draft', 'draft') returning id into v_draft;
  insert into activities (owner_id, title, slug, status, deleted_at)
  values (v_teacher, 'vfy 0043b del', 'vfy-0043b-del', 'published', now()) returning id into v_deleted;

  insert into glossary_entry (owner_id, term_id, term, variants, body, retired_at) values
    (v_teacher, 'gradient', 'gradient', '{"us":"slope"}',
     '[{"type":"paragraph","content":[{"type":"text","text":"rise over run"}]}]', null),
    (v_teacher, 'old-term', 'old term', '{}', '[]', now()),
    (v_other,   'secret',   'secret',   '{}', '[]', null);

  -- B1 a student reads the published activity's owner glossary
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_res := glossary_for_activity(v_pub);
  if v_res is null or jsonb_array_length(v_res->'entries') <> 2 then
    raise exception 'FAIL B1: expected 2 owner entries, got %', v_res;
  end if;
  if (v_res->>'capped')::boolean then raise exception 'FAIL B1: capped on 2 rows'; end if;
  n := n + 1;

  -- B2 the entry shape is the parser's contract (term_id/term/variants/body/retired)
  if (select count(*) from jsonb_array_elements(v_res->'entries') e
       where e ? 'term_id' and e ? 'term' and e ? 'variants' and e ? 'body' and e ? 'retired') <> 2
     or (v_res->'entries'->0->'variants'->>'us') is distinct from 'slope' then
    raise exception 'FAIL B2: entry shape %', v_res->'entries';
  end if;
  n := n + 1;

  -- B3 retired rows come back FLAGGED, not dropped (published marks keep resolving)
  if (select (e->>'retired')::boolean from jsonb_array_elements(v_res->'entries') e
       where e->>'term_id' = 'old-term') is not true then
    raise exception 'FAIL B3: retired row missing or unflagged';
  end if;
  n := n + 1;

  -- B4 another owner's rows never appear
  if exists (select 1 from jsonb_array_elements(v_res->'entries') e where e->>'term_id' = 'secret') then
    raise exception 'FAIL B4: leaked another owner''s entry';
  end if;
  n := n + 1;

  -- B5/B6 draft and soft-deleted activities → NULL (the not-published signal)
  if glossary_for_activity(v_draft) is not null then raise exception 'FAIL B5: draft served'; end if;
  n := n + 1;
  if glossary_for_activity(v_deleted) is not null then raise exception 'FAIL B6: deleted served'; end if;
  n := n + 1;

  -- B7 an unknown id → NULL, not an error
  if glossary_for_activity(gen_random_uuid()) is not null then raise exception 'FAIL B7'; end if;
  n := n + 1;

  -- B8 no claims → Not authorized
  perform set_config('request.jwt.claims', '', true);
  v_raised := false;
  begin
    perform glossary_for_activity(v_pub);
  exception when others then
    v_raised := sqlerrm = 'Not authorized';
  end;
  if not v_raised then raise exception 'FAIL B8: anonymous call was not refused'; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-read-gate: %/8', n;
end
$vfy$;

-- @section C-direct-table-reads
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_other   uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_count   integer;
  v_raised  boolean;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0043c-t@vfy0043.example', '{}'::jsonb),
         (v_other,   'vfy0043c-o@vfy0043.example', '{}'::jsonb),
         (v_student, 'vfy0043c-s@vfy0043.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = v_student;
  insert into glossary_entry (owner_id, term_id, term, body)
  values (v_teacher, 'a', 'a', '[]'), (v_teacher, 'b', 'b', '[]');

  execute 'set local role authenticated';

  -- C1 the owner reads their own rows
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  select count(*) into v_count from glossary_entry;
  if v_count <> 2 then raise exception 'FAIL C1: owner read % rows', v_count; end if;
  n := n + 1;

  -- C2 another teacher reads none
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  select count(*) into v_count from glossary_entry;
  if v_count <> 0 then raise exception 'FAIL C2: other teacher read % rows', v_count; end if;
  n := n + 1;

  -- C3 a student reads none (the RPC is their only path)
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  select count(*) into v_count from glossary_entry;
  if v_count <> 0 then raise exception 'FAIL C3: student read % rows', v_count; end if;
  n := n + 1;

  -- C4 the owner cannot write, even their own rows
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_raised := false;
  begin
    insert into glossary_entry (owner_id, term_id, term, body) values (v_teacher, 'c', 'c', '[]');
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL C4: client insert allowed'; end if;
  n := n + 1;

  v_raised := false;
  begin
    update glossary_entry set term = 'x' where owner_id = v_teacher;
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL C5: client update allowed'; end if;
  n := n + 1;

  -- C6 a signed-in client cannot run the sync
  v_raised := false;
  begin
    perform sync_glossary_entries(v_teacher, '[]'::jsonb, true);
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL C6: authenticated ran the sync'; end if;
  n := n + 1;

  execute 'reset role';
  raise exception 'EXPECTED ROLLBACK >>> C-direct-table-reads: %/6', n;
end
$vfy$;

-- @section D-single-jsonb-at-scale
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_pub     uuid;
  v_res     jsonb;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0043d-t@vfy0043.example', '{}'::jsonb),
         (v_student, 'vfy0043d-s@vfy0043.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id = v_student;
  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0043d', 'vfy-0043d', 'published') returning id into v_pub;

  insert into glossary_entry (owner_id, term_id, term, body)
  select v_teacher, 't' || lpad(i::text, 5, '0'), 'term ' || lpad(i::text, 5, '0'), '[]'
  from generate_series(1, 1500) i;

  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);

  -- D1 1,500 entries (> PostgREST's 1,000-row default) all come back, uncapped
  v_res := glossary_for_activity(v_pub);
  if jsonb_array_length(v_res->'entries') <> 1500 or (v_res->>'capped')::boolean then
    raise exception 'FAIL D1: got % entries, capped=%',
      jsonb_array_length(v_res->'entries'), v_res->>'capped';
  end if;
  n := n + 1;

  -- D2 2,001 entries → exactly 2,000 returned and capped=true (the cap is said out loud)
  insert into glossary_entry (owner_id, term_id, term, body)
  select v_teacher, 'u' || lpad(i::text, 5, '0'), 'uterm ' || lpad(i::text, 5, '0'), '[]'
  from generate_series(1, 501) i;
  v_res := glossary_for_activity(v_pub);
  if jsonb_array_length(v_res->'entries') <> 2000 or not (v_res->>'capped')::boolean then
    raise exception 'FAIL D2: got % entries, capped=%',
      jsonb_array_length(v_res->'entries'), v_res->>'capped';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> D-single-jsonb-at-scale: %/2', n;
end
$vfy$;

-- @section E-sync-and-cascade
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_res     jsonb;
  v_stamp   timestamptz;
  v_raised  boolean;
  n         integer := 0;
  v_body    jsonb := '[{"type":"paragraph","content":[{"type":"text","text":"x"}]}]';
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0043e-t@vfy0043.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;

  -- E1 dry run reports and writes nothing
  v_res := sync_glossary_entries(v_teacher, jsonb_build_array(
    jsonb_build_object('term_id', 'a', 'term', 'alpha', 'body', v_body),
    jsonb_build_object('term_id', 'b', 'term', 'beta',  'body', v_body, 'variants', '{"us":"bee"}'::jsonb)),
    false);
  if v_res->'new' <> '["a","b"]'::jsonb or (v_res->>'applied')::boolean then
    raise exception 'FAIL E1: dry-run report %', v_res;
  end if;
  if exists (select 1 from glossary_entry where owner_id = v_teacher) then
    raise exception 'FAIL E1: dry run wrote rows';
  end if;
  n := n + 1;

  -- E2 apply writes both
  v_res := sync_glossary_entries(v_teacher, jsonb_build_array(
    jsonb_build_object('term_id', 'a', 'term', 'alpha', 'body', v_body),
    jsonb_build_object('term_id', 'b', 'term', 'beta',  'body', v_body, 'variants', '{"us":"bee"}'::jsonb)),
    true);
  if (select count(*) from glossary_entry where owner_id = v_teacher and retired_at is null) <> 2
     or (select variants->>'us' from glossary_entry where owner_id = v_teacher and term_id = 'b') <> 'bee' then
    raise exception 'FAIL E2: apply did not write';
  end if;
  n := n + 1;

  -- E3 a no-op re-import changes nothing and leaves updated_at alone
  update glossary_entry set updated_at = '2020-01-01' where owner_id = v_teacher;
  v_res := sync_glossary_entries(v_teacher, jsonb_build_array(
    jsonb_build_object('term_id', 'a', 'term', 'alpha', 'body', v_body),
    jsonb_build_object('term_id', 'b', 'term', 'beta',  'body', v_body, 'variants', '{"us":"bee"}'::jsonb)),
    true);
  if v_res->'changed' <> '[]'::jsonb or v_res->'new' <> '[]'::jsonb
     or exists (select 1 from glossary_entry where owner_id = v_teacher and updated_at <> '2020-01-01') then
    raise exception 'FAIL E3: no-op re-import moved something %', v_res;
  end if;
  n := n + 1;

  -- E4 dropping b RETIRES it (row kept), changing a reports + stamps it
  v_res := sync_glossary_entries(v_teacher, jsonb_build_array(
    jsonb_build_object('term_id', 'a', 'term', 'Alpha', 'body', v_body)), true);
  if v_res->'retired' <> '["b"]'::jsonb or v_res->'changed' <> '["a"]'::jsonb
     or (v_res->>'active_before')::int <> 2 then
    raise exception 'FAIL E4: report %', v_res;
  end if;
  if (select retired_at from glossary_entry where owner_id = v_teacher and term_id = 'b') is null then
    raise exception 'FAIL E4: b not retired (or deleted)';
  end if;
  if (select updated_at from glossary_entry where owner_id = v_teacher and term_id = 'a') = '2020-01-01' then
    raise exception 'FAIL E4: changed row kept its old updated_at';
  end if;
  n := n + 1;

  -- E5 b returns → un-retired
  v_res := sync_glossary_entries(v_teacher, jsonb_build_array(
    jsonb_build_object('term_id', 'a', 'term', 'Alpha', 'body', v_body),
    jsonb_build_object('term_id', 'b', 'term', 'beta',  'body', v_body, 'variants', '{"us":"bee"}'::jsonb)),
    true);
  if v_res->'unretired' <> '["b"]'::jsonb
     or (select retired_at from glossary_entry where owner_id = v_teacher and term_id = 'b') is not null then
    raise exception 'FAIL E5: un-retire %', v_res;
  end if;
  n := n + 1;

  -- E6 the dry run of a retire writes nothing either
  v_res := sync_glossary_entries(v_teacher, '[]'::jsonb, false);
  if v_res->'retired' <> '["a","b"]'::jsonb
     or exists (select 1 from glossary_entry where owner_id = v_teacher and retired_at is not null) then
    raise exception 'FAIL E6: dry-run retire %', v_res;
  end if;
  n := n + 1;

  -- E7 duplicate term_id refused
  v_raised := false;
  begin
    perform sync_glossary_entries(v_teacher, jsonb_build_array(
      jsonb_build_object('term_id', 'a', 'term', 'a', 'body', v_body),
      jsonb_build_object('term_id', 'a', 'term', 'a', 'body', v_body)), false);
  exception when others then v_raised := sqlerrm ilike '%duplicate term_id%';
  end;
  if not v_raised then raise exception 'FAIL E7: duplicate accepted'; end if;
  n := n + 1;

  -- E8 over the 2,000 cap refused
  v_raised := false;
  begin
    perform sync_glossary_entries(v_teacher,
      (select jsonb_agg(jsonb_build_object('term_id', 'x' || i, 'term', 'x', 'body', v_body))
         from generate_series(1, 2001) i), false);
  exception when others then v_raised := sqlerrm ilike '%2000-entry cap%';
  end;
  if not v_raised then raise exception 'FAIL E8: over-cap accepted'; end if;
  n := n + 1;

  -- E9 unknown owner refused
  v_raised := false;
  begin
    perform sync_glossary_entries(gen_random_uuid(), '[]'::jsonb, false);
  exception when others then v_raised := sqlerrm ilike '%unknown owner%';
  end;
  if not v_raised then raise exception 'FAIL E9: unknown owner accepted'; end if;
  n := n + 1;

  -- E10 the owner purge cascades (R8: the only way a row leaves)
  delete from auth.users where id = v_teacher;
  if exists (select 1 from glossary_entry where owner_id = v_teacher) then
    raise exception 'FAIL E10: owner purge left glossary rows';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> E-sync-and-cascade: %/10', n;
end
$vfy$;
