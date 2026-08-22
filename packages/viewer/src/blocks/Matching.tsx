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
import { ChoiceFigure } from './ChoiceFigure.js';
import { allHaveFigures, figureIsSoleContent } from './figureSlot.js';
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
  // Drives both the bank's grid and its conditional breakability (A9).
  const bankHasFigures = allHaveFigures(targets);

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
      // A9/E3: the BLOCK's page-break behaviour is conditional on its content,
      // and the registry declares it as such. The marker is what lets the
      // stylesheet resolve the same branch the PrintSpec does.
      {...(bankHasFigures ? { 'data-has-figures': 'true' } : {})}
    >
      <p className="viewer-matching__prompt">
        <InlineContent nodes={block.prompt} />
      </p>

      {/* The lettered bank, so prose and print can refer to "B".

          A9: once the bank holds FIGURES it also grids, and it stops being
          unbreakable. Five 1.75in targets is ~9.5in of content in a 10in
          printable column, plus the prompt and the items below it — and
          `break-inside: avoid` on a box that cannot fit is worse than one that
          breaks, because the browser then flings the whole bank onto its own
          page and strands the items that reference it on a different sheet.
          The registry's print declaration is CONDITIONAL for the same reason
          (eng review E3): a declaration the page stops honouring is the exact
          pattern that produced the orphan fields. */}
      <ul
        className="viewer-matching__bank"
        {...(bankHasFigures ? { 'data-figure-layout': 'grid' } : {})}>
        {targets.map((target, i) => (
          <li
            key={target.id}
            className="viewer-matching__target"
            data-letter={choiceLetter(i)}
            // The bank as RENDERED, machine-readable: a print version shuffles
            // it, so a checker has to resolve a written letter back to a target
            // rather than assume position.
            data-target-id={target.id}
          >
            <span className="viewer-matching__letter">{choiceLetter(i)}.</span>{' '}
            {/* The target had no wrapper element at all before this — its
                content sat bare in the <li>. The figure needs one. */}
            <span className="viewer-matching__target-content">
              <InlineContent nodes={target.content} />
              <ChoiceFigure
                owner={target}
                blockId={block.id}
                letterLabel={choiceLetter(i)}
                isSoleContent={figureIsSoleContent(target)}
              />
            </span>
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
                <ChoiceFigure
                  owner={item}
                  blockId={block.id}
                  isSoleContent={figureIsSoleContent(item)}
                />
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
