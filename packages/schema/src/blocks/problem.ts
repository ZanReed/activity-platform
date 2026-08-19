import { z } from 'zod';
import { InlineNode } from '../inline.js';

// =============================================================================
// ⚰ TOMBSTONE — `problem` IS DEAD. Do not build on it. (Ruling E1, 2026-08-19)
// -----------------------------------------------------------------------------
// The block still parses, because documents in the database may contain one and
// the schema is the thing that must keep reading them. NOTHING ELSE about it is
// alive:
//
//   - The EDITOR CANNOT HOLD ONE. serialize.ts's activityBlockToTiptap has no
//     `problem` mapping and returns null, so an imported or hand-inserted
//     problem is dropped from the editor view and DELETED by the first
//     autosave. This is not a gap to fill; it is why the block is dead.
//   - There is no importer fence, no insert affordance, and no editor NodeView.
//   - The viewer's Problem.tsx renders it read-only for the documents that
//     already have one, and that is its entire remaining job.
//
// The answer-key design pass (docs/design/problem-answer-key.md) opened by
// proposing to REVIVE this block as the home of paper problems. The scope gate
// overturned that premise on the evidence above: paper problems ship on
// short_answer/essay, which have the editor, the fences, the viewer, and 0034's
// grading queue that `problem` never had. Full REMOVAL of the type (with the
// P5 claims-grep over every comment that cites it) is a recorded TODO, not part
// of that slice — removing a parseable shape is a migration question.
// =============================================================================

// Auto-numbered at render time by walking the document and counting problem
// blocks in order. The optional `number` field overrides the auto-number
// (rare cases like "Problem 5a" or hand-numbered legacy worksheets).
//
// solution: optional worked explanation shown to all students after the
// section is checked (or after final submit in single-mode activities),
// regardless of whether they answered correctly. Different from hint —
// hints nudge during the attempt; solutions explain after. The runtime
// reads this on init but does NOT inject it into the DOM until after
// check (Phase 1 security ceiling — don't make the leak worse).
//
// skills: optional array of universal skill tags this problem targets.
// Activity-level skills live on ActivityMeta; this field captures
// problem-level granularity for future per-skill analytics. Editor UI is
// Phase 2; the field exists in Phase 1 so analytics can reach back.
export const ProblemBlock = z.object({
  id: z.string().uuid(),
                                     type: z.literal('problem'),
                                     number: z.number().int().positive().optional(),
                                     content: z.array(InlineNode),
                                     solution: z.array(InlineNode).optional(),
                                     skills: z.array(z.string()).default([]),
});
export type ProblemBlock = z.infer<typeof ProblemBlock>;
