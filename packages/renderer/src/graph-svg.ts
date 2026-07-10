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
// so the static figure matches what the widget would show.
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

// The schema doesn't re-export CurveDomain; derive it from the curve drawable
// so this module stays renderer-only.
type CurveDomain = NonNullable<Extract<Drawable, { kind: 'curve' }>['domain']>;

// ViewBox size (square, like the on-screen canvas) and palette. Grayscale-safe:
// grid is light, axes mid, ink near-black — survives a monochrome printer.
const SIZE = 400;
const GRID_COLOR = '#cbd5e1';
const AXIS_COLOR = '#64748b';
const LABEL_COLOR = '#475569';
const INK = '#1e293b';
const CURVE_SAMPLES = 96;

interface Plane {
  axis: AxisConfig;
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
      lines += `<line x1="${v}" y1="0" x2="${v}" y2="${SIZE}"/>`;
    }
    for (const y of ys) {
      const v = round1(p.py(y));
      lines += `<line x1="0" y1="${v}" x2="${SIZE}" y2="${v}"/>`;
    }
    out += `<g stroke="${GRID_COLOR}" stroke-width="1">${lines}</g>`;
  }

  // Axes, only where 0 crosses the window.
  const hasYAxis = axis.xMin <= 0 && axis.xMax >= 0;
  const hasXAxis = axis.yMin <= 0 && axis.yMax >= 0;
  let axes = '';
  if (hasYAxis) {
    const v = round1(p.px(0));
    axes += `<line x1="${v}" y1="0" x2="${v}" y2="${SIZE}"/>`;
  }
  if (hasXAxis) {
    const v = round1(p.py(0));
    axes += `<line x1="0" y1="${v}" x2="${SIZE}" y2="${v}"/>`;
  }
  if (axes) out += `<g stroke="${AXIS_COLOR}" stroke-width="1.5">${axes}</g>`;

  // Tick labels. Along the axis when it's visible, else along the window edge.
  // Thinned so a dense grid never yields overlapping text; 0 is skipped when
  // both axes are visible (it would sit on the crossing).
  const xLabelY = hasXAxis ? Math.min(Math.max(p.py(0) + 14, 12), SIZE - 4) : SIZE - 5;
  const yLabelX = hasYAxis ? Math.min(Math.max(p.px(0) - 5, 14), SIZE - 4) : 5;
  const yAnchor = hasYAxis ? 'end' : 'start';
  let labels = '';
  const xEvery = Math.ceil(xs.length / 14);
  xs.forEach((x, i) => {
    if (i % xEvery !== 0) return;
    if (x === 0 && hasXAxis && hasYAxis) return;
    const vx = Math.min(Math.max(round1(p.px(x)), 8), SIZE - 8);
    labels += `<text x="${vx}" y="${round1(xLabelY)}" text-anchor="middle">${escape(fmt(x))}</text>`;
  });
  const yEvery = Math.ceil(ys.length / 14);
  ys.forEach((y, i) => {
    if (i % yEvery !== 0) return;
    if (y === 0 && hasXAxis && hasYAxis) return;
    const vy = Math.min(Math.max(round1(p.py(y) + 4), 12), SIZE - 4);
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
    case 'exponential':
      return model.a * Math.pow(model.b, x);
    case 'logarithmic':
      return x > 0 ? model.a + model.b * Math.log(x) : null;
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

const insideBox = (x: number, y: number): boolean =>
  Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= SIZE && y >= 0 && y <= SIZE;

// inside→outside crossing with the viewBox (both points finite).
function clipToBox(
  ix: number,
  iy: number,
  ox: number,
  oy: number,
): [number, number] {
  const dx = ox - ix;
  const dy = oy - iy;
  let t = 1;
  if (dx > 0) t = Math.min(t, (SIZE - ix) / dx);
  if (dx < 0) t = Math.min(t, -ix / dx);
  if (dy > 0) t = Math.min(t, (SIZE - iy) / dy);
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
    ` stroke="${INK}" stroke-width="2" marker-end="url(#${attr(markerId)})"/>`
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
      if (!insideBox(pt[0], pt[1])) continue;
      const beyond = pts[i + neighborStep];
      const tip =
        beyond && Number.isFinite(beyond[0]) && Number.isFinite(beyond[1])
          ? clipToBox(pt[0], pt[1], beyond[0], beyond[1])
          : pt;
      // Outward direction: from the inward neighbor toward the tip.
      const inner = pts[i - neighborStep] ?? pt;
      out += arrowAt(tip, [tip[0] - inner[0], tip[1] - inner[1]], markerId);
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

function endpointDot(p: Plane, at: [number, number], style: EndpointStyle): string {
  const open = style === 'open';
  return (
    `<circle cx="${round1(p.px(at[0]))}" cy="${round1(p.py(at[1]))}" r="4.5"` +
    ` fill="${open ? '#fff' : INK}" stroke="${INK}" stroke-width="2"/>`
  );
}

function renderPoint(p: Plane, d: Extract<Drawable, { kind: 'point' }>): string {
  let out = endpointDot(p, d.at, d.style ?? 'closed');
  if (d.label) {
    out +=
      `<text x="${round1(p.px(d.at[0]) + 7)}" y="${round1(p.py(d.at[1]) - 7)}"` +
      ` fill="${INK}" font-size="13" font-family="inherit">${escape(d.label)}</text>`;
  }
  return out;
}

function renderCurve(
  p: Plane,
  d: Extract<Drawable, { kind: 'curve' }>,
  markerId: string,
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
    out += `<line x1="${vx}" y1="${yTop}" x2="${vx}" y2="${yBot}" stroke="${INK}" stroke-width="2"${dash}/>`;
    if (d.arrows !== false && vxRaw >= 0 && vxRaw <= SIZE) {
      if (d.domain?.max === undefined) out += arrowAt([vxRaw, 0], [0, -1], markerId);
      if (d.domain?.min === undefined) out += arrowAt([vxRaw, SIZE], [0, 1], markerId);
    }
    if (d.shade === 'left' || d.shade === 'right') {
      const xEdge = d.shade === 'left' ? 0 : SIZE;
      out += `<rect x="${Math.min(vx, xEdge)}" y="0" width="${Math.abs(xEdge - vx)}" height="${SIZE}" fill="${INK}" fill-opacity="0.12"/>`;
    }
  } else {
    const path = samplePath(p, d.model, d.domain);
    if (!path) return '';
    if (d.shade === 'above' || d.shade === 'below') {
      // Half-plane between the curve and the top/bottom window edge.
      const edge = d.shade === 'above' ? 0 : SIZE;
      const x0 = Math.max(axis.xMin, d.domain?.min ?? -Infinity);
      const x1 = Math.min(axis.xMax, d.domain?.max ?? Infinity);
      out += `<path d="${path}L${round1(p.px(x1))} ${edge}L${round1(p.px(x0))} ${edge}Z" fill="${INK}" fill-opacity="0.12" stroke="none"/>`;
    }
    out += `<path d="${path}" fill="none" stroke="${INK}" stroke-width="2"${dash}/>`;
    if (d.arrows !== false) {
      out += curveArrows(p, d.model, d.domain, markerId);
    }
  }

  // Endpoint dots at explicit domain ends (a restricted curve is a ray/segment).
  if (d.domain?.min !== undefined && d.model.family !== 'vertical') {
    const y = evalModel(d.model, d.domain.min);
    if (y !== null && Number.isFinite(y)) {
      out += endpointDot(p, [d.domain.min, y], d.domain.minStyle ?? 'closed');
    }
  }
  if (d.domain?.max !== undefined && d.model.family !== 'vertical') {
    const y = evalModel(d.model, d.domain.max);
    if (y !== null && Number.isFinite(y)) {
      out += endpointDot(p, [d.domain.max, y], d.domain.maxStyle ?? 'closed');
    }
  }
  return out;
}

function renderSegment(p: Plane, d: Extract<Drawable, { kind: 'segment' }>): string {
  const [fromStyle, toStyle] = d.endpoints ?? ['closed', 'closed'];
  return (
    `<line x1="${round1(p.px(d.from[0]))}" y1="${round1(p.py(d.from[1]))}"` +
    ` x2="${round1(p.px(d.to[0]))}" y2="${round1(p.py(d.to[1]))}"` +
    ` stroke="${INK}" stroke-width="2"/>` +
    endpointDot(p, d.from, fromStyle) +
    endpointDot(p, d.to, toStyle)
  );
}

function renderRay(
  p: Plane,
  d: Extract<Drawable, { kind: 'ray' }>,
  markerId: string,
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
    const t = (SIZE * 3) / len;
    out +=
      `<line x1="${round1(fx)}" y1="${round1(fy)}"` +
      ` x2="${round1(fx + dx * t)}" y2="${round1(fy + dy * t)}"` +
      ` stroke="${INK}" stroke-width="2"/>`;
    if (d.arrows !== false) {
      const tip = insideBox(fx, fy)
        ? clipToBox(fx, fy, fx + dx * t, fy + dy * t)
        : null;
      if (tip) out += arrowAt(tip, [dx, dy], markerId);
    }
  }
  return out + endpointDot(p, d.from, d.fromStyle ?? 'closed');
}

function renderPolygon(p: Plane, d: Extract<Drawable, { kind: 'polygon' }>): string {
  const pts = d.vertices
    .map((v) => `${round1(p.px(v[0]))},${round1(p.py(v[1]))}`)
    .join(' ');
  const fill = d.filled ? ` fill="${INK}" fill-opacity="0.15"` : ' fill="none"';
  return `<polygon points="${pts}"${fill} stroke="${INK}" stroke-width="2"/>`;
}

function renderDrawable(p: Plane, d: Drawable, markerId: string): string {
  switch (d.kind) {
    case 'point':
      return renderPoint(p, d);
    case 'curve':
      return renderCurve(p, d, markerId);
    case 'expression':
      return ''; // needs the kit's formula parser — see the header comment
    case 'segment':
      return renderSegment(p, d);
    case 'ray':
      return renderRay(p, d, markerId);
    case 'polygon':
      return renderPolygon(p, d);
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
    case 'display':
      return interaction.drawables;
  }
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
): string {
  if (!(axis.xMax > axis.xMin) || !(axis.yMax > axis.yMin)) return '';
  const p: Plane = {
    axis,
    px: (x) => ((x - axis.xMin) / (axis.xMax - axis.xMin)) * SIZE,
    py: (y) => ((axis.yMax - y) / (axis.yMax - axis.yMin)) * SIZE,
  };
  const clipId = 'gclip-' + uid;
  const markerId = 'garrow-' + uid;

  const content = drawables.map((d) => renderDrawable(p, d, markerId)).join('');

  return (
    `<svg class="graph-paper" viewBox="0 0 ${SIZE} ${SIZE}"` +
    ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
    `<clipPath id="${attr(clipId)}"><rect x="0" y="0" width="${SIZE}" height="${SIZE}"/></clipPath>` +
    `<marker id="${attr(markerId)}" viewBox="0 0 10 10" refX="8" refY="5"` +
    ` markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0 0L10 5L0 10Z" fill="${INK}"/></marker>` +
    '</defs>' +
    `<g clip-path="url(#${attr(clipId)})">` +
    renderGridAndAxes(p) +
    content +
    '</g>' +
    '</svg>'
  );
}
