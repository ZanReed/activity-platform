// =============================================================================
// class-progress.e2e.ts — the teacher's class progress pages, end to end (0061)
// -----------------------------------------------------------------------------
// docs/design/class-progress-view.md. One real-browser walk with a stubbed
// backend: Classes → Progress → the grid's statuses → a cell → the answer
// panel (its own address, focus in, Close returns focus) → Hide names, proven
// by asserting NO student name survives in text OR any attribute (DR-10) and
// that the choice survives a reload → the per-activity page with the wrong
// answers above the grid → "N to grade" → Responses' "Back to progress".
// (Lives in the stub-env lane's folder beside facts-teacher.e2e.ts: that
// lane's server has the pinned, account-free environment signed-in specs need.)
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';
import { CP_ANA, CP_CLASS_ID, CP_FRACTIONS, CP_NAMES, stubClassProgressApi } from '../helpers/classProgressStub';

/** Every name, anywhere in the page: text, and every attribute of every element. */
async function namesInDom(page: Page): Promise<string[]> {
  return page.evaluate((names) => {
    const html = document.documentElement.outerHTML;
    return names.filter((n) => html.includes(n));
  }, CP_NAMES);
}

test('class grid → answer panel → hide names → activity page → back from Responses', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  const api = await stubClassProgressApi(page);
  await page.goto(`/classes/${CP_CLASS_ID}/progress`);

  // The grid: header counts, glyph + words, the older tag, NULL total, a chip.
  await expect(page.getByRole('heading', { name: 'Class progress' })).toBeVisible();
  await expect(page.getByText('/ 9 Maths B')).toBeVisible();
  const fractionsHead = page.getByRole('columnheader', { name: /Fractions 2/ });
  await expect(fractionsHead).toContainText('1 done · 1 started · 1 not started');
  const anaFractions = page.getByRole('link', { name: 'Ana Lee, Fractions 2: done, 50 percent' });
  await expect(anaFractions).toContainText('Done 50%');
  await expect(page.getByRole('link', { name: 'Ana Lee, Decimals: started, 1 of 3 sections, on an older version' })).toContainText('older');
  await expect(page.getByRole('link', { name: 'Ben Carter, Decimals: started, total not recorded' })).toHaveAttribute(
    'title',
    'Checked before progress totals were recorded',
  );
  await expect(page.getByRole('link', { name: '1 to grade in Fractions 2' })).toBeVisible();
  const calebRow = page.getByRole('row', { name: /Caleb Wu/ });
  await expect(calebRow).toContainText('done 0 of 2');
  await expect(page.getByRole('heading', { name: 'Common misconceptions' })).toBeVisible();
  await expect(page.getByText('Unknown misconception')).toBeVisible();
  await page.screenshot({ path: 'test-results/class-progress-grid.png', fullPage: true });

  // A cell opens the answer panel at its own address; focus moves in.
  await anaFractions.click();
  await expect(page).toHaveURL(new RegExp(`/classes/${CP_CLASS_ID}/progress/${CP_ANA}/${CP_FRACTIONS}$`));
  const panel = page.getByRole('complementary', { name: 'Ana Lee' });
  await expect(panel.getByRole('heading', { name: 'Ana Lee' })).toBeFocused();
  await expect(panel).toContainText("Showing each section's latest attempt.");
  await expect(panel).toContainText('Q10.45');
  await expect(panel).toContainText('0.45');
  await expect(panel).toContainText('✗ Wrong');
  await expect(panel).toContainText('Answer: 0.8');
  await expect(panel).toContainText('Count the tenths.');
  await expect(panel).toContainText('three quarters');
  await expect(panel).toContainText('✓ Right');
  await expect(panel).toContainText('To grade');
  expect(api.calls).toContain('class_student_work:class');
  await page.screenshot({ path: 'test-results/class-progress-panel.png', fullPage: false });

  // Reload keeps it open; Esc closes it and focus returns to the cell.
  await page.reload();
  await expect(page.getByRole('complementary', { name: 'Ana Lee' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(new RegExp(`/classes/${CP_CLASS_ID}/progress$`));
  await anaFractions.click();
  await page.getByRole('link', { name: 'Close' }).click();
  await expect(page.getByRole('link', { name: 'Ana Lee, Fractions 2: done, 50 percent' })).toBeFocused();

  // Hide names: no name in text or ANY attribute, including tooltips and
  // link names — and it survives a reload (remembered on this device).
  const sw = page.getByRole('switch', { name: 'Hide names' });
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: /Reads 4\/5 as 0.45/ }).click();
  expect(await namesInDom(page)).toEqual([]);
  await expect(page.getByRole('link', { name: 'Student 1, Fractions 2: done, 50 percent' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Hide names' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('link', { name: 'Student 1, Fractions 2: done, 50 percent' }).click();
  await expect(page.getByRole('complementary', { name: 'Student 1' })).toContainText('Answer: 0.8');
  expect(await namesInDom(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('switch', { name: 'Hide names' }).click();

  // Least done first: Caleb (0 done, 0 started) leads.
  await page.getByRole('checkbox', { name: 'Least done first' }).check();
  await expect(page.locator('tbody th[scope="row"]').first()).toHaveText('Caleb Wu');

  // A failed refresh keeps the grid and says so.
  api.failNext = true;
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByText(/Couldn't refresh · showing/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ana Lee, Fractions 2: done, 50 percent' })).toBeVisible();
  api.failNext = false;

  // The per-activity page: misconceptions and common wrong answers ABOVE the grid.
  await page.goto(`/activity/${CP_FRACTIONS}/progress`);
  await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /9 Maths B/ })).toContainText('1 done · 1 started · 1 not started');
  const wrong = page.getByRole('button', { name: /Q1 · 2 wrong · most common: 0.45 \(2\)/ });
  await expect(wrong).toHaveAttribute('aria-expanded', 'true');
  const wrongTop = await wrong.boundingBox();
  const gridTop = await page.locator('table').first().boundingBox();
  expect(wrongTop!.y).toBeLessThan(gridTop!.y);
  await expect(page.getByRole('columnheader', { name: 'Warm-up' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Section 2' })).toBeVisible();
  await page.screenshot({ path: 'test-results/activity-progress.png', fullPage: true });
  await page.getByRole('link', { name: 'Ana Lee, Warm-up: checked, 50 percent, 2 attempts' }).click();
  await expect(page).toHaveURL(new RegExp(`/activity/${CP_FRACTIONS}/progress/${CP_ANA}$`));
  const activityPanel = page.getByRole('complementary', { name: 'Ana Lee' });
  await expect(activityPanel).toContainText('Answer: 0.8');
  expect(api.calls).toContain('class_student_work:activity');

  // "N to grade" carries where it came from; Responses offers "Back to progress".
  await page.route('**/rest/v1/rpc/list_grading_queue**', (route) => route.fulfill({ json: [] }));
  await page.route('**/rest/v1/rpc/get_grading_assist_status**', (route) => route.fulfill({ json: null }));
  await page.route('**/rest/v1/rpc/list_grade_suggestions**', (route) => route.fulfill({ json: [] }));
  await activityPanel.getByRole('link', { name: '1 to grade in Fractions 2' }).click();
  await expect(page).toHaveURL(/\/responses\?from=/);
  const back = page.getByRole('link', { name: 'Back to progress' });
  await expect(back).toBeVisible();
  await back.click();
  await expect(page).toHaveURL(new RegExp(`/activity/${CP_FRACTIONS}/progress`));
});

test('Responses ignores a ?from= that is not an in-app progress path', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await page.route('**/rest/v1/rpc/list_grading_queue**', (route) => route.fulfill({ json: [] }));
  await page.route('**/rest/v1/rpc/get_grading_assist_status**', (route) => route.fulfill({ json: null }));
  await page.route('**/rest/v1/rpc/list_grade_suggestions**', (route) => route.fulfill({ json: [] }));
  await page.goto(`/activity/${CP_FRACTIONS}/responses?from=${encodeURIComponent('//evil.example/progress')}`);
  await expect(page.getByRole('link', { name: 'Back to editor' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to progress' })).toHaveCount(0);
});

test('on a phone the answers are a full page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await stubClassProgressApi(page);
  await page.goto(`/classes/${CP_CLASS_ID}/progress/${CP_ANA}/${CP_FRACTIONS}`);
  const panel = page.getByRole('complementary', { name: 'Ana Lee' });
  await expect(panel).toContainText('Answer: 0.8');
  const box = await panel.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(370);
  await page.screenshot({ path: 'test-results/class-progress-phone.png' });
  // Closed, the grid page itself has no sideways scroll at phone width: the
  // table scrolls inside its own box, with the name column pinned.
  await page.getByRole('link', { name: 'Close' }).click();
  await expect(page.getByRole('link', { name: 'Ana Lee, Fractions 2: done, 50 percent' })).toBeVisible();
  const overflow = await page.evaluate(() => {
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && !el.closest('.cp-scroller'))
      .map((el) => `${el.tagName}.${el.className}`.slice(0, 80));
    return { by: document.documentElement.scrollWidth - window.innerWidth, wide: wide.slice(0, 5) };
  });
  await page.screenshot({ path: 'test-results/class-progress-phone-grid.png', fullPage: true });
  expect(overflow).toEqual({ by: 0, wide: [] });
});
