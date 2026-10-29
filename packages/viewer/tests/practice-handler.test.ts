// =============================================================================
// practice-handler.test.ts — mixed practice on check-activity (D43 slice 2)
// -----------------------------------------------------------------------------
// ER-13's handler guards, each bound to what leaves the server:
//   - a foreign / closed session or a slot not in the plan → the ONE 404, and
//     the answer-key snapshot is never read (the ports record every touch, so
//     an ordering bug cannot hide behind a right status);
//   - the served payload carries no answer, mistake, key or row value (the
//     shared secret-bearing fixture, scanned on the wire);
//   - the attempt is recorded BEFORE the verdict leaves, and the response is
//     what was stored; a replay returns the stored try and never re-grades;
//   - the answers (author ruling 2026-10-23) leave only with a recorded try;
//   - a Check with nothing answered is refused and records nothing.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import {
  createCheckActivityHandler,
  type CheckActivityDb,
} from '../src/server/check-activity-handler.js';
import {
  practiceServeKey,
  type PracticeAttemptRow,
  type PracticeDb,
  type DolPracticeDb,
  type PracticeSnapshotRow,
} from '../src/server/practice-handler.js';
import type { CorsKit } from '../src/server/get-activity-handler.js';
import { computeServedOrderings } from '../src/server/grading/servedOrder.js';
import { CHECK_WIRE_VERSION } from '../src/check/wire.js';
import { NUM, RELEASABLE, STR, fixturesByType, fullyLoadedDocument } from '../src/fixtures/leakFixture.js';

const CLASS = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const OTHER_SESSION = '33333333-3333-4333-8333-333333333333';
const STUDENT = '44444444-4444-4444-8444-444444444444';
const OTHER_STUDENT = '55555555-5555-4555-8555-555555555555';

const SECTION = '66666666-6666-4666-8666-666666666601';
const BLOCK = '66666666-6666-4666-8666-666666666602';
const BLANK = '66666666-6666-4666-8666-666666666603';
const BLANK2 = '66666666-6666-4666-8666-666666666604';
const ORDER = '66666666-6666-4666-8666-666666666605';

const ITEM_IDS = [1, 2, 3, 4, 5, 6].map((i) => `77777777-7777-4777-8777-77777777770${i}`);

/** A value the row carries but no prose shows — it must never reach a client. */
const HIDDEN = 918273.645;

function jwt(sub: string = STUDENT): string {
  const payload = btoa(JSON.stringify({ sub })).replace(/=+$/, '');
  return `Bearer header.${payload}.signature`;
}

const cors: CorsKit = {
  corsHeaders: () => ({}),
  handlePreflight: (req) => (req.method === 'OPTIONS' ? new Response(null, { status: 204 }) : null),
  jsonResponse: (_req, body, init) => new Response(JSON.stringify(body), { status: 200, ...init }),
  // Mirrors _shared/cors.ts: { error, details? }.
  errorResponse: (_req, status, message, details) =>
    new Response(JSON.stringify({ error: message, ...(details ? { details } : {}) }), { status }),
};

const sectionDb: CheckActivityDb = {
  versionForCheck: async () => { throw new Error('a practice call reached the section-check chain'); },
  readVersion: async () => { throw new Error('a practice call read an activity version'); },
  recordCheck: async () => { throw new Error('a practice call wrote a section check'); },
  ownLatestChecks: async () => { throw new Error('a practice call read section checks'); },
  dolState: async () => { throw new Error('a practice call read DoL state'); },
};

/** "Twice {a}: [blank = 2*a]", seeded by the slot's row. */
function seededItem(opts: { blanks?: 1 | 2; mistake?: boolean; solution?: boolean } = {}) {
  const blank = (id: string) => ({
    type: 'blank', id, answer: '2*a', answerType: 'numeric', width: 6,
    ...(opts.mistake
      ? { mistakeFeedback: [{ match: 'a+2', feedback: [{ type: 'text', text: 'Added, not doubled.' }], misconceptionId: 'mis.vfy.adds' }] }
      : {}),
  });
  return {
    schemaVersion: 2,
    meta: { title: 'bank#t1' },
    sections: [{
      id: SECTION, title: 'S',
      rows: [{ id: '99999999-9999-4999-8999-999999999999', columns: [{ id: '88888888-8888-4888-8888-888888888888', blocks: [{
        id: BLOCK, type: 'fill_in_blank',
        content: [
          { type: 'text', text: 'Twice {a}: ' }, blank(BLANK),
          ...(opts.blanks === 2 ? [{ type: 'text', text: ' and again: ' }, blank(BLANK2)] : []),
        ],
        ...(opts.solution ? { solution: [{ type: 'text', text: 'Double {a}.' }] } : {}),
      }] }] }],
    }],
  };
}

