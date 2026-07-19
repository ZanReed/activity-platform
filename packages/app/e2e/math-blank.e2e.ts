import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Math answer blanks (Model B) — the blank popover's answer-type authoring.
// ----------------------------------------------------------------------------
// A blank can be graded as Text (exact), Numeric (value + tolerance), or Math
// (expression equivalence via the lazy graph-kit). This drives the 3-way
// answer-type selector and the math-only equivalence + tolerance controls,
// asserting the node attrs the runtime reads (data-answer-type / data-equivalence).
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

async function openBlankPopover(page: Page) {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
    await page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertFillInBlank().run();
        ed.chain().insertBlank({ answer: '2a' }).run();
        let pos: number | null = null;
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'blank') pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
    return page.locator('.blank-edit-popover');
}

function readBlankAttrs(page: Page) {
    return page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        let attrs: Record<string, unknown> = {};
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'blank') attrs = node.attrs;
            return Object.keys(attrs).length === 0;
        });
        return attrs;
    });
}

test('answer-type selector offers Text / Numeric / Math (Text checked by default)', async ({
    page,
}) => {
    const pop = await openBlankPopover(page);
    await expect(pop).toBeVisible();
    const group = pop.getByRole('radiogroup', { name: 'Answer type' });
    await expect(group.getByRole('radio', { name: 'Text' })).toBeChecked();
    await expect(group.getByRole('radio', { name: 'Numeric' })).toBeVisible();
    await expect(group.getByRole('radio', { name: 'Math' })).toBeVisible();
});

test('choosing Math reveals equivalence + tolerance and writes answerType=math', async ({
    page,
}) => {
    const pop = await openBlankPopover(page);
    await pop.getByRole('radio', { name: 'Math' }).check();

    // Math-only controls appear.
    await expect(pop.getByText(/Graded as a math expression/)).toBeVisible();
    await expect(pop.getByLabel('Math equivalence mode')).toBeVisible();
    await expect(pop.getByLabel('Comparison tolerance')).toBeVisible();

    // The node attr updated so the renderer emits data-answer-type="math".
    expect((await readBlankAttrs(page)).answerType).toBe('math');

    // Exact-form equivalence writes the attr; value-mode leaves it undefined.
    await pop.getByLabel('Math equivalence mode').selectOption('exact-form');
    expect((await readBlankAttrs(page)).equivalence).toBe('exact-form');

    // Switching back to Text clears the math-only attrs.
    await pop.getByRole('radio', { name: 'Text' }).check();
    const cleared = await readBlankAttrs(page);
    expect(cleared.answerType).toBe('text');
    expect(cleared.equivalence).toBeFalsy();
});
