// =============================================================================
// sw/math-chunk.e2e.ts — the maths chunk fails to load at open
// -----------------------------------------------------------------------------
// The check the 2026-11-26 review left open (section A, "Not checked in a
// browser"), run against the PRODUCTION build because that is where the chunk
// is a real file and Vite's preload wrapper is in the path.
//
// THE QUESTION was whether the retry in viewer/src/inline/math.ts does
// anything in Chromium, which has at times remembered a failed `import()` for
// the life of a page.
//
// THE ANSWER, measured 2026-11-28 (Chromium 1234, production build): it does
// remember. With the chunk reachable again, `import()` of the same URL
// rejected at once, "Failed to fetch dynamically imported module", and sent no
// request; the same file under a different URL (`?retry=1`) loaded. So the
// timed retry asks Chromium for a module it has already given up on, and the
// maths stays as LaTeX until the page is reloaded. The unit tests could not
// see this: they inject the failure after the module has loaded. The first
// row below states the wanted behaviour and is parked until the author rules
// on the fix (review log, A7; TODOS, "Maths chunk: a retry Chromium honours").
//
// WHAT RUNNING IT ALSO FOUND, and what the second row pins: a failed chunk on
// an untouched page triggers the stale-chunk recovery (lib/swRegistration.ts),
// which reloads once, and its "once" guard was cleared by every page load. A
// chunk that kept failing at open reloaded the page about 17 times a second
// until someone touched it. Fixed the same day; the row counts page loads.
//
// The chunk is found by its contents in the built output, never by a retyped
// file name (P2).
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';
// P2: the retry's own timing, so the waits below follow it if it changes.
import { MATH_RETRY_DELAYS_MS } from '../../../viewer/src/inline/math';

const ASSETS = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist/assets');

/** The built chunk that IS KaTeX: the one script carrying its error text. */
function katexChunk(): string {
  const found = readdirSync(ASSETS).filter(
    (name) => name.endsWith('.js') && readFileSync(join(ASSETS, name), 'utf8').includes('KaTeX parse error'),
  );
  if (found.length !== 1) {
    throw new Error(`expected one KaTeX chunk in the build, found ${found.length}: ${found.join(', ')}`);
  }
  return found[0] as string;
}

// The page's own requests must reach the route below, not a worker's cache.
test.use({ serviceWorkers: 'block' });

interface Blocker {
  /** KaTeX chunk requests seen: 'blocked' or 'served', in order. */
  readonly requests: string[];
  /** Main-frame page loads, the first one included. */
  readonly loads: number;
  unblock(): void;
}

async function openWithMathsBlocked(page: Page): Promise<Blocker> {
  const chunk = katexChunk();
  const state = { blocking: true, requests: [] as string[], loads: 0 };
  // The window's own `load`: one per document, where `framenavigated` would
  // also count the router's in-page moves.
  page.on('load', () => {
    state.loads += 1;
  });
  await page.route(`**/assets/${chunk}`, async (route) => {
    state.requests.push(state.blocking ? 'blocked' : 'served');
    // `failed` is a dropped request: the fetch rejects, as it does on a
    // network that loses it. A 404 would be a different failure.
    if (state.blocking) await route.abort('failed');
    else await route.continue();
  });
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
    unblock() {
      state.blocking = false;
    },
  };
}

// PARKED: see the header. Chromium rejects the retry's import without asking
// the network, so this is red until the retry uses a URL Chromium has not
// given up on.
test.fixme('the maths chunk is dropped at open, then reachable: the retry brings the maths in without a reload by hand', async ({ page }) => {
  const blocker = await openWithMathsBlocked(page);

  // While the chunk cannot load the student reads the LaTeX itself.
  await expect.poll(() => blocker.requests.length, 'the page asked for the chunk').toBeGreaterThan(0);
  expect(await page.locator('.katex').count()).toBe(0);
  await expect(page.locator('[data-math-pending]').first()).toBeVisible();

  blocker.unblock();

  // The next try is at most the longest single wait away.
  const longestWait = Math.max(...MATH_RETRY_DELAYS_MS.slice(0, 2));
  await expect(page.locator('.katex').first()).toBeVisible({ timeout: longestWait + 5_000 });
  expect(blocker.requests.at(-1)).toBe('served');
  await expect(page.locator('[data-math-pending]')).toHaveCount(0);
});

test('a maths chunk that keeps failing reloads the page once at most, and never loops', async ({ page }) => {
  const blocker = await openWithMathsBlocked(page);

  // Long enough for the old loop to have reloaded about a hundred times, and
  // for the first two retries to have run.
  await page.waitForTimeout(MATH_RETRY_DELAYS_MS[0] + MATH_RETRY_DELAYS_MS[1] + 1_000);

  // The first load, and at most the one reload the stale-chunk recovery is
  // allowed on an untouched page.
  expect(blocker.loads, 'page loads').toBeLessThanOrEqual(2);
  // A handful of requests: each load's first try, and the timed retries. Not
  // a storm.
  expect(blocker.requests.length, 'requests for the chunk').toBeLessThanOrEqual(8);
  // And the page is still the worksheet, readable, with the maths as LaTeX.
  await expect(page.locator('[data-progress]')).toBeVisible();
  await expect(page.locator('[data-math-pending]').first()).toBeVisible();
});
