// =============================================================================
// check-activity-handler.test.ts — branch pins for the check endpoint (S4 T4)
// -----------------------------------------------------------------------------
// The S2 handler's 29 branch pins are the model. Every branch that can return
// something other than a graded section is pinned here, because each one is a
// different thing going wrong for a student mid-lesson and they must not be
// confusable: a stale tab, a malformed payload, a foreign version, a rate
// ceiling, and a real server bug all look identical from the outside unless the
// status and code separate them.
//
// The security pins are ORDERING pins as much as status pins. `authorizationRan`
// / `documentWasRead` record whether each port was touched, so the suite can
// assert that the raw document — answer keys and all — is never fetched before
// the authorization chain has passed, and never at all when it fails. A handler
// that returned the right 404 *after* reading the document would pass a
// status-only test and still be wrong.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import {
  createCheckActivityHandler,
  validateCheckRequest,
    type CheckActivityDb,
} from '../src/server/check-activity-handler.js';
import { MalformedDocumentError } from '../src/server/grading/walk.js';

// The ONE mocked module in this file, and only as a pass-through with an
// override hook. The malformed_document branch cannot be reached through the
// real path today: the handler Zod-validates via upgradeActivityDocument
// before grading, so no STORABLE content trips the walk's integrity gate —
// which is exactly why the branch exists (defense in depth for the day a
// validator gap opens). A dormant safeguard still needs its liveness proof
// (P3), so the override fires it once; every other test runs the real engine.
const gradingOverride = vi.hoisted(() => ({
  gradeSection: null as ((...args: never[]) => unknown) | null,
}));
vi.mock('../src/server/grading/index.js', async (importOriginal) => {
  const real = await importOriginal<
    typeof import('../src/server/grading/index.js')
  >();
  return {
    ...real,
    gradeSection: (...args: never[]) =>
      gradingOverride.gradeSection
        ? gradingOverride.gradeSection(...args)
        : (real.gradeSection as (...a: never[]) => unknown)(...args),
  };
});
import type { CorsKit } from '../src/server/get-activity-handler.js';
import { jwtSub as jwtSubject } from '../src/server/jwt.js';
import { CHECK_WIRE_VERSION } from '../src/check/wire.js';
import { authoredFixtureDocument } from '../src/fixtures/index.js';

const doc = authoredFixtureDocument() as unknown as {
  sections: Array<{ id: string }>;
};
const sectionId = doc.sections[0]!.id;

const ACTIVITY = '11111111-1111-4111-8111-111111111111';
const VERSION = '22222222-2222-4222-8222-222222222222';
const OTHER_VERSION = '33333333-3333-4333-8333-333333333333';
const STUDENT = '44444444-4444-4444-8444-444444444444';

/** A real-shaped JWT: header.payload.signature, payload carrying `sub`. */
function jwt(sub: string = STUDENT): string {
  const payload = btoa(JSON.stringify({ sub })).replace(/=+$/, '');
  return `Bearer header.${payload}.signature`;
}

const cors: CorsKit = {
  corsHeaders: () => ({}),
  handlePreflight: (req) => (req.method === 'OPTIONS' ? new Response(null, { status: 204 }) : null),
  jsonResponse: (_req, body, init) =>
    new Response(JSON.stringify(body), { status: 200, ...init }),
  // MIRRORS supabase/functions/_shared/cors.ts EXACTLY:
  //   { error: message, details?: <details> }
  // It used to spread `details` at the top level, which is not what the real
  // helper does — and that divergence hid a live bug: the client read
  // `body.code`, the server nested it at `body.details.code`, so the
  // stale-client mapping could never fire in production. Both sides passed
  // their own tests because both were written against the same wrong
  // assumption. A double that does not match the real thing is worse than no
  // double at all.
  errorResponse: (_req, status, message, details) =>
    new Response(
      JSON.stringify({ error: message, ...(details ? { details } : {}) }),
      { status },
    ),
};

