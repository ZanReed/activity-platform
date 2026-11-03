// =============================================================================
// video-pause-handler.test.ts — one clip's pause check (D64 VP-3, slice 3)
// -----------------------------------------------------------------------------
// Through the real handler and the real grader, with fake db ports. The gate and
// the first-try rules themselves are verify-0079's.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { ActivityDocument } from '@activity/schema';
import {
  createCheckActivityHandler,
  type CheckActivityDb,
} from '../src/server/check-activity-handler.js';
import { CHECK_WIRE_VERSION, emptySectionResponses } from '../src/check/wire.js';

const ACTIVITY = '11111111-2222-4333-8444-555555555555';
const VERSION = 'aaaaaaaa-bbbb-4ccc-9ddd-eeeeeeeeeeee';
const SECTION = '0f8fad5b-d9cb-469f-a165-70867728950e';
const CLIP = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const FIRST = '6fa459ea-ee8a-4ca4-894e-db77e160355e';
const SECOND = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const ABOVE = 'd0c1f3a2-5b6e-4c7d-8e9f-0a1b2c3d4e5f';
const BLANK_A = 'e1d2c3b4-a5f6-4e7d-8c9b-0a1b2c3d4e5f';
const BLANK_B = 'b1d2c3b4-a5f6-4e7d-8c9b-0a1b2c3d4e5f';
const BLANK_C = 'c1d2c3b4-a5f6-4e7d-8c9b-0a1b2c3d4e5f';
const BLANK_ABOVE = 'd1d2c3b4-a5f6-4e7d-8c9b-0a1b2c3d4e5f';
const SOLUTION = 'THE WORKED SOLUTION';

const blank = (id: string, answer: string, extra: object = {}) => ({
  type: 'blank', id, answer, answerType: 'numeric', width: 6, ...extra,
});
const faded = (id: string, blanks: object[]) => ({
  id,
  type: 'faded_worked_example',
  title: 'Try it',
  content: [{
    id: `${id.slice(0, -1)}9`,
    type: 'fill_in_blank',
    content: [{ type: 'text', text: 'Answer: ' }, ...blanks],
    solution: [{ type: 'text', text: SOLUTION }],
  }],
});

function storedDoc(meta: object = {}, section: object = {}) {
  return ActivityDocument.parse({
    schemaVersion: 2,
    meta: { title: 'Clip', course: 'Y9', ...meta },
    sections: [{
      id: SECTION,
      title: 'Lesson',
      isCheckpoint: true,
      ...section,
      rows: [{
        id: '9f8fad5b-d9cb-469f-a165-70867728950e',
        columns: [{
          id: '8f8fad5b-d9cb-469f-a165-70867728950e',
          blocks: [
            faded(ABOVE, [blank(BLANK_ABOVE, '9')]),
            { id: CLIP, type: 'video', title: 'Clip', url: 'https://youtu.be/x', pauses: [{ at: 1 }, { at: 2 }], stale: false },
            faded(FIRST, [
              blank(BLANK_A, '4', { mistakeFeedback: [{ match: '5', feedback: [{ type: 'text', text: 'You added.' }], misconceptionId: 'mis.vfy.adds' }] }),
              blank(BLANK_B, '6'),
            ]),
            faded(SECOND, [blank(BLANK_C, '8')]),
          ],
        }],
      }],
    }],
  });
}

