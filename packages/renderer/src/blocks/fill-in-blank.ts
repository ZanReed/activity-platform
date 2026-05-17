import type { FillInBlankBlock } from '@activity/schema';
import { renderFillInBlankContent } from '../inline.js';
import { attr, escape } from '../html.js';

export interface FillInBlankRenderContext {
  problemNumber: number;
}

export function renderFillInBlank(
  block: FillInBlankBlock,
  ctx: FillInBlankRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  // renderFillInBlankContent (not a bare renderInline map) so each blank
  // token is numbered for its positional aria-label.
  const inner = renderFillInBlankContent(block.content);
  return (
    '<div class="block block-fill-in-blank"' +
    ' data-block-category="question"' +
    ' data-block-type="fill_in_blank"' +
    ' data-block-id="' + attr(block.id) + '">' +
      '<div class="block-problem-number">' + escape(String(num)) + '.</div>' +
      '<div class="block-problem-body">' + inner + '</div>' +
    '</div>'
  );
}
