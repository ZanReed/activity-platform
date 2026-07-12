// =============================================================================
// runtime/storage.ts — Persistence (name + activity state)
// -----------------------------------------------------------------------------
// Two persistence concerns:
//
//   1. Student name — carried across activities on this domain so a student
//      filling out several activities only types it once. Single
//      localStorage key, plain string.
//
//   2. Activity state — per (activityId, versionNum) blob restoring the
//      student's work after a page reload: typed values, scoring results,
//      mistake feedback, solution reveal, section scores, lock state,
//      confidence. (Hint-modal open state is deliberately NOT persisted — a
//      reload shouldn't reopen a modal.) Versioned in the key so republishing the
//      activity (versionNum bump) naturally invalidates prior persistence.
//      Schema-versioned inside the blob so a future runtime change can
//      bail cleanly on shape mismatch.
//
// All access is try/catch wrapped — private-mode browsers, locked-down
// Chromebooks, quota exhaustion all degrade silently to "no persistence"
// rather than throwing to the student.
// =============================================================================

import type { RuntimeConfig } from './config.js';
import type { Refs } from './refs.js';
import type {
  RuntimeState,
  BlankState,
  BlockState,
  McBlockState,
  MatchBlockState,
  OrderBlockState,
  GraphBlockState,
  NumberLineBlockState,
  DataPlotBlockState,
  SectionState,
} from './state.js';

// ---------------------------------------------------------------------------
// Student name (cross-activity).
// ---------------------------------------------------------------------------

const STORAGE_KEY_NAME = 'activity_student_name';

export function loadStoredName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_NAME) || '';
  } catch {
    return '';
  }
}

export function saveName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_NAME, name);
  } catch {
    /* private mode etc — ignore */
  }
}

// ---------------------------------------------------------------------------
// Submission id (Phase 2.6 — the capability for fetching manual feedback).
// ---------------------------------------------------------------------------
// The server returns an unguessable submission_id on a successful submit; we
// store it per-activity so the feedback sidecar (runtime/feedback.ts) can later
// fetch this student's per-criterion feedback. NOTE: runtime/feedback.ts reads
// the SAME key inline (it's a separate bundle) — keep the format in sync.

const SUBMISSION_ID_PREFIX = 'activity_submission_id_';

export function saveSubmissionId(activityId: string, submissionId: string): void {
  try {
    localStorage.setItem(SUBMISSION_ID_PREFIX + activityId, submissionId);
  } catch {
    /* private mode etc — feedback is best-effort */
  }
}

// ---------------------------------------------------------------------------
// Activity state (per activityId + versionNum).
// ---------------------------------------------------------------------------

/**
 * Schema version for the StoredActivityState blob. Bump when BlankState,
 * BlockState, SectionState, or the blob's own shape changes in a way
 * older serialized blobs can no longer be interpreted as. Mismatched
 * versions on load → blob is discarded, fresh state.
 *
 * Independent of ActivityDocument.schemaVersion and
 * SubmissionResponses.schemaVersion — those live in the schema package;
 * this one is a runtime-internal concern.
 */
// 3 → 4 (Stage 5): the blob gained a `graphs` map (interactive-graph block
// state — the plotted point, scoring, solution reveal, confidence).
// 4 → 5 (Drop 4): GraphBlockState widened with the inequality choices (strict/
// side), noSolution, and partial-credit earned/total.
// 5 → 6 (multiple choice): the blob gained an `mcs` map (selection, result,
// solution reveal, confidence per multiple_choice block).
// 6 → 7 (matching + ordering): the blob gained `matches` (docked pairs,
// per-pair earned/total) and `orderings` (arrangement + moved flag) maps.
// 7 → 8 (number line): the blob gained a `numberLines` map (plotted points or
// interval/ray bounds + styles, scoring, solution reveal, confidence).
// 8 → 9 (data plot): the blob gained a `dataPlots` map (the student's plotted
// dot values, scoring, solution reveal, confidence per graded data_plot block).
// 9 → 10 (self-explanation): the blob gained a `freeTexts` map (the raw
// textarea value per self_explanation block — no scoring, just restore-on-load).
const STORAGE_SCHEMA_VERSION = 10;
const STORAGE_PREFIX = 'activity_state_';

