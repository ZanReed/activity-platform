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
import { renderColumns } from './columns.js';
import { renderInteractiveGraph } from './interactive-graph.js';
import { renderMultipleChoice } from './multiple-choice.js';
import { renderMatching } from './matching.js';
import { renderOrdering } from './ordering.js';
import { renderNumberLine } from './number-line.js';

export interface BlockRenderContext {
  /**
   * Pull the next auto-number from the document-wide problem sequence. Called
   * once per numbered block (problem / fill_in_blank), in render order. A
   * closure (not a static number) so a columns container can draw numbers for
   * the problems nested in its cells from the same shared sequence — yielding
   * column-major numbering (column 1 top-to-bottom, then column 2, …).
   */
  nextProblemNumber: () => number;
  /** Answer-key print variant: prefill each blank with its answer (Drop C). */
  showAnswers?: boolean;
  /**
   * Activity-wide default for ruled columns grids (meta.print.gridLines). A
   * ColumnsBlock with gridLines:'inherit' resolves to this; an explicit
   * 'on'/'off' on the block overrides it. Defaults to false when absent.
   */
  gridLinesDefault?: boolean;
  /**
   * Absolute URL of the shared graph kit on R2, forwarded to interactive_graph
   * blocks as data-graph-kit-src. Absent in dev-without-R2 and the print path;
   * the graph block then renders its static no-JS placeholder. Threaded from
   * RenderContext.calculatorKitUrl (one kit serves calculator + graph).
   */
  graphKitUrl?: string;
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
      return renderProblem(block, { problemNumber: ctx.nextProblemNumber() });
    case 'fill_in_blank':
      return renderFillInBlank(block, {
        problemNumber: ctx.nextProblemNumber(),
        showAnswers: ctx.showAnswers,
      });
    case 'bullet_list':
      return renderBulletList(block);
    case 'ordered_list':
      return renderOrderedList(block);
    case 'columns':
      return renderColumns(block, ctx);
    case 'interactive_graph':
      // Display (static) graphs are ungraded content — they don't pull from the
      // problem sequence. Only graded interactions consume a number.
      return renderInteractiveGraph(block, {
        problemNumber:
          block.interaction.type === 'display' ? 0 : ctx.nextProblemNumber(),
        graphKitUrl: ctx.graphKitUrl,
        showAnswers: ctx.showAnswers,
      });
    case 'multiple_choice':
      return renderMultipleChoice(block, {
        problemNumber: ctx.nextProblemNumber(),
        showAnswers: ctx.showAnswers,
      });
    case 'matching':
      return renderMatching(block, {
        problemNumber: ctx.nextProblemNumber(),
        showAnswers: ctx.showAnswers,
      });
    case 'ordering':
      return renderOrdering(block, {
        problemNumber: ctx.nextProblemNumber(),
        showAnswers: ctx.showAnswers,
      });
    case 'number_line':
      return renderNumberLine(block, {
        problemNumber: ctx.nextProblemNumber(),
        graphKitUrl: ctx.graphKitUrl,
        showAnswers: ctx.showAnswers,
      });
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
 * The graded question blocks do (problem, fill_in_blank, graded
 * interactive_graph); everything else doesn't — including a display-mode
 * interactive_graph, which is ungraded static content.
 */
export function isNumberedBlock(block: Block): boolean {
  return (
    block.type === 'problem' ||
    block.type === 'fill_in_blank' ||
    block.type === 'multiple_choice' ||
    block.type === 'matching' ||
    block.type === 'ordering' ||
    block.type === 'number_line' ||
    (block.type === 'interactive_graph' && block.interaction.type !== 'display')
  );
}
