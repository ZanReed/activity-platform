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
// v1 SCOPE (CHECK_WIRE_VERSION below): the DOM-family categories — blanks
// (incl. math-gap ids), choices, matching, ordering, free text. The graph
// family's state payloads (interactive_graph / number_line / data_plot) are
// deliberately NOT typed yet: their wire shape gets designed WITH the
// kit-backed exemplar (build-order V9), not invented ahead of it. Adding them
// bumps CHECK_WIRE_VERSION.
// =============================================================================

import type { SanitizedInlineNode } from '../sanitize/sanitized-types.js';

/** Bump on any incompatible change to the request/result shapes. S4's RPC
 * must accept the version it was built against — the mock and the store stamp
 * it into every request. */
export const CHECK_WIRE_VERSION = 1;

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
}

export function emptySectionResponses(): SectionResponses {
  return { blanks: {}, choices: {}, matches: {}, orderings: {}, freeText: {} };
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
