import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Model A — in-equation math prompt authoring (MA-T7).
// ----------------------------------------------------------------------------
// The authoritative end-to-end check for the authoring flow the in-app browser
// and jsdom can't cover (real MathLive web component in real chromium): the
// insert-blank affordance drops a \placeholder gap, and typing an answer in the
// gap reconciles to EMPTIED latex (the answer never leaks via the stored latex /
// data-math-prompt-latex) plus a prompts[] entry carrying the answer as ascii.
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

async function insertMathBlock(page: Page, latex: string) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
    await page.evaluate((l) => {
        (window as any).__tiptapEditor.chain().focus('end').insertMathBlock(l).run();
    }, latex);
    // A programmatic insert doesn't fire the auto-open decoration, so click the
    // block to enter edit mode (the real user action) — the MathLive field mounts.
    await page.locator('.math-block-wrapper').first().click();
    await expect(page.locator('.math-block-input')).toBeVisible();
    // Give MathLive's async focus + prompt wiring a beat to settle.
    await page.waitForTimeout(200);
}

function readMathBlockAttrs(page: Page) {
    return page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        let attrs: any = null;
        ed.state.doc.descendants((node: any) => {
            if (attrs === null && node.type.name === 'mathBlock') attrs = node.attrs;
            return attrs === null;
        });
        return attrs;
    });
}

test('the + Blank button inserts a \\placeholder gap into the equation', async ({
    page,
}) => {
    await insertMathBlock(page, 'x = 2 + ');
    await page.locator('.math-insert-blank').click();
    // The insert fires the field's input event → reconcile writes the (emptied)
    // latex, which now carries a placeholder marker.
    await expect
        .poll(async () => (await readMathBlockAttrs(page)).latex)
        .toContain('\\placeholder');
});

test('typing an answer in a gap captures it as a prompt (answer-in-gap)', async ({
    page,
}) => {
    await insertMathBlock(page, 'x = \\placeholder[g]{}');
    // Simulate the author typing "2a" into the gap, then the field's input event
    // (drives the same onInput path a keystroke would).
    await page.evaluate(() => {
        const mf: any = document.querySelector('.math-block-input');
        mf.setPromptValue('g', '2a', {});
        mf.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // The reconcile captured the answer as a prompt (as ascii), keyed by the gap.
    await expect
        .poll(async () => (await readMathBlockAttrs(page)).prompts)
        .toEqual([{ id: 'g', answer: '2a', acceptableAnswers: [] }]);

    // The DRAFT keeps the raw answer in the latex (author-visible, private); the
    // leak-free-at-publish emptying is a serialize concern, unit-tested separately.
    const attrs = await readMathBlockAttrs(page);
    expect(attrs.latex).toContain('\\placeholder[g]');
});

test('the Answer settings popover configures the gap grading (trimmed to math)', async ({
    page,
}) => {
    await insertMathBlock(page, 'x = \\placeholder[g]{}');
    await page.evaluate(() => {
        const mf: any = document.querySelector('.math-block-input');
        mf.setPromptValue('g', '2a', {});
        mf.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Open the popover from the edit chrome.
    await page.locator('.math-gap-settings').click();
    const pop = page.locator('.blank-edit-popover');
    await expect(pop).toBeVisible();

    // Trimmed to the math-relevant controls; the fill-in-blank-only parts are gone.
    await expect(pop.getByLabel('Math equivalence mode')).toBeVisible();
    await expect(pop.getByLabel('Comparison tolerance')).toBeVisible();
    await expect(pop.getByText('Acceptable answers')).toBeVisible();
    await expect(pop.getByRole('radiogroup')).toHaveCount(0); // no answer-type radios
    await expect(pop.getByText('Advanced options')).toHaveCount(0); // no hint/mistake

    // Configure exact-form + a tolerance — both write onto the prompt (real
    // change + blur, so commit-on-blur fires).
    await pop.getByLabel('Math equivalence mode').selectOption('exact-form');
    await pop.getByLabel('Comparison tolerance').fill('0.5');
    await pop.getByLabel('Comparison tolerance').blur();

    await expect
        .poll(async () => (await readMathBlockAttrs(page)).prompts)
        .toEqual([
            {
                id: 'g',
                answer: '2a',
                acceptableAnswers: [],
                equivalence: 'exact-form',
                tolerance: 0.5,
            },
        ]);
});

test('the ⌘⇧B / Ctrl⇧B shortcut inserts a gap while editing', async ({
    page,
}) => {
    await insertMathBlock(page, 'x = 2 + ');
    await page.locator('.math-block-input').click(); // ensure the field is focused
    await page.keyboard.press('ControlOrMeta+Shift+B');
    await expect
        .poll(async () => (await readMathBlockAttrs(page)).latex)
        .toContain('\\placeholder');
});

test('an unanswered gap shows the incomplete signifier, cleared once answered', async ({
    page,
}) => {
    await insertMathBlock(page, 'x = \\placeholder[g]{}'); // a gap with no answer
    await expect(page.locator('.math-gap-incomplete')).toHaveText(
        'Blank needs an answer',
    );
    await page.evaluate(() => {
        const mf: any = document.querySelector('.math-block-input');
        mf.setPromptValue('g', '2a', {});
        mf.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('.math-gap-incomplete')).toHaveCount(0);
});

test('a math gap renders as a box, not raw \\placeholder, in the static view', async ({
    page,
}) => {
    await insertMathBlock(page, 'x^2 + \\placeholder[g]{}');
    await page.evaluate(() => {
        const mf: any = document.querySelector('.math-block-input');
        mf.setPromptValue('g', '3', {});
        mf.dispatchEvent(new Event('input', { bubbles: true }));
    });
    // Escape exits edit mode → the static KaTeX render shows (KaTeX can't render
    // \placeholder, so before the fix it showed raw red error text).
    await page.locator('.math-block-input').press('Escape');
    const staticRender = page.locator('.math-block-render');
    await expect(staticRender).toBeVisible();
    const text = await staticRender.innerText();
    expect(text).not.toContain('placeholder');
});

test('a plain equation stays prompt-free (byte-identity)', async ({ page }) => {
    await insertMathBlock(page, 'x = 4');
    await page.evaluate(() => {
        const mf: any = document.querySelector('.math-block-input');
        mf.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const attrs = await readMathBlockAttrs(page);
    expect(attrs.prompts).toEqual([]);
    expect(attrs.latex).not.toContain('\\placeholder');
});
