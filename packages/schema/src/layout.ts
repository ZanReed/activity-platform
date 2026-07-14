// =============================================================================
// layout.ts — Structural layout layer: Row + Column
// -----------------------------------------------------------------------------
// The document body is a stack of ROWS. A row lays its child columns side by
// side; each column holds its own STACK of blocks (block+). One column is the
// identity/default — a 1-column row is the normal full-width vertical flow, and
// "add columns" splits a row into more columns. This replaces the old `columns`
// block type: layout is now the universal container instead of an inserted
// block, which is how quality print engines (InDesign, print CSS) and web
// layout tools model a document.
//
// No recursion: `row` and `column` are NOT members of the Block union (Block is
// leaf blocks only), so a Column's `blocks: Block[]` can never contain a Row.
// The old columns-in-columns guard (an enumerated cell union) is therefore a
// structural fact here, not an enforced exclusion.
//
// width is an optional unitless weight per column: a column with width 2 beside
// a column with width 1 takes 2/3 of the row. Absent → equal split. This is the
// reason layout is structural rather than a CSS toggle — "wide worked example +
// narrow answer strip" needs unequal widths.
//
// minHeight is a reserved work-space floor in rem. The cell still GROWS with
// content (a floor, not a fixed height — fixed heights break print reflow and
// the foldable's height measurement). rem so the reserved space scales with the
// print font-size config. Absent = content-determined height.
// =============================================================================

import { z } from 'zod';

import { Block } from './blocks/index.js';

// gridLines turns a row into a ruled grid: a border around the whole row, rules
// between the cells, and rules between the stacked blocks within a cell.
// Especially useful in print (boxed regions to write in / cut out). Tri-state so
// a row can defer to the activity-wide default:
//   'inherit' — follow meta.print.gridLines (the activity default; the renderer
//               resolves this). Default, so a freshly authored row tracks the
//               activity setting without per-row fiddling.
//   'on'      — always ruled, regardless of the activity default.
//   'off'     — never ruled, regardless of the activity default.
export const ColumnGridLines = z.enum(['inherit', 'on', 'off']);
export type ColumnGridLines = z.infer<typeof ColumnGridLines>;

export const Column = z.object({
  id: z.string().uuid(),
  // Per-column width weight (fr units). Optional; absent = equal split.
  width: z.number().positive().optional(),
  // Reserved work-space floor in rem (a min-height, not a fixed height).
  minHeight: z.number().positive().optional(),
  // A column holds a non-empty STACK of blocks (block+). A column can hold a
  // heading followed by several problems — the thing a document tool needs and
  // a one-block-per-row model can't express.
  blocks: z.array(Block).min(1),
});
export type Column = z.infer<typeof Column>;

// 1..6 columns. The editor surfaces a non-blocking warning above 3 (too narrow
// to read on paper or a Chromebook), but the schema accepts up to 6 so an
// intentional dense layout still validates. One column is the identity state:
// a full-width row that "remove column" cannot dissolve below.
export const Row = z.object({
  id: z.string().uuid(),
  columns: z.array(Column).min(1).max(6),
  gridLines: ColumnGridLines.default('inherit'),
});
export type Row = z.infer<typeof Row>;
