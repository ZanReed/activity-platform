// =============================================================================
// formula.ts — the freeform teacher command line (Drop 3)
// -----------------------------------------------------------------------------
// One parser for everything a teacher can type as a graph answer, regardless of
// format: `y = 2x + 3`, `2x + 3y = 6`, `y - 5 = 2(x - 1)`, `x^2 - 4`,
// `y = 2*3^x`, `y = 1 + 2ln(x)`, `x = 4`, `y > 2x + 1`, `(2, 3), (4, 5)`,
// with an optional domain clause (`… for x >= 0`, `… for -2 < x <= 5`).
//
// Strategy: numeric, not symbolic. compileFunction (math.js behind the
// calculator's normalizer) turns each side into a callable; an equation
// LHS = RHS becomes g(x, y) = LHS − RHS, solved for y numerically wherever g is
// LINEAR in y (which every school form is); the resulting f(x) is SAMPLED and
// each supported family's regression fit is tried in simplest-first order —
// whichever reproduces f exactly is the family, and the fit IS the parameters.
// No format grammar to maintain: anything math.js can read, this can classify.
//
// Consumers: the editor's answer field (Drop 3), inequality authoring (Drop 4),
// and the markdown ```graph importer (Drop 7). Errors are teacher-safe strings.
// =============================================================================

import { compileFunction } from './evaluate.js';
import {
  fitLinear,
  fitQuadratic,
  fitExponential,
  fitLogarithmic,
  type DataPoint,
  type FitOutcome,
} from './regression.js';
import type { FunctionModel } from './graph-score.js';

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

export type ParsedFormula =
  | { kind: 'function'; model: FunctionModel; domain?: ParsedDomain }
  | { kind: 'inequality'; boundary: FunctionModel; strict: boolean; side: ShadeSide }
  | { kind: 'points'; points: [number, number][] }
  | { kind: 'error'; message: string };

const DEFAULT_TOL = 0.1;

