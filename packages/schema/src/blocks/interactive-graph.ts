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

// A one-member discriminated union today; adding plot_line / shade_region is a
// new member here + a new scorer in the kit. Kept as a union (not a bare
// object) so the discriminant `type` is present in the wire format from the
// start and consumers branch on it uniformly.
export const GraphInteraction = z.discriminatedUnion('type', [PointInteraction]);
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
