// =============================================================================
// graph-score.ts — pure scoring for the interactive-graph block (Stage 5)
// -----------------------------------------------------------------------------
// Framework-agnostic, DOM-free, JSXGraph-free — so it unit-tests in isolation
// and can later be shared with server-side grading (Phase 5). Mirrors the
// runtime's "pure boolean, tolerance-based" scoring seam. Slice 1 ships the
// plot_point scorer; plot_line / shade_region add their own scorers here.
// =============================================================================

import {
  fitLinear,
  fitQuadratic,
  fitExponential,
  fitLogarithmic,
  type DataPoint,
} from './regression.js';

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

// Partial credit for plot_point: how many of the correct points the student
// landed (consume-once), out of the total. `earned === total` is the all-or-
// nothing boolean; the fraction is `earned / total`. The runtime consumes this
// when partialCredit is on (wired at the Drop 4 bump); scorePoints stays the
// boolean gate for the all-or-nothing default.
export function scorePointsPartial(
  key: PointAnswerKey,
  studentPoints: [number, number][],
): { earned: number; total: number } {
  const total = key.correctPoints.length;
  const used = new Set<number>();
  let earned = 0;
  for (const target of key.correctPoints) {
    for (let i = 0; i < studentPoints.length; i++) {
      if (used.has(i)) continue;
      if (withinTolerance(studentPoints[i]!, target, key.tolerance)) {
        used.add(i);
        earned += 1;
        break;
      }
    }
  }
  return { earned, total };
}

// ---- plot_function: fit a curve to the points, score its parameters ---------
// The student places N points; the curve of the chosen FAMILY through them is
// fit with the SAME regression engine the calculator uses, and its parameters
// (not the exact point positions) are compared to the answer key with per-
// parameter tolerances. linear ships now; quadratic / exponential / logarithmic
// are each a new model member + a new fit branch here (the fit fns already
// exist), so growing from 2 points (a line) to 3 (a parabola) is additive.

// Parameter names + forms MIRROR the schema's FunctionModel (the kit never
// imports @activity/schema — parallel types are the discipline) and the
// regression fitters, so a fitted curve compares to the key with no translation.
export interface LinearModel {
  family: 'linear';
  slope: number;
  intercept: number;
  slopeTolerance: number;
  interceptTolerance: number;
}
export interface QuadraticModel {
  family: 'quadratic';
  a: number;
  b: number;
  c: number;
  aTolerance: number;
  bTolerance: number;
  cTolerance: number;
}
export interface ExponentialModel {
  family: 'exponential';
  a: number;
  b: number;
  aTolerance: number;
  bTolerance: number;
}
export interface LogarithmicModel {
  family: 'logarithmic';
  a: number;
  b: number;
  aTolerance: number;
  bTolerance: number;
}
export interface VerticalModel {
  family: 'vertical';
  x: number;
  xTolerance: number;
}
export type FunctionModel =
  | LinearModel
  | QuadraticModel
  | ExponentialModel
  | LogarithmicModel
  | VerticalModel;

// How many draggable handles a family needs — its parameter count (a curve is
// pinned down by that many points). vertical is 2 (two points naming the line).
export function handlesForFamily(family: string): number {
  switch (family) {
    case 'quadratic':
      return 3;
    case 'linear':
    case 'exponential':
    case 'logarithmic':
    case 'vertical':
      return 2;
    default:
      return 2;
  }
}

export type Fitted =
  | { family: 'linear'; slope: number; intercept: number; predict: (x: number) => number }
  | { family: 'quadratic'; a: number; b: number; c: number; predict: (x: number) => number }
  | { family: 'exponential'; a: number; b: number; predict: (x: number) => number }
  | { family: 'logarithmic'; a: number; b: number; predict: (x: number) => number }
  // vertical has no y = f(x); it carries the fitted x-value instead of predict.
  | { family: 'vertical'; x: number };

// Spread of x-values in a point set — used to decide whether points name a
// vertical line (all x roughly equal).
function xSpread(points: [number, number][]): number {
  if (points.length === 0) return 0;
  let min = Infinity;
  let max = -Infinity;
  for (const [x] of points) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return max - min;
}

