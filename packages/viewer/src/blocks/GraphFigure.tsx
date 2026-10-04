// =============================================================================
// blocks/GraphFigure.tsx — static graph figure (S3; converged 2026-08-23)
// -----------------------------------------------------------------------------
// KIT-FREE, and now kit-free the way the rest of the repo already was: by
// calling `renderGraphSvg`, the one static-SVG engine, instead of a second
// hand-rolled one. No JSXGraph, no MathLive, no runtime — a plain string of
// SVG, so this works in the reference panel, on paper, and on a page that
// never loads the graph chunk.
//
//   block.axis, block.drawables, block.plane
//         │
//         ▼
//   renderGraphSvg(axis, drawables, block.id, _, {plane})  ← graph-kit/static-svg
//         │
//         ├── ''  (degenerate window: xMin >= xMax)       → "degenerate-axis"
//         ├── plane-less with nothing to draw              → "degenerate-figure"
//         │       └──► <figure data-figure-unavailable=…> "Figure unavailable"
//         ▼
//   <figure class="viewer-figure-wrap">                     (ER-8)
//     <div class="viewer-figure" role="img" aria-label={alt ?? "Graph figure"}
//          dangerouslySetInnerHTML={svg}/>  ← input is ALWAYS engine output,
//                                             which escapes authored strings
//     <figcaption>Not to scale</figcaption>  ← plane-less, unless toScale (N8)
//   </figure>
//     ↳ the markup is set on the .viewer-figure DIV, so the engine's <svg> is
//       a direct child: the `figure/standalone-capped` print rule targets
//       `.viewer-figure > svg`. The caption is a SIBLING of that div, never a
//       child: a node holding dangerouslySetInnerHTML cannot have children,
//       and role="img" makes its children presentational, so a caption inside
//       it would be invisible to a screen reader (ER-8). As a sibling inside
//       the <figure> it is read after the name, prints, and can never collide
//       with the engine's automatic label placement.
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

import { useContext, type CSSProperties } from 'react';
import type { GraphFigureBlock } from '@activity/schema';
import { figureGeometry, figureLabelScale, renderGraphSvg } from '@activity/graph-kit/static-svg';
import { ColumnShareContext } from '../container/layoutStyles.js';
import type { BlockComponentProps } from '../registry/types.js';

/** Why a figure could not be drawn (N2). Named in the DOM for diagnosis. */
type UnavailableReason = 'degenerate-axis' | 'degenerate-figure';

export default function GraphFigure({ block }: BlockComponentProps<GraphFigureBlock>) {
  // The cast recovers TUPLE-NESS, not correctness — the same cast
  // ChoiceFigure and InteractiveGraph make at this identical boundary: the
  // sanitized projection rebuilds object types structurally and tuples do not
  // survive that, so `[number, number]` arrives as `number[]`. The values are
  // already exactly what the engine wants; only the type widened.
  type Args = Parameters<typeof renderGraphSvg>;
  // `plane` defaults true in the schema; a document parsed before the field
  // existed has it filled by zod, and `!== false` keeps an unparsed one safe.
  const plane = block.plane !== false;
  const axis = block.axis as Args[0];
  // SMALL FIGURES (side-by-side, 2026-10-04). The share of the row this figure
  // is drawn at — its column's share times its own width fraction — decides
  // how much its labels and marks are enlarged and whether tick labels are
  // kept. Derived here, never stored; 1 outside a row (reference panel,
  // definitions), where nothing changes.
  const share = useContext(ColumnShareContext) * (block.width ?? 1);
  const small = figureLabelScale(share);
  const svg = renderGraphSvg(axis, block.drawables as Args[1], block.id, undefined, {
    plane,
    labelScale: small.labelScale,
    tickLabels: small.tickLabels,
  });
  const alt = block.alt?.trim();
  const caption = block.caption?.trim();

  // A sized figure (N6) fills the footprint the author gave it; the 20rem
  // screen cap and the 3.25in paper cap stand only for an unsized one. Set as
  // inline custom properties rather than new rules (ER-9: the shell CSS budget).
  const sized: CSSProperties | undefined =
    block.width === undefined
      ? undefined
      : ({
          '--vw-figure-cap-standalone': '100%',
          '--vw-figure-cap-standalone-print': '100%',
        } as CSSProperties);

  // The engine returns '' for a window it cannot map (xMin >= xMax): refused at
  // the schema since the Y7 slice, but a draft can still hold one. A plane-less
  // figure with nothing on it is the other undrawable case — a blank box over
  // a "Not to scale" caption tells a student nothing.
  const reason: UnavailableReason | null =
    svg === '' ? 'degenerate-axis' : !plane && block.drawables.length === 0 ? 'degenerate-figure' : null;
  if (reason) {
    // The fallback reserves the box the figure would have taken (Q4): the
    // computed aspect when the window is valid, square when it is not.
    const g = figureGeometry(axis, plane);
    return (
      <figure
        className="viewer-figure viewer-figure--unavailable"
        data-block-type="graph_figure"
        data-figure-unavailable={reason}
        role="img"
        aria-label="Figure unavailable"
        style={g ? { ...sized, aspectRatio: `${g.W} / ${g.H}` } : sized}
      >
        Figure unavailable
      </figure>
    );
  }

  return (
    <figure className="viewer-figure-wrap" data-block-type="graph_figure" style={sized}>
      {caption ? (
        // The letter (or word) a question refers to this figure by. Above the
        // picture, so it reads before it; inline-styled (ER-9: the shell
        // stylesheet's headroom). Hidden from the accessibility tree because
        // the figure's NAME below already begins with it.
        <div data-figure-caption="" aria-hidden="true" style={{ fontWeight: 700, textAlign: 'center' }}>
          {caption}
        </div>
      ) : null}
      <div
        className="viewer-figure"
        // The engine hardcodes aria-hidden on its <svg>, so the accessible
        // name lives here or nowhere: the author's `alt:` (D11), else a
        // generic name — never one derived from the drawables, which would
        // invent meaning the teacher never wrote ("2 lines" is not "parallel").
        role="img"
        // With a caption the name leads with it, so "which diagram?" works by
        // ear: "Figure A: a triangle on the left of a dashed line".
        aria-label={caption ? `Figure ${caption}: ${alt || 'Graph figure'}` : alt || 'Graph figure'}
        // The ONE dangerouslySetInnerHTML in this block. Input is always
        // renderGraphSvg output, which escapes every authored string.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {!plane && !block.toScale ? (
        // N8: NZ assessment convention. Plane-less figures are placed by
        // coordinates but labelled independently, so they are not to scale
        // unless the author says `to scale`. Reuses the image caption's style.
        <figcaption className="viewer-image__caption">Not to scale</figcaption>
      ) : null}
    </figure>
  );
}
