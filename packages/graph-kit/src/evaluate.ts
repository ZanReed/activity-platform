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

import {
  create,
  evaluateDependencies,
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

// math.js instance: the parser + arithmetic operators only. Every named
// function and constant is provided by us (below) so we own angle mode, the
// ln/log10 naming, and the restriction gates.
// The cast works around a loose mathjs typing: the modular `mathjs/number`
// `*Dependencies` exports are declared `FactoryFunctionMap | undefined`, which
// create() rejects even though they are always defined at runtime.
const math = create({
  evaluateDependencies,
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
  },
  { override: true },
);

/** Rewrite MathLive AsciiMath into a math.js-parseable expression. Lexical only. */
export function normalizeAsciiMath(ascii: string): string {
  let s = ascii;
  // Inverse trig BEFORE generic cleanup: sin ^(-1)( -> asin(
  s = s.replace(/\b(sin|cos|tan)\s*\^\s*\(\s*-1\s*\)/g, (_m, f) => 'a' + f);
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
  s = s.replace(
    /\b(sin|cos|tan|asin|acos|atan|ln|log|sqrt|abs|exp|nthRoot|logBase)\s+\(/g,
    '$1(',
  );
  // function name + space + a bare number/constant -> wrap in parens (\sin 30)
  s = s.replace(
    /\b(sin|cos|tan|asin|acos|atan|ln|log|sqrt|abs|exp)\s+(\d+(?:\.\d+)?|pi|e)\b/g,
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
