// =============================================================================
// sanitize/sanitize.ts — the answer-key sanitizer (S2/T3, ruling TV4-A)
// -----------------------------------------------------------------------------
// A GENERIC strip transform driven entirely by the registry's SanitizeSpec
// declarations — it holds no per-type knowledge of its own (ruling Q1A: the
// registry declares, transforms obey). Runs server-side in the get-activity
// Edge Function, composed with upgrade-on-read; the output is what the durable
// per-version cache stores and the viewer receives. Answers NEVER reach a
// student client (ruling Q2B) — the wire-level leak tests in
// tests/sanitize.test.ts assert the outcome, not the mechanism.
//
// Three layers, in order, per block:
//   1. Declared strips — the entry's `strip` paths, in the tiny grammar
//      types.ts documents ('field', 'field[].sub', 'interaction.field').
//   2. Child recursion — `childBlocks` fields re-enter the sanitizer, so a
//      fill_in_blank nested in a worked example is stripped by ITS OWN entry.
//   3. In-band deep walk — BlankToken and MathPrompt secrets are stripped from
//      every object the block carries, UNCONDITIONALLY (not gated on the
//      entry's `inlineBlankSecrets` flag). Defense in depth: the schema admits
//      a prompted math_inline inside any content array — a paragraph, a hint,
//      a list item — and a declaration miss there must not become a silent
//      leak. The flag stays declarative (see types.ts).
//
// What sanitize does NOT do: the per-student `serveShuffled` reorder. That is
// serve-time work (shuffle.ts) precisely so THIS output is cacheable per
// version — the order secret can't be handled by a strip, and the shuffle
// can't be handled by the cache.
// =============================================================================

import type { ActivityDocument, Block } from '@activity/schema';
import {
  BLANK_SECRET_FIELDS,
  MATH_PROMPT_SECRET_FIELDS,
  blockRegistry,
  registeredBlockTypes,
} from '../registry/registry.js';
import type {
  SanitizedActivityDocument,
  SanitizedBlock,
} from './sanitized-types.js';

// -----------------------------------------------------------------------------
// Sanitizer revision — the durable cache's invalidation key
// -----------------------------------------------------------------------------
// The read cache stores sanitized output per (version_id, SANITIZER_REV). The
// rev is COMPUTED from the registry's sanitize declarations + the secret-field
// lists, so changing any spec automatically orphans every stale cache row — a
// sanitizer fix that required a hand-bumped constant to take effect is exactly
// the forgettable-step class this repo documents (graph-kit manifest, 0015's
// grant stanzas). Bump SANITIZER_ALGO_REV by hand ONLY when the transform
// logic itself changes in a way the declarations don't capture.

export const SANITIZER_ALGO_REV = 1;

/** FNV-1a 32-bit, hex. Tiny, dependency-free, stable across JS runtimes —
 * this is a cache-busting fingerprint, not security material. */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function computeSanitizerRev(): string {
  const specs = [...registeredBlockTypes]
    .sort()
    .map((type) => [type, blockRegistry[type].sanitize]);
  const material = JSON.stringify({
    algo: SANITIZER_ALGO_REV,
    blank: BLANK_SECRET_FIELDS,
    prompt: MATH_PROMPT_SECRET_FIELDS,
    specs,
  });
  return `${SANITIZER_ALGO_REV}-${fnv1a(material)}`;
}

/** The cache key component. Stable for a given registry + algorithm; changes
 * whenever any sanitize declaration changes. */
export const SANITIZER_REV = computeSanitizerRev();

// -----------------------------------------------------------------------------
// The strip grammar (exactly what types.ts documents — nothing more)
// -----------------------------------------------------------------------------

