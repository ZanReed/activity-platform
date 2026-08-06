// =============================================================================
// buffer.test.ts — the local-first buffer + persisted identity (S6 V1)
// -----------------------------------------------------------------------------
// What these pin, and why each one exists:
//
//   - The key scheme, because sign-out purges BY PREFIX. A buffer written
//     outside `activity-viewer:` is student work that sign-out silently misses.
//   - The two identity layers (key + in-blob userId), because the failure they
//     prevent — student B resuming student A's work — is silent by nature.
//   - Debounce + flush-on-hide, because the lost window is exactly the lid
//     closing, which is how most of these sessions end.
//   - Quota/unavailable degradation, because a full disk must not take the
//     viewer down with it.
//   - The write gate, because a stale tab flushing on close would clobber the
//     live tab's newer work (the two-tab hazard, guarded before V3 needs it).
//
// Runs in node with a fake storage + scripted ports: the ports exist so these
// cases are exact rather than timing-dependent (ruling S6-7).
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  BUFFER_KEY_PREFIX,
  CHECK_WIRE_VERSION,
  CheckError,
  VIEWER_STORAGE_PREFIX,
  VIEWER_STORE_SCHEMA_VERSION,
  bufferKey,
  createMockCheckService,
  createViewerBuffer,
  createViewerStore,
  emptyPersistedState,
  fingerprintResponses,
  hydrateViewerState,
  parseBufferKey,
  serializeViewerState,
  sweepForeignStorage,
  sweepOrphanVersions,
  type CheckService,
  type Clock,
  type HideSignal,
  type StorageLike,
  type TimerHandle,
} from '../src/index.js';
import { OTHER_USER_ID, TEST_USER_ID } from './helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const OTHER_VERSION = 'bbbbbbbb-0000-4000-8000-000000000002';

// ---------------------------------------------------------------------------
// Test doubles. Deliberately small and shaped by the real interfaces — a
// double that drifts from the thing it stands in for manufactures confidence
// (this repo has already lost a production error path to exactly that).
// ---------------------------------------------------------------------------

class FakeStorage implements StorageLike {
  private map = new Map<string, string>();
  /** When set, every setItem throws it — the full-disk / locked-profile case. */
  failWith?: unknown;

  get length(): number {
    return this.map.size;
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.failWith) throw this.failWith;
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  keys(): string[] {
    return [...this.map.keys()];
  }
}

function fakeClock(): Clock & { tick(): void; pending(): number } {
  let queue: Array<{ id: number; fn: () => void }> = [];
  let nextId = 1;
  return {
    now: () => 0,
    setTimer(fn) {
      const id = nextId++;
      queue.push({ id, fn });
      return id as unknown as TimerHandle;
    },
    clearTimer(handle) {
      queue = queue.filter((t) => (t.id as unknown as TimerHandle) !== handle);
    },
    tick() {
      const due = queue;
      queue = [];
      for (const t of due) t.fn();
    },
    pending: () => queue.length,
  };
}

function fakeHideSignal(): HideSignal & { hide(): void } {
  const listeners = new Set<() => void>();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hide() {
      for (const l of listeners) l();
    },
  };
}

function makeBuffer(
  overrides: Partial<Parameters<typeof createViewerBuffer>[0]> = {},
) {
  const storage = new FakeStorage();
  const clock = fakeClock();
  const hideSignal = fakeHideSignal();
  let payload = '{"v":1}';
  const buffer = createViewerBuffer({
    storage,
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    serialize: () => payload,
    clock,
    hideSignal,
    ...overrides,
  });
  return {
    buffer,
    storage,
    clock,
    hideSignal,
    setPayload: (next: string) => {
      payload = next;
    },
    key: bufferKey({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
    }),
  };
}

/**
 * A CheckService that records the idempotency key of every call. Built ONCE
 * against the real interface rather than inlined per test: an ad-hoc object
 * literal that happens to satisfy the call site is how a double drifts from
 * the contract it stands for.
 */
