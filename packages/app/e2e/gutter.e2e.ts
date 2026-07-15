import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Hover gutter cluster — slice-6 stage-1 interaction harness.
// ----------------------------------------------------------------------------
// Verifies the reconciled gutter: a persistent quiet rest dot on every
// top-level block that expands into the [grip][+] cluster on hover, and a "+"
// that opens the "Add a block" window inserting above the hovered block.
// Uses REAL pointer hover (Playwright), which drives Tiptap's drag-handle
// mousemove logic — the synthetic-event path does not.
// ============================================================================

async function firstParagraph(page: Page) {
    return page.locator('.ProseMirror p').first();
}

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('every top-level block shows a persistent rest dot', async ({ page }) => {
    const dot = await page.evaluate(() => {
        const p = document.querySelector('.ProseMirror > p');
        if (!p) return null;
        const cs = getComputedStyle(p, '::before');
        return { content: cs.content, opacity: cs.opacity, w: cs.width };
    });
    expect(dot).not.toBeNull();
    // A rendered ::before with a non-zero size and visible-at-rest opacity.
    expect(dot!.content).toBe('""');
    expect(parseFloat(dot!.opacity)).toBeGreaterThan(0);
    expect(dot!.w).not.toBe('0px');
});

test('the empty-line "/" placeholder renders horizontally (not squeezed by the dot)', async ({
    page,
}) => {
    // Regression: the rest-dot ::before and the placeholder-hint ::before share
    // the same pseudo-element on an empty line; the dot's width:5px once leaked
    // in and squeezed the hint text into a vertical 5px column.
    const hint = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.insertContentAt(ed.state.doc.content.size, {
            type: 'paragraph',
        });
        ed.commands.focus('end');
        const el = document.querySelector('.ProseMirror .is-empty-hint');
        if (!el) return null;
        const cs = getComputedStyle(el, '::before');
        return { width: parseFloat(cs.width), left: cs.left, content: cs.content };
    });
    expect(hint).not.toBeNull();
    // Wide enough for the sentence to flow left-to-right, anchored at the text.
    expect(hint!.width).toBeGreaterThan(40);
    expect(hint!.left).toBe('0px');
    expect(hint!.content).toContain('Type /');
});

test('hovering a block reveals the grip + insert cluster', async ({ page }) => {
    const para = await firstParagraph(page);
    await para.hover();
    const cluster = page.locator('.block-gutter-cluster');
    await expect(cluster).toBeVisible();
    await expect(page.locator('.drag-handle-button')).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Insert a block above' }),
    ).toBeVisible();
});

test('the rest dot fades while the block is hovered', async ({ page }) => {
    const para = await firstParagraph(page);
    await para.hover();
    // The hovered block's own dot goes transparent (the cluster takes over).
    await expect
        .poll(() =>
            page.evaluate(() => {
                const p = document.querySelector('.ProseMirror > p:hover');
                if (!p) return 1;
                return parseFloat(getComputedStyle(p, '::before').opacity);
            }),
        )
        .toBe(0);
});

test('the gutter "+" opens the Add-a-block window', async ({ page }) => {
    const para = await firstParagraph(page);
    await para.hover();
    await page.getByRole('button', { name: 'Insert a block above' }).click();
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
});

test('inserting from the gutter "+" lands the block ABOVE the hovered one', async ({
    page,
}) => {
    // The target block's top-level index BEFORE inserting.
    const targetIndexOf = () =>
        page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            let idx = -1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ed.state.doc.forEach((node: any, _pos: number, i: number) => {
                if (node.textContent.includes('Block math example')) idx = i;
            });
            return idx;
        });

    const before = await targetIndexOf();

    // Scope to the editor — the JSON inspector panel echoes the same text.
    const target = page
        .locator('.ProseMirror')
        .getByText('Block math example below:');
    await target.hover();
    await page.getByRole('button', { name: 'Insert a block above' }).click();
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
    // A real insertion item (not a Text transform, which the picker excludes).
    await page
        .getByRole('textbox', { name: 'Search all blocks' })
        .fill('fill in the blank');
    await page.locator('.block-insert-tile').first().click();

    // A block landed directly above the target, pushing its index up by one.
    const after = await targetIndexOf();
    expect(after).toBe(before + 1);
});