// Fit the family's curve to the points, returning its parameters + a predict()
// for drawing — or null when the points can't define the curve (too few distinct
// x, y ≤ 0 for exponential, x ≤ 0 for logarithmic, non-vertical points for
// vertical). Reuses regression.ts for the y = f(x) families.
export function fitFunction(
  family: string,
  points: [number, number][],
): Fitted | null {
  const data: DataPoint[] = points.map(([x, y]) => ({ x, y }));
  switch (family) {
    case 'linear': {
      const out = fitLinear(data);
      if (!out.ok || out.fit.model !== 'linear') return null;
      return { family: 'linear', slope: out.fit.a, intercept: out.fit.b, predict: out.predict };
    }
    case 'quadratic': {
      const out = fitQuadratic(data);
      if (!out.ok || out.fit.model !== 'quadratic') return null;
      return { family: 'quadratic', a: out.fit.a, b: out.fit.b, c: out.fit.c, predict: out.predict };
    }
    case 'exponential': {
      const out = fitExponential(data);
      if (!out.ok || out.fit.model !== 'exponential') return null;
      return { family: 'exponential', a: out.fit.a, b: out.fit.b, predict: out.predict };
    }
    case 'logarithmic': {
      const out = fitLogarithmic(data);
      if (!out.ok || out.fit.model !== 'logarithmic') return null;
      return { family: 'logarithmic', a: out.fit.a, b: out.fit.b, predict: out.predict };
    }
    case 'vertical': {
      // A vertical line x = k. The points must actually be (near-)vertical, else
      // they don't name one; k is their mean x.
      if (points.length < 2) return null;
      const meanTol = 1e-6 + xSpread(points);
      if (meanTol > 0.5) return null; // points aren't vertical enough
      const meanX = points.reduce((s, [x]) => s + x, 0) / points.length;
      return { family: 'vertical', x: meanX };
    }
    default:
      return null;
  }
}

// Score ONE curve: fit the student's points to the model's family, then compare
// the fitted parameters to the key with per-parameter tolerances.
export function scoreFunction(
  model: FunctionModel,
  studentPoints: [number, number][],
): boolean {
  const fitted = fitFunction(model.family, studentPoints);
  if (!fitted) return false;
  switch (model.family) {
    case 'linear':
      return (
        fitted.family === 'linear' &&
        Math.abs(fitted.slope - model.slope) <= model.slopeTolerance &&
        Math.abs(fitted.intercept - model.intercept) <= model.interceptTolerance
      );
    case 'quadratic':
      return (
        fitted.family === 'quadratic' &&
        Math.abs(fitted.a - model.a) <= model.aTolerance &&
        Math.abs(fitted.b - model.b) <= model.bTolerance &&
        Math.abs(fitted.c - model.c) <= model.cTolerance
      );
    case 'exponential':
      return (
        fitted.family === 'exponential' &&
        Math.abs(fitted.a - model.a) <= model.aTolerance &&
        Math.abs(fitted.b - model.b) <= model.bTolerance
      );
    case 'logarithmic':
      return (
        fitted.family === 'logarithmic' &&
        Math.abs(fitted.a - model.a) <= model.aTolerance &&
        Math.abs(fitted.b - model.b) <= model.bTolerance
      );
    case 'vertical':
      return fitted.family === 'vertical' && Math.abs(fitted.x - model.x) <= model.xTolerance;
  }
}

// Partial credit for a system of curves: how many of the key's models the
// student's per-curve point sets satisfy, out of the total. `studentCurves[i]`
// is the point set for the i-th curve; a single-curve question passes one set.
export function scoreFunctionsPartial(
  models: FunctionModel[],
  studentCurves: [number, number][][],
): { earned: number; total: number } {
  let earned = 0;
  for (let i = 0; i < models.length; i++) {
    const pts = studentCurves[i];
    if (pts && scoreFunction(models[i]!, pts)) earned += 1;
  }
  return { earned, total: models.length };
}

