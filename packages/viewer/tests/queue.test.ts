// =============================================================================
// queue.test.ts — queued checks end to end (S6 V2: rulings S6-2/S6-7/S6-8)
// -----------------------------------------------------------------------------
// The promise under test is the one the UI makes a student who pressed Check
// with no signal: "Will check when you're back online." Everything here is a
// way that promise can quietly break —
//
//   - the intent never gets recorded, so nothing fires (silent)
//   - it fires against the answers they had THEN, not now (wrong grade)
//   - it fires twice, so the teacher sees two attempts for one piece of work
//   - it fires with a dead token and reports a failure about their work
//   - it fires under the NEXT student's session (the shared-device nightmare)
//
// The connectivity and session seams are ports precisely so each of these is a
// deterministic case instead of a timing hope.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import {
  CHECK_WIRE_VERSION,
  CheckError,
  createCheckQueue,
  createViewerStore,
  hydrateViewerState,
  serializeViewerState,
  emptyPersistedState,
  type CheckRequest,
  type CheckService,
  type ConnectivitySignal,
  type SectionCheckResult,
  type SectionItemIds,
  type ViewerStore,
} from '../src/index.js';
import { OTHER_USER_ID, TEST_USER_ID } from './helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'sec-1';
const ITEMS: SectionItemIds = { blanks: ['blank-1'] };

/**
 * A CheckService whose reachability is a switch. `offline` throws the SAME
 * CheckError the real client throws when a request never leaves the device —
 * the store branches on that `kind`, so a bare Error here would exercise a
 * path production never takes.
 */
