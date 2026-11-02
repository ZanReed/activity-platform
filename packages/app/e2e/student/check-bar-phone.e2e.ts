// =============================================================================
// check-bar-phone.e2e.ts — the sticky Check bar stays inside a phone's screen
// -----------------------------------------------------------------------------
// Its negative margins bleed it to the edge of whatever holds it. A one-section
// group has no side padding to bleed across, so the bar stuck out by its margin
// and the whole page scrolled sideways. jsdom can't measure any of this.
// =============================================================================

import { expect, test } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

function firstFadedBlock(): Record<string, unknown> {
  let found: Record<string, unknown> | undefined;
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      const record = node as Record<string, unknown>;
      if (record['type'] === 'faded_worked_example') found ??= record;
      Object.values(record).forEach(walk);
    }
  };
  walk(servedFixtureDocument().sections);
  return found!;
}

function documentWithSections(count: number) {
  const faded = firstFadedBlock();
  return {
    ...servedFixtureDocument(),
    sections: Array.from({ length: count }, (_, index) => ({
      id: `11111111-0000-4000-8000-00000000b00${index}`,
      title: `Part ${index + 1}`,
      // Only the last one closes the group, so `count` sections share one bar.
      isCheckpoint: index === count - 1,
      rows: [
        {
          id: `row-${index}`,
          gridLines: 'inherit',
          columns: [
            {
              id: `col-${index}`,
              blocks: [{ ...faded, id: `33333333-0000-4000-8000-00000000b00${index}` }],
            },
          ],
        },
      ],
    })),
  };
}

test.use({ viewport: { width: 375, height: 812 } });

for (const count of [1, 3]) {
  test(`a ${count}-section group's bar fits the screen`, async ({ page }) => {
    await signInAs(page);
    await stubActivityApi(page, { document: documentWithSections(count) as never });
    await page.goto(activityUrl());
    const bar = page.locator('.viewer-check-group__footer').first();
    await expect(bar).toBeVisible();
    await expect(page.locator(`[data-group-sections="${count}"]`)).toHaveCount(1);

    expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
    const box = (await bar.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    // Exactly: short of the edge means the bleed across the group's padding is gone.
    expect(box.x + box.width).toBe(375);
    const widths = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }));
    expect(widths.doc).toBeLessThanOrEqual(widths.win);

    // The button still lines up with the section's own 16px side padding.
    const button = (await bar.getByRole('button').first().boundingBox())!;
    expect(button.x - box.x).toBe(16);
  });
}
