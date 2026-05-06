// =============================================================================
// submission.ts — SubmissionResponses schema
// -----------------------------------------------------------------------------
// The shape of submissions.responses jsonb. Keyed by stable blank.id from
// the document so per-blank aggregation queries work even when blocks are
// reordered between document versions.
//
// schemaVersion here is independent of ActivityDocument.schemaVersion —
// they evolve separately. When this schema changes (e.g., adding partial-
// credit scoring), bump THIS schemaVersion and migrate on read.
// =============================================================================

import { z } from 'zod';

// One blank's response: what the student typed and whether it was scored
// correct. The `correct` boolean is computed CLIENT-SIDE in the runtime JS
// of the published HTML — the answer key is baked into the HTML, so this
// is convenience for the teacher viewer, not authoritative grading. (See
// the security ceiling discussion: Phase 5+ marketplace would need
// server-side grading.)
export const BlankResponse = z.object({
  answer: z.string(),
  correct: z.boolean(),
});
export type BlankResponse = z.infer<typeof BlankResponse>;

export const SubmissionResponses = z.object({
  schemaVersion: z.literal(1),
  // Keyed by blank.id (uuid). Record<uuid, BlankResponse>.
  blanks: z.record(z.string().uuid(), BlankResponse),
});
export type SubmissionResponses = z.infer<typeof SubmissionResponses>;
