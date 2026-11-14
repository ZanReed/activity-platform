// =============================================================================
// grading-form.test.ts — form grading in the grader (form-grading.md step 2)
// -----------------------------------------------------------------------------
// FG-4 (mistake matching by meaning), FG-5 (precedence + the built-in line),
// FG-14 (a bounded-out value does no further work), the `~` group rule, the
// walk's projection of 'form' / retired 'exact-form', and the schema + upgrade
// half of FG-8. Verdict-only rows live in the golden corpus (corpus.ts).
// =============================================================================

import { describe, expect, it, vi } from 'vitest';

// Spy on the engine (FG-14): a value that trips the bound must reach it NEVER.
vi.mock('@activity/graph-kit/scorers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@activity/graph-kit/scorers')>();
  return { ...mod, mathEquivalent: vi.fn(mod.mathEquivalent) };
});

import { mathEquivalent } from '@activity/graph-kit/scorers';
import { upgradeActivityDocument, retireExactForm, BlankToken, MathPrompt } from '@activity/schema';
import {
  FORM_WRONG_LINE,
  scoreBlank,
  scoreBlankGroup,
  selectBlankOutcome,
  type BlankKey,
} from '../src/server/grading/blanks.js';
import { evaluateSeededKeys } from '../src/server/grading/seededKeys.js';

const text = (t: string): unknown[] => [{ type: 'text', text: t }];
const mis = (match: string, message: string | null, id?: string): BlankKey['mistakeFeedback'][number] => ({
  match,
  feedback: message === null ? [] : text(message),
  ...(id ? { misconceptionId: id } : {}),
});

function key(answers: string[], over: Partial<BlankKey> = {}): BlankKey {
  return {
    id: 'b1',
    answers,
    answerType: 'math',
    tolerance: 0,
    equivalence: 'form',
    mistakeFeedback: [],
    hint: undefined,
    interchangeableWithPrevious: false,
    ...over,
  };
}

/** Score + outcome in one, the way gradeSection does it. */
function grade(raw: string, k: BlankKey) {
  const verdict = scoreBlank(raw, k);
  return { verdict, ...selectBlankOutcome(raw, k, verdict) };
}

const BUILT_IN = text(FORM_WRONG_LINE);

describe('D60 acceptance table, through the grader (verdict, message, mis.*)', () => {
  it('Factorise 18x − 12: mis.factorise.not-highest fires on 2(9x − 6) in any order', () => {
    const k = key(['6(3x-2)'], {
      mistakeFeedback: [mis('2(9x-6)', 'Take out the HIGHEST common factor.', 'mis.factorise.not-highest')],
    });
    expect(grade('6(3x − 2)', k)).toEqual({ verdict: true });
    for (const typed of ['2(9x-6)', '2(9x - 6)', '(9x-6)*2', '−2(6−9x)']) {
      expect({ typed, ...grade(typed, k) }).toEqual({
        typed,
        verdict: false,
        feedback: text('Take out the HIGHEST common factor.'),
        misconceptionId: 'mis.factorise.not-highest',
      });
    }
    expect(grade('18x − 12', k)).toEqual({ verdict: false, feedback: BUILT_IN });
    expect(grade('5x', k)).toEqual({ verdict: false });
  });

  it('Simplify 4a × 3b: mis.terms.coefficients-added on 7ab (and 7ba)', () => {
    const k = key(['12ab'], { mistakeFeedback: [mis('7ab', null, 'mis.terms.coefficients-added')] });
    expect(grade('12ba', k)).toEqual({ verdict: true });
    expect(grade('7ba', k)).toEqual({ verdict: false, misconceptionId: 'mis.terms.coefficients-added' });
    expect(grade('4a×3b', k)).toEqual({ verdict: false, feedback: BUILT_IN });
  });

  it('Expand −2(3x − 5): mis.expand.negative-sign-dropped', () => {
    const k = key(['-6x+10'], { mistakeFeedback: [mis('-6x-10', null, 'mis.expand.negative-sign-dropped')] });
    expect(grade('10 − 6x', k)).toEqual({ verdict: true });
    expect(grade('−6x − 10', k)).toEqual({ verdict: false, misconceptionId: 'mis.expand.negative-sign-dropped' });
    expect(grade('-10-6x', k)).toEqual({ verdict: false, misconceptionId: 'mis.expand.negative-sign-dropped' });
  });

  it('Simplest form of 4/6', () => {
    const k = key(['2/3']);
    expect(grade('2/3', k)).toEqual({ verdict: true });
    expect(grade('4/6', k)).toEqual({ verdict: false, feedback: BUILT_IN });
  });
});

