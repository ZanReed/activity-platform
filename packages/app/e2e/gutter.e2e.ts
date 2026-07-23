import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Hover gutter — slice-6 stage-1 interaction harness (grip + rest dot only).
// ----------------------------------------------------------------------------
// Verifies the reconciled gutter: a persistent quiet rest dot on every
// top-level block that expands on hover into the top-left drag grip (the
// .block-gutter-cluster). The INSERT affordance is no longer a gutter "+" — it
// is the persistent InsertZones strips (covered by insert-zones.e2e.ts). Uses
// REAL pointer hover (Playwright), which drives Tiptap's drag-handle mousemove
// logic — the synthetic-event path does not.
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

test('hovering a block reveals the drag grip', async ({ page }) => {
    const para = await firstParagraph(page);
    await para.hover();
    const cluster = page.locator('.block-gutter-cluster');
    await expect(cluster).toBeVisible();
    await expect(page.locator('.drag-handle-button')).toBeVisible();
    // The old gutter "+" is gone — inserting is the InsertZones strips now.
    await expect(page.locator('.block-gutter-add')).toHaveCount(0);
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

// Insert-affordance behaviour (open the picker, place at a seam) moved to
// insert-zones.e2e.ts when the gutter "+" was superseded by InsertZones.
