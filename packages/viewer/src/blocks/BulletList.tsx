// =============================================================================
// blocks/BulletList.tsx — static content (S3)
// -----------------------------------------------------------------------------
// Real <ul>/<li>: list semantics are what let a screen reader announce "list,
// 4 items" and let a student navigate between them.
//
// The rendering itself lives in NestedList — nesting has to be handled anyway
// (ListItem.children holds whole list blocks, and levels may mix bullet with
// ordered), so a bullet-only copy would still need the ordered branch.
// =============================================================================

import type { BulletListBlock } from '@activity/schema';
import type { BlockComponentProps } from '../registry/types.js';
import { NestedList } from './NestedList.js';

export default function BulletList({ block }: BlockComponentProps<BulletListBlock>) {
  return <NestedList block={block} />;
}
