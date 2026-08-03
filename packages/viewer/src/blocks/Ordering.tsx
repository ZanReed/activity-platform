// =============================================================================
// blocks/Ordering.tsx — arrange-in-order (S3)
// -----------------------------------------------------------------------------
// THE AUTHORED ORDER IS THE ANSWER, which is why the server serves these items
// already shuffled (per student, deterministically) and why the response is a
// list of ITEM IDS, never positions. Nothing in this file may sort by anything
// other than what the student chose.
//
// Interaction is move-up / move-down BUTTONS, not drag-and-drop. That is a
// deliberate choice, not a simplification: drag is unusable by keyboard and
// hostile on the touch devices half these students use, and the existing
// runtime shipped pointer-drag that had to be separately verified on a real
// device. Buttons are operable by keyboard, screen reader, mouse, and touch on
// day one; a drag affordance can be ADDED later on top of the same state
// without taking that away.
//
// Announcement matters as much as the move: after any reorder the live region
// says what moved and where, because a silent DOM shuffle is invisible to a
// screen reader.
// =============================================================================

import { useState } from 'react';
import type { OrderingBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';
import { VISUALLY_HIDDEN } from './canvasChrome.js';

export default function Ordering({
  block,
  mode = 'screen',
}: BlockComponentProps<OrderingBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const [announcement, setAnnouncement] = useState('');
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);

  // The student's arrangement, defaulting to the order they were SERVED
  // (already shuffled server-side — never re-sorted here).
  const servedIds = block.items.map((item) => item.id);
  const order = state.responses.orderings[block.id] ?? servedIds;
  const byId = new Map(block.items.map((item) => [item.id, item]));

  // The key holds each item's position in the AUTHORED order. Printed beside
  // the item wherever the served shuffle happens to have placed it, which is
  // exactly what "number the steps 1 to N" asks a student to work out.
  const answerKey = useBlockAnswerKey(block.id);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    store.setOrdering(block.id, next);
    setAnnouncement(`Moved to position ${to + 1} of ${next.length}`);
  };

  return (
    <div
      className="viewer-ordering"
      data-block-type="ordering"
      data-block-id={block.id}
      data-phase={phase}
    >
      <p className="viewer-ordering__prompt">
        <InlineContent nodes={block.prompt} />
      </p>

      <ol className="viewer-ordering__list">
        {order.map((id, index) => {
          const item = byId.get(id);
          if (!item) return null;
          const keyPosition = answerKey?.positionByItemId?.[id];
          return (
            <li key={id} className="viewer-ordering__item" data-item-id={id}>
              {/* The paper convention: "number the steps 1 to N" in a box. The
                  reorder buttons are the screen answer and are hidden in print;
                  this is hidden on screen. Both are always in the DOM because
                  the browser's print command gives no chance to build one. */}
              <span
                className={
                  keyPosition === undefined
                    ? 'viewer-ordering__number-box'
                    : 'viewer-ordering__number-box viewer-ordering__number-box--key'
                }
                aria-hidden="true"
                {...(keyPosition === undefined
                  ? {}
                  : { 'data-answer-key': String(keyPosition) })}
              >
                {keyPosition ?? ''}
              </span>
              <span className="viewer-ordering__content">
                <InlineContent nodes={item.content} />
              </span>
              {mode === 'screen' ? (
                <span className="viewer-ordering__controls">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move up, currently position ${index + 1} of ${order.length}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === order.length - 1}
                    aria-label={`Move down, currently position ${index + 1} of ${order.length}`}
                  >
                    ↓
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <span style={VISUALLY_HIDDEN} role="status" aria-live="polite" data-ordering-announce="true">
        {announcement}
      </span>

      {phase === 'checking' ? <StatePill state="pending" label="Checking…" /> : null}
      {result ? (
        <StatePill state={result.verdict === 'correct' ? 'correct' : 'incorrect'} />
      ) : null}
      {result?.feedback ? (
        <p className="viewer-ordering__feedback" data-feedback="server">
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