interface Harness {
  handler: (req: Request) => Promise<Response>;
  authorizationRan: () => boolean;
  documentWasRead: () => boolean;
  recorded: () => unknown[];
}

function harness(
  over: Partial<CheckActivityDb> = {},
  opts: { isCurrent?: boolean; submissionMode?: string } = {},
): Harness {
  let authRan = false;
  let docRead = false;
  const records: unknown[] = [];

  const db: CheckActivityDb = {
    versionForCheck: async () => {
      authRan = true;
      return {
        data: {
          version_id: VERSION,
          version_num: 1,
          is_current: opts.isCurrent ?? true,
          current_version_id: opts.isCurrent === false ? OTHER_VERSION : VERSION,
        },
        error: null,
      };
    },
    readVersion: async () => {
      docRead = true;
      return {
        data: {
          content: opts.submissionMode
            ? { ...doc, meta: { ...(doc as { meta?: object }).meta, submissionMode: opts.submissionMode } }
            : doc,
        },
        error: null,
      };
    },
    recordCheck: async (args) => {
      records.push(args);
      return {
        data: {
          check_id: 'c1',
          attempt_number: 1,
          verdicts: null,
          replayed: false,
        },
        error: null,
      };
    },
    ...over,
  };

  return {
    handler: createCheckActivityHandler({ db, cors }),
    authorizationRan: () => authRan,
    documentWasRead: () => docRead,
    recorded: () => records,
  };
}

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://edge.test/check-activity', {
    method: 'POST',
    headers: { Authorization: jwt(), ...headers },
    body: JSON.stringify(body),
  });
}

function validBody(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    wireVersion: CHECK_WIRE_VERSION,
    activityId: ACTIVITY,
    versionId: VERSION,
    sectionId,
    responses: { blanks: {} },
    ...over,
  };
}

