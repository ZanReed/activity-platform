// =============================================================================
// solve.ts — the numeric solve-for-y core, shared by formula.ts and evaluate.ts
// -----------------------------------------------------------------------------
// Extracted from formula.ts (calculator-parity batch, 2026-07-11) so the
// calculator's expression-row classifier can reuse the same machinery without
// an import cycle: formula.ts imports compileFunction from evaluate.ts, so the
// shared pieces live below both. Everything here is pure and takes plain
// callables — no MathLive, no math.js, no DOM.
//
// The contract: an equation LHS = RHS becomes g(x, y) = LHS − RHS; wherever g
// is LINEAR in y (every school form is), y(x) = −g(x,0) / (g(x,1) − g(x,0)).
// The side probes answer "which half-plane satisfies LHS op RHS" by evaluating
// g one step into a candidate side.
// =============================================================================

// Which side of a boundary an inequality shades. above/below for y = f(x)
// boundaries; left/right for vertical (x = k) boundaries.
export type ShadeSide = 'above' | 'below' | 'left' | 'right';

// A domain restriction parsed from a `for …` clause. Closed = endpoint included
// (<=), open = excluded (<). Absent bound = unbounded on that side.
export interface ParsedDomain {
  min?: number;
  minClosed?: boolean;
  max?: number;
  maxClosed?: boolean;
}

/** g(x, y) = LHS − RHS for some equation/inequality over x and y. */
export type G = (x: number, y: number) => number;

export const SAMPLE_XS = [-4, -2.5, -1, -0.5, 0, 0.5, 1, 2, 3.5, 5];
export const POSITIVE_XS = [0.25, 0.5, 1, 2, 3, 4.5, 6, 8];

const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

export type SolvedForY =
  | { kind: 'fn'; fn: (x: number) => number }
  | { kind: 'vertical'; x: number }
  | { kind: 'error'; message: string };

// Reduce g to y = f(x), or detect an x-only equation (→ vertical line x = k),
// or fail with a teacher-safe message.
export function solveForY(g: G): SolvedForY {
  // Does g involve y at all? Probe across xs.
  let involvesY = false;
  for (const x of SAMPLE_XS) {
    const g0 = g(x, 0);
    const g1 = g(x, 1);
    if (Number.isFinite(g0) && Number.isFinite(g1) && Math.abs(g1 - g0) > 1e-9) {
      involvesY = true;
      break;
    }
  }
  if (!involvesY) {
    // x-only equation: h(x) = g(x, 0) = 0. Solve when h is linear in x
    // (covers `x = 4` and `2x + 4 = 10`).
    const h = (x: number): number => g(x, 0);
    const h0 = h(0);
    const h1 = h(1);
    const h2 = h(2);
    if (![h0, h1, h2].every(Number.isFinite)) {
      return { kind: 'error', message: "That equation can't be read" };
    }
    const slope = h1 - h0;
    if (Math.abs(h2 - h1 - slope) > 1e-9 || Math.abs(slope) < 1e-12) {
      return { kind: 'error', message: "That equation doesn't describe a line or curve" };
    }
    return { kind: 'vertical', x: round6(-h0 / slope) };
  }
  // Verify linearity in y (second difference ≈ 0) at a few x.
  for (const x of [-1, 0, 1, 2]) {
    const g0 = g(x, 0);
    const g1 = g(x, 1);
    const g2 = g(x, 2);
    if ([g0, g1, g2].every(Number.isFinite) && Math.abs(g2 - g1 - (g1 - g0)) > 1e-9) {
      return { kind: 'error', message: 'Equations must be solvable for y (linear in y)' };
    }
  }
  return {
    kind: 'fn',
    fn: (x: number) => {
      const g0 = g(x, 0);
      const gy = g(x, 1) - g0;
      return Math.abs(gy) < 1e-12 ? NaN : -g0 / gy;
    },
  };
}

/** Is `op` satisfied by g > 0 (i.e. LHS − RHS positive)? */
export const wantsPositive = (op: '<' | '<=' | '>' | '>='): boolean =>
  op === '>' || op === '>=';

/**
 * Which y-side of the boundary y = fn(x) satisfies `LHS op RHS`? Probes one
 * unit above the boundary at some x where it's defined.
 */
export function curveSide(g: G, fn: (x: number) => number, op: '<' | '<=' | '>' | '>='): ShadeSide {
  const x0 = Number.isFinite(fn(1)) ? 1 : 2;
  const probe = g(x0, fn(x0) + 1);
  return (probe > 0) === wantsPositive(op) ? 'above' : 'below';
}

/** Which x-side of the vertical boundary x = k satisfies it? Probes one step right. */
export function verticalSide(g: G, k: number, op: '<' | '<=' | '>' | '>='): ShadeSide {
  const probe = g(k + 1, 0);
  return (probe > 0) === wantsPositive(op) ? 'right' : 'left';
}

