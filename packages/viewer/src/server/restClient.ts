// =============================================================================
// server/restClient.ts — the Edge Functions' database client, on plain fetch
// -----------------------------------------------------------------------------
// Review 2026-11-26 D5, the larger half. get-activity and check-activity built
// one to three supabase-js clients per request, which put all of supabase-js
// (fetched from esm.sh) on the cold start of the two hottest functions for a
// handful of PostgREST calls, and started an auth refresh timer per client
// until `autoRefreshToken: false` (the small half, a2b32cd9). photo-handoff and
// the sweep already call PostgREST with fetch; this is the same, shared.
//
// It reproduces exactly what the two functions used from the pinned
// postgrest-js (2.105.3), so the handlers and rpcStatus.ts (review B3) see the
// same `{ data, error, status }` they did:
//   * `error` is PostgREST's JSON body ({ message, code, details, hint }), or
//     `{ message: body }` when the body is not JSON; `status` is the HTTP one.
//   * `.single()` asks for `application/vnd.pgrst.object+json` (PostgREST
//     answers 406 PGRST116 unless exactly one row).
//   * `.maybeSingle()` takes an array result's one row, null for none, and a
//     406 PGRST116 error for more than one (postgrest-js does this client-side).
//   * a network failure, or a body that cannot be read or parsed, is a result
//     with `status: 0`, never a throw; a 404 with an empty body is a 204 with
//     no error, and a 404 whose body is an array is an empty 200.
//   * GET reads retry a 503 / 520 or a network failure up to 3 times (1 s,
//     2 s, 4 s), as postgrest-js does for idempotent methods.
// Bound by restClient.test.ts, which checks each of these against a fake fetch.
// =============================================================================

import type { FnName, ReturnsOf, RpcArgs } from '@activity/db-types/rpc';

