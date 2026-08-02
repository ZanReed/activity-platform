import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { blockPrintRoster, type BlockType } from '@activity/viewer';
import { authoredFixtureDocument } from '@activity/viewer/fixtures';
import { renderActivityForPrint } from '@activity/renderer';

// ============================================================================
// print-contact-sheet.e2e.ts — the half of parity only a human can judge (T10)
// ----------------------------------------------------------------------------
// The rules gate proves every ruled rule holds on both surfaces. It cannot
// prove the printed page is GOOD — that the spacing reads, that a figure sits
// where it belongs, that a worksheet looks like something a teacher would hand
// to thirty students. That judgement is not automatable, and pretending
// otherwise is how a green gate ends up guarding a worksheet nobody would use.
//
// So it is made explicit instead of implied: this generates a side-by-side
// contact sheet — every block, renderer beside viewer, both in print media —
// which the author reads ONCE and signs off in STATE.md. One recorded human
// read, not a vibe.
//
// It is not part of the gate and not part of CI. Regenerate it when the print
// layer changes materially:
//
//   PRINT_CONTACT_SHEET=1 pnpm --filter @activity/app exec playwright test \
//     print-contact-sheet
//
// then open the path it prints.
// ============================================================================

const ENABLED = process.env.PRINT_CONTACT_SHEET === '1';
const OUT_DIR = resolve(process.cwd(), 'print-contact-sheet');

interface SheetRow {
    readonly type: string;
    readonly viewer: string;
    readonly renderer: string;
}

const rows: SheetRow[] = [];

/**
 * Component roots for the lazily-loaded blocks (the D16 eager/lazy split).
 *
 * The container stamps data-block-type on its wrapper IMMEDIATELY, so waiting
 * on that alone captures the page before a lazy component has mounted — which
 * is exactly what the first contact sheet did: math_block, interactive_graph,
 * number_line and data_plot all photographed as blank panels, and the sheet
 * reported a viewer that renders nothing where in fact it had not been given
 * time to render at all. A contact sheet that lies is worse than none, because
 * its whole job is to be believed.
 */
const LAZY_ROOTS: Partial<Record<string, string>> = {
    interactive_graph: '.viewer-graph',
    number_line: '.viewer-number-line',
    data_plot: '.viewer-data-plot',
    math_block: '.viewer-math-block',
};

function rendererPageFor(type: BlockType): string {
    const doc = authoredFixtureDocument();
    const blocks = doc.sections
        .flatMap((s) => s.rows)
        .flatMap((r) => r.columns)
        .flatMap((c) => c.blocks)
        .filter((b) => b.type === type);
    const block = blocks[0];
    if (!block) throw new Error(`no authored fixture block of type ${type}`);
    const single = structuredClone(doc);
    single.sections = [
        {
            ...single.sections[0]!,
            rows: [{ id: 'row-1', columns: [{ id: 'col-1', blocks: [structuredClone(block)] }] }],
        },
    ];
    return renderActivityForPrint(single);
}

test.describe('print contact sheet', () => {
    test.skip(!ENABLED, 'Set PRINT_CONTACT_SHEET=1 to generate.');
    test.describe.configure({ mode: 'serial' });
    test.use({ viewport: { width: 900, height: 1100 } });

    for (const type of blockPrintRoster as readonly BlockType[]) {
        test(`capture ${type}`, async ({ page }) => {
            await mkdir(OUT_DIR, { recursive: true });

            // Viewer, in print media.
            await page.goto(`/dev/viewer?type=${type}`);
            await expect(page.locator(`[data-block-type="${type}"]`).first()).toBeAttached();
            const lazyRoot = LAZY_ROOTS[type];
            if (lazyRoot) {
                await expect(page.locator(lazyRoot).first()).toBeAttached({
                    timeout: 15_000,
                });
                // The kit paints after mount; a screenshot on the same tick
                // catches an empty board.
                await page.waitForTimeout(600);
            }
            await page.evaluate(() => document.fonts.ready);
            await page.emulateMedia({ media: 'print' });
            const viewerFile = `${type}-viewer.png`;
            await page
                .locator('.viewer')
                .first()
                .screenshot({ path: resolve(OUT_DIR, viewerFile) });

            // Renderer, the same block, also in print media.
            await page.setContent(rendererPageFor(type), { waitUntil: 'domcontentloaded' });
            await page.emulateMedia({ media: 'print' });
            const rendererFile = `${type}-renderer.png`;
            await page.screenshot({
                path: resolve(OUT_DIR, rendererFile),
                fullPage: true,
            });

            rows.push({ type, viewer: viewerFile, renderer: rendererFile });
        });
    }

    test.afterAll(async () => {
        if (!ENABLED || rows.length === 0) return;
        const html = `<!doctype html>
<meta charset="utf-8">
<title>Print contact sheet — renderer vs viewer</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; margin: 0; padding: 2rem; background: #f6f7f9; color: #111; }
  h1 { margin: 0 0 .25rem; font-size: 1.4rem; }
  .lede { margin: 0 0 2rem; max-width: 60ch; color: #444; }
  .row { background: #fff; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 2rem; overflow: hidden; }
  .row > h2 { margin: 0; padding: .6rem 1rem; font-size: .95rem; background: #f0f1f3; border-bottom: 1px solid #ddd; font-family: ui-monospace, monospace; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #ddd; }
  figure { margin: 0; background: #fff; padding: 1rem; }
  figcaption { font-size: .8rem; color: #666; margin-bottom: .5rem; text-transform: uppercase; letter-spacing: .04em; }
  img { width: 100%; border: 1px solid #eee; display: block; }
</style>
<h1>Print contact sheet — renderer vs viewer</h1>
<p class="lede">
  Both surfaces in print media, one block per row. The rules gate already proves
  every ruled rule holds on both; what this is for is the judgement it cannot
  make — does the viewer's page read as well on paper as the one it replaces?
  Differences are expected (different DOM, different font pipeline). Look for
  ones that would matter to a teacher holding the sheet.
</p>
${rows
    .map(
        (r) => `<section class="row">
  <h2>${r.type}</h2>
  <div class="pair">
    <figure><figcaption>renderer (retiring)</figcaption><img src="${r.renderer}" alt="${r.type} on the renderer"></figure>
    <figure><figcaption>viewer</figcaption><img src="${r.viewer}" alt="${r.type} on the viewer"></figure>
  </div>
</section>`,
    )
    .join('\n')}
`;
        await writeFile(resolve(OUT_DIR, 'index.html'), html, 'utf8');
        // eslint-disable-next-line no-console
        console.log(`\nContact sheet: ${resolve(OUT_DIR, 'index.html')}\n`);
    });
});