// ---- Input normalization ------------------------------------------------------
// Teachers paste from anywhere: word processors smuggle unicode operators in.
function preprocess(raw: string): string {
  return raw
    .replace(/[·×]/g, '*')
    .replace(/−/g, '-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .trim();
}

const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

// ---- Point lists ----------------------------------------------------------------
// `(2, 3)` or `(2, 3), (4, 5)` — plain numeric pairs (answer keys are concrete
// coordinates; expressions inside points stay a calculator-only feature).
const POINT_RE = /\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g;

export function parsePointList(raw: string): [number, number][] | null {
  const s = preprocess(raw);
  const points: [number, number][] = [];
  let m: RegExpExecArray | null;
  POINT_RE.lastIndex = 0;
  while ((m = POINT_RE.exec(s)) !== null) {
    points.push([Number(m[1]), Number(m[2])]);
  }
  // Reject when there's leftover non-separator text (a typo shouldn't silently
  // drop half the answer).
  const leftover = s.replace(POINT_RE, '').replace(/[,\s]/g, '');
  if (points.length === 0 || leftover !== '') return null;
  return points;
}

// ---- Domain clause ---------------------------------------------------------------
// Strips a trailing `for …` restriction and parses it. Accepted forms:
//   for x >= 0     for x < 5     for -2 <= x < 5     for 0 < x
function extractDomain(s: string): { rest: string; domain?: ParsedDomain } {
  const m = /^(.*?)(?:,)?\s+for\s+(.+)$/i.exec(s);
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

// ---- Equation → f(x) --------------------------------------------------------------
// g(x, y) = LHS − RHS. Wherever g is linear in y, y(x) = −g(x,0) / (g(x,1) − g(x,0)).

type G = (x: number, y: number) => number;

function compileSides(lhs: string, rhs: string): G | null {
  const gl = compileFunction(lhs);
  const gr = compileFunction(rhs);
  if (!gl || !gr) return null;
  return (x, y) => gl(x, { y }) - gr(x, { y });
}

const SAMPLE_XS = [-4, -2.5, -1, -0.5, 0, 0.5, 1, 2, 3.5, 5];
const POSITIVE_XS = [0.25, 0.5, 1, 2, 3, 4.5, 6, 8];

// Reduce g to y = f(x), or detect an x-only equation (→ vertical line x = k),
// or fail with a teacher-safe message.
function solveForY(
  g: G,
): { kind: 'fn'; fn: (x: number) => number } | { kind: 'vertical'; x: number } | { kind: 'error'; message: string } {
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

// ---- f(x) → family + parameters -----------------------------------------------------
// Sample f, then try each family's regression fit simplest-first; the first fit
// that reproduces f (max residual under a relative epsilon, checked at every
// finite sample) wins, and its coefficients are the model parameters.

function sample(fn: (x: number) => number, xs: number[]): DataPoint[] {
  const pts: DataPoint[] = [];
  for (const x of xs) {
    const y = fn(x);
    if (Number.isFinite(y)) pts.push({ x, y });
  }
  return pts;
}

function residualOk(fn: (x: number) => number, out: FitOutcome, pts: DataPoint[]): boolean {
  if (!out.ok) return false;
  let scale = 1;
  for (const p of pts) scale = Math.max(scale, Math.abs(p.y));
  for (const p of pts) {
    if (Math.abs(out.predict(p.x) - fn(p.x)) > 1e-6 * scale) return false;
  }
  return true;
}

function detectFamily(fn: (x: number) => number): FunctionModel | null {
  let pts = sample(fn, SAMPLE_XS);
  // Functions defined only for x > 0 (logarithms, roots) sample there instead.
  if (pts.length < 4) pts = sample(fn, POSITIVE_XS);
  if (pts.length < 4) return null;

  const linear = fitLinear(pts);
  if (residualOk(fn, linear, pts) && linear.ok && linear.fit.model === 'linear') {
    return {
      family: 'linear',
      slope: round6(linear.fit.a),
      intercept: round6(linear.fit.b),
      slopeTolerance: DEFAULT_TOL,
      interceptTolerance: DEFAULT_TOL,
    };
  }
  const quad = fitQuadratic(pts);
  if (residualOk(fn, quad, pts) && quad.ok && quad.fit.model === 'quadratic') {
    return {
      family: 'quadratic',
      a: round6(quad.fit.a),
      b: round6(quad.fit.b),
      c: round6(quad.fit.c),
      aTolerance: DEFAULT_TOL,
      bTolerance: DEFAULT_TOL,
      cTolerance: DEFAULT_TOL,
    };
  }
  const exp = fitExponential(pts);
  if (residualOk(fn, exp, pts) && exp.ok && exp.fit.model === 'exponential') {
    return {
      family: 'exponential',
      a: round6(exp.fit.a),
      b: round6(exp.fit.b),
      aTolerance: DEFAULT_TOL,
      bTolerance: DEFAULT_TOL,
    };
  }
  const logPts = sample(fn, POSITIVE_XS);
  if (logPts.length >= 4) {
    const log = fitLogarithmic(logPts);
    if (residualOk(fn, log, logPts) && log.ok && log.fit.model === 'logarithmic') {
      return {
        family: 'logarithmic',
        a: round6(log.fit.a),
        b: round6(log.fit.b),
        aTolerance: DEFAULT_TOL,
        bTolerance: DEFAULT_TOL,
      };
    }
  }
  return null;
}

const UNSUPPORTED_MSG =
  'Supported answer curves: linear, quadratic, exponential, logarithmic, and vertical lines. ' +
  'For anything else, use a Display graph — it can plot any formula.';

// ---- The entry point -----------------------------------------------------------------

/**
 * Parse one freeform teacher input into a graph answer. Handles equations in any
 * rearrangement, bare expressions in x, vertical lines, inequalities (boundary +
 * strict + shaded side), coordinate lists, and a trailing `for …` domain clause.
 */
export function parseGraphFormula(raw: string): ParsedFormula {
  const pre = preprocess(raw);
  if (!pre) return { kind: 'error', message: 'Type an equation, like y = 2x + 3' };

  // Coordinate list?
  if (pre.startsWith('(')) {
    const points = parsePointList(pre);
    if (points) return { kind: 'points', points };
  }

  const { rest, domain } = extractDomain(pre);

  // Inequality? Exactly one top-level comparison operator.
  const ineq = /(<=|>=|<|>)/.exec(rest);
  if (ineq) {
    const op = ineq[1]!;
    const lhs = rest.slice(0, ineq.index).trim();
    const rhs = rest.slice(ineq.index + op.length).trim();
    if (/[<>]/.test(lhs) || /[<>]/.test(rhs)) {
      return { kind: 'error', message: 'Use a single inequality, like y > 2x + 1' };
    }
    const g = compileSides(lhs, rhs);
    if (!g) return { kind: 'error', message: "That inequality can't be read" };
    const solved = solveForY(g);
    const strict = op === '<' || op === '>';
    if (solved.kind === 'vertical') {
      // x-only boundary: which x-side satisfies `LHS op RHS`? Probe one step right.
      const wantPositive = op === '>' || op === '>=';
      const probe = g(solved.x + 1, 0);
      const side: ShadeSide = (probe > 0) === wantPositive ? 'right' : 'left';
      return {
        kind: 'inequality',
        boundary: { family: 'vertical', x: solved.x, xTolerance: DEFAULT_TOL },
        strict,
        side,
      };
    }
    if (solved.kind === 'error') return { kind: 'error', message: solved.message };
    const model = detectFamily(solved.fn);
    if (!model) return { kind: 'error', message: UNSUPPORTED_MSG };
    // Which y-side satisfies the inequality? Probe a point one unit above the
    // boundary at some x where it's defined.
    const x0 = Number.isFinite(solved.fn(1)) ? 1 : 2;
    const wantPositive = op === '>' || op === '>=';
    const probe = g(x0, solved.fn(x0) + 1);
    const side: ShadeSide = (probe > 0) === wantPositive ? 'above' : 'below';
    return { kind: 'inequality', boundary: model, strict, side };
  }

  // Equation or bare expression.
  const eq = rest.indexOf('=');
  let solved: ReturnType<typeof solveForY>;
  if (eq !== -1) {
    const g = compileSides(rest.slice(0, eq).trim(), rest.slice(eq + 1).trim());
    if (!g) return { kind: 'error', message: "That equation can't be read" };
    solved = solveForY(g);
  } else {
    // Bare expression in x (`x^2 - 4`) — implicit y =.
    const fn = compileFunction(rest);
    if (!fn) return { kind: 'error', message: "That expression can't be read" };
    solved = { kind: 'fn', fn: (x) => fn(x) };
  }

  if (solved.kind === 'vertical') {
    return {
      kind: 'function',
      model: { family: 'vertical', x: solved.x, xTolerance: DEFAULT_TOL },
      ...(domain && { domain }),
    };
  }
  if (solved.kind === 'error') return { kind: 'error', message: solved.message };
  const model = detectFamily(solved.fn);
  if (!model) return { kind: 'error', message: UNSUPPORTED_MSG };
  return { kind: 'function', model, ...(domain && { domain }) };
}

// ---- Canonical display strings --------------------------------------------------------
// What the answer field shows after a parse or a handle drag. Deliberately
// REPARSEABLE by parseGraphFormula (ASCII operators), so the round trip is
// type → parse → format → parse with no drift.

const fmt = (n: number): string => String(Number.parseFloat(n.toPrecision(6)));

// A signed continuation term: `+ 3` / `- 3` (with a leading space).
function term(n: number, suffix = ''): string {
  if (n === 0) return '';
  const sign = n < 0 ? ' - ' : ' + ';
  return `${sign}${fmt(Math.abs(n))}${suffix}`;
}

// A leading coefficient: `2x`, `x`, `-x`, `0` handled by callers.
function coeff(n: number, suffix: string): string {
  if (n === 1) return suffix;
  if (n === -1) return `-${suffix}`;
  return `${fmt(n)}${suffix}`;
}

export function formatModel(model: FunctionModel): string {
  switch (model.family) {
    case 'linear':
      if (model.slope === 0) return `y = ${fmt(model.intercept)}`;
      return `y = ${coeff(model.slope, 'x')}${term(model.intercept)}`;
    case 'quadratic': {
      let s = `y = ${coeff(model.a, 'x^2')}`;
      if (model.b !== 0) {
        const sign = model.b < 0 ? ' - ' : ' + ';
        const mag = Math.abs(model.b);
        s += `${sign}${mag === 1 ? 'x' : `${fmt(mag)}x`}`;
      }
      if (model.c !== 0) s += term(model.c);
      return s;
    }
    case 'exponential':
      return `y = ${fmt(model.a)}*${fmt(model.b)}^x`;
    case 'logarithmic':
      if (model.a === 0) return `y = ${coeff(model.b, 'ln(x)')}`;
      return `y = ${fmt(model.a)}${term(model.b, 'ln(x)')}`;
    case 'vertical':
      return `x = ${fmt(model.x)}`;
  }
}

export function formatPoints(points: [number, number][]): string {
  return points.map(([x, y]) => `(${fmt(x)}, ${fmt(y)})`).join(', ');
}
