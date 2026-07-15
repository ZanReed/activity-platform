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
    // math_block's descriptor is Edit-only — not the generic duplicate/delete.
    await expect(
        bar.getByRole('button', { name: 'Duplicate' }),
    ).toHaveCount(0);
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
