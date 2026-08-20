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
  createEssayBlock,
  createSelfExplanationBlock,
  createShortAnswerBlock,
  createInteractiveGraphBlock,
  createFadedWorkedExampleBlock,
  Block,
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

  // Ruling E7 (answer-key slice, 2026-08-19). These two USED to be false here,
  // alongside self_explanation — the pin is rewritten deliberately, and the
  // split within the free-text family is the thing worth pinning: a graded
  // question a teacher marks on paper wears a number; ungraded reflection
  // does not.
  it('true for the manually-graded free-response pair, false for reflection', () => {
    expect(isPageNumbered(createShortAnswerBlock())).toBe(true);
    expect(isPageNumbered(createEssayBlock())).toBe(true);
    expect(isPageNumbered(createSelfExplanationBlock())).toBe(false);
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

  // Viewer-numbering ruling N6. These three were page-numbered with no way to
  // opt out: short_answer and essay became numbered at answer-key ruling E7,
  // and faded_worked_example has always been one numbered box. Until the field
  // landed, `pageLabel` could only ever answer `number` for them.
  //
  // ⚠ THE FIELD ALONE IS NOT THE FEATURE. `label` survives a save only if the
  // type is also in serialize.ts's LABELED_BLOCK_TYPES, and reaches an author
  // only if blockControls.ts attaches `numberingGroup`. Those are links 3 and 4
  // of the chain (viewer-numbering D8) and have their own tests; this pins
  // link 1 — that the vocabulary exists and resolves.
  it.each([
    ['short_answer', createShortAnswerBlock],
    ['essay', createEssayBlock],
    ['faded_worked_example', createFadedWorkedExampleBlock],
  ])('%s can now carry all three label modes', (_type, make) => {
    const block = make() as Block;
    // Default (absent) stays numbered — no behaviour changed for existing docs.
    expect(pageLabel(block)).toEqual({ kind: 'number' });
    expect(pageLabel({ ...block, label: { mode: 'none' } } as Block)).toEqual({
      kind: 'none',
    });
    expect(
      pageLabel({ ...block, label: { mode: 'custom', text: 'Warm-up' } } as Block),
    ).toEqual({ kind: 'custom', text: 'Warm-up' });
  });

  it.each([
    ['short_answer', createShortAnswerBlock],
    ['essay', createEssayBlock],
    ['faded_worked_example', createFadedWorkedExampleBlock],
  ])('%s round-trips its label through the schema', (_type, make) => {
    // Absent-with-no-default (like sizingFields): a block that never set a
    // label re-serializes byte-identically, so no stored document moves.
    const bare = make();
    expect('label' in bare).toBe(false);

    const labelled = { ...bare, label: { mode: 'custom' as const, text: 'Warm-up' } };
    const parsed = Block.parse(labelled);
    expect((parsed as { label?: unknown }).label).toEqual({
      mode: 'custom',
      text: 'Warm-up',
    });
  });

  it('an empty custom label is rejected, on the new types too', () => {
    // BlockLabel's min(1): an empty custom label is meaningless — the author
    // wants text or wants `none`. Pinned here because the three new carriers
    // inherit that rule rather than restating it.
    expect(
      Block.safeParse({ ...createEssayBlock(), label: { mode: 'custom', text: '' } })
        .success,
    ).toBe(false);
  });
});
