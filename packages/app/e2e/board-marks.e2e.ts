// =============================================================================
// board-marks.e2e.ts — the JSXGraph board DRAWS every Y7 mark kind (ER-5)
// -----------------------------------------------------------------------------
// The board's drawable switch ends in `default: break`, so an unknown kind
// draws nothing, silently. scripts/tests/drawable-roster proves a `case`
// exists for every kind; this proves the case renders. No unit harness loads
// JSXGraph (eng review C6), so a real browser is the proof.
//
// It runs on /dev/graph-question because the STUDENT viewer never mounts a
// display board (display graphs render through the static engine there); the
// board is reached by the editor's preview and this route.
// =============================================================================

import { expect, test } from '@playwright/test';

test('the display board renders the mark labels and the mark strokes', async ({ page }) => {
    await page.goto('/dev/graph-question?scenario=marks');
    const board = page.locator('.JXGtext').first();
    await expect(board).toBeAttached({ timeout: 15_000 });
    // Labels: side, angle and free text are JSXGraph text elements.
    for (const label of ['8 cm', '68°', 'base']) {
        await expect(page.locator('.JXGtext', { hasText: label })).toHaveCount(1);
    }
    // Strokes at the mark width (1.5): the arc, the chevron and the two ticks.
    const thin = await page.evaluate(
        () => [...document.querySelectorAll('svg path, svg line')].filter((n) => /^1\.5(px)?$/.test(n.getAttribute('stroke-width') ?? '')).length,
    );
    expect(thin, 'arc + chevron + two ticks at stroke 1.5').toBeGreaterThanOrEqual(4);
});
