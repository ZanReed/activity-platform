import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// First-run "Start here" empty state — slice-6 stage-5 interaction harness.
// ----------------------------------------------------------------------------
// A brand-new empty activity shows a centered "Start here" with three one-tap
// starters (Title + instructions / A question / Two-column layout). It shows
// only when the doc is empty at mount, dismisses the moment the doc has real
// content, and never returns within the session (latch). /playground?empty=1
// mounts the editor on a blank doc.
// ============================================================================

async function waitForEditor(page: Page) {
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
}

test('a populated doc never shows Start here', async ({ page }) => {
    await page.goto('/playground');
    await waitForEditor(page);
    await expect(page.getByTestId('start-here')).toHaveCount(0);
});

test('an empty doc shows Start here with the three starters', async ({
    page,
}) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    const startHere = page.getByTestId('start-here');
    await expect(startHere).toBeVisible();
    await expect(startHere.locator('.start-here__card')).toHaveCount(3);
    await expect(startHere).toContainText('Title + instructions');
    await expect(startHere).toContainText('A question');
    await expect(startHere).toContainText('Two-column layout');
    // The other doors stay present (and gently emphasized via the canvas
    // class): the "/" ghost hint and the end square.
    await expect(page.locator('.editor-first-run')).toHaveCount(1);
    await expect(page.locator('.ProseMirror .is-empty-hint')).toHaveCount(1);
    await expect(
        page.getByRole('button', { name: 'Add a block' }),
    ).toBeVisible();
});

test('Title + instructions drops heading + paragraph with the caret in the heading', async ({
    page,
}) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await page
        .getByRole('button', { name: 'Title + instructions' })
        .click();
    await expect(page.getByTestId('start-here')).toHaveCount(0);
    const doc = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // Strict grid: the blocks live in the first row's first column.
        const column = ed.state.doc.firstChild.firstChild;
        return {
            children: column.content.content.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (n: any) => n.type.name,
            ),
            caretParent: ed.state.selection.$from.parent.type.name,
        };
    });
    expect(doc.children).toEqual(['heading', 'paragraph']);
    expect(doc.caretParent).toBe('heading');
    // Typing lands in the title immediately.
    await page.keyboard.type('My worksheet');
    await expect(page.locator('.ProseMirror h1')).toHaveText('My worksheet');
});

test('A question opens the picker at the Blanks category', async ({
    page,
}) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await page.getByRole('button', { name: 'A question' }).click();
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
    await expect(page.locator('.block-insert-rail__item--active')).toHaveText(
        'Blanks',
    );
    await expect(page.locator('.block-insert-pane__heading')).toHaveText(
        'Blanks',
    );
    // Picking a question dismisses Start here and cleans the leftover empty
    // paragraph (the doc's sole child is the inserted problem).
    await page
        .locator('.block-insert-tile', { hasText: 'Fill in the blank' })
        .click();
    await expect(page.getByTestId('start-here')).toHaveCount(0);
    const first = await page.evaluate(
        // Strict grid: the inserted problem is the first block in the first
        // row's first column.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () =>
            (window as any).__tiptapEditor.state.doc.firstChild.firstChild
                .firstChild.type.name,
    );
    expect(first).toBe('fillInBlank');
});

test('Two-column layout inserts a 2-column row and dismisses', async ({
    page,
}) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await page.getByRole('button', { name: 'Two-column layout' }).click();
    await expect(page.getByTestId('start-here')).toHaveCount(0);
    const doc = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const first = ed.state.doc.firstChild;
        return { type: first.type.name, cols: first.childCount };
    });
    expect(doc.type).toBe('row');
    expect(doc.cols).toBe(2);
});

test('Start here never returns within the session once content existed', async ({
    page,
}) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await expect(page.getByTestId('start-here')).toBeVisible();
    // Type real content → dismisses.
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('hello');
    await expect(page.getByTestId('start-here')).toHaveCount(0);
    // Delete everything → the doc is empty again, but the latch holds.
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    const empty = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const d = ed.state.doc;
        // Strict grid empty doc: one row > one column > one empty paragraph.
        if (d.childCount !== 1 || d.firstChild.type.name !== 'row') return false;
        const col = d.firstChild.firstChild;
        return col.childCount === 1 && col.firstChild.content.size === 0;
    });
    expect(empty).toBe(true);
    await expect(page.getByTestId('start-here')).toHaveCount(0);
});
