import { storageBase, supabase, supabaseAnonKey } from './supabase';

// ============================================================================
// uploadImage — upload an author's image straight to Supabase Storage.
// ----------------------------------------------------------------------------
// Direct-to-Storage since the 2026-07-31 eng review (DECISIONS.md →
// "Direct-to-Storage image upload"); the upload-image Edge Function is gone.
//
// RAW FETCH, NOT storage-js (2026-08-18; docs/design/shell-slim-supabase.md R2).
// This file was the ONLY consumer of @supabase/storage-js in the workspace, and
// it used exactly two of its methods. Because supabase-js imports every
// sub-client statically, those two calls put storage-js + its iceberg-js
// dependency (7.4 KiB gz) into the STUDENT's entry chunk — the one bundle
// every student downloads before first paint, on a path that never uploads
// anything. The library is now aliased to an inert stub (see
// src/lib/supabase-stubs/storage-js.ts) and the two calls are made by hand
// against Storage's versioned public HTTP API.
//
// The wire format below is not invented: it mirrors what storage-js 2.105.3
// itself sends for a Blob body (multipart with a `cacheControl` field and the
// file appended under the empty field name), so the server sees byte-identical
// requests to the ones that have been working since 0019.
//
// BOTH HEADERS, deliberately. supabase-js's `fetchWithAuth` adds `apikey`
// invisibly, so a hand-built request is exactly where it goes missing; sending
// it explicitly means it cannot be lost silently.
//
// ⚠ ONE CLAIM CORRECTED BY MEASUREMENT (2026-08-18). The eng review's severe
// finding said an apikey-less request "would have 401'd" at the API gateway.
// Against the real local stack it does NOT — a Bearer-only upload returns 200
// and writes a real object; the gateway accepts the user JWT as the credential.
// The header stays (it mirrors the vendor client, costs nothing, and hosted
// gateway config is not this repo's to assume), but nobody should believe it is
// the gate. THE GATE IS THE SESSION TOKEN, and behind it 0019's `to
// authenticated` INSERT policy — which is what the integration lane's upload
// row actually fires: an anonymous request to the same URL, refused.
// Authorization is NOT this file's job: the `activity-images` bucket carries
// an INSERT policy that parses the activity id out of the object key and asks
// can_edit_activity as the caller (migration 0019). The checks below exist for
// friendly, instant error messages — the bucket's own mime/size limits and the
// policy are the enforcement, so bypassing this file gains an attacker
// nothing.
//
// Key layout `{activityId}/{uuid}.{ext}` is load-bearing: the policy reads
// storage.foldername(name)[1] as the activity id and requires exactly one
// folder segment. Change the layout and every upload 403s.
//
// Returns the public URL; the editor stores it verbatim as the image block's
// src (absolute URL, origin-agnostic — R2-era images keep working beside
// Storage-era ones).
// ============================================================================

// Mirrors the bucket's allowed_mime_types (0019) so we fail fast with a
// friendly message instead of a server round-trip. SVG stays excluded: it can
// carry scripts, and serving it inline is an avoidable XSS surface.
export const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/avif',
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // mirrors 0019 file_size_limit

const IMAGE_BUCKET = 'activity-images';

// One year, immutable — the key carries a uuid, so the bytes at a key never
// change. Sent as storage-js sent it: a bare number in the multipart
// `cacheControl` field, which Storage turns into `max-age=<n>`.
const CACHE_CONTROL_SECONDS = '31536000';

// Extension is derived from the VALIDATED mime type, never from the client
// filename — the key stays honest even when the file is named "photo".
const MIME_TO_EXT: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
};

