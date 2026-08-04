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
//   - implements the handler's GetActivityDb port against real supabase-js
//     clients (RPCs + activity_version_reads + activity_versions, plus the S7
//     analytics side-channel: write_version_census + the stale-rev cache GC),
//   - passes the _shared/cors.ts helpers through the CorsKit port,
//   - serves the handler.
//
// Deploy with `pnpm deploy:get-activity` (flag baked in). This function MUST
// run with `--no-verify-jwt`, exactly like ingest-submission/get-feedback: the
// META branch is called with NO Authorization header, so the platform's
// default verify_jwt gate would 401 it before this code runs. The authed
// branches do their own verification — the user-scoped RPC call fails with a
// PostgREST auth error on a bad/expired JWT, which the handler maps to 401.
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  createGetActivityHandler,
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

// Service-role client, shared across requests (stateless REST wrapper).
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const db: GetActivityDb = {
  async publicMeta(activityId) {
    // Anon client — get_activity_public_meta is the one anon-callable RPC
    // (postgres-owned DEFINER; 0017 documents the deliberate grant).
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    return await anonClient
      .rpc('get_activity_public_meta', { p_activity_id: activityId })
      .maybeSingle();
  },

  async publishedActivity(authHeader, activityId) {
    // User-scoped client: the RPC runs as the caller, so the DB enforces the
    // access rule (authenticated + published + not deleted) — not this file.
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    return await userClient
      .rpc('get_published_activity', { p_activity_id: activityId })
      .maybeSingle();
  },

  async readCache(versionId, sanitizerRev) {
    return await admin
      .from('activity_version_reads')
      .select('content')
      .eq('version_id', versionId)
      .eq('sanitizer_rev', sanitizerRev)
      .maybeSingle();
  },

  async readVersion(versionId) {
    return await admin
      .from('activity_versions')
      .select('content')
      .eq('id', versionId)
      .maybeSingle();
  },

  async upsertCache(row) {
    const { error } = await admin
      .from('activity_version_reads')
      .upsert(row, { onConflict: 'version_id,sanitizer_rev' });
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
    const { error } = await admin
      .from('activity_version_reads')
      .delete()
      .eq('version_id', versionId)
      .neq('sanitizer_rev', keepRev);
    return { error };
  },
};

Deno.serve(
  createGetActivityHandler({
    db,
    cors: { corsHeaders, errorResponse, handlePreflight, jsonResponse },
  }),
);
