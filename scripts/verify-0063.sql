-- verify-0063.sql — the timezone-name lookup (migration 0063;
-- docs/reviews/2026-10-18-live-perf-baseline.md §1).
--
-- Run with `pnpm verify:auth --target live|local`. §C is a self-fixturing
-- EXPECTED-ROLLBACK block. Durable-write-free (P7).
-- ⚠ ALSO RE-RUN verify-0036 (the guard + the rollup) and verify-0050/0051
-- (fact_class_zone's callers): 0063 re-creates all three functions.
--
--   §A — catalog posture: the table is RLS-forced with no policies and no
--        client privileges; the lookup is SECURITY DEFINER with a pinned
--        search_path, callable by authenticated (the invoker guard needs it),
--        not by anon; the three callers no longer read pg_timezone_names
--        except through the lookup.
--   §B — same answers as before: the table holds every name pg_timezone_names
--        lists (goes red after a tzdata update adds a zone — re-run 0063 §A's
--        insert), and the lookup agrees with the old check on names, non-names,
--        an abbreviation-style string and NULL.
--   §C — speed and the real write path: 200 lookups of a held name finish in
--        well under the cost of ONE old check; an invalid zone is still refused
--        with the old message; a signed-in teacher with a zone saves their
--        public name (the app's users write, through the guard) in < 200 ms.

-- @section A-catalog-posture
-- @expect-rows
select 'table_rls_forced_no_policies',
       (select c.relrowsecurity and c.relforcerowsecurity
          from pg_class c where c.oid = 'public.iana_zone_names'::regclass)
       and not exists (select 1 from pg_policies
                        where schemaname = 'public' and tablename = 'iana_zone_names'),
       'RLS enabled + forced, no policies';
select 'table_no_client_privileges',
       not has_table_privilege('anon', 'public.iana_zone_names', 'select')
       and not has_table_privilege('authenticated', 'public.iana_zone_names', 'select'),
       'anon and authenticated cannot read the table directly';
select 'lookup_definer_pinned',
       (select p.prosecdef and p.proconfig @> array['search_path=public']
          from pg_proc p where p.proname = 'iana_zone_is_valid'),
       'SECURITY DEFINER, search_path pinned';
select 'lookup_grants',
       (select has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
          from pg_proc p where p.proname = 'iana_zone_is_valid'),
       'authenticated may call, anon may not';
select 'callers_use_lookup',
       (select count(*) = 3
               and bool_and(p.prosrc ilike '%iana_zone_is_valid%'
                            and p.prosrc not ilike '%pg_timezone_names%')
          from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public'
           and p.proname in ('fact_class_zone', 'users_timezone_guard',
                             'recompute_check_rollup_days')),
       'all three callers go through the lookup, none scans pg_timezone_names';
select 'guard_still_invoker',
       (select not p.prosecdef from pg_proc p where p.proname = 'users_timezone_guard'),
       'users_timezone_guard stays SECURITY INVOKER (its current_user check needs it)';

-- @section B-same-answers
-- @expect-rows
select 'zone_table_complete',
       not exists (select 1 from pg_timezone_names z
                    where not exists (select 1 from iana_zone_names t where t.name = z.name)),
       'every name pg_timezone_names lists is in the table (red = tzdata moved; re-run 0063 §A insert)';
select 'lookup_agrees_with_old_check',
       bool_and(iana_zone_is_valid(v.s)
                = exists (select 1 from pg_timezone_names z where z.name = v.s)),
       'names, non-names, POSIX and case variants answer exactly as before'
  from (values ('Pacific/Auckland'), ('America/Chicago'), ('UTC'), ('EST'),
               ('Not/AZone'), ('UTC+5'), ('pacific/auckland'), ('')) v(s);
select 'lookup_null_is_false',
       iana_zone_is_valid(null) is false,
       'NULL answers false (and without the scan)';

-- @section C-speed-and-client-path
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();
  v_t0  timestamptz;
  v_ms  numeric;
  v_ok  boolean;
begin
  -- C1: 200 held-name lookups. The old check cost ~820 ms EACH on the live
  -- instance; 200 lookups under 200 ms is a margin of three orders.
  v_t0 := clock_timestamp();
  for i in 1..200 loop
    v_ok := iana_zone_is_valid('Pacific/Auckland');
  end loop;
  v_ms := extract(epoch from clock_timestamp() - v_t0) * 1000;
  if not v_ok or v_ms > 200 then
    raise exception 'VERIFY FAIL C1: 200 lookups took % ms (ok=%)', round(v_ms, 1), v_ok;
  end if;

  -- C2: a teacher with a zone saves their public name. set_public_name
  -- (SECURITY DEFINER) is the app's write to a users row, so it is the path
  -- the guard runs on: 821 ms live before 0063, nearly all of it the check.
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0063-t@vfy0063.example', '{}'::jsonb);
  update users set role = 'teacher', timezone = 'Pacific/Auckland' where id = v_t;

  -- C3: an invalid zone is still refused, with the old message.
  begin
    update users set timezone = 'UTC+5' where id = v_t;
    raise exception 'VERIFY FAIL C3: a POSIX-style zone was accepted';
  exception when others then
    if sqlerrm not ilike '%valid IANA zone name%' then
      raise exception 'VERIFY FAIL C3: wrong refusal: %', sqlerrm;
    end if;
  end;

  perform set_config('request.jwt.claims',
                     json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  v_t0 := clock_timestamp();
  perform set_public_name('Vfy Teacher');
  v_ms := extract(epoch from clock_timestamp() - v_t0) * 1000;
  if v_ms > 200 then
    raise exception 'VERIFY FAIL C2: set_public_name took % ms', round(v_ms, 1);
  end if;
  if (select display_name from users where id = v_t) is distinct from 'Vfy Teacher' then
    raise exception 'VERIFY FAIL C2: the name was not saved';
  end if;

  execute 'reset role';
  raise exception 'EXPECTED ROLLBACK';
end;
$vfy$;
