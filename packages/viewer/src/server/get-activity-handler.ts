// =============================================================================
// server/get-activity-handler.ts — the get-activity request handler (S2)
// -----------------------------------------------------------------------------
// The full branching logic of the get-activity Edge Function, extracted here so
// it lives in the TESTED, CI-drift-guarded viewer-server bundle instead of in
// untestable Deno glue (the S2 review found the 374-line function was the most
// branch-heavy in the repo with zero automated coverage). The Deno entry point
// (supabase/functions/get-activity/index.ts) is now thin wiring: it reads env,
// builds the Supabase clients behind the `GetActivityDb` port, passes the
// _shared/cors.ts helpers behind the `CorsKit` port, and serves the handler
// this factory returns. Everything observable — status codes, error codes,
// cache headers, response envelopes — is decided HERE and pinned by
// tests/get-activity-handler.test.ts.
//
// Three GET modes on one function:
//
//   1. META (anonymous, rate-limited — ruling 3.2A):
//        GET ?activity_id=<uuid>&meta=1
//      → { title, teacher_name } and NOTHING else — the pre-auth interstitial
//        contract ("Mrs. Jafari's 'Linear Systems'" + "use your @district.org
//        account"). Same data any published page already shows publicly.
//
//   1b. CLASS META (anonymous, same limiter — S9 Drop 2, D-3/E-2):
//        GET ?join_code=<code>&meta=1
//      → { class_name } and NOTHING else — the join gate's "Join <class name>"
//        instead of the bare code. Rides THIS branch rather than a direct anon
//        PostgREST grant so the one anonymous surface keeps its request
//        shaping (E-2's rejection reason). Enumeration posture recorded in
//        0030's header (OV-4): codes ≈2^29.7, the limiter is opportunistic
//        not a guarantee, payoff is a class name, recovery is B14
//        remove-and-regenerate; revisit triggers named there.
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
// (version_id, SANITIZER_REV) → on miss the cache-fill path below →
// applyServeShuffles seeded `${version_id}:${user_id}` (deterministic: reloads
// never reshuffle; the cached artifact stays student-independent).
//
//   cache MISS ──► readVersion ──► upgrade ──► sanitize
//                                                 │
//                    ┌────────────────────────────┘
//                    ▼
//              writeCensus (S7) ──fails──► NO cache row: next read retries
//                    │ ok                  (self-healing; see the ordering
//                    ▼                      note at the call site)
//              upsertCache ──► deleteStaleCache (old-rev GC for this version)
//
// The analytics writes are a SIDE-CHANNEL: every one of them can fail without
// changing the student's response. A cache HIT does none of this work.
//
// Access rule (S2 decision 2): ANY authenticated user (student or teacher) may
// read the published current version of a non-deleted activity — the R2
// link-share model behind sign-in. Classes gate identity (the 13+ assertion),
// not activity access.
//
// Known residual (documented, accepted): the browser HTTP cache is per
// profile, not per account. On a shared Chromebook profile, student B can be
// served student A's cached content response — identical except the ordering
// permutation (seeded per student). No key material differs, and grading
// references item ids (order-independent), so the worst case is a cosmetic
// permutation swap; S1's signOutEverything purges viewer STORAGE, not the
// HTTP cache, and putting the user id in the URL to split cache keys would
// leak an identifier into logs for no security gain.
// =============================================================================

import { UpgradeError, upgradeActivityDocument } from '@activity/schema';
import { censusOfDocument } from '../census/census.js';
import type { VersionCensus } from '../census/census.js';
import { SANITIZER_REV, sanitizeActivityDocument } from '../sanitize/sanitize.js';
import { serveSeed } from '../sanitize/serveSeed.js';
import { jwtSub } from './jwt.js';
import { UUID_RE } from './uuid.js';
import { applyServeShuffles } from '../sanitize/shuffle.js';
import type { SanitizedActivityDocument } from '../sanitize/sanitized-types.js';

/** Bump when the response envelope changes shape (the doc INSIDE it is
 * versioned by the schema + SANITIZER_REV, not by this). */
export const API_VERSION = 1;

// UUID_RE is imported (server/uuid.ts, G2): this file's loose local copy
// accepted ids the check API rejected — one shape rule now, strict.

