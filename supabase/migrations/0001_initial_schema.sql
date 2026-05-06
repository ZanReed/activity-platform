-- =============================================================================
-- 0001_initial_schema.sql — Extensions, enums, tables, indexes
-- -----------------------------------------------------------------------------
-- Run order: this is the first migration. Subsequent migrations build on these
-- types and tables. Safe to re-run on a fresh project; do not re-run on an
-- existing project (would error on duplicate types).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
-- pgcrypto provides gen_random_uuid(). Supabase enables it by default in new
-- projects, but declaring it explicitly makes this migration self-sufficient
-- on a bare Postgres instance (e.g., a local docker test environment).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
-- Phase 3+ enum values are pre-declared so application code can switch on them
-- without DDL changes later. Adding new enum values later requires
-- ALTER TYPE ... ADD VALUE, which is fine but more annoying than declaring up
-- front.
create type user_role as enum ('teacher', 'admin');

create type activity_status as enum ('draft', 'published', 'archived');

create type activity_visibility as enum ('private', 'unlisted', 'public', 'marketplace');

create type tracking_level as enum ('none', 'completion', 'full');

create type audit_action as enum (
  'user.create', 'user.update', 'user.delete',
  'activity.create', 'activity.update', 'activity.publish', 'activity.delete',
  'assignment.create', 'assignment.delete',
  'submission.create',
  'admin.access_user_data'
);

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
-- Mirrors Supabase Auth users with app-specific fields. A row is inserted
-- here automatically when a new auth.users row is created, via the trigger
-- defined in 0003_functions.sql. The trigger checks the allowlist and rejects
-- signups for emails that aren't permitted.
create table users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  display_name text,
  role         user_role not null default 'teacher',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index users_email_idx on users (email) where deleted_at is null;

alter table users enable row level security;
alter table users force row level security;

-- -----------------------------------------------------------------------------
-- allowlist
-- -----------------------------------------------------------------------------
-- Phase 1 invite-only access control. Drops away in Phase 2 when self-signup
-- with email verification replaces it.
create table allowlist (
  email      text primary key,
  added_by   uuid references users(id),
  added_at   timestamptz not null default now(),
  notes      text
);

alter table allowlist enable row level security;
alter table allowlist force row level security;
-- No public policies; only service role and (later) admins read this.

-- -----------------------------------------------------------------------------
-- activities
-- -----------------------------------------------------------------------------
-- The metadata row for an activity. Two content fields:
--   * draft_content: mutable, the in-progress edit. Updated by autosave.
--   * current_version_id: pointer into activity_versions for the published
--     snapshot students see. Null until first publish.
-- The "unpublished changes" UI state is computed: there are unpublished
-- changes when draft_content IS NOT NULL AND draft_content differs from the
-- current version's content.
create table activities (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references users(id) on delete restrict,
  title               text not null,
  slug                text not null,
  course              text not null default 'Algebra II',
  unit                text,
  status              activity_status not null default 'draft',
  visibility          activity_visibility not null default 'private',
  current_version_id  uuid,                     -- FK added below, after activity_versions exists
  draft_content       jsonb,                    -- mutable in-progress document; null when no draft
  description         text,
  -- Phase 5 marketplace fields. Inert in Phase 1; non-null defaults so application
  -- code never has to handle null cases for them.
  is_for_sale         boolean not null default false,
  price_cents         integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,

  unique (owner_id, slug)
);

create index activities_owner_idx      on activities (owner_id) where deleted_at is null;
create index activities_visibility_idx on activities (visibility) where deleted_at is null and status = 'published';

alter table activities enable row level security;
alter table activities force row level security;

-- -----------------------------------------------------------------------------
-- activity_versions
-- -----------------------------------------------------------------------------
-- Append-only. A new row is inserted on every publish. Never updated, never
-- deleted while referenced by an activity. version_num is monotonically
-- increasing per activity_id; computed application-side as
-- max(version_num)+1 within the publish RPC.
create table activity_versions (
  id            uuid primary key default gen_random_uuid(),
  activity_id   uuid not null references activities(id) on delete cascade,
  version_num   integer not null,
  content       jsonb not null,
  created_by    uuid not null references users(id) on delete restrict,
  created_at    timestamptz not null default now(),
  unique (activity_id, version_num)
);

create index activity_versions_activity_idx on activity_versions (activity_id, version_num desc);

alter table activity_versions enable row level security;
alter table activity_versions force row level security;

-- Now safe to add the FK from activities to activity_versions.
alter table activities
  add constraint activities_current_version_fk
  foreign key (current_version_id) references activity_versions(id) on delete set null;

