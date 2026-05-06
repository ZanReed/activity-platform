import type { ProblemBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr, escape } from '../html.js';

export interface ProblemRenderContext {
  /** The auto-numbered position of this problem in the document. */
  problemNumber: number;
}

export function renderProblem(block: ProblemBlock, ctx: ProblemRenderContext): string {
  const num = block.number ?? ctx.problemNumber;
  const inner = block.content.map(renderInline).join('');
  return (
    '<div class="block block-problem" data-id="' + attr(block.id) + '">' +
      '<div class="block-problem-number">' + escape(String(num)) + '.</div>' +
      '<div class="block-problem-body">' + inner + '</div>' +
    '</div>'
  );
}
