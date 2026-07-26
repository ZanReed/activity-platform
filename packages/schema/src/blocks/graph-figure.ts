import { z } from 'zod';
import { AxisConfig, Drawable } from './interactive-graph.js';

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

export const GraphFigureBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('graph_figure'),
  axis: AxisConfig,
  drawables: z.array(Drawable).default([]),
});
export type GraphFigureBlock = z.infer<typeof GraphFigureBlock>;
