// =============================================================================
// theme-toggle-placement.e2e.ts — no theme switch inside an activity
// -----------------------------------------------------------------------------
// Author ruling D2 (2026-10-14, student UX review): the global theme switch is
// pinned bottom-left, where the activity's reading tools (Glossary, Reference)
// live, and on a phone it sat on the sticky Check bar. It is not rendered on
// the student viewer route; Home keeps it, and the choice persists.
// =============================================================================

import { expect, test } from '@playwright/test';
import {
  activityUrl,
  E2E_STUDENT_ID,
  signInAs,
  stubActivityApi,
  stubIdentityApi,
} from '../helpers/studentSession';

test('Home has the theme switch; an activity does not', async ({ page }) => {
  await signInAs(page, { userId: E2E_STUDENT_ID });
  await stubIdentityApi(page, { role: 'student' });
  await stubActivityApi(page);
  await page.route('**/rest/v1/rpc/get_my_released_feedback', (r) => r.fulfill({ json: [] }));

  await page.goto('/');
  await expect(page.getByRole('radiogroup', { name: 'Color theme' })).toBeVisible();

  await page.goto(activityUrl());
  await expect(page.getByRole('link', { name: '← My classes' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Color theme' })).toHaveCount(0);
});
