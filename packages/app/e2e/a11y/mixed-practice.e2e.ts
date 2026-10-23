// =============================================================================
// a11y/mixed-practice.e2e.ts — axe over mixed practice's student screens
// (D43 slice 3, DM-17): the start card, a question, the feedback panel with
// its working open, and the done screen. Stubbed backend
// (helpers/mixedPracticeStub.ts).
// =============================================================================

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { PX_CODE, stubMixedPracticeApi } from '../helpers/mixedPracticeStub';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';

async function expectNoAxeViolations(page: Page, where: string): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }));
  expect(violations, `${where}: ${JSON.stringify(violations, null, 2)}`).toEqual([]);
}

test('no axe violations: start card, question, feedback with working, done', async ({ page }) => {
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  await stubMixedPracticeApi(page, { graded: true });
  await page.goto(`/practice/${PX_CODE}`);
  await page.getByRole('button', { name: 'Start' }).waitFor();
  await expectNoAxeViolations(page, 'start card');

  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('textbox').waitFor();
  await expectNoAxeViolations(page, 'question');

  await page.getByRole('textbox').fill('8');
  await page.getByRole('textbox').press('Enter');
  await page.getByTestId('mx-working').waitFor();
  await expectNoAxeViolations(page, 'feedback');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('heading', { name: 'Practice done' }).waitFor();
  await expectNoAxeViolations(page, 'done');
});
