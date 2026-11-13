import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// D-4 / D-5 (docs/design/ui-review-group-d.md): the editor's controls speak,
// and a block moves without dragging.
// =============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

async function openPlayground(page: Page, empty = false) {
    await page.goto(empty ? '/playground?empty=1' : '/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
}

/** Index of the first `typeName` among its column's children, and the node
 *  selection's type after the move. */
function indexInColumn(page: Page, typeName: string) {
    return page.evaluate((name) => {
        const ed = (window as any).__tiptapEditor;
        let found: number | null = null;
        ed.state.doc.descendants((node: any) => {
            if (found !== null) return false;
            if (node.type.name === 'column') {
                node.forEach((child: any, _o: number, i: number) => {
                    if (found === null && child.type.name === name) found = i;
                });
            }
            return found === null;
        });
        return found;
    }, typeName);
}

async function selectFirst(page: Page, typeName: string) {
    await page.evaluate((name) => {
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === name) pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    }, typeName);
}

test('D-4: the format buttons have names and say whether they are on', async ({ page }) => {
    await openPlayground(page, true);
    const toolbar = page.locator('.editor-toolbar');
    for (const name of ['Bold', 'Italic', 'Underline', 'Code', 'Subscript', 'Superscript', 'Inline math']) {
        await expect(toolbar.getByRole('button', { name, exact: true })).toBeVisible();
    }
    const bold = toolbar.getByRole('button', { name: 'Bold', exact: true });
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await expect(bold).toHaveAttribute('title', 'Bold (⌘B)');
    await page.locator('.ProseMirror').click();
    await bold.click();
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
});

test('D-4: the slash menu is a list the editor points into as you arrow', async ({ page }) => {
    await openPlayground(page, true);
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('/');
    const list = page.getByRole('listbox', { name: 'Blocks' });
    await expect(list).toBeVisible();
    const editor = page.locator('.ProseMirror');
    const selectedId = () => list.locator('[role="option"][aria-selected="true"]').getAttribute('id');
    await expect(editor).toHaveAttribute('aria-activedescendant', (await selectedId())!);
    await page.keyboard.press('ArrowDown');
    const second = await selectedId();
    await expect(editor).toHaveAttribute('aria-activedescendant', second!);
    await page.keyboard.press('Escape');
    await expect(list).toHaveCount(0);
    await expect(editor).not.toHaveAttribute('aria-activedescendant', /.+/);
});

test('D-5: Move down / Move up in the block bar, without dragging', async ({ page }) => {
    await openPlayground(page);
    const before = await indexInColumn(page, 'mathBlock');
    expect(before).not.toBeNull();
    await selectFirst(page, 'mathBlock');
    const bar = page.locator('.block-command-bar');
    await expect(bar.getByRole('button', { name: 'Move down' })).toHaveAttribute('title', 'Move down (⌘⇧↓)');
    await bar.getByRole('button', { name: 'Move down' }).click();
    await expect.poll(() => indexInColumn(page, 'mathBlock')).toBe(before! + 1);
    // Still selected, so a second press works.
    await expect(bar).toBeVisible();
    await bar.getByRole('button', { name: 'Move up' }).click();
    await expect.poll(() => indexInColumn(page, 'mathBlock')).toBe(before);
});

test('D-5: Move up is greyed out on a column’s first block', async ({ page }) => {
    await openPlayground(page);
    await page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'column' && node.childCount > 1) pos = p + 1;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
    await expect(page.locator('.block-command-bar').getByRole('button', { name: 'Move up' })).toBeDisabled();
});
