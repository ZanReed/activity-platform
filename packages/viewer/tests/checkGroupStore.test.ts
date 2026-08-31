// =============================================================================
// checkGroupStore.test.ts — checking a GROUP of sections (flow modes, F2)
// -----------------------------------------------------------------------------
// A checkpoint's Check covers every section since the previous one (R1), and
// the client composes that from N per-section RPCs (ruling 3A) rather than a
// new wire shape. What has to hold:
//
//   - every member fires, each with its OWN item ids (a group that sent one
//     section's ids for another would grade the wrong work);
//   - the members reach 'checking' in the SAME commit, which is what makes the
//     `locked` freeze happen at press rather than at fire (OV#19);
//   - one member failing does not fail the group — it reads 'partial', and
//     Retry re-fires only the unlanded members;
//   - a 429 mid-group is partial, never failure (OV#15);
//   - `free` re-check still re-scores everything (the regression pin, 7.1A).
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import {
  CheckError,
  createMockCheckService,
  createViewerStore,
  groupStatus,
  isSectionFrozen,
} from '../src/index.js';
import type {
  CheckRequest,
  CheckService,
  SectionCheckResult,
  SectionStatus,
} from '../src/index.js';
import { TEST_USER_ID } from './helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

const ITEMS = {
  's1': { blanks: ['b1'] },
  's2': { blanks: ['b2'] },
  's3': { freeText: ['essay-3'] },
};

function makeStore(service: CheckService) {
  return createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
}

/** A service whose behaviour is scripted PER SECTION — the mock's `failWith`
 * is all-or-nothing, and a partial group is the case under test. */
function perSectionService(
  behaviour: Record<string, 'ok' | Error>,
): CheckService & { calls: CheckRequest[] } {
  const calls: CheckRequest[] = [];
  return {
    calls,
    async checkSection(request) {
      calls.push(request);
      const outcome = behaviour[request.sectionId] ?? 'ok';
      if (outcome !== 'ok') throw outcome;
      const result: SectionCheckResult = {
        wireVersion: request.wireVersion,
        sectionId: request.sectionId,
        items: {},
        solutions: {},
      };
      return result;
    },
    async fetchReleasedFeedback() {
      return { graded: false, blocks: {} };
    },
  };
}

describe('checkGroup fires every member with its own ids', () => {
  it('sends one request per section, each carrying only that section’s items', async () => {
    const service = perSectionService({});
    const store = makeStore(service);
    store.setBlank('b1', '3');
    store.setBlank('b2', '7');
    store.setFreeText('essay-3', 'because');

    await store.checkGroup(['s1', 's2', 's3'], ITEMS);

    expect(service.calls.map((c) => c.sectionId).sort()).toEqual(['s1', 's2', 's3']);
    const s1 = service.calls.find((c) => c.sectionId === 's1')!;
    expect(s1.responses.blanks).toEqual({ b1: '3' });
    const s2 = service.calls.find((c) => c.sectionId === 's2')!;
    expect(s2.responses.blanks).toEqual({ b2: '7' });
    const s3 = service.calls.find((c) => c.sectionId === 's3')!;
    expect(s3.responses.freeText).toEqual({ 'essay-3': 'because' });
    // Cross-contamination is the failure this pins: s3 must not carry blanks.
    expect(s3.responses.blanks).toEqual({});
  });

  it('a member with no entry in the map fires with an empty payload, not undefined', async () => {
    const service = perSectionService({});
    const store = makeStore(service);
    await store.checkGroup(['s1', 'unmapped'], ITEMS);
    const call = service.calls.find((c) => c.sectionId === 'unmapped')!;
    expect(call.responses.blanks).toEqual({});
  });

  it('every member is in `checking` before any response lands (press-time freeze)', async () => {
    const service = createMockCheckService();
    const release = service.gate();
    const store = makeStore(service);

    const inFlight = store.checkGroup(['s1', 's2', 's3'], ITEMS);
    // Synchronous prelude of all three has already run: this is what OV#19
    // needs — the freeze lands on the press, not minutes later when a queued
    // check drains.
    const { sections } = store.getState();
    expect(['s1', 's2', 's3'].map((id) => sections[id]?.phase)).toEqual([
      'checking',
      'checking',
      'checking',
    ]);
    expect(['s1', 's2', 's3'].every((id) => isSectionFrozen(sections[id]))).toBe(true);

    release();
    await inFlight;
  });
});

