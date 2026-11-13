import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// B-4 (ui-review-group-b.md): a new graph or number line says its answer is
// still the starting one, and the note goes once the answer changes.
// ============================================================================

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
});

// One block per test: a second insert would replace the selected first block.
test('a new interactive graph says "Starting answer"', async ({ page }) => {
    await insert(page, 'insertInteractiveGraph');
    await expect(page.locator('[data-starting-answer]')).toHaveCount(1);
    await expect(page.locator('[data-starting-answer]')).toHaveText('Starting answer — set the real one');
});

test('a new number line says "Starting answer"', async ({ page }) => {
    await insert(page, 'insertNumberLine');
    await expect(page.locator('[data-starting-answer]')).toHaveText('Starting answer — set the real one');
});

test('changing the number line answer removes its note', async ({ page }) => {
    await insert(page, 'insertNumberLine');
    await expect(page.locator('[data-starting-answer]')).toHaveCount(1);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.state.doc.descendants((node: { type: { name: string }; attrs: Record<string, unknown> }, pos: number) => {
            if (node.type.name !== 'numberLine') return true;
            ed.view.dispatch(
                ed.state.tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    interaction: { type: 'plot_point', correctPoints: [3], tolerance: 0.1 },
                }),
            );
            return false;
        });
    });
    await expect(page.locator('[data-starting-answer]')).toHaveCount(0);
});
