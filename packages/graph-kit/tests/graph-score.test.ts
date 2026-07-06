import { describe, it, expect } from 'vitest';
import { isPointCorrect, type PointAnswerKey } from '../src/graph-score.js';

const key = (correctPoints: [number, number][], tolerance = 0.1): PointAnswerKey => ({
  correctPoints,
  tolerance,
});

describe('isPointCorrect', () => {
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

  it('accepts a match against ANY of several correct points (either-root)', () => {
    const k = key([[-2, 0], [2, 0]], 0.1);
    expect(isPointCorrect(k, [2, 0])).toBe(true);
    expect(isPointCorrect(k, [-2, 0])).toBe(true);
    expect(isPointCorrect(k, [0, 0])).toBe(false);
  });

  it('rejects everything when there are no correct points', () => {
    expect(isPointCorrect(key([]), [0, 0])).toBe(false);
  });

  it('handles negative coordinates', () => {
    expect(isPointCorrect(key([[-5, -7]], 0.1), [-5, -7])).toBe(true);
    expect(isPointCorrect(key([[-5, -7]], 0.1), [-5, -7.2])).toBe(false);
  });
});
