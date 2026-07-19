// =============================================================================
// math-equivalent.ts — numeric-sampling equivalence for math-answer blanks
// -----------------------------------------------------------------------------
// Model B of the math-blanks feature (docs/design/math-blanks.md): a fill-in-
// blank whose answer is a math EXPRESSION, graded by whether it evaluates the
// same as the key rather than by string match. `2a`, `a*2`, `a+a` all pass; `2b`
// fails.
//
// The engine is math.js number-only (via evaluate.ts) — NOT symbolic. Equivalence
// is decided by NUMERIC SAMPLING: compile both expressions, evaluate them at
// several assignments of their free variables, and compare within tolerance —
// the same technique plot_function uses to match curves.
//
// This is a PURE function (no DOM, no I/O). It lives in the graph-kit leaf so
// both the published-page runtime (the held sync reference — see math-blanks.md
// A1) and the editor preview import ONE copy (the graph-kit-leaf single-source
// pattern). Unit-testable in isolation.
//
// Correctness traps this handles (math-blanks.md Q6):
//   • Sample over the UNION of the key's and student's free variables — else a
//     correct-but-verbose `a + a + 0*b` leaves `b` unbound (NaN) → wrongly wrong.
//   • The sampling domain includes NEGATIVES where defined, so `sqrt(x^2)` is
//     correctly NOT equivalent to `x` (positive-only sampling would pass it).
//   • Skip-and-resample when either side is undefined at a sample (÷0, √ of a
//     negative, asymptote) — a shared undefined point is not a disagreement.
// =============================================================================

import { normalizeAsciiMath, compileFunction, freeVariables } from './evaluate.js';

export type EquivalenceMode = 'value' | 'exact-form';

export interface MathEquivalentOptions {
  /**
   * 'value' (default) — any expression that EVALUATES equal passes.
   * 'exact-form' — the normalized strings must match (for "write it in this
   * form / don't simplify" items). Whitespace-insensitive.
   */
  mode?: EquivalenceMode;
  /** Absolute comparison tolerance; a 1e-6 relative slack is always added on
   *  top to absorb float noise. Default 0. */
  tolerance?: number;
  /** Target number of valid (both-defined) sample points. Default 12. */
  samples?: number;
}

// FNV-1a hash → a stable per-variable offset so two different variables never
// get the same sample sequence (which would hide `a` vs `b` differences).
function hashName(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// A signed, non-integer base grid. Straddling zero is REQUIRED (sqrt(x^2) ≢ x);
// non-integers avoid coincidental agreement at nice points (e.g. x=1, x=2).
const BASE = [
  1.3, -2.7, 0.6, -1.1, 3.2, -0.4, 2.1, -3.5, 0.9, -1.8, 2.6, -0.7, 1.7, -2.2,
];

function sampleValue(name: string, index: number): number {
  const off = hashName(name) % BASE.length;
  const base = BASE[(index + off) % BASE.length] ?? 1;
  // Small per-name jitter so distinct vars never share a sequence exactly.
  const jitter = ((hashName(name) % 100) / 100 - 0.5) * 0.3;
  return base + jitter;
}

function close(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol + 1e-6 * Math.max(1, Math.abs(b));
}

const stripSpace = (s: string): string => s.replace(/\s+/g, '');

/**
 * Is `student` a correct answer for `key` under the given equivalence mode?
 * Pure and synchronous. Empty or unparseable input → false.
 */
export function mathEquivalent(
  student: string,
  key: string,
  opts: MathEquivalentOptions = {},
): boolean {
  const mode = opts.mode ?? 'value';
  const ns = normalizeAsciiMath(student);
  const nk = normalizeAsciiMath(key);
  if (!ns || !nk) return false;

  // Identical normalized strings pass in BOTH modes (cheap win).
  if (stripSpace(ns) === stripSpace(nk)) return true;
  if (mode === 'exact-form') return false;

  // ---- value mode: numeric-sampling equivalence ----
  const fs = compileFunction(student);
  const fk = compileFunction(key);
  if (!fs || !fk) return false;

  const vars = [...new Set([...freeVariables(student), ...freeVariables(key)])];
  const tol = opts.tolerance ?? 0;
  const target = opts.samples ?? 12;

  // No free variables: one numeric comparison (e.g. "2+3" vs "5").
  if (vars.length === 0) {
    const s = fs(0);
    const k = fk(0);
    return Number.isFinite(s) && Number.isFinite(k) && close(s, k, tol);
  }

  let valid = 0;
  const maxAttempts = target * 4 + 8;
  for (let i = 0; i < maxAttempts && valid < target; i++) {
    const scope: Record<string, number> = {};
    for (const v of vars) scope[v] = sampleValue(v, i);
    // compileFunction sets scratch.x = xVal AFTER merging vars, so xVal wins for
    // `x`; pass the sampled x through the first arg (0 when x isn't a variable).
    const xVal = scope.x ?? 0;
    const s = fs(xVal, scope);
    const k = fk(xVal, scope);
    // Undefined at this point for either side — not a disagreement, resample.
    if (!Number.isFinite(s) || !Number.isFinite(k)) continue;
    valid++;
    if (!close(s, k, tol)) return false; // differ on a shared point → not equivalent
  }
  // Enough shared, valid points to trust a "yes"; too few (domains barely
  // overlap) → conservative false.
  return valid >= Math.min(target, 4);
}
