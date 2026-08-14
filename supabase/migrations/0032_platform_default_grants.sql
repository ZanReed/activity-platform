-- =============================================================================
-- 0032_platform_default_grants.sql — encode the grants live got for free
-- -----------------------------------------------------------------------------
-- WHY THIS EXISTS. Every table created before 0028 received its anon /
-- authenticated / service_role DML grants from SUPABASE'S HOSTED PLATFORM
-- DEFAULTS, never from a migration. Nothing in this repo ever wrote them down,
-- so they were invisible — until a database was rebuilt from the chain and the
-- app could not read its own tables.
--
-- On a rebuilt database (supabase CLI 2.109.0) the default ACL for `public`
-- tables is:
--     postgres=arwdDxtm | service_role=Dxtm
-- anon and authenticated absent entirely, and even service_role without
-- SELECT/INSERT/UPDATE/DELETE. The result: 10 of 11 policy-bearing tables had
-- RLS policies that COULD NEVER BE SATISFIED, because a policy can only permit
-- what a grant already allows — the dependency 0028's own header states.
--
-- Found 2026-08-14, immediately after 0031 unblocked the replay: the chain got
-- further and died on `permission denied for table users`.
--
-- THIS IS A NO-OP ON LIVE. Every grant below was READ OFF the live database
-- (`supabase db query --linked` against information_schema.role_table_grants)
-- rather than reasoned about, and GRANT is idempotent. Its whole purpose is to
-- make a rebuilt database match the live one it was always supposed to describe.
--
-- ⚠ READ THIS BEFORE "TIGHTENING" ANYTHING BELOW. Granting anon and
-- authenticated full DML on `users` or `submissions` looks alarming out of
-- context. It is live's actual, long-standing state, and it is not the access
-- control: RLS is. Every one of these tables has `enable row level security`
-- plus `force row level security`, and the policies are what decide who reads
-- and writes which row.
--
-- Granting LESS here than live has would be actively harmful, not safer: a
-- local database with narrower grants than production MASKS RLS DEFECTS. A
-- policy hole would be invisible locally (the missing grant refuses first) and
-- open in production. A test environment that is stricter than production
-- manufactures false confidence about exactly the layer this product relies on
-- for student data separation. Fidelity is the security property here.
--
-- GOING FORWARD, NEW TABLES DO NOT BELONG IN THIS FILE. 0028 revoked the
-- default privileges for anon/authenticated, so every table created after it
-- must carry its own explicit grant stanza (0030's class_activities is the
-- worked example). This migration is the bounded backfill for the pre-0028
-- tables that were silently relying on the platform.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. service_role — FULL on every existing table (live: FULL on all 19 objects)
-- -----------------------------------------------------------------------------
-- Stated as ALL TABLES rather than a list because live has no exception: the
-- service role is BYPASSRLS and is how the Edge Functions reach the cache, the
-- census, the admission tables and the read path. Idempotent for the tables
-- that already have it (class_activities, from 0030).
grant select, insert, update, delete on all tables in schema public to service_role;

-- -----------------------------------------------------------------------------
-- B. anon + authenticated — FULL on the nine policy-bearing tables
-- -----------------------------------------------------------------------------
-- Enumerated explicitly, never "all tables": the seven zero-policy tables
-- (allowlist, audit_log, student_domain, analytics_job_runs and the three
-- census/read tables) must NOT appear here — 0028 deliberately revoked them,
-- their having zero policies IS their access control, and a blanket grant would
-- silently undo the admission-boundary hardening 0027/0028 installed.
--
-- Verified against live one table at a time; anon carries the same shape as
-- authenticated on all nine, which is the platform default they inherited.
grant select, insert, update, delete on public.activities          to anon, authenticated;
grant select, insert, update, delete on public.activity_versions   to anon, authenticated;
grant select, insert, update, delete on public.assignment_students to anon, authenticated;
grant select, insert, update, delete on public.assignments         to anon, authenticated;
grant select, insert, update, delete on public.class_members       to anon, authenticated;
grant select, insert, update, delete on public.grades              to anon, authenticated;
grant select, insert, update, delete on public.section_checks      to anon, authenticated;
grant select, insert, update, delete on public.submissions         to anon, authenticated;
grant select, insert, update, delete on public.users               to anon, authenticated;

-- -----------------------------------------------------------------------------
-- C. classes — SELECT + DELETE only, preserving 0027's narrowing
-- -----------------------------------------------------------------------------
-- The one table whose live grants are NOT the platform default, because 0027
-- deliberately reshaped them: table-level INSERT is revoked (creation goes
-- through an audited RPC) and UPDATE is narrowed to the single column (name),
-- which lives at column level and is already reproduced correctly by 0027.
-- Live reads exactly: anon/authenticated = DELETE, REFERENCES, SELECT, TRIGGER,
-- TRUNCATE. Do NOT add INSERT or table-level UPDATE here — that would re-open
-- the deny-by-default writes 0027 closed, which is the single most consequential
-- line in this file.
grant select, delete on public.classes to anon, authenticated;

-- =============================================================================
-- Verification — EXPECT this to match live exactly (the query that produced it):
--
-- select table_name, grantee, string_agg(privilege_type,',' order by privilege_type)
-- from information_schema.role_table_grants
-- where table_schema='public' and grantee in ('anon','authenticated','service_role')
-- group by 1,2 order by 1,2;
--
-- Spot checks that matter most:
--   users            → anon/authenticated/service_role all with SELECT
--   classes          → anon/authenticated WITHOUT INSERT and WITHOUT table UPDATE
--   student_domain   → service_role ONLY (no anon, no authenticated)
--   allowlist        → service_role ONLY
-- =============================================================================
