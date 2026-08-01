// =============================================================================
// client/httpCheckService.ts — the real CheckService (S3 route → S4 server)
// -----------------------------------------------------------------------------
// Implements the frozen port from check/wire.ts against the grading endpoint.
// Written before S4's RPC existed, on purpose: the wire module is the
// contract-freeze artifact, so building the client from it proved the contract
// was implementable and gave S4 a concrete consumer to satisfy.
//
// The mock (check/mock.ts) remains the test and /dev/viewer implementation;
// both satisfy the same interface, which is the point of the port.
//
// FAILURES ARE TYPED (S4 T8). Every failure leaves here as a CheckError with a
// `kind` the UI switches on exhaustively — the same posture readClient already
// takes for loading. That exists because the failures are NOT interchangeable:
// "your session expired", "you're offline", "this tab is out of date", and
// "the grader broke" each want a different sentence and a different button, and
// collapsing them into one "Couldn't check" leaves a student pressing Retry
// forever against a failure that retrying cannot fix.
// =============================================================================

import type {
  CheckRequest,
  CheckService,
  ReleasedFeedbackResult,
  SectionCheckResult,
} from '../check/wire.js';
import { CHECK_WIRE_VERSION } from '../check/wire.js';

export type CheckErrorKind =
  /** No session, or it expired. Re-auth, then the work is still here. */
  | 'unauthenticated'
  /** This activity/version/section is not available to this student. */
  | 'unavailable'
  /**
   * THE TAB IS STALE. The page was loaded before a wire bump and its requests
   * can no longer be understood. Retrying is futile — only a reload helps — so
   * this must never be shown as the generic "try again" state.
   */
  | 'stale_client'
  /** The student is checking faster than the ceiling allows. Retry later. */
  | 'rate_limited'
  /** The request never reached the server. Retry when back online. */
  | 'offline'
  /** The server failed to grade. Retrying is reasonable. */
  | 'server_error'
  /** Anything else, including a malformed response. */
  | 'unknown';

export class CheckError extends Error {
  readonly kind: CheckErrorKind;
  readonly status?: number;
  /** True when trying the same thing again could plausibly succeed. The UI
   * offers Retry on exactly these, so a student is never invited to repeat an
   * action that cannot work. */
  readonly retryable: boolean;

  constructor(kind: CheckErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'CheckError';
    this.kind = kind;
    if (status !== undefined) this.status = status;
    this.retryable =
      kind === 'offline' || kind === 'server_error' || kind === 'rate_limited';
  }
}

/** The extra fields the S4 response carries beyond the frozen wire result. */
export interface CheckSectionResponse extends SectionCheckResult {
  /** Server-derived, canonical. Present once the check is recorded. */
  attemptNumber?: number;
  /** Present ONLY when the student is working against a superseded version
   * (ruling S4-T5). The check still succeeded — this is an advisory. */
  currentVersionId?: string;
}

export interface HttpCheckServiceOptions {
  /** Full URL of the grading function. */
  checkUrl: string;
  /** Full URL of the released-feedback function (the get-feedback precedent). */
  feedbackUrl: string;
  getAccessToken: () => Promise<string | null> | string | null;
  fetchImpl?: typeof fetch;
}

/**
 * The shape `_shared/cors.ts` `errorResponse` actually produces:
 *
 *   { error: "human message", details?: { code: "machine_code" } }
 *
 * The code is NESTED under `details`, not top-level. This read used to be
 * `body.code`, which meant `wire_version_mismatch` never matched and a stale
 * tab fell through to the generic un-retryable 'unknown' — the student got a
 * dead end instead of "reload". Unit tests on both sides passed, because both
 * were written against the same wrong assumption about this shape; only the
 * live E2E saw the real bytes. The top-level fallbacks below are tolerated so a
 * future helper change cannot silently re-break the mapping.
 */
interface ErrorBody {
  error?: string;
  message?: string;
  code?: string;
  details?: { code?: string };
}

/** Map an HTTP failure onto the taxonomy. The server's `code` is authoritative
 * where it exists — status alone cannot separate "stale tab" from "bad
 * payload", since both are 400. */
export function checkErrorFor(status: number, body: ErrorBody): CheckError {
  const code = body.details?.code ?? body.code ?? '';
  if (code === 'wire_version_mismatch') {
    return new CheckError(
      'stale_client',
      'This page is out of date. Reload to keep checking.',
      status,
    );
  }
  if (code === 'rate_limited' || status === 429) {
    return new CheckError('rate_limited', 'Checking too quickly.', status);
  }
  if (status === 401 || status === 403) {
    return new CheckError('unauthenticated', 'Your session has expired.', status);
  }
  if (status === 404) {
    return new CheckError('unavailable', 'This activity is not available.', status);
  }
  if (status >= 500) {
    return new CheckError('server_error', 'The grader could not be reached.', status);
  }
  // Remaining 4xx: a malformed request. A student cannot fix it and retrying
  // will not help, so it is deliberately NOT retryable — it is our bug.
  return new CheckError(
    'unknown',
    body.error ?? body.message ?? `Check failed (${status})`,
    status,
  );
}

export function createHttpCheckService(
  options: HttpCheckServiceOptions,
): CheckService {
  const doFetch = options.fetchImpl ?? fetch;

  async function post(url: string, body: unknown): Promise<unknown> {
    const token = await options.getAccessToken();
    if (!token) {
      throw new CheckError('unauthenticated', 'Not signed in');
    }

    let response: Response;
    try {
      response = await doFetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch {
      // fetch only rejects when the request never got an answer at all.
      throw new CheckError('offline', 'Could not reach the server.');
    }

    if (!response.ok) {
      let parsed: ErrorBody = {};
      try {
        parsed = (await response.json()) as ErrorBody;
      } catch {
        // A non-JSON error body is not worth failing differently over.
      }
      throw checkErrorFor(response.status, parsed);
    }

    try {
      return await response.json();
    } catch {
      throw new CheckError('unknown', 'The server sent a response we could not read.');
    }
  }

  return {
    async checkSection(request: CheckRequest): Promise<SectionCheckResult> {
      const data = (await post(options.checkUrl, request)) as CheckSectionResponse;
      // A server on a different wire version than we sent. Same user-facing
      // meaning as the server's own rejection: this tab is out of date.
      if (data.wireVersion !== CHECK_WIRE_VERSION) {
        throw new CheckError(
          'stale_client',
          'This page is out of date. Reload to keep checking.',
        );
      }
      return data;
    },

    async fetchReleasedFeedback(activityId: string): Promise<ReleasedFeedbackResult> {
      const data = (await post(options.feedbackUrl, {
        activity_id: activityId,
      })) as ReleasedFeedbackResult;
      return {
        graded: data.graded === true,
        blocks: data.blocks ?? {},
      };
    },
  };
}
