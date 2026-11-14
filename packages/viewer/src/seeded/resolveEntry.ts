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
// evaluate to the literal the existing compare expects. Fail-safe: anything
// the evaluator cannot resolve stays as its bound string.
// =============================================================================

import { compileFunction, displayFormKey } from '@activity/graph-kit/scorers';
import { bindSeedNames } from '../sanitize/substitute.js';
import type { SeedValues } from '../sanitize/seedValues.js';

export function resolveSeededEntry(
  entry: string,
  answerType: 'text' | 'numeric' | 'math',
  values: SeedValues,
): string {
  const bound = bindSeedNames(entry, values);
  if (bound === entry) return entry;
  if (answerType === 'math') return bound;
  const fn = compileFunction(bound);
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
  if (answerType !== 'math' || resolved === entry) return resolved;
  return displayFormKey(resolved) ?? resolved;
}