// Storage errors keyed on status code, not message text — Storage's message
// strings shift across versions; the codes are the API contract. 403 is the
// RLS denial (the policy said no); 413/415 are the bucket's own size/mime
// limits firing on a request that bypassed the fail-fast checks above.
//
// The shape is unchanged from the storage-js era on purpose: Storage's error
// BODY carries `statusCode` as a string, while a transport-level failure only
// has an HTTP status — so both fields stay, and 401 joined the list because a
// raw request is the one that can get it (a missing/expired token, or the
// missing `apikey` the review caught).
function friendlyStorageError(error: {
    message: string;
    status?: number;
    statusCode?: string | number;
}): string {
    const code = Number(error.statusCode ?? error.status);
    switch (code) {
        case 401:
            return 'Your session expired. Sign in again and retry the upload.';
        case 403:
            return 'Not authorized to upload to this activity.';
        case 413:
            return `Image too large (max ${MAX_IMAGE_BYTES / (1024 * 1024)} MB).`;
        case 415:
            return 'Unsupported image type. Use PNG, JPEG, GIF, WebP, or AVIF.';
        default:
            return error.message || 'Upload failed';
    }
}

/** Storage's JSON error body, when there is one. A 500 from a proxy can be
 *  HTML, and a dead network has no body at all, so every read is defensive —
 *  the status code carries the meaning either way. */
async function readStorageError(res: Response): Promise<{
    message: string;
    status: number;
    statusCode?: string | number;
}> {
    type ErrorBody = { message?: string; error?: string; statusCode?: string };
    let body: ErrorBody | null = null;
    try {
        body = (await res.json()) as ErrorBody;
    } catch {
        body = null;
    }
    return {
        message: body?.message || body?.error || `Upload failed (${res.status}).`,
        status: res.status,
        ...(body?.statusCode != null ? { statusCode: body.statusCode } : {}),
    };
}

export async function uploadImage(
    activityId: string,
    file: File,
): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        throw new Error('Unsupported image type. Use PNG, JPEG, GIF, WebP, or AVIF.');
    }
    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error(`Image too large (max ${MAX_IMAGE_BYTES / (1024 * 1024)} MB).`);
    }

    // The session guard stays even though Storage would reject an anonymous
    // insert anyway — a signed-out author should read "Not signed in", not an
    // RLS-flavored mystery.
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
        throw new Error('Not signed in.');
    }

    // ext is guaranteed by the allowlist check above; the fallback only
    // satisfies noUncheckedIndexedAccess.
    const ext = MIME_TO_EXT[file.type] ?? 'bin';
    const key = `${activityId}/${crypto.randomUUID()}.${ext}`;

    // The multipart body storage-js builds for a Blob: a `cacheControl` field,
    // then the file under the EMPTY field name. The file's own type rides along
    // as the part's Content-Type, which is what the bucket's allowed_mime_types
    // check reads — so `contentType` never needed to be a header here.
    // Content-Type is deliberately NOT set on the request: the browser must
    // write it, because only the browser knows the multipart boundary.
    const form = new FormData();
    form.append('cacheControl', CACHE_CONTROL_SECONDS);
    form.append('', file);

    // upsert:false — a uuid key cannot collide, so a collision would mean
    // something is wrong; surface it rather than overwrite. (Overwrites are
    // also policy-impossible: the bucket has no UPDATE policy.)
    let res: Response;
    try {
        res = await fetch(`${storageBase()}/object/${IMAGE_BUCKET}/${key}`, {
            method: 'POST',
            headers: {
                // BOTH, always. See the header note — the apikey is the one
                // supabase-js used to add behind our back.
                apikey: supabaseAnonKey(),
                Authorization: `Bearer ${session.access_token}`,
                'x-upsert': 'false',
            },
            body: form,
        });
    } catch (cause) {
        // A dead network never reaches a status code; keep the browser's own
        // wording rather than inventing a friendlier lie about what happened.
        throw new Error((cause as Error)?.message || 'Upload failed');
    }
    if (!res.ok) {
        throw new Error(friendlyStorageError(await readStorageError(res)));
    }

    // getPublicUrl was always pure string-building — storage-js made no request
    // for it. Same construction, same encodeURI, one less dependency.
    return encodeURI(`${storageBase()}/object/public/${IMAGE_BUCKET}/${key}`);
}
