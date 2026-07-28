// =============================================================================
// sanitize/shuffle.ts — serve-time deterministic shuffles (S2, SanitizeSpec)
// -----------------------------------------------------------------------------
// The registry's `serveShuffled` marks arrays whose AUTHORED ORDER is the
// answer key (ordering.items) — a strip can't help when the order itself is
// the secret, so the server serves a permutation. Requirements from the spec:
//
//   - Deterministic per (version, student): the read API seeds with
//     `${version_id}:${user_id}`, so a reload (or an HTTP-cache miss) serves
//     the SAME order — the student's screen never reshuffles under them.
//   - Applied at SERVE time, after the per-version cache: the cached artifact
//     is student-independent (that's what makes it cacheable); this transform
//     is cheap enough to run per request.
//   - Per-block sub-seeding: two ordering blocks in one activity get
//     independent permutations (block id + field join the seed).
//
// Grading is order-independent (responses reference item ids, and the server
// grades against the authored key), so the permutation is presentation-only —
// but its stability is a UX contract, not a nicety.
//
// The PRNG is a seeded xorshift-style generator (mulberry32) over an FNV-1a
// seed — deterministic across JS runtimes, dependency-free. Not cryptographic,
// deliberately: the threat model is "don't serve the authored order," not
// "make the permutation unpredictable to a determined student with a debugger"
// (the answer key never leaves the server either way).
// =============================================================================

import { blockRegistry } from '../registry/registry.js';
import type { SanitizedActivityDocument } from './sanitized-types.js';

/** FNV-1a 32-bit over a string → uint32 seed. */
function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 — tiny deterministic PRNG, uniform enough for a shuffle. */
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

/** Fisher–Yates with a seeded PRNG (pure — returns a new array). */
export function seededShuffle<T>(items: readonly T[], seedKey: string): T[] {
  const out = [...items];
  const next = mulberry32(seedFrom(seedKey));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/**
 * Apply every registry-declared `serveShuffled` reorder to a SANITIZED
 * document (pure — the input, typically the shared cached artifact, is not
 * mutated). `seedKey` is the per-(version, student) identity; each shuffled
 * array is sub-seeded with the block id and field name.
 */
export function applyServeShuffles(
  doc: SanitizedActivityDocument,
  seedKey: string,
): SanitizedActivityDocument {
  const clone = structuredClone(doc) as unknown as {
    sections: Array<{
      rows: Array<{ columns: Array<{ blocks: unknown[] }> }>;
    }>;
  };

  const shuffleBlock = (block: Record<string, unknown>): void => {
    const type = block.type;
    const entry =
      typeof type === 'string' && type in blockRegistry
        ? blockRegistry[type as keyof typeof blockRegistry]
        : undefined;
    if (!entry) return; // sanitize already failed closed on unknown types
    for (const field of entry.sanitize.serveShuffled ?? []) {
      const arr = block[field];
      if (Array.isArray(arr)) {
        block[field] = seededShuffle(
          arr,
          `${seedKey}:${String(block.id ?? '')}:${field}`,
        );
      }
    }
    // Recurse where the registry declares nested blocks, mirroring sanitize.
    for (const field of entry.sanitize.childBlocks ?? []) {
      const children = block[field];
      if (Array.isArray(children)) {
        for (const child of children) {
          if (child !== null && typeof child === 'object') {
            shuffleBlock(child as Record<string, unknown>);
          }
        }
      }
    }
  };

  for (const section of clone.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          if (block !== null && typeof block === 'object') {
            shuffleBlock(block as Record<string, unknown>);
          }
        }
      }
    }
  }
  return clone as unknown as SanitizedActivityDocument;
}
