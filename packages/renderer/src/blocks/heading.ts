import type { HeadingBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr } from '../html.js';

export function renderHeading(block: HeadingBlock): string {
  const inner = block.content.map(renderInline).join('');
  const tag = 'h' + block.level;
  return (
    '<' + tag + ' class="block block-heading block-heading-' + block.level + '"' +
    ' data-block-category="content"' +
    ' data-id="' + attr(block.id) + '">' +
      inner +
    '</' + tag + '>'
  );
}
