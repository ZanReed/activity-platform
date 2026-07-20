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

// Strict grid: blocks live inside row > column, so count the leaf blocks across
// all columns (the top-level count is rows, not blocks).
function blockCount(page: Page): Promise<number> {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let n = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.forEach((row: any) => {
            if (row.type.name === 'row') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                row.forEach((col: any) => (n += col.childCount));
            }
        });
        return n;
    });
}

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('a caret in a block shows the mini quick-bar (Delete/Duplicate)', async ({
    page,
}) => {
    await plainBlock(page).click();
    await expect(page.locator(QUICKBAR)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete block' })).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Duplicate block' }),
    ).toBeVisible();
    // A plain paragraph has no settings → the gear is gated out (it would open
    // an empty settings mode). Blocks WITH settings show it (see group1-fixes).
    await expect(
        page.getByRole('button', { name: 'Block settings' }),
    ).toHaveCount(0);
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
    // A block WITH settings (essay) — the gear only shows on those now.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.insertEssay();
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'essay') pos = p;
            return pos === null;
        });
        ed.commands.setTextSelection((pos ?? 0) + 1);
    });
    await page.getByRole('button', { name: 'Block settings' }).click();
    expect(await selectionType(page)).toBe('NodeSelection');
    await expect(page.locator(BAR)).toBeVisible();
    // The quick-bar holds steady WHILE the pointer rests on it (the onBar
    // grace, so it can't vanish under your cursor). Move the pointer off it,
    // and its mouseleave clears it — the command bar owns the selected state.
    await page.mouse.move(0, 0);
    await expect(page.locator(QUICKBAR)).toHaveCount(0);
});

test('the quick-bar gear opens the command bar straight into settings mode', async ({
    page,
}) => {
    // A block WITH settings (essay). Caret inside it → quick-bar shows.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.insertEssay();
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'essay') pos = p;
            return pos === null;
        });
        ed.commands.setTextSelection((pos ?? 0) + 1);
    });
    await page.getByRole('button', { name: 'Block settings' }).click();
    // Command bar opened directly in settings mode (simple + Advanced visible).
    const bar = page.locator(BAR);
    await expect(bar.getByRole('button', { name: 'Placeholder' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Advanced' })).toBeVisible();
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
