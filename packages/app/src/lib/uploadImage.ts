import { supabase } from './supabase';

// ============================================================================
// uploadImage — upload an author's image straight to Supabase Storage.
// ----------------------------------------------------------------------------
// Direct-to-Storage since the 2026-07-31 eng review (DECISIONS.md →
// "Direct-to-Storage image upload"); the upload-image Edge Function is gone.
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

// Extension is derived from the VALIDATED mime type, never from the client
// filename — the key stays honest even when the file is named "photo".
const MIME_TO_EXT: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
};

// Storage errors keyed on status code, not message text — storage-js message
// strings shift across versions; the codes are the API contract. 403 is the
// RLS denial (the policy said no); 413/415 are the bucket's own size/mime
// limits firing on a request that bypassed the fail-fast checks above.
function friendlyStorageError(error: {
    message: string;
    status?: number;
    statusCode?: string | number;
}): string {
    const code = Number(error.statusCode ?? error.status);
    switch (code) {
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

    // upsert:false — a uuid key cannot collide, so a collision would mean
    // something is wrong; surface it rather than overwrite. (Overwrites are
    // also policy-impossible: the bucket has no UPDATE policy.)
    const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(key, file, {
            contentType: file.type,
            cacheControl: '31536000',
            upsert: false,
        });
    if (error) {
        throw new Error(friendlyStorageError(error));
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(key);
    if (!publicUrl) {
        throw new Error('Upload returned no URL.');
    }
    return publicUrl;
}
