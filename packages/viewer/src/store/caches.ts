// =============================================================================
// store/caches.ts — the service-worker cache naming contract (S6-5 / S6-6)
// -----------------------------------------------------------------------------
// The names live HERE, with the code that sweeps and purges them, and the
// service worker (V8) conforms to them — the same direction as the buffer key
// prefix, and for the same reason: a cache written under a name the purge does
// not scan is student data left on a shared machine.
//
// WHY CONTENT CACHES CARRY A USER ID. The Cache API keys entries by URL and
// ignores the Authorization header, and this platform serves per-student
// documents from ONE url (the read path applies a seeded per-student shuffle).
// A single shared content cache would therefore hand student B the copy that
// was built for student A — not merely stale, but graded against the wrong
// shuffle. User-scoped cache NAMES keep each student's copies apart, and the
// boot sweep drops the ones that are not theirs.
//
//   activity-viewer:cache:shell              ← app assets, user-agnostic
//   activity-viewer:cache:content:<userId>   ← per-student served documents
//
// THE SHELL IS DELIBERATELY NOT PURGED AT SIGN-OUT. It holds application code,
// identical for every user, and no student data whatsoever. Wiping it would
// make the next student re-download the app over school Wi-Fi and would defeat
// the offline capability precisely on the shared devices that need it most.
// R5 asked for the caches holding student WORK to be purged; this is that,
// scoped to the caches that actually hold it.
// =============================================================================

export const VIEWER_CACHE_PREFIX = 'activity-viewer:cache:';

/** App assets. One copy per device, no student data. */
export const VIEWER_SHELL_CACHE = `${VIEWER_CACHE_PREFIX}shell`;

/** The subset of `CacheStorage` this module uses — injectable for tests. */
export interface CacheStorageLike {
  keys(): Promise<string[]>;
  delete(cacheName: string): Promise<boolean>;
}

/** Per-student cache of served documents. */
export function viewerContentCacheName(userId: string): string {
  return `${VIEWER_CACHE_PREFIX}content:${userId}`;
}

/** The user a viewer cache belongs to; null for the shell or a foreign name. */
export function contentCacheUser(cacheName: string): string | null {
  const marker = `${VIEWER_CACHE_PREFIX}content:`;
  if (!cacheName.startsWith(marker)) return null;
  const userId = cacheName.slice(marker.length);
  return userId.length > 0 ? userId : null;
}

function isViewerCache(name: string): boolean {
  return name.startsWith(VIEWER_CACHE_PREFIX);
}

/**
 * BOOT SWEEP for caches — the mirror of `sweepForeignBuffers` (ruling S6-6).
 * Drops every content cache that is not the signed-in student's, including
 * malformed ones, which covers the crash-without-sign-out path where nothing
 * ever ran a purge.
 */
export async function sweepForeignCaches(
  caches: CacheStorageLike,
  currentUserId: string,
): Promise<string[]> {
  const removed: string[] = [];
  try {
    for (const name of await caches.keys()) {
      if (!isViewerCache(name) || name === VIEWER_SHELL_CACHE) continue;
      if (contentCacheUser(name) !== currentUserId) {
        await caches.delete(name);
        removed.push(name);
      }
    }
  } catch {
    // No CacheStorage (older browser, private mode) — nothing cached there.
  }
  return removed;
}

/**
 * SIGN-OUT PURGE: every student-bearing cache, whoever it belongs to. We are
 * leaving the machine, so "mine" is not the question — "does it hold student
 * content" is, and the shell does not.
 */
export async function purgeStudentCaches(
  caches: CacheStorageLike,
): Promise<string[]> {
  const removed: string[] = [];
  try {
    for (const name of await caches.keys()) {
      if (!isViewerCache(name) || name === VIEWER_SHELL_CACHE) continue;
      await caches.delete(name);
      removed.push(name);
    }
  } catch {
    // Same as above: nothing to purge if there is no cache storage.
  }
  return removed;
}
