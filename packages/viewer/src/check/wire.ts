// =============================================================================
// check/wire.ts — the section-check wire contract (S3 ruling D11; freezes R1)
// -----------------------------------------------------------------------------
// THE contract-freeze artifact between lane B (viewer, S3) and lane A (grading
// RPC, S4). The viewer's store calls a `CheckService`; S3 ships the scriptable
// mock (./mock.ts), S4 ships the real implementation — BOTH import these types
// from HERE. If S4 needs a different shape, it changes this file and the
// compiler surfaces every affected consumer; the mock can never silently
// become its own divergent spec.
//
// Ruled semantics this file encodes:
//   - Responses are ITEM-ID-KEYED, never positional (ruling R1): `ordering`
//     and `matching` are served permuted per student (serve-time shuffle; the
//     authored order IS the answer key), so a positional wire would grade
//     exactly the shuffled blocks wrong. Ids come from the sanitized document.
//   - Response categories are PARALLEL MAPS, mirroring the submission wire's
//     standing rule ("don't widen answer to a union — a new category gets its
//     own map").
//   - Check granularity is the SECTION (ruling P2A: one batched RPC per
//     section check, atomic).
//   - The result carries SOLUTIONS: the sanitizer strips `solution` from the
//     served document, and the server reveals it only after a section check
//     (Q2B / family-spec rule 4). Without this channel the unlock could never
//     happen — the client does not have the content.
//   - `recorded`-family items get verdict 'recorded' (never correct/incorrect
//     — family-spec: a student must not read auto-grading into a captured
//     free-text answer). Released teacher feedback arrives via
//     `fetchReleasedFeedback` (the get-feedback precedent), NOT via check.
//
// v2 (V9) adds `graphs`, the geometric-input category shared by
// interactive_graph / number_line / data_plot. Designed WITH the kit-backed
// exemplar rather than ahead of it, and deliberately NOT a copy of the old
// submission wire's GraphResponse: that shape carries `correct` (and
// `earned`/`total`), computed client-side in the published page because the
// answer key was baked into the HTML. Under Q2B the client has no answer key
// and no opinion about correctness, so the student→server direction carries
// WORK ONLY. Verdicts travel the other way, in CheckItemResult.
// =============================================================================

import type { SanitizedInlineNode } from '../sanitize/sanitized-types.js';

/** Bump on any incompatible change to the request/result shapes. S4's RPC
 * must accept the version it was built against — the mock and the store stamp
 * it into every request. */
export const CHECK_WIRE_VERSION = 2;

// ---- Responses (student → server) ------------------------------------------

/** Item-id-keyed response maps for one section. Every key is an id from the
 * SERVED (sanitized) document; values are the student's current input at
 * check time (ruling 2.2A: checks grade CURRENT values at fire time). */
export interface SectionResponses {
  /** blank id (or in-equation gap id, `g`+hex) → typed value. Math blanks
   * store the ascii-math mirror form (MA-D3) — same as today's wire. */
  blanks: Record<string, string>;
  /** multiple_choice block id → selected choice id(s). */
  choices: Record<string, string[]>;
  /** matching block id → { item id → target id } for placed pairs. */
  matches: Record<string, Record<string, string>>;
  /** ordering block id → item ids in the student's arrangement. NEVER
   * positions: the served order differs per student. */
  orderings: Record<string, string[]>;
  /** free-text block id (self_explanation / short_answer / essay) → text. */
  freeText: Record<string, string>;
  /** graph-family block id → the student's geometric work (wire v2). */
  graphs: Record<string, GraphWork>;
}

/** What a student built on a graphing surface. Mirrors the geometry the old
 * submission wire stored, MINUS every grading field — see the v2 note above.
 * One shape across the three graph-family blocks (a number line is a 1-D graph
 * and a data plot is a categorical one), because the server dispatches on the
 * served block's interaction type, which it already knows. */
