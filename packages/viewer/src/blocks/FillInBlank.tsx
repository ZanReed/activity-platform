// =============================================================================
// blocks/FillInBlank.tsx — inline blanks (S3)
// -----------------------------------------------------------------------------
// The one interactive block whose inputs live INSIDE prose, so it drives
// InlineContent's `renderBlank` seam rather than laying out its own controls.
//
// Three things the served shape makes true, and one trap:
//
//  - A blank's id is the response key (R1: id-keyed, never positional), so
//    reordering prose never re-assigns a student's answers.
//  - `hint` and `width` SURVIVE sanitization deliberately — they shape the
//    input before any check. `answer` and `acceptableAnswers` do not, and the
//    type will not let this file name them.
//  - Verdicts are PER BLANK, not per block: one sentence can hold three blanks
//    with three different outcomes, so each renders its own state from
//    resultFor(block.id, blank.id).
//
// The trap: a blank is a form control inside a paragraph, and its accessible
// name cannot come from surrounding prose automatically. Each gets an explicit
// aria-label naming its position, so a screen-reader user hears "blank 2 of 3"
// instead of an unlabelled edit box mid-sentence.
// =============================================================================

import type { FillInBlankBlock } from '@activity/schema';
import { stepLetter } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

export default function FillInBlank({
  block,
  mode = 'screen',
  label,
}: BlockComponentProps<FillInBlankBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const phase = phaseOf(block.id);
  const solution = solutionFor(block.id);
  // Teacher answer key, when this surface has one at all (S5.5 D3A). Undefined
  // on every student render — there is no provider there.
  const answerKey = useBlockAnswerKey(block.id);

  // Position numbering for accessible names, in document order.
  const blankIds = block.content
    .filter((n) => (n as { type?: string }).type === 'blank')
    .map((n) => (n as unknown as { id: string }).id);

  // SUB-PART LETTERING (ruling N7): "(a) ___ (b) ___" on a NUMBERED,
  // MULTI-BLANK problem, so a student writing on paper and a teacher marking
  // against a key can name the same gap.
  //
  // All three exclusions come from data rather than from flags:
  //   single blank      → nothing to tell apart, so `>= 2`
  //   custom/none label → out of the numbered sequence, so `kind === 'number'`
  //   inside a faded step → the step is a NESTED block, and ChildBlocks does
  //                         not pass `label` at all, so it is undefined here.
  //                         The box already letters its steps with a real <ol>.
  //
  // The letter is DERIVED from render position, never stored — the same rule
  // the answer key follows for matching letters and ordering numbers, and for
  // the same reason: position is a property of what was served, not of the
  // document.
  const letterBlanks = label?.kind === 'number' && blankIds.length >= 2;

  return (
    <div
      className="viewer-blanks"
      data-block-type="fill_in_blank"
      data-block-id={block.id}
      data-phase={phase}
    >
      <p className="viewer-blanks__body">
        <InlineContent
          nodes={block.content}
          renderBlank={(blank) => {
            // The answer key prefills the line with the CANONICAL answer — one
            // definitive value, never the acceptable alternates (the renderer's
            // same call). It replaces the response rather than merging with it:
            // a key is printed from a blank worksheet, and if a value somehow
            // existed, the answer is what the teacher asked to see.
            const keyAnswer = answerKey?.blanks?.[blank.id];
            const value = keyAnswer ?? state.responses.blanks[blank.id] ?? '';
            const result = resultFor(block.id, blank.id);
            const index = blankIds.indexOf(blank.id);
            // Renamed from `label` when the block-level label prop arrived —
            // the two are different things and the shadowing was a trap.
            const ariaLabel = letterBlanks
              ? `Part ${stepLetter(index)}, blank ${index + 1} of ${blankIds.length}`
              : blankIds.length > 1
                ? `Blank ${index + 1} of ${blankIds.length}`
                : 'Blank';
            return (
              <span className="viewer-blank" data-blank-id={blank.id}>
                {letterBlanks ? (
                  // aria-hidden: the input's own accessible name already says
                  // "Part b", so exposing the marker too would announce it
                  // twice. The block number itself is announced once by the
                  // wrapper's group label (ruling D3).
                  <span className="viewer-blank__sublabel" aria-hidden="true">
                    ({stepLetter(index)})
                  </span>
                ) : null}
                <input
                  type="text"
                  className="viewer-blank__input"
                  value={value}
                  // A keyed value is never editable: typing over it would leave
                  // the printed key silently disagreeing with itself.
                  readOnly={mode === 'print' || keyAnswer !== undefined}
                  aria-label={ariaLabel}
                  {...(keyAnswer !== undefined ? { 'data-answer-key': 'filled' } : {})}
                  {...(blank.width ? { size: blank.width } : {})}
                  {...(result
                    ? { 'data-verdict': result.verdict, 'aria-invalid': result.verdict === 'incorrect' }
                    : {})}
                  onChange={(event) => store.setBlank(blank.id, event.target.value)}
                />
                {result ? (
                  <StatePill state={result.verdict === 'correct' ? 'correct' : 'incorrect'} />
                ) : null}
                {result?.feedback ? (
                  <span className="viewer-blank__feedback" data-feedback="server">
                    <InlineContent nodes={result.feedback} />
                  </span>
                ) : null}
              </span>
            );
          }}
        />
      </p>

      {phase === 'checking' ? <StatePill state="pending" label="Checking…" /> : null}

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
