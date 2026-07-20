// =============================================================================
// block-predicates.test.ts — the two shared predicates + pageLabel
// -----------------------------------------------------------------------------
// isPageNumbered ("wears a Problem N") and isGradeable ("emits a response") are
// DIFFERENT sets. pageLabel layers the per-block label field on top. These pin
// the membership so the renderer + editor can't drift from schema. Public-API
// tests: import from '@activity/schema' via ../src/index.js.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  isPageNumbered,
  isPageNumberedType,
  isGradeable,
  pageLabel,
  InteractiveGraphBlock,
  type Block,
  createParagraphBlock,
  createMathBlock,
  createFillInBlankBlock,
  createMultipleChoiceBlock,
  createNumberLineBlock,
  createSelfExplanationBlock,
  createInteractiveGraphBlock,
} from '../src/index.js';

const displayGraph = (): Block =>
  InteractiveGraphBlock.parse({
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    type: 'interactive_graph',
    prompt: [],
    axisConfig: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
    interaction: {
      type: 'display',
      drawables: [{ kind: 'point', at: [1, 1] }],
    },
  });

describe('isPageNumbered', () => {
  it('true for standard question blocks', () => {
    expect(isPageNumbered(createFillInBlankBlock())).toBe(true);
    expect(isPageNumbered(createMultipleChoiceBlock())).toBe(true);
    expect(isPageNumbered(createNumberLineBlock())).toBe(true);
    expect(isPageNumbered(createInteractiveGraphBlock())).toBe(true); // graded
  });

  it('false for content + a display graph', () => {
    expect(isPageNumbered(createParagraphBlock())).toBe(false);
    expect(isPageNumbered(createMathBlock('x^2'))).toBe(false);
    expect(isPageNumbered(createSelfExplanationBlock())).toBe(false);
    expect(isPageNumbered(displayGraph())).toBe(false);
  });

  it('a math_block is numbered only when it carries in-equation gaps', () => {
    const display = createMathBlock('x^2');
    expect(isPageNumbered(display)).toBe(false);
    const withGap = {
      ...display,
      prompts: [{ id: 'g', answer: 'x', acceptableAnswers: [] }],
    } as Block;
    expect(isPageNumbered(withGap)).toBe(true);
  });

  it('isPageNumberedType agrees with isPageNumbered for every block', () => {
    const blocks: Block[] = [
      createParagraphBlock(),
      createMathBlock('x'),
      createFillInBlankBlock(),
      createMultipleChoiceBlock(),
      createNumberLineBlock(),
      createSelfExplanationBlock(),
      createInteractiveGraphBlock(),
      displayGraph(),
    ];
    for (const b of blocks) {
      const interactionType =
        'interaction' in b
          ? (b.interaction as { type?: string } | undefined)?.type
          : undefined;
      expect(isPageNumberedType(b.type, interactionType)).toBe(
        isPageNumbered(b),
      );
    }
  });
});

describe('isGradeable', () => {
  it('true for gradeable/reviewable blocks incl free-text', () => {
    expect(isGradeable(createFillInBlankBlock())).toBe(true);
    expect(isGradeable(createMultipleChoiceBlock())).toBe(true);
    expect(isGradeable(createSelfExplanationBlock())).toBe(true); // reviewed, not scored
    expect(isGradeable(createInteractiveGraphBlock())).toBe(true);
  });

  it('math_block is gradeable exactly when it carries Model A gaps', () => {
    const bare = createMathBlock('x^2');
    expect(isGradeable(bare)).toBe(false);
    const withGap = {
      ...bare,
      prompts: [{ id: 'g', answer: 'x', acceptableAnswers: [] }],
    } as Block;
    expect(isGradeable(withGap)).toBe(true);
  });

  it('false for pure content + display graph', () => {
    expect(isGradeable(createParagraphBlock())).toBe(false);
    expect(isGradeable(displayGraph())).toBe(false);
  });
});

describe('pageLabel', () => {
  it('absent label on a numbered block → number', () => {
    expect(pageLabel(createFillInBlankBlock())).toEqual({ kind: 'number' });
  });

  it('none / custom are out-of-sequence', () => {
    const fib = createFillInBlankBlock();
    expect(pageLabel({ ...fib, label: { mode: 'none' } })).toEqual({
      kind: 'none',
    });
    expect(
      pageLabel({ ...fib, label: { mode: 'custom', text: 'Warm-up' } }),
    ).toEqual({ kind: 'custom', text: 'Warm-up' });
  });

  it('a non-numbered block is never a number', () => {
    expect(pageLabel(createParagraphBlock())).toEqual({ kind: 'none' });
  });
});
