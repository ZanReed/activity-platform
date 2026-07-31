// =============================================================================
// blocks/Heading.tsx — static content (S3)
// -----------------------------------------------------------------------------
// The authored level drives the tag, so a worksheet's outline is real document
// structure a screen reader can navigate — not text that merely looks big.
// =============================================================================

import { createElement } from 'react';
import type { HeadingBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function Heading({ block }: BlockComponentProps<HeadingBlock>) {
  // Section titles are h2 in the container, so block headings start at h3 to
  // keep the outline from skipping levels.
  const tag = `h${Math.min(6, block.level + 2)}`;
  return createElement(
    tag,
    { className: 'viewer-heading', 'data-block-type': 'heading', 'data-level': block.level },
    <InlineContent nodes={block.content} />,
  );
}
