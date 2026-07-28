-- =============================================================================
-- 0014_classes.sql — Student accounts, part 2: classes, membership, identity
-- -----------------------------------------------------------------------------
-- Components-as-data re-architecture, S1 (identity lane). Rulings 2B/TV1-A/
-- 3.1C. Builds on 0013 (the 'student' role + student_domain + role guards).
--
--   1. classes — teacher-owned roster container carrying the 13+ assertion
--      record (3.1C: teacher-side checkbox at class creation; the paper trail
--      lives with the party that knows student ages).
--   2. class_members — student ↔ class membership, joined via code.
--   3. join_class RPC — the only write path into class_members.
--   4. submissions.student_id — the third identity form (account-backed).
--      Old forms stay accepted TEMPORARILY: until the viewer ships (T6), the
--      current publish path still writes display_name rows. The anonymous
--      branches are scheduled for REMOVAL at cutover (S9) — author ruling
--      2026-07-28: there are no old pages to maintain, so the anonymous wire
--      gets demolished, not preserved.
--
-- Run after 0013. Same transaction-safety discipline: no DDL-parsed
-- expression references the 'student' enum value or the new audit values —
-- they appear only inside function bodies (stored as text, compiled at call).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Audit actions for class lifecycle
-- -----------------------------------------------------------------------------
alter type audit_action add value if not exists 'class.create';
alter type audit_action add value if not exists 'class.update';
alter type audit_action add value if not exists 'class.delete';
alter type audit_action add value if not exists 'class.join';

-- -----------------------------------------------------------------------------
-- 2. Join-code generator
-- -----------------------------------------------------------------------------
-- 6 chars from an unambiguous alphabet (no 0/O/1/I/L) — read-aloud-able in a
-- classroom. ~887M combinations; the unique constraint catches the rare
-- collision and the caller retries. Plain function (not a default with
-- SECURITY DEFINER) — it reads nothing, so no privilege posture needed.
create or replace function generate_join_code()
returns text
language sql
volatile
as $$
  select string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (random() * 30)::int + 1, 1),
    ''
  )
  from generate_series(1, 6);
$$;

-- -----------------------------------------------------------------------------
-- 3. classes
-- -----------------------------------------------------------------------------
-- The 13+ assertion fields are NOT NULL: a class cannot exist without the
-- teacher having asserted it (the UI checkbox is required; the value records
-- who asserted, when, and against which assertion text version so a future
-- wording change is distinguishable in the record).
-- expected_domain is optional: when set, join_class enforces that joining
-- students' email domain matches (defense against a code leaking outside the
-- district); when null, any admitted student account may join.
create table classes (
  id                      uuid primary key default gen_random_uuid(),
  teacher_id              uuid not null references users(id) on delete restrict,
  name                    text not null check (length(trim(name)) > 0),
  join_code               text not null unique default generate_join_code(),
  expected_domain         text check (expected_domain = lower(expected_domain)),
  age_assertion_at        timestamptz not null default now(),
  age_assertion_by        uuid not null references users(id),
  assertion_text_version  text not null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz
);

create index classes_teacher_idx on classes (teacher_id) where deleted_at is null;
create index classes_assertion_by_idx on classes (age_assertion_by);

alter table classes enable row level security;
alter table classes force row level security;