function orderingItem() {
  return {
    schemaVersion: 2,
    meta: { title: 'bank#o1' },
    sections: [{
      id: SECTION, title: 'S',
      rows: [{ id: '99999999-9999-4999-8999-999999999999', columns: [{ id: '88888888-8888-4888-8888-888888888888', blocks: [{
        id: ORDER, type: 'ordering',
        prompt: [{ type: 'text', text: 'Smallest first' }],
        items: ITEM_IDS.map((id, i) => ({ id, content: [{ type: 'text', text: 'abcdef'[i]! }] })),
      }] }] }],
    }],
  };
}

interface Calls {
  order: string[];
  snapshotArgs: Array<[string, number | undefined]>;
  records: Array<Parameters<PracticeDb['recordAttempt']>[0]>;
}

function harness(over: Partial<PracticeDb & DolPracticeDb> = {}, opts: {
  snapshots?: PracticeSnapshotRow[];
  attempts?: PracticeAttemptRow[];
  start?: unknown;
  check?: unknown;
  servedOrderings?: boolean;
} = {}) {
  const calls: Calls = { order: [], snapshotArgs: [], records: [] };
  const snapshots = opts.snapshots ?? [{ seq: 1, document: seededItem(), row_values: { a: 3, hidden: HIDDEN } }];
  const practice: PracticeDb & DolPracticeDb = {
    startMixedSession: async () => {
      calls.order.push('start');
      return {
        data: opts.start ?? {
          state: 'started', done_today: 0, graded: false, items_per_session: 6,
          session: {
            session_id: SESSION, practice_day: '2026-10-23', ordinal: 1, planned: snapshots.length,
            graded: false, score_right: 0, score_answered: 0, finished: false,
            items: snapshots.map((s) => ({ seq: s.seq, item_id: 'bank#t1', row_index: 0, answered: false })),
          },
        },
        error: null,
      };
    },
    mixedItemForCheck: async (_auth, sessionId, seq) => {
      calls.order.push('authorize');
      return {
        data: opts.check ?? {
          replay: false, student_id: STUDENT, session_id: sessionId, seq,
          owner_id: OTHER_STUDENT, item_id: 'bank#t1', fingerprint: 'f', row_index: 0,
        },
        error: null,
      };
    },
    readSnapshots: async (sessionId, seq) => {
      calls.order.push('snapshots');
      calls.snapshotArgs.push([sessionId, seq]);
      return { data: snapshots.filter((s) => seq === undefined || s.seq === seq), error: null };
    },
    readAttempts: async () => {
      calls.order.push('attempts');
      return { data: opts.attempts ?? [], error: null };
    },
    recordAttempt: async (args) => {
      calls.order.push('record');
      calls.records.push(args);
      return { data: { replayed: false, correct: args.correct, skipped: args.skipped, verdicts: args.verdicts }, error: null };
    },
    // D65 slice 2: the DoL pair, logged under its own names so a test proves
    // a DoL mode never reaches mixed practice's tables (TP-2).
    startDolPractice: async () => {
      calls.order.push('dol-start');
      return {
        data: { state: 'started', session: { session_id: SESSION, planned: snapshots.length, finished: false,
          items: snapshots.map((x) => ({ seq: x.seq, answered: false })) } },
        error: null,
      };
    },
    dolItemForCheck: async () => {
      calls.order.push('dol-authorize');
      return { data: opts.check ?? { replay: false, student_id: STUDENT }, error: null };
    },
    readDolSnapshots: async (_sessionId, seq) => {
      calls.order.push('dol-snapshots');
      return { data: snapshots.filter((x) => seq === undefined || x.seq === seq), error: null };
    },
    readDolAttempts: async () => {
      calls.order.push('dol-attempts');
      return { data: opts.attempts ?? [], error: null };
    },
    recordDolAttempt: async (args) => {
      calls.order.push('dol-record');
      calls.records.push(args);
      return { data: { replayed: false, correct: args.correct, skipped: args.skipped, verdicts: args.verdicts }, error: null };
    },
    ...over,
  };
  const handler = createCheckActivityHandler({
    db: sectionDb,
    practice,
    cors,
    ...(opts.servedOrderings
      ? {
          servedOrderings: ({ document, versionId, studentId, sectionId }) =>
            computeServedOrderings(document as { sections?: never[] }, sectionId, versionId, studentId),
        }
      : {}),
  });
  return { handler, calls };
}

