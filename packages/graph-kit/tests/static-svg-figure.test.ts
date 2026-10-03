// =============================================================================
// static-svg-figure.test.ts — the engine's Y7 geometry mode, and what it must
// NOT change (y7-figures-and-charts.md §8: Regression rule, C4, ER-3, ER-7)
// =============================================================================

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { figureGeometry, fitFigureWindow, renderGraphSvg } from '../src/static-svg.js';
import { PLANE_ON_FIXTURES } from './fixtures/plane-on-fixtures.js';

const GOLDEN = JSON.parse(
  readFileSync(new URL('./fixtures/plane-on-golden.json', import.meta.url), 'utf8'),
) as Record<string, string>;

const AXIS = { xMin: -5, xMax: 5, yMin: -5, yMax: 5, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };

describe('plane ON is byte-identical to the engine before the slice', () => {
  // Every reference-panel figure, choice figure and print twin in the catalogue
  // renders with the plane on. The golden was captured from the untouched
  // engine; a diff here is a visible change to every figure that exists.
  for (const f of PLANE_ON_FIXTURES) {
    it(f.name, () => {
      const out = f.color
        ? renderGraphSvg(f.axis as never, f.drawables as never, 'g-' + f.name, f.color)
        : renderGraphSvg(f.axis as never, f.drawables as never, 'g-' + f.name);
      expect(out).toBe(GOLDEN[f.name]);
    });
  }

  it('an explicit plane: true is the same as omitting it', () => {
    const f = PLANE_ON_FIXTURES[1]!;
    expect(renderGraphSvg(f.axis as never, f.drawables as never, 'g-' + f.name, undefined, { plane: true })).toBe(
      GOLDEN[f.name],
    );
  });
});

describe('plane-less mode (D3/Q4)', () => {
  const WIDE = { ...AXIS, xMin: 0, xMax: 10, yMin: 0, yMax: 5 };
  const viewBox = (svg: string) => svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!.slice(1).map(Number);

  it('draws no grid, axes or tick labels', () => {
    const svg = renderGraphSvg(WIDE as never, [], 'pl', undefined, { plane: false });
    expect(svg).not.toContain('<line');
    expect(svg).not.toContain('<text');
  });

  it('takes its height from the window aspect, width fixed at 400', () => {
    expect(viewBox(renderGraphSvg(WIDE as never, [], 'pl', undefined, { plane: false }))).toEqual([400, 200]);
  });

  it('clamps the aspect between 1:3 and 3:1', () => {
    const flat = { ...AXIS, xMin: 0, xMax: 100, yMin: 0, yMax: 1 };
    const tall = { ...AXIS, xMin: 0, xMax: 1, yMin: 0, yMax: 100 };
    expect(viewBox(renderGraphSvg(flat as never, [], 'f', undefined, { plane: false }))[1]).toBeCloseTo(133.3, 1);
    expect(viewBox(renderGraphSvg(tall as never, [], 't', undefined, { plane: false }))[1]).toBe(1200);
  });

  it('locks x and y to ONE scale, so a right angle stays right', () => {
    // A 1:3-clamped window letterboxes rather than stretching.
    const g = figureGeometry({ ...AXIS, xMin: 0, xMax: 100, yMin: 0, yMax: 1 } as never, false)!;
    expect(g.px(1) - g.px(0)).toBeCloseTo(g.py(0) - g.py(1), 9);
  });

  it('keeps a ray arrowhead INSIDE a 2:1 viewBox (C4)', () => {
    // A ray running down-right off a 400×200 figure. With the old square clip
    // the tip landed at y ≈ 395, far outside the 200-high box.
    const svg = renderGraphSvg(WIDE as never, [{ kind: 'ray', from: [1, 4], through: [5, 0.5] }] as never, 'r', undefined, {
      plane: false,
    });
    const arrow = svg.match(/<line [^>]*marker-end[^>]*>/)![0];
    const y2 = Number(arrow.match(/y2="([-\d.]+)"/)![1]);
    const x2 = Number(arrow.match(/x2="([-\d.]+)"/)![1]);
    expect(y2).toBeGreaterThan(0);
    expect(y2).toBeLessThanOrEqual(200);
    expect(x2).toBeLessThanOrEqual(400);
  });

  it('renders a labelled point as an italic INK vertex letter with no dot', () => {
    const svg = renderGraphSvg(
      AXIS as never,
      [{ kind: 'point', at: [0, 0], label: 'A' }] as never,
      'v',
      undefined,
      { plane: false },
    );
    expect(svg).not.toContain('<circle');
    expect(svg).toMatch(/<text[^>]*font-style="italic"[^>]*style="fill:var\(--gk-svg-ink,#1e293b\)"[^>]*>A<\/text>/);
  });

  it('draws a dashed segment, without endpoint dots unless authored', () => {
    const seg = { kind: 'segment', from: [0, 0], to: [3, 4], style: 'dashed' };
    const bare = renderGraphSvg(AXIS as never, [seg] as never, 's', undefined, { plane: false });
    expect(bare).toContain('stroke-dasharray="8 6"');
    expect(bare).not.toContain('<circle');
    const dotted = renderGraphSvg(AXIS as never, [{ ...seg, endpoints: ['closed', 'open'] }] as never, 's', undefined, {
      plane: false,
    });
    expect((dotted.match(/<circle/g) ?? []).length).toBe(2);
  });
});