export interface GraphWork {
  /** The served interaction type ('plot_point', 'build_histogram', …) — lets
   * the grader validate that the work matches the question it was served. */
  interaction: string;
  /** Every point/handle the student placed, in graph units. 1-D surfaces use
   * [x, 0]; categorical plots use [binIndex, height]. */
  points: [number, number][];
  /** The student chose "cannot be graphed" (blocks with allowNoSolution).
   * `points` may legitimately be empty when this is true. */
  noSolution?: boolean;
  /** Domain-restricted curves (rays, segments, intervals): endpoint positions
   * and their open/closed styles. */
  domain?: {
    minX?: number;
    minStyle?: 'open' | 'closed';
    maxX?: number;
    maxStyle?: 'open' | 'closed';
  };
  /** Per-object work for multi-object questions (inequality systems, "graph
   * both lines"). Absent for single-object questions. */
  parts?: Array<{
    points?: [number, number][];
    strict?: boolean;
    side?: string;
  }>;
  /** plot_ray / plot_segment: the shape the student chose. ADDITIVE (S4) —
   * added when server-side grading revealed that the two linear-piece
   * interactions were sending geometry the grader could not score. The kit has
   * always produced it (`GraphResponseData.shape`); the check wire simply
   * dropped it, because the wire was designed against the point/curve
   * interactions where it doesn't exist.
   *
   * Absent means NOT CHOSEN, which the grader must treat as unanswered rather
   * than defaulting — "the student didn't pick a direction" and "the student
   * picked the wrong direction" are different marks. */
  shape?: 'ray_positive' | 'ray_negative' | 'segment';
  /** plot_ray / plot_segment: open/closed choices for the endpoints the chosen
   * shape actually shows — `[endpointStyle]` for a ray, `[lesserStyle,
   * greaterStyle]` for a segment, absent/empty when no shape is chosen.
   *
   * These are ANSWER CONTENT, not presentation: "2 ≤ x < 7" and "2 < x < 7"
   * are different answers to the same question, exactly as they are for
   * number_line's plot_interval (which is why that one already carries its
   * styles in `domain`). */
  endpointStyles?: Array<'open' | 'closed'>;
}

export function emptySectionResponses(): SectionResponses {
  return {
    blanks: {},
    choices: {},
    matches: {},
    orderings: {},
    freeText: {},
    graphs: {},
  };
}

export interface CheckRequest {
  wireVersion: typeof CHECK_WIRE_VERSION;
  activityId: string;
  versionId: string;
  sectionId: string;
  responses: SectionResponses;
}

// ---- Results (server → student) --------------------------------------------

/** 'recorded' is the terminal verdict for the free-text family — captured for
 * the teacher, never judged. */
export type ItemVerdict = 'correct' | 'incorrect' | 'recorded';

export interface CheckItemResult {
  verdict: ItemVerdict;
  /** Server-selected feedback (authored hint / mistakeFeedback / per-choice
   * feedback — ruling 2.1A). Absent = mark-only, the designed default. */
  feedback?: SanitizedInlineNode[];
}

export interface SectionCheckResult {
  wireVersion: typeof CHECK_WIRE_VERSION;
  sectionId: string;
  /** Keyed by the SAME item ids the request's responses used. */
  items: Record<string, CheckItemResult>;
  /** block id → the solution content the sanitizer stripped, revealed by the
   * server after this section check (Q2B unlock). Only blocks in this section
   * appear; absence = that block has no solution or it stays locked. */
  solutions: Record<string, SanitizedInlineNode[]>;
}

// ---- Released teacher feedback (recorded family, D15) -----------------------

export interface ReleasedBlockFeedback {
  feedback?: SanitizedInlineNode[];
  score?: number;
  maxScore?: number;
}

export interface ReleasedFeedbackResult {
  /** graded=false ⇒ nothing released yet (get-feedback precedent). */
  graded: boolean;
  /** free-text block id → released teacher feedback. */
  blocks: Record<string, ReleasedBlockFeedback>;
}

// ---- The port ---------------------------------------------------------------

/** The seam between the viewer store and grading. S3: ./mock.ts. S4: the real
 * batched RPC client, implementing THIS interface. */
export interface CheckService {
  checkSection(request: CheckRequest): Promise<SectionCheckResult>;
  fetchReleasedFeedback(activityId: string): Promise<ReleasedFeedbackResult>;
}
