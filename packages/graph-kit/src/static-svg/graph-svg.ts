// =============================================================================
// graph-svg.ts — static SVG rendering of a graph block's coordinate plane
// -----------------------------------------------------------------------------
// The no-JS / print fallback for interactive_graph blocks (Phase 2.7). The
// interactive widget needs the lazy graph kit; everywhere the kit can't run —
// paper, the print route's screen preview, a no-JS published page, a missing
// kit URL — the block instead carries a server-rendered SVG of the coordinate
// plane built from the SAME AxisConfig the widget uses: gridlines, axes, tick
// labels, and (for display graphs and the answer-key print variant) the
// drawables. Pure JSON-in/SVG-string-out, no kit involvement; when the kit DOES
// mount, it clears the canvas (mount.textContent = ''), so the SVG is simply
// the pre-hydration content.
//
// Geometry: a square 400×400 viewBox with the x/y ranges mapped independently
// onto it — the same stretch behavior as JSXGraph in the square .graph-canvas,
// so the static figure matches what the widget would show. EXCEPT plane-less
// mode (Y7 geometry, `opts.plane === false`): no grid/axes/ticks, 400 wide with
// the height taken from the window's aspect and ONE scale for x and y, so
// angles are true (figureGeometry). Every height-bearing site reads `p.H`, not
// the width constant — a ray's arrowhead clipped against a square box would
// land outside a wide figure. With the plane on, W = H = 400 and the output is
// byte-identical to before the mode existed (tests/static-svg-figure.test.ts).
//
// Deliberate limitation: `expression` drawables (arbitrary formulas, display-
// only) are NOT rendered — evaluating them needs the kit's formula parser, and
// the renderer stays kit-free by design. Such a curve is simply absent from the
// static figure.
// =============================================================================

import type {
  AxisConfig,
  Drawable,
  FunctionModel,
  GraphInteraction,
  InteractiveGraphBlock,
  EndpointStyle,
} from '@activity/schema';
import { attr, escape } from './html.js';
// Import from the DOM-free subpath, not the barrel: the renderer's tsconfig has
// no DOM lib, and graph-kit's index re-exports runtime.ts (which references
// HTMLElement). drawable-palette.ts is pure data + a resolver.
import { resolveDrawableColor } from '../drawable-palette.js';
import {
  angleMark,
  chevrons,
  cuboid,
  freeText,
  markContext,
  markOwner,
  sideLabel,
  ticks,
  vertexLetter,
  type MarkContext,
  type MarkPrim,
  type Pt,
} from '../figure-marks.js';

// The schema doesn't re-export CurveDomain; derive it from the curve drawable
// so this module stays renderer-only.
type CurveDomain = NonNullable<Extract<Drawable, { kind: 'curve' }>['domain']>;

// ViewBox size (square, like the on-screen canvas) and palette. Grayscale-safe:
// grid is light, axes mid, ink near-black — survives a monochrome printer.
//
// THEMEABLE VIA CUSTOM PROPERTY, WITH THE PAPER VALUE AS THE FALLBACK. These
// land as SVG presentation attributes (`stroke="…"`), and `var()` DOES resolve
// there — measured in Chromium 2026-08-24 rather than assumed, because the
// whole approach dies if it does not:
//
//   stroke="var(--gk-svg-grid, #cbd5e1)"     with the var set → rgb(10,20,30)
//   stroke="var(--gk-svg-missing, #cbd5e1)"  unset            → rgb(203,213,225)
//
// The fallback is today's exact value, so **a consumer that defines nothing
// renders byte-identically** — which is the property that lets the viewer opt
// in without touching the editor, print, or any future caller. The viewer
// defines these in tokens.css (light = these same values, dark = quieter grid,
// print = forced back to paper).
//
// ⚠ The EDITOR does not load tokens.css at all (measured 2026-08-24 — only
// StudentViewer / ActivityPrint / DevViewer import it), so its previews keep
// the paper palette in dark mode. That is a separate slice; see TODOS.
const SIZE = 400;
const GRID_COLOR = 'var(--gk-svg-grid, #cbd5e1)';
const AXIS_COLOR = 'var(--gk-svg-axis, #64748b)';
const LABEL_COLOR = 'var(--gk-svg-label, #475569)';
// Half-plane / polygon fills use the drawable's color at a floored opacity so a
// pale swatch still reads over the grid (matches board.ts's SHADE_FILL_OPACITY).
const SHADE_FILL_OPACITY = 0.18;
const CURVE_SAMPLES = 96;
// Label text (side, angle, vertex, free) is INK, set as an inline STYLE, not a
// `fill` attribute (ER-7): the viewer re-points `.viewer-figure > svg text` at
// a muted token, and a CSS rule beats a presentation attribute but loses to
// inline style. Tick labels keep the muted rule. Fallback = the light value.
const INK_STYLE = 'fill:var(--gk-svg-ink,#1e293b)';
// Geometry marks are thinner than the shapes they annotate (Q1).
const MARK_STROKE = 1.5;
const WEIGHT = { mark: MARK_STROKE, edge: 2, grid: 1 } as const;
// Plane-less height clamp (Q4): between 1:3 and 3:1 of the 400 width.
const MIN_H = SIZE / 3;
const MAX_H = SIZE * 3;

