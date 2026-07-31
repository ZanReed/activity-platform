// =============================================================================
// blocks/BulletList.tsx — static content (S3)
// -----------------------------------------------------------------------------
// Real <ul>/<li>: list semantics are what let a screen reader announce "list,
// 4 items" and let a student navigate between them.
// =============================================================================

import type { BulletListBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function BulletList({ block }: BlockComponentProps<BulletListBlock>) {
  return (
    <ul className="viewer-list viewer-list--bullet" data-block-type="bullet_list">
      {block.items.map((item) => (
        <li key={item.id} className="viewer-list__item">
          <InlineContent nodes={item.content} />
        </li>
      ))}
    </ul>
  );
}
