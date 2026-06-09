// =============================================================================
// styles.ts — the foldable's panel stylesheet (measure === print)
// -----------------------------------------------------------------------------
// The single most important invariant of the foldable engine: the offscreen
// pass that MEASURES block heights and the document that PRINTS them must lay
// blocks out identically, or pagination budgets a panel against the wrong
// heights and content overflows the fold. We guarantee that by sharing ONE
// stylesheet between the two contexts — this one.
//
// The renderer's own print rules live inside `@media print`, so they only take
// effect when printing — invisible to an on-screen measuring iframe. This
// stylesheet PROMOTES the relevant ones to unconditional rules (paper-twin
// confidence row shown, interactive controls hidden, blanks as underlines), so
// the measuring iframe sees exactly what the printer will. It is included AFTER
// the renderer's `blockStyles` in both contexts, so on equal specificity it
// wins — neutralizing the renderer's @media-print problem margins (the foldable
// owns inter-block spacing via a single controlled flow gap, so a measured
// border-box height plus one gap fully describes the stack).
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

/* Promote the renderer's @media-print element visibility to UNCONDITIONAL, so
   the offscreen measuring pass sees the same elements the printer will. These
   mirror the renderer styles.ts @media print hide/show lists exactly. */
.identity-prompt,
.submit-area,
.js-checkpoint-btn,
.js-section-score,
.js-confidence-rating,
.js-blank-hint,
.js-blank-mistake,
.js-popover,
.js-solution { display: none !important; }

.blank-wrapper { display: inline; }
.blank,
.blank.correct,
.blank.incorrect {
  background: transparent;
  border: none;
  border-bottom: 1px solid black;
}

/* Paper-twin confidence row (the interactive fieldset above is hidden). */
.print-confidence {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.3rem 1.25rem;
  margin-top: 0.5rem;
  font-size: 0.9em;
}
.print-confidence-label { font-weight: 600; }
.print-confidence-option {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  white-space: nowrap;
}
.print-confidence-box {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  border: 1px solid black;
  transform: translateY(0.1em);
}

/* Per-problem work space rides as padding so it's part of the measured box. */
.block-problem,
.block-fill-in-blank { padding-bottom: var(--print-work-space, 0); }

/* Grayscale callout variants by border style (matches the baseline print layer). */
.block-callout-info    { border-left-style: solid;  }
.block-callout-warning { border-left-style: dashed; }
.block-callout-success { border-left-style: double; }
.block-callout-note    { border-left-style: dotted; }
`.trim();
}