/** PostgREST's error body, as postgrest-js passes it through. */
export interface RestError {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

export interface RestResult<T> {
  data: T | null;
  error: RestError | null;
  status: number;
}

/** One row of a row-set result (a scalar stays itself). */
type Row<R> = R extends (infer E)[] ? E : R;

/** What `.rpc()` returns: awaitable for the whole result, or narrowed to one
 * row, exactly as supabase-js's builder. */
export interface RestCall<R> extends PromiseLike<RestResult<R>> {
  single(): PromiseLike<RestResult<Row<R>>>;
  maybeSingle(): PromiseLike<RestResult<Row<R>>>;
}

/** A PostgREST filter: `eq` / `neq` on one column. */
export type Filter = readonly [column: string, op: 'eq' | 'neq', value: string | number];

export interface SelectOptions {
  /** `order=<column>` ascending. */
  order?: string;
  /** Zero or one row, as `.maybeSingle()`. */
  maybeSingle?: boolean;
}

export interface RestClient {
  rpc<F extends FnName>(fn: F, ...args: RpcArgs<F>): RestCall<ReturnsOf<F>>;
  select<T>(table: string, columns: string, filters: readonly Filter[], options?: SelectOptions): Promise<RestResult<T>>;
  upsert(table: string, row: object, onConflict: string): Promise<RestResult<null>>;
  delete(table: string, filters: readonly Filter[]): Promise<RestResult<null>>;
}

export interface RestClientConfig {
  /** The project URL (SUPABASE_URL). */
  url: string;
  /** The `apikey` header: the anon or the service key. */
  apikey: string;
  /** The `Authorization` header: `Bearer <service key>`, or the caller's own. */
  authorization: string;
  /** Injected in tests; the global fetch otherwise. */
  fetch?: typeof fetch;
  /** Injected in tests so a retry does not wait; real timers otherwise. */
  sleep?: (ms: number) => Promise<void>;
}

const OBJECT = 'application/vnd.pgrst.object+json';
const MAX_RETRIES = 3;
const RETRY_STATUS = new Set([503, 520]);

const tooMany = (n: number): RestError => ({
  code: 'PGRST116',
  details: `Results contain ${n} rows, ${OBJECT} requires 1 row`,
  hint: null,
  message: 'JSON object requested, multiple (or no) rows returned',
});

function networkError(e: unknown): RestError {
  const err = e as { name?: string; message?: string } | null;
  return { message: `${err?.name ?? 'FetchError'}: ${err?.message ?? String(e)}`, details: '', hint: '', code: '' };
}

const sleepFor = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createRestClient(config: RestClientConfig): RestClient {
  const base = `${config.url.replace(/\/+$/, '')}/rest/v1`;
  const doFetch = config.fetch ?? fetch;
  const sleep = config.sleep ?? sleepFor;

  async function send<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    opts: { body?: unknown; accept?: string; prefer?: string; maybeSingle?: boolean } = {},
  ): Promise<RestResult<T>> {
    const headers: Record<string, string> = { apikey: config.apikey, Authorization: config.authorization };
    // The schema, named as supabase-js names it (its default, `public`).
    if (method === 'GET') headers['Accept-Profile'] = 'public';
    else {
      headers['Content-Profile'] = 'public';
      headers['Content-Type'] = 'application/json';
    }
    if (opts.accept) headers.Accept = opts.accept;
    if (opts.prefer) headers.Prefer = opts.prefer;
    const init: RequestInit = { method, headers };
    if (opts.body !== undefined) init.body = JSON.stringify(opts.body);

    let res: Response | undefined;
    for (let attempt = 0; ; attempt++) {
      try {
        res = await doFetch(`${base}${path}`, init);
      } catch (e) {
        if (method === 'GET' && attempt < MAX_RETRIES) {
          await sleep(Math.min(1000 * 2 ** attempt, 30000));
          continue;
        }
        return { data: null, error: networkError(e), status: 0 };
      }
      if (method === 'GET' && attempt < MAX_RETRIES && RETRY_STATUS.has(res.status)) {
        await res.text();
        const after = res.headers.get('Retry-After');
        await sleep(after !== null ? Math.max(0, parseInt(after, 10) || 0) * 1000 : Math.min(1000 * 2 ** attempt, 30000));
        continue;
      }
      break;
    }

    // Reading the body can fail too (the connection drops mid-body, a proxy
    // answers 200 with HTML). postgrest-js reads it inside the same catch as
    // the fetch, so that is a status-0 result there and here, never a throw:
    // get-activity's cache writes are not wrapped, and a throw there would
    // turn a computed 200 into a 500.
    let body: string;
    try {
      body = await res.text();
    } catch (e) {
      return { data: null, error: networkError(e), status: 0 };
    }
    if (!res.ok) {
      let error: unknown;
      try {
        error = JSON.parse(body);
      } catch {
        // postgrest-js: a 404 with an empty body is "no content", not an error.
        if (res.status === 404 && body === '') return { data: null, error: null, status: 204 };
        return { data: null, error: { message: body }, status: res.status };
      }
      // postgrest-js: a 404 whose body is an array is an empty result.
      if (Array.isArray(error) && res.status === 404) return { data: [] as T, error: null, status: 200 };
      return { data: null, error: error as RestError | null, status: res.status };
    }
    let data: unknown;
    try {
      data = body === '' ? null : JSON.parse(body);
    } catch (e) {
      return { data: null, error: networkError(e), status: 0 };
    }
    if (opts.maybeSingle && Array.isArray(data)) {
      if (data.length > 1) return { data: null, error: tooMany(data.length), status: 406 };
      data = data.length === 1 ? data[0] : null;
    }
    return { data: data as T, error: null, status: res.status };
  }

  const query = (filters: readonly Filter[], extra: Record<string, string> = {}) => {
    const p = new URLSearchParams(extra);
    for (const [column, op, value] of filters) p.append(column, `${op}.${value}`);
    const s = p.toString();
    return s ? `?${s}` : '';
  };

  return {
    rpc(fn, ...args) {
      const path = `/rpc/${fn}`;
      const body = args[0] ?? {};
      const call = (accept?: string, maybeSingle?: boolean) => send<never>('POST', path, { body, accept, maybeSingle });
      return {
        then(onFulfilled, onRejected) {
          return call().then(onFulfilled, onRejected);
        },
        single: () => call(OBJECT),
        maybeSingle: () => call(undefined, true),
      };
    },

    select(table, columns, filters, options = {}) {
      // postgrest-js strips the whitespace from a select list; so does this.
      const extra: Record<string, string> = { select: columns.replace(/\s+/g, '') };
      if (options.order) extra.order = options.order;
      return send('GET', `/${table}${query(filters, extra)}`, { maybeSingle: options.maybeSingle });
    },

    upsert(table, row, onConflict) {
      return send('POST', `/${table}${query([], { on_conflict: onConflict })}`, {
        body: row,
        prefer: 'resolution=merge-duplicates',
      });
    },

    delete(table, filters) {
      return send('DELETE', `/${table}${query(filters)}`);
    },
  };
}
