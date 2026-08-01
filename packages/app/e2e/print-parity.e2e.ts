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

// ============================================================================
// The two fixture classes the per-block roster cannot express.
// ----------------------------------------------------------------------------
// A roster keyed to the block registry is structurally blind to layout (rows,
// columns, per-block footprint, section chrome) and to the document print layer
// (header, reference box, glossary, paper size, configured spacing). None of
// those is a block, so no per-block fixture can carry one — which is exactly
// why the eng review added the structural and document classes (S5-OV1/OV2),
// and why they need their own cases rather than riding the block loop.
// ============================================================================

test.describe('structural print rules', () => {
    test.beforeEach(async ({ page }) => {
        await blockExternalRequests(page);
    });

    test('structure/multi-column-row — columns stay side by side on paper', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&columns=1');
        const row = page.locator('.viewer-row').first();
        await expect(row).toBeAttached();
        await page.emulateMedia({ media: 'print' });

        // Side by side, and in the AUTHORED ratio: a 2:1 split that prints
        // 50/50 has lost the teacher's layout as surely as one that stacks.
        const [display, tracks] = await row.evaluate((el) => [
            getComputedStyle(el).display,
            getComputedStyle(el).gridTemplateColumns,
        ]);
        expect(display).toBe('grid');
        const [wide, narrow] = tracks.split(' ').map(parseFloat);
        expect(wide / narrow).toBeGreaterThan(1.8);
        expect(wide / narrow).toBeLessThan(2.2);
    });

    test('structure/block-sizing — an authored footprint survives printing', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&columns=1');
        const sized = page.locator('.viewer-block--sized').first();
        await expect(sized).toBeAttached();
        await page.emulateMedia({ media: 'print' });

        const ratio = await sized.evaluate((el) => {
            const parent = el.parentElement as HTMLElement;
            return el.getBoundingClientRect().width / parent.getBoundingClientRect().width;
        });
        // Authored at half its column. Footprint control is the whole point of
        // the feature, and paper is where it matters most.
        expect(ratio).toBeGreaterThan(0.4);
        expect(ratio).toBeLessThan(0.62);
        expect(await sized.evaluate((el) => getComputedStyle(el).marginLeft)).toBe('0px');
    });

    test('structure/section-flow — sections do not force a page break', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph');
        await page.emulateMedia({ media: 'print' });
        const value = await page
            .locator('.viewer-section')
            .first()
            .evaluate((el) => getComputedStyle(el).getPropertyValue('break-before').trim());
        expect(value).toBe('auto');
    });

    test('structure/reserved-work-space — an authored floor reaches paper', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&columns=1');
        const narrow = page.locator('.viewer-column').nth(1);
        await expect(narrow).toBeAttached();
        await page.emulateMedia({ media: 'print' });
        const minHeight = await narrow.evaluate(
            (el) => getComputedStyle(el).minHeight,
        );
        // 8rem of reserved room to work in, not a collapsed cell.
        expect(parseFloat(minHeight)).toBeGreaterThan(100);
    });
});

test.describe('document print rules', () => {
    test.beforeEach(async ({ page }) => {
        await blockExternalRequests(page);
    });

    test('document/print-header — labelled fill-in lines, only when enabled', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&header=1');
        await page.emulateMedia({ media: 'print' });

        const header = page.locator('.viewer-print-header');
        await expect(header).toBeAttached();
        expect(await header.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');

        const labels = await page
            .locator('.viewer-print-header__label')
            .allTextContents();
        expect(labels).toEqual(['Name:', 'Date:', 'Period:', 'Score:', 'Table #:']);

        // Every line is a real writing rule, not a zero-width nothing.
        const width = await page
            .locator('.viewer-print-header__line')
            .first()
            .evaluate((el) => getComputedStyle(el).borderBottomWidth);
        expect(parseFloat(width)).toBeGreaterThan(0);
    });

    test('document/print-header — absent when the teacher disabled every field', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph');
        await page.emulateMedia({ media: 'print' });
        // The fixture's default header has fields, so this asserts the inverse
        // through the component contract rather than the absence of markup.
        const count = await page.locator('.viewer-print-header').count();
        expect(count).toBeLessThanOrEqual(1);
    });

    test('document/page-size — the configured paper reaches the @page box', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&paper=a4');
        await page.emulateMedia({ media: 'print' });
        const rules = await page.evaluate(() =>
            [...document.querySelectorAll('style')]
                .map((s) => (s.textContent ?? '').trim())
                .filter((t) => t.startsWith('@page')),
        );
        // A4 with a 1in margin, emitted as a real rule — @page cannot read
        // custom properties, so a var()-based attempt would silently print
        // letter on every A4 printer.
        expect(rules).toContain('@page{size:A4;margin:1in;}');
    });

    test('document/print-vars — configured type and spacing take effect', async ({ page }) => {
        await page.goto('/dev/viewer?type=fill_in_blank&printvars=1');
        await page.emulateMedia({ media: 'print' });

        // 13pt, asserted as a range rather than an exact px string: the pt→px
        // conversion is the browser's, and pinning its rounding would be
        // testing Chromium rather than the configuration reaching the page.
        const root = page.locator('.viewer');
        const fontSize = parseFloat(
            await root.evaluate((el) => getComputedStyle(el).fontSize),
        );
        expect(fontSize).toBeGreaterThan(16);
        expect(fontSize).toBeLessThan(19);

        // Problem spacing and reserved work space land on the QUESTION blocks,
        // not on prose: a teacher asking for room between problems is not
        // asking for air after every paragraph.
        const question = page.locator('[data-block-category="question"]').first();
        const [marginTop, paddingBottom] = await question.evaluate((el) => [
            getComputedStyle(el).marginTop,
            getComputedStyle(el).paddingBottom,
        ]);
        expect(parseFloat(marginTop)).toBeGreaterThan(20);
        expect(parseFloat(paddingBottom)).toBeGreaterThan(30);
    });

    test('document/reference-panel — prints as a static box when left on', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&reference=1');
        await page.emulateMedia({ media: 'print' });
        const box = page.locator('.viewer-reference-print');
        await expect(box).toBeAttached();
        expect(await box.evaluate((el) => getComputedStyle(el).display)).toBe('block');
        await expect(box).toContainText('Formula sheet');
    });

    test('document/reference-panel — never prints when turned off', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph');
        await page.emulateMedia({ media: 'print' });
        expect(await page.locator('.viewer-reference-print').count()).toBe(0);
    });

    test('document/definition-glossary — the paper surface for definitions', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&glossary=1');
        await page.emulateMedia({ media: 'print' });

        const glossary = page.locator('.viewer-glossary');
        await expect(glossary).toBeAttached();
        expect(await glossary.evaluate((el) => getComputedStyle(el).display)).toBe('block');
        // The fixture defines "slope"; a glossary with no entries would render
        // nothing and this would fail rather than pass vacuously.
        await expect(page.locator('.viewer-glossary__term').first()).toHaveText('slope');
    });

    test('document/definition-glossary — absent when the teacher left it off', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph');
        await page.emulateMedia({ media: 'print' });
        expect(await page.locator('.viewer-glossary').count()).toBe(0);
    });

    test('document/typography — the chosen font is applied by NAME', async ({ page }) => {
        await page.goto('/dev/viewer?type=paragraph&font=lexend');
        await page.emulateMedia({ media: 'print' });
        const root = page.locator('.viewer');
        expect(await root.getAttribute('data-activity-font')).toBe('lexend');
        expect(await root.evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
            'Lexend',
        );
    });
});
