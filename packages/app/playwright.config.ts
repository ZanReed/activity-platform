import { defineConfig, devices } from '@playwright/test';
import { STUB_LANE_SUPABASE_URL } from './e2e/helpers/e2eOrigins';
import { LOCAL_ANON_KEY, LOCAL_SUPABASE_URL } from './e2e/integration/contract';

// ============================================================================
// Playwright config — the editor interaction harness (slice-6 stage 0).
// ----------------------------------------------------------------------------
// The repo's vitest suite is jsdom (no layout, no real gestures). The
// Notion-hybrid editor is almost entirely interaction, so this harness drives
// the real /playground editor in a headless browser. It pays forward to every
// future editor slice — each new gesture (click=edit, grip=select, drag-snap,
// Advanced-open) gets a spec here.
//
// Kept OUT of the default `pnpm test` (which stays fast jsdom): run explicitly
// with `pnpm --filter @activity/app test:e2e`. The webServer block auto-starts
// the vite dev server (reusing one already running locally).
// ============================================================================

// Port is env-overridable so a parallel git worktree can drive ITS OWN dev
// server (on a free port) instead of reusing whatever checkout already holds
// 5173 — otherwise the reused server serves a different worktree's code and the
// run silently tests the wrong tree. Defaults to 5173, so normal runs are
// unchanged.
const PORT = process.env.E2E_PORT ?? '5173';
const BASE_URL = `http://localhost:${PORT}`;

// The signed-in student lane (S6 V5) runs on its OWN dev server, one port up,
// for one reason: its Supabase env must be PINNED. The harness writes a
// session into the storage key supabase-js derives from the configured URL, so
// that URL has to be a known value — and a reused dev server carrying the
// author's real .env.local would derive a different key and silently land
// every student spec on the sign-in screen. Vite gives process env precedence
// over .env files, so passing it here wins.
//
// The editor lane keeps reusing whatever server is already up, so normal local
// iteration on the 200+ existing specs is unchanged.
const STUDENT_PORT = String(Number(PORT) + 1);
const STUDENT_BASE_URL = `http://localhost:${STUDENT_PORT}`;
// IMPORTED, never retyped (P2). The stub lanes' Supabase origin must be an
// address NOTHING listens on — see e2e/helpers/e2eOrigins.ts for why, and for
// the 2026-08-18 collision with the integration lane's real stack that this
// separation ended.
const STUDENT_SUPABASE_URL = STUB_LANE_SUPABASE_URL;

// The service-worker lane (S6 V9) runs against a PRODUCTION BUILD served by
// `vite preview`, because the worker only exists there. vite-plugin-pwa's own
// guidance is that a dev-mode worker diverges from the generated one, so specs
// passing against dev would say nothing about what students receive — and a
// stuck-stale shell is precisely the failure that survives to production
// because nobody reopens the app offline during review.
//
// It costs a build per run, which is why it is its own project rather than
// something the other 200+ specs pay for.
const SW_PORT = String(Number(PORT) + 2);
const SW_BASE_URL = `http://localhost:${SW_PORT}`;

// E2E_SKIP_BUILD lets the preview server serve a dist/ that ALREADY EXISTS.
// CI's `check` job builds the app to run the size budgets against it, then
// uploads dist/ as an artifact; the perf job downloads it and serves it. Same
// bytes, one build instead of two — and it also means the lane measures the
// exact artifact the budgets passed, rather than a rebuild that merely ought to
// be identical. Locally the flag is unset, so `playwright test` still builds.
const PREVIEW_COMMAND = process.env.E2E_SKIP_BUILD
    ? `pnpm preview --port ${SW_PORT} --strictPort`
    : `pnpm build && pnpm preview --port ${SW_PORT} --strictPort`;

// The S9 Drop 5 integration lane (D-11): a dev server against the REAL local
// Supabase stack (supabase start), with the stack's well-known demo anon key.
// Registered ONLY when explicitly requested — the lane is LOCAL-ONLY (DX P6),
// needs Docker, and must never turn a plain `playwright test` sweep red on a
// machine without it. `test:e2e:integration` is the front door.
const INTEGRATION_REQUESTED =
    process.argv.includes('--project=integration') ||
    process.env.E2E_INTEGRATION === '1';
const INTEGRATION_PORT = String(Number(PORT) + 3);
const INTEGRATION_BASE_URL = `http://localhost:${INTEGRATION_PORT}`;
// Its URL and anon key are IMPORTED from e2e/integration/contract.ts (see the
// webServer entry at the bottom of this file), never retyped here. They were
// duplicated until 2026-08-18, which quietly made stack.ts's own preflight
// message — "update LOCAL_ANON_KEY in e2e/integration/contract.ts to match" —
// advice that would have fixed only half the problem. contract.ts is this
// lane's one identity source by ruling D10; the config honors that now instead
// of shadowing it. (The demo key is a fixed CLI constant, and that preflight
// verifies it against `supabase status` on every run.)
//
// ⚠ AND NOTE WHAT THIS ORIGIN IS NOT. The integration lane's stack is the one
// thing that must be REACHABLE; the stub lanes above need theirs to be DEAD.
// They shared an address until 2026-08-18 — see e2e/helpers/e2eOrigins.ts.

