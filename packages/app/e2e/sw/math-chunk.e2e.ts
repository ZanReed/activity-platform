// =============================================================================
// sw/math-chunk.e2e.ts — the maths chunk fails to load at open
// -----------------------------------------------------------------------------
// Run against the PRODUCTION build, because that is where the chunk is a real
// hashed file and Vite's preload wrapper is in the path.
//
// WHAT THIS PINS (2026-11-28). Chromium remembers a failed `import()` for the
// life of the page: a second `import()` of the same URL rejects at once,
// "Failed to fetch dynamically imported module", and sends no request; the
// same file under another URL loads. WebKit does the same (and its error names
// no URL). So the 2026-11-26 retry, which asked again for the same URL, was
// inert, and the unit tests could not see it. The fix fetches the chunk again
// under `?retry=n` (viewer/src/lazy/retryableChunk.ts). These rows drop the
// request at open and prove, in a real browser, that:
//   1. one dropped request is recovered by the retry, with no reload;
//   2. a dropped STYLESHEET is recovered too (Vite's own retry skips the
//      failed <link> and reports success, leaving every equation drawn twice);
//   3. both dropped at once (one network blip) is still no reload;
//   4. a chunk that never comes back is asked for a bounded number of times,
//      never reloads the page, and ends in the Refresh notice.
//
// "No reload" is the author's ruling (never reload under a working user) and
// the reason the page-load count is asserted at exactly 1: before this fix the
// stale-chunk recovery (lib/swRegistration.ts) reloaded an untouched page on
// the first failure, and before THAT fix it reloaded ~17 times a second.
//
// The chunk and stylesheet are found by their contents in the built output,
// never by a retyped file name (P2); the waits follow the retry's own delays.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';
// P2: the retry's own timing, so the waits below follow it if it changes.
import { MATH_RETRY_DELAYS_MS } from '../../../viewer/src/inline/math';

const ASSETS = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist/assets');

/** The one built file of this extension whose text carries `marker`. */
function builtFile(extension: '.js' | '.css', marker: string): string {
  const found = readdirSync(ASSETS).filter(
    (name) => name.endsWith(extension) && readFileSync(join(ASSETS, name), 'utf8').includes(marker),
  );
  if (found.length !== 1) {
    throw new Error(`expected one ${extension} file carrying "${marker}", found ${found.length}: ${found.join(', ')}`);
  }
  return found[0] as string;
}

/** The KaTeX engine chunk: the one script carrying its error text. */
const katexChunk = () => builtFile('.js', 'KaTeX parse error');
/** KaTeX's stylesheet: the one carrying the rule that hides its MathML copy. */
const katexStyles = () => builtFile('.css', '.katex .katex-mathml{');

// The page's own requests must reach the route below, not a worker's cache.
test.use({ serviceWorkers: 'block' });

interface Blocker {
  /** Requests for the file seen, in order: 'dropped' or 'served', each with
   * its query string (the retry's `?retry=n`). */
  readonly requests: string[];
  /** Main-frame page loads, the first one included. */
  readonly loads: number;
}

/**
 * Open the activity with the first `drops` requests for each file dropped (all
 * of them when `drops` is Infinity). The route matches on the PATH, so a retry
 * under a new query string reaches it too.
 */
async function openDropping(page: Page, file: string | string[], drops: number): Promise<Blocker> {
  const files = new Set((Array.isArray(file) ? file : [file]).map((f) => `/assets/${f}`));
  const state = { requests: [] as string[], loads: 0 };
  // The window's own `load`: one per document, where `framenavigated` would
  // also count the router's in-page moves.
  page.on('load', () => {
    state.loads += 1;
  });
  const dropped = new Map<string, number>();
  await page.route(
    (url) => files.has(url.pathname),
    async (route) => {
      const { pathname, search } = new URL(route.request().url());
      const n = dropped.get(pathname) ?? 0;
      if (n < drops) {
        dropped.set(pathname, n + 1);
        state.requests.push(`dropped ${search}`.trim());
        // `failed` is a dropped request: the fetch rejects, as it does on a
        // network that loses it. A 404 would be a different failure.
        await route.abort('failed');
      } else {
        state.requests.push(`served ${search}`.trim());
        await route.continue();
      }
    },
  );
  await signInAs(page);
  await stubActivityApi(page);
  await page.goto(activityUrl());
  await page.locator('[data-progress]').waitFor();
  return {
    get requests() {
      return state.requests;
    },
    get loads() {
      return state.loads;
    },
  };
}

