// The device photo store's name and its delete-everything, in the SHELL (media
// submissions slice 2b, §8). Sign-out must be able to wipe the store without
// loading the photo chunk, and the name lives once, here, under the viewer's
// own `activity-viewer:` prefix — the same ownership rule as the buffer's keys
// (studentAuth.ts imports VIEWER_STORAGE_PREFIX rather than restating it).
//
// The store itself (photoStore.ts) is lazy: only a page with a photo question
// opens it.

export const PHOTO_DB_NAME = 'activity-viewer:photos';

/**
 * Delete the whole device photo store: every student's waiting photos on this
 * browser. Resolves, never rejects, and gives up after `timeoutMs`: a browser
 * that blocks or refuses IndexedDB must never stop a sign-out. An open
 * connection in this page closes itself on `versionchange` (photoStore.ts), so
 * a delete is not left blocked by the page asking for it.
 */
export function deletePhotoStore(timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    try {
      // The lazy store's in-memory fallback lives in this page too — and it
      // is the ONLY copy when IndexedDB is unavailable, so this goes first.
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('activity-viewer:photos-cleared'));
      if (typeof indexedDB === 'undefined') return finish(true);
      const request = indexedDB.deleteDatabase(PHOTO_DB_NAME);
      request.onsuccess = () => finish(true);
      request.onerror = () => finish(false);
      setTimeout(() => finish(false), timeoutMs);
    } catch {
      finish(false);
    }
  });
}
