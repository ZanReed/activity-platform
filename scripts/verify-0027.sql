-- verify-0027.sql — author walkthrough for the admission-gate hardening
-- (identity slice; migration 0027).
--
-- TWO ways to run:
--   * `pnpm verify:auth --target live|local` — the runner executes each
--     marked section below, prints per-check PASS/FAIL, and injects the wire
--     contract as psql variables (:'contract_bad_code' etc.) from
--     packages/app/src/lib/authContract.json — never retyped here.
--   * By hand in the SQL editor: run a section at a time. Sections C uses
--     psql variables; substitute the strings from authContract.json manually.
--
-- Every proof section is a single rolled-back DO block (the verify-0025 §C
-- idiom): real rows through the REAL trigger over a real connection, then
-- `raise exception 'EXPECTED ROLLBACK >>> …'` guarantees nothing persists.
-- P7: the blocks below write NO durable rows on any path — the terminal raise
-- is unconditional.

-- @section A-schema
-- @expect-rows
-- Structural: constraints, trigger, policy surgery.
select 'allowlist_lowercase_check', exists (
  select 1 from pg_constraint where conname = 'allowlist_email_lowercase'
), 'allowlist CHECK (email = lower(email))';
select 'expected_domain_dotted_check', exists (
  select 1 from pg_constraint where conname = 'classes_expected_domain_dotted'
), 'classes CHECK (expected_domain like %.%)';
select 'no_noncompliant_allowlist_rows', not exists (
  select 1 from allowlist where email <> lower(email)
), 'all allowlist rows lowercased';
select 'no_dotless_domains', not exists (
  select 1 from classes where expected_domain is not null and expected_domain not like '%.%'
), 'no dotless expected_domain rows survived';
select 'updated_at_trigger', exists (
  select 1 from pg_trigger where tgname = 'classes_updated_at' and tgrelid = 'classes'::regclass
), 'BEFORE UPDATE stamp trigger present';
select 'insert_policy_dropped', not exists (
  select 1 from pg_policies where tablename = 'classes' and policyname = 'classes_insert_teacher'
), 'classes_insert_teacher is gone (create_class is the only door)';
select 'update_policy_no_assertion_clause', not exists (
  select 1 from pg_policies
  where tablename = 'classes' and policyname = 'classes_update_own'
    and coalesce(with_check, '') like '%age_assertion_by%'
), 'classes_update_own WITH CHECK no longer pins age_assertion_by';

-- @section B-grants
-- @expect-rows
-- The deny-by-default grant matrix (E-1/T3). Column-level UPDATE = (name) only.
select 'no_table_insert_for_authenticated', not has_table_privilege('authenticated', 'classes', 'insert'),
       'INSERT revoked at table level';
select 'no_table_update_for_anon', not has_table_privilege('anon', 'classes', 'update'), '';
select 'no_table_insert_for_anon', not has_table_privilege('anon', 'classes', 'insert'), '';
select 'update_grant_is_name_only',
       (select array_agg(column_name::text order by column_name)
          from information_schema.column_privileges
         where grantee = 'authenticated' and table_name = 'classes' and privilege_type = 'UPDATE')
       = array['name'],
       'authenticated may UPDATE exactly {name}';
select 'select_survives', has_table_privilege('authenticated', 'classes', 'select'),
       'SELECT untouched';
select 'rpc_grants_' || p.proname,
       not has_function_privilege('anon', p.oid, 'execute')
       and has_function_privilege('authenticated', p.oid, 'execute')
       and has_function_privilege('service_role', p.oid, 'execute'),
       'authenticated+service_role only'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('create_class', 'regenerate_join_code', 'update_class_domain');

