-- =============================================================================
-- 0103_audit_ip_hash_scrub.sql — clear the last IP hashes in audit_log
-- -----------------------------------------------------------------------------
-- Found 2026-11-20 while correcting the privacy page's IP row: live audit_log
-- held 7 rows with an ip_hash, all `submission.create` events from
-- 2026-06-16..2026-07-29, written by the old anonymous ingest path
-- (0003's ingest_submission). 0029 deleted the submissions and that path,
-- but not these audit rows' hashes. retention-policy.md promised the hash is
-- "scrubbed at 30 days", and no scrub job ever existed.
--
-- Nothing writes ip_hash any more (no function body names it; verify-0103
-- checks that), so a one-off clear closes the gap for good: no job is needed.
-- The rows themselves stay (their 2-year window, 0024); only the hash goes.
-- Author's yes, 2026-11-20 ("Yes, clear them").
--
-- Verification: scripts/verify-0103.sql.
-- =============================================================================

update audit_log set ip_hash = null where ip_hash is not null;
