// =============================================================================
// blocks/index.ts — Block discriminated union
// -----------------------------------------------------------------------------
// Single source of truth for "what block types exist in Phase 1." Adding a
// new block type means: new file under blocks/, new entry here, new factory
// in factories.ts, new renderer in @activity/renderer/blocks/. Three places,
// always in that order.
// =============================================================================

import { z } from 'zod';

import { ParagraphBlock } from './paragraph.js';
import { HeadingBlock } from './heading.js';
import { MathBlock } from './math-block.js';
import { ImageBlock } from './image.js';
import { CalloutBlock } from './callout.js';
import { ProblemBlock } from './problem.js';
import { FillInBlankBlock } from './fill-in-blank.js';
import { BulletListBlock, OrderedListBlock, ListItem } from './list.js';
import { ColumnsBlock } from './columns.js';
import { InteractiveGraphBlock } from './interactive-graph.js';

export const Block = z.discriminatedUnion('type', [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  BulletListBlock,
  OrderedListBlock,
  ColumnsBlock,
  InteractiveGraphBlock,
]);
export type Block = z.infer<typeof Block>;

// Re-export individual block types so consumers can import them by name.
export {
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  BulletListBlock,
  OrderedListBlock,
  ListItem,
  ColumnsBlock,
  InteractiveGraphBlock,
};
export { ColumnCellBlock, Column, ColumnGridLines } from './columns.js';
export {
  AxisConfig,
  PointInteraction,
  FunctionInteraction,
  FunctionModel,
  RegionInteraction,
  GraphInteraction,
} from './interactive-graph.js';
export type { HeadingLevel } from './heading.js';
export type { CalloutVariant } from './callout.js';