// ---- Ports ------------------------------------------------------------------
// The handler never touches supabase-js or Deno directly; the entry point
// implements these against the real clients, tests implement them with fakes.

/** The `{ data, error }` shape every supabase-js query resolves to. */
export interface DbResult<T> {
  data: T | null;
  error: { message?: string } | null;
}

export interface PublishedActivityRow {
  version_id: string;
  version_num: number;
  title: string;
}

export interface GetActivityDb {
  /** `get_activity_public_meta` RPC as anon (postgres-owned DEFINER; 0017
   * documents the deliberate grant — one of exactly TWO anon RPCs since
   * 0030, with classMeta's below; verify-0017 §D + verify-0028 §A both pin
   * the roster). */
  publicMeta(
    activityId: string,
  ): Promise<DbResult<{ title: string; teacher_name: string | null }>>;
  /** `get_class_public_meta` RPC as anon (0030; the join gate's pre-auth
   * class-name lookup — the roster's SECOND anon RPC, asserted in
   * verify-0028 §A). */
  classMeta(joinCode: string): Promise<DbResult<{ name: string }>>;
  /** `get_published_activity` RPC as the CALLER (Authorization header passed
   * through), so the DB enforces auth + published-only — not this handler. */
  publishedActivity(
    authHeader: string,
    activityId: string,
  ): Promise<DbResult<PublishedActivityRow>>;
  /** Cache row from activity_version_reads (service role). */
  readCache(
    versionId: string,
    sanitizerRev: string,
  ): Promise<DbResult<{ content: unknown }>>;
  /** Version row from activity_versions (service role). */
  readVersion(versionId: string): Promise<DbResult<{ content: unknown }>>;
  /** Upsert keyed (version_id, sanitizer_rev) — concurrent misses write the
   * same deterministic artifact, so last-write-wins is harmless. */
  upsertCache(row: {
    version_id: string;
    sanitizer_rev: string;
    schema_version: number;
    content: unknown;
  }): Promise<{ error: { message?: string } | null }>;
  /** Replace this version's census + item-attribution rows (S7). Idempotent:
   * the census is a pure function of an immutable version, so a re-run writes
   * identical rows. */
  writeCensus(
    versionId: string,
    census: VersionCensus,
  ): Promise<{ error: { message?: string } | null }>;
  /** Delete this version's cache rows written under any OTHER sanitizer rev —
   * the exact half of the R6(a) GC. Only this code knows the current rev, so
   * only this code can be precise about it; the scheduled job sweeps the tail
   * of versions that are never read again. */
  deleteStaleCache(
    versionId: string,
    keepRev: string,
  ): Promise<{ error: { message?: string } | null }>;
}

/** The _shared/cors.ts helper surface (env-reading, so it stays Deno-side). */
export interface CorsKit {
  corsHeaders(req: Request): HeadersInit;
  handlePreflight(req: Request): Response | null;
  jsonResponse(req: Request, body: unknown, init?: ResponseInit): Response;
  errorResponse(
    req: Request,
    status: number,
    message: string,
    details?: unknown,
  ): Response;
}

export interface GetActivityHandlerDeps {
  db: GetActivityDb;
  cors: CorsKit;
  /** Injectable clock for the rate limiter (tests). Defaults to Date.now. */
  now?: () => number;
}

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
// aggressively, so this per-handler Map is empty on most requests — the
// effective limit is far looser than the constants imply, and on a distributed
// burst it is no limit at all. So this is opportunistic throttling of a single
// hot isolate, NOT a guarantee — do not describe it as one.
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

/** Join-code request shaping: 0014 mints 6 chars from a 31-char alphabet, but
 * the gate here is deliberately looser (any 4–12 alphanumerics) — the RPC's
 * normalized lookup is the real judge; this only bounces garbage before it
 * costs a round trip. Tightening this to today's mint format would turn a
 * future code-format change into a silent 400. */
export const JOIN_CODE_RE = /^[A-Za-z0-9]{4,12}$/;

export const META_WINDOW_MS = 60_000;
/** School-safe ceiling: sized for a whole campus behind one NAT at a bell
 * change, not for one person. See the topology note above. */
export const META_MAX_PER_WINDOW = 600;

