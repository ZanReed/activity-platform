// =============================================================================
// caches.test.ts — the SW cache naming contract (S6 V4: rulings S6-5 / S6-6)
// -----------------------------------------------------------------------------
// These names are a contract with a service worker that does not exist yet
// (V8). Pinning them now is the point: the purge and the sweep are written
// against these names, so a worker that later invents its own would leave
// student documents on a shared machine with nothing failing to say so.
//
// The specific hazard being guarded is not staleness — it is that the Cache API
// keys by URL and ignores auth, while this platform serves a PER-STUDENT
// shuffled document from one URL. A shared content cache hands student B the
// document built for student A, and B's ordering answers then get graded
// against the wrong shuffle.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  VIEWER_CACHE_PREFIX,
  VIEWER_SHELL_CACHE,
  contentCacheUser,
  purgeStudentCaches,
  sweepForeignCaches,
  viewerContentCacheName,
  type CacheStorageLike,
} from '../src/index.js';
import { OTHER_USER_ID, TEST_USER_ID } from './helpers/ids.js';

/** Stands in for CacheStorage: a set of names, opened and deleted by name. */
function fakeCaches(names: string[]): CacheStorageLike & { names: string[] } {
  const api = {
    names: [...names],
    async keys() {
      return [...api.names];
    },
    async delete(name: string) {
      const before = api.names.length;
      api.names = api.names.filter((n) => n !== name);
      return api.names.length < before;
    },
  };
  return api;
}

describe('naming', () => {
  it('content caches carry the user, and round-trip', () => {
    const name = viewerContentCacheName(TEST_USER_ID);
    expect(name.startsWith(VIEWER_CACHE_PREFIX)).toBe(true);
    expect(contentCacheUser(name)).toBe(TEST_USER_ID);
  });

  it('the shell belongs to no user', () => {
    expect(contentCacheUser(VIEWER_SHELL_CACHE)).toBeNull();
  });

  it('foreign or malformed names are not read as anyone’s', () => {
    expect(contentCacheUser('workbox-precache-v2')).toBeNull();
    expect(contentCacheUser(`${VIEWER_CACHE_PREFIX}content:`)).toBeNull();
  });
});

describe('boot sweep', () => {
  it('drops other students’ content and keeps this student’s', async () => {
    const mine = viewerContentCacheName(TEST_USER_ID);
    const theirs = viewerContentCacheName(OTHER_USER_ID);
    const caches = fakeCaches([mine, theirs, VIEWER_SHELL_CACHE]);

    const removed = await sweepForeignCaches(caches, TEST_USER_ID);

    expect(removed).toEqual([theirs]);
    expect(caches.names).toContain(mine);
    // The shell is app code, not student data: wiping it would make the next
    // student re-download the app for no privacy gain.
    expect(caches.names).toContain(VIEWER_SHELL_CACHE);
  });

  it('leaves caches that are not ours alone', async () => {
    const caches = fakeCaches(['some-other-app-cache', 'workbox-precache-v2']);
    await sweepForeignCaches(caches, TEST_USER_ID);
    expect(caches.names).toHaveLength(2);
  });

  it('drops an unattributable viewer cache', async () => {
    const malformed = `${VIEWER_CACHE_PREFIX}content:`;
    const caches = fakeCaches([malformed]);
    await sweepForeignCaches(caches, TEST_USER_ID);
    expect(caches.names).toHaveLength(0);
  });

  it('survives a CacheStorage that throws', async () => {
    const hostile: CacheStorageLike = {
      keys: async () => {
        throw new Error('denied');
      },
      delete: async () => false,
    };
    await expect(
      sweepForeignCaches(hostile, TEST_USER_ID),
    ).resolves.toEqual([]);
  });
});

describe('sign-out purge', () => {
  it('removes EVERY student’s content, not just the signed-in one', async () => {
    const caches = fakeCaches([
      viewerContentCacheName(TEST_USER_ID),
      viewerContentCacheName(OTHER_USER_ID),
      VIEWER_SHELL_CACHE,
      'unrelated-app-cache',
    ]);

    const removed = await purgeStudentCaches(caches);

    // We are leaving the machine — "whose is it" stops being the question.
    expect(removed).toHaveLength(2);
    expect(caches.names).toEqual([VIEWER_SHELL_CACHE, 'unrelated-app-cache']);
  });

  it('keeps the shell so the next student does not re-download the app', async () => {
    const caches = fakeCaches([VIEWER_SHELL_CACHE]);
    await purgeStudentCaches(caches);
    expect(caches.names).toEqual([VIEWER_SHELL_CACHE]);
  });
});
