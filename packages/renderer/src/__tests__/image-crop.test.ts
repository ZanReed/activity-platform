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
