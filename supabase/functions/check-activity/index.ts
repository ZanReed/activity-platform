// =============================================================================
// check-activity — the section-check grading RPC (S4)
// -----------------------------------------------------------------------------
// THIN WIRING ONLY. Request handling, the authorization chain, validation,
// grading, the atomic-failure rule, idempotent replay, and the stale-version
// advisory all live in the tested grading bundle
// (packages/viewer/src/server/check-activity-handler.ts, pinned by the vitest
// suite there and by CI's bundle drift guard). This file only:
//
//   - reads the auto-injected env (no new secrets),
//   - implements CheckActivityDb, PracticeDb (mixed practice, 0066) and
//     DolPracticeDb (DoL targeted practice, 0072)
//     over plain fetch to PostgREST (createRestClient, review D5),
//   - passes _shared/cors.ts through the CorsKit port,
//   - recomputes this student's serve-time `ordering` permutation,
//   - serves the handler.
//
// ⚠ THIS FUNCTION KEEPS THE DEFAULT verify_jwt: TRUE. Only get-activity runs
// with --no-verify-jwt (its pre-auth meta branch is called with no
// Authorization header); a check is always made by a signed-in student, so the
// platform gate is a free first line of defense. Deploy with `pnpm deploy:check`
// and do NOT add --no-verify-jwt to it.
//
// TWO CLIENTS, AND THE DIFFERENCE MATTERS:
//   * asCaller()  — carries the student's JWT. Used for the authorization RPC
//                   so the DATABASE decides what they may check.
//   * admin       — service role. Used for the RAW document (answer keys
//                   included) and for record_check, which is service-role-only
//                   precisely because it accepts verdicts as an argument.
// The handler calls them in that order and never reads the document until the
// authorization RPC has succeeded.
// =============================================================================

import {
  computeServedOrderings,
  createCheckActivityHandler,
  createRestClient,
  type CheckActivityDb,
  type DolPracticeDb,
  type PracticeDb,
} from '../_shared/grading-server.bundle.js';
import {
  corsHeaders,
  errorResponse,
  handlePreflight,
  jsonResponse,
} from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// The database, over plain fetch to PostgREST (review D5): no supabase-js on
// this function's cold start, and no auth client (or its refresh timer) per
// request. createRestClient keeps postgrest-js's `{ data, error, status }`,
// which the handler and rpcStatus.ts read.
const admin = createRestClient({
  url: SUPABASE_URL,
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
});

/** A client that carries the caller's JWT, so the RPC runs AS the caller. */
function asCaller(authHeader: string) {
  return createRestClient({ url: SUPABASE_URL, apikey: SUPABASE_ANON_KEY, authorization: authHeader });
}

const db: CheckActivityDb = {
  async versionForCheck(authHeader, activityId, versionId) {
    // User-scoped: the RPC runs as the caller, so the DB enforces the rule
    // (authenticated + published + the version BELONGS to the activity).
    return await asCaller(authHeader)
      .rpc('get_activity_version_for_check', {
        p_activity_id: activityId,
        p_version_id: versionId,
      })
      .maybeSingle();
  },

  async videoSource(authHeader, activityId, versionId, videoId) {
    return await asCaller(authHeader).rpc('video_source', {
      p_activity_id: activityId,
      p_version_id: versionId,
      p_block_id: videoId,
    });
  },

  async recordPauseTry(args) {
    // jsonb result: its shape is the port's own (the handler validates it).
    return (await admin.rpc('record_video_pause_try', {
      p_student_id: args.studentId,
      p_activity_id: args.activityId,
      p_version_id: args.versionId,
      p_section_id: args.sectionId,
      p_block_id: args.blockId,
      p_correct: args.correct,
    })) as unknown as Awaited<ReturnType<CheckActivityDb['recordPauseTry']>>;
  },

  async readVersion(versionId) {
    // Service role: this is the RAW document. Only reached after the
    // authorization RPC above has succeeded.
    return await admin.select<{ content: unknown }>(
      'activity_versions', 'content', [['id', 'eq', versionId]], { maybeSingle: true });
  },

  async checkPhotos(checkId) {
    // Service role: the stored row, read back only for a check that named
    // photos, so the student hears which ones retention had removed (0094).
    return await admin.select<{ responses: unknown }>(
      'section_checks', 'responses', [['id', 'eq', checkId]], { maybeSingle: true });
  },

  async recordCheck(args) {
    // jsonb result: its shape is the port's own (the handler validates it).
    return (await admin
      .rpc('record_check', {
        p_student_id: args.studentId,
        p_activity_id: args.activityId,
        p_activity_version_id: args.versionId,
        p_section_id: args.sectionId,
        p_responses: args.responses,
        p_verdicts: args.verdicts,
        p_idempotency_key: args.idempotencyKey,
        // 0040. Derived by the handler from the STORED document's
        // meta.submissionMode — never sent by the client (T1).
        p_locked: args.locked,
        // 0059. The checked version's section count, derived by the handler
        // from the stored document (student-experience review D3).
        p_section_total: args.sectionTotal,
        // 0070 (D65). The DoL section's rules, derived by the handler from the
        // stored document; omitted for every other section so the defaults
        // (unlimited, no pass) apply.
        ...(args.dol
          ? {
              p_max_attempts: args.dol.maxAttempts,
              p_expected_attempt: args.dol.expectedAttempt,
              p_rubric_primary: args.dol.rubricPrimary,
              p_dol_primary_correct: args.dol.primaryCorrect,
            }
          : {}),
      })
      .single()) as unknown as Awaited<ReturnType<CheckActivityDb['recordCheck']>>;
  },

  async ownLatestChecks(authHeader, _studentId, versionId, sectionIds) {
    // RESTORE (S3), through my_latest_checks (0060) AS THE CALLER: the latest
    // attempt per requested section, own rows by auth.uid() in the SQL. Two
    // reasons it is an RPC and not a table select (Fable review, 2026-10-15):
    // a select returned EVERY attempt and PostgREST silently stops at
    // max_rows (F1); and "own rows" lived only in a `.eq` here, which no test
    // reached, while a class teacher's RLS policy admits students' rows (F6).
    // verify-0060 now proves the teacher case. `_studentId` (the same JWT
    // subject) stays in the port for the handler's own bookkeeping.
    return await asCaller(authHeader).rpc('my_latest_checks', {
      p_version_id: versionId,
      p_section_ids: sectionIds,
    });
  },

  async dolState(authHeader, args) {
    // 0070 (D65, DE-1): AS THE CALLER — keyed on auth.uid(), never the sub.
    // jsonb result: its shape is the port's own (the handler validates it).
    return (await asCaller(authHeader).rpc('my_dol_state', {
      p_activity_id: args.activityId,
      p_version_id: args.versionId,
      p_section_id: args.sectionId,
      p_rubric_primary: args.rubricPrimary,
    })) as unknown as Awaited<ReturnType<CheckActivityDb['dolState']>>;
  },
};

