// =============================================================================
// row.ts — Render a structural Row (rows-of-columns layout)
// -----------------------------------------------------------------------------
// The document body is a stack of rows. A 1-column row is the normal full-width
// vertical flow; a multi-column row is a side-by-side split. This replaces the
// old `columns` block renderer — layout is now the universal container above
// blocks, not an inserted block type.
//
// FLAT 1-column fast path: a single-column row with no reserved-space floor
// renders its column's block stack DIRECTLY — no grid wrapper. The overwhelming
// common case (single-column flow) therefore adds ZERO DOM/layout overhead vs a
// bare block stream; only a multi-column row (or a 1-col row with a work-space
// floor) emits the grid container.
//
// Numbering: columns are walked in array order, each column's blocks in order,
// all sharing ctx.nextProblemNumber — so problems in a multi-column row number
// column-major (column 1 top-to-bottom, then column 2, …).
// =============================================================================

import type { Row, Column } from '@activity/schema';
import type { BlockRenderContext } from './blocks/index.js';
import { renderBlock } from './blocks/index.js';
import { attr } from './html.js';
import { remLength } from './blocks/sizing.js';

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
// ctx.gridLinesDefault). The CSS keys off the data-grid-lines attribute, emitted
// only when the resolved value is true.
function resolveGridLines(row: Row, ctx: BlockRenderContext): boolean {
  if (row.gridLines === 'on') return true;
  if (row.gridLines === 'off') return false;
  return ctx.gridLinesDefault ?? false;
}

export function renderRow(row: Row, ctx: BlockRenderContext): string {
  const first = row.columns[0];

  // Flat fast-path: one column, no work-space floor → render the block stack
  // directly, no grid wrapper (byte-identical to a plain section block stream).
  if (row.columns.length === 1 && first && first.minHeight === undefined) {
    return first.blocks.map((b) => renderBlock(b, ctx)).join('');
  }

  // Grid path: multi-column, or a 1-col row carrying a minHeight floor.
  const cells = row.columns
    .map((col) => {
      const inner = col.blocks.map((b) => renderBlock(b, ctx)).join('');
      // Reserved work space: minHeight rides as --cell-min-height (consumed by
      // the .column-cell rule) instead of an inline min-height, so a stylesheet
      // rule could override it per media. A floor, not a fixed height: the cell
      // still grows with content, so foldable measurement stays honest.
      const minHeightStyle =
        col.minHeight !== undefined
          ? ' style="--cell-min-height:' + remLength(col.minHeight) + '"'
          : '';
      return '<div class="column-cell"' + minHeightStyle + '>' + inner + '</div>';
    })
    .join('');

  const gridLinesAttr = resolveGridLines(row, ctx) ? ' data-grid-lines="true"' : '';

  return (
    '<div class="block block-row"' +
    ' data-block-category="layout"' +
    ' data-block-type="row"' +
    ' data-block-id="' + attr(row.id) + '"' +
    gridLinesAttr +
    ' style="--columns-template:' + gridTemplate(row.columns) + '">' +
    cells +
    '</div>'
  );
}
