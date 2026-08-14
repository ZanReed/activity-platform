// =============================================================================
// sw/service-worker.e2e.ts — the shipped worker, against a real build (S6 V9)
// -----------------------------------------------------------------------------
// This is the only lane where the service worker exists at all: it is generated
// at build time, so a dev-server spec would be testing something that never
// reaches a student. That matters more here than elsewhere, because the classic
// service-worker failures — a shell cached forever, an app stuck on last
// week's build — are invisible in review and only appear to the person who
// reopens the page days later on a bad connection.
//
// `context.setOffline(true)` is real offline: the navigation itself fails, so
// the page can only load if the worker answers. That is the assertion no
// route-interception test can make, and the reason this lane pays for a build.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { VIEWER_SHELL_CACHE } from '@activity/viewer';
import {
  activityUrl,
  E2E_ACTIVITY_ID,
  signInAs,
  stubActivityApi,
  viewerKeys,
} from '../helpers/studentSession';
import { startDisposablePreview } from '../helpers/disposablePreview';

/** Wait until a worker is installed AND controlling this page. */
async function waitForController(page: Page): Promise<void> {
  await page.waitForFunction(
    () => navigator.serviceWorker.controller !== null,
    undefined,
    { timeout: 20_000 },
  );
}

async function cacheNames(page: Page): Promise<string[]> {
  return page.evaluate(() => caches.keys());
}

test.describe('the generated worker', () => {
  test('installs and takes control of the page', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => navigator.serviceWorker.ready !== undefined);
    // clientsClaim + skipWaiting: a worker that installs but waits for every
    // tab to close is the "stuck on the old build" trap, so control on this
    // load is the property worth pinning.
    await waitForController(page);
    expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(
      true,
    );
  });

  test('precaches the navigation document and nothing else', async ({ page }) => {
    await page.goto('/');
    await waitForController(page);

    const precached = await page.evaluate(async () => {
      const names = await caches.keys();
      const precacheName = names.find((n) => n.includes('precache'));
      if (!precacheName) return null;
      const cache = await caches.open(precacheName);
      return (await cache.keys()).map((r) => new URL(r.url).pathname);
    });

    // The ruling this pins (S6-11): a student must not download the whole app
    // up front. The entry chunk alone is ~3 MB, so a precache that reached it
    // would be the exact regression the budget exists to prevent.
    expect(precached).not.toBeNull();
    expect(precached).toHaveLength(1);
    expect(precached?.[0]).toMatch(/index\.html$|^\/$/);
  });

  test('runtime-caches the hashed assets it actually used', async ({ page }) => {
    await page.goto('/');
    await waitForController(page);
    // A second navigation, so asset requests pass through the worker.
    await page.reload();
    await waitForController(page);

    await expect
      .poll(async () => (await cacheNames(page)).includes(VIEWER_SHELL_CACHE))
      .toBe(true);

    const cachedAssets = await page.evaluate(async (name) => {
      const cache = await caches.open(name);
      return (await cache.keys()).length;
    }, VIEWER_SHELL_CACHE);
    // Only what this page needed — not the 170 files in dist/assets.
    expect(cachedAssets).toBeGreaterThan(0);
  });

  test('never caches a function call', async ({ page }) => {
    await stubActivityApi(page);
    await signInAs(page);
    await page.goto(activityUrl());
    await page.locator('[data-section-id]').first().waitFor();

    const cachedApiUrls = await page.evaluate(async () => {
      const found: string[] = [];
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          if (request.url.includes('/functions/v1/')) found.push(request.url);
        }
      }
      return found;
    });

    // The Cache API keys by URL and ignores auth, and this platform serves a
    // per-student shuffled document from ONE url. A cached response here is
    // another student's paper — so the guarantee is that there is never one.
    expect(cachedApiUrls).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// OFFLINE REOPEN — un-parked at S9 Drop 5 (D-9) with a REAL server stop.
