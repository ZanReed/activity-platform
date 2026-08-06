// =============================================================================
// container/blockIndex.ts — served document → per-section response ids (S3 V4)
// -----------------------------------------------------------------------------
// The store is deliberately document-shape-agnostic (store.ts): it holds
// id-keyed response maps and is TOLD which ids belong to a section at check
// time. This module is what tells it — one walk over the SERVED (sanitized)
// document producing, per section, the item ids in each wire category.
//
// Two design points worth keeping:
//
//  1. IN-BAND IDS COME FROM A DEEP WALK, not a per-type field list. A blank
//     token lives in fill_in_blank.content, but also inside a
//     faded_worked_example's nested steps; a prompted math_inline may appear in
//     ANY content array (the schema admits it, which is exactly why the S2
//     sanitizer strips in-band secrets unconditionally rather than by
//     declaration). Mirroring that posture here means a new block type that
//     embeds blanks is wired into checking the day it renders, with no registry
//     edit — the failure mode this avoids is a student's answer silently never
//     reaching the grader.
//
//  2. UNSUPPORTED IS RECORDED, NEVER DROPPED. Wire v2 (V9) gave the graph
//     family its `graphs` category, so `unsupported` is empty today — but the
//     mechanism stays. It is the honest answer whenever a gradable block has
//     no way to reach the grader (a future block type ahead of its wire
//     bump). A silent omission would read as "all checked" while a student's
//     work went ungraded, which is the failure this exists to prevent.
// =============================================================================

import { familyOf } from '../registry/registry.js';
import type { BlockType } from '../registry/types.js';
import type {
  SanitizedActivityDocument,
  SanitizedBlock,
} from '../sanitize/sanitized-types.js';
import type { SectionItemIds } from '../store/store.js';

/** Block types whose responses have no wire-v1 category (see design point 2). */
const GRAPH_FAMILY: ReadonlySet<string> = new Set([
  'interactive_graph',
  'number_line',
  'data_plot',
]);

export interface SectionIndex {
  sectionId: string;
  /** Ids to send when checking this section. */
  items: SectionItemIds;
  /** Block ids present in this section, document order (containers included). */
  blockIds: string[];
  /** Gradable block ids this wire version cannot carry — surfaced, not hidden. */
  unsupported: string[];
}

export interface DocumentIndex {
  sections: SectionIndex[];
  bySection: Record<string, SectionIndex>;
  /** Every gradable-but-uncarryable block id across the document. */
  unsupported: string[];
}

/** Deep-walk any value for in-band response ids: blank tokens and math-gap
 * prompts, wherever they sit. Does NOT descend into nested Block arrays —
 * child blocks are visited by the caller so their own ids attribute to them. */
function collectInBandIds(
  value: unknown,
  out: string[],
  isChildBlockArray: (value: unknown) => boolean,
): void {
  if (Array.isArray(value)) {
    if (isChildBlockArray(value)) return;
    for (const item of value) collectInBandIds(item, out, isChildBlockArray);
    return;
  }
  if (typeof value !== 'object' || value === null) return;

  const node = value as Record<string, unknown>;
  if (node.type === 'blank' && typeof node.id === 'string') {
    out.push(node.id);
    return;
  }
  // A MathPrompt carrier: `latex` + `prompts`. Matched STRUCTURALLY rather
  // than by node type because the same carrier shape is both an inline
  // math_inline node and a top-level math_block — and the schema admits it in
  // either position (the reason the S2 sanitizer walks unconditionally too).
  if (typeof node.latex === 'string' && Array.isArray(node.prompts)) {
    for (const prompt of node.prompts) {
      const id = (prompt as { id?: unknown } | null)?.id;
      if (typeof id === 'string') out.push(id);
    }
    // Keep walking siblings: a math_block also carries content fields.
  }
  for (const child of Object.values(node)) {
    collectInBandIds(child, out, isChildBlockArray);
  }
}

/** A value is a child-block array if it looks like Block[] (objects carrying a
 * `type` the registry knows AND an `id`). Structural rather than
 * registry-declared so a container that forgets its childBlocks declaration
 * still can't get its children's ids mis-attributed.
 *
 * Exported because the answer-key extraction, the census, AND the grading
 * walk (since A24, 2026-08-06 — it carried a private copy for a slice
 * generation) all answer the same question ("is this a nested block, or
 * content of this one?"). Two copies of a subtle heuristic drift; this one
 * is THE source, with zero copies remaining. */
export function looksLikeBlockArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { type?: unknown }).type === 'string',
    ) &&
    // Inline nodes carry `type` but never `id` + block-ish shape together;
    // require at least one known container-ish key to avoid false positives.
    value.every((item) => {
      const t = (item as { type: string }).type;
      return t !== 'text' && t !== 'blank' && t !== 'math_inline' && t !== 'hard_break';
    })
  );
}

/** Nested blocks, found structurally (see looksLikeBlockArray). Generic over the
 * block shape so the served-document walk here and the authored-document walk in
 * the answer-key extraction share ONE definition of "child block". */
export function childBlocksOf<T extends object>(block: T): T[] {
  const out: T[] = [];
  for (const value of Object.values(block as Record<string, unknown>)) {
    if (looksLikeBlockArray(value)) out.push(...(value as T[]));
  }
  return out;
}

function visit(block: SanitizedBlock, index: SectionIndex): void {
  const type = (block as { type: string }).type as BlockType;
  const id = (block as { id: string }).id;
  index.blockIds.push(id);

  // In-band ids (blanks + math gaps) belong to THIS block, at any depth
  // short of a nested block.
  const inBand: string[] = [];
  collectInBandIds(block, inBand, looksLikeBlockArray);
  if (inBand.length > 0) {
    index.items.blanks = [...(index.items.blanks ?? []), ...inBand];
  }

  // Per-block-id categories. familyOf resolves display-mode instances to
  // 'static', so a display graph contributes nothing — correct, it takes no
  // input.
  const family = familyOf(block as never);
  if (family !== 'static') {
    switch (type) {
      case 'multiple_choice':
        index.items.choices = [...(index.items.choices ?? []), id];
        break;
      case 'matching':
        index.items.matches = [...(index.items.matches ?? []), id];
        break;
      case 'ordering':
        index.items.orderings = [...(index.items.orderings ?? []), id];
        break;
      case 'self_explanation':
      case 'short_answer':
      case 'essay':
        index.items.freeText = [...(index.items.freeText ?? []), id];
        break;
      default:
        // Wire v2 carries geometric work for the whole graph family; the
        // server dispatches on the served interaction type.
        if (GRAPH_FAMILY.has(type)) {
          index.items.graphs = [...(index.items.graphs ?? []), id];
        }
        break;
    }
  }

  for (const child of childBlocksOf(block)) visit(child, index);
}

/** Index a served document: per-section check payload ids + the unsupported
 * roster. Pure; safe to recompute on every render (the document is immutable
 * per version). */
export function indexDocument(doc: SanitizedActivityDocument): DocumentIndex {
  const sections: SectionIndex[] = [];
  for (const section of doc.sections) {
    const index: SectionIndex = {
      sectionId: section.id,
      items: {},
      blockIds: [],
      unsupported: [],
    };
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) visit(block, index);
      }
    }
    sections.push(index);
  }
  return {
    sections,
    bySection: Object.fromEntries(sections.map((s) => [s.sectionId, s])),
    unsupported: sections.flatMap((s) => s.unsupported),
  };
}
