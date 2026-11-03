// =============================================================================
// who-first-phone.e2e.ts — "Who to see first" on the phone a teacher carries
// -----------------------------------------------------------------------------
// jsdom can't measure any of this. The mistake is the field a teacher opens a
// row for (C-162), and the list is read while walking the room (W-2), so:
// nothing in the drawer may need a sideways scroll, a scrollable table must be
// reachable by keyboard, and "Not updated" must sit above the names.
// =============================================================================

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';
import { FT_CLASS_ID, stubFactsTeacherApi } from '../helpers/factsTeacherStub';
import { stubMixedTeacherApi } from '../helpers/mixedTeacherStub';
import { MIXED_PRACTICE_RPC } from '../../src/lib/mixedPracticeRpc';

const WHO_ROUTE = `**/rest/v1/rpc/${MIXED_PRACTICE_RPC.whoFirst}`;
const MISTAKE = 'Treats the constant as the difference between consecutive y values';

test.use({ viewport: { width: 375, height: 812 } });

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await stubFactsTeacherApi(page);
  await stubMixedTeacherApi(page);
  await page.route(WHO_ROUTE, (route) =>
    route.fulfill({
      json: {
        mixed_on: true, facts_on: true, started_today: 12,
        stuck: [],
        facts: [{ student_id: 's5', name: 'Sam Lee', families: ['Addition to 20'] }],
        same_mistake: [{ student_id: 's2', name: 'Ben Carter', mistakes: [
          { id: 'm', label: MISTAKE, skills: [{ id: 'a', label: 'Compute a unit rate' }] },
        ] }],
        everyone_else: 10,
      },
    }),
  );
  await page.route(`**/rest/v1/rpc/${MIXED_PRACTICE_RPC.studentRecent}`, (route) =>
    route.fulfill({
      json: [
        { practice_day: '2027-02-15', kind: 'skill', skill_id: 'a', skill_label: 'Compute a unit rate',
          correct: false, skipped: false, mistakes: [{ id: 'm', label: MISTAKE }] },
        { practice_day: '2027-02-14', kind: 'skill', skill_id: 'a', skill_label: 'Compute a unit rate',
          correct: true, skipped: false, mistakes: [] },
      ],
    }),
  );
  await page.goto(`/classes/${FT_CLASS_ID}/facts`);
  await page.getByTestId('ft-who').getByRole('button', { name: 'Show the list' }).click();
});

test('a drawer row shows its mistake without a sideways scroll, and stays a table', async ({ page }) => {
  const who = page.getByTestId('ft-who');
  await who.getByRole('button', { name: /^Ben Carter:/ }).click();
  const drawer = who.getByTestId('ft-who-drawer');
  await expect(drawer).toContainText(MISTAKE);

  const fits = await drawer.evaluate((el) => el.scrollWidth <= el.clientWidth);
  expect(fits).toBe(true);
  const cell = drawer.getByRole('cell', { name: MISTAKE });
  const box = (await cell.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  // A try with no mistake has no empty line on a phone.
  await expect(drawer.getByRole('row')).toHaveCount(3);
  await expect(drawer.getByText('—')).toBeHidden();

  await expect(drawer.getByRole('columnheader', { name: 'Mistake' })).toBeAttached();
  const axe = await new AxeBuilder({ page })
    .include('[data-testid="ft-who"]')
    .include('[data-testid="ft-mixed"]')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('the scrolling tables can be reached by keyboard', async ({ page }) => {
  // Long enough to overflow a phone: a table that fits has nothing to reach.
  await page.route(`**/rest/v1/rpc/${MIXED_PRACTICE_RPC.students}`, (route) =>
    route.fulfill({
      json: [{ student_id: 's3', name: 'Maximiliana Featherstonehaugh-Papadopoulos', days_this_week: 5,
        struggling: [{ id: 'a', label: 'Compute a unit rate from a ratio' }],
        latest_score: { right: 6, answered: 6, planned: 6, practice_day: '2027-02-15' }, score_in_progress: true }],
    }),
  );
  const panel = page.getByTestId('ft-mixed');
  await panel.getByRole('button', { name: 'Show students' }).click();
  await expect(panel.getByTestId('ft-mixed-students')).toBeVisible();
  const axe = await new AxeBuilder({ page }).withRules(['scrollable-region-focusable']).analyze();
  expect(axe.violations).toEqual([]);
});

test('a row with nothing to open is its text height, and has no chevron', async ({ page }) => {
  const who = page.getByTestId('ft-who');
  const name = who.locator('.ft-who-row > .ft-who-name');
  await expect(name).toHaveText('Sam Lee');
  expect((await name.boundingBox())!.height).toBeLessThan(30);
  const chevron = (selector: string) =>
    who.locator(selector).first().evaluate((el) => getComputedStyle(el, '::after').content);
  expect(await chevron('.ft-who-open')).not.toBe('none');
  await expect(who.locator('.ft-who-row:not(:has(.ft-who-open))')).toHaveCount(1);
});

test('"Not updated" sits above the names', async ({ page }) => {
  const who = page.getByTestId('ft-who');
  await expect(who).toContainText('Ben Carter');
  await page.route(WHO_ROUTE, (route) => route.fulfill({ status: 500, json: { message: 'x' } }));
  await page.clock.fastForward(5_100);
  const note = who.getByText(/^Not updated since /);
  await expect(note).toBeVisible();
  const first = who.getByRole('region').first();
  expect((await note.boundingBox())!.y).toBeLessThan((await first.boundingBox())!.y);
  await expect(who).toContainText('Ben Carter');
});