function post(body: unknown, sub: string = STUDENT): Request {
  return new Request('https://edge.test/check-activity', {
    method: 'POST',
    headers: { Authorization: jwt(sub) },
    body: JSON.stringify(body),
  });
}

const startBody = (over: Record<string, unknown> = {}) =>
  ({ wireVersion: CHECK_WIRE_VERSION, mode: 'practice-start', classId: CLASS, start: true, ...over });
const checkBody = (over: Record<string, unknown> = {}) =>
  ({ wireVersion: CHECK_WIRE_VERSION, mode: 'practice', sessionId: SESSION, seq: 1, responses: { blanks: { [BLANK]: '6' } }, ...over });

const notAvailable = async () => ({ data: null, error: { message: 'Not available' } });

// ---- practice-start ------------------------------------------------------------

describe('practice-start', () => {
  it('a refusal is the one 404, and no snapshot is read', async () => {
    const h = harness({ startMixedSession: async () => { h.calls.order.push('start'); return notAvailable(); } });
    const res = await h.handler(post(startBody()));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not available' });
    expect(h.calls.order).toEqual(['start']);
  });

  it('refuses a malformed request before the RPC', async () => {
    const h = harness();
    for (const bad of [startBody({ classId: 'nope' }), startBody({ start: 'yes' }), startBody({ wireVersion: 1 })]) {
      const res = await h.handler(post(bad));
      expect(res.status).toBe(400);
    }
    expect(h.calls.order).toEqual([]);
  });

  it.each(['nothing_taught', 'nothing_due', 'done_today'])('passes %s through and reads nothing', async (state) => {
    const h = harness({}, { start: { state, done_today: 1, graded: true, items_per_session: 6 } });
    const res = await h.handler(post(startBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      wireVersion: CHECK_WIRE_VERSION, state, doneToday: 1, graded: true, itemsPerSession: 6,
    });
    expect(h.calls.order).toEqual(['start']);
  });

  it('the preview says how many questions, writes nothing, reads nothing', async () => {
    const calls: boolean[] = [];
    const h = harness({
      startMixedSession: async (_a, _c, start) => {
        calls.push(start);
        return { data: { state: 'ready', planned: 4, done_today: 0, graded: false, items_per_session: 6 }, error: null };
      },
    });
    const res = await h.handler(post(startBody({ start: false })));
    expect(await res.json()).toMatchObject({ state: 'ready', planned: 4 });
    expect(calls).toEqual([false]);
    expect(h.calls.order).toEqual([]);
  });

  it('reads the snapshots of the session the RPC named, only after it', async () => {
    const h = harness();
    // A client cannot name a session here; a stray field must not reach a port.
    const res = await h.handler(post(startBody({ sessionId: OTHER_SESSION })));
    expect(res.status).toBe(200);
    expect(h.calls.order[0]).toBe('start');
    expect(h.calls.snapshotArgs).toEqual([[SESSION, undefined]]);
  });

  it('serves the slot with its numbers filled in, and NO row value, key or mistake', async () => {
    const h = harness({}, {
      snapshots: [{ seq: 1, document: seededItem({ mistake: true, solution: true }), row_values: { a: 3, hidden: HIDDEN } }],
    });
    const res = await h.handler(post(startBody()));
    const text = await res.text();
    const body = JSON.parse(text);
    expect(body.state).toBe('started');
    expect(body.session.items).toHaveLength(1);
    expect(text).toContain('Twice 3:');
    expect(text).not.toContain(String(HIDDEN));
    expect(text).not.toContain('2*a');
    expect(text).not.toContain('a+2');
    expect(text).not.toContain('mis.vfy.adds');
    expect(text).not.toContain('Added, not doubled.');
    expect(text).not.toContain('Double 3.');
    expect(body.session.items[0].result).toBeUndefined();
  });

  it('the shared secret-bearing fixture leaks nothing on an unanswered slot', async () => {
    const leak = fullyLoadedDocument();
    const h = harness({}, { snapshots: [{ seq: 1, document: leak, row_values: { hidden: HIDDEN } }] });
    const res = await h.handler(post(startBody()));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain(STR);
    expect(text).not.toContain(String(NUM));
    expect(text).not.toContain(RELEASABLE);
    expect(text).not.toContain(String(HIDDEN));
  });

  it('resume returns a tried slot with its STORED try, solutions and answers; an untried one bare', async () => {
    const h = harness({}, {
      start: {
        state: 'resume', done_today: 0, graded: true, items_per_session: 6,
        session: {
          session_id: SESSION, practice_day: '2026-10-23', planned: 2, graded: true,
          score_right: 0, score_answered: 1, finished: false,
          items: [{ seq: 1, answered: true }, { seq: 2, answered: false }],
        },
      },
      snapshots: [
        { seq: 1, document: seededItem({ solution: true }), row_values: { a: 3 } },
        { seq: 2, document: seededItem({ solution: true }), row_values: { a: 5 } },
      ],
      // Stored as wrong although "6" would grade right today: resume must not re-grade.
      attempts: [{ seq: 1, correct: false, skipped: false, verdicts: { [BLANK]: { verdict: 'incorrect' } } }],
    });
    const body = await (await h.handler(post(startBody()))).json();
    expect(body.state).toBe('resume');
    expect(body.session).toMatchObject({ sessionId: SESSION, planned: 2, graded: true, scoreAnswered: 1 });
    const [tried, untried] = body.session.items;
    expect(tried.result).toEqual({
      correct: false, skipped: false,
      items: { [BLANK]: { verdict: 'incorrect' } },
      solutions: { [BLOCK]: [{ type: 'text', text: 'Double 3.', marks: [] }] },
      answers: { blanks: { [BLANK]: { answer: '6' } }, choices: {} },
    });
    expect(untried.result).toBeUndefined();
    expect(JSON.stringify(untried)).not.toContain('Double 5.');
    expect(JSON.stringify(untried)).not.toContain('"10"');
  });

  it('a snapshot that is not one section is a 500, not a guess', async () => {
    const two = seededItem();
    two.sections.push({ ...two.sections[0]!, id: '66666666-6666-4666-8666-6666666666ff' });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = harness({}, { snapshots: [{ seq: 1, document: two, row_values: { a: 3 } }] });
    const res = await h.handler(post(startBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ details: { code: 'malformed_document' } });
    spy.mockRestore();
  });
});

