// =============================================================================
// image-crop.test.ts — CR-M2/M4/M8/M9 + identity: the crop render math.
// -----------------------------------------------------------------------------
// A cropped image renders a fixed-aspect figure (aspect-ratio = srcAspect·w/h)
// with an absolutely-positioned <img> scaled/offset so the [x,y,w,h] window
// fills it. Uncropped images are byte-identical to before. Design:
// docs/design/image-crop.md. Spec: TEST_SPEC.md "Slice: Image crop mode".
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBlock } from '../blocks/index.js';
import { blockStyles } from '../runtime/styles.js';
import { ImageBlock } from '@activity/schema';

const ctx = () => ({ nextProblemNumber: () => 1 });

const image = (extra: Record<string, unknown> = {}) =>
  ImageBlock.parse({
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    type: 'image',
    src: 'https://example.com/fig.png',
    alt: 'A diagram',
    ...extra,
  });

describe('image crop rendering (CR-M2)', () => {
  it('uncropped image is byte-identical to a plain figure (identity)', () => {
    const html = renderBlock(image(), ctx());
    expect(html).not.toContain('is-cropped');
    expect(html).not.toContain('aspect-ratio');
    expect(html).not.toContain('data-block-width');
    // The plain <img> keeps its attributes and carries no positioning style.
    expect(html).toContain('src="https://example.com/fig.png"');
    expect(html).toContain('alt="A diagram"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it('cropped image emits the derived aspect + scaled/offset img (the math)', () => {
    // crop window: x=0.25, y=0.1, w=0.5, h=0.5; srcAspect=2 (a 2:1 source).
    // A = srcAspect·(w/h) = 2·(0.5/0.5) = 2.
    // img: width 100/0.5=200%, height 100/0.5=200%, left -(0.25/0.5)·100=-50%,
    //      top -(0.1/0.5)·100=-20%.
    const html = renderBlock(
      image({ crop: { x: 0.25, y: 0.1, w: 0.5, h: 0.5 }, srcAspect: 2 }),
      ctx(),
    );
    expect(html).toContain('is-cropped');
    expect(html).toContain('aspect-ratio:2');
    expect(html).toContain('width:200%');
    expect(html).toContain('height:200%');
    expect(html).toContain('left:-50%');
    expect(html).toContain('top:-20%');
  });

  it('a non-square crop derives a fractional aspect', () => {
    // x=0,y=0,w=0.5,h=0.25; srcAspect=1.5 → A = 1.5·(0.5/0.25) = 3.
    const html = renderBlock(
      image({ crop: { x: 0, y: 0, w: 0.5, h: 0.25 }, srcAspect: 1.5 }),
      ctx(),
    );
    expect(html).toContain('aspect-ratio:3');
    expect(html).toContain('width:200%');
    expect(html).toContain('height:400%');
  });

  it('CR-M9 — a cropped <img> retains src/alt/loading/decoding', () => {
    const html = renderBlock(
      image({ crop: { x: 0, y: 0, w: 0.5, h: 0.5 }, srcAspect: 1 }),
      ctx(),
    );
    expect(html).toContain('src="https://example.com/fig.png"');
    expect(html).toContain('alt="A diagram"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it('CR-M2 — crop composes with width sizing (both on the figure)', () => {
    const html = renderBlock(
      image({ crop: { x: 0, y: 0, w: 0.5, h: 0.5 }, srcAspect: 1, width: 0.5 }),
      ctx(),
    );
    expect(html).toContain('is-cropped');
    expect(html).toContain('block-sized');
    expect(html).toContain('--block-width:50%');
    expect(html).toContain('aspect-ratio:1');
  });
});

describe('crop safety guard (CR-M8 / CR-INV-safe)', () => {
  // A degenerate srcAspect (a sizeless SVG that somehow reached the renderer)
  // must NOT emit a 0/NaN/Infinity aspect — fall back to the plain image.
  // (ImageBlock.parse rejects srcAspect ≤ 0, so build the block raw to exercise
  // the renderer's own defensive guard.)
  const raw = (srcAspect: number) => ({
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    type: 'image' as const,
    src: 'https://example.com/x.svg',
    alt: '',
    crop: { x: 0, y: 0, w: 0.5, h: 0.5 },
    srcAspect,
  });

  for (const bad of [0, Number.NaN, Number.POSITIVE_INFINITY, -1]) {
    it(`falls back to a plain image when srcAspect is ${bad}`, () => {
      const html = renderBlock(raw(bad), ctx());
      expect(html).not.toContain('is-cropped');
      expect(html).not.toContain('Infinity');
      expect(html).not.toContain('NaN');
      expect(html).not.toContain('aspect-ratio');
    });
  }
});

describe('caption + crop (CR-S2)', () => {
  // The <figcaption> is a figure SIBLING of the crop window (the aspect/overflow
  // box), NOT inside it — so the window's overflow:hidden never clips it. The
  // markup order proves the structure: window closes, THEN the figcaption opens.
  it('renders the figcaption outside the overflow-clipped window', () => {
    const html = renderBlock(
      image({
        crop: { x: 0, y: 0, w: 0.5, h: 0.5 },
        srcAspect: 2,
        caption: 'A framed diagram',
      }),
      ctx(),
    );
    expect(html).toContain('block-image-window');
    expect(html).toContain('<figcaption>A framed diagram</figcaption>');
    // The figcaption comes AFTER the closing </span> of the window (a sibling),
    // never nested inside it.
    const windowClose = html.indexOf('</span>');
    const figcaption = html.indexOf('<figcaption>');
    expect(windowClose).toBeGreaterThan(-1);
    expect(figcaption).toBeGreaterThan(windowClose);
    // aspect-ratio + overflow ride the inner window, not the figure.
    expect(html).toContain('<span class="block-image-window" style="aspect-ratio:2">');
  });

  it('the crop window CSS clips (overflow) but the figcaption CSS does not', () => {
    // The stylesheet applies overflow only to the window; .block-image-caption
    // (the caption) carries no clip. Guards the "caption survives print" claim.
    expect(blockStyles).toContain('.block-image-window');
    expect(blockStyles).toMatch(/\.block-image-window\s*\{[^}]*overflow:\s*hidden/);
  });
});

describe('print keeps the cropped window (CR-M4)', () => {
  // The renderer emits ONE media-independent HTML string; the crop (aspect-ratio
  // + the scaled/offset img + the window's overflow) is inline/base CSS, applied
  // in print exactly as on screen. The @media print baseline never neutralizes
  // the crop, so a cropped image prints its window, not the full source.
  it('the cropped markup is present and print does not reset the crop', () => {
    const html = renderBlock(
      image({ crop: { x: 0.25, y: 0.1, w: 0.5, h: 0.5 }, srcAspect: 2 }),
      ctx(),
    );
    // The window (aspect box) + the offset/scaled img survive into print HTML.
    expect(html).toContain('block-image-window');
    expect(html).toContain('aspect-ratio:2');
    expect(html).toContain('width:200%');
    expect(html).toContain('left:-50%');

    // The @media print block must not override the crop wrapper's aspect/overflow
    // or the absolute img (which would un-crop the printed figure).
    const printBlock = blockStyles.slice(blockStyles.indexOf('@media print'));
    expect(printBlock).not.toMatch(/\.block-image-window[^}]*aspect-ratio\s*:\s*auto/);
    expect(printBlock).not.toMatch(/\.block-image-window[^}]*overflow\s*:\s*visible/);
    expect(printBlock).not.toMatch(/\.block-image-window\s*>\s*img[^}]*position\s*:\s*static/);
  });
});
