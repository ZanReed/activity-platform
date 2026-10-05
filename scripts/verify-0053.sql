-- verify-0053.sql — a class records which age statement its teacher confirmed
-- (migration 0053; rulings U-1 to U-3).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block: its own users and classes, real functions,
-- everything rolled back (P7).
--
--   §A — catalog posture: the column and its default; ONE create_class; both
--        RPCs signed-in only, definer, pinned; a client cannot write the
--        column; no existing class was marked by the migration.
--   §B — a three-argument create still makes a 13-or-older class; the choice
--        is stored, returned and audited; the re-confirm is the teacher's
--        only, re-stamps time / teacher / version, and audits the old values.

-- @section A-catalog-posture
-- @expect-rows
select 'includes_under_13_column',
       exists (select 1 from information_schema.columns
                where table_name = 'classes' and column_name = 'includes_under_13'
                  and data_type = 'boolean' and is_nullable = 'NO'
                  and column_default = 'false'),
       'a class always records one of the two statements; the default is 13 or older';
select 'one_create_class',
       (select count(*) = 1 from pg_proc where proname = 'create_class')
       and (select pg_get_function_identity_arguments(oid) from pg_proc where proname = 'create_class')
             = 'p_name text, p_expected_domain text, p_assertion_text_version text, p_includes_under_13 boolean',
       'the three-argument function is gone; the fourth argument has a default';
select 'age_rpcs_signed_in_only_definer',
       (select bool_and(has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute')
                        and p.prosecdef and p.proconfig @> array['search_path=public'])
               and count(*) = 2
          from pg_proc p where p.proname in ('create_class', 'reconfirm_class_age')),
       'never anonymous; definer with a pinned search path';
select 'client_cannot_write_the_column',
       not has_column_privilege('authenticated', 'classes', 'includes_under_13', 'update')
       and not has_table_privilege('authenticated', 'classes', 'insert'),
       '0027''s grants hold: the statement is written only by the two RPCs';
select 'statement_always_has_its_stamp',
       not exists (select 1 from classes
                    where age_assertion_at is null or assertion_text_version is null),
       'every class''s statement carries when and under which policy version it was confirmed';

-- @section B-age-statement
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_other   uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_res     jsonb;
  v_a       uuid;
  v_b       uuid;
  v_stamp   timestamptz;
  v_meta    jsonb;
  v_raised  boolean;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0053-' || row_number() over () || '@vfy0053.example', '{}'::jsonb
    from unnest(array[v_teacher, v_other, v_student]) u;
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = v_student;
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);

  -- B1 the page deployed before 0053 calls with three arguments: a
  --    13-or-older class, exactly as before
  v_res := create_class('vfy 0053 a', null, 'vfy-v1');
  v_a := (v_res->>'id')::uuid;
  if (v_res->>'includes_under_13')::boolean is not false
     or (select includes_under_13 from classes where id = v_a) is not false then
    raise exception 'FAIL B1: a three-argument create %', v_res;
  end if;
  n := n + 1;

  -- B2 the choice is stored, returned with its stamp, and audited
  v_res := create_class('vfy 0053 b', null, 'vfy-v1', true);
  v_b := (v_res->>'id')::uuid;
  if (v_res->>'includes_under_13')::boolean is not true
     or v_res->>'assertion_text_version' <> 'vfy-v1' or v_res->>'age_assertion_at' is null
     or (select includes_under_13 from classes where id = v_b) is not true
     or (select metadata->>'includes_under_13' from audit_log
          where action = 'class.create' and target_id = v_b) <> 'true' then
    raise exception 'FAIL B2: an under-13 create %', v_res;
  end if;
  v_raised := false;
  begin perform create_class('vfy 0053 c', null, 'vfy-v1', null);
  exception when others then v_raised := sqlerrm = 'An age statement is required'; end;
  if not v_raised then raise exception 'FAIL B2: a null statement was accepted'; end if;
  n := n + 1;

  -- B3 only the class's own teacher re-confirms
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  v_raised := false;
  begin perform reconfirm_class_age(v_a, true, 'vfy-v2');
  exception when others then v_raised := sqlerrm = 'Not your class'; end;
  if not v_raised then raise exception 'FAIL B3: another teacher re-confirmed'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_raised := false;
  begin perform reconfirm_class_age(v_a, true, 'vfy-v2');
  exception when others then v_raised := sqlerrm = 'Not your class'; end;
  if not v_raised then raise exception 'FAIL B3: a student re-confirmed'; end if;
  if (select includes_under_13 from classes where id = v_a) is not false then
    raise exception 'FAIL B3: a refused re-confirm changed the class';
  end if;
  n := n + 1;

  -- B4 the re-confirm: the choice, the time, the teacher and the version are
  --    re-stamped; the audit row keeps what the class carried before
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  update classes set age_assertion_at = now() - interval '10 days' where id = v_a;
  select age_assertion_at into v_stamp from classes where id = v_a;
  v_res := reconfirm_class_age(v_a, true, 'vfy-v2');
  select metadata into v_meta from audit_log
   where action = 'class.update' and target_id = v_a and metadata->>'field' = 'age_statement';
  if (v_res->>'includes_under_13')::boolean is not true
     or (select includes_under_13 from classes where id = v_a) is not true
     or (select assertion_text_version from classes where id = v_a) <> 'vfy-v2'
     or (select age_assertion_at from classes where id = v_a) <= v_stamp
     or (select age_assertion_by from classes where id = v_a) <> v_teacher
     or v_meta->'old'->>'includes_under_13' <> 'false'
     or v_meta->'old'->>'assertion_text_version' <> 'vfy-v1'
     or (v_meta->'old'->>'age_assertion_at')::timestamptz <> v_stamp
     or v_meta->'new'->>'includes_under_13' <> 'true' then
    raise exception 'FAIL B4: the re-confirm % / %', v_res, v_meta;
  end if;
  n := n + 1;

  -- B5 and back again; a missing version or statement is refused
  perform reconfirm_class_age(v_a, false, 'vfy-v2');
  if (select includes_under_13 from classes where id = v_a) is not false
     or (select count(*) from audit_log where action = 'class.update' and target_id = v_a
                                          and metadata->>'field' = 'age_statement') <> 2 then
    raise exception 'FAIL B5: re-confirming back';
  end if;
  v_raised := false;
  begin perform reconfirm_class_age(v_a, true, '  ');
  exception when others then v_raised := sqlerrm = 'Assertion version is required'; end;
  if not v_raised then raise exception 'FAIL B5: an empty version was accepted'; end if;
  v_raised := false;
  begin perform reconfirm_class_age(v_a, null, 'vfy-v2');
  exception when others then v_raised := sqlerrm = 'An age statement is required'; end;
  if not v_raised then raise exception 'FAIL B5: a null statement was accepted'; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-age-statement: %/5', n;
end
$vfy$;
