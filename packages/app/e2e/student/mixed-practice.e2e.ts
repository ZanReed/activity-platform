// =============================================================================
// mixed-practice.e2e.ts — mixed practice's student screens (D43 slice 3)
// -----------------------------------------------------------------------------
// Real-browser walks with a stubbed backend (helpers/mixedPracticeStub.ts),
// at the neutral alias /practice/:CODE (DM-1):
//   1. start card → a wrong try (answer, mistake note, working) → a skip →
//      the done screen; the words never used (DM-13).
//   2. keyboard only: Tab to the answer, Enter checks, focus on the verdict,
//      Tab + Enter on Next (DM-17).
//   3. a phone: one question, the action bar pinned, no sideways scroll,
//      44 px targets (DM-16).
//   4. no network: "Checking…", the answer kept, the quiet line after 10 s,
//      "Try again" lands it (DM-5).
// ⚠ Stub lanes: the Supabase origin is the dead one (e2eOrigins.ts); every
// route this page calls is stubbed here or by the identity stub.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { PX_CODE, stubMixedPracticeApi } from '../helpers/mixedPracticeStub';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';

async function open(page: Page, graded = false) {
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await stubMixedPracticeApi(page, { graded });
  await page.goto(`/practice/${PX_CODE}`);
  await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();
  return api;
}

test('start card → a wrong try with the answer, mistake note and working → a skip → the done screen', async ({ page }) => {
  const api = await open(page, true);
  await expect(page.getByText('2 questions · about 2–3 minutes.')).toBeVisible();
  await expect(page.getByText('Your teacher is recording a practice score today.')).toBeVisible();
  expect(api.starts).toBe(0); // the card asks; it does not start (DM-12)
  await page.getByRole('button', { name: 'Start' }).click();

  await expect(page.getByText('For 20 muffins you need')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check' })).toHaveCount(1);
  await page.getByRole('textbox').fill('8');
  // Enter in the answer box (DM-17), the path where focus is still in the
  // blank when it freezes — a mouse click on Check would move it first.
  await page.getByRole('textbox').press('Enter');
  await expect(page.getByRole('heading', { name: /Not this time/ })).toHaveText('✕ Not this time. The answer is 5.');
  await expect(page.locator('[data-feedback="server"]')).toContainText('added 8 instead of scaling');
  await expect(page.getByTestId('mx-working')).toContainText('20 × 0.25 = 5 cups');
  await expect(page.getByRole('textbox')).toBeDisabled();
  // The ² ³ tray closed with the answer (no blur reaches a disabled input).
  await expect(page.locator('.viewer-blank__tray')).toHaveCount(0);
  expect(api.checks[0]).toMatchObject({ seq: 1 });
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByText('Which table shows a proportional relationship?')).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByRole('heading', { name: /Skipped/ })).toHaveText('Skipped. The answer is Doubling x doubles y.');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByRole('heading', { name: 'Practice done' })).toBeVisible();
  await expect(page.getByTestId('mx-done-right')).toHaveText('You got 0 of 2 right.');
  await expect(page.getByText('You skipped 1.')).toBeVisible();
  await expect(page.getByTestId('mx-done-score')).toHaveText('Practice score: 0 of 2 (you answered 1 of 2).');
  await expect(page.getByText('That’s everything for today.')).toBeVisible();
  expect(api.checks.map((c) => `${c.seq}${c.skip ? 's' : ''}`)).toEqual(['1', '2s']);
  // Nothing typed is held on the device once each question is recorded.
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.includes(':mx:')))).toEqual([]);
  await expect(page.locator('body')).not.toContainText(/\b(mixed|session|discrimination|steps?|due|planned|graded)\b/i);
});

test('keyboard only: Tab to the answer, Enter checks, the verdict takes focus, Enter on Next (DM-17)', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Start' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Question 1 of 2' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox')).toBeFocused();
  await page.keyboard.type('5');
  await page.keyboard.press('Enter');
  const verdict = page.getByRole('heading', { name: /Right/ });
  await expect(verdict).toBeFocused();
  await expect(verdict).toHaveText('✓ Right.');
  await page.keyboard.press('Tab'); // See the working
  await expect(page.getByRole('button', { name: 'See the working' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Next' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Question 2 of 2' })).toBeFocused();
});

test('a phone: the action bar is pinned to the bottom, nothing scrolls sideways, targets are 44 px (DM-16)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await open(page);
  await page.getByRole('button', { name: 'Start' }).click();
  const check = page.getByRole('button', { name: 'Check' });
  await expect(check).toBeVisible();
  expect(await page.locator('.mx-actions').first().evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
  const widths = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
  expect(widths.doc).toBeLessThanOrEqual(widths.win);
  for (const name of ['Check', 'Skip', 'Stop for now']) {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box!.height, name).toBeGreaterThanOrEqual(44);
  }
});

test('no network: the answer stays, "Checking…", the quiet line after 10 s, and "Try again" lands it (DM-5)', async ({ page }) => {
  await page.clock.install();
  const api = await open(page);
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('textbox').fill('5');
  api.offline = true;
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByRole('button', { name: 'Checking…' })).toBeVisible();
  // The first send has really failed before the clock moves.
  await expect.poll(() => api.refused).toBeGreaterThan(0);
  await page.clock.fastForward(11_000);
  await expect(page.getByText('Not connected. Keep this page open; we’ll keep trying.')).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('5');
  api.offline = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: /Right/ })).toBeVisible();
  expect(api.checks).toHaveLength(1); // aborted requests never reached the server
});
