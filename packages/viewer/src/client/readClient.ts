// =============================================================================
// client/readClient.ts — the viewer's data source (S3 route)
// -----------------------------------------------------------------------------
// Talks to the get-activity Edge Function (S2). Dependency-injected the same
// way CheckService is: it takes a base URL, a token getter, and a fetch, so the
// viewer package stays free of supabase-js and every branch is testable without
// a network.
//
// Two pieces of real logic live here rather than in the route:
//
//  1. THE STALE-VERSION DANCE. Content URLs are version-keyed and served
//     `immutable`, so a republish is invisible until the viewer re-resolves.
//     The server answers a stale version_id with 404 + code 'stale_version' and
//     the CURRENT id; `load()` follows that once, automatically. Leaving this
//     to the route would mean every caller reimplements it, and the failure —
//     a student stuck on a version their teacher replaced — looks like a
//     caching bug rather than a missing retry.
//
//  2. AN ERROR TAXONOMY, not raw statuses. The failure-state matrix needs to
//     tell "sign in again" from "your teacher unpublished this" from "we are
//     offline", and a route branching on numeric codes would get that subtly
//     wrong. Every failure leaves here as a ViewerLoadError with a `kind` the
//     UI can switch on exhaustively.
// =============================================================================

import type { SanitizedActivityDocument } from '../sanitize/sanitized-types.js';

export type ViewerErrorKind =
  /** No session, or it expired. The student signs in and retries. */
  | 'unauthenticated'
  /** Signed in, but this activity is not published / not available to them. */
  | 'unavailable'
  /** The server could not serve this version's content (upgrade failure). */
  | 'unservable'
  /** The request never reached the server. */
  | 'offline'
  /** Anything else, including a malformed response. */
  | 'unknown';

export class ViewerLoadError extends Error {
  readonly kind: ViewerErrorKind;
  readonly status?: number;

  constructor(kind: ViewerErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ViewerLoadError';
    this.kind = kind;
    if (status !== undefined) this.status = status;
  }
}

/** Pre-auth metadata (ruling 3.2A): title + teacher name, nothing else. */
export interface ActivityMeta {
  title: string;
  teacherName: string | null;
}

export interface ServedActivity {
  activityId: string;
  versionId: string;
  versionNum: number;
  title: string;
  document: SanitizedActivityDocument;
}

export interface ReadClientOptions {
  /** Full URL of the get-activity function. */
  baseUrl: string;
  /** Current access token, or null when signed out. Called per request so a
   * refreshed token is picked up without rebuilding the client. */
  getAccessToken: () => Promise<string | null> | string | null;
  fetchImpl?: typeof fetch;
}

export interface ViewerReadClient {
  fetchMeta(activityId: string): Promise<ActivityMeta>;
  resolve(activityId: string): Promise<{ versionId: string; versionNum: number; title: string }>;
  fetchContent(activityId: string, versionId: string): Promise<ServedActivity>;
  /** resolve + fetchContent, following one stale-version redirect. */
  load(activityId: string): Promise<ServedActivity>;
}

interface ErrorBody {
  error?: string;
  details?: { code?: string; current_version_id?: string; detail?: string };
}

export function createReadClient(options: ReadClientOptions): ViewerReadClient {
  const doFetch = options.fetchImpl ?? fetch;

  async function request(
    url: string,
    init: { authenticated: boolean },
  ): Promise<unknown> {
    const headers: Record<string, string> = {};
    if (init.authenticated) {
      const token = await options.getAccessToken();
      if (!token) {
        throw new ViewerLoadError('unauthenticated', 'Not signed in');
      }
      headers.Authorization = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await doFetch(url, { headers });
    } catch {
      // Fetch rejects only on a transport failure — the student is offline or
      // the function is unreachable. NOT a 4xx/5xx, which resolve normally.
      throw new ViewerLoadError('offline', 'Could not reach the server');
    }

    if (response.ok) return await response.json();

    let body: ErrorBody = {};
    try {
      body = (await response.json()) as ErrorBody;
    } catch {
      // A non-JSON error body is still a real failure; fall through with the
      // status alone rather than masking it as a parse error.
    }

    // Attach the parsed body so load() can read `stale_version` without
    // re-reading a consumed response.
    const error = new ViewerLoadError(
      kindFor(response.status, body),
      body.error ?? `Request failed (${response.status})`,
      response.status,
    );
    (error as ViewerLoadError & { body?: ErrorBody }).body = body;
    throw error;
  }

  function kindFor(status: number, body: ErrorBody): ViewerErrorKind {
    if (status === 401) return 'unauthenticated';
    if (status === 404) return 'unavailable';
    if (body.details?.code === 'upgrade_failed') return 'unservable';
    if (status >= 500) return 'unservable';
    return 'unknown';
  }

  const url = (params: Record<string, string>) =>
    `${options.baseUrl}?${new URLSearchParams(params).toString()}`;

  return {
    async fetchMeta(activityId) {
      const data = (await request(url({ activity_id: activityId, meta: '1' }), {
        authenticated: false,
      })) as { title?: unknown; teacher_name?: unknown };
      return {
        title: typeof data.title === 'string' ? data.title : '',
        teacherName:
          typeof data.teacher_name === 'string' ? data.teacher_name : null,
      };
    },

    async resolve(activityId) {
      const data = (await request(url({ activity_id: activityId }), {
        authenticated: true,
      })) as { version_id?: unknown; version_num?: unknown; title?: unknown };
      if (typeof data.version_id !== 'string') {
        throw new ViewerLoadError('unknown', 'Malformed resolve response');
      }
      return {
        versionId: data.version_id,
        versionNum: typeof data.version_num === 'number' ? data.version_num : 0,
        title: typeof data.title === 'string' ? data.title : '',
      };
    },

    async fetchContent(activityId, versionId) {
      const data = (await request(
        url({ activity_id: activityId, version_id: versionId }),
        { authenticated: true },
      )) as {
        activity?: unknown;
        title?: unknown;
        version?: { id?: unknown; num?: unknown };
      };
      if (!data.activity || typeof data.activity !== 'object') {
        throw new ViewerLoadError('unknown', 'Malformed content response');
      }
      return {
        activityId,
        versionId,
        versionNum: typeof data.version?.num === 'number' ? data.version.num : 0,
        title: typeof data.title === 'string' ? data.title : '',
        document: data.activity as SanitizedActivityDocument,
      };
    },

    async load(activityId) {
      const resolved = await this.resolve(activityId);
      try {
        return await this.fetchContent(activityId, resolved.versionId);
      } catch (err) {
        // The teacher republished between our resolve and our fetch. The
        // server told us the new id; take it rather than showing an error for
        // something that is not wrong.
        const body = (err as { body?: ErrorBody }).body;
        const current = body?.details?.current_version_id;
        if (
          err instanceof ViewerLoadError &&
          body?.details?.code === 'stale_version' &&
          typeof current === 'string'
        ) {
          return await this.fetchContent(activityId, current);
        }
        throw err;
      }
    },
  };
}
