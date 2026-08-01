// =============================================================================
// grading-primitives.test.ts — the server grading engine's scoring rules (S4)
// -----------------------------------------------------------------------------
// Unit pins for the pure scorers. These are NOT the parity gate — that is the
// golden corpus (grading-corpus.test.ts), which runs the SAME case list through
// both this engine and the published-page runtime. This file pins the rules
// that are easy to "tidy" into a grading bug during a rewrite, and the ones the
// corpus can't express because they're about the engine's own edges.
//
// Every assertion here answers "what mark does a real student get", which is
// why the test names read as student outcomes rather than function contracts.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  normalizeLookalikes,
  prepareKeyValue,
  prepareStudentValue,
  trimValue,
} from '../src/server/grading/normalize.js';
import {
  coerceTolerance,
  numericallyClose,
  parseNumericValue,
} from '../src/server/grading/numeric.js';
import {
  groupBlanks,
  matchMistakeFeedback,
  scoreBlank,
  scoreBlankGroup,
  selectBlankFeedback,
  type BlankKey,
} from '../src/server/grading/blanks.js';
import {
  scoreMatching,
  scoreMultipleChoice,
  scoreOrdering,
  selectChoiceFeedback,
} from '../src/server/grading/choices.js';
import { checkExpressionSafety } from '../src/server/grading/guards.js';

/** A text blank accepting the given answers, with everything else at its
 * schema default. Mirrors what the raw document actually looks like. */
function blank(answers: string[], over: Partial<BlankKey> = {}): BlankKey {
  return {
    id: 'b1',
    answers,
    answerType: 'text',
    tolerance: 0,
    equivalence: 'value',
    mistakeFeedback: [],
    hint: undefined,
    interchangeableWithPrevious: false,
    ...over,
  };
}

describe('typographic normalization (ruling G1)', () => {
  it('accepts the minus sign a Chromebook math keyboard emits', () => {
    // U+2212, not U+002D. Visually identical; marked wrong before this ruling.
    expect(scoreBlank('−5', blank(['-5']))).toBe(true);
  });

  it('normalizes the KEY too, so a key pasted out of Google Docs still matches', () => {
    expect(scoreBlank('-5', blank(['−5']))).toBe(true);
  });

  it('accepts smart quotes where the key has a plain apostrophe', () => {
    expect(scoreBlank('f’(x)', blank(["f'(x)"]))).toBe(true);
  });

  it('treats a non-breaking space as a space', () => {
    expect(scoreBlank('x + 1', blank(['x + 1']))).toBe(true);
  });

  it('deletes zero-width characters rather than turning them into spaces', () => {
    expect(scoreBlank('​42​', blank(['42']))).toBe(true);
  });

  it('does NOT fold case — a deliberate non-goal, since X and x differ in algebra', () => {
    expect(scoreBlank('x', blank(['X']))).toBe(false);
  });

  it('does NOT collapse interior whitespace — spacing is significant', () => {
    expect(scoreBlank('x+1', blank(['x + 1']))).toBe(false);
  });

  it('leaves plain ASCII untouched (the fast path returns the same string)', () => {
    expect(normalizeLookalikes('2x + 1')).toBe('2x + 1');
  });

  it('is stateless across calls despite the global regex', () => {
    // A /g regex used with .test() carries lastIndex; a leak here would make
    // every other call silently skip normalization.
    expect(normalizeLookalikes('−')).toBe('-');
    expect(normalizeLookalikes('−')).toBe('-');
    expect(normalizeLookalikes('−')).toBe('-');
  });
});

describe('trimming parity', () => {
  it('trims the student value but NOT the key entry', () => {
    // Parity: the runtime compares raw key entries, so a key authored with a
    // stray space has never matched and must keep not matching.
    expect(prepareStudentValue('  7  ')).toBe('7');
    expect(prepareKeyValue(' 7 ')).toBe(' 7 ');
    expect(scoreBlank('7', blank([' 7 ']))).toBe(false);
  });

  it('preserves interior whitespace', () => {
    expect(trimValue('  x + 1  ')).toBe('x + 1');
  });

  it('treats a whitespace-only answer as blank, not as wrong', () => {
    expect(scoreBlank('   ', blank(['7']))).toBeNull();
  });

  it('treats a non-breaking-space-only answer as blank too', () => {
    // Normalization runs BEFORE the trim, so NBSP collapses to a space and
    // then trims away. Otherwise this would score as a wrong answer.
    expect(scoreBlank(' ', blank(['7']))).toBeNull();
  });
});

