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
  /**
   * THIS SECTION IS ALREADY CHECKED AND LOCKED (activity flow modes, T1). The
   * activity's `submissionMode` is `locked`, the server found a recorded check
   * for this (student, version, section), and refused a second one. Like
   * 'stale_client' and 'malformed_document' this must NEVER be shown as "try
   * again": there is no unlock in v1 — not for the student, not for the
   * teacher — so a retry cannot ever succeed. It is also the ONLY way a second
   * device learns about a lock it never saw.
   */
  | 'locked'
  /**
   * THE STORED ACTIVITY IS BROKEN (B8/D10). The server's walk integrity gate
   * refused to grade a structurally broken document. Nothing the student does
   * fixes it — not retrying, not reloading — so this must never fall into the
   * retryable server_error bucket its 500 status would otherwise land in.
   */
  | 'malformed_document'
  /** The request never reached the server. Retry when back online. */
  | 'offline'
  /** The server failed to grade. Retrying is reasonable. */
  | 'server_error'
  /** Anything else, including a malformed response. */
  | 'unknown';

export class CheckError extends Error {
  readonly kind: CheckErrorKind;
  readonly status?: number;
  // NO `retryable` field, deliberately (A15, 2026-08-06): it was derived here,
  // copied into SectionStatus, persisted — and read by nothing. A comment
  // claiming "the UI offers Retry on exactly these" described UI that never
  // existed (s4-retro finding 9). `kind` is the whole vocabulary; whichever
  // slice builds a real retry decision derives it from `kind` at the point of
  // use, WITH the consumer that makes it true.

  constructor(kind: CheckErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'CheckError';
    this.kind = kind;
    if (status !== undefined) this.status = status;
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

/** One row of get_my_released_feedback (0034 §E), as PostgREST returns it. */
export interface ReleasedFeedbackRow {
  block_id: string;
  criteria: unknown;
  general_feedback: string | null;
  graded_at: string;
  attempt_number: number;
  activity_version_id: string;
  has_grader: boolean;
  stale: boolean;
}

export interface HttpCheckServiceOptions {
  /** Full URL of the grading function. */
  checkUrl: string;
  /**
   * How to read released teacher feedback. INJECTED rather than a URL, because
   * unlike checking, the readback is not an Edge Function at all: 0034 made it
   * `get_my_released_feedback`, a plain PostgREST RPC (G5), and the app already
   * owns a client that handles auth headers and token refresh for those. The
   * viewer package stays out of the PostgREST wire format.
   *
   * ⚠ TOMBSTONE: this replaced `feedbackUrl`, which pointed at `get-feedback` —
   * a function that was DELETED at S9 Drop 3 and never worked before that
   * (every success return passed its arguments to jsonResponse swapped, so the
   * body served was the literal 200). Nothing here is ported from it.
   *
   * Omitted ⇒ nothing is ever released to this student, which is the correct
   * behavior for the mock and print harnesses that have no server at all.
   */
  releasedFeedback?: (activityId: string) => Promise<ReleasedFeedbackRow[]>;
  getAccessToken: () => Promise<string | null> | string | null;
  fetchImpl?: typeof fetch;
}

/** Normalize one PostgREST row into the wire shape, defensively: a widened or
 *  half-broken row must degrade to "no feedback", never to a render crash on
 *  the student's worksheet. */
function toBlockFeedback(row: ReleasedFeedbackRow) {
  const criteria = Array.isArray(row.criteria) ? row.criteria : [];
  return {
    feedbackText: row.general_feedback ?? undefined,
    criteria: criteria.flatMap((c) => {
      const item = c as Record<string, unknown>;
      const earned = Number(item.earned);
      const maxPoints = Number(item.maxPoints);
      if (!Number.isFinite(earned) || !Number.isFinite(maxPoints)) return [];
      return [{
        criterionId: String(item.criterionId ?? ''),
        earned,
        maxPoints,
        feedbackText: typeof item.feedback === 'string' ? item.feedback : undefined,
      }];
    }),
    attemptNumber: row.attempt_number,
    activityVersionId: row.activity_version_id,
    stale: row.stale === true,
    hasGrader: row.has_grader === true,
  };
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
  // Matched on CODE, not on 409 alone: the code is what the RPC raises, and a
  // bare status would fold any future conflict into a message that promises no
  // retry will ever work.
  if (code === 'section_locked') {
    return new CheckError(
      'locked',
      'This section is already checked and locked.',
      status,
    );
  }
  // BEFORE the status branches, like wire_version_mismatch above: the server
  // sends this as a 500, and the `status >= 500` arm below would otherwise
  // dress it as retryable server_error (the D29 amendment — the code must
  // not land unmapped).
  if (code === 'malformed_document') {
    return new CheckError(
      'malformed_document',
      'This activity has a problem on our side.',
      status,
    );
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

    /**
     * NEVER THROWS (G14, and the one CRITICAL row in this slice's test plan).
     * Released feedback is the only network call this slice adds to the
     * student's read path, and the offline-reopen guarantee that S9 Drop 5
     * made true for the first time must survive it failing. A student whose
     * feedback call dies gets a worksheet with no feedback card — never a
     * broken worksheet.
     */
    async fetchReleasedFeedback(activityId: string): Promise<ReleasedFeedbackResult> {
      if (!options.releasedFeedback) return { graded: false, blocks: {} };
      try {
        const rows = await options.releasedFeedback(activityId);
        if (!Array.isArray(rows) || rows.length === 0) {
          return { graded: false, blocks: {} };
        }
        const blocks: ReleasedFeedbackResult['blocks'] = {};
        for (const row of rows) {
          if (row?.block_id) blocks[row.block_id] = toBlockFeedback(row);
        }
        return { graded: Object.keys(blocks).length > 0, blocks };
      } catch {
        return { graded: false, blocks: {} };
      }
    },
  };
}
