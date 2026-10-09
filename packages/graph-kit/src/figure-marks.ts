// =============================================================================
// figure-marks.ts — geometry-mark placement, shared by both renderers (ER-4)
// -----------------------------------------------------------------------------
// The Y7 geometry marks (angle arcs, right-angle squares, equal-length ticks,
// parallel chevrons, side labels, free text, vertex letters) are drawn by TWO
// renderers: the static engine (static-svg/graph-svg.ts — paper, the reference
// panel, every graph_figure) and the JSXGraph board (board.ts — `show:`
// drawables beside a graded answer, Q10). Q1's placement numbers live HERE,
// once, so the two cannot drift: each renderer maps graph coordinates to its
// own pixels, calls these functions, and only STRINGIFIES / DRAWS the
// primitives that come back.
//
// Pure and DOM-free, like the rest of the static-svg subpath: no JSXGraph, no
// MathLive, no @activity/schema runtime import. Every input is in PIXELS of a
// y-DOWN space (SVG's), and every length below is in viewBox units of a
// 400-wide figure (`unit` scales them for a renderer whose pixels differ).
//
// No collision solver (§6): the rules are deterministic, and the escape hatch
// for a label they place badly is the free `text` drawable.
// =============================================================================

export type Pt = readonly [number, number];

/** An open polyline. Two points stringify as an SVG `<line>`, more as a `<path>`.
 *  `weight`: 'mark' (1.5, the default), 'edge' (2, a solid's outline) or 'grid'
 *  (1, unit-cube lines); `dashed`: a hidden edge (Q6). */
export interface MarkLine {
  readonly t: 'line';
  readonly pts: readonly Pt[];
  readonly weight?: 'mark' | 'edge' | 'grid';
  readonly dashed?: boolean;
}
/** A filled face: fill only, no stroke. A cuboid's visible faces (Q6) are
 *  tinted (the default); a segment's arrowhead is `solid` (full opacity). */
export interface MarkFace {
  readonly t: 'face';
  readonly pts: readonly Pt[];
  readonly solid?: boolean;
}
/** Text centred on (x, y). `vertex` = a vertex letter (15, italic); `label` = 16. */
export interface MarkText {
  readonly t: 'text';
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly role: 'label' | 'vertex';
}
export type MarkPrim = MarkLine | MarkText | MarkFace;

/** Q1's numbers (viewBox units, 400-wide). Exported for the tests that pin them. */
export const MARK = {
  sideLabelGap: 16,
  sideLabelMarkedExtra: 8,
  vertexLetterGap: 18,
  arcRadius: 22,
  secondArcRadius: 27,
  rightSquare: 14,
  angleLabelRadius: 40,
  // Narrow angles (author ruling 2026-10-03, amending Q1): the label moves
  // farther out along the bisector until its box clears both arms by this
  // gap, never past the cap. 40 stays the minimum, so wide angles are unchanged.
  angleLabelClearance: 4,
  angleLabelMaxRadius: 120,
  tickLength: 12,
  tickSpacing: 5,
  chevron: 10,
  chevronSpacing: 6,
  chevronT: 0.5,
  chevronTWithTicks: 0.7,
  labelSize: 16,
  vertexSize: 15,
  // Cuboid (Q6): cabinet oblique, depth at half scale, 45°.
  cuboidDepthScale: 0.5,
  cuboidLabelGap: 16,
  cuboidFaceOpacity: 0.12,
  // Segment arrowhead (arrowhead Drop 1): a filled triangle, tip ON the
  // segment's `to`. Never longer than this fraction of the segment, so a short
  // vector keeps a visible shaft.
  arrowHeadLength: 12,
  arrowHeadHalfWidth: 5,
  arrowHeadMaxFraction: 0.5,
} as const;

/** A structural view of the drawables the context is built from — the board
 * never imports @activity/schema, so this is the shared wire shape. */
export interface MarkSource {
  readonly kind: string;
  readonly at?: Pt | readonly number[];
  readonly from?: Pt | readonly number[];
  readonly to?: Pt | readonly number[];
  readonly vertices?: readonly (Pt | readonly number[])[];
  readonly label?: string;
}

/** What placement needs to know about the rest of the figure, in pixels. */
export interface MarkContext {
  /** Every polygon, with the index of its drawable (for colour inheritance). */
  readonly polygons: readonly { readonly pts: readonly Pt[]; readonly index: number }[];
  /** Every segment, with the index of its drawable. */
  readonly segments: readonly { readonly pts: readonly [Pt, Pt]; readonly index: number }[];
  /** Every LABELLED point — "the named points" whose centroid Q1 pushes away from. */
  readonly named: readonly Pt[];
  readonly tickEdges: readonly (readonly [Pt, Pt])[];
  readonly parallelEdges: readonly (readonly [Pt, Pt])[];
}

