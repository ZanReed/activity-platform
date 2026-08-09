import { defineConfig, devices } from '@playwright/test';

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
const STUDENT_SUPABASE_URL = 'http://127.0.0.1:54321';

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
            // The student and service-worker lanes have their own projects and
            // servers; keep them out of the editor lane rather than pointing
            // them at the wrong baseURL. (Omitting the sw entry here ran those
            // specs twice — once correctly, once against the dev server that
            // has no worker at all.)
            testIgnore: ['**/student/**', '**/sw/**', '**/perf/**'],
        },
        {
            name: 'student',
            testMatch: '**/student/**/*.e2e.ts',
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
    ],
});
