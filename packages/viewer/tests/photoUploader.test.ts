// photoUploader.ts — the guarantees the Fable review of slice 2b asked for.
// addPhoto/discardPhoto are mocked at their boundary; the photo store runs its
// real in-memory fallback (jsdom has no IndexedDB).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const upload = vi.hoisted(() => ({
  addPhoto: vi.fn<(...args: unknown[]) => Promise<string>>(async () => 'server-1'),
  discardPhoto: vi.fn<(id: string) => Promise<void>>(async () => undefined),
}));
vi.mock('../src/blocks/photoUpload.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/blocks/photoUpload.js')>();
  return { ...real, ...upload };
});

import { startUploader } from '../src/blocks/photoUploader.js';
import { getPhoto, putPhoto, trackPut } from '../src/blocks/photoStore.js';
import { setPhotoUploadGate, stopPhotoUploads } from '../src/blocks/photoLinkSeam.js';
import { PhotoError } from '../src/blocks/photoUpload.js';
import { createViewerStore } from '../src/store/store.js';
import { createMockCheckService } from '../src/check/mock.js';

const UID = 'student-1';
let n = 0;
function fresh() {
  const store = createViewerStore({ userId: UID, activityId: 'act', versionId: 'ver', checkService: createMockCheckService() });
  const localId = `local-${++n}`;
  return { store, localId };
}
/** As the block adds a photo: the write tracked, then the ref named. */
async function waiting(store: ReturnType<typeof fresh>['store'], localId: string, extra: Record<string, unknown> = {}) {
  const write = putPhoto({ localId, uid: UID, activityId: 'act', versionId: 'ver', blockId: 'q', jpeg: new Blob(['x']), createdAt: 0, ...extra });
  trackPut(localId, write);
  store.setPhotos('q', [{ id: localId, local: true, key: localId }]);
  await write;
}
const ids = (store: ReturnType<typeof fresh>['store']) => (store.getState().responses.photos?.q ?? []).map((r) => r.id);

beforeEach(() => {
  upload.addPhoto.mockReset().mockImplementation(async () => 'server-1');
  upload.discardPhoto.mockClear();
});
afterEach(() => {
  setPhotoUploadGate(null);
  vi.useRealTimers();
});

describe('the photo uploader', () => {
  it('the boot sweep never collects a photo added while it runs', async () => {
    const { store, localId } = fresh();
    startUploader(store); // the sweep starts, and awaits the store
    await waiting(store, localId); // added during it
    await vi.waitFor(() => expect(ids(store)).toEqual(['server-1']));
  });

  it('uploads as the photo’s own student, records the server id on the device, then swaps', async () => {
    const { store, localId } = fresh();
    startUploader(store);
    await waiting(store, localId);
    await vi.waitFor(() => expect(ids(store)).toEqual(['server-1']));
    expect(upload.addPhoto.mock.calls[0]![3]).toBe(UID); // expectUid: never another session's
    expect((await getPhoto(localId, UID))?.serverId).toBe('server-1'); // durable before the swap
  });

  it('resumes from a recorded server id without a second upload (crash after upload)', async () => {
    const { store, localId } = fresh();
    await waiting(store, localId, { serverId: 'server-earlier' });
    startUploader(store);
    await vi.waitFor(() => expect(ids(store)).toEqual(['server-earlier']));
    expect(upload.addPhoto).not.toHaveBeenCalled();
  });

  it('a stopped uploader (route unmounted) swaps nothing, and keeps the device copy', async () => {
    const { store, localId } = fresh();
    let finish!: (id: string) => void;
    upload.addPhoto.mockImplementation(() => new Promise<string>((r) => (finish = r)));
    startUploader(store);
    await waiting(store, localId);
    await vi.waitFor(() => expect(upload.addPhoto).toHaveBeenCalled());
    stopPhotoUploads(store);
    finish('server-late');
    await new Promise((r) => setTimeout(r, 10));
    expect(store.getState().responses.photos?.q?.[0]?.local).toBe(true);
    // The next start resumes from here rather than losing it.
    expect((await getPhoto(localId, UID))?.serverId).toBe('server-late');
  });

  it('only the tab holding the lock uploads', async () => {
    const { store, localId } = fresh();
    setPhotoUploadGate(() => false);
    const up = startUploader(store);
    await waiting(store, localId);
    await vi.waitFor(() => expect(up.status(localId)).toEqual({ state: 'waiting' }));
    expect(upload.addPhoto).not.toHaveBeenCalled();
  });

  it('a photo removed while it uploaded leaves Storage too', async () => {
    const { store, localId } = fresh();
    let finish!: (id: string) => void;
    upload.addPhoto.mockImplementation(() => new Promise<string>((r) => (finish = r)));
    startUploader(store);
    await waiting(store, localId);
    await vi.waitFor(() => expect(upload.addPhoto).toHaveBeenCalled());
    store.setPhotos('q', []);
    finish('server-orphan');
    await vi.waitFor(() => expect(upload.discardPhoto).toHaveBeenCalledWith('server-orphan'));
  });

  it('a transient failure retries on its own (lie-fi), without a click', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { store, localId } = fresh();
    upload.addPhoto.mockRejectedValueOnce(new PhotoError('upload_failed'));
    const up = startUploader(store);
    await waiting(store, localId);
    await vi.waitFor(() => expect(up.status(localId)).toEqual({ state: 'failed', code: 'upload_failed' }));
    await vi.advanceTimersByTimeAsync(10_500);
    await vi.waitFor(() => expect(ids(store)).toEqual(['server-1']));
  });

  it('a refusal the student must act on is never retried on its own', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { store, localId } = fresh();
    upload.addPhoto.mockRejectedValue(new PhotoError('photo_cap'));
    const up = startUploader(store);
    await waiting(store, localId);
    await vi.waitFor(() => expect(up.status(localId)).toEqual({ state: 'failed', code: 'photo_cap' }));
    await vi.advanceTimersByTimeAsync(400_000);
    expect(upload.addPhoto).toHaveBeenCalledTimes(1);
  });
});
