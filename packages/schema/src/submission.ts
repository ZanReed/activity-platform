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
//   v4 → v5 (multiple choice): adds the optional `choices` map for
//                       multiple_choice blocks (ChoiceResponse: selected
//                       choice ids + correct + confidence). v4 rows migrate
//                       on read by setting schemaVersion: 5.
//   v5 → v6 (matching + ordering): adds the optional `matches` map
//                       (MatchResponse: item→target pairs + per-pair
//                       earned/total) and `orderings` map (OrderResponse:
//                       the arranged item-id sequence, all-or-nothing).
//                       v5 rows migrate on read by setting schemaVersion: 6.
//   v6 → v7 (number line): adds the optional `numberLineResponses` map
//                       (NumberLineResponse: plotted 1-D points, or an
//                       interval/ray with open/closed bounds; all-or-nothing).
//                       v6 rows migrate on read by setting schemaVersion: 7.
//   v7 → v8 (data plot): adds the optional `dataPlotResponses` map
//                       (DataPlotResponse: the student's built chart, e.g. the
//                       plotted dot-plot values; all-or-nothing). display-mode
//                       data_plots are ungraded stimuli and never appear here.
//                       v7 rows migrate on read by setting schemaVersion: 8.
//   v8 → v9 (self-explanation): adds the optional `freeResponses` map
//                       (FreeResponse: ungraded free text, just { text }). Never
//                       scored. v8 rows migrate on read by setting
//                       schemaVersion: 9.
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
//     choices         — SHIPPED at v5 (multiple choice, single + multi-select)
//     matches         — SHIPPED at v6 (matching pairs, per-pair earned/total)
//     orderings       — SHIPPED at v6 (ordering / sequencing, all-or-nothing)
//     freeResponses   — SHIPPED at v9 (self-explanation; Phase 2.6 short_answer
//                       / essay reuse the same map, no further wire bump)
//     graphResponses  — Phase 2.7 interactive graphs
//     numberLineResponses — Phase 2.7 number-line blocks (1-D)
//     dataPlotResponses — Phase 2.7 data-plot blocks (stats charts)
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

