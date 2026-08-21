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

/**
 * The popover's Answer field — the FIRST `.blank-edit-popover__input` (the
 * popover has several; acceptable-answers and feedback rows share the class).
 *
 * Asserted with Playwright's own `toBeFocused`, NOT a `document.activeElement`
 * probe read once. Focus is set by a React effect that runs after the popover
 * mounts, so a single read races it — and loses only when the machine is busy,
 * which is exactly what "flaky under parallel load, green in isolation" means.
 * An auto-retrying assertion waits for the state instead of sampling it.
 */
const answerInput = (page: Page) =>
    page.locator('.blank-edit-popover__input').first();

/**
 * The blank count, polled.
 *
 * Same reason: a key chord has to reach the browser, be handled by
 * ProseMirror, and re-render before the document carries the new node.
 * `expect(await blankCount(page))` samples once and fails on a slow tick;
 * `expect.poll` retries until it settles or times out.
 */
const expectBlankCount = (page: Page, n: number) =>
    expect.poll(() => blankCount(page)).toBe(n);

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

    await expectBlankCount(page, 1);
    await expect(page.locator('.blank-edit-popover')).toBeVisible();
    await expect(answerInput(page)).toBeFocused();
});

test('⌘⇧B / Ctrl⇧B inserts a blank and opens its popover focused', async ({
    page,
}) => {
    await freshBlock(page);
    await page.keyboard.press('ControlOrMeta+Shift+b');

    await expectBlankCount(page, 1);
    await expect(page.locator('.blank-edit-popover')).toBeVisible();
    await expect(answerInput(page)).toBeFocused();
});

test('typing an answer then Escape persists it on the blank', async ({ page }) => {
    await freshBlock(page);
    await page.locator('.fill-in-blank-block__add-blank').click();
    await expect(page.locator('.blank-edit-popover')).toBeVisible();

    // WAIT for the focus rather than assuming it: typing into a field that has
    // not been focused yet sends the keystrokes to the editor behind the
    // popover, and the failure then looks like "the answer did not persist"
    // three lines below rather than like the race it is.
    await expect(answerInput(page)).toBeFocused();
    await page.keyboard.type('Paris');
    await page.keyboard.press('Escape');

    await expect.poll(() => firstBlankAnswer(page)).toBe('Paris');
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
    // A NEGATIVE, so polling would pass instantly on a keypress that had not
    // been handled yet. Wait for the chord to actually reach the editor, then
    // assert nothing came of it.
    await expect(page.locator('.blank-edit-popover')).toHaveCount(0);
    expect(await blankCount(page)).toBe(0);
});

test('regression: {{answer}} still creates a pre-filled blank', async ({ page }) => {
    await freshBlock(page);
    await page.keyboard.type('{{Paris}}');
    await expectBlankCount(page, 1);
    await expect.poll(() => firstBlankAnswer(page)).toBe('Paris');
});
