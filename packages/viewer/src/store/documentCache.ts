// =============================================================================
// store/documentCache.ts — the last served document, kept on the device
// (S6 rulings S6-5 boot half / S6-9)
// -----------------------------------------------------------------------------
// Two things need a document the network cannot currently provide:
//
//   1. OFFLINE BOOT. The student reopens with no signal. Their work is in the
//      buffer, but a buffer of answers with no questions is useless — the
//      document has to come from somewhere too.
//   2. THE REPUBLISH PATH (S6-9). A student queued a check on version 1;
//      overnight the teacher published version 2, which renames every block id.
//      To honor the queued check we must render the version their work belongs
//      to, and the only copy of it left is the one we kept.
//
// WHY LOCALSTORAGE AND NOT THE CACHE API. The service worker (V8) will cache
// HTTP responses for offline reopen; this is a different thing — an
// application-level record of "the document this student's work belongs to",
// read as DATA, keyed by version rather than by URL. Putting it here also
// means it lives under the same `activity-viewer:` prefix that sign-out
// already purges and the boot sweep already scans, rather than needing its own
// parallel guard.
//
// It is written ONCE per load, never on the hot path — deliberately not folded
// into the buffer blob, which is rewritten on a debounce as the student types.
// A 40 KB document re-serialized every few keystrokes is exactly the kind of
// thing that makes a Chromebook feel broken.
// =============================================================================

import { scopedKey, parseScopedKey, type StorageLike } from './buffer.js';

/** Everything the viewer needs to render a version it already fetched. */
export interface CachedDocument {
  activityId: string;
  versionId: string;
  versionNum: number;
  title: string;
  document: unknown;
}

export function documentKey(parts: {
  userId: string;
  activityId: string;
  versionId: string;
}): string {
  return scopedKey('doc', parts);
}

/** Best-effort: a document we could not store just means the offline and
 * republish paths fall back, never that the load fails. */
export function saveCachedDocument(
  storage: StorageLike,
  userId: string,
  served: CachedDocument,
): boolean {
  try {
    storage.setItem(
      documentKey({
        userId,
        activityId: served.activityId,
        versionId: served.versionId,
      }),
      JSON.stringify(served),
    );
    return true;
  } catch {
    // Quota or a locked-down profile. The student keeps working online.
    return false;
  }
}

export function loadCachedDocument(
  storage: StorageLike,
  userId: string,
  activityId: string,
  versionId: string,
): CachedDocument | null {
  let raw: string | null;
  try {
    raw = storage.getItem(documentKey({ userId, activityId, versionId }));
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const candidate = parsed as Partial<CachedDocument>;
  if (
    typeof candidate.activityId !== 'string' ||
    typeof candidate.versionId !== 'string' ||
    typeof candidate.title !== 'string' ||
    !candidate.document
  ) {
    return null;
  }
  return {
    activityId: candidate.activityId,
    versionId: candidate.versionId,
    versionNum:
      typeof candidate.versionNum === 'number' ? candidate.versionNum : 0,
    title: candidate.title,
    document: candidate.document,
  };
}

/**
 * Any cached document for this activity, whichever version — the offline-boot
 * case, where we do not know which version we would have been served.
 * Prefers `preferVersionId` when present.
 */
export function loadAnyCachedDocument(
  storage: StorageLike,
  userId: string,
  activityId: string,
  preferVersionId?: string,
): CachedDocument | null {
  if (preferVersionId) {
    const preferred = loadCachedDocument(
      storage,
      userId,
      activityId,
      preferVersionId,
    );
    if (preferred) return preferred;
  }
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key === null) continue;
      const parts = parseScopedKey(key);
      if (
        parts?.kind !== 'doc' ||
        parts.userId !== userId ||
        parts.activityId !== activityId
      ) {
        continue;
      }
      const found = loadCachedDocument(
        storage,
        userId,
        activityId,
        parts.versionId,
      );
      if (found) return found;
    }
  } catch {
    // Storage unavailable.
  }
  return null;
}