function jwt(sub: string): string {
  const payload = btoa(JSON.stringify({ sub })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `Bearer header.${payload}.signature`;
}

const cors = {
  handlePreflight: () => null,
  jsonResponse: (_req: Request, body: unknown) => new Response(JSON.stringify(body), { status: 200 }),
  errorResponse: (_req: Request, status: number, message: string, details?: object) =>
    new Response(JSON.stringify({ error: message, ...(details ? { details } : {}) }), { status }),
};

function harness(over: Partial<CheckActivityDb> = {}) {
  const order: string[] = [];
  const records: Array<Record<string, unknown>> = [];
  const refuse = async () => {
    throw new Error('a pause check touched the section check');
  };
  const db: CheckActivityDb = {
    versionForCheck: async () => {
      order.push('chain');
      return { data: { version_id: VERSION, version_num: 1, is_current: true, current_version_id: VERSION }, error: null };
    },
    readVersion: async () => {
      order.push('read');
      return { data: { content: storedDoc() }, error: null };
    },
    videoSource: vi.fn(async () => {
      order.push('gate');
      return { data: [{ url: 'u', captions: null }], error: null };
    }),
    recordPauseTry: async (args) => {
      order.push('record');
      records.push(args as unknown as Record<string, unknown>);
      return { data: { recorded: true }, error: null };
    },
    recordCheck: refuse,
    ownLatestChecks: refuse,
    dolState: refuse,
    ...over,
  };
  const unreachable = async () => {
    throw new Error('practice');
  };
  const handler = createCheckActivityHandler({
    db,
    cors: cors as never,
    practice: { startMixedSession: unreachable, mixedItemForCheck: unreachable, readSnapshots: unreachable, readAttempts: unreachable, recordAttempt: unreachable, startDolPractice: unreachable, dolItemForCheck: unreachable, readDolSnapshots: unreachable, readDolAttempts: unreachable, recordDolAttempt: unreachable },
  });
  return { handler, db, order, records };
}

async function ask(h: ReturnType<typeof harness>, blockId: string, blanks: Record<string, string>, extra: object = {}) {
  const res = await h.handler(new Request('https://edge.test/check-activity', {
    method: 'POST',
    headers: { Authorization: jwt('student-1') },
    body: JSON.stringify({
      wireVersion: CHECK_WIRE_VERSION,
      mode: 'video-pause',
      activityId: ACTIVITY,
      versionId: VERSION,
      blockId,
      responses: { ...emptySectionResponses(), blanks },
      ...extra,
    }),
  }));
  return { status: res.status, body: (await res.json()) as Record<string, unknown>, raw: res };
}

describe('the verdict', () => {
  it('right when every blank in the block is right, and it names the section', async () => {
    const h = harness();
    const { status, body } = await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' });
    expect(status).toBe(200);
    expect(body.state).toBe('right');
    expect(h.records).toEqual([
      { studentId: 'student-1', activityId: ACTIVITY, versionId: VERSION, sectionId: SECTION, blockId: FIRST, correct: true },
    ]);
  });

  it('one wrong blank makes the whole block wrong, with its mistake feedback', async () => {
    const h = harness();
    const { body } = await ask(h, FIRST, { [BLANK_A]: '5', [BLANK_B]: '6' });
    expect(body.state).toBe('wrong');
    expect(body.feedback).toEqual([[expect.objectContaining({ type: 'text', text: 'You added.' })]]);
    expect(h.records[0]!.correct).toBe(false);
  });

  it('a blank left empty in an answered block is wrong', async () => {
    const h = harness();
    const { body } = await ask(h, FIRST, { [BLANK_A]: '4' });
    expect(body.state).toBe('wrong');
    expect(h.records[0]!.correct).toBe(false);
  });

  it('never carries an answer, a solution or a per-blank verdict', async () => {
    const h = harness();
    const { body } = await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '7' });
    const text = JSON.stringify(body);
    expect(text).not.toContain(SOLUTION);
    expect(text).not.toContain(BLANK_A);
    expect(text).not.toContain(BLANK_B);
    expect(Object.keys(body).sort()).toEqual(['feedback', 'state', 'wireVersion']);
    expect(body.feedback).toEqual([]);
  });

  it('nothing answered in this block is no try: not recorded, no verdict', async () => {
    const h = harness();
    // An answer elsewhere on the page doesn't make this block answered.
    const { body } = await ask(h, FIRST, { [BLANK_C]: '8' });
    expect(body.state).toBe('empty');
    expect(h.records).toEqual([]);
  });

  it('an answer elsewhere on the page changes nothing', async () => {
    const h = harness();
    const { body } = await ask(h, SECOND, { [BLANK_C]: '8', [BLANK_A]: '0', [BLANK_ABOVE]: '0' });
    expect(body.state).toBe('right');
  });
});

