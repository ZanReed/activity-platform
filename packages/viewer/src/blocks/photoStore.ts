// =============================================================================
// blocks/photoStore.ts — photos waiting to upload, kept on the device
// (media submissions slice 2b; docs/design/media-submissions.md §8)
// -----------------------------------------------------------------------------
// One IndexedDB database (photoStoreName.ts), one object store, one entry per
// photo the student has taken that has not reached Storage yet. It holds the
// RE-ENCODED JPEG only (photoUpload.ts → reencodePhoto), never the original, so
// EXIF and GPS are gone before anything is written here.
//
// An entry lives exactly as long as the photo is waiting: the uploader deletes
// it the moment Storage has the bytes and the store's ref carries the server
// id. Nothing else here is durable.
//
// Every read filters on the student's uid, and the boot sweep (sweepPhotos)
// deletes other students' entries outright: the buffer's two-layer identity
// rule (S6-1), applied to photos.
//
// NO INDEXEDDB (private mode, a policy, a full quota): the same API falls back
// to an in-memory map, so a photo still uploads while the page is open; it
// just does not survive a reload. The block says nothing different — the
// design's "falls back to online-only for that photo".
// =============================================================================

import { PHOTO_DB_NAME } from './photoStoreName.js';

const STORE = 'photos';

export interface WaitingPhoto {
  /** The device's id for the photo, = the store ref's id while it waits. */
  localId: string;
  uid: string;
  activityId: string;
  versionId: string;
  blockId: string;
  jpeg: Blob;
  createdAt: number;
  /** Set the moment Storage has the bytes, BEFORE the store's ref is swapped
   *  (Fable review): a crash between the upload and the buffer saving the
   *  swap then resumes with a swap, never a lost photo or a second upload. */
  serverId?: string;
}

/** The event deletePhotoStore dispatches (sign-out): memory copies go too. */
export const PHOTOS_CLEARED_EVENT = 'activity-viewer:photos-cleared';

const memory = new Map<string, WaitingPhoto>();
if (typeof window !== 'undefined') {
  window.addEventListener(PHOTOS_CLEARED_EVENT, () => {
    memory.clear();
    pendingPuts.clear();
  });
}

/** A photo the block has named in the answer but is still re-encoding and
 *  writing (finding 4): readers wait for it rather than calling it lost. */
const pendingPuts = new Map<string, Promise<unknown>>();

export function trackPut(localId: string, write: Promise<unknown>): void {
  pendingPuts.set(localId, write);
  void write.finally(() => {
    if (pendingPuts.get(localId) === write) pendingPuts.delete(localId);
  });
}
let dbPromise: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const request = indexedDB.open(PHOTO_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'localId' });
      };
      request.onsuccess = () => {
        const db = request.result;
        // Sign-out deletes the database; let it, rather than block it.
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function run<T>(db: IDBDatabase, mode: IDBTransactionMode, body: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = body(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Keep a waiting photo. Resolves `false` when only memory could take it. */
export async function putPhoto(photo: WaitingPhoto): Promise<boolean> {
  memory.set(photo.localId, photo);
  const db = await open();
  if (!db) return false;
  try {
    await run(db, 'readwrite', (s) => s.put(photo));
    memory.delete(photo.localId);
    return true;
  } catch {
    return false; // quota: stays in memory for this page's life
  }
}

export async function getPhoto(localId: string, uid: string): Promise<WaitingPhoto | null> {
  const writing = pendingPuts.get(localId);
  if (writing) await writing.catch(() => undefined);
  const inMemory = memory.get(localId);
  if (inMemory) return inMemory.uid === uid ? inMemory : null;
  const db = await open();
  if (!db) return null;
  try {
    const found = await run<WaitingPhoto | undefined>(db, 'readonly', (s) => s.get(localId));
    return found && found.uid === uid ? found : null;
  } catch {
    return null;
  }
}

export async function deletePhoto(localId: string): Promise<void> {
  memory.delete(localId);
  const db = await open();
  if (!db) return;
  try {
    await run(db, 'readwrite', (s) => s.delete(localId));
  } catch {
    // The boot sweep collects it later.
  }
}

async function allPhotos(): Promise<WaitingPhoto[]> {
  const db = await open();
  const stored = db ? await run<WaitingPhoto[]>(db, 'readonly', (s) => s.getAll()).catch(() => []) : [];
  return [...stored, ...memory.values()];
}

/**
 * The boot sweep (§8). Deletes every entry that is not this student's, and
 * every one of theirs that nothing references any more. `isReferenced` is the
 * caller's answer, from the live store and the device buffers: THE GC RULE
 * (DECISIONS.md, "The orphan GC must never eat unsent work") is that a photo a
 * buffer or a pending check still names is never collected.
 */
export async function sweepPhotos(uid: string, isReferenced: (photo: WaitingPhoto) => boolean): Promise<number> {
  let removed = 0;
  for (const photo of await allPhotos()) {
    if (photo.uid !== uid || !isReferenced(photo)) {
      await deletePhoto(photo.localId);
      removed++;
    }
  }
  return removed;
}
