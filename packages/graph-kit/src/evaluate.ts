// =============================================================================
// evaluate.ts — the calculator's evaluation seam
// -----------------------------------------------------------------------------
// Takes the AsciiMath string a MathLive math-field produces (getValue
// ('ascii-math')) and returns a number. math.js does the hard part — operator
// precedence, implicit multiplication, parentheses, unary minus, number parsing
// — behind a single `evaluate()` function so the engine can be swapped (the
// locked decision: math.js number-only now; Compute Engine is the documented
// escape hatch if this glue ever proves leaky — see docs/design/calculator-tool.md).
//
// Why a normalizer: MathLive's AsciiMath is close to math.js syntax but not
// identical. Empirically (mathlive 0.109, via convertLatexToAsciiMath):
//   \times,\cdot -> ' * '   \div -> ' -: '   \frac{a}{b} -> (a)/(b)
//   \sqrt{x} -> sqrt(x)      \sqrt[3]{x} -> root(3)(x)   x^{n} -> x^(n)
//   \sin(x) -> sin (x)       \sin x -> sin x   \pi -> pi   |x| -> |x|
//   \sin^{-1}(x) -> sin ^(-1)(x)   \log_{2}(x) -> log _2(x)
// normalizeAsciiMath() rewrites those forms into math.js syntax; it is lexical
// (regex), NOT a parser — the parsing stays math.js's job.
//
// Angle mode + restriction flags are applied by providing our OWN trig / log /
// exp functions to the math.js instance (so we control degrees-vs-radians, the
// ln-vs-log10 naming math.js gets wrong by default, and the allowTrig /
// allowLogExp gates). They read module-level state set synchronously per call —
// safe because evaluate() is synchronous and single-threaded.
// =============================================================================

import { extractDomain, type ParsedDomain } from './solve.js';
import {
  create,
  evaluateDependencies,
  compileDependencies,
  addDependencies,
  subtractDependencies,
  multiplyDependencies,
  divideDependencies,
  powDependencies,
  unaryMinusDependencies,
  unaryPlusDependencies,
  modDependencies,
} from 'mathjs/number';

export interface EvalOptions {
  /** 'deg' interprets trig arguments as degrees; default 'rad'. */
  angleMode?: 'deg' | 'rad';
  /** When false, trig functions throw a friendly error; default true. */
  allowTrig?: boolean;
  /** When false, log/ln/exp throw a friendly error; default true. */
  allowLogExp?: boolean;
  /**
   * When false, an inequality row classifies as a friendly error instead of a
   * shaded plot; default true. Classification-only — evaluate() never sees a
   * comparison operator (rows are split at the operator before evaluation).
   */
  allowInequalities?: boolean;
}

export type EvalResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

// A gate/usage error whose message is safe to show the student verbatim (e.g.
// "Trig is turned off"). Anything that is NOT a CalcError is treated as a parse
// failure and surfaced as a generic message.
class CalcError extends Error {}

// ---- Per-call state, read by the custom functions below ----------------------
let mode: 'deg' | 'rad' = 'rad';
let allowTrig = true;
let allowLogExp = true;

const DEG_PER_RAD = Math.PI / 180;
const toRad = (x: number): number => (mode === 'deg' ? x * DEG_PER_RAD : x);
const fromRad = (x: number): number => (mode === 'deg' ? x / DEG_PER_RAD : x);

const trigGate = (): void => {
  if (!allowTrig) throw new CalcError('Trig functions are turned off here');
};
const logExpGate = (): void => {
  if (!allowLogExp) throw new CalcError('Log/exp functions are turned off here');
};

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new CalcError('Factorial needs a whole number ≥ 0');
  }
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

// nPr / nCr share the "whole numbers, r ≤ n" contract; computed multiplicatively
// (not via factorial quotients) so nCr(1000, 3) doesn't overflow on the way.
function countArgs(n: number, r: number): void {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
    throw new CalcError('nPr and nCr need whole numbers with r ≤ n');
  }
}
function nPr(n: number, r: number): number {
  countArgs(n, r);
  let out = 1;
  for (let k = n - r + 1; k <= n; k++) out *= k;
  return out;
}
function nCr(n: number, r: number): number {
  countArgs(n, r);
  const s = Math.min(r, n - r);
  let out = 1;
  for (let k = 1; k <= s; k++) out = (out * (n - s + k)) / k;
  return Math.round(out);
}

