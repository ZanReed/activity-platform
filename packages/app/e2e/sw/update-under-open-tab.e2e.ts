// =============================================================================
// update-under-open-tab.e2e.ts — a new build arrives while the tab is open
// -----------------------------------------------------------------------------
// Stale-shell recovery (lib/swRegistration.ts, job 4; found live 2026-10-04).
// A tab held open across a deploy kept running the old build: the worker only
// looked for a new version at page load, and served the old chunks from its
// cache, so nothing failed and nothing changed.
//
// THE SETUP IS A REAL SECOND BUILD, not a mocked event. Each test serves its
// own COPY of the lane's dist/ from a throwaway static server, then changes
// that copy's sw.js on disk — byte-different, which is exactly what makes a
// browser install a new worker — and brings the tab back into view, which is
// the moment the app asks for an update.
//
// The two rows are the author's ruling of 2026-10-04:
//   * someone who has started working is NEVER reloaded: they get a notice and
//     choose the moment;
//   * a page nobody has touched yet reloads itself (there is no work to lose).
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { appendFile, cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist');
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

interface Site {
  origin: string;
  /** Publish "a new build": make sw.js byte-different. */
  deploy(): Promise<void>;
  close(): Promise<void>;
}

async function serveCopyOfDist(): Promise<Site> {
  const root = await mkdtemp(join(tmpdir(), 'sw-update-'));
  await cp(DIST, root, { recursive: true });
  const server: Server = createServer((req, res) => {
    void (async () => {
      const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]!));
      const file = join(root, path);
      const send = async (target: string) => {
        const body = await readFile(target);
        res.writeHead(200, {
          'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
          // What Cloudflare Pages sends for the document and the worker.
          'cache-control': 'public, max-age=0, must-revalidate',
        });
        res.end(body);
      };
      try {
        if (!file.startsWith(root) || extname(file) === '') throw new Error('spa');
        await send(file);
      } catch {
        // SPA fallback for routes; a missing asset is a real 404.
        if (extname(path) !== '' && extname(path) !== '.html') {
          res.writeHead(404).end();
          return;
        }
        await send(join(root, 'index.html'));
      }
    })();
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('no port');
  return {
    origin: `http://127.0.0.1:${address.port}`,
    deploy: () => appendFile(join(root, 'sw.js'), `\n// build ${Date.now()}\n`),
    close: async () => {
      await new Promise<void>((done) => server.close(() => done()));
      await rm(root, { recursive: true, force: true });
    },
  };
}

async function openControlled(page: Page, site: Site): Promise<void> {
  await page.goto(site.origin + '/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
    timeout: 20_000,
  });
  // A marker that only survives if the page is NOT reloaded.
  await page.evaluate(() => {
    (window as unknown as { __sameLoad?: boolean }).__sameLoad = true;
  });
}

const sameLoad = (page: Page) =>
  page.evaluate(() => (window as unknown as { __sameLoad?: boolean }).__sameLoad === true);

/** The tab comes back into view — the moment the app asks for an update. */
const returnToTab = (page: Page) =>
  page.evaluate(() => document.dispatchEvent(new Event('visibilitychange', { bubbles: true })));

test('a new build under someone who is working shows a notice and does NOT reload', async ({ page }) => {
  const site = await serveCopyOfDist();
  try {
    await openControlled(page, site);
    // They have started: one key press is enough.
    await page.keyboard.press('Shift');

    await site.deploy();
    await returnToTab(page);

    const notice = page.locator('[data-update-notice]');
    await expect(notice).toBeVisible({ timeout: 20_000 });
    await expect(notice).toContainText('This page has been updated');
    expect(await sameLoad(page), 'the page must not have been reloaded').toBe(true);

    // The reload is theirs to trigger.
    await notice.getByRole('button', { name: 'Refresh now' }).click();
    await page.waitForFunction(
      () => (window as unknown as { __sameLoad?: boolean }).__sameLoad !== true,
    );
  } finally {
    await site.close();
  }
});

test('"Later" hides the notice without reloading', async ({ page }) => {
  const site = await serveCopyOfDist();
  try {
    await openControlled(page, site);
    await page.keyboard.press('Shift');
    await site.deploy();
    await returnToTab(page);
    const notice = page.locator('[data-update-notice]');
    await expect(notice).toBeVisible({ timeout: 20_000 });
    await notice.getByRole('button', { name: 'Later' }).click();
    await expect(notice).toHaveCount(0);
    expect(await sameLoad(page)).toBe(true);
  } finally {
    await site.close();
  }
});

test('a page someone is only READING is not reloaded either: after ten seconds it gets the notice', async ({ page }) => {
  // Author finding 2026-10-04: switching tabs on a student activity and coming
  // back reloaded it. No key, no click — just an open page past its first
  // seconds — must be treated as in use.
  const site = await serveCopyOfDist();
  try {
    await openControlled(page, site);
    await page.waitForTimeout(10_500);

    await site.deploy();
    await returnToTab(page);

    await expect(page.locator('[data-update-notice]')).toBeVisible({ timeout: 20_000 });
    expect(await sameLoad(page), 'the page must not have been reloaded').toBe(true);
  } finally {
    await site.close();
  }
});

test('a new build in the FIRST SECONDS of an untouched page reloads it, with no notice', async ({ page }) => {
  const site = await serveCopyOfDist();
  try {
    await openControlled(page, site);

    await site.deploy();
    await returnToTab(page);

    await page.waitForFunction(
      () => (window as unknown as { __sameLoad?: boolean }).__sameLoad !== true,
      undefined,
      { timeout: 20_000 },
    );
    await expect(page.locator('[data-update-notice]')).toHaveCount(0);
  } finally {
    await site.close();
  }
});