describe('FG-5 precedence', () => {
  const formWrong = mis('form-wrong', 'Write it as one product.', 'mis.form.not-product');

  it('!form-wrong fires only on a right value in the wrong form', () => {
    const k = key(['6(3x-2)'], { mistakeFeedback: [formWrong] });
    expect(grade('18x-12', k)).toEqual({
      verdict: false,
      feedback: text('Write it as one product.'),
      misconceptionId: 'mis.form.not-product',
    });
    expect(grade('18x-11', k)).toEqual({ verdict: false });
  });

  it('a typed "form-wrong" never summons the reserved entry', () => {
    const k = key(['6(3x-2)'], { mistakeFeedback: [formWrong] });
    expect(grade('form-wrong', k)).toEqual({ verdict: false });
    expect(grade('FORM-WRONG', k)).toEqual({ verdict: false });
  });

  it('a matching ! entry outranks !form-wrong, even one with no prose', () => {
    const k = key(['6(3x-2)'], {
      mistakeFeedback: [mis('2(9x-6)', null, 'mis.factorise.not-highest'), formWrong],
      hint: text('Look for the largest factor.'),
    });
    expect(grade('2(9x-6)', k)).toEqual({
      verdict: false,
      feedback: text('Look for the largest factor.'),
      misconceptionId: 'mis.factorise.not-highest',
    });
  });

  it('!form-wrong outranks the hint; the hint outranks the built-in line', () => {
    const withBoth = key(['6(3x-2)'], { mistakeFeedback: [formWrong], hint: text('hint') });
    expect(grade('18x-12', withBoth).feedback).toEqual(text('Write it as one product.'));
    const hintOnly = key(['6(3x-2)'], { hint: text('hint') });
    expect(grade('18x-12', hintOnly).feedback).toEqual(text('hint'));
  });

  it('a prose-less !form-wrong keeps its mis.* and the student still gets the built-in line', () => {
    const k = key(['6(3x-2)'], { mistakeFeedback: [mis('form-wrong', null, 'mis.form.x')] });
    expect(grade('18x-12', k)).toEqual({ verdict: false, feedback: BUILT_IN, misconceptionId: 'mis.form.x' });
  });

  it('a VALUE blank never shows the built-in line (2.1A mark-only stands there)', () => {
    const k = key(['6(3x-2)'], { equivalence: 'value' });
    expect(grade('18x-11', k)).toEqual({ verdict: false });
  });
});

