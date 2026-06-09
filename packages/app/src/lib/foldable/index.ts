// =============================================================================
// foldable/index.ts — build a printable journal foldable from an activity
// -----------------------------------------------------------------------------
// The public entry point for the journal-foldable print mode (Drop D, Route 2:
// client-side, DOM-measured). It orchestrates the four stages:
//
//   1. render   — the renderer turns the document into body HTML (renderBody).
//   2. measure  — an offscreen iframe reports each block's printed height.
//   3. paginate — blocks pack into fixed-height panels, never split.
//   4. compose  — panels arrange onto duplex landscape sheets (booklet
//                 imposition; blank glue tab as back cover; overflow spills
//                 onto more self-contained foldables).
//   5. render   — assemble the printable HTML document.
//
// Returns a complete HTML string for an <iframe srcDoc>. Async because the
// measure step waits on layout/fonts/images. Browser-only (measure touches the
// DOM); never call it server-side.
//
// PX_PER_IN reconciles the two unit systems: geometry is authored in inches and
// the panel gap in rem (16px root, fixed by styles.ts), while measurement comes
// back in CSS px. problemSpacing rem × 16 is the px gap that the paginator must
// charge between blocks to match the CSS adjacent-sibling margin.
// =============================================================================

import { renderBody } from '@activity/renderer';
import type { ActivityDocument } from '@activity/schema';
import { sheetGeometry } from './geometry';
import { measureFlowItems } from './measure';
import { paginate } from './paginate';
import { compose } from './compose';
import { renderFoldableDocument } from './render';

/** Root font-size fixed by foldable/styles.ts, used to convert rem → px. */
const ROOT_FONT_PX = 16;

export interface BuildFoldableOptions {
  /** Answer-key variant: prefill blanks with their canonical answer. */
  showAnswers?: boolean;
}

export async function buildFoldableDocument(
  doc: ActivityDocument,
  opts: BuildFoldableOptions = {},
): Promise<string> {
  const print = doc.meta.print;
  const geom = sheetGeometry(print);

  const bodyHtml = renderBody(doc, { showAnswers: opts.showAnswers });
  const items = await measureFlowItems(bodyHtml, geom, print);

  const spacingPx = print.problemSpacing * ROOT_FONT_PX;
  const panels = paginate(items, {
    panelHeightPx: geom.panelHeightPx,
    spacingPx,
  });

  // Each panel's HTML = its blocks' captured outerHTML in order.
  const contentPanels = panels.map((indices) =>
    indices.map((i) => items[i]?.html ?? '').join(''),
  );

  const foldables = compose(contentPanels.length);

  return renderFoldableDocument({
    title: doc.meta.title,
    geom,
    print,
    contentPanels,
    foldables,
  });
}

export { sheetGeometry } from './geometry';
