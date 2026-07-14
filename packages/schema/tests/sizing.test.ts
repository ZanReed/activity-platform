// =============================================================================
// sizing.test.ts — Variable block sizing fields (Drop 1)
// -----------------------------------------------------------------------------
// width/align on ImageBlock + MathBlock, minHeight on Column. All optional —
// the load-bearing assertions are that absent fields still validate (additive,
// no schemaVersion bump) and that the bounds reject the values the editor
// must never write.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  ImageBlock,
  MathBlock,
  Row,
  createImageBlock,
  createMathBlock,
  createRow,
} from '../src/index.js';

describe('Per-block sizing (width/align)', () => {
  const baseImage = () => createImageBlock('https://example.com/fig.png');

  it('blocks without sizing fields still validate (additive change)', () => {
    expect(ImageBlock.safeParse(baseImage()).success).toBe(true);
    expect(MathBlock.safeParse(createMathBlock()).success).toBe(true);
  });

  it('accepts a width fraction in (0, 1]', () => {
    expect(ImageBlock.safeParse({ ...baseImage(), width: 0.33 }).success).toBe(true);
    expect(ImageBlock.safeParse({ ...baseImage(), width: 1 }).success).toBe(true);
    expect(MathBlock.safeParse({ ...createMathBlock(), width: 0.5 }).success).toBe(true);
  });

  it('rejects width 0, negative width, and width > 1', () => {
    expect(ImageBlock.safeParse({ ...baseImage(), width: 0 }).success).toBe(false);
    expect(ImageBlock.safeParse({ ...baseImage(), width: -0.5 }).success).toBe(false);
    expect(ImageBlock.safeParse({ ...baseImage(), width: 1.5 }).success).toBe(false);
  });

  it('accepts the three alignments and rejects unknown values', () => {
    for (const align of ['left', 'center', 'right'] as const) {
      expect(ImageBlock.safeParse({ ...baseImage(), width: 0.5, align }).success).toBe(true);
    }
    expect(
      ImageBlock.safeParse({ ...baseImage(), width: 0.5, align: 'middle' }).success,
    ).toBe(false);
  });
});

describe('ImageBlock.height (fixed display height, rem)', () => {
  const baseImage = () => createImageBlock('https://example.com/fig.png');

  it('accepts a positive rem height, alone or with width', () => {
    expect(ImageBlock.safeParse({ ...baseImage(), height: 12 }).success).toBe(true);
    expect(
      ImageBlock.safeParse({ ...baseImage(), width: 0.5, height: 7.5 }).success,
    ).toBe(true);
  });

  it('rejects zero and negative heights', () => {
    expect(ImageBlock.safeParse({ ...baseImage(), height: 0 }).success).toBe(false);
    expect(ImageBlock.safeParse({ ...baseImage(), height: -4 }).success).toBe(false);
  });
});

describe('Column.minHeight', () => {
  it('a column without minHeight still validates (additive change)', () => {
    expect(Row.safeParse(createRow()).success).toBe(true);
  });

  it('accepts a positive rem floor', () => {
    const block = createRow(2);
    block.columns[0]!.minHeight = 8;
    block.columns[1]!.minHeight = 2.5;
    expect(Row.safeParse(block).success).toBe(true);
  });

  it('rejects zero and negative minHeight', () => {
    const zero = createRow(2);
    (zero.columns[0] as { minHeight: number }).minHeight = 0;
    expect(Row.safeParse(zero).success).toBe(false);

    const negative = createRow(2);
    (negative.columns[0] as { minHeight: number }).minHeight = -3;
    expect(Row.safeParse(negative).success).toBe(false);
  });
});
