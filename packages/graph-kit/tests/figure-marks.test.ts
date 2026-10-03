// =============================================================================
// figure-marks.test.ts — Q1's placement numbers, pinned once (ER-4)
// -----------------------------------------------------------------------------
// Both renderers draw from these primitives, so this is the one place the
// numbers are checked. Coordinates are px in a y-DOWN space.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  MARK,
  angleLabelRadius,
  angleMark,
  chevrons,
  markContext,
  outwardNormal,
  sideLabel,
  ticks,
  vertexLetter,
  type MarkLine,
  type MarkText,
  type Pt,
} from '../src/figure-marks.js';

const id = (v: readonly number[]): Pt => [v[0]!, v[1]!];
// A triangle A(100,300) B(300,300) C(150,100) — y-down, so C is ABOVE AB.
const A: Pt = [100, 300];
const B: Pt = [300, 300];
const C: Pt = [150, 100];
const tri = (order: Pt[]) => markContext([{ kind: 'polygon', vertices: order }], id);
const dist = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]);

describe('side labels (Q1)', () => {
  it.each([
    ['clockwise', [A, C, B]],
    ['counter-clockwise', [A, B, C]],
  ])('sit OUTSIDE the shape for a %s winding', (_w, order) => {
    const [t] = sideLabel(tri(order as Pt[]), A, B, 'x') as [MarkText];
    // AB is the bottom edge; outside is BELOW it (larger y), 16 away.
    expect(t.y).toBeCloseTo(300 + MARK.sideLabelGap, 6);
    expect(t.x).toBeCloseTo(200, 6);
  });

  it('move 8 further out when the same edge carries ticks or chevrons', () => {
    const ctx = markContext(
      [
        { kind: 'polygon', vertices: [A, B, C] },
        { kind: 'tick_mark', from: B, to: A },
      ],
      id,
    );
    const [t] = sideLabel(ctx, A, B, 'x') as [MarkText];
    expect(t.y).toBeCloseTo(300 + MARK.sideLabelGap + MARK.sideLabelMarkedExtra, 6);
  });

  it('push away from the named points when the edge belongs to no polygon', () => {
    const ctx = markContext([{ kind: 'point', at: [200, 100], label: 'P' }], id);
    const [t] = sideLabel(ctx, A, B, 'x') as [MarkText];
    expect(t.y).toBeGreaterThan(300);
  });

  it('clear a vertical edge by the label width, not just 16', () => {
    const ctx = tri([A, B, [100, 100]]);
    const [t] = sideLabel(ctx, [100, 100], A, '10 cm') as [MarkText];
    expect(t.x).toBeLessThan(100 - MARK.sideLabelGap);
  });
});

describe('vertex letters (Q1)', () => {
  it('sit 18 out along the EXTERIOR bisector', () => {
    const [t] = vertexLetter(tri([A, B, C]), C, 'C') as [MarkText];
    expect(dist([t.x, t.y], C)).toBeCloseTo(MARK.vertexLetterGap, 6);
    expect(t.y).toBeLessThan(C[1]); // above the apex, outside
    expect(t.role).toBe('vertex');
  });

  it('point OUT at a reflex vertex of a concave polygon', () => {
    // An arrowhead: the notch at (200,200) is reflex; out is DOWN (toward y=300).
    const notch: Pt = [200, 200];
    const ctx = tri([[100, 300], [200, 100], [300, 300], notch]);
    const [t] = vertexLetter(ctx, notch, 'D') as [MarkText];
    expect(t.y).toBeGreaterThan(200);
  });
});

