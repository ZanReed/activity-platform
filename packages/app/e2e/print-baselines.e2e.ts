import { test, expect } from '@playwright/test';
import { blockPrintRoster, type BlockType } from '@activity/viewer';

// ============================================================================
// print-baselines.e2e.ts — viewer-against-viewer screenshot pins (S5 T8)
// ----------------------------------------------------------------------------
// The layer that catches what the rules do not NAME. printExpectations asserts
// the rules we thought to write down (chrome hidden, blanks underlined, breaks
// avoided); a collapsed margin, an overlapping figure, or a heading that lost
// its weight breaks none of them and still produces a worksheet a teacher would
// not hand out. Pixels catch that class, and nothing else does.
//
// VIEWER AGAINST VIEWER ONLY (ruling S5-6). Comparing the viewer to the
// renderer pixel by pixel is the thing S5 explicitly rejected: two deliberately
// different renderings with different DOM and different font pipelines produce
// a threshold that is either permanently red or meaningless. Comparing the
// viewer to ITSELF over time has no such problem — the only thing that changed
// is our code, which is exactly what a regression pin should be sensitive to.
//
// LINUX/CI IS AUTHORITATIVE (ruling S5-7). Font rasterisation differs between
// macOS and the Linux runners, so a baseline taken on a laptop fails in CI and
// vice versa — for no reason a human would call a defect. CI owns the images;
// local runs get the structural gate (print-rules.e2e.ts), which is
// platform-independent and catches most regressions anyway.
//
// GENERATING OR UPDATING THE IMAGES (a deliberate act, not a side effect):
//
//   PRINT_BASELINES=1 pnpm --filter @activity/app exec playwright test \
//     print-baselines --update-snapshots
//
// run on Linux — either in CI via a manual workflow dispatch, or locally in a
// container. Commit the resulting .png files. Until they exist this suite skips
// rather than failing, so a missing baseline never reads as a broken build.
// ============================================================================

const ENABLED = process.env.PRINT_BASELINES === '1';

test.describe('print baselines (viewer)', () => {
    test.skip(
        !ENABLED,
        'Baselines are Linux/CI-authoritative (S5-7). Set PRINT_BASELINES=1 on Linux to run or update them.',
    );

    // A stable viewport: a screenshot diff is only meaningful if everything
    // except our code is held constant.
    test.use({ viewport: { width: 1024, height: 1400 } });

    for (const type of blockPrintRoster as readonly BlockType[]) {
        test(`${type} prints stably`, async ({ page }) => {
            await page.route('**/*', (route) => {
                const url = route.request().url();
                return url.startsWith('http://localhost') ||
                    url.startsWith('data:') ||
                    url.startsWith('blob:') ||
                    url.startsWith('about:')
                    ? route.continue()
                    : route.abort();
            });

            // mode=print is NOT the same switch as emulateMedia, and both are
            // required. `mode` is a component prop; emulateMedia is CSS. Drive
            // the media alone and the harness renders a hybrid that prints
            // nothing for a gap-bearing math_block: the component mounts its
            // MathLive field (screen behaviour) and hides the static KaTeX
            // behind it, then the print stylesheet hides the field. The first
            // Linux baseline run captured exactly that and would have pinned a
            // blank image as correct for a graded block type.
            await page.goto(`/dev/viewer?type=${type}&mode=print`);
            await expect(page.locator(`[data-block-type="${type}"]`).first()).toBeAttached();
            // Lazy block components (D16) show a Suspense fallback first, and a
            // screenshot taken then pins a spinner. Same signal the print
            // readiness barrier polls, so the shutter waits for what the product
            // waits for.
            await expect(page.locator('.viewer-block__loading')).toHaveCount(0, {
                timeout: 15_000,
            });
            // Fonts settled before the shutter: a swap mid-screenshot is the
            // classic source of a diff nobody can explain.
            await page.evaluate(() => document.fonts.ready);
            await page.emulateMedia({ media: 'print' });

            await expect(page.locator('.viewer').first()).toHaveScreenshot(
                `${type}-print.png`,
                {
                    // A small tolerance absorbs sub-pixel antialiasing without
                    // absorbing a real layout change.
                    maxDiffPixelRatio: 0.01,
                    animations: 'disabled',
                },
            );
        });
    }
});
