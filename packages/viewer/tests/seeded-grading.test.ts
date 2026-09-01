// =============================================================================
// seeded-grading.test.ts — the D8 determinism guard (wishlist #6)
// -----------------------------------------------------------------------------
// The two-spellings-drift bug class, pinned from day one: grade the SAME
// stored document as two students and assert (a) their served values differ,
// (b) each student grades CORRECT against their own values and WRONG against
// the other's. A drift between the serve derivation and the grade derivation
// — one spelling of the seed changing, one PRNG copy diverging — turns every
// seeded activity into systematic mis-grading, which is close to
// undiagnosable from a bug report.
//
// This test drives the same modules the two Edge Functions bundle
// (deriveSeedValues / substituteSeedValues / gradeSection): the walk level of
// D8. The handler glue on each side has its own pin in the two handler
// suites.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { serveSeed } from '../src/sanitize/serveSeed.js';
import { deriveSeedValues } from '../src/sanitize/seedValues.js';
import { substituteSeedValues } from '../src/sanitize/substitute.js';
import { gradeSection } from '../src/server/grading/index.js';
import { emptySectionResponses } from '../src/check/wire.js';
import type { SeedVar } from '@activity/schema';

const VERSION = 'aaaaaaaa-bbbb-4ccc-9ddd-eeeeeeeeeeee';
const SECTION = 's1';
const BLANK = 'b-seeded';
const MATH_BLANK = 'b-math';
const SEED_VARS: SeedVar[] = [
  { name: 'a', spec: { kind: 'int', min: 2, max: 9 } },
  { name: 'p', spec: { kind: 'list', values: [1.5, 1.75, 2.25, 2.5] } },
];

/** The stored TEMPLATE: one numeric blank keyed by the expression a*p, one
 * math blank keyed by a seeded coefficient expression. */
function storedDoc(): Record<string, unknown> {
  return {
    schemaVersion: 2,
    meta: { title: 'T', seedVars: SEED_VARS },
    sections: [
      {
        id: SECTION,
        title: 'Section',
        rows: [
          {
            id: 'r1',
            columns: [
              {
                id: 'c1',
                blocks: [
                  {
                    id: 'fib-1',
                    type: 'fill_in_blank',
                    content: [
                      { type: 'text', text: 'You buy {a} pens at ${p}. Total: ' },
                      {
                        type: 'blank',
                        id: BLANK,
                        answer: 'a*p',
                        answerType: 'numeric',
                        tolerance: 0.001,
                        width: 8,
                      },
                      { type: 'text', text: ' Slope form: ' },
                      {
                        type: 'blank',
                        id: MATH_BLANK,
                        answer: 'a*x + p',
                        answerType: 'math',
                        width: 10,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function gradeAs(studentId: string, blanks: Record<string, string>) {
  const doc = storedDoc();
  const values = deriveSeedValues(SEED_VARS, serveSeed(VERSION, studentId));
  const graded = substituteSeedValues(doc, values);
  return gradeSection({
    document: graded as never,
    sectionId: SECTION,
    responses: { ...emptySectionResponses(), blanks },
    seedValues: values,
  });
}

function ownAnswers(studentId: string) {
  const v = deriveSeedValues(SEED_VARS, serveSeed(VERSION, studentId));
  const a = v.a as number;
  const p = v.p as number;
  return {
    values: v,
    numeric: String(a * p),
    math: `${a}x + ${p}`,
  };
}

describe('D8 — seeded grading determinism (two students, one document)', () => {
  // Chosen so the two assignments actually differ (checked below, not assumed).
  const A = 'student-alpha';
  const B = 'student-bravo';

  it('the two students are served different values (precondition, not luck)', () => {
    const va = ownAnswers(A).values;
    const vb = ownAnswers(B).values;
    expect(va).not.toEqual(vb);
    // And specifically the product differs — otherwise the cross-grading
    // assertions below would be vacuous.
    expect((va.a as number) * (va.p as number)).not.toBe(
      (vb.a as number) * (vb.p as number),
    );
  });

  it('each student grades CORRECT against their own numeric value', () => {
    for (const student of [A, B]) {
      const own = ownAnswers(student);
      const result = gradeAs(student, { [BLANK]: own.numeric });
      expect(result.items[BLANK]?.verdict, `${student} own value`).toBe('correct');
    }
  });

  it("each student grades WRONG against the OTHER student's value", () => {
    const result = gradeAs(A, { [BLANK]: ownAnswers(B).numeric });
    expect(result.items[BLANK]?.verdict).toBe('incorrect');
    const reverse = gradeAs(B, { [BLANK]: ownAnswers(A).numeric });
    expect(reverse.items[BLANK]?.verdict).toBe('incorrect');
  });

  it('a seeded MATH key binds before equivalence (R6): own form correct, other wrong', () => {
    const own = ownAnswers(A);
    expect(gradeAs(A, { [MATH_BLANK]: own.math }).items[MATH_BLANK]?.verdict).toBe(
      'correct',
    );
    expect(
      gradeAs(A, { [MATH_BLANK]: ownAnswers(B).math }).items[MATH_BLANK]?.verdict,
    ).toBe('incorrect');
  });

  it('reload determinism: the same student always derives the same values', () => {
    expect(ownAnswers(A).values).toEqual(ownAnswers(A).values);
  });
});