// ---- practice (one try) ----------------------------------------------------------

describe('practice', () => {
  it('a refusal (foreign / closed session, slot not planned) is the one 404, nothing read or written', async () => {
    const h = harness({ mixedItemForCheck: async () => { h.calls.order.push('authorize'); return notAvailable(); } });
    const res = await h.handler(post(checkBody()));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not available' });
    expect(h.calls.order).toEqual(['authorize']);
  });

  it('a session the database says is another student\'s is the same 404', async () => {
    const h = harness({}, { check: { replay: false, student_id: OTHER_STUDENT } });
    const res = await h.handler(post(checkBody()));
    expect(res.status).toBe(404);
    expect(h.calls.order).toEqual(['authorize']);
  });

  it('refuses a malformed request before the RPC', async () => {
    const h = harness();
    for (const bad of [
      checkBody({ sessionId: 'x' }), checkBody({ seq: 0 }), checkBody({ seq: 51 }), checkBody({ seq: 1.5 }),
      checkBody({ responses: { blanks: { [BLANK]: 6 } } }), checkBody({ skip: 'yes' }),
      checkBody({ skip: true }), // a skip carries no answer
    ]) {
      expect((await h.handler(post(bad))).status).toBe(400);
    }
    expect(h.calls.order).toEqual([]);
  });

  it('records BEFORE the verdict leaves, and returns what was stored', async () => {
    const h = harness();
    const res = await h.handler(post(checkBody()));
    expect(res.status).toBe(200);
    expect(h.calls.order).toEqual(['authorize', 'snapshots', 'record']);
    expect(h.calls.snapshotArgs).toEqual([[SESSION, 1]]);
    expect(h.calls.records).toEqual([{
      studentId: STUDENT, sessionId: SESSION, seq: 1, correct: true, skipped: false,
      responses: expect.objectContaining({ blanks: { [BLANK]: '6' } }),
      verdicts: { [BLANK]: { verdict: 'correct' } },
    }]);
    expect(await res.json()).toEqual({
      wireVersion: CHECK_WIRE_VERSION, seq: 1, replayed: false, correct: true, skipped: false,
      items: { [BLANK]: { verdict: 'correct' } },
      solutions: {},
      answers: { blanks: { [BLANK]: { answer: '6' } }, choices: {} },
    });
  });

  it('a failed write returns no verdict and no answer', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = harness({ recordAttempt: async () => ({ data: null, error: { message: 'boom' } }) });
    const res = await h.handler(post(checkBody()));
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toContain('correct');
    expect(text).not.toContain('"6"');
    expect(JSON.parse(text)).toMatchObject({ details: { code: 'record_failed' } });
    spy.mockRestore();
  });

  it('a write the backstop refuses (session closed meanwhile) is the one 404', async () => {
    const h = harness({ recordAttempt: async () => ({ data: null, error: { message: 'record_mixed_attempt: refused (session closed)' } }) });
    const res = await h.handler(post(checkBody()));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not available' });
  });

  it('a wrong try carries the mistake, its misconception id, and the answer', async () => {
    const h = harness({}, { snapshots: [{ seq: 1, document: seededItem({ mistake: true }), row_values: { a: 3 } }] });
    const res = await h.handler(post(checkBody({ responses: { blanks: { [BLANK]: '5' } } })));
    const body = await res.json();
    expect(body.correct).toBe(false);
    expect(body.items[BLANK]).toMatchObject({ verdict: 'incorrect', misconceptionIds: ['mis.vfy.adds'] });
    expect(JSON.stringify(body.items[BLANK].feedback)).toContain('Added, not doubled.');
    expect(body.answers.blanks[BLANK]).toEqual({ answer: '6' });
    // The verdicts the database derives misconception_ids from (0067).
    expect(h.calls.records[0]!.verdicts[BLANK]!.misconceptionIds).toEqual(['mis.vfy.adds']);
  });

  it('a Check with nothing answered is refused and records nothing', async () => {
    const h = harness();
    const res = await h.handler(post(checkBody({ responses: { blanks: { [BLANK]: '   ' } } })));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ details: { code: 'nothing_answered' } });
    expect(h.calls.records).toHaveLength(0);
    const res2 = await h.handler(post(checkBody({ responses: {} })));
    expect(res2.status).toBe(400);
    expect(h.calls.records).toHaveLength(0);
  });

  it('a part left blank is not right, but the try counts', async () => {
    const h = harness({}, { snapshots: [{ seq: 1, document: seededItem({ blanks: 2 }), row_values: { a: 3 } }] });
    const res = await h.handler(post(checkBody({ responses: { blanks: { [BLANK]: '6' } } })));
    expect(res.status).toBe(200);
    expect((await res.json()).correct).toBe(false);
    expect(h.calls.records[0]).toMatchObject({ correct: false, skipped: false });
  });

  it('a display-only graph beside the blank is a stimulus, not a part to get right', async () => {
    const stimulus = fixturesByType().get('interactive_graph')!
      .find((b) => (b.interaction as { type?: string } | undefined)?.type === 'display');
    expect(stimulus).toBeDefined();
    const doc = seededItem();
    doc.sections[0]!.rows.push({
      id: '99999999-9999-4999-8999-99999999990a',
      columns: [{ id: '88888888-8888-4888-8888-88888888880a', blocks: [stimulus as never] }],
    });
    const h = harness({}, { snapshots: [{ seq: 1, document: doc, row_values: { a: 3 } }] });
    const res = await h.handler(post(checkBody()));
    expect(res.status).toBe(200);
    expect((await res.json()).correct).toBe(true);
    expect(h.calls.records[0]).toMatchObject({ correct: true });
  });

  it('a skip is recorded as a skipped, wrong first try with no answer, and reveals the answer', async () => {
    const h = harness();
    const res = await h.handler(post(checkBody({ skip: true, responses: undefined })));
    expect(res.status).toBe(200);
    expect(h.calls.records[0]).toMatchObject({ correct: false, skipped: true, verdicts: {} });
    expect(Object.values(h.calls.records[0]!.responses).every((m) => Object.keys(m).length === 0)).toBe(true);
    expect(await res.json()).toMatchObject({ correct: false, skipped: true, answers: { blanks: { [BLANK]: { answer: '6' } } } });
  });

  it('a replay returns the STORED try: no grading, no write', async () => {
    const h = harness({}, {
      check: { replay: true, student_id: STUDENT, correct: false, skipped: false, verdicts: { [BLANK]: { verdict: 'incorrect' } } },
    });
    // "6" would grade right; the stored try was wrong. The stored one wins.
    const res = await h.handler(post(checkBody()));
    expect(h.calls.order).toEqual(['authorize', 'snapshots']);
    expect(await res.json()).toMatchObject({
      replayed: true, correct: false, items: { [BLANK]: { verdict: 'incorrect' } },
    });
  });

  it('a concurrent try that won the write is the one returned', async () => {
    const h = harness({
      recordAttempt: async () => ({
        data: { replayed: true, correct: false, skipped: true, verdicts: {} }, error: null,
      }),
    });
    const body = await (await h.handler(post(checkBody()))).json();
    expect(body).toMatchObject({ replayed: true, correct: false, skipped: true, items: {} });
  });

  it('grades an ordering against the permutation THIS slot was served', async () => {
    const h = harness({}, { snapshots: [{ seq: 1, document: orderingItem(), row_values: {} }], servedOrderings: true });
    const started = await (await h.handler(post(startBody()))).json();
    const served = started.session.items[0].document.sections[0].rows[0].columns[0].blocks[0].items
      .map((i: { id: string }) => i.id) as string[];
    const authored = [...ITEM_IDS];
    // The served order is the slot's own shuffle, recomputed by the grader.
    expect(served).toEqual(
      computeServedOrderings(orderingItem() as never, SECTION, practiceServeKey(SESSION, 1), STUDENT)[ORDER],
    );
    expect(served).not.toEqual(authored);
    // Submitting the served order untouched is NOT an answer that happens to
    // be right; submitting the authored order is right.
    const untouched = await h.handler(post(checkBody({ responses: { orderings: { [ORDER]: served } } })));
    expect(untouched.status).toBe(400);
    const right = await (await h.handler(post(checkBody({ responses: { orderings: { [ORDER]: authored } } })))).json();
    expect(right.correct).toBe(true);
  });
});

