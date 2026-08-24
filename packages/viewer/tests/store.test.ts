// =============================================================================
// store.test.ts — the store seam + check wire pins (S3 rulings D9/D11/2.2A)
// -----------------------------------------------------------------------------
// Pins the seam every component will sit on: id-keyed wire shape, the section
// status machine (unchecked → checking → checked / error), fire-time response
// snapshots, the recorded-family verdict rule, solution unlock arriving only
// via the check result, and the VIEWER_STORE_SCHEMA_VERSION hydration gate.
// Runs in node — the store is pure TS; components get their own jsdom suites.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  CHECK_WIRE_VERSION,
  CheckError,
  VIEWER_STORE_SCHEMA_VERSION,
  createMockCheckService,
  createViewerStore,
  hydrateViewerState,
  serializeViewerState,
  emptyPersistedState,
} from '../src/index.js';
import { TEST_USER_ID } from './helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

function makeStore(script: Parameters<typeof createMockCheckService>[0] = {}) {
  const service = createMockCheckService(script);
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
  return { store, service };
}

describe('response setters + subscription', () => {
  it('setters write id-keyed maps and notify subscribers', () => {
    const { store } = makeStore();
    let notified = 0;
    const unsubscribe = store.subscribe(() => notified++);

    store.setBlank('blank-1', '3');
    store.setChoices('mc-1', ['choice-a']);
    store.setMatch('match-1', 'item-a', 'target-a');
    store.setOrdering('ord-1', ['i2', 'i1', 'i3']);
    store.setFreeText('essay-1', 'Because subtraction undoes addition.');

    const { responses } = store.getState();
    expect(responses.blanks['blank-1']).toBe('3');
    expect(responses.choices['mc-1']).toEqual(['choice-a']);
    expect(responses.matches['match-1']).toEqual({ 'item-a': 'target-a' });
    expect(responses.orderings['ord-1']).toEqual(['i2', 'i1', 'i3']);
    expect(responses.freeText['essay-1']).toContain('subtraction');
    expect(notified).toBe(5);

    unsubscribe();
    store.setBlank('blank-1', '4');
    expect(notified).toBe(5);
  });

  it('un-placing a match removes the pair, not the block map', () => {
    const { store } = makeStore();
    store.setMatch('match-1', 'item-a', 'target-a');
    store.setMatch('match-1', 'item-b', 'target-b');
    store.setMatch('match-1', 'item-a', null);
    expect(store.getState().responses.matches['match-1']).toEqual({
      'item-b': 'target-b',
    });
  });
});

