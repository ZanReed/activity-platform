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
import { substituteSeededAnswers } from '../src/print/seededPrint.js';
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

// A `sample` inside an aggregate key (the stress test's question 72,
// 2026-11-20). The engine is mathjs/number — no arrays — so until the
// argument-list binding the key `mean(scores)` stayed the TEXT
// "mean([62,88,…])" and no student's number could ever match it.
describe('seeded aggregate keys (sample inside mean / max / min)', () => {
  const VARS: SeedVar[] = [{ name: 'scores', spec: { kind: 'sample', n: 8, min: 55, max: 99 } }];
  function doc(): Record<string, unknown> {
    return {
      schemaVersion: 2,
      meta: { title: 'T', seedVars: VARS },
      sections: [{
        id: SECTION, title: 'S',
        rows: [{ id: 'r1', columns: [{ id: 'c1', blocks: [{
          id: 'fib-agg', type: 'fill_in_blank',
          content: [
            { type: 'text', text: 'Scores {scores}. Mean ' },
            { type: 'blank', id: 'b-mean', answer: 'mean(scores)', answerType: 'numeric', tolerance: 0.01, width: 6 },
            { type: 'text', text: ' range ' },
            { type: 'blank', id: 'b-range', answer: 'max(scores) - min(scores)', answerType: 'numeric', width: 6 },
          ],
        }] }] }],
      }],
    };
  }
  function own(studentId: string) {
    const s = deriveSeedValues(VARS, serveSeed(VERSION, studentId)).scores as number[];
    return { mean: s.reduce((x, y) => x + y, 0) / s.length, range: Math.max(...s) - Math.min(...s) };
  }
  function grade(studentId: string, blanks: Record<string, string>) {
    const values = deriveSeedValues(VARS, serveSeed(VERSION, studentId));
    return gradeSection({
      document: substituteSeedValues(doc(), values) as never,
      sectionId: SECTION,
      responses: { ...emptySectionResponses(), blanks },
      seedValues: values,
    });
  }

  it('grades a student CORRECT on their own mean (to 2 d.p.) and range, WRONG on another’s', () => {
    const a = own('student-alpha');
    const b = own('student-bravo');
    expect(a.mean).not.toBeCloseTo(b.mean, 1); // precondition, not luck
    const r = grade('student-alpha', { 'b-mean': a.mean.toFixed(2), 'b-range': String(a.range) });
    expect(r.items['b-mean']?.verdict).toBe('correct');
    expect(r.items['b-range']?.verdict).toBe('correct');
    const x = grade('student-alpha', { 'b-mean': b.mean.toFixed(2) });
    expect(x.items['b-mean']?.verdict).toBe('incorrect');
  });
});

describe('a spelled list value grades numerically (1.50 = 1.5)', () => {
  it('accepts either spelling of the student’s own value', () => {
    const VARS: SeedVar[] = [{ name: 'p', spec: { kind: 'list', values: [1.5], text: ['1.50'] } }];
    const values = deriveSeedValues(VARS, serveSeed(VERSION, 'student-alpha'));
    const d = {
      schemaVersion: 2,
      meta: { title: 'T', seedVars: VARS },
      sections: [{ id: SECTION, title: 'S', rows: [{ id: 'r1', columns: [{ id: 'c1', blocks: [{
        id: 'fib-p', type: 'fill_in_blank',
        content: [
          { type: 'text', text: 'Pens at ${p}. Two cost ' },
          { type: 'blank', id: 'b-two', answer: '2*p', answerType: 'numeric', width: 6 },
          { type: 'text', text: ' one costs ' },
          { type: 'blank', id: 'b-one', answer: 'p', answerType: 'numeric', width: 6 },
        ],
      }] }] }] }],
    };
    for (const one of ['1.50', '1.5']) {
      const r = gradeSection({
        document: substituteSeedValues(d, values) as never,
        sectionId: SECTION,
        responses: { ...emptySectionResponses(), blanks: { 'b-two': '3.00', 'b-one': one } },
        seedValues: values,
      });
      expect(r.items['b-two']?.verdict).toBe('correct');
      expect(r.items['b-one']?.verdict, one).toBe('correct');
    }
  });
});

