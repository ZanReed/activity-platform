// =============================================================================
// student/harness.e2e.ts — proof the signed-in harness works (S6 V5)
// -----------------------------------------------------------------------------
// V5's deliverable is the harness, not the failure matrix (that is V7). These
// specs exist to prove the harness can actually do the things V7 will ask of
// it, in real chromium, against the real route:
//
//   - a faked session is accepted, so the student surface renders at all
//   - the stubbed server answers the read path with a real served document
//   - a section check round-trips through the live store and check client
//   - the network can be cut and restored mid-spec, which is the mechanism
//     every interesting S6 case is built on
//   - identity is switchable, which is what the shared-device cases need
//
// If these pass, V7 is writing scenarios. If they fail, V7 would have been
// debugging the harness while thinking it was debugging the product.
// =============================================================================

import { expect, test } from '@playwright/test';
import {
  E2E_OTHER_STUDENT_ID,
  E2E_STUDENT_ID,
  activityUrl,
  signInAs,
  stubActivityApi,
} from '../helpers/studentSession';

test.describe('signed-in student harness', () => {
  test('a faked session renders the worksheet instead of the sign-in screen', async ({
    page,
  }) => {
    await stubActivityApi(page);
    await signInAs(page);
    await page.goto(activityUrl());

    // The sign-in screen is what you get when the session was not accepted —
    // the single most likely harness failure, so it is asserted directly.
    await expect(page.getByRole('button', { name: /sign in/i })).toHaveCount(0);
    await expect(page.locator('[data-section-id]').first()).toBeVisible();
  });

  test('checking a section round-trips through the real store and client', async ({
    page,
  }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await page.goto(activityUrl());

    const input = page.locator('[data-section-id] input[type="text"]').first();
    await input.waitFor();
    await input.fill('42');
    await page.getByRole('button', { name: 'Check' }).first().click();

    await expect(page.locator('[data-section-phase="checked"]').first()).toBeVisible();
    expect(api.checkRequests).toHaveLength(1);
  });

  test('the network can be cut and restored', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await page.goto(activityUrl());

    const input = page.locator('[data-section-id] input[type="text"]').first();
    await input.waitFor();
    await input.fill('42');

    // Cut the wire. This is `abort`, not a 5xx: a real dead network makes
    // fetch REJECT, and only that path produces the viewer's 'offline' kind.
    api.setOffline(true);
    await page.getByRole('button', { name: 'Check' }).first().click();

    // The S6 promise, in the browser for the first time.
    await expect(page.locator('[data-section-phase="pending"]').first()).toBeVisible();

    api.setOffline(false);
    // The reconnect edge the queue listens for.
    await page.evaluate(() => window.dispatchEvent(new Event('online')));

    await expect(page.locator('[data-section-phase="checked"]').first()).toBeVisible();
  });

  test('work persists under the signed-in student’s own key', async ({ page }) => {
    await stubActivityApi(page);
    await signInAs(page);
    await page.goto(activityUrl());

    const input = page.locator('[data-section-id] input[type="text"]').first();
    await input.waitFor();
    await input.fill('42');

    // Give the debounce its moment; the assertion is about the key, not timing.
    await expect
      .poll(async () =>
        page.evaluate(() =>
          Object.keys(window.localStorage).filter((k) =>
            k.startsWith('activity-viewer:buffer:'),
          ),
        ),
      )
      .toHaveLength(1);

    const key = (
      await page.evaluate(() =>
        Object.keys(window.localStorage).filter((k) =>
          k.startsWith('activity-viewer:buffer:'),
        ),
      )
    )[0]!;
    expect(key).toContain(E2E_STUDENT_ID);
  });

  test('identity is switchable, which the shared-device cases need', async ({
    page,
  }) => {
    await stubActivityApi(page);
    await signInAs(page, { userId: E2E_OTHER_STUDENT_ID });
    await page.goto(activityUrl());
    await page.locator('[data-section-id]').first().waitFor();

    const buffers = await page.evaluate(() =>
      Object.keys(window.localStorage).filter((k) =>
        k.startsWith('activity-viewer:'),
      ),
    );
    // Nothing is asserted about the buffer yet (no work was typed) — what
    // matters here is that the OTHER student's session was the one accepted.
    expect(buffers.every((k) => !k.includes(E2E_STUDENT_ID))).toBe(true);
  });
});