describe('transport', () => {
  it('answers a CORS preflight without touching anything', async () => {
    const h = harness();
    const res = await h.handler(
      new Request('https://edge.test/check-activity', { method: 'OPTIONS' }),
    );
    expect(res.status).toBe(204);
    expect(h.authorizationRan()).toBe(false);
  });

  it('rejects a non-POST method', async () => {
    const h = harness();
    const res = await h.handler(
      new Request('https://edge.test/check-activity', { method: 'GET' }),
    );
    expect(res.status).toBe(405);
  });

  it('rejects a missing Authorization header before reading anything', async () => {
    const h = harness();
    const res = await h.handler(
      new Request('https://edge.test/check-activity', {
        method: 'POST',
        body: JSON.stringify(validBody()),
      }),
    );
    expect(res.status).toBe(401);
    expect(h.documentWasRead()).toBe(false);
  });

  it('rejects an oversized body without parsing it', async () => {
    const h = harness();
    const res = await h.handler(
      new Request('https://edge.test/check-activity', {
        method: 'POST',
        headers: { Authorization: jwt(), 'content-length': String(10 * 1024 * 1024) },
        body: JSON.stringify(validBody()),
      }),
    );
    expect(res.status).toBe(413);
    expect(h.authorizationRan()).toBe(false);
  });

  it('rejects a body that is not JSON', async () => {
    const h = harness();
    const res = await h.handler(
      new Request('https://edge.test/check-activity', {
        method: 'POST',
        headers: { Authorization: jwt() },
        body: 'not json at all',
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe('the authorization chain (ruling S4-B1)', () => {
  it('refuses a version belonging to a DIFFERENT activity, and never reads the document', async () => {
    // THE probe. Solutions come back for every block in a checked section, and
    // "ids ⊆ section" is vacuously true for empty responses — so if a foreign
    // versionId got past this, an empty request would return that activity's
    // entire solution set. The DB says 'Not available'; what this pins is that
    // the handler stops there rather than reading the raw document anyway.
    const h = harness({
      versionForCheck: async () => ({
        data: null,
        error: { message: 'Not available' },
      }),
    });
    const res = await h.handler(post(validBody({ versionId: OTHER_VERSION })));
    expect(res.status).toBe(404);
    expect(h.documentWasRead()).toBe(false);
  });

  it('gives the same 404 for a draft, a deleted, and a missing activity — no oracle', async () => {
    for (const message of ['Not available', 'Not available', 'Not available']) {
      const h = harness({
        versionForCheck: async () => ({ data: null, error: { message } }),
      });
      const res = await h.handler(post(validBody()));
      expect(res.status).toBe(404);
      expect(await res.json()).toMatchObject({ error: 'Not available' });
    }
  });

  it('maps an expired or invalid JWT to 401', async () => {
    const h = harness({
      versionForCheck: async () => ({
        data: null,
        error: { message: 'JWT expired' },
      }),
    });
    expect((await h.handler(post(validBody()))).status).toBe(401);
  });

  it('maps an unexpected RPC failure to 500, not to a denial', async () => {
    // A database hiccup must not read as "you may not check this" — the
    // student would blame themselves and the teacher would blame the content.
    const h = harness({
      versionForCheck: async () => ({
        data: null,
        error: { message: 'connection reset' },
      }),
    });
    expect((await h.handler(post(validBody()))).status).toBe(500);
  });

  it('runs authorization BEFORE reading the raw document', async () => {
    const order: string[] = [];
    const h = harness({
      versionForCheck: async () => {
        order.push('authorize');
        return {
          data: {
            version_id: VERSION,
            version_num: 1,
            is_current: true,
            current_version_id: VERSION,
          },
          error: null,
        };
      },
      readVersion: async () => {
        order.push('read');
        return { data: { content: doc }, error: null };
      },
    });
    await h.handler(post(validBody()));
    expect(order).toEqual(['authorize', 'read']);
  });
});

describe('request validation', () => {
  it('reports a wire-version mismatch with its own code, not a generic error', () => {
    // A stale open tab after a wire bump. The viewer maps this to
    // "refresh to continue" rather than "something went wrong".
    const result = validateCheckRequest({ ...validBody(), wireVersion: 99 });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.failure.code).toBe('wire_version_mismatch');
  });

  it.each([
    ['activityId', { activityId: 'not-a-uuid' }, 'bad_activity_id'],
    ['versionId', { versionId: 'nope' }, 'bad_version_id'],
    ['sectionId', { sectionId: '' }, 'bad_section_id'],
    ['responses', { responses: 'a string' }, 'bad_responses'],
    ['blanks', { responses: { blanks: { a: 5 } } }, 'bad_blanks'],
    ['choices', { responses: { choices: { a: 'not-an-array' } } }, 'bad_choices'],
    ['matches', { responses: { matches: { a: { b: 7 } } } }, 'bad_matches'],
    [
      'correspondences (non-string leaf)',
      { responses: { correspondences: { a: { b: { c: 7 } } } } },
      'bad_correspondences',
    ],
    [
      'correspondences (flat map)',
      { responses: { correspondences: { a: { b: 'target' } } } },
      'bad_correspondences',
    ],
    ['orderings', { responses: { orderings: { a: [1, 2] } } }, 'bad_orderings'],
    ['freeText', { responses: { freeText: { a: [] } } }, 'bad_free_text'],
  ])('rejects a malformed %s', (_label, over, code) => {
    const result = validateCheckRequest({ ...validBody(), ...over });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.failure.code).toBe(code);
  });

  it('rejects an absurd item count', () => {
    const blanks: Record<string, string> = {};
    for (let i = 0; i < 600; i++) blanks[`b${i}`] = 'x';
    const result = validateCheckRequest({ ...validBody(), responses: { blanks } });
    expect(result.ok === false && result.failure.code).toBe('too_many_items');
  });

  it('rejects a free-text answer that is an attack rather than an essay', () => {
    const result = validateCheckRequest({
      ...validBody(),
      responses: { freeText: { a: 'x'.repeat(200_000) } },
    });
    expect(result.ok === false && result.failure.code).toBe('free_text_too_long');
  });

  it('accepts a well-formed request and defaults every absent category', () => {
    const result = validateCheckRequest(validBody());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.responses.choices).toEqual({});
    expect(result.request.responses.graphs).toEqual({});
    expect(result.request.responses.correspondences).toEqual({});
  });

  it('accepts a well-formed correspondences map (item → column → target)', () => {
    const result = validateCheckRequest(
      validBody({
        responses: { correspondences: { block: { item: { col: 'target' } } } },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.responses.correspondences).toEqual({
      block: { item: { col: 'target' } },
    });
  });

  it('never grades or records a rejected request', async () => {
    const h = harness();
    const res = await h.handler(post(validBody({ wireVersion: 99 })));
    expect(res.status).toBe(400);
    expect(h.authorizationRan()).toBe(false);
    expect(h.recorded()).toHaveLength(0);
  });
});

describe('grading failures', () => {
  it('turns an unknown section into a 400, not a 500', async () => {
    const h = harness();
    const res = await h.handler(post(validBody({ sectionId: 'no-such-section' })));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ details: { code: 'unknown_section' } });
  });

  it('fails the WHOLE check and records nothing when grading throws', async () => {
    // A real server bug. Partial verdicts would be worse than none, and a
    // guessed one worse still — so nothing is written and the student sees the
    // designed "couldn't check" state with every answer intact.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = harness({
      readVersion: async () => ({ data: { content: { sections: 'broken' } }, error: null }),
    });
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(500);
    expect(h.recorded()).toHaveLength(0);
    // The context line is what makes this findable from a log rather than from
    // a student complaint.
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('maps a structurally broken document to 500 + malformed_document, recording nothing', async () => {
    // B8/D10: the typed failure the client maps to its own non-retryable
    // copy. Distinct from grading_failed on purpose — "our data is broken"
    // and "the grader crashed" want different follow-ups, and the problems
    // list in the log line is the defect report.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    gradingOverride.gradeSection = () => {
      throw new MalformedDocumentError(['block b1: choices is not an array']);
    };
    try {
      const h = harness();
      const res = await h.handler(post(validBody()));
      expect(res.status).toBe(500);
      expect(await res.json()).toMatchObject({
        details: { code: 'malformed_document' },
      });
      expect(h.recorded()).toHaveLength(0);
      expect(spy).toHaveBeenCalledWith(
        '[check-activity] malformed document',
        expect.stringContaining('choices is not an array'),
      );
    } finally {
      gradingOverride.gradeSection = null;
      spy.mockRestore();
    }
  });

  it('reports a document that cannot be loaded as 500', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = harness({
      readVersion: async () => ({ data: null, error: { message: 'gone' } }),
    });
    expect((await h.handler(post(validBody()))).status).toBe(500);
    spy.mockRestore();
  });
});

describe('recording', () => {
  it('passes the graded verdicts and the student id to record_check', async () => {
    const h = harness();
    await h.handler(post(validBody()));
    const [record] = h.recorded() as Array<{ studentId: string; verdicts: unknown }>;
    expect(record!.studentId).toBe(STUDENT);
    expect(record!.verdicts).toBeDefined();
  });

  it('maps the rate ceiling to 429 with its own code', async () => {
    const h = harness({
      recordCheck: async () => ({
        data: null,
        error: { message: 'rate_limited: check rate ceiling reached' },
      }),
    });
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ details: { code: 'rate_limited' } });
  });

  it('refuses to return verdicts it failed to record', async () => {
    // Returning a mark the teacher will never see makes the student's screen
    // and the teacher's view disagree about what happened.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = harness({
      recordCheck: async () => ({ data: null, error: { message: 'disk on fire' } }),
    });
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ details: { code: 'record_failed' } });
    spy.mockRestore();
  });

  it('forwards an idempotency key so a retry replays instead of double-counting', async () => {
    const h = harness();
    await h.handler(post(validBody({ idempotencyKey: 'attempt-abc' })));
    const [record] = h.recorded() as Array<{ idempotencyKey: string | null }>;
    expect(record!.idempotencyKey).toBe('attempt-abc');
  });

  // -------------------------------------------------------------------------
  // record_check round-trip over the EXTENDED schema (answer-key slice, T6)
  // -------------------------------------------------------------------------
  // A CRITICAL regression pin, and the reason it is critical is the deploy
  // shape: the schema change rides into the GRADING bundle as well as the read
  // one, and a document the grader refuses is a live 500 on every check of
  // every section that contains one of these blocks — not a degraded render, a
  // hard failure in front of a class. The walk's invariant checker rejects a
  // block whose `solution` is not an array, so a field arriving in an
  // unexpected SHAPE is exactly the failure mode with a path to production.
  it('accepts a document carrying the new answer/solution fields', async () => {
    const { ActivityDocument, createEmptyDocument } = await import('@activity/schema');
    const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
    const blocks = [
      {
        id: id(1),
        type: 'short_answer',
        prompt: [{ type: 'text', text: 'Explain.', marks: [] }],
        answer: [{ type: 'text', text: 'Because 2(m+n).', marks: [] }],
        solution: [{ type: 'text', text: 'Factor the 2 out.', marks: [] }],
      },
      {
        id: id(2),
        type: 'essay',
        prompt: [{ type: 'text', text: 'Argue.', marks: [] }],
        answer: [{ type: 'text', text: 'Either side, defended.', marks: [] }],
      },
    ];
    // Parsed, so this is a REAL document — a hand-built shape that only looks
    // valid would test the grader against a document that cannot exist.
    const doc = ActivityDocument.parse({
      ...JSON.parse(JSON.stringify(createEmptyDocument({ title: 'Answer key' }))),
      sections: [
        {
          id: id(9),
          isCheckpoint: false,
          rows: blocks.map((block, i) => ({
            id: id(20 + i),
            gridLines: 'inherit',
            columns: [{ id: id(30 + i), blocks: [block] }],
          })),
        },
      ],
    });

    const h = harness({
      readVersion: async () => ({ data: { content: doc }, error: null }),
    });

    const res = await h.handler(
      post(validBody({ sectionId: id(9), responses: { freeText: { [id(1)]: 'my answer' } } })),
    );
    expect(res.status).toBe(200);
    expect(h.recorded()).toHaveLength(1);

    // The `solution` reaches the student through the RESPONSE (walk.ts's
    // generic collection), while the `answer` reaches nobody — the two fields
    // have different release rules and this is the wire where both are visible.
    const body = JSON.stringify(await res.json());
    expect(body).toContain('Factor the 2 out.');
    expect(body).not.toContain('Because 2(m+n).');
    expect(JSON.stringify(h.recorded())).not.toContain('Because 2(m+n).');
  });

  it('returns the ORIGINAL verdicts on a replay, not a fresh grading', async () => {
    // A retried request must be byte-identical to the response that was lost,
    // otherwise a slow cold start can change a student's marks.
    const original = { 'blank-1': { verdict: 'correct' } };
    const h = harness({
      recordCheck: async () => ({
        data: {
          check_id: 'c1',
          attempt_number: 1,
          verdicts: original,
          replayed: true,
        },
        error: null,
      }),
    });
    const res = await h.handler(post(validBody({ idempotencyKey: 'k' })));
    expect((await res.json()).items).toEqual(original);
  });
});

