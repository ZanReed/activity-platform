// =============================================================================
// graph-primitives.ts — coordinate-plane primitives, dependency-free
// -----------------------------------------------------------------------------
// The axis / function-model / drawable vocabulary shared by every graph-shaped
// surface: interactive_graph (the graded block), graph_figure (the static
// picture), multiple_choice choice figures, matching sides, number_line
// (EndpointStyle), and data_plot.
//
// These schemas live HERE, in a leaf module that imports nothing but zod,
// rather than in blocks/interactive-graph.ts where they grew up. The reason is
// a hard one, not tidiness: interactive-graph.ts imports InlineNode from
// inline.ts (its prompt/feedback/solution fields), so anything reaching these
// primitives THROUGH it inherits a dependency on inline.ts. When inline.ts
// itself needs them — DefinitionBlock admits a graph_figure, see inline.ts —
// that closes the cycle inline.ts -> graph-figure.ts -> interactive-graph.ts ->
// inline.ts, and the cycle is fatal rather than cosmetic: interactive-graph.ts
// evaluates `z.array(InlineNode)` at module scope, so a partially-initialized
// inline.js throws a TDZ ReferenceError at import time.
//
// blocks/interactive-graph.ts re-exports everything here, so every existing
// importer keeps its current import path and identity — nothing moved from a
// consumer's point of view. New inline-reachable code (graph-figure.ts) imports
// from this module directly.
// =============================================================================

import { z } from 'zod';

// ---- Axis configuration -----------------------------------------------------
// The coordinate plane the student works in. Graph units throughout — tolerance
// and grid steps are in the same units, never pixels, so a published page that
// re-lays-out at a different size still scores identically.
export const AxisConfig = z.object({
  xMin: z.number(),
  xMax: z.number(),
  yMin: z.number(),
  yMax: z.number(),
  xGridStep: z.number().positive().default(1),
  yGridStep: z.number().positive().default(1),
  showGrid: z.boolean().default(true),
  // When true, a dragged handle snaps to the nearest grid intersection. Keyboard
  // nudge always moves by one grid step regardless (Shift = 0.1 step, fine).
  snapToGrid: z.boolean().default(true),
});
export type AxisConfig = z.infer<typeof AxisConfig>;

// ---- Endpoint style ---------------------------------------------------------
// open = hollow dot, value EXCLUDED (a strict inequality boundary, an open
// interval end); closed = filled dot, value INCLUDED. A shared vocabulary used
// by inequality boundaries (Drop 4: strict → open), domain-restricted rays and
// segments (Drop 6), display segments, and the future number-line family. Added
// as a foundation now (Drop 2); consumers render/score it in their own drops.
export const EndpointStyle = z.enum(['open', 'closed']);
export type EndpointStyle = z.infer<typeof EndpointStyle>;

// Domain restriction on a drawn curve (Drop 5/6): rays and segments of a
// function. Styles mark whether each endpoint is included (closed) or not.
export const CurveDomain = z.object({
  min: z.number().optional(),
  minStyle: EndpointStyle.optional(),
  max: z.number().optional(),
  maxStyle: EndpointStyle.optional(),
});
export type CurveDomain = z.infer<typeof CurveDomain>;

// ---- Function models --------------------------------------------------------
// Each family carries its parameters + a per-parameter tolerance, and its
// parameter names MATCH the kit's regression fitters (graph-kit fitLinear /
// fitQuadratic / fitExponential / fitLogarithmic) so a fitted curve scores
// against the key with no translation. Forms:
//   linear       y = slope·x + intercept
//   quadratic    y = a·x² + b·x + c
//   exponential  y = a·bˣ            (b > 0)
//   logarithmic  y = a + b·ln(x)     (x > 0)
//   vertical     x = k               (NOT a y = f(x) curve — scored on x)
export const LinearModel = z.object({
  family: z.literal('linear'),
  slope: z.number(),
  intercept: z.number(),
  slopeTolerance: z.number().nonnegative().default(0.1),
  interceptTolerance: z.number().nonnegative().default(0.1),
});
export type LinearModel = z.infer<typeof LinearModel>;

export const QuadraticModel = z.object({
  family: z.literal('quadratic'),
  a: z.number(),
  b: z.number(),
  c: z.number(),
  aTolerance: z.number().nonnegative().default(0.1),
  bTolerance: z.number().nonnegative().default(0.1),
  cTolerance: z.number().nonnegative().default(0.1),
});
export type QuadraticModel = z.infer<typeof QuadraticModel>;

export const ExponentialModel = z.object({
  family: z.literal('exponential'),
  a: z.number(),
  b: z.number(),
  aTolerance: z.number().nonnegative().default(0.1),
  bTolerance: z.number().nonnegative().default(0.1),
});
export type ExponentialModel = z.infer<typeof ExponentialModel>;