interface Plane {
  axis: AxisConfig;
  /** ViewBox width and height. Both SIZE with the plane on (today's square). */
  W: number;
  H: number;
  /** false = plane-less geometry mode (D3/Q4). */
  plane: boolean;
  /** Graph x → viewBox px. */
  px(x: number): number;
  /** Graph y → viewBox px (inverted: yMax at the top). */
  py(y: number): number;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Format a tick-label number: up to 3 decimals, trailing zeros trimmed. */
function fmt(n: number): string {
  return String(Number(n.toFixed(3)));
}

// ---- grid + axes ------------------------------------------------------------

/**
 * Widen a grid step until the window holds a sane number of lines — a tiny
 * step over a huge range must not emit thousands of <line> elements. Doubling
 * keeps the drawn lines a subset of true grid positions.
 */
function effectiveStep(min: number, max: number, step: number): number {
  let s = step;
  while ((max - min) / s > 40) s *= 2;
  return s;
}

/** Grid-line positions along [min, max] at multiples of step. */
function gridPositions(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  // Snap the start to a multiple of step; epsilon absorbs float drift.
  const eps = step * 1e-6;
  for (let v = Math.ceil((min - eps) / step) * step; v <= max + eps; v += step) {
    // Normalize -0 and float dust (0.30000000000000004 → 0.3).
    out.push(Number(v.toFixed(9)) + 0);
  }
  return out;
}

function renderGridAndAxes(p: Plane): string {
  const { axis } = p;
  let out = '';

  const xs = gridPositions(axis.xMin, axis.xMax, effectiveStep(axis.xMin, axis.xMax, axis.xGridStep));
  const ys = gridPositions(axis.yMin, axis.yMax, effectiveStep(axis.yMin, axis.yMax, axis.yGridStep));

  if (axis.showGrid) {
    let lines = '';
    for (const x of xs) {
      const v = round1(p.px(x));
      lines += `<line x1="${v}" y1="0" x2="${v}" y2="${p.H}"/>`;
    }
    for (const y of ys) {
      const v = round1(p.py(y));
      lines += `<line x1="0" y1="${v}" x2="${p.W}" y2="${v}"/>`;
    }
    out += `<g stroke="${GRID_COLOR}" stroke-width="1">${lines}</g>`;
  }

  // Axes, only where 0 crosses the window.
  const hasYAxis = axis.xMin <= 0 && axis.xMax >= 0;
  const hasXAxis = axis.yMin <= 0 && axis.yMax >= 0;
  let axes = '';
  if (hasYAxis) {
    const v = round1(p.px(0));
    axes += `<line x1="${v}" y1="0" x2="${v}" y2="${p.H}"/>`;
  }
  if (hasXAxis) {
    const v = round1(p.py(0));
    axes += `<line x1="0" y1="${v}" x2="${p.W}" y2="${v}"/>`;
  }
  if (axes) out += `<g stroke="${AXIS_COLOR}" stroke-width="1.5">${axes}</g>`;

  // Tick labels. Along the axis when it's visible, else along the window edge.
  // Thinned so a dense grid never yields overlapping text; 0 is skipped when
  // both axes are visible (it would sit on the crossing).
  const xLabelY = hasXAxis ? Math.min(Math.max(p.py(0) + 14, 12), p.H - 4) : p.H - 5;
  const yLabelX = hasYAxis ? Math.min(Math.max(p.px(0) - 5, 14), p.W - 4) : 5;
  const yAnchor = hasYAxis ? 'end' : 'start';
  let labels = '';
  const xEvery = Math.ceil(xs.length / 14);
  xs.forEach((x, i) => {
    if (i % xEvery !== 0) return;
    if (x === 0 && hasXAxis && hasYAxis) return;
    const vx = Math.min(Math.max(round1(p.px(x)), 8), p.W - 8);
    labels += `<text x="${vx}" y="${round1(xLabelY)}" text-anchor="middle">${escape(fmt(x))}</text>`;
  });
  const yEvery = Math.ceil(ys.length / 14);
  ys.forEach((y, i) => {
    if (i % yEvery !== 0) return;
    if (y === 0 && hasXAxis && hasYAxis) return;
    const vy = Math.min(Math.max(round1(p.py(y) + 4), 12), p.H - 4);
    labels += `<text x="${round1(yLabelX)}" y="${vy}" text-anchor="${yAnchor}">${escape(fmt(y))}</text>`;
  });
  if (labels) {
    out += `<g fill="${LABEL_COLOR}" font-size="11" font-family="inherit">${labels}</g>`;
  }
  return out;
}

// ---- drawables ----------------------------------------------------------------

/** y = f(x) for the y-of-x families; null for vertical (drawn separately). */
function evalModel(model: FunctionModel, x: number): number | null {
  switch (model.family) {
    case 'linear':
      return model.slope * x + model.intercept;
    case 'quadratic':
      return model.a * x * x + model.b * x + model.c;
    case 'cubic':
      return ((model.a * x + model.b) * x + model.c) * x + model.d;
    case 'quartic':
      return (((model.a * x + model.b) * x + model.c) * x + model.d) * x + model.e;
    case 'exponential':
      return model.a * Math.pow(model.b, x);
    case 'logarithmic':
      return x > 0 ? model.a + model.b * Math.log(x) : null;
    case 'absolute':
      return model.a * Math.abs(x - model.h) + model.k;
    case 'sqrt':
      return x >= model.h ? model.a * Math.sqrt(x - model.h) + model.k : null;
    case 'vertical':
      return null;
  }
}

/** SVG path through the finite samples, split where the function is undefined. */
function samplePath(p: Plane, model: FunctionModel, domain?: CurveDomain | null): string {
  const { axis } = p;
  const x0 = Math.max(axis.xMin, domain?.min ?? -Infinity);
  const x1 = Math.min(axis.xMax, domain?.max ?? Infinity);
  if (!(x1 > x0)) return '';
  let d = '';
  let pen = false;
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = x0 + ((x1 - x0) * i) / CURVE_SAMPLES;
    const y = evalModel(model, x);
    if (y === null || !Number.isFinite(y)) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${round1(p.px(x))} ${round1(p.py(y))}`;
    pen = true;
  }
  return d;
}

// ---- continuation arrows ------------------------------------------------------
// Textbook convention: an arrowhead where a figure exits the window says "this
// keeps going"; a dot says "it stops". Print twin of the kit's
// display-arrows.ts (parallel implementation — the renderer stays kit-free by
// design). All math in viewBox px; tips inset so the marker head survives the
// clipPath.

const ARROW_INSET_PX = 5;
const ARROW_SHAFT_PX = 10;

const insideBox = (p: Plane, x: number, y: number): boolean =>
  Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= p.W && y >= 0 && y <= p.H;

// inside→outside crossing with the viewBox (both points finite).
function clipToBox(
  p: Plane,
  ix: number,
  iy: number,
  ox: number,
  oy: number,
): [number, number] {
  const dx = ox - ix;
  const dy = oy - iy;
  let t = 1;
  if (dx > 0) t = Math.min(t, (p.W - ix) / dx);
  if (dx < 0) t = Math.min(t, -ix / dx);
  if (dy > 0) t = Math.min(t, (p.H - iy) / dy);
  if (dy < 0) t = Math.min(t, -iy / dy);
  t = Math.max(0, Math.min(1, t));
  return [ix + t * dx, iy + t * dy];
}

// A short marker-carrying line whose head sits (inset) at `tip`, oriented
// along `dir`.
function arrowAt(
  tip: [number, number],
  dir: [number, number],
  markerId: string,
  color: string,
): string {
  const mag = Math.hypot(dir[0], dir[1]);
  if (!Number.isFinite(mag) || mag === 0) return '';
  const ux = dir[0] / mag;
  const uy = dir[1] / mag;
  const tx = tip[0] - ux * ARROW_INSET_PX;
  const ty = tip[1] - uy * ARROW_INSET_PX;
  return (
    `<line x1="${round1(tx - ux * ARROW_SHAFT_PX)}" y1="${round1(ty - uy * ARROW_SHAFT_PX)}"` +
    ` x2="${round1(tx)}" y2="${round1(ty)}"` +
    ` stroke="${color}" stroke-width="2" marker-end="url(#${attr(markerId)})"/>`
  );
}

// Continuation arrows for a sampled curve: one per UNBOUNDED end (an authored
// domain bound gets its dot instead), at the outermost sample still inside the
// viewBox, headed out through the box edge.
function curveArrows(
  p: Plane,
  model: FunctionModel,
  domain: CurveDomain | undefined,
  markerId: string,
  color: string,
): string {
  const { axis } = p;
  const x0 = Math.max(axis.xMin, domain?.min ?? -Infinity);
  const x1 = Math.min(axis.xMax, domain?.max ?? Infinity);
  if (!(x1 > x0)) return '';
  const pts: [number, number][] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = x0 + ((x1 - x0) * i) / CURVE_SAMPLES;
    const y = evalModel(model, x);
    pts.push([p.px(x), y === null ? NaN : p.py(y)]);
  }
  let out = '';
  const endArrow = (indices: number[], neighborStep: number): void => {
    for (const i of indices) {
      const pt = pts[i]!;
      if (!insideBox(p, pt[0], pt[1])) continue;
      const beyond = pts[i + neighborStep];
      const tip =
        beyond && Number.isFinite(beyond[0]) && Number.isFinite(beyond[1])
          ? clipToBox(p, pt[0], pt[1], beyond[0], beyond[1])
          : pt;
      // Outward direction: from the inward neighbor toward the tip.
      const inner = pts[i - neighborStep] ?? pt;
      out += arrowAt(tip, [tip[0] - inner[0], tip[1] - inner[1]], markerId, color);
      return;
    }
  };
  if (domain?.max === undefined) {
    const order = [];
    for (let i = CURVE_SAMPLES; i >= 0; i--) order.push(i);
    endArrow(order, 1);
  }
  if (domain?.min === undefined) {
    const order = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) order.push(i);
    endArrow(order, -1);
  }
  return out;
}

function endpointDot(
  p: Plane,
  at: [number, number],
  style: EndpointStyle,
  color: string,
): string {
  const open = style === 'open';
  return (
    `<circle cx="${round1(p.px(at[0]))}" cy="${round1(p.py(at[1]))}" r="4.5"` +
    ` fill="${open ? '#fff' : color}" stroke="${color}" stroke-width="2"/>`
  );
}

function renderPoint(
  p: Plane,
  d: Extract<Drawable, { kind: 'point' }>,
  color: string,
  ctx: MarkContext,
): string {
  // Plane-less (Q5): a labelled point is a VERTEX LETTER — no dot, ink, italic,
  // placed outside the shape (Q1). An unlabelled point keeps its dot.
  if (!p.plane && d.label) return prims(vertexLetter(ctx, pt(p, d.at), d.label), color);
  let out = endpointDot(p, d.at, d.style ?? 'closed', color);
  if (d.label) {
    out +=
      `<text x="${round1(p.px(d.at[0]) + 7)}" y="${round1(p.py(d.at[1]) - 7)}"` +
      ` fill="${color}" font-size="13" font-family="inherit">${escape(d.label)}</text>`;
  }
  return out;
}

function renderCurve(
  p: Plane,
  d: Extract<Drawable, { kind: 'curve' }>,
  markerId: string,
  color: string,
): string {
  const { axis } = p;
  const dash = d.style === 'dashed' ? ' stroke-dasharray="8 6"' : '';
  let out = '';

  if (d.model.family === 'vertical') {
    const vxRaw = p.px(d.model.x);
    const vx = round1(vxRaw);
    // A vertical line's domain restricts y.
    const yTop = round1(p.py(Math.min(axis.yMax, d.domain?.max ?? Infinity)));
    const yBot = round1(p.py(Math.max(axis.yMin, d.domain?.min ?? -Infinity)));
    out += `<line x1="${vx}" y1="${yTop}" x2="${vx}" y2="${yBot}" stroke="${color}" stroke-width="2"${dash}/>`;
    if (d.arrows !== false && vxRaw >= 0 && vxRaw <= p.W) {
      if (d.domain?.max === undefined) out += arrowAt([vxRaw, 0], [0, -1], markerId, color);
      if (d.domain?.min === undefined) out += arrowAt([vxRaw, p.H], [0, 1], markerId, color);
    }
    if (d.shade === 'left' || d.shade === 'right') {
      const xEdge = d.shade === 'left' ? 0 : p.W;
      out += `<rect x="${Math.min(vx, xEdge)}" y="0" width="${Math.abs(xEdge - vx)}" height="${p.H}" fill="${color}" fill-opacity="${SHADE_FILL_OPACITY}"/>`;
    }
  } else {
    const path = samplePath(p, d.model, d.domain);
    if (!path) return '';
    if (d.shade === 'above' || d.shade === 'below') {
      // Half-plane between the curve and the top/bottom window edge.
      const edge = d.shade === 'above' ? 0 : p.H;
      const x0 = Math.max(axis.xMin, d.domain?.min ?? -Infinity);
      const x1 = Math.min(axis.xMax, d.domain?.max ?? Infinity);
      out += `<path d="${path}L${round1(p.px(x1))} ${edge}L${round1(p.px(x0))} ${edge}Z" fill="${color}" fill-opacity="${SHADE_FILL_OPACITY}" stroke="none"/>`;
    }
    out += `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"${dash}/>`;
    if (d.arrows !== false) {
      out += curveArrows(p, d.model, d.domain, markerId, color);
    }
  }

