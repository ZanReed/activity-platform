// =============================================================================
// mixed-teacher.e2e.ts — mixed practice's teacher panel and "Who to see first"
// (D43 slice 4), in a real browser with a stubbed backend.
//   1. The page reads "Practice"; the panel's per-skill table by label; no
//      student name in the page until "Show students" or the list is opened
//      (DM-18, W-2); the list's groups, a drawer, and its 5 s re-read only
//      while open (W-7).
// =============================================================================

import { expect, test } from '@playwright/test';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';
import { FT_CLASS_ID, stubFactsTeacherApi } from '../helpers/factsTeacherStub';
import { MT_LONG_LABEL, stubMixedTeacherApi } from '../helpers/mixedTeacherStub';

test('the panel by label, names only when opened, the list with a drawer, re-read only while open', async ({ page }) => {
  await page.clock.install();
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await stubFactsTeacherApi(page);
  const api = await stubMixedTeacherApi(page);
  await page.goto(`/classes/${FT_CLASS_ID}/facts`);

  await expect(page.getByRole('heading', { level: 1, name: 'Practice' })).toBeVisible();
  const panel = page.getByTestId('ft-mixed');
  await expect(panel.getByTestId('ft-mixed-state')).toHaveText('On since February 10');
  await expect(panel.getByRole('rowheader', { name: MT_LONG_LABEL })).toBeVisible();
  await expect(panel.getByRole('columnheader', { name: 'Getting stuck' })).toBeVisible();
  // DM-18 / W-2: no name anywhere, and none fetched, until a list is opened.
  await expect(page.locator('body')).not.toContainText(/Aroha|Ben Carter/);
  expect(api.whoReads).toBe(0);
  expect(api.studentReads).toBe(0);

  await panel.getByRole('button', { name: 'Show students' }).click();
  await expect(panel.getByTestId('ft-mixed-students')).toContainText('Aroha Ngata');
  await expect(panel.getByTestId('ft-mixed-students')).toContainText('4 of 6');
  await panel.getByRole('button', { name: 'Hide students' }).click();

  const who = page.getByTestId('ft-who');
  await who.getByRole('button', { name: 'Show the list' }).click();
  await expect(who.getByRole('region', { name: 'Getting stuck on a skill' })).toContainText('Aroha Ngata');
  await expect(who.getByRole('region', { name: 'Same mistake twice' })).toContainText('Same mistake: Adds instead of scaling');
  await expect(who).toContainText('Everyone else (10)');
  await who.getByRole('button', { name: /^Ben Carter:/ }).click();
  await expect(who.getByTestId('ft-who-drawer')).toContainText('Adds instead of scaling');
  // (dev StrictMode may read twice; every read is that student, in this class)
  expect(api.recentReads.length).toBeGreaterThan(0);
  for (const r of api.recentReads) expect(r).toEqual({ p_class_id: FT_CLASS_ID, p_student_id: 's2' });

  // Re-read while open…
  const before = api.whoReads;
  await page.clock.fastForward(5_100);
  await expect.poll(() => api.whoReads).toBeGreaterThan(before);
  // …and never once closed; the names leave the page.
  await who.getByRole('button', { name: 'Hide the list' }).click();
  await expect(page.locator('body')).not.toContainText(/Aroha|Ben Carter/);
  const closed = api.whoReads;
  await page.clock.fastForward(15_000);
  expect(api.whoReads).toBe(closed);
});
