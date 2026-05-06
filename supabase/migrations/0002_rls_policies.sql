-- =============================================================================
-- 0002_rls_policies.sql — Row-Level Security policies
-- -----------------------------------------------------------------------------
-- Run after 0001_initial_schema.sql. RLS is already ENABLED + FORCED on every
-- user-data table by 0001. This migration adds the policies that grant
-- specific access patterns. Tables without policies in this file (audit_log,
-- allowlist) are deliberately closed to all non-service-role access.
--
-- Reminder on the model:
--   * `for select using (...)`     — which rows can be read
--   * `for insert with check (...)` — what new rows can be created
--   * `for update using (...) with check (...)`
--                                  — which rows can be updated, and to what state
--   * `for delete using (...)`     — which rows can be deleted
--
-- "Force row level security" means even the table owner can't bypass these
-- policies — only the service role (used by Edge Functions and admin tooling)
-- bypasses RLS entirely.
-- =============================================================================

-- =============================================================================
-- Permission helper functions
-- -----------------------------------------------------------------------------
-- These centralize "can the current user do X to Y" checks so that future
-- access patterns (collaborators, organizations, marketplace purchases) can be
-- added by changing a single function instead of rewriting every RLS policy
-- that touches activities or assignments.
--
-- Properties:
--   * STABLE — Postgres can cache the result within a query, so a policy that
--     evaluates the helper for every row only does the work once per distinct
--     argument.
--   * SECURITY INVOKER — the helpers run with the calling user's privileges.
--     This matters because the helpers are called from RLS policies on other
--     tables; we want the helper to see exactly what the caller would see, not
--     what the function owner could see.
--   * Phase 1 implementations are intentionally simple (just owner checks).
--     The function bodies are where Phase 3 (collaborators) and Phase 4+
--     (organizations) extend access — by adding OR-clauses here, every policy
--     that uses the helper inherits the new access path automatically.
-- =============================================================================

-- Can the current user read this activity?
-- Phase 1: only the owner.
-- Phase 3+: also collaborators (any role); also public/marketplace activities.
create or replace function can_read_activity(p_activity_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1 from activities a
    where a.id = p_activity_id
      and a.owner_id = auth.uid()
      and a.deleted_at is null
  );
$$;

-- Can the current user edit this activity?
-- Phase 1: only the owner.
-- Phase 3+: also collaborators with editor (not viewer) role.
-- Note: a marketplace purchaser can READ but not EDIT a public activity, so
-- this is a strictly tighter check than can_read_activity.
create or replace function can_edit_activity(p_activity_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1 from activities a
    where a.id = p_activity_id
      and a.owner_id = auth.uid()
      and a.deleted_at is null
  );
$$;

-- Can the current user access this assignment?
-- Phase 1: only the assigning teacher.
-- Phase 3+: also co-teachers if/when we add team teaching.
-- "Access" here means "see the assignment, its student tokens, and its
-- submissions" — i.e., the full teacher view of an assignment.
create or replace function can_access_assignment(p_assignment_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1 from assignments a
    where a.id = p_assignment_id
      and a.teacher_id = auth.uid()
      and a.deleted_at is null
  );
$$;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
-- Read: a user can read their own row. Admins can read all (Phase 2+ admin
-- panel; harmless to allow now since there are no admin users yet).
create policy users_select_self on users
  for select using (
    id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Update: a user can update their own display_name. Role and email are
-- immutable from the client (the WITH CHECK clause asserts role doesn't
-- change; email isn't checked here because it has a unique constraint and
-- shouldn't be touched by client UPDATEs anyway — convention, enforced by
-- application code).
create policy users_update_self on users
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from users where id = auth.uid())
  );

-- Insert: service role only (handled by signup trigger). No client policy.
-- Delete: service role only (handled by an admin endpoint). No client policy.

