-- =============================================================================
-- verify-0013-0014.sql — author walkthrough for the student-identity migrations
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0013_student_identity.sql and 0014_classes.sql; re-run
-- after ANY auth/RLS/grant migration (CLAUDE.md rule — expectations below are
-- kept current with the latest such migration, 0027).
--
-- Runner-compatible since the identity slice (DX F1): `pnpm verify:auth`
-- executes the @section blocks and prints per-check PASS/FAIL. Still
-- human-runnable a section at a time in the SQL editor.
--
-- REWRITTEN 2026-08-09 (identity slice): §C/§D were commented-out manual
-- blocks with placeholders; they are now self-fixturing rolled-back DO proofs
-- (the verify-0025 §C idiom). §B5 expectation updated for 0027 (see note).
-- =============================================================================

-- @section A-schema
-- @expect-rows
select 'user_role_has_student', 'student' = any(enum_range(null::user_role)::text[]), '';
select 'audit_enum_has_class_actions',
       ('class.create' = any(enum_range(null::audit_action)::text[]))
   and ('class.update' = any(enum_range(null::audit_action)::text[]))
   and ('class.delete' = any(enum_range(null::audit_action)::text[]))
   and ('class.join'   = any(enum_range(null::audit_action)::text[])), '';
select 'rls_forced_on_identity_tables',
       (select count(*) from pg_class
        where relname in ('student_domain', 'classes', 'class_members')
          and relrowsecurity and relforcerowsecurity) = 3, '3 tables, enabled+forced';
select 'student_domain_zero_policies',
       (select count(*) from pg_policies where tablename = 'student_domain') = 0,
       'service-role / DEFINER only';
select 'identity_check_three_branches',
       (select pg_get_constraintdef(oid) from pg_constraint
        where conname = 'submissions_identity_present')
       like all (array['%opaque_token%', '%display_name%', '%student_id%']), '';
select 'six_identity_indexes',
       (select count(*) from pg_indexes
        where schemaname = 'public'
          and indexname in ('student_domain_added_by_idx', 'classes_teacher_idx',
                            'classes_assertion_by_idx', 'class_members_class_idx',
                            'class_members_student_idx', 'submissions_student_idx')) = 6, '';
select 'attempt_race_guard',
       (select indexdef from pg_indexes where indexname = 'submissions_account_attempt_idx')
       like '%UNIQUE%' , 'unique partial index present';

-- @section B-function-posture
-- @expect-rows
-- B1: per-function grant floor — authenticated + service_role, never anon
-- (anon=false also proves no PUBLIC grant: PUBLIC would reach anon).
select 'grants_' || p.proname,
       not has_function_privilege('anon', p.oid, 'execute')
       and has_function_privilege('authenticated', p.oid, 'execute')
       and has_function_privilege('service_role', p.oid, 'execute'), ''
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('current_user_is_teacher', 'is_class_teacher',
                    'is_class_member', 'join_class',
                    'list_class_members', 'soft_delete_class');
-- B2: the auth trigger kept its 0009 posture through every REPLACE (0021, 0027).
select 'trigger_fn_auth_admin_only',
       has_function_privilege('supabase_auth_admin', p.oid, 'execute')
       and not has_function_privilege('anon', p.oid, 'execute')
       and not has_function_privilege('authenticated', p.oid, 'execute'), ''
from pg_proc p where p.proname = 'handle_new_auth_user';
-- B3: DEFINER functions pin search_path.
select 'search_path_pinned',
       (select count(*) from pg_proc
        where pronamespace = 'public'::regnamespace
          and proname in ('handle_new_auth_user', 'current_user_is_teacher',
                          'is_class_teacher', 'is_class_member', 'join_class',
                          'list_class_members', 'soft_delete_class')
          and array_to_string(coalesce(proconfig, '{}'), ',') like '%search_path%') = 7, '';
-- B4: no policy evaluates auth.uid() per row (0009 discipline).
select 'no_per_row_auth_uid',
       (select count(*) from pg_policies
        where schemaname = 'public'
          and replace(coalesce(qual, '') || coalesce(with_check, ''),
                      '( SELECT auth.uid() AS uid)', '') like '%auth.uid()%') = 0, '';
-- B5: teacher guards on authoring policies. EXPECT 5 — history: this was "5"
-- then corrected to 6 on 2026-08-04 (counting classes_insert_teacher), and is
-- 5 AGAIN since 0027 DROPPED classes_insert_teacher (create_class RPC is the
-- only creation door). The five are 0013's retrofits: activities ×2,
-- activity_versions ×1, assignments ×2.
select 'teacher_guard_policy_count',
       (select count(*) from pg_policies
        where schemaname = 'public'
          and coalesce(with_check, '') like '%current_user_is_teacher%') = 5,
       'the five 0013 retrofits; classes_insert_teacher dropped by 0027';