type Map2 = (p: readonly number[]) => Pt;

const EPS = 0.01;
const same = (a: Pt, b: Pt): boolean => Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS;
const sameEdge = (e: readonly [Pt, Pt], a: Pt, b: Pt): boolean =>
  (same(e[0], a) && same(e[1], b)) || (same(e[0], b) && same(e[1], a));
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const len = (a: Pt): number => Math.hypot(a[0], a[1]);
function norm(a: Pt): Pt | null {
  const l = len(a);
  return l > 1e-9 ? [a[0] / l, a[1] / l] : null;
}
function centroid(pts: readonly Pt[]): Pt | null {
  if (pts.length === 0) return null;
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / pts.length, y / pts.length];
}
const pair = (v: Pt | readonly number[] | undefined): readonly number[] | null =>
  v && v.length >= 2 && Number.isFinite(v[0]) && Number.isFinite(v[1]) ? v : null;

/** Build the placement context from a figure's drawables and a px mapping. */
export function markContext(drawables: readonly MarkSource[], map: Map2): MarkContext {
  const polygons: { pts: Pt[]; index: number }[] = [];
  const segments: { pts: [Pt, Pt]; index: number }[] = [];
  const named: Pt[] = [];
  const tickEdges: [Pt, Pt][] = [];
  const parallelEdges: [Pt, Pt][] = [];
  drawables.forEach((d, index) => {
    const at = pair(d.at);
    const from = pair(d.from);
    const to = pair(d.to);
    switch (d.kind) {
      case 'polygon':
        if (d.vertices) {
          const pts = d.vertices.map(pair).filter((v): v is readonly number[] => v !== null).map(map);
          if (pts.length >= 3) polygons.push({ pts, index });
        }
        break;
      case 'segment':
        if (from && to) segments.push({ pts: [map(from), map(to)], index });
        break;
      case 'point':
        if (at && d.label) named.push(map(at));
        break;
      case 'tick_mark':
        if (from && to) tickEdges.push([map(from), map(to)]);
        break;
      case 'parallel_mark':
        if (from && to) parallelEdges.push([map(from), map(to)]);
        break;
    }
  });
  return { polygons, segments, named, tickEdges, parallelEdges };
}

/** The drawable a mark on the edge a–b (or at vertex a) belongs to, for colour. */
export function markOwner(ctx: MarkContext, a: Pt, b?: Pt): number | undefined {
  for (const poly of ctx.polygons) {
    const n = poly.pts.length;
    for (let i = 0; i < n; i++) {
      const p = poly.pts[i]!;
      const q = poly.pts[(i + 1) % n]!;
      if (b ? sameEdge([p, q], a, b) : same(p, a)) return poly.index;
    }
  }
  for (const seg of ctx.segments) {
    if (b ? sameEdge(seg.pts, a, b) : same(seg.pts[0], a) || same(seg.pts[1], a)) return seg.index;
  }
  return undefined;
}

/** Shoelace area in px (y-down). Positive = clockwise on screen. */
function signedArea(pts: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % pts.length]!;
    s += p[0] * q[1] - q[0] * p[1];
  }
  return s / 2;
}

