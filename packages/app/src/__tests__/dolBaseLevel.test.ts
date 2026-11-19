import { describe, expect, it } from 'vitest';
import { baseLevelMet, baseLevelOf } from '../lib/dolPass';

// The DoL pass prefill's base level (DL-11, gui-sweep item 8's open question,
// fixed 2026-11-19): `A` when tagged, else the first tagged line's level.
describe('baseLevelOf', () => {
  it('is A whenever a line is tagged A, wherever it sits', () => {
    expect(baseLevelOf([{ level: 'M' }, { level: 'A' }, { level: 'E' }])).toBe('A');
  });
  it('is the first tagged level for the teacher’s own words', () => {
    expect(baseLevelOf([{}, { level: 'Basic' }, { level: 'Advanced' }])).toBe('Basic');
  });
  it('is undefined with no tagged line (no prefill)', () => {
    expect(baseLevelOf([{}, { level: '' }])).toBeUndefined();
  });
});

describe('baseLevelMet', () => {
  const spec = [
    { id: 'b1', maxPoints: 1, level: 'Basic' },
    { id: 'b2', maxPoints: 2, level: 'Basic' },
    { id: 'p', maxPoints: 2, level: 'Proficient' },
  ];
  const e = (criterionId: string, earned: number) => ({ criterionId, earned }) as never;
  it('needs every base-level line at full marks, and nothing above it', () => {
    expect(baseLevelMet(spec, [e('b1', 1), e('b2', 2)])).toBe(true);
    expect(baseLevelMet(spec, [e('b1', 1), e('b2', 1), e('p', 2)])).toBe(false);
  });
});
