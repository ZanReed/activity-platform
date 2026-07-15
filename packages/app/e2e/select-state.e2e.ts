import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Select state + click=edit — slice-6 stage-2 interaction harness.
// ----------------------------------------------------------------------------
// The four-state model's secondary Select state: click stays edit (caret, no
// bar), while grip-click and Esc lift to a block NodeSelection that draws the
// selection outline and reveals the docked command bar.
// ============================================================================

const BAR = '.block-command-bar';

// A plain-text paragraph (the first paragraph holds an inline-math atom, so
// clicking its center would select the atom rather than place a caret).
function editorParagraph(page: Page) {
    return page.locator('.ProseMirror').getByText('Block math example below:');
}

/** The current selection's ProseMirror type name, via the DEV editor handle.
 *  Vite's dev build name-mangles the class (e.g. `_TextSelection`), so strip
 *  the leading underscores. */
function selectionType(page: Page): Promise<string> {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sel = (window as any).__tiptapEditor.state.selection;
        return sel.constructor.name.replace(/^_+/, '');
    });
}

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('clicking text places a caret (edit) — no selection, no bar', async ({
    page,
}) => {
    await editorParagraph(page).click();
    expect(await selectionType(page)).toBe('TextSelection');
    await expect(page.locator(BAR)).toHaveCount(0);
    await expect(page.locator('.ProseMirror-selectednode')).toHaveCount(0);
});

test('Esc from a caret selects the containing block', async ({ page }) => {
    await editorParagraph(page).click();
    await page.keyboard.press('Escape');
    expect(await selectionType(page)).toBe('NodeSelection');
    // The selected block draws the outline and its command bar appears.
    await expect(page.locator('.ProseMirror-selectednode')).toHaveCount(1);
    await expect(page.locator(BAR)).toBeVisible();
});

test('the selection outline is drawn on the selected block', async ({
    page,
}) => {
    await editorParagraph(page).click();
    await page.keyboard.press('Escape');
    const outline = await page.evaluate(() => {
        const el = document.querySelector('.ProseMirror-selectednode');
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle };
    });
    expect(outline).not.toBeNull();
    expect(outline!.outlineStyle).toBe('solid');
    expect(parseFloat(outline!.outlineWidth)).toBeGreaterThan(0);
});

test('the grip is drag-only — clicking it does NOT select', async ({ page }) => {
    // Grip-click select was removed (it had a two-click bug). Selection is now
    // the quick-bar's ⋮ (see quickbar.e2e.ts) or Esc. The grip only drags.
    const para = editorParagraph(page);
    await para.click();
    await para.hover();
    await expect(page.locator('.block-gutter-cluster')).toBeVisible();
    await page.locator('.drag-handle-button').click();
    expect(await selectionType(page)).not.toBe('NodeSelection');
});

test('Esc with a range selection does not hijack (falls through)', async ({
    page,
}) => {
    // A non-empty range, then Esc: must NOT become a NodeSelection — only a
    // collapsed caret lifts to Select. Build the range deterministically via
    // the editor (keystroke timing flakes under parallel load) after focusing.
    await editorParagraph(page).click();
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const { from } = ed.state.selection;
        ed.commands.setTextSelection({ from, to: from + 4 });
    });
    // Precondition: the selection really is a non-empty range before Esc.
    const rangeEmpty = await page.evaluate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => (window as any).__tiptapEditor.state.selection.empty,
    );
    expect(rangeEmpty).toBe(false);

    await page.keyboard.press('Escape');
    expect(await selectionType(page)).toBe('TextSelection');
});
