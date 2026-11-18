// =============================================================================
// photo-response.e2e.ts — a photo of working, in a real browser (media
// submissions slice 2; docs/design/media-submissions.md §5, §3.2)
// -----------------------------------------------------------------------------
// The real StudentViewer route and the real photo chunk: Chromium decodes the
// file, draws it on a canvas and encodes the JPEG, so this is the one place the
// PRIVACY claim is measured rather than asserted. The input carries an EXIF
// APP1 with a GPS position; the bytes the page uploads must carry none of it,
// and must be within the bucket's limits. Storage and the RPCs are route stubs
// (the student lane's rule); their server half is verify-0093/0094 and
// scripts/verify-student-work-e2e.mjs against the real stack.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

const PHOTO_ID = '66666666-0000-4000-8000-00000000f001';
const SECTION = '11111111-0000-4000-8000-00000000f001';

function photoBlock(): Record<string, unknown> {
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
  return found[0]!;
}

function documentWithPhoto(block: Record<string, unknown>) {
  return {
    ...servedFixtureDocument(),
    sections: [
      {
        id: SECTION,
        title: 'Working',
        isCheckpoint: true,
        rows: [{ id: 'row-p', gridLines: 'inherit', columns: [{ id: 'col-p', blocks: [block] }] }],
      },
    ],
  };
}

/** A 3000×2000 JPEG from this browser's canvas, with an EXIF APP1 carrying a
 *  GPS latitude spliced in after SOI — the shape a phone camera hands over. */
async function jpegWithGps(page: Page): Promise<Buffer> {
  await page.goto('about:blank');
  const plain = Buffer.from(
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 3000, 2000);
      ctx.fillStyle = '#123';
      ctx.font = '200px sans-serif';
      ctx.fillText('3x + 5 = 20', 200, 600);
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', 0.9));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    }),
  );
  // TIFF, big-endian: IFD0 { GPSInfo → GPS IFD }, GPS IFD { LatitudeRef 'S',
  // Latitude 36/1 50/1 0/1 }.
  const tiff = Buffer.alloc(80);
  tiff.write('MM', 0, 'ascii');
  tiff.writeUInt16BE(42, 2);
  tiff.writeUInt32BE(8, 4);
  tiff.writeUInt16BE(1, 8); // IFD0: one entry
  tiff.writeUInt16BE(0x8825, 10); tiff.writeUInt16BE(4, 12); tiff.writeUInt32BE(1, 14); tiff.writeUInt32BE(26, 18);
  tiff.writeUInt32BE(0, 22);
  tiff.writeUInt16BE(2, 26); // GPS IFD: two entries
  tiff.writeUInt16BE(0x0001, 28); tiff.writeUInt16BE(2, 30); tiff.writeUInt32BE(2, 32); tiff.write('S\0', 36, 'ascii');
  tiff.writeUInt16BE(0x0002, 40); tiff.writeUInt16BE(5, 42); tiff.writeUInt32BE(3, 44); tiff.writeUInt32BE(56, 48);
  tiff.writeUInt32BE(0, 52);
  [36, 1, 50, 1, 0, 1].forEach((v, i) => tiff.writeUInt32BE(v, 56 + i * 4));
  const payload = Buffer.concat([Buffer.from('Exif\0\0', 'ascii'), tiff]);
  const app1 = Buffer.alloc(4);
  app1.writeUInt16BE(0xffe1, 0);
  app1.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([plain.subarray(0, 2), app1, payload, plain.subarray(2)]);
}

/** Every marker in a JPEG's header, in order, with the frame size from SOF. */
function jpegHeader(bytes: Buffer): { markers: number[]; width: number; height: number } {
  const markers: number[] = [];
  let width = 0;
  let height = 0;
  let i = 2;
  while (i + 4 <= bytes.length && bytes[i] === 0xff) {
    const marker = bytes[i + 1]!;
    markers.push(marker);
    const length = bytes.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      height = bytes.readUInt16BE(i + 5);
      width = bytes.readUInt16BE(i + 7);
    }
    if (marker === 0xda) break; // start of scan: the header is over
    i += 2 + length;
  }
  return { markers, width, height };
}