describe('FG-4 on a VALUE math blank: a ! entry matches by value', () => {
  it('any equal spelling of the mistake is the mistake', () => {
    const k = key(['x^2+2x'], { equivalence: 'value', mistakeFeedback: [mis('x^2+2', 'Multiply both terms.', 'mis.a')] });
    expect(grade('2 + x^2', k)).toEqual({ verdict: false, feedback: text('Multiply both terms.'), misconceptionId: 'mis.a' });
  });
  it('the string pass stays the fallback: a case-only match, a non-math entry', () => {
    const caseOnly = key(['y'], { equivalence: 'value', mistakeFeedback: [mis('X', 'not x', 'mis.case')] });
    expect(grade('x', caseOnly).misconceptionId).toBe('mis.case');
    const words = key(['2'], { equivalence: 'value', mistakeFeedback: [mis('no solution', 'There is one.')] });
    expect(grade('no solution', words).feedback).toEqual(text('There is one.'));
  });
  it('seeded math mistakes light up (the bound string is no longer what must be typed)', () => {
    const k = key(['g*x'], { equivalence: 'value', mistakeFeedback: [mis('(g+1)*x', null, 'mis.seeded')] });
    const [resolved] = evaluateSeededKeys([k], { g: 3 });
    expect(resolved?.answers[0]).toBe('(3)*x');
    expect(grade('4x', resolved!).misconceptionId).toBe('mis.seeded');
    expect(grade('3x', resolved!).verdict).toBe(true);
  });
});

describe('FG-6 seeded form keys through the grader', () => {
  const rows: Array<[string, Record<string, number>, string, string]> = [
    ['g*(p*x - q)', { g: 6, p: 3, q: 2 }, '6(3x-2)', '18x-12'],
    ['(c*d)ab', { c: 4, d: 3 }, '12ab', '4a*3b'],
    ['(-g*p)x + g*q', { g: 6, p: 3, q: 2 }, '-18x + 12', '-6(3x-2)'],
    ['p/q', { p: 2, q: 3 }, '2/3', '4/6'],
  ];
  it.each(rows)('%s with %j: %s is right, %s is wrong form', (expr, values, right, wrongForm) => {
    const [resolved] = evaluateSeededKeys([key([expr])], values);
    expect(grade(right, resolved!)).toEqual({ verdict: true });
    expect(grade(wrongForm, resolved!)).toEqual({ verdict: false, feedback: BUILT_IN });
  });
});

describe('FG-14: a value that trips the bound does no mistake, shape or form work', () => {
  it('no engine call at all', () => {
    const huge = 'a'.repeat(100); // 99 multiplications once split — over the cap of 64
    const k = key([huge], { mistakeFeedback: [mis(huge, 'matched', 'mis.huge'), mis('form-wrong', 'fw')] });
    const spy = vi.mocked(mathEquivalent);
    spy.mockClear();
    expect(grade(huge, k)).toEqual({ verdict: false });
    expect(spy).not.toHaveBeenCalled();
  });
  it('a long but ordinary answer is inside the bound after the split', () => {
    const long = '3x^2y + 2xy^2 - 5xy + 7x - 4y + 12abc - 9a^2b + 1';
    expect(grade(long, key([long]))).toEqual({ verdict: true });
  });
  it('the raw value is bounded before the tokenizer sees it', () => {
    const k = key(['x']);
    expect(grade('x+'.repeat(200) + 'x', k)).toEqual({ verdict: false });
  });
});

describe('the ~ group rule (FG-4)', () => {
  it('!form-wrong fires when the value equals ANY slot’s key; each slot uses its own entries', () => {
    const a = key(['x+2'], { id: 'a', mistakeFeedback: [mis('form-wrong', 'A: collect the numbers.')] });
    const b = key(['x+3'], { id: 'b', interchangeableWithPrevious: true });
    const group = [a, b];
    // x+1+1 typed into slot b: equal to slot a's key, so a form matter — slot b
    // has no !form-wrong of its own, so it gets the built-in line.
    const raws = ['x+3', 'x+1+1'];
    const verdicts = scoreBlankGroup(group, raws);
    expect(verdicts).toEqual([true, false]);
    expect(selectBlankOutcome(raws[1]!, b, verdicts[1]!, group)).toEqual({ feedback: BUILT_IN });
    // …and into slot a, its own entry.
    const raws2 = ['x+1+1', 'x+3'];
    const v2 = scoreBlankGroup(group, raws2);
    expect(v2).toEqual([false, true]);
    expect(selectBlankOutcome(raws2[0]!, a, v2[0]!, group)).toEqual({ feedback: text('A: collect the numbers.') });
    // Without the group, slot b alone would see x+1+1 as just wrong.
    expect(selectBlankOutcome('x+1+1', b, false)).toEqual({});
  });
});

