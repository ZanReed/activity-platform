import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Question-block settings in the drawer (slice-6 MC-coherence pass, part 2).
// ----------------------------------------------------------------------------
// The four classic question blocks (multiple_choice / fill_in_blank /
// matching / ordering) moved their block-level settings out of inline
// footers into the descriptor system: MC gets `Multiple answers` as a simple
// toggle, and all four share the Grading (worked solution) + Print
// (work space) drawer groups. The old "⚙ Settings" footers are gone; a
// display-only summary line remains.
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

test('the shared Grading + Print drawer works on MC (work space + summary)', async ({
    page,
}) => {
    await insertAndSelect(page, 'insertMultipleChoice', 'multipleChoice');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    await expect(drawer.getByText('Grading')).toBeVisible();
    await expect(drawer.getByText('Print')).toBeVisible();
    await expect(drawer.getByText('Worked solution')).toBeVisible();

    // Work space number → attr + the block's display-only summary line.
    const workSpace = drawer.getByRole('spinbutton', {
        name: 'Work space (rem)',
    });
    await workSpace.fill('4');
    await workSpace.blur();
    expect(await attrOfFirst(page, 'multipleChoice', 'workSpace')).toBe(4);
    await expect(
        page.locator('.mc-block .question-settings-summary'),
    ).toHaveText('work space 4rem');
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

// GUI sweep items 3 + 6 (ruled 2026-11-13): short answer / essay edit their
// model answer + worked solution in the drawer; correspondence gets the shared
// question settings it never had.
for (const [cmd, type] of [
    ['insertShortAnswer', 'shortAnswer'],
    ['insertEssay', 'essay'],
] as const) {
    test(`${type}: the drawer edits the model answer and the worked solution`, async ({ page }) => {
        await insertAndSelect(page, cmd, type);
        await gear(page).click();
        await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
        const drawer = page.locator(DRAWER);
        await expect(drawer.getByText('Model answer', { exact: true })).toBeVisible();
        const fields = drawer.locator('.question-solution-field .inline-rte__content .ProseMirror');
        await expect(fields).toHaveCount(2);
        await fields.nth(0).click();
        await page.keyboard.type('Unit rate is 2.5');
        await fields.nth(1).click();
        await page.keyboard.type('Divide 15 by 6');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const answer = (await attrOfFirst(page, type, 'answer')) as any[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const solution = (await attrOfFirst(page, type, 'solution')) as any[];
        expect(answer[0].text).toContain('Unit rate');
        expect(solution[0].text).toContain('Divide 15');
        // Clearing the model answer removes it (null), not an empty list.
        await fields.nth(0).click();
        await page.keyboard.press('ControlOrMeta+a');
        await page.keyboard.press('Backspace');
        expect(await attrOfFirst(page, type, 'answer')).toBeNull();
    });
}

test('correspondence: the drawer has the worked solution, work space and numbering', async ({ page }) => {
    await insertAndSelect(page, 'insertCorrespondence', 'correspondence');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    await expect(drawer.getByText('Worked solution', { exact: true })).toBeVisible();
    await expect(drawer.getByRole('combobox', { name: 'Number on the page' })).toBeVisible();
    const workSpace = drawer.getByRole('spinbutton', { name: 'Work space (rem)' });
    await workSpace.fill('3');
    await workSpace.blur();
    expect(await attrOfFirst(page, 'correspondence', 'workSpace')).toBe(3);
});

// GUI sweep item 7 (ruled 2026-11-13): a data plot can draw from a seeded
// `sample` variable. The node had no `dataVar` attr at all until this change,
// so the round trip below is also the guard for that data loss.
async function setSamples(page: Page, samples: { name: string; min: number; max: number }[]) {
    await page.evaluate((n) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const storage = ed.storage.sectionBreak;
        storage.seedSamples = n;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storage.listeners.forEach((l: any) => l());
    }, samples);
}

test('data plot: the Data choice sets dataVar, and it survives the document JSON', async ({ page }) => {
    await setSamples(page, [{ name: 'scores', min: 0, max: 50 }]);
    await insertAndSelect(page, 'insertDataPlot', 'dataPlot');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const plot = page.locator(DRAWER).getByRole('combobox', { name: 'Plot' });
    await plot.selectOption({ label: 'Seeded variable scores (different for each student)' });
    expect(await attrOfFirst(page, 'dataPlot', 'dataVar')).toBe('scores');
    // The axis now spans the variable's whole range (0..50).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = (await attrOfFirst(page, 'dataPlot', 'config')) as any;
    expect(config.min).toBeLessThanOrEqual(0);
    expect(config.max).toBeGreaterThanOrEqual(50);
    const html = await page.evaluate(() => (window as any).__tiptapEditor.getHTML()); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(html).toContain('data-dataplot-var="scores"');
    await plot.selectOption({ label: 'These numbers' });
    expect(await attrOfFirst(page, 'dataPlot', 'dataVar')).toBeNull();
});

test('data plot: a variable no longer declared shows a warning, not a silent reset', async ({ page }) => {
    await setSamples(page, [{ name: 'scores', min: 0, max: 50 }]);
    await insertAndSelect(page, 'insertDataPlot', 'dataPlot');
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const { from } = ed.state.selection;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.chain().command(({ tr }: any) => { tr.setNodeAttribute(from, 'dataVar', 'heights'); return true; }).run();
        ed.commands.setNodeSelection(from);
    });
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    await expect(page.getByTestId('dataplot-var-missing')).toContainText('“heights”');
    expect(await attrOfFirst(page, 'dataPlot', 'dataVar')).toBe('heights');
});

// GUI sweep item 8: the level field shows only in a DoL section's rubric.
test('rubric levels appear only in a DoL section', async ({ page }) => {
    await insertAndSelect(page, 'insertShortAnswer', 'shortAnswer');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const drawer = page.locator(DRAWER);
    await drawer.getByRole('button', { name: '+ Add rubric' }).click();
    await expect(drawer.getByLabel('Level this line shows')).toHaveCount(0);

    // Make the section a DoL (as the section break's checkbox would), reselect.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // The playground starts with no section break: put one at the top.
        ed.chain().insertContentAt(0, { type: 'sectionBreak' }).run();
        let sb: number | null = null;
        let sa: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (n.type.name === 'shortAnswer' && sa === null) sa = p;
            if (n.type.name === 'sectionBreak' && sa === null) sb = p;
        });
        if (sb === null || sa === null) throw new Error('no section break before the block');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.chain().command(({ tr }: any) => { tr.setNodeAttribute(sb, 'dol', { skill: 'x' }); return true; }).run();
        // Leave the block and come back, as a teacher who ticked the DoL box
        // would, so its settings open fresh.
        ed.commands.setTextSelection(1);
    });
    await insertAndSelect(page, 'focus', 'shortAnswer');
    await gear(page).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    const level = page.locator(DRAWER).getByLabel('Level this line shows');
    await expect(level).toHaveCount(1);
    await level.fill('Merit');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rubric = (await attrOfFirst(page, 'shortAnswer', 'rubric')) as any;
    expect(rubric.criteria[0].level).toBe('Merit');
});
