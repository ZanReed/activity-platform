// =============================================================================
// check-client.test.ts — the client side of checking (S4 T8)
// -----------------------------------------------------------------------------
// Three things the student actually experiences, none of which the server can
// guarantee on its own:
//
//   1. FAILURES ARE DISTINGUISHABLE. A stale tab, an expired session, an
//      offline blip and a broken grader must not collapse into one "try again",
//      because retrying fixes exactly one of them. `kind` is the whole
//      vocabulary a retry decision derives from (the write-only `retryable`
//      boolean that used to ride along was deleted 2026-08-06, A15).
//   2. A RETRY DOES NOT COST AN ATTEMPT. The idempotency key survives a failed
//      check and is reused; a deliberate re-check gets a fresh one.
//   3. A REPUBLISH DOES NOT BREAK A CHECK. The advisory rides a SUCCESSFUL
//      response; it must never turn a good check into an error.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import {
  CheckError,
  checkErrorFor,
  createHttpCheckService,
} from '../src/client/httpCheckService.js';
import { createViewerStore } from '../src/store/store.js';
import {
  CHECK_WIRE_VERSION,
  type CheckRequest,
  type CheckService,
  type SectionCheckResult,
} from '../src/check/wire.js';
import { TEST_USER_ID } from './helpers/ids.js';

const ACTIVITY = 'a1';
const VERSION = 'v1';

function okResult(over: Partial<SectionCheckResult> = {}): SectionCheckResult {
  return {
    wireVersion: CHECK_WIRE_VERSION,
    sectionId: 's1',
    items: {},
    solutions: {},
    ...over,
  };
}

// ---- the error taxonomy ------------------------------------------------------

describe('check failures are distinguishable', () => {
  it('reads the code from the REAL server body shape (details.code)', () => {
    // REGRESSION PIN. `_shared/cors.ts` errorResponse emits
    //   { error: "…", details: { code: "…" } }
    // and this mapping used to read `body.code` — top level. The result was a
    // stale tab falling through to the generic un-retryable 'unknown', so a
    // student saw a dead end instead of "reload". Both the client and the
    // handler unit tests passed, because both were written against the same
    // wrong assumption; only the live E2E saw the real bytes.
    const err = checkErrorFor(400, {
      error: 'Unsupported wire version 99; expected 2',
      details: { code: 'wire_version_mismatch' },
    });
    expect(err.kind).toBe('stale_client');
    expect(err.message).toMatch(/reload/i);
  });

  it('surfaces the server message from `error`, the key the helper uses', () => {
    const err = checkErrorFor(422, { error: 'responses.blanks must map id → string' });
    expect(err.message).toContain('responses.blanks');
  });

  it('still honours a top-level code, so a helper change cannot silently re-break it', () => {
    const err = checkErrorFor(400, { code: 'wire_version_mismatch' });
    expect(err.kind).toBe('stale_client');
  });

  it.each([
    [401, {}, 'unauthenticated'],
    [403, {}, 'unauthenticated'],
    [404, {}, 'unavailable'],
    [429, {}, 'rate_limited'],
    [500, {}, 'server_error'],
    [503, {}, 'server_error'],
  ])('maps %s to %s', (status, body, kind) => {
    const err = checkErrorFor(status as number, body);
    expect(err.kind).toBe(kind);
  });

  it('prefers the server code over the status for a rate limit', () => {
    expect(checkErrorFor(400, { code: 'rate_limited' }).kind).toBe('rate_limited');
  });

  it('treats an unrecognised 4xx as OUR bug', () => {
    // A student cannot fix a malformed request, so inviting them to try again
    // would be a lie dressed as help.
    const err = checkErrorFor(422, { message: 'nope' });
    expect(err.kind).toBe('unknown');
  });

  it('reports a network failure as offline', async () => {
    const service = createHttpCheckService({
      checkUrl: 'https://x.test/check',
      feedbackUrl: 'https://x.test/feedback',
      getAccessToken: () => 'token',
      fetchImpl: (() => Promise.reject(new TypeError('failed to fetch'))) as never,
    });
    await expect(
      service.checkSection({
        wireVersion: CHECK_WIRE_VERSION,
        activityId: ACTIVITY,
        versionId: VERSION,
        sectionId: 's1',
        responses: {
          blanks: {}, choices: {}, matches: {}, orderings: {}, freeText: {}, graphs: {},
        },
      }),
    ).rejects.toMatchObject({ kind: 'offline' });
  });

  it('reports a missing session without calling the network at all', async () => {
    const fetchImpl = vi.fn();
    const service = createHttpCheckService({
      checkUrl: 'https://x.test/check',
      feedbackUrl: 'https://x.test/feedback',
      getAccessToken: () => null,
      fetchImpl: fetchImpl as never,
    });
    await expect(
      service.checkSection({} as CheckRequest),
    ).rejects.toBeInstanceOf(CheckError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('treats a grader on a different wire version as a stale tab', async () => {
    const service = createHttpCheckService({
      checkUrl: 'https://x.test/check',
      feedbackUrl: 'https://x.test/feedback',
      getAccessToken: () => 'token',
      fetchImpl: (async () =>
        new Response(JSON.stringify({ ...okResult(), wireVersion: 99 }), {
          status: 200,
        })) as never,
    });
    await expect(
      service.checkSection({} as CheckRequest),
    ).rejects.toMatchObject({ kind: 'stale_client' });
  });
});

// ---- idempotency -------------------------------------------------------------

/** A CheckService whose outcome the test drives, recording every request. */
function scriptedService(): CheckService & {
  calls: CheckRequest[];
  failNext: (err: unknown) => void;
} {
  const calls: CheckRequest[] = [];
  let pendingFailure: unknown = null;
  return {
    calls,
    failNext(err) {
      pendingFailure = err;
    },
    async checkSection(request) {
      calls.push(structuredClone(request));
      if (pendingFailure) {
        const err = pendingFailure;
        pendingFailure = null;
        throw err;
      }
      return okResult({ sectionId: request.sectionId });
    },
    async fetchReleasedFeedback() {
      return { graded: false, blocks: {} };
    },
  };
}

describe('a retry must not cost a student an extra attempt', () => {
  it('reuses the SAME idempotency key when a failed check is retried', async () => {
    // Cold starts were measured at 3-4 s — long enough for a student to give up
    // and press Check again. Without a stable key their teacher sees two
    // attempts for one piece of work.
    const service = scriptedService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });

    service.failNext(new CheckError('offline', 'nope'));
    await store.checkSection('s1', {});
    await store.checkSection('s1', {});

    expect(service.calls).toHaveLength(2);
    expect(service.calls[0]!.idempotencyKey).toBeDefined();
    expect(service.calls[1]!.idempotencyKey).toBe(service.calls[0]!.idempotencyKey);
  });

  it('mints a FRESH key for a deliberate re-check after success', async () => {
    // Re-checking is meant to create a new attempt (parity 7.1A), so collapsing
    // it into the previous one would lose the student's revision history.
    const service = scriptedService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });

    await store.checkSection('s1', {});
    await store.checkSection('s1', {});

    expect(service.calls[1]!.idempotencyKey).not.toBe(
      service.calls[0]!.idempotencyKey,
    );
  });

  it('keys are per section, so two sections never share an attempt', async () => {
    const service = scriptedService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    await store.checkSection('s1', {});
    await store.checkSection('s2', {});
    expect(service.calls[0]!.idempotencyKey).not.toBe(
      service.calls[1]!.idempotencyKey,
    );
  });

  it('generates unique keys without depending on crypto being present', async () => {
    const service = scriptedService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    for (let i = 0; i < 25; i++) await store.checkSection(`s${i}`, {});
    const keys = new Set(service.calls.map((c) => c.idempotencyKey));
    expect(keys.size).toBe(25);
  });
});

