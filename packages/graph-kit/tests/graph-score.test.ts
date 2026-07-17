import { describe, it, expect } from 'vitest';
import {
  scorePoints,
  scorePointsPartial,
  isPointCorrect,
  scoreFunction,
  scoreFunctionsPartial,
  fitFunction,
  handlesForFamily,
  startsForFamily,
  scoreRegion,
  scoreRegionsPartial,
  scoreInequality,
  scoreInequalityPartial,
  scoreInequalitySystem,
  scoreDomain,
  scoreDomainParts,
  polygonOverlap,
  type PointAnswerKey,
  type FunctionModel,
  type InequalityAnswerKey,
  type InequalityStudentAnswer,
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
  it('quadratic needs three, exp/log/vertical need two (Drop 2)', () => {
    expect(handlesForFamily('quadratic')).toBe(3);
    expect(handlesForFamily('exponential')).toBe(2);
    expect(handlesForFamily('logarithmic')).toBe(2);
    expect(handlesForFamily('vertical')).toBe(2);
  });
});

describe('startsForFamily (family-aware student seeds)', () => {
  const win = {
    xMin: -10, xMax: 10, yMin: -10, yMax: 10,
    xGridStep: 1, yGridStep: 1,
  };
  it('families the generic y = 0 spread already serves return undefined', () => {
    expect(startsForFamily('linear', win, 2)).toBeUndefined();
    expect(startsForFamily('quadratic', win, 3)).toBeUndefined();
    expect(startsForFamily('vertical', win, 2)).toBeUndefined();
  });
  it('exponential seeds sit at positive y and define a curve', () => {
    const starts = startsForFamily('exponential', win, 2)!;
    expect(starts).toHaveLength(2);
    for (const [, y] of starts) expect(y).toBeGreaterThan(0);
    expect(fitFunction('exponential', starts)).not.toBeNull();
  });
  it('logarithmic seeds sit at positive x and define a curve', () => {
    const starts = startsForFamily('logarithmic', win, 2)!;
    expect(starts).toHaveLength(2);
    for (const [x] of starts) expect(x).toBeGreaterThan(0);
    expect(fitFunction('logarithmic', starts)).not.toBeNull();
  });
  it('seeds respect an offset window (exp above a raised yMin, log inside xMax)', () => {
    const raised = { ...win, yMin: 5 };
    for (const [, y] of startsForFamily('exponential', raised, 2)!) {
      expect(y).toBeGreaterThanOrEqual(5);
      expect(y).toBeLessThanOrEqual(10);
    }
    const narrow = { ...win, xMax: 1.5 };
    for (const [x] of startsForFamily('logarithmic', narrow, 2)!) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThanOrEqual(1.5);
    }
  });
  it('windows where the family cannot be drawn return undefined', () => {
    expect(startsForFamily('exponential', { ...win, yMax: 0 }, 2)).toBeUndefined();
    expect(startsForFamily('logarithmic', { ...win, xMax: 0 }, 2)).toBeUndefined();
  });
});