  // Endpoint dots at explicit domain ends (a restricted curve is a ray/segment).
  if (d.domain?.min !== undefined && d.model.family !== 'vertical') {
    const y = evalModel(d.model, d.domain.min);
    if (y !== null && Number.isFinite(y)) {
      out += endpointDot(p, [d.domain.min, y], d.domain.minStyle ?? 'closed', color);
    }
  }
  if (d.domain?.max !== undefined && d.model.family !== 'vertical') {
    const y = evalModel(d.model, d.domain.max);
    if (y !== null && Number.isFinite(y)) {
      out += endpointDot(p, [d.domain.max, y], d.domain.maxStyle ?? 'closed', color);
    }
  }
  return out;
}

function renderSegment(p: Plane, d: Extract<Drawable, { kind: 'segment' }>, color: string): string {
  const dash = d.style === 'dashed' ? ' stroke-dasharray="8 6"' : '';
  const line =
    `<line x1="${round1(p.px(d.from[0]))}" y1="${round1(p.py(d.from[1]))}"` +
    ` x2="${round1(p.px(d.to[0]))}" y2="${round1(p.py(d.to[1]))}"` +
    ` stroke="${color}" stroke-width="2"${dash}/>`;
  // Plane-less: a segment is an edge of a figure (a height, a diagonal), not a
  // plotted interval, so it carries no endpoint dots unless they were authored.
  if (!p.plane && !d.endpoints) return line;
  const [fromStyle, toStyle] = d.endpoints ?? ['closed', 'closed'];
  return line + endpointDot(p, d.from, fromStyle, color) + endpointDot(p, d.to, toStyle, color);
}

