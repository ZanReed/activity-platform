import type { CalloutBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr } from '../html.js';

const ICON: Record<CalloutBlock['variant'], string> = {
  info:    'ℹ️',
  warning: '⚠️',
  success: '✅',
  note:    '📝',
};

export function renderCallout(block: CalloutBlock): string {
  const inner = block.content.map(renderInline).join('');
  return (
    '<aside class="block block-callout block-callout-' + block.variant + '"' +
    ' data-id="' + attr(block.id) + '"' +
    ' role="note">' +
      '<span class="block-callout-icon" aria-hidden="true">' + ICON[block.variant] + '</span>' +
      '<div class="block-callout-body">' + inner + '</div>' +
    '</aside>'
  );
}