test('a photo goes up without its EXIF, inside the bucket’s limits, and Check hands in its id', async ({ page }) => {
  const input = await jpegWithGps(page);
  expect(input.includes(Buffer.from('Exif\0\0', 'ascii'))).toBe(true); // the fixture really carries it

  const block = photoBlock();
  await signInAs(page);
  const api = await stubActivityApi(page, {
    document: documentWithPhoto(block) as never,
    check: { verdicts: { [block['id'] as string]: 'recorded' } },
  });
  await page.route('**/rest/v1/rpc/photo_answers_on', (route) => route.fulfill({ json: true }));
  const reserved: unknown[] = [];
  await page.route('**/rest/v1/rpc/reserve_work_photo', async (route) => {
    reserved.push(route.request().postDataJSON());
    await route.fulfill({ json: PHOTO_ID });
  });
  const uploads: { url: string; headers: Record<string, string>; body: Buffer }[] = [];
  await page.route('**/storage/v1/object/student-work/**', async (route) => {
    const req = route.request();
    uploads.push({ url: req.url(), headers: req.headers(), body: req.postDataBuffer() ?? Buffer.alloc(0) });
    await route.fulfill({ json: { Key: 'student-work/x' } });
  });
  await page.route('**/storage/v1/object/sign/student-work', (route) =>
    route.fulfill({ json: [{ path: 'x', signedURL: null, error: 'stub' }] }),
  );

  await page.goto(activityUrl());
  const add = page.getByRole('button', { name: 'Add a photo' });
  await expect(add).toBeEnabled();
  const chooser = page.waitForEvent('filechooser');
  await add.click();
  await (await chooser).setFiles({ name: 'IMG_0042.jpg', mimeType: 'image/jpeg', buffer: input });

  await expect(page.getByRole('img', { name: 'Photo 1 of your working' })).toBeVisible();
  expect(reserved).toEqual([
    expect.objectContaining({ p_block_id: block['id'], p_activity_id: expect.any(String), p_version_id: expect.any(String) }),
  ]);
  expect(uploads).toHaveLength(1);
  const sent = uploads[0]!;
  expect(sent.url).toContain(`/${PHOTO_ID}.jpg`);
  expect(sent.headers['content-type']).toBe('image/jpeg');
  expect(sent.headers['x-upsert']).toBe('false');

  // The privacy claim, measured: no APP1 (EXIF/XMP) segment, no "Exif" bytes
  // anywhere, no trace of the GPS tag; a real JPEG; long edge capped; small.
  const header = jpegHeader(sent.body);
  expect(sent.body.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))).toBe(true);
  expect(header.markers).not.toContain(0xe1);
  expect(sent.body.includes(Buffer.from('Exif', 'ascii'))).toBe(false);
  expect(Math.max(header.width, header.height)).toBe(2000);
  expect(header.width / header.height).toBeCloseTo(1.5, 2);
  expect(sent.body.length).toBeLessThanOrEqual(1_572_864);

  await page.getByRole('button', { name: /^Check/ }).first().click();
  await expect.poll(() => api.checkRequests.length).toBe(1);
  const request = api.checkRequests[0] as { responses: { photos?: Record<string, unknown> } };
  expect(request.responses.photos).toEqual({ [block['id'] as string]: [{ id: PHOTO_ID }] });
  await expect(page.getByText(/Recorded/).first()).toBeVisible();
});

test('the <img> fallback (no createImageBitmap) strips EXIF too', async ({ page }) => {
  // Safari and older iPads can refuse createImageBitmap's options bag; the
  // fallback decodes through an <img>. Same canvas, same promise.
  const input = await jpegWithGps(page);
  await page.addInitScript(() => {
    // @ts-expect-error — removed on purpose, to force the fallback path
    window.createImageBitmap = undefined;
  });
  const block = photoBlock();
  await signInAs(page);
  await stubActivityApi(page, { document: documentWithPhoto(block) as never });
  await page.route('**/rest/v1/rpc/photo_answers_on', (route) => route.fulfill({ json: true }));
  await page.route('**/rest/v1/rpc/reserve_work_photo', (route) => route.fulfill({ json: PHOTO_ID }));
  const bodies: Buffer[] = [];
  await page.route('**/storage/v1/object/student-work/**', async (route) => {
    bodies.push(route.request().postDataBuffer() ?? Buffer.alloc(0));
    await route.fulfill({ json: { Key: 'x' } });
  });
  await page.route('**/storage/v1/object/sign/student-work', (route) => route.fulfill({ json: [] }));
  await page.goto(activityUrl());
  expect(await page.evaluate(() => typeof window.createImageBitmap)).toBe('undefined');
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Add a photo' }).click();
  await (await chooser).setFiles({ name: 'IMG_0043.jpg', mimeType: 'image/jpeg', buffer: input });
  await expect(page.getByRole('img', { name: 'Photo 1 of your working' })).toBeVisible();
  expect(bodies).toHaveLength(1);
  const header = jpegHeader(bodies[0]!);
  expect(header.markers).not.toContain(0xe1);
  expect(bodies[0]!.includes(Buffer.from('Exif', 'ascii'))).toBe(false);
  expect(Math.max(header.width, header.height)).toBe(2000);
});

test('while photo answers are off, the block says so and offers nothing to press', async ({ page }) => {
  await signInAs(page);
  await stubActivityApi(page, { document: documentWithPhoto(photoBlock()) as never });
  await page.route('**/rest/v1/rpc/photo_answers_on', (route) => route.fulfill({ json: false }));
  await page.goto(activityUrl());
  await expect(page.getByText('Your teacher hasn’t turned photo answers on yet.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add a photo' })).toBeDisabled();
});