function renderRay(
  p: Plane,
  d: Extract<Drawable, { kind: 'ray' }>,
  markerId: string,
  color: string,
): string {
  // Extend from→through far past the window (the clip trims it). A degenerate
  // ray (from === through) draws only its endpoint dot. The arrowhead is a
  // separate short line at the window-EXIT point — a marker on the extended
  // line's far end would sit outside the clipPath and never render (the
  // original implementation had exactly that bug).
  const fx = p.px(d.from[0]);
  const fy = p.py(d.from[1]);
  const dx = p.px(d.through[0]) - fx;
  const dy = p.py(d.through[1]) - fy;
  const len = Math.hypot(dx, dy);
  let out = '';
  if (len > 0) {
    const t = (Math.max(p.W, p.H) * 3) / len;
    out +=
      `<line x1="${round1(fx)}" y1="${round1(fy)}"` +
      ` x2="${round1(fx + dx * t)}" y2="${round1(fy + dy * t)}"` +
      ` stroke="${color}" stroke-width="2"/>`;
    if (d.arrows !== false) {
      const tip = insideBox(p, fx, fy)
        ? clipToBox(p, fx, fy, fx + dx * t, fy + dy * t)
        : null;
      if (tip) out += arrowAt(tip, [dx, dy], markerId, color);
    }
  }
  return out + endpointDot(p, d.from, d.fromStyle ?? 'closed', color);
}

