import { z } from 'zod';
import { InlineNode } from '../inline.js';

// The interactive graph block (Phase 2.7, Stage 5). Unlike every other block,
// the student's answer is GEOMETRIC — a point they plot on a coordinate plane —
// not text. Three structural consequences (see docs/design/interactive-graph-
// block.md): the answer is a structured value (its own submission map, not the
// blanks map), scoring is tolerance-based geometric comparison (the graph-kit
// scores it, not the runtime's string strategies), and the widget is large
// (JSXGraph rides the lazy-loaded @activity/graph-kit, never the base runtime).
//
// Slice 1 (2.7a) ships ONE interaction — plot_point. The interaction is a
// discriminated union from day one so plot_line (2.7b) and shade_region (2.7c)
// are each a new variant + a new scoring strategy with NO schema migration and
// no change to any other block type — exactly how the top-level Block union
// grows.

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


// ---- Interaction variants ---------------------------------------------------
// Each variant carries its OWN answer key + tolerance. plot_point is the only
// variant in slice 1; the union shape is here so the next variants slot in.
export const PointInteraction = z.object({
  type: z.literal('plot_point'),
  // One or more correct points; the student must plot all of them. A single
  // point is the common case; multiple supports e.g. "plot the two roots."
  correctPoints: z.array(z.tuple([z.number(), z.number()])).min(1),
  // Per-point tolerance in graph units (a Euclidean/each-axis radius, applied
  // by the kit's scorer). 0.1 default suits a snap-to-grid single point.
  tolerance: z.number().nonnegative().default(0.1),
});
export type PointInteraction = z.infer<typeof PointInteraction>;

// ---- plot_function: plot a curve of a given family ---------------------------
// The student places N points and the widget fits + draws a curve THROUGH them
// (N = the family's parameter count: linear 2, quadratic 3, exponential 2,
// logarithmic 2). Scored on the fitted curve's PARAMETERS (not the exact point
// positions), so any points on the correct curve are accepted. The parameters
// come from the SAME regression fit engine the calculator uses (fitLinear, …).
//
// `model` is a discriminated union on `family`: linear ships now; quadratic /
// exponential / logarithmic are each a new member here + a new fit branch in the
// kit's scorer (the fit functions already exist) — so "map 3 points → a parabola
// down the road" is additive, not a rewrite.
// Each family carries its parameters + a per-parameter tolerance, and its
// parameter names MATCH the kit's regression fitters (graph-kit fitLinear /
// fitQuadratic / fitExponential / fitLogarithmic) so a fitted curve scores
// against the key with no translation. Forms:
//   linear       y = slope·x + intercept
//   quadratic    y = a·x² + b·x + c
//   exponential  y = a·bˣ            (b > 0)
//   logarithmic  y = a + b·ln(x)     (x > 0)
//   vertical     x = k               (NOT a y = f(x) curve — scored on x)
const LinearModel = z.object({
  family: z.literal('linear'),
  slope: z.number(),
  intercept: z.number(),
  slopeTolerance: z.number().nonnegative().default(0.1),
  interceptTolerance: z.number().nonnegative().default(0.1),
});
export type LinearModel = z.infer<typeof LinearModel>;

const QuadraticModel = z.object({
  family: z.literal('quadratic'),
  a: z.number(),
  b: z.number(),
  c: z.number(),
  aTolerance: z.number().nonnegative().default(0.1),
  bTolerance: z.number().nonnegative().default(0.1),
  cTolerance: z.number().nonnegative().default(0.1),
});
export type QuadraticModel = z.infer<typeof QuadraticModel>;

const ExponentialModel = z.object({
  family: z.literal('exponential'),
  a: z.number(),
  b: z.number(),
  aTolerance: z.number().nonnegative().default(0.1),
  bTolerance: z.number().nonnegative().default(0.1),
});
export type ExponentialModel = z.infer<typeof ExponentialModel>;

