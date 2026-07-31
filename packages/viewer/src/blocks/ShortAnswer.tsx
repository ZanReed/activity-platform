// =============================================================================
// blocks/ShortAnswer.tsx — the RECORDED-family exemplar (S3 V5, ruling D15)
// -----------------------------------------------------------------------------
// The template self_explanation and essay copy. It exists as an exemplar
// because the recorded family's contract is defined by what it must NEVER do,
// and a rule stated only in prose gets broken by the twelfth component:
//
//   - NEVER a verdict glyph as judgment, never a score, never anything a
//     student could read as auto-grading. The terminal state is
//     "Recorded ✓ — your teacher will review" and nothing else.
//   - Released TEACHER feedback renders when the server provides it, and is
//     visibly attributed to the teacher — it arrives via
//     fetchReleasedFeedback (the get-feedback precedent), NOT from a check.
//
// The store still records the response and the check still fires (the server
// returns verdict 'recorded'), so the work is captured and the section can
// complete — the difference is entirely in what the student is shown.
//
// A11y (its registry story): a plain <textarea> with a programmatically
// associated <label>, so the prompt is the accessible name and the platform
// handles caret, selection, and dictation. The recorded pill announces through
// StatePill's aria-live.
// =============================================================================

import { useId } from 'react';
import type { ShortAnswerBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

export default function ShortAnswer({
  block,
  mode = 'screen',
}: BlockComponentProps<ShortAnswerBlock>) {
  const { store, state, phaseOf, resultFor } = useViewer();
  const fieldId = useId();

  const value = state.responses.freeText[block.id] ?? '';
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);

  return (
    <div
      className="viewer-short-answer"
      data-block-type="short_answer"
      data-block-id={block.id}
      data-phase={phase}
    >
      <label className="viewer-short-answer__prompt" htmlFor={fieldId}>
        <InlineContent nodes={block.prompt} />
      </label>

      <textarea
        id={fieldId}
        className="viewer-short-answer__input"
        value={value}
        readOnly={mode === 'print'}
        onChange={(event) => store.setFreeText(block.id, event.target.value)}
      />

      {phase === 'checking' ? <StatePill state="pending" label="Saving…" /> : null}

      {/* The ONLY terminal state this family may show. `result.verdict` is
          always 'recorded' here (the server and the mock both enforce it); a
          correct/incorrect verdict would be a server bug, and rendering it
          would be this component's bug — so it renders the recorded pill
          unconditionally rather than switching on the verdict. */}
      {result ? <StatePill state="recorded" /> : null}
    </div>
  );
}