const firstWait = MATH_RETRY_DELAYS_MS[0];

test('the maths chunk is dropped once at open: the retry brings the maths in, with no reload', async ({ page }) => {
  const blocker = await openDropping(page, katexChunk(), 1);

  // While the chunk cannot load the student reads the LaTeX itself.
  await expect.poll(() => blocker.requests.length, 'the page asked for the chunk').toBeGreaterThan(0);
  expect(await page.locator('.katex').count()).toBe(0);
  await expect(page.locator('[data-math-pending]').first()).toBeVisible();

  // The next try is the first delay away.
  await expect(page.locator('.katex').first()).toBeVisible({ timeout: firstWait + 5_000 });
  await expect(page.locator('[data-math-pending]')).toHaveCount(0);
  // Under a NEW url: the same one is refused by the browser without a request.
  expect(blocker.requests).toEqual(['dropped', 'served ?retry=1']);
  expect(blocker.loads, 'page loads').toBe(1);
});

test('the maths stylesheet is dropped once: the retry styles the maths, with no reload', async ({ page }) => {
  const blocker = await openDropping(page, katexStyles(), 1);

  // The engine loaded but its stylesheet did not, so the load as a whole
  // failed and the LaTeX stays until the stylesheet is in too: an unstyled
  // KaTeX shows every equation twice.
  await expect.poll(() => blocker.requests.length, 'the page asked for the stylesheet').toBeGreaterThan(0);
  await expect(page.locator('.katex').first()).toBeVisible({ timeout: firstWait + 5_000 });
  const hidden = await page
    .locator('.katex .katex-mathml')
    .first()
    .evaluate((el) => getComputedStyle(el).position);
  expect(hidden, "KaTeX's MathML copy is hidden by its stylesheet").toBe('absolute');
  expect(blocker.requests).toEqual(['dropped', 'served ?retry=1']);
  expect(blocker.loads, 'page loads').toBe(1);
});

test('the network drops BOTH the chunk and its stylesheet once: still no reload, and the maths comes in styled', async ({ page }) => {
  // Vite raises one failure event per file. Both must be claimed, or the
  // second reaches the stale-chunk recovery and reloads the page (found in
  // review 2026-11-28: Promise.all hands the schedule only the first).
  const blocker = await openDropping(page, [katexChunk(), katexStyles()], 1);
  await expect(page.locator('.katex').first()).toBeVisible({ timeout: firstWait + 5_000 });
  const hidden = await page
    .locator('.katex .katex-mathml')
    .first()
    .evaluate((el) => getComputedStyle(el).position);
  expect(hidden).toBe('absolute');
  expect([...blocker.requests].sort()).toEqual(['dropped', 'dropped', 'served ?retry=1', 'served ?retry=1']);
  expect(blocker.loads, 'page loads').toBe(1);
});

test('a maths chunk that never comes back: a bounded number of tries, no reload, then the Refresh notice', async ({ page }) => {
  const total = MATH_RETRY_DELAYS_MS.reduce((sum, ms) => sum + ms, 0);
  test.setTimeout(total + 30_000);
  const blocker = await openDropping(page, katexChunk(), Infinity);

  // The schedule ends with the failure handed to the stale-chunk recovery;
  // the page is long past its fresh-load window by then, so it says so
  // rather than reloading.
  await expect(page.getByRole('button', { name: 'Refresh now' })).toBeVisible({ timeout: total + 10_000 });
  // Nothing was deployed: the notice must not say the page was updated.
  await expect(page.locator('[data-update-notice]')).toContainText('Part of this page didn’t load.');
  await expect(page.locator('[data-update-notice]')).not.toContainText('updated');
  // The first try and one per delay, each under its own URL. Not a storm.
  expect(blocker.requests).toEqual([
    'dropped',
    ...MATH_RETRY_DELAYS_MS.map((_, i) => `dropped ?retry=${i + 1}`),
  ]);
  expect(blocker.loads, 'page loads').toBe(1);
  // And the page is still the worksheet, readable, with the maths as LaTeX.
  await expect(page.locator('[data-progress]')).toBeVisible();
  await expect(page.locator('[data-math-pending]').first()).toBeVisible();
  // Nothing more is asked for once the schedule has run out.
  await page.waitForTimeout(3_000);
  expect(blocker.requests).toHaveLength(MATH_RETRY_DELAYS_MS.length + 1);
});
