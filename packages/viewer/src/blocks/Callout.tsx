// =============================================================================
// blocks/Callout.tsx — static content (S3)
// -----------------------------------------------------------------------------
// The variant rides a data attribute rather than a colour class: the baseline
// print constraint encodes callout variants in BORDER STYLE so they survive
// grayscale, and the token layer needs the same hook on screen. Colour alone
// would vanish on a photocopy — which is where a lot of these end up.
// =============================================================================

import type { CalloutBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function Callout({ block }: BlockComponentProps<CalloutBlock>) {
  return (
    <aside
      className={`viewer-callout viewer-callout--${block.variant}`}
      data-block-type="callout"
      data-variant={block.variant}
    >
      <InlineContent nodes={block.content} />
    </aside>
  );
}
