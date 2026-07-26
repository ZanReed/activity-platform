import type { HeadingBlock, DefinitionHeadingBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { blockIdAttr } from '../html.js';

// Also serves definition-content headings — see renderParagraph.
export function renderHeading(
  block: HeadingBlock | DefinitionHeadingBlock,
): string {
  const inner = block.content.map(renderInline).join('');
  const tag = 'h' + block.level;
  return (
    '<' + tag + ' class="block block-heading block-heading-' + block.level + '"' +
    ' data-block-category="content"' +
    ' data-block-type="heading"' +
    blockIdAttr(block.id) + '>' +
    inner +
    '</' + tag + '>'
  );
}
