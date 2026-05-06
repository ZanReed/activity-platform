// =============================================================================
// ingest-submission/index.ts — Edge Function: accept student submissions
// -----------------------------------------------------------------------------
// Receives POST requests from the runtime JS embedded in published activity
// HTML (see packages/renderer/src/runtime/runtime.ts). Validates the payload,
// hashes the client IP, and inserts a row into submissions via the SQL RPC.
//
// Unlike publish-activity, this function takes NO Authorization header —
// students aren't logged in. The function uses the service role internally to
// call the privileged ingest_submission RPC, but the service role key never
// leaves the Edge runtime.
//
// Validation happens in three layers, defense in depth:
//   1. Edge Function (this file): shape check, Zod parse, score range
//   2. SQL function ingest_submission: activity is published, identity present
//   3. submissions CHECK constraint: identity present at storage layer
//
// Environment variables:
//   SUPABASE_URL                — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY   — auto-injected
//   IP_HASH_SALT                — set with `supabase secrets set`. Without it,
//                                 IPs are hashed unsalted, which is recoverable
//                                 by brute force on a known IP range.
//   ALLOWED_ORIGINS             — defaults to '*'. For students, '*' is the
//                                 right answer — the published HTML can come
//                                 from any host (R2, Pages, Storage, etc.).
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  SubmissionResponses,
  type SubmissionResponses as SubmissionResponsesType,
} from '../_shared/renderer.bundle.js';
import {
  handlePreflight,
  jsonResponse,
  errorResponse,
} from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const IP_HASH_SALT = Deno.env.get('IP_HASH_SALT') ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}
if (!IP_HASH_SALT) {
  console.warn(
    '[ingest-submission] IP_HASH_SALT not set — ip_hash will be unsalted (recoverable by brute force)',
  );
}

interface SubmissionRequest {
  activity_id: string;
  display_name?: string;
  opaque_token?: string;
  responses: unknown;
  score?: number | null;
}

interface SubmissionResponse {
  submission_id: string;
}

// Loose UUID syntax check. The DB does the authoritative check via the uuid
// column type — this is just so we can return a clean 400 instead of a
// generic RPC error when someone POSTs garbage.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * SHA-256 the salt + IP. We never store raw IPs; they're personally
 * identifying info we don't need for our use case (abuse detection works
 * fine on hashes). The salt makes the hash non-reversible by precomputed
 * tables — important because IPv4 only has ~4 billion possible values, well
 * within rainbow-table range without a salt.
 */
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(IP_HASH_SALT + ':' + ip);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Pick the client IP from the most reliable header. Supabase's edge runtime
 * sits behind their CDN, so the original client IP is in x-forwarded-for or
 * cf-connecting-ip rather than the connection's remote address.
 */
function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ??
    'unknown'
  );
}

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return errorResponse(req, 405, 'Method not allowed');
  }

  // ---- Parse + shape-check ----------------------------------------------
  let body: SubmissionRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 400, 'Invalid JSON body');
  }

  if (!body.activity_id || typeof body.activity_id !== 'string') {
    return errorResponse(req, 400, 'activity_id is required');
  }
  if (!UUID_RE.test(body.activity_id)) {
    return errorResponse(req, 400, 'activity_id must be a UUID');
  }

  // Identity: at least one of display_name (Phase 1) or opaque_token (Phase 3)
  // must be present. SQL CHECK constraint and the RPC also enforce this; we
  // catch it early to give a clean error to the student's browser.
  const hasName =
    typeof body.display_name === 'string' && body.display_name.trim().length > 0;
  const hasToken =
    typeof body.opaque_token === 'string' && body.opaque_token.length > 0;
  if (!hasName && !hasToken) {
    return errorResponse(req, 400, 'Must provide display_name or opaque_token');
  }

  // ---- Validate responses with Zod --------------------------------------
  const parsed = SubmissionResponses.safeParse(body.responses);
  if (!parsed.success) {
    return errorResponse(req, 422, 'responses failed schema validation', {
      issues: parsed.error.issues,
    });
  }
  const responses: SubmissionResponsesType = parsed.data;

  // ---- Score (optional, must be in [0, 1]) ------------------------------
  let score: number | null = null;
  if (body.score !== undefined && body.score !== null) {
    if (typeof body.score !== 'number' || body.score < 0 || body.score > 1) {
      return errorResponse(req, 400, 'score must be a number between 0 and 1');
    }
    score = body.score;
  }

  // ---- Diagnostics ------------------------------------------------------
  const userAgent = req.headers.get('user-agent') ?? null;
  const clientIp = getClientIp(req);
  const ipHash = await hashIp(clientIp);

  // ---- Call RPC ---------------------------------------------------------
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: submissionId, error: rpcError } = await adminClient.rpc('ingest_submission', {
    p_activity_id:  body.activity_id,
    p_opaque_token: hasToken ? body.opaque_token! : null,
    p_display_name: hasName ? body.display_name!.trim() : null,
    p_responses:    responses,
    p_score:        score,
    p_user_agent:   userAgent,
    p_ip_hash:      ipHash,
  });

  if (rpcError) {
    const msg = rpcError.message ?? 'Submission failed';
    // Map known RPC exception messages to appropriate HTTP statuses.
    const status =
      msg.includes('not found') || msg.includes('not published') ? 404 :
      msg.includes('Invalid token')                                ? 401 :
      msg.includes('requires')                                     ? 400 :
                                                                     500;
    console.error('[ingest-submission] RPC error:', rpcError);
    return errorResponse(req, status, msg);
  }

  if (typeof submissionId !== 'string') {
    console.error('[ingest-submission] RPC returned unexpected value:', submissionId);
    return errorResponse(req, 500, 'Submission RPC returned unexpected value');
  }

  const response: SubmissionResponse = { submission_id: submissionId };
  return jsonResponse(req, response, { status: 200 });
});
