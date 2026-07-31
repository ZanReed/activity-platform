// =============================================================================
// upload-image/index.ts — Edge Function: upload an author's image to Storage
// -----------------------------------------------------------------------------
// Flow:
//   1. Receive POST multipart/form-data { activity_id, file } with the user's
//      JWT in Authorization.
//   2. Verify the user may edit the activity (can_edit_activity RPC, run as the
//      user so auth.uid() reflects the caller). Reject otherwise.
//   3. Validate the file: allowed image MIME type + size cap.
//   4. Upload the bytes to the public `activity-images` Supabase Storage bucket
//      at {activityId}/{uuid}.{ext} (the uuid name never collides, so the
//      object is immutable in practice and cached for a year).
//   5. Return the public Storage URL; the editor stores it as the block's src.
//
// Hosting note — RETARGETED off Cloudflare R2 2026-07-31 (the Cloudflare-exit
// ruling, STATE.md → Current focus). Images can live on Supabase Storage where
// published HTML still cannot: the free-tier anti-abuse rewrite that forced R2
// on us (`text/html` → `text/plain`, CLAUDE.md) applies to HTML only, and
// `image/*` is served with its true Content-Type. Bucket + posture are created
// in migration 0019_image_storage.sql.
//
// Security model is UNCHANGED by the retarget: the bucket is public-read with
// ZERO write policies, so only service_role can write, which means only this
// function can — and this function still refuses before writing a byte unless
// `can_edit_activity` says yes for the CALLER. The gate is here, not in policy.
//
// Environment variables required (NO R2 secrets — all auto-injected):
//   SUPABASE_URL              — auto-injected
//   SUPABASE_ANON_KEY         — auto-injected (user-scoped client, for the RPC)
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected (admin client, for the write)
//   ALLOWED_ORIGINS           — optional, defaults to '*' (set in prod)
// =============================================================================

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  handlePreflight,
  jsonResponse,
  errorResponse,
} from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required Supabase environment variables ' +
    '(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)'
  );
}

// Created by migration 0019_image_storage.sql: public read, no write policies,
// with mime + size limits mirroring the two constants below.
const IMAGE_BUCKET = 'activity-images';

// One admin client per cold start. Service role bypasses RLS — which is the
// ONLY way to write this bucket — so it is used for the upload and nothing
// else. Authorization is decided above it, by can_edit_activity as the caller.
const admin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Allowed raster image types → file extension. SVG is deliberately excluded:
// it can carry scripts, and serving it inline (even cross-origin) is an
// avoidable XSS surface. Authors who need vector art can rasterize first.
// Keep in sync with 0019's allowed_mime_types and the client's fail-fast list.
const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — mirrors 0019's file_size_limit

// A year, in seconds — becomes the object's stored cache-control. There is no
// way to append `immutable` the way the raw R2 PUT header did. Harmless delta:
// the uuid key means an object's bytes never change, so a revalidation at worst
// costs one conditional request that 304s.
const CACHE_SECONDS = '31536000';

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

  // ---- Upload to Storage ------------------------------------------------
  // Key layout puts the activity id at foldername index 1 with no dead prefix
  // above it — the bucket name already says "images", and 0019's follow-on
  // (direct-to-Storage upload under a can_edit_activity policy) would parse
  // exactly that segment.
  const key = `${activityId}/${crypto.randomUUID()}.${ext}`;

  // Pass BYTES, not the File — deliberate, do not "simplify". supabase-js sends
  // a Blob/File as multipart and lets the server infer the type, but sends a
  // byte array as a raw body with `content-type` set from options. Only the
  // second path guarantees the object is stored under the MIME type we just
  // validated, and serving an image under the wrong Content-Type is the exact
  // failure class that drove this project off Supabase Storage once already.
  const bytes = new Uint8Array(await file.arrayBuffer());

  // upsert:false — a uuid key cannot collide, so a collision would mean
  // something is wrong; surface it rather than silently overwriting.
  const { error: uploadError } = await admin.storage.from(IMAGE_BUCKET).upload(key, bytes, {
    contentType: file.type,
    cacheControl: CACHE_SECONDS,
    upsert: false,
  });
  if (uploadError) {
    console.error('[upload-image] Storage upload failed:', uploadError);
    return errorResponse(req, 500, 'Failed to upload image', {
      message: uploadError.message,
    });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(key);

  const response: UploadResponse = { url: publicUrl };
  return jsonResponse(req, response, { status: 200 });
});
