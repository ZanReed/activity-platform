// =============================================================================
// blocks/printTwin.tsx — the kit-free static figure that prints (S5 T2)
// -----------------------------------------------------------------------------
// Every kit-backed block renders TWO figures: the live JSXGraph board a student
// drags on screen, and a static SVG twin that is what actually prints. The
// print stylesheet hides one and reveals the other.
//
// WHY NOT JUST PRINT THE BOARD (ruling S5-1):
//
//  1. It would print the student's in-progress work onto a worksheet whose
//     entire premise is that it is the BLANK version handed out before the
//     lesson (7.3A). A half-dragged parabola is not what a teacher wants on
//     thirty photocopies.
//  2. It depends on a lazily-loaded kit having mounted. A student who prints in
//     the first second gets an empty box where the graph should be, and the
//     browser's own File > Print gives no hook to wait in.
//  3. JSXGraph draws for the screen: hairlines, hover affordances, and colours
//     that vanish in grayscale.
//
// WHAT THE TWIN CONTAINS (S5-1 as amended by OV4). A QUESTION prints empty axes
// — the grid a student plots onto by hand, with their work stripped like every
// other answer. A DISPLAY figure prints its AUTHORED drawables, because those
// are the content the block exists to show; printing empty axes there would
// delete the thing being taught, and no treatment-level rule would notice.
//
// The SVG comes from @activity/graph-kit/static-svg — the same renderer the
// published page uses, moved into the kit precisely so both surfaces draw from
// ONE implementation. That is what makes the parity gate's `data-drawables`
// assertion meaningful: the count is emitted by shared code, so the surfaces
// cannot disagree about what they drew.
// =============================================================================

import type { ReactElement } from 'react';

export interface PrintTwinProps {
  /** Pre-rendered SVG markup, or '' for a degenerate window. */
  readonly svg: string;
}

/**
 * The hidden print figure. Rendered ALWAYS — never conditionally on print mode
 * — because the browser prints the screen DOM and offers no chance to build
 * anything first; `viewer.css` hides it on screen and reveals it in print.
 *
 * aria-hidden: it is a duplicate of a canvas that already carries the block's
 * accessible name and keyboard affordances. Announcing it twice would make the
 * screen experience worse to improve a printout nobody hears.
 */
export function PrintTwin({ svg }: PrintTwinProps): ReactElement | null {
  if (!svg) return null;
  return (
    <div
      className="viewer-print-twin"
      data-print-svg="true"
      aria-hidden="true"
      // Static SVG from the shared kit renderer: no user HTML reaches it —
      // every authored string inside is escaped by static-svg/html.ts.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
