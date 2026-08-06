// =============================================================================
// render.ts — assemble the printable foldable HTML document
// -----------------------------------------------------------------------------
// Takes the composed foldables (duplex booklet imposition) plus the per-panel
// content HTML and emits a complete, self-contained HTML document the print
// route drops into an <iframe srcDoc>. Each foldable becomes TWO printed pages
// — the outside face then the inside face — so a double-sided print lands all
// four panels on one landscape sheet that folds down the middle.
//
// The document carries the `styleTags` cloned from the app document (the
// viewer's stylesheets — the same set the measuring pass ran under; the old
// "renderer blockStyles/katexCss" wording predated S5.5 T5 re-pointing this
// at the viewer tree, A26) and the foldable panel stylesheet (styles.ts) so
// what prints matches what was measured. On top
// it layers the SHEET geometry: a landscape @page with zero margin (margins are
// handled inside each panel), and a two-panel flex row per face with a faint
// center fold guide. An @media screen block dresses the preview (grey mat,
// drop-shadowed sheets) without touching the printed output.
// =============================================================================

import { escape } from './html';
import { VIEWER_WRAPPER_CLOSE, viewerWrapperOpen } from './measure';
import type { PrintConfig } from '@activity/schema';
import type { SheetGeometry } from './geometry';
import type { Foldable, PanelSlot } from './compose';
import { foldableStyles } from './styles';

export interface RenderFoldableInput {
  title: string;
  geom: SheetGeometry;
  print: PrintConfig;
  /** Per content-panel HTML (joined block outerHTML), indexed by panelIndex. */
  contentPanels: string[];
  foldables: Foldable[];
  /**
   * `<style>`/`<link>` tags cloned from the app document — the SAME set the
   * measure iframe used. Identical CSS in both places is what makes the
   * measurement predictive: measure under one stylesheet and print under
   * another and the panels overflow only on paper, where nobody sees it until
   * a class set has been run off.
   */
  styleTags: string;
  /** Inline custom properties for the rebuilt `.viewer` root, as measured. */
  rootStyle: string;
}

// Sheet-geometry CSS: landscape @page, one full-page sheet per face, two panels
// split by the fold. Kept separate from the panel typography (styles.ts) — this
// is about the physical sheet, that is about the blocks inside a panel.
function printLayoutStyles(geom: SheetGeometry): string {
  return `
@page { size: ${geom.pageSizeKeyword} landscape; margin: 0; }

.foldable-sheet {
  box-sizing: border-box;
  width: ${geom.sheetWidthIn}in;
  height: ${geom.sheetHeightIn}in;
  display: flex;
  overflow: hidden;
  position: relative;
  break-after: page;
  page-break-after: always;
}
.foldable-sheet:last-child { break-after: auto; page-break-after: auto; }

/* Faint guide down the fold line. */
.foldable-sheet::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-left: 1px dashed #c8c8c8;
}

.foldable-panel {
  box-sizing: border-box;
  width: 50%;
  height: 100%;
  padding: ${geom.marginIn}in;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.foldable-panel--glue {
  align-items: center;
  justify-content: center;
}
.foldable-glue-note {
  color: #9aa0a6;
  font-size: 10pt;
  text-align: center;
  line-height: 1.4;
  border: 1px dashed #cdd2d6;
  border-radius: 6px;
  padding: 0.75in 0.5in;
}

@media screen {
  body { background: #e5e7eb; padding: 16px; }
  .foldable-sheet {
    margin: 0 auto 16px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.18);
  }
}
`;
}

function renderPanel(
  slot: PanelSlot,
  contentPanels: string[],
  foldableIndex: number,
  rootStyle: string,
): string {
  if (slot.kind === 'glue') {
    return (
      '<div class="foldable-panel foldable-panel--glue">' +
      '<div class="foldable-glue-note">Glue tab' +
      '<br />Glue this panel into your journal' +
      (foldableIndex > 1 ? '<br />(part ' + foldableIndex + ')' : '') +
      '</div>' +
      '</div>'
    );
  }
  if (slot.kind === 'pad') {
    return '<div class="foldable-panel"></div>';
  }
  const content = contentPanels[slot.panelIndex] ?? '';
  // Each panel rebuilds the `.viewer` wrapper the blocks were MEASURED inside
  // (F5). Per panel rather than once around the document, because every panel
  // is its own layout context and the custom properties have to reach the
  // blocks in all of them.
  return (
    '<div class="foldable-panel">' +
    '<div class="foldable-panel-content">' +
    viewerWrapperOpen(rootStyle) +
    content +
    VIEWER_WRAPPER_CLOSE +
    '</div>' +
    '</div>'
  );
}

function renderFace(
  panels: [PanelSlot, PanelSlot],
  contentPanels: string[],
  foldableIndex: number,
  rootStyle: string,
): string {
  return (
    '<div class="foldable-sheet">' +
    renderPanel(panels[0], contentPanels, foldableIndex, rootStyle) +
    renderPanel(panels[1], contentPanels, foldableIndex, rootStyle) +
    '</div>'
  );
}

export function renderFoldableDocument(input: RenderFoldableInput): string {
  const { title, geom, print, contentPanels, foldables, styleTags, rootStyle } =
    input;

  // Each foldable → outside face, then inside face (duplex print order).
  const sheets = foldables
    .map(
      (f) =>
        renderFace(f.outside, contentPanels, f.index, rootStyle) +
        renderFace(f.inside, contentPanels, f.index, rootStyle),
    )
    .join('');

  return (
    '<!DOCTYPE html>' +
    // data-theme="light" for the same reason the measure iframe does it: the
    // sheet is paper, so it must not follow the reader's OS into dark mode —
    // on screen it would preview wrong, and on paper light-on-white vanishes.
    '<html lang="en" data-theme="light">' +
    '<head>' +
    '<meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
    '<title>' + escape(title) + '</title>' +
    styleTags +
    '<style>' + foldableStyles(geom, print) + '</style>' +
    '<style>' + printLayoutStyles(geom) + '</style>' +
    '</head>' +
    '<body>' +
    sheets +
    '</body>' +
    '</html>'
  );
}
