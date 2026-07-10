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

// The coordinate window a widget seeds its handles into (the axis config,
// minus the display-only fields).
export interface SeedWindow {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xGridStep: number;
  yGridStep: number;
}

// Family-aware default handle starts for the STUDENT widget. The board's
// generic default spreads handles along y = 0, which sits outside some
// families' fit domain (fitExponential rejects y ≤ 0, fitLogarithmic rejects
// x ≤ 0) — the student would see handles but no curve, with no way to know
// why. These seeds sit in valid fit territory (never on the answer curve —
// they're start positions, not hints). Families the generic default already
// serves return undefined; so do windows where the family can't be drawn at
// all (an authoring error this function can't fix).
export function startsForFamily(
  family: string,
  win: SeedWindow,
  count: number,
): [number, number][] | undefined {
  const clampX = (x: number): number => Math.min(Math.max(x, win.xMin), win.xMax);
  const clampY = (y: number): number => Math.min(Math.max(y, win.yMin), win.yMax);
  if (family === 'exponential') {
    // Every y must be positive. Spread x like the generic default; step y up
    // one grid line per handle from the lowest visible positive value.
    if (win.yMax <= 0) return undefined;
    const yLow = Math.max(win.yGridStep, win.yMin);
    if (yLow > win.yMax) return undefined;
    const out: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const x = win.xMin + ((i + 1) * (win.xMax - win.xMin)) / (count + 1);
      out.push([clampX(x), Math.min(yLow + i * win.yGridStep, win.yMax)]);
    }
    return out;
  }
  if (family === 'logarithmic') {
    // Every x must be positive. Step x out one grid line per handle from the
    // lowest visible positive value; y sits on (or nearest to) the x-axis.
    if (win.xMax <= 0) return undefined;
    const xLow = Math.max(win.xGridStep, win.xMin);
    if (xLow > win.xMax) return undefined;
    const out: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      out.push([Math.min(xLow + i * win.xGridStep, win.xMax), clampY(0)]);
    }
    return out;
  }
  return undefined;
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

// ---- plot_ray / plot_segment (student shape toggles) --------------------------
// The student plots TWO handles, then CHOOSES the figure's shape (ray toward
// the positive direction / ray toward negative / segment) and each visible
// endpoint's open/closed style. The shape choice is part of the answer — the
// widget must never pre-draw it — so scoring treats it as its own part, like
// the inequality's shade side. "Positive" = increasing x; a vertical pair
// falls back to increasing y (positive reads as UP).

export type LinearShape = 'ray_positive' | 'ray_negative' | 'segment';

export interface RayAnswerKey {
  from: [number, number];
  through: [number, number];
  fromStyle: 'open' | 'closed';
  tolerance: number;
}

export interface SegmentAnswerKey {
  from: [number, number];
  to: [number, number];
  endpoints: ['open' | 'closed', 'open' | 'closed'];
  tolerance: number;
}

/** The student's drawn figure, as the widget reports it. */
export interface LinearPieceStudentAnswer {
  /** The two plotted handles, in CANONICAL order (lesser first — by x, then y). */
  points: [number, number][];
  /** The chosen shape; null = not chosen yet (an unanswered part, never a
   *  lucky default). */
  shape: LinearShape | null;
  /**
   * Endpoint style choices for the endpoints the chosen shape actually shows:
   * [endpointStyle] for a ray (its single endpoint), [lesserStyle,
   * greaterStyle] for a segment, [] when no shape is chosen (no style
   * controls are visible yet).
   */
  endpointStyles: ('open' | 'closed')[];
}

// Direction match: unit-vector alignment. With snap-to-grid handles, candidate
// directions are discrete, so a fixed dot-product floor (~8°) cleanly separates
// "same line" from the nearest wrong grid direction while forgiving fine
// (Shift-step) placement wobble.
const DIRECTION_DOT_MIN = 0.99;

function unit(from: [number, number], to: [number, number]): [number, number] | null {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return null; // degenerate: the two handles coincide
  return [dx / len, dy / len];
}

/** Which shape a ray answer key expects, from its from→through direction. */
export function rayKeyShape(key: RayAnswerKey): LinearShape {
  const dx = key.through[0] - key.from[0];
  if (Math.abs(dx) > 1e-9) return dx > 0 ? 'ray_positive' : 'ray_negative';
  return key.through[1] - key.from[1] > 0 ? 'ray_positive' : 'ray_negative';
}

/**
 * TRUE-direction pill glyphs for the two ray options of a drawn line. The
 * "positive" ray extends from the canonical lesser handle through the greater
 * one (the same x-first rule scoring uses); its glyph is that direction's
 * actual angle snapped to 8 arrows — so the pill always shows exactly which
 * way the arrowhead will draw. A steep negative-slope line therefore reads
 * "Ray ↘ / Ray ↖", never a lying "Ray ↑". Coincident handles fall back to →/←.
 */
export function rayArrowGlyphs(
  a: [number, number],
  b: [number, number],
): { positive: string; negative: string } {
  const [lesser, greater] = canonicalPair(a, b);
  const dx = greater[0] - lesser[0];
  const dy = greater[1] - lesser[1];
  if (Math.hypot(dx, dy) < 1e-9) return { positive: '→', negative: '←' };
  // Screen-math orientation: +y is UP. Snap the angle to 8 sectors.
  const arrows = ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'];
  const sector = Math.round((Math.atan2(dy, dx) * 4) / Math.PI) & 7;
  const positive = arrows[((sector % 8) + 8) % 8]!;
  const negative = arrows[(((sector + 4) % 8) + 8) % 8]!;
  return { positive, negative };
}

