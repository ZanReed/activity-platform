import type { ParagraphBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr } from '../html.js';

export function renderParagraph(block: ParagraphBlock): string {
  const inner = block.content.map(renderInline).join('');
  return (
    '<p class="block block-paragraph" data-id="' + attr(block.id) + '">' +
      inner +
    '</p>'
  );
}
