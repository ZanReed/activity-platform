// =============================================================================
// columns.ts — Structural columns container block
// -----------------------------------------------------------------------------
// A ColumnsBlock lays its child columns side by side. Each column holds its own
// stack of blocks, so columns are part of the *content* — they render
// identically on screen, in worksheet print, and inside a journal foldable
// panel, instead of being a per-output print setting.
//
// One level deep, by deliberate Phase 1 decision: a column cell holds any block
// EXCEPT another ColumnsBlock. Forbidding columns-in-columns keeps editor
// drag-and-drop, print layout, and the foldable's fixed-panel packing simple —
// and, conveniently, it also means the cell type references only leaf block
// schemas (none of which reference the columns container back), so there is NO
// recursive cycle here and NO z.lazy() is needed. (Lists self-nest, but that
// recursion is self-contained in list.ts.)
//
// width is an optional unitless weight per column: a column with width 2 beside
// a column with width 1 takes 2/3 of the row. Absent → equal split. This is the
// reason to make columns structural rather than a CSS print toggle — "wide
// worked example + narrow answer strip" needs unequal widths.
// =============================================================================

import { z } from 'zod';

import { ParagraphBlock } from './paragraph.js';
import { HeadingBlock } from './heading.js';
import { MathBlock } from './math-block.js';
import { ImageBlock } from './image.js';
import { CalloutBlock } from './callout.js';
import { ProblemBlock } from './problem.js';
import { FillInBlankBlock } from './fill-in-blank.js';
import { BulletListBlock, OrderedListBlock } from './list.js';

// Cell content = the full Block union MINUS ColumnsBlock. When a new leaf block
// type is added, add it here too (and to blocks/index.ts's full union).
export const ColumnCellBlock = z.discriminatedUnion('type', [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  BulletListBlock,
  OrderedListBlock,
]);
export type ColumnCellBlock = z.infer<typeof ColumnCellBlock>;

export const Column = z.object({
  id: z.string().uuid(),
  width: z.number().positive().optional(),
  blocks: z.array(ColumnCellBlock),
});
export type Column = z.infer<typeof Column>;

// 2..6 columns. The editor surfaces a non-blocking warning above 3 (too narrow
// to read on paper or a Chromebook), but the schema accepts up to 6 so an
// intentional dense layout still validates.
export const ColumnsBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('columns'),
  columns: z.array(Column).min(2).max(6),
});
export type ColumnsBlock = z.infer<typeof ColumnsBlock>;
