import { describe, it, expect } from 'vitest';
import {
  scorePoints,
  isPointCorrect,
  scoreFunction,
  fitFunction,
  handlesForFamily,
  scoreRegion,
  polygonOverlap,
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

describe('polygonOverlap + scoreRegion (IoU)', () => {
  const tri = (): [number, number][] => [[0, 0], [4, 0], [2, 4]];

  it('identical polygons overlap ~1', () => {
    expect(polygonOverlap(tri(), tri())).toBeGreaterThan(0.98);
  });

  it('disjoint polygons overlap ~0', () => {
    const far: [number, number][] = [[10, 10], [14, 10], [12, 14]];
    expect(polygonOverlap(tri(), far)).toBe(0);
  });

  it('partial overlap is between 0 and 1', () => {
    const shifted: [number, number][] = [[2, 0], [6, 0], [4, 4]];
    const iou = polygonOverlap(tri(), shifted);
    expect(iou).toBeGreaterThan(0.05);
    expect(iou).toBeLessThan(0.95);
  });

  it('degenerate (< 3 vertices) overlaps 0', () => {
    expect(polygonOverlap([[0, 0], [1, 1]], tri())).toBe(0);
  });

  it('scoreRegion accepts a near-exact match and rejects a shifted one', () => {
    const key = { correctVertices: tri(), minOverlap: 0.9 };
    expect(scoreRegion(key, tri())).toBe(true);
    expect(scoreRegion(key, [[2, 0], [6, 0], [4, 4]])).toBe(false); // shifted right
  });

  it('scoreRegion honors a looser minOverlap', () => {
    // A slightly larger triangle around the same centroid — high but not perfect IoU.
    const key = { correctVertices: tri(), minOverlap: 0.5 };
    expect(scoreRegion(key, [[-0.3, -0.3], [4.3, -0.3], [2, 4.3]])).toBe(true);
  });

  it('scoreRegion needs at least three student vertices', () => {
    expect(scoreRegion({ correctVertices: tri(), minOverlap: 0.9 }, [[0, 0], [4, 0]])).toBe(false);
  });
});
