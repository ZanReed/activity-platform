// =============================================================================
// blocks/Essay.tsx — RECORDED family, long form (S3)
// -----------------------------------------------------------------------------
// ShortAnswer plus a word-count readout when the teacher authored a target.
//
// The counter is INFORMATIONAL, never enforcement: it does not block typing,
// does not gate the check, and does not colour itself like a verdict. A word
// target is guidance about scope, and a student who writes 40 words against a
// "50-100" hint has written a short answer, not a wrong one — the teacher
// decides that, since this whole family is teacher-reviewed by definition.
// =============================================================================

import { useId } from 'react';
import type { EssayBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';
import { ReleasedFeedbackCard } from './ReleasedFeedbackCard.js';
import { REVIEWED_LABEL } from './ShortAnswer.js';
import { FreeResponseAnswerKey } from './FreeResponseAnswerKey.js';

export default function Essay({
  block,
  mode = 'screen',
}: BlockComponentProps<EssayBlock>) {
  const { store, state, phaseOf, resultFor, feedbackFor, solutionFor } =
    useViewer();
  const fieldId = useId();
  const value = state.responses.freeText[block.id] ?? '';
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);
  // The exemplar's twin: same released-feedback treatment, same label override,
  // imported rather than retyped (ShortAnswer.tsx is the family's source).
  const feedback = feedbackFor(block.id);
  const words = countWords(value);
  const hint = block.wordCountHint;

  return (
    <div
      className="viewer-essay"
      data-block-type="essay"
      data-block-id={block.id}
      data-phase={phase}
    >
      <label className="viewer-essay__prompt" htmlFor={fieldId}>
        <InlineContent nodes={block.prompt} />
      </label>
      <textarea
        id={fieldId}
        className="viewer-essay__input"
        value={value}
        rows={10}
        readOnly={mode === 'print'}
        {...(block.placeholder ? { placeholder: block.placeholder } : {})}
        onChange={(event) => store.setFreeText(block.id, event.target.value)}
      />

      {hint && mode === 'screen' ? (
        <p className="viewer-essay__count" data-word-count={words} aria-live="polite">
          {words} {words === 1 ? 'word' : 'words'}
          {hint.min !== undefined && hint.max !== undefined
            ? ` (aim for ${hint.min}–${hint.max})`
            : hint.min !== undefined
              ? ` (aim for at least ${hint.min})`
              : hint.max !== undefined
                ? ` (aim for at most ${hint.max})`
                : ''}
        </p>
      ) : null}

      {phase === 'checking' ? <StatePill state="pending" label="Saving…" /> : null}
      {result ? (
        <StatePill state="recorded" label={feedback ? REVIEWED_LABEL : undefined} />
      ) : null}

      {feedback ? (
        <ReleasedFeedbackCard
          feedback={feedback}
          fromAnotherVersion={feedback.activityVersionId !== state.versionId}
        />
      ) : null}

      {/* The post-check solution reveal (T5, ruling E9). Same semantics as
          every other solution-bearing block: `solution` is stripped from the
          served document and arrives on SectionCheckResult.solutions after the
          section is checked, so the attempt is recorded BEFORE the explanation
          is available. walk.ts collects it generically — this block type added
          no grading-engine code to get here. Authors omit `solution:` on
          revision-sensitive questions. */}
      {solution ? (
        <details className="viewer-solution">
          <summary>Show solution</summary>
          <div className="viewer-solution__body">
            <InlineContent nodes={solution} />
          </div>
        </details>
      ) : null}

      {/* Teacher-only: renders only where the answer-key provider is mounted. */}
      <FreeResponseAnswerKey blockId={block.id} />
    </div>
  );
}

/** Whitespace-separated runs. Matches the existing runtime's counter so a
 * student's number does not change when their page moves to the viewer. */
function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}
