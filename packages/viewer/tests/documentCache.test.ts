// =============================================================================
// documentCache.test.ts — the on-device document + the GC exception (S6 V6)
// -----------------------------------------------------------------------------
// The headline case here is a silent data-loss bug that V1 shipped and S6-9
// exists to prevent: a teacher republishes overnight, and the orphan GC — whose
// whole job is tidying superseded versions — deletes the buffer of every
// student who left a check unsent. No error, no trace, and the student's only
// symptom is that their work is gone.
//
// So the GC now has exactly one exception, and it is tested from both sides:
// spent buffers still get collected (otherwise the GC stops doing its job and
// the quota ceiling comes back), and unsent ones survive.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  bufferHasUnsentWork,
  bufferKey,
  documentKey,
  emptyPersistedState,
  findUnsentWork,
  loadAnyCachedDocument,
  loadCachedDocument,
  parseScopedKey,
  saveCachedDocument,
  serializeViewerState,
  sweepForeignStorage,
  sweepOrphanVersions,
  type CachedDocument,
  type StorageLike,
} from '../src/index.js';
import { OTHER_USER_ID, TEST_USER_ID } from './helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const V1 = 'bbbbbbbb-0000-4000-8000-000000000001';
const V2 = 'bbbbbbbb-0000-4000-8000-000000000002';

class FakeStorage implements StorageLike {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  key(i: number): string | null {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k: string): string | null {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, v);
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
  keys(): string[] {
    return [...this.map.keys()];
  }
}

/** A buffer blob with responses and/or a queued check. */
function blob(options: { answered?: boolean; queued?: boolean } = {}): string {
  const base = emptyPersistedState(TEST_USER_ID, ACTIVITY, V1);
  return serializeViewerState({
    ...base,
    responses: options.answered
      ? { ...base.responses, blanks: { 'blank-1': '42' } }
      : base.responses,
    pending: options.queued ? { 'sec-1': { fingerprint: 'fp' } } : {},
  });
}

function cached(versionId: string) {
  return {
    activityId: ACTIVITY,
    versionId,
    versionNum: 1,
    title: 'Systems',
    document: { sections: [] },
  };
}

describe('unsent-work detection', () => {
  it('sees answers and queued checks; ignores an empty blob', () => {
    expect(bufferHasUnsentWork(blob({ answered: true }))).toBe(true);
    expect(bufferHasUnsentWork(blob({ queued: true }))).toBe(true);
    expect(bufferHasUnsentWork(blob())).toBe(false);
    expect(bufferHasUnsentWork(null)).toBe(false);
    expect(bufferHasUnsentWork('not json')).toBe(false);
  });
});

describe('the orphan GC exception (ruling S6-9)', () => {
  it('does NOT collect a superseded buffer that still holds work', () => {
    const storage = new FakeStorage();
    const old = bufferKey({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: V1 });
    storage.setItem(old, blob({ answered: true, queued: true }));

    sweepOrphanVersions(storage, {
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: V2,
    });

    // Before this exception existed, a teacher republishing overnight deleted
    // exactly this — silently, for every student mid-activity.
    expect(storage.getItem(old)).not.toBeNull();
  });

  it('still collects a spent one, so the GC keeps doing its job', () => {
    const storage = new FakeStorage();
    const spent = bufferKey({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: V1 });
    storage.setItem(spent, blob());

    const removed = sweepOrphanVersions(storage, {
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: V2,
    });

    expect(removed).toEqual([spent]);
  });

  it('always collects superseded DOCUMENTS — they hold no student work', () => {
    const storage = new FakeStorage();
    saveCachedDocument(storage, TEST_USER_ID, cached(V1));

    const removed = sweepOrphanVersions(storage, {
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: V2,
    });

    expect(removed).toHaveLength(1);
    expect(removed[0]).toContain(':doc:');
  });

  it('finds the stranded version so the boot path can act on it', () => {
    const storage = new FakeStorage();
    storage.setItem(
      bufferKey({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: V1 }),
      blob({ queued: true }),
    );

    const found = findUnsentWork(storage, {
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: V2,
    });

    expect(found?.versionId).toBe(V1);
  });

  it('reports nothing when the only other buffer is spent', () => {
    const storage = new FakeStorage();
    storage.setItem(
      bufferKey({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: V1 }),
      blob(),
    );
    expect(
      findUnsentWork(storage, {
        userId: TEST_USER_ID,
        activityId: ACTIVITY,
        versionId: V2,
      }),
    ).toBeNull();
  });
});

