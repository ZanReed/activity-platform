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
//
// Note: attempt_number lives on the submissions table as a column, not in
// this jsonb. The Edge Function derives it server-side from
// max(attempt_number) + 1 for the student's identity, and stores it in
// the indexed column. The client may send a value for optimistic UI, but
// the server's value is canonical and the jsonb doesn't echo it.
//
// Migration history:
//   v1 → v2 (Stage 9a): adds optional confidence per blank and optional
//                       checkpointResults. v1 submissions migrate-on-read
//                       to v2 by setting schemaVersion: 2 (other fields
//                       are unchanged or optional-and-absent in v1).
//
// Extension pattern — adding new response shapes (Phase 2+):
//   When a new question category needs a different response shape — MC
//   selections, ordering arrangements, matching pairs, graph inputs, file
//   uploads, essay text, annotations — it gets its own keyed-by-uuid
//   optional map on SubmissionResponses, sibling to `blanks`. Don't widen
//   BlankResponse.answer to a union with object types; that forces every
//   consumer (teacher dashboard, future analytics, per-blank aggregation
//   queries) to add type guards on what should remain a uuid-keyed-string
//   map. Type purity at the consumer boundary is the goal.
//
//   Planned future maps (each lands with the block type that needs it):
//     choices         — Phase 2 multiple choice (single + multi-select)
//     orderings       — Phase 2 ordering / sequencing
//     matches         — Phase 2 matching pairs
//     freeResponses   — Phase 2.6 short_answer / essay
//     graphResponses  — Phase 2.7 interactive graphs
//     files           — Phase 2.8 audio / video / file upload
//     annotations     — Phase 2.9 highlight / label / region
//
//   Each addition is an optional field at a schemaVersion bump; older
//   submissions read forward through migrateSubmissionResponses, which
//   returns the current shape with absent maps simply undefined.
// =============================================================================

import { z } from 'zod';

// Confidence rating captured before a student checks a section. Only
// present when the blank's parent FillInBlankBlock has hasConfidenceRating
// === true. Three-point scale captures metacognitive calibration without
// being so granular that students can't decide.
export const ConfidenceLevel = z.enum(['unsure', 'think_so', 'certain']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevel>;

// One blank's response: what the student typed, whether the runtime scored
// it correct, and optionally their confidence rating. The `correct` boolean
// is computed CLIENT-SIDE in the runtime JS of the published HTML — the
// answer key is baked into the HTML, so this is convenience for the
// teacher viewer, not authoritative grading. (See the security ceiling
// discussion: Phase 5+ marketplace requires server-side grading.)
export const BlankResponse = z.object({
  answer: z.string(),
                                      correct: z.boolean(),
                                      confidence: ConfidenceLevel.optional(),
});
export type BlankResponse = z.infer<typeof BlankResponse>;

// Per-section checkpoint result, captured when a student clicks "Check this
// section" in locked/free submission modes. Keyed by section.id in the
// parent SubmissionResponses.checkpointResults map. Not present in
// single-mode submissions or for sections without isCheckpoint = true.
export const CheckpointResult = z.object({
  checkedAt: z.string().datetime(),                  // ISO timestamp from runtime
                                         score: z.number().int().nonnegative(),
                                         total: z.number().int().positive(),
});
export type CheckpointResult = z.infer<typeof CheckpointResult>;

// ---- v1 (legacy) shape ------------------------------------------------------
// Pre-Stage-9a submissions. Kept so we can read old rows from the database
// and migrate them forward on read. Never written by new code.
export const SubmissionResponsesV1 = z.object({
  schemaVersion: z.literal(1),
                                              blanks: z.record(z.string().uuid(), z.object({
                                                answer: z.string(),
                                                                                           correct: z.boolean(),
                                              })),
});
export type SubmissionResponsesV1 = z.infer<typeof SubmissionResponsesV1>;

// ---- v2 (current) shape -----------------------------------------------------
// New submissions write this shape. Application code that reads submissions
// from the database calls migrateSubmissionResponses() once after reading
// to handle both v1 and v2 uniformly.
export const SubmissionResponses = z.object({
  schemaVersion: z.literal(2),
                                            // Keyed by blank.id (uuid).
                                            blanks: z.record(z.string().uuid(), BlankResponse),
                                            // Keyed by section.id. Only present in locked/free submission modes for
                                            // sections that were actually checkpoint-checked. Absent in single mode
                                            // and absent for non-checkpoint sections.
                                            checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
});
export type SubmissionResponses = z.infer<typeof SubmissionResponses>;

// ---- Migration --------------------------------------------------------------
// Reads a stored submission of either shape and returns the v2 shape.
// Application code that consumes submissions calls this once after reading
// from the database; the v1 input shape is never propagated past this
// layer. The Edge Function writes only v2.
//
// v1 → v2 migration:
//   - schemaVersion: 1 → 2
//   - blanks: unchanged shape (v2 BlankResponse adds optional `confidence`,
//     which is absent in v1; absence is valid for an optional field)
//   - checkpointResults: absent (v1 had no checkpoint concept)
export function migrateSubmissionResponses(raw: unknown): SubmissionResponses {
  // Try v2 first (the common case for new data).
  const v2 = SubmissionResponses.safeParse(raw);
  if (v2.success) return v2.data;

  // Fall back to v1 and migrate forward. This will throw if the input
  // matches neither shape, which is the correct behavior — corrupted or
  // unknown-version submissions should fail loudly, not silently pass.
  const v1 = SubmissionResponsesV1.parse(raw);
  return {
    schemaVersion: 2,
    blanks: v1.blanks,
  };
}
