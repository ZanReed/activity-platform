// =============================================================================
// publish-activity/index.ts — Edge Function: publish a draft to a static page
// -----------------------------------------------------------------------------
// Flow:
//   1. Receive POST { activity_id } with the user's JWT in Authorization.
//   2. Call publish_activity RPC as the user. This atomically:
//        - Validates the user owns the activity (via can_edit_activity)
//        - Snapshots draft_content into a new activity_versions row
//        - Updates activities.current_version_id, status, clears draft
//        - Writes audit log
//        - Returns the new version_id
//   3. Read the new version's content (still RLS-protected).
//   4. Validate content against ActivityDocument (defense in depth — the
//      Edge Function and the renderer both refuse to operate on malformed
//      input even though the editor's serialize layer should never produce it).
//   5. Render to a self-contained HTML string via @activity/renderer.
//   6. Upload the HTML to Cloudflare R2 via the S3-compatible API:
//        - {activity_id}/v{N}/index.html  (immutable, long cache)
//        - {activity_id}/index.html       (live alias, short cache)
//   7. Return direct R2 public URLs to the client.
//
// Hosting note:
//   Published HTML lives on Cloudflare R2, not Supabase Storage. Supabase's
//   free tier rewrites text/html responses to text/plain (as anti-abuse) on
//   both Storage public URLs and Edge Function responses. R2 serves HTML
//   directly with the correct Content-Type and has zero egress cost.
//   See STATE.md "Hosting platform" and ROADMAP.md cross-cutting concerns
//   for the full reasoning.
//
// Environment variables required:
//   SUPABASE_URL              — auto-injected
//   SUPABASE_ANON_KEY         — auto-injected
//   SUBMISSION_ENDPOINT       — full URL of the ingest-submission Edge Function
//                               (set with `supabase secrets set`)
//   R2_ACCOUNT_ID             — Cloudflare account ID
//   R2_ACCESS_KEY_ID          — R2 API token access key ID
//   R2_SECRET_ACCESS_KEY      — R2 API token secret access key
//   R2_BUCKET_NAME            — R2 bucket name (e.g., activity-platform-published)
//   R2_PUBLIC_URL_BASE        — Public r2.dev URL or custom domain (no trailing slash)
//   ALLOWED_ORIGINS           — optional, defaults to '*' (set in prod)
//
// Note: SUPABASE_SERVICE_ROLE_KEY is no longer required — Storage uploads
//       migrated to R2 (no admin client needed). The auto-injected value
//       remains available in the environment but is unused by this function.
// =============================================================================

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';
import {
  renderActivity,
  ActivityDocument,
  FONTS_R2_PREFIX,
  type ActivityDocument as ActivityDocumentType,
} from '../_shared/renderer.bundle.js';
import { CALCULATOR_KIT_FILE } from '../_shared/graph-kit-manifest.ts';
import {
  handlePreflight,
  jsonResponse,
  errorResponse,
} from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUBMISSION_ENDPOINT = Deno.env.get('SUBMISSION_ENDPOINT') ?? '';

const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID') ?? '';
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID') ?? '';
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY') ?? '';
const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME') ?? '';
const R2_PUBLIC_URL_BASE = Deno.env.get('R2_PUBLIC_URL_BASE') ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)');
}
if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL_BASE
) {
  throw new Error(
    'Missing required R2 environment variables ' +
    '(R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL_BASE)'
  );
}
if (!SUBMISSION_ENDPOINT) {
  // Soft-fail at runtime instead of import time, so the function still boots
  // and can return a clean 500 rather than crashing the runtime.
  console.warn('[publish-activity] SUBMISSION_ENDPOINT not set — published HTML will have a broken submit button');
}

// Strip any accidental trailing slash on the public URL base so URL
// concatenation stays clean regardless of how the secret was set.
const PUBLIC_URL_BASE = R2_PUBLIC_URL_BASE.replace(/\/+$/, '');

// The shared, content-hashed graphing-kit bundle (calculator widget, lazy-loaded
// on published pages). Uploaded out-of-band by `pnpm build:graph-kit`; the
// filename (with its content hash) comes from the committed manifest. The
// renderer only emits the calculator when an activity opts in AND this URL is
// present, so a page without a calculator never references it.
const CALCULATOR_KIT_URL = `${PUBLIC_URL_BASE}/shared/${CALCULATOR_KIT_FILE}`;

// The self-hosted activity fonts (meta.typography). Uploaded out-of-band by
// `pnpm build:fonts`; the renderer emits @font-face rules under this base only
// for documents that opt into a non-default font, so pages without typography
// never reference it. FONTS_R2_PREFIX comes from the renderer bundle so the
// URL layout can't drift from the file names the renderer emits.
const FONTS_BASE_URL = `${PUBLIC_URL_BASE}/${FONTS_R2_PREFIX}`;

// One AwsClient per cold start. We use aws4fetch (a small fetch-based SigV4
// signer) rather than @aws-sdk/client-s3: the AWS SDK imports fine on Supabase
// Edge (Deno) but its PutObject request hangs indefinitely at runtime, which
// stalls the whole publish. aws4fetch signs a plain fetch() PUT and works
// reliably. R2 doesn't use AWS regions; 'auto' is the convention.
const r2Client = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  service: 's3',
  region: 'auto',
});

