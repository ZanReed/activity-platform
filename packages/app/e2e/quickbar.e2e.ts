import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Block quick-bar — slice-6 discoverability affordance.
// ----------------------------------------------------------------------------
// The always-visible [Delete][Duplicate][Settings] icon control top-right of a
// block on hover or while the caret is in it. Settings (gear) selects the
// block → the full command bar. Fixes the dogfooding gap where block actions
// were only reachable via the undiscoverable grip-click / Esc.
// ============================================================================

const QUICKBAR = '.block-quickbar';
const BAR = '.block-command-bar';

// A plain-text paragraph (the first paragraph holds an inline-math atom).
function plainBlock(page: Page) {
    return page.locator('.ProseMirror').getByText('Block math example below:');
}

function selectionType(page: Page): Promise<string> {
    return page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.state.selection.constructor.name.replace(
            /^_+/,
            '',
        ),
    );
}

function blockCount(page: Page): Promise<number> {
    return page.evaluate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => (window as any).__tiptapEditor.state.doc.childCount,
    );
}

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('a caret in a block shows the mini quick-bar (Delete/Duplicate/Settings)', async ({
    page,
}) => {
    await plainBlock(page).click();
    await expect(page.locator(QUICKBAR)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete block' })).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Duplicate block' }),
    ).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Block settings' }),
    ).toBeVisible();
});

test('hovering a block shows the mini quick-bar', async ({ page }) => {
    await plainBlock(page).hover();
    await expect(page.locator(QUICKBAR)).toBeVisible();
});

test('Delete is clickable on PURE hover — no click-into-editor first', async ({
    page,
}) => {
    // The reported bug: the bar vanished as the pointer travelled to it. The
    // stay-alive grace + on-bar freeze must keep it clickable from hover alone.
    const before = await blockCount(page);
    await plainBlock(page).hover();
    await page.getByRole('button', { name: 'Delete block' }).click();
    expect(await blockCount(page)).toBe(before - 1);
    await expect(plainBlock(page)).toHaveCount(0);
});

test('Duplicate clones the block below', async ({ page }) => {
    await plainBlock(page).click();
    const before = await blockCount(page);
    await page.getByRole('button', { name: 'Duplicate block' }).click();
    expect(await blockCount(page)).toBe(before + 1);
    await expect(plainBlock(page)).toHaveCount(2);
});

test('Settings (gear) selects the block → full command bar; quick-bar hides', async ({
    page,
}) => {
    await plainBlock(page).click();
    await page.getByRole('button', { name: 'Block settings' }).click();
    expect(await selectionType(page)).toBe('NodeSelection');
    await expect(page.locator(BAR)).toBeVisible();
    await expect(page.locator(QUICKBAR)).toHaveCount(0);
});

test('a node-selected block shows the full bar, NOT the quick-bar', async ({
    page,
}) => {
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'mathBlock') pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
    await expect(page.locator(BAR)).toBeVisible();
    await expect(page.locator(QUICKBAR)).toHaveCount(0);
});
