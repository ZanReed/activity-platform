// =============================================================================
// blocks/Callout.tsx — static content (S3)
// -----------------------------------------------------------------------------
// The variant rides a data attribute rather than a colour class: the baseline
// print constraint encodes callout variants in BORDER STYLE so they survive
// grayscale, and the token layer needs the same hook on screen. Colour alone
// would vanish on a photocopy — which is where a lot of these end up.
//
// TWO channels, not one. The published page pairs its tint with an icon and
// keeps the icon in print on purpose ("belt and suspenders" — its print CSS
// says so). The viewer shipped with border style alone, which is weaker: shape
// and border are independent signals, and a reader who misses one still has
// the other. The gate could not catch the omission because no rule ever named
// an icon; the author caught it reading the contact sheet.
//
// The icon is inline SVG rather than the renderer's emoji, per ruling 4.1A —
// an emoji is a different drawing on every platform, a colour glyph on a
// grayscale printer, and unsizable next to the text it labels.
//
// role="note" matches the published page: this is an aside about the
// surrounding content, and the icon is decorative because the sentence beside
// it already carries the meaning.
// =============================================================================

import type { CalloutBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { CalloutIcon } from '../icons/index.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function Callout({ block }: BlockComponentProps<CalloutBlock>) {
  return (
    <aside
      className={`viewer-callout viewer-callout--${block.variant}`}
      data-block-type="callout"
      data-variant={block.variant}
      role="note"
    >
      <CalloutIcon variant={block.variant} className="viewer-callout__icon" />
      <div className="viewer-callout__body">
        <InlineContent nodes={block.content} />
      </div>
    </aside>
  );
}
