// =============================================================================
// block-label.test.ts — per-block label across ALL numbered question types
// -----------------------------------------------------------------------------
// The label (auto/custom/none) now applies to multiple_choice, matching,
// ordering, number_line, and graded graphs/data-plots too, via the shared
// renderNumberGutter helper + pageLabel in renderBlock. Suppression is
// presentational only — gradeable markup stays — and none/custom are
// out-of-sequence across mixed block types.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBlock } from '../blocks/index.js';
import {
  createFillInBlankBlock,
  createMultipleChoiceBlock,
  createNumberLineBlock,
  type Block,
} from '@activity/schema';

const counterCtx = () => {
  let n = 0;
  return {
    ctx: { nextProblemNumber: (): number => ++n, showAnswers: false },
    pulled: () => n,
  };
};

const withLabel = (block: Block, label: unknown): Block =>
  ({ ...block, label }) as Block;

describe('multiple_choice label', () => {
  it('none: no gutter, no slot, gradeable markup intact', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(
      withLabel(createMultipleChoiceBlock(), { mode: 'none' }),
      ctx,
    );
    expect(html).not.toContain('block-problem-number');
    expect(html).toContain('data-block-type="multiple_choice"');
    expect(pulled()).toBe(0); // out of sequence
  });

  it('custom: shows text, out of sequence', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(
      withLabel(createMultipleChoiceBlock(), { mode: 'custom', text: 'Challenge' }),
      ctx,
    );
    expect(html).toContain('block-problem-number--custom');
    expect(html).toContain('Challenge');
    expect(pulled()).toBe(0);
  });

  it('auto: numbered, consumes a slot', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(createMultipleChoiceBlock(), ctx);
    expect(html).toContain('<div class="block-problem-number">1.</div>');
    expect(pulled()).toBe(1);
  });
});

describe('cross-type numbering sequence', () => {
  it('none/custom of any type consume no slot; autos stay consecutive', () => {
    const { ctx } = counterCtx();
    const a = renderBlock(createFillInBlankBlock(), ctx); // fib auto → 1
    renderBlock(withLabel(createMultipleChoiceBlock(), { mode: 'none' }), ctx); // skip
    renderBlock(
      withLabel(createNumberLineBlock(), { mode: 'custom', text: 'Warm-up' }),
      ctx,
    ); // skip
    const d = renderBlock(createNumberLineBlock(), ctx); // number_line auto → 2

    expect(a).toContain('>1.</div>');
    expect(d).toContain('>2.</div>');
  });
});
