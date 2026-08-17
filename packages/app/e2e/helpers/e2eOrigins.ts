// =============================================================================
// e2e/helpers/e2eOrigins.ts — the two Supabase origins the e2e lanes use, and
// the reason they must never be the same one
// -----------------------------------------------------------------------------
// This repo runs two KINDS of e2e lane, and they want opposite things from the
// address `VITE_SUPABASE_URL` points at:
//
//   * The STUB lanes (student · sw · a11y) fake a session in storage and
//     intercept the API with page.route. For them the origin must be
//     **UNREACHABLE**. Their offline rows are built on it: kill the page
//     server, open a fresh page (which has never carried route handlers, so
//     the worker can answer its navigation), and the app's API calls get a
//     genuine connection refusal — which is exactly what dead classroom Wi-Fi
//     produces, and what the viewer classifies as `offline`.
//
//   * The INTEGRATION lane wants the REAL local stack — real trigger, real
//     RLS, real Edge Functions. Its origin is `LOCAL_SUPABASE_URL` in
//     e2e/integration/contract.ts, that lane's one identity source (DX D10).
//
// UNTIL 2026-08-18 BOTH WERE `http://127.0.0.1:54321`, and the collision bit
// exactly the way you would predict. `supabase start` is running on a machine
// whenever anyone works on the integration lane — which the repo's own TODOS
// entry tells them to do before cutover-adjacent pushes. With the stack up,
// the stub lanes' "unreachable" origin answers: Kong returns a real
// `401 {"error":"Expected 3 parts in JWT; got 1"}`, because the harness's fake
// access_token is deliberately not a JWT. readClient maps 401 to
// `unauthenticated`, so both offline rows in sw/service-worker.e2e.ts failed
// with a 20-second locator timeout and a page reading "Please sign in again".
//
// CI never saw it: nothing listens on 54321 there, so the refusal is genuine
// and both rows are green. The lane was passing on an environmental accident.
//
// The fix is to stop sharing an address between "must be dead" and "must be
// alive". The stub lanes now use a port outside the Supabase CLI's whole
// default range (54321-54324, 54327, 54329), so it is dead BY CONSTRUCTION on
// any machine rather than dead by luck — and, as a bonus that matters, a stub
// lane can no longer reach a real database at all if a request ever escapes
// its route handlers.
//
// scripts/tests/e2e-origins.test.mjs pins all of this: the two origins differ,
// CI's build env matches the stub one, and neither literal is retyped anywhere
// else (P2 — this file exists so that "must match playwright.config.ts", which
// is what the comment here used to say, is an import instead of a promise).
// =============================================================================

/**
 * The Supabase origin the STUB lanes (student · sw · a11y) are BUILT against.
 *
 * ⚠ NOTHING MAY EVER LISTEN HERE. That is not a convention, it is the
 * mechanism: the offline rows prove their behavior by getting a real
 * connection refusal from this address. If a server appears on it, those rows
 * do not merely go red — they stop testing offline at all.
 *
 * Deliberately outside the Supabase CLI's default port range so that a running
 * local stack cannot claim it. `assertStubOriginIsDead()` checks it anyway,
 * because a port can always be squatted by something else.
 *
 * The value is baked into the bundle at build time (vite inlines
 * import.meta.env), so it is set in THREE places that must agree, and the
 * guard test is what keeps them agreeing: playwright.config.ts's webServer env
 * for local runs, .github/workflows/ci.yml's build env for CI, and this
 * constant for anything test-side that derives from it.
 */
export const STUB_LANE_SUPABASE_URL = 'http://127.0.0.1:54399';

/**
 * Fail with a NAMED FIX if anything is answering on the stub lanes' origin.
 *
 * The failure this replaces was a 20-second `toBeVisible` timeout on an
 * offline banner, with a page quietly showing "Please sign in again" — a
 * symptom whose real cause (a server running three directories away) is the
 * last thing anyone would guess. Same contract as the integration lane's
 * preflight (DX D7): detect it, name it, say the command.
 *
 * Cheap enough to run per-file; a dead port refuses immediately.
 */
export async function assertStubOriginIsDead(): Promise<void> {
    let status: number | null = null;
    try {
        const res = await fetch(STUB_LANE_SUPABASE_URL, {
            signal: AbortSignal.timeout(2000),
        });
        status = res.status;
    } catch {
        return; // Refused, reset, or timed out — exactly what these rows need.
    }
    throw new Error(
        `\n[stub lane] something is ANSWERING on ${STUB_LANE_SUPABASE_URL} (HTTP ${status}).\n` +
            '  These rows prove offline behavior by getting a real connection refusal\n' +
            '  from that origin, so a live server there does not just fail them — it\n' +
            '  makes them test something else entirely.\n' +
            `  FIX: stop whatever is bound to port ${new URL(STUB_LANE_SUPABASE_URL).port}\n` +
            `       (\`lsof -nP -iTCP:${new URL(STUB_LANE_SUPABASE_URL).port} -sTCP:LISTEN\`), or, if it\n` +
            '       cannot be moved, pick a new port in e2e/helpers/e2eOrigins.ts and\n' +
            "       update CI's build env — scripts/tests/e2e-origins.test.mjs will tell\n" +
            '       you if you miss a copy.\n' +
            '  (Note: the LOCAL SUPABASE STACK is fine to leave running — it lives on\n' +
            '   54321 and the integration lane needs it. These two no longer collide.)',
    );
}
