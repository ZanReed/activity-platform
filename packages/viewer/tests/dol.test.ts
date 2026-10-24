// =============================================================================
// dol.test.ts — the DoL retake on both server paths (curriculum D65)
// -----------------------------------------------------------------------------
// docs/design/dol-retake.md DL-6/7/8/17, DE-1, DE-4, DE-6, DE-7, DE-13.
// Through the REAL handlers with fake db ports: the read path serves the form
// the student's own state says, strips the answer table, never caches; the
// check path grades the form the page names, passes the DoL rules to
// record_check, withholds solutions until the last attempt or the pass; restore
// rebuilds each attempt against its own form.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { ActivityDocument } from '@activity/schema';
import { createGetActivityHandler, type GetActivityDb } from '../src/server/get-activity-handler.js';
import {
  createCheckActivityHandler,
  type CheckActivityDb,
  withholdSolutions,
} from '../src/server/check-activity-handler.js';
import { sanitizeActivityDocument } from '../src/sanitize/sanitize.js';
import { serveSeed } from '../src/sanitize/serveSeed.js';
import { deriveDolValues, dolRowIndex, formToServe } from '../src/sanitize/dolForm.js';
import { substituteLatex } from '../src/sanitize/substitute.js';
import { CHECK_WIRE_VERSION, emptySectionResponses } from '../src/check/wire.js';

const ACTIVITY = '11111111-2222-4333-8444-555555555555';
const VERSION = 'aaaaaaaa-bbbb-4ccc-9ddd-eeeeeeeeeeee';
const LESSON = '0f8fad5b-d9cb-469f-a165-70867728950e';
const DOL = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const BLANK = '6fa459ea-ee8a-4ca4-894e-db77e160355e';
const SOLUTION_TEXT = 'Double it.';

/** a ∈ {2, 3, 5, 7}; k = 2a. The primary item: "Double {a}: [=k]". */
const TABLE = { columns: ['a', 'k'], rows: [[2, 4], [3, 6], [5, 10], [7, 14]], total: 4 };

function storedDoc(retake = true): ActivityDocument {
  return ActivityDocument.parse({
    schemaVersion: 2,
    meta: { title: 'DoL', course: 'Y9' },
    sections: [
      { id: LESSON, isCheckpoint: true, rows: [] },
      {
        id: DOL,
        isCheckpoint: true,
        dol: { skills: ['s.vfy.one'], retake, seed: { tables: [TABLE] } },
        rows: [{
          id: 'd0c1f3a2-5b6e-4c7d-8e9f-0a1b2c3d4e5f',
          columns: [{
            id: 'e1d2c3b4-a5f6-4e7d-8c9b-0a1b2c3d4e5f',
            blocks: [
              {
                id: 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b',
                type: 'math_block',
                latex: '\\seed{a} \\times 2',
              },
              {
                id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
                type: 'fill_in_blank',
                content: [
                  { type: 'text', text: 'Double {a}: ' },
                  { type: 'blank', id: BLANK, answer: 'k', answerType: 'numeric', width: 6 },
                ],
                solution: [{ type: 'text', text: SOLUTION_TEXT }],
              },
            ],
          }],
        }],
      },
    ],
  });
}

function jwt(sub: string): string {
  const payload = btoa(JSON.stringify({ sub })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `Bearer h.${payload}.s`;
}

const cors = {
  corsHeaders: () => ({}),
  handlePreflight: () => null,
  jsonResponse: (_req: Request, b: unknown, init: ResponseInit = {}) =>
    new Response(JSON.stringify(b), { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } }),
  errorResponse: (_req: Request, status: number, message: string, details?: Record<string, unknown>) =>
    new Response(JSON.stringify({ error: message, ...(details ? { details } : {}) }), { status }),
};

// ---- the read path ----------------------------------------------------------

