import { test, expect } from '@playwright/test';

// ============================================================================
// Block-picker previews — slice-6 stage-5 interaction harness.
// ----------------------------------------------------------------------------
// The "Add a block" window renders each block as a CARD: a static SVG
// mini-preview (blockThumbnails) over the title, with the one-line
// description moved into a caption strip that narrates the hovered/focused
// card. These specs pin the card anatomy, the caption behavior, and the
// search path over cards.
// ============================================================================

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
    // Open the picker via the end square.
    await page.getByRole('button', { name: 'Add a block' }).click();
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
});

test('every card in every category renders an SVG thumbnail', async ({
    page,
}) => {
    const rail = page.locator('.block-insert-rail__item');
    const count = await rail.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
        await rail.nth(i).click();
        const tiles = page.locator('.block-insert-tile');
        const tileCount = await tiles.count();
        expect(tileCount).toBeGreaterThan(0);
        // Each card contains exactly one preview SVG.
        await expect(
            page.locator('.block-insert-tile__thumb svg.block-thumb'),
        ).toHaveCount(tileCount);
    }
});

test('hovering a card shows its description in the caption strip', async ({
    page,
}) => {
    const caption = page.locator('.block-insert-pane__caption');
    await expect(caption).toHaveText('');
    await page
        .locator('.block-insert-tile', { hasText: '2 columns' })
        .hover();
    await expect(caption).toHaveText('Two side-by-side columns of blocks');
    // Leaving the card clears the strip (its height is reserved in CSS).
    await page.locator('.block-insert-window__title').hover();
    await expect(caption).toHaveText('');
});

test('cards carry their description for screen readers', async ({ page }) => {
    const tile = page.locator('.block-insert-tile', {
        hasText: '2 columns',
    });
    await expect(tile.locator('.sr-only')).toHaveText(
        'Two side-by-side columns of blocks',
    );
});

test('search shows matching cards with thumbnails', async ({ page }) => {
    await page
        .getByRole('textbox', { name: 'Search all blocks' })
        .fill('essay');
    const tiles = page.locator('.block-insert-tile');
    await expect(tiles).toHaveCount(1);
    await expect(tiles.first()).toContainText('Essay');
    await expect(
        tiles.first().locator('svg.block-thumb'),
    ).toHaveCount(1);
});

test('a disabled card still captions why it is unavailable', async ({
    page,
}) => {
    // "Answer blank" needs the cursor inside a fill-in-blank problem; opened
    // from the end square it is disabled (aria-disabled keeps hover events).
    await page
        .getByRole('textbox', { name: 'Search all blocks' })
        .fill('answer blank');
    const tile = page.locator('.block-insert-tile--disabled', {
        hasText: 'Answer blank',
    });
    await expect(tile).toHaveAttribute('aria-disabled', 'true');
    await tile.hover();
    await expect(page.locator('.block-insert-pane__caption')).toContainText(
        'Position the cursor inside a problem',
    );
    // Clicking it inserts nothing and keeps the window open. force: Playwright
    // itself refuses to click aria-disabled elements (actionability), which is
    // the point — this exercises the pick() guard behind that.
    await tile.click({ force: true });
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
});
