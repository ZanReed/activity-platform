import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Interactive-graph settings → drawer extraction (TEST_SPEC.md graph slice).
// ----------------------------------------------------------------------------
// The inline "⚙ Advanced settings" disclosure is gone; settings render in the
// Advanced drawer via the GraphSettings custom field. The load-bearing check is
// INV1: writing any setting NEVER changes interaction.type and preserves the
// type's other answer fields. Drive via node-selection + gear + Advanced
// (Playwright is authoritative; the in-app browser suppresses the
// position-measured drawer under JS-driven selection).
// ============================================================================

const BAR = '.block-command-bar';
const DRAWER = '.block-advanced-drawer';

// Valid interaction shapes per type (mirror the extension factories).
const INTERACTIONS = {
    plot_point: { type: 'plot_point', correctPoints: [[0, 0]], tolerance: 0.1 },
    plot_function: {
        type: 'plot_function',
        models: [
            { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 },
        ],
    },
    plot_ray: {
        type: 'plot_ray',
        rays: [{ from: [0, 0], through: [3, 3], fromStyle: 'closed', tolerance: 0.25 }],
    },
    plot_segment: {
        type: 'plot_segment',
        segments: [{ from: [-2, 0], to: [3, 2], endpoints: ['closed', 'closed'], tolerance: 0.25 }],
    },
    shade_region: {
        type: 'shade_region',
        regions: [{ correctVertices: [[0, 0], [4, 0], [2, 4]], minOverlap: 0.9 }],
    },
    graph_inequality: {
        type: 'graph_inequality',
        inequalities: [
            { boundary: { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 }, strict: true, shadeSide: 'above' },
        ],
    },
    display: { type: 'display', drawables: [] },
} as const;

async function boot(page: Page) {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
}

// Insert a graph, set its interaction shape, node-select it. Returns nothing;
// caller opens the drawer.
async function insertGraph(page: Page, interaction: unknown) {
    await page.evaluate((intr) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertInteractiveGraph().run();
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (pos === null && n.type.name === 'interactiveGraph') pos = p;
            return pos === null;
        });
        ed.chain()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .command(({ tr }: any) => {
                tr.setNodeAttribute(pos, 'interaction', intr);
                return true;
            })
            .run();
        ed.commands.setNodeSelection(pos);
    }, interaction);
}

async function openDrawer(page: Page) {
    await page.locator(BAR).getByRole('button', { name: 'Settings', exact: true }).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    return page.locator(DRAWER);
}

function readInteraction(page: Page) {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let intr: unknown = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any) => {
            if (n.type.name === 'interactiveGraph' && intr === null) intr = n.attrs.interaction;
        });
        return intr;
    });
}

function readAttr(page: Page, attr: string) {
    return page.evaluate((a) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let v: unknown = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any) => {
            if (n.type.name === 'interactiveGraph' && v === undefined) v = n.attrs[a];
        });
        return v;
    }, attr);
}

test.beforeEach(async ({ page }) => {
    await boot(page);
});

// --- D1/D2: inline bar gone; settings in the drawer -------------------------

test('the inline "Advanced settings" bar is gone; settings live in the drawer', async ({
    page,
}) => {
    await insertGraph(page, INTERACTIONS.plot_point);
    // Old inline disclosure gone from the block.
    await expect(page.getByRole('button', { name: 'Advanced settings' })).toHaveCount(0);
    const drawer = await openDrawer(page);
    // Axis fields render in the drawer.
    await expect(drawer.getByLabel('xMin')).toBeVisible();
});

// --- INV1 + per-type tolerance write ----------------------------------------
// Each tolerance-bearing type: write the tolerance, assert type UNCHANGED, the
// value landed, and a sibling answer field survived.

/* eslint-disable @typescript-eslint/no-explicit-any -- test accessors read dynamic interaction shapes */
const TOLERANCE_TYPES = [
    { name: 'plot_point', intr: INTERACTIONS.plot_point, read: (i: any) => i.tolerance, sibling: (i: any) => i.correctPoints },
    { name: 'plot_function', intr: INTERACTIONS.plot_function, read: (i: any) => i.models[0].slopeTolerance, sibling: (i: any) => i.models[0].slope },
    { name: 'plot_ray', intr: INTERACTIONS.plot_ray, read: (i: any) => i.rays[0].tolerance, sibling: (i: any) => i.rays[0].from },
    { name: 'plot_segment', intr: INTERACTIONS.plot_segment, read: (i: any) => i.segments[0].tolerance, sibling: (i: any) => i.segments[0].from },
    { name: 'shade_region', intr: INTERACTIONS.shade_region, read: (i: any) => i.regions[0].minOverlap, sibling: (i: any) => i.regions[0].correctVertices },
] as const;
/* eslint-enable @typescript-eslint/no-explicit-any */