function renderPolygon(p: Plane, d: Extract<Drawable, { kind: 'polygon' }>, color: string): string {
  const pts = d.vertices
    .map((v) => `${round1(p.px(v[0]))},${round1(p.py(v[1]))}`)
    .join(' ');
  const fill = d.filled ? ` fill="${color}" fill-opacity="${SHADE_FILL_OPACITY}"` : ' fill="none"';
  return `<polygon points="${pts}"${fill} stroke="${color}" stroke-width="2"/>`;
}

// ---- geometry marks (Y7, Q1/Q2) -----------------------------------------------
// Placement comes from ../figure-marks.ts (shared with the JSXGraph board, ER-4);
// this file only maps coordinates in and stringifies primitives out.

const pt = (p: Plane, v: readonly number[]): Pt => [p.px(v[0]!), p.py(v[1]!)];

function prims(list: readonly MarkPrim[], color: string): string {
  let out = '';
  for (const m of list) {
    if (m.t === 'text') {
      const vertex = m.role === 'vertex';
      out +=
        `<text x="${round1(m.x)}" y="${round1(m.y)}" text-anchor="middle" dominant-baseline="central"` +
        ` font-size="${vertex ? 15 : 16}"${vertex ? ' font-style="italic"' : ''} font-family="inherit"` +
        ` style="${INK_STYLE}">${escape(m.text)}</text>`;
    } else if (m.t === 'face') {
      const pts = m.pts.map((q) => `${round1(q[0])},${round1(q[1])}`).join(' ');
      out += `<polygon points="${pts}" fill="${color}" fill-opacity="0.12" stroke="none"/>`;
    } else if (m.pts.length === 2) {
      const [a, b] = m.pts as [Pt, Pt];
      out +=
        `<line x1="${round1(a[0])}" y1="${round1(a[1])}" x2="${round1(b[0])}" y2="${round1(b[1])}"` +
        ` stroke="${color}" stroke-width="${WEIGHT[m.weight ?? 'mark']}"` +
        `${m.dashed ? ' stroke-dasharray="6 4"' : ''}/>`;
    } else {
      const d = m.pts.map((q, i) => `${i ? 'L' : 'M'}${round1(q[0])} ${round1(q[1])}`).join('');
      out += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${WEIGHT[m.weight ?? 'mark']}"/>`;
    }
  }
  return out;
}

type MarkKind = 'angle_mark' | 'tick_mark' | 'parallel_mark' | 'side_label' | 'text';

