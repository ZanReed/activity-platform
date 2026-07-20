import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Hover gutter cluster — slice-6 stage-1 interaction harness.
// ----------------------------------------------------------------------------
// Verifies the reconciled gutter: a persistent quiet rest dot on every
// top-level block that expands on hover into the top-left drag grip (the
// .block-gutter-cluster) plus a separate bottom-left "+" (BlockAddButtonHost)
// that opens the "Add a block" window inserting BELOW the hovered block
// (the split landed in e5862ee — grip drags, "+" inserts below).
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
        // Strict grid: blocks live in .editor-column (a 1-col stack renders
        // flat), so the per-block rest dot is on the column's child, not a
        // direct .ProseMirror child (which is now the row).
        const p = document.querySelector('.editor-column > p');
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

test('hovering a block reveals the grip + insert "+"', async ({ page }) => {
    const para = await firstParagraph(page);
    await para.hover();
    const cluster = page.locator('.block-gutter-cluster');
    await expect(cluster).toBeVisible();
    await expect(page.locator('.drag-handle-button')).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Insert a block below' }),
    ).toBeVisible();
});

test('the rest dot fades while the block is hovered', async ({ page }) => {
    const para = await firstParagraph(page);
    await para.hover();
    // The hovered block's own dot goes transparent (the cluster takes over).
    await expect
        .poll(() =>
            page.evaluate(() => {
                const p = document.querySelector('.editor-column > p:hover');
                if (!p) return 1;
                return parseFloat(getComputedStyle(p, '::before').opacity);
            }),
        )
        .toBe(0);
});

test('the gutter "+" opens the Add-a-block window', async ({ page }) => {
    const para = await firstParagraph(page);
    await para.hover();
    await page.getByRole('button', { name: 'Insert a block below' }).click();
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
});

test('inserting from the gutter "+" lands the block BELOW the hovered one', async ({
    page,
}) => {
    // The target block's index WITHIN its stack column + the type of the block
    // right after it, BEFORE inserting (strict grid: blocks live in row >
    // column, not at the doc top level).
    const snapshot = () =>
        page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            const column = ed.state.doc.firstChild.firstChild; // row > column
            let idx = -1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            column.forEach((node: any, _pos: number, i: number) => {
                if (node.textContent.includes('Block math example')) idx = i;
            });
            const after =
                idx >= 0 && idx + 1 < column.childCount
                    ? column.child(idx + 1)
                    : null;
            return { idx, nextType: after?.type.name ?? null };
        });

    const before = await snapshot();

    // Scope to the editor — the JSON inspector panel echoes the same text.
    const target = page
        .locator('.ProseMirror')
        .getByText('Block math example below:');
    await target.hover();
    await page.getByRole('button', { name: 'Insert a block below' }).click();
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
    // A real insertion item (not a Text transform, which the picker excludes).
    await page
        .getByRole('textbox', { name: 'Search all blocks' })
        .fill('fill in the blank');
    await page.locator('.block-insert-tile').first().click();

    // The block landed directly BELOW the target: the target keeps its index,
    // and the block right after it is now the new fill_in_blank.
    const after = await snapshot();
    expect(after.idx).toBe(before.idx);
    expect(after.nextType).toBe('fillInBlank');
});
