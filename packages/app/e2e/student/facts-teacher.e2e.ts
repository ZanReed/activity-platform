// =============================================================================
// facts-teacher.e2e.ts — the teacher's number-facts page, end to end (D43 slice 1)
// -----------------------------------------------------------------------------
// One real-browser walk of the teacher's journey with a stubbed backend:
// pick a year → open → the live view with the typeable link → close (asked
// first) → the verdict; and the privacy rule the design leans on — no student
// name is in the page until its disclosure is opened (DR-19, DR-22).
// (It lives in the stub-env lane's folder, beside identity.e2e.ts, because that
// lane's server is the one with the pinned, account-free environment.)
// =============================================================================

import { expect, test } from '@playwright/test';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';
import { FT_CLASS_ID, FT_CODE, FT_STUDENTS, stubFactsTeacherApi } from '../helpers/factsTeacherStub';

test('open with a year, watch the counts, close, and read the verdict', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  const api = await stubFactsTeacherApi(page);
  await page.goto(`/classes/${FT_CLASS_ID}/facts`);

  // OPEN: nothing picked, so nothing can be opened.
  await expect(page.getByRole('heading', { name: 'Number facts snapshot' })).toBeVisible();
  await expect(page.getByText('/ 9 Maths B')).toBeVisible();
  const open = page.getByRole('button', { name: 'Open the snapshot' });
  await expect(open).toBeDisabled();
  // (scoped to the year list: the app's theme switcher is radios too)
  await expect(page.locator('.ft-year input[type="radio"]')).toHaveCount(4);
  await expect(page.locator('.ft-year input[type="radio"]:checked')).toHaveCount(0);
  // The class has no school-year end yet (0048, RP-2): asked here, prefilled.
  const yearEnd = page.getByLabel('When does this class’s school year end?');
  await expect(yearEnd).toHaveValue(/^\d{4}-\d{2}-\d{2}$/);
  const guessed = await yearEnd.inputValue();
  await page.getByRole('radio', { name: /Facts up to Year 8/ }).check();
  await open.click();
  await expect.poll(() => api.opens).toEqual([{ p_class_id: FT_CLASS_ID, p_year_level: 8 }]);
  expect(api.yearEnds).toEqual([{ p_class_id: FT_CLASS_ID, p_ends_on: guessed }]);
  expect(api.calls).toEqual(['yearEnd', 'open']);

  // LIVE: the link is typeable, the counts have fixed meanings, no names.
  await expect(page.locator('.ft-linkbig')).toHaveText(new RegExp(`/facts/${FT_CODE}$`));
  await expect(page.locator('.ft-counts')).toHaveText('In class 28 · Started 23 · Finished 17');
  for (const s of FT_STUDENTS) await expect(page.getByText(s.name)).toHaveCount(0);
  await page.getByRole('button', { name: 'Show who has not started' }).click();
  await expect(page.getByText('Dina Patel')).toBeVisible();
  await expect(page.getByText('Ben Carter')).toHaveCount(0);

  // The board view: only the link and the counts.
  await page.getByRole('button', { name: 'Full screen for the board' }).click();
  await expect(page.locator('.ft-projector .ft-linkbig')).toBeVisible();
  await expect(page.locator('.ft-projector')).not.toContainText('Dina Patel');
  await page.getByRole('button', { name: 'Leave full screen' }).click();

  // CLOSE asks first and defaults to keeping it open.
  await page.getByRole('button', { name: 'Close the snapshot…' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('6 students are still working');
  await expect(page.getByRole('button', { name: 'Keep it open' })).toBeFocused();
  await page.keyboard.press('Enter'); // the default: nothing closes
  await expect(dialog).toHaveCount(0);
  expect(api.closes).toBe(0);
  await page.getByRole('button', { name: 'Close the snapshot…' }).click();
  await page.getByRole('button', { name: 'Close it' }).click();
  await expect.poll(() => api.closes).toBe(1);

  // RESULTS: the verdict first, as a sentence; names closed.
  const verdict = page.locator('.ft-verdict');
  await expect(verdict).toContainText('This class is below the fluency floor.');
  await expect(verdict).toContainText('Class median: 14.2 correct a minute. Floor: 19.6. Based on 20 of 28 students; 3 had too little to measure.');
  await expect(page.getByTestId('ft-keep-until')).toContainText('Students’ answers and timings are kept until');
  for (const s of FT_STUDENTS) await expect(page.getByText(s.name)).toHaveCount(0);
  await page.getByRole('button', { name: 'Show students' }).click();
  await expect(page.getByRole('row', { name: /Caleb Wu/ })).toContainText('Stopped at 14 of 55');
  await page.getByRole('button', { name: 'Ben Carter' }).click();
  await expect(page.getByText('Division to 144 ÷ 12:')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/probe/i);
});

test('a snapshot whose student results were removed shows the class result and no names (0048, RP-6)', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await stubFactsTeacherApi(page, 'closed', { prunedAt: '2028-01-17T03:00:00Z' });
  await page.goto(`/classes/${FT_CLASS_ID}/facts`);
  await page.getByRole('button', { name: /student results removed/ }).click();
  await expect(page.getByTestId('ft-pruned')).toContainText('were removed on');
  await expect(page.locator('.ft-verdict')).toContainText('This class is below the fluency floor.');
  await expect(page.getByRole('heading', { name: 'Who needs what' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Each student' })).toHaveCount(0);
  for (const s of FT_STUDENTS) await expect(page.getByText(s.name)).toHaveCount(0);
});