describe('the document cache', () => {
  it('round-trips a served document', () => {
    const storage = new FakeStorage();
    expect(saveCachedDocument(storage, TEST_USER_ID, cached(V1))).toBe(true);

    const back = loadCachedDocument(storage, TEST_USER_ID, ACTIVITY, V1);
    expect(back?.versionId).toBe(V1);
    expect(back?.title).toBe('Systems');
  });

  it('is scoped per user, like everything else on a shared device', () => {
    const storage = new FakeStorage();
    saveCachedDocument(storage, TEST_USER_ID, cached(V1));
    expect(loadCachedDocument(storage, OTHER_USER_ID, ACTIVITY, V1)).toBeNull();
  });

  it('finds any version for the offline case, preferring the asked-for one', () => {
    const storage = new FakeStorage();
    saveCachedDocument(storage, TEST_USER_ID, cached(V1));
    saveCachedDocument(storage, TEST_USER_ID, cached(V2));

    expect(
      loadAnyCachedDocument(storage, TEST_USER_ID, ACTIVITY, V2)?.versionId,
    ).toBe(V2);
    // No preference: any cached copy beats an error screen.
    expect(loadAnyCachedDocument(storage, TEST_USER_ID, ACTIVITY)).not.toBeNull();
  });

  it('refuses a corrupt or half-shaped record rather than rendering it', () => {
    const storage = new FakeStorage();
    storage.setItem(
      documentKey({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: V1 }),
      '{"activityId":"x"}',
    );
    expect(loadCachedDocument(storage, TEST_USER_ID, ACTIVITY, V1)).toBeNull();
  });

  it('joins the one key grammar, so one sweep covers it', () => {
    const key = documentKey({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: V1,
    });
    expect(parseScopedKey(key)).toEqual({
      kind: 'doc',
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: V1,
    });
  });

  it('is swept with the buffers when another student signs in', () => {
    const storage = new FakeStorage();
    saveCachedDocument(storage, OTHER_USER_ID, cached(V1));
    saveCachedDocument(storage, TEST_USER_ID, cached(V1));

    sweepForeignStorage(storage, TEST_USER_ID);

    // A cached document is the activity's CONTENT, not the previous student's
    // answers — but it is still theirs, and the sweep must reach it.
    expect(loadCachedDocument(storage, OTHER_USER_ID, ACTIVITY, V1)).toBeNull();
    expect(loadCachedDocument(storage, TEST_USER_ID, ACTIVITY, V1)).not.toBeNull();
  });
});

