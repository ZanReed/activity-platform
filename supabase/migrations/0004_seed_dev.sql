-- =============================================================================
-- 0004_seed_dev.sql — Development seed data
-- -----------------------------------------------------------------------------
-- Run this ONLY against your local development Supabase project, never in
-- production. It seeds the allowlist with your dev email so you can sign up
-- without going through an admin panel that doesn't exist yet.
--
-- To run only this file (skipping it in prod):
--   * In Supabase CLI, name dev-only migrations with a different prefix or
--     keep them in supabase/seeds/ instead of supabase/migrations/.
--   * The cleaner long-term option: move this file to supabase/seeds/dev.sql
--     and run it manually with `psql` against your local instance.
--
-- For now, edit the email below and run this once after 0001-0003 are applied.
-- =============================================================================

-- Replace with your actual email before running.
insert into allowlist (email, notes)
values ('[email protected]', 'Phase 1 dev seed')
on conflict (email) do nothing;

-- Add additional teachers as you onboard them. Phase 1 is invite-only.
-- insert into allowlist (email, notes)
--   values ('[email protected]', 'Algebra II teacher, Dallas ISD')
--   on conflict (email) do nothing;
