// =============================================================================
// upload-image/index.ts — Edge Function: upload an author's image to R2
// -----------------------------------------------------------------------------
// Flow:
//   1. Receive POST multipart/form-data { activity_id, file } with the user's
//      JWT in Authorization.
//   2. Verify the user may edit the activity (can_edit_activity RPC, run as the
//      user so auth.uid() reflects the caller). Reject otherwise.
//   3. Validate the file: allowed image MIME type + size cap.
//   4. PUT the bytes to Cloudflare R2 at uploads/{activityId}/{uuid}.{ext}
//      (immutable — the uuid name never collides, so cache forever).
//   5. Return the public R2 URL; the editor stores it as the image block's src.
//
// Hosting note mirrors publish-activity: assets live on Cloudflare R2 (served
// with the correct Content-Type, zero egress), signed via aws4fetch's SigV4
// (the @aws-sdk PutObject hangs on Supabase Edge / Deno).
//
// Environment variables required (same R2 secrets as publish-activity):
//   SUPABASE_URL              — auto-injected
//   SUPABASE_ANON_KEY         — auto-injected
//   R2_ACCOUNT_ID             — Cloudflare account ID
//   R2_ACCESS_KEY_ID          — R2 API token access key ID
//   R2_SECRET_ACCESS_KEY      — R2 API token secret access key
//   R2_BUCKET_NAME            — R2 bucket name
//   R2_PUBLIC_URL_BASE        — Public r2.dev URL or custom domain (no trailing slash)
//   ALLOWED_ORIGINS           — optional, defaults to '*' (set in prod)
// =============================================================================

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';
import {
  handlePreflight,
  jsonResponse,
  errorResponse,
} from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

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

const PUBLIC_URL_BASE = R2_PUBLIC_URL_BASE.replace(/\/+$/, '');

// One AwsClient per cold start (see publish-activity for why aws4fetch, not @aws-sdk).
const r2Client = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  service: 's3',
  region: 'auto',
});

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Allowed raster image types → file extension. SVG is deliberately excluded:
// it can carry scripts, and serving it inline (even cross-origin) is an
// avoidable XSS surface. Authors who need vector art can rasterize first.
const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Sign + PUT one object to R2. Throws on any non-2xx so callers map it to a
// clean errorResponse.
async function putToR2(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  const res = await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, {
    method: 'PUT',
    body,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`R2 PUT ${key} failed: ${res.status} ${res.statusText} ${detail}`.trim());
  }
}

interface UploadResponse {
  url: string;
}

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return errorResponse(req, 405, 'Method not allowed');
  }

  // ---- Auth -------------------------------------------------------------
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(req, 401, 'Missing Authorization header');
  }

  // ---- Parse multipart body ---------------------------------------------
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorResponse(req, 400, 'Expected multipart/form-data body');
  }

  const activityId = form.get('activity_id');
  if (typeof activityId !== 'string' || !activityId) {
    return errorResponse(req, 400, 'activity_id is required');
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return errorResponse(req, 400, 'file is required');
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return errorResponse(
      req,
      415,
      `Unsupported image type: ${file.type || 'unknown'}. Allowed: PNG, JPEG, GIF, WebP, AVIF.`,
    );
  }

  if (file.size > MAX_BYTES) {
    return errorResponse(req, 413, `Image too large (max ${MAX_BYTES / (1024 * 1024)} MB)`);
  }

  // ---- Ownership check --------------------------------------------------
  // User-scoped client so can_edit_activity (security invoker) sees the right
  // auth.uid(). RLS-safe: a non-owner gets `false`, not someone else's data.
  const userClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: canEdit, error: rpcError } = await userClient.rpc('can_edit_activity', {
    p_activity_id: activityId,
  });
  if (rpcError) {
    console.error('[upload-image] can_edit_activity error:', rpcError);
    return errorResponse(req, 500, 'Authorization check failed');
  }
  if (canEdit !== true) {
    return errorResponse(req, 403, 'Not authorized to upload to this activity');
  }

  // ---- Upload to R2 -----------------------------------------------------
  const key = `uploads/${activityId}/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await putToR2(key, bytes, file.type);
  } catch (err) {
    console.error('[upload-image] R2 upload failed:', err);
    return errorResponse(req, 500, 'Failed to upload image', {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const response: UploadResponse = { url: `${PUBLIC_URL_BASE}/${key}` };
  return jsonResponse(req, response, { status: 200 });
});
