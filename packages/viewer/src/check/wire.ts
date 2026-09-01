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
// v2 → v3 (correspondence, wishlist #4): adds the `correspondences` response
// map. Exact-match versioning (no tolerance window): a v2 client against a v3
// server gets the version-mismatch refusal and its "refresh to continue" copy.
export const CHECK_WIRE_VERSION = 3;

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
  /** correspondence block id → { item id → { column id → target id } } for
   * docked cells (wire v3). WORK ONLY, like every map here — earned/total
   * never travel client → server. */
  correspondences: Record<
    string,
    Record<string, Record<string, string>>
  >;
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
  /** transform_curve: the typed equation, as the math field's ascii-math
   * mirror (the MA-D3 precedent — the server parses it with the shared
   * formula parser). ADDITIVE (the `shape` rule): absent means the typed
   * channel is unanswered, never a default. */
  equation?: string;
  /** transform_curve: true once the student has actually MOVED a handle.
   * ADDITIVE, and load-bearing (design A1): the equation field forces the
   * widget to emit, and the emit carries the seed positions — which sit on
   * the parent curve. Without this flag a type-only student would be scored
   * as having DRAWN the parent. Absent = not dragged. */
  dragged?: boolean;
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
    correspondences: {},
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
  /**
   * Client-minted idempotency key (S4). ADDITIVE and optional, so no version
   * bump: a client that omits it simply gets no replay protection.
   *
   * The store mints one when a check first fires and reuses it while that check
   * is being retried, so a response lost in transit replays the recorded
   * attempt instead of minting a second one. Edge cold starts were measured at
   * 3-4 s — long enough for a student to give up and press Check again, which
   * would otherwise show their teacher two attempts for one piece of work. A
   * deliberate RE-check gets a fresh key, because that genuinely is a new
   * attempt.
   */
  idempotencyKey?: string;
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
  /** The matched distractors' misconception bindings (opaque `mis.*` tags from
   * the author's registry), present only on an `incorrect` verdict whose
   * matched mistake/choice carries one. Additive-optional — no wire bump.
   *
   * A LIST because one item can demonstrate several misconceptions at once: a
   * multi-select student who ticks two mapped distractors demonstrated both,
   * and a single-string shape would drop one silently AND force a dual-shape
   * migration once rows existed (eng review A1). Blanks and graphs emit one
   * element; the field is absent, never empty, when nothing matched.
   *
   * Stored verbatim with the verdicts row (S4-B4), which is what makes the
   * misconception signal aggregable; the client may ignore it. */
  misconceptionIds?: string[];
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

/** One scored rubric criterion, as the student sees it. */
export interface ReleasedCriterion {
  criterionId: string;
  earned: number;
  /** Denormalized at grade time (0034 §C) — the student read never opens the
   * document, so the rubric's maximum has to travel with the score. */
  maxPoints: number;
  /** PLAIN TEXT in v1 (0034 G3): the teacher types prose, React escapes it,
   * and there is no inline-node payload to sanitize. Rich feedback is a
   * future additive change to this field, not a reinterpretation of it. */
  feedbackText?: string;
}

export interface ReleasedBlockFeedback {
  feedbackText?: string;
  criteria: ReleasedCriterion[];
  /** Which attempt the teacher actually graded. */
  attemptNumber: number;
  /** The version the graded work belonged to. When it is not the served
   * version, the block ids do not correspond and the viewer says so instead of
   * mapping (G6: tag, don't map). */
  activityVersionId: string;
  /** The student's TEXT changed after this was graded (G2). Never "a newer
   * check exists" — re-checking to retry auto-graded blanks is a designed
   * feature and would otherwise flag every revision that never happened. */
  stale: boolean;
  /** false ⇒ the grading account is gone (0034's SET NULL); the card says
   * "a former teacher" rather than naming nobody. */
  hasGrader: boolean;
}

export interface ReleasedFeedbackResult {
  /** graded=false ⇒ nothing released yet.
   *
   * ⚠ It is ALSO what a FAILED read returns. That is deliberate (G14): this
   * call is the one new network dependency on the student's read path, and the
   * offline-reopen guarantee (S9 Drop 5) must survive it being unreachable. A
   * throw here would take down a worksheet the student can otherwise use. */
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
