/**
 * Edge Function NAMES the app calls — the deploy-surface half of the URL
 * (`functionsBase` supplies the origin half; it lives in lib/supabase.ts,
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
export const GET_ACTIVITY_FUNCTION = 'get-activity';

/**
 * The region every Edge Function call runs in: the DATABASE's region (audit
 * #14, ruled 2026-10-18). Unpinned, a function runs nearest the caller — from
 * NZ that is Sydney, and every serial DB call then crosses the Pacific (~200 ms
 * each; a check makes three). Pinned, the browser crosses once and the DB calls
 * are local. Measured from Auckland: break-even at one DB call, ~400 ms saved
 * on a check. `us-east-2` is served (x-sb-edge-region proves it) but is not on
 * Supabase's published region list; if it is ever refused, every function call
 * fails loudly and this constant is the one-line fix. A pinned region does not
 * fail over — moot while the database lives in that same region. MOVES WITH
 * THE DATABASE: a project migration to another region must change this.
 * Full record: DECISIONS.md → "Edge Functions pinned to the database region".
 */
export const FUNCTION_REGION = 'us-east-2';

/**
 * The URL of one Edge Function, region-pinned. EVERY function URL the app
 * builds goes through here (`edgeFunctionUrls.test.ts` sweeps for hand-built
 * ones). The pin is a query parameter, not the `x-region` header, because a
 * header would have to be added to both functions' CORS allow-list (a
 * redeploy); the platform's router reads the parameter, and the handlers read
 * only their own named parameters, so it changes nothing there. Env-free so the e2e stubs can derive
 * their matched URLs from it (P2) — `base` comes from `functionsBase`.
 */
export function edgeFunctionUrl(
  base: string,
  name: string,
  params: Record<string, string> = {},
): string {
  // The pin is spread LAST so no caller's params can override it.
  const query = new URLSearchParams({ ...params, forceFunctionRegion: FUNCTION_REGION });
  return `${base}/${name}?${query.toString()}`;
}

/**
 * RPC names the app calls over PostgREST (`/rest/v1/rpc/<name>`) — same P2
 * discipline as the function names above: e2e stubs derive their matched
 * paths from here. Pinned by edgeFunctions.test.ts to a `create or replace
 * function` definition in supabase/migrations/, the RPC equivalent of the
 * functions-directory pin.
 */
export const PUBLISH_ACTIVITY_RPC = 'publish_activity';
/** S9 Drop 2 (0030): the content-surface RPCs. */
export const SHARE_ACTIVITY_RPC = 'share_activity_to_class';
export const UNSHARE_ACTIVITY_RPC = 'unshare_activity_from_class';
export const LIST_CLASS_ACTIVITIES_RPC = 'list_class_activities';
/** The course glossary's student read (0043, docs/design/glossary.md R1/EN-1):
 * one jsonb per published activity, deferred past first paint. */
export const GLOSSARY_FOR_ACTIVITY_RPC = 'glossary_for_activity';
/** The Activity Bank (0054, docs/design/activity-bank.md): copy-on-use. */
export const LIST_BANK_RPC = 'list_bank';
export const BANK_TEACHER_GUIDE_RPC = 'get_bank_teacher_guide';
export const COPY_BANK_ACTIVITY_RPC = 'copy_bank_activity';
export const SET_ACTIVITY_LISTING_RPC = 'set_activity_listing';
export const IS_BANK_LISTER_RPC = 'is_bank_lister';
/** 0055 (BK-13): a teacher opts in to (or out of) a name on their Bank cards. */
export const SET_PUBLIC_NAME_RPC = 'set_public_name';
/** The chain hook view (0057, docs/design/chain-hooks-view.md D1): the ONE
 * teacher read of hook pools, own and Bank-copied. */
export const MY_CHAIN_HOOKS_RPC = 'my_chain_hooks';
/** The student Home's per-activity status (0059, student-experience review S2):
 * own checks on activities in the caller's live classes. */
export const MY_ACTIVITY_PROGRESS_RPC = 'my_activity_progress';
/** Restore's cheap read (0060, Fable F1/F6): the caller's distinct checked
 * section ids on one version. (Its sibling my_latest_checks is called by the
 * check-activity Edge Function, not the app.) */
export const MY_CHECKED_SECTION_IDS_RPC = 'my_checked_section_ids';
/** The teacher's class progress reads (0061, docs/design/class-progress-view.md):
 * roster × assignment scoped, SECURITY DEFINER. Wrapped by lib/classProgress. */
export const CLASS_PROGRESS_RPC = 'class_progress';
export const ACTIVITY_PROGRESS_RPC = 'activity_progress';
export const CLASS_STUDENT_WORK_RPC = 'class_student_work';
export const CLASS_MISCONCEPTIONS_RPC = 'class_misconceptions';
/** First tries on one activity (0062, docs/design/first-try-view.md). */
export const ACTIVITY_FIRST_TRIES_RPC = 'activity_first_tries';
