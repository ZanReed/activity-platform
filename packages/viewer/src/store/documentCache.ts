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

import {
  bufferHasUnsentWork,
  bufferKey,
  parseScopedKey,
  scopedKey,
  type StorageLike,
} from './buffer.js';

/**
 * Byte budget for ALL cached documents (eng review D5/D27, 2026-08-06/07).
 *
 * Before this bound the store grew forever — one ~40 KB blob per activity
 * ever opened against a ~5 MB origin quota, with both failure branches
 * swallowing their own evidence; the terminal state was the silent quota
 * failure the buffer's status banner exists to surface (s6-audit missed-9).
 *
 * DERIVED, not guessed (the outside voice killed an underived ~12-activity
 * cap): localStorage quota is ~5M UTF-16 code units in the browsers that
 * matter here; the document cache gets ~40% of it — room for ~50 typical
 * documents, a 6-class semester with headroom — and the buffer + stores keep
 * the rest. `length` on the stored string measures UTF-16 units, the same
 * unit the quota is enforced in.
 *
 * WHAT EVICTION COSTS, honestly: an evicted activity loses its OFFLINE copy
 * until the next online open re-caches it (self-healing). That is why
 * eviction is least-recently-SAVED first (save happens once per online load,
 * so save-order IS open-order), and why an activity with UNSENT buffer work
 * is never evicted (the V6 exception, reused): offline boot needs the
 * document to render the answers next to, and unsent work must never lose
 * its questions.
 *
 * The buffer itself stays unbounded, deliberately: unsent work must never be
 * evicted by construction, and spent buffers are already collected by the
 * orphan GC on republish.
 */
export const DOC_CACHE_BUDGET = 2 * 1024 * 1024;

/** Everything the viewer needs to render a version it already fetched. */
export interface CachedDocument {
  activityId: string;
  versionId: string;
  versionNum: number;
  title: string;
  document: unknown;
  /** Last save time (ms) — the LRU order. Absent on pre-D5 blobs, which makes
   * them the OLDEST candidates, which is correct: nothing has touched them
   * since before the bound existed. */
  touchedAt?: number;
}

export function documentKey(parts: {
  userId: string;
  activityId: string;
  versionId: string;
}): string {
  return scopedKey('doc', parts);
}

/** Every doc-kind entry this user has, with the facts eviction needs. */
function cacheInventory(
  storage: StorageLike,
  userId: string,
): Array<{ key: string; activityId: string; size: number; touchedAt: number }> {
  const out: Array<{
    key: string;
    activityId: string;
    size: number;
    touchedAt: number;
  }> = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key === null) continue;
      const parts = parseScopedKey(key);
      if (parts?.kind !== 'doc' || parts.userId !== userId) continue;
      const raw = storage.getItem(key);
      if (raw === null) continue;
      let touchedAt = 0;
      try {
        const t = (JSON.parse(raw) as { touchedAt?: unknown }).touchedAt;
        if (typeof t === 'number') touchedAt = t;
      } catch {
        // Unparseable — oldest possible, first out.
      }
      out.push({
        key,
        activityId: parts.activityId,
        size: key.length + raw.length,
        touchedAt,
      });
    }
  } catch {
    // Storage unavailable mid-scan; evict from what was seen.
  }
  return out;
}

/** The V6 exception, reused: an activity whose buffer holds unsent work keeps
 * its offline copy — the work must never lose the questions it answers. */
function activityHasUnsentWork(
  storage: StorageLike,
  userId: string,
  activityId: string,
): boolean {
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key === null) continue;
      const parts = parseScopedKey(key);
      if (
        parts?.kind === 'buffer' &&
        parts.userId === userId &&
        parts.activityId === activityId &&
        bufferHasUnsentWork(storage.getItem(bufferKey(parts)))
      ) {
        return true;
      }
    }
  } catch {
    // Storage unavailable — claim work exists, which only makes eviction shy.
    return true;
  }
  return false;
}

/**
 * Best-effort: a document we could not store just means the offline and
 * republish paths fall back, never that the load fails.
 *
 * BOUNDED (D5): after every write the doc-kind keys are held to
 * DOC_CACHE_BUDGET, evicting least-recently-saved first — skipping the entry
 * just written and any activity with unsent buffer work. A quota failure runs
 * the same eviction and retries once, so a full device sheds its oldest
 * offline copy instead of silently refusing the newest.
 */
export function saveCachedDocument(
  storage: StorageLike,
  userId: string,
  served: CachedDocument,
  now: () => number = Date.now,
): boolean {
  const key = documentKey({
    userId,
    activityId: served.activityId,
    versionId: served.versionId,
  });
  const value = JSON.stringify({ ...served, touchedAt: now() });

  const evictOldest = (needed: number): boolean => {
    const candidates = cacheInventory(storage, userId)
      .filter((entry) => entry.key !== key)
      .filter((entry) => !activityHasUnsentWork(storage, userId, entry.activityId))
      .sort((a, b) => a.touchedAt - b.touchedAt);
    let freed = 0;
    let any = false;
    for (const entry of candidates) {
      if (freed >= needed) break;
      try {
        storage.removeItem(entry.key);
        freed += entry.size;
        any = true;
      } catch {
        // Keep trying the rest.
      }
    }
    return any;
  };

  const write = (): boolean => {
    try {
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };

  let written = write();
  if (!written) {
    // Quota (or a locked-down profile — in which case eviction frees nothing
    // and the retry fails the same way). Shed the oldest copies and retry
    // ONCE: the newest document is worth more than the oldest offline copy.
    if (evictOldest(key.length + value.length)) written = write();
    if (!written) return false;
  }

  // Enforce the budget AFTER a successful write, so the running total
  // includes what was just stored.
  const total = cacheInventory(storage, userId).reduce(
    (sum, entry) => sum + entry.size,
    0,
  );
  if (total > DOC_CACHE_BUDGET) evictOldest(total - DOC_CACHE_BUDGET);
  return true;
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
