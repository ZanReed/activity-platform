// =============================================================================
// blocks/NumberLine.tsx — 1-D canvas block (S3, copied from InteractiveGraph)
// -----------------------------------------------------------------------------
// A number line is a one-dimensional graph, so this is the graph exemplar with
// the geometry narrowed: the same lazy kit seam, the same per-mount host, the
// same work-only response, the same server-only verdicts.
//
// The two details that are NOT copy-paste:
//
//  - Positions are 1-D. They ride the shared `graphs` wire category as
//    [value, 0] pairs, so one category carries every canvas block and the
//    server dispatches on the served interaction type it already knows.
//  - `plot_interval` also carries endpoint STYLES (open/closed). Those are
//    part of the student's answer — "2 ≤ x < 7" differs from "2 < x < 7" — so
//    they travel in `domain`, not as loose points.
//
// The per-mount host below is load-bearing, not decoration: React dev-mode
// runs mount → cleanup → mount, the kit clears its container on mount, and a
// SHARED container means the second clear wipes the first board's DOM. Learned
// on InteractiveGraph; see that file's header.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import type { NumberLineBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';
import { numberLineSurface, type NumberLineSurfaceHandle } from './kitSurfaces.js';
import { CANVAS_HOST_STYLE, VISUALLY_HIDDEN } from './canvasChrome.js';

export default function NumberLine({
  block,
  mode = 'screen',
}: BlockComponentProps<NumberLineBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<NumberLineSurfaceHandle | null>(null);
  const [narration, setNarration] = useState('');
  const [mountFailed, setMountFailed] = useState(false);

  const interactionType = block.interaction?.type ?? 'plot_point';
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);
  const initialRef = useRef(state.responses.graphs[block.id]);

  useEffect(() => {
    if (mode === 'print') return;
    const el = mountRef.current;
    if (!el) return;

    let cancelled = false;
    const mount = numberLineSurface();
    const host = document.createElement('div');
    host.dataset.graphBoardHost = 'true';
    Object.assign(host.style, CANVAS_HOST_STYLE);
    el.appendChild(host);

    void mount(
      host,
      {
        interactionType,
        config: block.config,
        ...(block.questionShape ? { questionShape: block.questionShape } : {}),
      },
      {
        onChange: (response) => {
          store.setGraphWork(block.id, {
            interaction: interactionType,
            // 1-D positions in the shared 2-D wire slot.
            points: response.values.map((v) => [v, 0] as [number, number]),
            ...(response.interval
              ? {
                  domain: {
                    ...(response.interval.min !== undefined
                      ? { minX: response.interval.min }
                      : {}),
                    ...(response.interval.minStyle
                      ? { minStyle: response.interval.minStyle }
                      : {}),
                    ...(response.interval.max !== undefined
                      ? { maxX: response.interval.max }
                      : {}),
                    ...(response.interval.maxStyle
                      ? { maxStyle: response.interval.maxStyle }
                      : {}),
                  },
                }
              : {}),
          });
          setNarration(describe(response.values, response.interval));
        },
      },
    )
      .then((handle) => {
        if (cancelled) {
          handle.destroy();
          return;
        }
        handleRef.current = handle;
        const prior = initialRef.current;
        if (prior?.points?.length) {
          handle.restore(prior.points.map(([v]) => v));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('[viewer] number line failed to mount', {
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
      host.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id, mode]);

  return (
    <div
      className="viewer-number-line"
      data-block-type="number_line"
      data-block-id={block.id}
      data-interaction={interactionType}
      data-phase={phase}
    >
      {block.prompt ? (
        <p className="viewer-number-line__prompt">
          <InlineContent nodes={block.prompt} />
        </p>
      ) : null}

      <div
        ref={mountRef}
        className="viewer-number-line__canvas"
        style={CANVAS_SIZE}
        data-graph-canvas="true"
        {...(mode === 'print' ? {} : { tabIndex: 0, role: 'application' })}
        aria-label="Number line"
      />

      {mountFailed ? (
        <p className="viewer-graph__unavailable" data-graph-unavailable="true" role="note">
          This number line couldn’t load. Your other answers are safe — let your
          teacher know.
        </p>
      ) : null}

      {mode === 'screen' ? (
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
        <p className="viewer-number-line__feedback" data-feedback="server">
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

// Definite height (see DataPlot's note); a line is wide and short, not the
// graph's square.
const CANVAS_SIZE = { width: '100%', height: '7rem' } as const;

/** Narration: where the handles sit, and for an interval whether each end is
 * included. Says nothing about correctness. */
function describe(
  values: number[],
  interval?: { min?: number; minStyle?: string; max?: number; maxStyle?: string },
): string {
  if (interval && (interval.min !== undefined || interval.max !== undefined)) {
    const lo =
      interval.min === undefined
        ? 'unbounded'
        : `${interval.min} ${interval.minStyle === 'open' ? 'not included' : 'included'}`;
    const hi =
      interval.max === undefined
        ? 'unbounded'
        : `${interval.max} ${interval.maxStyle === 'open' ? 'not included' : 'included'}`;
    return `From ${lo} to ${hi}`;
  }
  if (values.length === 0) return '';
  return values.length > 1
    ? values.map((v, i) => `Point ${i + 1}: ${v}`).join('. ')
    : `At ${values[0]}`;
}
