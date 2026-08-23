// =============================================================================
// calculator-tool.e2e.ts — the calculator's real mount, in a real browser
// -----------------------------------------------------------------------------
// The half of this slice jsdom structurally cannot reach (D12). MathfieldElement
// is not a constructor in mathlive's node build — verified, not assumed — so the
// expression list cannot be constructed in a unit test at all, and geometry,
// computed colour and stacking are browser facts besides.
//
// Driven through /dev/calculator, which mounts the SAME mountCalculator() with
// `floating: true` that the student's tool cluster does. The cluster's own logic
// (gating, pending, failed load, close-vs-destroy, focus return) is pinned in
// packages/viewer/tests/components/tool-cluster.test.tsx against an injected
// surface; what is left for here is the widget itself.
//
// Four properties, each a thing that was silently wrong before this slice:
//   1. On a 375px phone the panel fitted inside the viewport (it hung 123px off).
//   2. In dark mode the panel is dark (it was a hard-coded white card).
//   3. The z-index comes from the host's seam, with a working standalone
//      fallback (it was a bare literal agreeing with the token by coincidence).
//   4. `a = 10` then `a*2` reads "= 20" and plots NOTHING (it silently plotted
//      a horizontal line at y = 20 with no readout).
// =============================================================================

import { test, expect, type Page } from '@playwright/test';

const PANEL = '.gk-cal';

/** Open /dev/calculator in the given mode and wait for the real panel. The kit
 * arrives over two chunk boundaries (entry, then MathLive), so this waits on
 * the mounted panel rather than on load. */
async function openCalculator(page: Page, mode: 'scientific' | 'graphing') {
  await page.goto('/dev/calculator');
  const panel = page.locator(PANEL);
  await expect(panel).toBeVisible({ timeout: 20_000 });
  if (mode === 'graphing') {
    await page.getByLabel('Mode').selectOption('graphing');
    await expect(page.locator(`${PANEL}[data-mode='graphing']`)).toBeVisible();
  }
  return page.locator(PANEL);
}

/** Type into one expression row and PROVE the text landed.
 *
 * The click-then-type race is real: without the settle and the per-key delay,
 * MathLive drops the opening characters ("a=10" arrived as "10"), and a row
 * that silently stayed empty would make the negative assertions below pass for
 * the wrong reason. Reading the field back is what stops a timing regression
 * from quietly turning this file green.
 *
 * Whitespace is normalized because MathLive's AsciiMath pads its operators —
 * `a*2` reads back as `a * 2`. Comparing raw text fails on input that arrived
 * perfectly, which is a worse test than none. */
async function typeRow(page: Page, index: number, text: string): Promise<void> {
  const field = page.locator('.gk-exprrow').nth(index).locator('math-field');
  const squash = (v: string): string => v.replace(/\s+/g, '');
  // Clear through the field's own API before typing, so this REPLACES rather
  // than inserting at whatever position the click happened to land on — which
  // is what makes it usable for editing a row as well as filling an empty one.
  // (MathLive does not honour ControlOrMeta+A as select-all; that spelling
  // appended, giving "a=10a=3".) The INPUT itself stays real keystrokes.
  await field.evaluate((el) =>
    (el as unknown as { setValue(v: string): void }).setValue(''),
  );
  await field.click();
  await page.waitForTimeout(300);
  await page.keyboard.type(text, { delay: 120 });
  await expect
    .poll(async () =>
      squash(
        await field.evaluate(
          (el) => (el as unknown as { getValue(f: string): string }).getValue('ascii-math'),
        ),
      ),
    )
    .toBe(squash(text));
}

/** How many EXPRESSION curves the board is drawing.
 *
 * Not `path` — the graph SVG always carries six: two arrowhead markers in
 * <defs>, two grid paths and two axis paths, all structural. A naive
 * `toHaveCount(0)` therefore fails on an empty board and a naive
 * `toBeVisible()` passes on an arrowhead in <defs>. Both happened while writing
 * this file. Expression curves are the ones stroked from the row palette, so
 * they are exactly the non-structural, non-defs paths.
 *
 * The two T11 tests below prove this is not vacuous between them: the same
 * helper must return 0 for the calculation row and 1 for the plotted one. */
async function plottedCurves(page: Page): Promise<number> {
  return page.evaluate(() => {
    const svg = document.querySelector('.gk-cal-graph svg');
    if (!svg) return -1;
    const structural = new Set(['#c0c0c0', '#666666']); // grid, axes
    return Array.from(svg.querySelectorAll('path')).filter(
      (p) => !p.closest('defs') && !structural.has(p.getAttribute('stroke') ?? ''),
    ).length;
  });
}

