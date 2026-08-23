// =============================================================================
// blocks/ChoiceFigure.tsx — the optional figure on a choice, item, or target
// -----------------------------------------------------------------------------
// ONE component for all three carriers. `MultipleChoiceOption`, `MatchingItem`
// and `MatchingTarget` declare a structurally identical figure slot, and the
// EDITOR already recognised that — it shares one `ChoiceFigureEditor` across
// both views behind a `FigureHolder` type. The viewer mirrors that shape rather
// than writing the same figure twice (eng review CQ-1).
//
// It is also the SINGLE place `dangerouslySetInnerHTML` appears in the viewer's
// choice surfaces, so the escaping story has one audit point. What goes in is
// always the output of `renderGraphSvg`, which escapes every authored string
// through `static-svg/html.ts`; nothing else may ever be passed here.
//
//   ChoiceGraph {axis, drawables}          ChoiceImage {src, alt}
//         │                                       │
//         │  (already past the sanitizer: the     │
//         │   deny-list strips correct/feedback/  │
//         │   solution — never image or graph)    │
//         ▼                                       ▼
//   ┌──────────────────── <ChoiceFigure> ─────────────────────┐
//   │        rendered synchronously, nothing to wait for       │
//   └──────┬───────────────────────────────────┬──────────────┘
//          │ graph                             │ image
//          ▼                                   ▼
//   renderGraphSvg(axis, drawables, uid)       <img loading="lazy">
//          │  (static import)                   │ onError
//          ├── '' (degenerate window) ──┐       ▼
//          ▼                            ▼      alt text in a dashed box
//   <span dangerouslySetInnerHTML>   "Figure unavailable"
//                                     data-figure-unavailable="degenerate-axis"
//
//   uid = blockId + '-' + ownerId — SVG ids are document-global, so two
//   choice graphs on one question would collide on clipPath/marker ids.
//
// THE ENGINE IS A STATIC IMPORT (ruling 9A, 2026-08-23) — this consciously
// REVERSES the lazy import this component shipped with (choice-figures E1/T0).
// The reversal came from measuring what that ruling estimated: the built
// `graph-svg` chunk is ~3.3 KiB gz, not the 5.07 KiB quoted (that figure was
// the whole `static-svg` subpath, which a dynamic import pulls as FIVE chunks,
// number-line and data-plot renderers included, for a choice graph that needs
// none of them).
//
// What 3.3 KiB bought back: this component used to carry a two-state dance —
// a cached engine promise, a module-level resident cache, an effect, a
// reserved placeholder, and a `data-figure-pending` marker for the print path
// to wait on. All of it is gone. A synchronous figure cannot be captured
// half-rendered, which matters because the foldable takes `outerHTML` of this
// DOM (`capture.ts`); a placeholder caught mid-flight became permanent
// booklet content.
//
// ⚠ The header used to claim two mechanisms held paper correct: a
// `choiceFigurePreload` that warmed the chunk, and a `printReadiness` wait on
// `[data-figure-pending]`. NEITHER WAS EVER BUILT — `kitPreload.ts` warmed
// only JSXGraph and `printReadiness` polled only math and images, while the
// design doc ticked the task done. Both claims are now moot rather than
// fixed: there is no chunk to warm and no pending state to wait for.
// =============================================================================

import { useState } from 'react';
import { renderGraphSvg } from '@activity/graph-kit/static-svg';
import { VISUALLY_HIDDEN } from './canvasChrome.js';
import type { ChoiceFigureHolder } from './figureSlot.js';

type GraphArgs = Parameters<typeof renderGraphSvg>;

// The cast recovers TUPLE-NESS, not correctness — the same one-argument cast
// InteractiveGraph.tsx and GraphFigure.tsx make at this identical boundary, for
// the identical reason: the sanitized projection rebuilds object types
// structurally and tuples do not survive that, so `[number, number]` arrives as
// `number[]`. The values are already exactly what the renderer wants; only the
// type widened. Confined to these two arguments.
function drawGraph(graph: { axis: unknown; drawables: unknown }, uid: string): string {
  return renderGraphSvg(graph.axis as GraphArgs[0], graph.drawables as GraphArgs[1], uid);
}

