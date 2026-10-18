// =============================================================================
// restore.e2e.ts — sign out, come back, and your checked work is still there
// -----------------------------------------------------------------------------
// The author's walkthrough finding (2026-10-14), walked end to end: a student
// checks a section, the device is wiped exactly as sign-out wipes it (every
// `activity-viewer:` key), and the activity is opened again. Before the fix it
// came back blank. Eng review D6: this journey is the one the bug lived in, so
// it is proven in a browser, not only in unit tests.
//
// The stub server REMEMBERS checks (stubActivityApi `serverRemembers`): the
// own-rows read names the checked section, and check-activity's restore mode
// returns it. The assertion that matters as much as "it came back" is "no new
// check was sent": restore must never record an attempt (contract (6)).
// =============================================================================

import { expect, test } from '@playwright/test';
import {
  activityUrl,
  E2E_STUDENT_ID,
  signInAs,
  stubActivityApi,
  stubIdentityApi,
} from '../helpers/studentSession';
import { FUNCTION_REGION } from '../../src/lib/edgeFunctions';

test('check, sign-out wipe, reopen: the answer and "Checked." come back, with no new check', async ({
  page,
}) => {
  await signInAs(page, { userId: E2E_STUDENT_ID });
  await stubIdentityApi(page, { role: 'student' });
  const api = await stubActivityApi(page, { serverRemembers: true });
  await page.route('**/rest/v1/rpc/get_my_released_feedback', (r) => r.fulfill({ json: [] }));

  await page.goto(activityUrl());
  const firstBox = page.getByRole('textbox').first();
  await firstBox.fill('3');
  await page.getByRole('button', { name: /^Check/ }).first().click();
  await expect(page.getByText(/^Checked/).first()).toBeVisible();
  expect(api.checkRequests).toHaveLength(1);

  // Leave the activity first, as a student does before signing out: the
  // viewer flushes its buffer on the way out (pagehide), so wiping while it is
  // still open would just be written back. Then wipe exactly what
  // signOutEverything wipes.
  await page.goto('/');
  await page.evaluate(() => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('activity-viewer:')) window.localStorage.removeItem(key);
    }
  });

  await page.goto(activityUrl());
  await expect(page.getByRole('textbox').first()).toHaveValue('3');
  await expect(page.getByText(/^Checked/).first()).toBeVisible();
  expect(api.restoreRequests).toHaveLength(1);
  expect(api.checkRequests).toHaveLength(1);
  await expect(page.locator('[data-banner="restore-failed"]')).toHaveCount(0);

  // Audit #14: every function call ran pinned to the database's region —
  // the read (resolve + content), the check, and the restore.
  const urls = api.functionUrls;
  expect(urls.some((u) => u.includes('/get-activity'))).toBe(true);
  expect(urls.some((u) => u.includes('/check-activity'))).toBe(true);
  for (const u of urls) {
    expect(new URL(u).searchParams.get('forceFunctionRegion'), u).toBe(FUNCTION_REGION);
  }
});

test('nothing checked on the server: no restore call, no banner', async ({ page }) => {
  await signInAs(page, { userId: E2E_STUDENT_ID });
  await stubIdentityApi(page, { role: 'student' });
  const api = await stubActivityApi(page, { serverRemembers: true });
  await page.route('**/rest/v1/rpc/get_my_released_feedback', (r) => r.fulfill({ json: [] }));

  await page.goto(activityUrl());
  await expect(page.locator('[data-progress]')).toBeVisible();
  expect(api.restoreRequests).toHaveLength(0);
  await expect(page.locator('[data-banner="restore-failed"]')).toHaveCount(0);
});
