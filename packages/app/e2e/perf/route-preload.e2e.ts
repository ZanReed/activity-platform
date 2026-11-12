// =============================================================================
// perf/route-preload.e2e.ts — lazy landing routes: preloaded by URL, no flash
// (shell-size review R5, 2026-11-13)
// -----------------------------------------------------------------------------
// Home and JoinClass are lazy. Two promises keep that invisible:
//   1. the activity:route-preload plugin (vite.config.ts) writes a script into
//      index.html that adds <link rel="modulepreload" data-route-preload> for
//      the route's chunk when the URL matches, so it downloads BESIDE the
//      entry. The rows select the plugin's own TAGGED links: Vite's import
//      helper adds untagged modulepreload links for the same file once the
//      route renders, so an untagged selector passes with the plugin gone.
//   2. main.tsx waits for that route before the first render
//      (lib/landingRoutes.ts), so React.lazy never shows the route fallback
//      ("Loading…", held ~300 ms by React) on a landing URL.
// This lane runs the production build (the plugin is build-only).
// =============================================================================

import { expect, test, type Page } from '@playwright/test';

const taggedPreloads = (page: Page) =>
    page.$$eval('link[rel="modulepreload"][data-route-preload]', (ls) =>
        ls.map((l) => (l as HTMLLinkElement).href),
    );

/** Records whether the route fallback was EVER in the DOM, from the first byte. */
async function watchFallback(page: Page) {
    await page.addInitScript(() => {
        (window as unknown as { __fallbackSeen: boolean }).__fallbackSeen = false;
        new MutationObserver(() => {
            if (document.querySelector('[data-route-fallback]')) {
                (window as unknown as { __fallbackSeen: boolean }).__fallbackSeen = true;
            }
        }).observe(document, { childList: true, subtree: true });
    });
}
const fallbackSeen = (page: Page) =>
    page.evaluate(() => (window as unknown as { __fallbackSeen: boolean }).__fallbackSeen);

test('/ preloads the Home chunk (and not JoinClass), and never shows the route fallback', async ({ page }) => {
    await watchFallback(page);
    await page.goto('/');
    const hrefs = await taggedPreloads(page);
    expect(hrefs.some((h) => /\/assets\/Home-[^/]+\.js$/.test(h))).toBe(true);
    expect(hrefs.some((h) => /\/assets\/JoinClass-[^/]+\.js$/.test(h))).toBe(false);
    await page.waitForLoadState('networkidle');
    expect(await fallbackSeen(page)).toBe(false);
});

test('/join/<code> preloads JoinClass (and not Home), and never shows the route fallback', async ({ page }) => {
    await watchFallback(page);
    await page.goto('/join/ABC123');
    const hrefs = await taggedPreloads(page);
    expect(hrefs.some((h) => /\/assets\/JoinClass-[^/]+\.js$/.test(h))).toBe(true);
    expect(hrefs.some((h) => /\/assets\/Home-[^/]+\.js$/.test(h))).toBe(false);
    await page.waitForLoadState('networkidle');
    expect(await fallbackSeen(page)).toBe(false);
});

test('a worksheet URL preloads neither landing route', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto('/a/aaaaaaaa-0000-4000-8000-00000000e2e1');
    await page.waitForLoadState('domcontentloaded');
    expect(await taggedPreloads(page)).toEqual([]);
    expect(requested.some((u) => /\/assets\/(Home|JoinClass)-[^/]+\.js$/.test(u))).toBe(false);
});
