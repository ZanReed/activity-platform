// =============================================================================
// list.ts — Render bullet and ordered list blocks
// -----------------------------------------------------------------------------
// Recursive rendering. Each list item's children render via the same
// renderBulletList/renderOrderedList pair, no depth limit beyond what the
// document actually contains. Pure string concatenation — no DOM.
// =============================================================================

import type {
    BulletListBlock,
    OrderedListBlock,
    ListItem,
    DefinitionBulletListBlock,
    DefinitionOrderedListBlock,
    DefinitionListItem,
} from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr, blockIdAttr } from '../html.js';

// These also render definition-content lists, so a definition popover and the
// body share ONE markup source — see renderParagraph. Definition list blocks
// and items carry an OPTIONAL id (nothing addresses them, and the schema's
// legacy upgrades must stay deterministic), which is the only shape difference;
// a body list always has its uuid, so its output is byte-identical.
export function renderBulletList(
    block: BulletListBlock | DefinitionBulletListBlock,
): string {
    return (
        '<ul class="block block-bullet-list"' +
        ' data-block-category="content"' +
        ' data-block-type="bullet_list"' +
        blockIdAttr(block.id) + '>' +
        block.items.map(renderListItem).join('') +
        '</ul>'
    );
}

export function renderOrderedList(
    block: OrderedListBlock | DefinitionOrderedListBlock,
): string {
    return (
        '<ol class="block block-ordered-list"' +
        ' data-block-category="content"' +
        ' data-block-type="ordered_list"' +
        blockIdAttr(block.id) + '>' +
        block.items.map(renderListItem).join('') +
        '</ol>'
    );
}

function renderListItem(item: ListItem | DefinitionListItem): string {
    const inlineHtml = item.content.map(renderInline).join('');
    const childrenHtml = (item.children ?? [])
    .map((child: BulletListBlock | OrderedListBlock | DefinitionBulletListBlock | DefinitionOrderedListBlock) =>
    child.type === 'bullet_list'
    ? renderBulletList(child)
    : renderOrderedList(child),
    )
    .join('');
    return (
        (item.id === undefined
            ? '<li>'
            : '<li data-id="' + attr(item.id) + '">') +
        inlineHtml +
        childrenHtml +
        '</li>'
    );
}
