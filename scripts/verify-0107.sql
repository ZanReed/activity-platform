-- verify-0107.sql — the teacher-only error log (migration 0107, review C5 slice 4,
-- docs/design/shared-data-loading.md decisions 8 and 10). Run with
-- `pnpm verify:auth --target live|local`. §A reads the catalog only; §B is a
-- self-fixturing EXPECTED-ROLLBACK block, so nothing persists (P7).

-- @section A-posture
-- @expect-rows
select 'writer_definer_signed_in_only',
       p.prosecdef
       and has_function_privilege('authenticated', p.oid, 'execute')
       and not has_function_privilege('anon', p.oid, 'execute')
       and exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'),
       'report_client_error: DEFINER, search_path pinned, signed-in only (the teacher check is inside)'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname = 'report_client_error';
select 'table_closed_to_clients',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'client_errors')
       and not has_table_privilege('authenticated', 'client_errors', 'select')
       and not has_table_privilege('authenticated', 'client_errors', 'insert')
       and not has_table_privilege('anon', 'client_errors', 'select'),
       'client_errors: RLS forced, no client grant; teachers write only through the RPC and never read';
select 'prune_dry_run_by_default_and_service_only',
       not has_function_privilege('authenticated', 'prune_client_errors(boolean)', 'execute')
       and not has_function_privilege('anon', 'prune_client_errors(boolean)', 'execute')
       and (select pg_get_function_arguments(oid) from pg_proc where proname = 'prune_client_errors')
             = 'p_dry_run boolean DEFAULT true',
       'the 30-day prune is dry-run by default and service-only';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
-- ARMED on apply (decision 10, author's yes 2026-11-27): exactly one nightly
-- job, the real run, at 03:55 UTC.
select 'prune_is_scheduled_nightly',
       (select count(*) from cron.job where command ilike '%prune_client_errors%') = 1
       and exists (select 1 from cron.job
                    where jobname = 'prune-client-errors' and schedule = '55 3 * * *'
                      and command = 'select prune_client_errors(false);' and active),
       'ARMED: one nightly job runs prune_client_errors(false) at 03:55 UTC';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();   -- a teacher
  v_s   uuid := gen_random_uuid();   -- a student
  v_r   jsonb;
  v_got text;
  i     integer;
  n     integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0107-' || o || '@vfy0107.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id = v_s;

  -- B1 a student is refused, and nothing is written
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  begin
    perform report_client_error('load_failed', '/a/x', 'abc', null, 'boom');
  exception when others then v_got := sqlerrm;
  end;
  if v_got is distinct from 'not_teacher' then raise exception 'FAIL B1: student got %', v_got; end if;
  if exists (select 1 from client_errors where teacher_id = v_s) then raise exception 'FAIL B1: a student row'; end if;
  n := n + 1;

  -- B2 a teacher's report lands with the route as a PATTERN (uuid, digits,
  -- query and hash gone) and the message cut to 300
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_r := report_client_error('load_failed',
    '/classes/0b6c1f7e-2f0c-4b8e-9a3e-5d1f2c3b4a59/progress/123456?x=1#y', 'abc123', 'classProgress', repeat('m', 400));
  if not (v_r->>'logged')::boolean or (v_r->>'repeat')::boolean then raise exception 'FAIL B2: %', v_r; end if;
  if not exists (select 1 from client_errors
                  where teacher_id = v_t and route = '/classes/:id/progress/:id' and source = 'classProgress'
                    and length(message) = 300 and build = 'abc123' and repeats = 1) then
    raise exception 'FAIL B2: row is %', (select to_jsonb(e) from client_errors e where teacher_id = v_t);
  end if;
  n := n + 1;

  -- B3 the same error again within a minute bumps repeats, adds no row
  v_r := report_client_error('load_failed',
    '/classes/0b6c1f7e-2f0c-4b8e-9a3e-5d1f2c3b4a59/progress/123456', 'abc123', 'classProgress', repeat('m', 400));
  if not (v_r->>'repeat')::boolean
     or (select count(*) from client_errors where teacher_id = v_t) <> 1
     or (select repeats from client_errors where teacher_id = v_t) <> 2 then
    raise exception 'FAIL B3: %', v_r;
  end if;
  n := n + 1;

  -- B4 a kind outside the closed list is refused
  v_got := null;
  begin
    perform report_client_error('nonsense', '/x', 'abc', null, 'm');
  exception when others then v_got := sqlerrm;
  end;
  if v_got is distinct from 'bad_kind' then raise exception 'FAIL B4: %', v_got; end if;
  n := n + 1;

  -- B5 the 21st new row in an hour writes nothing and says so
  for i in 2..20 loop
    perform report_client_error('unhandled', '/activities', 'abc', null, 'distinct ' || i);
  end loop;
  if (select count(*) from client_errors where teacher_id = v_t) <> 20 then
    raise exception 'FAIL B5: % rows before the limit', (select count(*) from client_errors where teacher_id = v_t);
  end if;
  v_r := report_client_error('unhandled', '/activities', 'abc', null, 'one too many');
  if (v_r->>'logged')::boolean or v_r->>'reason' is distinct from 'rate_limited'
     or (select count(*) from client_errors where teacher_id = v_t) <> 20 then
    raise exception 'FAIL B5: the 21st was %', v_r;
  end if;
  n := n + 1;

  -- B6 the prune: dry run counts and keeps; the real run removes only rows
  -- older than 30 days
  update client_errors set occurred_at = now() - interval '31 days'
   where teacher_id = v_t and message = 'distinct 2';
  v_r := prune_client_errors();
  if (v_r->>'dry_run')::boolean is not true or (v_r->>'errors')::int < 1
     or not exists (select 1 from client_errors where message = 'distinct 2') then
    raise exception 'FAIL B6 dry: %', v_r;
  end if;
  v_r := prune_client_errors(false);
  if exists (select 1 from client_errors where message = 'distinct 2')
     or (select count(*) from client_errors where teacher_id = v_t) <> 19 then
    raise exception 'FAIL B6 real: %', v_r;
  end if;
  n := n + 1;

  -- B7 a teacher's account purge takes their rows with it
  delete from users where id = v_t;
  if exists (select 1 from client_errors where teacher_id = v_t) then raise exception 'FAIL B7: rows outlived the teacher'; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-client-errors: %/7', n;
end
$vfy$;
