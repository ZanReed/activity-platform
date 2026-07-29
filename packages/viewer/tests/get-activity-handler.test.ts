// =============================================================================
// get-activity-handler.test.ts — the read-API handler branch pins (S2)
// -----------------------------------------------------------------------------
// Closes the S2 review gap: the get-activity Edge Function's glue (mode
// routing, status mapping, rate limiting, cache fallbacks, headers) had zero
// automated coverage — only the one-shot manual live pass. The handler now
// lives in this package behind DI ports, so every observable branch is pinned
// here: a "fix" that turns the stale-version 404 into a 409 (making stale
// content cacheable), loosens the error→status regex, or drops a non-fatal
// fallback breaks a test, not a classroom.
//
// The pipeline internals (upgrade, sanitize, shuffle) have their own suites;
// these tests use them as REAL implementations — only the DB and CORS ports
// are faked — so the miss path also proves the handler actually strips
// answers before caching and serving.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { createEmptyDocument, upgradeActivityDocument } from '@activity/schema';
import {
  API_VERSION,
  META_MAX_PER_WINDOW,
  META_WINDOW_MS,
  SANITIZER_REV,
  createGetActivityHandler,
  createMetaRateLimiter,
  jwtSub,
  sanitizeActivityDocument,
} from '../src/index.js';
import type {
  CorsKit,
  GetActivityDb,
  SanitizedActivityDocument,
} from '../src/index.js';

// ---- Fakes ------------------------------------------------------------------

// A minimal CorsKit mirroring _shared/cors.ts shapes (body `{ error, details? }`,
// CORS marker header on every response) without its env read.
const CORS_MARKER = { 'x-test-cors': '1' };
const cors: CorsKit = {
  corsHeaders: () => ({ ...CORS_MARKER }),
  handlePreflight: (req) =>
    req.method === 'OPTIONS'
      ? new Response(null, { status: 204, headers: CORS_MARKER })
      : null,
  jsonResponse: (_req, body, init = {}) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: {
        ...CORS_MARKER,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    }),
  errorResponse: (req, status, message, details) =>
    cors.jsonResponse(
      req,
      { error: message, ...(details ? { details } : {}) },
      { status },
    ),
};

/** A db whose every method fails the test unless the test overrides it —
 * doubles as a "this branch must not touch the db further" assertion. */
function makeDb(overrides: Partial<GetActivityDb> = {}): GetActivityDb {
  const unexpected = (name: string) => () => {
    throw new Error(`unexpected db.${name} call`);
  };
  return {
    publicMeta: vi.fn(unexpected('publicMeta')),
    publishedActivity: vi.fn(unexpected('publishedActivity')),
    readCache: vi.fn(unexpected('readCache')),
    readVersion: vi.fn(unexpected('readVersion')),
    upsertCache: vi.fn(unexpected('upsertCache')),
    ...overrides,
  };
}

const ACTIVITY_ID = '11111111-2222-3333-4444-555555555555';
const VERSION_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const BASE = 'https://edge.test/get-activity';

const publishedRow = {
  version_id: VERSION_ID,
  version_num: 3,
  title: 'Linear Systems',
};

