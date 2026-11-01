// =============================================================================
// unit-tracker.e2e.ts — the unit tracker (curriculum D67) in a real browser,
// with a stubbed backend.
//   1. A student reads the four ruled words, the fallback and the teacher's
//      wording, the unlock note, and a next line that goes where it says.
//   2. A teacher's page has no statuses, and wording saves with a visible state.
// =============================================================================

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { E2E_SUPABASE_URL, signInAs, stubIdentityApi } from '../helpers/studentSession';
import { UNIT_TRACKER_RPC } from '../../src/lib/unitTrackerRpc';

const CLASS_ID = 'cccccccc-0000-4000-8000-00000000e2e7';
const rpc = (name: string) => `${E2E_SUPABASE_URL}/rest/v1/rpc/${name}`;

test('a student reads statuses, row wording and the next line', async ({ page }) => {
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  await page.route(rpc(UNIT_TRACKER_RPC.mine), (route) =>
    route.fulfill({
      json: {
        units: [{
          unit: 'Rates and Proportional Relationships',
          next: { kind: 'check', skill_id: 'b', activity_id: 'aaaaaaaa-0000-4000-8000-00000000e2e7', title: 'Constant of proportionality' },
          rows: [
            { skill_id: 'a', label: 'Compute a unit rate', wording: null, letters: ['D', 'C', 'P'], status: 'passed', harder: true },
            { skill_id: 'b', label: 'Label B', wording: 'I can find k in y = kx', letters: ['D'], status: 'learning', harder: false },
            { skill_id: 'c', label: 'Read a proportional graph', wording: null, letters: [], status: 'keep_practising', harder: false },
            { skill_id: 'd', label: 'Model a proportional situation', wording: null, letters: [], status: 'not_started', harder: false },
          ],
        }],
      },
    }),
  );
  await page.goto(`/progress/${CLASS_ID}`);

  await expect(page.getByRole('heading', { level: 1, name: 'Your progress' })).toBeVisible();
  await expect(page.locator('[data-status]')).toHaveText(['Passed', 'Learning', 'Keep practising', 'Not started']);
  await expect(page.getByText('Compute a unit rate · D C P')).toBeVisible();
  await expect(page.getByText('I can find k in y = kx')).toBeVisible();
  await expect(page.getByText('Label B')).toHaveCount(0);
  await expect(page.getByText('Harder questions are now in your practice')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Your next check: Constant of proportionality' }))
    .toHaveAttribute('href', '/a/aaaaaaaa-0000-4000-8000-00000000e2e7');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});

test('a teacher sees no statuses and saves wording with a visible state', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await page.route(rpc(UNIT_TRACKER_RPC.teacher), (route) =>
    route.fulfill({
      json: { units: [{ unit: 'Rates', rows: [{ skill_id: 's.a', label: 'Compute a unit rate', wording: null, letters: ['D'] }] }] },
    }),
  );
  const saves: unknown[] = [];
  await page.route(rpc(UNIT_TRACKER_RPC.setWording), (route) => {
    saves.push(route.request().postDataJSON());
    return route.fulfill({ status: 204, body: '' });
  });
  await page.goto(`/classes/${CLASS_ID}/tracker`);

  const field = page.getByLabel('Compute a unit rate · D');
  await expect(field).toBeVisible();
  await expect(page.locator('[data-status]')).toHaveCount(0);
  await field.fill('I can find a unit rate');
  await field.blur();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  expect(saves).toEqual([{ p_skill_id: 's.a', p_wording: 'I can find a unit rate' }]);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});