describe('angle marks (Q1)', () => {
  it('draw an arc of radius 22 sweeping the angle under 180°', () => {
    const [arc] = angleMark(A, B, C, {}) as [MarkLine];
    for (const p of arc.pts) expect(dist(p, A)).toBeCloseTo(MARK.arcRadius, 6);
    // Under 180°: every sample is above AB (y < 300) or on it.
    for (const p of arc.pts) expect(p[1]).toBeLessThanOrEqual(300 + 1e-9);
  });

  it('`reflex` sweeps the other way round', () => {
    const [arc] = angleMark(A, B, C, { reflex: true }) as [MarkLine];
    expect(arc.pts.some((p) => p[1] > 300 + 1)).toBe(true);
  });

  it('`double` draws two arcs at 22 and 27', () => {
    const arcs = angleMark(A, B, C, { style: 'double' }) as MarkLine[];
    expect(arcs).toHaveLength(2);
    expect(dist(arcs[1]!.pts[0]!, A)).toBeCloseTo(MARK.secondArcRadius, 6);
  });

  it('`right` draws the 14-unit square ONLY, never square + arc', () => {
    const out = angleMark([100, 300], [300, 300], [100, 100], { style: 'right' });
    expect(out).toHaveLength(1);
    const sq = out[0] as MarkLine;
    expect(sq.pts).toHaveLength(3);
    expect(sq.pts[1]![0]).toBeCloseTo(100 + MARK.rightSquare, 6);
    expect(sq.pts[1]![1]).toBeCloseTo(300 - MARK.rightSquare, 6);
  });

  it('puts the label on the interior bisector at 40', () => {
    const out = angleMark([100, 300], [300, 300], [100, 100], { label: '90°' });
    const t = out.find((m) => m.t === 'text') as MarkText;
    expect(dist([t.x, t.y], [100, 300])).toBeCloseTo(MARK.angleLabelRadius, 6);
    expect(t.x - 100).toBeCloseTo(300 - t.y, 6); // on the 45° bisector
  });

  it('a NARROW angle pushes its label farther out until it clears both arms (author, 2026-10-03)', () => {
    // An 18° angle at the origin, opening rightwards: arms along 0° and 18°.
    const at: Pt = [100, 300];
    const deg = (d: number): Pt => [100 + 200 * Math.cos((-d * Math.PI) / 180), 300 + 200 * Math.sin((-d * Math.PI) / 180)];
    const t = angleMark(at, deg(0), deg(18), { label: '18°' }).find((m) => m.t === 'text') as MarkText;
    const r = dist([t.x, t.y], at);
    expect(r).toBeGreaterThan(MARK.angleLabelRadius);
    // Distance from the label centre to each arm ≥ the label's half-diagonal.
    const toArm = (d: number) => {
      const ux = Math.cos((-d * Math.PI) / 180);
      const uy = Math.sin((-d * Math.PI) / 180);
      return Math.abs((t.x - at[0]) * uy - (t.y - at[1]) * ux);
    };
    const halfDiag = Math.hypot((3 * 16 * 0.55) / 2, (16 * 0.7) / 2);
    expect(toArm(0)).toBeGreaterThanOrEqual(halfDiag);
    expect(toArm(18)).toBeGreaterThanOrEqual(halfDiag);
  });

  it('a WIDE angle keeps the label at exactly 40, and a sliver is capped', () => {
    expect(angleLabelRadius('68°', (90 * Math.PI) / 180)).toBe(MARK.angleLabelRadius);
    expect(angleLabelRadius('68°', (70 * Math.PI) / 180)).toBe(MARK.angleLabelRadius);
    expect(angleLabelRadius('5°', (2 * Math.PI) / 180)).toBe(MARK.angleLabelMaxRadius);
  });

  it('refuses degenerate angles: coincident points, 0° and 180°', () => {
    expect(angleMark(A, A, C, {})).toEqual([]);
    expect(angleMark(A, B, [400, 300], {})).toEqual([]);
    expect(angleMark(A, B, [0, 300], {})).toEqual([]);
  });
});

describe('ticks and chevrons (Q1)', () => {
  it('ticks: 12 long, 5 apart, centred on the midpoint', () => {
    const out = ticks(A, B, 3) as MarkLine[];
    expect(out).toHaveLength(3);
    for (const l of out) expect(dist(l.pts[0]!, l.pts[1]!)).toBeCloseTo(MARK.tickLength, 6);
    const xs = out.map((l) => l.pts[0]![0]);
    expect(xs).toEqual([195, 200, 205].map((x) => expect.closeTo(x, 6)));
  });

  it('chevrons sit at t = 0.5, or 0.7 when ticks share the edge, and point from→to', () => {
    const bare = chevrons(tri([A, B, C]), A, B, 1) as MarkLine[];
    expect(bare[0]!.pts[1]![0]).toBeCloseTo(200 + MARK.chevron / 2, 6); // tip ahead of the centre
    const ctx = markContext([{ kind: 'tick_mark', from: A, to: B }], id);
    const shared = chevrons(ctx, A, B, 2) as MarkLine[];
    expect(shared).toHaveLength(2);
    const centre = (shared[0]!.pts[1]![0] + shared[1]!.pts[1]![0]) / 2 - MARK.chevron / 2;
    expect(centre).toBeCloseTo(100 + 200 * MARK.chevronTWithTicks, 6);
  });
});

describe('outwardNormal', () => {
  it('matches an edge given in either direction', () => {
    const ctx = tri([A, B, C]);
    expect(outwardNormal(ctx, A, B)).toEqual(outwardNormal(ctx, B, A));
  });
});
