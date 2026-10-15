// =============================================================================
// restore.test.ts — bringing a student's own checked work back on open
// -----------------------------------------------------------------------------
// docs/design/student-experience-review.md S3; eng review D4 (fill only
// untouched sections), D5 (ask the database first), D6 (the regression
// contract) and D7 (every open, section by section). The store is real; the
// check service is a hand-written double with a restore method, because the
// point of these rows is what the STORE does with what comes back.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  CHECK_WIRE_VERSION,
  emptySectionResponses,
  type CheckService,
  type RestoreRequest,
  type RestoreResult,
  type SectionCheckResult,
} from '../src/check/wire.js';
import { createViewerStore, isSectionUntouched } from '../src/store/store.js';
import { restoreEarlierWork } from '../src/store/restore.js';
import type { DocumentIndex } from '../src/container/blockIndex.js';
import { TEST_USER_ID } from './helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

// Two sections, one blank each.
const INDEX: DocumentIndex = {
  sections: [
    { sectionId: 's1', isCheckpoint: false, items: { blanks: ['b1'] }, blockIds: [], unsupported: [] },
    { sectionId: 's2', isCheckpoint: false, items: { blanks: ['b2'] }, blockIds: [], unsupported: [] },
  ],
  bySection: {},
  unsupported: [],
};
const ITEMS = { s1: { blanks: ['b1'] }, s2: { blanks: ['b2'] } };

function result(sectionId: string, verdict: 'correct' | 'incorrect'): SectionCheckResult {
  const blank = sectionId === 's1' ? 'b1' : 'b2';
  return {
    wireVersion: CHECK_WIRE_VERSION,
    sectionId,
    items: { [blank]: { verdict } },
    solutions: {},
  };
}

function restored(sectionId: string, answer: string) {
  const blank = sectionId === 's1' ? 'b1' : 'b2';
  return {
    sectionId,
    responses: { ...emptySectionResponses(), blanks: { [blank]: answer, foreign: 'smuggled' } },
    result: result(sectionId, 'correct'),
  };
}

function setup(restore?: (req: RestoreRequest) => Promise<RestoreResult>) {
  const calls: RestoreRequest[] = [];
  const service: CheckService = {
    checkSection: async () => {
      throw new Error('restore must never fire a check');
    },
    fetchReleasedFeedback: async () => ({ graded: false, blocks: {} }),
    ...(restore
      ? {
          restoreChecked: async (req: RestoreRequest) => {
            calls.push(req);
            return restore(req);
          },
        }
      : {}),
  };
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
  return { store, calls };
}

describe('isSectionUntouched — what the device protects (contract (1), amended by D7)', () => {
  const base = { responses: emptySectionResponses(), sections: {}, pending: {}, inFlight: {} };
  it('an empty, unchecked, unqueued section is untouched', () => {
    expect(isSectionUntouched(base, 's1', ITEMS.s1)).toBe(true);
  });
  it('any typed answer, check result, queued check or in-flight key makes it touched', () => {
    expect(isSectionUntouched({ ...base, responses: { ...emptySectionResponses(), blanks: { b1: '' } } }, 's1', ITEMS.s1)).toBe(false);
    expect(isSectionUntouched({ ...base, sections: { s1: { phase: 'checked', result: result('s1', 'correct') } } }, 's1', ITEMS.s1)).toBe(false);
    expect(isSectionUntouched({ ...base, pending: { s1: { fingerprint: 'x' } } }, 's1', ITEMS.s1)).toBe(false);
    expect(isSectionUntouched({ ...base, inFlight: { s1: { checkId: 'k', fingerprint: 'x' } } }, 's1', ITEMS.s1)).toBe(false);
  });
  it('an answer in ANOTHER section does not touch this one', () => {
    expect(isSectionUntouched({ ...base, responses: { ...emptySectionResponses(), blanks: { b2: '7' } } }, 's1', ITEMS.s1)).toBe(true);
  });
});

