// =============================================================================
// blocks/SelfExplanation.tsx — RECORDED family (S3)
// -----------------------------------------------------------------------------
// ShortAnswer with a different prompt and no rubric: "explain your thinking"
// is captured for the teacher, never judged. Same family contract, enforced by
// the same conformance suite — it renders the recorded receipt
// unconditionally rather than switching on a verdict, so a judgment cannot
// reach a student even if the server sent one.
// =============================================================================

import { useId } from 'react';
import type { SelfExplanationBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

export default function SelfExplanation({
  block,
  mode = 'screen',
}: BlockComponentProps<SelfExplanationBlock>) {
  const { store, state, phaseOf, resultFor } = useViewer();
  const fieldId = useId();
  const value = state.responses.freeText[block.id] ?? '';
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);

  return (
    <div
      className="viewer-self-explanation"
      data-block-type="self_explanation"
      data-block-id={block.id}
      data-phase={phase}
    >
      <label className="viewer-self-explanation__prompt" htmlFor={fieldId}>
        <InlineContent nodes={block.prompt} />
      </label>
      <textarea
        id={fieldId}
        className="viewer-self-explanation__input"
        value={value}
        readOnly={mode === 'print'}
        {...(block.placeholder ? { placeholder: block.placeholder } : {})}
        onChange={(event) => store.setFreeText(block.id, event.target.value)}
      />
      {phase === 'checking' ? <StatePill state="pending" label="Saving…" /> : null}
      {result ? <StatePill state="recorded" /> : null}
    </div>
  );
}
