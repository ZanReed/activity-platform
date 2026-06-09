// =============================================================================
// blocks/index.ts — Block dispatcher
// -----------------------------------------------------------------------------
// Single switch over the block discriminator. Adding a new block type means
// adding a case here and a renderer file. The compiler enforces exhaustiveness
// via the `never` assertion in the default case — forget a new block type
// here and TypeScript won't compile.
// =============================================================================

import type { Block } from '@activity/schema';
import { renderParagraph } from './paragraph.js';
import { renderHeading } from './heading.js';
import { renderMathBlock } from './math-block.js';
import { renderImage } from './image.js';
import { renderCallout } from './callout.js';
import { renderProblem } from './problem.js';
import { renderFillInBlank } from './fill-in-blank.js';
import { renderBulletList, renderOrderedList } from './lists.js';

export interface BlockRenderContext {
  /** Auto-incremented across problem and fill_in_blank blocks. */
  problemNumber: number;
  /** Answer-key print variant: prefill each blank with its answer (Drop C). */
  showAnswers?: boolean;
}

export function renderBlock(block: Block, ctx: BlockRenderContext): string {
  switch (block.type) {
    case 'paragraph':
      return renderParagraph(block);
    case 'heading':
      return renderHeading(block);
    case 'math_block':
      return renderMathBlock(block);
    case 'image':
      return renderImage(block);
    case 'callout':
      return renderCallout(block);
    case 'problem':
      return renderProblem(block, ctx);
    case 'fill_in_blank':
      return renderFillInBlank(block, ctx);
    case 'bullet_list':
      return renderBulletList(block);
    case 'ordered_list':
      return renderOrderedList(block);
    default: {
      // Exhaustiveness check — if a new block type is added to the schema
      // and not handled here, TypeScript emits an error on this assignment.
      const _exhaustive: never = block;
      void _exhaustive;
      return '';
    }
  }
}

/**
 * True if this block participates in the auto-numbered problem sequence.
 * Both problem and fill_in_blank do; everything else doesn't.
 */
export function isNumberedBlock(block: Block): boolean {
  return block.type === 'problem' || block.type === 'fill_in_blank';
}