describe('who gets a verdict', () => {
  it('the order: chain, read, gate, record', async () => {
    const h = harness();
    await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' });
    expect(h.order).toEqual(['chain', 'read', 'gate', 'record']);
    expect(h.db.videoSource).toHaveBeenCalledWith(jwt('student-1'), ACTIVITY, VERSION, CLIP);
  });

  it('the gate says no: no verdict and no try', async () => {
    const h = harness({ videoSource: async () => ({ data: [], error: null }) });
    const { status, body } = await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' });
    expect(status).toBe(404);
    expect(body.state).toBeUndefined();
    expect(h.records).toEqual([]);
  });

  it('the gate errors: the same no', async () => {
    const h = harness({ videoSource: async () => ({ data: null, error: { message: 'boom' } }) });
    expect((await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' })).status).toBe(404);
    expect(h.records).toEqual([]);
  });

  it('the chain says no: the document is never read', async () => {
    const h = harness({ versionForCheck: async () => ({ data: null, error: { message: 'Not available' } }) });
    expect((await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' })).status).toBe(404);
    expect(h.order).toEqual([]);
  });

  it.each([
    ['a DoL section', {}, { dol: { skills: ['s.vfy.one'], retake: false } }],
    ['a locked file', { submissionMode: 'locked' }, {}],
    ['a quiz', { activityType: 'quiz' }, {}],
    ['an exam', { activityType: 'exam' }, {}],
    ['a section that is not the lesson', {}, { title: 'Practice' }],
  ])('a clip in %s gives no verdict, whatever its stored stale says', async (_name, meta, section) => {
    const h = harness({ readVersion: async () => ({ data: { content: storedDoc(meta, section) }, error: null }) });
    const { status, body } = await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' });
    expect(status).toBe(404);
    expect(body.state).toBeUndefined();
    expect(h.records).toEqual([]);
  });

  it.each([
    ['a faded block above the clip', ABOVE],
    ['a block that does not exist', '3fa459ea-ee8a-4ca4-894e-db77e160355e'],
  ])('%s is no pause', async (_name, blockId) => {
    const h = harness();
    const { status } = await ask(h, blockId, { [BLANK_ABOVE]: '9' });
    expect(status).toBe(404);
    expect(h.order).toEqual(['chain', 'read']);
  });

  it('a section already checked: no verdict', async () => {
    const h = harness({ recordPauseTry: async () => ({ data: { recorded: false, already_checked: true }, error: null }) });
    const { body } = await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' });
    expect(body).toEqual({ wireVersion: CHECK_WIRE_VERSION, state: 'already_checked' });
  });

  it('a failed record returns no verdict', async () => {
    const h = harness({ recordPauseTry: async () => ({ data: null, error: { message: 'boom' } }) });
    const { status, body } = await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' });
    expect(status).toBe(500);
    expect(body.state).toBeUndefined();
  });

  it('over the try ceiling: 429 and no verdict', async () => {
    const h = harness({ recordPauseTry: async () => ({ data: null, error: { message: 'rate_limited' } }) });
    const { status, body } = await ask(h, FIRST, { [BLANK_A]: '4', [BLANK_B]: '6' });
    expect(status).toBe(429);
    expect(body.state).toBeUndefined();
  });

  it('a stale tab and a malformed id are refused before anything runs', async () => {
    const h = harness();
    expect((await ask(h, FIRST, {}, { wireVersion: 1 })).status).toBe(400);
    expect((await ask(h, 'not-a-uuid', {})).status).toBe(400);
    expect(h.order).toEqual([]);
  });
});
