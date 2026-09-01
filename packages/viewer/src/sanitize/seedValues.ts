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

/** Derive every declared variable's value for one (seed, template) pair. */
export function deriveSeedValues(
  vars: readonly SeedVar[],
  seed: string,
): SeedValues {
  const out: SeedValues = {};
  for (const v of vars) {
    const rng = mulberry32(seedFrom(`${seed}:${v.name}`));
    const spec = v.spec;
    if (spec.kind === 'int') {
      out[v.name] = spec.min + Math.floor(rng() * (spec.max - spec.min + 1));
    } else if (spec.kind === 'list') {
      out[v.name] = spec.values[Math.floor(rng() * spec.values.length)]!;
    } else {
      out[v.name] = sampleDistinct(rng, spec.n, spec.min, spec.max);
    }
  }
  return out;
}

/** How a value renders in prose: numbers as their shortest decimal, samples
 *  as a comma-separated list ("55, 61, 78" — the statistics prompt case). */
export function formatSeedValue(value: number | number[]): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  return String(value);
}
