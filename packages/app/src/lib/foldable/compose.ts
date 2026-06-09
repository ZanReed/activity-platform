// =============================================================================
// compose.ts — duplex booklet imposition for the journal foldable
// -----------------------------------------------------------------------------
// Pagination produces an ordered list of CONTENT panels. Composition arranges
// them onto physical landscape sheets in the order a single-fold, double-sided
// booklet demands.
//
// Booklet model (single vertical fold, 4 pages per sheet):
//   reading order  →  [ content #1, content #2, content #3, GLUE TAB (blank) ]
//                       page 1        page 2      page 3      page 4 (back cover)
//
// The blank glue tab is ALWAYS the back cover (page 4) — that's the face the
// student glues into the journal, so the foldable opens to content #1.
//
// Imposition (where each booklet page physically prints on the folded sheet):
//   OUTSIDE face (printed first):  [ page 4 | page 1 ]  = [ glue tab | content #1 ]
//   INSIDE  face (printed second): [ page 2 | page 3 ]  = [ content #2 | content #3 ]
// After duplex printing (flip on the long/right edge) and folding down the
// middle, the panels read 1 → 2 → 3 → back. Each sheet is a self-contained
// foldable; when content needs more than 3 panels it SPILLS onto another sheet
// (another glue tab, another fold) rather than scaling down.
//
// Pure and DOM-free: it works purely on panel counts/indices, so the
// imposition is unit-testable. A panel slot is either a content panel (an index
// into the paginated content panels), the blank glue tab, or a blank pad (the
// trailing empty content slots of the last, partly-filled foldable).
// =============================================================================

export type PanelSlot =
  | { kind: 'content'; panelIndex: number }
  | { kind: 'glue' }
  | { kind: 'pad' };

export interface Foldable {
  /** 1-based foldable number (sheet number), for labelling / instructions. */
  index: number;
  /** Outside face of the sheet: [left, right] = [glue tab, content #1]. */
  outside: [PanelSlot, PanelSlot];
  /** Inside face of the sheet: [left, right] = [content #2, content #3]. */
  inside: [PanelSlot, PanelSlot];
}

/** Content panels carried per foldable (3 content + 1 glue tab = 4 panels). */
export const CONTENT_PANELS_PER_FOLDABLE = 3;

/**
 * Arrange `contentPanelCount` paginated panels into duplex foldables. Returns
 * one Foldable per physical sheet, in print order. A count of 0 yields a single
 * empty foldable (three pads + glue tab) so the print is never blank-document
 * empty; callers with truly no content can choose not to render.
 */
export function compose(contentPanelCount: number): Foldable[] {
  const foldables: Foldable[] = [];
  const sheets = Math.max(1, Math.ceil(contentPanelCount / CONTENT_PANELS_PER_FOLDABLE));

  for (let s = 0; s < sheets; s++) {
    const base = s * CONTENT_PANELS_PER_FOLDABLE;
    // The three content slots for this sheet; beyond the available panels they
    // become blank pads (only ever on the final sheet).
    const slotFor = (offset: number): PanelSlot => {
      const idx = base + offset;
      return idx < contentPanelCount
        ? { kind: 'content', panelIndex: idx }
        : { kind: 'pad' };
    };

    const content1 = slotFor(0);
    const content2 = slotFor(1);
    const content3 = slotFor(2);

    foldables.push({
      index: s + 1,
      outside: [{ kind: 'glue' }, content1],
      inside: [content2, content3],
    });
  }

  return foldables;
}
