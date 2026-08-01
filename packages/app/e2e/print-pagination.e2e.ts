import { test, expect } from '@playwright/test';

// ============================================================================
// print-pagination.e2e.ts — what paper actually does (S5 T9, finding OV3)
// ----------------------------------------------------------------------------
// Every print assertion in print-parity.e2e.ts runs under
// `emulateMedia({ media: 'print' })`, which applies the print stylesheet in ONE
// CONTINUOUS VIEWPORT. It never paginates. So `break-inside: avoid` is checked
// there as a computed VALUE — the rule is written down — and not as a fact
// about layout. The dominant real-world print failure is a problem splitting
// across a page boundary, and nothing in that suite can see it.
//
// page.pdf() is the only thing in the toolchain that runs Chromium's actual
// paged-media layout, so this is where pagination is observed at all.
//
// WHAT IS AND IS NOT COVERED, stated plainly rather than implied:
//
//   COVERED — that pagination happens, that a long worksheet breaks into a
//   sane number of pages, that the configured paper size changes the page box,
//   and that the break rules CHANGE the pagination (a document laid out with
//   them differs from the same document without them). That last one is the
//   real assertion: it proves the rules reach layout rather than merely
//   existing in a stylesheet.
//
//   NOT COVERED — per-block "this specific problem did not straddle a
//   boundary". Chromium's PDF text lives in compressed streams, so asserting
//   which page a given problem landed on needs a PDF parser this repo does not
//   carry, and adding one to assert a property the generated contact sheet
//   (T10) shows a human directly is not worth the dependency. Recorded here so
//   the gap is a decision rather than an oversight.
// ============================================================================

/** Chromium writes one `/Type /Page` object per page; counting them reads the
 *  page count without a PDF library. Crude, and sufficient for "did it
 *  paginate, and roughly how far". */
function pageCount(pdf: Buffer): number {
    const matches = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g);
    return matches?.length ?? 0;
}

async function pdfOf(
    page: import('@playwright/test').Page,
    url: string,
    format: 'Letter' | 'A4' = 'Letter',
): Promise<Buffer> {
    await page.goto(url);
    await expect(page.locator('.viewer').first()).toBeAttached();
    await page.evaluate(() => document.fonts.ready);
    return page.pdf({ format, printBackground: false });
}

test.describe('pagination — the layer print emulation cannot reach', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/*', (route) => {
            const url = route.request().url();
            return url.startsWith('http://localhost') ||
                url.startsWith('data:') ||
                url.startsWith('blob:') ||
                url.startsWith('about:')
                ? route.continue()
                : route.abort();
        });
    });

    test('a full worksheet paginates into a sane number of pages', async ({ page }) => {
        // The whole fixture worksheet: 22 block types and every variant. If this
        // came back as one page, pagination is not running and every break
        // assertion in the parity suite is measuring a stylesheet nobody
        // applied; if it came back as fifty, something is forcing a break per
        // block.
        const pdf = await pdfOf(page, '/dev/viewer?type=ALL');
        const pages = pageCount(pdf);
        expect(pages).toBeGreaterThan(1);
        expect(pages).toBeLessThan(40);
    });

    test('the break rules actually reach layout, not just the stylesheet', async ({ page }) => {
        // The assertion that makes this suite worth its runtime: a stylesheet
        // full of break-inside declarations the engine ignored would pass every
        // computed-value check in the parity suite.
        //
        // It needs a document where the rule MUST act. The fixture worksheet as
        // authored paginates identically with the rules on and off (9 pages
        // either way) — its blocks are small enough that none would straddle,
        // so nothing has to be pushed. A first draft of this test compared
        // those two numbers with `toBeGreaterThanOrEqual` and passed on the
        // equality, proving nothing at all.
        //
        // So the blocks are made taller than half a page first. Now two cannot
        // share a sheet, `avoid` has to push each one whole, and the difference
        // in page count is the rule doing its job.
        await pdfOf(page, '/dev/viewer?type=ALL');
        await page.addStyleTag({
            content: '@media print { .viewer-block { min-height: 6in; } }',
        });
        const withRules = pageCount(await page.pdf({ format: 'Letter' }));

        await page.addStyleTag({
            content: `@media print {
                .viewer-block, [data-block-type] { break-inside: auto !important; }
            }`,
        });
        const withoutRules = pageCount(await page.pdf({ format: 'Letter' }));

        // Strictly more: keeping a block whole costs the empty tail of a page.
        expect(withRules).toBeGreaterThan(withoutRules);
    });

    test('the configured paper size changes the page box', async ({ page }) => {
        // A4 is taller and narrower than Letter, so the same content lays out
        // differently. This is the paginated proof of what document/page-size
        // asserts as a rule — the @page declaration exists AND the engine
        // honours it.
        const letter = await pdfOf(page, '/dev/viewer?type=ALL', 'Letter');
        const a4 = await pdfOf(page, '/dev/viewer?type=ALL', 'A4');
        expect(pageCount(letter)).toBeGreaterThan(0);
        expect(pageCount(a4)).toBeGreaterThan(0);
        // Different paper, different bytes: identical output would mean the
        // format argument never reached the layout.
        expect(letter.equals(a4)).toBe(false);
    });

});