function insidePolygon(pt: Pt, poly: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a[1] > pt[1] !== b[1] > pt[1] && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * The unit normal of edge a–b pointing OUT of the shape (Q1): from the owning
 * polygon's winding when the edge belongs to one, else away from the centroid
 * of every named point.
 */
export function outwardNormal(ctx: MarkContext, a: Pt, b: Pt): Pt | null {
  for (const poly of ctx.polygons) {
    const n = poly.pts.length;
    for (let i = 0; i < n; i++) {
      const p = poly.pts[i]!;
      const q = poly.pts[(i + 1) % n]!;
      if (!sameEdge([p, q], a, b)) continue;
      const d = norm(sub(q, p));
      if (!d) return null;
      // In a y-down space a positive shoelace area is clockwise on screen, and
      // the outward side of each edge is (d.y, -d.x). Negative flips it.
      const out: Pt = [d[1], -d[0]];
      return signedArea(poly.pts) >= 0 ? out : mul(out, -1);
    }
  }
  const d = norm(sub(b, a));
  if (!d) return null;
  const n: Pt = [d[1], -d[0]];
  const c = centroid(ctx.named);
  if (!c) return n;
  const mid = mul(add(a, b), 0.5);
  const away = (mid[0] - c[0]) * n[0] + (mid[1] - c[1]) * n[1];
  return away < 0 ? mul(n, -1) : n;
}

/** Rough text extents (the engine cannot measure): half width, half height. */
function halfExtents(text: string, size: number): [number, number] {
  return [(text.length * size * 0.55) / 2, (size * 0.7) / 2];
}

/** A side label: the edge midpoint pushed 16 along the outward normal, +8 when
 * the same edge carries ticks or chevrons. The push is measured to the label's
 * near side along the normal, so a long label beside a vertical edge does not
 * sit on the edge (16 exactly for a horizontal edge). */
export function sideLabel(ctx: MarkContext, a: Pt, b: Pt, text: string, unit = 1): MarkPrim[] {
  const n = outwardNormal(ctx, a, b);
  if (!n) return [];
  const marked =
    ctx.tickEdges.some((e) => sameEdge(e, a, b)) || ctx.parallelEdges.some((e) => sameEdge(e, a, b));
  const [hw, hh] = halfExtents(text, MARK.labelSize * unit);
  const push =
    (MARK.sideLabelGap + (marked ? MARK.sideLabelMarkedExtra : 0)) * unit + Math.abs(n[0]) * Math.max(0, hw - hh);
  const mid = mul(add(a, b), 0.5);
  const c = add(mid, mul(n, push));
  return [{ t: 'text', x: c[0], y: c[1], text, role: 'label' }];
}

/** Equal-length ticks: 12 long, 5 apart, across the edge midpoint. */
export function ticks(a: Pt, b: Pt, count: number, unit = 1): MarkPrim[] {
  const d = norm(sub(b, a));
  if (!d) return [];
  const n: Pt = [-d[1], d[0]];
  const mid = mul(add(a, b), 0.5);
  const out: MarkPrim[] = [];
  for (let i = 0; i < count; i++) {
    const c = add(mid, mul(d, (i - (count - 1) / 2) * MARK.tickSpacing * unit));
    const h = (MARK.tickLength / 2) * unit;
    out.push({ t: 'line', pts: [add(c, mul(n, -h)), add(c, mul(n, h))] });
  }
  return out;
}

/** Parallel chevrons pointing a→b: 10 across, at t = 0.5 (0.7 when ticks share the edge). */
export function chevrons(ctx: MarkContext, a: Pt, b: Pt, count: number, unit = 1): MarkPrim[] {
  const d = norm(sub(b, a));
  if (!d) return [];
  const n: Pt = [-d[1], d[0]];
  const t = ctx.tickEdges.some((e) => sameEdge(e, a, b)) ? MARK.chevronTWithTicks : MARK.chevronT;
  const c0 = add(a, mul(sub(b, a), t));
  const h = (MARK.chevron / 2) * unit;
  const out: MarkPrim[] = [];
  for (let i = 0; i < count; i++) {
    const c = add(c0, mul(d, (i - (count - 1) / 2) * MARK.chevronSpacing * unit));
    const tip = add(c, mul(d, h));
    const back = add(c, mul(d, -h));
    out.push({ t: 'line', pts: [add(back, mul(n, h)), tip, add(back, mul(n, -h))] });
  }
  return out;
}

/**
 * A segment's arrowhead at `b` (pointing a→b): the solid triangle, plus the
 * point where the SHAFT must stop — the head's base — so a 2-wide or dashed
 * line never pokes through the tip. Both renderers draw the shaft a→shaftEnd
 * and then the face. null for a degenerate segment (the importer refuses
 * those; this is the renderer's own refusal).
 */
export function segmentArrow(a: Pt, b: Pt, unit = 1): { shaftEnd: Pt; head: MarkFace } | null {
  const v = sub(b, a);
  const d = norm(v);
  if (!d) return null;
  const length = Math.min(MARK.arrowHeadLength * unit, len(v) * MARK.arrowHeadMaxFraction);
  const halfWidth = length * (MARK.arrowHeadHalfWidth / MARK.arrowHeadLength);
  const n: Pt = [-d[1], d[0]];
  const base = add(b, mul(d, -length));
  return {
    shaftEnd: base,
    head: { t: 'face', pts: [b, add(base, mul(n, halfWidth)), add(base, mul(n, -halfWidth))], solid: true },
  };
}

function wrapAngle(a: number): number {
  let x = a;
  while (x <= -Math.PI) x += 2 * Math.PI;
  while (x > Math.PI) x -= 2 * Math.PI;
  return x;
}

/**
 * An angle mark at `at` from ray at→from to ray at→to. The sweep is the angle
 * under 180° unless `reflex`. Returns [] for a degenerate angle (coincident
 * points, 0° or 180°) — the importer refuses those with a warning (N2); this is
 * the renderer's own refusal to draw nonsense.
 */
export function angleMark(
  at: Pt,
  from: Pt,
  to: Pt,
  opts: { style?: 'arc' | 'double' | 'right'; reflex?: boolean; label?: string },
  unit = 1,
): MarkPrim[] {
  const u1 = norm(sub(from, at));
  const u2 = norm(sub(to, at));
  if (!u1 || !u2) return [];
  const a1 = Math.atan2(u1[1], u1[0]);
  let delta = wrapAngle(Math.atan2(u2[1], u2[0]) - a1);
  if (Math.abs(delta) < 1e-6 || Math.abs(Math.abs(delta) - Math.PI) < 1e-6) return [];
  if (opts.reflex) delta = delta > 0 ? delta - 2 * Math.PI : delta + 2 * Math.PI;

  const out: MarkPrim[] = [];
  if (opts.style === 'right') {
    const s = MARK.rightSquare * unit;
    out.push({ t: 'line', pts: [add(at, mul(u1, s)), add(at, add(mul(u1, s), mul(u2, s))), add(at, mul(u2, s))] });
  } else {
    const radii = opts.style === 'double' ? [MARK.arcRadius, MARK.secondArcRadius] : [MARK.arcRadius];
    const steps = Math.max(8, Math.ceil(Math.abs(delta) / (Math.PI / 24)));
    for (const r of radii) {
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const a = a1 + (delta * i) / steps;
        pts.push([at[0] + Math.cos(a) * r * unit, at[1] + Math.sin(a) * r * unit]);
      }
      out.push({ t: 'line', pts });
    }
  }
  if (opts.label) {
    const mid = a1 + delta / 2;
    const r = angleLabelRadius(opts.label, Math.abs(delta)) * unit;
    out.push({
      t: 'text',
      x: at[0] + Math.cos(mid) * r,
      y: at[1] + Math.sin(mid) * r,
      text: opts.label,
      role: 'label',
    });
  }
  return out;
}

