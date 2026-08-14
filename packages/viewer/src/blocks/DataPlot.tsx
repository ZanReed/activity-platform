// =============================================================================
// blocks/DataPlot.tsx — statistics-chart canvas block (S3)
// -----------------------------------------------------------------------------
// The third canvas block, same skeleton as InteractiveGraph and NumberLine.
// What makes it worth reading separately is the ONE way it differs from every
// other graded block in the system:
//
//   ITS ANSWER IS DERIVABLE FROM WHAT THE STUDENT IS SERVED. The correct
//   dotplot / histogram / boxplot is COMPUTED from `data`, and the student
//   must receive `data` to plot it at all. There is no separately-authored key
//   to strip, which is why the registry documents `data` as
//   `derivableFromServed` rather than pretending it is a secret.
//
// That does not make the client the grader. The kit still computes a `correct`
// locally (it can — it has the data), and the surface DROPS it: under Q2B the
// only verdict a student ever sees comes from the check RPC. Keeping that rule
// even where the client could legitimately grade is what stops "the client
// scores this one block" from becoming a precedent.
//
// The `display` variant renders a static chart and takes no input.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import type { DataPlotBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';
import { dataPlotSurface, type DataPlotSurfaceHandle } from './kitSurfaces.js';
import { renderDataPlotSvg } from '@activity/graph-kit/static-svg';
import { PrintTwin } from './printTwin.js';
import { CANVAS_HOST_STYLE, VISUALLY_HIDDEN } from './canvasChrome.js';
import { useBlockAnswerKey } from '../answer-key/context.js';

/** The chart a build-the-chart question is asking the student to produce. Only
 * consulted for the answer key: a student's frame is empty, so its chart type
 * never mattered before, but a key drawn as the wrong chart type is worse than
 * no key at all. */
function chartForBuild(
  interaction: 'build_dotplot' | 'build_histogram' | 'build_boxplot',
): 'dotplot' | 'histogram' | 'boxplot' {
  if (interaction === 'build_histogram') return 'histogram';
  if (interaction === 'build_boxplot') return 'boxplot';
  return 'dotplot';
}

export default function DataPlot({
  block,
  mode = 'screen',
}: BlockComponentProps<DataPlotBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const answerValues = useBlockAnswerKey(block.id)?.dataPlotValues;
  const mountRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<DataPlotSurfaceHandle | null>(null);
  const [narration, setNarration] = useState('');
  const [mountFailed, setMountFailed] = useState(false);

  const interactionType = block.interaction?.type ?? 'build_dotplot';
  const isDisplay = interactionType === 'display';
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);
  const initialRef = useRef(state.responses.graphs[block.id]);

  useEffect(() => {
    if (isDisplay || mode === 'print') return;
    const el = mountRef.current;
    if (!el) return;

    let cancelled = false;
    const mount = dataPlotSurface();
    // Per-mount host: see InteractiveGraph's header (StrictMode double-mount).
    const host = document.createElement('div');
    host.dataset.graphBoardHost = 'true';
    Object.assign(host.style, CANVAS_HOST_STYLE);
    el.appendChild(host);

    void mount(
      host,
      {
        interactionType,
        data: block.data,
        config: block.config,
      },
      {
        onChange: (response) => {
          store.setGraphWork(block.id, {
            interaction: interactionType,
            // Chart values in the shared canvas wire slot: dot values, bin
            // heights, or the five-number summary, depending on the chart.
            points: response.values.map((v, i) => [i, v] as [number, number]),
          });
          setNarration(describe(interactionType, response.values));
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
          handle.restore(prior.points.map(([, v]) => v));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('[viewer] data plot failed to mount', {
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
  }, [block.id, isDisplay, mode]);

  return (
    <div
      className="viewer-data-plot"
      data-block-type="data_plot"
      data-block-id={block.id}
      data-interaction={interactionType}
      data-phase={phase}
    >
      {block.prompt ? (
        <p className="viewer-data-plot__prompt">
          <InlineContent nodes={block.prompt} />
        </p>
      ) : null}

      {/* A display chart prints the data it exists to show; a build-the-chart
          question prints an EMPTY frame, because plotting the data is the
          task. Narrowed on the interaction so the type system holds that
          apart rather than a boolean.
          A teacher answer key is the third case: the chart the question is
          asking for, drawn from the dataset, in the chart type that question
          builds — reaching this component through the answer channel. */}
      <PrintTwin
        svg={renderDataPlotSvg(
          block.config,
          block.interaction?.type === 'display'
            ? block.interaction.chart
            : chartForBuild(block.interaction?.type ?? 'build_dotplot'),
          block.interaction?.type === 'display'
            ? block.data
            : answerValues
              ? [...answerValues]
              : [],
          block.id,
        )}
      />

      <div
        ref={mountRef}
        className="viewer-data-plot__canvas"
        style={CANVAS_SIZE}
        data-graph-canvas="true"
        {...(isDisplay || mode === 'print'
          ? // role=img from FIRST PAINT — see InteractiveGraph: aria-label on
            // a role-less div is axe's aria-prohibited-attr.
            { role: 'img' }
          : { tabIndex: 0, role: 'application' })}
        aria-label={isDisplay ? 'Chart' : 'Interactive chart'}
      />

      {mountFailed ? (
        <p className="viewer-graph__unavailable" data-graph-unavailable="true" role="note">
          This chart couldn’t load. Your other answers are safe — let your
          teacher know.
        </p>
      ) : null}

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
        <p className="viewer-data-plot__feedback" data-feedback="server">
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

// A DEFINITE height, not a minimum: the host is height:100%, which resolves
// against auto if the parent only has a min — and the kit then falls back to
// its own (very tall) default. Caught in /dev/viewer, where the dotplot filled
// the viewport.
const CANVAS_SIZE = { width: '100%', height: '18rem' } as const;

/** Narration names what the student built, in the chart's own vocabulary. */
function describe(interactionType: string, values: number[]): string {
  if (values.length === 0) return '';
  if (interactionType === 'build_boxplot') {
    const [min, q1, median, q3, max] = values;
    return `Minimum ${min}, lower quartile ${q1}, median ${median}, upper quartile ${q3}, maximum ${max}`;
  }
  if (interactionType === 'build_histogram') {
    return values.map((v, i) => `Bin ${i + 1}: ${v}`).join('. ');
  }
  return `${values.length} value${values.length === 1 ? '' : 's'} plotted`;
}
