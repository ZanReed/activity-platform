// =============================================================================
// store/persistence.ts — the buffer schema-version invariant (S3 ruling D9)
// -----------------------------------------------------------------------------
// The runtime's STORAGE_SCHEMA_VERSION discipline, re-derived for the viewer
// BEFORE any persisted shape ships (rather than retrofitted at T7, which is
// exactly the bolt-on the old rule existed to prevent):
//
//   - Any incompatible change to `PersistedViewerState` (or anything nested in
//     it — responses, section status) BUMPS `VIEWER_STORE_SCHEMA_VERSION`.
//   - `hydrateViewerState` returns null on version mismatch or corruption —
//     fresh state, never a mis-read of stale incompatible data.
//
// T7's local-first buffer builds ON this: it persists what `serializeViewerState`
// emits, keyed per (activity, version, user) — the user key is part of the
// shared-Chromebook contamination guard (ruling R5).
// =============================================================================

import {
  emptySectionResponses,
  type SectionResponses,
} from '../check/wire.js';
import type { SectionCheckResult } from '../check/wire.js';

/** Bump on ANY incompatible persisted-shape change. Load returns null on
 * mismatch → fresh state, which is the correct behavior. */
export const VIEWER_STORE_SCHEMA_VERSION = 1;

export type SectionStatus =
  | { phase: 'unchecked' }
  | { phase: 'checking' }
  | { phase: 'checked'; result: SectionCheckResult }
  | { phase: 'error'; message: string };

export interface PersistedViewerState {
  schemaVersion: number;
  activityId: string;
  versionId: string;
  responses: SectionResponses;
  /** Only terminal 'checked' results persist — 'checking'/'error' are
   * transitional UI states that must never be resurrected from storage. */
  checked: Record<string, SectionCheckResult>;
}

export function emptyPersistedState(
  activityId: string,
  versionId: string,
): PersistedViewerState {
  return {
    schemaVersion: VIEWER_STORE_SCHEMA_VERSION,
    activityId,
    versionId,
    responses: emptySectionResponses(),
    checked: {},
  };
}

export function serializeViewerState(state: PersistedViewerState): string {
  return JSON.stringify({ ...state, schemaVersion: VIEWER_STORE_SCHEMA_VERSION });
}

/** null on missing, corrupt, or version-mismatched input — the caller starts
 * fresh. Never widens: an unknown future version is a mismatch, not a guess. */
export function hydrateViewerState(
  raw: string | null | undefined,
): PersistedViewerState | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const candidate = parsed as Partial<PersistedViewerState>;
  if (candidate.schemaVersion !== VIEWER_STORE_SCHEMA_VERSION) return null;
  if (
    typeof candidate.activityId !== 'string' ||
    typeof candidate.versionId !== 'string' ||
    typeof candidate.responses !== 'object' ||
    candidate.responses === null ||
    typeof candidate.checked !== 'object' ||
    candidate.checked === null
  ) {
    return null;
  }
  return candidate as PersistedViewerState;
}
