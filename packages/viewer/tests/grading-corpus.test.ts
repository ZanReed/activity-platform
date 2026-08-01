// =============================================================================
// grading-corpus.test.ts — the golden corpus against the SERVER engine (S4)
// -----------------------------------------------------------------------------
// One half of the parity gate. This runs every corpus case through the server
// grading engine and asserts the mark the corpus says a student should get.
// The other half lives in packages/renderer/tests/grading-parity.test.ts, which
// runs the SAME cases through the published-page runtime by rendering each case
// with the real renderer and scoring the resulting DOM.
//
// Both halves check against the corpus's own `expect` column rather than
// against each other. Two engines can agree and both be wrong — and since this
// engine was ported by READING the runtime, a misreading would be reproduced
// identically in any test I hand-wrote for it. The expected column is the part
// a human reviews independently.
//
// This half survives S9: when the renderer and its runtime retire, the parity
// half is deleted and these become the engine's permanent regression pins.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  BLANK_CASES,
  CHOICE_CASES,
  CORPUS_COVERAGE,
  MATCHING_CASES,
  ORDERING_CASES,
  type ExpectedVerdict,
} from '../src/server/grading/corpus.js';
import { blockRegistry, registeredBlockTypes } from '../src/registry/registry.js';
import {
  groupBlanks,
  scoreBlank,
  scoreBlankGroup,
  type BlankKey,
} from '../src/server/grading/blanks.js';
import {
  scoreMatching,
  scoreMultipleChoice,
  scoreOrdering,
} from '../src/server/grading/choices.js';

/** boolean | null → the corpus's vocabulary. null means "no mark shown". */
function verdictOf(value: boolean | null): ExpectedVerdict {
  if (value === null) return 'unscored';
  return value ? 'correct' : 'incorrect';
}

function toKey(
  partial: Partial<BlankKey> & { answers: string[] },
  index: number,
): BlankKey {
  return {
    id: `b${index}`,
    answerType: 'text',
    tolerance: 0,
    equivalence: 'value',
    mistakeFeedback: [],
    hint: undefined,
    interchangeableWithPrevious: false,
    ...partial,
  };
}

describe('golden corpus — blanks', () => {
  it.each(BLANK_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    const keys = testCase.blanks.map(toKey);
    const groups = groupBlanks(keys);

    // Score exactly the way gradeSection does: solo blanks individually,
    // interchangeable runs through the consume-once matcher.
    const actual: ExpectedVerdict[] = [];
    let offset = 0;
    for (const group of groups) {
      const typed = testCase.typed.slice(offset, offset + group.length);
      const results =
        group.length === 1
          ? [scoreBlank(typed[0] ?? '', group[0]!)]
          : scoreBlankGroup(group, typed);
      for (const r of results) actual.push(verdictOf(r));
      offset += group.length;
    }

    expect(actual).toEqual(testCase.expect);
  });
});

describe('golden corpus — multiple choice', () => {
  it.each(CHOICE_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    const correctIds = testCase.choices.filter((c) => c.correct).map((c) => c.id);
    expect(verdictOf(scoreMultipleChoice(testCase.selected, correctIds))).toBe(
      testCase.expect,
    );
  });
});

describe('golden corpus — matching', () => {
  it.each(MATCHING_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    const score = scoreMatching(testCase.pairs, testCase.key, testCase.itemIds);
    expect(verdictOf(score.verdict)).toBe(testCase.expect);
    // earned/total carry the partial credit the block verdict discards.
    expect(score.earned).toBe(testCase.expectEarned);
    expect(score.total).toBe(testCase.expectTotal);
  });
});

describe('golden corpus — ordering', () => {
  it.each(ORDERING_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    expect(
      verdictOf(
        scoreOrdering(
          testCase.submitted,
          testCase.authoredOrder,
          testCase.servedOrder,
        ),
      ),
    ).toBe(testCase.expect);
  });
});

