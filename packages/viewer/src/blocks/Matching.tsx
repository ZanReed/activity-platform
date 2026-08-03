// =============================================================================
// blocks/Matching.tsx — pair items to targets (S3)
// -----------------------------------------------------------------------------
// Each left-hand item gets a <select> of the right-hand targets. Same
// reasoning as Ordering's buttons: a native select is operable by keyboard,
// screen reader, and touch immediately, where a drag-to-connect affordance is
// not — and it can be replaced with a richer interaction later without
// changing the state it writes.
//
// Two contract details:
//  - The response is { item id → target id } (R1), so distractor targets and
//    reordering are both harmless.
//  - `key` (the correct pairing) is stripped and the type will not let this
//    file name it. Targets are labelled by POSITION (A, B, C…) for reference
//    in prose, which is safe: letters come from serve order, not from the key.
// =============================================================================

import { useId } from 'react';
import type { MatchingBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { choiceLetter } from './paperAffordances.js';
import { seededShuffle } from '../sanitize/shuffle.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

// Position letters come from the shared paper-affordance helper (choiceLetter)
// rather than a local alphabet: the renderer, multiple choice, and matching all
// label positions the same way, and three copies of one convention is how
// "choice B" starts meaning different things on different surfaces.

export default function Matching({
  block,
  mode = 'screen',
}: BlockComponentProps<MatchingBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const groupId = useId();
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);
  const placed = state.responses.matches[block.id] ?? {};

  // THE BANK IS SHUFFLED, NEVER SHOWN IN AUTHORED ORDER (S5.5 D21C).
  //
  // Matching pairs are authored in order — item 1 pairs with target 1 — so a
  // bank rendered as authored makes the n-th option the answer to the n-th
  // item, which a student can read straight off the page without doing the
  // task. The published page has always shuffled here (renderer matching.ts);
  // the viewer had not, and no test named the property.
  //
  // Seeded by BLOCK ID, so it is stable across reloads and re-renders (a bank
  // that reshuffles under a student mid-question would be its own bug) and
  // needs no server, wire, or schema change. A print version composes its own
  // seed on top of this one.
  const targets = seededShuffle(block.targets, block.id);

  // The key pairs item id → TARGET ID. The letter a teacher writes is a fact
  // about the order the bank is being rendered in — which the shuffle above
  // has just decided — so it is derived here rather than stored.
  const answerKey = useBlockAnswerKey(block.id);
  const letterByTargetId = new Map(
    targets.map((target, i) => [target.id, choiceLetter(i)]),
  );

  return (
    <div
      className="viewer-matching"
      data-block-type="matching"
      data-block-id={block.id}
      data-phase={phase}
    >
      <p className="viewer-matching__prompt">
        <InlineContent nodes={block.prompt} />
      </p>

      {/* The lettered bank, so prose and print can refer to "B". */}
      <ul className="viewer-matching__bank">
        {targets.map((target, i) => (
          <li key={target.id} className="viewer-matching__target" data-letter={choiceLetter(i)}>
            <span className="viewer-matching__letter">{choiceLetter(i)}.</span>{' '}
            <InlineContent nodes={target.content} />
          </li>
        ))}
      </ul>

      <ul className="viewer-matching__items">
        {block.items.map((item) => {
          const selectId = `${groupId}-${item.id}`;
          const keyedTargetId = answerKey?.targetIdByItemId?.[item.id];
          const keyLetter = keyedTargetId
            ? letterByTargetId.get(keyedTargetId)
            : undefined;
          return (
            <li key={item.id} className="viewer-matching__item" data-item-id={item.id}>
              <label htmlFor={selectId} className="viewer-matching__item-label">
                <InlineContent nodes={item.content} />
              </label>
              {/* The paper convention: a blank line to write the target's
                  letter on. The <select> beside it is the screen answer and is
                  hidden in print; this is hidden on screen. Both are always in
                  the DOM because printing cannot wait on a render. */}
              <span
                className={
                  keyLetter
                    ? 'viewer-matching__letter-line viewer-matching__letter-line--key'
                    : 'viewer-matching__letter-line'
                }
                aria-hidden="true"
                {...(keyLetter ? { 'data-answer-key': keyLetter } : {})}
              >
                {keyLetter ?? ''}
              </span>
              <select
                id={selectId}
                className="viewer-matching__select"
                value={placed[item.id] ?? ''}
                disabled={mode === 'print'}
                onChange={(event) =>
                  store.setMatch(block.id, item.id, event.target.value || null)
                }
              >
                <option value="">— choose —</option>
                {targets.map((target, i) => (
                  <option key={target.id} value={target.id}>
                    {choiceLetter(i)}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>

      {phase === 'checking' ? <StatePill state="pending" label="Checking…" /> : null}
      {result ? (
        <StatePill state={result.verdict === 'correct' ? 'correct' : 'incorrect'} />
      ) : null}
      {result?.feedback ? (
        <p className="viewer-matching__feedback" data-feedback="server">
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
