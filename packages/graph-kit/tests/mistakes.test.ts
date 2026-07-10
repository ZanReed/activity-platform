// =============================================================================
// mistakes.test.ts — built-in classifiers + authored anticipated-mistake matching
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  compileMistakeMatchers,
  matchAuthoredMistake,
  classifyPointMistake,
  classifyFunctionMistake,
  classifyInequalityMistake,
} from '../src/mistakes.js';
import type { PointAnswerKey, LinearModel } from '../src/graph-score.js';

const pointKey: PointAnswerKey = { correctPoints: [[3, 4]], tolerance: 0.25 };
const linear: LinearModel = {
  family: 'linear',
  slope: 2,
  intercept: 1,
  slopeTolerance: 0.2,
  interceptTolerance: 0.2,
};

describe('classifyPointMistake', () => {
  it('recognizes swapped coordinates', () => {
    expect(classifyPointMistake(pointKey, [[4, 3]])).toMatch(/order of your coordinates/);
  });

  it('recognizes sign flips (either or both axes)', () => {
    expect(classifyPointMistake(pointKey, [[-3, 4]])).toMatch(/signs/);
    expect(classifyPointMistake(pointKey, [[3, -4]])).toMatch(/signs/);
    expect(classifyPointMistake(pointKey, [[-3, -4]])).toMatch(/signs/);
  });

  it('swapped beats sign-flip when both would match (order sanity)', () => {
    // (4, 3) is the swap of (3, 4); the swap check runs first.
    expect(classifyPointMistake({ correctPoints: [[3, -3]], tolerance: 0.1 }, [[-3, 3]]))
      .toMatch(/order of your coordinates/);
  });

  it('returns null for an unrecognized miss and for no points', () => {
    expect(classifyPointMistake(pointKey, [[0, 0]])).toBeNull();
    expect(classifyPointMistake(pointKey, [])).toBeNull();
  });

  it('handles multi-point keys (both points swapped)', () => {
    const key: PointAnswerKey = { correctPoints: [[1, 2], [3, 4]], tolerance: 0.1 };
    expect(classifyPointMistake(key, [[2, 1], [4, 3]])).toMatch(/order/);
    // Only one swapped → no clean pattern → null.
    expect(classifyPointMistake(key, [[2, 1], [3, 4]])).toBeNull();
  });
});

describe('classifyFunctionMistake', () => {
  // Two points ON a line y = mx + b: (0, b) and (1, m + b).
  const lineThrough = (m: number, b: number): [number, number][] => [
    [0, b],
    [1, m + b],
  ];

  it('slope right, intercept wrong → y-axis nudge', () => {
    expect(classifyFunctionMistake(linear, lineThrough(2, 3))).toMatch(/crosses the y-axis/);
  });

  it('intercept right, slope sign flipped → sign nudge', () => {
    expect(classifyFunctionMistake(linear, lineThrough(-2, 1))).toMatch(/rise or fall/);
  });

  it('intercept right, slope otherwise wrong → steepness nudge', () => {
    expect(classifyFunctionMistake(linear, lineThrough(0.5, 1))).toMatch(/steepness/);
  });

  it('slope and intercept traded places → swap nudge', () => {
    // Key: slope 2, intercept 1 → student drew slope 1, intercept 2.
    expect(classifyFunctionMistake(linear, lineThrough(1, 2))).toMatch(/traded places/);
  });

  it('returns null for unrecognized misses and unclassified families (exp/log)', () => {
    expect(classifyFunctionMistake(linear, lineThrough(5, -7))).toBeNull();
    expect(
      classifyFunctionMistake(
        { family: 'exponential', a: 1, b: 2, aTolerance: 0.1, bTolerance: 0.1 },
        [[0, 3], [1, 9]],
      ),
    ).toBeNull();
  });
});

describe('classifyFunctionMistake — quadratic', () => {
  // Three points ON y = ax² + bx + c: (0, c), (1, a+b+c), (−1, a−b+c).
  const parabola = (a: number, b: number, c: number): [number, number][] => [
    [0, c],
    [1, a + b + c],
    [-1, a - b + c],
  ];
  const quad = (a: number, b: number, c: number) => ({
    family: 'quadratic' as const,
    a, b, c,
    aTolerance: 0.2, bTolerance: 0.2, cTolerance: 0.2,
  });

  it('leading coefficient flipped → opens-the-wrong-way nudge', () => {
    // Key y = x² − 4; student drew y = −x² + 4 (the full mirror).
    expect(classifyFunctionMistake(quad(1, 0, -4), parabola(-1, 0, 4))).toMatch(/opens/);
  });

  it('shape right, c wrong → y-axis nudge (vertical shift)', () => {
    expect(classifyFunctionMistake(quad(1, 0, -4), parabola(1, 0, 1))).toMatch(/crosses the y-axis/);
  });

  it('a and c right, b flipped → vertex nudge (mirrored horizontal position)', () => {
    // Key y = x² − 2x + 1 (vertex at x = 1); student y = x² + 2x + 1 (vertex at −1).
    expect(classifyFunctionMistake(quad(1, -2, 1), parabola(1, 2, 1))).toMatch(/lowest or highest point/);
  });

  it('b and c right, a magnitude wrong → width nudge', () => {
    expect(classifyFunctionMistake(quad(1, 0, -4), parabola(3, 0, -4))).toMatch(/wide or narrow/);
  });

  it('near-degenerate key never fires the opens nudge (a ≈ −a would always match)', () => {
    const msg = classifyFunctionMistake(
      { family: 'quadratic', a: 0.08, b: 0, c: 0, aTolerance: 0.1, bTolerance: 0.1, cTolerance: 0.1 },
      parabola(-0.08, 0, 0),
    );
    expect(msg).not.toMatch(/opens/);
  });

  it('returns null when several parts are wrong (no clean pattern)', () => {
    expect(classifyFunctionMistake(quad(1, 0, -4), parabola(2, 3, 7))).toBeNull();
  });
});