describe('fitFunction + scoreFunction — new families (Drop 2)', () => {
  it('quadratic: recovers a, b, c and scores', () => {
    // y = x² − 2x + 1 through (0,1), (1,0), (3,4).
    const f = fitFunction('quadratic', [[0, 1], [1, 0], [3, 4]]);
    expect(f && f.family === 'quadratic').toBe(true);
    if (f && f.family === 'quadratic') {
      expect(f.a).toBeCloseTo(1, 4);
      expect(f.b).toBeCloseTo(-2, 4);
      expect(f.c).toBeCloseTo(1, 4);
    }
    const m: FunctionModel = {
      family: 'quadratic', a: 1, b: -2, c: 1,
      aTolerance: 0.1, bTolerance: 0.1, cTolerance: 0.1,
    };
    expect(scoreFunction(m, [[0, 1], [1, 0], [3, 4]])).toBe(true);
    expect(scoreFunction(m, [[0, 2], [1, 1], [3, 5]])).toBe(false); // shifted up 1
  });

  it('exponential: recovers a, b and scores (y = 2·3ˣ)', () => {
    const pts: [number, number][] = [[0, 2], [1, 6], [2, 18]];
    const f = fitFunction('exponential', pts);
    expect(f && f.family === 'exponential').toBe(true);
    if (f && f.family === 'exponential') {
      expect(f.a).toBeCloseTo(2, 4);
      expect(f.b).toBeCloseTo(3, 4);
    }
    const m: FunctionModel = { family: 'exponential', a: 2, b: 3, aTolerance: 0.1, bTolerance: 0.1 };
    expect(scoreFunction(m, pts)).toBe(true);
  });

  it('logarithmic: recovers a, b and scores (y = 1 + 2·ln x)', () => {
    const pts: [number, number][] = [
      [1, 1],
      [Math.E, 3],
      [Math.E * Math.E, 5],
    ];
    const f = fitFunction('logarithmic', pts);
    expect(f && f.family === 'logarithmic').toBe(true);
    if (f && f.family === 'logarithmic') {
      expect(f.a).toBeCloseTo(1, 4);
      expect(f.b).toBeCloseTo(2, 4);
    }
    const m: FunctionModel = { family: 'logarithmic', a: 1, b: 2, aTolerance: 0.1, bTolerance: 0.1 };
    expect(scoreFunction(m, pts)).toBe(true);
  });

  it('vertical: scores x = k when points are vertical, rejects otherwise', () => {
    const m: FunctionModel = { family: 'vertical', x: 3, xTolerance: 0.1 };
    expect(scoreFunction(m, [[3, -2], [3, 5]])).toBe(true);
    expect(scoreFunction(m, [[3.05, 0], [2.98, 4]])).toBe(true); // within tolerance
    expect(scoreFunction(m, [[3, 0], [4, 2]])).toBe(false); // not vertical
    expect(scoreFunction(m, [[1, 0], [1, 4]])).toBe(false); // wrong x
  });

  it('exponential fit rejects non-positive y', () => {
    expect(fitFunction('exponential', [[0, -1], [1, 2]])).toBeNull();
  });
  it('logarithmic fit rejects non-positive x', () => {
    expect(fitFunction('logarithmic', [[-1, 0], [1, 2]])).toBeNull();
  });
});

