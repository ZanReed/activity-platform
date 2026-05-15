import type { FillInBlankBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr, escape } from '../html.js';

export interface FillInBlankRenderContext {
  problemNumber: number;
}

export function renderFillInBlank(
  block: FillInBlankBlock,
  ctx: FillInBlankRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  const inner = block.content.map(renderInline).join('');
  return (
    '<div class="block block-fill-in-blank" data-block-category="question" data-id="' + attr(block.id) + '">' +
      '<div class="block-problem-number">' + escape(String(num)) + '.</div>' +
      '<div class="block-problem-body">' + inner + '</div>' +
    '</div>'
  );
}