describe('seeded grading glue (wishlist #6)', () => {
  // The walk-level D8 guard lives in seeded-grading.test.ts; THIS pins the
  // handler half: seedVars on the stored meta actually reach the derivation
  // (seeded by versionId + the JWT sub), and the graded document is the
  // SUBSTITUTED one. A handler that forgot to derive would grade the typed
  // value against the literal template string and mark every student wrong.
  const seededDoc = {
    schemaVersion: 2,
    meta: {
      title: 'T',
      seedVars: [{ name: 'a', spec: { kind: 'int', min: 2, max: 9 } }],
    },
    sections: [
      {
        id: sectionId,
        title: 'S',
        rows: [
          {
            id: '99999999-9999-4999-8999-999999999999',
            columns: [
              {
                id: '88888888-8888-4888-8888-888888888888',
                blocks: [
                  {
                    id: '77777777-7777-4777-8777-777777777777',
                    type: 'fill_in_blank',
                    content: [
                      { type: 'text', text: 'Twice {a}: ' },
                      {
                        type: 'blank',
                        id: '66666666-6666-4666-8666-666666666666',
                        answer: '2*a',
                        answerType: 'numeric',
                        width: 6,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  async function checkWith(answer: string): Promise<Record<string, unknown>> {
    const h = harness({
      readVersion: async () => ({ data: { content: seededDoc }, error: null }),
    });
    const res = await h.handler(
      post(validBody({ responses: { blanks: { '66666666-6666-4666-8666-666666666666': answer } } })),
    );
    expect(res.status).toBe(200);
    return (await res.json()) as Record<string, unknown>;
  }

  it("grades against the STUDENT's derived value, not the template or another seed", async () => {
    const { deriveSeedValues } = await import('../src/sanitize/seedValues.js');
    const { serveSeed } = await import('../src/sanitize/serveSeed.js');
    const own = deriveSeedValues(
      [{ name: 'a', spec: { kind: 'int', min: 2, max: 9 } }],
      serveSeed(VERSION, STUDENT),
    );
    const right = await checkWith(String(2 * (own.a as number)));
    expect(
      (right.items as Record<string, { verdict: string }>)['66666666-6666-4666-8666-666666666666']?.verdict,
    ).toBe('correct');
    // The literal template expression must NOT be the accepted answer.
    const literal = await checkWith('2*a');
    expect(
      (literal.items as Record<string, { verdict: string }>)['66666666-6666-4666-8666-666666666666']?.verdict,
    ).toBe('incorrect');
  });
});

describe('the stale-version advisory (ruling S4-T5)', () => {
  it('omits currentVersionId while the served version is current', async () => {
    const h = harness({}, { isCurrent: true });
    const res = await h.handler(post(validBody()));
    expect(await res.json()).not.toHaveProperty('currentVersionId');
  });

  it('advertises the newer version WITHOUT refusing the check', async () => {
    // A mid-period republish must never break a check in progress: the student
    // keeps working against the version they were served, and the client
    // offers a non-destructive reload.
    const h = harness({}, { isCurrent: false });
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ currentVersionId: OTHER_VERSION });
  });
});

describe('jwtSubject', () => {
  it('reads the sub claim', () => {
    expect(jwtSubject(jwt('abc'))).toBe('abc');
  });

  it.each([['Bearer nonsense'], ['Bearer a.b'], ['']])(
    'returns null for a token it cannot read (%s)',
    (header) => {
      expect(jwtSubject(header)).toBeNull();
    },
  );

  it('refuses to identify a student it cannot name, rather than guessing', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = harness();
    const res = await h.handler(post(validBody(), { Authorization: 'Bearer a.b' }));
    expect(res.status).toBe(500);
    expect(h.recorded()).toHaveLength(0);
    spy.mockRestore();
  });
});

// -----------------------------------------------------------------------------
// B9 (eng-review 2026-08-06): solutions are transient — released, never stored.
// -----------------------------------------------------------------------------
describe('the solutions channel is absent from the persisted row (B9)', () => {
  it('releases solutions in the response and keeps them OUT of record_check', async () => {
    // The leak fixture: every solution populated with the RELEASABLE sentinel.
    const { RELEASABLE, STR, fullyLoadedDocument } = await import(
      '../src/fixtures/leakFixture.js'
    );
    const leakDoc = fullyLoadedDocument() as unknown as {
      sections: Array<{ id: string }>;
    };
    const h = harness({
      readVersion: async () => ({ data: { content: leakDoc }, error: null }),
    });

    const res = await h.handler(
      post(validBody({ sectionId: leakDoc.sections[0]!.id })),
    );
    expect(res.status).toBe(200);

    // Release fired — the scan below cannot pass vacuously.
    const responseJson = JSON.stringify(await res.json());
    expect(responseJson).toContain(RELEASABLE);

    // The persisted row: one record, carrying NO solution content and no
    // answer material. section_checks rows live ~400 days; every re-check
    // mints another — solutions riding along would multiply stored bytes for
    // a year-plus per formative loop (s4-audit missed-12).
    expect(h.recorded()).toHaveLength(1);
    const persisted = JSON.stringify(h.recorded());
    expect(persisted).not.toContain(RELEASABLE);
    expect(persisted).not.toContain(STR);
  });
});

// -----------------------------------------------------------------------------
// F4 — the server-derived lock (T1, OV#9)
// -----------------------------------------------------------------------------
describe('the lock is DERIVED from the stored document, never received', () => {
  it('passes locked=false for a `free` activity', async () => {
    const h = harness();
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(200);
    expect((h.recorded()[0] as { locked: boolean }).locked).toBe(false);
  });

  it('passes locked=true for a `locked` activity', async () => {
    const h = harness({}, { submissionMode: 'locked' });
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(200);
    expect((h.recorded()[0] as { locked: boolean }).locked).toBe(true);
  });

  it('IGNORES a client-sent lock flag entirely — the OV#8 reason this ruling exists', async () => {
    // A student's browser can omit any flag it is asked to send, so the flag
    // is not a control. Both directions are pinned: a client claiming
    // `locked: true` on a free activity gets false, and a client omitting it
    // (or sending false) on a locked activity still gets true.
    const free = harness();
    await free.handler(post({ ...validBody(), locked: true, lock: true }));
    expect((free.recorded()[0] as { locked: boolean }).locked).toBe(false);

    const strict = harness({}, { submissionMode: 'locked' });
    await strict.handler(post({ ...validBody(), locked: false, lock: false }));
    expect((strict.recorded()[0] as { locked: boolean }).locked).toBe(true);
  });

  it('maps the RPC refusal to 409 with its own code', async () => {
    const h = harness(
      {
        recordCheck: async () => ({
          data: null,
          error: { message: 'section_locked' },
        }),
      },
      { submissionMode: 'locked' },
    );
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(409);
    const body = (await res.json()) as { details?: { code?: string } };
    expect(body.details?.code).toBe('section_locked');
  });

  it('the refusal is NOT dressed as a rate limit or a server error', async () => {
    const h = harness(
      {
        recordCheck: async () => ({
          data: null,
          error: { message: 'section_locked' },
        }),
      },
      { submissionMode: 'locked' },
    );
    const res = await h.handler(post(validBody()));
    expect(res.status).not.toBe(429);
    expect(res.status).not.toBe(500);
  });

  it('a REPLAY of the locking check still succeeds — the RPC returns it, not a refusal', async () => {
    // The refusal lives inside record_check AFTER its replay lookup (OV#9).
    // Modelled here at the port: a replayed row comes back as data, and the
    // handler must return the original verdicts rather than a 409.
    const h = harness(
      {
        recordCheck: async () => ({
          data: {
            check_id: 'c1',
            attempt_number: 1,
            verdicts: { 'item-1': { verdict: 'correct' } },
            replayed: true,
          },
          error: null,
        }),
      },
      { submissionMode: 'locked' },
    );
    const res = await h.handler(post(validBody()));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Record<string, unknown> };
    expect(body.items['item-1']).toEqual({ verdict: 'correct' });
  });
});