describe('a partial group is partial, not a failure', () => {
  it('one member failing leaves the others checked and the group `partial`', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const service = perSectionService({
      s2: new CheckError('server_error', 'grader down', 500),
    });
    const store = makeStore(service);

    await store.checkGroup(['s1', 's2', 's3'], ITEMS);

    const status = groupStatus(['s1', 's2', 's3'], store.getState().sections);
    expect(status.phase).toBe('partial');
    expect(status.landed).toEqual(['s1', 's3']);
    expect(status.unlanded).toEqual(['s2']);
    expect(status.kind).toBe('server_error');
    errorSpy.mockRestore();
  });

  it('a 429 mid-group surfaces as partial with the rate_limited kind (OV#15)', async () => {
    const service = perSectionService({
      s3: new CheckError('rate_limited', 'too quick', 429),
    });
    const store = makeStore(service);

    await store.checkGroup(['s1', 's2', 's3'], ITEMS);
    const status = groupStatus(['s1', 's2', 's3'], store.getState().sections);
    expect(status.phase).toBe('partial');
    expect(status.kind).toBe('rate_limited');
    // ...and a rate-limited section is NOT frozen: no row was written, so the
    // server does not consider it locked either.
    expect(isSectionFrozen(store.getState().sections.s3)).toBe(false);
  });

  it('Retry re-fires only the unlanded members (3A)', async () => {
    const behaviour: Record<string, 'ok' | Error> = {
      s2: new CheckError('server_error', 'grader down', 500),
    };
    const service = perSectionService(behaviour);
    const store = makeStore(service);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await store.checkGroup(['s1', 's2', 's3'], ITEMS);
    const after = groupStatus(['s1', 's2', 's3'], store.getState().sections);
    service.calls.length = 0;
    behaviour.s2 = 'ok';

    await store.checkGroup(after.unlanded, ITEMS);

    expect(service.calls.map((c) => c.sectionId)).toEqual(['s2']);
    expect(groupStatus(['s1', 's2', 's3'], store.getState().sections).phase).toBe(
      'checked',
    );
    errorSpy.mockRestore();
  });

  it('the retried member replays its idempotency key rather than minting a second attempt', async () => {
    const behaviour: Record<string, 'ok' | Error> = {
      s2: new CheckError('server_error', 'grader down', 500),
    };
    const service = perSectionService(behaviour);
    const store = makeStore(service);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await store.checkGroup(['s1', 's2'], ITEMS);
    const firstKey = service.calls.find((c) => c.sectionId === 's2')!.idempotencyKey;
    behaviour.s2 = 'ok';
    service.calls.length = 0;
    await store.checkGroup(['s2'], ITEMS);

    expect(service.calls[0]!.idempotencyKey).toBe(firstKey);
    errorSpy.mockRestore();
  });
});

describe('offline and free re-check', () => {
  it('an offline group queues every member and reads `pending`', async () => {
    const service = perSectionService({
      s1: new CheckError('offline', 'no network'),
      s2: new CheckError('offline', 'no network'),
    });
    const store = makeStore(service);

    await store.checkGroup(['s1', 's2'], ITEMS);
    const state = store.getState();
    expect(groupStatus(['s1', 's2'], state.sections).phase).toBe('pending');
    expect(Object.keys(state.pending).sort()).toEqual(['s1', 's2']);
    // Frozen at press despite nothing having reached the server — the whole
    // point of OV#19.
    expect(['s1', 's2'].every((id) => isSectionFrozen(state.sections[id]))).toBe(true);
  });

  it('`free` re-check re-fires the WHOLE group (regression pin, 7.1A)', async () => {
    const service = perSectionService({});
    const store = makeStore(service);

    await store.checkGroup(['s1', 's2'], ITEMS);
    service.calls.length = 0;
    await store.checkGroup(['s1', 's2'], ITEMS);

    expect(service.calls.map((c) => c.sectionId).sort()).toEqual(['s1', 's2']);
    expect(groupStatus(['s1', 's2'], store.getState().sections).phase).toBe('checked');
  });

  it('a re-check mints a NEW idempotency key — re-checking is a new attempt', async () => {
    const service = perSectionService({});
    const store = makeStore(service);
    await store.checkGroup(['s1'], ITEMS);
    const first = service.calls[0]!.idempotencyKey;
    await store.checkGroup(['s1'], ITEMS);
    expect(service.calls[1]!.idempotencyKey).not.toBe(first);
  });
});

