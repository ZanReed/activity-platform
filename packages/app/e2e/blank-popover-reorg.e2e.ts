import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Blank popover reorg (editor-refinement-pass Group 2).
// ----------------------------------------------------------------------------
// Answer + Numeric + Acceptable answers are ALL always visible (acceptable
// answers no longer hides under "+ More options"); Hint + Mistake feedback
// collapse under one "+ Advanced options" disclosure.
// ============================================================================

async function openBlankPopover(page: Page) {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertFillInBlank().run();
        ed.chain().insertBlank({ answer: '42' }).run();
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'blank') pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
    return page.locator('.blank-edit-popover');
}

test('acceptable answers is always visible (no More options gate)', async ({
    page,
}) => {
    const pop = await openBlankPopover(page);
    await expect(pop).toBeVisible();
    await expect(pop.getByText('Acceptable answers')).toBeVisible();
    // The old "+ More options" button is gone.
    await expect(
        pop.getByRole('button', { name: /More options/ }),
    ).toHaveCount(0);
});

test('hint + mistake feedback hide under one Advanced options disclosure', async ({
    page,
}) => {
    const pop = await openBlankPopover(page);
    // Collapsed: neither shows; one disclosure button does.
    await expect(pop.getByText('Hint', { exact: true })).toHaveCount(0);
    await expect(pop.getByText('Mistake feedback', { exact: true })).toHaveCount(0);
    const disclosure = pop.getByRole('button', { name: /Advanced options/ });
    await expect(disclosure).toBeVisible();
    await disclosure.click();
    // Both reveal; the disclosure button is consumed.
    await expect(pop.getByText('Hint', { exact: true })).toBeVisible();
    await expect(pop.getByText('Mistake feedback', { exact: true })).toBeVisible();
    await expect(
        pop.getByRole('button', { name: /Advanced options/ }),
    ).toHaveCount(0);
});