// R2 S3 endpoint is account-scoped; the bucket and object key are path
// segments on the URL (path-style addressing).
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Sign + PUT one object to R2. Throws on any non-2xx so callers can map it to
// a clean errorResponse.
async function putToR2(
  key: string,
  body: Uint8Array,
  cacheControl: string,
): Promise<void> {
  const res = await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, {
    method: 'PUT',
    body,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`R2 PUT ${key} failed: ${res.status} ${res.statusText} ${detail}`.trim());
  }
}

interface PublishRequest {
  activity_id: string;
}

interface PublishResponse {
  version_id: string;
  version_num: number;
  public_url: string;
  versioned_url: string;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return errorResponse(req, 405, 'Method not allowed');
  }

  // ---- Parse + auth -----------------------------------------------------
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(req, 401, 'Missing Authorization header');
  }

  let body: PublishRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 400, 'Invalid JSON body');
  }
  if (!body.activity_id || typeof body.activity_id !== 'string') {
    return errorResponse(req, 400, 'activity_id is required');
  }
  const activityId = body.activity_id;

  // User-scoped client: respects RLS, calls publish_activity as the
  // authenticated user, so auth.uid() inside the SECURITY DEFINER function
  // reflects the right caller.
  const userClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  // ---- 1. Atomic publish via RPC ----------------------------------------
  const { data: newVersionId, error: rpcError } = await userClient.rpc('publish_activity', {
    p_activity_id: activityId,
  });
  if (rpcError) {
    // The RPC raises specific exceptions for "not authorized" and "no draft
    // content"; surface them as 4xx rather than 500.
    const msg = rpcError.message ?? 'Publish failed';
    const status =
      msg.includes('Not authorized') ? 403 :
      msg.includes('not found')      ? 404 :
      msg.includes('No draft')       ? 400 :
      500;
    console.error('[publish-activity] RPC error:', rpcError);
    return errorResponse(req, status, msg);
  }
  if (typeof newVersionId !== 'string') {
    console.error('[publish-activity] RPC returned unexpected value:', newVersionId);
    return errorResponse(req, 500, 'Publish RPC returned unexpected value');
  }

  // ---- 2. Read the new version content ----------------------------------
  const { data: version, error: vErr } = await userClient
    .from('activity_versions')
    .select('content, version_num, activity_id')
    .eq('id', newVersionId)
    .single();
  if (vErr || !version) {
    console.error('[publish-activity] Could not read new version:', vErr);
    return errorResponse(req, 500, 'Version not found after publish');
  }

  // ---- 3. Validate (defense in depth) -----------------------------------
  const parsed = ActivityDocument.safeParse(version.content);
  if (!parsed.success) {
    console.error('[publish-activity] Document validation failed:', parsed.error.issues);
    return errorResponse(req, 422, 'Document failed schema validation', {
      issues: parsed.error.issues,
    });
  }
  const doc: ActivityDocumentType = parsed.data;

  // ---- 4. Render --------------------------------------------------------
  let html: string;
  try {
    html = renderActivity(doc, {
      activityId,
      versionNum: version.version_num,
      submissionEndpoint: SUBMISSION_ENDPOINT,
      calculatorKitUrl: CALCULATOR_KIT_URL,
      fontsBaseUrl: FONTS_BASE_URL,
    });
  } catch (err) {
    console.error('[publish-activity] Render error:', err);
    return errorResponse(req, 500, 'Render failed', {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // ---- 5. Upload to R2 --------------------------------------------------
  // Object keys are bucket-relative paths; the bucket name itself goes in
  // the Bucket parameter, not the Key.
  const versionedKey = `${activityId}/v${version.version_num}/index.html`;
  const liveKey = `${activityId}/index.html`;
  const bytes = new TextEncoder().encode(html);

  // Versioned: immutable, long cache. S3 PutObject overwrites by default;
  // there's no equivalent to Supabase Storage's `upsert:false` flag in the
  // base S3 API. We rely on the upstream uniqueness guarantee instead:
  // publish_activity derives version_num as max(version_num) + 1 server-side,
  // so a collision on this path shouldn't happen.
  try {
    await putToR2(versionedKey, bytes, 'public, max-age=31536000, immutable');
  } catch (err) {
    console.error('[publish-activity] Versioned upload failed:', err);
    return errorResponse(req, 500, 'Failed to upload versioned HTML', {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Live: rewrites on every publish. `no-cache` means caches (browser + the
  // Cloudflare edge in front of R2) must revalidate with R2 before serving,
  // so a republish is visible immediately. R2 attaches an ETag automatically,
  // so unchanged content still returns a cheap 304 — this is freshness, not
  // "never cache". (max-age=300 here previously made republished changes
  // invisible for up to 5 minutes unless the viewer hard-refreshed.)
  try {
    await putToR2(liveKey, bytes, 'no-cache');
  } catch (err) {
    console.error('[publish-activity] Live upload failed:', err);
    return errorResponse(req, 500, 'Failed to upload live HTML', {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // ---- 6. Return URLs ---------------------------------------------------
  // Direct R2 public URLs — no proxy needed. R2 serves HTML with the
  // correct Content-Type, unlike Supabase Storage on free tier.
  const liveUrl = `${PUBLIC_URL_BASE}/${liveKey}`;
  const versionedUrl = `${PUBLIC_URL_BASE}/${versionedKey}`;

  const response: PublishResponse = {
    version_id: newVersionId,
    version_num: version.version_num,
    public_url: liveUrl,
    versioned_url: versionedUrl,
  };
  return jsonResponse(req, response, { status: 200 });
});