const LogarithmicModel = z.object({
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
const VerticalModel = z.object({
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

// plot_function carries an ARRAY of curves (ships as one). One curve is the
// common case; multiple is a system of equations ("graph both lines"), scored
// as one object each — so systems are additive, not a reshape (Drop 2 decision).
export const FunctionInteraction = z.object({
  type: z.literal('plot_function'),
  models: z.array(FunctionModel).min(1),
  // Drop 6: optional per-curve domain restrictions ("graph y = 2x + 3 for
  // x >= 0"), parallel to models by index. The freeform parser fills these from
  // a `for …` clause; the widget's endpoint-drag UX is the planned follow-up —
  // until it lands, the domain is authoring metadata drawn on the key, and
  // scoring remains on the curve parameters.
  domains: z.array(CurveDomain.nullable()).optional(),
});
export type FunctionInteraction = z.infer<typeof FunctionInteraction>;

// ---- shade_region: shade a polygon --------------------------------------------
// The student drags the vertices of a polygon (one handle per vertex) to cover a
// target region, which is shaded as they move. Scored by AREA OVERLAP with the
// correct polygon (intersection-over-union ≥ minOverlap), so the exact vertex
// positions don't matter — only that the shaded region matches. A polygon, not a
// curve, so it's its own interaction (not a plot_function family).
// One target polygon: vertices in order (min 3) + the minimum intersection-over-
// union with the student's polygon to count as correct.
export const RegionAnswer = z.object({
  correctVertices: z.array(z.tuple([z.number(), z.number()])).min(3),
  // 0.9 is strict (near-exact on a snapped grid); lower it for hand-dragged /
  // approximate regions.
  minOverlap: z.number().min(0).max(1).default(0.9),
});
export type RegionAnswer = z.infer<typeof RegionAnswer>;

// shade_region carries an ARRAY of target polygons (ships as one), each scored
// as one object — so "shade both regions" is additive, matching plot_function.
export const RegionInteraction = z.object({
  type: z.literal('shade_region'),
  regions: z.array(RegionAnswer).min(1),
});
export type RegionInteraction = z.infer<typeof RegionInteraction>;

// ---- graph_inequality: graph an inequality (Drop 4) ---------------------------
// The student places the boundary (same handles as plot_function), toggles the
// line dotted (strict) or solid (inclusive), and clicks a side to shade. All
// three are graded — choosing them IS the skill. The boundary is a FunctionModel,
// so quadratic inequalities (y > x²) work the day the family does; a vertical
// boundary (x > 3) shades left/right instead of above/below.
export const ShadeSideValue = z.enum(['above', 'below', 'left', 'right']);
export type ShadeSideValue = z.infer<typeof ShadeSideValue>;

export const InequalityAnswer = z.object({
  boundary: FunctionModel,
  // true = strict (< / >, dotted boundary); false = inclusive (≤ / ≥, solid).
  strict: z.boolean(),
  shadeSide: ShadeSideValue,
});
export type InequalityAnswer = z.infer<typeof InequalityAnswer>;

// An ARRAY of inequalities (ships as one); systems ("shade where BOTH hold")
// become additive members, matching plot_function/shade_region.
export const InequalityInteraction = z.object({
  type: z.literal('graph_inequality'),
  inequalities: z.array(InequalityAnswer).min(1),
});
export type InequalityInteraction = z.infer<typeof InequalityInteraction>;

// ---- display: a static (ungraded) graph --------------------------------------
// The block draws a fixed picture — points, curves, segments, filled polygons —
// and collects NO answer. Two jobs from one shape: a stimulus a graded question
// refers to ("using the graph below, …"), and a standalone exemplar with no
// question at all (an empty prompt). Because `display` is just another member of
// the `type` union, a stimulus-with-an-answer later is additive — a new answer
// field beside the drawables — not a new block family.
//
// `Drawable` is discriminated on `kind`. `curve` REUSES FunctionModel, so the
// day quadratic/exponential/logarithmic land they light up here AND in
// plot_function at once. A `label` text-annotation drawable is deliberately
// deferred (point.label covers the common case) — YAGNI, additive when needed.
const PointDrawable = z.object({
  kind: z.literal('point'),
  at: z.tuple([z.number(), z.number()]),
  label: z.string().optional(),
  // open = hollow (excluded), closed = filled. Default closed.
  style: EndpointStyle.optional(),
});
const CurveDrawable = z.object({
  kind: z.literal('curve'),
  model: FunctionModel,
  // Drop 5: dashed boundary + half-plane shading turn a display curve into a
  // pictured inequality; domain restricts it to a ray/segment.
  style: z.enum(['solid', 'dashed']).optional(),
  shade: z.enum(['above', 'below', 'left', 'right']).optional(),
  domain: CurveDomain.optional(),
});

// Drop 5: plot ANY parseable formula (sin(x), rationals, …) by sampling — the
// escape hatch the graded families deliberately don't cover. Display-only.
const ExpressionDrawable = z.object({
  kind: z.literal('expression'),
  expression: z.string().min(1),
  style: z.enum(['solid', 'dashed']).optional(),
});
const SegmentDrawable = z.object({
  kind: z.literal('segment'),
  from: z.tuple([z.number(), z.number()]),
  to: z.tuple([z.number(), z.number()]),
  // Drop 5: open/closed endpoint dots ([from, to]). Default closed.
  endpoints: z.tuple([EndpointStyle, EndpointStyle]).optional(),
});

// Drop 5: a ray — starts at `from` (open/closed), passes through `through`,
// runs to the window edge. The physics-class staple.
const RayDrawable = z.object({
  kind: z.literal('ray'),
  from: z.tuple([z.number(), z.number()]),
  through: z.tuple([z.number(), z.number()]),
  fromStyle: EndpointStyle.optional(),
});
const PolygonDrawable = z.object({
  kind: z.literal('polygon'),
  vertices: z.array(z.tuple([z.number(), z.number()])).min(3),
  filled: z.boolean().default(true),
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

export const DisplayInteraction = z.object({
  type: z.literal('display'),
  drawables: z.array(Drawable).default([]),
});
export type DisplayInteraction = z.infer<typeof DisplayInteraction>;

// The interaction union. plot_point + plot_function + shade_region are graded;
// display is the ungraded static graph. More are future members. Kept
// discriminated on `type` so the wire format always carries it and consumers
// branch uniformly.
export const GraphInteraction = z.discriminatedUnion('type', [
  PointInteraction,
  FunctionInteraction,
  RegionInteraction,
  InequalityInteraction,
  DisplayInteraction,
]);
export type GraphInteraction = z.infer<typeof GraphInteraction>;

// ---- The block --------------------------------------------------------------
// Auto-numbered like ProblemBlock / FillInBlankBlock. hasConfidenceRating +
// skills follow the same opt-in patterns FillInBlankBlock established; solution
// is shown post-check regardless of correctness.
export const InteractiveGraphBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('interactive_graph'),
  number: z.number().int().positive().optional(),
  prompt: z.array(InlineNode),
  axisConfig: AxisConfig,
  interaction: GraphInteraction,
  // When true, a multi-part graph (several points, a system of curves/regions,
  // or — from Drop 4 — an inequality's line + side + style) scores fractionally
  // per object and the dashboard itemizes it; when false (default) it is all-or-
  // nothing. The flag + the kit's per-object scoring engine land here (Drop 2);
  // the runtime + submission consume the fraction at the Drop 4 wire bump.
  partialCredit: z.boolean().default(false),
  // When true, the student gets a "cannot be graphed / no solution" choice, and
  // the answer key may mark THAT as the correct answer (trick questions). The
  // flag lands here (Drop 2); the student control + no-solution response ride the
  // Drop 4 wire bump.
  allowNoSolution: z.boolean().default(false),
  // Trick questions: when true (requires allowNoSolution), "no solution" IS the
  // correct answer and the drawn answer key is a decoy. A student who selects
  // no-solution is correct; one who draws anything is not.
  noSolutionCorrect: z.boolean().default(false),
  // Built-in mistake classifiers (swapped coordinates, swapped slope/intercept,
  // right-boundary-wrong-side, …) show a targeted nudge instead of the generic
  // "Not quite" after a check. Default ON; a teacher can switch them off. The
  // classifier catalogue + messages live kit-side (graph-score.ts) — this flag
  // only gates them.
  builtinFeedback: z.boolean().default(true),
  // Authored anticipated mistakes — the graph twin of BlankToken.mistakeFeedback.
  // `match` is a freeform graph answer in the SAME syntax the authoring formula
  // field accepts ("(4, 3)", "y = x + 2", "y < 2x + 1"); the kit parses it with
  // the same parser and compares against the student's answer with the same
  // tolerances as scoring. First match wins, and an authored match beats a
  // built-in classifier. `feedback` is rich inline content, shown (post-check
  // only) in the block's feedback line.
  mistakeFeedback: z.array(z.object({
    match: z.string(),
    feedback: z.array(InlineNode),
  })).default([]),
  solution: z.array(InlineNode).optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
});
export type InteractiveGraphBlock = z.infer<typeof InteractiveGraphBlock>;
