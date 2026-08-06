// =============================================================================
// server/check-activity-handler.ts — the section-check request handler (S4 T4)
// -----------------------------------------------------------------------------
// The transport layer over `gradeSection`. Same shape as get-activity-handler:
// the handler never touches supabase-js or Deno, it consumes injected ports, so
// the Deno entry point is thin wiring and every branch below is unit-testable.
//
// THE ORDER OF OPERATIONS IS THE SECURITY DESIGN, not bureaucracy:
//
//   preflight ─► method ─► auth present ─► AUTHORIZATION CHAIN ─► validate
//        ─► load raw doc ─► grade ─► record ─► respond
//                                        │
//   The chain runs BEFORE the document is fetched, and it runs as the CALLER
//   (the user's JWT is passed through) so the DATABASE decides, not this file.
//   It proves three things at once: the caller is authenticated, the activity
//   is published and not deleted, and the requested version BELONGS to that
//   activity. That last one is not a formality — solutions are returned for
//   every block in a checked section, and "responses ⊆ section" is vacuously
//   true for an EMPTY responses map, so without the parentage check a request
//   carrying a foreign versionId would come back with that activity's entire
//   solution set. The eng review's outside voice found this; it is the reason
//   the handler resolves authorization before it reads anything.
//
// The raw document is read with the SERVICE-ROLE client, and it must only ever
// be read after the chain above has passed. `activity_versions.content` is the
// unsanitized document — answer keys included — so the ordering here is the
// difference between a grading service and an answer-key API.
// =============================================================================

import { UpgradeError, upgradeActivityDocument } from '@activity/schema';
import {
  CHECK_WIRE_VERSION,
  type CheckRequest,
  type SectionCheckResult,
  type SectionResponses,
} from '../check/wire.js';
import { gradeSection, SectionNotFoundError } from './grading/index.js';
import type { CorsKit, DbResult } from './get-activity-handler.js';
import { jwtSub } from './jwt.js';
import { UUID_RE } from './uuid.js';

// UUID_RE is imported (server/uuid.ts, G2): this file's strict shape is now
// THE shape — the read handler adopted it rather than staying looser.

/** Hard ceiling on a single check request. A section is a handful of questions;
 * anything approaching this is not a worksheet. Enforced before parsing so a
 * huge body is never materialized into objects. */
const MAX_BODY_BYTES = 256 * 1024;

/** Hard ceiling on item count across all response categories. */
const MAX_ITEMS = 500;

/** Longest single free-text answer we will store. An essay block is long; a
 * megabyte is an attack on the row, not an answer. */
const MAX_FREE_TEXT_LENGTH = 100_000;

// ---- Ports ------------------------------------------------------------------

export interface VersionForCheckRow {
  version_id: string;
  version_num: number;
  is_current: boolean;
  current_version_id: string;
}

export interface RecordCheckResult {
  check_id: string;
  attempt_number: number;
  verdicts: unknown;
  replayed: boolean;
}

export interface CheckActivityDb {
  /** `get_activity_version_for_check` as the CALLER — the authorization chain.
   * The user's Authorization header is passed through so the DB enforces the
   * rule; this handler never decides who may check what. */
  versionForCheck(
    authHeader: string,
    activityId: string,
    versionId: string,
  ): Promise<DbResult<VersionForCheckRow>>;
  /** Raw (unsanitized) version content, SERVICE ROLE. Only ever called after
   * versionForCheck has succeeded. */
  readVersion(versionId: string): Promise<DbResult<{ content: unknown }>>;
  /** `record_check`, SERVICE ROLE (the RPC is not callable by authenticated —
   * it takes verdicts as an argument). */
  recordCheck(args: {
    studentId: string;
    activityId: string;
    versionId: string;
    sectionId: string;
    responses: SectionResponses;
    verdicts: SectionCheckResult['items'];
    idempotencyKey: string | null;
  }): Promise<DbResult<RecordCheckResult>>;
}

export interface CheckActivityHandlerDeps {
  db: CheckActivityDb;
  cors: CorsKit;
  /** Recomputes the serve-time `ordering` permutation for this student, so the
   * grader can tell an untouched list from a deliberate arrangement. Injected
   * because it needs the same seeded shuffle the read path applied. */
  servedOrderings?: (args: {
    document: unknown;
    versionId: string;
    studentId: string;
    sectionId: string;
  }) => Record<string, string[]>;
}

// ---- Request validation -----------------------------------------------------
// Deliberately hand-written rather than a schema library: this runs on every
// check, the shape is a handful of string-keyed maps, and the failure messages
// below are the ones a client developer reads. Each rejection is a 400 — a
// malformed request is never graded, and never recorded.

export interface ValidationFailure {
  message: string;
  code: string;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((v) => typeof v === 'string');
}

function isStringArrayRecord(
  value: unknown,
): value is Record<string, string[]> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every(
    (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  );
}

function isNestedStringRecord(
  value: unknown,
): value is Record<string, Record<string, string>> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every(isStringRecord);
}