describe('the corpus itself is well-formed', () => {
  // A corpus with a malformed case is worse than a missing one: it looks like
  // coverage and asserts nothing.
  it('gives every blank case one expectation per blank', () => {
    for (const c of BLANK_CASES) {
      expect(c.typed.length, c.name).toBe(c.blanks.length);
      expect(c.expect.length, c.name).toBe(c.blanks.length);
      if (c.runtimeDiffers) {
        expect(c.runtimeDiffers.runtimeExpect.length, c.name).toBe(c.blanks.length);
      }
    }
  });

  it('declares a reason for every intentional divergence', () => {
    for (const c of BLANK_CASES) {
      if (!c.runtimeDiffers) continue;
      // An undocumented difference is indistinguishable from a bug.
      expect(c.runtimeDiffers.because.length, c.name).toBeGreaterThan(20);
      expect(c.runtimeDiffers.runtimeExpect, c.name).not.toEqual(c.expect);
    }
  });

  it('covers every answerType and both equivalence modes', () => {
    const types = new Set(
      BLANK_CASES.flatMap((c) => c.blanks.map((b) => b.answerType ?? 'text')),
    );
    expect(types).toEqual(new Set(['text', 'numeric', 'math']));
    const modes = new Set(
      BLANK_CASES.flatMap((c) => c.blanks.map((b) => b.equivalence ?? 'value')),
    );
    expect(modes).toEqual(new Set(['value', 'exact-form']));
  });

  it('covers the unscored outcome in every family that can produce it', () => {
    // The omission rule is the one most likely to be "tidied" into a wrong
    // answer, so every family that has one must exercise it.
    expect(BLANK_CASES.some((c) => c.expect.includes('unscored'))).toBe(true);
    expect(CHOICE_CASES.some((c) => c.expect === 'unscored')).toBe(true);
    expect(MATCHING_CASES.some((c) => c.expect === 'unscored')).toBe(true);
    expect(ORDERING_CASES.some((c) => c.expect === 'unscored')).toBe(true);
  });
});

describe('completeness against the registry (ruling S4-8)', () => {
  const autoGradable = registeredBlockTypes.filter(
    (type) => blockRegistry[type]?.family === 'auto_gradable',
  );

  it('has auto-gradable types to check', () => {
    expect(autoGradable.length).toBeGreaterThan(0);
  });

  it.each(autoGradable)(
    'declares how %s is proven — a new gradable block cannot ship uncovered',
    (type) => {
      const entry = CORPUS_COVERAGE[type];
      expect(
        entry,
        `${type} is auto_gradable but absent from CORPUS_COVERAGE. Add corpus ` +
          `cases for it, or declare why an existing scorer already covers it. ` +
          `"Not covered" is not an option — see docs/design/checked-state-families.md.`,
      ).toBeDefined();
      // A justification that says nothing is the same as no justification.
      expect(entry!.why.length, type).toBeGreaterThan(30);
    },
  );

  it('does not claim coverage for a type the registry does not gradeable-ly declare', () => {
    // Catches the reverse drift: a type demoted out of auto_gradable while its
    // coverage claim lingers, making the corpus look broader than it is.
    for (const type of Object.keys(CORPUS_COVERAGE)) {
      expect(autoGradable, `${type} claims coverage but is not auto_gradable`).toContain(
        type,
      );
    }
  });

  it('backs every "cases" claim with actual cases', () => {
    const caseCounts: Record<string, number> = {
      fill_in_blank: BLANK_CASES.length,
      multiple_choice: CHOICE_CASES.length,
      matching: MATCHING_CASES.length,
      ordering: ORDERING_CASES.length,
    };
    for (const [type, entry] of Object.entries(CORPUS_COVERAGE)) {
      if (entry.how !== 'cases') continue;
      expect(caseCounts[type] ?? 0, `${type} claims cases but has none`).toBeGreaterThan(3);
    }
  });
});
