-- =============================================================================
-- verify-0013-0014.sql — author walkthrough for the student-identity migrations
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0013_student_identity.sql and 0014_classes.sql.
-- Sections A–D are pure SQL (SQL editor, service role). Section E is the
-- live-signup negative test — it needs the dashboard/OAuth flow, steps listed.
-- Every query states its EXPECTED result. Anything else = stop and report.
-- =============================================================================

-- ============================== A. Schema shape ==============================

-- A1. Enum grew. EXPECT: {teacher,admin,student}
select enum_range(null::user_role);

-- A2. Audit enum grew. EXPECT to include class.create/update/delete/join
select enum_range(null::audit_action);

-- A3. New tables exist with RLS forced. EXPECT: 3 rows, all t/t
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relname in ('student_domain', 'classes', 'class_members')
order by relname;

-- A4. student_domain has NO policies (service-role only). EXPECT: 0
select count(*) from pg_policies where tablename = 'student_domain';

-- A5. Identity CHECK has three branches. EXPECT the definition to mention
--     opaque_token, display_name, AND student_id.
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'submissions_identity_present';

-- A6. New indexes. EXPECT: 6 rows
select indexname from pg_indexes
where schemaname = 'public'
  and indexname in ('student_domain_added_by_idx', 'classes_teacher_idx',
                    'classes_assertion_by_idx', 'class_members_class_idx',
                    'class_members_student_idx', 'submissions_student_idx')
order by indexname;

-- A7. Account attempt-race guard. EXPECT: 1 row, unique=t, partial predicate
--     on student_id IS NOT NULL
select indexname, indexdef from pg_indexes
where indexname = 'submissions_account_attempt_idx';

-- ============================ B. Function posture ============================

-- B1. Grants on the new functions. EXPECT per function: authenticated +
--     service_role (+postgres owner); NO anon, NO PUBLIC row anywhere.
select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('current_user_is_teacher', 'is_class_teacher',
                    'is_class_member', 'join_class',
                    'list_class_members', 'soft_delete_class')
order by 1, 2;

-- B2. handle_new_auth_user kept its 0009 grants through the REPLACE.
--     EXPECT: supabase_auth_admin + service_role (+postgres), no anon/PUBLIC.
select coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.proname = 'handle_new_auth_user';

-- B3. All new SECURITY DEFINER functions have a pinned search_path.
--     EXPECT: 7 rows, each proconfig containing search_path
select proname, proconfig from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('handle_new_auth_user', 'current_user_is_teacher',
                  'is_class_teacher', 'is_class_member', 'join_class',
                  'list_class_members', 'soft_delete_class')
order by proname;

-- B4. No policy evaluates auth.uid() per row (0009 discipline held).
--     EXPECT: 0 rows
select tablename, policyname from pg_policies
where schemaname = 'public'
  and replace(coalesce(qual, '') || coalesce(with_check, ''),
              '( SELECT auth.uid() AS uid)', '') like '%auth.uid()%';

-- B5. Teacher guards landed on the five authoring policies. EXPECT: 5 rows
--     (activities ×2, activity_versions ×1, assignments ×2)
select tablename, policyname from pg_policies
where schemaname = 'public'
  and coalesce(with_check, '') like '%current_user_is_teacher%'
order by tablename, policyname;

-- B6. class_members has no INSERT policy (join_class is the only way in).
--     EXPECT: 0 rows
select policyname from pg_policies
where tablename = 'class_members' and cmd = 'INSERT';

-- ==================== C. Behavioral checks (service role) ====================

-- C1. Join-code generator: 6 chars, unambiguous alphabet. EXPECT: 20 codes,
--     each length 6, no 0/O/1/I/L characters.
select generate_join_code() as code, length(generate_join_code()) as len
from generate_series(1, 20);

-- C2. student_domain normalization guard. EXPECT: ERROR (check constraint) —
--     uppercase rejected.
-- insert into student_domain (domain) values ('District.ORG');

-- C3. Seed a test domain for section E (replace with the real district domain
--     when going live; delete the test row afterwards).
-- insert into student_domain (domain, notes) values ('example-district.org', 'S1 verification');

-- C4. Identity CHECK: an all-null-identity submission is still rejected.
--     EXPECT: ERROR (violates submissions_identity_present). Use any real
--     activity id; the insert must fail BEFORE FK checks matter.
-- insert into submissions (activity_id, responses)
-- values ('<any-activity-uuid>', '{"schemaVersion":1,"blanks":{}}'::jsonb);

-- ===================== D. Role containment (SQL-simulated) ====================
-- Simulates an authenticated student via a transaction-scoped JWT claim swap.
-- Run each block in the SQL editor AS ONE STATEMENT BATCH. Roll back after.

-- D1. Create a fake student user to impersonate (service role bypasses RLS):
-- begin;
-- insert into auth.users (id, email)  -- if your project blocks direct auth.users
--   values ('00000000-0000-4000-8000-00000000dead', 'kid@example-district.org');
--   -- If the direct auth.users insert is blocked on your project, create the
--   -- user via the dashboard (Auth → Add user) with an example-district.org
--   -- email instead, then use its real UUID below and skip this insert.
-- -- The 0013 trigger should have fired and created the public.users row:
-- select id, email, role from users where email = 'kid@example-district.org';
-- -- EXPECT: 1 row, role = 'student'   ← THE admission check
--
-- D2. Impersonate the student and try to author. EXPECT: ERROR
--     "new row violates row-level security policy" on each:
-- set local role authenticated;
-- set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-00000000dead","role":"authenticated"}';
-- insert into activities (owner_id, title, slug)
--   values ('00000000-0000-4000-8000-00000000dead', 'nope', 'nope');
-- insert into assignments (teacher_id, activity_id, activity_version_id, title)
--   values ('00000000-0000-4000-8000-00000000dead',
--           '<any-activity-uuid>', '<any-version-uuid>', 'nope');
--
-- D3. Still impersonated: the student CAN join a class once one exists
--     (create one as yourself first in the app UI, note its join_code):
-- select join_class('<CODE>');
-- -- EXPECT: jsonb {class_id, class_name, joined_at}
-- select join_class('ZZZZZZ');
-- -- EXPECT: ERROR "No class found for that code"
--
-- D4. Clean up:
-- rollback;

-- ===================== E. Live signup tests (dashboard) ======================
-- These exercise the real OAuth path — SQL can't fake them.
--
-- E1. TEACHER REGRESSION (the critical one): sign out of the app, sign back in
--     with your allowlisted Google account. EXPECT: normal sign-in, dashboard
--     loads, and no new users row (existing row untouched):
--       select count(*) from users where role = 'teacher';  -- unchanged
--
-- E2. OFF-DOMAIN REJECTION: attempt Google sign-in with an account that is
--     neither allowlisted nor on a listed domain (any personal gmail works —
--     gmail.com must NOT be in student_domain). EXPECT: signup FAILS with the
--     Supabase auth error surface; then confirm the rollback held:
--       select count(*) from auth.users where email = '<that-gmail>';  -- 0
--       select count(*) from users     where email = '<that-gmail>';  -- 0
--
-- E3. STUDENT ADMISSION (needs a real account on the seeded domain, or seed
--     gmail-side test domain temporarily): sign in with an on-domain account.
--     EXPECT: signup succeeds;
--       select role from users where email = '<that-email>';  -- 'student'
--     and audit trail:
--       select action from audit_log order by created_at desc limit 1;  -- user.create
--
-- E4. Clean up any test rows: delete the test student (auth dashboard),
--     remove the 'example-district.org' student_domain row.