function switchableService(): CheckService & {
  offline: boolean;
  failWith?: CheckError;
  calls: CheckRequest[];
} {
  const api = {
    offline: false,
    failWith: undefined as CheckError | undefined,
    calls: [] as CheckRequest[],
    async checkSection(request: CheckRequest): Promise<SectionCheckResult> {
      api.calls.push(structuredClone(request));
      if (api.offline) {
        throw new CheckError('offline', 'Could not reach the server.');
      }
      if (api.failWith) throw api.failWith;
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
  return api;
}

function manualConnectivity(): ConnectivitySignal & {
  online: boolean;
  signal(): void;
} {
  const listeners = new Set<() => void>();
  const api = {
    online: true,
    isOnline: () => api.online,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    signal() {
      for (const l of listeners) l();
    },
  };
  return api;
}

function setup(
  overrides: Partial<Parameters<typeof createCheckQueue>[0]> = {},
): {
  store: ViewerStore;
  service: ReturnType<typeof switchableService>;
  connectivity: ReturnType<typeof manualConnectivity>;
  queue: ReturnType<typeof createCheckQueue>;
} {
  const service = switchableService();
  const connectivity = manualConnectivity();
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
  const queue = createCheckQueue({
    store,
    resolveItems: () => ITEMS,
    connectivity,
    ...overrides,
  });
  return { store, service, connectivity, queue };
}

/** Press Check with no network — the state every case below starts from. */
async function checkWhileOffline(
  s: ReturnType<typeof setup>,
  answer = 'first',
): Promise<void> {
  s.store.setBlank('blank-1', answer);
  s.service.offline = true;
  s.connectivity.online = false;
  await s.store.checkSection(SECTION, ITEMS);
}

describe('enqueueing (offline is a delay, not a failure)', () => {
  it('an offline check becomes pending, not an error', async () => {
    const s = setup();
    await checkWhileOffline(s);

    expect(s.store.getState().sections[SECTION]).toEqual({ phase: 'pending' });
    expect(s.store.getState().pending[SECTION]).toBeDefined();
  });

  it('the intent persists, so a closed lid does not lose it', async () => {
    const s = setup();
    await checkWhileOffline(s);

    // The buffer round-trip: this is the lid closing and the tab reopening.
    const persisted = hydrateViewerState(s.store.serialize(), TEST_USER_ID);
    expect(persisted?.pending[SECTION]).toBeDefined();

    const reopened = setup();
    expect(reopened.store.hydrate(s.store.serialize())).toBe(true);
    // Rebuilt as a DERIVED phase — nothing persisted the word 'pending'.
    expect(reopened.store.getState().sections[SECTION]).toEqual({
      phase: 'pending',
    });
  });

  it('a reachable-but-failing server is an ERROR, never a queued check', async () => {
    const s = setup();
    s.store.setBlank('blank-1', '3');
    s.service.failWith = new CheckError('server_error', 'boom');
    await s.store.checkSection(SECTION, ITEMS);

    // Queueing this would retry forever against a 500. 2.1A gives the student
    // an explicit Retry instead.
    expect(s.store.getState().sections[SECTION]?.phase).toBe('error');
    expect(s.store.getState().pending[SECTION]).toBeUndefined();
  });
});

describe('firing', () => {
  it('fires on the connectivity signal and lands the section checked', async () => {
    const s = setup();
    await checkWhileOffline(s);
    s.queue.start();

    s.service.offline = false;
    s.connectivity.online = true;
    s.connectivity.signal();
    await s.queue.runNow();

    expect(s.store.getState().sections[SECTION]?.phase).toBe('checked');
    expect(s.store.getState().pending[SECTION]).toBeUndefined();
  });

  it('fires on boot — a tab reopened after the outage never sees "online"', async () => {
    const s = setup();
    await checkWhileOffline(s);
    const raw = s.store.serialize();

    const reopened = setup();
    reopened.store.hydrate(raw);
    reopened.service.offline = false;
    reopened.connectivity.online = true;

    reopened.queue.start(); // no signal is ever emitted
    await reopened.queue.runNow();

    expect(reopened.store.getState().sections[SECTION]?.phase).toBe('checked');
  });

  it('grades the CURRENT answers, not the ones queued (2.2A)', async () => {
    const s = setup();
    await checkWhileOffline(s, 'first');

    s.store.setBlank('blank-1', 'edited during the outage');
    s.service.offline = false;
    s.connectivity.online = true;
    await s.queue.runNow();

    const fired = s.service.calls.at(-1)!;
    expect(fired.responses.blanks['blank-1']).toBe('edited during the outage');
  });

  it('says so when the answers changed while queued', async () => {
    const s = setup();
    await checkWhileOffline(s, 'first');
    s.store.setBlank('blank-1', 'second');
    s.service.offline = false;
    s.connectivity.online = true;
    await s.queue.runNow();

    const status = s.store.getState().sections[SECTION];
    if (status?.phase !== 'checked') throw new Error('expected checked');
    expect(status.answersChangedWhileQueued).toBe(true);
  });

  it('stays silent when they did not — the notice must not cry wolf', async () => {
    const s = setup();
    await checkWhileOffline(s, 'first');
    s.service.offline = false;
    s.connectivity.online = true;
    await s.queue.runNow();

    const status = s.store.getState().sections[SECTION];
    if (status?.phase !== 'checked') throw new Error('expected checked');
    expect(status.answersChangedWhileQueued).toBeUndefined();
  });

  it('reuses the idempotency key across the offline attempt and the fire', async () => {
    const s = setup();
    await checkWhileOffline(s);
    s.service.offline = false;
    s.connectivity.online = true;
    await s.queue.runNow();

    // ONE authority for keys (S6-3). Two would mean two attempts recorded for
    // one piece of student work.
    expect(s.service.calls).toHaveLength(2);
    expect(s.service.calls[0]!.idempotencyKey).toBe(
      s.service.calls[1]!.idempotencyKey,
    );
  });
});

describe('not firing', () => {
  it('does nothing while still offline', async () => {
    const s = setup();
    await checkWhileOffline(s);
    const before = s.service.calls.length;

    s.connectivity.signal(); // a spurious wake, still no network
    await s.queue.runNow();

    expect(s.service.calls).toHaveLength(before);
    expect(s.store.getState().pending[SECTION]).toBeDefined();
  });

  it('stops after a fire fails offline again, leaving the intent intact', async () => {
    const s = setup();
    await checkWhileOffline(s);

    // navigator.onLine lies (captive portal): the signal says online, the
    // network disagrees.
    s.connectivity.online = true;
    await s.queue.runNow();

    expect(s.store.getState().sections[SECTION]).toEqual({ phase: 'pending' });
    expect(s.store.getState().pending[SECTION]).toBeDefined();
  });

  it('fires ONCE when online and visibility both wake it', async () => {
    const s = setup();
    await checkWhileOffline(s);
    s.service.offline = false;
    s.connectivity.online = true;
    s.queue.start();

    // Both signals, same tick — exactly what a lid opening produces.
    const a = s.queue.runNow();
    const b = s.queue.runNow();
    s.connectivity.signal();
    await Promise.all([a, b]);
    await s.queue.runNow();

    // 1 offline attempt + exactly 1 queued fire.
    expect(s.service.calls).toHaveLength(2);
    expect(s.store.getState().sections[SECTION]?.phase).toBe('checked');
  });

  it('drops an intent whose section no longer exists in the served document', async () => {
    const s = setup({ resolveItems: () => null });
    await checkWhileOffline(s);
    s.service.offline = false;
    s.connectivity.online = true;
    await s.queue.runNow();

    // Firing blind would grade ids that aren't in this version.
    expect(s.store.getState().pending[SECTION]).toBeUndefined();
    expect(s.store.getState().sections[SECTION]).toBeUndefined();
    expect(s.service.calls).toHaveLength(1); // the original offline attempt only
  });

  it('stop() detaches — a stopped queue ignores connectivity', async () => {
    const s = setup();
    await checkWhileOffline(s);
    s.queue.start();
    s.queue.stop();

    s.service.offline = false;
    s.connectivity.online = true;
    s.connectivity.signal();
    await Promise.resolve();

    expect(s.store.getState().pending[SECTION]).toBeDefined();
  });
});

describe('session refresh before firing (outside-voice #8)', () => {
  it('refreshes BEFORE the check, not after a 401', async () => {
    const order: string[] = [];
    const s = setup({
      ensureSession: async () => {
        order.push('refresh');
        return true;
      },
    });
    await checkWhileOffline(s);
    s.service.offline = false;
    s.connectivity.online = true;
    const before = s.service.calls.length;
    await s.queue.runNow();
    order.push(`check:${s.service.calls.length - before}`);

    expect(order).toEqual(['refresh', 'check:1']);
  });

  it('parks on a failed refresh: nothing fires, the intent survives', async () => {
    const onAuthRequired = vi.fn();
    const s = setup({ ensureSession: async () => false, onAuthRequired });
    await checkWhileOffline(s);
    s.service.offline = false;
    s.connectivity.online = true;
    const before = s.service.calls.length;

    await s.queue.runNow();

    expect(s.service.calls).toHaveLength(before);
    expect(s.store.getState().pending[SECTION]).toBeDefined();
    expect(onAuthRequired).toHaveBeenCalledTimes(1);
  });

  it('fires after the session comes back', async () => {
    let signedIn = false;
    const s = setup({ ensureSession: async () => signedIn });
    await checkWhileOffline(s);
    s.service.offline = false;
    s.connectivity.online = true;
    await s.queue.runNow();
    expect(s.store.getState().pending[SECTION]).toBeDefined();

    signedIn = true;
    await s.queue.runNow();
    expect(s.store.getState().sections[SECTION]?.phase).toBe('checked');
  });

  it('does not refresh when there is nothing queued', async () => {
    const ensureSession = vi.fn(async () => true);
    const s = setup({ ensureSession });
    await s.queue.runNow();
    expect(ensureSession).not.toHaveBeenCalled();
  });
});

describe('user isolation (ruling R5)', () => {
  it('another student’s queued check never fires under this session', async () => {
    // Student A queues a check and walks away without signing out.
    const a = setup();
    await checkWhileOffline(a);
    const aBlob = a.store.serialize();

    // Student B signs in on the same Chromebook. Their store is theirs.
    const bService = switchableService();
    const bConnectivity = manualConnectivity();
    const bStore = createViewerStore({
      userId: OTHER_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: bService,
    });
    // Even handed A's blob directly, B refuses it.
    expect(bStore.hydrate(aBlob)).toBe(false);

    const bQueue = createCheckQueue({
      store: bStore,
      resolveItems: () => ITEMS,
      connectivity: bConnectivity,
    });
    bQueue.start();
    await bQueue.runNow();

    // A's work is not graded as B, and B sees no phantom pending section.
    expect(bService.calls).toHaveLength(0);
    expect(bStore.getState().pending[SECTION]).toBeUndefined();
    expect(bStore.getState().sections[SECTION]).toBeUndefined();
  });

  it('a blob whose user field was tampered with still cannot fire', async () => {
    const a = setup();
    await checkWhileOffline(a);
    const tampered = JSON.parse(a.store.serialize()) as Record<string, unknown>;
    tampered.userId = OTHER_USER_ID; // as if the key had been renamed

    const b = setup(); // this store belongs to TEST_USER_ID
    expect(b.store.hydrate(JSON.stringify(tampered))).toBe(false);
    b.service.offline = false;
    b.connectivity.online = true;
    await b.queue.runNow();
    expect(b.service.calls).toHaveLength(0);
  });
});

describe('multiple queued sections', () => {
  const SECTION_B = 'sec-2';

  it('fires them sequentially, not as a burst', async () => {
    const s = setup({
      resolveItems: (id) => (id === SECTION ? ITEMS : { blanks: ['blank-2'] }),
    });
    s.store.setBlank('blank-1', 'a');
    s.store.setBlank('blank-2', 'b');
    s.service.offline = true;
    s.connectivity.online = false;
    await s.store.checkSection(SECTION, ITEMS);
    await s.store.checkSection(SECTION_B, { blanks: ['blank-2'] });

    let concurrent = 0;
    let maxConcurrent = 0;
    const inner = s.service.checkSection.bind(s.service);
    s.service.checkSection = async (request) => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      try {
        return await inner(request);
      } finally {
        concurrent--;
      }
    };

    s.service.offline = false;
    s.connectivity.online = true;
    await s.queue.runNow();

    // A classroom reconnecting is thirty devices at once; per student we stay
    // at one in flight so a reconnect isn't a burst against the rate ceiling.
    expect(maxConcurrent).toBe(1);
    expect(s.store.getState().sections[SECTION]?.phase).toBe('checked');
    expect(s.store.getState().sections[SECTION_B]?.phase).toBe('checked');
  });

  it('an intent cleared mid-run is not re-fired', async () => {
    const s = setup({
      resolveItems: (id) => (id === SECTION ? ITEMS : { blanks: ['blank-2'] }),
    });
    s.service.offline = true;
    s.connectivity.online = false;
    await s.store.checkSection(SECTION, ITEMS);
    await s.store.checkSection(SECTION_B, { blanks: ['blank-2'] });

    // The student hand-drops one (V6's republish path does this too).
    s.store.dropPendingCheck(SECTION);

    s.service.offline = false;
    s.connectivity.online = true;
    const before = s.service.calls.length;
    await s.queue.runNow();

    const firedSections = s.service.calls
      .slice(before)
      .map((c) => c.sectionId);
    expect(firedSections).toEqual([SECTION_B]);
  });
});

describe('persistence shape', () => {
  it('the pending map round-trips but the derived phase does not persist', async () => {
    const s = setup();
    await checkWhileOffline(s);

    const raw = JSON.parse(s.store.serialize()) as Record<string, unknown>;
    expect(raw.pending).toHaveProperty(SECTION);
    // 'checked' is the only status the blob carries; phases are rebuilt.
    expect(JSON.stringify(raw.checked)).toBe('{}');
  });

  it('an empty-pending blob hydrates with no phantom pending sections', () => {
    const s = setup();
    const clean = serializeViewerState(
      emptyPersistedState(TEST_USER_ID, ACTIVITY, VERSION),
    );
    expect(s.store.hydrate(clean)).toBe(true);
    expect(Object.keys(s.store.getState().sections)).toHaveLength(0);
  });
});
