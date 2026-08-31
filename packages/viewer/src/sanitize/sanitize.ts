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
import { PROMPT_CARRIER_TYPES } from './promptCarriers.js';
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

// 1 -> 2 (2026-08-23): the per-block strips began covering `referencePanel`
// as well as the body. This is EXACTLY the case the note above reserves a hand
// bump for — the transform changed while every sanitize DECLARATION stayed
// identical, so the computed rev would not have moved and every cached row
// would have kept serving the leak it was written with.
export const SANITIZER_ALGO_REV = 2;

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
// PROMPT_CARRIER_TYPES is single-sourced (promptCarriers.ts) — the grading
// walk consumes the same roster, and two declarations drifted-risk a silent
// leak or a silent mis-grade (A7).

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

// ---- Derived question shape (the one ADDITIVE step) -------------------------
// The sanitizer's job is removal; this is the single exception, and it is
// fenced accordingly.
//
// Why it exists: the graph widgets take their handle count and curve family
// from the answer key. The viewer never receives a key, so without this a
// served graph question cannot be laid out — there is no way to know whether
// to draw one handle or three.
//
// Why it is safe: what leaves here is question SHAPE, which the student can
// already see (how many handles; which family's curve follows their drags),
// never the coordinates, tolerances, or coefficients that make an answer. The
// guarantee is STRUCTURAL rather than a promise about this code: every value
// passes a whitelist on the way out — small positive integers, or a family
// name from a closed set — so a coordinate cannot travel this path even if a
// future edit tried to send one. Anything failing the whitelist is dropped,
// not passed through (fail closed, like the unknown-block-type throw).

/** Upper bound on a handle count. Far above any real question; exists so a
 * corrupt or hostile length can't become an absurd allocation downstream. */
const MAX_HANDLES = 24;

/** Curve families the widget lays out. Closed set: an unrecognized family is
 * dropped and the widget falls back to its own default. */
const KNOWN_FAMILIES: ReadonlySet<string> = new Set([
  'linear',
  'quadratic',
  'exponential',
  'logarithmic',
  'vertical',
  'absolute',
  'sqrt',
  'cubic',
  'quartic',
]);

export interface QuestionShape {
  handleCount?: number;
  family?: string;
  vertexCount?: number;
}

/** A count survives only as a small positive integer. */
function safeCount(value: unknown): number | undefined {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_HANDLES
    ? value
    : undefined;
}

/** A family survives only if it is a known name. */
function safeFamily(value: unknown): string | undefined {
  return typeof value === 'string' && KNOWN_FAMILIES.has(value)
    ? value
    : undefined;
}

/**
 * Derive the served question shape from an UNSANITIZED block (it reads the
 * answer key, so it must run before the strips). Returns undefined when there
 * is nothing to say — a display-mode graph takes no input and gets no shape.
 */
export function deriveQuestionShape(
  block: Record<string, unknown>,
): QuestionShape | undefined {
  const interaction = block.interaction as Record<string, unknown> | undefined;
  const kind = typeof interaction?.type === 'string' ? interaction.type : null;
  if (!kind || kind === 'display') return undefined;

  const shape: QuestionShape = {};

  // Point-style interactions: one handle per authored target. This mirrors
  // exactly what the graded widget already does with the key
  // (count = correctPoints.length), so a student sees the same widget either
  // way — the number of handles is not the secret, their positions are.
  const points = interaction?.correctPoints;
  if (Array.isArray(points)) {
    const count = safeCount(points.length);
    if (count !== undefined) shape.handleCount = count;
  }

  // Curve families: the shape of the curve that follows the student's drags.
  const models = interaction?.models;
  if (Array.isArray(models) && models.length > 0) {
    const family = safeFamily(
      (models[0] as Record<string, unknown> | null)?.family,
    );
    if (family !== undefined) shape.family = family;
  }

  // An inequality's boundary rides the same family machinery.
  const inequalities = interaction?.inequalities;
  if (Array.isArray(inequalities) && inequalities.length > 0) {
    const boundary = (inequalities[0] as Record<string, unknown> | null)
      ?.boundary as Record<string, unknown> | undefined;
    const family = safeFamily(boundary?.family);
    if (family !== undefined) shape.family = family;
  }

  // Polygon vertex count for shade_region.
  const regions = interaction?.regions;
  if (Array.isArray(regions) && regions.length > 0) {
    const vertices = (regions[0] as Record<string, unknown> | null)
      ?.correctVertices;
    if (Array.isArray(vertices)) {
      const count = safeCount(vertices.length);
      if (count !== undefined) shape.vertexCount = count;
    }
  }

  return Object.keys(shape).length > 0 ? shape : undefined;
}

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

  // Derived shape is computed BEFORE the strips (it reads the answer key) and
  // attached after, so the served block carries only the whitelisted result.
  const shape = entry.sanitize.deriveQuestionShape
    ? deriveQuestionShape(block)
    : undefined;

  for (const path of entry.sanitize.strip) applyStripPath(block, path);

  if (shape) block.questionShape = shape;

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

