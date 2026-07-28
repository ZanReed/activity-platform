// =============================================================================
// get-activity — the viewer read API (S2: rulings 1B/4A/TV4-A/3.2A)
// -----------------------------------------------------------------------------
// The student viewer's data source. Three GET modes on one function:
//
//   1. META (anonymous, rate-limited — ruling 3.2A):
//        GET ?activity_id=<uuid>&meta=1
//      → { title, teacher_name } and NOTHING else — the pre-auth interstitial
//        contract ("Mrs. Jafari's 'Linear Systems'" + "use your @district.org
//        account"). Same data any published page already shows publicly.
//
//   2. RESOLVE (authenticated):
//        GET ?activity_id=<uuid>
//      → { activity_id, version_id, version_num, title } for the CURRENT
//        published version. Served `no-cache` so a republish is visible on the
//        next open (revalidate, don't re-download — same posture as the R2
//        live alias).
//
//   3. CONTENT (authenticated):
//        GET ?activity_id=<uuid>&version_id=<uuid>
//      → the UPGRADED (4A) + SANITIZED (TV4-A) document for that version, plus
//        per-student serve-time shuffles. The URL is version-keyed, so the
//        response is served `private, max-age=31536000, immutable` — the
//        browser never refetches a version it has. Only the CURRENT version is
//        served (a stale version_id 404s with code 'stale_version'; the viewer
//        re-resolves), so a republish invalidates by changing the URL, never
//        by expiring a cache.
//
// Pipeline (content mode): get_published_activity RPC as the CALLER (the DB
// enforces auth + published-only; draft content is unreachable here) →
// durable per-version cache lookup in activity_version_reads keyed by
// (version_id, SANITIZER_REV) → on miss: read the version row (service role),
// upgradeActivityDocument, sanitizeActivityDocument, upsert the cache row →
// applyServeShuffles seeded `${version_id}:${user_id}` (deterministic: reloads
// never reshuffle; the cached artifact stays student-independent).
//
// Access rule (S2 decision 2): ANY authenticated user (student or teacher) may
// read the published current version of a non-deleted activity — the R2
// link-share model behind sign-in. Classes gate identity (the 13+ assertion),
// not activity access.
//
// Deploy with `pnpm deploy:get-activity` (flag baked in). This function MUST
// run with `--no-verify-jwt`, exactly like ingest-submission/get-feedback: the
// META branch is called with NO Authorization header, so the platform's
// default verify_jwt gate would 401 it before this code runs. The authed
// branches do their own verification — the user-scoped RPC call fails with a
// PostgREST auth error on a bad/expired JWT, which maps to 401 below.
//
// Known residual (documented, accepted): the browser HTTP cache is per
// profile, not per account. On a shared Chromebook profile, student B can be
// served student A's cached content response — identical except the ordering
// permutation (seeded per student). No key material differs, and grading
// references item ids (order-independent), so the worst case is a cosmetic
// permutation swap; S1's signOutEverything purges viewer STORAGE, not the
// HTTP cache, and putting the user id in the URL to split cache keys would
// leak an identifier into logs for no security gain.
//
// Environment: only the auto-injected SUPABASE_URL / SUPABASE_ANON_KEY /
// SUPABASE_SERVICE_ROLE_KEY — no new secrets.
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  SANITIZER_REV,
  UpgradeError,
  applyServeShuffles,
  sanitizeActivityDocument,
  upgradeActivityDocument,
  type SanitizedActivityDocument,
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

/** Bump when the response envelope changes shape (the doc INSIDE it is
 * versioned by the schema + SANITIZER_REV, not by this). */
