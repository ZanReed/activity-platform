// =============================================================================
// tab-return.e2e.ts — leaving the tab and coming back must not cost any work
// -----------------------------------------------------------------------------
// Author finding 2026-10-04: "whenever I tab out I lose all work instantly".
//
// THE MECHANISM. When a tab becomes visible again, supabase-js re-reads the
// stored session and re-announces it (an auth event carrying a NEW session
// object for the SAME user and the SAME token). The student viewer keyed its
// content load, its read client and its store on that object's identity, so
// every return to the tab looked like a fresh sign-in: the worksheet dropped
// back to "Loading…", re-fetched, and rebuilt its store under the student.
//
// The trigger here is the real one — a `visibilitychange` on a visible
// document, which is the event auth-js listens for — not a hand-rolled call
// into the app, so the row fails for the reason a student's tab did.
// =============================================================================

import { expect, test } from '@playwright/test';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

test('returning to the tab keeps typed work and does not reload the activity', async ({ page }) => {
  await stubActivityApi(page);
  await signInAs(page);

  let loads = 0;
  page.on('request', (req) => {
    if (req.url().includes('/functions/v1/get-activity')) loads += 1;
  });

  await page.goto(activityUrl());
  const input = page.locator('[data-section-id] input[type="text"]').first();
  await input.waitFor();
  const loadsAfterOpen = loads;
  expect(loadsAfterOpen).toBeGreaterThan(0); // anti-vacuity: the counter sees the load
  await input.fill('my answer');

  // The tab comes back into view, three times (a student checking a calculator
  // tab and returning does this all lesson).
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange', { bubbles: true })));
    await page.waitForTimeout(400);
  }

  // The worksheet never went back to its loading screen…
  await expect(input).toBeVisible();
  // …the typed answer is still in the SAME field…
  await expect(input).toHaveValue('my answer');
  // …and the activity was not fetched again.
  expect(loads).toBe(loadsAfterOpen);
});
