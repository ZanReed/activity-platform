import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Settings mode + Advanced drawer — slice-6.
// ----------------------------------------------------------------------------
// The command bar's ⚙ gear enters "settings mode": Duplicate/Delete are swapped
// for the block's `simple` settings (as buttons) plus an "Advanced" disclosure
// (only when the block has advanced settings). A toggle flips in place; a
// text/number setting opens its single-field editor in the drawer below;
// "Advanced" opens the grouped overflow (word-count, rubric).
// ============================================================================

const BAR = '.block-command-bar';
const DRAWER = '.block-advanced-drawer';

async function insertAndSelect(page: Page, insert: string, type: string) {
    await page.evaluate((cmd) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.focus('end');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ed.commands as any)[cmd]();
    }, insert);
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
        ed.commands.setNodeSelection(pos);
    }, type);
}

function attrOfFirst(page: Page, type: string, attr: string) {
    return page.evaluate(
        ({ t, a }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            let val: unknown = undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ed.state.doc.descendants((node: any) => {
                if (val === undefined && node.type.name === t) val = node.attrs[a];
            });
            return val;
        },
        { t: type, a: attr },
    );
}

const gear = (page: Page) =>
    page.locator(BAR).getByRole('button', { name: 'Settings', exact: true });

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('the gear enters settings mode: simple settings appear, actions hide', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertEssay', 'essay');
    const bar = page.locator(BAR);
    // Action mode: Duplicate/Delete present, no simple settings yet.
    await expect(bar.getByRole('button', { name: 'Duplicate' })).toBeVisible();
    await expect(page.locator(DRAWER)).toHaveCount(0);

    await gear(page).click();
    // Settings mode: simple (Placeholder) + Advanced appear; actions gone.
    await expect(bar.getByRole('button', { name: 'Placeholder' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Advanced' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Duplicate' })).toHaveCount(0);
    await expect(bar.getByRole('button', { name: 'Delete' })).toHaveCount(0);
});

test('a simple text setting (Placeholder) opens its field editor below', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertEssay', 'essay');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Placeholder' }).click();
    const input = page
        .locator(DRAWER)
        .getByRole('textbox', { name: 'Placeholder' });
    await input.fill('Write 2 sentences');
    await input.blur();
    expect(await attrOfFirst(page, 'essay', 'placeholder')).toBe(
        'Write 2 sentences',
    );
});

test('Advanced opens the overflow (word count + rubric)', async ({ page }) => {
    await insertAndSelect(page, 'insertEssay', 'essay');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    await expect(drawer.getByText('Response')).toBeVisible();
    await expect(drawer.getByText('Grading')).toBeVisible();
    const minWords = drawer.getByRole('spinbutton', { name: 'Min words' });
    await minWords.fill('150');
    await minWords.blur();
    expect(await attrOfFirst(page, 'essay', 'wordMin')).toBe(150);
});

test('a toggle simple setting flips in place; no Advanced button', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertFadedWorkedExample', 'fadedWorkedExample');
    await gear(page).click();
    const bar = page.locator(BAR);
    // Faded has only a toggle → no Advanced disclosure.
    await expect(bar.getByRole('button', { name: 'Advanced' })).toHaveCount(0);
    const toggle = bar.getByRole('button', { name: 'Show step labels' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true'); // default on
    await toggle.click();
    expect(await attrOfFirst(page, 'fadedWorkedExample', 'showStepLabels')).toBe(
        false,
    );
    // Flipping does NOT open a drawer.
    await expect(page.locator(DRAWER)).toHaveCount(0);
});

test('the rubric (a custom field) lives under Advanced and edits the node', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertEssay', 'essay');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    expect(await attrOfFirst(page, 'essay', 'rubric')).toBeNull();
    await drawer.getByRole('button', { name: '+ Add rubric' }).click();
    await expect(
        drawer.getByRole('textbox', { name: 'Criterion label' }),
    ).toBeVisible();
    expect(await attrOfFirst(page, 'essay', 'rubric')).not.toBeNull();
});

test('a block with no settings shows no gear', async ({ page }) => {
    // Select the heading (generic block: no simple, no advanced).
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'heading') pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
    await expect(page.locator(BAR)).toBeVisible();
    await expect(gear(page)).toHaveCount(0);
});

test('settings mode resets when the selection moves to another block', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertEssay', 'essay');
    await gear(page).click();
    await expect(
        page.locator(BAR).getByRole('button', { name: 'Placeholder' }),
    ).toBeVisible();
    // Move selection: the bar re-anchors in action mode.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.commands.setTextSelection(1);
    });
    await expect(
        page.locator(BAR).getByRole('button', { name: 'Placeholder' }),
    ).toHaveCount(0);
});
