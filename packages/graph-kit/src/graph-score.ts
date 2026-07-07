// =============================================================================
// graph-score.ts — pure scoring for the interactive-graph block (Stage 5)
// -----------------------------------------------------------------------------
// Framework-agnostic, DOM-free, JSXGraph-free — so it unit-tests in isolation
// and can later be shared with server-side grading (Phase 5). Mirrors the
// runtime's "pure boolean, tolerance-based" scoring seam. Slice 1 ships the
// plot_point scorer; plot_line / shade_region add their own scorers here.
// =============================================================================

import { fitLinear, type DataPoint } from './regression.js';

export interface PointAnswerKey {
  /** Acceptable target point(s), in graph units. */
  correctPoints: [number, number][];
  /** Per-axis tolerance (a box half-width), in graph units. */
  tolerance: number;
}

// Is a student point within tolerance of a target (each axis independently — a
// snap-to-grid axis-aligned box, which matches how students read a grid)?
function withinTolerance(
  student: [number, number],
  target: [number, number],
  tolerance: number,
): boolean {
  return (
    Math.abs(student[0] - target[0]) <= tolerance &&
    Math.abs(student[1] - target[1]) <= tolerance
  );
}

// The plot_point question: the student plots one handle per authored correct
// point and must land EVERY correct point (order-independent). Scored with
// consume-once matching (the same shape as order-independent blank groups):
// each correct point is matched to a DISTINCT student point within tolerance,
// so "plot both roots" can't be satisfied by stacking one handle on one root.
// The common single-point case (one correct point, one handle) reduces to a
// plain within-tolerance check.
export function scorePoints(
  key: PointAnswerKey,
  studentPoints: [number, number][],
): boolean {
  if (key.correctPoints.length === 0) return false;
  if (studentPoints.length < key.correctPoints.length) return false;
  const used = new Set<number>();
  for (const target of key.correctPoints) {
    let matched = -1;
    for (let i = 0; i < studentPoints.length; i++) {
      if (used.has(i)) continue;
      if (withinTolerance(studentPoints[i]!, target, key.tolerance)) {
        matched = i;
        break;
      }
    }
    if (matched === -1) return false;
    used.add(matched);
  }
  return true;
}

// Convenience for the single-handle case (kept for callers/tests that score one
// point). Equivalent to scorePoints with a one-point student array.
export function isPointCorrect(
  key: PointAnswerKey,
  point: [number, number],
): boolean {
  return scorePoints(key, [point]);
}

// ---- plot_function: fit a curve to the points, score its parameters ---------
// The student places N points; the curve of the chosen FAMILY through them is
// fit with the SAME regression engine the calculator uses, and its parameters
// (not the exact point positions) are compared to the answer key with per-
// parameter tolerances. linear ships now; quadratic / exponential / logarithmic
// are each a new model member + a new fit branch here (the fit fns already
// exist), so growing from 2 points (a line) to 3 (a parabola) is additive.

export interface LinearModel {
  family: 'linear';
  slope: number;
  intercept: number;
  slopeTolerance: number;
  interceptTolerance: number;
}
export type FunctionModel = LinearModel; // | QuadraticModel | ExponentialModel | …

// How many draggable handles a family needs — its parameter count. Used by the
// widget to show the right number of handles and by the author board.
export function handlesForFamily(family: string): number {
  switch (family) {
    case 'linear':
      return 2;
    // case 'quadratic': return 3;
    // case 'exponential': case 'logarithmic': return 2;
    default:
      return 2;
  }
}

export interface FittedLinear {
  family: 'linear';
  slope: number;
  intercept: number;
  predict: (x: number) => number;
}
export type Fitted = FittedLinear;

// Fit the family's curve to the points, returning its parameters + a predict()
// for drawing — or null when the points can't define the curve (e.g. a vertical
// line for 'linear', or too few distinct points). Reuses regression.ts.
export function fitFunction(
  family: string,
  points: [number, number][],
): Fitted | null {
  const data: DataPoint[] = points.map(([x, y]) => ({ x, y }));
  if (family === 'linear') {
    const out = fitLinear(data);
    if (!out.ok || out.fit.model !== 'linear') return null;
    return {
      family: 'linear',
      slope: out.fit.a,
      intercept: out.fit.b,
      predict: out.predict,
    };
  }
  return null;
}

export function scoreFunction(
  model: FunctionModel,
  studentPoints: [number, number][],
): boolean {
  const fitted = fitFunction(model.family, studentPoints);
  if (!fitted) return false;
  if (model.family === 'linear' && fitted.family === 'linear') {
    return (
      Math.abs(fitted.slope - model.slope) <= model.slopeTolerance &&
      Math.abs(fitted.intercept - model.intercept) <= model.interceptTolerance
    );
  }
  return false;
}

// ---- shade_region: score a polygon by area overlap --------------------------
// The student drags a polygon's vertices to cover a target region; correctness
// is intersection-over-union (IoU) with the correct polygon ≥ minOverlap — so
// the exact vertices don't matter, only that the shaded AREA matches (and over-
// shading is penalised too). IoU is estimated by grid-sampling both polygons
// over their combined bounding box: point-in-polygon is a ~10-line ray cast, so
// no polygon-clipping dependency — pure, tiny, and testable.

export interface RegionAnswerKey {
  correctVertices: [number, number][];
  minOverlap: number;
}

// Even-odd ray casting: is (px, py) inside the polygon `verts` (in order)?
function pointInPolygon(
  px: number,
  py: number,
  verts: [number, number][],
): boolean {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const [xi, yi] = verts[i]!;
    const [xj, yj] = verts[j]!;
    const crosses = yi > py !== yj > py;
    if (crosses && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Grid samples per axis for the IoU estimate — 100×100 = 10k samples gives ~1%
// accuracy, plenty against a 0.9-ish threshold and cheap enough to run on drag.
const OVERLAP_SAMPLES = 100;

// Intersection-over-union of two polygons, in [0, 1]. 0 when either is
// degenerate (< 3 vertices) or their combined box has zero area.
export function polygonOverlap(
  a: [number, number][],
  b: [number, number][],
): number {
  if (a.length < 3 || b.length < 3) return 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of [...a, ...b]) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (maxX <= minX || maxY <= minY) return 0;
  let both = 0;
  let either = 0;
  for (let i = 0; i < OVERLAP_SAMPLES; i++) {
    const px = minX + ((maxX - minX) * (i + 0.5)) / OVERLAP_SAMPLES;
    for (let j = 0; j < OVERLAP_SAMPLES; j++) {
      const py = minY + ((maxY - minY) * (j + 0.5)) / OVERLAP_SAMPLES;
      const inA = pointInPolygon(px, py, a);
      const inB = pointInPolygon(px, py, b);
      if (inA && inB) both += 1;
      if (inA || inB) either += 1;
    }
  }
  return either > 0 ? both / either : 0;
}

export function scoreRegion(
  key: RegionAnswerKey,
  studentPoints: [number, number][],
): boolean {
  if (studentPoints.length < 3 || key.correctVertices.length < 3) return false;
  return polygonOverlap(studentPoints, key.correctVertices) >= key.minOverlap;
}
