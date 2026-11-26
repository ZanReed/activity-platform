import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Block command bar — slice-6 interaction harness.
// ----------------------------------------------------------------------------
// When a block is NodeSelected, the docked command bar appears with the
// universal actions (Duplicate/Delete) + a ⚙ gear for blocks that have
// settings. Almost no block has a block-specific "primary" — you edit a block
// by clicking into it, so an "enter edit" button would just duplicate a click.
// The exceptions are the atoms with no inline editor — `image`, and the chart,
// video and figure cards: clicking selects them, so their buttons live on the
// bar ("bar only", author ruling 2026-11-27).
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

// ---------------------------------------------------------------------------
// Lists, callout, chart and video (author ruling 2026-11-27). These five had no
// bar at all. Lists and the callout get the universal actions; a chart and a
// video also get buttons that open the panels their cards own.
// ---------------------------------------------------------------------------

/** Run an editor command chain on the empty playground. */
async function bootEmpty(page: Page): Promise<void> {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
}

for (const [command, typeName] of [
    ['toggleBulletList', 'bulletList'],
    ['toggleOrderedList', 'orderedList'],
] as const) {
    test(`Esc inside a ${typeName} selects the whole list and shows its bar`, async ({ page }) => {
        await bootEmpty(page);
        await page.evaluate((cmd) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            ed.chain().focus('end').insertContent('one')[cmd]().run();
        }, command);
        await page.keyboard.type('\ntwo');
        await page.keyboard.press('Escape');
        const bar = page.locator(BAR);
        await expect(bar).toBeVisible();
        // The LIST, not one item: Delete here must remove both items.
        await expect(bar).toHaveAttribute('data-block-type', typeName);
        await expect(bar.getByRole('button', { name: 'Duplicate' })).toBeVisible();
        await bar.getByRole('button', { name: 'Delete' }).click();
        await expect(page.locator('.ProseMirror li')).toHaveCount(0);
    });
}

test('a callout shows the bar with the universal actions', async ({ page }) => {
    await bootEmpty(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertCallout().run();
    });
    await selectFirstNode(page, 'callout');
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'callout');
    await expect(bar.getByRole('button', { name: 'Delete' })).toBeVisible();
});

test("a chart's bar opens the card's form and its source", async ({ page }) => {
    await bootEmpty(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertChart().run();
    });
    await expect(page.locator('.chart-view__preview')).toBeVisible();
    await selectFirstNode(page, 'chart');
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'chart');

    await bar.getByRole('button', { name: 'Edit chart' }).click();
    await expect(page.locator('.chart-view .chart-form')).toBeVisible();

    // An open panel wins, as on the card: the bar cannot swap it away.
    await selectFirstNode(page, 'chart');
    await page.locator(BAR).getByRole('button', { name: 'Chart source' }).click();
    await expect(page.locator('.chart-view .chart-form')).toBeVisible();
    await expect(page.locator('.graph-figure-source')).toHaveCount(0);

    await page.locator('.chart-view .chart-form').getByRole('button', { name: 'Done' }).click();
    await selectFirstNode(page, 'chart');
    await page.locator(BAR).getByRole('button', { name: 'Chart source' }).click();
    await expect(page.locator('.graph-figure-source__text')).toHaveValue(/type: bar/);
});

test('a duplicated chart opens only its own form from the bar', async ({ page }) => {
    await bootEmpty(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertChart().run();
    });
    await expect(page.locator('.chart-view__preview')).toBeVisible();
    await selectFirstNode(page, 'chart');
    await page.locator(BAR).getByRole('button', { name: 'Duplicate' }).click();
    await expect(page.locator('.chart-view')).toHaveCount(2);

    await selectFirstNode(page, 'chart');
    await page.locator(BAR).getByRole('button', { name: 'Edit chart' }).click();
    await expect(page.locator('.chart-form')).toHaveCount(1);
});

test("a video's bar reopens the card's form", async ({ page }) => {
    await bootEmpty(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertVideo().run();
    });
    // A new card opens straight into its form; close it first. "Done" is
    // refused on an empty video, so leave by discarding.
    const form = page.locator('[data-video-form="true"]');
    await expect(form).toBeVisible();
    await form.getByRole('button', { name: 'Discard unsaved changes' }).click();
    await expect(form).toHaveCount(0);

    await selectFirstNode(page, 'video');
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'video');
    await bar.getByRole('button', { name: 'Edit video' }).click();
    await expect(form).toBeVisible();
});

// ---------------------------------------------------------------------------
// Bar only for chart, video and figure (author ruling 2026-11-27), as for the
// image: in the main editor these cards show no buttons of their own. (Editors
// with no bar — the reference panel, the definition dialog — keep the card's
// buttons; that half is a unit test, cardButtons.test.tsx.)
// ---------------------------------------------------------------------------

test("a figure's bar opens the card's form and its source", async ({ page }) => {
    await bootEmpty(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertGraphFigure().run();
    });
    await expect(page.locator('.graph-figure-view__preview')).toBeVisible();
    await selectFirstNode(page, 'graphFigure');
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute('data-block-type', 'graphFigure');
    await bar.getByRole('button', { name: 'Edit figure' }).click();
    await expect(page.locator('.graph-figure-view__editor')).toBeVisible();

    // An open panel wins: the bar cannot swap the form for the source.
    await selectFirstNode(page, 'graphFigure');
    await page.locator(BAR).getByRole('button', { name: 'Figure source' }).click();
    await expect(page.locator('.graph-figure-view__editor')).toBeVisible();
    await expect(page.locator('.graph-figure-source')).toHaveCount(0);
});

for (const [command, typeName, card, labels] of [
    ['insertChart', 'chart', '.chart-view', ['Edit chart', 'Chart source']],
    ['insertGraphFigure', 'graphFigure', '.graph-figure-view', ['Edit figure', 'Figure source']],
] as const) {
    test(`a fresh ${typeName} is selected with its bar showing, and its card has no buttons`, async ({ page }) => {
        await bootEmpty(page);
        await page.evaluate((cmd) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__tiptapEditor.chain().focus('end')[cmd]().run();
        }, command);
        await expect(page.locator(card)).toHaveCount(1);
        // One obvious step to edit it: the bar is already there.
        const bar = page.locator(BAR);
        await expect(bar).toHaveAttribute('data-block-type', typeName);
        for (const label of labels) {
            await expect(bar.getByRole('button', { name: label })).toBeVisible();
            await expect(page.locator(card).getByRole('button', { name: label })).toHaveCount(0);
        }
        // Still none once the bar has gone.
        await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__tiptapEditor.commands.setTextSelection(1);
        });
        await expect(bar).toHaveCount(0);
        await expect(page.locator(card).getByRole('button')).toHaveCount(0);
    });
}

test("a video card has no Edit button of its own", async ({ page }) => {
    await bootEmpty(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertVideo().run();
    });
    const form = page.locator('[data-video-form="true"]');
    await expect(form).toBeVisible();
    await form.getByRole('button', { name: 'Discard unsaved changes' }).click();
    await expect(form).toHaveCount(0);
    await expect(page.locator('.video-view')).toBeVisible();
    await expect(page.locator('.video-view').getByRole('button', { name: 'Edit video' })).toHaveCount(0);
});