// plot_function (Phase 2.7 2.7b): the student placed N points defining a curve.
// We store the raw points (uniform with plot_point); the fitted parameters are
// re-derivable from them with the same engine that scored it, so the dashboard
// can show "student's line" without a second stored shape.
export const FunctionResponse = z.object({
  type: z.literal('plot_function'),
  studentPoints: z.array(z.tuple([z.number(), z.number()])),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type FunctionResponse = z.infer<typeof FunctionResponse>;

// shade_region (2.7c): studentPoints are the polygon's vertices in order.
export const RegionResponse = z.object({
  type: z.literal('shade_region'),
  studentPoints: z.array(z.tuple([z.number(), z.number()])),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type RegionResponse = z.infer<typeof RegionResponse>;

// graph_inequality (Drop 4): the boundary handles + the two graded choices.
// side left/right appears with vertical boundaries; above/below otherwise.
export const InequalityResponse = z.object({
  type: z.literal('graph_inequality'),
  studentPoints: z.array(z.tuple([z.number(), z.number()])),
  strict: z.boolean(),
  side: z.enum(['above', 'below', 'left', 'right']),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type InequalityResponse = z.infer<typeof InequalityResponse>;

// plot_ray / plot_segment (Drop C — first-class rays/segments). studentPoints
// carries [from, through] for a ray and [end, end] for a segment; the endpoint
// style choices ride alongside. v4-only members: pages that emit them are
// published AFTER the Drop C ingest deploy, and adding union members ACCEPTS
// MORE — no stored row is invalidated and no version bump is needed.
export const RayResponse = z.object({
  type: z.literal('plot_ray'),
  studentPoints: z.array(z.tuple([z.number(), z.number()])),
  // The student's chosen SHAPE (ray direction / segment) — a graded part of
  // the answer since the shape-toggle widget; absent = never chosen (or a
  // pre-toggle submission). Optional + additive within v4.
  shape: z.enum(['ray_positive', 'ray_negative', 'segment']).optional(),
  fromStyle: z.enum(['open', 'closed']),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type RayResponse = z.infer<typeof RayResponse>;

export const SegmentResponse = z.object({
  type: z.literal('plot_segment'),
  studentPoints: z.array(z.tuple([z.number(), z.number()])),
  shape: z.enum(['ray_positive', 'ray_negative', 'segment']).optional(),
  endpoints: z.tuple([z.enum(['open', 'closed']), z.enum(['open', 'closed'])]),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type SegmentResponse = z.infer<typeof SegmentResponse>;

// graph_inequality_system (Graph systems): the student's answer to a SYSTEM of
// inequalities — a graph_inequality with inequalities.length > 1. `parts` is one
// InequalityResponse per authored boundary the student plotted (each carries its
// own boundary points + side + style, so mixed strict/inclusive boundaries are
// per-part). `correct` is the match-all AND — every authored inequality paired,
// order-independently, with a distinct student part; `earned`/`total` (via
// V4Extras below) carry per-inequality partial credit (matched / N) when the
// block's partialCredit flag is on. Like BlankResponse, `correct` is computed
// CLIENT-SIDE in the published page's lazy kit — convenience for the teacher
// viewer, not authoritative grading. A NEW additive member: pages that emit it
// are published AFTER the ingest redeploy, and widening the union only ACCEPTS
// MORE, so no submission.schemaVersion bump (the plot_ray / plot_segment
// precedent). N=1 never emits this — the runtime keeps the plain single
// InequalityResponse for one boundary (byte-identical to today).
export const SystemInequalityResponse = z.object({
  type: z.literal('graph_inequality_system'),
  // One per boundary; at least two for a real system, but min(1) keeps the
  // scorer/parse total (an under-count can't match every authored key → wrong).
  parts: z.array(InequalityResponse).min(1),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type SystemInequalityResponse = z.infer<typeof SystemInequalityResponse>;

export const GraphResponse = z.discriminatedUnion('type', [
  PointResponse,
  FunctionResponse,
  RegionResponse,
  InequalityResponse,
]);
export type GraphResponse = z.infer<typeof GraphResponse>;

// v4 graph responses widen every variant with the Drop 4 optionals: `noSolution`
// (the student chose "cannot be graphed"; studentPoints may be empty) and
// `earned`/`total` (per-part partial credit, present only when the block's
// partialCredit flag is on). Applied as an extension of each variant so v3 rows
// (no such fields) remain valid v4 rows.
const V4Extras = {
  noSolution: z.boolean().optional(),
  earned: z.number().nonnegative().optional(),
  total: z.number().positive().optional(),
  // Domain-restricted plot_function (rays/segments): the student's endpoint
  // positions + open/closed choices. Optional and additive within v4.
  domain: z
    .object({
      minX: z.number().optional(),
      minStyle: z.enum(['open', 'closed']).optional(),
      maxX: z.number().optional(),
      maxStyle: z.enum(['open', 'closed']).optional(),
    })
    .optional(),
};
export const GraphResponseV4 = z.discriminatedUnion('type', [
  PointResponse.extend(V4Extras),
  FunctionResponse.extend(V4Extras),
  RegionResponse.extend(V4Extras),
  InequalityResponse.extend(V4Extras),
  RayResponse.extend(V4Extras),
  SegmentResponse.extend(V4Extras),
  // Graph systems: additive member. earned/total (V4Extras) carry the
  // per-inequality partial credit; noSolution/domain ride along but are unused
  // by a system (kept for union uniformity, like every other member).
  SystemInequalityResponse.extend(V4Extras),
]);
export type GraphResponseV4 = z.infer<typeof GraphResponseV4>;

// Per-section checkpoint result, captured when a student clicks "Check this
// section" in locked/free submission modes. Keyed by section.id in the
// parent SubmissionResponses.checkpointResults map. Not present in
// single-mode submissions or for sections without isCheckpoint = true.
export const CheckpointResult = z.object({
  checkedAt: z.string().datetime(),                  // ISO timestamp from runtime
                                         score: z.number().nonnegative(), // fractional under partialCredit (v4)
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

// ---- v3 (legacy) shape --------------------------------------------------------
// Pre-Drop-4 submissions (and pages published before the v4 runtime that are
// still live). Kept so ingest keeps ACCEPTING v3 posts and stored rows migrate
// forward on read. Never written by new code.
export const SubmissionResponsesV3 = z.object({
  schemaVersion: z.literal(3),
  blanks: z.record(z.string().uuid(), BlankResponse),
  checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
  graphResponses: z.record(z.string().uuid(), GraphResponse).optional(),
});
export type SubmissionResponsesV3 = z.infer<typeof SubmissionResponsesV3>;

// ---- v4 (legacy) shape --------------------------------------------------------
// Pre-multiple-choice submissions (and pages published before the v5 runtime
// that are still live). Kept so ingest keeps ACCEPTING v4 posts and stored rows
// migrate forward on read. Never written by new code.
export const SubmissionResponsesV4 = z.object({
  schemaVersion: z.literal(4),
  blanks: z.record(z.string().uuid(), BlankResponse),
  checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
  graphResponses: z.record(z.string().uuid(), GraphResponseV4).optional(),
});
export type SubmissionResponsesV4 = z.infer<typeof SubmissionResponsesV4>;

// One multiple_choice block's response: which choice ids the student selected
// (one for single-select, any number for multi-select) plus the same
// correctness/confidence fields blanks have. Like BlankResponse, `correct` is
// computed CLIENT-SIDE in the published page's runtime (the answer key is
// baked into the HTML) — convenience for the teacher viewer, not authoritative
// grading. All-or-nothing: correct means the selected SET equals the correct
// set (per-choice partial credit is a future additive field, mirroring the
// graph block's earned/total precedent).
export const ChoiceResponse = z.object({
  // Selected choice ids (MultipleChoiceOption.id), in document order.
  // Non-empty: an unanswered block is simply absent from the map (an
  // omission), like an unanswered graph.
  selected: z.array(z.string().uuid()).min(1),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type ChoiceResponse = z.infer<typeof ChoiceResponse>;

// ---- v5 (legacy) shape --------------------------------------------------------
// Pre-matching/ordering submissions (and pages published before the v6 runtime
// that are still live). Kept so ingest keeps ACCEPTING v5 posts and stored rows
// migrate forward on read. Never written by new code.
export const SubmissionResponsesV5 = z.object({
  schemaVersion: z.literal(5),
  blanks: z.record(z.string().uuid(), BlankResponse),
  checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
  graphResponses: z.record(z.string().uuid(), GraphResponseV4).optional(),
  choices: z.record(z.string().uuid(), ChoiceResponse).optional(),
});
export type SubmissionResponsesV5 = z.infer<typeof SubmissionResponsesV5>;

// One matching block's response: which target the student docked on each item.
// Like BlankResponse, `correct` is computed CLIENT-SIDE in the published page's
// runtime (the answer key is baked into the HTML) — convenience for the teacher
// viewer, not authoritative grading. Scored PER PAIR: `earned` of `total` items
// carry the keyed target (`total` = the block's item count, so an unpaired item
// within an answered block scores as a wrong pair); `correct` = earned === total.
export const MatchResponse = z.object({
  // item id → docked target id. Non-empty: a block with no pairs made is an
  // omission (absent from the map), like an unanswered graph or MC block.
  pairs: z
    .record(z.string().uuid(), z.string().uuid())
    .refine((pairs) => Object.keys(pairs).length > 0, {
      message: 'an answered matching block has at least one pair',
    }),
  correct: z.boolean(),
  earned: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  confidence: ConfidenceLevel.optional(),
});
export type MatchResponse = z.infer<typeof MatchResponse>;

// One ordering block's response: the student's full arrangement (every item id,
// in their chosen sequence). All-or-nothing: `correct` = the sequence equals
// the authored order exactly. An untouched (still-shuffled) list is an
// omission — the runtime only records a response once the student has moved
// something.
export const OrderResponse = z.object({
  order: z.array(z.string().uuid()).min(2),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type OrderResponse = z.infer<typeof OrderResponse>;

// One number_line block's response (1-D). Like BlankResponse, `correct` is
// computed CLIENT-SIDE in the published page's lazy kit (the answer key is baked
// into the HTML) — convenience for the teacher viewer, not authoritative
// grading. Discriminated on `type` so plot_ray / display add a variant here with
// no consumer change. Slice 1 ships plot_point + plot_interval.
export const NumberLinePointResponse = z.object({
  type: z.literal('plot_point'),
  // Every position the student plotted, in line units. Order follows the block's
  // correctPoints for multi-point questions; a single point is the common case.
  studentPoints: z.array(z.number()),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type NumberLinePointResponse = z.infer<typeof NumberLinePointResponse>;

// plot_interval: the student's interval/ray — present bounds + open/closed
// styles, same shape as the block's correctInterval. An absent bound is an
// unbounded (ray) end.
export const NumberLineIntervalResponse = z.object({
  type: z.literal('plot_interval'),
  min: z.number().optional(),
  minStyle: z.enum(['open', 'closed']).optional(),
  max: z.number().optional(),
  maxStyle: z.enum(['open', 'closed']).optional(),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type NumberLineIntervalResponse = z.infer<
  typeof NumberLineIntervalResponse
>;

export const NumberLineResponse = z.discriminatedUnion('type', [
  NumberLinePointResponse,
  NumberLineIntervalResponse,
]);
export type NumberLineResponse = z.infer<typeof NumberLineResponse>;

// One data_plot block's response. Like BlankResponse, `correct` is computed
// CLIENT-SIDE in the published page's lazy kit (the answer key — the frequency
// distribution of the block's dataset — is derived in the HTML) — convenience
// for the teacher viewer, not authoritative grading. Discriminated on `type`
// so build_histogram / build_boxplot add a variant here with no consumer
// change. Slice 1 ships build_dotplot; `display` data_plots are ungraded
// stimuli and never produce a response.
export const DataPlotDotplotResponse = z.object({
  type: z.literal('build_dotplot'),
  // Every dot the student placed, as its value on the axis (a multiset — the
  // frequency map derives from counting). Non-empty: a block with no dots is an
  // omission (absent from the map), like an unanswered graph or number line.
  studentValues: z.array(z.number()).min(1),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type DataPlotDotplotResponse = z.infer<typeof DataPlotDotplotResponse>;

// build_histogram: the student's per-bin frequencies, in bin order (left→right).
// Non-empty; an untouched histogram is an omission (absent from the map).
export const DataPlotHistogramResponse = z.object({
  type: z.literal('build_histogram'),
  studentBins: z.array(z.number()).min(1),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type DataPlotHistogramResponse = z.infer<
  typeof DataPlotHistogramResponse
>;

// build_boxplot: the student's placed five-number summary (line units).
export const DataPlotBoxplotResponse = z.object({
  type: z.literal('build_boxplot'),
  studentFive: z.object({
    min: z.number(),
    q1: z.number(),
    median: z.number(),
    q3: z.number(),
    max: z.number(),
  }),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});
export type DataPlotBoxplotResponse = z.infer<typeof DataPlotBoxplotResponse>;

// The three build variants are additive members: widening the union only ACCEPTS
// MORE, so pages that emit histogram/box responses (published after the ingest
// that carries this widened union) need no wire-format bump — the same discipline
// the graph block's plot_ray/plot_segment used within v4. A build_dotplot-only
// page keeps validating.
export const DataPlotResponse = z.discriminatedUnion('type', [
  DataPlotDotplotResponse,
  DataPlotHistogramResponse,
  DataPlotBoxplotResponse,
]);
export type DataPlotResponse = z.infer<typeof DataPlotResponse>;

// ---- v6 (legacy) shape --------------------------------------------------------
// Pre-number-line submissions (and pages published before the v7 runtime that
// are still live). Kept so ingest keeps ACCEPTING v6 posts and stored rows
// migrate forward on read. Never written by new code.
export const SubmissionResponsesV6 = z.object({
  schemaVersion: z.literal(6),
  blanks: z.record(z.string().uuid(), BlankResponse),
  checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
  graphResponses: z.record(z.string().uuid(), GraphResponseV4).optional(),
  choices: z.record(z.string().uuid(), ChoiceResponse).optional(),
  matches: z.record(z.string().uuid(), MatchResponse).optional(),
  orderings: z.record(z.string().uuid(), OrderResponse).optional(),
});
export type SubmissionResponsesV6 = z.infer<typeof SubmissionResponsesV6>;

// ---- v7 (legacy) shape --------------------------------------------------------
// Pre-data-plot submissions (and pages published before the v8 runtime that are
// still live). Kept so ingest keeps ACCEPTING v7 posts and stored rows migrate
// forward on read. Never written by new code.
export const SubmissionResponsesV7 = z.object({
  schemaVersion: z.literal(7),
  blanks: z.record(z.string().uuid(), BlankResponse),
  checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
  graphResponses: z.record(z.string().uuid(), GraphResponseV4).optional(),
  choices: z.record(z.string().uuid(), ChoiceResponse).optional(),
  matches: z.record(z.string().uuid(), MatchResponse).optional(),
  orderings: z.record(z.string().uuid(), OrderResponse).optional(),
  numberLineResponses: z
    .record(z.string().uuid(), NumberLineResponse)
    .optional(),
});
export type SubmissionResponsesV7 = z.infer<typeof SubmissionResponsesV7>;

// One self_explanation block's response: the free text the student wrote.
// UNGRADED — there is no `correct` field and it never contributes to the score;
// the teacher dashboard shows the text raw. This is the shape the reserved
// `freeResponses` map carries, and it is deliberately minimal (just a string)
// so Phase 2.6 short_answer / essay reuse it unchanged — their grading lives in
// a separate table, not in the response. Non-empty: an untouched prompt is an
// omission (absent from the map), like any other unanswered block.
export const FreeResponse = z.object({
  text: z.string().min(1),
});
export type FreeResponse = z.infer<typeof FreeResponse>;

// ---- v8 (legacy) shape --------------------------------------------------------
// Pre-self-explanation submissions (and pages published before the v9 runtime
// that are still live). Kept so ingest keeps ACCEPTING v8 posts and stored rows
// migrate forward on read. Never written by new code.
export const SubmissionResponsesV8 = z.object({
  schemaVersion: z.literal(8),
  blanks: z.record(z.string().uuid(), BlankResponse),
  checkpointResults: z.record(z.string().uuid(), CheckpointResult).optional(),
  graphResponses: z.record(z.string().uuid(), GraphResponseV4).optional(),
  choices: z.record(z.string().uuid(), ChoiceResponse).optional(),
  matches: z.record(z.string().uuid(), MatchResponse).optional(),
  orderings: z.record(z.string().uuid(), OrderResponse).optional(),
  numberLineResponses: z
    .record(z.string().uuid(), NumberLineResponse)
    .optional(),
  dataPlotResponses: z.record(z.string().uuid(), DataPlotResponse).optional(),
});
export type SubmissionResponsesV8 = z.infer<typeof SubmissionResponsesV8>;

// ---- v9 (current) shape -------------------------------------------------------
// New submissions write this shape. v8 → v9 (self-explanation): adds the
// optional `freeResponses` map (ungraded free text). Application code that reads
// submissions calls migrateSubmissionResponses() once after reading to handle
// v1–v9 uniformly.
export const SubmissionResponses = z.object({
  schemaVersion: z.literal(9),
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
  graphResponses: z.record(z.string().uuid(), GraphResponseV4).optional(),
  // Keyed by multiple_choice block.id (uuid). Absent when the activity has
  // no MC blocks or none were answered (same omission rule as graphs).
  choices: z.record(z.string().uuid(), ChoiceResponse).optional(),
  // Keyed by matching block.id (uuid). Same omission rule.
  matches: z.record(z.string().uuid(), MatchResponse).optional(),
  // Keyed by ordering block.id (uuid). Same omission rule.
  orderings: z.record(z.string().uuid(), OrderResponse).optional(),
  // Keyed by number_line block.id (uuid). Absent when the activity has no
  // number-line blocks or none were answered. Sibling to `graphResponses`,
  // never merged — 1-D geometric answers are shaped differently and the
  // dashboard renders them differently.
  numberLineResponses: z
    .record(z.string().uuid(), NumberLineResponse)
    .optional(),
  // Keyed by data_plot block.id (uuid). Absent when the activity has no
  // graded data-plot blocks or none were answered (display data_plots are
  // ungraded and never appear). Sibling to the other geometric maps.
  dataPlotResponses: z
    .record(z.string().uuid(), DataPlotResponse)
    .optional(),
  // Keyed by self_explanation block.id (uuid). Ungraded free text — never in
  // the score. Absent when the activity has no self-explanation blocks or none
  // were written. Phase 2.6 short_answer / essay will reuse this same map.
  freeResponses: z.record(z.string().uuid(), FreeResponse).optional(),
});
export type SubmissionResponses = z.infer<typeof SubmissionResponses>;

// ---- Migration --------------------------------------------------------------
// Reads a stored submission of any shape and returns the current (v8) shape.
// Application code that consumes submissions calls this once after reading
// from the database; older input shapes are never propagated past this layer.
// The Edge Function writes only the current shape.
//
// Every promotion is "bump the version, carry the maps forward" — each new
// version only ADDED an optional map (or widened a union), so older data is
// always a valid instance of the newer shape with the new fields absent.
export function migrateSubmissionResponses(raw: unknown): SubmissionResponses {
  // Try the current shape first (the common case for new data).
  const v9 = SubmissionResponses.safeParse(raw);
  if (v9.success) return v9.data;

  // v8: promote by bumping the version — freeResponses simply absent.
  const v8 = SubmissionResponsesV8.safeParse(raw);
  if (v8.success) {
    return {
      schemaVersion: 9,
      blanks: v8.data.blanks,
      ...(v8.data.checkpointResults && {
        checkpointResults: v8.data.checkpointResults,
      }),
      ...(v8.data.graphResponses && { graphResponses: v8.data.graphResponses }),
      ...(v8.data.choices && { choices: v8.data.choices }),
      ...(v8.data.matches && { matches: v8.data.matches }),
      ...(v8.data.orderings && { orderings: v8.data.orderings }),
      ...(v8.data.numberLineResponses && {
        numberLineResponses: v8.data.numberLineResponses,
      }),
      ...(v8.data.dataPlotResponses && {
        dataPlotResponses: v8.data.dataPlotResponses,
      }),
    };
  }

  // v7: promote by bumping the version — dataPlotResponses simply absent.
  const v7 = SubmissionResponsesV7.safeParse(raw);
  if (v7.success) {
    return {
      schemaVersion: 9,
      blanks: v7.data.blanks,
      ...(v7.data.checkpointResults && {
        checkpointResults: v7.data.checkpointResults,
      }),
      ...(v7.data.graphResponses && { graphResponses: v7.data.graphResponses }),
      ...(v7.data.choices && { choices: v7.data.choices }),
      ...(v7.data.matches && { matches: v7.data.matches }),
      ...(v7.data.orderings && { orderings: v7.data.orderings }),
      ...(v7.data.numberLineResponses && {
        numberLineResponses: v7.data.numberLineResponses,
      }),
    };
  }

  // v6: promote by bumping the version — numberLineResponses simply absent.
  const v6 = SubmissionResponsesV6.safeParse(raw);
  if (v6.success) {
    return {
      schemaVersion: 9,
      blanks: v6.data.blanks,
      ...(v6.data.checkpointResults && {
        checkpointResults: v6.data.checkpointResults,
      }),
      ...(v6.data.graphResponses && { graphResponses: v6.data.graphResponses }),
      ...(v6.data.choices && { choices: v6.data.choices }),
      ...(v6.data.matches && { matches: v6.data.matches }),
      ...(v6.data.orderings && { orderings: v6.data.orderings }),
    };
  }

  // v5: promote by bumping the version — matches/orderings simply absent.
  const v5 = SubmissionResponsesV5.safeParse(raw);
  if (v5.success) {
    return {
      schemaVersion: 9,
      blanks: v5.data.blanks,
      ...(v5.data.checkpointResults && {
        checkpointResults: v5.data.checkpointResults,
      }),
      ...(v5.data.graphResponses && { graphResponses: v5.data.graphResponses }),
      ...(v5.data.choices && { choices: v5.data.choices }),
    };
  }

  // v4: promote — the choices/matches/orderings maps are simply absent.
  const v4 = SubmissionResponsesV4.safeParse(raw);
  if (v4.success) {
    return {
      schemaVersion: 9,
      blanks: v4.data.blanks,
      ...(v4.data.checkpointResults && {
        checkpointResults: v4.data.checkpointResults,
      }),
      ...(v4.data.graphResponses && { graphResponses: v4.data.graphResponses }),
    };
  }

  // v3: promote — every v3 graph response is a valid v4+ response (the v4
  // fields are optional and the union only widened).
  const v3 = SubmissionResponsesV3.safeParse(raw);
  if (v3.success) {
    return {
      schemaVersion: 9,
      blanks: v3.data.blanks,
      ...(v3.data.checkpointResults && {
        checkpointResults: v3.data.checkpointResults,
      }),
      ...(v3.data.graphResponses && { graphResponses: v3.data.graphResponses }),
    };
  }

  // v2: promote; blanks + checkpointResults carry over.
  const v2 = SubmissionResponsesV2.safeParse(raw);
  if (v2.success) {
    return {
      schemaVersion: 9,
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
    schemaVersion: 9,
    blanks: v1.blanks,
  };
}
