// @vitest-environment jsdom
// =============================================================================
// uploadImage.test.ts — the direct-to-Storage upload client's contract
// -----------------------------------------------------------------------------
// The security gate lives server-side (0019's INSERT policy + bucket limits;
// behavioral matrix in scripts/verify-image-storage.sql). What THIS suite pins
// is the client contract any future editor rewrite must honor: the fail-fast
// guards, the key layout the policy parses ({activityId}/{uuid}.{ext}, exactly
// one folder segment), upsert:false, and the statusCode-keyed error mapping
// that keeps storage failures human-readable. Supabase is mocked via
// vi.hoisted (same pattern as usePublish.test.ts / Activities.test.tsx).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => {
    const upload = vi.fn();
    const getPublicUrl = vi.fn();
    const getSession = vi.fn();
    const from = vi.fn(() => ({ upload, getPublicUrl }));
    return { upload, getPublicUrl, getSession, from };
});

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: { getSession: h.getSession },
        storage: { from: h.from },
    },
}));

import { uploadImage, MAX_IMAGE_BYTES } from '../lib/uploadImage';

const ACTIVITY_ID = '290f0951-1111-2222-3333-444455556666';

function makeFile(type: string, bytes = 1024, name = 'photo'): File {
    const file = new File([new Uint8Array(8)], name, { type });
    // File.size is read-only and derived from contents; building a real 11MB
    // buffer per test is wasteful, so override the getter instead.
    Object.defineProperty(file, 'size', { value: bytes });
    return file;
}

beforeEach(() => {
    h.getSession.mockResolvedValue({
        data: { session: { access_token: 'tok' } },
    });
    h.upload.mockResolvedValue({ data: { path: 'x' }, error: null });
    h.getPublicUrl.mockImplementation((key: string) => ({
        data: {
            publicUrl: `https://proj.supabase.co/storage/v1/object/public/activity-images/${key}`,
        },
    }));
});
afterEach(() => {
    vi.clearAllMocks();
});

describe('uploadImage fail-fast guards (no network)', () => {
    it('rejects a disallowed mime type before any network call', async () => {
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/svg+xml')),
        ).rejects.toThrow(/Unsupported image type/);
        expect(h.upload).not.toHaveBeenCalled();
        expect(h.getSession).not.toHaveBeenCalled();
    });

    it('rejects an oversize file before any network call', async () => {
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png', MAX_IMAGE_BYTES + 1)),
        ).rejects.toThrow(/too large/);
        expect(h.upload).not.toHaveBeenCalled();
    });

    it('rejects when not signed in, before touching storage', async () => {
        h.getSession.mockResolvedValue({ data: { session: null } });
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('Not signed in.');
        expect(h.upload).not.toHaveBeenCalled();
    });
});

describe('uploadImage key layout (the policy parses this — load-bearing)', () => {
    it('uploads to {activityId}/{uuid}.{ext} with ext derived from mime, upsert:false', async () => {
        await uploadImage(ACTIVITY_ID, makeFile('image/jpeg', 2048, 'IMG 0042.JPEG'));

        expect(h.from).toHaveBeenCalledWith('activity-images');
        expect(h.upload).toHaveBeenCalledTimes(1);
        const call = h.upload.mock.calls[0];
        const key = call?.[0] as string;
        const opts = call?.[2] as Record<string, unknown>;

        // Exactly one folder segment (the activity id), then uuid.jpg — the
        // filename never leaks into the key, ext comes from the mime type.
        expect(key).toMatch(
            new RegExp(
                `^${ACTIVITY_ID}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.jpg$`,
            ),
        );
        expect(opts).toMatchObject({
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: false,
        });
    });

    it('returns the public URL for the uploaded key', async () => {
        const url = await uploadImage(ACTIVITY_ID, makeFile('image/png'));
        const uploadedKey = h.upload.mock.calls[0]?.[0] as string;
        expect(h.getPublicUrl).toHaveBeenCalledWith(uploadedKey);
        expect(url).toBe(
            `https://proj.supabase.co/storage/v1/object/public/activity-images/${uploadedKey}`,
        );
    });
});

describe('uploadImage storage error mapping (statusCode-keyed, not message text)', () => {
    it('maps 403 (RLS denial) to the not-authorized message', async () => {
        h.upload.mockResolvedValue({
            data: null,
            error: {
                message: 'new row violates row-level security policy',
                statusCode: '403',
            },
        });
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('Not authorized to upload to this activity.');
    });

    it('maps 413 (bucket size limit) to the too-large message', async () => {
        h.upload.mockResolvedValue({
            data: null,
            error: {
                message: 'The object exceeded the maximum allowed size',
                statusCode: 413,
            },
        });
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow(/too large/);
    });

    it('maps 415 (bucket mime limit) to the unsupported-type message', async () => {
        h.upload.mockResolvedValue({
            data: null,
            error: { message: 'mime type not supported', statusCode: '415' },
        });
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow(/Unsupported image type/);
    });

    it('surfaces an unrecognized error message verbatim (network-class failures)', async () => {
        h.upload.mockResolvedValue({
            data: null,
            error: { message: 'fetch failed' },
        });
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('fetch failed');
    });
});
