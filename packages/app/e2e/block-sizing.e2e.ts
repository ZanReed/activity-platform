import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Group 3 sizing slice — the BlockSizingField drawer control (D5).
// ----------------------------------------------------------------------------
// graph / data-plot / number-line are sized from the Advanced drawer, NOT an
// edge drag-handle (D6 — a handle would crush their authoring UI). One shared
// control in all three drawers. Checks:
//   SZ-M5  a width chip writes `width`; an align button writes `align`.
//   SZ-M6  "Full" clears width + align back to the unsized identity.
//   SZ-M7  the Size control renders in all three drawers.
// Drive via node-selection + gear + Advanced (Playwright is authoritative for
// the position-measured drawer), mirroring graph-settings.e2e.ts.
// ============================================================================

const BAR = '.block-command-bar';
const DRAWER = '.block-advanced-drawer';

const BLOCKS = [
    { name: 'interactiveGraph', insert: 'insertInteractiveGraph' },
    { name: 'numberLine', insert: 'insertNumberLine' },
    { name: 'dataPlot', insert: 'insertDataPlot' },
] as const;

async function boot(page: Page) {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
}

async function insertAndSelect(page: Page, insert: string, nodeName: string) {
    await page.evaluate(
        ({ insert, nodeName }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            ed.chain().focus('end')[insert]().run();
            let pos: number | null = null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ed.state.doc.descendants((n: any, p: number) => {
                if (pos === null && n.type.name === nodeName) pos = p;
                return pos === null;
            });
            ed.commands.setNodeSelection(pos);
        },
        { insert, nodeName },
    );
}

async function openDrawer(page: Page) {
    await page.locator(BAR).getByRole('button', { name: 'Settings', exact: true }).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    return page.locator(DRAWER);
}

function readAttr(page: Page, nodeName: string, attr: string) {
    return page.evaluate(
        ({ nodeName, attr }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            let v: unknown = undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ed.state.doc.descendants((n: any) => {
                if (n.type.name === nodeName && v === undefined) v = n.attrs[attr];
            });
            return v;
        },
        { nodeName, attr },
    );
}

test.beforeEach(async ({ page }) => {
    await boot(page);
});

for (const { name, insert } of BLOCKS) {
    test(`${name}: Size control writes width + align, and Full resets (SZ-M5/M6/M7)`, async ({
        page,
    }) => {
        await insertAndSelect(page, insert, name);
        const drawer = await openDrawer(page);

        // SZ-M7 — the Size group renders in this block's drawer.
        await expect(drawer.getByText('Size', { exact: true })).toBeVisible();
        // Align row hidden while the block is full-width (align without width is a no-op).
        await expect(drawer.getByRole('button', { name: 'Left', exact: true })).toHaveCount(0);

        // SZ-M5 — a width chip writes `width`.
        await drawer.getByRole('button', { name: '50%', exact: true }).click();
        expect(await readAttr(page, name, 'width')).toBe(0.5);

        // Editor preview (figureSizingStyle): the block's figure/board region
        // takes width:50% + max-width:none, so the author SEES the change.
        await expect(
            page
                .locator('.ProseMirror [style*="width: 50%"][style*="max-width: none"]')
                .first(),
        ).toBeVisible();

        // SZ-M5 — align row now shows; clicking Left writes `align`.
        await drawer.getByRole('button', { name: 'Left', exact: true }).click();
        expect(await readAttr(page, name, 'align')).toBe('left');

        // SZ-M6 — Full clears BOTH back to the unsized identity.
        await drawer.getByRole('button', { name: 'Full', exact: true }).click();
        expect(await readAttr(page, name, 'width')).toBeNull();
        expect(await readAttr(page, name, 'align')).toBeNull();
    });
}
