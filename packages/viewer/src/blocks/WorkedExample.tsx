// =============================================================================
// blocks/WorkedExample.tsx — a fully solved example (S3)
// -----------------------------------------------------------------------------
// A titled container of static child blocks: the student reads it, answers
// nothing. Its family is static and it adds no chrome of its own — the checked
// -state spec's rule that a CONTAINER contributes no state, only its children
// (if any) do.
// =============================================================================

import { useId } from 'react';
import type { WorkedExampleBlock } from '@activity/schema';
import type { BlockComponentProps } from '../registry/types.js';
import { ChildBlocks } from './ChildBlocks.js';

export default function WorkedExample({
  block,
  mode = 'screen',
}: BlockComponentProps<WorkedExampleBlock>) {
  const titleId = useId();
  return (
    <section
      className="viewer-worked-example"
      data-block-type="worked_example"
      data-block-id={block.id}
      aria-labelledby={titleId}
    >
      <h3 className="viewer-worked-example__title" id={titleId}>
        {block.title}
      </h3>
      <div className="viewer-worked-example__body">
        <ChildBlocks blocks={block.content} mode={mode} />
      </div>
    </section>
  );
}