const API_VERSION = 1;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---- Meta-branch rate limiting (per isolate — MEASURED AS NEARLY INERT) ----
// A sliding one-minute window per client IP.
//
// READ THIS BEFORE CHANGING THE THRESHOLD OR GIVING THIS SHARED STATE.
//
// ** A CLASSROOM IS ONE IP. ** Every student in a school sits behind the same
// NAT, so "open this link now" produces one meta request per student — 30+
// within seconds, hundreds per minute at a bell change across a campus — all
// from a SINGLE address. A per-person threshold is therefore off by ~2 orders
// of magnitude against the real topology, and this endpoint serves the PRE-AUTH
// interstitial: a 429 here is the first screen a student ever sees, before they
// can even sign in. The failure would present as "some students can't open the
// activity, others can, apparently at random" — miserable to diagnose mid-class.
// The ceiling below is deliberately generous for that reason. RAISING it is
// safe; LOWERING it toward a per-person number is the bug.
//
// This constraint is not specific to this function: per-IP limiting is the
// wrong primitive anywhere in this product, because our users arrive thirty-at-
// a-time from one address. See DECISIONS.md → "Read API S2" (rate-limit
// finding) before reaching for IP-based throttling elsewhere.
//
// MEASURED 2026-07-28 on the live deployment: 95 sequential anonymous requests
// from ONE IP produced ZERO 429s. Supabase's Edge Runtime recycles isolates
// aggressively, so this module-level Map is empty on most requests — the
// effective limit is far looser than the constants imply, and on a distributed
// burst it is no limit at all. (Mechanism inferred from the zero-429 result +
// cold-boot-shaped latencies; a module-scope BOOT_ID logged per request would
// confirm it definitively.) So this is opportunistic throttling of a single hot
// isolate, NOT a guarantee — do not describe it as one.
//
// Kept rather than deleted because it costs nothing and does blunt a runaway
// client. What it guards is the title + teacher display name of a PUBLISHED
// activity, to a caller who already holds its UUID — data every published page
// shows publicly today, with UUID enumeration infeasible.
//
// If a REAL limit is ever needed (trigger: this response starts returning
// anything richer than those two fields), it must move to shared state — a
// small DB counter table — because no in-memory scheme can work here. Port the
// SCHOOL-SAFE ceiling with it; do not reintroduce a per-person number.
//
// The authed branches are NOT rate-limited here; the JWT is their gate.

const META_WINDOW_MS = 60_000;
/** School-safe ceiling: sized for a whole campus behind one NAT at a bell
 * change, not for one person. See the topology note above. */
const META_MAX_PER_WINDOW = 600;
const metaHits = new Map<string, number[]>();

function metaRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (metaHits.get(ip) ?? []).filter((t) => now - t < META_WINDOW_MS);
  if (hits.length >= META_MAX_PER_WINDOW) {
    metaHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  metaHits.set(ip, hits);
  // Bound the map so a scan across many IPs can't grow memory unbounded.
  if (metaHits.size > 10_000) metaHits.clear();
  return false;
}

// ---- JWT subject (shuffle seed only) ----------------------------------------
// Decoded WITHOUT verification — deliberately. The user-scoped RPC call has
// already succeeded by the time this runs, which means PostgREST verified the
// token's signature; this only re-reads the `sub` claim for the shuffle seed.
// Never use this for authorization.
function jwtSub(authHeader: string): string | null {
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { sub?: unknown };
    return typeof json.sub === 'string' ? json.sub : null;
  } catch {
    return null;
  }
}

