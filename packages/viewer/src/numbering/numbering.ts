// =============================================================================
// numbering/numbering.ts — served document → the page numbers it wears
// -----------------------------------------------------------------------------
// The viewer renders NO problem number for any block type, and has not since
// packages/renderer died at S9 Drop 4 (the renderer's `renderNumberGutter` was
// the only implementation). The registry's `numbered` declaration and its guard
// survived the deletion — the guard binds it to block-predicates.ts, i.e.
// declaration against declaration — so the contract kept reading as honoured
// while nothing drew anything for four months. This module is the missing half.
// See docs/design/viewer-numbering.md.
//
// WHY A MAP AND NOT A COUNTER PULLED DURING RENDER (ruling N1). The renderer
// called `ctx.nextProblemNumber()` while building a string top to bottom, which
// is safe in a synchronous string build and unsafe in React. BlockSlots render
// under Suspense, lazy block types resolve out of order, and concurrent
// rendering may start, abandon and restart a subtree — so a counter incremented
// during render yields numbers that depend on scheduling. That is the bug class
// that reproduces once in ten loads and never in a test. Computing the whole
// map in one pure pass makes a block's number a property of the DOCUMENT rather
// than of the frame it painted in.
//
// It is also the shape the answer-key channel already uses (id-keyed, flat,
// looked up by the block itself), so there is one idiom here, not two.
//
//   sections → rows → columns → blocks        ← document order, column-major
//        │                                       within a multi-column row
//        │  pageLabel(block)
//        ▼
//   auto/absent → { kind:'number', n }   and the sequence advances
//   custom      → { kind:'custom', text} and it does NOT
//   none        → omitted entirely       and it does NOT
//   not numbered→ omitted entirely       and it does NOT
//
// TWO EXCLUSIONS, BOTH STRUCTURAL RATHER THAN FLAGGED:
//
//   The REFERENCE PANEL is not walked. A formula sheet must never be numbered,
//   and `doc.referencePanel.blocks` renders through the same BlockSlot as
//   section content — so the guarantee is that those ids are simply never in
//   the map, not that a `numbered={false}` prop was remembered at the call site.
//
//   NESTED CHILD BLOCKS are not descended into. A faded worked example is ONE
//   numbered problem; its steps are lettered by their own <ol> and pull nothing
//   from the sequence. `ChildBlocks` never consults this map, so the rule holds
//   without either side knowing about the other.
//
// NOT IMPLEMENTED, DELIBERATELY: the per-block manual `number` override (ruling
// D5). It is a schema field with no writer — serialize emits it in neither
// direction, there is no editor control and no importer key — and the editor's
// own walk already ignores it. Wiring a reader for a value nothing can produce
// would be building for a case that cannot occur; the orphan and its unresolved
// relabel-vs-restart semantics are recorded in TODOS.md.
//
// This walk is the FIFTH verbatim copy of sections→rows→columns→blocks in this
// package (blockIndex, answer-key/extract, print/printShuffle, sanitize).
// Extracting a shared iterator was considered and deferred at D6: one of those
// call sites is the sanitizer, and dragging the leak suites and both server
// bundles into this slice to save four lines of `for` is a bad trade. The debt
// is recorded in TODOS.md rather than left as a smell.
// =============================================================================

import { pageLabel } from '@activity/schema';
import type { SanitizedActivityDocument } from '../sanitize/sanitized-types.js';

/**
 * What one block shows in its number slot. A block that shows NOTHING is absent
 * from the map entirely rather than carrying a `{kind:'none'}` — "not in the
 * map" and "renders no gutter" are then the same fact, which is what lets the
 * reference-panel exclusion be structural.
 */
export type ResolvedLabel =
  | { readonly kind: 'number'; readonly n: number }
  | { readonly kind: 'custom'; readonly text: string };

/** Block id → what it shows. Flat and id-keyed, like the answer-key map. */
export type NumberingMap = Readonly<Record<string, ResolvedLabel>>;

/**
 * Walk a served document into its page numbering.
 *
 * Pure and cheap enough to run on load — a few hundred blocks and no allocation
 * beyond the map — so callers `useMemo` it on the document the way
 * `indexDocument` and `collectDefinitions` already are.
 */
export function buildNumbering(doc: SanitizedActivityDocument): NumberingMap {
  const map: Record<string, ResolvedLabel> = {};
  let next = 1;

  for (const section of doc.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          const id = (block as { id?: unknown }).id;
          if (typeof id !== 'string') continue;

          // pageLabel reads `type`, `label`, `interaction.type` and `prompts` —
          // all of which survive sanitization (the gap IDS survive even though
          // their answers do not), so the served block answers this correctly.
          const label = pageLabel(block as never);

          if (label.kind === 'number') {
            map[id] = { kind: 'number', n: next };
            // ONLY an auto label consumes a slot. A custom or suppressed block
            // is out of sequence, so the next numbered question keeps counting
            // from where the last numbered question left off.
            next += 1;
          } else if (label.kind === 'custom') {
            map[id] = { kind: 'custom', text: label.text };
          }
          // 'none' — and any block type that is not page-numbered at all —
          // falls through unrecorded. See ResolvedLabel's note.
        }
      }
    }
  }

  return map;
}