/**
 * Truthful position labels for a segment's two CANONICAL endpoints (lesser
 * first). For a mostly-horizontal line the lesser endpoint is genuinely the
 * left one; for a steep line the canonical order is still x-first, so the
 * lesser endpoint may be the visually HIGHER one — label by real height, not
 * by index.
 */
export function endpointLabels(
  a: [number, number],
  b: [number, number],
): [string, string] {
  const [lesser, greater] = canonicalPair(a, b);
  if (Math.abs(greater[0] - lesser[0]) >= Math.abs(greater[1] - lesser[1])) {
    return ['Left', 'Right'];
  }
  return lesser[1] <= greater[1] ? ['Bottom', 'Top'] : ['Top', 'Bottom'];
}

/** Canonical order for two points: lesser first (by x, tie-break y). */
export function canonicalPair(
  a: [number, number],
  b: [number, number],
): [[number, number], [number, number]] {
  const aLesser = a[0] !== b[0] ? a[0] < b[0] : a[1] <= b[1];
  return aLesser ? [a, b] : [b, a];
}

const near = (
  a: [number, number],
  b: [number, number],
  tolerance: number,
): boolean =>
  Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance;

// The style the student gave the drawn end nearest the key's `at` point, or
// null when the chosen shape shows no style there.
function styleAt(
  ans: LinearPieceStudentAnswer,
  at: [number, number],
  tolerance: number,
): 'open' | 'closed' | null {
  const [lesser, greater] = [ans.points[0], ans.points[1]];
  if (!lesser || !greater) return null;
  if (ans.shape === 'segment') {
    if (near(lesser, at, tolerance)) return ans.endpointStyles[0] ?? null;
    if (near(greater, at, tolerance)) return ans.endpointStyles[1] ?? null;
    return null;
  }
  if (ans.shape === 'ray_positive' || ans.shape === 'ray_negative') {
    // A ray's single visible endpoint is the handle OPPOSITE the arrow.
    const endpoint = ans.shape === 'ray_positive' ? lesser : greater;
    return near(endpoint, at, tolerance) ? (ans.endpointStyles[0] ?? null) : null;
  }
  return null; // no shape chosen → no styles visible
}

/**
 * plot_ray parts (3): the SHAPE choice, the PLACEMENT (one handle on the key's
 * endpoint + the two handles collinear with the key's line — placement is
 * judged shape-agnostically so each part stays independent), and the endpoint
 * STYLE (of the drawn end sitting on the key's endpoint).
 */
export function scoreRayParts(
  key: RayAnswerKey,
  ans: LinearPieceStudentAnswer,
): { shape: boolean; placement: boolean; style: boolean } {
  const [p0, p1] = [ans.points[0], ans.points[1]];
  const shape = ans.shape === rayKeyShape(key);
  let placement = false;
  if (p0 && p1) {
    const endpointHit = near(p0, key.from, key.tolerance) || near(p1, key.from, key.tolerance);
    const u = unit(p0, p1);
    const v = unit(key.from, key.through);
    const collinear =
      u !== null && v !== null && Math.abs(u[0] * v[0] + u[1] * v[1]) >= DIRECTION_DOT_MIN;
    placement = endpointHit && collinear;
  }
  const style = styleAt(ans, key.from, key.tolerance) === key.fromStyle;
  return { shape, placement, style };
}

export function scoreRay(key: RayAnswerKey, ans: LinearPieceStudentAnswer): boolean {
  const p = scoreRayParts(key, ans);
  return p.shape && p.placement && p.style;
}

export function scoreRayPartial(
  key: RayAnswerKey,
  ans: LinearPieceStudentAnswer,
): { earned: number; total: number } {
  const p = scoreRayParts(key, ans);
  return { earned: Number(p.shape) + Number(p.placement) + Number(p.style), total: 3 };
}

/**
 * plot_segment parts (5): the SHAPE choice, two endpoint POSITIONS
 * (order-independent — score both assignments, keep the better), and two
 * endpoint STYLES (traveling with their matched endpoints; only earnable when
 * the chosen shape is actually a segment — a ray shows only one style
 * control, so its style state doesn't correspond to a segment's).
 */
export function scoreSegmentParts(
  key: SegmentAnswerKey,
  ans: LinearPieceStudentAnswer,
): { shape: boolean; positions: number; styles: number; earned: number; total: number } {
  const shape = ans.shape === 'segment';
  const [p0, p1] = [ans.points[0], ans.points[1]];
  let positions = 0;
  let styles = 0;
  if (p0 && p1) {
    const s0 = ans.endpointStyles[0] ?? null;
    const s1 = ans.endpointStyles[1] ?? null;
    const assignment = (
      first: [number, number],
      firstStyle: 'open' | 'closed' | null,
      second: [number, number],
      secondStyle: 'open' | 'closed' | null,
    ): { pos: number; sty: number } => ({
      pos: Number(near(first, key.from, key.tolerance)) + Number(near(second, key.to, key.tolerance)),
      sty:
        Number(shape && firstStyle === key.endpoints[0]) +
        Number(shape && secondStyle === key.endpoints[1]),
    });
    const straight = assignment(p0, s0, p1, s1);
    const swapped = assignment(p1, s1, p0, s0);
    const best =
      straight.pos + straight.sty >= swapped.pos + swapped.sty ? straight : swapped;
    positions = best.pos;
    styles = best.sty;
  }
  const earned = Number(shape) + positions + styles;
  return { shape, positions, styles, earned, total: 5 };
}

export function scoreSegment(key: SegmentAnswerKey, ans: LinearPieceStudentAnswer): boolean {
  const p = scoreSegmentParts(key, ans);
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
