-- =============================================================================
-- 0101_trigger_fn_grants.sql — the two trigger functions 0091 and 0099 left
-- executable by PUBLIC
-- -----------------------------------------------------------------------------
-- Found 2026-11-20 by the full local verify run while building 0100:
-- verify-0028's anon_reachable_function_roster and verify-0017's
-- anon_reachable_functions both want exactly two anon-reachable functions
-- (get_activity_public_meta, get_class_public_meta) and found four. Live has
-- the same four.
--
--   mixed_session_items_position()  0091  BEFORE INSERT on mixed_session_items
--   users_photo_pilot_guard()       0099  BEFORE UPDATE OF photo_pilot on users
--
-- Supabase default-grants every new function to PUBLIC, so each needs its own
-- revoke stanza (0009's rule); these two shipped without one.
--
-- Harmless in practice: Postgres refuses to run a trigger function outside a
-- trigger, and a trigger fires without the caller holding EXECUTE (0027
-- finding B), so revoking changes nothing that runs. It restores the
-- roster checks, which only stay useful while they are green.
-- =============================================================================

revoke execute on function mixed_session_items_position() from public, anon, authenticated;
revoke execute on function users_photo_pilot_guard() from public, anon, authenticated;

-- =============================================================================
-- Verification: verify-0028 (anon_reachable_function_roster) and verify-0017
-- (anon_reachable_functions) go back to exactly two; re-run verify-0091 and
-- verify-0099 to show both triggers still fire.
-- =============================================================================
