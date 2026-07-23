import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// InsertZones — persistent inter-block "add a block here" strips.
// ----------------------------------------------------------------------------
// The affordance that superseded the hover gutter "+": a faint always-visible
// strip in the gap above every block in a column (+ at each column's end).
// Clicking one opens the block picker AT that seam. These drive the real DOM /
// click path (the in-app browser pane can't; Playwright's real chromium is
// authoritative). Zero-height + widget-decoration internals are unit-tested
// (src/__tests__/insertZones.test.ts); this file covers the interaction.
// ============================================================================

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

// The column children's node types, in order, skipping the zone widgets — the
// serialized shape the seam inserts act on.
function columnTypes(page: Page): Promise<string[]> {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const column = ed.state.doc.firstChild.firstChild; // row > column
        const types: string[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        column.forEach((n: any) => types.push(n.type.name));
        return types;
    });
}

// Click a zone via its real hit band: the box is zero-height, so its top edge
// IS the seam line, and the ::before hit band straddles it. mouse.click at that
// point exercises the actual clickable geometry (not a synthetic dispatch).
async function clickZone(page: Page, index: number): Promise<void> {
    const pt = await page
        .locator('.editor-insert-zone')
        .nth(index)
        .evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y };
        });
    await page.mouse.click(pt.x, pt.y);
}

test('a zone sits above every block, aria-hidden and out of the tab order', async ({
    page,
}) => {
    const info = await page.evaluate(() => {
        const zones = [...document.querySelectorAll('.editor-insert-zone')];
        const blocks = [
            ...document.querySelectorAll(
                '.ProseMirror .editor-column > *:not(.editor-insert-zone)',
            ),
        ];
        return {
            zoneCount: zones.length,
            blockCount: blocks.length,
            allZeroHeight: zones.every(
                (z) => z.getBoundingClientRect().height === 0,
            ),
            allAriaHidden: zones.every(
                (z) => z.getAttribute('aria-hidden') === 'true',
            ),
            anyFocusable: zones.some((z) => (z as HTMLElement).tabIndex >= 0),
        };
    });
    // The playground seed is a single 1-col stack: a before-zone per block, and
    // the trailing stack column's append zone is suppressed (end square covers).
    expect(info.zoneCount).toBe(info.blockCount);
    expect(info.zoneCount).toBeGreaterThan(0);
    expect(info.allZeroHeight).toBe(true); // no layout shift
    expect(info.allAriaHidden).toBe(true);
    expect(info.anyFocusable).toBe(false);
});

test('clicking a zone opens the Add-a-block window', async ({ page }) => {
    await clickZone(page, 0);
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
});

test('inserting from a before-zone lands the block ABOVE that block', async ({
    page,
}) => {
    const before = await columnTypes(page);
    // The zone above the first block (index 0). Insert a fill_in_blank there.
    await clickZone(page, 0);
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
    await page
        .getByRole('textbox', { name: 'Search all blocks' })
        .fill('fill in the blank');
    await page.locator('.block-insert-tile').first().click();

    const after = await columnTypes(page);
    // One more block, and the NEW block is now first (landed above the old head).
    expect(after.length).toBe(before.length + 1);
    expect(after[0]).toBe('fillInBlank');
    expect(after.slice(1)).toEqual(before);
});

test('inserting from the zone above an ATOM lands above it (not snapped below)', async ({
    page,
}) => {
    // The seam directly above the seed math block (an atom NodeView). Without
    // the GapCursor anchor a text-selection insert snaps PAST the atom and lands
    // below it; this proves it lands above.
    const before = await columnTypes(page);
    const mathIdx = before.indexOf('mathBlock');
    expect(mathIdx).toBeGreaterThan(0);

    // Click the zone whose next element sibling is the math block's wrapper.
    const pt = await page.evaluate(() => {
        const math = document.querySelector('.ProseMirror .node-mathBlock');
        const wrapper =
            (math?.closest('.editor-column > *') as HTMLElement | null) ??
            (math as HTMLElement | null);
        const zone = wrapper?.previousElementSibling as HTMLElement | null;
        if (!zone || !zone.classList.contains('editor-insert-zone')) return null;
        const r = zone.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y };
    });
    expect(pt).not.toBeNull();
    await page.mouse.click(pt!.x, pt!.y);

    await expect(page.locator('.block-insert-overlay')).toBeVisible();
    await page
        .getByRole('textbox', { name: 'Search all blocks' })
        .fill('block math');
    await page.locator('.block-insert-tile').first().click();

    const after = await columnTypes(page);
    // A new mathBlock landed at the seam — i.e. directly BEFORE the original.
    expect(after.filter((t) => t === 'mathBlock').length).toBe(2);
    expect(after[mathIdx]).toBe('mathBlock'); // new one took the old index
    expect(after[mathIdx + 1]).toBe('mathBlock'); // original pushed down by one
});

test('the picker offers top-level-only blocks at a 1-col stack seam', async ({
    page,
}) => {
    // A stack seam is top-level flow, so Section break / columns are ENABLED
    // (they are disabled only inside a multi-col cell).
    await clickZone(page, 0);
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
    await page
        .getByRole('textbox', { name: 'Search all blocks' })
        .fill('section break');
    const tile = page.locator('.block-insert-tile').first();
    await expect(tile).toBeVisible();
    // Enabled = no --disabled class and no aria-disabled attribute (it is set to
    // `true` only when the seam is inside a multi-col cell).
    await expect(tile).not.toHaveClass(/block-insert-tile--disabled/);
    await expect(tile).not.toHaveAttribute('aria-disabled', 'true');
});

test('zones are hidden while a block drag is in flight', async ({ page }) => {
    // dragstart→drop/dragend toggle .is-dragging-block on the editor DOM; CSS
    // hides the zone layer so it doesn't fight the dropcursor / drop targets.
    const state = await page.evaluate(() => {
        const pm = document.querySelector('.ProseMirror') as HTMLElement;
        const zone = document.querySelector(
            '.editor-insert-zone',
        ) as HTMLElement;
        const rest = getComputedStyle(zone).opacity;
        pm.classList.add('is-dragging-block');
        const dragging = {
            opacity: getComputedStyle(zone).opacity,
            pointerEvents: getComputedStyle(zone).pointerEvents,
        };
        pm.classList.remove('is-dragging-block');
        return { rest, dragging };
    });
    expect(state.rest).toBe('1');
    expect(state.dragging.opacity).toBe('0');
    expect(state.dragging.pointerEvents).toBe('none');
});

test('a zone never carries a gutter rest dot', async ({ page }) => {
    // The rest dot is a ::before on real column-child blocks; the zone widgets
    // are excluded so they do not sprout a phantom dot at every seam.
    const zoneDot = await page.evaluate(() => {
        const zone = document.querySelector('.editor-insert-zone');
        if (!zone) return null;
        const cs = getComputedStyle(zone, '::before');
        // The zone's own ::before is the transparent hit band (no background dot).
        return { background: cs.backgroundColor, borderRadius: cs.borderRadius };
    });
    expect(zoneDot).not.toBeNull();
    // Transparent hit band, not the slate dot fill.
    expect(zoneDot!.background).toBe('rgba(0, 0, 0, 0)');
});