export default defineConfig({
    testDir: './e2e',
    // Named *.e2e.ts (not *.spec.ts) so vitest's default {test,spec} glob never
    // collects these Playwright files — the two runners stay disjoint by
    // filename, no shared-config type wrangling.
    testMatch: '**/*.e2e.ts',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            // A LONGER ASSERTION TIMEOUT THAN THE 5s DEFAULT, and the reason is
            // this lane's server rather than its specs.
            //
            // The editor lane runs against `pnpm dev`, and vite compiles modules
            // ON DEMAND. The first hit of a route pays for that compile, and
            // this is by far the biggest suite here — 220+ specs across parallel
            // workers, several of them opening a route nothing has touched yet.
            // Under that load a cold first paint routinely passes 5s, so
            // `toBeAttached()` on a page that IS loading correctly times out.
            //
            // It is a test-environment artifact, not a product one: a student
            // gets the built bundle, which is what the perf lane measures with
            // its own budgets. Raising the ceiling here removes a class of
            // failure that says "element not found" when it means "vite was
            // still compiling" — the failure text points at the wrong thing,
            // which is what makes it expensive.
            expect: { timeout: 15_000 },
            // The student and service-worker lanes have their own projects and
            // servers; keep them out of the editor lane rather than pointing
            // them at the wrong baseURL. (Omitting the sw entry here ran those
            // specs twice — once correctly, once against the dev server that
            // has no worker at all.)
            testIgnore: [
                '**/student/**',
                '**/sw/**',
                '**/perf/**',
                '**/a11y/**',
                '**/integration/**',
            ],
        },
        {
            name: 'student',
            testMatch: '**/student/**/*.e2e.ts',
            use: { ...devices['Desktop Chrome'], baseURL: STUDENT_BASE_URL },
        },
        {
            // The S9 Drop 5 a11y lane (D-10): real-browser assertions for the
            // four 6.1A gaps (announcement text, keyboard path, visible
            // focus, reduced motion) + an axe scan per student surface.
            // Dev-server based on purpose — it shares the student lane's
            // pinned-env server, stays parallel-ok, and never pays the
            // preview serialization the sw/perf lanes need.
            name: 'a11y',
            testMatch: '**/a11y/**/*.e2e.ts',
            use: { ...devices['Desktop Chrome'], baseURL: STUDENT_BASE_URL },
        },
        {
            name: 'sw',
            testMatch: '**/sw/**/*.e2e.ts',
            use: { ...devices['Desktop Chrome'], baseURL: SW_BASE_URL },
            // A service worker outlives a page, so these specs must not share
            // a browser context: one spec's registration would control the
            // next spec's first navigation and make failures unattributable.
            fullyParallel: false,
            workers: 1,
        },
        {
            // The S8 perf lane. Shares the sw lane's PREVIEW SERVER rather than
            // starting a third one: both need the production build, and the
            // budget for this slice explicitly refused to add another full
            // build per PR (ruling D9).
            //
            // Serial, single worker, for the same reason the sw lane is — but
            // more sharply. These specs measure wall-clock time, and parallel
            // workers competing for CPU would add exactly the variance the
            // throttling is trying to control. A timing lane that runs beside
            // other browsers is measuring the runner, not the product.
            name: 'perf',
            testMatch: '**/perf/**/*.e2e.ts',
            use: { ...devices['Desktop Chrome'], baseURL: SW_BASE_URL },
            fullyParallel: false,
            workers: 1,
        },
        ...(INTEGRATION_REQUESTED
            ? [
                  {
                      // Anti-stub lane (D-11/E-5): real local stack, real
                      // trigger, real RLS, real Edge Functions. Serial — the
                      // per-run `supabase db reset` (DX D9) makes the world
                      // deterministic, and parallel workers would race it.
                      name: 'integration',
                      testMatch: '**/integration/**/*.e2e.ts',
                      use: {
                          ...devices['Desktop Chrome'],
                          baseURL: INTEGRATION_BASE_URL,
                      },
                      fullyParallel: false,
                      workers: 1,
                  },
              ]
            : []),
    ],
    webServer: [
        {
            command: `pnpm dev --port ${PORT} --strictPort`,
            url: `${BASE_URL}/playground`,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
        {
            command: PREVIEW_COMMAND,
            url: `${SW_BASE_URL}/`,
            reuseExistingServer: false,
            // Builds the whole app first — slower than the dev lanes by design.
            // (Unless E2E_SKIP_BUILD is set; see PREVIEW_COMMAND above.)
            timeout: 300_000,
            env: {
                VITE_SUPABASE_URL: STUDENT_SUPABASE_URL,
                VITE_SUPABASE_ANON_KEY: 'e2e-anon-key',
                // Pinned EMPTY (→ no district hint): the dev server would
                // otherwise inherit .env.local, making the identity rows
                // env-dependent (the env-masked-verification pitfall). The
                // rows assert the graceful no-hint behavior.
                VITE_DISTRICT_HINT: '',
            },
        },
        {
            command: `pnpm dev --port ${STUDENT_PORT} --strictPort`,
            url: `${STUDENT_BASE_URL}/`,
            // NEVER reused: the pinned env below is the whole point, and a
            // server someone else started would not have it.
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
                VITE_SUPABASE_URL: STUDENT_SUPABASE_URL,
                VITE_SUPABASE_ANON_KEY: 'e2e-anon-key',
                // Pinned EMPTY (→ no district hint): the dev server would
                // otherwise inherit .env.local, making the identity rows
                // env-dependent (the env-masked-verification pitfall). The
                // rows assert the graceful no-hint behavior.
                VITE_DISTRICT_HINT: '',
            },
        },
        ...(INTEGRATION_REQUESTED
            ? [
                  {
                      command: `pnpm dev --port ${INTEGRATION_PORT} --strictPort`,
                      url: `${INTEGRATION_BASE_URL}/`,
                      // Never reused: the env below is the point.
                      reuseExistingServer: false,
                      timeout: 120_000,
                      env: {
                          VITE_SUPABASE_URL: LOCAL_SUPABASE_URL,
                          VITE_SUPABASE_ANON_KEY: LOCAL_ANON_KEY,
                          VITE_DISTRICT_HINT: '',
                      },
                  },
              ]
            : []),
    ],
});