export function createMetaRateLimiter(
  now: () => number = Date.now,
): (ip: string) => boolean {
  const metaHits = new Map<string, number[]>();
  return function metaRateLimited(ip: string): boolean {
    const t = now();
    const hits = (metaHits.get(ip) ?? []).filter(
      (hit) => t - hit < META_WINDOW_MS,
    );
    if (hits.length >= META_MAX_PER_WINDOW) {
      metaHits.set(ip, hits);
      return true;
    }
    hits.push(t);
    metaHits.set(ip, hits);
    // Bound the map so a scan across many IPs can't grow memory unbounded.
    if (metaHits.size > 10_000) metaHits.clear();
    return false;
  };
}

// jwtSub is imported (server/jwt.ts, G2) — it was pasted byte-identically
// into both handlers; see that leaf for the no-verification reasoning.

// ---- The handler ------------------------------------------------------------

export function createGetActivityHandler(
  deps: GetActivityHandlerDeps,
): (req: Request) => Promise<Response> {
  const { db, cors } = deps;
  const metaRateLimited = createMetaRateLimiter(deps.now ?? Date.now);

  return async function handleGetActivity(req: Request): Promise<Response> {
    const preflight = cors.handlePreflight(req);
    if (preflight) return preflight;
    if (req.method !== 'GET') {
      return cors.errorResponse(req, 405, 'Method not allowed');
    }

    const url = new URL(req.url);
    const activityId = url.searchParams.get('activity_id') ?? '';
    const versionId = url.searchParams.get('version_id');
    const metaOnly = url.searchParams.get('meta') === '1';
    const joinCode = url.searchParams.get('join_code');

    // ---- 1b. CLASS META (anonymous) ---------------------------------------
    // Handled before the activity_id shape check: this branch has no
    // activity. join_code exists ONLY as a meta lookup — any other use of the
    // param is a malformed request, not a mode.
    if (joinCode !== null) {
      if (!metaOnly) {
        return cors.errorResponse(req, 400, 'join_code requires meta=1');
      }
      const code = joinCode.trim();
      if (!JOIN_CODE_RE.test(code)) {
        return cors.errorResponse(req, 400, 'join_code must be a class code');
      }
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      // The SAME limiter instance as the activity meta branch — one anonymous
      // window per IP across both lookups (P3's liveness row fires it here).
      if (metaRateLimited(ip)) {
        return cors.errorResponse(req, 429, 'Too many requests');
      }
      const { data, error } = await db.classMeta(code);
      if (error) {
        console.error('[get-activity] class meta RPC error:', error);
        return cors.errorResponse(req, 500, 'Lookup failed');
      }
      // No row = unknown or deleted class — the DEFINITIVE negative DR-6's
      // pre-OAuth warning keys on (network failure above is the silent one).
      if (!data) return cors.errorResponse(req, 404, 'Not available');
      return cors.jsonResponse(
        req,
        // The wire-leak contract: the class NAME and nothing else.
        { api_version: API_VERSION, class_name: data.name },
        { headers: { 'Cache-Control': 'no-cache' } },
      );
    }

    if (!UUID_RE.test(activityId)) {
      return cors.errorResponse(req, 400, 'activity_id must be a UUID');
    }

    // ---- 1. META (anonymous) ----------------------------------------------
    if (metaOnly) {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      if (metaRateLimited(ip)) {
        return cors.errorResponse(req, 429, 'Too many requests');
      }
      const { data, error } = await db.publicMeta(activityId);
      if (error) {
        console.error('[get-activity] meta RPC error:', error);
        return cors.errorResponse(req, 500, 'Lookup failed');
      }
      if (!data) return cors.errorResponse(req, 404, 'Not available');
      return cors.jsonResponse(
        req,
        {
          api_version: API_VERSION,
          title: data.title,
          teacher_name: data.teacher_name,
        },
        { headers: { 'Cache-Control': 'no-cache' } },
      );
    }

    // ---- Auth (resolve + content) ------------------------------------------
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return cors.errorResponse(req, 401, 'Missing Authorization header');
    }

    const { data: current, error: rpcError } = await db.publishedActivity(
      authHeader,
      activityId,
    );
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
      return cors.errorResponse(
        req,
        status,
        status === 404 ? 'Not available' : msg,
      );
    }
    if (!current) return cors.errorResponse(req, 404, 'Not available');
    const row = current;

    // ---- 2. RESOLVE --------------------------------------------------------
    if (!versionId) {
      return cors.jsonResponse(
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
      return cors.errorResponse(req, 400, 'version_id must be a UUID');
    }
    if (versionId !== row.version_id) {
      // Republished since resolve — the viewer re-resolves and refetches. 404
      // (not 409) so no stale-URL response is ever cacheable as content.
      return cors.errorResponse(req, 404, 'Not the current version', {
        code: 'stale_version',
        current_version_id: row.version_id,
      });
    }

    // Durable per-version cache (activity_version_reads, service-role only).
    let sanitized: SanitizedActivityDocument | null = null;
    const { data: cached, error: cacheErr } = await db.readCache(
      versionId,
      SANITIZER_REV,
    );
    if (cacheErr) {
      // Cache read failure is non-fatal — fall through to the source of truth.
      console.error('[get-activity] cache read failed:', cacheErr);
    }
    if (cached) {
      sanitized = cached.content as SanitizedActivityDocument;
    }

    if (!sanitized) {
      const { data: version, error: vErr } = await db.readVersion(versionId);
      if (vErr || !version) {
        console.error('[get-activity] version read failed:', vErr);
        return cors.errorResponse(req, 500, 'Version read failed');
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
        return cors.errorResponse(req, 500, 'Activity content cannot be served', {
          code: 'upgrade_failed',
          detail,
        });
      }
      sanitized = sanitizeActivityDocument(upgraded.doc);

      // ---- Analytics side-channel (S7) -----------------------------------
      // ORDER IS LOAD-BEARING: census FIRST, and the cache row is written only
      // if it succeeded (ruling S7-9).
      //
      // The cache row is what makes every later read a HIT — and a HIT does no
      // analytics work at all. So writing the cache row after a FAILED census
      // would strand this version with no census until the next SANITIZER_REV
      // bump, while every check on it aggregated as unattributed. Silent, and
      // permanent. Withholding the cache row instead means the next read is
      // another miss that retries both: the failure self-heals, and its only
      // cost is recomputing a document we already know how to recompute.
      //
      // The census itself is total (never throws — see UNKNOWN_CENSUS_KEY), so
      // what this ordering actually guards against is a transient DB failure,
      // which is exactly the kind that a retry fixes.
      let censusOk = true;
      try {
        const { error: censusErr } = await db.writeCensus(
          versionId,
          censusOfDocument(upgraded.doc),
        );
        if (censusErr) {
          censusOk = false;
          console.error('[get-activity] census write failed:', censusErr);
        }
      } catch (err) {
        censusOk = false;
        console.error('[get-activity] census threw:', err);
      }

      if (censusOk) {
        const { error: upsertErr } = await db.upsertCache({
          version_id: versionId,
          sanitizer_rev: SANITIZER_REV,
          schema_version: upgraded.doc.schemaVersion,
          content: sanitized,
        });
        if (upsertErr) {
          // Non-fatal: the response is already computed; the next request
          // retries.
          console.error('[get-activity] cache upsert failed:', upsertErr);
        } else {
          // This version is now cached under the CURRENT rev, so any row it
          // has under an older rev is dead weight nothing will ever read.
          const { error: gcErr } = await db.deleteStaleCache(
            versionId,
            SANITIZER_REV,
          );
          if (gcErr) {
            console.error('[get-activity] stale-cache GC failed:', gcErr);
          }
        }
      }
    }

    const userId = jwtSub(authHeader) ?? 'anonymous';
    // serveSeed, imported (G1): the grading side recomputes this student's
    // arrangement from the SAME symbol — two spellings agreeing by luck was
    // the s2 retro's sharpest seam finding.
    const served = applyServeShuffles(sanitized, serveSeed(versionId, userId));

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
          ...cors.corsHeaders(req),
          'Content-Type': 'application/json',
          // Version-keyed URL → immutable. private: student content never lands
          // in shared caches. A republish changes the URL via resolve, so this
          // never needs to expire.
          'Cache-Control': 'private, max-age=31536000, immutable',
        },
      },
    );
  };
}