function spread(name: string, xs: number[]): number[] {
  if (xs.length === 0) throw new CalcError(`${name} needs at least one number`);
  return xs;
}

// math.js instance: the parser + arithmetic operators only. Every named
// function and constant is provided by us (below) so we own angle mode, the
// ln/log10 naming, and the restriction gates.
// The cast works around a loose mathjs typing: the modular `mathjs/number`
// `*Dependencies` exports are declared `FactoryFunctionMap | undefined`, which
// create() rejects even though they are always defined at runtime.
const math = create({
  evaluateDependencies,
  compileDependencies,
  addDependencies,
  subtractDependencies,
  multiplyDependencies,
  divideDependencies,
  powDependencies,
  unaryMinusDependencies,
  unaryPlusDependencies,
  modDependencies,
} as Parameters<typeof create>[0]);

math.import(
  {
    pi: Math.PI,
    e: Math.E,
    sin: (x: number) => (trigGate(), Math.sin(toRad(x))),
    cos: (x: number) => (trigGate(), Math.cos(toRad(x))),
    tan: (x: number) => (trigGate(), Math.tan(toRad(x))),
    asin: (x: number) => (trigGate(), fromRad(Math.asin(x))),
    acos: (x: number) => (trigGate(), fromRad(Math.acos(x))),
    atan: (x: number) => (trigGate(), fromRad(Math.atan(x))),
    ln: (x: number) => (logExpGate(), Math.log(x)),
    log: (x: number) => (logExpGate(), Math.log10(x)), // base-10 (math.js's log is natural)
    logBase: (x: number, b: number) => (logExpGate(), Math.log(x) / Math.log(b)),
    exp: (x: number) => (logExpGate(), Math.exp(x)),
    sqrt: (x: number) => Math.sqrt(x),
    nthRoot: (x: number, n: number) =>
      x < 0 && n % 2 !== 0 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n),
    abs: (x: number) => Math.abs(x),
    factorial,
    // Reciprocal trig rides the trig gate + angle mode like sin/cos/tan. The
    // inverses use the school-convention ranges (acot in (0, π)).
    sec: (x: number) => (trigGate(), 1 / Math.cos(toRad(x))),
    csc: (x: number) => (trigGate(), 1 / Math.sin(toRad(x))),
    cot: (x: number) => (trigGate(), 1 / Math.tan(toRad(x))),
    asec: (x: number) => (trigGate(), fromRad(Math.acos(1 / x))),
    acsc: (x: number) => (trigGate(), fromRad(Math.asin(1 / x))),
    acot: (x: number) => (trigGate(), fromRad(Math.PI / 2 - Math.atan(x))),
    // Hyperbolics sit behind the trig gate too (a teacher untoggling "trig"
    // expects the whole family gone) but take REAL arguments — never
    // angle-converted (author call, calculator-parity design pass item 3).
    sinh: (x: number) => (trigGate(), Math.sinh(x)),
    cosh: (x: number) => (trigGate(), Math.cosh(x)),
    tanh: (x: number) => (trigGate(), Math.tanh(x)),
    asinh: (x: number) => (trigGate(), Math.asinh(x)),
    acosh: (x: number) => (trigGate(), Math.acosh(x)),
    atanh: (x: number) => (trigGate(), Math.atanh(x)),
    // Rounding / integer helpers — ungated. round takes an optional digit count.
    floor: (x: number) => Math.floor(x),
    ceil: (x: number) => Math.ceil(x),
    round: (x: number, digits = 0) => {
      const p = Math.pow(10, digits);
      return Math.round(x * p) / p;
    },
    sign: (x: number) => Math.sign(x),
    // Counting + aggregates — ungated. min/max/mean are variadic.
    nPr,
    nCr,
    min: (...xs: number[]) => Math.min(...spread('min', xs)),
    max: (...xs: number[]) => Math.max(...spread('max', xs)),
    mean: (...xs: number[]) =>
      spread('mean', xs).reduce((s, v) => s + v, 0) / xs.length,
  },
  { override: true },
);