// MIXED PRACTICE (0066, D43 slice 2). The same two-client split: the
// session's authorization RPCs run AS THE CALLER; the snapshots (answer-key
// class, ER-4) and the verdict write are service role, and the handler reaches
// them only with a session id one of the caller RPCs has just authorized.
const practice: PracticeDb & DolPracticeDb = {
  async startMixedSession(authHeader, classId, start) {
    return await asCaller(authHeader).rpc('start_mixed_session', {
      p_class_id: classId,
      p_start: start,
    });
  },

  async mixedItemForCheck(authHeader, sessionId, seq) {
    return await asCaller(authHeader).rpc('mixed_item_for_check', {
      p_session_id: sessionId,
      p_seq: seq,
    });
  },

  async readSnapshots(sessionId, seq) {
    return (await admin.select(
      'mixed_session_items',
      'seq, document, row_values, position, retry_of',
      [['session_id', 'eq', sessionId], ...(seq !== undefined ? [['seq', 'eq', seq] as const] : [])],
      { order: 'seq' },
    )) as Awaited<ReturnType<PracticeDb['readSnapshots']>>;
  },

  async readAttempts(sessionId) {
    return (await admin.select('mixed_attempts', 'seq, correct, skipped, verdicts', [
      ['session_id', 'eq', sessionId],
    ])) as Awaited<ReturnType<PracticeDb['readAttempts']>>;
  },

  async recordAttempt(args) {
    // jsonb result: its shape is the port's own (the handler validates it).
    return (await admin
      .rpc('record_mixed_attempt', {
        p_student_id: args.studentId,
        p_session_id: args.sessionId,
        p_seq: args.seq,
        p_correct: args.correct,
        p_skipped: args.skipped,
        p_responses: args.responses,
        p_verdicts: args.verdicts,
      })) as unknown as Awaited<ReturnType<PracticeDb['recordAttempt']>>;
  },

  // D65 slice 2 (0072): the DoL pair on its own tables, the same split — the
  // caller RPCs authorize, the service-role reads only follow them.
  async startDolPractice(authHeader, activityId, versionId) {
    return await asCaller(authHeader).rpc('start_dol_practice', {
      p_activity_id: activityId,
      p_version_id: versionId,
    });
  },

  async dolItemForCheck(authHeader, sessionId, seq) {
    return await asCaller(authHeader).rpc('dol_practice_item_for_check', {
      p_session_id: sessionId,
      p_seq: seq,
    });
  },

  async readDolSnapshots(sessionId, seq) {
    return (await admin.select(
      'dol_practice_items',
      'seq, document, row_values',
      [['session_id', 'eq', sessionId], ...(seq !== undefined ? [['seq', 'eq', seq] as const] : [])],
      { order: 'seq' },
    )) as Awaited<ReturnType<DolPracticeDb['readDolSnapshots']>>;
  },

  async readDolAttempts(sessionId) {
    return (await admin.select('dol_practice_attempts', 'seq, correct, skipped, verdicts', [
      ['session_id', 'eq', sessionId],
    ])) as Awaited<ReturnType<DolPracticeDb['readDolAttempts']>>;
  },

  async recordDolAttempt(args) {
    // jsonb result: its shape is the port's own (the handler validates it).
    return (await admin
      .rpc('record_dol_practice_attempt', {
        p_student_id: args.studentId,
        p_session_id: args.sessionId,
        p_seq: args.seq,
        p_correct: args.correct,
        p_skipped: args.skipped,
        p_responses: args.responses,
        p_verdicts: args.verdicts,
      })) as unknown as Awaited<ReturnType<DolPracticeDb['recordDolAttempt']>>;
  },
};

Deno.serve(
  createCheckActivityHandler({
    db,
    practice,
    cors: { corsHeaders, errorResponse, handlePreflight, jsonResponse },
    // `ordering` is served permuted per student, and the wire carries no
    // `moved` flag — so the grader recomputes the permutation this student was
    // handed and reads "unchanged from what we served" as an untouched list.
    servedOrderings: ({ document, versionId, studentId, sectionId, seedKey }) =>
      computeServedOrderings(
        document as Parameters<typeof computeServedOrderings>[0],
        sectionId,
        versionId,
        studentId,
        seedKey,
      ),
  }),
);
