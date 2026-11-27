-- verify-0110.sql — activities.updated_at on the server's clock (migration
-- 0110, review 2026-11-26 C10). Run with `pnpm verify:auth --target live|local`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block.

-- @section A-posture
-- @expect-rows
select 'stamp_trigger_on_insert_and_update',
       exists (select 1 from pg_trigger t
                where t.tgrelid = 'public.activities'::regclass
                  and t.tgname = 'activities_updated_at'
                  and not t.tgisinternal
                  and t.tgenabled = 'O'
                  and pg_get_triggerdef(t.oid) like '%BEFORE INSERT OR UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION set_activities_updated_at()%'),
       'activities_updated_at: BEFORE INSERT OR UPDATE, each row, enabled';
select 'stamp_function_pinned_not_client_callable',
       exists (select 1 from pg_proc p
                where p.proname = 'set_activities_updated_at'
                  and not p.prosecdef
                  and exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')
                  and not has_function_privilege('authenticated', p.oid, 'execute')
                  and not has_function_privilege('anon', p.oid, 'execute')),
       'set_activities_updated_at: invoker, search_path pinned, no client EXECUTE';

-- @section B-behavioral
-- @local-only (builds a teacher and an activity)
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t  uuid := gen_random_uuid();
  v_a  uuid;
  v_at timestamptz;
  v_n  integer;
  n    integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0110-t@vfy0110.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_t;

  -- B1 an INSERT naming its own time gets the server's
  insert into activities (owner_id, title, slug, status, updated_at)
  values (v_t, 'A', 'vfy-0110-a', 'draft', '2000-01-01') returning id, updated_at into v_a, v_at;
  if v_at <> now() then raise exception 'FAIL B1: insert kept %', v_at; end if;
  n := n + 1;

  -- An old stamp to move from (triggers off for this one statement only).
  set local session_replication_role = replica;
  update activities set updated_at = '2001-01-01' where id = v_a;
  set local session_replication_role = origin;

  -- B2 an update that leaves updated_at alone keeps it (minutes, PP-5; a file move)
  update activities set minutes = 20, source_path = 'vfy/0110.md' where id = v_a returning updated_at into v_at;
  if v_at <> '2001-01-01' then raise exception 'FAIL B2: a minutes-only write moved the clock to %', v_at; end if;
  n := n + 1;

  -- B3 an update that sets ANY value gets now(): a browser a century fast too
  update activities set title = 'B', updated_at = '2999-01-01' where id = v_a returning updated_at into v_at;
  if v_at <> now() then raise exception 'FAIL B3: the client''s clock stuck: %', v_at; end if;
  n := n + 1;

  -- B4 the editor's G-8 pattern, as the teacher: a guarded write over the
  -- token lands and returns the SERVER's stamp; a stale token writes nothing
  set local session_replication_role = replica;
  update activities set updated_at = '2002-02-02' where id = v_a;
  set local session_replication_role = origin;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  update activities set title = 'C', updated_at = '1999-09-09'
   where id = v_a and updated_at = '2002-02-02' returning updated_at into v_at;
  if v_at is distinct from now() then raise exception 'FAIL B4: guarded write returned %', v_at; end if;
  update activities set title = 'D', updated_at = '1999-09-09'
   where id = v_a and updated_at = '2002-02-02';
  get diagnostics v_n = row_count;
  if v_n <> 0 then raise exception 'FAIL B4: a stale token wrote % rows', v_n; end if;
  execute 'reset role';
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-updated-at-stamp: %/4', n;
end
$vfy$;
