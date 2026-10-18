// =============================================================================
// readClient.test.ts — the viewer's data source (S3 route)
// -----------------------------------------------------------------------------
// Weighted toward the two things the client exists to get right: the
// stale-version retry (a student stuck on a replaced version looks like a
// caching bug, not a missing retry) and the error taxonomy the failure-state
// UI switches on. A wrong `kind` sends a signed-in student to a sign-in screen,
// or tells a student with an unpublished activity that they are offline.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { ViewerLoadError, createReadClient } from '../src/index.js';

const BASE = 'https://edge.test/get-activity';
const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const V1 = 'bbbbbbbb-0000-4000-8000-000000000001';
const V2 = 'cccccccc-0000-4000-8000-000000000002';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function client(
  handler: (url: string, init?: RequestInit) => Promise<Response>,
  token: string | null = 'tok',
) {
  const calls: string[] = [];
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push(String(url));
    return handler(String(url), init);
  });
  return {
    calls,
    fetchImpl,
    api: createReadClient({
      baseUrl: BASE,
      getAccessToken: () => token,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    }),
  };
}

describe('meta (anonymous, ruling 3.2A)', () => {
  it('reads title + teacher name and sends NO Authorization header', async () => {
    let sentAuth: unknown = 'unset';
    const { api } = client(async (_url, init) => {
      sentAuth = (init?.headers as Record<string, string>)?.Authorization;
      return json(200, { title: 'Linear Systems', teacher_name: 'Kia Jafari' });
    });

    expect(await api.fetchMeta(ACTIVITY)).toEqual({
      title: 'Linear Systems',
      teacherName: 'Kia Jafari',
    });
    // The pre-auth screen must work for a signed-OUT student.
    expect(sentAuth).toBeUndefined();
  });

  it('works with no token at all', async () => {
    const { api } = client(
      async () => json(200, { title: 'T', teacher_name: null }),
      null,
    );
    await expect(api.fetchMeta(ACTIVITY)).resolves.toEqual({
      title: 'T',
      teacherName: null,
    });
  });
});

describe('the stale-version retry (a republish mid-load)', () => {
  it('follows the server’s current_version_id and returns the NEW content', async () => {
    const { api, calls } = client(async (url) => {
      if (url.includes('version_id=') === false) {
        return json(200, { version_id: V1, version_num: 1, title: 'T' });
      }
      if (url.includes(V1)) {
        return json(404, {
          error: 'Not the current version',
          details: { code: 'stale_version', current_version_id: V2 },
        });
      }
      return json(200, {
        title: 'T',
        version: { id: V2, num: 2 },
        activity: { schemaVersion: 2, sections: [] },
      });
    });

    const served = await api.load(ACTIVITY);
    expect(served.versionId).toBe(V2);
    expect(served.versionNum).toBe(2);
    // resolve → stale content → current content. It does NOT re-resolve.
    expect(calls).toHaveLength(3);
  });

  it('does not loop: a second stale answer surfaces as an error', async () => {
    const { api } = client(async (url) => {
      if (!url.includes('version_id=')) {
        return json(200, { version_id: V1, version_num: 1, title: 'T' });
      }
      return json(404, {
        error: 'Not the current version',
        details: { code: 'stale_version', current_version_id: V2 },
      });
    });
    await expect(api.load(ACTIVITY)).rejects.toBeInstanceOf(ViewerLoadError);
  });

  it('a plain 404 is NOT retried — it is unavailable', async () => {
    const { api, calls } = client(async (url) =>
      url.includes('version_id=')
        ? json(404, { error: 'Not available' })
        : json(200, { version_id: V1, version_num: 1, title: 'T' }),
    );
    await expect(api.load(ACTIVITY)).rejects.toMatchObject({ kind: 'unavailable' });
    expect(calls).toHaveLength(2);
  });
});