function applyStripPath(block: Record<string, unknown>, path: string): void {
  const arrayIdx = path.indexOf('[].');
  if (arrayIdx !== -1) {
    // 'field[].sub' — delete `sub` from every element of array `field`.
    const field = path.slice(0, arrayIdx);
    const sub = path.slice(arrayIdx + 3);
    const arr = block[field];
    if (Array.isArray(arr)) {
      for (const el of arr) {
        if (el !== null && typeof el === 'object') {
          delete (el as Record<string, unknown>)[sub];
        }
      }
    }
    return;
  }
  const dotIdx = path.indexOf('.');
  if (dotIdx !== -1) {
    // 'parent.field' — delete `field` from the nested object when present.
    // Variant-scoped keys simply don't match on other variants.
    const parent = block[path.slice(0, dotIdx)];
    if (parent !== null && typeof parent === 'object' && !Array.isArray(parent)) {
      delete (parent as Record<string, unknown>)[path.slice(dotIdx + 1)];
    }
    return;
  }
  // 'field' — delete the block's top-level field.
  delete block[path];
}

// -----------------------------------------------------------------------------
// In-band secrets — the unconditional deep walk (layer 3)
// -----------------------------------------------------------------------------

const PROMPT_CARRIER_TYPES = new Set(['math_inline', 'math_block']);

function stripInBandSecrets(value: unknown): void {
  if (Array.isArray(value)) {
    for (const el of value) stripInBandSecrets(el);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const obj = value as Record<string, unknown>;

  if (obj.type === 'blank') {
    for (const field of BLANK_SECRET_FIELDS) delete obj[field];
  }
  if (
    typeof obj.type === 'string' &&
    PROMPT_CARRIER_TYPES.has(obj.type) &&
    Array.isArray(obj.prompts)
  ) {
    for (const prompt of obj.prompts) {
      if (prompt !== null && typeof prompt === 'object') {
        for (const field of MATH_PROMPT_SECRET_FIELDS) {
          delete (prompt as Record<string, unknown>)[field];
        }
      }
    }
  }
  for (const key of Object.keys(obj)) stripInBandSecrets(obj[key]);
}

// -----------------------------------------------------------------------------
// Per-block sanitize
// -----------------------------------------------------------------------------

/** Mutating core — operates on an already-cloned block. */
function sanitizeBlockMut(block: Record<string, unknown>): void {
  const type = block.type;
  const entry =
    typeof type === 'string' && type in blockRegistry
      ? blockRegistry[type as keyof typeof blockRegistry]
      : undefined;
  if (!entry) {
    // A validated ActivityDocument can't get here (the registry coverage guard
    // proves exact agreement with the Block union) — but the sanitizer sits on
    // the wire boundary, so an unknown type fails CLOSED, never passes through.
    throw new Error(`sanitize: unknown block type ${String(type)}`);
  }

  for (const path of entry.sanitize.strip) applyStripPath(block, path);

  for (const field of entry.sanitize.childBlocks ?? []) {
    const children = block[field];
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child !== null && typeof child === 'object') {
          sanitizeBlockMut(child as Record<string, unknown>);
        }
      }
    }
  }

  stripInBandSecrets(block);
}

/** Sanitize ONE block (pure). Exposed for tests and per-block tooling; the
 * document-level entry point below is what the read API uses. */
export function sanitizeBlock(block: Block): SanitizedBlock {
  const clone = structuredClone(block) as unknown as Record<string, unknown>;
  sanitizeBlockMut(clone);
  return clone as unknown as SanitizedBlock;
}

/**
 * Sanitize a full upgraded document (pure). Every body block goes through its
 * registry entry; the in-band deep walk then covers the rest of the document
 * (reference panel, meta) as defense in depth — those surfaces carry no
 * declared answer keys, but a prompted math node must not leak from anywhere.
 */
export function sanitizeActivityDocument(
  doc: ActivityDocument,
): SanitizedActivityDocument {
  const clone = structuredClone(doc) as unknown as Record<string, unknown> & {
    sections: Array<{
      rows: Array<{ columns: Array<{ blocks: unknown[] }> }>;
    }>;
  };
  for (const section of clone.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          if (block !== null && typeof block === 'object') {
            sanitizeBlockMut(block as Record<string, unknown>);
          }
        }
      }
    }
  }
  // Everything outside the body blocks (meta, referencePanel) — in-band
  // secrets only; there are no declared strips outside blocks.
  stripInBandSecrets(clone);
  return clone as unknown as SanitizedActivityDocument;
}
