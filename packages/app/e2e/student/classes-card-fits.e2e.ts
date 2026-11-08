// =============================================================================
// classes-card-fits.e2e.ts — a class card's links stay inside the card
// -----------------------------------------------------------------------------
// From the walkthrough, 2026-11-09: the row of links ran past the card's edge,
// worst on a phone. CI's fonts then showed the teacher nav doing the same, so
// the page's width is asserted too. jsdom has no layout: this needs a browser.
// =============================================================================

import { expect, test } from '@playwright/test';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';
import { stubFactsTeacherApi } from '../helpers/factsTeacherStub';

for (const [label, width] of [['a small phone', 320], ['a phone', 375], ['a laptop', 1024], ['a wide screen', 1280]] as const) {
  test(`every link stays inside the card on ${label}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await stubIdentityApi(page, { role: 'teacher' });
    await signInAs(page);
    await stubFactsTeacherApi(page);
    await page.route('**/rest/v1/class_activities*', (route) => route.fulfill({ json: [] }));
    await page.route('**/rest/v1/activities*', (route) => route.fulfill({ json: [] }));
    await page.goto('/classes');
    await expect(page.getByRole('link', { name: 'Unit tracker' }).first()).toBeVisible();
    const out = await page.evaluate(() => {
      const card = [...document.querySelectorAll('li')].find((li) => li.textContent?.includes('Unit tracker'))!;
      const box = card.getBoundingClientRect();
      return [...card.querySelectorAll('a, button')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.right > box.right + 0.5 || r.left < box.left - 0.5;
        })
        .map((el) => el.textContent);
    });
    expect(out).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
