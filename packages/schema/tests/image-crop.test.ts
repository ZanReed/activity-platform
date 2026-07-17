// =============================================================================
// image-crop.test.ts — CR-M1: crop rect + srcAspect schema validation.
// -----------------------------------------------------------------------------
// The crop window is a normalized rect inside the source; it must stay inside
// (x+w ≤ 1, y+h ≤ 1). srcAspect is the source's natural W/H ratio (positive).
// Both are optional and additive. Design: docs/design/image-crop.md. Spec:
// TEST_SPEC.md "Slice: Image crop mode" CR-M1.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { ImageBlock, CropRect, createImageBlock } from '../src/index.js';

const base = () => createImageBlock('https://example.com/fig.png');
const cropped = (crop: unknown, srcAspect: unknown = 1.5) => ({
  ...base(),
  crop,
  srcAspect,
});

describe('CropRect bounds', () => {
  it('accepts a window inside the source', () => {
    expect(CropRect.safeParse({ x: 0, y: 0, w: 1, h: 1 }).success).toBe(true);
    expect(CropRect.safeParse({ x: 0.25, y: 0.1, w: 0.5, h: 0.6 }).success).toBe(true);
    // Exactly flush to the edges.
    expect(CropRect.safeParse({ x: 0.5, y: 0.5, w: 0.5, h: 0.5 }).success).toBe(true);
  });

  it('rejects a window that spills past the source (x+w > 1 or y+h > 1)', () => {
    expect(CropRect.safeParse({ x: 0.6, y: 0, w: 0.5, h: 1 }).success).toBe(false);
    expect(CropRect.safeParse({ x: 0, y: 0.7, w: 1, h: 0.5 }).success).toBe(false);
  });

  it('rejects zero/negative/oversized w or h and out-of-range x/y', () => {
    expect(CropRect.safeParse({ x: 0, y: 0, w: 0, h: 0.5 }).success).toBe(false);
    expect(CropRect.safeParse({ x: 0, y: 0, w: -0.2, h: 0.5 }).success).toBe(false);
    expect(CropRect.safeParse({ x: 0, y: 0, w: 1.2, h: 0.5 }).success).toBe(false);
    expect(CropRect.safeParse({ x: -0.1, y: 0, w: 0.5, h: 0.5 }).success).toBe(false);
    expect(CropRect.safeParse({ x: 1, y: 0, w: 0.5, h: 0.5 }).success).toBe(false);
  });
});

describe('ImageBlock crop + srcAspect', () => {
  it('validates without crop/srcAspect (additive, uncropped)', () => {
    expect(ImageBlock.safeParse(base()).success).toBe(true);
  });

  it('accepts a valid crop + positive srcAspect', () => {
    expect(
      ImageBlock.safeParse(cropped({ x: 0.1, y: 0.1, w: 0.5, h: 0.4 }, 1.777)).success,
    ).toBe(true);
  });

  it('rejects a non-positive srcAspect', () => {
    expect(ImageBlock.safeParse(cropped({ x: 0, y: 0, w: 0.5, h: 0.5 }, 0)).success).toBe(false);
    expect(ImageBlock.safeParse(cropped({ x: 0, y: 0, w: 0.5, h: 0.5 }, -2)).success).toBe(false);
  });

  it('rejects an out-of-bounds crop on the block', () => {
    expect(
      ImageBlock.safeParse(cropped({ x: 0.8, y: 0, w: 0.5, h: 0.5 })).success,
    ).toBe(false);
  });
});
