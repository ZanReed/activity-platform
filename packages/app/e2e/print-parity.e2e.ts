import { test, expect, type Page } from '@playwright/test';
import {
    blockPrintRoster,
    variantPrintRoster,
    registeredBlockTypes,
    type BlockType,
    type PrintInstanceContext,
} from '@activity/viewer';
import { authoredFixtureDocument } from '@activity/viewer/fixtures';
import { renderActivityForPrint } from '@activity/renderer';
import { runPrintChecks, describeFailures } from './helpers/printParity';

// ============================================================================
// print-parity.e2e.ts — THE RENDERER-RETIREMENT GATE (S5, ruling S5-6)
// ----------------------------------------------------------------------------
// The second of the two gates that let the string renderer retire from the
// student path (the first, the golden grading corpus, landed in S4). It asks
// one question per block: does every ruled print rule hold — on the retiring
// renderer's published page AND on the viewer's print mode?
//
// WHAT IT IS NOT. It does not diff the two surfaces pixel by pixel. They are
// deliberately different renderings with different DOM, different font
// pipelines, and different container layout, so any threshold loose enough to
// tolerate the legitimate differences is too loose to catch a missing blank
// underline, and any threshold tight enough to catch one is permanently red.
// That is why finding R4's original proposal was amended: parity you can
// falsify is "every ruled RULE holds on both", asserted from the registry's
// PrintSpec via printExpectations. Pixels are compared viewer-against-viewer
// only (T8 baselines), and the subjective half is one recorded human read of a
// generated contact sheet (T10).
//
// NETWORK IS BLOCKED. The gate must not depend on R2, which is deleted at
// cutover — a retirement gate that dies with the thing it retires is no gate.
// Everything either surface needs is local: the renderer inlines its KaTeX CSS,
// and the viewer's fonts come from the app bundle.
//
// Run with: pnpm --filter @activity/app test:e2e print-parity
// ============================================================================

/** Every external origin is refused, so the gate proves the pages print
 *  correctly WITHOUT the network — which is also the world after S9. */
async function blockExternalRequests(page: Page): Promise<string[]> {
    const blocked: string[] = [];
    await page.route('**/*', (route) => {
        const url = route.request().url();
        const isLocal =
            url.startsWith('http://localhost') ||
            url.startsWith('http://127.0.0.1') ||
            url.startsWith('data:') ||
            url.startsWith('blob:') ||
            url.startsWith('about:');
        if (isLocal) return route.continue();
        blocked.push(url);
        return route.abort();
    });
    return blocked;
}

/**
 * The renderer surface for one block: the real published-print document,
 * loaded directly rather than served. setContent avoids standing up a second
 * static server for markup that is already a complete self-contained page.
 */
function rendererPageFor(type: BlockType, index: number): string {
    const doc = authoredFixtureDocument();
    // One block per page keeps a failure attributable: with the whole worksheet
    // loaded, "some blank somewhere is not underlined" is a hunt.
    const blocks = doc.sections
        .flatMap((s) => s.rows)
        .flatMap((r) => r.columns)
        .flatMap((c) => c.blocks)
        .filter((b) => b.type === type);
    const block = blocks[Math.min(index, blocks.length - 1)];
    if (!block) throw new Error(`no authored fixture block of type ${type}`);

    const single = structuredClone(doc);
    single.sections = [
        {
            ...single.sections[0]!,
            rows: [
                {
                    id: 'row-1',
                    columns: [{ id: 'col-1', blocks: [structuredClone(block)] }],
                },
            ],
        },
    ];
    return renderActivityForPrint(single);
}

/**
 * Types whose component arrives as a lazy chunk (the D16 eager/lazy split), and
 * the class their component root carries.
 *
 * Waiting on `[data-block-type]` is NOT enough: the container stamps that on
 * its wrapper immediately, and the harness shows every variant of a type at
 * once, so a count-based wait is satisfied by other blocks' wrappers long
 * before any component mounts. The first gate run reported the graph twins
 * "absent" for exactly that reason — the page was measured too early, and the
 * report was accurate about what was on it.
 */
