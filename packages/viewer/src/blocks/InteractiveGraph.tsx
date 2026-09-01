// =============================================================================
// blocks/InteractiveGraph.tsx — the KIT-BACKED exemplar (S3 V9)
// -----------------------------------------------------------------------------
// The fourth template, and the one the other canvas blocks (number_line,
// data_plot) copy — they share almost nothing with the DOM-selection pattern
// of MultipleChoice. What this file demonstrates:
//
//  1. A LAZY binding (the first one). graph-kit drags JSXGraph behind it, which
//     is the weight D16 reserves 'lazy' for. The dynamic import lives in
//     graphSurface.ts, so a worksheet with no graph never pays for it.
//
//  2. Mounting an imperative widget from React without letting it own state.
//     The kit writes to the store on every change; the store is still the
//     single source of truth, and the widget is re-seeded FROM it on mount
//     (reload restores the student's work).
//
//  3. Server-authoritative grading through a widget that used to grade itself.
//     The surface mounts the kit's ungraded input mode — no answer key exists
//     on this client — and `graphSurface` drops the kit's `correct` before it
//     can reach the viewer. Verdicts come only from the check RPC, exactly as
//     in MultipleChoice.
//
//  4. `questionShape`, the sanitizer's derived layout hint, is what tells the
//     widget how many handles to draw now that the key is gone.
//
// A11y (its registry story): the board is focusable and handles move by arrow
// key — the kit owns that. THIS component owns the narration: positions go to
// a VISUALLY-HIDDEN aria-live region, deliberately not a visible readout,
// because reading coordinates off the grid is the skill being assessed.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import type { InteractiveGraphBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';
import { graphSurface, type GraphSurfaceHandle } from './kitSurfaces.js';
import { CANVAS_HOST_STYLE, VISUALLY_HIDDEN } from './canvasChrome.js';
import { renderGraphSvg, questionDrawables } from '@activity/graph-kit/static-svg';
import { PrintTwin } from './printTwin.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { ANSWER_KEY_INK } from '../answer-key/types.js';

