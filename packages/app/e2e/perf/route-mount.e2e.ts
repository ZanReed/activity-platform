// =============================================================================
// perf/route-mount.e2e.ts — every production route still mounts after the split
// -----------------------------------------------------------------------------
// S8 turned every teacher route into a lazily-imported chunk. The failure that
// creates is specific and silent: a bad dynamic import, a circular dependency,
// or a missing default export produces a route that renders nothing IN THE
// PRODUCTION BUILD while dev mode (unbundled, unhashed) stays perfectly happy.
// Nobody notices until a teacher opens the page after a deploy.
//
// WHY THIS SPEC IS NOT THE OBVIOUS ONE. The obvious version — visit each route,
// assert no console errors — is VACUOUS here, and the plan's first draft had
// exactly that bug. Every teacher route is wrapped in RequireAuth, which
// renders <Navigate to="/"> when there is no session: an unauthenticated visit
// never mounts the lazy child at all, so the assertion passes with flying
// colours while the chunk is completely broken. Same family as this repo's
// other vacuously-green checks (the empty-activity leak scan; verify-0022's C1).
//
// So each case does two things that cannot both pass on a broken chunk:
//   1. Signs in first, so RequireAuth lets the route through.
//   2. Asserts the route's own lazy chunk was actually FETCHED over the
//      network. That is the direct evidence the split works — independent of
//      whatever the route then chooses to render, which depends on backend
//      data this lane deliberately does not have.
//
// Console errors are collected and asserted too, but filtered to the errors a
// broken CHUNK produces. A route whose data fetch fails against a stubbed
// backend is not what this spec is about, and folding that in would make the
// signal unreadable.
// =============================================================================

import { test, expect, type ConsoleMessage, type Page } from '@playwright/test';
import { E2E_SUPABASE_URL, signInAs } from '../helpers/studentSession';

/**
 * Every route a real user can reach in a production build. Dev-only routes are
 * excluded on purpose: `import.meta.env.DEV` makes them dead expressions that
 * Rollup drops, so there is no chunk to fetch and nothing to prove.
 */
const PRODUCTION_ROUTES = [
    { path: '/', name: 'Home', lazy: false },
    { path: '/privacy', name: 'Privacy', lazy: true },
    { path: '/activities', name: 'Activities', lazy: true },
    { path: '/classes', name: 'Classes', lazy: true },
    { path: '/activity/aaaaaaaa-0000-4000-8000-00000000e2e1', name: 'ActivityEditor', lazy: true },
    {
        path: '/activity/aaaaaaaa-0000-4000-8000-00000000e2e1/print',
        name: 'ActivityPrint',
        lazy: true,
    },
    {
        path: '/activity/aaaaaaaa-0000-4000-8000-00000000e2e1/submissions',
        name: 'Submissions',
        lazy: true,
    },
    {
        path: '/activity/aaaaaaaa-0000-4000-8000-00000000e2e1/analytics',
        name: 'ActivityAnalytics',
        lazy: true,
    },
] as const;

/**
 * Errors that mean THE CHUNK failed, as opposed to the route loading fine and
 * then failing to reach a backend this lane does not run.
 */
const CHUNK_FAILURE = [
    /Failed to fetch dynamically imported module/i,
    /error loading dynamically imported module/i,
    /is not a function/i,
    /Cannot access '.*' before initialization/i, // circular import
    /undefined is not an object/i,
];

function collectConsoleErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));
    return errors;
}