function countItems(responses: SectionResponses): number {
  return (
    Object.keys(responses.blanks).length +
    Object.keys(responses.choices).length +
    Object.keys(responses.matches).length +
    Object.keys(responses.orderings).length +
    Object.keys(responses.freeText).length +
    Object.keys(responses.graphs).length
  );
}

/** Validate a parsed body into a CheckRequest, or explain why not. */
export function validateCheckRequest(
  body: unknown,
): { ok: true; request: CheckRequest } | { ok: false; failure: ValidationFailure } {
  const fail = (message: string, code: string) =>
    ({ ok: false as const, failure: { message, code } });

  if (body === null || typeof body !== 'object') {
    return fail('Body must be a JSON object', 'malformed_body');
  }
  const b = body as Record<string, unknown>;

  // The wire version is checked FIRST and reported distinctly: a mismatch means
  // a stale open tab, not a broken client, and the viewer maps this code to
  // "refresh to continue" rather than its generic failure state.
  if (b.wireVersion !== CHECK_WIRE_VERSION) {
    return fail(
      `Unsupported wire version ${String(b.wireVersion)}; expected ${CHECK_WIRE_VERSION}`,
      'wire_version_mismatch',
    );
  }
  if (typeof b.activityId !== 'string' || !UUID_RE.test(b.activityId)) {
    return fail('activityId must be a UUID', 'bad_activity_id');
  }
  if (typeof b.versionId !== 'string' || !UUID_RE.test(b.versionId)) {
    return fail('versionId must be a UUID', 'bad_version_id');
  }
  if (typeof b.sectionId !== 'string' || b.sectionId.length === 0) {
    return fail('sectionId is required', 'bad_section_id');
  }
  if (b.idempotencyKey !== undefined && typeof b.idempotencyKey !== 'string') {
    return fail('idempotencyKey must be a string', 'bad_idempotency_key');
  }

  const r = b.responses;
  if (r === null || typeof r !== 'object' || Array.isArray(r)) {
    return fail('responses must be an object', 'bad_responses');
  }
  const raw = r as Record<string, unknown>;
  const responses: SectionResponses = {
    blanks: {},
    choices: {},
    matches: {},
    orderings: {},
    freeText: {},
    graphs: {},
  };

  if (raw.blanks !== undefined) {
    if (!isStringRecord(raw.blanks)) {
      return fail('responses.blanks must map id → string', 'bad_blanks');
    }
    responses.blanks = raw.blanks;
  }
  if (raw.choices !== undefined) {
    if (!isStringArrayRecord(raw.choices)) {
      return fail('responses.choices must map id → string[]', 'bad_choices');
    }
    responses.choices = raw.choices;
  }
  if (raw.matches !== undefined) {
    if (!isNestedStringRecord(raw.matches)) {
      return fail('responses.matches must map id → {item → target}', 'bad_matches');
    }
    responses.matches = raw.matches;
  }
  if (raw.orderings !== undefined) {
    if (!isStringArrayRecord(raw.orderings)) {
      return fail('responses.orderings must map id → string[]', 'bad_orderings');
    }
    responses.orderings = raw.orderings;
  }
  if (raw.freeText !== undefined) {
    if (!isStringRecord(raw.freeText)) {
      return fail('responses.freeText must map id → string', 'bad_free_text');
    }
    for (const text of Object.values(raw.freeText)) {
      if (text.length > MAX_FREE_TEXT_LENGTH) {
        return fail('A free-text answer is too long', 'free_text_too_long');
      }
    }
    responses.freeText = raw.freeText;
  }
  if (raw.graphs !== undefined) {
    if (raw.graphs === null || typeof raw.graphs !== 'object') {
      return fail('responses.graphs must be an object', 'bad_graphs');
    }
    // Graph work is shape-checked by the grader, which dispatches on the
    // SERVED interaction and refuses work that disagrees with it. Validating
    // the geometry twice would duplicate that authority in two places.
    responses.graphs = raw.graphs as SectionResponses['graphs'];
  }

  if (countItems(responses) > MAX_ITEMS) {
    return fail('Too many items in one check', 'too_many_items');
  }

  return {
    ok: true,
    request: {
      wireVersion: CHECK_WIRE_VERSION,
      activityId: b.activityId,
      versionId: b.versionId,
      sectionId: b.sectionId,
      responses,
    },
  };
}

// jwtSub is imported (server/jwt.ts, G2) — this file's byte-identical
// jwtSubject copy is gone; see the leaf for the no-verification reasoning.

// ---- The handler -------------------------------------------------------------