/** An unverified-but-well-formed JWT whose payload carries the given sub. */
function fakeJwt(sub: string): string {
  const payload = btoa(JSON.stringify({ sub }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${payload}.signature`;
}

function metaRequest(activityId = ACTIVITY_ID, ip?: string): Request {
  return new Request(`${BASE}?activity_id=${activityId}&meta=1`, {
    headers: ip ? { 'x-forwarded-for': ip } : {},
  });
}

function authedRequest(query: string, sub = 'student-1'): Request {
  return new Request(`${BASE}?${query}`, {
    headers: { Authorization: `Bearer ${fakeJwt(sub)}` },
  });
}

async function body(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

// The non-fatal fallbacks log deliberately; keep test output clean and let
// individual tests assert the logging happened.
let errorSpy: MockInstance<Parameters<typeof console.error>, void>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
});

// A valid current-version stored document for the miss path, carrying one
// answer-bearing blank so the sanitize step is observable end to end.
function storedDocWithSecret(): Record<string, unknown> {
  const doc = JSON.parse(JSON.stringify(createEmptyDocument({ title: 'T' })));
  doc.sections[0].rows = [
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
                { type: 'text', text: 'answer: ' },
                {
                  type: 'blank',
                  id: '66666666-6666-4666-8666-666666666666',
                  answer: 'SECRET_ANSWER',
                  width: 8,
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return doc;
}

/** A cached SANITIZED doc with one ordering block — the one shape whose serve
 * response varies by student, so the shuffle-seed glue is observable. */
function cachedOrderingDoc(): SanitizedActivityDocument {
  const items = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'].map(
    (text, i) => ({
      id: `item-${i}`,
      content: [{ type: 'text', text }],
    }),
  );
  return {
    schemaVersion: 2,
    meta: { title: 'T' },
    sections: [
      {
        id: 's1',
        rows: [
          {
            id: 'r1',
            columns: [
              {
                id: 'c1',
                blocks: [
                  {
                    id: 'ord-1',
                    type: 'ordering',
                    prompt: [{ type: 'text', text: 'order' }],
                    items,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  } as unknown as SanitizedActivityDocument;
}

function orderingItemIds(b: Record<string, unknown>): string[] {
  const doc = b.activity as {
    sections: Array<{
      rows: Array<{
        columns: Array<{ blocks: Array<{ items: Array<{ id: string }> }> }>;
      }>;
    }>;
  };
  return doc.sections[0]!.rows[0]!.columns[0]!.blocks[0]!.items.map(
    (item) => item.id,
  );
}

// ---- Request plumbing -------------------------------------------------------

describe('request plumbing', () => {
  it('short-circuits OPTIONS via the CORS preflight helper', async () => {
    const handler = createGetActivityHandler({ db: makeDb(), cors });
    const res = await handler(new Request(BASE, { method: 'OPTIONS' }));
    expect(res.status).toBe(204);
  });

  it('rejects non-GET methods with 405', async () => {
    const handler = createGetActivityHandler({ db: makeDb(), cors });
    const res = await handler(new Request(BASE, { method: 'POST' }));
    expect(res.status).toBe(405);
    expect((await body(res)).error).toBe('Method not allowed');
  });

  it('rejects a malformed activity_id with 400 before any db work', async () => {
    const handler = createGetActivityHandler({ db: makeDb(), cors });
    const res = await handler(
      new Request(`${BASE}?activity_id=not-a-uuid&meta=1`),
    );
    expect(res.status).toBe(400);
    expect((await body(res)).error).toBe('activity_id must be a UUID');
  });

  it('every response carries the CORS headers', async () => {
    const handler = createGetActivityHandler({ db: makeDb(), cors });
    const res = await handler(new Request(BASE, { method: 'POST' }));
    expect(res.headers.get('x-test-cors')).toBe('1');
  });
});

// ---- META branch ------------------------------------------------------------

describe('META branch (anonymous, ruling 3.2A)', () => {
  it('serves exactly title + teacher_name, no-cache', async () => {
    const db = makeDb({
      publicMeta: vi.fn(async () => ({
        data: { title: 'Linear Systems', teacher_name: 'Kia Jafari' },
        error: null,
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(metaRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-cache');
    expect(await body(res)).toEqual({
      api_version: API_VERSION,
      title: 'Linear Systems',
      teacher_name: 'Kia Jafari',
    });
    expect(db.publicMeta).toHaveBeenCalledWith(ACTIVITY_ID);
  });

  it('maps an RPC error to a generic 500 (no internals leak)', async () => {
    const db = makeDb({
      publicMeta: vi.fn(async () => ({
        data: null,
        error: { message: 'connection refused at 10.0.0.7' },
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(metaRequest());
    expect(res.status).toBe(500);
    expect((await body(res)).error).toBe('Lookup failed');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('maps a missing row to 404 Not available', async () => {
    const db = makeDb({
      publicMeta: vi.fn(async () => ({ data: null, error: null })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(metaRequest());
    expect(res.status).toBe(404);
    expect((await body(res)).error).toBe('Not available');
  });

  it('429s one IP past the school-safe ceiling without touching the db, and keeps serving other IPs', async () => {
    let calls = 0;
    const db = makeDb({
      publicMeta: vi.fn(async () => {
        calls++;
        return { data: { title: 'T', teacher_name: null }, error: null };
      }),
    });
    const handler = createGetActivityHandler({ db, cors, now: () => 1_000_000 });
    for (let i = 0; i < META_MAX_PER_WINDOW; i++) {
      expect((await handler(metaRequest(ACTIVITY_ID, '10.0.0.1'))).status).toBe(
        200,
      );
    }
    const limited = await handler(metaRequest(ACTIVITY_ID, '10.0.0.1'));
    expect(limited.status).toBe(429);
    expect((await body(limited)).error).toBe('Too many requests');
    expect(calls).toBe(META_MAX_PER_WINDOW);
    // A classroom on another NAT is unaffected.
    expect((await handler(metaRequest(ACTIVITY_ID, '10.0.0.2'))).status).toBe(
      200,
    );
  });

  it('takes only the FIRST x-forwarded-for hop as the client IP', async () => {
    const db = makeDb({
      publicMeta: vi.fn(async () => ({
        data: { title: 'T', teacher_name: null },
        error: null,
      })),
    });
    const handler = createGetActivityHandler({ db, cors, now: () => 1_000_000 });
    for (let i = 0; i < META_MAX_PER_WINDOW; i++) {
      await handler(metaRequest(ACTIVITY_ID, '10.0.0.1, 172.16.0.9'));
    }
    // Same first hop, different proxy chain — still the same bucket.
    const limited = await handler(metaRequest(ACTIVITY_ID, '10.0.0.1, 172.16.0.10'));
    expect(limited.status).toBe(429);
  });
});

describe('createMetaRateLimiter', () => {
  it('slides its window — old hits expire after META_WINDOW_MS', () => {
    let t = 0;
    const limited = createMetaRateLimiter(() => t);
    for (let i = 0; i < META_MAX_PER_WINDOW; i++) {
      expect(limited('ip')).toBe(false);
    }
    expect(limited('ip')).toBe(true);
    t += META_WINDOW_MS + 1;
    expect(limited('ip')).toBe(false);
  });
});

// ---- Auth + RESOLVE ---------------------------------------------------------

describe('auth gate + RESOLVE branch', () => {
  it('401s a missing Authorization header before any db work', async () => {
    const handler = createGetActivityHandler({ db: makeDb(), cors });
    const res = await handler(new Request(`${BASE}?activity_id=${ACTIVITY_ID}`));
    expect(res.status).toBe(401);
    expect((await body(res)).error).toBe('Missing Authorization header');
  });

  it.each([
    ['invalid JWT: signature is invalid', 401],
    ['JWT expired', 401],
    ['bad auth token', 401],
    ['permission denied for table foo', 500],
  ])('maps RPC error %j to %i', async (message, status) => {
    const db = makeDb({
      publishedActivity: vi.fn(async () => ({
        data: null,
        error: { message },
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(`activity_id=${ACTIVITY_ID}`));
    expect(res.status).toBe(status);
    expect((await body(res)).error).toBe(message);
  });

  it('maps the RPC "Not available" raise to a 404 with the canonical message', async () => {
    const db = makeDb({
      publishedActivity: vi.fn(async () => ({
        data: null,
        error: { message: 'Not available' },
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(`activity_id=${ACTIVITY_ID}`));
    expect(res.status).toBe(404);
    expect((await body(res)).error).toBe('Not available');
  });

  it('404s an empty RPC result (no oracle: same as unpublished)', async () => {
    const db = makeDb({
      publishedActivity: vi.fn(async () => ({ data: null, error: null })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(`activity_id=${ACTIVITY_ID}`));
    expect(res.status).toBe(404);
    expect((await body(res)).error).toBe('Not available');
  });

  it('resolves the current version, served no-cache', async () => {
    const db = makeDb({
      publishedActivity: vi.fn(async () => ({
        data: publishedRow,
        error: null,
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(
      authedRequest(`activity_id=${ACTIVITY_ID}`),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-cache');
    expect(await body(res)).toEqual({
      api_version: API_VERSION,
      activity_id: ACTIVITY_ID,
      version_id: VERSION_ID,
      version_num: 3,
      title: 'Linear Systems',
    });
  });
});

// ---- CONTENT branch ---------------------------------------------------------

function contentDb(overrides: Partial<GetActivityDb> = {}): GetActivityDb {
  return makeDb({
    publishedActivity: vi.fn(async () => ({ data: publishedRow, error: null })),
    ...overrides,
  });
}

const contentQuery = `activity_id=${ACTIVITY_ID}&version_id=${VERSION_ID}`;

describe('CONTENT branch', () => {
  it('400s a malformed version_id', async () => {
    const handler = createGetActivityHandler({ db: contentDb(), cors });
    const res = await handler(
      authedRequest(`activity_id=${ACTIVITY_ID}&version_id=nope`),
    );
    expect(res.status).toBe(400);
    expect((await body(res)).error).toBe('version_id must be a UUID');
  });

  it('404s a stale version_id with the re-resolve envelope — NEVER a cacheable 200', async () => {
    const handler = createGetActivityHandler({ db: contentDb(), cors });
    const stale = '00000000-0000-4000-8000-000000000000';
    const res = await handler(
      authedRequest(`activity_id=${ACTIVITY_ID}&version_id=${stale}`),
    );
    expect(res.status).toBe(404);
    const b = await body(res);
    expect(b.error).toBe('Not the current version');
    expect(b.details).toEqual({
      code: 'stale_version',
      current_version_id: VERSION_ID,
    });
  });

  it('serves a cache hit without reading the version row, private+immutable', async () => {
    const db = contentDb({
      readCache: vi.fn(async () => ({
        data: { content: cachedOrderingDoc() },
        error: null,
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(contentQuery));
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe(
      'private, max-age=31536000, immutable',
    );
    const b = await body(res);
    expect(b.api_version).toBe(API_VERSION);
    expect(b.activity_id).toBe(ACTIVITY_ID);
    expect(b.title).toBe('Linear Systems');
    expect(b.version).toEqual({
      id: VERSION_ID,
      num: 3,
      schema_version: 2,
    });
    expect(db.readCache).toHaveBeenCalledWith(VERSION_ID, SANITIZER_REV);
    expect(db.readVersion).not.toHaveBeenCalled();
    expect(db.upsertCache).not.toHaveBeenCalled();
  });

  it('shuffle seed glue: same student reloads identically; another student differs; authored order not served', async () => {
    const db = contentDb({
      readCache: vi.fn(async () => ({
        data: { content: cachedOrderingDoc() },
        error: null,
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const a1 = orderingItemIds(await body(await handler(authedRequest(contentQuery, 'student-a'))));
    const a2 = orderingItemIds(await body(await handler(authedRequest(contentQuery, 'student-a'))));
    const b1 = orderingItemIds(await body(await handler(authedRequest(contentQuery, 'student-b'))));
    const authored = ['item-0', 'item-1', 'item-2', 'item-3', 'item-4', 'item-5'];
    expect(a1).toEqual(a2); // reload never reshuffles
    expect(b1).not.toEqual(a1); // per-student seed reaches the shuffle
    expect(a1).not.toEqual(authored); // the authored order (the key) is never served
    expect([...a1].sort()).toEqual(authored); // permutation, not mutation
  });

  it('cache read failure is non-fatal: logs and falls through to the source of truth', async () => {
    const db = contentDb({
      readCache: vi.fn(async () => ({
        data: null,
        error: { message: 'relation gone' },
      })),
      readVersion: vi.fn(async () => ({
        data: { content: storedDocWithSecret() },
        error: null,
      })),
      upsertCache: vi.fn(async () => ({ error: null })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(contentQuery));
    expect(res.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith(
      '[get-activity] cache read failed:',
      expect.anything(),
    );
  });

  it('cache miss: upgrades, SANITIZES (the secret never reaches the wire), and upserts the sanitized artifact', async () => {
    const stored = storedDocWithSecret();
    const db = contentDb({
      readCache: vi.fn(async () => ({ data: null, error: null })),
      readVersion: vi.fn(async () => ({ data: { content: stored }, error: null })),
      upsertCache: vi.fn(async () => ({ error: null })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(contentQuery));
    expect(res.status).toBe(200);
    const wire = JSON.stringify(await body(res));
    expect(wire).not.toContain('SECRET_ANSWER');
    // The upserted cache row is the sanitized artifact under the current rev.
    expect(db.upsertCache).toHaveBeenCalledTimes(1);
    const row = (db.upsertCache as ReturnType<typeof vi.fn>).mock
      .calls[0]![0] as {
      version_id: string;
      sanitizer_rev: string;
      schema_version: number;
      content: unknown;
    };
    expect(row.version_id).toBe(VERSION_ID);
    expect(row.sanitizer_rev).toBe(SANITIZER_REV);
    expect(row.schema_version).toBe(2);
    expect(JSON.stringify(row.content)).not.toContain('SECRET_ANSWER');
    // The exact pipeline: parse-with-defaults (upgrade), then sanitize.
    expect(row.content).toEqual(
      sanitizeActivityDocument(upgradeActivityDocument(stored).doc),
    );
  });

  it('version read failure → 500 Version read failed', async () => {
    const db = contentDb({
      readCache: vi.fn(async () => ({ data: null, error: null })),
      readVersion: vi.fn(async () => ({
        data: null,
        error: { message: 'boom' },
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(contentQuery));
    expect(res.status).toBe(500);
    expect((await body(res)).error).toBe('Version read failed');
  });

  it('unservable content → 500 with code upgrade_failed and the UpgradeError detail', async () => {
    const db = contentDb({
      readCache: vi.fn(async () => ({ data: null, error: null })),
      readVersion: vi.fn(async () => ({
        data: { content: { schemaVersion: 1, legacy: true } },
        error: null,
      })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(contentQuery));
    expect(res.status).toBe(500);
    const b = await body(res);
    expect(b.error).toBe('Activity content cannot be served');
    expect(b.details).toMatchObject({ code: 'upgrade_failed' });
    expect(db.upsertCache).not.toHaveBeenCalled();
  });

  it('cache upsert failure is non-fatal: the computed response still ships', async () => {
    const db = contentDb({
      readCache: vi.fn(async () => ({ data: null, error: null })),
      readVersion: vi.fn(async () => ({
        data: { content: storedDocWithSecret() },
        error: null,
      })),
      upsertCache: vi.fn(async () => ({ error: { message: 'conflict' } })),
    });
    const handler = createGetActivityHandler({ db, cors });
    const res = await handler(authedRequest(contentQuery));
    expect(res.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith(
      '[get-activity] cache upsert failed:',
      expect.anything(),
    );
  });
});

// ---- jwtSub -----------------------------------------------------------------

describe('jwtSub (shuffle seed only — never authorization)', () => {
  it('reads sub from a well-formed token, with or without the Bearer prefix', () => {
    expect(jwtSub(`Bearer ${fakeJwt('user-42')}`)).toBe('user-42');
    expect(jwtSub(fakeJwt('user-42'))).toBe('user-42');
  });

  it('returns null on garbage, a missing payload, bad base64, or a non-string sub', () => {
    expect(jwtSub('Bearer just-a-string')).toBeNull();
    expect(jwtSub('Bearer ')).toBeNull();
    expect(jwtSub('Bearer a.!!!not-base64!!!.c')).toBeNull();
    const numericSub = `h.${btoa(JSON.stringify({ sub: 42 }))}.s`;
    expect(jwtSub(numericSub)).toBeNull();
  });
});