describe('partial-credit scorers (Drop 2)', () => {
  it('scorePointsPartial counts matched points (consume-once)', () => {
    const k = key([[1, 1], [3, 3]]);
    expect(scorePointsPartial(k, [[1, 1], [3, 3]])).toEqual({ earned: 2, total: 2 });
    expect(scorePointsPartial(k, [[1, 1], [9, 9]])).toEqual({ earned: 1, total: 2 });
    expect(scorePointsPartial(k, [[1, 1], [1, 1]])).toEqual({ earned: 1, total: 2 }); // no double-count
  });

  it('scoreFunctionsPartial counts correct curves in a system', () => {
    const models: FunctionModel[] = [
      { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 },
      { family: 'linear', slope: -1, intercept: 4, slopeTolerance: 0.1, interceptTolerance: 0.1 },
    ];
    const r = scoreFunctionsPartial(models, [
      [[0, 0], [1, 1]], // y = x ✓
      [[0, 4], [1, 3]], // y = -x + 4 ✓
    ]);
    expect(r).toEqual({ earned: 2, total: 2 });
    const r2 = scoreFunctionsPartial(models, [
      [[0, 0], [1, 1]], // ✓
      [[0, 0], [1, 1]], // wrong for the second ✗
    ]);
    expect(r2).toEqual({ earned: 1, total: 2 });
  });

  it('scoreRegionsPartial counts covered regions', () => {
    const tri: [number, number][] = [[0, 0], [4, 0], [2, 4]];
    const r = scoreRegionsPartial([{ correctVertices: tri, minOverlap: 0.9 }], [tri]);
    expect(r).toEqual({ earned: 1, total: 1 });
    const off: [number, number][] = [[10, 10], [14, 10], [12, 14]];
    const r2 = scoreRegionsPartial([{ correctVertices: tri, minOverlap: 0.9 }], [off]);
    expect(r2).toEqual({ earned: 0, total: 1 });
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

describe('graph_inequality scorer (Drop 4)', () => {
  const key = {
    boundary: { family: 'linear', slope: 2, intercept: 1, slopeTolerance: 0.1, interceptTolerance: 0.1 } as FunctionModel,
    strict: true,
    shadeSide: 'above' as const,
  };
  const onBoundary: [number, number][] = [[0, 1], [1, 3]]; // y = 2x + 1

  it('all three parts right → correct', () => {
    expect(scoreInequality(key, { points: onBoundary, strict: true, side: 'above' })).toBe(true);
  });
  it('wrong side / wrong style / wrong boundary each fail', () => {
    expect(scoreInequality(key, { points: onBoundary, strict: true, side: 'below' })).toBe(false);
    expect(scoreInequality(key, { points: onBoundary, strict: false, side: 'above' })).toBe(false);
    expect(scoreInequality(key, { points: [[0, 0], [1, 1]], strict: true, side: 'above' })).toBe(false);
  });
  it('partial credit counts parts', () => {
    expect(scoreInequalityPartial(key, { points: onBoundary, strict: false, side: 'above' }))
      .toEqual({ earned: 2, total: 3 });
  });
  it('vertical boundary scores left/right', () => {
    const vkey = {
      boundary: { family: 'vertical', x: 3, xTolerance: 0.1 } as FunctionModel,
      strict: false,
      shadeSide: 'right' as const,
    };
    expect(scoreInequality(vkey, { points: [[3, -2], [3, 4]], strict: false, side: 'right' })).toBe(true);
    expect(scoreInequality(vkey, { points: [[3, -2], [3, 4]], strict: false, side: 'left' })).toBe(false);
  });
});

describe('graph_inequality SYSTEM scorer — match-all, order-independent (Graph systems)', () => {
  // Two distinct authored inequalities: y >= 2x + 1 shaded above, y < -x shaded
  // below (strict). A real system.
  const keys: InequalityAnswerKey[] = [
    {
      boundary: { family: 'linear', slope: 2, intercept: 1, slopeTolerance: 0.1, interceptTolerance: 0.1 },
      strict: false,
      shadeSide: 'above',
    },
    {
      boundary: { family: 'linear', slope: -1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 },
      strict: true,
      shadeSide: 'below',
    },
  ];
  const partA: InequalityStudentAnswer = { points: [[0, 1], [1, 3]], strict: false, side: 'above' }; // y = 2x+1
  const partB: InequalityStudentAnswer = { points: [[0, 0], [1, -1]], strict: true, side: 'below' }; // y = -x

  it('GS-M4: all N pairs correct → correct (earned === total)', () => {
    expect(scoreInequalitySystem(keys, [partA, partB])).toEqual({ correct: true, earned: 2, total: 2 });
  });

  it('GS-M4: one part wrong (style) → not correct, partial OFF gate', () => {
    const partBwrongStyle: InequalityStudentAnswer = { points: [[0, 0], [1, -1]], strict: false, side: 'below' };
    expect(scoreInequalitySystem(keys, [partA, partBwrongStyle])).toEqual({
      correct: false,
      earned: 1,
      total: 2,
    });
  });

  it('GS-M5: order-independent — parts in reversed order score identically', () => {
    expect(scoreInequalitySystem(keys, [partB, partA])).toEqual({ correct: true, earned: 2, total: 2 });
  });

  it('GS-M6: N=1 scores identically to scoreInequality', () => {
    const oneKey = [keys[0]!];
    const right: InequalityStudentAnswer = { points: [[0, 1], [1, 3]], strict: false, side: 'above' };
    const wrongSide: InequalityStudentAnswer = { points: [[0, 1], [1, 3]], strict: false, side: 'below' };
    expect(scoreInequalitySystem(oneKey, [right]).correct).toBe(scoreInequality(keys[0]!, right));
    expect(scoreInequalitySystem(oneKey, [right]).correct).toBe(true);
    expect(scoreInequalitySystem(oneKey, [wrongSide]).correct).toBe(scoreInequality(keys[0]!, wrongSide));
    expect(scoreInequalitySystem(oneKey, [wrongSide])).toEqual({ correct: false, earned: 0, total: 1 });
  });

  it('GS-M9: finds a complete pairing that first-come greedy would miss', () => {
    // key0 is wide (matches almost any boundary); key1 is narrow (slope ~3 only).
    // student partP matches BOTH keys; partQ matches key0 only. Greedy in order
    // [key0, key1] takes key0→partP first, then strands key1 (its only match,
    // partP, is used) → a false negative. Max bipartite matching reassigns
    // key0→partQ, freeing partP for key1 → both matched.
    const hardKeys: InequalityAnswerKey[] = [
      {
        boundary: { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 5, interceptTolerance: 5 },
        strict: false,
        shadeSide: 'above',
      },
      {
        boundary: { family: 'linear', slope: 3, intercept: 0, slopeTolerance: 0.2, interceptTolerance: 0.2 },
        strict: false,
        shadeSide: 'above',
      },
    ];
    const partP: InequalityStudentAnswer = { points: [[0, 0], [1, 3]], strict: false, side: 'above' }; // slope 3 → matches both
    const partQ: InequalityStudentAnswer = { points: [[0, 0], [1, 1]], strict: false, side: 'above' }; // slope 1 → key0 only
    // Sanity: the individual match relation is exactly the greedy hazard.
    expect(scoreInequality(hardKeys[0]!, partP)).toBe(true);
    expect(scoreInequality(hardKeys[1]!, partP)).toBe(true);
    expect(scoreInequality(hardKeys[0]!, partQ)).toBe(true);
    expect(scoreInequality(hardKeys[1]!, partQ)).toBe(false);
    expect(scoreInequalitySystem(hardKeys, [partP, partQ])).toEqual({ correct: true, earned: 2, total: 2 });
  });

  it('GS-M10: partial credit is per-inequality matched/N (A full, B style-wrong → 1/2)', () => {
    const bStyleWrong: InequalityStudentAnswer = { points: [[0, 0], [1, -1]], strict: false, side: 'below' };
    const r = scoreInequalitySystem(keys, [partA, bStyleWrong]);
    expect(r.earned).toBe(1);
    expect(r.total).toBe(2); // 1/2, NOT 5/6 — a not-fully-correct inequality earns nothing
    expect(r.correct).toBe(false);
  });

  it('GS-INV1: total function — never throws; parts.length < N → not correct; extras ignored', () => {
    expect(() => scoreInequalitySystem(keys, [])).not.toThrow();
    expect(scoreInequalitySystem(keys, [])).toEqual({ correct: false, earned: 0, total: 2 });
    // Only one part for a two-inequality key → can't match both.
    expect(scoreInequalitySystem(keys, [partA])).toEqual({ correct: false, earned: 1, total: 2 });
    // Extra (duplicate) parts beyond N are simply unused; a correct set stays correct.
    expect(scoreInequalitySystem(keys, [partA, partB, partA])).toEqual({
      correct: true,
      earned: 2,
      total: 2,
    });
  });
});

describe('domain endpoints scorer (Drop 6 follow-up)', () => {
  it('scores position + style per authored bound', () => {
    const key = { min: 0, minStyle: 'closed' as const };
    expect(scoreDomain(key, { minX: 0, minStyle: 'closed' })).toBe(true);
    expect(scoreDomain(key, { minX: 0.2, minStyle: 'closed' })).toBe(true); // within 0.25
    expect(scoreDomain(key, { minX: 1, minStyle: 'closed' })).toBe(false);
    expect(scoreDomainParts(key, { minX: 0, minStyle: 'open' })).toEqual({ earned: 1, total: 2 });
  });
  it('two-sided segment counts four parts; missing endpoint earns nothing', () => {
    const key = { min: -2, minStyle: 'open' as const, max: 3, maxStyle: 'closed' as const };
    expect(scoreDomainParts(key, { minX: -2, minStyle: 'open', maxX: 3, maxStyle: 'closed' }))
      .toEqual({ earned: 4, total: 4 });
    // min position missed AND min style defaults to closed ≠ open → only max's 2.
    expect(scoreDomainParts(key, { maxX: 3, maxStyle: 'closed' }).earned).toBe(2);
  });
  it('no authored domain → vacuously correct', () => {
    expect(scoreDomain({}, {})).toBe(true);
  });
});
