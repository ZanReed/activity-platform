-- =============================================================================
-- 0013_student_identity.sql — Student accounts, part 1: admission + containment
-- -----------------------------------------------------------------------------
-- Components-as-data re-architecture, S1 (identity lane). Rulings 2B/TV1-A:
-- students get accounts via the existing Supabase Google OAuth, gated by
-- district email DOMAIN (vs the teacher allowlist's exact-email gate).
--
-- This migration does exactly two things:
--   1. ADMISSION — a new 'student' role + a student_domain table + a rewritten
--      handle_new_auth_user that admits a signup when its email domain is
--      listed (teachers stay exact-email-allowlisted; allowlist wins ties).
--   2. CONTAINMENT — role guards on the authoring policies, so a student
--      account cannot create or modify activities, versions, or assignments.
--      Until now "any authenticated user" and "any teacher" were the same
--      set; this migration is the moment that stops being true.
--
-- Class membership, the 13+ assertion record, and submission identity land in
-- 0014_classes.sql. This file is deliberately self-contained and reviewable
-- on its own: it is the security boundary change.
--
-- Transaction-safety note (why no policy mentions 'student'): Postgres allows
-- ALTER TYPE ... ADD VALUE inside a transaction (PG 12+), but other DDL in the
-- SAME transaction cannot reference the uncommitted value. Every role guard
-- below is therefore written positively (role in ('teacher','admin')). The
-- one 'student' reference lives in the trigger FUNCTION BODY, which Postgres
-- stores as text and compiles at first execution — long after this commits.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Enum value
-- -----------------------------------------------------------------------------
alter type user_role add value if not exists 'student';

-- -----------------------------------------------------------------------------
-- 2. student_domain — which district domains may sign in as students
-- -----------------------------------------------------------------------------
-- Same posture as allowlist: RLS enabled + forced with NO policies, so only
-- the service role (and the SECURITY DEFINER trigger) can touch it. Domains
-- are stored lowercase and matched exactly — a district using both
-- district.org and student.district.org lists both rows. Teacher self-service
-- management is a later arc; for now the author seeds rows in the SQL editor.
create table student_domain (
  domain     text primary key check (domain = lower(domain) and domain like '%.%'),
  added_by   uuid references users(id),
  added_at   timestamptz not null default now(),
  notes      text
);

create index student_domain_added_by_idx on student_domain (added_by);

alter table student_domain enable row level security;
alter table student_domain force row level security;
-- No policies. Intentional — service role only, like allowlist.

-- -----------------------------------------------------------------------------
-- 3. handle_new_auth_user — admit teachers (allowlist) OR students (domain)
-- -----------------------------------------------------------------------------
-- Precedence: exact-email allowlist first, then domain match. A teacher whose
-- personal email happens to be on a listed student domain still becomes a
-- teacher — the more specific grant wins. Anyone matching neither is rejected
-- exactly as before (exception → auth.users insert rolls back → Supabase
-- surfaces a signup error).
--
-- The teacher branch is byte-identical in behavior to the 0003 version.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_domain text := lower(split_part(new.email, '@', 2));
begin
  if exists (select 1 from public.allowlist where email = new.email) then
    -- Teacher path (unchanged): role defaults to 'teacher'.
    insert into public.users (id, email, display_name)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.email)
    );
  elsif exists (select 1 from public.student_domain where domain = v_domain) then
    -- Student path: admitted by district domain.
    insert into public.users (id, email, display_name, role)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.email),
      'student'
    );
  else
    raise exception 'Email % is not permitted to sign up', new.email;
  end if;

  insert into public.audit_log (actor_id, action, target_type, target_id)
  values (new.id, 'user.create', 'user', new.id);

  return new;
end;
$$;

-- (The on_auth_user_created trigger already points at this function; CREATE
-- OR REPLACE preserves the wiring. Grants from 0009 — supabase_auth_admin +
-- service_role only — survive REPLACE because they attach to the function
-- identity, and REPLACE does not reset ACLs.)

-- -----------------------------------------------------------------------------
-- 4. Authoring role guard helper
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER so policies on activities/assignments can consult users
-- without entangling the users table's own RLS (and without the recursion
-- hazards of subselecting users inside every policy). Pinned search_path per
-- the 0003/0009 discipline. STABLE: one lookup per query via initplan.
create or replace function current_user_is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users
    where id = auth.uid()
      and role in ('teacher', 'admin')
      and deleted_at is null
  );
$$;

-- Grant discipline (0009): callable by authenticated (policies evaluate it as
-- the calling user), nothing else.
revoke execute on function current_user_is_teacher() from public, anon;
grant execute on function current_user_is_teacher() to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 5. Containment — authoring policies require a teacher
-- -----------------------------------------------------------------------------
-- ALTER POLICY replaces clauses atomically (no unprotected window). Expressions
-- mirror the live definitions (0002 + 0009's initplan rewrite) with the guard
-- appended. SELECT policies are untouched — a student can already see nothing
-- they don't own, and class-scoped read access is 0014's job.
--
-- Insert paths are the real boundary; update policies get the guard too as
-- belt-and-suspenders (a student owns no rows for USING to admit, but the
-- guard makes the intent explicit and future-proofs against ownership grants).

alter policy activities_insert_own on activities
  with check (
    owner_id = (select auth.uid())
    and (select current_user_is_teacher())
  );

alter policy activities_update_own on activities
  using (owner_id = (select auth.uid()) and deleted_at is null)
  with check (
    owner_id = (select auth.uid())
    and (select current_user_is_teacher())
  );

alter policy activity_versions_insert_own on activity_versions
  with check (
    created_by = (select auth.uid())
    and can_edit_activity(activity_id)
    and (select current_user_is_teacher())
  );

alter policy assignments_insert_own on assignments
  with check (
    teacher_id = (select auth.uid())
    and (select current_user_is_teacher())
  );

alter policy assignments_update_own on assignments
  using (teacher_id = (select auth.uid()) and deleted_at is null)
  with check (
    teacher_id = (select auth.uid())
    and (select current_user_is_teacher())
  );

-- =============================================================================
-- Verification — run after applying. Every query lists its expected result.
-- The negative signup tests need the dashboard (or a curl against the auth
-- endpoint); the SQL-visible ones are here, the full walkthrough lives in
-- scripts/verify-0013-0014.sql.
-- =============================================================================
--
-- -- 1. Enum grew. EXPECT: {teacher,admin,student}
-- select enum_range(null::user_role);
--
-- -- 2. student_domain locked down. EXPECT: rowsecurity=t, forcerowsecurity=t,
-- --    and 0 policies.
-- select relrowsecurity, relforcerowsecurity from pg_class where relname = 'student_domain';
-- select count(*) from pg_policies where tablename = 'student_domain';
--
-- -- 3. Helper grants. EXPECT grantees: {authenticated, service_role} (+postgres),
-- --    no anon/PUBLIC.
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'current_user_is_teacher';
--
-- -- 4. Guards present. EXPECT: 5 rows (the five altered policies), each
-- --    containing 'current_user_is_teacher'.
-- select tablename, policyname from pg_policies
-- where schemaname = 'public'
--   and coalesce(with_check, '') like '%current_user_is_teacher%';
