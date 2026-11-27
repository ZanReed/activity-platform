-- =============================================================================
-- 0111_policies_to_authenticated.sql — the last eleven `to public` policies
-- (code review 2026-11-26, docs/reviews/2026-11-26-code-review.md B6, its
-- remainder)
-- -----------------------------------------------------------------------------
-- 0109 scoped the ten policies the advisor listed and left these eleven, on
-- activities, activity_versions, assignments, assignment_students,
-- class_activities and users, "the same one line each when next touched". This
-- is that line. Each applied to every role, so each was evaluated for `anon`:
-- always false (every expression needs auth.uid() or a helper keyed on it),
-- but evaluated. ALTER POLICY ... TO changes the roles and nothing else; every
-- USING / WITH CHECK expression is untouched (no inline check is written, the
-- helpers stay where they were). The student viewer's anonymous meta read is
-- get_activity_public_meta, a DEFINER function, and needs no policy.
--
-- After this no policy in `public` applies to `public`; verify-0111's first row
-- keeps it that way.
--
-- NOT PERSONAL DATA: no table or column (data map unchanged in content).
-- Verification: scripts/verify-0111.sql.
-- =============================================================================

alter policy activities_insert_own               on public.activities          to authenticated;
alter policy activities_select_own               on public.activities          to authenticated;
alter policy activities_update_own               on public.activities          to authenticated;
alter policy activity_versions_insert_own        on public.activity_versions   to authenticated;
alter policy activity_versions_select_own        on public.activity_versions   to authenticated;
alter policy assignment_students_select_teacher  on public.assignment_students to authenticated;
alter policy assignments_insert_own              on public.assignments         to authenticated;
alter policy assignments_select_own              on public.assignments         to authenticated;
alter policy assignments_update_own              on public.assignments         to authenticated;
alter policy class_activities_select             on public.class_activities    to authenticated;
alter policy users_select_self                   on public.users               to authenticated;
