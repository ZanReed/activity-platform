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
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

export default function FillInBlank({
  block,
  mode = 'screen',
}: BlockComponentProps<FillInBlankBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const phase = phaseOf(block.id);
  const solution = solutionFor(block.id);

  // Position numbering for accessible names, in document order.
  const blankIds = block.content
    .filter((n) => (n as { type?: string }).type === 'blank')
    .map((n) => (n as unknown as { id: string }).id);

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
            const value = state.responses.blanks[blank.id] ?? '';
            const result = resultFor(block.id, blank.id);
            const index = blankIds.indexOf(blank.id);
            const label =
              blankIds.length > 1
                ? `Blank ${index + 1} of ${blankIds.length}`
                : 'Blank';
            return (
              <span className="viewer-blank" data-blank-id={blank.id}>
                <input
                  type="text"
                  className="viewer-blank__input"
                  value={value}
                  readOnly={mode === 'print'}
                  aria-label={label}
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
