// =============================================================================
// columns.ts — Render a structural columns container to a CSS grid
// -----------------------------------------------------------------------------
// One renderer, every output: the columns block becomes a CSS grid whose track
// sizing comes from per-column width weights. It lays out side by side on
// screen, in worksheet print, and inside a journal foldable panel; on a narrow
// screen the stylesheet (@media screen) collapses it to a single column. The
// width weights ride as a single --columns-template custom property so a
// stylesheet media query can override the track sizing (custom properties lose
// to later rules; an inline grid-template-columns would not).
//
// Numbering: cells are walked in array order, each cell's blocks in order, all
// sharing ctx.nextProblemNumber — so problems nested in columns number
// column-major (column 1 top-to-bottom, then column 2, …).
// =============================================================================

import type { ColumnsBlock, Column } from '@activity/schema';
import type { BlockRenderContext } from './index.js';
import { renderBlock } from './index.js';
import { attr } from '../html.js';
import { remLength } from './sizing.js';

// grid-template-columns from the width weights: default weight 1 → equal split;
// [width:2, width:1] → "2fr 1fr". Values are schema-validated positive numbers,
// so the result is a safe, fixed-shape token list (no user strings).
function gridTemplate(columns: Column[]): string {
  return columns
    .map((c) => (c.width && c.width > 0 ? c.width : 1) + 'fr')
    .join(' ');
}

// Resolve the tri-state gridLines against the activity-wide default. 'on'/'off'
// are absolute; 'inherit' defers to meta.print.gridLines (threaded as
// ctx.gridLinesDefault). The CSS keys off the data-grid-lines attribute, which
// is emitted only when the resolved value is true — its absence is the "no
// rules" signal, so an unruled block stays attribute-free.
function resolveGridLines(block: ColumnsBlock, ctx: BlockRenderContext): boolean {
  if (block.gridLines === 'on') return true;
  if (block.gridLines === 'off') return false;
  return ctx.gridLinesDefault ?? false;
}

export function renderColumns(block: ColumnsBlock, ctx: BlockRenderContext): string {
  const cells = block.columns
    .map((col) => {
      const inner = col.blocks.map((b) => renderBlock(b, ctx)).join('');
      // Reserved work space: minHeight rides as --cell-min-height (consumed
      // by the .column-cell rule) instead of an inline min-height, so a
      // stylesheet rule could override it per media — same custom-property
      // pattern as --columns-template. A floor, not a fixed height: the cell
      // still grows with content, so foldable measurement stays honest.
      const minHeightStyle =
        col.minHeight !== undefined
          ? ' style="--cell-min-height:' + remLength(col.minHeight) + '"'
          : '';
      return '<div class="column-cell"' + minHeightStyle + '>' + inner + '</div>';
    })
    .join('');

  const gridLinesAttr = resolveGridLines(block, ctx)
    ? ' data-grid-lines="true"'
    : '';

  return (
    '<div class="block block-columns"' +
    ' data-block-category="layout"' +
    ' data-block-type="columns"' +
    ' data-block-id="' + attr(block.id) + '"' +
    gridLinesAttr +
    ' style="--columns-template:' + gridTemplate(block.columns) + '">' +
    cells +
    '</div>'
  );
}
