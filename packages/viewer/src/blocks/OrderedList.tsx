// =============================================================================
// blocks/OrderedList.tsx — static content (S3)
// -----------------------------------------------------------------------------
// Real <ol>/<li>. The numbers are the browser's own list-counter, NOT the
// activity's problem numbering: `numbered: 'never'` in the registry, and
// `pageLabel` does not label these, so an ordered list restarts per block and
// participates in nothing.
//
// Rendering lives in NestedList — see BulletList for why it is shared.
// =============================================================================

import type { OrderedListBlock } from '@activity/schema';
import type { BlockComponentProps } from '../registry/types.js';
import { NestedList } from './NestedList.js';

export default function OrderedList({ block }: BlockComponentProps<OrderedListBlock>) {
  return <NestedList block={block} />;
}
