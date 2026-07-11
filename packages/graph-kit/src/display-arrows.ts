// =============================================================================
// display-arrows.ts — continuation-arrow geometry for static display graphs
// -----------------------------------------------------------------------------
// Textbook convention: an arrowhead where a figure leaves the visible window
// says "this keeps going"; an endpoint dot says "this stops here". The display
// board draws each arrow as a short overlay segment whose tip sits ON the
// window boundary (JSXGraph's lastArrow marker renders the head there).
//
// The geometry is subtler than "arrow at the domain end": most curves exit a
// standard window through the TOP or BOTTOM (y = 2x + 3 leaves a ±10 window at
// y = ±10, x = ±6.5 — an arrow parked at x = ±10 would be off-screen). So every
// helper here answers the same question: where does the figure actually cross
// the window rectangle, and which way is it heading?
//
// Pure and DOM-free (like graph-score.ts) so the sample-walk and clipping are
// unit-testable; board.ts consumes the specs.
// =============================================================================

export interface ArrowWindow {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** One arrowhead: a short segment from `tail` to `tip`, head drawn at `tip`. */
export interface ArrowSpec {
  tail: [number, number];
  tip: [number, number];
}

// Arrow shaft length in graph units — long enough to orient the head, short
// enough that its solid stroke doesn't visibly restyle a dashed curve.
export function arrowLength(win: ArrowWindow): number {
  return 0.04 * Math.min(win.xMax - win.xMin, win.yMax - win.yMin);
}

// Tips pull in from the exact boundary by this much so the marker HEAD (drawn
// past the segment end) isn't clipped by the board's viewport.
function edgeInset(win: ArrowWindow): number {
  return 0.015 * Math.min(win.xMax - win.xMin, win.yMax - win.yMin);
}

const isInside = (p: [number, number], win: ArrowWindow): boolean =>
  Number.isFinite(p[0]) &&
  Number.isFinite(p[1]) &&
  p[0] >= win.xMin &&
  p[0] <= win.xMax &&
  p[1] >= win.yMin &&
  p[1] <= win.yMax;

// Where the segment inside→outside crosses the window boundary (both points
// finite; `inside` is within the window).
function clipCrossing(
  inside: [number, number],
  outside: [number, number],
  win: ArrowWindow,
): [number, number] {
  const dx = outside[0] - inside[0];
  const dy = outside[1] - inside[1];
  let t = 1;
  if (dx > 0) t = Math.min(t, (win.xMax - inside[0]) / dx);
  if (dx < 0) t = Math.min(t, (win.xMin - inside[0]) / dx);
  if (dy > 0) t = Math.min(t, (win.yMax - inside[1]) / dy);
  if (dy < 0) t = Math.min(t, (win.yMin - inside[1]) / dy);
  t = Math.max(0, Math.min(1, t));
  return [inside[0] + t * dx, inside[1] + t * dy];
}

// The exact window-exit point between an inside sample at `xIn` and an outside
// sample at `xOut`. One linear clip suffices when the outside sample is finite;
// near an asymptote (log: the next sample is −∞) the crossing is found by
// iteratively subsampling toward the asymptote — each pass shrinks the bracket
// 32×, so six passes pin the exit to ~1e-9 of the gap.
function refineTip(
  fn: (x: number) => number,
  xIn: number,
  xOut: number,
  win: ArrowWindow,
): [number, number] {
  let inP: [number, number] = [xIn, fn(xIn)];
  let outX = xOut;
  for (let pass = 0; pass < 6; pass++) {
    const M = 32;
    let advanced = inP;
    let hitOutside: [number, number] | null = null;
    for (let j = 1; j <= M; j++) {
      const x = inP[0] + ((outX - inP[0]) * j) / M;
      const p: [number, number] = [x, fn(x)];
      if (isInside(p, win)) {
        advanced = p;
        continue;
      }
      hitOutside = p;
      break;
    }
    if (!hitOutside) return advanced;
    if (Number.isFinite(hitOutside[0]) && Number.isFinite(hitOutside[1])) {
      return clipCrossing(advanced, hitOutside, win);
    }
    // Non-finite just past `advanced` — zoom into the remaining gap.
    inP = advanced;
    outX = hitOutside[0];
  }
  return inP;
}

// Outward heading at `tip`, taken from the LOCAL slope of the sampled function
// rather than a two-sample chord. A chord between adjacent samples can straddle
// a local extremum on an oscillating curve (sin, cos) and collapse to a nearly
// flat direction while the true tangent is steep — so the arrowhead pointed the
// wrong way. `sx` is the outward x-sign (+1 at the high-x end, −1 at the low-x
// end); the tangent line through `tip` continues outward as (sx, sx·slope).
// Falls back to `chord` when the function isn't finite on both sides (an
// asymptote sitting just past the tip, e.g. log near x → 0⁺).
function outwardDir(
  fn: (x: number) => number,
  x: number,
  sx: 1 | -1,
  win: ArrowWindow,
  chord: [number, number],
): [number, number] {
  const h = 1e-4 * (win.xMax - win.xMin);
  const yr = fn(x + h);
  const yl = fn(x - h);
  if (Number.isFinite(yr) && Number.isFinite(yl)) {
    const slope = (yr - yl) / (2 * h);
    if (Number.isFinite(slope)) return [sx, sx * slope];
  }
  // One-sided toward the inside when a boundary/asymptote is just outside.
  const y0 = fn(x);
  const yIn = fn(x - sx * h);
  if (Number.isFinite(y0) && Number.isFinite(yIn)) {
    const slope = (y0 - yIn) / (sx * h);
    if (Number.isFinite(slope)) return [sx, sx * slope];
  }
  return chord;
}

// Tip pulled in by `inset` along the direction, tail backed off by `len` more.
function withTail(
  tip: [number, number],
  dir: [number, number],
  len: number,
  inset: number,
): ArrowSpec | null {
  const mag = Math.hypot(dir[0], dir[1]);
  if (!Number.isFinite(mag) || mag === 0) return null;
  const ux = dir[0] / mag;
  const uy = dir[1] / mag;
  const tx = tip[0] - ux * inset;
  const ty = tip[1] - uy * inset;
  return { tail: [tx - ux * len, ty - uy * len], tip: [tx, ty] };
}

/**
 * Continuation arrows for a sampled y = f(x) curve drawn over [lo, hi].
 * `first`/`last` say which ends are UNBOUNDED (no authored domain limit —
 * a bounded end gets its open/closed dot instead, never an arrow). Each
 * requested end yields an arrow at the outermost point where the curve is
 * still inside the window, headed out; an end whose samples never enter the
 * window yields none.
 */
export function curveEndArrows(
  fn: (x: number) => number,
  lo: number,
  hi: number,
  win: ArrowWindow,
  ends: { first: boolean; last: boolean },
): ArrowSpec[] {
  if (!(hi > lo)) return [];
  const N = 240;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const x = lo + ((hi - lo) * i) / N;
    pts.push([x, fn(x)]);
  }
  const len = arrowLength(win);
  const inset = edgeInset(win);
  const out: ArrowSpec[] = [];