for (const t of TOLERANCE_TYPES) {
    test(`INV1: ${t.name} tolerance write preserves type + siblings`, async ({ page }) => {
        await insertGraph(page, t.intr);
        const drawer = await openDrawer(page);
        // The tolerance number input is the ToleranceRow's (axis fields carry
        // aria-labels; the tolerance number input does not).
        const tol = drawer.locator('input[type="number"]:not([aria-label])').first();
        await expect(tol).toBeVisible();
        await tol.fill('0.4');
        await tol.blur();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const intr = (await readInteraction(page)) as any;
        expect(intr.type).toBe(t.name); // INV1: type never changes
        expect(t.read(intr)).toBeCloseTo(0.4, 5); // the write landed
        expect(t.sibling(intr)).toBeTruthy(); // a sibling answer field survived
    });
}

test('P6: graph_inequality has no tolerance row; shared settings still present', async ({
    page,
}) => {
    await insertGraph(page, INTERACTIONS.graph_inequality);
    const drawer = await openDrawer(page);
    // No ToleranceRow number input (only the aria-labelled axis fields).
    await expect(drawer.locator('input[type="number"]:not([aria-label])')).toHaveCount(0);
    // Shared graded settings present.
    await expect(drawer.getByText('Worked solution')).toBeVisible();
});

test('P7: display graph shows axis only — no solution/confidence/mistakes', async ({
    page,
}) => {
    await insertGraph(page, INTERACTIONS.display);
    const drawer = await openDrawer(page);
    await expect(drawer.getByLabel('xMin')).toBeVisible();
    await expect(drawer.getByText('Worked solution')).toHaveCount(0);
    await expect(drawer.getByText(/confidence rating/)).toHaveCount(0);
    await expect(drawer.getByText('Mistake feedback')).toHaveCount(0);
});

// --- S1: axis fields converted to DraftNumberInput (D5) ---------------------

test('S1: axis field clear+blur restores (DraftNumberInput, no NaN)', async ({ page }) => {
    await insertGraph(page, INTERACTIONS.plot_point);
    const before = (await readAttr(page, 'axisConfig')) as { xMin: number };
    const drawer = await openDrawer(page);
    const xMin = drawer.getByLabel('xMin');
    await xMin.fill('');
    await xMin.blur();
    const after = (await readAttr(page, 'axisConfig')) as { xMin: number };
    expect(after.xMin).toBe(before.xMin);
    expect(Number.isFinite(after.xMin)).toBe(true);
    // A real edit still commits.
    await xMin.fill('-7');
    await xMin.blur();
    expect(((await readAttr(page, 'axisConfig')) as { xMin: number }).xMin).toBe(-7);
});

// --- S3: worked solution writes from the drawer -----------------------------

test('S3: worked-solution rich field writes the solution attr from the drawer', async ({
    page,
}) => {
    await insertGraph(page, INTERACTIONS.plot_point);
    const drawer = await openDrawer(page);
    const solution = drawer.locator('.inline-rte__content .ProseMirror').first();
    await solution.click();
    await page.keyboard.type('Plot at the origin');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attr = (await readAttr(page, 'solution')) as any[];
    expect(Array.isArray(attr)).toBe(true);
    expect(attr[0].text).toContain('Plot at the origin');
});

// --- S7: auto-feedback toggle present + default ON --------------------------

test('S7: auto-feedback toggle present and default ON', async ({ page }) => {
    await insertGraph(page, INTERACTIONS.plot_point);
    const drawer = await openDrawer(page);
    const toggle = drawer.getByRole('checkbox', { name: /Built-in nudges/ });
    await expect(toggle).toBeChecked(); // default on
    await toggle.uncheck();
    expect(await readAttr(page, 'builtinFeedback')).toBe(false);
});

// --- S8: mistake feedback add + edit ----------------------------------------

test('S8: mistake feedback — add an entry and edit its match', async ({ page }) => {
    await insertGraph(page, INTERACTIONS.plot_point);
    const drawer = await openDrawer(page);
    await drawer.getByRole('button', { name: '+ Anticipated mistake' }).click();
    const match = drawer.getByPlaceholder('(4, 3)');
    await expect(match).toBeVisible();
    await match.fill('(3, 4)');
    await match.blur();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mf = (await readAttr(page, 'mistakeFeedback')) as any[];
    expect(mf.length).toBe(1);
    expect(mf[0].match).toBe('(3, 4)');
});

// --- E1: type-switch while drawer open (adversarial sweep) -------------------

test('E1: after an in-place type switch, the drawer reflects the NEW type (no stale row)', async ({
    page,
}) => {
    // Interacting with the inline Type picker drops the NodeSelection (you can't
    // node-select a block while focusing a control inside it), so the drawer
    // closes on switch — that's fine. The real regression check: reopening after
    // a switch shows the new type's tolerance row, not a stale one.
    await insertGraph(page, INTERACTIONS.plot_point);
    await page
        .locator('.interactive-graph-block select')
        .first()
        .selectOption('shade_region');
    // The switch dropped the NodeSelection — re-select before reopening.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (pos === null && n.type.name === 'interactiveGraph') pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
    const drawer = await openDrawer(page);
    await expect(drawer.getByText('Min. overlap (IoU)')).toBeVisible();
    expect(((await readInteraction(page)) as { type: string }).type).toBe('shade_region');
});
