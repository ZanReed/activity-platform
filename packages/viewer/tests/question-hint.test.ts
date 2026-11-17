// question-hint.test.ts — a hint on multiple choice, matching and ordering
// (schema-shortlist.md S3, 2026-11-15): returned ONLY by a wrong check, a
// chosen option's own feedback wins on multiple choice, and the hint never
// reaches what a student is served. In a DoL section no hint is returned at
// all (author ruling 2026-11-16).
import { describe, expect, it } from 'vitest';
import { gradeSection } from '../src/server/grading/index.js';
import { emptySectionResponses, sanitizeActivityDocument } from '../src/index.js';
import { dolItemsWithoutHints } from '../src/server/check-activity-handler.js';
import { fullyLoadedDocument, wireOf } from '../src/fixtures/leakFixture.js';

const t = (text: string) => ({ type: 'text', text, marks: [] });
const HINT = [t('Look at the units first.')];

function run(block: Record<string, unknown>, responses: Record<string, unknown>, dol = false) {
  const result = gradeSection({
    document: { sections: [{ id: 's', ...(dol ? { isCheckpoint: true, dol: { skills: ['x.y'] } } : {}), rows: [{ columns: [{ blocks: [block] }] }] }] } as never,
    sectionId: 's',
    responses: { ...emptySectionResponses(), ...responses } as never,
    servedOrderings: {},
  } as never);
  return result.items[block.id as string] as { verdict: string; feedback?: unknown } | undefined;
}
const said = (item: { feedback?: unknown } | undefined) => JSON.stringify(item?.feedback ?? null);

const mc = (choiceFeedback?: boolean) => ({
  id: crypto.randomUUID(),
  type: 'multiple_choice',
  prompt: [t('Which?')],
  multiSelect: false,
  hint: HINT,
  choices: [
    { id: 'c1', content: [t('right')], correct: true },
    { id: 'c2', content: [t('wrong')], correct: false, ...(choiceFeedback ? { feedback: [t('That is the rate per hour.')] } : {}) },
  ],
});

describe('multiple choice', () => {
  it('a wrong answer gets the hint; a right one does not', () => {
    const b = mc();
    expect(said(run(b, { choices: { [b.id]: ['c2'] } }))).toContain('Look at the units first.');
    expect(said(run(b, { choices: { [b.id]: ['c1'] } }))).not.toContain('Look at the units');
  });

  it("the chosen option's own feedback wins over the hint", () => {
    const b = mc(true);
    const out = said(run(b, { choices: { [b.id]: ['c2'] } }));
    expect(out).toContain('rate per hour');
    expect(out).not.toContain('Look at the units');
  });
});

describe('multi-select', () => {
  it('a right option\'s feedback does not hide the hint from a wrong answer', () => {
    const b = {
      id: crypto.randomUUID(), type: 'multiple_choice', prompt: [t('Pick the even ones')], multiSelect: true, hint: HINT,
      choices: [
        { id: 'c1', content: [t('4')], correct: true, feedback: [t('Yes, 4 is even.')] },
        { id: 'c2', content: [t('6')], correct: true },
        { id: 'c3', content: [t('7')], correct: false },
      ],
    };
    const out = said(run(b, { choices: { [b.id]: ['c1', 'c3'] } }));
    expect(out).toContain('Yes, 4 is even.');
    expect(out).toContain('Look at the units first.');
  });
});

describe('matching and ordering', () => {
  it('matching: wrong → hint, right → none', () => {
    const b = {
      id: crypto.randomUUID(), type: 'matching', prompt: [t('Match')], hint: HINT,
      items: [{ id: 'i1', content: [t('a')] }, { id: 'i2', content: [t('b')] }],
      targets: [{ id: 't1', content: [t('A')] }, { id: 't2', content: [t('B')] }],
      key: { i1: 't1', i2: 't2' },
    };
    expect(said(run(b, { matches: { [b.id]: { i1: 't2', i2: 't1' } } }))).toContain('Look at the units');
    expect(said(run(b, { matches: { [b.id]: { i1: 't1', i2: 't2' } } }))).toBe('null');
  });

  it('ordering: wrong → hint, right → none', () => {
    const b = {
      id: crypto.randomUUID(), type: 'ordering', prompt: [t('Order')], hint: HINT,
      items: [{ id: 'o1', content: [t('1')] }, { id: 'o2', content: [t('2')] }, { id: 'o3', content: [t('3')] }],
    };
    expect(said(run(b, { orderings: { [b.id]: ['o3', 'o1', 'o2'] } }))).toContain('Look at the units');
    expect(said(run(b, { orderings: { [b.id]: ['o1', 'o2', 'o3'] } }))).toBe('null');
  });
});

