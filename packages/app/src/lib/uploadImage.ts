import { supabase } from './supabase';

// ============================================================================
// uploadImage — POST an image file to the upload-image Edge Function (R2).
// ----------------------------------------------------------------------------
// Mirrors usePublish's invoke pattern: attach the session token explicitly
// (publishable-key clients don't reliably forward the user JWT on
// functions.invoke), send multipart/form-data, and surface the function's
// { error, details } body as a readable message. Returns the public R2 URL.
// ============================================================================

// Client-side guard mirroring the Edge Function's allowlist so we fail fast
// with a friendly message instead of a 415 round-trip.
export const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/avif',
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // keep in sync with the function

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

    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
        throw new Error('Not signed in.');
    }

    const form = new FormData();
    form.append('activity_id', activityId);
    form.append('file', file);

    const { data, error } = await supabase.functions.invoke<{ url: string }>(
        'upload-image',
        {
            body: form,
            headers: { Authorization: `Bearer ${session.access_token}` },
        },
    );

    if (error) {
        // FunctionsHttpError carries the raw Response on .context; the function's
        // errorResponse helper returns { error, details? }. Surface the real cause.
        let message = error.message || 'Upload failed';
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.json === 'function') {
            try {
                const body = (await ctx.json()) as { error?: unknown };
                if (typeof body?.error === 'string') message = body.error;
            } catch {
                /* keep generic message */
            }
        }
        throw new Error(message);
    }

    if (!data?.url) {
        throw new Error('Upload returned no URL.');
    }
    return data.url;
}
