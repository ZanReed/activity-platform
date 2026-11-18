// =============================================================================
// blocks/photoUploader.ts — moves waiting photos from the device to Storage
// (media submissions slice 2b; docs/design/media-submissions.md §8)
// -----------------------------------------------------------------------------
// One per page (per viewer store), started by the first photo block that
// mounts and STOPPED by the route that owns the store (photoLinkSeam.ts →
// stopPhotoUploads), so it can never outlive the store it writes into. The
// store is the one authority on what is waiting: a `local` ref in
// responses.photos. For each one the uploader
//
//   reads its JPEG from the photo store (waiting for a write still in flight)
//   → reserve + upload (photoUpload.ts), as the photo's own student only
//   → records the server id ON THE DEVICE ENTRY  (durable before the swap)
//   → store.swapPhoto(local id → server id)
//   → deletes the device copy a moment later, once the buffer has saved.
//
// Recording the server id first is what makes a crash anywhere in that chain
// safe: a restart finds the entry with its serverId and swaps without a second
// upload, rather than calling the photo lost (Fable review 2026-11-18).
//
// The swap is what releases the section's queued check: the queue skips a
// section while any of its photos is local and reruns when the last one lands
// (store/queue.ts). So "the check waits for the photo" needs nothing here.
//
// When it runs: on start, on every store change, on `online`, on the tab
// becoming visible, and on a backoff timer after a transient failure (school
// Wi-Fi that drops requests while navigator.onLine stays true). Only the tab
// holding the activity's tab lock uploads (photoUploadAllowed). A refusal the
// student must act on (photo_cap, photos_off, not_in_class) waits for Retry.
//
// THE BOOT SWEEP runs once per start: entries that are another student's, or
// that neither the live store nor any of this student's device buffers name,
// are deleted (photoStore.ts → sweepPhotos; the GC rule).
// =============================================================================

import type { ViewerStore } from '../store/store.js';
import { bufferedLocalPhotoIds } from '../store/buffer.js';
import { PhotoError, addPhoto, discardPhoto } from './photoUpload.js';
import { deletePhoto, getPhoto, putPhoto, sweepPhotos } from './photoStore.js';
import { onStopPhotoUploads, photoUploadAllowed } from './photoLinkSeam.js';

export type WaitingState =
  | { state: 'waiting' } // offline (or another tab holds the activity)
  | { state: 'uploading'; progress: number }
  | { state: 'failed'; code: PhotoError['code'] }
  | { state: 'lost' }; // the device copy is gone (memory fallback + reload)

interface Uploader {
  status(localId: string): WaitingState | undefined;
  subscribe(listener: () => void): () => void;
  retry(localId: string): void;
  stop(): void;
}

/** Failures worth retrying on their own, with backoff. */
const TRANSIENT = new Set<PhotoError['code']>(['upload_failed', 'signed_out', 'offline']);
/** The buffer debounces writes (~300 ms); the device copy outlives that. */
const DELETE_AFTER_SWAP_MS = 2000;
const BACKOFF_MS = [10_000, 30_000, 60_000, 120_000, 300_000];

const uploaders = new WeakMap<ViewerStore, Uploader>();

