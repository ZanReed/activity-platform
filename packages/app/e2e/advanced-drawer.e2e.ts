import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Advanced drawer — slice-6 stage-4 interaction harness.
// ----------------------------------------------------------------------------
// The command bar's Advanced disclosure opens a grouped drawer of typed fields
// (toggle / number / text) that read + write the selected node's attrs.
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

test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
});

test('Advanced is closed by default; the disclosure opens the drawer', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertFadedWorkedExample', 'fadedWorkedExample');
    await expect(page.locator(DRAWER)).toHaveCount(0);
    await page.locator(BAR).getByRole('button', { name: 'Settings' }).click();
    await expect(page.locator(DRAWER)).toBeVisible();
});

test('a toggle field reads + writes the node attribute', async ({ page }) => {
    await insertAndSelect(page, 'insertFadedWorkedExample', 'fadedWorkedExample');
    await page.locator(BAR).getByRole('button', { name: 'Settings' }).click();

    const toggle = page
        .locator(DRAWER)
        .getByRole('checkbox', { name: /Show step labels/ });
    await expect(toggle).toBeChecked(); // default: labels on
    await toggle.click();
    expect(await attrOfFirst(page, 'fadedWorkedExample', 'showStepLabels')).toBe(
        false,
    );
});

test('a number field commits on blur and writes the attr', async ({ page }) => {
    await insertAndSelect(page, 'insertEssay', 'essay');
    await page.locator(BAR).getByRole('button', { name: 'Settings' }).click();
    const drawer = page.locator(DRAWER);
    // The free-text Response group carries Placeholder + Min/Max words.
    await expect(drawer.getByText('Response')).toBeVisible();

    const minWords = drawer.getByRole('spinbutton', { name: 'Min words' });
    await minWords.fill('150');
    await minWords.blur();
    expect(await attrOfFirst(page, 'essay', 'wordMin')).toBe(150);
});

test('a custom field (the rubric builder) renders in the drawer and edits the node', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertEssay', 'essay');
    await page.locator(BAR).getByRole('button', { name: 'Settings' }).click();
    const drawer = page.locator(DRAWER);
    // The Grading group hosts the rubric sub-editor (a `custom` field).
    await expect(drawer.getByText('Grading')).toBeVisible();
    expect(await attrOfFirst(page, 'essay', 'rubric')).toBeNull();

    await drawer.getByRole('button', { name: '+ Add rubric' }).click();
    // A criterion row appears and the node's rubric attr is now populated.
    await expect(
        drawer.getByRole('textbox', { name: 'Criterion label' }),
    ).toBeVisible();
    expect(await attrOfFirst(page, 'essay', 'rubric')).not.toBeNull();
});

test('the drawer closes when the selection moves to another block', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertFadedWorkedExample', 'fadedWorkedExample');
    await page.locator(BAR).getByRole('button', { name: 'Settings' }).click();
    await expect(page.locator(DRAWER)).toBeVisible();
    // Select a different block: the bar re-anchors and the drawer resets closed.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.commands.setTextSelection(1);
    });
    await expect(page.locator(DRAWER)).toHaveCount(0);
});
