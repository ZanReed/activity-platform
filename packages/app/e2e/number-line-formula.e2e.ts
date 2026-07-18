import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Number-line formula authoring — type an inequality, board previews it.
// ----------------------------------------------------------------------------
// The interval answer is now authored by typing a 1-D inequality (mirrors the
// graph ray): "2 < x <= 5" → open-2/closed-5 segment; "x < -3" → left ray open
// at -3; "x >= 3" → right ray closed at 3. This replaced NumberLineView's own
// React numeric bound-rows; the kit board's interactive shape pills stay (the
// author board is the same board students use). The field is the shared math-
// first FormulaField, so the specs flip it to text mode to drive it. An
// unparseable entry shows an inline error and leaves the answer as-is.
// ============================================================================

async function intervalNumberLine(page: Page) {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertNumberLine().run();
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (pos === null && n.type.name === 'numberLine') pos = p;
            return pos === null;
        });
        ed.chain()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .command(({ tr }: any) => {
                tr.setNodeAttribute(pos, 'interaction', {
                    type: 'plot_interval',
                    correctInterval: { min: 0, minStyle: 'closed', max: 5, maxStyle: 'closed' },
                    tolerance: 0.1,
                });
                return true;
            })
            .run();
    });
    // The interval answer is the shared math-first FormulaField (a MathLive
    // <math-field> with a √x⇄abc text toggle). Flip it to TEXT mode so we can
    // drive it with plain fill/value — the same parse path a typed entry takes.
    // A fresh context opens in math mode, where the toggle reads "abc".
    await page
        .locator('.number-line-block')
        .getByRole('button', { name: 'abc' })
        .click();
    return page.getByLabel('Answer inequality');
}

function interval(page: Page) {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let iv: unknown = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any) => {
            if (
                n.type.name === 'numberLine' &&
                iv === null &&
                n.attrs.interaction.type === 'plot_interval'
            )
                iv = n.attrs.interaction.correctInterval;
        });
        return iv;
    });
}

test('the interval formula input replaces the React numeric bound rows', async ({
    page,
}) => {
    const field = await intervalNumberLine(page);
    await expect(field).toBeVisible();
    // Field pre-fills the current interval as an inequality.
    await expect(field).toHaveValue('0 <= x <= 5');
    // The old React authoring UI (numeric min/max "bound rows") is gone —
    // plot_interval now authors through the formula field, so the block has no
    // number inputs. (The kit board's shape pills — "Segment" / "Ray →" — are a
    // DIFFERENT, deliberate control: the author board is the same board students
    // use, so those stay; see NumberLineView + mountNumberLineAuthor.)
    await expect(
        page.locator('.number-line-block input[type="number"]'),
    ).toHaveCount(0);
});

test('a compound inequality → open/closed segment', async ({ page }) => {
    const field = await intervalNumberLine(page);
    await field.fill('2 < x <= 5');
    await field.blur();
    expect(await interval(page)).toEqual({
        min: 2,
        minStyle: 'open',
        max: 5,
        maxStyle: 'closed',
    });
});

test('a one-sided inequality → a ray (missing bound), open circle', async ({
    page,
}) => {
    const field = await intervalNumberLine(page);
    await field.fill('x < -3');
    await field.blur();
    // No min = ray pointing left; open at -3.
    expect(await interval(page)).toEqual({ max: -3, maxStyle: 'open' });

    await field.fill('x >= 3');
    await field.blur();
    // No max = ray pointing right; closed at 3.
    expect(await interval(page)).toEqual({ min: 3, minStyle: 'closed' });
});

test('an unparseable entry shows an error and leaves the answer unchanged', async ({
    page,
}) => {
    const field = await intervalNumberLine(page);
    await field.fill('x >= 3');
    await field.blur();
    const good = await interval(page);
    await field.fill('not an inequality');
    await field.blur();
    await expect(page.getByText(/Couldn.t read that/)).toBeVisible();
    expect(await interval(page)).toEqual(good); // unchanged
});