function online(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

function localRefs(store: ViewerStore): Array<{ blockId: string; localId: string }> {
  const out: Array<{ blockId: string; localId: string }> = [];
  for (const [blockId, refs] of Object.entries(store.getState().responses.photos ?? {})) {
    for (const r of refs) if (r.local) out.push({ blockId, localId: r.id });
  }
  return out;
}

export function startUploader(store: ViewerStore): Uploader {
  const existing = uploaders.get(store);
  if (existing) return existing;

  const states = new Map<string, WaitingState>();
  const listeners = new Set<() => void>();
  const busy = new Set<string>();
  const attempts = new Map<string, number>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;
  const emit = () => listeners.forEach((l) => l());
  const set = (id: string, s: WaitingState | undefined) => {
    if (s) states.set(id, s);
    else states.delete(id);
    emit();
  };
  const later = (ms: number, fn: () => void) => {
    const t = setTimeout(() => {
      timers.delete(t);
      if (!stopped) fn();
    }, ms);
    timers.add(t);
  };
  const stillLocal = (blockId: string, localId: string) =>
    (store.getState().responses.photos?.[blockId] ?? []).some((r) => r.id === localId && r.local);

  async function uploadOne(blockId: string, localId: string) {
    busy.add(localId);
    const { userId, activityId, versionId } = store.getState();
    try {
      const photo = await getPhoto(localId, userId);
      if (stopped) return;
      if (!photo) {
        set(localId, { state: 'lost' });
        return;
      }
      let serverId = photo.serverId;
      if (!serverId) {
        if (!online() || !photoUploadAllowed()) {
          set(localId, { state: 'waiting' });
          return;
        }
        set(localId, { state: 'uploading', progress: 0 });
        serverId = await addPhoto(
          // The photo answers the version it was taken on; a refreshed page on
          // a newer version still hands it in against its own block (0093
          // accepts any version of the activity).
          { activityId: photo.activityId || activityId, versionId: photo.versionId || versionId, blockId },
          photo.jpeg,
          (progress) => set(localId, { state: 'uploading', progress }),
          photo.uid,
        );
        // Durable first: the device entry knows its server id before the
        // store does, so no crash from here on can lose or re-upload it.
        await putPhoto({ ...photo, serverId });
      }
      if (stopped) return; // the next start resumes from the entry's serverId
      if (!stillLocal(blockId, localId)) {
        // Removed while it uploaded: nothing names it, so it leaves Storage too.
        void discardPhoto(serverId);
        await deletePhoto(localId);
        set(localId, undefined);
        return;
      }
      store.swapPhoto(blockId, localId, serverId);
      attempts.delete(localId);
      set(localId, undefined);
      later(DELETE_AFTER_SWAP_MS, () => void deletePhoto(localId));
    } catch (err) {
      const code = err instanceof PhotoError ? err.code : 'upload_failed';
      set(localId, code === 'offline' ? { state: 'waiting' } : { state: 'failed', code });
      if (TRANSIENT.has(code)) {
        const n = attempts.get(localId) ?? 0;
        attempts.set(localId, n + 1);
        later(BACKOFF_MS[Math.min(n, BACKOFF_MS.length - 1)]!, () => {
          const s = states.get(localId);
          if (s && (s.state === 'waiting' || (s.state === 'failed' && TRANSIENT.has(s.code)))) {
            states.delete(localId);
            pump();
          }
        });
      }
    } finally {
      busy.delete(localId);
    }
  }

  function pump() {
    if (stopped) return;
    const live = new Set<string>();
    for (const { blockId, localId } of localRefs(store)) {
      live.add(localId);
      if (busy.has(localId)) continue;
      const s = states.get(localId);
      if (s?.state === 'failed' || s?.state === 'lost') continue;
      if (s?.state === 'waiting' && (!online() || !photoUploadAllowed())) continue;
      void uploadOne(blockId, localId);
    }
    // A ref the student removed: drop its status (its device copy was deleted
    // by the block's Remove; the boot sweep collects any it missed).
    for (const id of [...states.keys()]) {
      if (!live.has(id) && !busy.has(id)) states.delete(id);
    }
  }

  /** Everything that failed for a reason time can fix gets another go. */
  const nudge = () => {
    for (const [id, s] of states) {
      if (s.state === 'waiting' || (s.state === 'failed' && TRANSIENT.has(s.code))) states.delete(id);
    }
    emit();
    pump();
  };
  const onVisible = () => {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') nudge();
  };
  if (typeof window !== 'undefined') window.addEventListener('online', nudge);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible);
  const unsubscribe = store.subscribe(pump);

  // The boot sweep, once, before the first pump can race it.
  void (async () => {
    const { userId } = store.getState();
    let buffered = new Set<string>();
    try {
      buffered = bufferedLocalPhotoIds(window.localStorage, userId);
    } catch {
      // No storage: only the live store counts.
    }
    // "Referenced" is read from the LIVE store at each decision, never from a
    // set taken before the sweep's first await: a photo the student adds while
    // the sweep is running must not be collected as unreferenced.
    const referenced = (localId: string) =>
      buffered.has(localId) || localRefs(store).some((r) => r.localId === localId);
    await sweepPhotos(userId, (p) => referenced(p.localId)).catch(() => 0);
    pump();
  })();

  const uploader: Uploader = {
    status: (id) => states.get(id),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    retry(id) {
      states.delete(id);
      attempts.delete(id);
      emit();
      pump();
    },
    stop() {
      stopped = true;
      unsubscribe();
      timers.forEach(clearTimeout);
      timers.clear();
      if (typeof window !== 'undefined') window.removeEventListener('online', nudge);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible);
      uploaders.delete(store);
    },
  };
  uploaders.set(store, uploader);
  onStopPhotoUploads(store, () => uploader.stop());
  return uploader;
}
