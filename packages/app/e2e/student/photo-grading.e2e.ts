// =============================================================================
// photo-grading.e2e.ts — a teacher grades a photo of working (media
// submissions slice 3; docs/design/media-submissions.md §7)
// -----------------------------------------------------------------------------
// The real Responses route in the production build: a photo answer in the
// queue reads "2 photos", opening it signs its photos and shows them, the
// full-size view zooms and rotates the VIEW (no request writes anything), and
// a photo the teacher may no longer read says why. list_grading_queue,
// work_photo_states and Storage's sign/serve are route stubs; the server half
// is verify-0096 and the Storage e2e.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { signInAs } from '../helpers/studentSession';
import { stubIdentityApi } from '../helpers/studentSession';
import { GRADE_SUGGESTIONS_RPC, GRADING_QUEUE_RPC } from '../../src/lib/gradingQueueRpc';

const ACT = 'aaaaaaaa-0000-4000-8000-00000000f0d1';
const STUDENT = 'dddddddd-0000-4000-8000-00000000f0d1';
const P1 = '66666666-0000-4000-8000-00000000f0d1';
const P2 = '66666666-0000-4000-8000-00000000f0d2';

function queueRow(over: Record<string, unknown> = {}) {
  return {
    check_id: 'cccccccc-0000-4000-8000-00000000f0d1',
    student_id: STUDENT,
    student_label: 'maya@school.example',
    in_your_class: true,
    activity_version_id: 'bbbbbbbb-0000-4000-8000-00000000f0d1',
    version_num: 1,
    is_current: true,
    section_id: 's1',
    block_id: 'eeeeeeee-0000-4000-8000-00000000f0d1',
    block_type: 'photo_response',
    response_text: null,
    response_photos: [{ id: P1 }, { id: P2 }],
    attempt_number: 1,
    checked_at: '2026-11-18T00:00:00Z',
    graded: false,
    criteria: null,
    general_feedback: null,
    graded_at: null,
    released_at: null,
    has_grader: true,
    stale: false,
    ...over,
  };
}

async function jpeg(page: Page): Promise<Buffer> {
  await page.goto('about:blank');
  return Buffer.from(
    await page.evaluate(async () => {
      const c = document.createElement('canvas');
      c.width = 600;
      c.height = 400;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#123';
      ctx.font = '60px sans-serif';
      ctx.fillText('3x + 5 = 20', 40, 200);
      const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/jpeg', 0.9));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    }),
  );
}

async function setUp(page: Page, states: Record<string, string>) {
  const bytes = await jpeg(page);
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await page.route(`**/rest/v1/rpc/${GRADING_QUEUE_RPC}**`, (route) => route.fulfill({ json: [queueRow()] }));
  await page.route('**/rest/v1/rpc/get_grading_assist_status**', (route) => route.fulfill({ json: null }));
  await page.route(`**/rest/v1/rpc/${GRADE_SUGGESTIONS_RPC}**`, (route) => route.fulfill({ json: [] }));
  const stateCalls: unknown[] = [];
  await page.route('**/rest/v1/rpc/work_photo_states**', async (route) => {
    stateCalls.push(route.request().postDataJSON());
    await route.fulfill({ json: Object.entries(states).map(([photo_id, state]) => ({ photo_id, state })) });
  });
  const signs: unknown[] = [];
  await page.route('**/storage/v1/object/sign/student-work', async (route) => {
    const body = route.request().postDataJSON() as { paths: string[] };
    signs.push(body);
    await route.fulfill({
      json: body.paths.map((path) => {
        const id = path.split('/').pop()!.replace('.jpg', '');
        return states[id] === 'ok'
          ? { path, signedURL: `/object/sign/student-work/${path}?token=t`, error: null }
          : { path, signedURL: null, error: 'Object not found' };
      }),
    });
  });
  await page.route('**/storage/v1/object/sign/student-work/**', (route) =>
    route.fulfill({ body: bytes, contentType: 'image/jpeg' }),
  );
  return { signs, stateCalls };
}

test('a photo answer: "2 photos" in the queue, thumbnails in the panel, a full-size view that only turns the view', async ({ page }) => {
  const { signs, stateCalls } = await setUp(page, { [P1]: 'ok', [P2]: 'ok' });
  const writes: string[] = [];
  page.on('request', (r) => {
    if (r.method() !== 'GET' && /storage\/v1\/object\/(?!sign)/.test(r.url())) writes.push(r.url());
  });
  await page.goto(`/activity/${ACT}/responses`);

  const queueEntry = page.locator('[data-photo-count="2"]').first();
  await expect(queueEntry).toContainText('2 photos');

  await queueEntry.click();
  const open = page.getByRole('button', { name: 'Open photo 1 full size' });
  await expect(open).toBeVisible();
  // Only the OPEN answer's photos are signed, all in one call (StrictMode,
  // on in this build, may run the effect twice: each call is the whole set).
  expect(signs.length).toBeGreaterThanOrEqual(1);
  for (const call of signs) expect(call).toEqual(signs[0]);
  expect(signs[0]).toEqual({
    expiresIn: 600,
    paths: [`${ACT}/${STUDENT}/${P1}.jpg`, `${ACT}/${STUDENT}/${P2}.jpg`],
  });
  expect(stateCalls[0]).toEqual({ p_activity_id: ACT, p_photo_ids: [P1, P2] });
  // The thumbnail really decoded (a signed URL that served the bytes).
  await expect
    .poll(() => page.getByRole('img', { name: 'Photo 1 of the student’s working' }).first().evaluate((i: HTMLImageElement) => i.naturalWidth))
    .toBe(600);

  await open.click();
  const viewer = page.getByRole('dialog', { name: 'Photo 1 of 2' });
  await expect(viewer).toBeVisible();
  await page.getByRole('button', { name: 'Rotate right' }).click();
  await expect(viewer.locator('img')).toHaveAttribute('data-turns', '1');
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(viewer.locator('img')).toHaveAttribute('data-zoom', '1.5');
  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect(page.getByRole('dialog', { name: 'Photo 2 of 2' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
  expect(writes).toEqual([]); // rotate is a view, never a write
});

test('a photo the teacher may not read says why: changed after hand-in, or removed', async ({ page }) => {
  await setUp(page, { [P1]: 'changed', [P2]: 'removed' });
  await page.goto(`/activity/${ACT}/responses`);
  await page.locator('[data-photo-count="2"]').first().click();
  await expect(page.getByText('This photo was changed after it was handed in, so it can’t be shown.')).toBeVisible();
  await expect(page.getByText('Photo removed at the end of the school year.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(0);
});