function recordingCheckService(): CheckService & {
  keys: Array<string | undefined>;
} {
  // `idempotencyKey` is OPTIONAL on the wire (S4-B2 added it additively), so
  // the recorded type keeps the undefined: a store that stopped sending one
  // then shows up as a literal `undefined` in the assertion rather than being
  // quietly coerced into looking fine.
  const keys: Array<string | undefined> = [];
  return {
    keys,
    async checkSection(request) {
      keys.push(request.idempotencyKey);
      return {
        wireVersion: CHECK_WIRE_VERSION,
        sectionId: request.sectionId,
        items: {},
        solutions: {},
      };
    },
    async fetchReleasedFeedback() {
      return { graded: false, blocks: {} };
    },
  };
}

// ---------------------------------------------------------------------------

describe('key scheme (the shared-device purge contract)', () => {
  it('every buffer key sits under the prefix sign-out purges', () => {
    const key = bufferKey({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
    });
    // If this ever fails, signOutEverything stops finding buffers and student
    // work outlives sign-out on a shared machine.
    expect(key.startsWith(VIEWER_STORAGE_PREFIX)).toBe(true);
    expect(key.startsWith(BUFFER_KEY_PREFIX)).toBe(true);
  });

  it('round-trips through parseBufferKey', () => {
    const parts = {
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
    };
    expect(parseBufferKey(bufferKey(parts))).toEqual(parts);
  });

  it('refuses keys outside the buffer namespace or with the wrong arity', () => {
    expect(parseBufferKey('unrelated-key')).toBeNull();
    expect(parseBufferKey(`${VIEWER_STORAGE_PREFIX}something-else`)).toBeNull();
    expect(parseBufferKey(`${BUFFER_KEY_PREFIX}only:two`)).toBeNull();
    expect(parseBufferKey(`${BUFFER_KEY_PREFIX}a:b:c:d`)).toBeNull();
    expect(parseBufferKey(`${BUFFER_KEY_PREFIX}::`)).toBeNull();
  });
});