// The rest of the reserved aggregates (2026-11-20): median, mode, sum, std and
// variance were reserved names the engine lacked, so a key over them never
// evaluated and no student could be marked right. A HAND-PICKED dataset with
// an even count and a two-way tie pins the definitions a Year 7–10 class uses
// (a derived `sample` is all-distinct, so it cannot reach the mode rule):
//   data 4, 7, 7, 2, 2, 9 → sorted 2, 2, 4, 7, 7, 9
//   median (4 + 7) / 2 = 5.5 · mode 2 (2 and 7 tie; the smaller) · sum 31
//   variance, POPULATION 257/36 ≈ 7.139 (the sample form would be 8.567)
//   std, POPULATION √257 / 6 ≈ 2.672 (the sample form would be 2.927)
describe('seeded aggregate keys (median, mode, sum, std, variance)', () => {
  const DATA = { scores: [4, 7, 7, 2, 2, 9] };
  type B = { id: string; answer: string; answerType: 'numeric' | 'math'; tolerance?: number; equivalence?: 'form' };
  function grade(blanks: B[], typed: Record<string, string>, values: Record<string, number[]> = DATA) {
    const d = {
      schemaVersion: 2,
      meta: { title: 'T', seedVars: [{ name: 'scores', spec: { kind: 'sample', n: 6, min: 1, max: 9 } }] },
      sections: [{ id: SECTION, title: 'S', rows: [{ id: 'r1', columns: [{ id: 'c1', blocks: [{
        id: 'fib-stats', type: 'fill_in_blank',
        content: [
          { type: 'text', text: 'Scores {scores}. ' },
          ...blanks.map((b) => ({ type: 'blank', width: 6, ...b })),
        ],
      }] }] }] }],
    };
    return gradeSection({
      document: substituteSeedValues(d, values) as never,
      sectionId: SECTION,
      responses: { ...emptySectionResponses(), blanks: typed },
      seedValues: values,
    }).items;
  }
  const NUMERIC: B[] = [
    { id: 'med', answer: 'median(scores)', answerType: 'numeric' },
    { id: 'mode', answer: 'mode(scores)', answerType: 'numeric' },
    { id: 'sum', answer: 'sum(scores)', answerType: 'numeric' },
    { id: 'var', answer: 'variance(scores)', answerType: 'numeric', tolerance: 0.01 },
    { id: 'std', answer: 'std(scores)', answerType: 'numeric', tolerance: 0.01 },
  ];

  it('marks the school answer CORRECT in a numeric blank', () => {
    const r = grade(NUMERIC, { med: '5.5', mode: '2', sum: '31', var: '7.14', std: '2.67' });
    for (const id of ['med', 'mode', 'sum', 'var', 'std']) expect(r[id]?.verdict, id).toBe('correct');
  });

  it('marks the near-miss readings WRONG: lower middle, larger mode, the n − 1 forms', () => {
    const r = grade(NUMERIC, { med: '4', mode: '7', sum: '30', var: '8.57', std: '2.93' });
    for (const id of ['med', 'mode', 'sum', 'var', 'std']) expect(r[id]?.verdict, id).toBe('incorrect');
  });

  it('an odd count takes the middle value', () => {
    const r = grade([NUMERIC[0]!], { med: '7' }, { scores: [9, 1, 7, 8, 2] });
    expect(r.med?.verdict).toBe('correct');
  });

  it('a DERIVED even-count sample grades each student on their own median', () => {
    const VARS: SeedVar[] = [{ name: 'scores', spec: { kind: 'sample', n: 8, min: 55, max: 99 } }];
    const median = (id: string) => {
      const s = [...(deriveSeedValues(VARS, serveSeed(VERSION, id)).scores as number[])].sort((x, y) => x - y);
      return (s[3]! + s[4]!) / 2;
    };
    const a = median('student-alpha');
    const b = median('student-bravo');
    expect(a).not.toBe(b); // precondition, not luck
    const values = deriveSeedValues(VARS, serveSeed(VERSION, 'student-alpha')) as Record<string, number[]>;
    expect(grade([NUMERIC[0]!], { med: String(a) }, values).med?.verdict).toBe('correct');
    expect(grade([NUMERIC[0]!], { med: String(b) }, values).med?.verdict).toBe('incorrect');
  });

  it('a MATH (==) blank evaluates a sample aggregate too', () => {
    const MATH: B[] = [
      { id: 'med', answer: 'median(scores)', answerType: 'math' },
      { id: 'range', answer: 'max(scores) - min(scores)', answerType: 'math' },
      { id: 'form', answer: 'median(scores)', answerType: 'math', equivalence: 'form' },
      { id: 'lin', answer: 'sum(scores)*x', answerType: 'math' },
    ];
    const r = grade(MATH, { med: '11/2', range: '7', form: '5.5', lin: '31x' });
    for (const id of ['med', 'range', 'form', 'lin']) expect(r[id]?.verdict, id).toBe('correct');
    const w = grade(MATH, { med: '4', range: '9', form: '4', lin: '30x' });
    for (const id of ['med', 'range', 'form', 'lin']) expect(w[id]?.verdict, id).toBe('incorrect');
  });

  it('the teacher’s answer key PRINTS the numbers, not the expressions', () => {
    const blanks = [
      { type: 'blank', answer: 'median(scores)', answerType: 'numeric' },
      { type: 'blank', answer: 'mode(scores)', answerType: 'numeric' },
      { type: 'blank', answer: 'sum(scores)', answerType: 'numeric' },
      { type: 'blank', answer: 'variance(scores)', answerType: 'numeric' },
      { type: 'blank', answer: 'std(scores)', answerType: 'numeric' },
      { type: 'blank', answer: 'median(scores)', answerType: 'math' },
      { type: 'blank', answer: 'mean(scores)', answerType: 'math', equivalence: 'form' },
    ];
    const out = substituteSeededAnswers({ content: blanks }, DATA) as { content: Array<{ answer: string }> };
    expect(out.content.map((b) => b.answer)).toEqual([
      '5.5', '2', '31', String(Number((257 / 36).toPrecision(15))), String(Number((Math.sqrt(257) / 6).toPrecision(15))),
      '5.5', String(Number((31 / 6).toPrecision(15))),
    ]);
  });
});