-- -----------------------------------------------------------------------------
-- assignments
-- -----------------------------------------------------------------------------
-- A specific instance of an activity given to a class. Phase 1: created
-- manually by the teacher (no Classroom API integration). Phase 3: created
-- automatically when the teacher uses "Assign in Classroom".
create table assignments (
  id                       uuid primary key default gen_random_uuid(),
  teacher_id               uuid not null references users(id) on delete restrict,
  activity_id              uuid not null references activities(id) on delete restrict,
  activity_version_id      uuid not null references activity_versions(id) on delete restrict,
  classroom_course_id      text,           -- null in Phase 1
  classroom_coursework_id  text,           -- null in Phase 1
  title                    text not null,
  tracking_level           tracking_level not null default 'completion',
  due_at                   timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz
);

create index assignments_teacher_idx  on assignments (teacher_id) where deleted_at is null;
create index assignments_activity_idx on assignments (activity_id) where deleted_at is null;

alter table assignments enable row level security;
alter table assignments force row level security;

-- -----------------------------------------------------------------------------
-- assignment_students
-- -----------------------------------------------------------------------------
-- Per-assignment opaque token <-> Classroom student ID mapping.
-- *** This is the privacy-critical table. ***
-- Phase 1: empty (no Classroom API yet). Phase 3: populated when assignment
-- is created from a roster fetch.
create table assignment_students (
  id                       uuid primary key default gen_random_uuid(),
  assignment_id            uuid not null references assignments(id) on delete cascade,
  classroom_student_id     text not null,
  opaque_token             text not null unique,
  display_name             text,                  -- cached from roster
  classroom_submission_id  text,                  -- for grade passback
  created_at               timestamptz not null default now(),
  unique (assignment_id, classroom_student_id)
);

create index assignment_students_assignment_idx on assignment_students (assignment_id);
create index assignment_students_token_idx      on assignment_students (opaque_token);

alter table assignment_students enable row level security;
alter table assignment_students force row level security;

-- -----------------------------------------------------------------------------
-- submissions
-- -----------------------------------------------------------------------------
-- Student responses. Inserted by the submission API endpoint via service role
-- (students aren't authenticated). Read by the assigning teacher.
--
-- Identity model:
--   * Phase 1 link-share: opaque_token IS NULL, display_name IS NOT NULL
--     (student typed their name on the published HTML)
--   * Phase 3 Classroom-roster: opaque_token IS NOT NULL, display_name may be
--     NULL (canonical name lives in assignment_students)
--   * Either way, identity is non-null. Enforced by the CHECK constraint below.
--
-- responses jsonb shape (locked, validated by ingest function before insert):
--   {
--     "schemaVersion": 1,
--     "blanks": {
--       "<blank_uuid>": { "answer": "x+2", "correct": true },
--       ...
--     }
--   }
-- Keyed by blank.id from the document so per-blank aggregation queries work
-- even when blocks are reordered between document versions.
create table submissions (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid references assignments(id) on delete cascade,  -- nullable: Phase 1 link-share has no assignment
  activity_id     uuid not null references activities(id) on delete restrict,
  opaque_token    text,             -- nullable until Phase 3
  display_name    text,             -- self-typed name when no token
  responses       jsonb not null,
  score           numeric(5,4),     -- 0.0000 to 1.0000
  submitted_at    timestamptz not null default now(),
  -- Diagnostic fields for abuse detection only. NOT for analytics.
  user_agent      text,
  ip_hash         text,             -- hash of IP (sha256 with rotating salt), never raw IP

  -- Identity must be present in some form.
  constraint submissions_identity_present
    check (opaque_token is not null or (display_name is not null and length(trim(display_name)) > 0))
);

create index submissions_assignment_idx on submissions (assignment_id, submitted_at desc);
create index submissions_activity_idx   on submissions (activity_id, submitted_at desc);
create index submissions_token_idx      on submissions (opaque_token) where opaque_token is not null;

alter table submissions enable row level security;
alter table submissions force row level security;

-- -----------------------------------------------------------------------------
-- audit_log
-- -----------------------------------------------------------------------------
-- Append-only. Every state change writes one row. Service role only — no
-- client policies are defined, so RLS blocks all non-service-role access.
create table audit_log (
  id          bigserial primary key,
  actor_id    uuid references users(id),
  action      audit_action not null,
  target_type text,
  target_id   uuid,
  metadata    jsonb,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index audit_log_actor_idx  on audit_log (actor_id, created_at desc);
create index audit_log_action_idx on audit_log (action, created_at desc);

alter table audit_log enable row level security;
alter table audit_log force row level security;
-- No policies = no access for any non-service role. Intentional.
