import type { ImageBlock } from '@activity/schema';
import { attr, escape } from '../html.js';
import { sizingClass, sizingAttrs } from './sizing.js';

export function renderImage(block: ImageBlock): string {
  const captionHtml = block.caption
  ? '<figcaption>' + escape(block.caption) + '</figcaption>'
  : '';
  return (
    '<figure class="block block-image' + sizingClass(block) + '"' +
    ' data-block-category="content"' +
    ' data-block-type="image"' +
    ' data-block-id="' + attr(block.id) + '"' +
    sizingAttrs(block) + '>' +
    '<img src="' + attr(block.src) + '"' +
    ' alt="' + attr(block.alt) + '"' +
    ' loading="lazy"' +
    ' decoding="async"' +
    ' />' +
    captionHtml +
    '</figure>'
  );
}
