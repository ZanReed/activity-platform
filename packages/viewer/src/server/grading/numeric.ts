// =============================================================================
// grading/numeric.ts — the numeric answer parser (parity port)
// -----------------------------------------------------------------------------
// A faithful port of runtime/strategies.ts `parseNumericValue`. The accepted
// forms are not arbitrary — they are what students actually type in a math
// class, and each one is load-bearing:
//
//   "3", "-2.5", ".75", "+4"      plain decimals (optional sign, bare dot ok)
//   "1e3", "2.5E-2"               scientific notation
//   "3/4", "-3/4", "1.5/3"        fractions
//   "1 1/2", "-2 3/4"             mixed numbers
//   "1,234.5"                     comma thousands separators (stripped)
//   "$3.50"                       one leading dollar sign (stripped)
//
// Anything else returns null, and the CALLER falls back to exact string
// comparison — which is what lets a non-numeric key entry like "no solution"
// still score on a numeric blank.
//
// PARITY IS THE POINT. This file is pinned by the golden corpus against the
// runtime's own test cases; the regexes are copied character-for-character
// rather than "cleaned up", because a subtly wider regex here silently changes
// marks. If this ever needs to change, the corpus is the place to argue it.
// =============================================================================

const DECIMAL_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const FRACTION_RE = /^([+-]?(?:\d+\.?\d*|\.\d+))\/((?:\d+\.?\d*|\.\d+))$/;
const MIXED_RE = /^([+-]?)(\d+) +(\d+)\/(\d+)$/;

/** Parse a student-typed value (or a key entry) into a number, or null when it
 * is not one of the accepted numeric forms. */
export function parseNumericValue(raw: string): number | null {
  let s = raw.trim();
  if (s.charAt(0) === '$') s = s.slice(1).trim();
  // Commas are thousands separators and are stripped (US convention; the
  // platform's number formatting is US-style throughout).
  s = s.replace(/,/g, '');
  if (s.length === 0) return null;

  const mixed = MIXED_RE.exec(s);
  if (mixed) {
    const sign = mixed[1] === '-' ? -1 : 1;
    const whole = Number(mixed[2]);
    const num = Number(mixed[3]);
    const den = Number(mixed[4]);
    if (den === 0) return null;
    return sign * (whole + num / den);
  }

  const frac = FRACTION_RE.exec(s);
  if (frac) {
    const num = Number(frac[1]);
    const den = Number(frac[2]);
    if (den === 0) return null;
    return num / den;
  }

  if (DECIMAL_RE.test(s)) {
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  return null;
}

/** Coerce an authored tolerance to the runtime's rules: absent/NaN/negative all
 * collapse to 0. (Schema says `.min(0)`, but the raw document can predate a
 * constraint and the runtime is defensive here — matching that is free.) */
export function coerceTolerance(tolerance: number | undefined): number {
  if (tolerance === undefined) return 0;
  return isFinite(tolerance) && tolerance >= 0 ? tolerance : 0;
}

/** Numeric comparison with the runtime's absolute tolerance AND its 1e-9
 * float-noise epsilon. The epsilon is why an exact-tolerance answer like 0.3
 * doesn't fail against 0.1 + 0.2. */
export function numericallyClose(
  a: number,
  b: number,
  tolerance: number,
): boolean {
  return Math.abs(a - b) <= tolerance + 1e-9;
}