interface PublishedActivityRow {
  version_id: string;
  version_num: number;
  title: string;
}

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== 'GET') return errorResponse(req, 405, 'Method not allowed');

  const url = new URL(req.url);
  const activityId = url.searchParams.get('activity_id') ?? '';
  const versionId = url.searchParams.get('version_id');
  const metaOnly = url.searchParams.get('meta') === '1';

  if (!UUID_RE.test(activityId)) {
    return errorResponse(req, 400, 'activity_id must be a UUID');
  }

  // ---- 1. META (anonymous) ----------------------------------------------
  if (metaOnly) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (metaRateLimited(ip)) {
      return errorResponse(req, 429, 'Too many requests');
    }
    // Anon client — get_activity_public_meta is the one anon-callable RPC
    // (postgres-owned DEFINER; 0017 documents the deliberate grant).
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await anonClient
      .rpc('get_activity_public_meta', { p_activity_id: activityId })
      .maybeSingle();
    if (error) {
      console.error('[get-activity] meta RPC error:', error);
      return errorResponse(req, 500, 'Lookup failed');
    }
    if (!data) return errorResponse(req, 404, 'Not available');
    return jsonResponse(
      req,
      {
        api_version: API_VERSION,
        title: (data as { title: string }).title,
        teacher_name: (data as { teacher_name: string | null }).teacher_name,
      },
      { headers: { 'Cache-Control': 'no-cache' } },
    );
  }

  // ---- Auth (resolve + content) ------------------------------------------
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return errorResponse(req, 401, 'Missing Authorization header');

  // User-scoped client: the RPC runs as the caller, so the DB enforces the
  // access rule (authenticated + published + not deleted) — not this function.
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: current, error: rpcError } = await userClient
    .rpc('get_published_activity', { p_activity_id: activityId })
    .maybeSingle();
  if (rpcError) {
    const msg = rpcError.message ?? '';
    // PostgREST surfaces a bad/expired JWT as a 401-class error; the RPC
    // raises 'Not available' for missing/unpublished/deleted activities.
    const status = msg.includes('Not available')
      ? 404
      : /JWT|token|auth/i.test(msg)
        ? 401
        : 500;
    if (status === 500) console.error('[get-activity] RPC error:', rpcError);
    return errorResponse(req, status, status === 404 ? 'Not available' : msg);
  }
  if (!current) return errorResponse(req, 404, 'Not available');
  const row = current as PublishedActivityRow;

  // ---- 2. RESOLVE --------------------------------------------------------
  if (!versionId) {
    return jsonResponse(
      req,
      {
        api_version: API_VERSION,
        activity_id: activityId,
        version_id: row.version_id,
        version_num: row.version_num,
        title: row.title,
      },
      { headers: { 'Cache-Control': 'no-cache' } },
    );
  }

  // ---- 3. CONTENT --------------------------------------------------------
  if (!UUID_RE.test(versionId)) {
    return errorResponse(req, 400, 'version_id must be a UUID');
  }
  if (versionId !== row.version_id) {
    // Republished since resolve — the viewer re-resolves and refetches. 404
    // (not 409) so no stale-URL response is ever cacheable as content.
    return errorResponse(req, 404, 'Not the current version', {
      code: 'stale_version',
      current_version_id: row.version_id,
    });
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Durable per-version cache (activity_version_reads, service-role only).
  let sanitized: SanitizedActivityDocument | null = null;
  const { data: cached, error: cacheErr } = await admin
    .from('activity_version_reads')
    .select('content')
    .eq('version_id', versionId)
    .eq('sanitizer_rev', SANITIZER_REV)
    .maybeSingle();
  if (cacheErr) {
    // Cache read failure is non-fatal — fall through to the source of truth.
    console.error('[get-activity] cache read failed:', cacheErr);
  }
  if (cached) {
    sanitized = cached.content as SanitizedActivityDocument;
  }

  if (!sanitized) {
    const { data: version, error: vErr } = await admin
      .from('activity_versions')
      .select('content')
      .eq('id', versionId)
      .maybeSingle();
    if (vErr || !version) {
      console.error('[get-activity] version read failed:', vErr);
      return errorResponse(req, 500, 'Version read failed');
    }
    let upgraded;
    try {
      upgraded = upgradeActivityDocument(version.content);
    } catch (err) {
      // The explicit failure state the failure-modes table promises — a
      // served 500 with a reason, never a mis-parsed document.
      console.error('[get-activity] upgrade failed:', err);
      const detail =
        err instanceof UpgradeError ? err.message : 'Upgrade failed';
      return errorResponse(req, 500, 'Activity content cannot be served', {
        code: 'upgrade_failed',
        detail,
      });
    }
    sanitized = sanitizeActivityDocument(upgraded.doc);

    // Upsert keyed (version_id, sanitizer_rev): concurrent misses write the
    // same deterministic artifact, so last-write-wins is harmless. Rows for
    // old sanitizer revs are orphaned automatically (new rev = new key).
    const { error: upsertErr } = await admin
      .from('activity_version_reads')
      .upsert(
        {
          version_id: versionId,
          sanitizer_rev: SANITIZER_REV,
          schema_version: upgraded.doc.schemaVersion,
          content: sanitized,
        },
        { onConflict: 'version_id,sanitizer_rev' },
      );
    if (upsertErr) {
      // Non-fatal: the response is already computed; the next request retries.
      console.error('[get-activity] cache upsert failed:', upsertErr);
    }
  }

  const userId = jwtSub(authHeader) ?? 'anonymous';
  const served = applyServeShuffles(sanitized, `${versionId}:${userId}`);

  return new Response(
    JSON.stringify({
      api_version: API_VERSION,
      activity_id: activityId,
      version: {
        id: versionId,
        num: row.version_num,
        schema_version: served.schemaVersion,
      },
      title: row.title,
      activity: served,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders(req),
        'Content-Type': 'application/json',
        // Version-keyed URL → immutable. private: student content never lands
        // in shared caches. A republish changes the URL via resolve, so this
        // never needs to expire.
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    },
  );
});
