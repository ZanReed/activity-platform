// The student's side of a number-facts run, as a person drives it: the
// warm-up, then one typed answer per fact. Shared by the stub lane
// (facts-entry.e2e.ts) and the real-backend row (integration.e2e.ts) so both
// walk the run the same way.

import type { Page } from '@playwright/test';

/** Type the warm-up through to the "Warm-up done" card, then Start. */
export async function warmUp(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Start' }).click();
    const expr = page.locator('.fx-expr');
    for (let i = 0; i < 25; i++) {
        if (await page.getByRole('heading', { name: 'Warm-up done' }).isVisible()) break;
        const shown = (await expr.textContent())!.replace('−', '-');
        await page.waitForTimeout(320);
        await page.keyboard.type(shown);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(150);
    }
    await page.getByRole('button', { name: 'Start' }).click();
}

/** One answer, typed after a human-ish pause and submitted with Enter. */
export async function answer(page: Page, text: string): Promise<void> {
    await page.waitForTimeout(320);
    await page.keyboard.type(text);
    await page.keyboard.press('Enter');
}
