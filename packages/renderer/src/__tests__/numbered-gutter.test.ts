// =============================================================================
// numbered-gutter.test.ts — every numbered block must have a gutter to sit in
// -----------------------------------------------------------------------------
// THE BUG THIS PINS (found 2026-07-29 on a real published page, browser-measured):
// `number_line` and `data_plot` emitted a `.block-problem-number` div but had NO
// grid rule, so they stayed `display: block`. The number div — block-level with
// `text-align: right` — then stretched the full content column (measured 760px
// instead of 40px) and rendered ALONE on a line above the canvas, with the
// number flung to the right margin. Every graph / number-line / data-plot
// question on every published page was affected.
//
// The defect is structural, not cosmetic-by-nature: emitting the gutter div and
// providing the grid that positions it are two separate places, and nothing tied
// them together. This test is that tie. A new numbered block type that forgets
// its grid rule fails HERE instead of on a teacher's screen.
//
// Deliberately asserts against the STYLESHEET rather than a rendered pixel: the
// renderer is pure (string in, string out) and has no DOM, so pixel truth lives
// in browser verification. What is checkable here — and what actually broke — is
// "the class the renderer emits has a matching gutter rule".
// =============================================================================

import { describe, expect, it } from 'vitest';
import { blockStyles } from '../runtime/styles.js';

/** Block classes that render a problem number, paired with the CSS class the
 * renderer puts on the block element. Keep in sync with the renderer's block
 * modules; a type that starts drawing a number belongs here. */
const NUMBERED_BLOCK_CLASSES = [
  'block-fill-in-blank',
  'block-problem',
  'block-multiple-choice',
  'block-matching',
  'block-ordering',
  'block-interactive-graph',
  'block-number-line',
  'block-data-plot',
] as const;

/** Every selector list that opens a `display: grid` rule, flattened to the set
 * of class names it covers. Parsed from the stylesheet rather than hard-coded,
 * so the test tracks the CSS instead of duplicating it. */
function classesWithGridRule(css: string): Set<string> {
  const covered = new Set<string>();
  // Match `<selectors> {  ... display: grid ... }` blocks.
  const ruleRe = /([^{}]+)\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(css)) !== null) {
    const [, selectors = '', body = ''] = m;
    if (!/display\s*:\s*grid/.test(body)) continue;
    if (!/grid-template-columns/.test(body)) continue;
    for (const cls of selectors.matchAll(/\.([a-z0-9-]+)/gi)) {
      if (cls[1]) covered.add(cls[1]);
    }
  }
  return covered;
}

describe('numbered blocks have a gutter grid', () => {
  const covered = classesWithGridRule(blockStyles);

  it.each(NUMBERED_BLOCK_CLASSES)(
    '%s is covered by a grid-template-columns rule',
    (cls) => {
      expect(
        covered.has(cls),
        `.${cls} draws a problem number but no grid rule positions it — the ` +
          `number will render full-width, right-aligned, on its own line. ` +
          `Add it to the shared problem grid in runtime/styles.ts.`,
      ).toBe(true);
    },
  );

  // The three canvas question blocks are one visual family and must share a
  // gutter width, or their numbers step in and out down the page.
  it('the canvas question blocks share one gutter rule', () => {
    const canvasRule = blockStyles.match(
      /\.block-interactive-graph,[^{]*\{[^}]*\}/,
    )?.[0];
    expect(canvasRule, 'interactive-graph should head a shared rule').toBeTruthy();
    expect(canvasRule).toContain('block-number-line');
    expect(canvasRule).toContain('block-data-plot');
  });

  // Browser-measured: every problem grid uses 2.5rem + 0.5rem, so the numbers
  // form ONE vertical rule. The gap-bearing math block was 2rem/0.25rem and sat
  // 8px off from its neighbours until 2026-07-29.
  it('a gap-bearing math block uses the same gutter metrics as the rest', () => {
    const mathRule = blockStyles.match(
      /\.block-math\.has-math-prompts\.is-numbered\s*\{[^}]*\}/,
    )?.[0];
    expect(mathRule).toBeTruthy();
    expect(mathRule).toContain('2.5rem 1fr');
    expect(mathRule).toContain('gap: 0.5rem');
  });

  // KaTeX's own `.katex-display` / `.katex-display > .katex` rules center display
  // math. A NUMBERED equation must override BOTH or it renders visually centered
  // — far from its number — while computing as left-aligned (which is exactly
  // how it evaded the first fix attempt).
  it('a numbered equation overrides KaTeX centering at every level', () => {
    for (const selector of [
      '.block-math.has-math-prompts.is-numbered .block-math__body',
      '.block-math.has-math-prompts.is-numbered .katex-display',
      '.block-math.has-math-prompts.is-numbered .katex-display > .katex',
    ]) {
      expect(
        blockStyles.includes(selector),
        `missing left-align override for "${selector}" — KaTeX will re-center ` +
          `the equation away from its problem number`,
      ).toBe(true);
    }
  });
});
