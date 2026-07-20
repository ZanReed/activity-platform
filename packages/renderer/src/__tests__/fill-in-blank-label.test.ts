// =============================================================================
// fill-in-blank-label.test.ts — per-block label (numbering/label decouple, T3)
// -----------------------------------------------------------------------------
// A fill_in_blank's `label` controls only the number gutter:
//   auto/absent → "N." consuming a sequence slot (today's behavior)
//   custom      → authored text, out-of-sequence (no slot)
//   none        → nothing, out-of-sequence (no slot) — the notes keyword blank
// In every mode the gradeable markup (block id, blank tokens) is identical, so a
// suppressed block still scores. Suppression/custom must NOT pull a number.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBlock } from '../blocks/index.js';
import { FillInBlankBlock } from '@activity/schema';

const BID = 'c847a81b-ae8f-4969-97b3-03e03228fcde';
const BLANK = '46c70151-b85c-43ee-84f3-f5b048cbdc21';

const fib = (extra: Record<string, unknown> = {}) =>
  FillInBlankBlock.parse({
    id: BID,
    type: 'fill_in_blank',
    content: [
      { id: BLANK, type: 'blank', answer: 'x', acceptableAnswers: [] },
    ],
    ...extra,
  });

// A counter ctx (like renderBody threads). Records how many numbers were pulled.
const counterCtx = () => {
  let n = 0;
  return {
    ctx: {
      nextProblemNumber: (): number => ++n,
      showAnswers: false,
    },
    pulled: () => n,
  };
};

// A ctx that fails if a number is ever pulled — proves out-of-sequence modes
// never touch the sequence.
const throwingCtx = () => ({
  nextProblemNumber: (): number => {
    throw new Error('out-of-sequence label must not pull a problem number');
  },
  showAnswers: false,
});

describe('fill_in_blank label', () => {
  it('auto (absent label): renders the numbered gutter, consumes a slot', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(fib(), ctx);
    expect(html).toContain('<div class="block-problem-number">1.</div>');
    expect(html).toContain('data-block-id="' + BID + '"');
    expect(pulled()).toBe(1);
  });

  it('explicit {mode:auto} renders identically to an absent label', () => {
    const a = renderBlock(fib(), counterCtx().ctx);
    const b = renderBlock(fib({ label: { mode: 'auto' } }), counterCtx().ctx);
    expect(b).toBe(a);
  });

  it('none: no gutter, no slot, but gradeable markup intact', () => {
    const html = renderBlock(fib({ label: { mode: 'none' } }), throwingCtx());
    expect(html).not.toContain('block-problem-number');
    // Still a scorable question: category, type, id, and the blank all present.
    expect(html).toContain('data-block-category="question"');
    expect(html).toContain('data-block-type="fill_in_blank"');
    expect(html).toContain('data-block-id="' + BID + '"');
    expect(html).toContain(BLANK);
  });

  it('custom: shows authored text out-of-sequence, no slot, escaped', () => {
    const html = renderBlock(
      fib({ label: { mode: 'custom', text: 'Warm-up <b>' } }),
      throwingCtx(),
    );
    expect(html).toContain('block-problem-number--custom');
    expect(html).toContain('Warm-up &lt;b&gt;');
    // custom is verbatim text, not "N." — no trailing period gutter.
    expect(html).not.toContain('<div class="block-problem-number">');
  });

  it('sequence: a none block between two auto blocks does not shift numbers', () => {
    const { ctx } = counterCtx();
    const first = renderBlock(fib(), ctx);
    renderBlock(fib({ label: { mode: 'none' } }), ctx); // suppressed
    const third = renderBlock(fib(), ctx);
    expect(first).toContain('>1.</div>');
    expect(third).toContain('>2.</div>'); // consecutive, the none consumed nothing
  });

  it('custom is also out-of-sequence for following auto blocks', () => {
    const { ctx } = counterCtx();
    const first = renderBlock(fib(), ctx);
    renderBlock(fib({ label: { mode: 'custom', text: 'Challenge' } }), ctx);
    const third = renderBlock(fib(), ctx);
    expect(first).toContain('>1.</div>');
    expect(third).toContain('>2.</div>');
  });

  it('number override relabels in-sequence under auto', () => {
    const { ctx, pulled } = counterCtx();
    const html = renderBlock(fib({ number: 5 }), ctx);
    expect(html).toContain('>5.</div>');
    expect(pulled()).toBe(1); // still consumed a slot (in-sequence)
  });
});
