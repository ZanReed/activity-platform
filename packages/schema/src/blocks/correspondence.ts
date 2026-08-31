import { z } from 'zod';
import { InlineNode } from '../inline.js';
import { labelFields } from '../label.js';
import { MatchingItem, MatchingTarget } from './matching.js';

// Correspondence question block (wishlist #4, "nway_correspondence"): the
// N-way match. Anchor items (document order, like matching's left column) plus
// TWO OR THREE target columns, each its own card pool — the student picks one
// card from every column for every row. The marquee case is the same function
// across representations: the equation anchors its graph, its table, and its
// verbal description. Design: docs/design/nway-correspondence.md (D1-D10 as
// amended R1-R8 by the outside-voice review, 2026-09-01).
//
// Deliberate reuses of the matching contract (same shapes, same tombstones):
//   - items/targets are MatchingItem/MatchingTarget verbatim — rich inline
//     content + the MC figure slot, so "match the graph to its equation"
//     composes per column with no new figure grammar.
//   - distractors: a column's targets may exceed the items; many-to-one reuse
//     is always allowed (the allowTargetReuse tombstone applies here too).
//   - the key is deliberately NOT schema-enforced complete — a mid-edit draft
//     must autosave; the grader treats a missing cell as never-correct.
//
// Scored PER CELL: one (item, column) cell is one point ("per-edge partial
// credit" — WHICH representation a student fails to connect is the whole
// diagnostic). earned = correct cells, total = items × columns, block
// `correct` = every cell right. The student's docking IS the assignment —
// no bipartite machinery (matching's precedent).
//
// A 2-way correspondence is just `matching` — the importer and editor steer
// there; this block is the 3- and 4-way case (max 3 target columns: beyond
// that the diagnostic drowns in scan cost, and no planned activity needs it).

export const TargetColumn = z.object({
  id: z.string().uuid(),
  // Column header ("Graph", "Table", "Description") — rich inline content.
  header: z.array(InlineNode),
  targets: z.array(MatchingTarget).min(2),
});
export type TargetColumn = z.infer<typeof TargetColumn>;

export const CorrespondenceBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('correspondence'),
  number: z.number().int().positive().optional(),
  ...labelFields,
  prompt: z.array(InlineNode),
  // Anchor column, document order (never shuffled — it is the question).
  items: z.array(MatchingItem).min(2),
  // 3-way (2 columns) or 4-way (3 columns). Each column shuffles client-side,
  // seeded per blockId+columnId (matching's seededShuffle discipline).
  targetColumns: z.array(TargetColumn).min(2).max(3),
  // itemId → (columnId → targetId). Partial during authoring (see header).
  key: z.record(
    z.string().uuid(),
    z.record(z.string().uuid(), z.string().uuid()),
  ),
  solution: z.array(InlineNode).optional(),
  skills: z.array(z.string()).default([]),
  workSpace: z.number().min(0).optional(),
});
export type CorrespondenceBlock = z.infer<typeof CorrespondenceBlock>;