// ---- Domain clause ---------------------------------------------------------------
// Strips a trailing restriction and parses it. Accepted forms:
//   for x >= 0     for x < 5     for -2 <= x < 5     for 0 < x
// and the Desmos-style brace form a MathLive field produces more naturally:
//   {x >= 0}       {-2 < x <= 5}
// The `for` keyword tolerates internal spaces (`f o r`) because a math field
// treats typed letters as separate symbols and its AsciiMath serialization may
// space them apart.
export function extractDomain(s: string): { rest: string; domain?: ParsedDomain } {
  const m =
    /^(.*?)(?:,)?\s+f\s*o\s*r\s+(.+)$/i.exec(s) ??
    /^(.*?)\s*\{\s*([^{}]+?)\s*\}\s*$/.exec(s);
  if (!m) return { rest: s };
  const clause = (m[2] ?? '').trim();
  const rest = (m[1] ?? '').trim();
  const domain: ParsedDomain = {};
  // Two-sided: a <= x <= b (any mix of strict/inclusive).
  const two = /^(-?\d+(?:\.\d+)?)\s*(<=|<)\s*x\s*(<=|<)\s*(-?\d+(?:\.\d+)?)$/.exec(clause);
  if (two) {
    domain.min = Number(two[1]);
    domain.minClosed = two[2] === '<=';
    domain.max = Number(two[4]);
    domain.maxClosed = two[3] === '<=';
    return { rest, domain };
  }
  // One-sided: x >= a / x < b / a <= x / b > x.
  const one = /^(?:x\s*(>=|>|<=|<)\s*(-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)\s*(>=|>|<=|<)\s*x)$/.exec(clause);
  if (one) {
    const op = (one[1] ?? flipOp(one[4] ?? '')) as string;
    const val = Number(one[2] ?? one[3]);
    if (op === '>=' || op === '>') {
      domain.min = val;
      domain.minClosed = op === '>=';
    } else {
      domain.max = val;
      domain.maxClosed = op === '<=';
    }
    return { rest, domain };
  }
  // Unrecognized clause → let the caller fail on the whole string rather than
  // silently ignoring a restriction the teacher typed.
  return { rest: s };
}

function flipOp(op: string): string {
  switch (op) {
    case '>': return '<';
    case '<': return '>';
    case '>=': return '<=';
    case '<=': return '>=';
    default: return op;
  }
}

/** Render a ParsedDomain back to the ` for …` clause the parsers accept. */
export function formatDomainClause(domain?: ParsedDomain): string {
  if (!domain) return '';
  const hasMin = domain.min !== undefined;
  const hasMax = domain.max !== undefined;
  if (hasMin && hasMax) {
    const lo = domain.minClosed === false ? '<' : '<=';
    const hi = domain.maxClosed === false ? '<' : '<=';
    return ` for ${domain.min} ${lo} x ${hi} ${domain.max}`;
  }
  if (hasMin) return ` for x ${domain.minClosed === false ? '>' : '>='} ${domain.min}`;
  if (hasMax) return ` for x ${domain.maxClosed === false ? '<' : '<='} ${domain.max}`;
  return '';
}

// ---- Half-plane fill geometry (shared by every board fill site) ---------------
// One closed outline against the window edges, so above/below/left/right all
// render the same way for every boundary shape — no reliance on JSXGraph's
// inequality-element orientation rules. NaN samples (asymptotes, out-of-domain)
// snap to the shaded edge, collapsing those columns to zero height — a
// domain-restricted boundary shades only where it's defined.
export interface WindowBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function halfPlaneOutline(
  side: ShadeSide,
  box: WindowBox,
  boundary: { fn?: (x: number) => number; x?: number },
  samples = 120,
): { xs: number[]; ys: number[] } {
  if (side === 'left' || side === 'right') {
    const k = boundary.x ?? NaN;
    if (!Number.isFinite(k)) return { xs: [], ys: [] };
    const edge = side === 'right' ? box.xMax : box.xMin;
    return {
      xs: [k, k, edge, edge, k],
      ys: [box.yMin, box.yMax, box.yMax, box.yMin, box.yMin],
    };
  }
  const fn = boundary.fn;
  if (!fn) return { xs: [], ys: [] };
  const edge = side === 'above' ? box.yMax : box.yMin;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = box.xMin + ((box.xMax - box.xMin) * i) / samples;
    const y = fn(x);
    xs.push(x);
    ys.push(Number.isFinite(y) ? Math.min(box.yMax, Math.max(box.yMin, y)) : edge);
  }
  // Close the region against the window edge.
  xs.push(box.xMax, box.xMin, xs[0]!);
  ys.push(edge, edge, ys[0]!);
  return { xs, ys };
}

/** Does x fall inside the domain? An absent bound is unbounded on that side. */
export function inDomain(x: number, domain: ParsedDomain): boolean {
  if (domain.min !== undefined && (domain.minClosed === false ? x <= domain.min : x < domain.min)) {
    return false;
  }
  if (domain.max !== undefined && (domain.maxClosed === false ? x >= domain.max : x > domain.max)) {
    return false;
  }
  return true;
}
