-- =============================================================================
-- 0109_advisor_cleanups.sql — the live database advisor's two code findings
-- (code review 2026-11-26, docs/reviews/2026-11-26-code-review.md B6)
-- -----------------------------------------------------------------------------
--   §A  function_search_path_mutable. The four functions below are the only
--       ones without a pinned search_path (all 194 SECURITY DEFINER functions
--       pin theirs; these four are invoker). Pinned with ALTER FUNCTION, so no
--       body is restated. The two that name no object get '' (nothing to
--       resolve); the two that read a table get `public`, the repo's form.
--       Trade, accepted: a SET clause stops a SQL function being inlined, so
--       analytics_default_zone() — a constant — is now a call in the nightly
--       rollup's zone lookups. One call per user row, at night.
--   §B  multiple_permissive_policies / anon evaluation. Every policy on
--       class_members, classes, section_checks and submissions applied to
--       every role (`to public`), so each was evaluated for `anon` too —
--       always false with auth.uid() null, but evaluated. Scoped `to
--       authenticated` with ALTER POLICY ... TO, which changes the roles and
--       nothing else: every USING / WITH CHECK expression is untouched (no
--       inline check is written; the helpers stay where they were).
--
-- NOT CHANGED: the other eleven `to public` policies (activities,
-- activity_versions, assignments, assignment_students, class_activities,
-- users) — the advisor did not list them; the same one line each when next
-- touched. Leaked-password protection is a dashboard setting (the author's).
--
-- NOT PERSONAL DATA: no table or column (data map unchanged).
-- Verification: scripts/verify-0109.sql.
-- =============================================================================

-- §A ---------------------------------------------------------------------------
alter function public.analytics_day(timestamptz, text)  set search_path = '';
alter function public.analytics_default_zone()          set search_path = '';
alter function public.analytics_rolled_boundary()       set search_path = public;
alter function public.users_timezone_guard()            set search_path = public;

-- §B ---------------------------------------------------------------------------
alter policy class_members_select_self          on public.class_members  to authenticated;
alter policy class_members_select_teacher       on public.class_members  to authenticated;
alter policy class_members_update_teacher       on public.class_members  to authenticated;
alter policy classes_select_member              on public.classes        to authenticated;
alter policy classes_select_own                 on public.classes        to authenticated;
alter policy classes_update_own                 on public.classes        to authenticated;
alter policy section_checks_select_student      on public.section_checks to authenticated;
alter policy section_checks_select_teacher      on public.section_checks to authenticated;
alter policy submissions_select_activity_owner  on public.submissions    to authenticated;
alter policy submissions_select_teacher         on public.submissions    to authenticated;
