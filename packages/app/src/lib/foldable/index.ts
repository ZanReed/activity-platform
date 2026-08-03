// =============================================================================
// foldable/index.ts — build a printable journal foldable from an activity
// -----------------------------------------------------------------------------
// The public entry point for the journal-foldable print mode. It orchestrates
// five stages:
//
//   1. capture   — render the VIEWER offscreen, wait for it to be worth
//                  capturing, and serialize its flow items (capture.ts).
//   2. measure   — an offscreen iframe reports each item's printed height.
//   3. paginate  — items pack into fixed-height panels, never split.
//   4. compose   — panels arrange onto duplex landscape sheets (booklet
//                  imposition; blank glue tab as back cover; overflow spills
//                  onto more self-contained foldables).
//   5. render    — assemble the printable HTML document.
//
// STAGE 1 IS THE S5.5 CHANGE (ruling D6A). It used to be the renderer's
// `renderBody()`, a pure string call. The viewer is a React tree, so the string
// now comes from rendering it — which also means this engine finally prints the
// same components a student sees, and the renderer has one fewer app-side
// consumer. Stages 2-5 kept their shapes; what changed underneath them is where
// the HTML and the stylesheets come from.
//
// PX_PER_IN reconciles the two unit systems: geometry is authored in inches and
// the panel gap in rem (16px root, fixed by styles.ts), while measurement comes
// back in CSS px. problemSpacing rem × 16 is the px gap that the paginator must
// charge between items to match the CSS adjacent-sibling margin.
// =============================================================================

import type { ActivityDocument } from '@activity/schema';
import {
  applyPrintShuffles,
  extractAnswerKey,
  printSeed,
  sanitizeActivityDocument,
} from '@activity/viewer';
import { captureViewerBlocks } from './capture';
import { sheetGeometry } from './geometry';
import { measureFlowItems } from './measure';
import { paginate } from './paginate';
import { compose } from './compose';
import { renderFoldableDocument } from './render';

/** Root font-size fixed by foldable/styles.ts, used to convert rem → px. */
const ROOT_FONT_PX = 16;

export interface BuildFoldableOptions {
  /** Answer-key variant: the teacher's answers, drawn onto the panels. */
  showAnswers?: boolean;
  /** Identifies the printing, so a reprint deals the same arrangement. */
  activityId?: string;
  /** Print version — a different number rearranges the shufflable content. */
  version?: number;
  /** Budget for the capture and measure settle waits (D11A). */
  timeoutMs?: number;
}

export async function buildFoldableDocument(
  doc: ActivityDocument,
  opts: BuildFoldableOptions = {},
): Promise<string> {
  const print = doc.meta.print;
  const geom = sheetGeometry(print);
  const seed = printSeed(opts.activityId ?? doc.meta.title, opts.version ?? 1);

  // Same three documents as the worksheet route, for the same reasons: the
  // components render the SERVED shape and cannot read an answer by accident,
  // the print shuffle keeps an ordering question's authored order off paper
  // (D15A), and answers arrive through their own channel.
  const served = applyPrintShuffles(sanitizeActivityDocument(doc), seed);
  const answerKey = opts.showAnswers ? extractAnswerKey(doc) : undefined;

  const captured = await captureViewerBlocks({
    document: served,
    ...(answerKey ? { answerKey } : {}),
    ...(opts.timeoutMs === undefined ? {} : { timeoutMs: opts.timeoutMs }),
  });

  const items = await measureFlowItems(captured, geom, print, opts.timeoutMs);

  const spacingPx = print.problemSpacing * ROOT_FONT_PX;
  const panels = paginate(items, {
    panelHeightPx: geom.panelHeightPx,
    spacingPx,
  });

  // Each panel's HTML = its items' captured outerHTML in order.
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
    styleTags: captured.styleTags,
    rootStyle: captured.rootStyle,
  });
}

export { sheetGeometry } from './geometry';
export { captureViewerBlocks, flattenViewerBlocks } from './capture';
