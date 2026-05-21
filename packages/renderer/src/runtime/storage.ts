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
//      mistake feedback, hint reveal, solution reveal, section scores,
//      lock state, confidence. Versioned in the key so republishing the
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
const STORAGE_SCHEMA_VERSION = 1;
const STORAGE_PREFIX = 'activity_state_';

export interface StoredActivityState {
  schemaVersion: number;
  /** Typed values keyed by blank.id (DOM source-of-truth at persist time). */
  values: Record<string, string>;
  /** Per-blank state snapshot. */
  blanks: Record<string, BlankState>;
  /** Per-block state snapshot. */
  blocks: Record<string, BlockState>;
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
    const blob: StoredActivityState = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      values,
      blanks: state.blanks,
      blocks: state.blocks,
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
  for (const [id, blankState] of Object.entries(stored.blanks)) {
    if (state.blanks[id]) state.blanks[id] = blankState;
  }
  for (const [id, blockState] of Object.entries(stored.blocks)) {
    if (state.blocks[id]) state.blocks[id] = blockState;
  }
  for (const [id, sectionState] of Object.entries(stored.sections)) {
    if (state.sections[id]) state.sections[id] = sectionState;
  }
}