/**
 * How far along the bisector an angle's label sits (viewBox units, before
 * `unit`). At radius r the label's centre is r·sin(θ/2) from each arm; the
 * label clears the arm when that distance exceeds the radius of its bounding
 * box plus a gap. Q1's 40 is the floor; the cap keeps a sliver of an angle
 * from throwing its label off the figure (the `text` line is the escape hatch).
 */
export function angleLabelRadius(label: string, sweep: number): number {
  const half = Math.min(Math.abs(sweep), Math.PI) / 2;
  const [hw, hh] = halfExtents(label, MARK.labelSize);
  const need = (Math.hypot(hw, hh) + MARK.angleLabelClearance) / Math.max(Math.sin(half), 1e-6);
  return Math.min(MARK.angleLabelMaxRadius, Math.max(MARK.angleLabelRadius, need));
}

/**
 * A vertex letter (plane-less mode): 18 along the exterior-angle bisector when
 * the point is a polygon vertex; otherwise away from the named points'
 * centroid (up-right when it IS the centroid).
 */
export function vertexLetter(ctx: MarkContext, p: Pt, text: string, unit = 1): MarkPrim[] {
  let dir: Pt | null = null;
  for (const poly of ctx.polygons) {
    const n = poly.pts.length;
    const i = poly.pts.findIndex((v) => same(v, p));
    if (i < 0) continue;
    const u1 = norm(sub(poly.pts[(i - 1 + n) % n]!, p));
    const u2 = norm(sub(poly.pts[(i + 1) % n]!, p));
    if (!u1 || !u2) continue;
    const b = norm(add(u1, u2));
    if (b) {
      // The interior bisector of a convex vertex points INTO the polygon; at a
      // reflex vertex it points out. Test, don't assume.
      dir = insidePolygon(add(p, b), poly.pts) ? mul(b, -1) : b;
    } else {
      dir = [u1[1], -u1[0]]; // a straight-through vertex: either normal
      if (insidePolygon(add(p, dir), poly.pts)) dir = mul(dir, -1);
    }
    break;
  }
  if (!dir) {
    const c = centroid(ctx.named);
    dir = (c && norm(sub(p, c))) ?? [Math.SQRT1_2, -Math.SQRT1_2];
  }
  const at = add(p, mul(dir, MARK.vertexLetterGap * unit));
  return [{ t: 'text', x: at[0], y: at[1], text, role: 'vertex' }];
}

