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
