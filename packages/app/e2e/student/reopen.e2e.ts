// =============================================================================
// reopen.e2e.ts — reopening an activity uses the copy already on the device
// (efficiency audit 2026-10 #9; TODOS item 3, decisions 1–8 ruled 2026-10-18)
// -----------------------------------------------------------------------------
// Every open used to download the version's document again, though the viewer
// saves it on the device per student. It is reused now ONLY when the server's
// current version AND served-form revision both match the saved copy; a rule
// change on the server (a new serve_rev) downloads again. The stub serves the
// production SERVE_REV (P2).
// =============================================================================

import { expect, test } from '@playwright/test';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

test('a reopen shows the saved copy without downloading it again; a new serve revision downloads', async ({ page }) => {
  const api = await stubActivityApi(page);
  await signInAs(page);
  const firstBlock = page.locator('[data-section-id] input[type="text"]').first();

  await page.goto(activityUrl());
  await firstBlock.waitFor();
  expect(api.contentRequests).toBe(1); // anti-vacuity: the first open downloads

  // Reopen: same version, same serve revision → the device copy, no download.
  await page.reload();
  await firstBlock.waitFor();
  expect(api.contentRequests).toBe(1);

  // The server's rules change: the saved copy no longer matches → download.
  api.setServeRev('test-only.changed-rules');
  await page.reload();
  await firstBlock.waitFor();
  expect(api.contentRequests).toBe(2);
});