describe('groupStatus — the derivation, in isolation', () => {
  const checked = (): SectionStatus => ({
    phase: 'checked',
    result: {
      wireVersion: 3,
      sectionId: 'x',
      items: {},
      solutions: {},
    },
  });

  it('reports unchecked when nothing has happened', () => {
    expect(groupStatus(['a', 'b'], {}).phase).toBe('unchecked');
  });

  it('checking outranks every other reading — a fire is in flight', () => {
    expect(
      groupStatus(['a', 'b'], { a: checked(), b: { phase: 'checking' } }).phase,
    ).toBe('checking');
  });

  it('pending outranks partial — the queue keeps its own promise', () => {
    // A Retry button beside "we’ll check when you’re back online" would be two
    // contradictory instructions.
    expect(
      groupStatus(['a', 'b'], { a: checked(), b: { phase: 'pending' } }).phase,
    ).toBe('pending');
  });

  it('error is reserved for the case where NOTHING landed', () => {
    expect(
      groupStatus(['a', 'b'], {
        a: { phase: 'error', message: 'x', kind: 'server_error' },
        b: { phase: 'error', message: 'x', kind: 'server_error' },
      }).phase,
    ).toBe('error');
  });

  it('a checked member alongside a failed one is partial, never error', () => {
    expect(
      groupStatus(['a', 'b'], {
        a: checked(),
        b: { phase: 'error', message: 'x', kind: 'server_error' },
      }).phase,
    ).toBe('partial');
  });

  it('`locked` outranks any other failure kind in a partly-locked group', () => {
    const status = groupStatus(['a', 'b'], {
      a: { phase: 'error', message: 'x', kind: 'server_error' },
      b: { phase: 'error', message: 'x', kind: 'locked' },
    });
    expect(status.kind).toBe('locked');
  });

  it('carries the 2.2A notice up from any member', () => {
    expect(
      groupStatus(['a'], {
        a: { ...checked(), answersChangedWhileQueued: true } as SectionStatus,
      }).answersChangedWhileQueued,
    ).toBe(true);
  });

  it('an empty group is unchecked, not checked (vacuous-truth trap)', () => {
    // `unlanded.length === 0` is true of the empty set; without the length
    // guard an empty group would claim to be checked.
    expect(groupStatus([], {}).phase).toBe('unchecked');
  });
});

describe('isSectionFrozen — the freeze derivation (locked mode gates the caller)', () => {
  it('freezes at press: checking and pending both count', () => {
    expect(isSectionFrozen({ phase: 'checking' })).toBe(true);
    expect(isSectionFrozen({ phase: 'pending' })).toBe(true);
  });

  it('stays frozen once checked — the same fact the server locks from', () => {
    expect(
      isSectionFrozen({
        phase: 'checked',
        result: {
          wireVersion: 3,
          sectionId: 'x',
          items: {},
          solutions: {},
        },
      }),
    ).toBe(true);
  });

  it('the `locked` refusal freezes — this is how a second device learns', () => {
    expect(
      isSectionFrozen({ phase: 'error', message: 'x', kind: 'locked' }),
    ).toBe(true);
  });

  it('a non-lock failure THAWS — no row was written, so nothing is committed', () => {
    for (const kind of ['rate_limited', 'server_error', 'unauthenticated'] as const) {
      expect(isSectionFrozen({ phase: 'error', message: 'x', kind })).toBe(false);
    }
  });

  it('an untouched section is not frozen', () => {
    expect(isSectionFrozen(undefined)).toBe(false);
    expect(isSectionFrozen({ phase: 'unchecked' })).toBe(false);
  });
});
