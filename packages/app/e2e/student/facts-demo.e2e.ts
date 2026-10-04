// =============================================================================
// facts-demo.e2e.ts — /facts/demo, end to end in a real browser (D43 slice 1)
// -----------------------------------------------------------------------------
// The preview's two promises (X2 as amended by DR-4, and T8):
//   1. It is the SAME runner a student uses, and it runs to the student's own
//      done screen with nothing but the keyboard (DR-2: the keys belong to the
//      answer box, and the box has focus on every item).
//   2. It stores and uploads NOTHING: zero requests to the Supabase origin for
//      the whole run, signed out. The origin is the lane's production constant
//      (P2), never retyped here.
// =============================================================================

import { expect, test } from '@playwright/test';
import { STUB_LANE_SUPABASE_URL } from '../helpers/e2eOrigins';

test('the demo runs to the done screen from the keyboard and calls Supabase zero times', async ({ page }) => {
    // ~16 warm-up trials and 10 facts, each held past the 300 ms guard.
    test.setTimeout(90_000);
    const supabaseCalls: string[] = [];
    page.on('request', (req) => {
        if (req.url().startsWith(STUB_LANE_SUPABASE_URL)) supabaseCalls.push(req.url());
    });

    await page.goto('/facts/demo');
    await expect(page.getByText('This is a demo. Nothing you type is saved.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quick number facts' })).toBeVisible();
    await page.getByRole('button', { name: 'Start' }).click();

    // The warm-up: type whatever number is shown. The answer box has focus.
    const answer = page.getByTestId('fx-answer');
    const expr = page.locator('.fx-expr');
    for (let i = 0; i < 25; i++) {
        if (await page.getByRole('heading', { name: 'Warm-up done' }).isVisible()) break;
        await expect(answer).toBeFocused();
        const shown = (await expr.textContent())!.replace('−', '-');
        await page.waitForTimeout(320); // past the 300 ms guard
        await page.keyboard.type(shown);
        await page.keyboard.press('Enter');
        // Let the next trial render before reading it (a repeat can show the
        // same number twice, so there is no text change to wait on).
        await page.waitForTimeout(150);
    }
    await page.getByRole('button', { name: 'Start' }).click();

    // The facts: skip the first, answer the rest from the demo's answers.
    const answers: Record<string, string> = {
        '7 × 8 = __': '56', '63 ÷ 9 = __': '7', '12² = __': '144',
        '3/4 = __ as a decimal': '0.75', '−3 − (−5) = __': '2', '√81 = __': '9',
        '6 × (−4) = __': '-24', '1 m = __ cm': '100', '2/5 = __ %': '40', '4³ = __': '64',
    };
    for (let i = 0; i < 10; i++) {
        const shown = (await expr.textContent())!;
        await expect(answer).toBeFocused();
        await page.waitForTimeout(320);
        if (i === 0) {
            await page.getByRole('button', { name: 'Skip this one' }).click();
        } else {
            await page.keyboard.type(answers[shown]!);
            await page.keyboard.press('Enter');
        }
        if (i < 9) await expect(expr).not.toHaveText(shown);
    }

    await expect(page.getByRole('heading', { name: 'All done' })).toBeVisible();
    await expect(page.getByText('You got 9 right. You skipped 1.')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/probe/i);
    expect(supabaseCalls).toEqual([]);
});