-- B6: class_members still has no INSERT policy (join_class is the only way in).
select 'class_members_no_insert_policy',
       (select count(*) from pg_policies
        where tablename = 'class_members' and cmd = 'INSERT') = 0, '';

-- @section C-behavioral
-- @expect-rows
select 'join_code_shape',
       (select bool_and(length(c) = 6 and c !~ '[0OI1L]')
        from (select generate_join_code() as c from generate_series(1, 20)) t),
       '20 codes: 6 chars, read-aloud-safe alphabet';

-- @section C2-constraint-refusals
-- @expect-error EXPECTED ROLLBACK
-- The two ERROR-expectation checks that used to be commented-out manual steps,
-- now self-proving: uppercase domains and identity-free submissions both die.
do $vfy$
declare
  v_upper_blocked boolean := false;
  v_identity_blocked boolean := false;
begin
  begin
    insert into student_domain (domain) values ('District.ORG');
  exception when check_violation then
    v_upper_blocked := true;
  end;
  begin
    -- CHECKs fire before FK triggers, so a random uuid suffices (the row must
    -- die on submissions_identity_present, never reach the FK).
    insert into submissions (activity_id, responses)
    values (gen_random_uuid(), '{"schemaVersion":1,"blanks":{}}'::jsonb);
  exception when check_violation then
    v_identity_blocked := true;
  end;
  if not (v_upper_blocked and v_identity_blocked) then
    raise exception 'CONSTRAINT PROOF FAILED >>> upper_blocked=% identity_blocked=%',
      v_upper_blocked, v_identity_blocked;
  end if;
  raise exception 'EXPECTED ROLLBACK >>> upper_blocked=t identity_blocked=t';
end
$vfy$;

-- @section D-role-containment
-- @expect-error EXPECTED ROLLBACK
-- Self-fixturing containment proof (was placeholder-ridden manual blocks):
-- a real student through the REAL trigger cannot author; join_class works and
-- refuses correctly. Claims-switched like verify-0027 §E.
do $vfy$
declare
  v_teacher uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_class   classes%rowtype;
  v_role    text;
  v_author_blocked boolean := false;
  v_bad_code_msg text := '';
  v_joined  jsonb;
begin
  insert into student_domain (domain) values ('vfy0013.example');
  insert into allowlist (email) values ('vfy0013-t@vfy0013.example');
  insert into auth.users (id, email, raw_user_meta_data) values (v_teacher, 'vfy0013-t@vfy0013.example', '{}'::jsonb);
  insert into auth.users (id, email, raw_user_meta_data) values (v_student, 'vfy0013-s@vfy0013.example', '{}'::jsonb);

  select role into v_role from users where id = v_student;
  if v_role is distinct from 'student' then
    raise exception 'ADMISSION FAILED >>> trigger minted role=%', v_role;
  end if;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0013 class', v_teacher, 'vfy') returning * into v_class;

  perform set_config('request.jwt.claims',
    json_build_object('sub', v_student, 'role', 'authenticated')::text, true);

  begin
    execute 'set local role authenticated';
    insert into activities (owner_id, title, slug)
    values (v_student, 'nope', 'vfy-nope');
  exception when others then
    v_author_blocked := true;  -- RLS violation or privilege error — both are containment
    execute 'reset role';
  end;
  execute 'reset role';

  begin
    perform join_class('ZZZZZZ');
  exception when others then
    get stacked diagnostics v_bad_code_msg = message_text;
  end;

  v_joined := join_class(v_class.join_code);

  if not v_author_blocked
     or v_bad_code_msg not like '%No class found%'
     or (v_joined->>'class_id') <> v_class.id::text then
    raise exception 'CONTAINMENT PROOF FAILED >>> author_blocked=% bad_code=[%] joined=%',
      v_author_blocked, v_bad_code_msg, v_joined;
  end if;

  raise exception 'EXPECTED ROLLBACK >>> author_blocked=t bad_code_refused=t joined=t';
end
$vfy$;

-- ===================== E. Live signup tests (dashboard) ======================
-- ⚠ SUPERSEDED for trigger changes (identity-slice ruling X1, 2026-08-09):
-- verify-0027 §D fires the REAL trigger on REAL auth.users inserts over a
-- live connection — that is the E1/E3 equivalent, run automatically by
-- `pnpm verify:auth`. E2 (off-domain OAuth rejection) is the identity-slice
-- runbook's Probe 2 (throwaway personal Gmail; records the callback shape).
-- The steps below remain ONLY for a from-scratch project bootstrap where the
-- runner isn't set up yet:
--
-- E1. TEACHER REGRESSION: sign out, sign back in with your allowlisted Google
--     account. EXPECT: normal sign-in, no new users row.
-- E2. OFF-DOMAIN REJECTION: Google sign-in with a personal gmail. EXPECT:
--     signup fails; auth.users and users both gain zero rows.
-- E3. STUDENT ADMISSION: sign in with an on-domain account (seeded domain).
--     EXPECT: role='student', audit user.create.
-- E4. Clean up any test rows afterwards.
