-- =============================================================================
-- 0105_fk_indexes.sql — an index under every single-column foreign key in
-- public that had none (code review 2026-11-26, D6)
-- -----------------------------------------------------------------------------
-- Postgres indexes the REFERENCED side of a foreign key (it must be unique)
-- but not the REFERENCING side. So every delete of a parent row has to find
-- its children with a sequential scan of the child table, once per parent
-- row, inside the deleting transaction: `on delete cascade` and `set null`
-- scan to act, and `no action` scans to refuse.
--
-- The delete paths that hit these are real and nightly: purge_soft_deleted
-- (03:00 UTC) removes accounts, activities and their versions; the check
-- prunes, when armed, remove section_checks rows that dol_pass points at.
-- Every table here is small today, which is why nothing is slow yet. This
-- lands before the first night the purge has class-sized work, not after.
--
-- Read live 2026-11-26 (pg_constraint against pg_index): 19 single-column
-- foreign keys in public whose column leads no index. The review named the
-- nine on bulk-delete paths (dol_pass ×2, mixed_session_items.student_id,
-- class_activities.activity_id, practice_sessions.class_id,
-- dol_practice_sessions ×2, help_requests.activity_id,
-- work_photos.activity_id). The other ten reference users or versions and are
-- scanned by the same account purge (a `set null` on a teacher's id still has
-- to find the rows), so they are indexed too, and verify-0105 can then state
-- the whole rule — "no unindexed single-column foreign key in public" —
-- rather than a hand-kept list that the next table quietly escapes (P4).
--
-- Two more are PARTIAL-only: `class_members.student_id` (where removed_at is
-- null) and `classes.teacher_id` (where deleted_at is null). A delete's FK
-- check looks rows up by the column alone, which those predicates do not
-- imply, so it cannot use them; class_members cascades on every account purge.
-- They get plain indexes too (21 in all). The dead `assignments` table's two
-- are left alone: its retirement is already filed in TODOS, and verify-0105
-- names that exemption. A partial index whose predicate is `col IS NOT NULL`
-- (activities.copied_from_activity_id, dol_pass.activity_id) IS usable, since
-- a lookup by `col = $1` implies it.
--
-- Plain CREATE INDEX, not CONCURRENTLY: a migration runs in one transaction,
-- which CONCURRENTLY refuses, and every table here is small enough that the
-- brief lock is nothing. IF NOT EXISTS so a re-run is a no-op.
--
-- No column, table, grant or function changes; no personal data moves, so the
-- compliance pack is unchanged. Nothing calls these by name.
-- =============================================================================

-- The nine on bulk-delete paths (review D6).
create index if not exists dol_pass_check_id_idx
  on public.dol_pass (check_id);
create index if not exists dol_pass_version_id_idx
  on public.dol_pass (version_id);
create index if not exists mixed_session_items_student_id_idx
  on public.mixed_session_items (student_id);
create index if not exists class_activities_activity_id_idx
  on public.class_activities (activity_id);
create index if not exists practice_sessions_class_id_idx
  on public.practice_sessions (class_id);
create index if not exists dol_practice_sessions_activity_id_idx
  on public.dol_practice_sessions (activity_id);
create index if not exists dol_practice_sessions_version_id_idx
  on public.dol_practice_sessions (version_id);
create index if not exists help_requests_activity_id_idx
  on public.help_requests (activity_id);
create index if not exists work_photos_activity_id_idx
  on public.work_photos (activity_id);

-- Covered only by a partial index a delete cannot use.
create index if not exists class_members_student_id_idx
  on public.class_members (student_id);
create index if not exists classes_teacher_id_idx
  on public.classes (teacher_id);

-- The rest: scanned by the account and activity purges.
create index if not exists activities_copied_from_version_id_idx
  on public.activities (copied_from_version_id);
create index if not exists class_activities_added_by_idx
  on public.class_activities (added_by);
create index if not exists class_probes_opened_by_idx
  on public.class_probes (opened_by);
create index if not exists class_hook_use_marked_by_idx
  on public.class_hook_use (marked_by);
create index if not exists mixed_sessions_revision_idx
  on public.mixed_sessions (revision);
create index if not exists dol_pass_granted_by_idx
  on public.dol_pass (granted_by);
create index if not exists help_requests_activity_version_id_idx
  on public.help_requests (activity_version_id);
create index if not exists help_requests_ended_by_teacher_idx
  on public.help_requests (ended_by_teacher);
create index if not exists photo_handoffs_activity_id_idx
  on public.photo_handoffs (activity_id);
create index if not exists photo_handoffs_activity_version_id_idx
  on public.photo_handoffs (activity_version_id);