export interface StoredActivityState {
  schemaVersion: number;
  /** Typed values keyed by blank.id (DOM source-of-truth at persist time). */
  values: Record<string, string>;
  /** Per-blank state snapshot. */
  blanks: Record<string, BlankState>;
  /** Per-block state snapshot. */
  blocks: Record<string, BlockState>;
  /** Per-multiple-choice-block state snapshot. */
  mcs: Record<string, McBlockState>;
  /** Per-matching-block state snapshot. */
  matches: Record<string, MatchBlockState>;
  /** Per-ordering-block state snapshot. */
  orderings: Record<string, OrderBlockState>;
  /** Per-interactive-graph-block state snapshot. */
  graphs: Record<string, GraphBlockState>;
  /** Per-number_line-block state snapshot. */
  numberLines: Record<string, NumberLineBlockState>;
  /** Per-graded-data_plot-block state snapshot. */
  dataPlots: Record<string, DataPlotBlockState>;
  /**
   * Raw textarea value per self_explanation block (DOM source-of-truth at
   * persist time, like `values` for blanks). Ungraded — no state entry;
   * restored straight into the textarea at bootstrap.
   */
  freeTexts: Record<string, string>;
  /** Per-section state snapshot. */
  sections: Record<string, SectionState>;
}

function buildStorageKey(activityId: string, versionNum: number): string {
  return STORAGE_PREFIX + activityId + '_v' + versionNum;
}

/**
 * Persist the full activity state. Gated by !state.submitted — once the
 * activity is submitted, persistence is irrelevant (clearActivityState
 * fires on submit success) and re-writing post-submit edits would just
 * confuse the next session's restore.
 *
 * Reads typed values directly from refs.blanks (DOM input.value). State's
 * BlankState carries scoring results but not the raw typed text, so the
 * DOM is the source of truth for values at persist time.
 */
export function saveActivityState(
  config: RuntimeConfig,
  refs: Refs,
  state: RuntimeState,
): void {
  if (state.submitted) return;
  try {
    const values: Record<string, string> = {};
    for (const [id, ref] of refs.blanks) {
      values[id] = ref.input.value;
    }
    // Free-text textareas (self_explanation / short_answer / essay): snapshot
    // raw non-empty values (DOM is the source of truth, like blank `values`).
    // Empty ones stay out of the blob.
    const freeTexts: Record<string, string> = {};
    for (const [id, ref] of refs.freeText) {
      if (ref.textarea.value.length > 0) freeTexts[id] = ref.textarea.value;
    }
    const blob: StoredActivityState = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      values,
      freeTexts,
      blanks: state.blanks,
      blocks: state.blocks,
      mcs: state.mcs,
      matches: state.matches,
      orderings: state.orderings,
      graphs: state.graphs,
      numberLines: state.numberLines,
      dataPlots: state.dataPlots,
      sections: state.sections,
    };
    localStorage.setItem(
      buildStorageKey(config.activityId, config.versionNum),
                         JSON.stringify(blob),
    );
  } catch {
    // private mode, quota exceeded, etc — silent
  }
}

/**
 * Load the persisted blob for this activity + version, or null if absent,
 * malformed, or schema-version mismatched. The caller (typically the
 * bootstrap in index.ts) decides what to do with null (fresh state).
 */
export function loadActivityState(
  config: RuntimeConfig,
): StoredActivityState | null {
  try {
    const raw = localStorage.getItem(
      buildStorageKey(config.activityId, config.versionNum),
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as { schemaVersion?: unknown }).schemaVersion !==
      STORAGE_SCHEMA_VERSION
    ) {
      return null;
    }
    return parsed as StoredActivityState;
  } catch {
    return null;
  }
}

/**
 * Remove the persisted blob for this activity + version. Called after
 * a successful submit so the next page-load shows a fresh form.
 */