//
// The S6 V9 parking note (kept in git history at this file) established that
// `context.setOffline(true)` serves the navigation but kills every parse-time
// subresource with net::ERR_FAILED even when the worker demonstrably holds
// them — an emulation artifact, not a worker bug, but "points at" was not
// "proven". D-9's ruling: reproduce against an in-test child-process preview
// server KILLED mid-test. A dead server is not an emulation — if the page
// loads, the worker served it, full stop.
//
// These rows therefore run against their OWN preview server (same dist/ the
// lane's webServer built), spawned and killed per-test — Playwright's
// webServer can't stop mid-test, which is exactly why the parking note dated
// this approach. The stub-side `api.setOffline` mitigation SURVIVES the
// rework (plan §1.7's (b)): route handlers bypass the network entirely, so a
// stubbed function endpoint would keep answering happily beside a dead
// server, and the test would quietly verify a normal online load. (It did,
// on the first run, in the setOffline era.)
// ---------------------------------------------------------------------------
test.describe('offline reopen (real server stop, D-9)', () => {
  test('a student who lost the network still gets their worksheet', async ({
    page,
    context,
  }) => {
    const server = await startDisposablePreview();
    try {
      const api = await stubActivityApi(page);
      await signInAs(page);
      await page.goto(`${server.origin}/a/${E2E_ACTIVITY_ID}`);
      await page.locator('[data-section-id] input[type="text"]').first().waitFor();
      await waitForController(page);
      // A second ONLINE navigation, so the asset requests pass through the
      // now-controlling worker and land in the shell cache — the first
      // load's assets predate control and are cached NOWHERE. (The harness's
      // own first real run proved this: without this reload the dead-server
      // reopen dies on the entry chunk with ERR_FAILED. Same reason the
      // asset-caching row above reloads before asserting.)
      await page.reload();
      await page.locator('[data-section-id] input[type="text"]').first().waitFor();
      // The work is typed AFTER the priming reload, and the kill waits until
      // the buffer PROVABLY holds it — the buffer write is debounced, and a
      // fill racing a navigation is lost work by design (the beforeunload
      // guard covers humans; a test must simply wait).
      await page.locator('[data-section-id] input[type="text"]').first().fill('42');
      await expect
        .poll(async () =>
          page.evaluate(() =>
            Object.entries(window.localStorage).some(
              ([k, v]) => k.startsWith('activity-viewer:buffer:') && v.includes('42'),
            ),
          ),
        )
        .toBe(true);
      // Both halves have to be on the device: the shell (worker cache, with
      // the assets actually IN it) and the document + work (per-user storage).
      await expect.poll(async () => (await viewerKeys(page)).length).toBeGreaterThan(1);
      await expect
        .poll(async () =>
          page.evaluate(async (name) => {
            if (!(await caches.keys()).includes(name)) return 0;
            return (await (await caches.open(name)).keys()).length;
          }, VIEWER_SHELL_CACHE),
        )
        .toBeGreaterThan(0);

      // REAL offline: the server DIES. Nothing can answer but the worker.
      await server.kill();
      api.setOffline(true); // belt: a live stub must never answer offline

      // The REOPEN happens in a FRESH PAGE in the same context — which is
      // both the honest story (a student closes the tab and opens a new one)
      // and a hard requirement the harness's diagnosis runs surfaced: once a
      // page has carried page.route handlers, its interception plumbing
      // blocks the worker from answering a NAVIGATION (ERR_ABORTED even
      // after unrouteAll). A clean page shares the context's worker, Cache
      // Storage, and per-origin localStorage — the buffer with the student's
      // work included — but has never seen interception. Its function calls
      // hit the pinned e2e Supabase origin where nothing listens: a real
      // connection refusal, exactly what dead classroom Wi-Fi produces.
      const reopened = await context.newPage();
      await reopened.goto(`${server.origin}/a/${E2E_ACTIVITY_ID}`);

      await expect(reopened.locator('[data-banner="offline-copy"]')).toBeVisible({
        timeout: 20_000,
      });
      await expect(
        reopened.locator('[data-section-id] input[type="text"]').first(),
      ).toHaveValue('42');
      // Not the browser's dinosaur, and not our failure screen either.
      await expect(reopened.locator('[data-failure]')).toHaveCount(0);
      await reopened.close();
    } finally {
      await server.dispose();
    }
  });

  test('with no saved copy, offline fails honestly rather than hanging', async ({
    page,
  }) => {
    const server = await startDisposablePreview();
    try {
      // Prime the worker on a page that is not the activity, so the shell is
      // cached but no document ever was. The reload runs the asset requests
      // through the controlling worker (see the row above).
      await page.goto(`${server.origin}/`);
      await waitForController(page);
      await page.reload();
      await expect
        .poll(async () =>
          page.evaluate(async (name) => {
            if (!(await caches.keys()).includes(name)) return 0;
            return (await (await caches.open(name)).keys()).length;
          }, VIEWER_SHELL_CACHE),
        )
        .toBeGreaterThan(0);
      const api = await stubActivityApi(page);
      await signInAs(page);

      await server.kill();
      api.setOffline(true); // belt — see the row above
      await page.unrouteAll({ behavior: 'ignoreErrors' }); // braces — ditto
      await page.goto(`${server.origin}/a/${E2E_ACTIVITY_ID}`);

      // The shell still loads — that is the worker doing its job — and the
      // app then says what is wrong instead of showing an empty worksheet.
      await expect(page.locator('[data-failure="offline"]')).toBeVisible({
        timeout: 20_000,
      });
    } finally {
      await server.dispose();
    }
  });
});

test.describe('sign-out on a shared device', () => {
  test('clears the student’s work but keeps the app shell', async ({ page }) => {
    await stubActivityApi(page);
    await signInAs(page);
    await page.goto(activityUrl());
    await page.locator('[data-section-id] input[type="text"]').first().waitFor();
    await page.locator('[data-section-id] input[type="text"]').first().fill('my work');
    await waitForController(page);
    await expect.poll(async () => (await viewerKeys(page)).length).toBeGreaterThan(0);
    await expect
      .poll(async () => (await cacheNames(page)).includes(VIEWER_SHELL_CACHE))
      .toBe(true);

    await page.goto('/');
    await page.getByRole('button', { name: /sign out/i }).click();

    // Their work is gone...
    await expect.poll(async () => viewerKeys(page)).toEqual([]);
    // ...and the next student does not re-download the app over school Wi-Fi
    // to find that out (ruling S6-6, the deliberate shell exception).
    expect(await cacheNames(page)).toContain(VIEWER_SHELL_CACHE);
  });
});
