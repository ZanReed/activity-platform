// =============================================================================
// glossary.e2e.ts — the course glossary, read by a signed-in student
// -----------------------------------------------------------------------------
// docs/design/glossary.md R1/R13/R15/R16, the store-read half (step 4). The
// dialog itself is proven over local terms by viewer-definition.e2e.ts; this
// spec proves the WIRE: the real StudentViewer route injects the real service,
// which calls the RPC the migration defines (path derived from the production
// constant, P2), deferred past first paint, and the rows merge with the
// activity's own words — including a store entry the local "slope" HIDES
// because it matches that entry's US variant (R15).
//
// 375px on purpose: the half-height sheet is what a student on a phone sees
// (the design's one student-lane e2e, GD-3).
// =============================================================================

import { expect, test } from '@playwright/test';
import { GLOSSARY_FOR_ACTIVITY_RPC } from '../../src/lib/edgeFunctions';
import {
  E2E_ACTIVITY_ID,
  activityUrl,
  signInAs,
  stubActivityApi,
} from '../helpers/studentSession';

const para = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text, marks: [] }],
});

// The shape glossary_for_activity returns (0043 §B) — one jsonb, not rows.
const STORE_PAYLOAD = {
  entries: [
    {
      term_id: 'gradient',
      term: 'gradient',
      variants: { us: 'slope' },
      body: [para('The store body — hidden here by the activity’s own “slope”.')],
      retired: false,
    },
    {
      term_id: 'y-intercept',
      term: 'y-intercept',
      variants: {},
      body: [para('Where a graph crosses the y-axis.')],
      retired: false,
    },
  ],
  capped: false,
};

test('the course glossary reaches a student on a phone, merged with the activity’s own words', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const rpcBodies: unknown[] = [];
  await page.route(`**/rest/v1/rpc/${GLOSSARY_FOR_ACTIVITY_RPC}`, async (route) => {
    rpcBodies.push(route.request().postDataJSON());
    await route.fulfill({ json: STORE_PAYLOAD });
  });
  await stubActivityApi(page);
  await signInAs(page);

  const read = page.waitForResponse(`**/rest/v1/rpc/${GLOSSARY_FOR_ACTIVITY_RPC}`);
  await page.goto(activityUrl());
  await expect(page.locator('[data-section-id]').first()).toBeVisible();
  // Deferred, not skipped: the read fires on its own once the page is idle.
  await read;
  expect(rpcBodies).toEqual([{ p_activity_id: E2E_ACTIVITY_ID }]);

  const summon = page.getByRole('button', { name: 'Glossary', exact: true });
  await summon.click();
  const dialog = page.getByRole('dialog', { name: 'Glossary' });
  await expect(dialog).toBeVisible();

  // The merged A→Z list ("All words", the last list): the store's y-intercept
  // AND the activity's slope — and not the store's gradient, which the local
  // slope hides (R15). "In this activity" (T2) pins just the worksheet's own.
  const allWords = dialog.locator('.glossary-list').last();
  await expect(allWords.locator('.glossary-row')).toHaveText([/slope/, /y-intercept/]);
  await expect(dialog.locator('.glossary-list').first().locator('.glossary-row')).toHaveText([
    /slope/,
  ]);
  const rows = dialog.locator('.glossary-row');

  await dialog.getByRole('searchbox').fill('crosses');
  await rows.filter({ hasText: 'y-intercept' }).first().click();
  await expect(dialog).toContainText('Where a graph crosses the y-axis.');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(summon).toBeFocused();
  // One read per activity per page load (R6) — opening never re-fetched.
  expect(rpcBodies).toHaveLength(1);
});

test('a failed store read is silent: the activity’s own terms still open', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route(`**/rest/v1/rpc/${GLOSSARY_FOR_ACTIVITY_RPC}`, (route) =>
    route.fulfill({ status: 500, json: { message: 'boom' } }),
  );
  await stubActivityApi(page);
  await signInAs(page);
  await page.goto(activityUrl());

  const term = page.locator('.viewer-definition__term', { hasText: 'slope' });
  await term.click();
  const dialog = page.getByRole('dialog', { name: 'Glossary' });
  await expect(dialog).toContainText('How steep the line is: rise over run.');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
