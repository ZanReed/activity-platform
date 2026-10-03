// =============================================================================
// figure-source.e2e.ts — a geometry figure authored in the MAIN editor (Y7 T7)
// -----------------------------------------------------------------------------
// Q8 + C1: the slash menu offers "Graph figure" in the body (it was
// reference-panel-only), and its "Figure source" popover edits the figure as
// the same ```figure lines the importer reads, re-parsed on Apply (ER-10: the
// text is generated from the node, never stored — so re-opening shows text
// regenerated from what was applied).
// =============================================================================

import { expect, test, type Page } from '@playwright/test';

async function boot(page: Page) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
}

function figureAttrs(page: Page) {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let a: any = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any) => {
            if (!a && n.type.name === 'graphFigure') a = n.attrs;
        });
        return a;
    });
}

const TRIANGLE = [
    'alt: Triangle ABC with AB = 8 cm',
    'point (0,0) "A"',
    'point (8,0) "B"',
    'point (2,5) "C"',
    'polygon A B C',
    'side AB "8 cm"',
    'angle BAC 68°',
    'ticks BC 2',
].join('\n');

test('insert a graph figure, edit its source, apply — the node and the regenerated source agree', async ({ page }) => {
    await boot(page);
    // The slash menu itself can't be driven under automation (@tiptap/suggestion
    // drops synthetic keys — see snap-motion.e2e.ts); that the item is OFFERED
    // in the body is unit-tested (figureSlashItem.test.ts). Insert by command.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertGraphFigure().run();
    });
    await expect(page.locator('.graph-figure-view')).toHaveCount(1);

    await page.getByRole('button', { name: 'Figure source' }).click();
    const text = page.locator('.graph-figure-source__text');
    await expect(text).toHaveValue(/axes: -10\.\.10, -10\.\.10/);
    await text.fill(TRIANGLE);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.graph-figure-source')).toHaveCount(0); // clean apply closes

    const a = await figureAttrs(page);
    expect(a.alt).toBe('Triangle ABC with AB = 8 cm');
    expect(a.plane).toBe(false);
    expect(a.drawables.map((d: { kind: string }) => d.kind)).toEqual([
        'point', 'point', 'point', 'polygon', 'side_label', 'angle_mark', 'tick_mark',
    ]);
    // The preview is the student's view: plane-less, so not square.
    const vb = await page.locator('.graph-figure-view__preview svg').getAttribute('viewBox');
    const [, , w, h] = vb!.split(' ').map(Number);
    expect(w).not.toBe(h);

    // Re-open: the text is REGENERATED from the stored node (ER-10).
    await page.getByRole('button', { name: 'Figure source' }).click();
    await expect(text).toHaveValue(/polygon A B C/);
    await expect(text).toHaveValue(/side A B "8 cm"/);
    await expect(text).toHaveValue(/angle B A C 68°/);
});

test('a bad line is reported and the figure keeps the lines that worked', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertGraphFigure().run();
    });
    await page.getByRole('button', { name: 'Figure source' }).click();
    await page.locator('.graph-figure-source__text').fill(TRIANGLE + '\nticks AX 1');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.graph-figure-source__problems')).toContainText('"ticks AX 1"');
    const a = await figureAttrs(page);
    expect(a.drawables).toHaveLength(7);
});