test.describe('every production route mounts from its lazy chunk', () => {
    for (const route of PRODUCTION_ROUTES) {
        test(`${route.name} (${route.path})`, async ({ page }) => {
            const errors = collectConsoleErrors(page);

            // Which JS chunks the browser actually asked for during this
            // navigation. A lazy route MUST add at least one beyond the entry.
            const fetchedChunks: string[] = [];
            page.on('response', (res) => {
                const url = res.url();
                if (url.includes('/assets/') && url.endsWith('.js')) {
                    fetchedChunks.push(url.split('/').pop()!);
                }
            });

            // Without this, RequireAuth redirects and the lazy child never
            // mounts — the whole point of the hardening.
            await signInAs(page, { supabaseUrl: E2E_SUPABASE_URL });

            await page.goto(route.path);
            await page.waitForLoadState('networkidle');

            // The Suspense fallback must not be the terminal state — a hung
            // chunk is the one failure that looks like success.
            //
            // Matched by data-route-fallback, NOT by its text: several routes
            // render their own "Loading…" while fetching data, and this lane
            // has no backend, so a text selector reports a perfectly good
            // chunk as broken. (ActivityPrint failed exactly that way on the
            // first run of this spec.)
            await expect(page.locator('[data-route-fallback]')).toHaveCount(0);

            // Something rendered. Kept deliberately weak — this spec proves the
            // CHUNK works, not what the route displays with no backend.
            const bodyText = await page.locator('body').innerText();
            expect(
                bodyText.trim().length,
                `${route.name} rendered an empty body — the lazy chunk mounted nothing.`,
            ).toBeGreaterThan(0);

            if (route.lazy) {
                // The direct evidence: more than just the entry chunk was
                // fetched. On a broken dynamic import this is where it fails.
                expect(
                    fetchedChunks.length,
                    `${route.name} fetched no route chunk. Either the route is no ` +
                        `longer lazy (update this table and the shell budget, since ` +
                        `it now rides in the entry chunk) or its dynamic import broke.`,
                ).toBeGreaterThan(1);
            }

            const chunkErrors = errors.filter((e) =>
                CHUNK_FAILURE.some((re) => re.test(e)),
            );
            expect(
                chunkErrors,
                `${route.name} raised chunk-loading errors: ${chunkErrors.join(' | ')}`,
            ).toEqual([]);
        });
    }
});

/**
 * Chunks that are NOT on the render path and are excluded below.
 *
 * The service-worker registration (workbox-window plus vite-plugin-pwa's
 * virtual register module) is its own chunk, fetched because main.tsx calls
 * registerServiceWorker(). It is deliberately asynchronous and off the critical
 * path — nothing waits on it to paint — so counting it would make this
 * assertion fail for a reason that costs the student nothing. Its WEIGHT is
 * still governed, by the shell budget rows in scripts/perf-budgets.mjs.
 *
 * Discovered by the first run of this spec, which reported 4 chunks on a path
 * that renders from 1.
 */
const NON_RENDER_CHUNKS = [/pwa-register/i, /workbox-window/i];

test('the student route needs no extra chunk (it IS the shell)', async ({ page }) => {
    // The complement of the table above, and the assertion that keeps ruling D4
    // honest: if StudentViewer ever becomes lazy, a student pays a second
    // serialized round-trip on school Wi-Fi before anything renders, and the
    // shell budget silently starts guarding a router skeleton instead of the
    // thing students actually download.
    const fetchedChunks = new Set<string>();
    page.on('response', (res) => {
        const url = res.url();
        if (url.includes('/assets/') && url.endsWith('.js')) {
            const file = url.split('/').pop()!;
            // Deduped: a modulepreload and its real fetch both land here.
            if (!NON_RENDER_CHUNKS.some((re) => re.test(file))) {
                fetchedChunks.add(file);
            }
        }
    });

    await page.goto('/a/aaaaaaaa-0000-4000-8000-00000000e2e1');
    await expect(
        page.getByRole('button', { name: /sign in with google/i }),
    ).toBeVisible();

    const chunks = [...fetchedChunks];
    expect(
        chunks.length,
        `The student path fetched ${chunks.length} render-path JS chunks ` +
            `(${chunks.join(', ')}). Ruling D4 says the pre-auth screen renders ` +
            `from the entry chunk alone — one fetch, no waterfall.`,
    ).toBe(1);
});
