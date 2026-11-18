// =============================================================================
// photo-offline.e2e.ts — a photo taken with no connection (media submissions
// slice 2b; docs/design/media-submissions.md §8)
// -----------------------------------------------------------------------------
// The production build, a real IndexedDB, and real offline: Playwright's
// context.setOffline flips navigator.onLine and fires `offline` / `online`,
// which is what the uploader listens to. Storage and the RPCs are route stubs
// (the lane's rule); the server half is verify-0094 and the Storage e2e.
//
//   1. Offline, a photo is kept ON THE DEVICE (IndexedDB holds one entry),
//      Check waits for it, and on reconnect it uploads, the check fires with
//      the server id, and the device copy is gone.
//   2. Sign-out with a photo still waiting leaves no photo database on the
//      machine for the next student. (The confirm's words are a unit test.)
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { PHOTO_DB_NAME } from '@activity/viewer';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

const PHOTO_ID = '66666666-0000-4000-8000-00000000f0a1';

function photoDocument() {
  const found: Record<string, unknown>[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      const record = node as Record<string, unknown>;
      if (record['type'] === 'photo_response') found.push(record);
      Object.values(record).forEach(walk);
    }
  };
  walk(servedFixtureDocument().sections);
  const block = found[0]!;
  return {
    block,
    document: {
      ...servedFixtureDocument(),
      sections: [
        {
          id: '11111111-0000-4000-8000-00000000f0a1',
          title: 'Working',
          isCheckpoint: true,
          rows: [{ id: 'row-p', gridLines: 'inherit', columns: [{ id: 'col-p', blocks: [block] }] }],
        },
      ],
    },
  };
}

/** A small real JPEG, drawn by this browser. */
async function jpeg(page: Page): Promise<Buffer> {
  return Buffer.from(
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 400, 300);
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', 0.9));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    }),
  );
}

/** How many photos the device store holds (0 when the database is absent). */
async function storedPhotos(page: Page): Promise<number> {
  return page.evaluate(async (name) => {
    const dbs = await indexedDB.databases();
    if (!dbs.some((d) => d.name === name)) return 0;
    return new Promise<number>((resolve) => {
      const open = indexedDB.open(name);
      open.onsuccess = () => {
        const db = open.result;
        if (!db.objectStoreNames.contains('photos')) return resolve(0);
        const count = db.transaction('photos').objectStore('photos').count();
        count.onsuccess = () => {
          db.close();
          resolve(count.result);
        };
      };
      open.onerror = () => resolve(-1);
    });
  }, PHOTO_DB_NAME);
}

async function setUp(page: Page) {
  const { block, document } = photoDocument();
  await signInAs(page);
  const api = await stubActivityApi(page, {
    document: document as never,
    check: { verdicts: { [block['id'] as string]: 'recorded' } },
  });
  await page.route('**/rest/v1/rpc/photo_answers_on', (route) => route.fulfill({ json: true }));
  await page.route('**/rest/v1/rpc/reserve_work_photo', (route) => route.fulfill({ json: PHOTO_ID }));
  await page.route('**/rest/v1/rpc/discard_work_photo', (route) => route.fulfill({ json: true }));
  await page.route('**/storage/v1/object/sign/student-work', (route) => route.fulfill({ json: [] }));
  const uploads: string[] = [];
  await page.route('**/storage/v1/object/student-work/**', async (route) => {
    uploads.push(route.request().url());
    await route.fulfill({ json: { Key: 'x' } });
  });
  return { api, block, uploads };
}

async function addPhotoOffline(page: Page) {
  const bytes = await jpeg(page);
  await page.goto(activityUrl());
  const add = page.getByRole('button', { name: 'Add a photo' });
  await expect(add).toBeEnabled();
  await page.context().setOffline(true);
  const chooser = page.waitForEvent('filechooser');
  await add.click();
  await (await chooser).setFiles({ name: 'a.jpg', mimeType: 'image/jpeg', buffer: bytes });
  await expect(page.getByText(/Saved on this device/)).toBeVisible();
}

test('a photo taken offline waits on the device, then uploads and checks on reconnect', async ({ page }) => {
  await page.goto('/');
  const { api, block, uploads } = await setUp(page);
  await addPhotoOffline(page);
  expect(await storedPhotos(page)).toBe(1); // on the device, not in memory
  expect(uploads).toEqual([]);

  await page.getByRole('button', { name: /^Check/ }).first().click();
  await expect(page.getByText('Will check once your photo has uploaded.')).toBeVisible();
  expect(api.checkRequests).toHaveLength(0);

  await page.context().setOffline(false);
  await expect.poll(() => uploads.length).toBe(1);
  await expect.poll(() => api.checkRequests.length).toBe(1);
  const request = api.checkRequests[0] as { responses: { photos?: Record<string, unknown> } };
  expect(request.responses.photos).toEqual({ [block['id'] as string]: [{ id: PHOTO_ID }] });
  await expect.poll(() => storedPhotos(page)).toBe(0); // the device copy is gone
});

test('a waiting photo survives a reload and resumes: it uploads and the check fires', async ({ page }) => {
  await page.goto('/');
  const { api, block, uploads } = await setUp(page);
  await addPhotoOffline(page);
  await page.getByRole('button', { name: /^Check/ }).first().click();
  await expect(page.getByText('Will check once your photo has uploaded.')).toBeVisible();

  // Back online, but Storage is unreachable, so the photo is still only on the
  // device when the page reloads (a dead battery, a closed tab).
  await page.route('**/storage/v1/object/student-work/**', (route) => route.abort());
  await page.context().setOffline(false);
  await page.reload();
  expect(await storedPhotos(page)).toBe(1);
  await expect(page.locator('[data-photo-state]')).toBeVisible(); // still in the answer

  // Storage is back: the reopened page uploads from the device copy, and the
  // queued check fires with the server id.
  await page.unroute('**/storage/v1/object/student-work/**');
  await page.route('**/storage/v1/object/student-work/**', async (route) => {
    uploads.push(route.request().url());
    await route.fulfill({ json: { Key: 'x' } });
  });
  await page.getByRole('button', { name: 'Retry' }).click().catch(() => undefined);
  await expect.poll(() => uploads.length).toBeGreaterThanOrEqual(1);
  await expect.poll(() => api.checkRequests.length).toBe(1);
  const request = api.checkRequests[0] as { responses: { photos?: Record<string, unknown> } };
  expect(request.responses.photos).toEqual({ [block['id'] as string]: [{ id: PHOTO_ID }] });
});

test('sign-out leaves no photo store behind, even with a photo still waiting', async ({ page }) => {
  await page.goto('/');
  await setUp(page);
  await addPhotoOffline(page);
  expect(await storedPhotos(page)).toBe(1);

  // The upload fails (school Wi-Fi), so the photo is still only on the device
  // when the student signs out. The route goes in BEFORE reconnecting, or the
  // reconnect's upload could win the race.
  await page.route('**/storage/v1/object/student-work/**', (route) => route.abort());
  await page.context().setOffline(false);
  await page.goto('/');
  // Home's data is not stubbed in this lane, so it shows its "couldn't load"
  // frame, whose Sign out has no confirm (the existing sign-out row's path).
  // The confirm's words — "1 photo hasn't uploaded yet" — are pinned in
  // lib/uncheckedWork.test.ts; this row's job is the device afterwards.
  await page.getByRole('button', { name: /sign out/i }).click();

  await expect
    .poll(() => page.evaluate(async (name) => (await indexedDB.databases()).some((d) => d.name === name), PHOTO_DB_NAME))
    .toBe(false);
});