test.describe('the narrow-screen sheet (C8)', () => {
  test('fits inside a 375px viewport instead of hanging off it', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const panel = await openCalculator(page, 'graphing');

    await expect(panel).toHaveAttribute('data-sheet', 'on');
    const box = (await panel.boundingBox())!;
    // THE regression. min-width: 24rem (384px) beat max-width: 95vw, so the
    // panel measured 482px and 123px of it was off-screen — including, at some
    // drag positions, its own close button.
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
    // Full-bleed and bottom-anchored: it is a sheet, not a shrunken window.
    expect(box.width).toBe(375);
    expect(Math.round(box.y + box.height)).toBe(667);
    // The document itself must not scroll sideways because of it.
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows).toBe(false);
  });

  test('stacks the list above the board rather than splitting 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const panel = await openCalculator(page, 'graphing');

    const list = panel.locator('.gk-cal-left');
    const graph = panel.locator('.gk-cal-graph');
    const listBox = (await list.boundingBox())!;
    const graphBox = (await graph.boundingBox())!;
    // Side by side, the board got ~130px. Stacked, each gets the full width.
    expect(graphBox.y).toBeGreaterThanOrEqual(listBox.y + listBox.height - 1);
    expect(graphBox.width).toBeGreaterThan(300);
    // The col-resize splitter would resize the wrong axis once stacked.
    await expect(panel.locator('.gk-cal-splitter')).toBeHidden();
  });

  test('stays a floating window at desktop width', async ({ page }) => {
    // Without this the sheet assertions above would pass on a panel that had
    // simply become a sheet everywhere — including on the Chromebooks that are
    // the stated target device.
    await page.setViewportSize({ width: 1280, height: 800 });
    const panel = await openCalculator(page, 'graphing');

    await expect(panel).toHaveAttribute('data-sheet', 'off');
    const box = (await panel.boundingBox())!;
    expect(box.width).toBeLessThan(700);
    expect(box.x).toBeGreaterThan(0);
  });
});

test.describe('dark chrome (C14)', () => {
  test('renders a dark panel for a dark-mode student', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const panel = await openCalculator(page, 'scientific');

    await expect(panel).toHaveAttribute('data-theme', 'dark');
    // Bound to the RENDERED colour, not to the attribute: the attribute is set
    // by JS, the colours by the stylesheet, and either half can be wrong alone.
    const bg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgb(255, 255, 255)');
    const [r, g, b] = bg.match(/\d+/g)!.map(Number) as [number, number, number];
    expect(r + g + b).toBeLessThan(300); // unmistakably a dark surface
    // And the text on it must be light, or the panel is dark and unreadable.
    const ink = await panel.evaluate((el) => getComputedStyle(el).color);
    const [ir, ig, ib] = ink.match(/\d+/g)!.map(Number) as [number, number, number];
    expect(ir + ig + ib).toBeGreaterThan(450);
  });

  test('follows a theme flip while the panel is open', async ({ page }) => {
    // A student toggling the app theme with the tool up. Sampled-once detection
    // would leave a white panel on a dark worksheet until they reopened it.
    const panel = await openCalculator(page, 'scientific');
    await expect(panel).toHaveAttribute('data-theme', 'light');
    await page.evaluate(() =>
      document.documentElement.setAttribute('data-theme', 'dark'),
    );
    await expect(panel).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('the z-index seam (C12/D18)', () => {
  test('falls back to 120 where no host sets the property', async ({ page }) => {
    // /dev/calculator and the editor drawer preview are exactly that case, so
    // the fallback is what keeps them rendering as they did before the seam.
    const panel = await openCalculator(page, 'scientific');
    await expect(panel).toHaveCSS('z-index', '120');
  });

  test('takes the host’s value when one is offered', async ({ page }) => {
    // What the viewer does: .tool-mount sets --gk-z-panel: var(--z-calculator).
    // Before the seam the kit hard-coded 120 and no ancestor could move it.
    const panel = await openCalculator(page, 'scientific');
    await page.evaluate(() =>
      document.documentElement.style.setProperty('--gk-z-panel', '742'),
    );
    await expect(panel).toHaveCSS('z-index', '742');
  });
});

test.describe('cross-row definitions, the minimum scope (T11)', () => {
  test('a = 10 then a*2 reads "= 20" and draws no curve', async ({ page }) => {
    const panel = await openCalculator(page, 'graphing');
    const rows = panel.locator('.gk-exprrow');

    // Row 1 defines the slider; the list auto-appends the next row.
    await typeRow(page, 0, 'a=10');
    await expect(rows.nth(0).locator('.gk-exprrow-slider')).toBeVisible();

    await typeRow(page, 1, 'a*2');

    // THE readout. Before this slice the row showed nothing at all.
    const note = rows.nth(1).locator('.gk-exprrow-note');
    await expect(note).toHaveText('= 20');
    await expect(note).toHaveAttribute('data-kind', 'calc');

    // And the other half of the ruling: it must NOT plot. What used to appear
    // here was a horizontal line at y = 20, indistinguishable from a
    // deliberate one and impossible to tell apart from a mistake.
    await expect.poll(() => plottedCurves(page)).toBe(0);
  });

  test('the readout tracks the slider it depends on', async ({ page }) => {
    // The value is recomputed per rebuild, never cached with the row text —
    // the text of `a*2` does not change when `a` does.
    const panel = await openCalculator(page, 'graphing');
    const note = panel.locator('.gk-exprrow').nth(1).locator('.gk-exprrow-note');

    await typeRow(page, 0, 'a=10');
    await typeRow(page, 1, 'a*2');
    await expect(note).toHaveText('= 20');

    await typeRow(page, 0, 'a=3');
    await expect(note).toHaveText('= 6');
  });

  test('y = a still plots a line — the boundary of the rule', async ({ page }) => {
    // The case that separates "resolve variables" from "stop plotting". `y = a`
    // keeps its y, y is never a slider name, so it stays a curve. If this ever
    // starts reading "= 10", dragging a slider stops moving anything on screen.
    const rows = (await openCalculator(page, 'graphing')).locator('.gk-exprrow');

    await typeRow(page, 0, 'a=10');
    await typeRow(page, 1, 'y=a');

    await expect(rows.nth(1).locator('.gk-exprrow-note')).toHaveText('');
    await expect.poll(() => plottedCurves(page)).toBe(1);
  });
});