function getDb(state: { attempts: number; retake_open: boolean; passed: boolean }, doc = storedDoc()): GetActivityDb {
  return {
    publicMeta: vi.fn(),
    classMeta: vi.fn(),
    publishedActivity: vi.fn(async () => ({ data: { version_id: VERSION, version_num: 1, title: 'DoL' }, error: null })),
    readCache: vi.fn(async () => ({ data: { content: sanitizeActivityDocument(doc) }, error: null })),
    readVersion: vi.fn(),
    upsertCache: vi.fn(),
    writeCensus: vi.fn(),
    deleteStaleCache: vi.fn(),
    dolState: vi.fn(async () => ({ data: state, error: null })),
  } as unknown as GetActivityDb;
}

async function serve(state: { attempts: number; retake_open: boolean; passed: boolean }, sub = 'student-1') {
  const handler = createGetActivityHandler({ db: getDb(state), cors });
  const res = await handler(new Request(`https://edge.test/get-activity?activity_id=${ACTIVITY}&version_id=${VERSION}`, {
    headers: { Authorization: jwt(sub) },
  }));
  const raw = await res.text();
  return { res, raw, body: JSON.parse(raw) as { activity: { sections: Array<Record<string, unknown>> } } };
}

function dolText(body: { activity: { sections: Array<Record<string, unknown>> } }): string {
  const sec = body.activity.sections.find((s) => s.id === DOL)!;
  return JSON.stringify(sec.rows);
}

describe('the read path serves the DoL (DE-1, DE-6)', () => {
  it('strips the answer table and the skill ids; carries only the state; never cached', async () => {
    const { res, raw, body } = await serve({ attempts: 0, retake_open: false, passed: false });
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    // RESPONSE-BOUND (DE-6): no table, no column names list, no skill id
    // anywhere on the wire. k = 2a is the answer; the table holds every k.
    expect(raw).not.toContain('"tables"');
    expect(raw).not.toContain('"columns":["a","k"]');
    expect(raw).not.toContain('s.vfy.one');
    const sec = body.activity.sections.find((s) => s.id === DOL)!;
    expect(sec.dol).toEqual({ allowance: 2, attempts: 0, form: 1, retakeOpen: false, passed: false });
    // The student's own numbers are in: prose and \seed{} in maths (DL-17).
    expect(dolText(body)).not.toContain('{a}');
    expect(dolText(body)).not.toContain('\\\\seed{a}');
  });

  it('form 1 until attempt 1, still form 1 (frozen) until the retake opens, then form 2 with different numbers', async () => {
    const f1 = await serve({ attempts: 0, retake_open: false, passed: false });
    const frozen = await serve({ attempts: 1, retake_open: false, passed: false });
    const f2 = await serve({ attempts: 1, retake_open: true, passed: false });
    expect(dolText(frozen.body)).toBe(dolText(f1.body));
    expect((frozen.body.activity.sections.find((s) => s.id === DOL)!.dol as { form: number }).form).toBe(1);
    expect((f2.body.activity.sections.find((s) => s.id === DOL)!.dol as { form: number }).form).toBe(2);
    expect(dolText(f2.body)).not.toBe(dolText(f1.body)); // DE-13
  });

  it('a failed state read is a retryable 500, never a guessed form', async () => {
    const db = getDb({ attempts: 0, retake_open: false, passed: false });
    (db.dolState as ReturnType<typeof vi.fn>).mockImplementation(async () => ({ data: null, error: { message: 'boom' } }));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await createGetActivityHandler({ db, cors })(new Request(
      `https://edge.test/get-activity?activity_id=${ACTIVITY}&version_id=${VERSION}`, { headers: { Authorization: jwt('s') } }));
    spy.mockRestore();
    expect(res.status).toBe(500);
  });
});

// ---- the check path ----------------------------------------------------------

