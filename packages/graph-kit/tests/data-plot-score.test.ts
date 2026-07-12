import { describe, it, expect } from 'vitest';
import {
  scoreDotplot,
  frequencyMap,
  histogramCounts,
  scoreHistogram,
  fiveNumberSummary,
  scoreBoxplot,
} from '../src/data-plot-score.js';

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

describe('histogramCounts', () => {
  const config = { min: 0, max: 10, tickStep: 1, binWidth: 5 };
  it('bins with the final bin inclusive of max', () => {
    // [0,5) has 0,4 → 2 ; [5,10] has 5,9,10 → 3
    expect(histogramCounts([0, 4, 5, 9, 10], config)).toEqual([2, 3]);
  });
  it('falls back to tickStep when binWidth is absent', () => {
    expect(histogramCounts([0, 1, 1, 2], { min: 0, max: 3, tickStep: 1 })).toEqual([1, 2, 1]);
  });
});

describe('scoreHistogram', () => {
  const config = { min: 0, max: 10, tickStep: 1, binWidth: 5 };
  const data = [0, 4, 5, 9, 10]; // → bins [2, 3]

  it('accepts the exact per-bin frequencies', () => {
    expect(scoreHistogram(data, config, [2, 3])).toBe(true);
  });
  it('rejects a wrong bin height', () => {
    expect(scoreHistogram(data, config, [3, 3])).toBe(false);
  });
  it('rejects the wrong number of bins', () => {
    expect(scoreHistogram(data, config, [2, 3, 0])).toBe(false);
  });
  it('is defensive against an empty dataset', () => {
    expect(scoreHistogram([], config, [])).toBe(false);
  });
});

describe('fiveNumberSummary (TI-84 exclusive-median)', () => {
  it('excludes the median from both halves on odd n', () => {
    // 1..7 → median 4; lower {1,2,3} Q1=2; upper {5,6,7} Q3=6
    expect(fiveNumberSummary([7, 1, 3, 5, 2, 6, 4])).toEqual({
      min: 1, q1: 2, median: 4, q3: 6, max: 7,
    });
  });
  it('splits at the halves on even n', () => {
    // 1..8 → median 4.5; lower {1,2,3,4} Q1=2.5; upper {5,6,7,8} Q3=6.5
    expect(fiveNumberSummary([1, 2, 3, 4, 5, 6, 7, 8])).toEqual({
      min: 1, q1: 2.5, median: 4.5, q3: 6.5, max: 8,
    });
  });
});

describe('scoreBoxplot', () => {
  const data = [7, 1, 3, 5, 2, 6, 4]; // summary {1,2,4,6,7}
  const key = { min: 1, q1: 2, median: 4, q3: 6, max: 7 };

  it('accepts an exact five-number summary', () => {
    expect(scoreBoxplot(data, 0.5, key)).toBe(true);
  });
  it('accepts each handle within tolerance', () => {
    expect(scoreBoxplot(data, 0.5, { min: 1, q1: 2.4, median: 4, q3: 5.6, max: 7 })).toBe(true);
  });
  it('rejects when one handle is outside tolerance', () => {
    expect(scoreBoxplot(data, 0.5, { min: 1, q1: 3, median: 4, q3: 6, max: 7 })).toBe(false);
  });
  it('is defensive against an empty dataset', () => {
    expect(scoreBoxplot([], 0.5, key)).toBe(false);
  });
});
