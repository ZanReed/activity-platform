import { describe, it, expect } from 'vitest';
import {
  scoreNumberLinePoints,
  scoreNumberLineInterval,
} from '../src/number-line-score.js';

describe('scoreNumberLinePoints', () => {
  const key = { correctPoints: [3], tolerance: 0.25 };

  it('accepts a point within tolerance', () => {
    expect(scoreNumberLinePoints(key, [3])).toBe(true);
    expect(scoreNumberLinePoints(key, [3.2])).toBe(true);
    expect(scoreNumberLinePoints(key, [2.8])).toBe(true);
  });

  it('rejects a point outside tolerance', () => {
    expect(scoreNumberLinePoints(key, [3.5])).toBe(false);
    expect(scoreNumberLinePoints(key, [-3])).toBe(false);
  });

  it('rejects when no point is plotted', () => {
    expect(scoreNumberLinePoints(key, [])).toBe(false);
  });

  it('requires ALL correct points (consume-once, order-independent)', () => {
    const two = { correctPoints: [-2, 5], tolerance: 0.1 };
    expect(scoreNumberLinePoints(two, [5, -2])).toBe(true); // order-independent
    expect(scoreNumberLinePoints(two, [-2])).toBe(false); // missing one
    expect(scoreNumberLinePoints(two, [-2, -2])).toBe(false); // can't stack
    expect(scoreNumberLinePoints(two, [-2, 5, 9])).toBe(true); // extras ok
  });

  it('rejects an empty answer key (defensive)', () => {
    expect(scoreNumberLinePoints({ correctPoints: [], tolerance: 0.1 }, [0])).toBe(
      false,
    );
  });
});

describe('scoreNumberLineInterval', () => {
  // x >= -2 AND x < 4  (min closed, max open)
  const bounded = {
    correctInterval: { min: -2, minStyle: 'closed' as const, max: 4, maxStyle: 'open' as const },
    tolerance: 0.25,
  };

  it('accepts the exact interval', () => {
    expect(
      scoreNumberLineInterval(bounded, {
        min: -2,
        minStyle: 'closed',
        max: 4,
        maxStyle: 'open',
      }),
    ).toBe(true);
  });

  it('accepts bounds within tolerance', () => {
    expect(
      scoreNumberLineInterval(bounded, {
        min: -1.8,
        minStyle: 'closed',
        max: 4.2,
        maxStyle: 'open',
      }),
    ).toBe(true);
  });

  it('rejects a wrong endpoint style (open vs closed is the point)', () => {
    expect(
      scoreNumberLineInterval(bounded, {
        min: -2,
        minStyle: 'open', // should be closed
        max: 4,
        maxStyle: 'open',
      }),
    ).toBe(false);
  });

  it('rejects a bound outside tolerance', () => {
    expect(
      scoreNumberLineInterval(bounded, {
        min: -2,
        minStyle: 'closed',
        max: 5, // too far
        maxStyle: 'open',
      }),
    ).toBe(false);
  });

  it('scores a ray: x >= 3 (min bounded, max unbounded)', () => {
    const ray = {
      correctInterval: { min: 3, minStyle: 'closed' as const },
      tolerance: 0.25,
    };
    expect(scoreNumberLineInterval(ray, { min: 3, minStyle: 'closed' })).toBe(true);
    // A bounded max where the key is unbounded is wrong (student drew an interval).
    expect(
      scoreNumberLineInterval(ray, { min: 3, minStyle: 'closed', max: 10, maxStyle: 'open' }),
    ).toBe(false);
    // Missing the min entirely is wrong.
    expect(scoreNumberLineInterval(ray, { max: 3, maxStyle: 'closed' })).toBe(false);
  });

  it('scores a left ray: x < 5 (max bounded, min unbounded)', () => {
    const ray = {
      correctInterval: { max: 5, maxStyle: 'open' as const },
      tolerance: 0.25,
    };
    expect(scoreNumberLineInterval(ray, { max: 5, maxStyle: 'open' })).toBe(true);
    expect(scoreNumberLineInterval(ray, { max: 5, maxStyle: 'closed' })).toBe(false);
  });

  it('treats a missing style as closed', () => {
    const ray = { correctInterval: { min: 3 }, tolerance: 0.25 };
    expect(scoreNumberLineInterval(ray, { min: 3 })).toBe(true);
    expect(scoreNumberLineInterval(ray, { min: 3, minStyle: 'closed' })).toBe(true);
    expect(scoreNumberLineInterval(ray, { min: 3, minStyle: 'open' })).toBe(false);
  });
});
