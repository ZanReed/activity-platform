import { z } from 'zod';
import { InlineNode, MisconceptionId } from '../inline.js';
import { labelFields } from '../label.js';
import { sizingFields } from '../sizing.js';
import {
  AxisConfig,
  CurveDomain,
  Drawable,
  EndpointStyle,
  FunctionModel,
} from '../graph-primitives.js';

// The coordinate-plane primitives (AxisConfig, EndpointStyle, CurveDomain, the
// FunctionModel family, DrawableColor, Drawable) MOVED to ../graph-primitives.ts
// — a leaf module that imports nothing but zod. They are re-exported here, with
// identical identities, so every existing import path keeps working.
//
// Why they moved: this file imports InlineNode, so reaching the primitives
// through it drags in inline.ts. inline.ts now needs graph_figure (a definition
// may contain one), which would close the cycle inline -> graph-figure ->
// interactive-graph -> inline. That cycle is fatal, not cosmetic: the
// `z.array(InlineNode)` calls below run at module scope and would hit a TDZ
// ReferenceError on a partially-initialized inline.js. See graph-primitives.ts.
export {
  AxisConfig,
  EndpointStyle,
  CurveDomain,
  LinearModel,
  QuadraticModel,
  CubicModel,
  QuarticModel,
  AbsoluteModel,
  SqrtModel,
  ExponentialModel,
  LogarithmicModel,
  VerticalModel,
  FunctionModel,
  DrawableColor,
  Drawable,
} from '../graph-primitives.js';
export type { DrawableColorT } from '../graph-primitives.js';

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
// `model` is a discriminated union on `family` (FunctionModel, now in
// ../graph-primitives.ts and re-exported above): linear, quadratic, exponential,
// logarithmic, vertical. Growing a family is a new member there + a new fit
// branch in the kit's scorer — additive, not a rewrite.

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
// `Drawable` (the point / curve / expression / segment / ray / polygon union,
// discriminated on `kind`) and its `DrawableColor` palette keys now live in
// ../graph-primitives.ts and are re-exported above.

export const DisplayInteraction = z.object({
  type: z.literal('display'),
  drawables: z.array(Drawable).default([]),
});
export type DisplayInteraction = z.infer<typeof DisplayInteraction>;

// ---- plot_ray / plot_segment: draw a ray or segment directly ------------------
// First-class replacements for the domain-glider approach (which asked students
// to define an infinite line, then mark endpoints on it with separate controls —
// the drawn line never even clipped). Here the student drags TWO handles — the
// endpoint(s) — and the widget draws an ACTUAL ray/segment through them
// (JSXGraph straightFirst/straightLast), with open/closed endpoint pills.
// Arrays-of-one like models/regions/inequalities, so systems stay additive.
// (plot_function's domains[] remains scored for already-published pages, but
// authoring steers here now.)
export const RayAnswer = z.object({
  // The ray's endpoint (scored on position + open/closed style).
  from: z.tuple([z.number(), z.number()]),
  // Any second point ON the ray — names the direction; the student's through
  // handle may sit anywhere along the correct ray.
  through: z.tuple([z.number(), z.number()]),
  fromStyle: EndpointStyle.default('closed'),
  // Endpoint position tolerance in graph units (matches the domain-glider
  // default). Direction is scored by unit-vector alignment kit-side.
  tolerance: z.number().nonnegative().default(0.25),
});
export type RayAnswer = z.infer<typeof RayAnswer>;

export const RayInteraction = z.object({
  type: z.literal('plot_ray'),
  rays: z.array(RayAnswer).min(1),
});
export type RayInteraction = z.infer<typeof RayInteraction>;

export const SegmentAnswer = z.object({
  from: z.tuple([z.number(), z.number()]),
  to: z.tuple([z.number(), z.number()]),
  // [from-endpoint style, to-endpoint style]. Scored order-independently —
  // the student may draw the segment in either direction.
  endpoints: z.tuple([EndpointStyle, EndpointStyle]).default(['closed', 'closed']),
  tolerance: z.number().nonnegative().default(0.25),
});
export type SegmentAnswer = z.infer<typeof SegmentAnswer>;

export const SegmentInteraction = z.object({
  type: z.literal('plot_segment'),
  segments: z.array(SegmentAnswer).min(1),
});
export type SegmentInteraction = z.infer<typeof SegmentInteraction>;

// The interaction union. plot_point + plot_function + shade_region are graded;
// display is the ungraded static graph. More are future members. Kept
// discriminated on `type` so the wire format always carries it and consumers
// branch uniformly.
export const GraphInteraction = z.discriminatedUnion('type', [
  PointInteraction,
  FunctionInteraction,
  RegionInteraction,
  InequalityInteraction,
  RayInteraction,
  SegmentInteraction,
  DisplayInteraction,
]);
export type GraphInteraction = z.infer<typeof GraphInteraction>;

// ---- The block --------------------------------------------------------------
// Auto-numbered like ProblemBlock / FillInBlankBlock. skills follows the same
// opt-in pattern FillInBlankBlock established; solution is shown post-check
// regardless of correctness.
export const InteractiveGraphBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('interactive_graph'),
  number: z.number().int().positive().optional(),
  ...labelFields,
  prompt: z.array(InlineNode),
  axisConfig: AxisConfig,
  interaction: GraphInteraction,
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
  // `misconceptionId` binds the entry to a named misconception (opaque
  // `mis.*` tag), same contract as BlankToken.mistakeFeedback.
  mistakeFeedback: z.array(z.object({
    match: z.string(),
    feedback: z.array(InlineNode),
    misconceptionId: MisconceptionId.optional(),
  })).default([]),
  solution: z.array(InlineNode).optional(),
  skills: z.array(z.string()).default([]),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // Author-set display footprint for the figure; renderer honors it via the
  // shared .block-sized path. Additive/optional — no schemaVersion bump.
  ...sizingFields,
});
export type InteractiveGraphBlock = z.infer<typeof InteractiveGraphBlock>;