const LAZY_ROOTS: Partial<Record<BlockType, string>> = {
    interactive_graph: '.viewer-graph',
    number_line: '.viewer-number-line',
    data_plot: '.viewer-data-plot',
    math_block: '.viewer-math-block',
};

/** The variant index of a fixture instance, for deep-linking the harness. */
function variantIndexFor(type: BlockType, ctx: PrintInstanceContext): number {
    if (ctx.interaction === undefined) return 0;
    const doc = authoredFixtureDocument();
    const blocks = doc.sections
        .flatMap((s) => s.rows)
        .flatMap((r) => r.columns)
        .flatMap((c) => c.blocks)
        .filter((b) => b.type === type);
    const idx = blocks.findIndex(
        (b) => (b as { interaction?: { type?: string } }).interaction?.type === ctx.interaction,
    );
    return idx === -1 ? 0 : idx;
}

/** Load the viewer surface for one block, in print media. */
async function loadViewerSurface(
    page: Page,
    type: BlockType,
    ctx: PrintInstanceContext,
): Promise<void> {
    const variant = variantIndexFor(type, ctx);
    await page.goto(`/dev/viewer?type=${type}&variant=${variant}`);

    // The container's wrapper carries data-block-type immediately, so waiting
    // on that alone would measure a LAZY block before its component mounted —
    // the first gate run reported the graph twins "absent" for exactly that
    // reason. Wait for the component's own root, which is a second element
    // with the same attribute.
    const roots = page.locator(`[data-block-type="${type}"]`);
    await expect(roots.first()).toBeAttached();
    const lazyRoot = LAZY_ROOTS[type];
    if (lazyRoot) {
        await expect(page.locator(lazyRoot).first()).toBeAttached({ timeout: 15_000 });
    }

    // Print media LAST: the page must be built before the print rules apply,
    // or a lazily-mounted block would be measured mid-flight.
    await page.emulateMedia({ media: 'print' });
}

/** Load the renderer surface for one block, in print media. */
async function loadRendererSurface(
    page: Page,
    type: BlockType,
    ctx: PrintInstanceContext,
): Promise<void> {
    const html = rendererPageFor(type, variantIndexFor(type, ctx));
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.emulateMedia({ media: 'print' });
}

test.describe('print parity — every block, both surfaces', () => {
    test.beforeEach(async ({ page }) => {
        await blockExternalRequests(page);
    });

    for (const type of blockPrintRoster) {
        test(`${type} prints to contract`, async ({ page }) => {
            await loadViewerSurface(page, type, {});
            const viewer = await runPrintChecks({ page, surface: 'viewer', type });
            const viewerReport = describeFailures(viewer, `viewer/${type}`);

            await loadRendererSurface(page, type, {});
            const renderer = await runPrintChecks({ page, surface: 'renderer', type });
            const rendererReport = describeFailures(renderer, `renderer/${type}`);

            // Both surfaces reported together: fixing one at a time doubles the
            // number of runs it takes to get a block green.
            expect([viewerReport, rendererReport].filter(Boolean).join('\n\n')).toBe('');

            // A block whose every check was skipped would pass vacuously.
            const asserted = viewer.filter((o) => o.status === 'pass').length;
            expect(asserted, `${type} asserted nothing on the viewer`).toBeGreaterThan(0);
        });
    }
});

