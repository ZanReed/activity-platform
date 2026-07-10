// =============================================================================
// shuffle.ts — deterministic publish-time shuffle
// -----------------------------------------------------------------------------
// Matching targets and ordering items must not render in answer order, but the
// arrangement must be STABLE: seeded by block id, so every publish of the same
// block deals the same arrangement. That makes the printed sheet match the
// screen, keeps letters stable across re-publishes, and lets a class discuss
// "option B" — the author calls behind this are in
// docs/design/matching-ordering-questions.md (decision 8).
//
// Pure and dependency-free (renderer discipline): xmur3-style string hash
// seeds a mulberry32 PRNG driving a Fisher–Yates shuffle.
// =============================================================================

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffle `items` by `seed`. Never returns the identity
 * arrangement for 2+ items (rotates by one if the deal lands on it): for
 * ordering blocks the authored order IS the answer, so dealing it back would
 * hand students a pre-solved list — and an untouched list is an omission, so
 * they couldn't even submit it without scrambling it first.
 */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = [...items];
  const rand = mulberry32(hashSeed(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const swap = out[i] as T;
    out[i] = out[j] as T;
    out[j] = swap;
  }
  if (out.length > 1 && out.every((value, i) => value === items[i])) {
    const first = out.shift() as T;
    out.push(first);
  }
  return out;
}
