import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Graph-authoring redirection — the uniform expression list, authored drawable
// color, the preview-as-student eye toggle (now in the quick-bar), the
// side-by-side display layout, and the MC choice-figure Done + thumbnail.
// Real chromium is authoritative for the position-measured hosts (quick-bar).
// ============================================================================

const editor = (page: Page) =>
    page.evaluate(() => Boolean((window as never as { __tiptapEditor?: unknown }).__tiptapEditor));

async function insert(page: Page, command: string): Promise<void> {
    await page.evaluate((cmd) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.commands[cmd]();
    }, command);
}

test.beforeEach(async ({ page }) => {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as never as { __tiptapEditor?: unknown }).__tiptapEditor));
    expect(await editor(page)).toBe(true);
});

test('static graph: typing in the add box makes a uniform row + plots on the board', async ({
    page,
}) => {
    await insert(page, 'insertStaticGraph');
    await expect(page.locator('.drawable-list__empty')).toBeVisible();

    const addBox = page.locator('.drawable-list__add input[type="text"]');
    await addBox.fill('y = x^2');
    await addBox.press('Enter');

    // One uniform row: a swatch + the monospace expression.
    const row = page.locator('.drawable-row').first();
    await expect(row.locator('.drawable-row__swatch')).toBeVisible();
    await expect(row.locator('.drawable-row__text')).toHaveValue(/y = x\^2/);
    // The board (kit) plots something.
    await expect(page.locator('.graph-display-layout__board svg')).toBeVisible();
});

test('a row color picker stores the key and recolors the row swatch', async ({ page }) => {
    await insert(page, 'insertStaticGraph');
    const addBox = page.locator('.drawable-list__add input[type="text"]');
    await addBox.fill('y = x');
    await addBox.press('Enter');

    await page.locator('.drawable-row__kebab').first().click();
    await page.locator('.drawable-row__swatch-btn[aria-label="red"]').click();

    await expect(page.locator('.drawable-row__swatch-btn[aria-label="red"]')).toHaveAttribute(
        'aria-pressed',
        'true',
    );
    // red = #dc2626
    await expect(page.locator('.drawable-row__swatch').first()).toHaveCSS(
        'background-color',
        'rgb(220, 38, 38)',
    );
});

test('display graph lays board + list SIDE BY SIDE when the block is wide', async ({
    page,
}) => {
    await insert(page, 'insertStaticGraph');
    await expect(page.locator('.graph-display-layout__inner')).toBeVisible();
    await expect(page.locator('.graph-display-layout__inner')).toHaveCSS(
        'flex-direction',
        'row',
    );
    const board = await page.locator('.graph-display-layout__board').boundingBox();
    const list = await page.locator('.graph-display-layout__list').boundingBox();
    expect(board).not.toBeNull();
    expect(list).not.toBeNull();
    // The list sits to the RIGHT of the board.
    expect(list!.x).toBeGreaterThan(board!.x + board!.width - 1);
});

test('the preview-as-student eye lives in the quick-bar and hides the authoring chrome', async ({
    page,
}) => {
    await insert(page, 'insertStaticGraph');
    await page.locator('.interactive-graph-block').hover();

    const eye = page.getByRole('button', { name: 'Preview as student' });
    await expect(eye).toBeVisible();
    // It is a child of the quick-bar, not the block header.
    await expect(page.locator('.block-quickbar').getByRole('button', { name: 'Preview as student' })).toBeVisible();

    await eye.click();
    // Chrome hidden, board kept, button flips to the on-state.
    await expect(page.locator('.drawable-list')).toHaveCount(0);
    await expect(page.locator('.graph-display-layout__board svg')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to editing' })).toBeVisible();
});

test('MC choice figure: build a graph, Done collapses to a thumbnail, click reopens', async ({
    page,
}) => {
    await insert(page, 'insertMultipleChoice');

    // Open choice A's figure, add a graph.
    await page.getByRole('button', { name: 'Figure for choice A' }).click();
    await page.getByRole('button', { name: '+ Graph' }).click();
    const addBox = page.locator('.drawable-list__add input[type="text"]');
    await addBox.fill('(2, 3)');
    await addBox.press('Enter');
    await expect(page.locator('.drawable-row')).toHaveCount(1);

    // Done collapses the editor to a thumbnail showing the graph.
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.locator('.drawable-list')).toHaveCount(0);
    const thumb = page.locator('.mc-block__figure-thumb');
    await expect(thumb).toBeVisible();
    await expect(thumb.locator('svg')).toBeVisible();

    // Clicking the thumbnail reopens the editor with the row intact.
    await thumb.click();
    await expect(page.locator('.drawable-list')).toBeVisible();
    await expect(page.locator('.drawable-row__text').first()).toHaveValue(/\(2, 3\)/);
});
