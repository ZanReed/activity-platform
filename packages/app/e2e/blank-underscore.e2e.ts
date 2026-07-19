import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// `__` shortcut — typing two underscores inside a fill_in_blank inserts an
// EMPTY-answer text blank and opens its edit popover with the Answer input
// focused, so the teacher types the answer straight away (Model A follow-up).
// ----------------------------------------------------------------------------
// The signifier ("type __ to make a blank") promised this; before this rule the
// only maker was `{{answer}}`. Scoped to fill_in_blank so it never preempts
// StarterKit's `__…__` bold rule in ordinary paragraphs.
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

async function freshBlock(page: Page) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
    await page.evaluate(() => {
        (window as any).__tiptapEditor.chain().focus('end').insertFillInBlank().run();
    });
    // Click into the (empty) block so real keystrokes land there and fire the
    // input rule — insertContent alone bypasses ProseMirror's textInput path.
    await page.locator('.fill-in-blank-block .prompt-field').click();
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

test('typing __ inserts a blank and opens its popover with the Answer input focused', async ({
    page,
}) => {
    await freshBlock(page);
    await page.keyboard.type('__');

    // A blank node now exists in the doc.
    expect(await blankCount(page)).toBe(1);

    // The edit popover is open, and its Answer input holds focus.
    const pop = page.locator('.blank-edit-popover');
    await expect(pop).toBeVisible();
    const answerFocused = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        const first = document.querySelector('.blank-edit-popover__input');
        return Boolean(active) && active === first;
    });
    expect(answerFocused).toBe(true);
});

test('typing an answer then Escape persists it on the blank', async ({ page }) => {
    await freshBlock(page);
    await page.keyboard.type('__');
    await expect(page.locator('.blank-edit-popover')).toBeVisible();

    // The Answer input is focused → type straight into it, then close.
    await page.keyboard.type('Paris');
    await page.keyboard.press('Escape');

    expect(await firstBlankAnswer(page)).toBe('Paris');
});

test('regression: {{answer}} still creates a pre-filled blank', async ({ page }) => {
    await freshBlock(page);
    await page.keyboard.type('{{Paris}}');
    expect(await blankCount(page)).toBe(1);
    expect(await firstBlankAnswer(page)).toBe('Paris');
});

test('regression: **bold** still works inside a fill_in_blank (no blank made)', async ({
    page,
}) => {
    await freshBlock(page);
    await page.keyboard.type('**word**');

    // No blank was made; a bold text mark was applied instead.
    expect(await blankCount(page)).toBe(0);
    const hasBold = await page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        let bold = false;
        ed.state.doc.descendants((node: any) => {
            if (
                node.isText &&
                node.marks.some((m: any) => m.type.name === 'bold')
            ) {
                bold = true;
            }
        });
        return bold;
    });
    expect(hasBold).toBe(true);
});
