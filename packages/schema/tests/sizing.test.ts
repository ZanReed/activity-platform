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
  InteractiveGraphBlock,
  DataPlotBlock,
  NumberLineBlock,
  createImageBlock,
  createMathBlock,
  createRow,
  createInteractiveGraphBlock,
  createDataPlotBlock,
  createNumberLineBlock,
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

// `height` was removed (folded into crop mode, image-crop.md). Zod isn't
// .strict(), so a stray `height` on an old doc is silently stripped — not a
// validation error (CR-M1). Crop validation lives in image-crop.test.ts.
describe('ImageBlock.height removal', () => {
  const baseImage = () => createImageBlock('https://example.com/fig.png');

  it('ignores a stray height key (not .strict) rather than rejecting', () => {
    const parsed = ImageBlock.safeParse({ ...baseImage(), height: 12 });
    expect(parsed.success).toBe(true);
    expect((parsed as { data: Record<string, unknown> }).data.height).toBeUndefined();
  });
});

// SZ-M1 — the Group 3 sizing slice extends the sizing fragment to the three
// figure blocks (graph / data-plot / number-line). Same additive/optional
// contract as ImageBlock: absent still validates, width bounds enforced, the
// three alignments accepted. One parametrized sweep so a new figure block that
// forgets the fragment shows up as a failing row.
describe('Per-block sizing on figure blocks (graph / data-plot / number-line)', () => {
  const cases = [
    ['interactive_graph', InteractiveGraphBlock, createInteractiveGraphBlock],
    ['data_plot', DataPlotBlock, createDataPlotBlock],
    ['number_line', NumberLineBlock, createNumberLineBlock],
  ] as const;

  for (const [name, Schema, make] of cases) {
    describe(name, () => {
      it('validates without sizing fields (additive change)', () => {
        expect(Schema.safeParse(make()).success).toBe(true);
      });

      it('accepts a width fraction in (0, 1] with each alignment', () => {
        for (const align of ['left', 'center', 'right'] as const) {
          expect(Schema.safeParse({ ...make(), width: 0.5, align }).success).toBe(true);
        }
        expect(Schema.safeParse({ ...make(), width: 1 }).success).toBe(true);
      });

      it('rejects width 0, negative width, width > 1, and an unknown align', () => {
        expect(Schema.safeParse({ ...make(), width: 0 }).success).toBe(false);
        expect(Schema.safeParse({ ...make(), width: -0.25 }).success).toBe(false);
        expect(Schema.safeParse({ ...make(), width: 1.2 }).success).toBe(false);
        expect(Schema.safeParse({ ...make(), width: 0.5, align: 'middle' }).success).toBe(false);
      });
    });
  }
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
