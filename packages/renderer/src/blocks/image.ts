import type { ImageBlock } from '@activity/schema';
import { attr, escape } from '../html.js';
import { sizingClass, sizingAttrs } from './sizing.js';

// Trim float artifacts (0.6666·100 → 66.66666 → "66.6667") while keeping useful
// precision. Inputs are schema-validated numbers, so the output is a safe token.
function fmt(n: number): string {
  return String(Number(n.toFixed(4)));
}

// A crop renders as a wrapper with the crop's PIXEL aspect + overflow:hidden and
// an absolutely-positioned <img> scaled/offset so the [x,y,w,h] window fills the
// figure. The renderer is pure (no image dimensions), so the aspect is derived
// from the stored srcAspect: A = srcAspect·(w/h). width/height % resolve against
// the wrapper's width/height (absolute positioning); left/top shift the source
// so the window's top-left lands at the wrapper origin. Cross-browser plain CSS
// (no object-view-box). Design: docs/design/image-crop.md. Spec: CR-M2.
//
// Guard (CR-M8): only render the crop when srcAspect is finite + positive and
// w,h > 0. A degenerate crop (e.g. a sizeless SVG that reached here) falls back
// to the plain image rather than emitting a 0/NaN/Infinity aspect.
function cropStyle(
  crop: { x: number; y: number; w: number; h: number },
  srcAspect: number,
): { aspect: string; imgStyle: string } | null {
  const { x, y, w, h } = crop;
  if (!Number.isFinite(srcAspect) || srcAspect <= 0 || w <= 0 || h <= 0) {
    return null;
  }
  return {
    aspect: fmt(srcAspect * (w / h)),
    imgStyle:
      'width:' + fmt(100 / w) + '%;' +
      'height:' + fmt(100 / h) + '%;' +
      'left:' + fmt(-(x / w) * 100) + '%;' +
      'top:' + fmt(-(y / h) * 100) + '%',
  };
}

export function renderImage(block: ImageBlock): string {
  const captionHtml = block.caption
    ? '<figcaption>' + escape(block.caption) + '</figcaption>'
    : '';

  // Cropped path: only when both crop AND srcAspect are present (stored
  // both-or-neither) and the crop is non-degenerate (CR-M8 guard).
  const crop =
    block.crop && typeof block.srcAspect === 'number'
      ? cropStyle(block.crop, block.srcAspect)
      : null;

  if (crop) {
    const { aspect, imgStyle } = crop;
    // The crop window (aspect-ratio + overflow:hidden) is an INNER element, not
    // the figure, so the <figcaption> — a figure sibling of the window — is not
    // clipped by the window's overflow (CR-S2). overflow:hidden makes the window
    // a scroll container with min-height 0, so aspect-ratio fixes its height
    // exactly; a caption inside it would be cut off. sizing (--block-width) stays
    // on the figure; the window fills it at 100%.
    return (
      '<figure class="block block-image is-cropped' + sizingClass(block) + '"' +
      ' data-block-category="content"' +
      ' data-block-type="image"' +
      ' data-block-id="' + attr(block.id) + '"' +
      sizingAttrs(block) + '>' +
      '<span class="block-image-window" style="aspect-ratio:' + aspect + '">' +
      '<img src="' + attr(block.src) + '"' +
      ' alt="' + attr(block.alt) + '"' +
      ' loading="lazy"' +
      ' decoding="async"' +
      ' style="' + attr(imgStyle) + '"' +
      ' />' +
      '</span>' +
      captionHtml +
      '</figure>'
    );
  }

  // Uncropped path — byte-identical to before the crop feature (CR-M2 identity).
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
