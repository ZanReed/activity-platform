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
  signInAs,
  stubActivityApi,
  viewerKeys,
} from '../helpers/studentSession';

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
// KNOWN UNVERIFIED (S6 V9). Offline reopen could not be proven in this harness,
// and these rows are parked visibly rather than deleted, because the promise
// they cover is real and unproven is not the same as broken.
//
// What WAS established, online, against the built worker:
//   - it installs, claims the page, and handles BOTH the navigation and the
//     subresources (`PerformanceResourceTiming.workerStart` is non-zero for
//     the entry chunk and the document, so the CacheFirst route does match),
//   - the assets it needs are in `activity-viewer:cache:shell` before the test
//     goes offline (verified by reading Cache Storage), and
//   - the precache holds index.html.
//
// What FAILS: after `context.setOffline(true)` the navigation is served (200)
// and the page stays controlled, but every parse-time subresource request dies
// with net::ERR_FAILED — while a `fetch()` for the SAME url from page script,
// moments later, resolves 200. Aborting every route instead of emulating
// offline behaves identically, and so does a run with no interception at all,
// which rules out Playwright's request routing. The evidence points at the
// worker being unable to serve during a navigation in the emulated-offline
// state rather than at this configuration, but "points at" is not "proven",
// and shipping a green test built on that guess would be worse than this note.
//
// Picked up before S9 cutover, when offline reopen starts mattering to real
// students; TODOS.md carries it with this reasoning.
// ---------------------------------------------------------------------------
test.describe('offline reopen', () => {
  test.fixme(true, 'harness cannot yet drive SW-served offline navigation — see the note above');

  test('a student who lost the network still gets their worksheet', async ({
    page,
    context,
  }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await page.goto(activityUrl());
    await page.locator('[data-section-id] input[type="text"]').first().waitFor();
    await page.locator('[data-section-id] input[type="text"]').first().fill('42');
    await waitForController(page);
    // Both halves have to be on the device: the shell (worker) and the
    // document + work (the page's own per-user storage).
    await expect.poll(async () => (await viewerKeys(page)).length).toBeGreaterThan(1);

    // REAL offline, on BOTH surfaces. context.setOffline kills the navigation
    // and the asset requests — the part only the worker can answer. But route
    // handlers deliberately bypass the network, so a stubbed endpoint keeps
    // answering happily while the browser believes it is offline; without
    // switching the stub too, this test would quietly verify a normal online
    // load. (It did, on the first run.)
    await context.setOffline(true);
    api.setOffline(true);
    await page.reload();

    await expect(page.locator('[data-banner="offline-copy"]')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('[data-section-id] input[type="text"]').first()).toHaveValue(
      '42',
    );
    // Not the browser's dinosaur, and not our failure screen either.
    await expect(page.locator('[data-failure]')).toHaveCount(0);

    await context.setOffline(false);
  });

  test('with no saved copy, offline fails honestly rather than hanging', async ({
    page,
    context,
  }) => {
    // Prime the worker on a page that is not the activity, so the shell is
    // cached but no document ever was.
    await page.goto('/');
    await waitForController(page);
    const api = await stubActivityApi(page);
    await signInAs(page);

    await context.setOffline(true);
    api.setOffline(true); // see the note above: routes bypass setOffline
    await page.goto(activityUrl());

    // The shell still loads — that is the worker doing its job — and the app
    // then says what is wrong instead of showing an empty worksheet.
    await expect(page.locator('[data-failure="offline"]')).toBeVisible({
      timeout: 20_000,
    });

    await context.setOffline(false);
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
