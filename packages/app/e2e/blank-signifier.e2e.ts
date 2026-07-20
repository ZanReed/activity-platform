import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Blank-authoring chrome — the focus-gated "+ Blank" button (primary maker,
// mirroring the math editors' in-equation button), the ⌘⇧B / Ctrl⇧B shortcut,
// and the faint power-user tip about the `{{answer}}` shorthand.
// ----------------------------------------------------------------------------
// The chrome shows only while the block is being edited (caret inside, or a
// just-made blank's popover open); the resting block stays clean. Both the
// button and the shortcut insert an empty-answer blank at the caret and open
// its popover focused so the teacher types the answer straight away.
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

async function freshEditor(page: Page) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
}

async function freshBlock(page: Page) {
    await freshEditor(page);
    await page.evaluate(() => {
        (window as any).__tiptapEditor.chain().focus('end').insertFillInBlank().run();
    });
    // Click into the block so the caret is inside and the editor is focused —
    // that is what raises the authoring chrome.
    await page.locator('.fill-in-blank-block .prompt-field').click();
}

function blankCount(page: Page) {
    return page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        let n = 0;
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'blank') n++;
        });
        return n;
    });
}

function firstBlankAnswer(page: Page) {
    return page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        let answer: string | null = null;
        ed.state.doc.descendants((node: any) => {
            if (answer === null && node.type.name === 'blank') {
                answer = node.attrs.answer as string;
            }
            return answer === null;
        });
        return answer;
    });
}

function answerInputFocused(page: Page) {
    return page.evaluate(() => {
        const active = document.activeElement;
        const first = document.querySelector('.blank-edit-popover__input');
        return Boolean(active) && active === first;
    });
}

test('a focused (even empty) block shows the + Blank button and the {{}} tip', async ({
    page,
}) => {
    await freshBlock(page);
    await expect(page.locator('.fill-in-blank-block__add-blank')).toBeVisible();
    await expect(page.locator('.fill-in-blank-block__tip')).toContainText(
        '{{answer}}',
    );
});

test('a resting (blurred) block hides the authoring chrome', async ({ page }) => {
    await freshBlock(page);
    await expect(page.locator('.fill-in-blank-block__add-blank')).toBeVisible();
    await page.evaluate(() => (window as any).__tiptapEditor.commands.blur());
    await expect(page.locator('.fill-in-blank-block__add-blank')).toHaveCount(0);
});

test('clicking + Blank inserts a blank and opens its popover focused', async ({
    page,
}) => {
    await freshBlock(page);
    await page.locator('.fill-in-blank-block__add-blank').click();

    expect(await blankCount(page)).toBe(1);
    await expect(page.locator('.blank-edit-popover')).toBeVisible();
    expect(await answerInputFocused(page)).toBe(true);
});

test('⌘⇧B / Ctrl⇧B inserts a blank and opens its popover focused', async ({
    page,
}) => {
    await freshBlock(page);
    await page.keyboard.press('ControlOrMeta+Shift+b');

    expect(await blankCount(page)).toBe(1);
    await expect(page.locator('.blank-edit-popover')).toBeVisible();
    expect(await answerInputFocused(page)).toBe(true);
});

test('typing an answer then Escape persists it on the blank', async ({ page }) => {
    await freshBlock(page);
    await page.locator('.fill-in-blank-block__add-blank').click();
    await expect(page.locator('.blank-edit-popover')).toBeVisible();

    // The Answer input is focused → type straight into it, then close.
    await page.keyboard.type('Paris');
    await page.keyboard.press('Escape');

    expect(await firstBlankAnswer(page)).toBe('Paris');
});

test('⌘⇧B does nothing outside a fill_in_blank (passes through)', async ({
    page,
}) => {
    await freshEditor(page);
    // Caret in an ordinary paragraph — the shortcut is scoped to fill_in_blank.
    await page.evaluate(() => {
        (window as any).__tiptapEditor
            .chain()
            .focus('end')
            .insertContent('A plain paragraph')
            .run();
    });
    await page.locator('.ProseMirror').click();
    await page.keyboard.press('ControlOrMeta+Shift+b');
    expect(await blankCount(page)).toBe(0);
});

test('regression: {{answer}} still creates a pre-filled blank', async ({ page }) => {
    await freshBlock(page);
    await page.keyboard.type('{{Paris}}');
    expect(await blankCount(page)).toBe(1);
    expect(await firstBlankAnswer(page)).toBe('Paris');
});