export interface ChoiceFigureProps {
  /** The choice / item / target carrying the optional figure. */
  readonly owner: ChoiceFigureHolder;
  /** The block's id — half of the SVG id namespace. */
  readonly blockId: string;
  /**
   * The letter this owner renders under ("B"), used as the accessible name of
   * a GRAPH-only choice: the SVG is `aria-hidden` by construction, so without
   * this the control would have no name at all (ruling A4).
   */
  readonly letterLabel?: string;
  /**
   * True when the owner has NO inline content, so the figure is the whole
   * choice. Promotes `alt` from decorative to the accessible name.
   */
  readonly isSoleContent: boolean;
}

export function ChoiceFigure({
  owner,
  blockId,
  letterLabel,
  isSoleContent,
}: ChoiceFigureProps) {
  const image = owner.image;
  // A5: both may technically be set; image wins. The editor and importer each
  // enforce exclusivity, so this only decides an authored-by-hand document.
  const graph = image ? undefined : owner.graph;

  // Synchronous: the engine is a static import (see the header). '' means the
  // engine refused a degenerate window, which takes the same legible fallback
  // the image branch uses rather than rendering a blank.
  const svg = graph ? drawGraph(graph, `${blockId}-${owner.id}`) : '';
  const [imageFailed, setImageFailed] = useState(false);

  if (!image && !graph) return null;

  // The pending marker printReadiness polls. Present only while a graph is
  // genuinely unresolved — an image does not need it (printReadiness already
  // waits on images, and a failed one has a legible fallback).
  return (
    <span
      className="viewer-choice-figure"
      data-choice-figure={image ? 'image' : 'graph'}
      {...(graph && svg === '' ? { 'data-figure-unavailable': 'degenerate-axis' } : {})}
    >
      {image ? (
        imageFailed ? (
          // A8: never a browser broken-image glyph. Whatever is on screen at
          // print time is what prints, and a student cannot act on a broken
          // icon. The alt text can at least describe what is missing.
          <span className="viewer-choice-figure__failed" role="img" aria-label={image.alt || 'Figure unavailable'}>
            {image.alt || 'Figure unavailable'}
          </span>
        ) : (
          <img
            className="viewer-choice-figure__img"
            src={image.src}
            // A4: an empty alt is correct for a figure BESIDE text (Image.tsx's
            // doctrine). It is wrong when the figure IS the choice — that
            // renders a control with no accessible name at all.
            alt={isSoleContent ? image.alt || `Choice ${letterLabel ?? ''}`.trim() : image.alt}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )
      ) : svg === '' ? (
        // The engine refused the window (xMin >= xMax). Same legible failure
        // as the broken-image branch above, for the same reason: a blank tells
        // a student nothing and prints as nothing.
        <span className="viewer-choice-figure__failed" role="img" aria-label="Figure unavailable">
          Figure unavailable
        </span>
      ) : (
        <span
          className="viewer-choice-figure__graph"
          // The ONLY dangerouslySetInnerHTML in the choice surfaces. Input is
          // always renderGraphSvg output, which escapes authored strings.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}

      {/* A4, graph branch: renderGraphSvg hardcodes aria-hidden on its <svg>,
          so a graph-only choice has no accessible name unless one is supplied
          here. Falls through to the letter, exactly as showCellLabels resolved
          the same problem for table sub-labels. */}
      {graph && isSoleContent && letterLabel ? (
        <span className="viewer-visually-hidden" style={VISUALLY_HIDDEN}>
          {`Choice ${letterLabel}`}
        </span>
      ) : null}
    </span>
  );
}

export default ChoiceFigure;
