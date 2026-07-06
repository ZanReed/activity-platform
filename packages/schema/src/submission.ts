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
//   v2 → v3 (Stage 5, Phase 2.7): adds the optional graphResponses map for
//                       interactive-graph blocks. v2 submissions migrate-on-
//                       read to v3 by setting schemaVersion: 3 (graphResponses
//                       simply absent — valid for an optional field).
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

// One interactive-graph block's response (Phase 2.7). Mirrors the block's
// interaction discriminated union — each variant carries the student's
// structured geometric input plus the same correctness/confidence fields
// blanks have. Like BlankResponse, `correct` is computed CLIENT-SIDE in the
// published page's lazy-loaded kit (the answer key is baked into the HTML) —
// convenience for the teacher viewer, not authoritative grading. Kept a
// discriminated union so plot_line / shade_region add a variant here with no
// change to consumers that branch on `type`. Slice 1 (2.7a) ships plot_point.
export const PointResponse = z.object({
  type: z.literal('plot_point'),
  // Every point the student plotted, in graph units. Order follows the block's
  // correctPoints for multi-point questions; a single point is the common case.
  studentPoints: z.array(z.tuple([z.number(), z.number()])),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type PointResponse = z.infer<typeof PointResponse>;

export const GraphResponse = z.discriminatedUnion('type', [PointResponse]);
export type GraphResponse = z.infer<typeof GraphResponse>;

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

// ---- v2 (legacy) shape ------------------------------------------------------
// Pre-Stage-5 submissions. Kept so we can read old rows and migrate them
// forward on read. Never written by new code.
export const SubmissionResponsesV2 = z.object({
  schemaVersion: z.literal(2),
                                              blanks: z.record(z.string().uuid(), BlankResponse),
                                              checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
});
export type SubmissionResponsesV2 = z.infer<typeof SubmissionResponsesV2>;

// ---- v3 (current) shape -----------------------------------------------------
// New submissions write this shape. Application code that reads submissions
// from the database calls migrateSubmissionResponses() once after reading
// to handle v1/v2/v3 uniformly.
export const SubmissionResponses = z.object({
  schemaVersion: z.literal(3),
                                            // Keyed by blank.id (uuid).
                                            blanks: z.record(z.string().uuid(), BlankResponse),
                                            // Keyed by section.id. Only present in locked/free submission modes for
                                            // sections that were actually checkpoint-checked. Absent in single mode
                                            // and absent for non-checkpoint sections.
                                            checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
                                            // Keyed by interactive_graph block.id (uuid). Absent when the activity
                                            // has no graph blocks or none were answered. Sibling to `blanks`, never
                                            // merged into it — geometric answers are shaped differently and the
                                            // dashboard renders them differently (see the extension pattern above).
                                            graphResponses: z.record(z.string().uuid(), GraphResponse).optional(),
});
export type SubmissionResponses = z.infer<typeof SubmissionResponses>;

// ---- Migration --------------------------------------------------------------
// Reads a stored submission of any shape and returns the current (v3) shape.
// Application code that consumes submissions calls this once after reading
// from the database; older input shapes are never propagated past this layer.
// The Edge Function writes only the current shape.
//
// v2 → v3 migration:
//   - schemaVersion: 2 → 3
//   - blanks / checkpointResults: unchanged
//   - graphResponses: absent (v2 had no graph blocks)
// v1 → v3 migration:
//   - schemaVersion: 1 → 3
//   - blanks: unchanged shape (BlankResponse adds optional `confidence`,
//     absent in v1; absence is valid for an optional field)
//   - checkpointResults / graphResponses: absent
export function migrateSubmissionResponses(raw: unknown): SubmissionResponses {
  // Try the current shape first (the common case for new data).
  const v3 = SubmissionResponses.safeParse(raw);
  if (v3.success) return v3.data;

  // v2: promote by bumping the version; blanks + checkpointResults carry over.
  const v2 = SubmissionResponsesV2.safeParse(raw);
  if (v2.success) {
    return {
      schemaVersion: 3,
      blanks: v2.data.blanks,
      ...(v2.data.checkpointResults && {
        checkpointResults: v2.data.checkpointResults,
      }),
    };
  }

  // Fall back to v1 and migrate forward. This will throw if the input matches
  // no known shape, which is the correct behavior — corrupted or unknown-
  // version submissions should fail loudly, not silently pass.
  const v1 = SubmissionResponsesV1.parse(raw);
  return {
    schemaVersion: 3,
    blanks: v1.blanks,
  };
}
