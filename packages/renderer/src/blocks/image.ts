import type { ImageBlock } from '@activity/schema';
import { attr, escape } from '../html.js';
import { sizingClass, sizingAttrs, remLength } from './sizing.js';

export function renderImage(block: ImageBlock): string {
  const captionHtml = block.caption
  ? '<figcaption>' + escape(block.caption) + '</figcaption>'
  : '';
  // Fixed display height rides as --block-height (consumed by the .block-image
  // img rule). With width also set, object-fit center-CROPS to the authored
  // box; height alone scales proportionally (width follows the ratio).
  const heightVar =
    block.height !== undefined
      ? ['--block-height:' + remLength(block.height)]
      : [];
  return (
    '<figure class="block block-image' + sizingClass(block) + '"' +
    ' data-block-category="content"' +
    ' data-block-type="image"' +
    ' data-block-id="' + attr(block.id) + '"' +
    sizingAttrs(block, heightVar) + '>' +
    '<img src="' + attr(block.src) + '"' +
    ' alt="' + attr(block.alt) + '"' +
    ' loading="lazy"' +
    ' decoding="async"' +
    ' />' +
    captionHtml +
    '</figure>'
  );
}
