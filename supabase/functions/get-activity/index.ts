// =============================================================================
// get-activity — the viewer read API (S2: rulings 1B/4A/TV4-A/3.2A)
// -----------------------------------------------------------------------------
// THIN WIRING ONLY. All request handling — mode routing (anonymous META /
// authed RESOLVE / authed CONTENT), status mapping, rate limiting, the
// upgrade→sanitize→cache pipeline, serve-time shuffles, cache headers — lives
// in the tested viewer-server bundle (packages/viewer/src/server/
// get-activity-handler.ts, pinned by the vitest suite there and CI's bundle
// drift guard). This file only:
//
//   - reads the auto-injected env (SUPABASE_URL / SUPABASE_ANON_KEY /
//     SUPABASE_SERVICE_ROLE_KEY — no new secrets),
//   - implements the handler's GetActivityDb port over plain fetch to
//     PostgREST (createRestClient, review D5; RPCs + activity_version_reads + activity_versions, plus the S7
//     analytics side-channel: write_version_census + the stale-rev cache GC),
//   - passes the _shared/cors.ts helpers through the CorsKit port,
//   - serves the handler.
//
// Deploy with `pnpm deploy:get-activity` (flag baked in). This function MUST
// run with `--no-verify-jwt` — the only function that does (supabase/config.toml
// is the record): the META branch is called with NO Authorization header, so the platform's
// default verify_jwt gate would 401 it before this code runs. The authed
// branches do their own verification — the user-scoped RPC call fails with a
// PostgREST auth error on a bad/expired JWT, which the handler maps to 401.
// =============================================================================

import {
  createGetActivityHandler,
  createRestClient,
  type GetActivityDb,
} from '../_shared/viewer-server.bundle.js';
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
// which the handler and rpcStatus.ts read. Three identities:
//   * admin   — the service key, shared across requests;
//   * anon    — the anon key, for the two anon-callable meta RPCs;
//   * caller  — the anon key + the caller's own Authorization header, so the
//               RPC runs AS the caller and the database enforces the rule.
const admin = createRestClient({
  url: SUPABASE_URL,
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
});
const anon = createRestClient({
  url: SUPABASE_URL,
  apikey: SUPABASE_ANON_KEY,
  authorization: `Bearer ${SUPABASE_ANON_KEY}`,
});
const asCaller = (authHeader: string) =>
  createRestClient({ url: SUPABASE_URL, apikey: SUPABASE_ANON_KEY, authorization: authHeader });

const db: GetActivityDb = {
  async publicMeta(activityId) {
    // get_activity_public_meta is an anon-callable RPC (postgres-owned
    // DEFINER; 0017 documents the deliberate grant).
    return await anon
      .rpc('get_activity_public_meta', { p_activity_id: activityId })
      .maybeSingle();
  },

  async classMeta(joinCode) {
    // get_class_public_meta joined the anon-RPC roster at 0030 (the join
    // gate's pre-auth class-name lookup; verify-0028 §A pins the roster at
    // exactly two).
    return await anon
      .rpc('get_class_public_meta', { p_join_code: joinCode })
      .maybeSingle();
  },

  async publishedActivity(authHeader, activityId) {
    // As the caller: the database enforces the access rule (authenticated +
    // published + not deleted), not this file.
    return await asCaller(authHeader)
      .rpc('get_published_activity', { p_activity_id: activityId })
      .maybeSingle();
  },

  async readCache(versionId, sanitizerRev) {
    return await admin.select<{ content: unknown }>(
      'activity_version_reads',
      'content',
      [['version_id', 'eq', versionId], ['sanitizer_rev', 'eq', sanitizerRev]],
      { maybeSingle: true },
    );
  },

  async readVersion(versionId) {
    return await admin.select<{ content: unknown }>(
      'activity_versions',
      'content',
      [['id', 'eq', versionId]],
      { maybeSingle: true },
    );
  },

  async upsertCache(row) {
    // `content` is the sanitized document (unknown to the port; jsonb here).
    const { error } = await admin.upsert('activity_version_reads', row, 'version_id,sanitizer_rev');
    return { error };
  },

  async writeCensus(versionId, census) {
    // ONE atomic RPC for both census tables (0026): a half-written census is
    // worse than none, and the handler treats this call's success as the
    // signal that it may cache the version.
    const { error } = await admin.rpc('write_version_census', {
      p_version_id: versionId,
      p_counts: census.counts,
      p_items: census.items,
    });
    return { error };
  },

  async deleteStaleCache(versionId, keepRev) {
    // The exact half of the read-cache GC: this version is now cached under
    // keepRev, so any row it has under a different rev is unreachable.
    const { error } = await admin.delete('activity_version_reads', [
      ['version_id', 'eq', versionId],
      ['sanitizer_rev', 'neq', keepRev],
    ]);
    return { error };
  },

  async dolState(authHeader, args) {
    // 0070 (D65, DE-1): AS THE CALLER — the student's own DoL state, keyed on
    // auth.uid() in the SQL. Only reached for a document that has a DoL.
    // jsonb result: its shape is the port's own (the handler validates it).
    return (await asCaller(authHeader).rpc('my_dol_state', {
      p_activity_id: args.activityId,
      p_version_id: args.versionId,
      p_section_id: args.sectionId,
      p_rubric_primary: args.rubricPrimary,
    })) as unknown as Awaited<ReturnType<GetActivityDb['dolState']>>;
  },
};

Deno.serve(
  createGetActivityHandler({
    db,
    cors: { corsHeaders, errorResponse, handlePreflight, jsonResponse },
  }),
);
