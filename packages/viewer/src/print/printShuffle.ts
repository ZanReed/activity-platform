// =============================================================================
// print/printShuffle.ts — never print a block in its authored order (S5.5 D15A)
// -----------------------------------------------------------------------------
// The print-side sibling of sanitize/shuffle.ts, and it exists because the two
// paths ask different questions.
//
// WHAT WENT WRONG WITHOUT IT. The teacher print route sanitizes a document
// client-side but deliberately does NOT run the per-student serve shuffle —
// there is no student to seed it with. For most blocks that changes nothing.
// For the ones whose AUTHORED ORDER IS THE ANSWER it changes everything: an
// ordering question printed in authored order is a printed answer key, handed
// out as the worksheet. The renderer always shuffled these on print
// (blocks/ordering.ts, blocks/matching.ts); the viewer would have stopped, and
// the parity gate could not have noticed, because no rule named the property.
//
// WHY A SECOND MECHANISM RATHER THAN REUSING serveShuffled. Adding these fields
// to the registry's sanitize spec would (a) change what the server sends every
// student — a wire change — and (b) move SANITIZER_REV, orphaning the read
// cache and forcing a get-activity redeploy. Print needs neither. The
// declaration therefore lives on the PrintSpec, and this transform is its only
// reader.
//
// SEEDING. Deterministic in the seed, sub-seeded per block and field, exactly
// like the serve shuffle: the same seed reprints the identical sheet (so an
// answer key printed last week still matches), while a different seed — a
// print VERSION — produces a different arrangement. The answer key is
// unaffected either way, because it is id-keyed and components derive letters
// and numbers from the order they are handed (D3A).
// =============================================================================

import { blockRegistry } from '../registry/registry.js';
import { seededShuffle } from '../sanitize/shuffle.js';
import type { SanitizedActivityDocument } from '../sanitize/sanitized-types.js';

/**
 * Apply every registry-declared `print.shuffled` reorder. Pure — the input
 * (typically the shared sanitized document) is not mutated.
 *
 * `seedKey` identifies the printing: the same key reprints identically, a
 * different key is a different version of the same worksheet.
 */
export function applyPrintShuffles(
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

    for (const field of entry.print.shuffled ?? []) {
      const value = block[field];
      if (Array.isArray(value)) {
        block[field] = seededShuffle(
          value,
          `${seedKey}:${String(block.id ?? '')}:${field}`,
        );
      }
    }

    // Recurse where the registry declares nested blocks, mirroring sanitize:
    // a scaffold's steps are ordinary blocks and shuffle by their own ids.
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

/**
 * The seed for a printing of an activity. Version 1 is the default sheet; a
 * teacher asking for more versions gets 2, 3, … The activity id keeps two
 * different worksheets from sharing an arrangement.
 */
export function printSeed(activityId: string, version = 1): string {
  return `print:${activityId}:v${version}`;
}
