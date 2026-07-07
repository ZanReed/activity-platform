import { describe, it, expect } from 'vitest';
import { scorePoints, isPointCorrect, type PointAnswerKey } from '../src/graph-score.js';

const key = (correctPoints: [number, number][], tolerance = 0.1): PointAnswerKey => ({
  correctPoints,
  tolerance,
});

describe('isPointCorrect (single handle)', () => {
  it('accepts an exact hit', () => {
    expect(isPointCorrect(key([[3, 4]]), [3, 4])).toBe(true);
  });

  it('accepts a point within tolerance on both axes', () => {
    expect(isPointCorrect(key([[3, 4]], 0.2), [3.15, 3.85])).toBe(true);
  });

  it('rejects a point outside tolerance on one axis', () => {
    expect(isPointCorrect(key([[3, 4]], 0.1), [3.05, 4.5])).toBe(false);
  });

  it('treats tolerance as inclusive at the boundary', () => {
    expect(isPointCorrect(key([[0, 0]], 0.25), [0.25, -0.25])).toBe(true);
    expect(isPointCorrect(key([[0, 0]], 0.25), [0.26, 0])).toBe(false);
  });

  it('rejects everything when there are no correct points', () => {
    expect(isPointCorrect(key([]), [0, 0])).toBe(false);
  });

  it('handles negative coordinates', () => {
    expect(isPointCorrect(key([[-5, -7]], 0.1), [-5, -7])).toBe(true);
    expect(isPointCorrect(key([[-5, -7]], 0.1), [-5, -7.2])).toBe(false);
  });
});

describe('scorePoints (consume-once, N handles)', () => {
  it('matches a single correct point', () => {
    expect(scorePoints(key([[3, 4]]), [[3, 4]])).toBe(true);
    expect(scorePoints(key([[3, 4]]), [[3, 5]])).toBe(false);
  });

  it('requires ALL correct points, in any order', () => {
    const k = key([[-2, 0], [2, 0]], 0.1);
    expect(scorePoints(k, [[2, 0], [-2, 0]])).toBe(true); // any order
    expect(scorePoints(k, [[-2, 0], [2, 0]])).toBe(true);
    expect(scorePoints(k, [[2, 0], [2, 0]])).toBe(false); // both on one root
    expect(scorePoints(k, [[2, 0]])).toBe(false); // only one plotted
  });

  it('consumes each student point once (no double-counting a handle)', () => {
    // Two correct points close together; one student point near both must NOT
    // satisfy both — each correct point needs its own distinct student point.
    const k = key([[0, 0], [0.1, 0]], 0.2);
    expect(scorePoints(k, [[0, 0]])).toBe(false);
    expect(scorePoints(k, [[0, 0], [0.1, 0]])).toBe(true);
  });

  it('rejects when there are no correct points', () => {
    expect(scorePoints(key([]), [[0, 0]])).toBe(false);
  });
});