function renderMark(p: Plane, d: Extract<Drawable, { kind: MarkKind }>, color: string, ctx: MarkContext): string {
  switch (d.kind) {
    case 'angle_mark':
      return prims(
        angleMark(pt(p, d.at), pt(p, d.from), pt(p, d.to), {
          ...(d.style ? { style: d.style } : {}),
          ...(d.reflex ? { reflex: true } : {}),
          ...(d.label ? { label: d.label } : {}),
        }),
        color,
      );
    case 'tick_mark':
      return prims(ticks(pt(p, d.from), pt(p, d.to), d.count), color);
    case 'parallel_mark':
      return prims(chevrons(ctx, pt(p, d.from), pt(p, d.to), d.count), color);
    case 'side_label':
      return prims(sideLabel(ctx, pt(p, d.from), pt(p, d.to), d.text), color);
    case 'text':
      return prims(freeText(pt(p, d.at), d.text), color);
  }
}

/** The authored colour of the shape a mark annotates (Q5), or undefined. */
function markOwnerColor(p: Plane, d: Drawable, drawables: readonly Drawable[], ctx: MarkContext) {
  let owner: number | undefined;
  if (d.kind === 'angle_mark') owner = markOwner(ctx, pt(p, d.at));
  else if (d.kind === 'tick_mark' || d.kind === 'parallel_mark') owner = markOwner(ctx, pt(p, d.from), pt(p, d.to));
  const o = owner === undefined ? undefined : drawables[owner];
  return o && 'color' in o ? o.color : undefined;
}

function renderDrawable(p: Plane, d: Drawable, markerId: string, color: string, ctx: MarkContext): string {
  switch (d.kind) {
    case 'point':
      return renderPoint(p, d, color, ctx);
    case 'curve':
      return renderCurve(p, d, markerId, color);
    case 'expression':
      return ''; // needs the kit's formula parser — see the header comment
    case 'segment':
      return renderSegment(p, d, color);
    case 'ray':
      return renderRay(p, d, markerId, color);
    case 'polygon':
      return renderPolygon(p, d, color);
    case 'angle_mark':
    case 'tick_mark':
    case 'parallel_mark':
    case 'side_label':
    case 'text':
      return renderMark(p, d, color, ctx);
    case 'cuboid':
      // Geometry in figure-marks.ts (shared with the board): faces, unit
      // grid, dashed hidden edges, visible edges, outside labels (Q6).
      return prims(cuboid((v) => pt(p, v), d), color);
  }
}

// ---- answer key → drawables ---------------------------------------------------

/**
 * Map a graded interaction's answer key onto display drawables — the graph twin
 * of "blanks prefill with their canonical answer" in the answer-key print
 * variant (renderActivityForPrint showAnswers). A noSolutionCorrect key draws
 * NOTHING: the stored key is a decoy and the correct answer is "no solution."
 */
export function answerKeyDrawables(block: InteractiveGraphBlock): Drawable[] {
  if (block.noSolutionCorrect) return [];
  const interaction: GraphInteraction = block.interaction;
  switch (interaction.type) {
    case 'plot_point':
      return interaction.correctPoints.map((at) => ({ kind: 'point', at }));
    case 'plot_function':
      return interaction.models.map((model, i) => ({
        kind: 'curve',
        model,
        domain: interaction.domains?.[i] ?? undefined,
      }));
    case 'shade_region':
      return interaction.regions.map((r) => ({
        kind: 'polygon',
        vertices: r.correctVertices,
        filled: true,
      }));
    case 'graph_inequality':
      return interaction.inequalities.map((ineq) => ({
        kind: 'curve',
        model: ineq.boundary,
        style: ineq.strict ? 'dashed' : 'solid',
        shade: ineq.shadeSide,
      }));
    case 'plot_ray':
      return interaction.rays.map((r) => ({
        kind: 'ray',
        from: r.from,
        through: r.through,
        fromStyle: r.fromStyle,
      }));
    case 'plot_segment':
      return interaction.segments.map((s) => ({
        kind: 'segment',
        from: s.from,
        to: s.to,
        endpoints: s.endpoints,
      }));
    case 'transform_curve':
      // The KEY overlay is the target curve. (The parent curve is question
      // material and prints on the STUDENT sheet via questionDrawables — it
      // must never wait for the answer-key variant.)
      return interaction.models.map((model) => ({ kind: 'curve', model }));
    case 'display':
      return interaction.drawables;
  }
}

/**
 * Question-side drawables for a GRADED interaction — display material the
 * STUDENT sheet must show because it IS the question. transform_curve's shown
 * parent is the first (and so far only) case: every other question variant
 * deliberately prints empty axes (the pinned print-twins invariant, revised
 * variant-scoped by design A3), and this function returning [] for them is
 * that invariant's new spelling.
 */
// The parameter is STRUCTURAL on purpose: the viewer calls this with the
// sanitized projection, whose transform_curve interaction has had `models`
// stripped (the answer) but keeps `start` (the question) — so the full
// InteractiveGraphBlock type would reject exactly the caller this function
// exists for.
export function questionDrawables(block: {
  interaction?: { type: string; start?: FunctionModel };
  stimulus?: readonly Drawable[] | undefined;
}): Drawable[] {
  const interaction = block.interaction;
  // A display graph's picture is its own `interaction.drawables`; the stimulus
  // field belongs to GRADED graphs (the importer never sets both).
  const stimulus = interaction?.type === 'display' ? [] : stimulusDrawables(block);
  if (interaction?.type === 'transform_curve' && interaction.start) {
    return [...stimulus, { kind: 'curve', model: interaction.start, style: 'dashed' }];
  }
  return stimulus;
}

