// =============================================================================
// a11y/mixed-teacher.e2e.ts — axe over the class's practice page with mixed
// practice on (D43 slice 4): the panel with its students open, and "Who to
// see first" with a drawer open. Stubbed backend.
// =============================================================================

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';
import { FT_CLASS_ID, stubFactsTeacherApi } from '../helpers/factsTeacherStub';
import { stubMixedTeacherApi } from '../helpers/mixedTeacherStub';

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

test('no axe violations: the panel with students open, the list with a drawer open', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await stubFactsTeacherApi(page);
  await stubMixedTeacherApi(page);
  await page.goto(`/classes/${FT_CLASS_ID}/facts`);
  const panel = page.getByTestId('ft-mixed');
  await panel.getByRole('button', { name: 'Show students' }).click();
  await panel.getByTestId('ft-mixed-students').waitFor();
  const who = page.getByTestId('ft-who');
  await who.getByRole('button', { name: 'Show the list' }).click();
  await who.getByRole('button', { name: /^Ben Carter:/ }).click();
  await who.getByTestId('ft-who-drawer').waitFor();
  await expectNoAxeViolations(page, 'practice page');
});