function checkHarness(record: { attempt_number: number; dol_passed: boolean } | { error: string }) {
  const calls: Array<Record<string, unknown>> = [];
  const db: CheckActivityDb = {
    versionForCheck: async () => ({ data: { version_id: VERSION, version_num: 1, is_current: true, current_version_id: VERSION }, error: null }),
    readVersion: async () => ({ data: { content: storedDoc() }, error: null }),
    ownLatestChecks: async () => ({ data: [], error: null }),
    dolState: async () => ({ data: { attempts: 1, retake_open: false, passed: false }, error: null }),
    recordCheck: async (args) => {
      calls.push(args as unknown as Record<string, unknown>);
      if ('error' in record) return { data: null, error: { message: record.error } };
      return { data: { check_id: 'c', attempt_number: record.attempt_number, verdicts: null, replayed: false, dol_passed: record.dol_passed }, error: null };
    },
  };
  const unreachable = async () => { throw new Error('practice'); };
  const handler = createCheckActivityHandler({
    db,
    cors,
    practice: { startMixedSession: unreachable, mixedItemForCheck: unreachable, readSnapshots: unreachable, readAttempts: unreachable, recordAttempt: unreachable },
  });
  return { handler, calls };
}

function formValues(form: number, sub = 'student-1') {
  return deriveDolValues({ seed: { tables: [TABLE] } }, serveSeed(VERSION, sub), form) as { a: number; k: number };
}

async function check(h: ReturnType<typeof checkHarness>, answer: string, form?: number) {
  const res = await h.handler(new Request('https://edge.test/check-activity', {
    method: 'POST',
    headers: { Authorization: jwt('student-1') },
    body: JSON.stringify({
      wireVersion: CHECK_WIRE_VERSION, activityId: ACTIVITY, versionId: VERSION, sectionId: DOL,
      responses: { ...emptySectionResponses(), blanks: { [BLANK]: answer } },
      ...(form ? { form } : {}),
    }),
  }));
  return { res, body: await res.json() as Record<string, unknown> };
}

describe('the check path grades the DoL (DL-6/7/8, DE-4, DE-7)', () => {
  it('form 2 is graded against form 2’s numbers, and the DoL rules reach record_check', async () => {
    const f1 = formValues(1);
    const f2 = formValues(2);
    expect(f2.k).not.toBe(f1.k);
    const h = checkHarness({ attempt_number: 2, dol_passed: true });
    const right = await check(h, String(f2.k), 2);
    expect((right.body.items as Record<string, { verdict: string }>)[BLANK]!.verdict).toBe('correct');
    expect(h.calls[0]!.dol).toEqual({ maxAttempts: 2, expectedAttempt: 2, rubricPrimary: false, primaryCorrect: true });
    expect(h.calls[0]!.locked).toBe(false);
    const stale = await check(checkHarness({ attempt_number: 2, dol_passed: false }), String(f1.k), 2);
    expect((stale.body.items as Record<string, { verdict: string }>)[BLANK]!.verdict).toBe('incorrect');
  });

  it('DL-8: no worked solution after a failed attempt 1; shown after the pass or the last attempt', async () => {
    const f1 = formValues(1);
    const failed = await check(checkHarness({ attempt_number: 1, dol_passed: false }), '999');
    expect(failed.body.solutions).toEqual({});
    expect(failed.body.dol).toEqual({ attempts: 1, allowance: 2, passed: false });
    const passed = await check(checkHarness({ attempt_number: 1, dol_passed: true }), String(f1.k));
    expect(JSON.stringify(passed.body.solutions)).toContain(SOLUTION_TEXT);
    const last = await check(checkHarness({ attempt_number: 2, dol_passed: false }), '999', 2);
    expect(JSON.stringify(last.body.solutions)).toContain(SOLUTION_TEXT);
  });

  it.each([
    ['dol_form_stale', 'dol_form_stale'],
    ['dol_retake_not_yet', 'dol_retake_not_yet'],
  ])('record_check’s %s is a 409 with its own code', async (msg, code) => {
    const { res, body } = await check(checkHarness({ error: msg }), '1');
    expect(res.status).toBe(409);
    expect((body.details as { code: string }).code).toBe(code);
  });

  it('a bad form is a 400', async () => {
    const { res } = await check(checkHarness({ attempt_number: 1, dol_passed: false }), '1', 3);
    expect(res.status).toBe(400);
  });
});

