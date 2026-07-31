// =============================================================================
// ungraded-mode.test.ts — the viewer's answer-key-free input mode (option A)
// -----------------------------------------------------------------------------
// The server-authoritative viewer (components-as-data arc, ruling Q2B) never
// receives an answer key: the read API's sanitizer strips correctPoints /
// tolerance / models / regions / inequalities before a document leaves the
// server. Before this change `mountGraphQuestion` REQUIRED that key and scored
// locally, so the viewer could not mount a graph question at all.
//
// `questionRecipe` is where the fork lives — how many handles, and is anything
// scored. Pure, so it unit-tests here; the widget mount itself needs JSXGraph
// and stays browser-verified (tests/runtime.test.ts header).
//
// The property that matters most is at the bottom: GRADED BEHAVIOR IS
// UNCHANGED. Published pages and the editor preview keep passing a key, and a
// regression there would be invisible until a student got a wrong verdict.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { questionRecipe } from '../src/index.js';

const AXIS = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };

describe('ungraded input mode (no answer key)', () => {
  it('plot_point takes its handle count from questionShape', () => {
    const recipe = questionRecipe('plot_point', undefined, AXIS, {
      handleCount: 3,
    });
    expect(recipe.count).toBe(3);
  });

  it('defaults to one handle when no shape is declared', () => {
    expect(questionRecipe('plot_point', undefined, AXIS).count).toBe(1);
  });

  it('never scores — the scorer is false for ANY input', () => {
    const recipe = questionRecipe('plot_point', undefined, AXIS, {
      handleCount: 1,
    });
    for (const pts of [
      [],
      [[0, 0]],
      [[3, 4]],
      [[-1.5, 2.25]],
    ] as [number, number][][]) {
      expect(recipe.scorer(pts)).toBe(false);
    }
  });

  it('plot_function lays out handles for the declared family', () => {
    const linear = questionRecipe('plot_function', undefined, AXIS, {
      family: 'linear',
    });
    const quadratic = questionRecipe('plot_function', undefined, AXIS, {
      family: 'quadratic',
    });
    expect(linear.count).toBe(2);
    expect(quadratic.count).toBeGreaterThan(linear.count);
    // Seed positions come from the AXIS window, never from a key. `starts` is
    // legitimately undefined for families where the board picks its own
    // defaults — when present it must match the handle count.
    for (const recipe of [linear, quadratic]) {
      if (recipe.starts) expect(recipe.starts).toHaveLength(recipe.count);
    }
  });

  it('seeds handles from the axis window, with no key in sight', () => {
    // exponential seeds explicitly (positive-y constraint), so it is the case
    // that proves seeding is window-driven.
    const recipe = questionRecipe('plot_function', undefined, {
      ...AXIS,
      xGridStep: 1,
      yGridStep: 1,
    } as never, { family: 'exponential' });
    expect(recipe.starts).toHaveLength(recipe.count);
    for (const [x, y] of recipe.starts ?? []) {
      expect(x).toBeGreaterThanOrEqual(AXIS.xMin);
      expect(x).toBeLessThanOrEqual(AXIS.xMax);
      expect(y).toBeGreaterThan(0);
    }
  });

  it('plot_function still derives the drawn curve from the student’s handles', () => {
    // The curve the student sees follows their own points — that is
    // presentation, not scoring, so it survives into ungraded mode.
    const recipe = questionRecipe('plot_function', undefined, AXIS, {
      family: 'linear',
    });
    const predict = recipe.deriveCurve?.([
      [0, 0],
      [1, 2],
    ]);
    expect(typeof predict).toBe('function');
    expect(predict?.(2)).toBeCloseTo(4, 6);
  });

  it('shade_region stays a polygon with the declared vertex count', () => {
    const recipe = questionRecipe('shade_region', undefined, AXIS, {
      vertexCount: 4,
    });
    expect(recipe.polygon).toBe(true);
    expect(recipe.count).toBe(4);
    expect(recipe.scorer([[0, 0]])).toBe(false);
  });

  it('shade_region never drops below three vertices', () => {
    expect(
      questionRecipe('shade_region', undefined, AXIS, { vertexCount: 1 }).count,
    ).toBe(3);
  });

  it('treats an explicitly null key as ungraded too', () => {
    const recipe = questionRecipe('plot_point', null, AXIS, { handleCount: 2 });
    expect(recipe.count).toBe(2);
    expect(recipe.scorer([[1, 1]])).toBe(false);
  });
});

describe('graded mode is UNCHANGED (published pages + editor preview)', () => {
  it('plot_point still derives handle count from the key and scores it', () => {
    const key = { correctPoints: [[2, 3]] as [number, number][], tolerance: 0.5 };
    const recipe = questionRecipe('plot_point', key, AXIS);
    expect(recipe.count).toBe(1);
    expect(recipe.scorer([[2, 3]])).toBe(true);
    expect(recipe.scorer([[2.4, 3.4]])).toBe(true); // inside tolerance
    expect(recipe.scorer([[5, 5]])).toBe(false);
  });

  it('multi-point keys still ask for one handle per target', () => {
    const key = {
      correctPoints: [
        [1, 1],
        [2, 2],
        [3, 3],
      ] as [number, number][],
      tolerance: 0.1,
    };
    expect(questionRecipe('plot_point', key, AXIS).count).toBe(3);
  });

  it('plot_function still scores against the authored model', () => {
    const key = { models: [{ family: 'linear', slope: 2, intercept: -1 }] };
    const recipe = questionRecipe('plot_function', key, AXIS);
    expect(recipe.count).toBe(2);
    expect(
      recipe.scorer([
        [0, -1],
        [1, 1],
      ]),
    ).toBe(true);
    expect(
      recipe.scorer([
        [0, 5],
        [1, 9],
      ]),
    ).toBe(false);
  });

  it('shade_region still scores against the authored vertices', () => {
    const key = {
      regions: [
        {
          correctVertices: [
            [0, 0],
            [4, 0],
            [0, 4],
          ] as [number, number][],
        },
      ],
    };
    const recipe = questionRecipe('shade_region', key, AXIS);
    expect(recipe.polygon).toBe(true);
    expect(recipe.count).toBe(3);
  });

  it('IGNORES questionShape when a key is present — the two can never disagree', () => {
    const key = {
      correctPoints: [
        [1, 1],
        [2, 2],
      ] as [number, number][],
      tolerance: 0.1,
    };
    // A caller passing both gets the key's shape, not the declared one.
    const recipe = questionRecipe('plot_point', key, AXIS, { handleCount: 9 });
    expect(recipe.count).toBe(2);
    expect(recipe.scorer([[1, 1], [2, 2]])).toBe(true);
  });
});
