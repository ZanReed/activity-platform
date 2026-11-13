// =============================================================================
// banner-pin.e2e.ts — C-5 (ui-review-group-c.md) + its Fable review fix: a
// status banner stays in view once the student has scrolled, and never covers
// the top bar's title and way back (the bar is sticky from 640 px up).
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

async function bannerAfterScroll(page: Page) {
  const api = await stubActivityApi(page);
  await signInAs(page);
  await page.goto(activityUrl());
  api.failCheckWith(401);
  await page.getByRole('button', { name: 'Check' }).first().click();
  const banner = page.locator('[data-banner="session-expired"]');
  await expect(banner).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  return banner;
}

test('desktop: the banner pins just under the top bar, not over it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const banner = await bannerAfterScroll(page);
  const bar = await page.locator('.viewer-topbar').boundingBox();
  const box = await banner.boundingBox();
  expect(bar!.y).toBeLessThanOrEqual(1); // the bar is pinned at the top
  expect(box!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height - 1);
  expect(box!.y).toBeLessThan(bar!.y + bar!.height + 40); // and still in view
  await expect(page.locator('.viewer-topbar__back')).toBeInViewport();
});

test('phone: the top bar scrolls away and the banner pins at the top', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const banner = await bannerAfterScroll(page);
  const box = await banner.boundingBox();
  expect(Math.abs(box!.y)).toBeLessThanOrEqual(1);
  await expect(banner).toBeInViewport();
});