describe('unanswered is unscored, never wrong', () => {
  it('scores an empty blank null', () => {
    expect(scoreBlank('', blank(['7']))).toBeNull();
  });

  it('scores an unselected multiple choice null', () => {
    expect(scoreMultipleChoice([], ['a'])).toBeNull();
  });

  it('does not score an empty selection correct even when nothing is authored correct', () => {
    // The short-circuit ordering matters: set-equality alone would call
    // [] === [] a correct answer and award a mark for doing nothing.
    expect(scoreMultipleChoice([], [])).toBeNull();
  });

  it('scores a matching block with no pairs placed null', () => {
    expect(scoreMatching({}, { i1: 't1' }, ['i1']).verdict).toBeNull();
  });

  it('scores a matching block with all pairs WRONG as incorrect, not unanswered', () => {
    // The omission gate is "placed no pairs", not "earned nothing".
    const score = scoreMatching({ i1: 't2' }, { i1: 't1' }, ['i1']);
    expect(score.verdict).toBe(false);
    expect(score.earned).toBe(0);
  });
});

describe('numeric blanks', () => {
  const numeric = (answers: string[], tolerance = 0) =>
    blank(answers, { answerType: 'numeric', tolerance });

  it.each([
    ['3', 3],
    ['-2.5', -2.5],
    ['.75', 0.75],
    ['+4', 4],
    ['1e3', 1000],
    ['3/4', 0.75],
    ['-3/4', -0.75],
    ['1 1/2', 1.5],
    ['-2 3/4', -2.75],
    ['1,234.5', 1234.5],
    ['$3.50', 3.5],
  ])('parses %s the way a student writes it', (input, expected) => {
    expect(parseNumericValue(input)).toBeCloseTo(expected, 10);
  });

  it.each([['abc'], ['3/0'], ['1 1/0'], [''], ['--3']])(
    'refuses %s as a number',
    (input) => {
      expect(parseNumericValue(input)).toBeNull();
    },
  );

  it('accepts an equivalent fraction for a decimal key', () => {
    expect(scoreBlank('3/4', numeric(['0.75']))).toBe(true);
  });

  it('honours an absolute tolerance', () => {
    expect(scoreBlank('3.14', numeric(['3.14159'], 0.01))).toBe(true);
    expect(scoreBlank('3.1', numeric(['3.14159'], 0.01))).toBe(false);
  });

  it('absorbs float representation noise at exactly-zero tolerance', () => {
    // 0.1 + 0.2 !== 0.3 in binary floating point; the 1e-9 epsilon is why a
    // student who computes it correctly is not marked wrong.
    expect(scoreBlank(String(0.1 + 0.2), numeric(['0.3']))).toBe(true);
  });

  it('falls back to exact text for a non-numeric key entry like "no solution"', () => {
    expect(scoreBlank('no solution', numeric(['no solution']))).toBe(true);
    expect(scoreBlank('No Solution', numeric(['no solution']))).toBe(false);
  });

  it('normalizes a unicode minus before parsing', () => {
    expect(scoreBlank('−2.5', numeric(['-2.5']))).toBe(true);
  });

  it.each([
    [undefined, 0],
    [Number.NaN, 0],
    [-1, 0],
    [0.5, 0.5],
  ])('coerces a tolerance of %s to %s', (input, expected) => {
    expect(coerceTolerance(input)).toBe(expected);
  });

  it('compares within tolerance plus the epsilon', () => {
    expect(numericallyClose(1, 1.5, 0.5)).toBe(true);
    expect(numericallyClose(1, 1.6, 0.5)).toBe(false);
  });
});

