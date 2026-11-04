// =============================================================================
// period-today.e2e.ts — a period's Today list and panel, in a real browser, on
// a phone (period assembly PA-5, PA-8; docs/design/period-assembly.md)
// -----------------------------------------------------------------------------
// jsdom can't measure any of this: long titles mustn't cause a sideways scroll
// on the phone a student or a walking teacher holds.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CLASS_TODAY_RPC, SET_CLASS_TODAY_RPC } from '../../src/lib/classTodayRpc';
import { MY_ACTIVITY_PROGRESS_RPC } from '../../src/lib/edgeFunctions';
import { FT_CLASS_ID, stubFactsTeacherApi } from '../helpers/factsTeacherStub';
import { PX_CODE, stubMixedPracticeApi } from '../helpers/mixedPracticeStub';
import { stubMixedTeacherApi } from '../helpers/mixedTeacherStub';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';

const LONG = 'Unit rates and comparing two different supermarket prices for the same thing';
const A = { activity_id: 'aaaaaaaa-0000-4000-8000-000000000001', title: LONG };
const B = { activity_id: 'aaaaaaaa-0000-4000-8000-000000000002', title: 'Ratios' };

test.use({ viewport: { width: 375, height: 812 } });

async function stubToday(page: Page, activities: unknown[]) {
  await page.route(`**/rest/v1/rpc/${CLASS_TODAY_RPC}`, (route) =>
    route.fulfill({ json: { on_date: '2027-02-15', activities } }),
  );
  await page.route(`**/rest/v1/rpc/${MY_ACTIVITY_PROGRESS_RPC}`, (route) => route.fulfill({ json: [] }));
}

const noSideways = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('a student\'s list on a double fits a phone, in order, and each row is a real target', async ({ page }) => {
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  await stubMixedPracticeApi(page, { graded: false });
  await stubToday(page, [A, B]);
  await page.goto(`/practice/${PX_CODE}`);
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Your teacher’s question');
  const links = page.getByRole('main').getByRole('link');
  await expect(links).toHaveCount(2);
  await expect(links.first()).toHaveAttribute('href', `/a/${A.activity_id}`);
  expect(await noSideways(page)).toBe(true);
  for (const el of await page.getByRole('main').locator('a, button').all()) {
    expect((await el.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  const axe = await new AxeBuilder({ page }).include('main').analyze();
  expect(axe.violations).toEqual([]);
});

test('a teacher picks today on a phone, with no sideways scroll', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await stubFactsTeacherApi(page);
  await stubMixedTeacherApi(page);
  await stubToday(page, []);
  await page.route(`**/rest/v1/rpc/${SET_CLASS_TODAY_RPC}`, (route) =>
    route.fulfill({ json: { on_date: '2027-02-15', activities: [A] } }),
  );
  await page.route('**/rest/v1/class_activities*', (route) =>
    route.fulfill({
      json: [
        {
          class_id: FT_CLASS_ID, activity_id: A.activity_id, added_at: '2027-02-01T00:00:00Z',
          activities: { title: LONG, status: 'published', deleted_at: null, current_version_id: 'v1' },
        },
      ],
    }),
  );
  await page.goto(`/classes/${FT_CLASS_ID}/facts`);
  const panel = page.getByRole('region', { name: 'Today' });
  await panel.getByRole('button', { name: "Pick today's activity" }).click();
  await panel.getByRole('button', { name: `Use today: ${LONG}` }).click();
  await expect(panel).toContainText(`Hook · ${LONG}`);
  expect(await noSideways(page)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('section[aria-label="Today"]').analyze();
  expect(axe.violations).toEqual([]);
});