-- @section C-prosrc-contract
-- @expect-rows
-- The live half of the wire-contract pin (OV-10): the DEPLOYED function
-- bodies carry the contract strings verbatim. Catches repo↔live drift that a
-- file grep cannot.
select 'join_class_not_student', strpos(p.prosrc, :'contract_not_student') > 0, ''
from pg_proc p where p.proname = 'join_class' and p.pronamespace = 'public'::regnamespace;
select 'join_class_disabled', strpos(p.prosrc, :'contract_disabled') > 0, ''
from pg_proc p where p.proname = 'join_class' and p.pronamespace = 'public'::regnamespace;
select 'join_class_bad_code', strpos(p.prosrc, :'contract_bad_code') > 0, ''
from pg_proc p where p.proname = 'join_class' and p.pronamespace = 'public'::regnamespace;
select 'join_class_domain_template', strpos(p.prosrc, :'contract_domain_template') > 0, ''
from pg_proc p where p.proname = 'join_class' and p.pronamespace = 'public'::regnamespace;
select 'join_class_log_prefix', strpos(p.prosrc, :'contract_log_prefix') > 0, ''
from pg_proc p where p.proname = 'join_class' and p.pronamespace = 'public'::regnamespace;
select 'trigger_refusal_template', strpos(p.prosrc, :'contract_signup_template') > 0, ''
from pg_proc p where p.proname = 'handle_new_auth_user' and p.pronamespace = 'public'::regnamespace;

-- @section D-trigger-branches
-- @expect-error EXPECTED ROLLBACK
-- The four admission proofs at production values (B13/X1), REAL trigger on
-- REAL auth.users inserts. This block is the live E1/E3 equivalent that
-- supersedes verify-0013-0014 §E (X1 ruling; E2 = the runbook's Probe 2).
-- Branch 4 is the slice's reason to exist: pre-0027 a MIS-CASED allowlist
-- teacher fell through to the student branch (armed at seeding time).
do $vfy$
declare
  v_report text := '';
  v_role   text;
  v_id1 uuid := gen_random_uuid();
  v_id2 uuid := gen_random_uuid();
  v_id3 uuid := gen_random_uuid();
  v_id4 uuid := gen_random_uuid();
  v_refused boolean := false;
begin
  -- fixture: a domain seed that exists ONLY inside this transaction
  insert into student_domain (domain) values ('vfy0027.example');
  insert into allowlist (email) values ('vfy0027-teacher@vfy0027.example');

  -- 1. exact-case allowlisted teacher
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_id1, 'vfy0027-teacher@vfy0027.example', '{}'::jsonb);
  select role into v_role from users where id = v_id1;
  v_report := v_report || format('teacher_exact=%s ', v_role);

  -- 2. MIS-CASED teacher email must still be a teacher (the armed defect)
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_id2, 'VFY0027-Teacher@VFY0027.example', '{}'::jsonb);
  select role into v_role from users where id = v_id2;
  v_report := v_report || format('teacher_miscased=%s ', v_role);

  -- 3. student-domain admission
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_id3, 'vfy0027-student@vfy0027.example', '{}'::jsonb);
  select role into v_role from users where id = v_id3;
  v_report := v_report || format('student=%s ', v_role);

  -- 4. off-domain refusal
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values (v_id4, 'vfy0027-outsider@gmail.example', '{}'::jsonb);
  exception when others then
    v_refused := true;
  end;
  v_report := v_report || format('outsider_refused=%s', v_refused);

  if (select role from users where id = v_id1) <> 'teacher'
     or (select role from users where id = v_id2) <> 'teacher'
     or (select role from users where id = v_id3) <> 'student'
     or not v_refused then
    raise exception 'BRANCH PROOF FAILED >>> %', v_report;
  end if;

  raise exception 'EXPECTED ROLLBACK >>> % (all four branches correct)', v_report;
end
$vfy$;

-- @section E-join-branches
-- @expect-error EXPECTED ROLLBACK
-- join_class v2's five outcomes as the STUDENT/TEACHER would hit them
-- (claims-switched, the verify-0013-0014 §D idiom). The refusal exception
-- rolls back with the raise, so refusals-then-happy-path compose in one
-- transaction only because each refusal is caught in its own subblock.
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_class   classes%rowtype;
  v_msg     text;
  v_report  text := '';
  v_joined  jsonb;