describe('math blanks', () => {
  const math = (answers: string[], over: Partial<BlankKey> = {}) =>
    blank(answers, { answerType: 'math', ...over });

  it('accepts a value-equivalent rearrangement', () => {
    expect(scoreBlank('a+a', math(['2a']))).toBe(true);
  });

  it('rejects a non-equivalent expression', () => {
    expect(scoreBlank('3a', math(['2a']))).toBe(false);
  });

  it('demands the literal form under exact-form equivalence', () => {
    expect(
      scoreBlank('a+a', math(['2a'], { equivalence: 'exact-form' })),
    ).toBe(false);
    expect(
      scoreBlank('2a', math(['2a'], { equivalence: 'exact-form' })),
    ).toBe(true);
  });

  it('always returns a real verdict — the runtime null is a loading state the server never has', () => {
    // The client scores `null` while the math engine lazy-loads. Server-side
    // the engine is always present, so an answered math blank is never
    // unscored. This is strictly better, not a parity break.
    expect(scoreBlank('2a', math(['2a']))).not.toBeNull();
  });
});

describe('interchangeable blank groups', () => {
  it('groups maximal adjacent runs, and never lets the first blank continue one', () => {
    const keys = [
      blank(['1']),
      blank(['2'], { interchangeableWithPrevious: true }),
      blank(['3']),
      blank(['4'], { interchangeableWithPrevious: true }),
      blank(['5'], { interchangeableWithPrevious: true }),
    ];
    expect(groupBlanks(keys).map((g) => g.length)).toEqual([2, 3]);
  });

  it('starts a new group even when the FIRST blank carries the flag', () => {
    // A leading `interchangeableWithPrevious` has no previous to attach to.
    const keys = [blank(['1'], { interchangeableWithPrevious: true })];
    expect(groupBlanks(keys)).toHaveLength(1);
  });

  it('accepts either order within a group', () => {
    const group = [blank(['2']), blank(['3'], { interchangeableWithPrevious: true })];
    expect(scoreBlankGroup(group, ['2', '3'])).toEqual([true, true]);
    expect(scoreBlankGroup(group, ['3', '2'])).toEqual([true, true]);
  });

  it('consumes each answer once — a repeated answer only scores once', () => {
    const group = [blank(['2']), blank(['3'], { interchangeableWithPrevious: true })];
    expect(scoreBlankGroup(group, ['2', '2'])).toEqual([true, false]);
  });

  it('breaks duplicate ties by document order — the later one loses', () => {
    // Only the SECOND slot accepts '3', so of two identical answers exactly one
    // can be placed. The one that survives is the first in document order.
    const group = [blank(['2']), blank(['3'], { interchangeableWithPrevious: true })];
    expect(scoreBlankGroup(group, ['3', '3'])).toEqual([true, false]);
  });

  it('scores both when the duplicate genuinely has two homes', () => {
    // Contrast with the tie case above: here both slots accept '3', so two
    // '3's is a complete assignment and neither student answer is penalized.
    const group = [blank(['3']), blank(['3'], { interchangeableWithPrevious: true })];
    expect(scoreBlankGroup(group, ['3', '3'])).toEqual([true, true]);
  });

  it('respects each slot’s OWN answer list rather than pooling them', () => {
    const group = [
      blank(['x^3', 'x*x*x']),
      blank(['5x'], { interchangeableWithPrevious: true }),
    ];
    expect(scoreBlankGroup(group, ['5x', 'x*x*x'])).toEqual([true, true]);
  });

  it('leaves an empty group member unscored, not wrong', () => {
    const group = [blank(['3']), blank(['2'], { interchangeableWithPrevious: true })];
    expect(scoreBlankGroup(group, ['3', ''])).toEqual([true, null]);
    expect(scoreBlankGroup(group, ['', '2'])).toEqual([null, true]);
  });

  it('finds a complete assignment that a greedy pass would miss', () => {
    // Slot A accepts both 2 and 3; slot B accepts only 3. Offering "3" first,
    // a greedy matcher parks it in A and then has nowhere for "2", marking a
    // fully correct student half wrong. Augmentation displaces 3 into B.
    const group = [
      blank(['2', '3']),
      blank(['3'], { interchangeableWithPrevious: true }),
      blank(['2'], { interchangeableWithPrevious: true }),
    ];
    expect(scoreBlankGroup(group, ['3', '3', '2'])).toEqual([true, true, true]);
  });

  it('gives partial credit across a three-blank group', () => {
    const group = [
      blank(['2']),
      blank(['3'], { interchangeableWithPrevious: true }),
      blank(['5'], { interchangeableWithPrevious: true }),
    ];
    expect(scoreBlankGroup(group, ['2', '2', '5'])).toEqual([true, false, true]);
  });
});

