// @vitest-environment jsdom
// =============================================================================
// board-segment-arrow.test.ts — the SCREEN half of the segment arrowhead
// -----------------------------------------------------------------------------
// Two renderers draw every drawable kind (learning two-renderers-per-drawable-
// kind). The paper half is pinned on rendered SVG in the viewer's
// graph-figure.test.tsx; this pins what drawStaticDrawables asks JSXGraph to
// create, through a recording fake board — the calls ARE the board's output.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { drawStaticDrawables, type DisplayDrawable } from '../src/board.js';

interface Call { type: string; parents: unknown[]; attrs: Record<string, unknown> }

function drawOn(drawables: DisplayDrawable[]): Call[] {
  const calls: Call[] = [];
  const board = {
    unitX: 40,
    unitY: 40,
    canvasWidth: 400,
    create(type: string, parents: unknown[], attrs: Record<string, unknown> = {}) {
      calls.push({ type, parents, attrs });
      return {};
    },
  };
  drawStaticDrawables(board as never, { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }, drawables, 'light');
  return calls;
}

describe('the board draws an arrowed segment as a vector', () => {
  it('a solid head whose tip is ON `to`, the shaft stopping short, and no dots', () => {
    const calls = drawOn([
      { kind: 'segment', from: [0, 0], to: [3, 0], arrow: true, endpoints: ['closed', 'closed'] },
    ]);
    const shaft = calls.find((c) => c.type === 'segment')!;
    const head = calls.find((c) => c.type === 'polygon')!;
    expect(head, 'an arrowed segment draws a head').toBeDefined();
    expect(head.attrs.fillOpacity).toBe(1);
    const tip = (head.parents as [number, number][])[0]!;
    expect(tip[0]).toBeCloseTo(3);
    expect(tip[1]).toBeCloseTo(0);
    const end = (shaft.parents as [number, number][])[1]!;
    expect(end[0], 'the shaft stops at the head base').toBeLessThan(3);
    expect(end[0]).toBeGreaterThan(2.5);
    expect(calls.filter((c) => c.type === 'point'), 'no endpoint dots on a vector').toHaveLength(0);
  });

  it('a plain segment keeps its full length and draws no head', () => {
    const calls = drawOn([{ kind: 'segment', from: [0, 0], to: [3, 0] }]);
    expect(calls.find((c) => c.type === 'polygon')).toBeUndefined();
    expect((calls.find((c) => c.type === 'segment')!.parents as number[][])[1]).toEqual([3, 0]);
  });

  it('a dashed arrowed segment keeps its dash on the shaft', () => {
    const calls = drawOn([{ kind: 'segment', from: [0, 0], to: [3, 0], arrow: true, style: 'dashed' }]);
    expect(calls.find((c) => c.type === 'segment')!.attrs.dash).toBe(2);
  });
});
