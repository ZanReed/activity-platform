// =============================================================================
// graph-figure-y7.test.ts — the Y7 geometry schema (y7-figures-and-charts.md
// Q2, D3/ER-2, D11, N6, N8, and the degenerate-axis refine N2)
// =============================================================================

import { describe, expect, it } from 'vitest';
import { AxisConfig, Drawable, GraphFigureBlock } from '../src/index.js';

const AXIS = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const ID = '11111111-1111-4111-8111-111111111111';

describe('the five mark kinds + dashed segments parse (Q2)', () => {
  it.each([
    ['angle_mark', { kind: 'angle_mark', at: [0, 0], from: [1, 0], to: [0, 1], label: '68°', style: 'right', reflex: false }],
    ['tick_mark', { kind: 'tick_mark', from: [0, 0], to: [1, 0], count: 3 }],
    ['parallel_mark', { kind: 'parallel_mark', from: [0, 0], to: [1, 0], count: 2, color: 'red' }],
    ['side_label', { kind: 'side_label', from: [0, 0], to: [1, 0], text: '8 cm' }],
    ['text', { kind: 'text', at: [0, 0], text: 'base' }],
    ['dashed segment', { kind: 'segment', from: [0, 0], to: [1, 0], style: 'dashed' }],
  ])('%s', (_n, d) => {
    expect(Drawable.parse(d)).toEqual(d);
  });

  it.each([
    ['tick count 4', { kind: 'tick_mark', from: [0, 0], to: [1, 0], count: 4 }],
    ['parallel count 3', { kind: 'parallel_mark', from: [0, 0], to: [1, 0], count: 3 }],
    ['empty side label', { kind: 'side_label', from: [0, 0], to: [1, 0], text: '' }],
    ['unknown angle style', { kind: 'angle_mark', at: [0, 0], from: [1, 0], to: [0, 1], style: 'triple' }],
  ])('refuses %s', (_n, d) => {
    expect(Drawable.safeParse(d).success).toBe(false);
  });
});

describe('AxisConfig refuses a degenerate window (N2, the TODOS refine)', () => {
  it.each([
    ['xMin = xMax', { ...AXIS, xMin: 5, xMax: 5 }],
    ['xMin > xMax', { ...AXIS, xMin: 6, xMax: 5 }],
    ['yMin = yMax', { ...AXIS, yMin: 0, yMax: 0 }],
  ])('%s', (_n, a) => {
    expect(AxisConfig.safeParse(a).success).toBe(false);
  });

  it('still accepts a proper window and fills its defaults', () => {
    expect(AxisConfig.parse(AXIS).showGrid).toBe(true);
  });
});

describe('GraphFigureBlock Y7 fields', () => {
  it('a figure stored BEFORE the slice still parses, picking up the defaults (REGRESSION)', () => {
    const old = { id: ID, type: 'graph_figure', axis: AXIS, drawables: [{ kind: 'point', at: [1, 2], label: 'A' }] };
    const parsed = GraphFigureBlock.parse(old);
    expect(parsed.plane).toBe(true);
    expect(parsed.toScale).toBe(false);
    expect(parsed.alt).toBeUndefined();
    expect(parsed.width).toBeUndefined();
  });

  it('carries alt, plane, toScale and sizing', () => {
    const parsed = GraphFigureBlock.parse({
      id: ID,
      type: 'graph_figure',
      axis: AXIS,
      drawables: [],
      alt: 'Triangle ABC',
      plane: false,
      toScale: true,
      width: 0.5,
      align: 'left',
    });
    expect(parsed).toMatchObject({ alt: 'Triangle ABC', plane: false, toScale: true, width: 0.5, align: 'left' });
  });
});

describe('GraphFigureBlock.caption (side-by-side figures)', () => {
  const base = { id: '11111111-1111-4111-8111-111111111111', type: 'graph_figure', axis: { xMin: 0, xMax: 4, yMin: 0, yMax: 4 }, drawables: [] };
  it('is optional, short, and never empty', () => {
    expect(GraphFigureBlock.parse(base).caption).toBeUndefined();
    expect(GraphFigureBlock.parse({ ...base, caption: 'A' }).caption).toBe('A');
    expect(GraphFigureBlock.parse({ ...base, caption: 'Before' }).caption).toBe('Before');
    expect(GraphFigureBlock.safeParse({ ...base, caption: '' }).success).toBe(false);
    expect(GraphFigureBlock.safeParse({ ...base, caption: 'x'.repeat(13) }).success).toBe(false);
    expect(GraphFigureBlock.safeParse({ ...base, caption: 'x'.repeat(12) }).success).toBe(true);
  });
});