-- -----------------------------------------------------------------------------
-- activities
-- -----------------------------------------------------------------------------
-- Read: owner sees their non-deleted rows. Phase 3+ adds public/marketplace
-- policies as additional rows in this same table-policy set.
create policy activities_select_own on activities
  for select using (owner_id = auth.uid() and deleted_at is null);

-- Insert: any authenticated user can create activities they own.
create policy activities_insert_own on activities
  for insert with check (owner_id = auth.uid());

-- Update: owner only, on their non-deleted rows. WITH CHECK prevents
-- transferring ownership by UPDATE (forging owner_id).
create policy activities_update_own on activities
  for update using (owner_id = auth.uid() and deleted_at is null)
  with check (owner_id = auth.uid());

-- Delete: no client policy. "Deletion" is a soft delete via UPDATE
-- deleted_at = now(), which is handled by the update policy above.

-- -----------------------------------------------------------------------------
-- activity_versions
-- -----------------------------------------------------------------------------
-- Read: anyone who can read the parent activity can read its versions.
create policy activity_versions_select_own on activity_versions
  for select using (can_read_activity(activity_id));

-- Insert: anyone who can edit the parent activity can publish a new version,
-- and created_by must be the inserting user (no impersonation).
-- Uses can_edit_activity (not can_read) — Phase 3+ marketplace purchasers
-- will be able to read activities but not publish new versions of them.
create policy activity_versions_insert_own on activity_versions
  for insert with check (
    created_by = auth.uid()
    and can_edit_activity(activity_id)
  );

-- No update policy. No delete policy. Versions are immutable historical
-- snapshots; the only way to "remove" them is to soft-delete the parent
-- activity, after which the 30-day cron eventually hard-deletes them.

-- -----------------------------------------------------------------------------
-- assignments
-- -----------------------------------------------------------------------------
create policy assignments_select_own on assignments
  for select using (teacher_id = auth.uid() and deleted_at is null);

create policy assignments_insert_own on assignments
  for insert with check (teacher_id = auth.uid());

create policy assignments_update_own on assignments
  for update using (teacher_id = auth.uid() and deleted_at is null)
  with check (teacher_id = auth.uid());

-- No client delete policy. Soft-delete via UPDATE deleted_at.

-- -----------------------------------------------------------------------------
-- assignment_students  *** privacy-critical ***
-- -----------------------------------------------------------------------------
-- Access is gated through the parent assignment's teacher_id, NEVER through
-- the activity. An activity author who isn't the assigning teacher cannot
-- read these rows even for activities they created and even when their
-- activity is publicly listed in the marketplace (Phase 5+). This is the
-- structural separation that makes the marketplace privacy story work.
create policy assignment_students_select_teacher on assignment_students
  for select using (can_access_assignment(assignment_id));

-- Inserts handled via service role at assignment creation time (Phase 3).
-- No client insert/update/delete policies.

-- -----------------------------------------------------------------------------
-- submissions
-- -----------------------------------------------------------------------------
-- Read: assigning teacher (or co-teacher in future) sees rows for their
-- assignments.
create policy submissions_select_teacher on submissions
  for select using (
    assignment_id is not null
    and can_access_assignment(assignment_id)
  );

-- Phase 1 also: link-shared submissions (assignment_id IS NULL) belong to
-- anyone who can read the activity. Phase 1 that's just the owner; Phase 5+
-- this could include marketplace purchasers if we ever let them collect
-- submissions on activities they bought (probably not — but the helper
-- absorbs that policy decision in one place).
create policy submissions_select_activity_owner on submissions
  for select using (
    assignment_id is null
    and can_read_activity(activity_id)
  );

-- All inserts go through the service role via the ingest_submission RPC
-- (defined in 0003_functions.sql). No client insert policy.
-- No update policy. No delete policy. Submissions are historical.

-- -----------------------------------------------------------------------------
-- audit_log, allowlist
-- -----------------------------------------------------------------------------
-- No policies. RLS is enabled and forced; the absence of any policy means
-- only the service role can read or write these tables. This is intentional:
-- audit_log is for security review, allowlist is invite-only access control.