// ---- the failure kind reaches the UI -----------------------------------------

describe('the store records WHICH failure happened', () => {
  it('carries the kind and retryability into section status', async () => {
    const service = scriptedService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    service.failNext(new CheckError('stale_client', 'out of date'));
    await store.checkSection('s1', {});

    expect(store.getState().sections.s1).toMatchObject({
      phase: 'error',
      kind: 'stale_client',
    });
  });

  it('keeps every response intact when a check fails', async () => {
    const service = scriptedService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    store.setBlank('b1', '42');
    service.failNext(new CheckError('server_error', 'boom'));
    await store.checkSection('s1', { blanks: ['b1'] });

    expect(store.getState().responses.blanks.b1).toBe('42');
  });
});

// ---- the stale-version advisory ---------------------------------------------

describe('a mid-period republish never breaks a check (ruling S4-T5)', () => {
  it('records the newer version WITHOUT failing the check', async () => {
    const service: CheckService = {
      async checkSection(request) {
        return {
          ...okResult({ sectionId: request.sectionId }),
          currentVersionId: 'v2',
        } as SectionCheckResult;
      },
      async fetchReleasedFeedback() {
        return { graded: false, blocks: {} };
      },
    };
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });

    await store.checkSection('s1', {});
    const state = store.getState();

    // The check SUCCEEDED. The advisory is additional information, not an error.
    expect(state.sections.s1?.phase).toBe('checked');
    expect(state.newerVersionId).toBe('v2');
  });

  it('does not flag the version the student is already on', async () => {
    const service: CheckService = {
      async checkSection(request) {
        return {
          ...okResult({ sectionId: request.sectionId }),
          currentVersionId: VERSION,
        } as SectionCheckResult;
      },
      async fetchReleasedFeedback() {
        return { graded: false, blocks: {} };
      },
    };
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    await store.checkSection('s1', {});
    expect(store.getState().newerVersionId).toBeUndefined();
  });

  it('stays silent when the server sends no advisory', async () => {
    const service = scriptedService();
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    await store.checkSection('s1', {});
    expect(store.getState().newerVersionId).toBeUndefined();
  });
});
