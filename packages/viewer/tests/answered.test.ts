// answered.test.ts — one definition of "unanswered" for the lock confirm and
// the student top bar's "N of M answered" + Next (2026-11-15).
import { describe, expect, it } from 'vitest';
import { questionCount, unansweredItems } from '../src/container/answered.js';

const sec = (sectionId: string, items: Record<string, string[]>) =>
  ({ sectionId, isCheckpoint: false, items, blockIds: [], unsupported: [] }) as never;

describe('unansweredItems / questionCount', () => {
  const sections = [
    sec('s1', { blanks: ['b1', 'b2'], choices: ['mc1'] }),
    sec('s2', { matches: ['m1'], graphs: ['g1'] }),
  ];

  it('counts every question, and lists the empty ones section by section', () => {
    expect(questionCount(sections)).toBe(5);
    const responses = {
      blanks: { b1: '4', b2: '  ' },
      choices: { mc1: [] },
      matches: { m1: { i1: null } },
      graphs: { g1: { points: [] } },
    };
    expect(unansweredItems(responses, sections).map((u) => u.id)).toEqual(['b2', 'mc1', 'm1', 'g1']);
  });

  it('an untouched ordering counts as answered: the served order is an answer', () => {
    const secs = [sec('s1', { orderings: ['o1'], freeText: ['e1'] })];
    expect(unansweredItems({ orderings: {}, freeText: { e1: '' } }, secs).map((u) => u.id)).toEqual(['e1']);
  });

  it('a graph marked "cannot be graphed" is answered; an answered match is answered', () => {
    const responses = {
      blanks: { b1: 'a', b2: 'b' },
      choices: { mc1: ['c1'] },
      matches: { m1: { i1: 't1' } },
      graphs: { g1: { points: [], noSolution: true } },
    };
    expect(unansweredItems(responses, sections)).toEqual([]);
  });

  // The count has to agree with the grader (buffer.graphWorkTouched is bonded
  // to the server's isUntouched). It used to look at points and "cannot be
  // graphed" only, so these three read as blank in the confirm before a
  // one-way lock while the grader would have marked them.
  it.each([
    ['a typed equation and no points', { interaction: 'transform_curve', points: [], equation: 'y = 2x' }],
    ['one dragged interval bound', { interaction: 'plot_interval', points: [], domain: { minX: 2 } }],
    ['a drag with no stored points', { interaction: 'transform_curve', points: [], dragged: true }],
  ])('a graph with %s is answered', (_label, work) => {
    const responses = {
      blanks: { b1: 'a', b2: 'b' },
      choices: { mc1: ['c1'] },
      matches: { m1: { i1: 't1' } },
      graphs: { g1: work },
    };
    expect(unansweredItems(responses, sections)).toEqual([]);
  });

  it('a graph with an empty equation and nothing else is still blank', () => {
    const responses = {
      blanks: { b1: 'a', b2: 'b' },
      choices: { mc1: ['c1'] },
      matches: { m1: { i1: 't1' } },
      graphs: { g1: { interaction: 'transform_curve', points: [], equation: '  ' } },
    };
    expect(unansweredItems(responses, sections).map((u) => u.id)).toEqual(['g1']);
  });
});