describe('label text is INK by inline style (ER-7)', () => {
  // A `fill` ATTRIBUTE would lose to the viewer's `.viewer-figure > svg text`
  // rule and render muted. Inline style wins; this pins the mechanism.
  it.each([
    ['side_label', { kind: 'side_label', from: [0, 0], to: [4, 0], text: '8 cm' }],
    ['angle label', { kind: 'angle_mark', at: [0, 0], from: [4, 0], to: [0, 4], label: '68°' }],
    ['free text', { kind: 'text', at: [1, 1], text: 'base' }],
  ])('%s', (_name, d) => {
    const svg = renderGraphSvg(AXIS as never, [d] as never, 'i');
    const mark = svg.slice(svg.indexOf('<g data-drawable='));
    const text = mark.match(/<text [^>]*>/)![0];
    expect(text).toContain('style="fill:var(--gk-svg-ink,#1e293b)"');
    expect(text).not.toMatch(/ fill="/);
  });

  it('dashed segments are available with the plane on too', () => {
    const svg = renderGraphSvg(AXIS as never, [{ kind: 'segment', from: [0, 0], to: [3, 4], style: 'dashed' }] as never, 'd');
    expect(svg).toContain('stroke-dasharray="8 6"');
  });
});

describe('marks take the colour of the shape they annotate (Q5)', () => {
  it('a tick on a red polygon edge is red; an unowned tick takes the default', () => {
    const poly = { kind: 'polygon', vertices: [[0, 0], [4, 0], [0, 3]], filled: false, color: 'red' };
    const owned = renderGraphSvg(AXIS as never, [poly, { kind: 'tick_mark', from: [4, 0], to: [0, 0], count: 1 }] as never, 'c');
    const tick = owned.match(/<g data-drawable="tick_mark"><line [^>]*>/)![0];
    const polyStroke = owned.match(/<polygon [^>]*stroke="([^"]+)"/)![1];
    expect(tick).toContain(`stroke="${polyStroke}"`);

    const lone = renderGraphSvg(AXIS as never, [{ kind: 'tick_mark', from: [4, 0], to: [0, 0], count: 1 }] as never, 'c');
    expect(lone.match(/<g data-drawable="tick_mark"><line [^>]*stroke="([^"]+)"/)![1]).not.toBe(polyStroke);
  });
});

describe('fitFigureWindow (ER-3)', () => {
  it('covers every coordinate a drawable carries, marks included, with padding', () => {
    const w = fitFigureWindow([
      { kind: 'polygon', vertices: [[0, 0], [8, 0], [2, 5]], filled: false },
      { kind: 'text', at: [4, -1.5], text: 'base' },
    ] as never)!;
    expect(w.xMin).toBeLessThan(0);
    expect(w.xMax).toBeGreaterThan(8);
    expect(w.yMin).toBeLessThan(-1.5);
    expect(w.yMax).toBeGreaterThan(5);
  });

  it('solves the 24-unit label margin against the scale: 12% + 24/400 of the total each side', () => {
    const w = fitFigureWindow([{ kind: 'segment', from: [0, 0], to: [10, 10] }] as never)!;
    const T = w.xMax - w.xMin;
    // T = 10·1.24/(1 − 48/400) ≈ 14.09; the margin in graph units is 24·T/400.
    expect(T).toBeCloseTo((10 * 1.24) / 0.88, 2);
    expect(-w.xMin).toBeCloseTo(1.2 + (24 * T) / 400, 2);
    expect(-w.yMin).toBeCloseTo(1.2 + (24 * T) / 400, 2);
  });

  it('pads a ZERO-SPAN box (collinear points) to a non-zero span', () => {
    const w = fitFigureWindow([
      { kind: 'point', at: [1, 2] },
      { kind: 'point', at: [5, 2] },
    ] as never)!;
    expect(w.yMax).toBeGreaterThan(w.yMin);
    const single = fitFigureWindow([{ kind: 'point', at: [3, 3] }] as never)!;
    expect(single.xMax).toBeGreaterThan(single.xMin);
    expect(single.yMax).toBeGreaterThan(single.yMin);
  });

  it('is null when nothing carries a coordinate', () => {
    expect(fitFigureWindow([{ kind: 'expression', expression: 'sin(x)' }] as never)).toBeNull();
    expect(fitFigureWindow([])).toBeNull();
  });
});