export default function InteractiveGraph({
  block,
  mode = 'screen',
}: BlockComponentProps<InteractiveGraphBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const answerKey = useBlockAnswerKey(block.id);
  const answerOverlay = answerKey?.graphOverlay;
  const mountRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<GraphSurfaceHandle | null>(null);
  const [narration, setNarration] = useState('');
  const [mountFailed, setMountFailed] = useState(false);

  const interactionType = block.interaction?.type ?? 'plot_point';
  const isDisplay = interactionType === 'display';
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);

  // Bootstrap value, read ONCE at mount: re-seeding on every render would
  // fight the student's dragging.
  const initialRef = useRef(state.responses.graphs[block.id]);

  useEffect(() => {
    // Display graphs take no input, and print mode renders the static
    // fallback — neither mounts an interactive board.
    if (isDisplay || mode === 'print') return;
    const el = mountRef.current;
    if (!el) return;

    let cancelled = false;
    const mount = graphSurface();

    // Each mount gets its OWN child container instead of the shared canvas
    // div. React dev-mode (StrictMode) runs mount → cleanup → mount, and both
    // async mounts overlap; the kit begins with `mount.textContent = ''`, so
    // on a shared element whichever mount cleared LAST wiped the other's
    // freshly built board — a live board object with empty DOM, which is
    // exactly what /dev/viewer showed (JXG.boards held 6 boards, 4 of them
    // with empty containers, a different 4 each run). A per-mount host makes
    // the two lifetimes disjoint: this mount clears and draws only in its own
    // child, and cleanup removes that child synchronously.
    const host = document.createElement('div');
    host.dataset.graphBoardHost = 'true';
    Object.assign(host.style, CANVAS_HOST_STYLE);
    el.appendChild(host);

    void mount(
      host,
      {
        interactionType,
        axisConfig: block.axisConfig,
        ...(block.questionShape ? { questionShape: block.questionShape } : {}),
        ...(block.allowNoSolution !== undefined
          ? { allowNoSolution: block.allowNoSolution }
          : {}),
        // transform_curve: the SHOWN parent + the reload channels. `start`
        // survives sanitize by design — it is the question. The buffered
        // equation/drag bit ride the config because the restore handle is
        // points-only (design A2).
        ...(interactionType === 'transform_curve'
          ? {
              startModel: (
                block.interaction as { start?: unknown } | undefined
              )?.start,
              requireEquation:
                (block.interaction as { requireEquation?: boolean } | undefined)
                  ?.requireEquation !== false,
              ...(initialRef.current?.equation !== undefined
                ? { initialEquation: initialRef.current.equation }
                : {}),
              ...(initialRef.current?.dragged === true
                ? { initialDragged: true }
                : {}),
            }
          : {}),
      },
      {
        onChange: (response) => {
          // The kit reports; the STORE decides. Work only — the surface has
          // already dropped anything grading-shaped.
          store.setGraphWork(block.id, {
            interaction: interactionType,
            points: response.points,
            ...(response.noSolution !== undefined
              ? { noSolution: response.noSolution }
              : {}),
            ...(response.domain !== undefined ? { domain: response.domain } : {}),
            // plot_ray / plot_segment: the chosen shape + endpoint styles are
            // part of the answer, not decoration — without them the grader
            // cannot tell "2 ≤ x < 7" from "2 < x < 7".
            ...(response.shape !== undefined ? { shape: response.shape } : {}),
            ...(response.endpointStyles !== undefined
              ? { endpointStyles: response.endpointStyles }
              : {}),
            // transform_curve: the typed channel + the drag bit (A1 — without
            // `dragged` the seed positions would read as drawn work).
            ...(response.equation !== undefined
              ? { equation: response.equation }
              : {}),
            ...(response.dragged !== undefined
              ? { dragged: response.dragged }
              : {}),
            ...(response.strict !== undefined || response.side !== undefined
              ? {
                  parts: [
                    {
                      points: response.points,
                      ...(response.strict !== undefined
                        ? { strict: response.strict }
                        : {}),
                      ...(response.side !== undefined
                        ? { side: response.side }
                        : {}),
                    },
                  ],
                }
              : {}),
          });
          setNarration(describePoints(response.points));
        },
      },
    )
      .then((handle) => {
        if (cancelled) {
          handle.destroy();
          return;
        }
        handleRef.current = handle;
        // Restore prior work (reload / re-open).
        const prior = initialRef.current;
        // transform_curve: restore points only for genuinely DRAGGED work —
        // restoring buffered seed positions would pin the handles there and
        // the equation/drag channels already rode the mount config.
        if (prior?.points?.length) {
          if (interactionType !== 'transform_curve' || prior.dragged === true) {
            handle.restore(prior.points);
          }
        }
      })
      .catch((err: unknown) => {
        // A board that fails to mount must SAY so. Without this the promise
        // rejection is swallowed and the student sees an empty rectangle with
        // no explanation — which is exactly how three broken variants hid
        // during the first /dev/viewer run.
        if (cancelled) return;
        console.error('[viewer] graph surface failed to mount', {
          blockId: block.id,
          interactionType,
          err,
        });
        setMountFailed(true);
      });

    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
      // Synchronous, even though the board may still be mid-mount: a
      // late-resolving board builds into this now-detached div (invisible)
      // and is freed by the cancelled → destroy path above.
      host.remove();
    };
    // block.id keys the widget; the rest is read once at mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id, isDisplay, mode]);

  return (
    <div
      className="viewer-graph"
      data-block-type="interactive_graph"
      data-block-id={block.id}
      data-interaction={interactionType}
      data-phase={phase}
    >
      {block.prompt ? (
        <p className="viewer-graph__prompt">
          <InlineContent nodes={block.prompt} />
        </p>
      ) : null}

      {/* What actually prints (S5-1/OV4): empty axes for a question the
          student plots onto, the authored drawables for a display figure —
          and, on a teacher answer key only, the answer drawn over the axes. */}
      <PrintTwin
        svg={renderGraphSvg(
          block.axisConfig,
          // THREE cases, in the order that keeps the student invariant intact:
          //
          // The answer overlay is a SEPARATE channel (D8A) reaching this
          // component through the teacher-only context, never through the
          // block. That matters: the display branch below stays narrowed on
          // the interaction itself rather than on a boolean, so only a display
          // variant HAS drawables and the type system still proves a question's
          // twin cannot carry any. Widening that field to carry answers would
          // have deleted exactly the proof this file relies on.
          //
          // The cast recovers tuple-ness, not correctness: the sanitized
          // projection maps [number, number] to number[] (it rebuilds object
          // types structurally and tuples do not survive that), so the values
          // are already exactly what the renderer wants and only the type has
          // widened. Confined to this one argument.
          answerOverlay
            ? // A key still shows the QUESTION under the answer: for
              // transform_curve that is the dashed start curve (empty for
              // every other variant), so a teacher reads "from here, to here".
              [...questionDrawables(block), ...answerOverlay]
            : block.interaction?.type === 'display'
              ? (block.interaction.drawables as Parameters<typeof renderGraphSvg>[1])
              : // The empty-axes invariant's new spelling: questionDrawables
                // returns [] for every variant EXCEPT transform_curve, whose
                // start curve is the question itself (a student cannot
                // transform a parent they cannot see). Centralized in
                // graph-kit so the print twin and any future static surface
                // agree on what a question shows.
                questionDrawables(block),
          block.id,
          // A distinct neutral ink, so a teacher reads the overlay as "added
          // for the key" rather than as authored content.
          answerOverlay ? ANSWER_KEY_INK : undefined,
        )}
      />

      {/* "No solution" is an answer, and an empty grid cannot say it. Without
          this a teacher cannot tell a no-solution key from a question whose key
          failed to render. */}
      {/* transform_curve's typed channel on paper: a write line for the
          student, the target equation on a teacher key. Same eager-DOM idiom
          as the matching letter line — hidden on screen, revealed by @media
          print (a key's filled line also shows in the teacher preview). */}
      {block.interaction?.type === 'transform_curve' &&
      block.interaction.requireEquation !== false ? (
        <p
          className="viewer-graph__equation-line"
          {...(answerKey?.graphEquation ? { 'data-answer-key': 'equation' } : {})}
        >
          {answerKey?.graphEquation ? (
            <span className="viewer-graph__equation-key">
              {answerKey.graphEquation}
            </span>
          ) : (
            <>
              {'y = '}
              <span className="viewer-graph__equation-blank" aria-hidden="true" />
            </>
          )}
        </p>
      ) : null}

      {answerKey?.graphNoSolution ? (
        <p className="viewer-graph__answer-note" data-answer-key="no-solution">
          Answer: no solution
        </p>
      ) : null}

      <div
        ref={mountRef}
        className="viewer-graph__canvas"
        // A board needs a SIZED container: JSXGraph measures its mount point,
        // and in a zero-height box it builds an svg of height 0 and draws
        // nothing. Found in /dev/viewer, where boards mounted only
        // intermittently until this was set. Inline so the component is
        // self-sufficient — the stylesheet pass can override via the class,
        // but a graph must never depend on external CSS merely to exist.
        style={CANVAS_SIZE}
        data-graph-canvas="true"
        // Focusable and named by THIS component rather than delegated to the
        // kit: the registry's a11y story promises a focusable canvas, and a
        // keyboard user should reach it even before the lazy chunk lands (or
        // if it never does). The kit adds arrow-key handling on top.
        {...(isDisplay || mode === 'print'
          ? // role=img from FIRST PAINT: aria-label on a role-less div is
            // prohibited (axe aria-prohibited-attr — the a11y lane's first CI
            // run caught it), and the kit's own role=img lands only after the
            // lazy chunk mounts.
            { role: 'img' }
          : { tabIndex: 0, role: 'application' })}
        aria-label={isDisplay ? 'Graph' : 'Interactive graph'}
      />

      {mountFailed ? (
        <p className="viewer-graph__unavailable" data-graph-unavailable="true" role="note">
          This graph couldn’t load. Your other answers are safe — let your
          teacher know.
        </p>
      ) : null}

      {/* Position narration — visually hidden ON PURPOSE (registry a11y story:
          a visible readout would hand over the answer). */}
      {!isDisplay && mode === 'screen' ? (
        <span
          className="viewer-visually-hidden"
          style={VISUALLY_HIDDEN}
          data-graph-narration="true"
          role="status"
          aria-live="polite"
        >
          {narration}
        </span>
      ) : null}

      {phase === 'checking' ? <StatePill state="pending" label="Checking…" /> : null}
      {result ? (
        <StatePill state={result.verdict === 'correct' ? 'correct' : 'incorrect'} />
      ) : null}

      {result?.feedback ? (
        <p className="viewer-graph__feedback" data-feedback="server">
          <InlineContent nodes={result.feedback} />
        </p>
      ) : null}

      {solution ? (
        <details className="viewer-solution">
          <summary>Show solution</summary>
          <div className="viewer-solution__body">
            <InlineContent nodes={solution} />
          </div>
        </details>
      ) : null}
    </div>
  );
}

/** Minimum viable board box; the styling pass refines it via the class. */
const CANVAS_SIZE = { width: '100%', aspectRatio: '1 / 1', minHeight: '18rem' } as const;

/** Narration text for the live region. Says WHERE the handles are, which the
 * student could read off the grid themselves — never whether it is right. */
function describePoints(points: [number, number][]): string {
  if (points.length === 0) return '';
  const round = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
  return points
    .map((p, i) =>
      points.length > 1
        ? `Point ${i + 1}: ${round(p[0])}, ${round(p[1])}`
        : `${round(p[0])}, ${round(p[1])}`,
    )
    .join('. ');
}