// MathLive serializes multi-letter identifiers it doesn't know as SPACED
// letters — a student typing floor(2.7) yields "f l o o r(2.7)", nCr(5,2)
// yields "n C r(5,2)". Followed by an argument list, the student clearly meant
// the function, so reassemble our provided names. (sin/sec/sinh etc. are
// MathLive-native and never arrive spaced.) \s* also matches the unspaced
// spelling, so pasted plain text reassembles to itself harmlessly.
const SPACED_FN_RES = [
  'asinh', 'acosh', 'atanh',
  'asec', 'acsc', 'acot',
  'floor', 'ceil', 'round', 'sign',
  'mean', 'min', 'max',
  'nPr', 'nCr',
].map((name) => ({
  name,
  // Letter-boundary lookarounds, not \b: MathLive omits the space between a
  // digit and a letter ("2f l o o r(…)"), where \b would fail to anchor.
  re: new RegExp(
    '(?<![a-zA-Z])' + name.split('').join('\\s*') + '\\s*(?=\\()',
    'g',
  ),
}));

/** Rewrite MathLive AsciiMath into a math.js-parseable expression. Lexical only. */
export function normalizeAsciiMath(ascii: string): string {
  let s = ascii;
  // Unicode comparison operators (word-processor paste, some keycap paths).
  // Harmless for evaluation — a row is split at its operator before math.js
  // ever sees it; whole-string evaluation of a comparison fails either way.
  s = s.replace(/≤/g, '<=').replace(/≥/g, '>=');
  // Reassemble spaced-letter function names (see SPACED_FN_RES), plus `mod`
  // anywhere — it's also the infix operator (10 mod 3), so no lookahead; the
  // replacement re-pads it so "10m o d3" parses.
  for (const { name, re } of SPACED_FN_RES) s = s.replace(re, name);
  s = s.replace(/(?<![a-zA-Z])m\s*o\s*d(?![a-zA-Z])/g, ' mod ');
  // Inverse trig/hyperbolic BEFORE generic cleanup: sin ^(-1)( -> asin(
  s = s.replace(
    /\b(sinh|cosh|tanh|sin|cos|tan|sec|csc|cot)\s*\^\s*\(\s*-1\s*\)/g,
    (_m, f) => 'a' + f,
  );
  // Log base: log _b( ... ) -> logBase(..., b)
  s = s.replace(
    /\blog\s*_\s*(\d+(?:\.\d+)?)\s*\(([^()]*)\)/g,
    'logBase($2,$1)',
  );
  // Nth root: root(n)(x) -> nthRoot(x, n)
  s = s.replace(/\broot\((\d+(?:\.\d+)?)\)\(([^()]*)\)/g, 'nthRoot($2,$1)');
  // AsciiMath operator dialect
  s = s.replace(/-:/g, '/').replace(/\bxx\b/g, '*').replace(/\*\*/g, '^');
  // |x| -> abs(x)  (single level; nested absolute values are out of scope)
  s = s.replace(/\|([^|]+)\|/g, 'abs($1)');
  // function name followed by space(s) then '(' -> drop the space
  // (longer names alongside their prefixes are safe: the alternation backtracks
  // until the \s+\( actually follows, so `sinh (` matches sinh, not sin)
  s = s.replace(
    /\b(asinh|acosh|atanh|sinh|cosh|tanh|asin|acos|atan|asec|acsc|acot|sin|cos|tan|sec|csc|cot|ln|log|sqrt|abs|exp|nthRoot|logBase|floor|ceil|round|sign|nPr|nCr|min|max|mean|mod)\s+\(/g,
    '$1(',
  );
  // function name + space + a bare number/constant -> wrap in parens (\sin 30)
  s = s.replace(
    /\b(asinh|acosh|atanh|sinh|cosh|tanh|asin|acos|atan|asec|acsc|acot|sin|cos|tan|sec|csc|cot|ln|log|sqrt|abs|exp|floor|ceil|round|sign)\s+(\d+(?:\.\d+)?|pi|e)\b/g,
    '$1($2)',
  );
  return s.trim();
}

/** Evaluate an AsciiMath string to a number, honoring angle mode + restrictions. */
export function evaluate(ascii: string, opts: EvalOptions = {}): EvalResult {
  mode = opts.angleMode ?? 'rad';
  allowTrig = opts.allowTrig ?? true;
  allowLogExp = opts.allowLogExp ?? true;

  const expr = normalizeAsciiMath(ascii);
  if (!expr) return { ok: false, error: '' }; // empty input — no result, no error

  let value: unknown;
  try {
    value = math.evaluate(expr);
  } catch (err) {
    // CalcError messages are author/student-safe; everything else is a parse
    // failure we don't want to leak math.js internals for.
    if (err instanceof CalcError) return { ok: false, error: err.message };
    return { ok: false, error: "That expression can't be evaluated" };
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ok: false, error: 'Result is undefined' };
  }
  return { ok: true, value };
}