  if (ends.last) {
    for (let i = N; i >= 0; i--) {
      const p = pts[i]!;
      if (!isInside(p, win)) continue;
      const tip = i === N ? p : refineTip(fn, p[0], pts[i + 1]![0], win);
      // Chord fallback: inside sample → tip; when they coincide (curve
      // terminates at the drawn edge) use the previous sample instead.
      let chord: [number, number] = [tip[0] - p[0], tip[1] - p[1]];
      if (Math.hypot(chord[0], chord[1]) < 1e-9) {
        const prev = pts[Math.max(0, i - 1)]!;
        chord = [tip[0] - prev[0], tip[1] - prev[1]];
      }
      const dir = outwardDir(fn, tip[0], 1, win, chord);
      const spec = withTail(tip, dir, len, inset);
      if (spec) out.push(spec);
      break;
    }
  }
  if (ends.first) {
    for (let i = 0; i <= N; i++) {
      const p = pts[i]!;
      if (!isInside(p, win)) continue;
      const tip = i === 0 ? p : refineTip(fn, p[0], pts[i - 1]![0], win);
      let chord: [number, number] = [tip[0] - p[0], tip[1] - p[1]];
      if (Math.hypot(chord[0], chord[1]) < 1e-9) {
        const next = pts[Math.min(N, i + 1)]!;
        chord = [tip[0] - next[0], tip[1] - next[1]];
      }
      const dir = outwardDir(fn, tip[0], -1, win, chord);
      const spec = withTail(tip, dir, len, inset);
      if (spec) out.push(spec);
      break;
    }
  }
  return out;
}

/**
 * Continuation arrow for a ray from `from` through `through`: the head sits
 * where the ray exits the window. Null when the ray never crosses the visible
 * window (or from === through).
 */
export function rayArrowSpec(
  from: [number, number],
  through: [number, number],
  win: ArrowWindow,
): ArrowSpec | null {
  const dx = through[0] - from[0];
  const dy = through[1] - from[1];
  if (dx === 0 && dy === 0) return null;
  // Slab clipping on t ∈ [0, ∞): the ray is visible on [tEnter, tExit].
  let tEnter = 0;
  let tExit = Infinity;
  const slab = (p: number, d: number, min: number, max: number): boolean => {
    if (d === 0) return p >= min && p <= max;
    const t1 = (min - p) / d;
    const t2 = (max - p) / d;
    tEnter = Math.max(tEnter, Math.min(t1, t2));
    tExit = Math.min(tExit, Math.max(t1, t2));
    return true;
  };
  if (!slab(from[0], dx, win.xMin, win.xMax)) return null;
  if (!slab(from[1], dy, win.yMin, win.yMax)) return null;
  if (tEnter > tExit || tExit <= 0) return null;
  const tip: [number, number] = [from[0] + tExit * dx, from[1] + tExit * dy];
  return withTail(tip, [dx, dy], arrowLength(win), edgeInset(win));
}

/** Continuation arrows for a vertical line x = k: both window edges. */
export function verticalArrowSpecs(k: number, win: ArrowWindow): ArrowSpec[] {
  if (k < win.xMin || k > win.xMax) return [];
  const len = arrowLength(win);
  const inset = edgeInset(win);
  return [
    { tail: [k, win.yMax - inset - len], tip: [k, win.yMax - inset] },
    { tail: [k, win.yMin + inset + len], tip: [k, win.yMin + inset] },
  ];
}