export function clearActivityState(config: RuntimeConfig): void {
  try {
    localStorage.removeItem(
      buildStorageKey(config.activityId, config.versionNum),
    );
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Pending submission (network-retry survival).
// ---------------------------------------------------------------------------
//
// A single per-activity slot holding the last submission payload that hasn't
// confirmed success yet. Written just before the network POST so a tab close
// mid-flight (or after exhausting in-page retries) survives: the bootstrap
// flush resends it on next load. Cleared on confirmed success or a terminal
// (non-retryable) failure. Keyed by activityId only — a submission targets the
// activity regardless of which published version the student loaded.

const PENDING_PREFIX = 'activity_pending_submission_';

function buildPendingKey(activityId: string): string {
  return PENDING_PREFIX + activityId;
}

export function savePendingSubmission(
  config: RuntimeConfig,
  payload: unknown,
): void {
  try {
    localStorage.setItem(
      buildPendingKey(config.activityId),
      JSON.stringify(payload),
    );
  } catch {
    // private mode, quota exceeded, etc — silent (retry-on-reload is a
    // best-effort safety net, not a correctness guarantee).
  }
}

export function loadPendingSubmission(config: RuntimeConfig): unknown | null {
  try {
    const raw = localStorage.getItem(buildPendingKey(config.activityId));
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function clearPendingSubmission(config: RuntimeConfig): void {
  try {
    localStorage.removeItem(buildPendingKey(config.activityId));
  } catch {
    // ignore
  }
}

/**
 * Apply a loaded blob to live refs + state. Mutates input.value on each
 * matched blank and replaces state.blanks/blocks/sections entries with
 * stored values. Skips stored entries whose keys aren't in current refs/
 * state — defense against the (unlikely with versionNum-keyed storage)
 * case where stored shape disagrees with current refs.
 */
export function applyStoredState(
  stored: StoredActivityState,
  refs: Refs,
  state: RuntimeState,
): void {
  for (const [blankId, value] of Object.entries(stored.values)) {
    const ref = refs.blanks.get(blankId);
    if (ref) ref.input.value = value;
  }
  // Restore free-text textareas (the bootstrap DOM-write exception, like blank
  // inputs above). `?? {}` guards blobs written before this field.
  for (const [blockId, text] of Object.entries(stored.freeTexts ?? {})) {
    const ref = refs.freeText.get(blockId);
    if (ref) ref.textarea.value = text;
  }
  for (const [id, blankState] of Object.entries(stored.blanks)) {
    if (state.blanks[id]) state.blanks[id] = blankState;
  }
  for (const [id, blockState] of Object.entries(stored.blocks)) {
    if (state.blocks[id]) state.blocks[id] = blockState;
  }
  // stored.mcs / stored.graphs are absent in blobs written before those
  // fields existed; the schemaVersion bump already discards those, but guard
  // anyway (?? {}) so a hand-edited or partial blob can't throw here. MC
  // selection needs no input.value writes — render() syncs each input's
  // checked flag from the restored state.
  for (const [id, mcState] of Object.entries(stored.mcs ?? {})) {
    if (state.mcs[id]) state.mcs[id] = mcState;
  }
  // Matching/ordering restore is state-only, like MC: render() re-docks the
  // cards and re-sequences the rows from the restored maps.
  for (const [id, matchState] of Object.entries(stored.matches ?? {})) {
    if (state.matches[id]) state.matches[id] = matchState;
  }
  for (const [id, orderState] of Object.entries(stored.orderings ?? {})) {
    if (state.orderings[id]) state.orderings[id] = orderState;
  }
  for (const [id, graphState] of Object.entries(stored.graphs ?? {})) {
    if (state.graphs[id]) state.graphs[id] = graphState;
  }
  // Number-line restore is state-only, like graphs: the kit's attach reads the
  // restored studentPoints/interval and calls the widget's restore().
  for (const [id, nlState] of Object.entries(stored.numberLines ?? {})) {
    if (state.numberLines[id]) state.numberLines[id] = nlState;
  }
  // Data-plot restore is state-only, like graphs/number-lines: the kit's attach
  // reads the restored studentValues and calls the widget's restore().
  for (const [id, dpState] of Object.entries(stored.dataPlots ?? {})) {
    if (state.dataPlots[id]) state.dataPlots[id] = dpState;
  }
  for (const [id, sectionState] of Object.entries(stored.sections)) {
    if (state.sections[id]) state.sections[id] = sectionState;
  }
}
