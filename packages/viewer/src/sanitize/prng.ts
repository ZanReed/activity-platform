// =============================================================================
// sanitize/prng.ts — the seeded PRNG primitives (leaf, dependency-free)
// -----------------------------------------------------------------------------
// FNV-1a string→seed + mulberry32, extracted verbatim from shuffle.ts so the
// seed-value derivation (seedValues.ts) can share them without importing the
// registry that shuffle.ts needs. Deterministic across JS runtimes,
// dependency-free, NOT cryptographic — the threat model everywhere these are
// used is "deterministic per (version, student)", never unpredictability.
// Both server bundles import this family (the serveSeed precedent): it must
// never grow an import.
// =============================================================================

/** FNV-1a 32-bit over a string → uint32 seed. */
export function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 — tiny deterministic PRNG, uniform enough for a shuffle/draw. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
