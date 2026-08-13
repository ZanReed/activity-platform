-- =============================================================================
-- 0028_grant_hygiene.sql — make the grant matrix match what the verify scripts
--                          have always asserted (belt-and-braces, restored)
-- -----------------------------------------------------------------------------
-- Found 2026-08-13 by the FIRST live run of `pnpm verify:auth --target live`
-- (the identity slice built that runner; this is its first real post-migration
-- pass). Two findings, neither a live exposure, both real drift:
--
--   A. EVERY zero-policy table carries Supabase's default GRANT ALL to
--      anon + authenticated. Supabase runs
--        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES
--          TO anon, authenticated, service_role
--      so any table created without an explicit REVOKE inherits it. This repo
--      has always relied on RLS ENABLED + FORCED + ZERO POLICIES as the real
--      containment, and that containment holds — verified empirically before
--      writing this migration: as `authenticated`, activity_version_reads
--      returned 0 rows while the owner saw 3. Nothing was readable.
--      But verify-0017 §C6 asserts "no policies AND no grant", and the second
--      half was never true on this project. RLS was the only gate.
--
--      Why that matters even though nothing leaked: the day anyone adds a
--      narrow policy to one of these tables (a teacher-visible audit view, a
--      student-visible census row), the wide grant is suddenly the whole
--      exposure and the policy is the only thing standing. Defense in depth is
--      the point — the assertion was right and the schema was wrong.
--
--   B. 0027 introduced ONE function-grant miss: set_classes_updated_at() (the
--      BEFORE UPDATE stamp trigger) never got the
--      `revoke execute ... from public, anon, authenticated` line that 0026
--      applies to every function it creates, so it showed up as a second
--      anon-reachable function and tripped verify-0017's D-acl-completeness
--      ("exactly one: get_activity_public_meta, the documented 3.2A
--      exception"). Not exploitable — calling it directly raises
--      "trigger functions can only be called as triggers" — but it is exactly
--      the drift that check exists to catch, and it is a same-day regression.
--
-- SCOPE — the SEVEN zero-policy tables, enumerated from live state, not from
-- memory (the list was checked with a catalog query; `activity_version_items`
-- is the real name, not the `_item_map` a doc once called it):
--   activity_version_census · activity_version_items · activity_version_reads
--   allowlist · analytics_job_runs · audit_log · student_domain
--
-- POLICY-BEARING TABLES ARE DELIBERATELY UNTOUCHED. Their anon/authenticated
-- grants are load-bearing: RLS policies can only permit what a grant already
-- allows, so revoking there would break every client read. `classes` in
-- particular carries the deliberately-shaped grants 0027 just installed
-- (UPDATE narrowed to (name), INSERT revoked) — do not widen or re-revoke it.
--
-- SAFETY — every access path to the seven is a SECURITY DEFINER function
-- (runs as owner, bypasses grants) or the service role (BYPASSRLS, grants
-- retained below); grep-verified before writing: get-activity reaches
-- activity_version_reads with a service-role client, write_version_census /
-- run_analytics_maintenance / get_activity_analytics are DEFINER, the
-- admission trigger reads allowlist + student_domain as
-- supabase_auth_admin, and audit_log is written only by DEFINER RPCs.
--
-- IDEMPOTENT: REVOKE on an absent privilege is a no-op, so re-running is safe.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Revoke client-role grants on the zero-policy tables.
--    service_role KEEPS its grants (Edge Functions write the cache + census
--    through it). postgres/owner is unaffected.
-- -----------------------------------------------------------------------------
revoke all on public.activity_version_census from anon, authenticated;
revoke all on public.activity_version_items  from anon, authenticated;
revoke all on public.activity_version_reads  from anon, authenticated;
revoke all on public.allowlist               from anon, authenticated;
revoke all on public.analytics_job_runs      from anon, authenticated;
revoke all on public.audit_log               from anon, authenticated;
revoke all on public.student_domain          from anon, authenticated;

-- Stop the platform default from re-granting on FUTURE tables created by this
-- role in this schema. Deliberately scoped to the role running migrations, so
-- it cannot surprise anything Supabase itself creates under other roles.
-- (S9 note: the demolition and content-surface migrations both create or drop
-- tables — this line is why neither has to remember the revoke.)
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- -----------------------------------------------------------------------------
-- B. 0027's missing function revoke (finding B).
--    A trigger function needs no EXECUTE grant to fire: triggers run with the
--    privileges of the table owner, so this is safe as well as correct.
-- -----------------------------------------------------------------------------
revoke execute on function public.set_classes_updated_at() from public, anon, authenticated;

-- =============================================================================
-- EXPECTED AFTER APPLY (proved by scripts/verify-0028.sql, and by the two
-- verify-0017 sections that have been red since this drift began):
--   * verify-0017 §C6 cache_denied_to_authenticated / _to_anon → PASS
--   * verify-0017 §D-acl-completeness anon_reachable_functions → PASS
--     (exactly one: get_activity_public_meta)
--   * `pnpm verify:auth --target live` → 58 passed, 0 failed across 5 scripts
-- =============================================================================