/**
 * Compile an AsciiMath expression in the variable `x` into a plain
 * `(x) => number` for plotting (graphing mode). Returns null if the expression
 * is empty or doesn't parse. The returned function yields NaN for any x where
 * evaluation fails or is non-finite (asymptotes, out-of-domain), which the board
 * layer renders as a break in the curve. Angle mode + restriction gates are
 * captured from opts and applied on every call.
 */
export function compileFunction(
  ascii: string,
  opts: EvalOptions = {},
): ((x: number, vars?: Record<string, number>) => number) | null {
  const expr = normalizeAsciiMath(ascii);
  if (!expr) return null;
  let compiled: { evaluate(scope: Record<string, unknown>): unknown };
  try {
    compiled = math.compile(expr);
  } catch {
    return null;
  }
  const m = opts.angleMode ?? 'rad';
  const at = opts.allowTrig ?? true;
  const ale = opts.allowLogExp ?? true;
  // One scratch scope per compiled function, reused across calls: JSXGraph
  // samples curves hundreds of times per update, and slider drags update
  // continuously — per-sample object allocation is the hot path to avoid.
  // (Stale keys from removed sliders linger harmlessly: unused scope entries.)
  const scratch: Record<string, number> = { x: 0 };
  return (xVal: number, vars?: Record<string, number>): number => {
    mode = m;
    allowTrig = at;
    allowLogExp = ale;
    if (vars) Object.assign(scratch, vars);
    scratch.x = xVal;
    try {
      const v = compiled.evaluate(scratch);
      return typeof v === 'number' && Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  };
}

// ---- Stage 4: expression-row classification ----------------------------------
// The multi-expression list accepts more than y = f(x): a `(a, b)` row plots a
// point; a `a = 3` row defines a slider variable other rows can reference.
// classifyExpression() decides which shape a row is, on the NORMALIZED string,
// so the list UI stays dumb. Point coordinates compile like functions (minus
// the x), so `(a, 2a)` tracks its slider.

export type ExpressionRow =
  | { kind: 'empty' }
  | { kind: 'slider'; name: string; value: number }
  | {
      kind: 'point';
      px: (vars?: Record<string, number>) => number;
      py: (vars?: Record<string, number>) => number;
    }
  | {
      kind: 'function';
      fn: (x: number, vars?: Record<string, number>) => number;
      /** A `for x >= 0` / `{x >= 0}` clause — the board clips to it. */
      domain?: ParsedDomain;
    }
  // An inequality row carries g(x, y) = LHS − RHS COMPILED but not yet solved:
  // slider values only exist at plot time, so the expression list runs the
  // solve-for-y + side probe per rebuild with the live scope (solve.ts).
  | {
      kind: 'inequality';
      g: (x: number, y: number, vars?: Record<string, number>) => number;
      op: '<' | '<=' | '>' | '>=';
      domain?: ParsedDomain;
    }
  // A no-variable expression (2+3, sin(30)) — shown as "= value", not plotted.
  // Desmos-style: `y = 5` is still a function (a horizontal line); a bare
  // constant is a calculation.
  | { kind: 'calculation'; value: number }
  | { kind: 'error'; message: string };

// Split `inner` at its single top-level comma (depth-0 with respect to
// parentheses). Returns null when there isn't exactly one.
function splitTopLevelComma(inner: string): [string, string] | null {
  let depth = 0;
  let at = -1;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      if (at !== -1) return null; // two top-level commas — not a point
      at = i;
    }
  }
  if (at === -1) return null;
  return [inner.slice(0, at), inner.slice(at + 1)];
}

// True when the whole string is one balanced (...) group — i.e. the depth
// first returns to 0 at the final character.
function isSingleParenGroup(s: string): boolean {
  if (!s.startsWith('(') || !s.endsWith(')')) return false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i === s.length - 1;
    }
  }
  return false;
}

