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
            // The student lane has its own project + server; keep it out of
            // the editor lane rather than pointing it at the wrong baseURL.
            testIgnore: '**/student/**',
        },
        {
            name: 'student',
            testMatch: '**/student/**/*.e2e.ts',
            use: { ...devices['Desktop Chrome'], baseURL: STUDENT_BASE_URL },
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
            command: `pnpm dev --port ${STUDENT_PORT} --strictPort`,
            url: `${STUDENT_BASE_URL}/`,
            // NEVER reused: the pinned env below is the whole point, and a
            // server someone else started would not have it.
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
                VITE_SUPABASE_URL: STUDENT_SUPABASE_URL,
                VITE_SUPABASE_ANON_KEY: 'e2e-anon-key',
            },
        },
    ],
});
