// =============================================================================
// sizing.test.ts — Per-block width/align + cell min-height render (Drop 1)
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createColumnsBlock,
  createImageBlock,
  createMathBlock,
  type ActivityDocument,
} from '@activity/schema';
import { renderBody } from '../src/index.js';

function docWith(...blocks: ActivityDocument['sections'][number]['blocks']): ActivityDocument {
  const doc = createEmptyDocument({ title: 'T' });
  doc.sections[0]!.blocks = blocks;
  return doc;
}

describe('per-block sizing (width/align)', () => {
  it('an unsized block renders exactly as before (no class, no attrs)', () => {
    const body = renderBody(docWith(createImageBlock('https://example.com/a.png')));
    expect(body).toContain('class="block block-image"');
    expect(body).not.toContain('block-sized');
    expect(body).not.toContain('--block-width');
    expect(body).not.toContain('data-block-align');
  });

  it('a sized image gains block-sized and the width custom property', () => {
    const img = createImageBlock('https://example.com/a.png');
    img.width = 0.5;
    const body = renderBody(docWith(img));
    expect(body).toContain('class="block block-image block-sized"');
    expect(body).toContain('style="--block-width:50%"');
  });

  it('width 1 is a real fill width (block-sized at 100%), distinct from unsized', () => {
    const img = createImageBlock('https://example.com/a.png');
    img.width = 1;
    const body = renderBody(docWith(img));
    expect(body).toContain('class="block block-image block-sized"');
    expect(body).toContain('style="--block-width:100%"');
  });

  it('trims float artifacts in the percentage (0.33 → 33%)', () => {
    const img = createImageBlock('https://example.com/a.png');
    img.width = 0.33;
    const body = renderBody(docWith(img));
    expect(body).toContain('style="--block-width:33%"');
  });

  it('center is the attribute-free default; left/right emit data-block-align', () => {
    const centered = createImageBlock('https://example.com/a.png');
    centered.width = 0.5;
    centered.align = 'center';
    expect(renderBody(docWith(centered))).not.toContain('data-block-align');

    const left = createImageBlock('https://example.com/a.png');
    left.width = 0.5;
    left.align = 'left';
    expect(renderBody(docWith(left))).toContain('data-block-align="left"');

    const right = createImageBlock('https://example.com/a.png');
    right.width = 0.5;
    right.align = 'right';
    expect(renderBody(docWith(right))).toContain('data-block-align="right"');
  });

  it('align without width is a no-op (nothing to align)', () => {
    const img = createImageBlock('https://example.com/a.png');
    img.align = 'left';
    const body = renderBody(docWith(img));
    expect(body).not.toContain('data-block-align');
    expect(body).not.toContain('block-sized');
  });

  it('a fixed image height rides as --block-height (height alone: no block-sized)', () => {
    const img = createImageBlock('https://example.com/a.png');
    img.height = 12;
    const body = renderBody(docWith(img));
    expect(body).toContain('style="--block-height:12rem"');
    expect(body).not.toContain('block-sized');
  });

  it('width + height share one style attribute', () => {
    const img = createImageBlock('https://example.com/a.png');
    img.width = 0.5;
    img.height = 7.5;
    const body = renderBody(docWith(img));
    expect(body).toContain('style="--block-width:50%;--block-height:7.5rem"');
    expect(body).toContain('block-sized');
  });

  it('math blocks share the same mechanism', () => {
    const math = createMathBlock('x^2');
    math.width = 0.75;
    math.align = 'right';
    const body = renderBody(docWith(math));
    expect(body).toContain('class="block block-math block-sized"');
    expect(body).toContain('style="--block-width:75%"');
    expect(body).toContain('data-block-align="right"');
  });
});

describe('sizing CSS (published stylesheet)', () => {
  it('carries the block-sized rules, including image fill', async () => {
    const { blockStyles } = await import('../src/runtime/styles.js');
    expect(blockStyles).toContain('.block-sized {');
    expect(blockStyles).toContain('.block-image.block-sized img');
  });

  it('images consume --block-height and crop (cover) instead of stretching', async () => {
    const { blockStyles } = await import('../src/runtime/styles.js');
    expect(blockStyles).toContain('height: var(--block-height, auto)');
    expect(blockStyles).toContain('object-fit: cover');
  });
});

describe('Column.minHeight (reserved work space)', () => {
  it('a floored cell carries --cell-min-height in rem', () => {
    const cols = createColumnsBlock(2);
    cols.columns[0]!.minHeight = 8;
    const body = renderBody(docWith(cols));
    expect(body).toContain('<div class="column-cell" style="--cell-min-height:8rem">');
    // The unfloored sibling stays style-free.
    expect(body).toContain('<div class="column-cell">');
  });

  it('keeps fractional rem values', () => {
    const cols = createColumnsBlock(2);
    cols.columns[1]!.minHeight = 2.5;
    const body = renderBody(docWith(cols));
    expect(body).toContain('--cell-min-height:2.5rem');
  });
});