// NO HINTS IN A DoL (author ruling 2026-11-16). A DoL is an assessment: the
// verdicts and the authored MISTAKE feedback still come back (DL-8), the
// nudge never does — for blanks, mc, matching and ordering alike.
describe('in a DoL section', () => {
  it('a wrong blank gets its mistake feedback but never its hint', () => {
    const blankId = crypto.randomUUID();
    const b = {
      id: crypto.randomUUID(), type: 'fill_in_blank',
      content: [t('3 × 4 = '), { type: 'blank', id: blankId, answer: '12', hint: HINT,
        mistakeFeedback: [{ match: '7', feedback: [t('That is 3 + 4.')] }] }],
    };
    const typed = (v: string, dol: boolean) =>
      JSON.stringify(gradeSection({
        document: { sections: [{ id: 's', ...(dol ? { isCheckpoint: true, dol: { skills: ['x.y'] } } : {}), rows: [{ columns: [{ blocks: [b] }] }] }] } as never,
        sectionId: 's',
        responses: { ...emptySectionResponses(), blanks: { [blankId]: v } } as never,
        servedOrderings: {},
      } as never).items[blankId]);
    expect(typed('9', false)).toContain('Look at the units');
    expect(typed('9', true)).not.toContain('Look at the units');
    expect(typed('9', true)).toContain('"verdict":"incorrect"');
    expect(typed('7', true)).toContain('That is 3 + 4.');
  });

  it('mc, matching and ordering: verdict and chosen-option feedback, no hint', () => {
    const plain = mc();
    expect(said(run(plain, { choices: { [plain.id]: ['c2'] } }, true))).not.toContain('Look at the units');
    expect(run(plain, { choices: { [plain.id]: ['c2'] } }, true)?.verdict).toBe('incorrect');
    const fed = mc(true);
    expect(said(run(fed, { choices: { [fed.id]: ['c2'] } }, true))).toContain('rate per hour');
    const m = {
      id: crypto.randomUUID(), type: 'matching', prompt: [t('Match')], hint: HINT,
      items: [{ id: 'i1', content: [t('a')] }, { id: 'i2', content: [t('b')] }],
      targets: [{ id: 't1', content: [t('A')] }, { id: 't2', content: [t('B')] }],
      key: { i1: 't1', i2: 't2' },
    };
    expect(said(run(m, { matches: { [m.id]: { i1: 't2', i2: 't1' } } }, true))).toBe('null');
    const o = {
      id: crypto.randomUUID(), type: 'ordering', prompt: [t('Order')], hint: HINT,
      items: [{ id: 'o1', content: [t('1')] }, { id: 'o2', content: [t('2')] }, { id: 'o3', content: [t('3')] }],
    };
    expect(said(run(o, { orderings: { [o.id]: ['o3', 'o1', 'o2'] } }, true))).toBe('null');
  });
});

describe('a DoL section does not SERVE a blank hint either (Fable review)', () => {
  it('stripped from the served page in a DoL section, kept elsewhere', () => {
    // The reference panel is not part of any section, so it keeps its own
    // blanks' hints; this test reads the sections alone.
    const doc = fullyLoadedDocument() as unknown as { sections: Array<Record<string, unknown>>; referencePanel?: unknown };
    delete doc.referencePanel;
    expect(wireOf(sanitizeActivityDocument(doc as never))).toContain('HINT_SURVIVES');
    for (const sec of doc.sections) sec.dol = { skills: ['x.y'] };
    expect(wireOf(sanitizeActivityDocument(doc as never))).not.toContain('HINT_SURVIVES');
  });
});

describe('a DoL check saved before the ruling (restore and replay)', () => {
  it('keeps the stored verdict and takes feedback from a fresh, hint-free grade', () => {
    const stored = {
      b1: { verdict: 'incorrect' as const, feedback: [t('Look at the units first.')] },
      b2: { verdict: 'incorrect' as const, feedback: [t('old mistake text')], misconceptionIds: ['m.x'] },
      b3: { verdict: 'correct' as const },
    };
    const fresh = { b1: { verdict: 'incorrect' as const }, b2: { verdict: 'incorrect' as const, feedback: [t('That is 3 + 4.')] } };
    const out = dolItemsWithoutHints(stored as never, fresh as never);
    expect(out.b1).toEqual({ verdict: 'incorrect' });
    expect(out.b2).toEqual({ verdict: 'incorrect', misconceptionIds: ['m.x'], feedback: [t('That is 3 + 4.')] });
    expect(out.b3).toEqual({ verdict: 'correct' });
  });
});
