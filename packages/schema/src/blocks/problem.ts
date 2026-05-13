import { z } from 'zod';
import { InlineNode } from '../inline.js';

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
                                     solution: z.string().optional(),
                                     skills: z.array(z.string()).default([]),
});
export type ProblemBlock = z.infer<typeof ProblemBlock>;
