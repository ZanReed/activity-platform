// =============================================================================
// store/persistence.ts — the persisted viewer shape (S3 ruling D9; S6 rulings
// S6-1 / S6-3)
// -----------------------------------------------------------------------------
// The runtime's STORAGE_SCHEMA_VERSION discipline, re-derived for the viewer
// BEFORE any persisted shape ships (rather than retrofitted at S6, which is
// exactly the bolt-on the old rule existed to prevent):
//
//   - Any incompatible change to `PersistedViewerState` (or anything nested in
//     it — responses, section status, pending/in-flight checks) BUMPS
//     `VIEWER_STORE_SCHEMA_VERSION`.
//   - `hydrateViewerState` returns null on version mismatch or corruption —
//     fresh state, never a mis-read of stale incompatible data.
//
// WHY THIS IS STILL VERSION 1 AFTER S6 ADDED THREE FIELDS (ruling S6-1):
// nothing had ever WRITTEN a blob — the buffer that persists this shape ships
// in the same slice that added the fields. Bumping to 2 would pin a migration
// scenario that cannot occur and imply a v1 population that never existed.
// The gate itself is unchanged and load-bearing from here on.
//
// IDENTITY IS PART OF THE SHAPE, not just the storage key (ruling S6-1).
// School Chromebooks are shared hardware; the key scheme in buffer.ts scopes
// blobs per user, and this file refuses a foreign blob a second time on the
// way in. Two independent layers, because the failure they prevent — student B
// resuming student A's work under B's identity — is silent.
// =============================================================================

import {
  emptySectionResponses,
  type SectionResponses,
} from '../check/wire.js';
import type { SectionCheckResult } from '../check/wire.js';
import type { CheckErrorKind } from '../client/httpCheckService.js';

/** Bump on ANY incompatible persisted-shape change. Load returns null on
 * mismatch → fresh state, which is the correct behavior. */
export const VIEWER_STORE_SCHEMA_VERSION = 1;

export type SectionStatus =
  | { phase: 'unchecked' }
  | { phase: 'checking' }
  | { phase: 'checked'; result: SectionCheckResult }
  | {
      phase: 'error';
      message: string;
      /** Which failure this was (S4 T8). The UI needs it to decide whether to
       * offer Retry at all: a stale tab and an offline blip both fail a check,
       * but only one of them can be fixed by pressing the same button again. */
      kind?: CheckErrorKind;
      retryable?: boolean;
    };

/**
 * A check the student asked for that could not be sent (ruling S6-2). It holds
 * INTENT, never a frozen request: when the queue fires it re-reads the
 * section's CURRENT values (2.2A), so answers edited during the outage are the
 * ones graded.
 *
 * `fingerprint` is what the responses looked like when the student pressed
 * Check. If it differs at fire time the UI shows "Checked your latest answers"
 * — the student gets told their later edits are what got graded, rather than
 * silently receiving a verdict on work they have since changed.
 */
export interface PendingCheck {
  fingerprint: string;
}

/**
 * The idempotency key of a check that was actually sent (ruling S6-3).
 *
 * THIS PERSISTS, AND THAT IS A DELIBERATE OVERTURN of the earlier in-memory-
 * only rule. The reasoning that made "never persist a key" look right assumed
 * a key only matters while a request is in flight in THIS tab. On a Chromebook
 * the common failure is: request sent → Wi-Fi drops → response lost → lid
 * closes. On reopen an in-memory key is gone, so the retry mints a new one and
 * the server records a SECOND attempt for one piece of student work. Persisting
 * the key makes that retry a replay (the server returns the stored result),
 * which is exactly what S4-B2's idempotency index was built for.
 *
 * The key is cleared on success, so a deliberate re-check still creates a new
 * attempt — only the failed-and-retried case collapses.
 */
export interface InFlightCheck {
  checkId: string;
  /** Responses as fired. Lets a replayed result be compared against current
   * values, so a stale-but-successful replay can still raise the 2.2A notice. */
  fingerprint: string;
}

export interface PersistedViewerState {
  schemaVersion: number;
  /** Whose work this is. Checked against the session on hydrate (S6-1). */
  userId: string;
  activityId: string;
  versionId: string;
  responses: SectionResponses;
  /** Only terminal 'checked' results persist — 'checking'/'error' are
   * transitional UI states that must never be resurrected from storage. */
  checked: Record<string, SectionCheckResult>;
  /** Section id → queued check intent (S6-2). */
  pending: Record<string, PendingCheck>;
  /** Section id → the key of a check already sent (S6-3). */
  inFlight: Record<string, InFlightCheck>;
}

export function emptyPersistedState(
  userId: string,
  activityId: string,
  versionId: string,
): PersistedViewerState {
  return {
    schemaVersion: VIEWER_STORE_SCHEMA_VERSION,
    userId,
    activityId,
    versionId,
    responses: emptySectionResponses(),
    checked: {},
    pending: {},
    inFlight: {},
  };
}

/**
 * Stable summary of a section's responses, used to detect "the student edited
 * their answers between queueing a check and it firing".
 *
 * Key order is sorted so an unchanged set of answers always fingerprints the
 * same, regardless of the order the student happened to fill them in — without
 * that, the drift notice would fire constantly and mean nothing.
 */
export function fingerprintResponses(responses: SectionResponses): string {
  return JSON.stringify(responses, (_key, value: unknown) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      const entries = Object.entries(value as Record<string, unknown>).sort(
        ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
      );
      return Object.fromEntries(entries);
    }
    return value;
  });
}

export function serializeViewerState(state: PersistedViewerState): string {
  return JSON.stringify({ ...state, schemaVersion: VIEWER_STORE_SCHEMA_VERSION });
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * null on missing, corrupt, version-mismatched, or FOREIGN-USER input — the
 * caller starts fresh. Never widens: an unknown future version is a mismatch,
 * not a guess.
 *
 * `expectedUserId` is optional so the function stays pure and directly
 * testable, but every production caller passes it — the store does, and the
 * buffer's key scheme is the other half of the same guard.
 */
export function hydrateViewerState(
  raw: string | null | undefined,
  expectedUserId?: string,
): PersistedViewerState | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isPlainRecord(parsed)) return null;
  const candidate = parsed as Partial<PersistedViewerState>;
  if (candidate.schemaVersion !== VIEWER_STORE_SCHEMA_VERSION) return null;
  if (
    typeof candidate.userId !== 'string' ||
    candidate.userId.length === 0 ||
    typeof candidate.activityId !== 'string' ||
    typeof candidate.versionId !== 'string' ||
    !isPlainRecord(candidate.responses) ||
    !isPlainRecord(candidate.checked) ||
    !isPlainRecord(candidate.pending) ||
    !isPlainRecord(candidate.inFlight)
  ) {
    return null;
  }
  // The second identity layer (the storage key is the first). A blob that
  // belongs to someone else is never readable, even if it arrives under a key
  // that says otherwise.
  if (expectedUserId !== undefined && candidate.userId !== expectedUserId) {
    return null;
  }
  return candidate as PersistedViewerState;
}
