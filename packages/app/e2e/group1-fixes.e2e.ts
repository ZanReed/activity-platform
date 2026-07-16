import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Group-1 refinement fixes (editor-refinement-pass, 2026-07-16).
// ----------------------------------------------------------------------------
// 1. The quick-bar ⚙ gear only shows when the block has configurable controls
//    (a primary or settings) — never a dead gear on learning_objectives etc.
// 2. Data-plot numeric settings draft-then-commit: clearing a field and
//    blurring restores the value instead of committing NaN; a blank tolerance
//    reads as 0.
// ============================================================================

async function boot(page: Page) {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
}

async function insertAndCaret(page: Page, cmd: string, type: string) {
    await page.evaluate(
        ({ c }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            ed.commands.focus('end');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ed.commands as any)[c]();
        },
        { c: cmd },
    );
    // Put the caret inside the block so the quick-bar targets it.
    await page.evaluate((t) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === t) pos = p;
            return pos === null;
        });
        if (pos === null) throw new Error(`no ${t}`);
        ed.commands.setTextSelection(pos + 1);
    }, type);
}

const quickbar = '.block-quickbar';

test('learning objectives shows no quick-bar gear (no settings)', async ({
    page,
}) => {
    await boot(page);
    await insertAndCaret(page, 'insertLearningObjectives', 'learningObjectives');
    const bar = page.locator(quickbar);
    await expect(bar).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Delete block' })).toBeVisible();
    await expect(
        bar.getByRole('button', { name: 'Duplicate block' }),
    ).toBeVisible();
    // The gear is gated out — the block has no primary and no settings.
    await expect(
        bar.getByRole('button', { name: 'Block settings' }),
    ).toHaveCount(0);
});

test('a block WITH settings still shows the quick-bar gear', async ({ page }) => {
    await boot(page);
    await insertAndCaret(page, 'insertEssay', 'essay');
    await expect(
        page.locator(quickbar).getByRole('button', { name: 'Block settings' }),
    ).toBeVisible();
});

test('data-plot tick step draft: clearing then blurring restores the value', async ({
    page,
}) => {
    await boot(page);
    // Insert a graded histogram (has tick step + bin width + eventually tolerance).
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.focus('end');
        ed.commands.insertDataPlot();
    });
    // Select it and open Advanced settings.
    const before = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let cfg: unknown = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'dataPlot' && !cfg) cfg = node.attrs.config;
        });
        return cfg as { tickStep: number };
    });
    await page.getByRole('button', { name: 'Advanced settings' }).click();
    const tick = page.getByLabel('Tick step');
    await tick.fill('');
    await tick.blur();
    const after = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let cfg: unknown = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'dataPlot' && !cfg) cfg = node.attrs.config;
        });
        return cfg as { tickStep: number };
    });
    // Not NaN, not blank — restored to the committed value.
    expect(after.tickStep).toBe(before.tickStep);
    expect(Number.isFinite(after.tickStep)).toBe(true);
});

test('data-plot boxplot tolerance: a blank field commits 0', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.focus('end');
        ed.commands.insertDataPlot();
        // Switch to build_boxplot so the tolerance field shows.
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'dataPlot') pos = p;
            return pos === null;
        });
        const node = ed.state.doc.nodeAt(pos);
        ed.chain()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .command(({ tr }: any) => {
                tr.setNodeAttribute(pos, 'interaction', {
                    ...node.attrs.interaction,
                    type: 'build_boxplot',
                    tolerance: 0.5,
                });
                return true;
            })
            .run();
    });
    await page.getByRole('button', { name: 'Advanced settings' }).click();
    const tol = page.getByLabel('Tolerance');
    await tol.fill('');
    await tol.blur();
    const tolerance = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let t: unknown = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'dataPlot' && t === null)
                t = node.attrs.interaction.tolerance;
        });
        return t as number;
    });
    expect(tolerance).toBe(0);
});
