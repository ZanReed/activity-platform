import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Blank-discoverability signifier (Form A ghost text, design-review 2026-07-19).
// ----------------------------------------------------------------------------
// A teacher may not know that typing `__` turns part of the sentence into a
// blank. Empty body → the placeholder teaches it; text-but-no-blank → a trailing
// faint hint teaches it; the hint fades once a blank exists.
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

async function freshEditor(page: Page) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
}

test('empty fill-in-blank placeholder teaches the __ blank keystroke', async ({
    page,
}) => {
    await freshEditor(page);
    await page.evaluate(() => {
        (window as any).__tiptapEditor.chain().focus('end').insertFillInBlank().run();
    });
    const field = page.locator('.fill-in-blank-block .prompt-field');
    await expect(field).toHaveAttribute('data-placeholder', /makes a blank/);
    // No trailing hint yet (body is empty — the placeholder covers it).
    await expect(page.locator('.fill-in-blank-block__make-hint')).toHaveCount(0);
});

test('text-but-no-blank shows the make-a-blank hint; a blank fades it', async ({
    page,
}) => {
    await freshEditor(page);
    await page.evaluate(() => {
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertFillInBlank().run();
        ed.chain().insertContent('The capital of France is Paris').run();
    });
    // Sentence has text but no blank → the trailing hint appears.
    await expect(page.locator('.fill-in-blank-block__make-hint')).toBeVisible();

    // Add a blank → the hint fades (a blank now exists).
    await page.evaluate(() => {
        (window as any).__tiptapEditor.chain().insertBlank({ answer: 'Paris' }).run();
    });
    await expect(page.locator('.fill-in-blank-block__make-hint')).toHaveCount(0);
});
