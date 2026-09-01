// =============================================================================
// grading/seededKeys.ts — evaluate seeded answer-key expressions (wishlist #6)
// -----------------------------------------------------------------------------
// The substitution walk deliberately never touches answer keys (they are not
// prose); a seeded blank's key is an EXPRESSION over the declared variables
// ("{{=a*p}}"), resolved here at grade time:
//
//   1. bindSeedNames — declared names become literals ("a*p" → "(6)*(1.75)",
//      "mean(data)" → "mean([55,61,78])"). Binding happens BEFORE any
//      equivalence check runs (R6): mathEquivalent samples free symbols, and
//      a seeded `a` must be a bound value, never a sampled unknown.
//   2. numeric/text entries additionally EVALUATE to the literal the existing
//      compare expects ("(6)*(1.75)" → "10.5"); math entries stay expressions
//      (mathEquivalent owns the rest of their comparison).
//
// Mistake matchers get the same treatment (R3): "a+p ::" fires on every
// student's own add-instead-of-multiply value, not on one seed's literal.
//
// Fail-safe throughout: an entry the evaluator cannot resolve stays as its
// BOUND string — the importer's strict gate is the fence for typos, and a
// grading path must degrade to "compares as text", never throw.
// =============================================================================

import type { SeedValues } from '../../sanitize/seedValues.js';
import { resolveSeededEntry as resolveEntry } from '../../seeded/resolveEntry.js';
import type { BlankKey } from './blanks.js';

/** Map a section's blank keys through the student's derived values. Pure; a
 * no-op (same array back) when nothing is seeded. */
export function evaluateSeededKeys(
  keys: BlankKey[],
  values: SeedValues,
): BlankKey[] {
  if (Object.keys(values).length === 0) return keys;
  return keys.map((key) => {
    const answers = key.answers.map((a) =>
      resolveEntry(a, key.answerType, values),
    );
    const mistakeFeedback = key.mistakeFeedback.map((m) => ({
      ...m,
      match: resolveEntry(m.match, key.answerType, values),
    }));
    const unchanged =
      answers.every((a, i) => a === key.answers[i]) &&
      mistakeFeedback.every((m, i) => m.match === key.mistakeFeedback[i]!.match);
    return unchanged ? key : { ...key, answers, mistakeFeedback };
  });
}
