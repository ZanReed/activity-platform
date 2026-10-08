// =============================================================================
// a11y/chain-hooks.e2e.ts — the chain hook page in a real browser (0057;
// docs/design/chain-hooks-view.md, eng re-run D3 / RT3)
// -----------------------------------------------------------------------------
// Two proofs jsdom cannot give:
//   1. axe finds no violations on the page with a class chosen, a used hook,
//      an unused one and the inline date editor open (the states with the most
//      controls on screen);
//   2. in PRINT media the sheet is a reference (design 7.1A): the class picker,
//      every button, the used marks and the crumb are hidden; the "teacher
//      copy" line shows; the hooks and their notes print.
// =============================================================================

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';
import { CH_CHAIN, CH_CLASS_ID, stubChainHooksApi } from '../helpers/chainHooksStub';

async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }));
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

async function openPage(page: Page): Promise<void> {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await stubChainHooksApi(page);
  await page.addInitScript((id) => window.localStorage.setItem('chainHooks.classId', id as string), CH_CLASS_ID);
  await page.goto(`/chains/${CH_CHAIN}`);
  await page.getByRole('heading', { level: 1, name: 'Angles and Parallel Lines' }).waitFor();
  await page.getByRole('button', { name: /^Unmark: Draw two/ }).waitFor();
}

test.describe('the chain hook page', () => {
  test('has no axe violations: marks shown, then the inline date editor open', async ({ page }) => {
    await openPage(page);
    await expect(page.getByRole('article')).toHaveCount(2);
    await expectNoAxeViolations(page);

    await page.getByRole('button', { name: 'Change date' }).click();
    await expect(page.getByLabel(/Used on/)).toBeFocused();
    await expectNoAxeViolations(page);
  });

  test('prints as a reference sheet: no picker, buttons or marks; the teacher-copy line and the notes show', async ({ page }) => {
    await openPage(page);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByText('Hooks — teacher copy, not for students')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeHidden();
    await expect(page.getByRole('button')).toHaveCount(0);
    await expect(page.getByText(/Used /)).toBeHidden();
    await expect(page.getByRole('link', { name: 'Activities' })).toBeHidden();
    await expect(page.getByText(/Four sharp angles are 50°/)).toBeVisible();
    await expect(page.getByText(/A bag at \$4 is still just money here\./)).toBeVisible();
  });
});