-- -----------------------------------------------------------------------------
-- 4. class_members
-- -----------------------------------------------------------------------------
-- Soft removal (removed_at) — the teacher removes a student from the roster
-- without destroying the historical record. Re-join with a still-valid code
-- reactivates the row; the lockout path is remove + regenerate the code.
create table class_members (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  student_id  uuid not null references users(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  removed_at  timestamptz,
  unique (class_id, student_id)
);

create index class_members_class_idx   on class_members (class_id) where removed_at is null;
create index class_members_student_idx on class_members (student_id) where removed_at is null;

alter table class_members enable row level security;
alter table class_members force row level security;

-- -----------------------------------------------------------------------------
-- 5. Membership helpers
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER deliberately (unlike can_read_activity's invoker posture):
-- classes policies need to consult class_members and vice versa. With invoker
-- helpers each table's RLS would re-enter the other's policies — the exact
-- recursion hazard the 0002 README flags for same-table helper calls, here in
-- cross-table form. DEFINER reads bypass RLS and break the cycle. Pinned
-- search_path; grants locked to authenticated below.

create or replace function is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from classes c
    where c.id = p_class_id
      and c.teacher_id = auth.uid()
      and c.deleted_at is null
  );
$$;

create or replace function is_class_member(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from class_members m
    where m.class_id = p_class_id
      and m.student_id = auth.uid()
      and m.removed_at is null
  );
$$;

revoke execute on function is_class_teacher(uuid) from public, anon;
revoke execute on function is_class_member(uuid) from public, anon;
grant execute on function is_class_teacher(uuid) to authenticated, service_role;
grant execute on function is_class_member(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. RLS: classes
-- -----------------------------------------------------------------------------
-- Teacher: full CRUD on own classes (insert gated on the 0013 teacher guard;
-- WITH CHECK pins teacher_id AND age_assertion_by to the caller — the
-- assertion must be made by the class owner, not forged onto a colleague).
-- Student: may read classes they actively belong to (the viewer shows the
-- class name; join_code is NOT hidden from members — it's a classroom-public
-- artifact by design, teachers regenerate on leak).
create policy classes_select_own on classes
  for select using (teacher_id = (select auth.uid()) and deleted_at is null);

create policy classes_select_member on classes
  for select using (deleted_at is null and is_class_member(id));

create policy classes_insert_teacher on classes
  for insert with check (
    teacher_id = (select auth.uid())
    and age_assertion_by = (select auth.uid())
    and (select current_user_is_teacher())
  );

create policy classes_update_own on classes
  for update using (teacher_id = (select auth.uid()) and deleted_at is null)
  with check (
    teacher_id = (select auth.uid())
    and age_assertion_by = (select auth.uid())
  );

-- Delete: no client policy — soft delete via UPDATE deleted_at, same model as
-- activities.

-- -----------------------------------------------------------------------------
-- 7. RLS: class_members
-- -----------------------------------------------------------------------------
-- Teacher of the class: read the roster, soft-remove (update removed_at).
-- Student: read own membership rows. Insert: NO client policy — join_class
-- (SECURITY DEFINER) is the only write path in.
create policy class_members_select_teacher on class_members
  for select using (is_class_teacher(class_id));

create policy class_members_select_self on class_members
  for select using (student_id = (select auth.uid()));

create policy class_members_update_teacher on class_members
  for update using (is_class_teacher(class_id))
  with check (is_class_teacher(class_id));

-- -----------------------------------------------------------------------------
-- 8. join_class RPC
-- -----------------------------------------------------------------------------
-- The student's one write path. Validates: caller is a student account, the
-- code matches a live class, and (when the class pins a domain) the student's
-- email domain matches. Re-join reactivates a soft-removed row.
create or replace function join_class(p_join_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    users%rowtype;
  v_class   classes%rowtype;
  v_member  class_members%rowtype;
begin
  select * into v_user from users
  where id = auth.uid() and deleted_at is null;

  if v_user.id is null or v_user.role <> 'student' then
    raise exception 'Only student accounts can join a class';
  end if;

  select * into v_class from classes
  where join_code = upper(trim(p_join_code)) and deleted_at is null;

  if v_class.id is null then
    raise exception 'No class found for that code';
  end if;

  if v_class.expected_domain is not null
     and lower(split_part(v_user.email, '@', 2)) <> v_class.expected_domain then
    raise exception 'This class is limited to % accounts', v_class.expected_domain;
  end if;

  select * into v_member from class_members
  where class_id = v_class.id and student_id = v_user.id;

  if v_member.id is null then
    insert into class_members (class_id, student_id)
    values (v_class.id, v_user.id)
    returning * into v_member;
  elsif v_member.removed_at is not null then
    update class_members
    set removed_at = null, joined_at = now()
    where id = v_member.id
    returning * into v_member;
  end if;

  insert into audit_log (actor_id, action, target_type, target_id)
  values (v_user.id, 'class.join', 'class', v_class.id);

  return jsonb_build_object(
    'class_id',   v_class.id,
    'class_name', v_class.name,
    'joined_at',  v_member.joined_at
  );
end;
$$;

revoke execute on function join_class(text) from public, anon;
grant execute on function join_class(text) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 8b. list_class_members RPC — the teacher's roster read
-- -----------------------------------------------------------------------------
-- users RLS is self-only (users_select_self), so a teacher cannot join
-- class_members to users client-side to get names. This DEFINER read returns
-- exactly the roster fields the Classes UI needs, gated on class ownership.
create or replace function list_class_members(p_class_id uuid)
returns table (
  student_id   uuid,
  display_name text,
  email        text,
  joined_at    timestamptz,
  removed_at   timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select m.student_id, u.display_name, u.email, m.joined_at, m.removed_at
  from class_members m
  join users u on u.id = m.student_id
  where m.class_id = p_class_id
    and is_class_teacher(p_class_id)
  order by u.display_name;
$$;

revoke execute on function list_class_members(uuid) from public, anon;
grant execute on function list_class_members(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 8c. soft_delete_class RPC
-- -----------------------------------------------------------------------------
-- Same reasoning as soft_delete_activity (0008, see DECISIONS.md "Activity
-- deletion"): a client-side UPDATE that sets deleted_at makes the post-update
-- row invisible under the deleted_at-is-null SELECT policy, so the soft delete
-- goes through a DEFINER RPC with its own ownership check.
create or replace function soft_delete_class(p_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Class not found or not owned by caller';
  end if;

  update classes set deleted_at = now(), updated_at = now()
  where id = p_class_id and deleted_at is null;

  insert into audit_log (actor_id, action, target_type, target_id)
  values (auth.uid(), 'class.delete', 'class', p_class_id);
end;
$$;

revoke execute on function soft_delete_class(uuid) from public, anon;
grant execute on function soft_delete_class(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 9. submissions.student_id — the account-backed identity form
-- -----------------------------------------------------------------------------
-- ON DELETE RESTRICT deliberately: the retention job (docs/compliance/
-- retention-policy.md) deletes a purged student's submissions BEFORE the user
-- row — RESTRICT makes a wrong deletion order fail loudly instead of leaving
-- identity-less rows that violate the CHECK.
--
-- Invariant (enforced by the S4 grading RPC, documented here): account rows
-- carry student_id ONLY — display_name and opaque_token stay NULL. That keeps
-- the 0005 partial attempt indexes inert for account rows (NULL display_name
-- entries are all-distinct) while the new index below guards their max+1 race.
alter table submissions
  add column student_id uuid references users(id) on delete restrict;

alter table submissions drop constraint submissions_identity_present;
alter table submissions
  add constraint submissions_identity_present
  check (
    opaque_token is not null
    or (display_name is not null and length(trim(display_name)) > 0)
    or student_id is not null
  );

create index submissions_student_idx
  on submissions (student_id, submitted_at desc)
  where student_id is not null;

create unique index submissions_account_attempt_idx
  on submissions (activity_id, student_id, attempt_number)
  where student_id is not null;

-- No student SELECT policy on submissions yet — deliberately. The viewer's
-- read/feedback path is server-authoritative (S4's RPC decides what a student
-- sees, answers stripped); a direct-table policy would prejudge that contract.

-- =============================================================================
-- Verification — the full walkthrough (incl. negative tests needing live
-- signups) lives in scripts/verify-0013-0014.sql. SQL-only spot checks:
-- =============================================================================
--
-- -- 1. Identity CHECK has three branches. EXPECT: definition containing
-- --    opaque_token / display_name / student_id.
-- select pg_get_constraintdef(oid) from pg_constraint
-- where conname = 'submissions_identity_present';
--
-- -- 2. join_class grants. EXPECT: {authenticated, service_role} (+postgres).
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'join_class';
--
-- -- 3. class_members has no INSERT policy. EXPECT: 0 rows.
-- select policyname from pg_policies
-- where tablename = 'class_members' and cmd = 'INSERT';
