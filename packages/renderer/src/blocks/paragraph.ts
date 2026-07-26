import type { ParagraphBlock, DefinitionParagraphBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { blockIdAttr } from '../html.js';

// Accepts a definition-content paragraph too, so a definition popover and the
// body share ONE markup source (drift between them would be silent). The only
// difference is the optional id — see blockIdAttr.
export function renderParagraph(
  block: ParagraphBlock | DefinitionParagraphBlock,
): string {
  const inner = block.content.map(renderInline).join('');
  return (
    '<p class="block block-paragraph"' +
    ' data-block-category="content"' +
    ' data-block-type="paragraph"' +
    blockIdAttr(block.id) + '>' +
    inner +
    '</p>'
  );
}
