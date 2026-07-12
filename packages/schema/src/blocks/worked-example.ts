import { z } from 'zod';
import { ParagraphBlock } from './paragraph.js';
import { HeadingBlock } from './heading.js';
import { MathBlock } from './math-block.js';
import { ImageBlock } from './image.js';
import { BulletListBlock, OrderedListBlock } from './list.js';

// =============================================================================
// WorkedExampleBlock — a titled, boxed fully-worked example to study.
// -----------------------------------------------------------------------------
// A pure CONTENT block (data-block-category="content"): non-interactive,
// non-numbered, no runtime wiring, no submission wire impact. Draws on
// Sweller's cognitive-load theory — a worked example a student reads before
// attempting the analogous problem.
//
// Unlike a callout (inline-only body), a worked example holds NESTED BLOCK
// content so a multi-step, math-heavy solution renders properly: paragraphs,
// block math, lists, and images. The child union is deliberately a curated
// subset of the Block union — leaf CONTENT blocks only. It excludes:
//   - question blocks (a worked example is content, never scored),
//   - columns and worked_example itself (so nesting terminates — no recursion,
//     the same discipline as ColumnCellBlock forbidding columns-in-columns).
// This also keeps the dashboard index untouched: a worked example can never
// contain a question, so buildActivityIndex never needs to recurse into it.
//
// The subset matches the editor-mappable content nodes 1:1 (WorkedExample.ts's
// content expression), so serialize round-trips without silently dropping a
// child. `content` may be empty for the same reason LearningObjectives.items
// may be — an all-unmappable round trip (e.g. a single empty image) must not
// fail publish validation.
// =============================================================================

export const WorkedExampleChild = z.discriminatedUnion('type', [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  BulletListBlock,
  OrderedListBlock,
]);
export type WorkedExampleChild = z.infer<typeof WorkedExampleChild>;

export const WorkedExampleBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('worked_example'),
  title: z.string(),
  content: z.array(WorkedExampleChild),
});
export type WorkedExampleBlock = z.infer<typeof WorkedExampleBlock>;