describe('error taxonomy (what the failure UI switches on)', () => {
  it('401 → unauthenticated', async () => {
    const { api } = client(async () => json(401, { error: 'Missing Authorization header' }));
    await expect(api.resolve(ACTIVITY)).rejects.toMatchObject({
      kind: 'unauthenticated',
    });
  });

  it('no token → unauthenticated, without a request', async () => {
    const { api, fetchImpl } = client(async () => json(200, {}), null);
    await expect(api.resolve(ACTIVITY)).rejects.toMatchObject({
      kind: 'unauthenticated',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('404 → unavailable (unpublished, deleted, or no access — no oracle)', async () => {
    const { api } = client(async () => json(404, { error: 'Not available' }));
    await expect(api.resolve(ACTIVITY)).rejects.toMatchObject({ kind: 'unavailable' });
  });

  it('upgrade_failed → unservable', async () => {
    const { api } = client(async () =>
      json(500, {
        error: 'Activity content cannot be served',
        details: { code: 'upgrade_failed', detail: 'v1 unsupported' },
      }),
    );
    await expect(api.fetchContent(ACTIVITY, V1)).rejects.toMatchObject({
      kind: 'unservable',
    });
  });

  it('a transport failure → offline, distinctly from any HTTP status', async () => {
    const { api } = client(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(api.resolve(ACTIVITY)).rejects.toMatchObject({ kind: 'offline' });
  });

  it('a non-JSON error body still fails with its status, not a parse error', async () => {
    const { api } = client(async () => new Response('<html>502</html>', { status: 502 }));
    const err = await api.resolve(ACTIVITY).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ViewerLoadError);
    expect((err as ViewerLoadError).kind).toBe('unservable');
    expect((err as ViewerLoadError).status).toBe(502);
  });

  it('a malformed 200 is an error, not a half-rendered worksheet', async () => {
    const { api } = client(async () => json(200, { title: 'T' })); // no `activity`
    await expect(api.fetchContent(ACTIVITY, V1)).rejects.toMatchObject({
      kind: 'unknown',
    });
  });
});

describe('auth wiring', () => {
  it('sends the CURRENT token on every authed request (refresh-safe)', async () => {
    const tokens = ['first', 'second'];
    const seen: string[] = [];
    const api = createReadClient({
      baseUrl: BASE,
      getAccessToken: () => tokens.shift() ?? null,
      fetchImpl: (async (_u: string, init?: RequestInit) => {
        seen.push((init?.headers as Record<string, string>).Authorization ?? '');
        return json(200, { version_id: V1, version_num: 1, title: 'T' });
      }) as unknown as typeof fetch,
    });
    await api.resolve(ACTIVITY);
    await api.resolve(ACTIVITY);
    expect(seen).toEqual(['Bearer first', 'Bearer second']);
  });
});

// =============================================================================
// Reopen without re-downloading (efficiency audit #9; TODOS item 3). The saved
// device copy is used only when resolve's version AND serve revision both match
// it; anything else downloads, and the content URL carries the serve revision
// so the browser's HTTP cache cannot hand back a copy served under older rules.
// =============================================================================
describe('reuse of the device copy (serve revision)', () => {
  const REV = '1.2.1.3-abc';
  const DOC = { schemaVersion: 2, sections: [] };
  const savedCopy = (versionId: string) => ({
    activityId: ACTIVITY,
    versionId,
    versionNum: 1,
    title: 'Old title',
    document: DOC as never,
    serveRev: REV,
  });
  const server = (serveRev: string | undefined) => async (url: string) =>
    url.includes('version_id=')
      ? json(200, { activity: DOC, title: 'T', version: { id: V1, num: 1 }, ...(serveRev ? { serve_rev: serveRev } : {}) })
      : json(200, { version_id: V1, version_num: 3, title: 'New title', ...(serveRev ? { serve_rev: serveRev } : {}) });

  it('same version + same serve revision: no content request, current title', async () => {
    const reuse = vi.fn((v: string, r: string) => (v === V1 && r === REV ? savedCopy(V1) : null));
    const { api, calls } = client(server(REV));
    const served = await api.load(ACTIVITY, { reuse });
    expect(reuse).toHaveBeenCalledWith(V1, REV);
    expect(calls).toHaveLength(1); // resolve only
    expect(served.document).toBe(DOC);
    expect(served.title).toBe('New title'); // renamed without a republish
    expect(served.versionNum).toBe(3);
  });

  it('a different serve revision downloads, and the URL carries the new one', async () => {
    const reuse = vi.fn(() => null); // the hook only matches REV-other
    const { api, calls } = client(server('9.9.9.new'));
    const served = await api.load(ACTIVITY, { reuse });
    expect(reuse).toHaveBeenCalledWith(V1, '9.9.9.new');
    expect(calls).toHaveLength(2);
    expect(calls[1]).toContain('serve_rev=9.9.9.new');
    expect(served.serveRev).toBe('9.9.9.new');
  });

  it('a server without serve revisions never reuses, and the URL is unchanged', async () => {
    const reuse = vi.fn(() => savedCopy(V1));
    const { api, calls } = client(server(undefined));
    await api.load(ACTIVITY, { reuse });
    expect(reuse).not.toHaveBeenCalled();
    expect(calls).toHaveLength(2);
    expect(calls[1]).not.toContain('serve_rev');
  });

  it('no hook (the Bank preview): always downloads', async () => {
    const { api, calls } = client(server(REV));
    await api.load(ACTIVITY);
    expect(calls).toHaveLength(2);
  });
});

describe('a base URL that already carries a query (the app pins the region, audit #14)', () => {
  it('appends the request parameters after it, keeping both', async () => {
    const calls: string[] = [];
    const api = createReadClient({
      baseUrl: `${BASE}?forceFunctionRegion=us-east-2`,
      getAccessToken: () => 'tok',
      fetchImpl: (async (url: string) => {
        calls.push(String(url));
        return String(url).includes('meta=1')
          ? json(200, { title: 'T', teacher_name: null })
          : json(200, { version_id: V1, version_num: 1, title: 'T' });
      }) as unknown as typeof fetch,
    });
    await api.fetchMeta(ACTIVITY);
    await api.resolve(ACTIVITY);
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      // One '?', and the server reads the request's own parameters.
      expect(call.split('?')).toHaveLength(2);
      const params = new URL(call).searchParams;
      expect(params.get('forceFunctionRegion')).toBe('us-east-2');
      expect(params.get('activity_id')).toBe(ACTIVITY);
    }
  });
});
