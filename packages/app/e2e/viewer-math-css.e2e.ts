import { test, expect } from '@playwright/test';

// ============================================================================
// Viewer math stylesheet — the student surface must load KaTeX's CSS.
// ----------------------------------------------------------------------------
// KaTeX emits two copies of every equation: .katex-mathml (for assistive tech,
// hidden by katex.css) and .katex-html (the visual one, laid out by katex.css).
// The viewer lazy-loads the engine in packages/viewer/src/inline/math.ts, and
// until 2026-09-26 it never loaded the stylesheet — only the editor NodeViews
// did, and students never load the editor. On a browser with native MathML
// (reported on Firefox) the "hidden" copy drew a real fraction and the
// unstyled visual copy spilled out beside it: "15⁄6 6 15".
//
// Bound to rendered output: this reads the computed style of the mathml copy,
// so it goes red on ANY path that drops the stylesheet, not only a deleted
// import line. Mutation-tested the day it was written (removing the CSS import
// from math.ts turns it red).
// ============================================================================

test('viewer hides KaTeX mathml copy (katex.css is loaded)', async ({ page }) => {
    await page.goto('/dev/viewer?type=ALL');
    const mathml = page.locator('.katex-mathml').first();
    await expect(mathml).toBeAttached();
    // katex.css positions the mathml copy absolutely and clips it to 1px.
    await expect(mathml).toHaveCSS('position', 'absolute');
    const box = await mathml.boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(1);
});