export const LogarithmicModel = z.object({
  family: z.literal('logarithmic'),
  a: z.number(),
  b: z.number(),
  aTolerance: z.number().nonnegative().default(0.1),
  bTolerance: z.number().nonnegative().default(0.1),
});
export type LogarithmicModel = z.infer<typeof LogarithmicModel>;

// A vertical line x = k. It has no y = f(x) representation (infinite slope), so
// it can't ride the regression fitters — the kit scores it directly on the
// student's x. Kept in FunctionModel (not a separate interaction) so authoring a
// vertical line is the same "type an equation" flow as any other family.
export const VerticalModel = z.object({
  family: z.literal('vertical'),
  x: z.number(),
  xTolerance: z.number().nonnegative().default(0.1),
});
export type VerticalModel = z.infer<typeof VerticalModel>;

// Discriminated on `family` so consumers branch uniformly. Growing a family is a
// new member here + a new fit/score branch in the kit — no other block touched.
export const FunctionModel = z.discriminatedUnion('family', [
  LinearModel,
  QuadraticModel,
  ExponentialModel,
  LogarithmicModel,
  VerticalModel,
]);
export type FunctionModel = z.infer<typeof FunctionModel>;

// ---- Drawables --------------------------------------------------------------
// `Drawable` is discriminated on `kind`. `curve` REUSES FunctionModel, so the
// day quadratic/exponential/logarithmic land they light up here AND in
// plot_function at once. A `label` text-annotation drawable is deliberately
// deferred (point.label covers the common case) — YAGNI, additive when needed.
// Authored per-drawable color. Stored as a palette KEY (not a hex) so colors
// stay semantic; the key list is defined HERE (dependency-free) and the key ->
// hex map lives in @activity/graph-kit's DRAWABLE_PALETTE. A drift guard test
// keeps the two lists in lockstep. Optional: absent = the shared default color.
export const DrawableColor = z.enum([
  'blue',
  'indigo',
  'teal',
  'green',
  'amber',
  'red',
  'violet',
  'slate',
]);
export type DrawableColorT = z.infer<typeof DrawableColor>;

const PointDrawable = z.object({
  kind: z.literal('point'),
  at: z.tuple([z.number(), z.number()]),
  label: z.string().optional(),
  // open = hollow (excluded), closed = filled. Default closed.
  style: EndpointStyle.optional(),
  color: DrawableColor.optional(),
});
const CurveDrawable = z.object({
  kind: z.literal('curve'),
  model: FunctionModel,
  // Drop 5: dashed boundary + half-plane shading turn a display curve into a
  // pictured inequality; domain restricts it to a ray/segment.
  style: z.enum(['solid', 'dashed']).optional(),
  shade: z.enum(['above', 'below', 'left', 'right']).optional(),
  domain: CurveDomain.optional(),
  // Continuation arrowheads on UNBOUNDED ends (textbook convention: arrow =
  // "keeps going", dot = "stops here"). Drawn where the curve exits the visible
  // window; an authored domain bound suppresses that end's arrow (it gets the
  // open/closed dot instead). undefined = true — arrows are the convention,
  // this flag is the opt-out (author call 2026-07-10).
  arrows: z.boolean().optional(),
  color: DrawableColor.optional(),
});

// Drop 5: plot ANY parseable formula (sin(x), rationals, …) by sampling — the
// escape hatch the graded families deliberately don't cover. Display-only.
const ExpressionDrawable = z.object({
  kind: z.literal('expression'),
  expression: z.string().min(1),
  style: z.enum(['solid', 'dashed']).optional(),
  // Continuation arrowheads at both window exits (see CurveDrawable.arrows).
  arrows: z.boolean().optional(),
  color: DrawableColor.optional(),
});
const SegmentDrawable = z.object({
  kind: z.literal('segment'),
  from: z.tuple([z.number(), z.number()]),
  to: z.tuple([z.number(), z.number()]),
  // Drop 5: open/closed endpoint dots ([from, to]). Default closed.
  endpoints: z.tuple([EndpointStyle, EndpointStyle]).optional(),
  color: DrawableColor.optional(),
});

// Drop 5: a ray — starts at `from` (open/closed), passes through `through`,
// runs to the window edge. The physics-class staple.
const RayDrawable = z.object({
  kind: z.literal('ray'),
  from: z.tuple([z.number(), z.number()]),
  through: z.tuple([z.number(), z.number()]),
  fromStyle: EndpointStyle.optional(),
  // Continuation arrowhead on the unbounded end (see CurveDrawable.arrows).
  arrows: z.boolean().optional(),
  color: DrawableColor.optional(),
});
const PolygonDrawable = z.object({
  kind: z.literal('polygon'),
  vertices: z.array(z.tuple([z.number(), z.number()])).min(3),
  filled: z.boolean().default(true),
  color: DrawableColor.optional(),
});
export const Drawable = z.discriminatedUnion('kind', [
  PointDrawable,
  CurveDrawable,
  ExpressionDrawable,
  SegmentDrawable,
  RayDrawable,
  PolygonDrawable,
]);
export type Drawable = z.infer<typeof Drawable>;
