import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Question-block settings in the drawer (slice-6 MC-coherence pass, part 2).
// ----------------------------------------------------------------------------
// The four classic question blocks (multiple_choice / fill_in_blank /
// matching / ordering) moved their block-level settings out of inline
// footers into the descriptor system: MC gets `Multiple answers` as a simple
// toggle (matching gets `Reuse options`), and all four share the Grading
// (worked solution / confidence) + Print (work space) drawer groups. The old
// "⚙ Settings" footers are gone; a display-only summary line remains.
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

test('the inline settings footers are gone from the question blocks', async ({
    page,
}) => {
    for (const cmd of [
        'insertMultipleChoice',
        'insertFillInBlank',
        'insertMatching',
        'insertOrdering',
    ]) {
        await page.evaluate((c) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            ed.commands.focus('end');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ed.commands as any)[c]();
        }, cmd);
    }
    await expect(page.locator('.fill-in-blank-block__settings')).toHaveCount(0);
    // MC's floating multi-select checkbox is gone too (now a simple setting).
    await expect(page.locator('.mc-block__multi-toggle')).toHaveCount(0);
});

test('MC settings mode: Multiple answers toggle switches rows to checkboxes', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertMultipleChoice', 'multipleChoice');
    await gear(page).click();
    const bar = page.locator(BAR);
    const toggle = bar.getByRole('button', { name: 'Multiple answers' });
    await expect(toggle).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Advanced' })).toBeVisible();

    await expect(
        page.locator('.mc-block__correct-toggle[type="radio"]').first(),
    ).toBeVisible();
    await toggle.click();
    expect(await attrOfFirst(page, 'multipleChoice', 'multiSelect')).toBe(true);
    await expect(
        page.locator('.mc-block__correct-toggle[type="checkbox"]').first(),
    ).toBeVisible();
});

test('turning Multiple answers OFF collapses to the first correct choice', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertMultipleChoice', 'multipleChoice');
    // Force multi-select with two corrects.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'multipleChoice') pos = p;
            return pos === null;
        });
        const node = ed.state.doc.nodeAt(pos);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const choices = (node.attrs.choices as any[]).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (c: any, i: number) => ({ ...c, correct: i < 2 }),
        );
        ed.chain()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .command(({ tr }: any) => {
                tr.setNodeAttribute(pos, 'multiSelect', true);
                tr.setNodeAttribute(pos, 'choices', choices);
                return true;
            })
            .run();
        ed.commands.setNodeSelection(pos);
    });
    await gear(page).click();
    await page
        .locator(BAR)
        .getByRole('button', { name: 'Multiple answers' })
        .click();
    const corrects = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let out: boolean[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'multipleChoice' && out.length === 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                out = (node.attrs.choices as any[]).map((c: any) =>
                    Boolean(c.correct),
                );
            }
        });
        return out;
    });
    expect(corrects).toEqual([true, false, false, false].slice(0, corrects.length));
});

test('the shared Grading + Print drawer works on MC (confidence + summary)', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertMultipleChoice', 'multipleChoice');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    await expect(drawer.getByText('Grading')).toBeVisible();
    await expect(drawer.getByText('Print')).toBeVisible();
    await expect(drawer.getByText('Worked solution')).toBeVisible();

    // Confidence toggle → attr + the block's display-only summary line.
    await drawer
        .getByRole('checkbox', { name: /confidence rating/ })
        .check();
    expect(
        await attrOfFirst(page, 'multipleChoice', 'hasConfidenceRating'),
    ).toBe(true);
    await expect(
        page.locator('.mc-block .question-settings-summary'),
    ).toHaveText('confidence');

    // Work space number → attr + summary extends.
    const workSpace = drawer.getByRole('spinbutton', {
        name: 'Work space (rem)',
    });
    await workSpace.fill('4');
    await workSpace.blur();
    expect(await attrOfFirst(page, 'multipleChoice', 'workSpace')).toBe(4);
    await expect(
        page.locator('.mc-block .question-settings-summary'),
    ).toHaveText('confidence · work space 4rem');
});

test('the worked-solution rich field writes the solution attr', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertFillInBlank', 'fillInBlank');
    await gear(page).click();
    // fill_in_blank has no simple settings — the gear opens settings mode with
    // just the Advanced disclosure.
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    const solution = drawer.locator('.inline-rte__content .ProseMirror');
    await solution.click();
    await page.keyboard.type('Divide both sides by 2');
    const attr = await attrOfFirst(page, 'fillInBlank', 'solution');
    expect(Array.isArray(attr)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((attr as any[])[0].text).toContain('Divide');
});

test('matching gets the Reuse options simple toggle', async ({ page }) => {
    await insertAndSelect(page, 'insertMatching', 'matching');
    await gear(page).click();
    const toggle = page
        .locator(BAR)
        .getByRole('button', { name: 'Reuse options' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    expect(await attrOfFirst(page, 'matching', 'allowTargetReuse')).toBe(true);
});

test('data-plot: inline settings bar gone; settings live in the drawer', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertDataPlot', 'dataPlot');
    // The old inline "⚙ Advanced settings" disclosure is gone.
    await expect(
        page.getByRole('button', { name: 'Advanced settings' }),
    ).toHaveCount(0);
    // Gear → Advanced → the Chart custom panel with Min/Max/Tick.
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    const min = drawer.getByLabel('Axis minimum');
    await expect(min).toBeVisible();
    await min.fill('-3');
    await min.blur();
    expect(await attrOfFirst(page, 'dataPlot', 'config')).toMatchObject({
        min: -3,
    });
});

test('number-line: inline settings bar gone; settings live in the drawer', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertNumberLine', 'numberLine');
    // The old inline "⚙ Advanced settings" disclosure is gone.
    await expect(
        page.getByRole('button', { name: 'Advanced settings' }),
    ).toHaveCount(0);
    // Gear → Advanced → the Number line panel with Min/Max/Tick + Snap toggle.
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    const min = drawer.getByLabel('Line minimum');
    await expect(min).toBeVisible();
    await min.fill('-8');
    await min.blur();
    expect(await attrOfFirst(page, 'numberLine', 'config')).toMatchObject({
        min: -8,
    });
    // Snap-to-tick toggle writes.
    await drawer.getByRole('checkbox', { name: 'Snap to tick' }).uncheck();
    expect(
        (await attrOfFirst(page, 'numberLine', 'config') as { snapToTick: boolean })
            .snapToTick,
    ).toBe(false);
});
