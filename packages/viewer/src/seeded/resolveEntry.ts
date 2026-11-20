// =============================================================================
// seeded/resolveEntry.ts — resolve ONE seeded answer-key entry (wishlist #6)
// -----------------------------------------------------------------------------
// Shared by the grading side (grading/seededKeys.ts — the server evaluates a
// blank's key expression against the student's derived values) and the print
// side (print/seededPrint.ts — the teacher's answer key prints "10.5", never
// "a*p"). One resolver so the two surfaces cannot disagree about what a key
// expression means — the same single-seam rule as serveSeed itself.
//
// Semantics: bind declared names first (R6 — a seeded symbol is a bound value
// before ANY equivalence runs); math entries stay bound expressions
// (mathEquivalent owns their comparison), numeric/text entries additionally
// evaluate to the literal the existing compare expects — and so does a math
// entry naming a sample with no symbol left (see below). Fail-safe: anything
// the evaluator cannot resolve stays as its bound string.
// =============================================================================

import { compileFunction, displayFormKey, freeVariables } from '@activity/graph-kit/scorers';
import { bindSeedNames } from '../sanitize/substitute.js';
import { seedPlaces, type SeedValues } from '../sanitize/seedValues.js';

export function resolveSeededEntry(
  entry: string,
  answerType: 'text' | 'numeric' | 'math',
  values: SeedValues,
): string {
  const bound = bindSeedNames(entry, values);
  if (bound === entry) return entry;
  // Evaluate the ARGUMENT-list spelling: a sample inside an aggregate
  // (`mean(scores)`, `max(scores) - min(scores)`) only runs that way — the
  // engine has no arrays, so the bracketed `bound` never evaluated, and the
  // key stayed the expression text: no student could match it, and the print
  // key showed "mean([62,88,…" (2026-11-20).
  const args = bindSeedNames(entry, values, { samples: 'args' });
  if (answerType === 'math') {
    // A math entry stays a bound EXPRESSION (mathEquivalent and form grading
    // own its comparison) — unless it names a SAMPLE, where the bracketed
    // form is not maths the engine can read at all. Such an entry with no
    // free symbol left (`mean(scores)`, `max(s) - min(s)`) is a number, and
    // is keyed AS one, so form grading's shape check sees the number a
    // student types, not an aggregate call. One that still has a symbol
    // (`mean(s)*x`) keys as the argument spelling, which value equivalence
    // can sample. An entry naming no sample is untouched (args === bound).
    if (args === bound) return bound;
    if (freeVariables(args).length === 0) {
      const v = compileFunction(args)?.(0);
      if (v !== undefined && Number.isFinite(v)) return String(v);
    }
    return args;
  }
  const fn = compileFunction(args);
  if (fn) {
    const v = fn(0);
    if (Number.isFinite(v)) return String(v);
  }
  return bound;
}

/**
 * A key entry as a STUDENT or TEACHER should see it (form-grading FG-6): the
 * resolved entry, and for a SEEDED math entry the folded form a worksheet
 * writes — `(6)*((3)*x-(2))` → `6(3x - 2)`, `((4)*(3))ab` → `12ab`. The one
 * function every display surface uses (print answer key, practice's released
 * answer), so they cannot differ. An unseeded entry is shown as authored.
 */
export function displaySeededEntry(
  entry: string,
  answerType: 'text' | 'numeric' | 'math',
  values: SeedValues,
): string {
  const resolved = resolveSeededEntry(entry, answerType, values);
  if (resolved === entry) return resolved;
  // A math entry that resolved to a plain number (a sample aggregate) reads
  // like a numeric key: float noise trimmed.
  if (answerType !== 'math' || /^-?\d[\d.]*(?:e[+-]?\d+)?$/.test(resolved)) {
    return displayNumber(resolved, spelledPlaces(entry, values));
  }
  return displayFormKey(resolved) ?? resolved;
}

// The expression grammar's bare identifier — the same pattern bindSeedNames
// binds with (sanitize/substitute.ts NAME_RE), so "referenced" means exactly
// "bound".
const NAME_RE = /(?<![a-zA-Z0-9_])[a-z][a-z0-9_]*/g;

/** The most decimal places any list variable the entry references was
 *  SPELLED with (`p: list 1.50, 1.75` → 2), or 0 when none was. */
function spelledPlaces(entry: string, values: SeedValues): number {
  let d = 0;
  for (const name of entry.match(NAME_RE) ?? []) {
    d = Math.max(d, seedPlaces(values, name) ?? 0);
  }
  return d;
}

/** An evaluated key as a person reads it: binary float noise trimmed
 *  (`(3)*(1.1)` → "3.3", not "3.3000000000000003") at 15 significant
 *  digits, so no real value is rounded. The value is NOT rounded to a
 *  shown precision — a key sheet prints the exact answer ("78.625"), and the
 *  grader compares the untrimmed resolveSeededEntry form. A non-number (a
 *  bound string the evaluator could not run) passes through.
 *
 *  `places` (the entry's spelled list variables, spelledPlaces) only ever
 *  PADS: 4.5 shows "4.50" when a referenced price was spelled "1.50", but a
 *  value that needs more digits keeps them all (4.125 stays "4.125", never
 *  "4.13") — padding cannot change the number, so it cannot change a mark. */
function displayNumber(resolved: string, places = 0): string {
  if (!/^-?\d/.test(resolved)) return resolved;
  const n = Number(resolved);
  if (!Number.isFinite(n)) return resolved;
  // 15 significant digits: trims float noise without rounding a real value
  // (a 10-digit cut turned 12345678912 into 12345678910; Fable review).
  const shown = String(Number(n.toPrecision(15)));
  if (places === 0 || /e/i.test(shown)) return shown;
  const dot = shown.indexOf('.');
  const has = dot < 0 ? 0 : shown.length - dot - 1;
  return has >= places ? shown : Number(shown).toFixed(places);
}
