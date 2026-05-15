-- =============================================================================
-- 0006_account_tier.sql — Per-user tier attribute (free / supporter /
-- institutional / comp)
-- -----------------------------------------------------------------------------
-- Runs after 0005. Adds the account_tier enum and the column on users, and
-- extends the users_update_self RLS policy to prevent client-side tier
-- escalation (same protection model as the existing `role` column).
--
-- account_tier is separate from user_role. Role describes what a user CAN DO
-- (teacher, admin). Tier describes what LIMITS APPLY (free, supporter,
-- institutional, comp). Phase 1 is inert — no tier-gated features exist
-- yet, so every user is effectively 'free' regardless of column value.
-- The field exists now so that:
--   * Collaborator-teacher accounts can be flagged 'comp' immediately, and
--     when premium features land they automatically have access without
--     scrambling to backfill.
--   * Phase 2.8 storage quotas, Phase 4 institutional pricing, and the
--     supporter/Buy-Me-a-Coffee tier slot in without a migration that
--     would also need to backfill values for every existing user.
--
-- Tier values:
--   'free'          — default. Individual teachers, no paid arrangement.
--   'supporter'     — optional paid individual tier (Phase 2+).
--   'institutional' — granted via paid district org membership (Phase 4+).
--   'comp'          — complimentary access. Collaborator teachers, founding
--                     contributors, beta partners. Set manually by admin
--                     tooling; no self-service path. Persists across org
--                     changes (a 'comp' user doesn't lose access if their
--                     district later signs up for an institutional tier).
--
-- See ROADMAP.md "Sustainability model" cross-cutting concern for the
-- broader phasing context.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enum + column
-- -----------------------------------------------------------------------------
create type account_tier as enum ('free', 'supporter', 'institutional', 'comp');

alter table users
  add column account_tier account_tier not null default 'free';

-- -----------------------------------------------------------------------------
-- RLS: extend users_update_self to lock down account_tier
-- -----------------------------------------------------------------------------
-- Postgres has no ALTER POLICY ... ADD CHECK syntax; the only way to change
-- a policy's clauses is drop + recreate. The new policy is the existing one
-- with an additional account_tier guard in WITH CHECK. Tier changes flow
-- through service-role admin tooling only — same model as the role column.

drop policy users_update_self on users;

create policy users_update_self on users
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from users where id = auth.uid())
    and account_tier = (select account_tier from users where id = auth.uid())
  );
