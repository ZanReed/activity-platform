import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Block command bar — slice-6 stage-0 interaction harness.
// ----------------------------------------------------------------------------
// Proves the descriptor -> single-host pipeline end to end in a real browser:
// when a block whose type has a control descriptor is NodeSelected, the docked
// command bar appears with THAT type's controls; a caret (TextSelection) shows
// no bar; and switching selection swaps the bar's contents.
//
// Stage 0 drives selection programmatically via the DEV-exposed editor
// (window.__tiptapEditor). The click=edit / grip=select GESTURE semantics land
// in stage 2 and get their own real-pointer specs then — here we prove the host
// reacts correctly to the selection PRIMITIVE (NodeSelection vs TextSelection).
// ============================================================================

const BAR = '.block-command-bar';

/** Select the first node of `typeName` as a NodeSelection. Returns its pos. */
async function selectFirstNode(page: Page, typeName: string): Promise<void> {
    await page.evaluate((name) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === name) pos = p;
            return pos === null;
        });
        if (pos === null) throw new Error(`no ${name} node in the doc`);
        ed.commands.setNodeSelection(pos);
    }, typeName);
}

/** Place a caret (TextSelection) inside the first node of `typeName`. */
async function caretInFirstNode(page: Page, typeName: string): Promise<void> {
    await page.evaluate((name) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === name) pos = p;
            return pos === null;
        });
        if (pos === null) throw new Error(`no ${name} node in the doc`);
        ed.commands.focus();
        ed.commands.setTextSelection(pos + 1);
    }, typeName);
}

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    // The DEV escape hatch is set in an effect after the editor mounts.
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('math_block selection shows a bar with a real "Edit" primary', async ({
    page,
}) => {
    await selectFirstNode(page, 'mathBlock');
    const bar = page.locator(BAR);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('data-block-type', 'mathBlock');
    await expect(bar.getByRole('button', { name: 'Edit' })).toBeVisible();
    // Edit is math_block's block-specific primary; Duplicate/Delete are the
    // universal actions every block's bar carries.
    await expect(bar.getByRole('button', { name: 'Duplicate' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
});

test('the bar is anchored on-screen at the block top-right', async ({
    page,
}) => {
    await selectFirstNode(page, 'mathBlock');
    const bar = page.locator(BAR);
    await expect(bar).toBeVisible();
    const barBox = (await bar.boundingBox())!;
    const blockBox = (await page
        .locator('.ProseMirror .node-mathBlock')
        .first()
        .boundingBox())!;
    const viewport = page.viewportSize()!;

    // Fully within the viewport (the regression: it once anchored at y=3481,
    // x=-12 because it measured pre-layout geometry).
    expect(barBox.x).toBeGreaterThanOrEqual(0);
    expect(barBox.y).toBeGreaterThanOrEqual(0);
    expect(barBox.x + barBox.width).toBeLessThanOrEqual(viewport.width);
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(viewport.height);

    // Anchored to the block's top-right corner (within a small tolerance).
    expect(Math.abs(barBox.y - blockBox.y)).toBeLessThan(48);
    expect(
        Math.abs(
            barBox.x + barBox.width - (blockBox.x + blockBox.width),
        ),
    ).toBeLessThan(48);
});

test('a content block shows its block-specific primary + universal actions, and the primary enters edit', async ({
    page,
}) => {
    // Insert a self_explanation, node-select it, and read its bar.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.commands.insertSelfExplanation();
    });
    await selectFirstNode(page, 'selfExplanation');
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'selfExplanation');
    // Block-specific primary + the universal actions.
    await expect(bar.getByRole('button', { name: 'Prompt' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Duplicate' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();

    // The primary performs Select -> Edit: a caret lands inside the block.
    await bar.getByRole('button', { name: 'Prompt' }).click();
    const selType = await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.state.selection.constructor.name.replace(
            /^_+/,
            '',
        ),
    );
    expect(selType).toBe('TextSelection');
});

test('a caret (TextSelection) shows no bar', async ({ page }) => {
    await caretInFirstNode(page, 'paragraph');
    await expect(page.locator(BAR)).toHaveCount(0);
});

test('a generic text block shows the duplicate/delete bar', async ({
    page,
}) => {
    await selectFirstNode(page, 'heading');
    const bar = page.locator(BAR);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('data-block-type', 'heading');
    await expect(bar.getByRole('button', { name: 'Duplicate' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
    // Generic blocks have no block-specific primary.
    await expect(bar.getByRole('button', { name: 'Edit' })).toHaveCount(0);
});

test('the bar swaps contents when selection moves between block types', async ({
    page,
}) => {
    await selectFirstNode(page, 'mathBlock');
    await expect(
        page.locator(BAR).getByRole('button', { name: 'Edit' }),
    ).toBeVisible();

    await selectFirstNode(page, 'heading');
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'heading');
    await expect(bar.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
});

test('the "Edit" primary opens the math field (enters edit mode)', async ({
    page,
}) => {
    await selectFirstNode(page, 'mathBlock');
    await page.locator(BAR).getByRole('button', { name: 'Edit' }).click();
    // Entering edit mode focuses the MathLive <math-field> inside the block.
    await expect(page.locator('.ProseMirror math-field')).toBeFocused();
});

// Batch 2 — the question family: each carries its block-specific primary
// (labelled per the block's nature) plus the universal actions.
const questionBlocks = [
    { insert: 'insertMultipleChoice', type: 'multipleChoice', primary: 'Choices' },
    { insert: 'insertMatching', type: 'matching', primary: 'Pairs' },
    { insert: 'insertOrdering', type: 'ordering', primary: 'Items' },
    { insert: 'insertInteractiveGraph', type: 'interactiveGraph', primary: 'Edit' },
    { insert: 'insertNumberLine', type: 'numberLine', primary: 'Edit' },
    { insert: 'insertDataPlot', type: 'dataPlot', primary: 'Edit' },
    // Batch 3: fill_in_blank has no popover conflict (its BlankPopoverHost is
    // chip-level), so it just enters edit like the others.
    { insert: 'insertFillInBlank', type: 'fillInBlank', primary: 'Edit' },
] as const;

for (const block of questionBlocks) {
    test(`${block.type} shows its "${block.primary}" primary + universal actions`, async ({
        page,
    }) => {
        await page.evaluate((cmd) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__tiptapEditor.commands[cmd]();
        }, block.insert);
        await selectFirstNode(page, block.type);
        const bar = page.locator(BAR);
        await expect(bar).toHaveAttribute('data-block-type', block.type);
        await expect(
            bar.getByRole('button', { name: block.primary, exact: true }),
        ).toBeVisible();
        await expect(
            bar.getByRole('button', { name: 'Duplicate' }),
        ).toBeVisible();
        await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
    });
}

// Batch 3 — the image coexistence: selecting an image shows the bar, NOT the
// auto-popover (which used to double up). The bar's Replace primary opens it.
const IMG_POPOVER = '.image-edit-popover';

test('image: selection shows the bar (Replace/Caption); the popover opens only on demand', async ({
    page,
}) => {
    // Insert opens the popover onto the URL field by design (empty source).
    // Focus first — insert only node-selects the image when there's a caret
    // (the real path: a teacher inserts at the cursor).
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.focus('end');
        ed.commands.insertImage();
    });
    await expect(page.locator(IMG_POPOVER)).toBeVisible();

    // Deselect → popover closes; re-select the image with NO open request.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.commands.focus('end');
    });
    await expect(page.locator(IMG_POPOVER)).toHaveCount(0);
    await selectFirstNode(page, 'image');

    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'image');
    await expect(bar.getByRole('button', { name: 'Replace' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Caption' })).toBeVisible();
    // Plain selection must NOT auto-open the popover (the old double-UI).
    await expect(page.locator(IMG_POPOVER)).toHaveCount(0);

    // Replace opens it on demand.
    await bar.getByRole('button', { name: 'Replace' }).click();
    await expect(page.locator(IMG_POPOVER)).toBeVisible();
});
