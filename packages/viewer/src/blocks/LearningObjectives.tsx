// =============================================================================
// blocks/LearningObjectives.tsx — static scaffold (S3)
// -----------------------------------------------------------------------------
// "What you'll be able to do" — a titled list, labelled so the list is
// announced with its heading rather than as a loose group of sentences.
// =============================================================================

import { useId } from 'react';
import type { LearningObjectivesBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function LearningObjectives({
  block,
}: BlockComponentProps<LearningObjectivesBlock>) {
  const titleId = useId();
  return (
    <section
      className="viewer-objectives"
      data-block-type="learning_objectives"
      aria-labelledby={titleId}
    >
      <h3 className="viewer-objectives__title" id={titleId}>
        {block.title}
      </h3>
      <ul className="viewer-objectives__list">
        {block.items.map((item, i) => (
          <li key={i} className="viewer-objectives__item">
            <InlineContent nodes={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