describe('boot sweep (crash-then-next-student path)', () => {
  it('removes every other user’s buffer and keeps the current user’s', () => {
    const storage = new FakeStorage();
    const mine = bufferKey({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
    });
    const theirs = bufferKey({
      userId: OTHER_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
    });
    const theirOtherActivity = bufferKey({
      userId: OTHER_USER_ID,
      activityId: 'aaaaaaaa-0000-4000-8000-000000000009',
      versionId: VERSION,
    });
    storage.setItem(mine, 'mine');
    storage.setItem(theirs, 'theirs');
    storage.setItem(theirOtherActivity, 'theirs too');

    const removed = sweepForeignStorage(storage, TEST_USER_ID);

    expect(removed).toHaveLength(2);
    expect(storage.getItem(mine)).toBe('mine');
    expect(storage.getItem(theirs)).toBeNull();
    expect(storage.getItem(theirOtherActivity)).toBeNull();
  });

  it('removes anything viewer-namespaced it cannot attribute, and nothing else', () => {
    const storage = new FakeStorage();
    const malformed = `${BUFFER_KEY_PREFIX}garbage`;
    const unscopedViewerKey = `${VIEWER_STORAGE_PREFIX}ui-prefs`;
    const otherApp = 'theme';
    storage.setItem(malformed, 'x');
    storage.setItem(unscopedViewerKey, 'y');
    storage.setItem(otherApp, 'dark');

    sweepForeignStorage(storage, TEST_USER_ID);

    // A key under our prefix that names no user cannot be shown to belong to
    // THIS student, and sign-out already deletes the whole prefix — so leaving
    // it for the next student would be the one inconsistency between the two
    // paths that clean a shared device.
    expect(storage.getItem(malformed)).toBeNull();
    expect(storage.getItem(unscopedViewerKey)).toBeNull();
    // Outside the prefix is somebody else's business.
    expect(storage.getItem(otherApp)).toBe('dark');
  });

  it('survives a storage that throws (locked-down profile)', () => {
    const hostile: StorageLike = {
      get length(): number {
        throw new Error('denied');
      },
      key: () => null,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    expect(() => sweepForeignStorage(hostile, TEST_USER_ID)).not.toThrow();
  });
});

describe('orphan GC (republish accumulation)', () => {
  it('drops this user’s other-version buffers for the same activity only', () => {
    const storage = new FakeStorage();
    const keep = bufferKey({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
    });
    const orphan = bufferKey({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: OTHER_VERSION,
    });
    const otherActivity = bufferKey({
      userId: TEST_USER_ID,
      activityId: 'aaaaaaaa-0000-4000-8000-000000000009',
      versionId: OTHER_VERSION,
    });
    const otherUser = bufferKey({
      userId: OTHER_USER_ID,
      activityId: ACTIVITY,
      versionId: OTHER_VERSION,
    });
    for (const k of [keep, orphan, otherActivity, otherUser]) {
      storage.setItem(k, 'x');
    }

    const removed = sweepOrphanVersions(storage, {
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
    });

    expect(removed).toEqual([orphan]);
    expect(storage.getItem(keep)).toBe('x');
    // Another activity may legitimately have work in progress; another user's
    // buffer is the boot sweep's business, not the GC's.
    expect(storage.getItem(otherActivity)).toBe('x');
    expect(storage.getItem(otherUser)).toBe('x');
  });
});

describe('write policy', () => {
  it('debounces: many saves collapse into one write', () => {
    const { buffer, storage, clock, key } = makeBuffer();

    buffer.save();
    buffer.save();
    buffer.save();
    expect(storage.getItem(key)).toBeNull(); // nothing written yet

    clock.tick();
    expect(storage.getItem(key)).toBe('{"v":1}');
    expect(clock.pending()).toBe(0);
  });

  it('flushes synchronously when the page goes away (the lid-close window)', () => {
    const { buffer, storage, hideSignal, key } = makeBuffer();

    buffer.save(); // still inside the debounce window
    hideSignal.hide();

    // The whole point: no tick, no timer — the work is already durable.
    expect(storage.getItem(key)).toBe('{"v":1}');
  });

  it('writes the LATEST state, not the state when save() was first called', () => {
    const { buffer, storage, clock, setPayload, key } = makeBuffer();

    buffer.save();
    setPayload('{"v":2}');
    clock.tick();

    expect(storage.getItem(key)).toBe('{"v":2}');
  });

  it('flush with nothing pending writes nothing', () => {
    const { buffer, storage, key } = makeBuffer();
    buffer.flush();
    expect(storage.getItem(key)).toBeNull();
  });

  it('load reads back what was written; clear removes it', () => {
    const { buffer, clock } = makeBuffer();
    buffer.save();
    clock.tick();
    expect(buffer.load()).toBe('{"v":1}');

    buffer.clear();
    expect(buffer.load()).toBeNull();
  });

  it('dispose flushes pending work and stops listening', () => {
    const { buffer, storage, hideSignal, key } = makeBuffer();
    buffer.save();
    buffer.dispose();
    expect(storage.getItem(key)).toBe('{"v":1}');

    // After dispose the hide listener is gone — no writes from a dead buffer.
    storage.removeItem(key);
    hideSignal.hide();
    expect(storage.getItem(key)).toBeNull();
  });
});

describe('degradation (never take the viewer down)', () => {
  it('reports quota-exceeded, keeps the work pending, and recovers', () => {
    const { buffer, storage, clock, key } = makeBuffer();
    storage.failWith = Object.assign(new Error('full'), {
      name: 'QuotaExceededError',
    });

    expect(buffer.status()).toBe('ok');
    buffer.save();
    clock.tick();
    expect(buffer.status()).toBe('quota-exceeded');

    // Still dirty: the student's work is not lost, and a later flush with room
    // available must land it. A buffer that gave up here would drop work the
    // student can still see on screen.
    storage.failWith = undefined;
    buffer.flush();
    expect(storage.getItem(key)).toBe('{"v":1}');
    expect(buffer.status()).toBe('ok');
  });

  it('reports unavailable for a non-quota storage failure', () => {
    const { buffer, storage, clock } = makeBuffer();
    storage.failWith = new Error('SecurityError');
    buffer.save();
    clock.tick();
    expect(buffer.status()).toBe('unavailable');
  });

  it('announces status transitions once, not per write', () => {
    const seen: string[] = [];
    const { buffer, storage, clock } = makeBuffer({
      onStatusChange: (s) => seen.push(s),
    });
    storage.failWith = new Error('nope');
    buffer.save();
    clock.tick();
    buffer.save();
    clock.tick();
    expect(seen).toEqual(['unavailable']);
  });
});

describe('write gate (two-tab safety, ruling S6-4)', () => {
  it('a tab without the write right never persists — including on hide', () => {
    const { buffer, storage, clock, hideSignal, key } = makeBuffer({
      canWrite: () => false,
    });

    buffer.save();
    clock.tick();
    hideSignal.hide();

    // The stale-tab clobber: without this gate, closing a read-only tab hours
    // later would overwrite the active tab's newer work.
    expect(storage.getItem(key)).toBeNull();
  });

  it('work stays pending and lands once the right is regained', () => {
    let allowed = false;
    const { buffer, storage, clock, key } = makeBuffer({
      canWrite: () => allowed,
    });

    buffer.save();
    clock.tick();
    expect(storage.getItem(key)).toBeNull();

    allowed = true; // takeover: this tab is now the holder
    buffer.flush();
    expect(storage.getItem(key)).toBe('{"v":1}');
  });
});

describe('persisted identity (ruling S6-1)', () => {
  it('a blob carrying another student’s id never hydrates', () => {
    const foreign = serializeViewerState(
      emptyPersistedState(OTHER_USER_ID, ACTIVITY, VERSION),
    );
    // Layer 2. Layer 1 is the key scheme; this one holds even if a blob
    // somehow arrives under the wrong key.
    expect(hydrateViewerState(foreign, TEST_USER_ID)).toBeNull();
    expect(hydrateViewerState(foreign, OTHER_USER_ID)).not.toBeNull();
  });

  it('the store refuses a foreign blob through its own hydrate', () => {
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: createMockCheckService({}),
    });
    const foreign = serializeViewerState({
      ...emptyPersistedState(OTHER_USER_ID, ACTIVITY, VERSION),
      responses: {
        ...emptyPersistedState(OTHER_USER_ID, ACTIVITY, VERSION).responses,
        blanks: { 'blank-1': 'their answer' },
      },
    });

    expect(store.hydrate(foreign)).toBe(false);
    expect(store.getState().responses.blanks['blank-1']).toBeUndefined();
  });

  it('a blob with no userId at all is refused (shape gate)', () => {
    const raw = JSON.parse(
      serializeViewerState(emptyPersistedState(TEST_USER_ID, ACTIVITY, VERSION)),
    ) as Record<string, unknown>;
    delete raw.userId;
    expect(hydrateViewerState(JSON.stringify(raw), TEST_USER_ID)).toBeNull();
  });

  it('a blob missing the S6 maps is refused rather than half-read', () => {
    for (const field of ['pending', 'inFlight'] as const) {
      const raw = JSON.parse(
        serializeViewerState(
          emptyPersistedState(TEST_USER_ID, ACTIVITY, VERSION),
        ),
      ) as Record<string, unknown>;
      delete raw[field];
      expect(hydrateViewerState(JSON.stringify(raw), TEST_USER_ID)).toBeNull();
    }
  });

  it('the schema gate still refuses an unknown future version', () => {
    const raw = JSON.parse(
      serializeViewerState(emptyPersistedState(TEST_USER_ID, ACTIVITY, VERSION)),
    ) as Record<string, unknown>;
    raw.schemaVersion = VIEWER_STORE_SCHEMA_VERSION + 1;
    expect(hydrateViewerState(JSON.stringify(raw), TEST_USER_ID)).toBeNull();
  });
});

