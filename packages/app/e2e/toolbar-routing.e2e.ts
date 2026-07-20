import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Toolbar → nested-field routing (slice-6 MC-coherence pass, part 1).
// ----------------------------------------------------------------------------
// The rich sub-fields (MC choice text, feedback, solutions, blank hints …)
// are nested Tiptap instances; the per-field mini toolbars are gone and the
// TOP toolbar now formats whichever field has focus (FieldFocusContext).
// These specs pin: routing marks to a focused choice field, the toolbar
// click NOT stealing focus (preventDefault on mousedown), main-doc-only
// controls disabling while a field is active, and the blank popover staying
// open when its hint field is formatted from the toolbar.
// ============================================================================

async function setup(page: Page) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
}

async function insertMc(page: Page) {
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus().insertMultipleChoice().run();
    });
    await expect(page.locator('.mc-block')).toBeVisible();
}

test('no mini toolbar renders inside nested rich fields', async ({ page }) => {
    await setup(page);
    await insertMc(page);
    await expect(page.locator('.inline-rte')).not.toHaveCount(0);
    await expect(page.locator('.inline-rte__toolbar')).toHaveCount(0);
});

test('the top toolbar bolds text inside a focused choice field', async ({
    page,
}) => {
    await setup(page);
    await insertMc(page);
    // Type into choice A's rich field.
    const choiceA = page
        .locator('.mc-block__choice-content .inline-rte__content')
        .first();
    await choiceA.click();
    await page.keyboard.type('half');
    await page.keyboard.press('ControlOrMeta+a');
    // Bold from the TOP toolbar (scoped: the mini toolbars are gone, so the
    // only B button is the main one).
    await page.locator('.editor-toolbar').getByRole('button', { name: 'B' }).click();
    // The mark landed in the choice attr, not the main doc.
    const state = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // Strict grid: the MC block is the first block in the first column.
        const mc = ed.state.doc.firstChild.firstChild.firstChild;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const choice = (mc.attrs.choices as any[])[0];
        return {
            content: choice.content,
            focusInField: Boolean(
                document.activeElement?.closest('.inline-rte'),
            ),
        };
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const first = (state.content as any[])[0];
    expect(first.text).toBe('half');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(first.marks?.some((m: any) => m.type === 'bold')).toBe(true);
    // preventDefault kept the field focused through the toolbar click.
    expect(state.focusInField).toBe(true);
});

test('main-document-only controls disable while a field is focused', async ({
    page,
}) => {
    await setup(page);
    await insertMc(page);
    const stylePicker = page.locator(
        '.editor-toolbar button[title="Text style of the current block"]',
    );
    // Before: enabled on the main doc.
    await expect(stylePicker).toBeEnabled();
    await page
        .locator('.mc-block__choice-content .inline-rte__content')
        .first()
        .click();
    await expect(stylePicker).toBeDisabled();
    await expect(
        page.locator('.editor-toolbar').getByRole('button', { name: 'Define' }),
    ).toBeDisabled();
    // Clicking back into the main document re-enables. Add a trailing main-doc
    // paragraph to click — every nested field is its own .ProseMirror, so the
    // target must be scoped to the MAIN root (the first, outermost one).
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.insertContentAt(ed.state.doc.content.size, {
            type: 'paragraph',
            content: [{ type: 'text', text: 'back to the doc' }],
        });
    });
    await page
        .locator('.ProseMirror')
        .first()
        .getByText('back to the doc')
        .click();
    await expect(stylePicker).toBeEnabled();
});

test('formatting a blank-popover hint from the toolbar keeps the popover open', async ({
    page,
}) => {
    await setup(page);
    // A fill-in-blank problem with one blank; select the blank chip to open
    // its popover.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus().insertFillInBlank().run();
        ed.chain().insertBlank({ answer: '42' }).run();
    });
    const chip = page.locator('.blank-chip').first();
    await chip.click();
    const popover = page.locator('.blank-edit-popover');
    await expect(popover).toBeVisible();
    // The hint field sits behind the "+ Advanced options" disclosure.
    await popover
        .getByRole('button', { name: /Advanced options/ })
        .click();
    const hint = popover.locator('.inline-rte__content').first();
    await hint.click();
    await page.keyboard.type('think fractions');
    await page.keyboard.press('ControlOrMeta+a');
    // exact — a bare 'I' substring-matches "DefIne".
    await page
        .locator('.editor-toolbar')
        .getByRole('button', { name: 'I', exact: true })
        .click();
    // The popover survived the toolbar click (allowlisted outside-click).
    await expect(popover).toBeVisible();
});
