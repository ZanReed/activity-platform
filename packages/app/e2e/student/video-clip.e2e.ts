// =============================================================================
// video-clip.e2e.ts — a catch-up clip in a real browser (D64 slice 2)
// -----------------------------------------------------------------------------
// The real StudentViewer route, the real reader and a real video file: Chromium records one here, so the file
// host really decodes and plays. The YouTube host can't run in a stubbed lane;
// it is a unit test plus the author's first real clip.
// 375px: a phone is the device D64 names.
// =============================================================================

import { expect, test } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

const CLIP_URL = 'https://clips.example.org/clip.webm';

function blockOfType(type: string): Record<string, unknown> {
  const found: Record<string, unknown>[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      const record = node as Record<string, unknown>;
      if (record['type'] === type) found.push(record);
      Object.values(record).forEach(walk);
    }
  };
  walk(servedFixtureDocument().sections);
  return found[0]!;
}

function documentWithClip() {
  const faded = blockOfType('faded_worked_example');
  const row = (id: string, block: Record<string, unknown>) => ({
    id: `row-${id}`,
    gridLines: 'inherit',
    columns: [{ id: `col-${id}`, blocks: [block] }],
  });
  return {
    ...servedFixtureDocument(),
    sections: [
      {
        id: '11111111-0000-4000-8000-00000000a001',
        title: 'Lesson',
        isCheckpoint: true,
        rows: [
          row('v', {
            id: '22222222-0000-4000-8000-00000000a001',
            type: 'video',
            title: 'Comparing decimals',
            pauses: [{ at: 1 }, { at: 2 }],
            stale: false,
          }),
          row('a', { ...faded, id: '33333333-0000-4000-8000-00000000a001', title: 'First' }),
          row('b', { ...faded, id: '33333333-0000-4000-8000-00000000a002', title: 'Second' }),
        ],
      },
    ],
  };
}

test.use({ viewport: { width: 375, height: 812 } });

test('a clip with no URL shows nothing', async ({ page }) => {
  await signInAs(page);
  await stubActivityApi(page, { document: documentWithClip() as never, videoSource: null });
  await page.goto(activityUrl());
  await expect(page.getByText('First')).toBeVisible();
  await expect(page.getByRole('button', { name: /Missed this lesson/ })).toHaveCount(0);
  await expect(page.locator('[data-block-type="video"]')).toBeHidden();
});

test("the viewer's hide rule leaves the editor's card alone", async ({ page }) => {
  // The app's one stylesheet loads on every route, so a bare attribute rule would
  // hide the editor's card too, which jsdom can't see.
  await signInAs(page);
  await stubActivityApi(page, { document: documentWithClip() as never, videoSource: null });
  await page.goto(activityUrl());
  await expect(page.getByText('First')).toBeVisible();
  const display = await page.evaluate(() => {
    const card = document.createElement('div');
    card.setAttribute('data-block-type', 'video');
    card.className = 'block-video';
    document.body.append(card);
    return getComputedStyle(card).display;
  });
  expect(display).toBe('block');
});

test('a real file plays, stops at each faded block in order, and goes on', async ({ page }) => {
  // Record a 4-second clip in this browser, in a page with no app in it.
  await page.goto('about:blank');
  const clip = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 36;
    const context = canvas.getContext('2d')!;
    const recorder = new MediaRecorder(canvas.captureStream(10), { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    const finished = new Promise((resolve) => (recorder.onstop = resolve));
    recorder.start();
    const started = Date.now();
    while (Date.now() - started < 4000) {
      context.fillStyle = `hsl(${(Date.now() - started) / 10}, 80%, 50%)`;
      context.fillRect(0, 0, 64, 36);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    recorder.stop();
    await finished;
    const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
    return Array.from(bytes);
  });

  await signInAs(page);
  await stubActivityApi(page, {
    document: documentWithClip() as never,
    videoSource: { url: CLIP_URL, captions: null },
  });
  const hostRequests: string[] = [];
  await page.route(CLIP_URL, (route) => {
    hostRequests.push(route.request().url());
    return route.fulfill({
      contentType: 'video/webm',
      headers: { 'access-control-allow-origin': '*' },
      body: Buffer.from(clip),
    });
  });

  await page.goto(activityUrl());
  const open = page.getByRole('button', { name: 'Missed this lesson? Watch the catch-up · Comparing decimals' });
  await expect(open).toBeVisible();
  // Nothing reaches the host until the card is opened (VP-6).
  expect(hostRequests).toEqual([]);

  await open.click();
  await expect.poll(() => hostRequests.length).toBeGreaterThan(0);
  const video = page.locator('video');
  await expect(video).toHaveAttribute('controlslist', /nofullscreen/);
  // Inline and within the phone's width.
  const box = await video.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);

  const stopIn = (blockId: string) =>
    page.locator(`[data-block-id="${blockId}"] .viewer-video-stop`);
  await expect(stopIn('33333333-0000-4000-8000-00000000a001')).toBeVisible({ timeout: 10_000 });
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  const stoppedAt = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
  expect(stoppedAt).toBeGreaterThanOrEqual(1);
  expect(stoppedAt).toBeLessThan(2);
  await expect(stopIn('33333333-0000-4000-8000-00000000a001')).toBeInViewport();
  // Under the block's content, not squeezed into its number gutter.
  const stopBox = await page.getByRole('button', { name: 'Keep going' }).boundingBox();
  const wrapper = await page.locator('.viewer-block[data-block-id="33333333-0000-4000-8000-00000000a001"]').boundingBox();
  expect(stopBox!.x).toBeGreaterThanOrEqual(wrapper!.x + 40);
  expect(stopBox!.x + stopBox!.width).toBeLessThanOrEqual(375);

  await page.getByRole('button', { name: 'Keep going' }).click();
  await expect(stopIn('33333333-0000-4000-8000-00000000a002')).toBeVisible({ timeout: 10_000 });
  expect(await video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThanOrEqual(2);
  await expect(stopIn('33333333-0000-4000-8000-00000000a001')).toHaveCount(0);

  await page.getByRole('button', { name: 'Keep going' }).click();
  await expect(page.locator('.viewer-video-stop')).toHaveCount(0);
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(2.3);
});
