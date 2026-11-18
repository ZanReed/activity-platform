// photoStore.ts — the device copy of photos waiting to upload (slice 2b).
// jsdom has no IndexedDB, so this runs the in-memory fallback: the same API,
// and the same sweep rule the real store follows. The real IndexedDB path is
// the app's sw lane, e2e/sw/photo-offline.e2e.ts (a waiting photo survives a
// reload and resumes; sign-out leaves no store).
import { describe, expect, it } from 'vitest';
import { deletePhoto, getPhoto, putPhoto, sweepPhotos, type WaitingPhoto } from '../src/blocks/photoStore.js';

const photo = (localId: string, uid: string): WaitingPhoto => ({
  localId, uid, activityId: 'a', versionId: 'v', blockId: 'b', jpeg: new Blob(['x']), createdAt: 0,
});

describe('the device photo store', () => {
  it('reads back only the owner\'s photo', async () => {
    await putPhoto(photo('p1', 'me'));
    expect((await getPhoto('p1', 'me'))?.localId).toBe('p1');
    expect(await getPhoto('p1', 'someone-else')).toBeNull();
    await deletePhoto('p1');
    expect(await getPhoto('p1', 'me')).toBeNull();
  });

  it('the sweep keeps what is referenced, and nothing of anyone else\'s', async () => {
    await putPhoto(photo('mine-kept', 'me'));
    await putPhoto(photo('mine-orphan', 'me'));
    await putPhoto(photo('theirs', 'them'));
    const removed = await sweepPhotos('me', (p) => p.localId === 'mine-kept' || p.localId === 'theirs');
    expect(removed).toBe(2);
    expect(await getPhoto('mine-kept', 'me')).not.toBeNull();
    expect(await getPhoto('mine-orphan', 'me')).toBeNull();
    // Referenced or not, another student's photo never survives a sweep.
    expect(await getPhoto('theirs', 'them')).toBeNull();
  });
});
