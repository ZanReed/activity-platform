import { describe, it, expect } from 'vitest';
import {
  scorePoints,
  isPointCorrect,
  scoreFunction,
  fitFunction,
  handlesForFamily,
  type PointAnswerKey,
  type FunctionModel,
} from '../src/graph-score.js';

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

const linearModel = (over: Partial<FunctionModel> = {}): FunctionModel => ({
  family: 'linear',
  slope: 2,
  intercept: 3,
  slopeTolerance: 0.1,
  interceptTolerance: 0.1,
  ...over,
});

describe('handlesForFamily', () => {
  it('linear needs two handles', () => {
    expect(handlesForFamily('linear')).toBe(2);
  });
});

describe('fitFunction (linear)', () => {
  it('recovers slope + intercept from two points on the line', () => {
    // y = 2x + 3 passes through (0,3) and (1,5).
    const f = fitFunction('linear', [[0, 3], [1, 5]]);
    expect(f).not.toBeNull();
    if (f && f.family === 'linear') {
      expect(f.slope).toBeCloseTo(2, 6);
      expect(f.intercept).toBeCloseTo(3, 6);
      expect(f.predict(2)).toBeCloseTo(7, 6);
    }
  });

  it('returns null for a vertical pair (no function)', () => {
    expect(fitFunction('linear', [[2, 0], [2, 5]])).toBeNull();
  });

  it('returns null for an unknown family', () => {
    expect(fitFunction('cubic', [[0, 0], [1, 1]])).toBeNull();
  });
});

describe('scoreFunction (linear)', () => {
  it('accepts any two points on the correct line', () => {
    const m = linearModel(); // y = 2x + 3
    expect(scoreFunction(m, [[0, 3], [1, 5]])).toBe(true);
    expect(scoreFunction(m, [[-1, 1], [2, 7]])).toBe(true); // different points, same line
  });

  it('rejects a line with the wrong slope', () => {
    expect(scoreFunction(linearModel(), [[0, 3], [1, 6]])).toBe(false); // slope 3
  });

  it('rejects a line with the wrong intercept', () => {
    expect(scoreFunction(linearModel(), [[0, 4], [1, 6]])).toBe(false); // y = 2x + 4
  });

  it('honors the per-parameter tolerances', () => {
    const m = linearModel({ slopeTolerance: 0.2, interceptTolerance: 0.2 });
    // slope 2.15, intercept 3.15 — within 0.2 of (2, 3).
    expect(scoreFunction(m, [[0, 3.15], [1, 5.3]])).toBe(true);
  });

  it('rejects a vertical line', () => {
    expect(scoreFunction(linearModel(), [[2, 0], [2, 5]])).toBe(false);
  });
});