describe('blank feedback selection (ruling 2.1A)', () => {
  const withFeedback = blank(['2x'], {
    mistakeFeedback: [
      { match: 'x2', feedback: ['did you mean 2x?'] },
      { match: '2', feedback: ['you dropped the variable'] },
    ],
    hint: ['combine like terms'],
  });

  it('matches a mistake entry case-insensitively, though scoring is case-sensitive', () => {
    // Deliberately looser than scoring: a student shouldn't lose targeted help
    // over capitalization, even though they can lose the mark for it.
    expect(matchMistakeFeedback('X2', withFeedback)).toEqual(['did you mean 2x?']);
  });

  it('trims before matching', () => {
    expect(matchMistakeFeedback('  x2  ', withFeedback)).toEqual([
      'did you mean 2x?',
    ]);
  });

  it('returns the FIRST matching entry', () => {
    const dup = blank(['z'], {
      mistakeFeedback: [
        { match: 'q', feedback: ['first'] },
        { match: 'q', feedback: ['second'] },
      ],
    });
    expect(matchMistakeFeedback('q', dup)).toEqual(['first']);
  });

  it('prefers targeted mistake feedback over the generic hint', () => {
    expect(selectBlankFeedback('x2', withFeedback, false)).toEqual([
      'did you mean 2x?',
    ]);
  });

  it('falls back to the hint when no mistake entry matches', () => {
    expect(selectBlankFeedback('zzz', withFeedback, false)).toEqual([
      'combine like terms',
    ]);
  });

  it('returns nothing for a hintless wrong answer — mark-only is the designed default', () => {
    expect(selectBlankFeedback('zzz', blank(['2x']), false)).toBeUndefined();
  });

  it('never attaches feedback to a CORRECT answer', () => {
    // A stale "you probably forgot to distribute" after the student fixes
    // their answer is worse than silence.
    expect(selectBlankFeedback('2x', withFeedback, true)).toBeUndefined();
  });

  it('never attaches feedback to an unanswered blank', () => {
    expect(selectBlankFeedback('', withFeedback, null)).toBeUndefined();
  });
});

describe('multiple choice', () => {
  it('requires the exact set, order-free', () => {
    expect(scoreMultipleChoice(['b', 'a'], ['a', 'b'])).toBe(true);
  });

  it('gives no partial credit for a subset of a multi-select', () => {
    expect(scoreMultipleChoice(['a'], ['a', 'b'])).toBe(false);
  });

  it('rejects a superset', () => {
    expect(scoreMultipleChoice(['a', 'b', 'c'], ['a', 'b'])).toBe(false);
  });

  it('returns feedback only for the choices the student actually picked', () => {
    // Returning an unselected choice's feedback would hand over the answer.
    const choices = [
      { id: 'a', feedback: ['picked a'] },
      { id: 'b', feedback: ['picked b'] },
      { id: 'c' },
    ];
    const out = selectChoiceFeedback(['a'], choices);
    expect([...out.keys()]).toEqual(['a']);
  });

  it('still returns feedback for a selected CORRECT choice', () => {
    const out = selectChoiceFeedback(['a'], [{ id: 'a', feedback: ['nice'] }]);
    expect(out.get('a')).toEqual(['nice']);
  });
});

