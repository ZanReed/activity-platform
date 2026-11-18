// =============================================================================
// photo-handoff.e2e.ts — "Use my phone", both ends, in a real browser (media
// submissions slice 2c; docs/design/media-submissions.md §4.1)
// -----------------------------------------------------------------------------
//   1. The Chromebook: the real block shows a QR, polls, and a photo that
//      arrived joins the answer and is handed in by Check; Done revokes.
//   2. The phone: a context with NO sign-in opens /h#<code>; the code leaves
//      the address bar; the real re-encode runs on this browser's canvas, so
//      the photo the page sends carries no EXIF; no request carries a session.
// The RPCs and the function are route stubs (the student lane's rule); the
// function's real behaviour is verify-student-work-e2e.mjs's H rows.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';
import { PHOTO_HANDOFF_FUNCTION } from '../../src/lib/edgeFunctions';

const HANDOFF_ID = '77777777-0000-4000-8000-00000000f0c1';
const CODE = 'k'.repeat(42) + 'Q';
const ARRIVED = '66666666-0000-4000-8000-00000000f0c1';

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
          id: '11111111-0000-4000-8000-00000000f0c1',
          title: 'Working',
          isCheckpoint: true,
          rows: [{ id: 'row-p', gridLines: 'inherit', columns: [{ id: 'col-p', blocks: [block] }] }],
        },
      ],
    },
  };
}

/** A JPEG drawn by this browser with an EXIF APP1 (a GPS string) spliced in. */
async function jpegWithExif(page: Page): Promise<Buffer> {
  await page.goto('about:blank');
  const plain = Buffer.from(
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 800, 600);
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', 0.9));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    }),
  );
  const payload = Buffer.from('Exif\0\0GPS-36.85S174.76E', 'latin1');
  const app1 = Buffer.alloc(4);
  app1.writeUInt16BE(0xffe1, 0);
  app1.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([plain.subarray(0, 2), app1, payload, plain.subarray(2)]);
}

test('the Chromebook shows a QR, a phone photo arrives in the answer, and Done revokes the code', async ({ page }) => {
  const { block, document } = photoDocument();
  await signInAs(page);
  const api = await stubActivityApi(page, {
    document: document as never,
    check: { verdicts: { [block['id'] as string]: 'recorded' } },
  });
  await page.route('**/rest/v1/rpc/photo_answers_on', (route) => route.fulfill({ json: true }));
  await page.route('**/storage/v1/object/sign/student-work', (route) =>
    route.fulfill({ json: [{ path: 'x', signedURL: null, error: 'stub' }] }),
  );
  const started: unknown[] = [];
  await page.route('**/rest/v1/rpc/start_photo_handoff', async (route) => {
    started.push(route.request().postDataJSON());
    await route.fulfill({
      json: { id: HANDOFF_ID, code: CODE, expires_at: new Date(Date.now() + 600_000).toISOString(), slots: 1 },
    });
  });
  let photos: string[] = [];
  await page.route('**/rest/v1/rpc/photo_handoff_status', (route) =>
    route.fulfill({ json: { photos, slots_left: 1 - photos.length, live: photos.length === 0 } }),
  );
  const ended: unknown[] = [];
  await page.route('**/rest/v1/rpc/end_photo_handoff', async (route) => {
    ended.push(route.request().postDataJSON());
    await route.fulfill({ status: 204, body: '' });
  });

  await page.goto(activityUrl());
  const phone = page.getByRole('button', { name: 'Use my phone' });
  await expect(phone).toBeEnabled();
  await phone.click();
  await expect(page.getByRole('img', { name: 'QR code to open on your phone' })).toBeVisible();
  await expect(page.getByText(/Photograph only your working/)).toBeVisible();
  // StrictMode (on in this build) runs the start effect twice; the second
  // start ends the first code on the server, so only the last one matters.
  expect(started.at(-1)).toEqual(expect.objectContaining({ p_block_id: block['id'], p_slots: block['maxPhotos'] ?? 1 }));

  photos = [ARRIVED];
  await expect(page.getByText('Photo 1 arrived.')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-photo-state="attached"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Done with my phone' }).click();
  await expect.poll(() => ended.length).toBeGreaterThanOrEqual(1);
  expect(ended.at(-1)).toEqual({ p_handoff_id: HANDOFF_ID });

  await page.getByRole('button', { name: /^Check/ }).first().click();
  await expect.poll(() => api.checkRequests.length).toBe(1);
  const request = api.checkRequests[0] as { responses: { photos?: Record<string, unknown> } };
  expect(request.responses.photos).toEqual({ [block['id'] as string]: [{ id: ARRIVED }] });
});

test('the phone page, with no sign-in: the code leaves the address bar and the photo leaves without its EXIF', async ({ page }) => {
  const input = await jpegWithExif(page);
  expect(input.includes(Buffer.from('Exif\0\0', 'latin1'))).toBe(true);
  const requests: { body: Buffer; headers: Record<string, string>; url: string }[] = [];
  let left = 2;
  await page.route(`**/functions/v1/${PHOTO_HANDOFF_FUNCTION}*`, async (route) => {
    const req = route.request();
    const body = req.postDataBuffer() ?? Buffer.alloc(0);
    requests.push({ body, headers: req.headers(), url: req.url() });
    if (body.includes(Buffer.from('peek'))) {
      await route.fulfill({ json: { title: 'Linear equations', prompt: 'Solve and show working', slots_left: left } });
    } else {
      left -= 1;
      await route.fulfill({ json: { slots_left: left } });
    }
  });

  await page.goto(`/h#${CODE}`);
  await expect(page.getByText('Linear equations')).toBeVisible();
  expect(new URL(page.url()).hash).toBe('');
  expect(await page.evaluate(() => window.location.href)).not.toContain(CODE);

  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Take a photo' }).click();
  await (await chooser).setFiles({ name: 'IMG_9001.jpg', mimeType: 'image/jpeg', buffer: input });
  await expect(page.getByText('Sent. It’s on the Chromebook now.')).toBeVisible();

  // StrictMode may peek twice; there is exactly one upload.
  const uploads = requests.filter((r) => !r.body.includes(Buffer.from('peek')));
  expect(uploads).toHaveLength(1);
  for (const r of requests) {
    expect(r.headers['authorization']).toBeUndefined();
    expect(r.url).not.toContain(CODE);
    expect(r.body.includes(Buffer.from(CODE))).toBe(true);
  }
  const upload = uploads[0]!.body;
  expect(upload.includes(Buffer.from([0xff, 0xd8, 0xff]))).toBe(true); // a JPEG is in the form
  expect(upload.includes(Buffer.from('Exif\0\0', 'latin1'))).toBe(false);
  expect(upload.includes(Buffer.from('GPS-36', 'latin1'))).toBe(false);
  // No session, and nothing about the page reaching for one.
  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(keys.filter((k) => k.includes('auth-token'))).toEqual([]);
});
