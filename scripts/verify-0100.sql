-- verify-0100.sql — clients do not write `users` (migration 0100; author
-- ruling 2026-11-20). Run with
-- `pnpm verify:auth --target live|local --only verify-0100`.
-- §A reads the catalog only; §B is a self-fixturing EXPECTED-ROLLBACK block, so
-- nothing persists (P7).

-- @section A-posture
-- @expect-rows
select 'no_update_policy_on_users',
       not exists (select 1 from pg_policy
                    where polrelid = 'public.users'::regclass and polcmd in ('w', '*')),
       'users has no UPDATE (or ALL) policy: the recursive users_update_self is gone';
select 'no_client_update_grant',
       not has_any_column_privilege('authenticated', 'public.users', 'update')
       and not has_any_column_privilege('anon', 'public.users', 'update'),
       'anon and authenticated hold no UPDATE on users at table or column level, directly or via PUBLIC';
select 'no_client_column_update_grant',
       not exists (select 1 from information_schema.column_privileges
                    where table_schema = 'public' and table_name = 'users'
                      and privilege_type = 'UPDATE' and grantee in ('anon', 'authenticated')),
       'no column-level UPDATE grant reopens a column';
select 'self_read_still_works_posture',
       has_table_privilege('authenticated', 'public.users', 'select')
       and exists (select 1 from pg_policy
                    where polrelid = 'public.users'::regclass and polname = 'users_select_self'),
       'the self-read the app relies on (SessionContext, bank, photoPilot) is untouched';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();
  v_err text;
  v_code text;
  v_n   integer;
  n     integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0100-t@vfy0100.example', '{}'::jsonb);
  update users set role = 'teacher', teacher_caps_exempt = false where id = v_t;

  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);

  -- B1 a client UPDATE of its own row is refused as a PERMISSION error, not a
  -- policy recursion, and the escalation columns did not move.
  v_err := null;
  begin
    execute 'set local role authenticated';
    update users set teacher_caps_exempt = true, display_name = 'x', deleted_at = now() where id = v_t;
  exception when others then
    v_err := sqlerrm; v_code := sqlstate;
  end;
  execute 'reset role';
  if v_code is distinct from '42501' then
    raise exception 'FAIL B1: expected 42501 permission denied, got % (%)', v_code, v_err;
  end if;
  if (select teacher_caps_exempt or deleted_at is not null from users where id = v_t) then
    raise exception 'FAIL B1: a client changed its own users row';
  end if;
  n := n + 1;

  -- B2 the self-read still returns exactly the caller's row.
  execute 'set local role authenticated';
  select count(*) into v_n from users;
  execute 'reset role';
  if v_n <> 1 then raise exception 'FAIL B2: self-read returned % rows, expected 1', v_n; end if;
  n := n + 1;

  -- B3 the definer write path still works for a client (set_my_timezone).
  execute 'set local role authenticated';
  perform set_my_timezone('Pacific/Auckland');
  execute 'reset role';
  if (select timezone from users where id = v_t) is distinct from 'Pacific/Auckland' then
    raise exception 'FAIL B3: set_my_timezone did not write through the definer path';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> verify-0100 B: % checks passed', n;
end;
$vfy$;