export function classifyExpression(
  ascii: string,
  opts: EvalOptions = {},
): ExpressionRow {
  let expr = normalizeAsciiMath(ascii);
  if (!expr) return { kind: 'empty' };

  // Per-row domain restriction (`… for x >= 0` / `… {x >= 0}`) comes off
  // first — the clause's comparison operator must not read as an inequality.
  const { rest, domain } = extractDomain(expr);
  expr = rest;

  // Inequality row: exactly one top-level comparison operator. Detected before
  // the `y =` strip (`y >= 2x` must not half-match function notation).
  const ineq = /(<=|>=|<|>)/.exec(expr);
  if (ineq) {
    if (opts.allowInequalities === false) {
      return { kind: 'error', message: 'Inequalities are turned off here' };
    }
    const op = ineq[1] as '<' | '<=' | '>' | '>=';
    const lhs = expr.slice(0, ineq.index).trim();
    const rhs = expr.slice(ineq.index + op.length).trim();
    if (/[<>]/.test(lhs) || /[<>]/.test(rhs)) {
      return { kind: 'error', message: 'Use a single inequality, like y > 2x + 1' };
    }
    const gl = lhs ? compileFunction(lhs, opts) : null;
    const gr = rhs ? compileFunction(rhs, opts) : null;
    if (!gl || !gr) {
      return { kind: 'error', message: "That inequality can't be read" };
    }
    // One scratch object reused per call — the half-plane fill re-samples g
    // continuously during pan/zoom/slider drags, same hot path as
    // compileFunction's own scratch. (Stale keys linger harmlessly.)
    const scratch: Record<string, number> = {};
    const g = (x: number, y: number, vars?: Record<string, number>): number => {
      if (vars) Object.assign(scratch, vars);
      scratch.y = y;
      return gl(x, scratch) - gr(x, scratch);
    };
    return { kind: 'inequality', g, op, ...(domain && { domain }) };
  }

  // `y = …` is just function notation — strip and fall through.
  const yDef = /^y\s*=\s*(.*)$/.exec(expr);
  if (yDef) {
    expr = (yDef[1] ?? '').trim();
    if (!expr) return { kind: 'empty' };
  } else {
    // Slider: single lowercase letter (not x — the plot variable; not y —
    // that's function notation; not e — the constant) equals a CONSTANT
    // expression (2pi fine; other slider names not, v1).
    const slider = /^([a-df-wz])\s*=\s*(.+)$/.exec(expr);
    if (slider) {
      if (domain) return domainMisuse();
      const name = slider[1] ?? '';
      const r = evaluate(slider[2] ?? '', opts);
      if (!r.ok) {
        return {
          kind: 'error',
          message: r.error || `${name} needs a number (like ${name} = 2)`,
        };
      }
      return { kind: 'slider', name, value: r.value };
    }

    // Point: exactly `(expr, expr)` as one group with one top-level comma.
    if (isSingleParenGroup(expr)) {
      const parts = splitTopLevelComma(expr.slice(1, -1));
      if (parts) {
        if (domain) return domainMisuse();
        const px = compileFunction(parts[0], opts);
        const py = compileFunction(parts[1], opts);
        if (!px || !py) {
          return { kind: 'error', message: "That point can't be read" };
        }
        // Reuse the (x, vars) shape with a dummy x = 0; a coordinate that
        // mentions x evaluates x as 0 rather than erroring (harmless, rare).
        return {
          kind: 'point',
          px: (vars) => px(0, vars),
          py: (vars) => py(0, vars),
        };
      }
    }

    // Calculation: a no-variable expression (2+3, sin(30)) evaluates to a plain
    // number here — evaluate() has no x/slider scope, so anything with a
    // variable throws and falls through to a function/plot instead.
    const calc = evaluate(expr, opts);
    if (calc.ok) {
      if (domain) return domainMisuse();
      return { kind: 'calculation', value: calc.value };
    }
  }

  const fn = compileFunction(expr, opts);
  if (!fn) return { kind: 'error', message: "That expression can't be plotted" };
  return { kind: 'function', fn, ...(domain && { domain }) };
}

// A `for …` clause on a row that isn't a graphed equation (slider, point,
// plain calculation) — surface it rather than silently dropping the
// restriction the student typed.
function domainMisuse(): ExpressionRow {
  return {
    kind: 'error',
    message: "A restriction like 'for x >= 0' only works on a graphed equation",
  };
}
