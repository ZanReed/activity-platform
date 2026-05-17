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
} from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr } from '../html.js';

export function renderBulletList(block: BulletListBlock): string {
    return (
        '<ul class="block block-bullet-list"' +
        ' data-block-category="content"' +
        ' data-block-type="bullet_list"' +
        ' data-block-id="' + attr(block.id) + '">' +
        block.items.map(renderListItem).join('') +
        '</ul>'
    );
}

export function renderOrderedList(block: OrderedListBlock): string {
    return (
        '<ol class="block block-ordered-list"' +
        ' data-block-category="content"' +
        ' data-block-type="ordered_list"' +
        ' data-block-id="' + attr(block.id) + '">' +
        block.items.map(renderListItem).join('') +
        '</ol>'
    );
}

function renderListItem(item: ListItem): string {
    const inlineHtml = item.content.map(renderInline).join('');
    const childrenHtml = (item.children ?? [])
    .map((child) =>
    child.type === 'bullet_list'
    ? renderBulletList(child)
    : renderOrderedList(child),
    )
    .join('');
    return (
        '<li data-id="' + attr(item.id) + '">' +
        inlineHtml +
        childrenHtml +
        '</li>'
    );
}