describe('checkSection (one batched call, ruling P2A)', () => {
  it('sends only the section’s item ids, id-keyed, wire-stamped', async () => {
    const { store, service } = makeStore();
    store.setBlank('blank-1', '3');
    store.setBlank('blank-other-section', '9');
    store.setOrdering('ord-1', ['i3', 'i1', 'i2']);

    await store.checkSection('sec-1', {
      blanks: ['blank-1'],
      orderings: ['ord-1'],
    });

    expect(service.calls).toHaveLength(1);
    const request = service.calls[0]!;
    expect(request.wireVersion).toBe(CHECK_WIRE_VERSION);
    expect(request.activityId).toBe(ACTIVITY);
    expect(request.versionId).toBe(VERSION);
    expect(request.sectionId).toBe('sec-1');
    expect(request.responses.blanks).toEqual({ 'blank-1': '3' });
    // The ordering wire is the student's ITEM-ID arrangement (ruling R1).
    expect(request.responses.orderings).toEqual({ 'ord-1': ['i3', 'i1', 'i2'] });
    expect(request.responses.freeText).toEqual({});
  });

  it('walks unchecked → checking → checked, and delivers verdicts + solutions', async () => {
    const { store, service } = makeStore({
      verdicts: { 'blank-1': 'incorrect' },
      feedback: { 'blank-1': [{ type: 'text', text: '4 is the intercept.', marks: [] }] },
      solutions: { 'block-1': [{ type: 'text', text: 'm = 3.', marks: [] }] },
    });
    const release = service.gate();
    store.setBlank('blank-1', '4');

    const inFlight = store.checkSection('sec-1', { blanks: ['blank-1'] });
    expect(store.getState().sections['sec-1']).toEqual({ phase: 'checking' });

    release();
    await inFlight;

    const status = store.getState().sections['sec-1'];
    expect(status?.phase).toBe('checked');
    if (status?.phase !== 'checked') throw new Error('unreachable');
    expect(status.result.items['blank-1']).toEqual({
      verdict: 'incorrect',
      feedback: [{ type: 'text', text: '4 is the intercept.', marks: [] }],
    });
    // Solutions arrive ONLY via the check result (Q2B unlock).
    expect(status.result.solutions['block-1']).toEqual([
      { type: 'text', text: 'm = 3.', marks: [] },
    ]);
  });

  it('carries scripted misconception ids through to the section result', async () => {
    const { store } = makeStore({
      verdicts: { 'blank-1': 'incorrect' },
      misconceptionIds: { 'blank-1': ['mis.slope-intercept-swap'] },
    });
    store.setBlank('blank-1', '4');

    await store.checkSection('sec-1', { blanks: ['blank-1'] });

    const status = store.getState().sections['sec-1'];
    if (status?.phase !== 'checked') throw new Error('unreachable');
    expect(status.result.items['blank-1']).toEqual({
      verdict: 'incorrect',
      misconceptionIds: ['mis.slope-intercept-swap'],
    });
  });

  it('snapshots CURRENT values at fire time — later edits never mutate an in-flight request (2.2A)', async () => {
    const { store, service } = makeStore();
    const release = service.gate();
    store.setBlank('blank-1', 'first');

    const inFlight = store.checkSection('sec-1', { blanks: ['blank-1'] });
    store.setBlank('blank-1', 'edited-mid-flight');
    release();
    await inFlight;

    expect(service.calls[0]!.responses.blanks['blank-1']).toBe('first');
    expect(store.getState().responses.blanks['blank-1']).toBe(
      'edited-mid-flight',
    );
  });

  it('a failed check surfaces as section error and loses NO responses', async () => {
    // A real CheckError, matching what the production client throws — the
    // store branches on `kind`, and the queue executor (S6) decides whether to
    // enqueue from it, so a bare Error here would test a path no deployed
    // code takes.
    const { store } = makeStore({
      failWith: new CheckError('server_error', 'RPC down'),
    });
    store.setBlank('blank-1', '3');
    await store.checkSection('sec-1', { blanks: ['blank-1'] });

    expect(store.getState().sections['sec-1']).toEqual({
      phase: 'error',
      message: 'RPC down',
      kind: 'server_error',
    });
    expect(store.getState().responses.blanks['blank-1']).toBe('3');
  });

  it('re-check is allowed and re-scores (parity bundle 7.1A)', async () => {
    const { store, service } = makeStore({ defaultVerdict: 'incorrect' });
    store.setBlank('blank-1', '4');
    await store.checkSection('sec-1', { blanks: ['blank-1'] });
    store.setBlank('blank-1', '3');
    await store.checkSection('sec-1', { blanks: ['blank-1'] });

    expect(service.calls).toHaveLength(2);
    expect(service.calls[1]!.responses.blanks['blank-1']).toBe('3');
    expect(store.getState().sections['sec-1']?.phase).toBe('checked');
  });

  it('the recorded family always grades "recorded" — even against a scripted judgment', async () => {
    const { store } = makeStore({
      verdicts: { 'essay-1': 'incorrect' },
    });
    store.setFreeText('essay-1', 'My explanation.');
    await store.checkSection('sec-1', { freeText: ['essay-1'] });

    const status = store.getState().sections['sec-1'];
    if (status?.phase !== 'checked') throw new Error('expected checked');
    expect(status.result.items['essay-1']).toEqual({ verdict: 'recorded' });
  });
});

describe('persistence gate (VIEWER_STORE_SCHEMA_VERSION, ruling D9)', () => {
  it('serialize → hydrate round-trips responses and checked sections only', async () => {
    const { store } = makeStore({ solutions: {} });
    store.setBlank('blank-1', '3');
    await store.checkSection('sec-1', { blanks: ['blank-1'] });

    const raw = store.serialize();
    const { store: fresh } = makeStore();
    expect(fresh.hydrate(raw)).toBe(true);
    expect(fresh.getState().responses.blanks['blank-1']).toBe('3');
    expect(fresh.getState().sections['sec-1']?.phase).toBe('checked');
  });

  it('a version-mismatched blob hydrates to nothing (fresh state is correct)', () => {
    const stale = JSON.parse(
      serializeViewerState(emptyPersistedState(TEST_USER_ID, ACTIVITY, VERSION)),
    ) as Record<string, unknown>;
    stale.schemaVersion = VIEWER_STORE_SCHEMA_VERSION + 1;
    expect(hydrateViewerState(JSON.stringify(stale))).toBeNull();

    const { store } = makeStore();
    expect(store.hydrate(JSON.stringify(stale))).toBe(false);
  });

  it('corrupt, empty, and foreign-activity blobs all refuse to hydrate', () => {
    expect(hydrateViewerState(null)).toBeNull();
    expect(hydrateViewerState('not json {')).toBeNull();
    expect(hydrateViewerState('42')).toBeNull();

    const { store } = makeStore();
    const foreign = serializeViewerState(
      emptyPersistedState(
        TEST_USER_ID,
        'cccccccc-0000-4000-8000-000000000001',
        VERSION,
      ),
    );
    expect(store.hydrate(foreign)).toBe(false);
  });

  it('transitional states never persist — an error section serializes as unchecked', async () => {
    const { store } = makeStore({
      failWith: new CheckError('server_error', 'down'),
    });
    store.setBlank('blank-1', '3');
    await store.checkSection('sec-1', { blanks: ['blank-1'] });

    const { store: fresh } = makeStore();
    expect(fresh.hydrate(store.serialize())).toBe(true);
    expect(fresh.getState().sections['sec-1']).toBeUndefined();
    expect(fresh.getState().responses.blanks['blank-1']).toBe('3');
  });
});
