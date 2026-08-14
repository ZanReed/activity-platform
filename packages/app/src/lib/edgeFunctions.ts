/**
 * Edge Function NAMES the app calls — the deploy-surface half of the URL
 * (functionsBase() supplies the origin half; it lives in lib/supabase.ts,
 * the single env-read site).
 *
 * This module is deliberately env-free and side-effect-free so the Playwright
 * helpers can import it under node: the e2e route stubs MUST derive their
 * matched paths from these constants, never retype them (P2). The original
 * A1 bug is the cautionary tale: the app POSTed to /check-section, a function
 * that never existed (the deployed name is check-activity), and the e2e stub
 * retyped the same wrong name — so the exact test built to catch the mismatch
 * matched the bug instead (s4:7, s4a).
 *
 * edgeFunctions.test.ts pins each name to an existing supabase/functions/
 * directory, so a rename on either side goes red.
 */
export const CHECK_ACTIVITY_FUNCTION = 'check-activity';

/**
 * RPC names the app calls over PostgREST (`/rest/v1/rpc/<name>`) — same P2
 * discipline as the function names above: e2e stubs derive their matched
 * paths from here. Pinned by edgeFunctions.test.ts to a `create or replace
 * function` definition in supabase/migrations/, the RPC equivalent of the
 * functions-directory pin.
 */
export const PUBLISH_ACTIVITY_RPC = 'publish_activity';
