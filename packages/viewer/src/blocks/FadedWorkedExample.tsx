// =============================================================================
// blocks/FadedWorkedExample.tsx — a partly-solved example (S3)
// -----------------------------------------------------------------------------
// The scaffold that "fades": early steps are worked for the student, later
// ones contain blanks they complete. So unlike WorkedExample this container
// holds GRADABLE children — and that is the whole reason it is a distinct
// block rather than a styling variant.
//
// The container still adds no state chrome of its own. Marks appear on the
// child blanks, which is exactly what the family spec means by "the box
// surfaces its child blanks' marks; the box itself adds no chrome". Step
// labels are a <ol> so the numbering is real structure, announced as an
// ordered list rather than drawn as text.
// =============================================================================

import { useId } from 'react';
import type { FadedWorkedExampleBlock } from '@activity/schema';
import type { BlockComponentProps } from '../registry/types.js';
import { ChildBlocks } from './ChildBlocks.js';

export default function FadedWorkedExample({
  block,
  mode = 'screen',
}: BlockComponentProps<FadedWorkedExampleBlock>) {
  const titleId = useId();
  const steps = block.content;

  return (
    <section
      className="viewer-faded-example"
      data-block-type="faded_worked_example"
      data-block-id={block.id}
      aria-labelledby={titleId}
    >
      <h3 className="viewer-faded-example__title" id={titleId}>
        {block.title}
      </h3>

      {block.showStepLabels ? (
        <ol className="viewer-faded-example__steps">
          {steps.map((step) => (
            <li key={(step as { id: string }).id} className="viewer-faded-example__step">
              <ChildBlocks blocks={[step]} mode={mode} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="viewer-faded-example__body">
          <ChildBlocks blocks={steps} mode={mode} />
        </div>
      )}
    </section>
  );
}
