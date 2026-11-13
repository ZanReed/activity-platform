// =============================================================================
// check-tally.test.ts — C-3 (ui-review-group-c.md): a checked group says how it
// went, counted from the check's own verdicts. Written answers ('recorded')
// aren't marked by the computer, so they are counted apart.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { groupTally, tallyText } from '../../src/container/ViewerContainer.js';

const checked = (verdicts: string[]) => ({
  phase: 'checked' as const,
  result: {
    wireVersion: 1,
    sectionId: 's',
    items: Object.fromEntries(verdicts.map((v, i) => [`i${i}`, { verdict: v }])),
    solutions: {},
  },
});

describe('groupTally', () => {
  it('sums right / marked / written across the group’s sections', () => {
    const sections = {
      a: checked(['correct', 'incorrect', 'correct']),
      b: checked(['correct', 'recorded']),
    } as never;
    expect(groupTally(sections, ['a', 'b'])).toEqual({ right: 3, marked: 4, recorded: 1 });
  });

  it('is null until every section in the group is checked, and when nothing was graded', () => {
    expect(groupTally({ a: checked(['correct']), b: { phase: 'unchecked' } } as never, ['a', 'b'])).toBeNull();
    expect(groupTally({ a: checked([]) } as never, ['a'])).toBeNull();
  });
});

describe('tallyText', () => {
  it('reads the way a student talks', () => {
    expect(tallyText({ right: 4, marked: 6, recorded: 0 })).toBe('4 of 6 right');
    expect(tallyText({ right: 4, marked: 5, recorded: 1 })).toBe('4 of 5 right · 1 written answer goes to your teacher');
    expect(tallyText({ right: 0, marked: 0, recorded: 2 })).toBe('2 written answers go to your teacher');
  });
});