describe('schema + upgrade (FG-8)', () => {
  const blank = (equivalence: unknown) => ({
    type: 'blank',
    id: '11111111-1111-4111-8111-111111111111',
    answer: '6(3x-2)',
    answerType: 'math',
    equivalence,
  });
  it("accepts 'form', still accepts the retired 'exact-form', REFUSES an unknown value", () => {
    expect(BlankToken.safeParse(blank('form')).success).toBe(true);
    expect(BlankToken.safeParse(blank('exact-form')).success).toBe(true);
    // The property that makes an OLD function refuse a 'form' document, and so
    // makes "both functions live before any form content" a rule, not a hope.
    expect(BlankToken.safeParse(blank('shape')).success).toBe(false);
    expect(MathPrompt.safeParse({ id: 'p1', answer: '12ab', equivalence: 'form' }).success).toBe(true);
    expect(MathPrompt.safeParse({ id: 'p1', answer: '12ab', equivalence: 'nope' }).success).toBe(false);
  });
  it('retireExactForm maps exact-form → form, copy-on-write', () => {
    const doc = { a: [{ equivalence: 'exact-form' }, { equivalence: 'value' }], b: { c: 1 } };
    const out = retireExactForm(doc) as typeof doc;
    expect(out.a[0]).toEqual({ equivalence: 'form' });
    expect(doc.a[0]).toEqual({ equivalence: 'exact-form' }); // input untouched
    expect(out.b).toBe(doc.b);
    const clean = { a: [{ equivalence: 'value' }] };
    expect(retireExactForm(clean)).toBe(clean);
  });
  it('upgradeActivityDocument serves a stored exact-form blank as form', () => {
    const raw = {
      schemaVersion: 2,
      meta: { title: 'retired-mode fixture' },
      sections: [
        {
          id: '55555555-5555-4555-8555-555555555551',
          rows: [
            {
              id: '55555555-5555-4555-8555-555555555552',
              columns: [
                {
                  id: '55555555-5555-4555-8555-555555555553',
                  blocks: [
                    {
                      type: 'fill_in_blank',
                      id: '44444444-4444-4444-8444-444444444444',
                      content: [blank('exact-form')],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const { doc } = upgradeActivityDocument(raw);
    expect(JSON.stringify(doc)).toContain('"equivalence":"form"');
    expect(JSON.stringify(doc)).not.toContain('exact-form');
    // …and an unknown equivalence makes the whole document unservable.
    const bad = JSON.parse(JSON.stringify(raw).replace('exact-form', 'shape'));
    expect(() => upgradeActivityDocument(bad)).toThrow(/failed validation/);
  });
});

describe('FG-6 display: the print / teacher-view walk shows a seeded math key folded', () => {
  it('substituteSeededAnswers folds a seeded math answer; numeric and unseeded entries are unchanged', async () => {
    const { substituteSeededAnswers } = await import('../src/print/seededPrint.js');
    const doc = {
      content: [
        { type: 'blank', answer: 'g*(p*x - q)', answerType: 'math', equivalence: 'form', acceptableAnswers: ['(c*d)ab'] },
        { type: 'blank', answer: '2*g', answerType: 'numeric' },
        { type: 'blank', answer: '6(3x-2)', answerType: 'math' },
      ],
    };
    const out = substituteSeededAnswers(doc, { g: 6, p: 3, q: 2, c: 4, d: 3 }) as typeof doc;
    expect(out.content[0]).toMatchObject({ answer: '6(3x - 2)', acceptableAnswers: ['12ab'] });
    expect(out.content[1]).toMatchObject({ answer: '12' });
    expect(out.content[2]).toMatchObject({ answer: '6(3x-2)' });
  });
});
