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
//   │  box reserved via aspect-ratio BEFORE anything arrives  │
//   └──────┬───────────────────────────────────┬──────────────┘
//          │ graph                             │ image
//          ▼                                   ▼
//   await import('@activity/graph-kit/         <img loading="lazy">
//                 static-svg')                  │ onError
//   renderGraphSvg(axis, drawables, uid)        ▼
//          │                                   alt text in a dashed box
//          ▼
//   uid = blockId + '-' + ownerId — SVG ids are document-global, so two
//   choice graphs on one question would collide on clipPath/marker ids.
//
// WHY THE ENGINE IS IMPORTED LAZILY, when the component using it is eager.
// `bindings.ts` is 19 eager bindings to 4 lazy, and `multiple_choice` and
// `matching` are both EAGER — so a static import of the SVG engine would land
// in the student shell, not in a block chunk. Measured at review time: the
// engine is 5.07 KiB gz against a shell budget with 13.5 KiB of headroom, i.e.
// 38% of the remaining room, for a feature most worksheets never use. So the
// import is dynamic, mirroring `kitSurfaces.ts`'s chunk boundary.
//
// The usual objection to a lazy figure is the layout jump when it arrives.
// That is already answered: the box is reserved by `aspect-ratio` before the
// engine resolves (ruling A8), so nothing reflows — the figure fades into a
// space that was always its size.
//
// PAPER. A lazily-rendered figure could be absent at print time, and paper has
// no second render. Two things hold that: `choiceFigurePreload` warms the chunk
// as soon as a document containing a choice graph mounts, and until every
// figure has resolved this component marks itself `data-figure-pending`, which
// `printReadiness` waits on — the same DOM-predicate discipline it uses for
// `[data-math-pending]` (assert the real state, not a proxy that usually
// agrees with it).
// =============================================================================

import { useEffect, useState } from 'react';
import { VISUALLY_HIDDEN } from './canvasChrome.js';
import type { ChoiceFigureHolder } from './figureSlot.js';

/** Rendered SVG markup, or `null` while the engine chunk is still loading. */
type GraphState = { readonly svg: string } | null;

type SvgEngine = typeof import('@activity/graph-kit/static-svg');
type GraphArgs = Parameters<SvgEngine['renderGraphSvg']>;

// The cast recovers TUPLE-NESS, not correctness — the same one-argument cast
// InteractiveGraph.tsx makes at this identical boundary, for the identical
// reason: the sanitized projection rebuilds object types structurally and
// tuples do not survive that, so `[number, number]` arrives as `number[]`.
// The values are already exactly what the renderer wants; only the type
// widened. Confined to these two arguments.
function drawGraph(
  engine: SvgEngine,
  graph: { axis: unknown; drawables: unknown },
  uid: string,
): string {
  return engine.renderGraphSvg(graph.axis as GraphArgs[0], graph.drawables as GraphArgs[1], uid);
}

/**
 * The lazily-imported renderer, cached after the first resolve so a question
 * with four graphs pays one import, not four.
 */
let enginePromise: Promise<SvgEngine> | null = null;

export function loadSvgEngine(): Promise<SvgEngine> {
  enginePromise ??= import('@activity/graph-kit/static-svg');
  return enginePromise;
}

/** True once the engine is resident — lets a caller skip the pending marker. */
export function svgEngineResident(): boolean {
  return enginePromise !== null && residentEngine !== null;
}

let residentEngine: SvgEngine | null = null;

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

  const [rendered, setRendered] = useState<GraphState>(() =>
    graph && residentEngine
      ? { svg: drawGraph(residentEngine, graph, `${blockId}-${owner.id}`) }
      : null,
  );
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!graph || rendered) return;
    let live = true;
    void loadSvgEngine().then((engine) => {
      residentEngine = engine;
      if (!live) return;
      setRendered({ svg: drawGraph(engine, graph, `${blockId}-${owner.id}`) });
    });
    return () => {
      live = false;
    };
  }, [graph, rendered, blockId, owner.id]);

  if (!image && !graph) return null;

  // The pending marker printReadiness polls. Present only while a graph is
  // genuinely unresolved — an image does not need it (printReadiness already
  // waits on images, and a failed one has a legible fallback).
  const pending = graph && !rendered ? { 'data-figure-pending': 'true' } : {};

  return (
    <span
      className="viewer-choice-figure"
      data-choice-figure={image ? 'image' : 'graph'}
      {...pending}
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
      ) : rendered ? (
        <span
          className="viewer-choice-figure__graph"
          // The ONLY dangerouslySetInnerHTML in the choice surfaces. Input is
          // always renderGraphSvg output, which escapes authored strings.
          dangerouslySetInnerHTML={{ __html: rendered.svg }}
        />
      ) : (
        // The reserved box. Same aspect as the figure that will land in it, so
        // the arrival is a fade, not a jump.
        <span className="viewer-choice-figure__placeholder" aria-hidden="true" />
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