// ---- DoL targeted practice (D65 slice 2, 0072) --------------------------------

describe('dol-practice (D65 slice 2)', () => {
  const dolStart = { wireVersion: CHECK_WIRE_VERSION, mode: 'dol-practice-start', activityId: CLASS, versionId: SESSION };
  const dolCheck = (over: Record<string, unknown> = {}) => ({ ...checkBody(over), mode: 'dol-practice' });

  it('start: the caller RPC first, then ITS OWN snapshots — never mixed practice\'s tables (TP-2)', async () => {
    const h = harness();
    const res = await h.handler(post(dolStart));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.state).toBe('started');
    expect(body.session.items).toHaveLength(1);
    expect(h.calls.order[0]).toBe('dol-start');
    expect(h.calls.order).not.toContain('snapshots');
    expect(h.calls.order).not.toContain('start');
    // The served item leaks no row value (the shared leak rule).
    expect(JSON.stringify(body)).not.toContain(HIDDEN);
  });

  it('start: a refusal is the one 404 and nothing is read', async () => {
    const h = harness({ startDolPractice: async () => { h.calls.order.push('dol-start'); return notAvailable(); } });
    const res = await h.handler(post(dolStart));
    expect(res.status).toBe(404);
    expect(h.calls.order).toEqual(['dol-start']);
  });

  it('start: nothing to practise comes back with no session', async () => {
    const h = harness({ startDolPractice: async () => ({ data: { state: 'nothing_to_practise' }, error: null }) });
    const body = await (await h.handler(post(dolStart))).json();
    expect(body).toEqual({ wireVersion: CHECK_WIRE_VERSION, state: 'nothing_to_practise' });
  });

  it('start: a malformed request never reaches the RPC', async () => {
    const h = harness();
    const res = await h.handler(post({ ...dolStart, versionId: 'nope' }));
    expect(res.status).toBe(400);
    expect(h.calls.order).toEqual([]);
  });

  it('check: authorize, read, grade, RECORD on the DoL ports, in that order', async () => {
    const h = harness();
    const res = await h.handler(post(dolCheck()));
    expect(res.status).toBe(200);
    expect(h.calls.order).toEqual(['dol-authorize', 'dol-snapshots', 'dol-record']);
    expect((await res.json()).correct).toBe(true);
  });
});