describe('restore (DE-1d, DL-8)', () => {
  async function restore(attempt: number, passed: boolean) {
    const rows = [{ section_id: DOL, attempt_number: attempt, responses: { blanks: { [BLANK]: '1' } }, verdicts: { [BLANK]: { verdict: 'incorrect' } } }];
    const unreachable = async () => { throw new Error('practice'); };
    const handler = createCheckActivityHandler({
      db: {
        versionForCheck: async () => ({ data: { version_id: VERSION, version_num: 1, is_current: true, current_version_id: VERSION }, error: null }),
        readVersion: async () => ({ data: { content: storedDoc() }, error: null }),
        ownLatestChecks: async () => ({ data: rows, error: null }),
        dolState: async () => ({ data: { attempts: attempt, retake_open: false, passed }, error: null }),
        recordCheck: async () => { throw new Error('restore never records'); },
      },
      cors,
      practice: { startMixedSession: unreachable, mixedItemForCheck: unreachable, readSnapshots: unreachable, readAttempts: unreachable, recordAttempt: unreachable },
    });
    const res = await handler(new Request('https://edge.test/check-activity', {
      method: 'POST',
      headers: { Authorization: jwt('student-1') },
      body: JSON.stringify({ wireVersion: CHECK_WIRE_VERSION, mode: 'restore', activityId: ACTIVITY, versionId: VERSION, sectionIds: [DOL] }),
    }));
    return (await res.json()) as { sections: Array<{ result: { solutions: unknown; dol?: unknown } }> };
  }

  it('a restored failed attempt 1 carries no worked solution; a passed one does', async () => {
    const failed = await restore(1, false);
    expect(failed.sections[0]!.result.solutions).toEqual({});
    expect(failed.sections[0]!.result.dol).toEqual({ attempts: 1, allowance: 2, passed: false });
    const passed = await restore(1, true);
    expect(JSON.stringify(passed.sections[0]!.result.solutions)).toContain(SOLUTION_TEXT);
  });
});

describe('the units (DE-13, DL-17, DL-8)', () => {
  it('form 2 never lands on form 1’s row when the group has a choice', () => {
    for (let i = 0; i < 200; i++) {
      const seed = `v:${i}`;
      expect(dolRowIndex(seed, 0, 4, 2)).not.toBe(dolRowIndex(seed, 0, 4, 1));
      expect(dolRowIndex(seed, 0, 1, 2)).toBe(0);
    }
  });

  it('formToServe: the frozen state', () => {
    expect(formToServe(2, 0, false)).toBe(1);
    expect(formToServe(2, 1, false)).toBe(1);
    expect(formToServe(2, 1, true)).toBe(2);
    expect(formToServe(2, 2, true)).toBe(2);
    expect(formToServe(1, 1, true)).toBe(1);
  });

  it('\\seed{name} substitutes in latex; a bare {name} never does', () => {
    expect(substituteLatex('\\seed{a}x - \\seed{b}', { a: 6, b: -2 })).toBe('6x - -2');
    expect(substituteLatex('x^{a}', { a: 6 })).toBe('x^{a}');
    expect(substituteLatex('\\seed{zz}', { a: 6 })).toBe('\\seed{zz}');
  });

  it('withholdSolutions', () => {
    expect(withholdSolutions({ attempts: 1, allowance: 2, passed: false })).toBe(true);
    expect(withholdSolutions({ attempts: 1, allowance: 2, passed: true })).toBe(false);
    expect(withholdSolutions({ attempts: 2, allowance: 2, passed: false })).toBe(false);
    expect(withholdSolutions({ attempts: 1, allowance: 1, passed: false })).toBe(false);
  });
});
