// =============================================================================
// blocks/GraphFigure.tsx — static graph figure (S3; converged 2026-08-23)
// -----------------------------------------------------------------------------
// KIT-FREE, and now kit-free the way the rest of the repo already was: by
// calling `renderGraphSvg`, the one static-SVG engine, instead of a second
// hand-rolled one. No JSXGraph, no MathLive, no runtime — a plain string of
// SVG, so this works in the reference panel, on paper, and on a page that
// never loads the graph chunk.
//
//   block.axis, block.drawables
//         │
//         ▼
//   renderGraphSvg(axis, drawables, block.id)     ← @activity/graph-kit/static-svg
//         │
//         ├── ''  (degenerate window: xMin >= xMax)
//         │       └──► <figure data-figure-unavailable="degenerate-axis">
//         │              "Figure unavailable"  — never a silent blank
//         ▼
//   <figure class="viewer-figure" role="img" aria-label="Graph figure"
//           dangerouslySetInnerHTML={svg}/>   ← input is ALWAYS engine output,
//                                                which escapes authored strings
//     ↳ set on the FIGURE, so the engine's <svg> is a direct child: the
//       `figure/capped` print rule targets `.viewer-figure > svg`.
//
// WHY THIS FILE STOPPED DRAWING ITS OWN SVG (graph-figure-convergence.md).
// It used to, and it skipped `curve` drawables on the stated grounds that "the
// graph-figure authoring UI only offers kit-free drawables, so this is a guard
// against future drift, not a live gap". That sentence was false in both
// directions. THERE IS NO `line` DRAWABLE KIND: a line is
// `{kind:'curve', model:{family:'linear'}}`, so skipping curves dropped every
// line a teacher drew — the "these two lines are parallel" picture this block
// exists to render. Measured before the fix (T0), on the four figures in
// `scripts/graph-figure-test.md`: two parallel lines drew 0 marks, a parabola
// drew 0 marks. The editor's own preview has always used `renderGraphSvg`, so
// the teacher saw the line and the student got an empty grid.
//
// The engine also draws what the hand-rolled version only approximated:
// arrowheads on rays, endpoint dots, point labels, and authored colour. Those
// were four more silent losses, not stylistic differences.
//
// THE ENGINE IS A STATIC IMPORT, DELIBERATELY (ruling 9A). The built chunk is
// ~3.3 KiB gz. A dynamic import would save that and cost a pending state on
// every surface that renders a figure — a placeholder the print path must wait
// for, a preload to keep offline working, a retry when the fetch fails. The
// foldable CAPTURES this DOM (`capture.ts`), so a placeholder caught mid-flight
// becomes permanent booklet content. Synchronous rendering makes paper correct
// by construction. Do not make this lazy to reclaim 3 KiB.
//
// `expression` drawables are still not drawn: they need the calculator's
// formula parser, which no static renderer carries. That limit is the ENGINE's
// (see graph-svg.ts's header) and both authoring surfaces refuse the kind, so
// it is enforced upstream rather than silently here.
// =============================================================================

import type { GraphFigureBlock } from '@activity/schema';
import { renderGraphSvg } from '@activity/graph-kit/static-svg';
import type { BlockComponentProps } from '../registry/types.js';

/** The one cause of an undrawable figure today. A second makes this an enum. */
const UNAVAILABLE_REASON = 'degenerate-axis';

export default function GraphFigure({ block }: BlockComponentProps<GraphFigureBlock>) {
  // The cast recovers TUPLE-NESS, not correctness — the same cast
  // ChoiceFigure and InteractiveGraph make at this identical boundary: the
  // sanitized projection rebuilds object types structurally and tuples do not
  // survive that, so `[number, number]` arrives as `number[]`. The values are
  // already exactly what the engine wants; only the type widened.
  type Args = Parameters<typeof renderGraphSvg>;
  const svg = renderGraphSvg(block.axis as Args[0], block.drawables as Args[1], block.id);

  // The engine returns '' for a window it cannot map (xMin >= xMax). Rendering
  // that raw is a blank where a teacher authored a picture, so it takes the
  // same legible fallback the image branch of a choice figure uses. The schema
  // still admits the bad window; refusing it at the authoring surfaces is
  // filed in TODOS against the next schema-changing slice.
  if (svg === '') {
    return (
      <figure
        className="viewer-figure viewer-figure--unavailable"
        data-block-type="graph_figure"
        data-figure-unavailable={UNAVAILABLE_REASON}
        role="img"
        aria-label="Figure unavailable"
      >
        Figure unavailable
      </figure>
    );
  }

  return (
    <figure
      className="viewer-figure"
      data-block-type="graph_figure"
      // The engine hardcodes aria-hidden on its <svg>, so the accessible name
      // lives here or nowhere. It is deliberately generic: `graph_figure` has
      // no caption or alt field, and a name derived from the drawables would
      // invent meaning the teacher never wrote ("2 lines" is not "parallel").
      role="img"
      aria-label="Graph figure"
      // The ONE dangerouslySetInnerHTML in this block. Input is always
      // renderGraphSvg output, which escapes every authored string.
      //
      // Set on the <figure> itself rather than on a wrapper span, so the
      // engine's <svg> is a DIRECT child: the print rule targets
      // `.viewer-figure > svg` and a wrapper would silently push it out of
      // reach, which is the vacuity class that rule was just split to avoid.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