// -----------------------------------------------------------------------------
// The byte budget (eng review D5/D27) — both sides, like the GC exception.
// -----------------------------------------------------------------------------
describe('the document-cache byte budget (D5)', () => {
  const A2 = 'aaaaaaaa-0000-4000-8000-000000000002';
  const A3 = 'aaaaaaaa-0000-4000-8000-000000000003';
  const A4 = 'aaaaaaaa-0000-4000-8000-000000000004';

  /** ~0.9 MB of document, so three exceed DOC_CACHE_BUDGET (2 MiB). */
  const bigDoc = (activityId: string, versionId: string): CachedDocument => ({
    activityId,
    versionId,
    versionNum: 1,
    title: 't',
    document: { pad: 'x'.repeat(900_000) },
  });

  it('evicts the least-recently-SAVED entry once the budget is exceeded', () => {
    const storage = new FakeStorage();
    let t = 1000;
    const clock = () => t;

    saveCachedDocument(storage, TEST_USER_ID, bigDoc(ACTIVITY, V1), clock);
    t = 2000;
    saveCachedDocument(storage, TEST_USER_ID, bigDoc(A2, V1), clock);
    t = 3000;
    // Third save blows the budget: the OLDEST (ACTIVITY, t=1000) must go.
    saveCachedDocument(storage, TEST_USER_ID, bigDoc(A3, V1), clock);

    expect(loadCachedDocument(storage, TEST_USER_ID, ACTIVITY, V1)).toBeNull();
    expect(loadCachedDocument(storage, TEST_USER_ID, A2, V1)).not.toBeNull();
    expect(loadCachedDocument(storage, TEST_USER_ID, A3, V1)).not.toBeNull();
  });

  it('NEVER evicts an activity whose buffer holds unsent work (the V6 exception)', () => {
    const storage = new FakeStorage();
    let t = 1000;
    const clock = () => t;

    saveCachedDocument(storage, TEST_USER_ID, bigDoc(ACTIVITY, V1), clock);
    // The oldest activity has unsent work — its offline copy is untouchable.
    storage.setItem(
      bufferKey({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: V1 }),
      blob({ answered: true }),
    );
    t = 2000;
    saveCachedDocument(storage, TEST_USER_ID, bigDoc(A2, V1), clock);
    t = 3000;
    saveCachedDocument(storage, TEST_USER_ID, bigDoc(A3, V1), clock);

    // The exempt oldest survives; the next-oldest unexempt entry went instead.
    expect(loadCachedDocument(storage, TEST_USER_ID, ACTIVITY, V1)).not.toBeNull();
    expect(loadCachedDocument(storage, TEST_USER_ID, A2, V1)).toBeNull();
    expect(loadCachedDocument(storage, TEST_USER_ID, A3, V1)).not.toBeNull();
  });

  it('treats a pre-budget blob (no touchedAt) as the oldest candidate', () => {
    const storage = new FakeStorage();
    // A legacy entry written before the budget existed.
    storage.setItem(
      documentKey({ userId: TEST_USER_ID, activityId: A4, versionId: V1 }),
      JSON.stringify({
        activityId: A4,
        versionId: V1,
        versionNum: 1,
        title: 'legacy',
        document: { pad: 'x'.repeat(900_000) },
      }),
    );
    let t = 5000;
    const clock = () => t;
    saveCachedDocument(storage, TEST_USER_ID, bigDoc(ACTIVITY, V1), clock);
    t = 6000;
    saveCachedDocument(storage, TEST_USER_ID, bigDoc(A2, V1), clock);

    expect(loadCachedDocument(storage, TEST_USER_ID, A4, V1)).toBeNull();
    expect(loadCachedDocument(storage, TEST_USER_ID, ACTIVITY, V1)).not.toBeNull();
  });

  it('on a quota failure, sheds the oldest copy and retries once', () => {
    let failNext = true;
    class QuotaStorage extends FakeStorage {
      override setItem(k: string, v: string): void {
        if (failNext && parseScopedKey(k)?.kind === 'doc') {
          failNext = false;
          const err = new Error('quota');
          (err as { name: string }).name = 'QuotaExceededError';
          throw err;
        }
        super.setItem(k, v);
      }
    }
    const storage = new QuotaStorage();
    // Something old to shed.
    failNext = false;
    saveCachedDocument(storage, TEST_USER_ID, bigDoc(ACTIVITY, V1), () => 1);
    failNext = true;

    const ok = saveCachedDocument(storage, TEST_USER_ID, bigDoc(A2, V1), () => 2);
    expect(ok).toBe(true);
    expect(loadCachedDocument(storage, TEST_USER_ID, ACTIVITY, V1)).toBeNull();
    expect(loadCachedDocument(storage, TEST_USER_ID, A2, V1)).not.toBeNull();
  });
});
