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
//   - implements CheckActivityDb and PracticeDb (mixed practice, 0066)
//     against real supabase-js clients,
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
//   * userClient  — carries the student's JWT. Used for the authorization RPC
//                   so the DATABASE decides what they may check.
//   * admin       — service role. Used for the RAW document (answer keys
//                   included) and for record_check, which is service-role-only
//                   precisely because it accepts verdicts as an argument.
// The handler calls them in that order and never reads the document until the
// authorization RPC has succeeded.
// =============================================================================

// supabase-js is pinned EXACT, to the app's version (packages/app/package.json):
// a floating `@2` let each deploy resolve a different minor (audit 2026-10).
// Bump the two functions and the app together.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.3';
import {
  computeServedOrderings,
  createCheckActivityHandler,
  type CheckActivityDb,
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

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** A client that carries the caller's JWT, so the RPC runs AS the caller. */
function asCaller(authHeader: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

const db: CheckActivityDb = {
  async versionForCheck(authHeader, activityId, versionId) {
    // User-scoped: the RPC runs as the caller, so the DB enforces the rule
    // (authenticated + published + the version BELONGS to the activity).
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    return await userClient
      .rpc('get_activity_version_for_check', {
        p_activity_id: activityId,
        p_version_id: versionId,
      })
      .maybeSingle();
  },

  async readVersion(versionId) {
    // Service role: this is the RAW document. Only reached after the
    // authorization RPC above has succeeded.
    return await admin
      .from('activity_versions')
      .select('content')
      .eq('id', versionId)
      .maybeSingle();
  },

  async recordCheck(args) {
    return await admin
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
      })
      .single();
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
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    return await userClient.rpc('my_latest_checks', {
      p_version_id: versionId,
      p_section_ids: sectionIds,
    });
  },
};

// MIXED PRACTICE (0066, D43 slice 2). The same two-client split: the
// session's authorization RPCs run AS THE CALLER; the snapshots (answer-key
// class, ER-4) and the verdict write are service role, and the handler reaches
// them only with a session id one of the caller RPCs has just authorized.
const practice: PracticeDb = {
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
    let q = admin
      .from('mixed_session_items')
      .select('seq, document, row_values')
      .eq('session_id', sessionId);
    if (seq !== undefined) q = q.eq('seq', seq);
    return await q.order('seq');
  },

  async readAttempts(sessionId) {
    return await admin
      .from('mixed_attempts')
      .select('seq, correct, skipped, verdicts')
      .eq('session_id', sessionId);
  },

  async recordAttempt(args) {
    return await admin
      .rpc('record_mixed_attempt', {
        p_student_id: args.studentId,
        p_session_id: args.sessionId,
        p_seq: args.seq,
        p_correct: args.correct,
        p_skipped: args.skipped,
        p_responses: args.responses,
        p_verdicts: args.verdicts,
      });
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
    servedOrderings: ({ document, versionId, studentId, sectionId }) =>
      computeServedOrderings(
        document as { sections?: unknown[] },
        sectionId,
        versionId,
        studentId,
      ),
  }),
);
