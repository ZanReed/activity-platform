// =============================================================================
// styles.ts — the foldable's panel stylesheet (measure === print)
// -----------------------------------------------------------------------------
// The single most important invariant of the foldable engine: the offscreen
// pass that MEASURES block heights and the document that PRINTS them must lay
// blocks out identically, or pagination budgets a panel against the wrong
// heights and content overflows the fold. We guarantee that by sharing ONE
// stylesheet between the two contexts — this one.
//
// Since S5.5 T5 the foldable composes the VIEWER tree (viewer.css vocabulary:
// .viewer-row, .viewer-section, …); this sheet is included AFTER viewer.css in
// both contexts, so on equal specificity it wins. Its job is to re-assert the
// print-appropriate layout that viewer.css's screen rules would otherwise
// override in the measuring iframe (which renders in SCREEN media), and to
// own inter-block spacing via a single controlled flow gap, so a measured
// border-box height plus one gap fully describes the stack.
//
// (Until 2026-08-06 this file also carried ~55 lines promoting the RENDERER's
// @media-print rules — .js-checkpoint-btn, .blank-wrapper, .print-confidence,
// .block-* — under a header describing the pre-T5 pipeline where render.ts
// injected renderer styles. Every one of those class names is zero-hit in
// viewer source: dead since the same slice that wrote the plan, which is why
// it survived. Deleted per A26; policy P5 — the retirement grep'd for code,
// not claims.)
//
// Layout note: blocks are placed as direct children of `.foldable-panel-content`
// at the panel's exact content width. All block margins are zeroed and a single
// adjacent-sibling gap is applied, so measure and print agree to the pixel.
// =============================================================================

import type { PrintConfig } from '@activity/schema';
import type { SheetGeometry } from './geometry';

export function foldableStyles(geom: SheetGeometry, print: PrintConfig): string {
  return `
/* Fixed root so 'rem' resolves identically when measuring (screen) and
   printing — the foldable's gap is authored in rem. */
html { font-size: 16px; }
body { margin: 0; padding: 0; background: #fff; }

.foldable-panel-content {
  width: ${geom.panelWidthIn}in;
  font-size: ${print.fontSize}pt;
  line-height: 1.45;
  color: #1a1a1a;
  font-family: var(--font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  /* Activity-wide default work space; a fill-in-blank block overrides it
     per-problem via its own inline --print-work-space. */
  --print-work-space: ${print.workSpace}rem;
}

/* Controlled flow: zero every block's own margin, then add ONE gap between
   consecutive blocks. Now a block's measured border-box height plus this gap is
   the whole story — no margin collapsing to reason about across the fold. */
.foldable-panel-content > * { margin: 0; }
.foldable-panel-content > * + * { margin-top: ${print.problemSpacing}rem; }

/* A PANEL IS NOT A PHONE (S5.5 T5).
   The viewer's stylesheet collapses multi-column rows to a stack below 480px,
   because on a phone that is right — columns are a print/desktop idea and the
   authored track template is a custom property precisely so a narrow screen can
   drop it. A foldable panel is also narrow (a quarter of a landscape sheet),
   so that rule fires here too and silently flattens a teacher's authored 2:1
   split to a stack. On paper. On every copy.
   Caught by driving the dev bench in a browser: the tracks computed correctly
   as 2fr 1fr while the row computed display:block, so the ratio was right and
   the layout was gone. These re-assert the desktop behaviour at higher
   specificity, which beats the breakpoint regardless of viewport. */
.foldable-panel-content .viewer-row {
  display: grid;
  grid-template-columns: var(--activity-columns-template, 1fr);
}
.foldable-panel-content .viewer-column + .viewer-column { margin-top: 0; }
.foldable-panel-content .viewer-block--sized { width: var(--activity-block-width, 100%); }

/* A PANEL IS ALSO NOT A SCREEN.
   The worksheet's on-screen chrome — the section card's border, background and
   padding — is a screen affordance; @media print already strips it, but a
   foldable panel renders in SCREEN media (it is measured on screen and previewed
   on screen) so those rules never fire. Left alone they print a box drawn
   around the content of every panel. Mirrors the viewer's own print block for
   these two containers; the column-count there is deliberately NOT mirrored,
   because a panel is already a column. */
.foldable-panel-content .viewer {
  background: none;
  padding: 0;
}
.foldable-panel-content .viewer-section {
  border: none;
  margin: 0;
  max-width: none;
  padding: 0;
}
`.trim();
}
