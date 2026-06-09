// =============================================================================
// geometry.ts — physical sheet → panel geometry for the journal foldable
// -----------------------------------------------------------------------------
// The journal foldable is a landscape sheet folded once down the middle. That
// single vertical fold yields a 4-page booklet: front cover, inside-left,
// inside-right, back cover. Printed DOUBLE-SIDED, the two faces of the sheet
// carry all four panels (two per face). Students glue the (blank) back-cover
// tab into a composition notebook, so the foldable opens out of the journal.
//
// This module computes, from a PrintConfig, the inch dimensions of one panel's
// content box — the budget the pagination engine fills. Everything downstream
// (measuring, paginating, composing, printing) is expressed against this single
// source of geometric truth so the offscreen measurement and the printed sheet
// agree exactly.
//
// Units: we keep the geometry in inches (the unit the printer cares about) and
// expose a px budget at the CSS reference 96px/in for the offscreen DOM
// measurement pass. Because the measuring iframe and the printed document share
// one stylesheet (see styles.ts), px measured at 96/in divide cleanly back into
// the inch budget — the two contexts are the same layout at two scales.
// =============================================================================

import type { PrintConfig } from '@activity/schema';

/** CSS reference pixels per inch. Fixed by the CSS spec (1in === 96px). */
export const PX_PER_IN = 96;

// Landscape outer dimensions (width × height, inches) per paper size. Letter is
// 8.5×11 portrait → 11×8.5 landscape; A4 is 210×297mm → 11.69×8.27 landscape.
const SHEET_DIMS: Record<PrintConfig['paperSize'], { w: number; h: number }> = {
  letter: { w: 11, h: 8.5 },
  a4: { w: 11.69, h: 8.27 },
};

// A foldable always needs some breathing room: a panel printed edge-to-edge
// can't be folded/glued cleanly, and most printers can't bleed to the paper
// edge anyway. We floor the configured margin so a teacher who set 0in for a
// flat worksheet still gets a usable foldable.
const MIN_FOLDABLE_MARGIN_IN = 0.3;

export interface SheetGeometry {
  /** CSS @page size keyword for the landscape sheet ('letter' | 'A4'). */
  pageSizeKeyword: string;
  /** Landscape sheet outer width / height, inches. */
  sheetWidthIn: number;
  sheetHeightIn: number;
  /** Uniform margin applied inside every panel, inches. */
  marginIn: number;
  /** One panel's content-box width / height, inches (sheet half minus margins). */
  panelWidthIn: number;
  panelHeightIn: number;
  /** The pagination height budget for one panel, in CSS px at 96/in. */
  panelHeightPx: number;
}

export function sheetGeometry(print: PrintConfig): SheetGeometry {
  const dims = SHEET_DIMS[print.paperSize];
  const marginIn = Math.max(print.margin, MIN_FOLDABLE_MARGIN_IN);

  // The fold splits the sheet into two equal halves side by side. Each half is
  // one panel; the margin applies on both of its sides (outer edge + fold edge)
  // and top/bottom.
  const panelWidthIn = dims.w / 2 - 2 * marginIn;
  const panelHeightIn = dims.h - 2 * marginIn;

  return {
    pageSizeKeyword: print.paperSize === 'a4' ? 'A4' : 'letter',
    sheetWidthIn: dims.w,
    sheetHeightIn: dims.h,
    marginIn,
    panelWidthIn,
    panelHeightIn,
    panelHeightPx: panelHeightIn * PX_PER_IN,
  };
}
