import { describe, it, expect } from 'vitest';
import { scoreDotplot, frequencyMap } from '../src/data-plot-score.js';

describe('frequencyMap', () => {
  it('counts occurrences per value', () => {
    const m = frequencyMap([3, 5, 5, 3, 3]);
    expect(m.get(3)).toBe(3);
    expect(m.get(5)).toBe(2);
  });

  it('collapses float noise from tick snapping', () => {
    const m = frequencyMap([3, 2.9999999]);
    expect(m.size).toBe(1);
    expect(m.get(3)).toBe(2);
  });
});

describe('scoreDotplot', () => {
  const data = [3, 5, 5, 6, 8];

  it('accepts an exact frequency match (order-independent)', () => {
    expect(scoreDotplot(data, [8, 5, 3, 6, 5])).toBe(true);
  });

  it('rejects a missing dot', () => {
    expect(scoreDotplot(data, [3, 5, 5, 6])).toBe(false);
  });

  it('rejects an extra dot', () => {
    expect(scoreDotplot(data, [3, 5, 5, 6, 8, 8])).toBe(false);
  });

  it('rejects a wrong count on a value (one 5 instead of two)', () => {
    expect(scoreDotplot(data, [3, 5, 6, 8])).toBe(false);
  });

  it('rejects a dot on the wrong value', () => {
    expect(scoreDotplot(data, [3, 5, 5, 6, 7])).toBe(false);
  });

  it('rejects an empty student answer', () => {
    expect(scoreDotplot(data, [])).toBe(false);
  });

  it('is defensive against an empty dataset', () => {
    expect(scoreDotplot([], [])).toBe(false);
  });
});
