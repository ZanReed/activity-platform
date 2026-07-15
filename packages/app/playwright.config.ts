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
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'pnpm dev --port 5173 --strictPort',
        url: 'http://localhost:5173/playground',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