describe('classifyInequalityMistake', () => {
  it('boundary right, side unpicked → choose-a-side nudge', () => {
    expect(
      classifyInequalityMistake({ boundary: true, side: false, style: true }, false),
    ).toMatch(/choose which side/);
  });

  it('boundary right, side wrong → shading nudge', () => {
    expect(
      classifyInequalityMistake({ boundary: true, side: false, style: true }, true),
    ).toMatch(/which side you shaded/);
  });

  it('only the style wrong → style nudge (never teaches the convention)', () => {
    const msg = classifyInequalityMistake({ boundary: true, side: true, style: false }, true)!;
    expect(msg).toMatch(/style/);
    // The nudge must not reveal the solid/dotted ↔ inclusive/strict mapping.
    expect(msg).not.toMatch(/strict|includ|≤|≥|<|>/);
  });

  it('boundary wrong, choices right → boundary nudge', () => {
    expect(
      classifyInequalityMistake({ boundary: false, side: true, style: true }, true),
    ).toMatch(/check your boundary/);
  });

  it('null when everything is wrong (generic miss)', () => {
    expect(
      classifyInequalityMistake({ boundary: false, side: false, style: false }, true),
    ).toBeNull();
  });
});

describe('authored mistake matching', () => {
  it('matches a plot_point entry with the key tolerance', () => {
    const matchers = compileMistakeMatchers(['(4, 3)'], {
      interactionType: 'plot_point',
      pointTolerance: 0.25,
    });
    expect(matchAuthoredMistake(matchers, { points: [[4.2, 3]] })).toBe(0);
    expect(matchAuthoredMistake(matchers, { points: [[5, 3]] })).toBeNull();
  });

  it('matches a plot_function entry, inheriting the key model tolerances', () => {
    const matchers = compileMistakeMatchers(['y = x + 2'], {
      interactionType: 'plot_function',
      keyModel: { ...linear, slopeTolerance: 0.5, interceptTolerance: 0.5 },
    });
    // Points on y = 1.2x + 2.2 — inside the transplanted 0.5 tolerances.
    expect(matchAuthoredMistake(matchers, { points: [[0, 2.2], [1, 3.4]] })).toBe(0);
  });

  it('matches a full inequality entry (boundary + strict + side)', () => {
    const matchers = compileMistakeMatchers(['y < 2x + 1'], {
      interactionType: 'graph_inequality',
      keyModel: linear,
    });
    const boundary: [number, number][] = [[0, 1], [1, 3]];
    expect(
      matchAuthoredMistake(matchers, { points: boundary, strict: true, side: 'below' }),
    ).toBe(0);
    expect(
      matchAuthoredMistake(matchers, { points: boundary, strict: true, side: 'above' }),
    ).toBeNull();
  });

  it('a bare equation entry on an inequality matches the boundary regardless of choices', () => {
    const matchers = compileMistakeMatchers(['y = x'], {
      interactionType: 'graph_inequality',
      keyModel: linear,
    });
    expect(
      matchAuthoredMistake(matchers, { points: [[0, 0], [1, 1]], strict: false, side: null }),
    ).toBe(0);
  });

  it('first match wins and returns the authored index', () => {
    const matchers = compileMistakeMatchers(['(9, 9)', '(4, 3)'], {
      interactionType: 'plot_point',
      pointTolerance: 0.1,
    });
    expect(matchAuthoredMistake(matchers, { points: [[4, 3]] })).toBe(1);
  });

  it('unparseable or type-mismatched entries never match (and never throw)', () => {
    const matchers = compileMistakeMatchers(['garbage %%', '', 'y = x + 2'], {
      interactionType: 'plot_point',
      pointTolerance: 0.1,
    });
    expect(matchAuthoredMistake(matchers, { points: [[1, 1]] })).toBeNull();
  });
});
