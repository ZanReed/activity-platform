// =============================================================================
// sanitize/seedValues.ts — derive a student's seeded values (wishlist #6, D3)
// -----------------------------------------------------------------------------
// One draw per variable over `${seed}:${name}` — each variable hashes its own
// name, so adding a variable never re-rolls the others (publishing an edit
// doesn't scramble every student's numbers unless the versionId moved, which
// it did, which is correct). The `seed` argument is serveSeed(versionId,
// studentId) on the serve/grade paths and the print surface's own
// `print:{activityId}:v{n}` spelling client-side (R9) — the derivation is the
// ONE shared seam, exactly like serveSeed itself (the two-spellings rule).
//
// Leaf discipline: imports only the prng leaf and a schema type. Both server
// bundles and the app's print route import this module; it must never grow a
// heavier import.
// =============================================================================

import type { SeedVar } from '@activity/schema';
import { seedFrom, mulberry32 } from './prng.js';

/** name → drawn value; `sample` variables hold their n distinct draws. */
export type SeedValues = Record<string, number | number[]>;

/** n DISTINCT integers in [min, max] — a partial Fisher–Yates over the range,
 *  sparse (a Map stands in for the array), so a wide range costs O(n) not
 *  O(range). Deterministic in draw order. */
function sampleDistinct(
  rng: () => number,
  n: number,
  min: number,
  max: number,
): number[] {
  const size = max - min + 1;
  const count = Math.min(n, size); // schema guards this; derivation stays total
  const swapped = new Map<number, number>();
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (size - i));
    const vi = swapped.get(i) ?? i;
    const vj = swapped.get(j) ?? j;
    swapped.set(j, vi);
    out.push(min + vj);
  }
  return out;
}

// THE AUTHOR'S SPELLING of a drawn list value ("1.50" where the value is 1.5).
// SeedValues stays a map of NUMBERS — every expression surface (bindSeedNames,
// the grader, the importer's row checks, practice snapshots) reads numbers, and
// 1.50 must keep grading equal to 1.5. The spelling is a DISPLAY fact, so it
// rides beside the map rather than in it: deriveSeedValues records it here,
// keyed by the very object it returns, and the prose formatter (seedText) looks
// it up. A map that did not come from deriveSeedValues — a bank row, a DoL
// table, a copy — has no entry and formats as String(v), which is exactly the
// pre-spelling behaviour (fail-safe, never a wrong number: the schema refines
// every spelling to equal its value).
const SPELLINGS = new WeakMap<SeedValues, Record<string, string>>();

/** Derive every declared variable's value for one (seed, template) pair. */
export function deriveSeedValues(
  vars: readonly SeedVar[],
  seed: string,
): SeedValues {
  const out: SeedValues = {};
  const spelled: Record<string, string> = {};
  for (const v of vars) {
    const rng = mulberry32(seedFrom(`${seed}:${v.name}`));
    const spec = v.spec;
    if (spec.kind === 'int') {
      out[v.name] = spec.min + Math.floor(rng() * (spec.max - spec.min + 1));
    } else if (spec.kind === 'list') {
      const i = Math.floor(rng() * spec.values.length);
      out[v.name] = spec.values[i]!;
      const text = spec.text?.[i]?.trim();
      if (text !== undefined && text !== '' && Number(text) === spec.values[i]) {
        spelled[v.name] = text;
      }
    } else {
      out[v.name] = sampleDistinct(rng, spec.n, spec.min, spec.max);
    }
  }
  if (Object.keys(spelled).length > 0) SPELLINGS.set(out, spelled);
  return out;
}

/** How a value renders in prose: numbers as their shortest decimal, samples
 *  as a comma-separated list ("55, 61, 78" — the statistics prompt case). */
export function formatSeedValue(value: number | number[]): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  return String(value);
}

/** How the variable `name` renders in prose: the author's spelling when the
 *  value is a drawn list entry that has one ("1.50"), else formatSeedValue.
 *  undefined when `name` is not declared. Every prose surface (the read path,
 *  the draft preview, print, the teacher's view) goes through this. */
export function seedText(values: SeedValues, name: string): string | undefined {
  const v = values[name];
  if (v === undefined) return undefined;
  if (!Array.isArray(v)) {
    const spelled = SPELLINGS.get(values)?.[name];
    if (spelled !== undefined) return spelled;
  }
  return formatSeedValue(v);
}