describe('matching', () => {
  const key = { i1: 't1', i2: 't2' };
  const items = ['i1', 'i2'];

  it('carries partial credit in earned/total while the verdict stays all-or-nothing', () => {
    const score = scoreMatching({ i1: 't1', i2: 't1' }, key, items);
    expect(score).toEqual({ verdict: false, earned: 1, total: 2 });
  });

  it('marks a fully correct block correct', () => {
    expect(scoreMatching(key, key, items).verdict).toBe(true);
  });

  it('counts the full item list in the denominator even when pairs are missing', () => {
    const score = scoreMatching({ i1: 't1' }, key, items);
    expect(score).toEqual({ verdict: false, earned: 1, total: 2 });
  });

  it('ignores a pair naming an item that is not in the block', () => {
    // A malformed payload must not be able to inflate the score or the total.
    const score = scoreMatching({ i1: 't1', ghost: 't9' }, key, items);
    expect(score).toEqual({ verdict: false, earned: 1, total: 2 });
  });

  it('never awards a point for an item the author left out of the key', () => {
    const partialKey = { i1: 't1' };
    const score = scoreMatching({ i1: 't1', i2: 't2' }, partialKey, items);
    expect(score.earned).toBe(1);
    expect(score.verdict).toBe(false);
  });
});

describe('ordering', () => {
  const authored = ['a', 'b', 'c'];
  const served = ['c', 'a', 'b'];

  it('marks the authored sequence correct', () => {
    expect(scoreOrdering(authored, authored, served)).toBe(true);
  });

  it('marks any other arrangement wrong', () => {
    expect(scoreOrdering(['b', 'a', 'c'], authored, served)).toBe(false);
  });

  it('treats an untouched list as unanswered, not as an answer', () => {
    // The student never dragged anything; the sequence is just the shuffle we
    // handed them, so it is not a claim about the answer.
    expect(scoreOrdering(served, authored, served)).toBeNull();
  });

  it('still lets a student answer correctly when the shuffle happened to be the authored order', () => {
    // Guard against making such a block permanently unscoreable: if served ===
    // authored, submitting it is a real (and correct) answer.
    expect(scoreOrdering(authored, authored, authored)).toBe(true);
  });

  it('rejects a submission of the wrong length', () => {
    expect(scoreOrdering(['a', 'b'], authored, served)).toBe(false);
  });
});

describe('expression guards (ruling S4-B3)', () => {
  const math = (answers: string[]) =>
    blank(answers, { answerType: 'math' });

  it('accepts an ordinary algebra answer', () => {
    expect(checkExpressionSafety('2x + 3(x - 1)^2').ok).toBe(true);
  });

  it('accepts a long-but-legitimate polynomial', () => {
    const poly = Array.from({ length: 20 }, (_, i) => `${i}x^2`).join(' + ');
    expect(checkExpressionSafety(poly).ok).toBe(true);
  });

  it('refuses an exponent tower — the cheapest tiny compute bomb', () => {
    // 30 bytes, astronomically expensive. A request SIZE cap cannot catch it.
    const check = checkExpressionSafety('9^9^9^9^9^9');
    expect(check.ok).toBe(false);
    expect(check.ok === false && check.reason).toBe('exponent_tower');
  });

  it('refuses an over-long expression', () => {
    const check = checkExpressionSafety('1+'.repeat(200));
    expect(check.ok).toBe(false);
  });

  it('refuses deep nesting', () => {
    const check = checkExpressionSafety('('.repeat(40) + '1' + ')'.repeat(40));
    expect(check.ok).toBe(false);
  });

  it('refuses unbalanced brackets without letting the parser find out 56 times', () => {
    expect(checkExpressionSafety('(1+2').ok).toBe(false);
    expect(checkExpressionSafety('1+2)').ok).toBe(false);
  });

  it('scores a rejected expression WRONG rather than failing the section', () => {
    // The student gets an ordinary incorrect mark. Raising here would take
    // down the check for every other question in their section too.
    expect(scoreBlank('9^9^9^9^9^9', math(['2a']))).toBe(false);
  });

  it('still grades a legitimate answer that merely looks big', () => {
    expect(scoreBlank('2^10', math(['1024']))).toBe(true);
  });
});
