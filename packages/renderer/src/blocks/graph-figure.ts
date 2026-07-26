// =============================================================================
// graph-figure.ts — Render a static coordinate-plane picture
// -----------------------------------------------------------------------------
// A pure content block: the standalone promotion of the MC/matching choice
// figure, built for the reference panel ("these two lines are parallel" on a
// formula sheet). The SAME kit-free SVG engine as the interactive block's
// print/no-JS fallback (graph-svg.ts) — inline, static, works on paper;
// `expression` drawables are absent by the engine's documented limitation.
// data-block-category="content" keeps it out of scoring/indexing; it never
// pulls a problem number and the runtime never touches it.
// =============================================================================

import type { GraphFigureBlock } from '@activity/schema';
import { attr } from '../html.js';
import { renderGraphSvg } from '../graph-svg.js';

export function renderGraphFigure(block: GraphFigureBlock): string {
  return (
    '<div class="block block-graph-figure"' +
    ' data-block-category="content"' +
    ' data-block-type="graph_figure"' +
    ' data-block-id="' + attr(block.id) + '">' +
    renderGraphSvg(block.axis, block.drawables, block.id) +
    '</div>'
  );
}
