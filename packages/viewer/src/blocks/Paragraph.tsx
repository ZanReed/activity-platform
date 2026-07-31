// =============================================================================
// blocks/Paragraph.tsx — the STATIC-family exemplar (S3 V5)
// -----------------------------------------------------------------------------
// The template every content block copies. Its whole job is to delegate to
// InlineContent and add NO state chrome of any kind — the static family's
// entire contract (family spec: "static → no state chrome ... Never: any pill,
// tint, or mark"). That is why it takes no store dependency and ignores check
// state: a paragraph has nothing to be right or wrong about.
//
// Copy this for: heading, callout, lists, image, graph_figure,
// learning_objectives. What changes is the wrapper element and any
// type-specific attributes; what does NOT change is the absence of state.
// =============================================================================

import type { ParagraphBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function Paragraph({ block }: BlockComponentProps<ParagraphBlock>) {
  return (
    <p className="viewer-paragraph" data-block-type="paragraph">
      <InlineContent nodes={block.content} />
    </p>
  );
}
