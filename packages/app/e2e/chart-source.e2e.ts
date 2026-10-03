// =============================================================================
// chart-source.e2e.ts — a statistics chart authored in the editor (Y7 T12, Q8)
// -----------------------------------------------------------------------------
// The slash menu offers "Chart", and its "Chart source" popover edits the
// chart as the same ```chart lines the importer reads, re-parsed on Apply. The
// text is generated from the node, never stored, so re-opening shows text
// regenerated from what was applied. The chart's node view is a LAZY chunk
// (ChartView.tsx), so these rows also prove that chunk loads in the editor.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';

async function boot(page: Page) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
    // The slash menu can't be driven under automation (see figure-source.e2e.ts);
    // insert by command.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus('end').insertChart().run();
    });
    await expect(page.locator('.chart-view')).toHaveCount(1);
}

function chartData(page: Page) {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let a: any = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any) => {
            if (!a && n.type.name === 'chart') a = n.attrs.data;
        });
        return a;
    });
}

const SOURCE = [
    'type: clustered',
    'title: How we get to school',
    'xlabel: Day',
    'ylabel: Number of students',
    'categories: Mon, Tue, Wed',
    'series: Walk = 12, 7, 15',
    'series: Bus = 4, 6, 3',
].join('\n');

test('insert a chart, edit its source, apply — the node, the preview and the regenerated source agree', async ({ page }) => {
    await boot(page);
    // The default chart draws: three bars.
    await expect(page.locator('.chart-view__preview rect[data-bar]')).toHaveCount(3);

    await page.getByRole('button', { name: 'Chart source' }).click();
    const text = page.locator('.graph-figure-source__text');
    await expect(text).toHaveValue(/type: bar/);
    await text.fill(SOURCE);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.graph-figure-source')).toHaveCount(0); // clean apply closes

    const data = await chartData(page);
    expect(data.chart).toBe('clustered');
    expect(data.categories).toEqual(['Mon', 'Tue', 'Wed']);
    expect(data.series).toEqual([
        { name: 'Walk', values: [12, 7, 15] },
        { name: 'Bus', values: [4, 6, 3] },
    ]);
    // The preview is the student's picture: six bars, one hatch, a title.
    await expect(page.locator('.chart-view__preview rect[data-bar]')).toHaveCount(6);
    await expect(page.locator('.chart-view__preview pattern')).toHaveCount(1);
    await expect(page.locator('.chart-view__preview [data-chart-text="title"]')).toHaveText('How we get to school');

    // Re-open: the text is REGENERATED from the stored node.
    await page.getByRole('button', { name: 'Chart source' }).click();
    await expect(text).toHaveValue(SOURCE);
});

test('a bad line is reported and the chart keeps the lines that worked', async ({ page }) => {
    await boot(page);
    await page.getByRole('button', { name: 'Chart source' }).click();
    await page.locator('.graph-figure-source__text').fill(SOURCE + '\nseries: Car = 1, 2');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.graph-figure-source__problems')).toContainText('"series: Car = 1, 2"');
    expect((await chartData(page)).series).toHaveLength(2);
});
