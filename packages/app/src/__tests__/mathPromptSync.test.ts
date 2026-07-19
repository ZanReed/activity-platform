// =============================================================================
// mathPromptSync.test.ts — Model A latex<->prompts reconcile core (MA-T7)
// -----------------------------------------------------------------------------
// The load-bearing guarantee: emptyPlaceholders strips EVERY answer from the
// stored latex (the answer-leak fix), balanced-brace aware so a structured
// answer like \frac{12}{34} doesn't fool the scan. Format pinned against what
// MathLive actually emits (verified live: \placeholder[id]{value}).
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  emptyPlaceholders,
  placeholderIds,
  hasPlaceholders,
  buildMathPrompts,
} from '../editor/mathPromptSync';

describe('emptyPlaceholders', () => {
  it('empties a simple answer (the leak fix)', () => {
    expect(emptyPlaceholders('x=2+\\placeholder[g1]{2a}')).toBe(
      'x=2+\\placeholder[g1]{}',
    );
  });

  it('empties a structured answer with nested braces', () => {
    // MathLive emits \frac{12}{34} with braces — a naive [^{}] scan would stop
    // at the first }, leaving "34}" behind and leaking part of the answer.
    expect(emptyPlaceholders('\\placeholder[g]{\\frac{12}{34}}')).toBe(
      '\\placeholder[g]{}',
    );
  });

  it('empties every placeholder in a multi-gap equation', () => {
    expect(
      emptyPlaceholders(
        '\\frac{\\placeholder[n]{a+b}}{\\placeholder[d]{2a}}',
      ),
    ).toBe('\\frac{\\placeholder[n]{}}{\\placeholder[d]{}}');
  });

  it('leaves latex with no placeholders unchanged', () => {
    expect(emptyPlaceholders('x = \\frac{-b}{2a}')).toBe('x = \\frac{-b}{2a}');
  });

  it('does not throw on a half-typed / unbalanced placeholder', () => {
    expect(() => emptyPlaceholders('\\placeholder[g]{\\frac{1}')).not.toThrow();
  });
});

describe('placeholderIds', () => {
  it('lists gap ids in document order', () => {
    expect(
      placeholderIds('\\frac{\\placeholder[n]{a}}{\\placeholder[d]{}}'),
    ).toEqual(['n', 'd']);
  });

  it('is empty for a plain equation', () => {
    expect(placeholderIds('y = x^2')).toEqual([]);
  });
});

describe('hasPlaceholders', () => {
  it('detects a gap', () => {
    expect(hasPlaceholders('x=\\placeholder[g]{}')).toBe(true);
    expect(hasPlaceholders('x=4')).toBe(false);
  });
});

describe('buildMathPrompts (reconcile core)', () => {
  it('turns a gap answer latex into a schema prompt (answer as ascii)', () => {
    expect(buildMathPrompts([{ id: 'd', answerLatex: '2a' }], [])).toEqual([
      { id: 'd', answer: '2a', acceptableAnswers: [] },
    ]);
  });

  it('drops a gap with no answer yet (an incomplete question)', () => {
    expect(buildMathPrompts([{ id: 'd', answerLatex: '' }], [])).toEqual([]);
  });

  it('preserves an existing gap’s equivalence / tolerance / acceptable answers', () => {
    const existing = [
      {
        id: 'd',
        answer: 'old',
        acceptableAnswers: ['a+a'],
        equivalence: 'exact-form' as const,
        tolerance: 0.01,
      },
    ];
    expect(buildMathPrompts([{ id: 'd', answerLatex: '2a' }], existing)).toEqual([
      {
        id: 'd',
        answer: '2a', // answer refreshed from the field
        acceptableAnswers: ['a+a'], // config preserved
        equivalence: 'exact-form',
        tolerance: 0.01,
      },
    ]);
  });

  it('converts a structured answer to ascii', () => {
    expect(
      buildMathPrompts([{ id: 'd', answerLatex: '\\frac{1}{2}' }], [])[0]?.answer,
    ).toBe('(1)/(2)');
  });
});