export function createCheckActivityHandler(
  deps: CheckActivityHandlerDeps,
): (req: Request) => Promise<Response> {
  const { db, cors } = deps;

  return async function handleCheckActivity(req: Request): Promise<Response> {
    const preflight = cors.handlePreflight(req);
    if (preflight) return preflight;
    if (req.method !== 'POST') {
      return cors.errorResponse(req, 405, 'Method not allowed');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return cors.errorResponse(req, 401, 'Missing Authorization header');
    }

    // Size ceiling before parsing: a huge body must never become objects.
    const declared = Number(req.headers.get('content-length') ?? '0');
    if (declared > MAX_BODY_BYTES) {
      return cors.errorResponse(req, 413, 'Request too large');
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return cors.errorResponse(req, 400, 'Body must be valid JSON', {
        code: 'malformed_body',
      });
    }

    const validated = validateCheckRequest(body);
    if (!validated.ok) {
      return cors.errorResponse(req, 400, validated.failure.message, {
        code: validated.failure.code,
      });
    }
    const request = validated.request;
    const idempotencyKey =
      typeof (body as { idempotencyKey?: unknown }).idempotencyKey === 'string'
        ? ((body as { idempotencyKey: string }).idempotencyKey)
        : null;

    // ---- The authorization chain, as the CALLER ---------------------------
    const { data: version, error: authError } = await db.versionForCheck(
      authHeader,
      request.activityId,
      request.versionId,
    );
    if (authError) {
      const msg = authError.message ?? '';
      // 'Not available' is the RPC's single no-oracle message for missing /
      // unpublished / deleted / WRONG-PARENT. Deliberately indistinguishable.
      const status = msg.includes('Not available')
        ? 404
        : /JWT|token|auth/i.test(msg)
          ? 401
          : 500;
      if (status === 500) {
        console.error('[check-activity] authorization RPC error:', authError);
      }
      return cors.errorResponse(
        req,
        status,
        status === 404 ? 'Not available' : msg,
      );
    }
    if (!version) return cors.errorResponse(req, 404, 'Not available');

    const studentId = jwtSub(authHeader);
    if (!studentId) {
      // The RPC accepted the token, so this is a malformed-but-valid JWT we
      // cannot key a row by. A 500 is honest: it is our problem, not theirs.
      console.error('[check-activity] authorized request carried no sub claim');
      return cors.errorResponse(req, 500, 'Could not identify the student');
    }

    // ---- Load the RAW document (service role, only now) --------------------
    const { data: versionRow, error: readError } = await db.readVersion(
      request.versionId,
    );
    if (readError || !versionRow) {
      console.error('[check-activity] version read failed:', readError);
      return cors.errorResponse(req, 500, 'Could not load the activity');
    }

    let upgraded;
    try {
      upgraded = upgradeActivityDocument(versionRow.content);
    } catch (err) {
      if (err instanceof UpgradeError) {
        console.error('[check-activity] upgrade failed:', err);
        return cors.errorResponse(req, 500, 'Could not load the activity', {
          code: 'upgrade_failed',
        });
      }
      throw err;
    }

    // ---- Grade -------------------------------------------------------------
    let result: SectionCheckResult;
    try {
      result = gradeSection({
        document: upgraded.doc as never,
        sectionId: request.sectionId,
        responses: request.responses,
        servedOrderings: deps.servedOrderings?.({
          document: upgraded.doc,
          versionId: request.versionId,
          studentId,
          sectionId: request.sectionId,
        }),
      });
    } catch (err) {
      if (err instanceof SectionNotFoundError) {
        // The client asked about a section this version does not have — a
        // stale tab or a bad payload, not a grading failure.
        return cors.errorResponse(req, 400, 'Unknown section', {
          code: 'unknown_section',
        });
      }
      // A real grading bug. Fail the WHOLE check and write nothing: partial
      // verdicts would be worse than none, and a guessed one worse still. The
      // context line is what turns "a student says checking is broken" into a
      // findable defect.
      console.error(
        '[check-activity] grading failed',
        JSON.stringify({
          activityId: request.activityId,
          versionId: request.versionId,
          sectionId: request.sectionId,
          itemCount: countItems(request.responses),
        }),
        err,
      );
      return cors.errorResponse(req, 500, 'Could not check this section', {
        code: 'grading_failed',
      });
    }

    // ---- Record (atomic with the response the student is about to see) -----
    const { data: recorded, error: recordError } = await db.recordCheck({
      studentId,
      activityId: request.activityId,
      versionId: request.versionId,
      sectionId: request.sectionId,
      responses: request.responses,
      verdicts: result.items,
      idempotencyKey,
    });
    if (recordError) {
      const msg = recordError.message ?? '';
      if (msg.includes('rate_limited')) {
        return cors.errorResponse(req, 429, 'Too many checks — slow down', {
          code: 'rate_limited',
        });
      }
      // Nothing was written, so nothing is half-done; the student retries and
      // gets a complete check. Returning verdicts we failed to record would
      // make the screen and the teacher's view disagree.
      console.error('[check-activity] record_check failed:', recordError);
      return cors.errorResponse(req, 500, 'Could not save this check', {
        code: 'record_failed',
      });
    }

    // A replay returns the verdicts of the ORIGINAL check, so a retried
    // request is byte-identical to the response that was lost in transit.
    const items =
      recorded?.replayed && recorded.verdicts
        ? (recorded.verdicts as SectionCheckResult['items'])
        : result.items;

    return cors.jsonResponse(req, {
      ...result,
      items,
      attemptNumber: recorded?.attempt_number,
      // The stale-version advisory (ruling S4-T5): the student keeps working
      // against the version they were served — a mid-period republish never
      // breaks a check — and the client offers a non-destructive reload.
      ...(version.is_current
        ? {}
        : { currentVersionId: version.current_version_id }),
    });
  };
}
