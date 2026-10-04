import { z } from 'zod';
// From the leaf primitives module, NOT from ./interactive-graph.js — that file
// imports inline.ts, and inline.ts imports THIS one (a definition may contain a
// graph figure), so routing through it would close a fatal module cycle. See
// ../graph-primitives.ts.
import { AxisConfig, Drawable } from '../graph-primitives.js';
import { sizingFields } from '../sizing.js';

// =============================================================================
// GraphFigureBlock — a static coordinate-plane picture (never interactive).
// -----------------------------------------------------------------------------
// A pure CONTENT block (data-block-category="content"): non-interactive,
// non-numbered, no runtime wiring, no submission wire impact. The standalone
// promotion of the MC/matching ChoiceGraph figure ({ axis, drawables }) to a
// block, built for the reference panel — "these two lines are parallel"-style
// pictures on a formula sheet.
//
// Rendered server-side as inline SVG by the renderer's graph-svg engine, never
// the interactive kit — so it works on paper, in the print box, and in the
// floating panel with zero JS. Consequence (same as ChoiceGraph): `expression`
// drawables need the kit's formula parser and are NOT drawn; authoring
// surfaces don't offer them here.
//
// Deliberately NOT a display-mode interactive_graph: that block is a numbered-
// question family with prompt/solution/confidence chrome and kit hydration.
// This one can never accept student input by construction, which is the
// reference panel's contract.
// =============================================================================

/** The longest caption a figure may carry. */
export const GRAPH_FIGURE_CAPTION_MAX = 12;

export const GraphFigureBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('graph_figure'),
  axis: AxisConfig,
  drawables: z.array(Drawable).default([]),
  // Y7 geometry slice (y7-figures-and-charts.md). Every field below is read by
  // the viewer's GraphFigure and guarded by tests/components/graph-figure.test.tsx.
  //
  // alt — the figure's accessible name (D11). Absent = "Graph figure".
  alt: z.string().optional(),
  // plane — false hides grid, axes and tick labels AND locks x and y to one
  // scale, so angles are true (D3, mechanism per ER-2: on the block, not on
  // AxisConfig, which three other surfaces share). Default true = every
  // figure that existed before this field renders exactly as it did.
  plane: z.boolean().default(true),
  // toScale — opts a plane-less figure out of the automatic "Not to scale"
  // caption (N8). Meaningless when plane is true (a plane figure never has one).
  toScale: z.boolean().default(false),
  // caption — a short label drawn in bold above the figure (side-by-side
  // figures, 2026-10-04): the letter a "which diagram?" question names (`A`),
  // or a word ("Before"). AUTHORED, never derived from position, so the source
  // shows the letter beside the mc that refers to it. At most 12 characters: it
  // is a tag for the figure, not its description (that is `alt`). Read by the
  // viewer's GraphFigure; guarded by tests/components/graph-figure.test.tsx.
  caption: z.string().min(1).max(GRAPH_FIGURE_CAPTION_MAX).optional(),
  // Width fraction + align (N6), the same fragment image/math/data_plot carry.
  ...sizingFields,
});
export type GraphFigureBlock = z.infer<typeof GraphFigureBlock>;