describe('restoreEarlierWork — every open, only what is missing (D5, D7)', () => {
  it('no server checks → no restore call, nothing changes', async () => {
    const { store, calls } = setup(async () => ({ wireVersion: CHECK_WIRE_VERSION, sections: [] }));
    const outcome = await restoreEarlierWork({ store, index: INDEX, checkedSectionIds: async () => [] });
    expect(outcome).toBe('nothing');
    expect(calls).toHaveLength(0);
  });

  it('every server-checked section already on the device → no restore call', async () => {
    const { store, calls } = setup(async () => ({ wireVersion: CHECK_WIRE_VERSION, sections: [] }));
    store.setBlank('b1', 'mine');
    const outcome = await restoreEarlierWork({ store, index: INDEX, checkedSectionIds: async () => ['s1'] });
    expect(outcome).toBe('nothing');
    expect(calls).toHaveLength(0);
  });

  it('asks only for server-checked sections that are untouched here, and fills them', async () => {
    const { store, calls } = setup(async (req) => ({
      wireVersion: CHECK_WIRE_VERSION,
      sections: req.sectionIds.map((id) => restored(id, 'from server')),
    }));
    store.setBlank('b1', 'typed here');
    const outcome = await restoreEarlierWork({ store, index: INDEX, checkedSectionIds: async () => ['s1', 's2'] });
    expect(outcome).toBe('restored');
    expect(calls.map((c) => c.sectionIds)).toEqual([['s2']]);
    const state = store.getState();
    expect(state.responses.blanks).toEqual({ b1: 'typed here', b2: 'from server' });
    expect(state.sections.s2?.phase).toBe('checked');
    expect(state.sections.s1).toBeUndefined();
  });

  it('a failed database read is the failed outcome, with no restore call', async () => {
    const { store, calls } = setup(async () => ({ wireVersion: CHECK_WIRE_VERSION, sections: [] }));
    const outcome = await restoreEarlierWork({
      store,
      index: INDEX,
      checkedSectionIds: async () => {
        throw new Error('offline');
      },
    });
    expect(outcome).toBe('failed');
    expect(calls).toHaveLength(0);
  });
});

describe('store.restoreSections — the merge (D4, contract (4))', () => {
  it('a restore that lands AFTER the student typed never overwrites that section', async () => {
    let release!: (r: RestoreResult) => void;
    const { store } = setup(
      () => new Promise<RestoreResult>((resolve) => {
        release = resolve;
      }),
    );
    const pending = store.restoreSections(['s1', 's2'], ITEMS);
    store.setBlank('b1', 'typed while loading');
    release({ wireVersion: CHECK_WIRE_VERSION, sections: [restored('s1', 'old'), restored('s2', 'old two')] });
    expect(await pending).toBe('restored');
    const state = store.getState();
    expect(state.responses.blanks.b1).toBe('typed while loading');
    expect(state.sections.s1).toBeUndefined();
    expect(state.responses.blanks.b2).toBe('old two');
    expect(state.sections.s2?.phase).toBe('checked');
  });

  it('copies only the ids this document declares for that section', async () => {
    const { store } = setup(async () => ({ wireVersion: CHECK_WIRE_VERSION, sections: [restored('s1', 'x')] }));
    await store.restoreSections(['s1'], ITEMS);
    expect(store.getState().responses.blanks).toEqual({ b1: 'x' });
  });

  it('ignores a section it did not ask for', async () => {
    const { store } = setup(async () => ({ wireVersion: CHECK_WIRE_VERSION, sections: [restored('s2', 'x')] }));
    expect(await store.restoreSections(['s1'], ITEMS)).toBe('nothing');
    expect(store.getState().responses.blanks).toEqual({});
  });

  it('never creates a queued check or an in-flight key, and never fires a check', async () => {
    const { store } = setup(async () => ({ wireVersion: CHECK_WIRE_VERSION, sections: [restored('s1', 'x')] }));
    await store.restoreSections(['s1'], ITEMS);
    const state = store.getState();
    expect(state.pending).toEqual({});
    expect(state.inFlight).toEqual({});
  });

  it('a throw or a foreign wire version is "failed"; no restore method is "nothing"', async () => {
    const thrown = setup(async () => {
      throw new Error('cold start timeout');
    });
    expect(await thrown.store.restoreSections(['s1'], ITEMS)).toBe('failed');
    const stale = setup(async () => ({ wireVersion: 1 as never, sections: [] }));
    expect(await stale.store.restoreSections(['s1'], ITEMS)).toBe('failed');
    const none = setup();
    expect(await none.store.restoreSections(['s1'], ITEMS)).toBe('nothing');
  });

  it('restored work persists through serialize (so the buffer keeps it under this user)', async () => {
    const { store } = setup(async () => ({ wireVersion: CHECK_WIRE_VERSION, sections: [restored('s1', 'x')] }));
    await store.restoreSections(['s1'], ITEMS);
    const blob = JSON.parse(store.serialize()) as { userId: string; checked: Record<string, unknown>; responses: { blanks: Record<string, string> } };
    expect(blob.userId).toBe(TEST_USER_ID);
    expect(Object.keys(blob.checked)).toEqual(['s1']);
    expect(blob.responses.blanks.b1).toBe('x');
  });
});