/** A free text label centred at p. */
export function freeText(p: Pt, text: string): MarkPrim[] {
  return [{ t: 'text', x: p[0], y: p[1], text, role: 'label' }];
}

/**
 * A cuboid in cabinet oblique (D6, Q6). Inputs are GRAPH units plus the px
 * mapping, because depth recedes at 45° in the FIGURE's own (one-scale) space:
 * the depth offset is computed in px from the px length of one graph unit.
 *
 * Returns, in draw order: the three visible faces (filled), the unit-cube grid
 * on those faces, the three dashed hidden edges (unless `hidden` is false),
 * the nine visible edges, then the dimension labels outside the solid —
 * length below the front-bottom edge, height LEFT of the front-left edge (the
 * right side collides with the grid), depth beside the receding bottom-right
 * edge.
 */
export function cuboid(
  map: (v: readonly number[]) => Pt,
  c: { at?: readonly number[]; length: number; width: number; height: number; unit?: string; units?: boolean; hidden?: boolean },
  unit = 1,
): MarkPrim[] {
  const [x, y] = [c.at?.[0] ?? 0, c.at?.[1] ?? 0];
  const L = c.length;
  const W = c.width;
  const H = c.height;
  // One graph unit along x, in px (the figure is one-scale when plane-less).
  const ux = map([x + 1, y])[0] - map([x, y])[0];
  const d = W * MARK.cuboidDepthScale * ux * Math.SQRT1_2;
  const back: Pt = [d, -d]; // y-down: receding = right and UP
  const P = (gx: number, gy: number, depth = 0): Pt => {
    const p = map([gx, gy]);
    return [p[0] + back[0] * depth, p[1] + back[1] * depth];
  };
  // Corners: f = front, b = back; l/r = left/right; d/u = down/up.
  const fld = P(x, y), frd = P(x + L, y), fru = P(x + L, y + H), flu = P(x, y + H);
  const bld = P(x, y, 1), brd = P(x + L, y, 1), bru = P(x + L, y + H, 1), blu = P(x, y + H, 1);
  const out: MarkPrim[] = [
    { t: 'face', pts: [fld, frd, fru, flu] },
    { t: 'face', pts: [flu, fru, bru, blu] },
    { t: 'face', pts: [frd, brd, bru, fru] },
  ];
  if (c.units) {
    const grid = (a: Pt, b: Pt): void => void out.push({ t: 'line', pts: [a, b], weight: 'grid' });
    for (let i = 1; i < L; i++) {
      grid(P(x + i, y), P(x + i, y + H)); // front verticals
      grid(P(x + i, y + H), P(x + i, y + H, 1)); // top, receding
    }
    for (let j = 1; j < H; j++) {
      grid(P(x, y + j), P(x + L, y + j)); // front horizontals
      grid(P(x + L, y + j), P(x + L, y + j, 1)); // right, receding
    }
    for (let k = 1; k < W; k++) {
      const t = k / W;
      grid(P(x, y + H, t), P(x + L, y + H, t)); // top, across
      grid(P(x + L, y, t), P(x + L, y + H, t)); // right, vertical
    }
  }
  if (c.hidden !== false) {
    for (const [a, b] of [[bld, brd], [bld, blu], [bld, fld]] as [Pt, Pt][]) {
      out.push({ t: 'line', pts: [a, b], weight: 'mark', dashed: true });
    }
  }
  for (const [a, b] of [
    [fld, frd], [frd, fru], [fru, flu], [flu, fld],
    [flu, blu], [blu, bru], [bru, fru], [frd, brd], [brd, bru],
  ] as [Pt, Pt][]) {
    out.push({ t: 'line', pts: [a, b], weight: 'edge' });
  }
  if (c.unit) {
    const g = MARK.cuboidLabelGap * unit;
    const num = (n: number): string => String(Number(n.toFixed(3)));
    const hw = (n: number): number => halfExtents(`${num(n)} ${c.unit}`, MARK.labelSize * unit)[0];
    out.push(
      { t: 'text', x: (fld[0] + frd[0]) / 2, y: fld[1] + g, text: `${num(L)} ${c.unit}`, role: 'label' },
      { t: 'text', x: fld[0] - g - hw(H), y: (fld[1] + flu[1]) / 2, text: `${num(H)} ${c.unit}`, role: 'label' },
      // Beside the receding bottom-right edge, pushed down-right (outward).
      { t: 'text', x: (frd[0] + brd[0]) / 2 + g * Math.SQRT1_2 + hw(W), y: (frd[1] + brd[1]) / 2 + g * Math.SQRT1_2, text: `${num(W)} ${c.unit}`, role: 'label' },
    );
  }
  return out;
}