test.describe('print parity — variants that change a printed rule', () => {
    test.beforeEach(async ({ page }) => {
        await blockExternalRequests(page);
    });

    for (const entry of variantPrintRoster) {
        const label = entry.ctx.variant ?? entry.ctx.interaction ?? 'base';
        test(`${entry.type}/${label} — ${entry.why}`, async ({ page }) => {
            await loadViewerSurface(page, entry.type, entry.ctx);
            // The harness renders EVERY variant of a type at once, so the check
            // must be pointed at the right instance — otherwise a display-figure
            // rule runs against whichever variant happens to be first, which is
            // how the gate reported "display printed 0 drawables" while the
            // display figure beside it was correct.
            const rootSelector = entry.ctx.interaction
                ? `[data-block-type="${entry.type}"][data-interaction="${entry.ctx.interaction}"]`
                : entry.ctx.variant
                  ? `[data-block-type="${entry.type}"][data-variant="${entry.ctx.variant}"]`
                  : undefined;
            const viewer = await runPrintChecks({
                page,
                surface: 'viewer',
                type: entry.type,
                ctx: entry.ctx,
                ...(rootSelector ? { rootSelector } : {}),
            });
            expect(describeFailures(viewer, `viewer/${entry.type}/${label}`)).toBe('');
        });
    }
});

test.describe('the gate itself', () => {
    test('covers every registered block type', async () => {
        // The roster is derived, so this is really a guard on the derivation:
        // if it ever became a hand-kept list, a new block type could ship
        // unprinted and nothing would go red.
        expect([...blockPrintRoster].sort()).toEqual([...registeredBlockTypes].sort());
    });

    test('runs without the network', async ({ page }) => {
        const blocked = await blockExternalRequests(page);
        await loadViewerSurface(page, 'paragraph', {});
        // Nothing external is required to print. If this ever fails, the gate
        // has grown a dependency on infrastructure that S9 deletes.
        expect(blocked, `external requests attempted: ${blocked.join(', ')}`).toEqual([]);
    });
});

test.describe('printing from dark mode (S5-9)', () => {
    test('resolves ink to a printable colour', async ({ page }) => {
        // The bug this exists for is silent and only visible on paper: viewer
        // print colours resolve from theme tokens, and --color-ink is near-white
        // in dark mode. Without the flatten, a dark-mode student prints white
        // on white.
        await blockExternalRequests(page);
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto('/dev/viewer?type=fill_in_blank');
        await expect(page.locator('[data-block-type="fill_in_blank"]').first()).toBeAttached();
        await page.emulateMedia({ media: 'print', colorScheme: 'dark' });

        const outcomes = await runPrintChecks({
            page,
            surface: 'viewer',
            type: 'fill_in_blank',
        });
        expect(describeFailures(outcomes, 'viewer/fill_in_blank (dark)')).toBe('');
    });
});

test.describe('printing AFTER a check (7.3A: paper is the blank version)', () => {
    test('strips marks, feedback and released solutions', async ({ page }) => {
        // Without this the clean-worksheet rules pass VACUOUSLY. A state pill,
        // a feedback line, and a solution disclosure only exist once the server
        // has answered a check — so a gate that only ever prints an untouched
        // worksheet is asserting "these are hidden" about elements that were
        // never on the page. Deleting the solutions rule from the stylesheet
        // did not turn the gate red until this test existed.
        await blockExternalRequests(page);
        await page.goto('/dev/viewer?type=multiple_choice');

        // Answer, then check the section.
        await page.locator('.viewer-mc__choice input').first().check();
        await page.locator('.viewer-section__check').first().click();
        await expect(page.locator('.viewer-state-pill').first()).toBeAttached();
        await expect(page.locator('.viewer-solution').first()).toBeAttached();

        await page.emulateMedia({ media: 'print' });

        for (const selector of [
            '.viewer-state-pill',
            '.viewer-solution',
            '[data-feedback="server"]',
            '.viewer-section__footer',
        ]) {
            const nodes = page.locator(selector);
            const count = await nodes.count();
            for (let i = 0; i < count; i++) {
                const display = await nodes
                    .nth(i)
                    .evaluate((el) => getComputedStyle(el).display);
                expect(display, `${selector}[${i}] prints`).toBe('none');
            }
        }

        // And the rule set still passes with all that state present.
        const outcomes = await runPrintChecks({
            page,
            surface: 'viewer',
            type: 'multiple_choice',
        });
        expect(describeFailures(outcomes, 'viewer/multiple_choice (checked)')).toBe('');
    });
});