describe('response fingerprint (drift detection input)', () => {
  it('is stable regardless of the order answers were filled in', () => {
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: createMockCheckService({}),
    });
    store.setBlank('b1', '3');
    store.setBlank('b2', '4');
    const forwards = fingerprintResponses(store.getState().responses);

    const other = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: createMockCheckService({}),
    });
    other.setBlank('b2', '4');
    other.setBlank('b1', '3');

    // Without key-order normalization this fails, and the "Checked your latest
    // answers" notice would fire on unchanged work — a notice that cries wolf
    // is worse than none.
    expect(fingerprintResponses(other.getState().responses)).toBe(forwards);
  });

  it('changes when an answer changes', () => {
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: createMockCheckService({}),
    });
    store.setBlank('b1', '3');
    const before = fingerprintResponses(store.getState().responses);
    store.setBlank('b1', '4');
    expect(fingerprintResponses(store.getState().responses)).not.toBe(before);
  });
});

describe('in-flight idempotency key survives a reload (ruling S6-3)', () => {
  // A REAL CheckError, not a bare Error: the production client always attaches
  // `kind`, and a double that omits it takes a different branch
  // in the store (the untyped-error console.error path). Doubles that don't
  // match the thing they stand in for is how this repo previously shipped a
  // dead error path that every unit test agreed was fine.
  const failing = () =>
    createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: createMockCheckService({
        failWith: new CheckError('offline', 'Could not reach the server.'),
      }),
    });

  it('persists the key of a check that failed, so the retry is a replay', async () => {
    const store = failing();
    store.setBlank('blank-1', '3');
    await store.checkSection('sec-1', { blanks: ['blank-1'] });

    const persisted = hydrateViewerState(store.serialize(), TEST_USER_ID);
    const key = persisted?.inFlight['sec-1']?.checkId;
    expect(key).toBeTruthy();

    // The reload: a fresh store hydrates and must reuse that key, or the
    // server records a SECOND attempt for one piece of student work.
    const service = recordingCheckService();
    const reopened = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    expect(reopened.hydrate(store.serialize())).toBe(true);
    await reopened.checkSection('sec-1', { blanks: ['blank-1'] });

    expect(service.keys).toEqual([key]);
  });

  it('clears the key on success, so a deliberate re-check is a new attempt', async () => {
    const service = recordingCheckService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });

    await store.checkSection('sec-1', {});
    await store.checkSection('sec-1', {});

    expect(service.keys).toHaveLength(2);
    expect(service.keys[0]).not.toBe(service.keys[1]);
    expect(
      hydrateViewerState(store.serialize(), TEST_USER_ID)?.inFlight['sec-1'],
    ).toBeUndefined();
  });

  it('records the key BEFORE awaiting, so a tab death mid-request is covered', async () => {
    let observed: string | undefined;
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: {
        async checkSection(request) {
          // Mid-flight: this is the moment the lid closes. Whatever the buffer
          // holds right now is all the next session gets.
          observed = hydrateViewerState(store.serialize(), TEST_USER_ID)
            ?.inFlight['sec-1']?.checkId;
          return {
            wireVersion: CHECK_WIRE_VERSION,
            sectionId: request.sectionId,
            items: {},
            solutions: {},
          };
        },
        async fetchReleasedFeedback() {
          return { graded: false, blocks: {} };
        },
      },
    });

    await store.checkSection('sec-1', {});
    expect(observed).toBeTruthy();
  });
});
