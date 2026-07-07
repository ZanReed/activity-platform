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
const LinearModel = z.object({
  family: z.literal('linear'),
  slope: z.number(),
  intercept: z.number(),
  slopeTolerance: z.number().nonnegative().default(0.1),
  interceptTolerance: z.number().nonnegative().default(0.1),
});
export type LinearModel = z.infer<typeof LinearModel>;

// One member today; quadratic { a, b, c, … } / exponential / logarithmic slot in
// here. Discriminated on `family` so consumers branch uniformly.
export const FunctionModel = z.discriminatedUnion('family', [LinearModel]);
export type FunctionModel = z.infer<typeof FunctionModel>;

export const FunctionInteraction = z.object({
  type: z.literal('plot_function'),
  model: FunctionModel,
});
export type FunctionInteraction = z.infer<typeof FunctionInteraction>;

// ---- shade_region: shade a polygon --------------------------------------------
// The student drags the vertices of a polygon (one handle per vertex) to cover a
// target region, which is shaded as they move. Scored by AREA OVERLAP with the
// correct polygon (intersection-over-union ≥ minOverlap), so the exact vertex
// positions don't matter — only that the shaded region matches. A polygon, not a
// curve, so it's its own interaction (not a plot_function family).
export const RegionInteraction = z.object({
  type: z.literal('shade_region'),
  // Vertices of the correct polygon, in order (min 3 for a triangle).
  correctVertices: z.array(z.tuple([z.number(), z.number()])).min(3),
  // Minimum intersection-over-union (0..1) with the student's polygon to count
  // as correct. 0.9 is strict (near-exact on a snapped grid); lower it for
  // hand-dragged / approximate regions.
  minOverlap: z.number().min(0).max(1).default(0.9),
});
export type RegionInteraction = z.infer<typeof RegionInteraction>;

// The interaction union. plot_point + plot_function + shade_region today; more
// are future members. Kept discriminated on `type` so the wire format always
// carries it and consumers branch uniformly.
export const GraphInteraction = z.discriminatedUnion('type', [
  PointInteraction,
  FunctionInteraction,
  RegionInteraction,
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
  solution: z.array(InlineNode).optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
});
export type InteractiveGraphBlock = z.infer<typeof InteractiveGraphBlock>;
