// =============================================================================
// sanitize/substitute.ts — the seeded-value substitution walk (wishlist #6, D4)
// -----------------------------------------------------------------------------
// Replaces `{name}` references with a student's derived values. Runs
// per-request AFTER cache retrieval, beside the serve shuffle — deliberately
// OUTSIDE SANITIZER_REV (R10): the cached artifact is the student-independent
// TEMPLATE, and this walk is what makes it a student's document.
//
// THE SURFACE LIST (D5 as built, guarded by substitute.test.ts):
//   - every prose TEXT run (`{ type: 'text', text }`) — prompts, paragraphs,
//     choices, items: prose is prose. Built uniform rather than
//     structural-by-block because a narrower list bought nothing a student
//     could see and cost the walk a block-shape dependency.
//   - `data_plot.data` — spliced from the block's `dataVar` when that names a
//     derived sample (R4). The literal `data` stays when the name doesn't
//     resolve (fail-safe: the representative dataset serves).
//   - NOTHING ELSE. `latex` strings are structurally out (R2): `{a}` in LaTeX
//     is a brace group (`x^{a}`), so substitution there corrupts authored
//     math — the importer warns at import time instead. Answer keys are not
//     walked here (they are stripped from serve; grading evaluates them as
//     EXPRESSIONS, not string templates).
//
// An unresolvable `{name}` stays LITERAL — the read path fails safe; the
// importer's strict gate is the real fence (carried open item).
// =============================================================================

import type { SeedValues } from './seedValues.js';
import { formatSeedValue } from './seedValues.js';

const REF_RE = /\{([a-z][a-z0-9_]*)\}/g;

// A bare identifier (not preceded by a word character, greedy through the
// name) — the grammar of the EXPRESSION surfaces: blank answer keys and
// mistake matchers reference variables by bare name, not by {braces}.
const NAME_RE = /(?<![a-zA-Z0-9_])[a-z][a-z0-9_]*/g;

/**
 * Bind declared names inside an EXPRESSION string (R6): scalars become a
 * parenthesized literal ("a*x + 3" → "(6)*x + 3", sign-safe), samples become
 * a mathjs array literal ("mean(data)" → "mean([55,61,78])"). Undeclared
 * identifiers — including function names like `mean` — pass through, and the
 * regex's greediness keeps `data2` from matching a declared `data`.
 */
export function bindSeedNames(expr: string, values: SeedValues): string {
  return expr.replace(NAME_RE, (name) => {
    const v = values[name];
    if (v === undefined) return name;
    return Array.isArray(v) ? `[${v.join(',')}]` : `(${v})`;
  });
}

/** Interpolate `{name}` references in one prose string. Undeclared names are
 *  left exactly as written. */
export function substituteText(text: string, values: SeedValues): string {
  return text.replace(REF_RE, (whole, name: string) => {
    const v = values[name];
    return v === undefined ? whole : formatSeedValue(v);
  });
}

/**
 * Walk any document-shaped JSON (raw or sanitized — the walk is structural)
 * and substitute the surfaces above. Pure: returns a new tree; the input is
 * never mutated (the caller may be holding the cached template).
 */
export function substituteSeedValues<T>(doc: T, values: SeedValues): T {
  if (Object.keys(values).length === 0) return doc;
  return walk(doc, values) as T;
}

function walk(node: unknown, values: SeedValues): unknown {
  if (Array.isArray(node)) return node.map((n) => walk(n, values));
  if (node === null || typeof node !== 'object') return node;
  const obj = node as Record<string, unknown>;

  // data_plot splice (R4): the drawn sample replaces the representative
  // literal, so the chart, the grader's computed key, and the print twin all
  // read the student's own numbers.
  if (obj.type === 'data_plot' && typeof obj.dataVar === 'string') {
    const drawn = values[obj.dataVar];
    if (Array.isArray(drawn) && drawn.length > 0) {
      const rest: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        rest[k] = k === 'data' ? [...drawn] : walk(v, values);
      }
      return rest;
    }
  }

  // A prose text run. The `latex` key never appears on these nodes, and no
  // other node kind carries a `text` prose field — so keying on the node
  // shape keeps LaTeX structurally unreachable rather than filtered.
  if (obj.type === 'text' && typeof obj.text === 'string') {
    const swapped = substituteText(obj.text, values);
    if (swapped === obj.text) return obj;
    return { ...obj, text: swapped };
  }

  let changed = false;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const w = walk(v, values);
    if (w !== v) changed = true;
    out[k] = w;
  }
  return changed ? out : obj;
}
