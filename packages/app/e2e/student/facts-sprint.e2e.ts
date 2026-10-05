// =============================================================================
// facts-sprint.e2e.ts — the daily number-facts practice, end to end (D43 slice 2)
// -----------------------------------------------------------------------------
// One real-browser walk of a practice session with a stubbed backend, at the
// student's ONE link (SP-1): no check open → the practice card → Start → the
// strategy for a strategy-mode family → a miss shows the answer and the fact
// comes back once (SP-11) → the done screen with the server's count (SP-14).
// And the two things a session must never show: a clock, and the words the
// product does not use.
//
// RPC names are the production constants (P2); the payload shapes are the
// ones verify-0050 asserts the real functions return.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { SPRINT_CODE, SPRINT_SESSION_ID, stubFactsSprintApi } from '../helpers/factsSprintStub';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';

const CODE = SPRINT_CODE;
const SESSION_ID = SPRINT_SESSION_ID;
const backend = stubFactsSprintApi;

async function answer(page: Page, text: string): Promise<void> {
  await page.waitForTimeout(320);
  await page.keyboard.type(text);
  await page.keyboard.press('Enter');
}

test('no check open: the practice card, a strategy, a miss with its answer and one repeat, the server\'s count', async ({ page }) => {
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page);
  await page.goto(`/facts/${CODE}`);

  // The card asks; it does not start.
  await expect(page.getByRole('heading', { name: 'Number facts practice' })).toBeVisible();
  await expect(page.getByText('About 5 minutes, or less if you finish first.')).toBeVisible();
  // (The read may fire more than once on load; what matters is that NONE of
  // them asked to start.)
  expect(api.entryCalls.length).toBeGreaterThan(0);
  expect(api.entryCalls.every((c) => c.p_code === CODE && c.p_start === false)).toBe(true);
  await page.getByRole('button', { name: 'Start' }).click();
  await expect.poll(() => api.entryCalls.at(-1)).toEqual({ p_code: CODE, p_start: true });

  // The strategy comes before the facts (the family is in strategy mode).
  const strategy = page.getByTestId('fx-strategy');
  await expect(strategy).toContainText('Multiplication to 12 × 12');
  await expect(strategy).toContainText('×5: Half of ×10.');
  await page.getByRole('button', { name: 'Got it' }).click();

  // No warm-up (the session has a baseline), no progress bar, no clock.
  await expect(page.locator('.fx-expr')).toHaveText('7 × 8 = __');
  await expect(page.locator('.fx-bar')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Show the strategy' })).toBeVisible();

  // A miss: the fact stays up with its answer until the student goes on.
  await answer(page, '54');
  await expect(page.getByTestId('fx-feedback')).toHaveText('7 × 8 = 56');
  await expect(page.locator('.fx-pad')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next' }).click();

  // Three other facts, then the missed one again, then the last.
  for (const [shown, typed] of [['9 × 6 = __', '54'], ['6 × 6 = __', '36'], ['3 × 4 = __', '12'], ['7 × 8 = __', '56'], ['5 × 5 = __', '25']] as const) {
    await expect(page.locator('.fx-expr')).toHaveText(shown);
    await answer(page, typed);
  }

  // Done: the server's count, and "best" because 4 beats 3.
  await expect(page.getByRole('heading', { name: 'All done' })).toBeVisible();
  await expect(page.getByTestId('fx-quick-right')).toHaveText('Quick and right today: 4');
  await expect(page.getByText('Your best so far.')).toBeVisible();

  const sent = api.saves.flatMap((s) => s.p_attempts);
  expect(sent.map((a) => `${a.n}${a.reask ? 'r' : ''}`)).toEqual(['1', '2', '3', '4', '1r', '5']);
  expect(api.saves.every((s) => s.p_session_id === SESSION_ID)).toBe(true);
  expect(api.saves.some((s) => s.p_finished)).toBe(true);
  // Nothing held on the device once saved.
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.includes('facts:')))).toEqual([]);
  await expect(page.locator('body')).not.toContainText(/probe|sprint/i);
});

test('Home shows the practice link only under a class that has it switched on (SP-1)', async ({ page }) => {
  await stubIdentityApi(page, {
    role: 'student',
    classes: [
      { classId: 'c1', name: '9 Maths B', joinedAt: '2027-02-01T00:00:00Z', joinCode: CODE, factsOn: true },
      { classId: 'c2', name: '9 Science', joinedAt: '2027-02-02T00:00:00Z', joinCode: 'XYZ789', factsOn: false },
    ],
  });
  await signInAs(page);
  await backend(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '9 Science' })).toBeVisible();
  const links = page.getByRole('link', { name: 'Number facts practice' });
  await expect(links).toHaveCount(1);
  await expect(links).toHaveAttribute('href', `/facts/${CODE}`);
  await links.click();
  await expect(page.getByRole('heading', { name: 'Number facts practice' })).toBeVisible();
});
