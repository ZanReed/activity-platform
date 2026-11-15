// question-hint.test.ts — a hint on multiple choice, matching and ordering
// (schema-shortlist.md S3, 2026-11-15): returned ONLY by a wrong check, a
// chosen option's own feedback wins on multiple choice, and the hint never
// reaches what a student is served.
import { describe, expect, it } from 'vitest';
import { gradeSection } from '../src/server/grading/index.js';
import { emptySectionResponses } from '../src/index.js';

const t = (text: string) => ({ type: 'text', text, marks: [] });
const HINT = [t('Look at the units first.')];

function run(block: Record<string, unknown>, responses: Record<string, unknown>) {
  const result = gradeSection({
    document: { sections: [{ id: 's', rows: [{ columns: [{ blocks: [block] }] }] }] } as never,
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