/**
 * Sanitize a loose INLINE-CONTENT array pulled out of the raw document (pure).
 *
 * S4's grading RPC is a second server→client channel: it returns authored
 * `feedback` and `solution` content that the read API deliberately stripped and
 * the server releases only after a check. Those are `InlineNode[]`, and an
 * inline array can carry in-band secrets — a prompted `math_inline` sitting
 * inside a solution paragraph, or a pasted blank token — so it must go through
 * the SAME unconditional deep walk the served document does. Without this, an
 * authored solution containing a blank would hand every checking student that
 * blank's answers, silently.
 *
 * Reusing `stripInBandSecrets` rather than reimplementing it is the point: the
 * secret-field lists live in the registry, and a future addition to them has to
 * protect both channels automatically or it protects neither.
 *
 * Returns a clone; the caller's array is never mutated (it belongs to the
 * cached raw document).
 */
export function sanitizeInlineContent<T>(nodes: T[]): T[] {
  const clone = structuredClone(nodes);
  stripInBandSecrets(clone);
  return clone;
}

/** Sanitize ONE block (pure). Exposed for tests and per-block tooling; the
 * document-level entry point below is what the read API uses. */
export function sanitizeBlock(block: Block): SanitizedBlock {
  const clone = structuredClone(block) as unknown as Record<string, unknown>;
  sanitizeBlockMut(clone);
  return clone as unknown as SanitizedBlock;
}

/**
 * Sanitize a full upgraded document (pure). Every block the document ships —
 * body AND reference panel — goes through its registry entry; the in-band deep
 * walk then covers whatever is left (meta, inline nodes anywhere) as defense in
 * depth.
 *
 * ⚠ The reference panel was NOT in that set until 2026-08-23, and the comment
 * here asserted the reason it did not need to be: "those surfaces carry no
 * declared answer keys". That was false. `ReferencePanel.blocks` is
 * `z.array(Block)` — the SAME full union as section content, multiple choice
 * and matching included — so a key-bearing block in a panel reached the student
 * with its key intact, because the deep walk below knows only about blanks and
 * math prompts. The leak fixture now plants every block type in the panel too,
 * so this is a wire-scanned property rather than a claim in a comment.
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
  // The reference panel ships the same Block union the body does, so it gets
  // the same per-block treatment. Scaffold by intent is not scaffold by SCHEMA.
  const panel = clone.referencePanel;
  if (panel !== null && typeof panel === 'object') {
    const panelBlocks = (panel as { blocks?: unknown }).blocks;
    if (Array.isArray(panelBlocks)) {
      for (const block of panelBlocks) {
        if (block !== null && typeof block === 'object') {
          sanitizeBlockMut(block as Record<string, unknown>);
        }
      }
    }
  }
  // Everything else (meta, and any inline node anywhere) — in-band secrets.
  stripInBandSecrets(clone);
  return clone as unknown as SanitizedActivityDocument;
}
