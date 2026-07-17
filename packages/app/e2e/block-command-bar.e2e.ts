import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Block command bar — slice-6 interaction harness.
// ----------------------------------------------------------------------------
// When a block is NodeSelected, the docked command bar appears with the
// universal actions (Duplicate/Delete) + a ⚙ gear for blocks that have
// settings. Almost no block has a block-specific "primary" — you edit a block
// by clicking into it, so an "enter edit" button would just duplicate a click.
// The one exception is `image`: clicking selects the atom (no inline editor),
// so Replace/Caption are the only way to open its edit popover.
// ============================================================================

const BAR = '.block-command-bar';

/** Select the first node of `typeName` as a NodeSelection. */
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
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('selecting a block shows the bar with the universal actions', async ({
    page,
}) => {
    await selectFirstNode(page, 'mathBlock');
    const bar = page.locator(BAR);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('data-block-type', 'mathBlock');
    await expect(bar.getByRole('button', { name: 'Duplicate' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
    // No "enter edit" primary — you edit math by clicking its field.
    await expect(bar.getByRole('button', { name: 'Edit' })).toHaveCount(0);
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

    // Fully within the viewport (regression: it once anchored at y=3481, x=-12).
    expect(barBox.x).toBeGreaterThanOrEqual(0);
    expect(barBox.y).toBeGreaterThanOrEqual(0);
    expect(barBox.x + barBox.width).toBeLessThanOrEqual(viewport.width);
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(viewport.height);

    // Anchored to the block's top-right corner (within a small tolerance).
    expect(Math.abs(barBox.y - blockBox.y)).toBeLessThan(48);
    expect(
        Math.abs(barBox.x + barBox.width - (blockBox.x + blockBox.width)),
    ).toBeLessThan(48);
});

test('a caret (TextSelection) shows no bar', async ({ page }) => {
    await caretInFirstNode(page, 'paragraph');
    await expect(page.locator(BAR)).toHaveCount(0);
});

// Content + question blocks: the bar is Duplicate/Delete (+ a gear when the
// block has settings), never an "enter edit" primary.
const noPrimaryBlocks = [
    { insert: null, type: 'heading' },
    { insert: 'insertSelfExplanation', type: 'selfExplanation' },
    { insert: 'insertMultipleChoice', type: 'multipleChoice' },
    { insert: 'insertFillInBlank', type: 'fillInBlank' },
] as const;

for (const block of noPrimaryBlocks) {
    test(`${block.type} shows Duplicate/Delete and no block-specific primary`, async ({
        page,
    }) => {
        if (block.insert) {
            await page.evaluate((cmd) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).__tiptapEditor.commands[cmd]();
            }, block.insert);
        }
        await selectFirstNode(page, block.type);
        const bar = page.locator(BAR);
        await expect(bar).toHaveAttribute('data-block-type', block.type);
        await expect(bar.getByRole('button', { name: 'Duplicate' })).toBeVisible();
        await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
        // None of the old "enter edit" primaries survive.
        for (const label of ['Edit', 'Prompt', 'Choices', 'Pairs', 'Items']) {
            await expect(bar.getByRole('button', { name: label })).toHaveCount(0);
        }
    });
}

// ---- image: the one block that DOES have a primary --------------------------
const IMG_POPOVER = '.image-edit-popover';

test('image shows Replace/Caption; the popover opens only on demand', async ({
    page,
}) => {
    // Insert opens the popover onto the URL field by design (empty source).
    // Focus first — insert only node-selects the image when there's a caret.
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
    // image-crop.md: the image primaries are Crop + Replace (Caption moved to
    // the Advanced drawer).
    await expect(bar.getByRole('button', { name: 'Crop' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Replace' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Caption' })).toHaveCount(0);
    // Plain selection must NOT auto-open the popover (the old double-UI).
    await expect(page.locator(IMG_POPOVER)).toHaveCount(0);

    // Replace opens it on demand.
    await bar.getByRole('button', { name: 'Replace' }).click();
    await expect(page.locator(IMG_POPOVER)).toBeVisible();
});

test('the bar swaps contents when selection moves between block types', async ({
    page,
}) => {
    // image has a Replace primary; heading does not.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.focus('end');
        ed.commands.insertImage();
        ed.commands.focus('end'); // deselect (closes the insert popover)
    });
    await selectFirstNode(page, 'image');
    await expect(
        page.locator(BAR).getByRole('button', { name: 'Replace' }),
    ).toBeVisible();

    await selectFirstNode(page, 'heading');
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'heading');
    await expect(bar.getByRole('button', { name: 'Replace' })).toHaveCount(0);
    await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
});
