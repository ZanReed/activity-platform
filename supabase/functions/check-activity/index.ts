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
//   - implements CheckActivityDb against real supabase-js clients,
//   - passes _shared/cors.ts through the CorsKit port,
//   - recomputes this student's serve-time `ordering` permutation,
//   - serves the handler.
//
// ⚠ THIS FUNCTION KEEPS THE DEFAULT verify_jwt: TRUE. It is NOT part of the
// no-verify-jwt trio (ingest-submission / get-feedback / get-activity). Those
// three are called with no Authorization header from published pages or the
// pre-auth interstitial; a check is always made by a signed-in student, so the
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

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  computeServedOrderings,
  createCheckActivityHandler,
  type CheckActivityDb,
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
      })
      .single();
  },
};

Deno.serve(
  createCheckActivityHandler({
    db,
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
