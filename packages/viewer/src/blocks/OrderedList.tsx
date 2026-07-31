// =============================================================================
// blocks/OrderedList.tsx — static content (S3)
// -----------------------------------------------------------------------------
// Numbering comes from the <ol>, not from rendered text, so it stays correct
// when items are added and is announced as an ordered list.
// =============================================================================

import type { OrderedListBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function OrderedList({ block }: BlockComponentProps<OrderedListBlock>) {
  return (
    <ol className="viewer-list viewer-list--ordered" data-block-type="ordered_list">
      {block.items.map((item) => (
        <li key={item.id} className="viewer-list__item">
          <InlineContent nodes={item.content} />
        </li>
      ))}
    </ol>
  );
}
