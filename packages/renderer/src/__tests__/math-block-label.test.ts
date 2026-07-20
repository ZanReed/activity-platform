// =============================================================================
// math-block-label.test.ts — Slice 2: math_block gap numbering on the page
// -----------------------------------------------------------------------------
// A gap-bearing equation (math_block.prompts) is a numbered problem: it draws a
// gutter and consumes a sequence slot. A prompt-free display equation is not
// numbered and renders byte-identically to before. none/custom opt out.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBlock } from '../blocks/index.js';
import { MathBlock } from '@activity/schema';

const BID = 'a52f8381-9eff-47c7-b792-ae06625c38ad';

const mathWith = (extra: Record<string, unknown>) =>
  MathBlock.parse({ id: BID, type: 'math_block', latex: '3x+2', ...extra });

const gapPrompt = [{ id: 'g1', answer: 'x', acceptableAnswers: [] }];

const counterCtx = () => {
  let n = 0;
  return { ctx: { nextProblemNumber: (): number => ++n }, pulled: () => n };
};

describe('math_block numbering', () => {
  it('display equation (no prompts): no gutter, no slot, byte-identical path', () => {
    const html = renderBlock(mathWith({}), counterCtx().ctx);
    expect(html).not.toContain('block-problem-number');
    expect(html).not.toContain('has-math-prompts');
    expect(html).not.toContain('block-math__body');
  });

  it('gap-bearing equation: numbered gutter, consumes a slot, body wrapped', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(mathWith({ prompts: gapPrompt }), ctx);
    expect(html).toContain('<div class="block-problem-number">1.</div>');
    expect(html).toContain('is-numbered');
    expect(html).toContain('block-math__body');
    // Model A markup intact so the gap still scores.
    expect(html).toContain('data-math-prompt-latex=');
    expect(pulled()).toBe(1);
  });

  it('none: gap-bearing equation renders no gutter and pulls no slot', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(
      mathWith({ prompts: gapPrompt, label: { mode: 'none' } }),
      ctx,
    );
    expect(html).not.toContain('block-problem-number');
    expect(html).not.toContain('is-numbered');
    expect(html).toContain('data-math-prompt-latex='); // still gradeable
    expect(pulled()).toBe(0);
  });

  it('custom: shows text, out of sequence', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(
      mathWith({ prompts: gapPrompt, label: { mode: 'custom', text: 'Warm-up' } }),
      ctx,
    );
    expect(html).toContain('block-problem-number--custom');
    expect(html).toContain('Warm-up');
    expect(pulled()).toBe(0);
  });

  it('emits a hidden .js-solution slot when a worked solution is authored', () => {
    const html = renderBlock(
      mathWith({
        prompts: gapPrompt,
        solution: [{ type: 'text', text: 'Because 2a = a + a.', marks: [] }],
      }),
      counterCtx().ctx,
    );
    expect(html).toContain('class="js-solution"');
    expect(html).toContain('data-for-block="' + BID + '"');
    expect(html).toContain('hidden');
    expect(html).toContain('Because 2a = a + a.');
  });

  it('no solution slot when none authored', () => {
    const html = renderBlock(mathWith({ prompts: gapPrompt }), counterCtx().ctx);
    expect(html).not.toContain('js-solution');
  });
});