/** Drawable kinds that carry their own stroke colour (marks and labels take
 * the colour of the shape they annotate, so defaulting the shape is enough). */
const STIMULUS_SHAPES: ReadonlySet<string> = new Set([
  'point', 'curve', 'expression', 'segment', 'ray', 'polygon', 'cuboid',
]);

/**
 * A graded graph's STIMULUS as it is drawn — on the student's board and on
 * paper, from this one function so the two cannot disagree.
 *
 * An uncoloured shape defaults to SLATE here, not to the shared drawable
 * default (blue): blue is the student's own ink on a graded board, so a blue
 * pre-image would read as work the student had already done. An authored
 * colour always wins.
 */
export function stimulusDrawables(block: { stimulus?: readonly Drawable[] | undefined }): Drawable[] {
  return (block.stimulus ?? []).map((d) =>
    STIMULUS_SHAPES.has(d.kind) && !('color' in d && d.color) ? ({ ...d, color: 'slate' } as Drawable) : d,
  );
}

// ---- figure geometry (plane-less mode, Q4) -----------------------------------

/** ViewBox size + mapping for a window. Plane on: today's 400 square with x and
 * y scaled independently. Plane-less: 400 wide, height from the window's
 * aspect (clamped 1:3..3:1), ONE scale for both axes so angles are true; when
 * the clamp bites, the window is centred inside the clamped box. */
export function figureGeometry(
  axis: AxisConfig,
  plane = true,
): { W: number; H: number; px: (x: number) => number; py: (y: number) => number } | null {
  const xs = axis.xMax - axis.xMin;
  const ys = axis.yMax - axis.yMin;
  if (!(xs > 0) || !(ys > 0)) return null;
  if (plane) {
    return {
      W: SIZE,
      H: SIZE,
      px: (x) => ((x - axis.xMin) / xs) * SIZE,
      py: (y) => ((axis.yMax - y) / ys) * SIZE,
    };
  }
  const H = round1(Math.min(MAX_H, Math.max(MIN_H, (SIZE * ys) / xs)));
  const s = Math.min(SIZE / xs, H / ys);
  const ox = (SIZE - xs * s) / 2;
  const oy = (H - ys * s) / 2;
  return { W: SIZE, H, px: (x) => ox + (x - axis.xMin) * s, py: (y) => oy + (axis.yMax - y) * s };
}

// Auto-fit padding (Q4): 12 % of the drawables' span on each side, plus a
// 24-unit label margin (viewBox units, so it is solved against the scale).
const FIT_PADDING = 0.12;
const FIT_LABEL_MARGIN = 24;

/**
 * The window a plane-less ```figure gets when its fence has no `axes:` line
 * (ER-3: run ONCE, at import, so `axis` stays required and the engine never
 * guesses). Covers every coordinate a drawable carries — marks included; a
 * curve or expression has no box of its own and contributes nothing. A
 * zero-span box (collinear or coincident points) is widened to a non-zero
 * span. null when nothing carries a coordinate.
 */
export function fitFigureWindow(drawables: readonly Drawable[]): AxisConfig | null {
  const xs: number[] = [];
  const ys: number[] = [];
  const take = (v: readonly number[] | undefined): void => {
    if (v && Number.isFinite(v[0]) && Number.isFinite(v[1])) {
      xs.push(v[0]!);
      ys.push(v[1]!);
    }
  };
  for (const d of drawables) {
    switch (d.kind) {
      case 'point':
      case 'text':
        take(d.at);
        break;
      case 'segment':
      case 'tick_mark':
      case 'parallel_mark':
      case 'side_label':
        take(d.from);
        take(d.to);
        break;
      case 'ray':
        take(d.from);
        take(d.through);
        break;
      case 'polygon':
        d.vertices.forEach(take);
        break;
      case 'angle_mark':
        take(d.at);
        take(d.from);
        take(d.to);
        break;
      case 'cuboid': {
        // The solid's own box: front face plus the receding depth, which in a
        // one-scale figure is (w·½·cos45°, w·½·sin45°) graph units.
        const [x, y] = [d.at?.[0] ?? 0, d.at?.[1] ?? 0];
        const dd = d.width * 0.5 * Math.SQRT1_2;
        take([x, y]);
        take([x + d.length + dd, y + d.height + dd]);
        break;
      }
      case 'curve':
      case 'expression':
        break;
    }
  }
  if (xs.length === 0) return null;
  let x0 = Math.min(...xs);
  let x1 = Math.max(...xs);
  let y0 = Math.min(...ys);
  let y1 = Math.max(...ys);
  // Zero span: borrow the other axis's span, or 1 when both collapse.
  const fallback = Math.max(x1 - x0, y1 - y0) || 1;
  if (x1 - x0 === 0) {
    x0 -= fallback / 2;
    x1 += fallback / 2;
  }
  if (y1 - y0 === 0) {
    y0 -= fallback / 2;
    y1 += fallback / 2;
  }
  const xs0 = x1 - x0;
  const ys0 = y1 - y0;
  // Total x span T satisfies T = xs0·(1 + 2·pad) + 2·margin·T/400 (the margin is
  // in viewBox units and the scale is 400/T), so T = xs0·(1+2·pad)/(1−2·m/400).
  const T = (xs0 * (1 + 2 * FIT_PADDING)) / (1 - (2 * FIT_LABEL_MARGIN) / SIZE);
  const xPad = (T - xs0) / 2;
  const yPad = ys0 * FIT_PADDING + (FIT_LABEL_MARGIN * T) / SIZE;
  const down = (n: number): number => Math.floor(n * 1000) / 1000;
  const up = (n: number): number => Math.ceil(n * 1000) / 1000;
  return {
    xMin: down(x0 - xPad),
    xMax: up(x1 + xPad),
    yMin: down(y0 - yPad),
    yMax: up(y1 + yPad),
    xGridStep: 1,
    yGridStep: 1,
    showGrid: true,
    snapToGrid: true,
  };
}

