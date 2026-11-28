// restClient.ts (review D5, the plain-fetch half): each behaviour the two Edge
// Functions relied on from postgrest-js 2.105.3, against a fake fetch.
import { describe, expect, it, vi } from 'vitest';
import { createRestClient } from '../src/server/restClient.js';

type Call = { url: string; init: RequestInit };

function fakeFetch(...replies: (Response | Error)[]) {
  const calls: Call[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    const next = replies.shift();
    if (!next) throw new Error('no reply left');
    if (next instanceof Error) throw next;
    return next;
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function client(f: typeof fetch) {
  return createRestClient({
    url: 'https://p.example/',
    apikey: 'ANON',
    authorization: 'Bearer CALLER',
    fetch: f,
    sleep: async () => {},
  });
}

const headersOf = (c: Call) => c.init.headers as Record<string, string>;

describe('rpc', () => {
  it('POSTs the arguments to /rest/v1/rpc/<name> with both keys, and returns data + status', async () => {
    const { fn, calls } = fakeFetch(json({ ok: true }));
    const r = await client(fn).rpc('my_dol_state', {
      p_activity_id: 'a', p_version_id: 'v', p_section_id: 's', p_rubric_primary: null,
    });
    expect(r).toEqual({ data: { ok: true }, error: null, status: 200 });
    expect(calls[0]!.url).toBe('https://p.example/rest/v1/rpc/my_dol_state');
    expect(calls[0]!.init.method).toBe('POST');
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({
      p_activity_id: 'a', p_version_id: 'v', p_section_id: 's', p_rubric_primary: null,
    });
    expect(headersOf(calls[0]!)).toMatchObject({
      apikey: 'ANON', Authorization: 'Bearer CALLER', 'Content-Type': 'application/json',
    });
    expect(headersOf(calls[0]!).Accept).toBeUndefined();
  });

  it('passes PostgREST\'s error body and HTTP status through (rpcStatus reads both)', async () => {
    const body = { code: '42501', message: 'Not available', details: null, hint: null };
    const { fn } = fakeFetch(json(body, 403));
    const r = await client(fn).rpc('get_activity_version_for_check', { p_activity_id: 'a', p_version_id: 'v' });
    expect(r).toEqual({ data: null, error: body, status: 403 });
  });

  it('a non-JSON error body becomes { message: body }', async () => {
    const { fn } = fakeFetch(new Response('upstream gone', { status: 502 }));
    const r = await client(fn).rpc('my_latest_checks', { p_version_id: 'v', p_section_ids: [] });
    expect(r).toEqual({ data: null, error: { message: 'upstream gone' }, status: 502 });
  });

  it('a network failure is a status-0 result, never a throw, and a POST is not retried', async () => {
    const { fn, calls } = fakeFetch(new TypeError('connection reset'));
    const r = await client(fn).rpc('record_check', {} as never);
    expect(r).toEqual({
      data: null,
      error: { message: 'TypeError: connection reset', details: '', hint: '', code: '' },
      status: 0,
    });
    expect(calls).toHaveLength(1);
  });

  it('.single() asks PostgREST for one object', async () => {
    const { fn, calls } = fakeFetch(json({ attempt_number: 2 }));
    const r = await client(fn).rpc('record_check', {} as never).single();
    expect(r.data).toEqual({ attempt_number: 2 });
    expect(headersOf(calls[0]!).Accept).toBe('application/vnd.pgrst.object+json');
  });

  it('.maybeSingle() takes the one row, null for none, and refuses two (PGRST116, 406)', async () => {
    const one = fakeFetch(json([{ version_id: 'v' }]));
    expect((await client(one.fn).rpc('get_published_activity', { p_activity_id: 'a' }).maybeSingle()).data)
      .toEqual({ version_id: 'v' });
    expect(headersOf(one.calls[0]!).Accept).toBeUndefined();

    const none = fakeFetch(json([]));
    expect(await client(none.fn).rpc('get_published_activity', { p_activity_id: 'a' }).maybeSingle())
      .toEqual({ data: null, error: null, status: 200 });

    const two = fakeFetch(json([{}, {}]));
    const r = await client(two.fn).rpc('get_published_activity', { p_activity_id: 'a' }).maybeSingle();
    expect(r.data).toBeNull();
    expect(r.status).toBe(406);
    expect(r.error?.code).toBe('PGRST116');
  });

  it('.maybeSingle() leaves a scalar (jsonb) result as it is', async () => {
    const { fn } = fakeFetch(json({ k: 1 }));
    expect((await client(fn).rpc('my_dol_state', {} as never).maybeSingle()).data).toEqual({ k: 1 });
  });

  it('a body that cannot be read or parsed is a status-0 result, never a throw', async () => {
    const html = fakeFetch(new Response('<html>proxy</html>', { status: 200 }));
    const r1 = await client(html.fn).rpc('write_version_census', {} as never);
    expect(r1.status).toBe(0);
    expect(r1.data).toBeNull();
    expect(r1.error?.message).toMatch(/SyntaxError/);

    const broken = new Response('x');
    Object.defineProperty(broken, 'text', { value: () => Promise.reject(new TypeError('body stream lost')) });
    const r2 = await client(fakeFetch(broken).fn).rpc('write_version_census', {} as never);
    expect(r2).toEqual({ data: null, error: { message: 'TypeError: body stream lost', details: '', hint: '', code: '' }, status: 0 });
  });

  it('keeps postgrest-js\'s two 404 cases: empty body → 204 no error, array body → empty 200', async () => {
    const empty = fakeFetch(new Response('', { status: 404 }));
    expect(await client(empty.fn).rpc('write_version_census', {} as never)).toEqual({ data: null, error: null, status: 204 });
    const arr = fakeFetch(json([], 404));
    expect(await client(arr.fn).rpc('write_version_census', {} as never)).toEqual({ data: [], error: null, status: 200 });
  });

  it('names the schema the way supabase-js does', async () => {
    const post = fakeFetch(json(null));
    await client(post.fn).rpc('write_version_census', {} as never);
    expect(headersOf(post.calls[0]!)['Content-Profile']).toBe('public');
    const get = fakeFetch(json([]));
    await client(get.fn).select('activity_versions', 'content', []);
    expect(headersOf(get.calls[0]!)['Accept-Profile']).toBe('public');
  });

  it('a 503 GET honours Retry-After', async () => {
    const waits: number[] = [];
    const { fn } = fakeFetch(new Response('', { status: 503, headers: { 'Retry-After': '2' } }), json([]));
    const c = createRestClient({ url: 'https://p.example', apikey: 'A', authorization: 'Bearer A', fetch: fn, sleep: async (ms) => { waits.push(ms); } });
    await c.select('activity_versions', 'content', []);
    expect(waits).toEqual([2000]);
  });

  it('an empty success body is null data', async () => {
    const { fn } = fakeFetch(new Response(null, { status: 204 }));
    expect(await client(fn).rpc('write_version_census', {} as never)).toEqual({ data: null, error: null, status: 204 });
  });
});

describe('tables', () => {
  it('select builds select, eq / neq filters and order, without whitespace in the column list', async () => {
    const { fn, calls } = fakeFetch(json([{ seq: 1 }]));
    const r = await client(fn).select('mixed_session_items', 'seq, document, row_values',
      [['session_id', 'eq', 'S'], ['seq', 'eq', 3]], { order: 'seq' });
    expect(r.data).toEqual([{ seq: 1 }]);
    const u = new URL(calls[0]!.url);
    expect(u.pathname).toBe('/rest/v1/mixed_session_items');
    expect(u.searchParams.get('select')).toBe('seq,document,row_values');
    expect(u.searchParams.get('session_id')).toBe('eq.S');
    expect(u.searchParams.get('seq')).toBe('eq.3');
    expect(u.searchParams.get('order')).toBe('seq');
    expect(calls[0]!.init.method).toBe('GET');
    expect(headersOf(calls[0]!)['Content-Type']).toBeUndefined();
  });

  it('select with maybeSingle narrows an array to its one row', async () => {
    const { fn } = fakeFetch(json([{ content: { a: 1 } }]));
    const r = await client(fn).select('activity_versions', 'content', [['id', 'eq', 'v']], { maybeSingle: true });
    expect(r.data).toEqual({ content: { a: 1 } });
  });

  it('a GET retries 503 / 520 and network failures up to three times, then answers', async () => {
    const { fn, calls } = fakeFetch(
      new Response('', { status: 503 }),
      new TypeError('reset'),
      new Response('', { status: 520 }),
      json([{ content: 1 }]),
    );
    const r = await client(fn).select('activity_versions', 'content', [], { maybeSingle: true });
    expect(r.data).toEqual({ content: 1 });
    expect(calls).toHaveLength(4);
  });

  it('a GET stops retrying after three and returns the last failure', async () => {
    const { fn, calls } = fakeFetch(...Array.from({ length: 4 }, () => new Response('{"message":"cache"}', { status: 503 })));
    const r = await client(fn).select('activity_versions', 'content', []);
    expect(r).toEqual({ data: null, error: { message: 'cache' }, status: 503 });
    expect(calls).toHaveLength(4);
  });

  it('upsert POSTs the row with on_conflict and merge-duplicates', async () => {
    const { fn, calls } = fakeFetch(new Response('', { status: 201 }));
    const r = await client(fn).upsert('activity_version_reads', { version_id: 'v' }, 'version_id,sanitizer_rev');
    expect(r).toEqual({ data: null, error: null, status: 201 });
    const u = new URL(calls[0]!.url);
    expect(u.searchParams.get('on_conflict')).toBe('version_id,sanitizer_rev');
    expect(headersOf(calls[0]!).Prefer).toBe('resolution=merge-duplicates');
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({ version_id: 'v' });
  });

  it('delete sends the filters', async () => {
    const { fn, calls } = fakeFetch(new Response(null, { status: 204 }));
    await client(fn).delete('activity_version_reads', [['version_id', 'eq', 'v'], ['sanitizer_rev', 'neq', 4]]);
    const u = new URL(calls[0]!.url);
    expect(calls[0]!.init.method).toBe('DELETE');
    expect(u.searchParams.get('version_id')).toBe('eq.v');
    expect(u.searchParams.get('sanitizer_rev')).toBe('neq.4');
  });
});

// Review D7 (2026-11-28): a connection that stops answering. The fake honours
// the request's signal exactly as fetch does, so this proves the limit fires
// at a real (small) value and becomes a named status-0 result, not a hang.
describe('time limit (D7)', () => {
  function hangingFetch() {
    const calls: RequestInit[] = [];
    const fn = ((_url: string, init: RequestInit) => {
      calls.push(init);
      return new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(init.signal!.reason));
      });
    }) as unknown as typeof fetch;
    return { fn, calls };
  }

  it('a hung call ends as a TimeoutError result, and a timed-out GET is not retried', async () => {
    const { fn, calls } = hangingFetch();
    const c = createRestClient({ url: 'https://p.example', apikey: 'A', authorization: 'Bearer A', fetch: fn, sleep: async () => {}, timeoutMs: 20 });
    const rpc = await c.rpc('record_check', {} as never);
    expect(rpc.status).toBe(0);
    expect(rpc.error?.message).toMatch(/^TimeoutError: /);
    const read = await c.select('activities', 'id', []);
    expect(read.status).toBe(0);
    expect(read.error?.message).toMatch(/^TimeoutError: /);
    expect(calls).toHaveLength(2);
  });

  it('every attempt carries its own signal, at the production limit by default', async () => {
    const { REQUEST_TIMEOUT_MS } = await import('../src/server/restClient.js');
    expect(REQUEST_TIMEOUT_MS).toBe(15_000);
    const { fn, calls } = fakeFetch(new Response('', { status: 503 }), json([]));
    await client(fn).select('activities', 'id', []);
    expect(calls).toHaveLength(2);
    expect(calls[0]!.init.signal).toBeInstanceOf(AbortSignal);
    expect(calls[1]!.init.signal).not.toBe(calls[0]!.init.signal);
  });
});
