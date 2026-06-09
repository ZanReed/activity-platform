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

// grid-template-columns from the width weights: default weight 1 → equal split;
// [width:2, width:1] → "2fr 1fr". Values are schema-validated positive numbers,
// so the result is a safe, fixed-shape token list (no user strings).
function gridTemplate(columns: Column[]): string {
  return columns
    .map((c) => (c.width && c.width > 0 ? c.width : 1) + 'fr')
    .join(' ');
}

export function renderColumns(block: ColumnsBlock, ctx: BlockRenderContext): string {
  const cells = block.columns
    .map((col) => {
      const inner = col.blocks.map((b) => renderBlock(b, ctx)).join('');
      return '<div class="column-cell">' + inner + '</div>';
    })
    .join('');

  return (
    '<div class="block block-columns"' +
    ' data-block-category="layout"' +
    ' data-block-type="columns"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' style="--columns-template:' + gridTemplate(block.columns) + '">' +
    cells +
    '</div>'
  );
}
