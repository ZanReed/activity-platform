// =============================================================================
// fill-in-blank-lettering.test.ts — (a)(b) sub-part lettering (P4)
// -----------------------------------------------------------------------------
// A NUMBERED multi-blank problem letters each gap "(a)/(b)" so a problem's gaps
// are distinguishable. Single-blank problems get no letter; suppressed/custom
// (out-of-sequence) get none.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBlock } from '../blocks/index.js';
import { FillInBlankBlock } from '@activity/schema';

const B1 = '46c70151-b85c-43ee-84f3-f5b048cbdc21';
const B2 = '46c70151-b85c-43ee-84f3-f5b048cbdc22';

const blank = (id: string, answer: string) => ({
  id,
  type: 'blank' as const,
  answer,
  acceptableAnswers: [],
});

const twoBlank = (extra: Record<string, unknown> = {}) =>
  FillInBlankBlock.parse({
    id: 'c847a81b-ae8f-4969-97b3-03e03228fcde',
    type: 'fill_in_blank',
    content: [
      { type: 'text', text: 'x = ' },
      blank(B1, '2'),
      { type: 'text', text: ', y = ' },
      blank(B2, '3'),
    ],
    ...extra,
  });

const oneBlank = () =>
  FillInBlankBlock.parse({
    id: 'c847a81b-ae8f-4969-97b3-03e03228fcde',
    type: 'fill_in_blank',
    content: [{ type: 'text', text: 'x = ' }, blank(B1, '2')],
  });

const ctx = () => ({ nextProblemNumber: () => 1, showAnswers: false });

describe('fill_in_blank sub-part lettering', () => {
  it('numbered multi-blank: letters each gap (a)(b)', () => {
    const html = renderBlock(twoBlank(), ctx());
    expect(html).toContain('<span class="blank-sublabel">(a)</span>');
    expect(html).toContain('<span class="blank-sublabel">(b)</span>');
  });

  it('single-blank: no letter', () => {
    const html = renderBlock(oneBlank(), ctx());
    expect(html).not.toContain('blank-sublabel');
  });

  it('suppressed (none) multi-blank: no letters', () => {
    const html = renderBlock(twoBlank({ label: { mode: 'none' } }), ctx());
    expect(html).not.toContain('blank-sublabel');
  });

  it('custom-labeled multi-blank: no letters (out of sequence)', () => {
    const html = renderBlock(
      twoBlank({ label: { mode: 'custom', text: 'Warm-up' } }),
      ctx(),
    );
    expect(html).not.toContain('blank-sublabel');
  });
});