// ---- graph_inequality: boundary + side + style (Drop 4) -----------------------
// Three independently-graded parts: the boundary curve (same fit-and-compare as
// plot_function), the shaded side, and the dotted/solid style (strict vs
// inclusive). Partial credit = earned parts / 3.

export type InequalitySide = 'above' | 'below' | 'left' | 'right';

export interface InequalityAnswerKey {
  boundary: FunctionModel;
  strict: boolean;
  shadeSide: InequalitySide;
}

export interface InequalityStudentAnswer {
  points: [number, number][];
  strict: boolean;
  side: InequalitySide;
}

export function scoreInequalityParts(
  key: InequalityAnswerKey,
  ans: InequalityStudentAnswer,
): { boundary: boolean; side: boolean; style: boolean } {
  return {
    boundary: scoreFunction(key.boundary, ans.points),
    side: ans.side === key.shadeSide,
    style: ans.strict === key.strict,
  };
}

export function scoreInequality(
  key: InequalityAnswerKey,
  ans: InequalityStudentAnswer,
): boolean {
  const p = scoreInequalityParts(key, ans);
  return p.boundary && p.side && p.style;
}

export function scoreInequalityPartial(
  key: InequalityAnswerKey,
  ans: InequalityStudentAnswer,
): { earned: number; total: number } {
  const p = scoreInequalityParts(key, ans);
  return { earned: Number(p.boundary) + Number(p.side) + Number(p.style), total: 3 };
}

// ---- domain endpoints (Drop 6 follow-up): rays and segments of a curve --------
// "Graph y = 2x + 3 for x >= 0": the curve is scored by fitFunction/scoreFunction
// as usual; the domain is scored on the student's endpoint x-positions (dragged
// along the curve) + their open/closed choices. Endpoint x tolerance matches the
// snap-to-grid default used elsewhere.

export interface DomainAnswerKey {
  min?: number;
  minStyle?: 'open' | 'closed';
  max?: number;
  maxStyle?: 'open' | 'closed';
}
export interface DomainStudentAnswer {
  minX?: number;
  minStyle?: 'open' | 'closed';
  maxX?: number;
  maxStyle?: 'open' | 'closed';
}

const DOMAIN_X_TOLERANCE = 0.25;

// Per-endpoint parts: position + style for each authored bound. An unauthored
// bound contributes nothing (the widget shows no handle for it).
export function scoreDomainParts(
  key: DomainAnswerKey,
  ans: DomainStudentAnswer,
): { earned: number; total: number } {
  let earned = 0;
  let total = 0;
  const side = (
    bound: number | undefined,
    style: 'open' | 'closed' | undefined,
    x: number | undefined,
    ansStyle: 'open' | 'closed' | undefined,
  ): void => {
    if (typeof bound !== 'number') return;
    total += 2;
    if (typeof x === 'number' && Math.abs(x - bound) <= DOMAIN_X_TOLERANCE) earned += 1;
    if ((ansStyle ?? 'closed') === (style ?? 'closed')) earned += 1;
  };
  side(key.min, key.minStyle, ans.minX, ans.minStyle);
  side(key.max, key.maxStyle, ans.maxX, ans.maxStyle);
  return { earned, total };
}

export function scoreDomain(key: DomainAnswerKey, ans: DomainStudentAnswer): boolean {
  const p = scoreDomainParts(key, ans);
  return p.earned === p.total;
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

// Partial credit for a system of regions: how many target polygons the student's
// per-region polygons cover (IoU ≥ minOverlap), out of the total. `studentPolys
// [i]` is the polygon for the i-th region; a single-region question passes one.
export function scoreRegionsPartial(
  regions: RegionAnswerKey[],
  studentPolys: [number, number][][],
): { earned: number; total: number } {
  let earned = 0;
  for (let i = 0; i < regions.length; i++) {
    const poly = studentPolys[i];
    if (poly && scoreRegion(regions[i]!, poly)) earned += 1;
  }
  return { earned, total: regions.length };
}