begin
  insert into student_domain (domain) values ('vfy0027.example');
  insert into allowlist (email) values ('vfy0027-t2@vfy0027.example');
  insert into auth.users (id, email, raw_user_meta_data) values (v_teacher, 'vfy0027-t2@vfy0027.example', '{}'::jsonb);
  insert into auth.users (id, email, raw_user_meta_data) values (v_student, 'vfy0027-s2@vfy0027.example', '{}'::jsonb);
  insert into classes (teacher_id, name, expected_domain, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy class', null, v_teacher, 'vfy') returning * into v_class;

  -- teacher refused (not_student)
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  begin
    perform join_class(v_class.join_code);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_report := v_report || format('teacher=[%s] ', v_msg);
  end;

  -- bad code
  perform set_config('request.jwt.claims', json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  begin
    perform join_class('ZZZZZZ');
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_report := v_report || format('bad_code=[%s] ', v_msg);
  end;

  -- domain mismatch
  update classes set expected_domain = 'elsewhere.example' where id = v_class.id;
  begin
    perform join_class(v_class.join_code);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_report := v_report || format('domain=[%s] ', v_msg);
  end;
  update classes set expected_domain = null where id = v_class.id;

  -- disabled account
  update users set deleted_at = now() where id = v_student;
  begin
    perform join_class(v_class.join_code);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_report := v_report || format('disabled=[%s] ', v_msg);
  end;
  update users set deleted_at = null where id = v_student;

  -- happy join + audit row
  v_joined := join_class(v_class.join_code);
  v_report := v_report || format('joined=%s audit=%s',
    (v_joined->>'class_id') = v_class.id::text,
    exists (select 1 from audit_log where action = 'class.join' and actor_id = v_student and target_id = v_class.id));

  raise exception 'EXPECTED ROLLBACK >>> %', v_report;
end
$vfy$;
-- EXPECT in the report: teacher=[Only student accounts…] bad_code=[No class
-- found…] domain=[This class is limited to…] disabled=[This account is
-- disabled] joined=t audit=t — the runner only checks the rollback fired;
-- READ the report line (the strings are also machine-pinned by §C).

-- @section F-raise-log
-- @expect-log join_class refused
-- E-8's liveness proof: the refusal LOG line survives the rollback and
-- reaches the client when client_min_messages = log (RAISE LOG cannot be
-- SELECTed — a row-based check here would be vacuous, P9).
set client_min_messages = log;
do $vfy$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  begin
    perform join_class('ZZZZZZ');
  exception when others then
    null; -- the LOG line was emitted before the raise; nothing durable written
  end;
end
$vfy$;

-- @section G-audit-doors
-- @expect-error EXPECTED ROLLBACK
-- The three write doors: create_class writes class.create; regenerate and
-- domain-edit write class.update with old/new metadata; and the client-role
-- INSERT side door is privilege-dead (E-2/T3).
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_created jsonb;
  v_regen   jsonb;
  v_report  text := '';
  v_insert_blocked boolean := false;
begin
  insert into allowlist (email) values ('vfy0027-t3@vfy0027.example');
  insert into auth.users (id, email, raw_user_meta_data) values (v_teacher, 'vfy0027-t3@vfy0027.example', '{}'::jsonb);
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);

  v_created := create_class('vfy class', 'vfy0027.example', 'vfy-version');
  v_report := v_report || format('create_audit=%s ',
    exists (select 1 from audit_log where action = 'class.create' and actor_id = v_teacher
            and target_id = (v_created->>'id')::uuid));

  v_regen := regenerate_join_code((v_created->>'id')::uuid);
  v_report := v_report || format('regen_audit=%s new_code_differs=%s ',
    exists (select 1 from audit_log where action = 'class.update' and actor_id = v_teacher
            and target_id = (v_created->>'id')::uuid
            and metadata->>'field' = 'join_code'
            and metadata->>'old' = v_created->>'join_code'
            and metadata->>'new' = v_regen->>'join_code'),
    (v_regen->>'join_code') <> (v_created->>'join_code'));

  perform update_class_domain((v_created->>'id')::uuid, null);
  v_report := v_report || format('domain_audit=%s ',
    exists (select 1 from audit_log where action = 'class.update'
            and target_id = (v_created->>'id')::uuid
            and metadata->>'field' = 'expected_domain'));

  -- the side door: a client-role INSERT dies on privilege, not policy
  begin
    execute 'set local role authenticated';
    insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
    values (v_teacher, 'side door', v_teacher, 'x');
  exception when insufficient_privilege then
    v_insert_blocked := true;
    execute 'reset role';
  end;
  execute 'reset role';
  v_report := v_report || format('client_insert_blocked=%s', v_insert_blocked);

  if not v_insert_blocked then
    raise exception 'SIDE DOOR OPEN >>> %', v_report;
  end if;

  raise exception 'EXPECTED ROLLBACK >>> %', v_report;
end
$vfy$;
-- EXPECT in the report: create_audit=t regen_audit=t new_code_differs=t
-- domain_audit=t client_insert_blocked=t
