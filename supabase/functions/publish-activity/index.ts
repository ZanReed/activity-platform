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
//   6. Upload the HTML to Supabase Storage:
//        - {activity_id}/v{N}/index.html  (immutable, long cache)
//        - {activity_id}/index.html       (live alias, short cache)
//   7. Return public URLs to the client.
//
// Environment variables required:
//   SUPABASE_URL              — auto-injected
//   SUPABASE_ANON_KEY         — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected
//   SUBMISSION_ENDPOINT       — full URL of the ingest-submission Edge Function
//                               (set with `supabase secrets set`)
//   ALLOWED_ORIGINS           — optional, defaults to '*' (set in prod)
//   STORAGE_BUCKET            — optional, defaults to 'activities'
//
// Storage bucket setup (one-time, manual):
//   See README.md in this directory for the bucket creation SQL + dashboard
//   instructions. Bucket must be PUBLIC and named 'activities' (or whatever
//   STORAGE_BUCKET is set to).
// =============================================================================

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/[email protected]';
import {
  renderActivity,
  ActivityDocument,
  type ActivityDocument as ActivityDocumentType,
} from '../_shared/renderer.bundle.js';
import {
  handlePreflight,
  jsonResponse,
  errorResponse,
} from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUBMISSION_ENDPOINT = Deno.env.get('SUBMISSION_ENDPOINT') ?? '';
const STORAGE_BUCKET = Deno.env.get('STORAGE_BUCKET') ?? 'activities';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}
if (!SUBMISSION_ENDPOINT) {
  // Soft-fail at runtime instead of import time, so the function still boots
  // and can return a clean 500 rather than crashing the runtime.
  console.warn('[publish-activity] SUBMISSION_ENDPOINT not set — published HTML will have a broken submit button');
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
    });
  } catch (err) {
    console.error('[publish-activity] Render error:', err);
    return errorResponse(req, 500, 'Render failed', {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // ---- 5. Upload to Storage ---------------------------------------------
  const adminClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const versionedPath = `${activityId}/v${version.version_num}/index.html`;
  const livePath = `${activityId}/index.html`;
  const bytes = new TextEncoder().encode(html);

  // Versioned: immutable, long cache. We use upsert:false so a re-publish
  // of the same version_num (which shouldn't happen) errors loudly.
  const { error: vUploadErr } = await adminClient.storage
    .from(STORAGE_BUCKET)
    .upload(versionedPath, bytes, {
      contentType: 'text/html; charset=utf-8',
      cacheControl: '31536000, immutable',
      upsert: false,
    });
  if (vUploadErr) {
    console.error('[publish-activity] Versioned upload failed:', vUploadErr);
    return errorResponse(req, 500, 'Failed to upload versioned HTML', {
      message: vUploadErr.message,
    });
  }

  // Live: rewrites on every publish, short cache so changes propagate quickly.
  const { error: lUploadErr } = await adminClient.storage
    .from(STORAGE_BUCKET)
    .upload(livePath, bytes, {
      contentType: 'text/html; charset=utf-8',
      cacheControl: '300, public', // 5 min
      upsert: true,
    });
  if (lUploadErr) {
    console.error('[publish-activity] Live upload failed:', lUploadErr);
    return errorResponse(req, 500, 'Failed to upload live HTML', {
      message: lUploadErr.message,
    });
  }

  // ---- 6. Return URLs ---------------------------------------------------
  const liveUrl = adminClient.storage.from(STORAGE_BUCKET).getPublicUrl(livePath).data.publicUrl;
  const versionedUrl = adminClient.storage.from(STORAGE_BUCKET).getPublicUrl(versionedPath).data.publicUrl;

  const response: PublishResponse = {
    version_id: newVersionId,
    version_num: version.version_num,
    public_url: liveUrl,
    versioned_url: versionedUrl,
  };
  return jsonResponse(req, response, { status: 200 });
});