// ---- entry --------------------------------------------------------------------

/**
 * Render the static coordinate plane (plus optional drawables) as an inline
 * SVG string. `uid` namespaces the SVG's internal ids (clipPath, arrow marker)
 * — ids are document-global, and a page can hold many graphs; pass the block id.
 * Returns '' for a degenerate window (non-positive span), leaving the text
 * fallback as the canvas content.
 */
export function renderGraphSvg(
  axis: AxisConfig,
  drawables: Drawable[],
  uid: string,
  // The color for a drawable with no authored `color`. Defaults to the shared
  // palette default; the answer-key print passes INK so the synthesized key
  // stays a distinct neutral layer, not the display palette (OV#6).
  defaultColor: string = resolveDrawableColor(undefined),
  // plane: false = plane-less geometry mode (GraphFigureBlock.plane, D3/Q4).
  // Absent = true, so every existing caller renders byte-identically.
  opts: { plane?: boolean } = {},
): string {
  const plane = opts.plane !== false;
  const g = figureGeometry(axis, plane);
  if (!g) return '';
  const p: Plane = { axis, plane, ...g };
  const ctx = markContext(drawables, (v) => pt(p, v));
  const clipId = 'gclip-' + uid;
  // One arrow marker PER distinct drawable color (an SVG marker's fill is fixed,
  // so a shared marker can't recolor per curve). markerIdFor keys the marker by
  // the resolved hex; the drawables reference their own color's marker.
  const markerBase = 'garrow-' + uid;
  const markerIdFor = (color: string): string => `${markerBase}-${color.replace('#', '')}`;

  const usedMarkers = new Map<string, string>(); // markerId -> color
  const content = drawables
    .map((d) => {
      const authored = 'color' in d ? d.color : undefined;
      const inherited = authored ?? markOwnerColor(p, d, drawables, ctx);
      const color = inherited ? resolveDrawableColor(inherited) : defaultColor;
      const markerId = markerIdFor(color);
      usedMarkers.set(markerId, color);
      // Each drawable is wrapped in a marked <g> so a DOM query can count what
      // was actually DRAWN, not what was asked for. The viewer's leak suite
      // selects [data-drawable]; before this wrapper existed that selector
      // matched nothing anywhere, so its zero-leak assertion was vacuously
      // green (the P11 class — mutation-tested the day this line landed).
      return `<g data-drawable="${attr(d.kind)}">${renderDrawable(p, d, markerId, color, ctx)}</g>`;
    })
    .join('');

  const markers = [...usedMarkers]
    .map(
      ([mId, color]) =>
        `<marker id="${attr(mId)}" viewBox="0 0 10 10" refX="8" refY="5"` +
        ` markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
        `<path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`,
    )
    .join('');

  return (
    `<svg class="graph-paper" viewBox="0 0 ${p.W} ${p.H}"` +
    // How many authored drawables this figure carries, declared on the element
    // itself. The S5 print-parity gate reads it to tell the two cases apart
    // without inspecting geometry: a QUESTION prints empty axes for the student
    // to work on (0), a DISPLAY figure prints the content it exists to show
    // (>0). Emitted from the ONE renderer both surfaces use, so the two cannot
    // disagree about what they drew — which is the whole point of the count
    // being the assertion rather than a pixel comparison.
    ` data-drawables="${drawables.length}"` +
    ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
    `<clipPath id="${attr(clipId)}"><rect x="0" y="0" width="${p.W}" height="${p.H}"/></clipPath>` +
    markers +
    '</defs>' +
    `<g clip-path="url(#${attr(clipId)})">` +
    (plane ? renderGridAndAxes(p) : '') +
    content +
    '</g>' +
    '</svg>'
  );
}
