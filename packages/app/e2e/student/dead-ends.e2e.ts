// =============================================================================
// dead-ends.e2e.ts — UI review C-1 / C-2 (docs/design/ui-review-group-c.md):
// no screen leaves a student (or teacher) with nowhere to go.
// =============================================================================

import { expect, test } from '@playwright/test';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

test('C-1: an unknown address says so, with a way home (it was a blank page)', async ({ page }) => {
  await signInAs(page);
  await page.goto('/a-typo/xyz');
  const card = page.locator('[data-not-found]');
  await expect(card).toContainText('This page doesn’t exist.');
  await expect(card.getByRole('link', { name: 'Go to my classes' })).toHaveAttribute('href', '/');
});

async function openWithStatus(page: import('@playwright/test').Page, status: number) {
  await signInAs(page);
  await stubActivityApi(page);
  // Registered after the stub, so it wins: the activity read fails this way.
  await page.route('**/functions/v1/get-activity*', (route) =>
    route.fulfill({ status, json: { error: 'raw server text for a teacher' } }),
  );
  await page.goto(activityUrl());
}

test('C-2: an expired session offers Sign in again (not a retry), a way back, and hides the raw text', async ({ page }) => {
  await openWithStatus(page, 401);
  const gate = page.locator('[data-failure="unauthenticated"]');
  await expect(gate).toBeVisible();
  await expect(gate.getByRole('button', { name: 'Sign in again' })).toBeVisible();
  await expect(gate.getByRole('button', { name: 'Try again' })).toHaveCount(0);
  await expect(gate.getByRole('link', { name: '← Back to my classes' })).toHaveAttribute('href', '/');
  // The detail is there for whoever the student shows it to, folded away.
  await expect(gate.locator('details')).not.toHaveAttribute('open', '');
});

test('C-2: an unavailable activity still has a way back', async ({ page }) => {
  await openWithStatus(page, 404);
  const gate = page.locator('[data-failure="unavailable"]');
  await expect(gate).toBeVisible();
  await expect(gate.getByRole('link', { name: '← Back to my classes' })).toBeVisible();
});
