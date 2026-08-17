// @vitest-environment jsdom
// =============================================================================
// uploadImage.test.ts — the direct-to-Storage upload client's contract
// -----------------------------------------------------------------------------
// The security gate lives server-side (0019's INSERT policy + bucket limits;
// behavioral matrix in scripts/verify-image-storage.sql). What THIS suite pins
// is the client contract any future editor rewrite must honor: the fail-fast
// guards, the key layout the policy parses ({activityId}/{uuid}.{ext}, exactly
// one folder segment), upsert:false, and the statusCode-keyed error mapping
// that keeps storage failures human-readable.
//
// REWRITTEN 2026-08-18 for the raw-fetch upload (shell-slimming slice 1, R2 —
// docs/design/shell-slim-supabase.md). Every behavioral row above survives
// unchanged, because none of them was ever about storage-js; what changed is
// the seam. These rows now assert the HTTP REQUEST rather than a mocked
// library call, which is strictly more contract than before:
//
//   * BOTH auth headers. supabase-js's fetchWithAuth added `apikey` invisibly;
//     a hand-built request that sends only the Bearer token is 401'd by the
//     API gateway before Storage's RLS ever runs. That missing header was the
//     review's severe finding, and this is the unit half of closing it — the
//     other half is the integration-lane row against the real local stack,
//     which is the one that would actually have caught it (a mocked fetch
//     believes whatever headers you hand it).
//   * NO manually-set Content-Type. Only the browser knows the multipart
//     boundary; setting it by hand produces a body the server cannot parse,
//     and the symptom is a confusing 400 rather than an obvious bug.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_BASE = 'https://proj.supabase.co/storage/v1';
const ANON_KEY = 'anon-key-for-tests';

const h = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('../lib/supabase', () => ({
    supabase: { auth: { getSession: h.getSession } },
    storageBase: () => 'https://proj.supabase.co/storage/v1',
    supabaseAnonKey: () => 'anon-key-for-tests',
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

/** A Storage response, shaped the way the real API shapes it. */
function storageResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

let fetchMock: ReturnType<typeof vi.fn>;

/** The single request the module made, unpacked. */
function lastRequest() {
    const call = fetchMock.mock.calls[0];
    return {
        url: call?.[0] as string,
        init: (call?.[1] ?? {}) as RequestInit & { headers: Record<string, string> },
    };
}

beforeEach(() => {
    h.getSession.mockResolvedValue({
        data: { session: { access_token: 'tok' } },
    });
    fetchMock = vi.fn().mockResolvedValue(storageResponse(200, { Key: 'x' }));
    vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
});

describe('uploadImage fail-fast guards (no network)', () => {
    it('rejects a disallowed mime type before any network call', async () => {
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/svg+xml')),
        ).rejects.toThrow(/Unsupported image type/);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(h.getSession).not.toHaveBeenCalled();
    });

    it('rejects an oversize file before any network call', async () => {
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png', MAX_IMAGE_BYTES + 1)),
        ).rejects.toThrow(/too large/);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects when not signed in, before touching storage', async () => {
        h.getSession.mockResolvedValue({ data: { session: null } });
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('Not signed in.');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('uploadImage key layout (the policy parses this — load-bearing)', () => {
    it('POSTs to {bucket}/{activityId}/{uuid}.{ext}, ext derived from mime', async () => {
        await uploadImage(ACTIVITY_ID, makeFile('image/jpeg', 2048, 'IMG 0042.JPEG'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const { url, init } = lastRequest();
        expect(init.method).toBe('POST');

        // Exactly one folder segment (the activity id), then uuid.jpg — the
        // filename never leaks into the key, ext comes from the mime type.
        expect(url).toMatch(
            new RegExp(
                `^${STORAGE_BASE}/object/activity-images/${ACTIVITY_ID}/` +
                    `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.jpg$`,
            ),
        );
    });

    it('returns the public URL for the uploaded key', async () => {
        const url = await uploadImage(ACTIVITY_ID, makeFile('image/png'));
        const key = lastRequest().url.split('/object/activity-images/')[1];
        expect(key).toBeTruthy();
        expect(url).toBe(`${STORAGE_BASE}/object/public/activity-images/${key}`);
    });
});

describe('uploadImage request shape (what supabase-js used to build for us)', () => {
    it('sends BOTH apikey and Authorization — the header that used to be invisible', async () => {
        await uploadImage(ACTIVITY_ID, makeFile('image/png'));
        const { init } = lastRequest();
        expect(init.headers.apikey).toBe(ANON_KEY);
        expect(init.headers.Authorization).toBe('Bearer tok');
    });

    it('sends x-upsert:false — a uuid key cannot collide, so a collision is a bug', async () => {
        await uploadImage(ACTIVITY_ID, makeFile('image/png'));
        expect(lastRequest().init.headers['x-upsert']).toBe('false');
    });

    it('does NOT set Content-Type — only the browser knows the multipart boundary', async () => {
        await uploadImage(ACTIVITY_ID, makeFile('image/png'));
        const keys = Object.keys(lastRequest().init.headers).map((k) => k.toLowerCase());
        expect(keys).not.toContain('content-type');
    });

    it('sends the multipart body storage-js sent: cacheControl field + the file', async () => {
        const file = makeFile('image/webp');
        await uploadImage(ACTIVITY_ID, file);
        const body = lastRequest().init.body as FormData;
        expect(body).toBeInstanceOf(FormData);
        // One year, immutable — the key carries a uuid, so bytes never change.
        expect(body.get('cacheControl')).toBe('31536000');
        // The file rides under the EMPTY field name, carrying its own type,
        // which is what the bucket's allowed_mime_types check reads.
        const sent = body.get('') as File;
        expect(sent).toBeInstanceOf(File);
        expect(sent.type).toBe('image/webp');
    });
});

describe('uploadImage storage error mapping (statusCode-keyed, not message text)', () => {
    it('maps 403 (RLS denial) to the not-authorized message', async () => {
        fetchMock.mockResolvedValue(
            storageResponse(403, {
                message: 'new row violates row-level security policy',
                statusCode: '403',
            }),
        );
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('Not authorized to upload to this activity.');
    });

    it('maps 413 (bucket size limit) to the too-large message', async () => {
        fetchMock.mockResolvedValue(
            storageResponse(413, {
                message: 'The object exceeded the maximum allowed size',
                statusCode: '413',
            }),
        );
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow(/too large/);
    });

    it('maps 415 (bucket mime limit) to the unsupported-type message', async () => {
        fetchMock.mockResolvedValue(
            storageResponse(415, { message: 'mime type not supported', statusCode: '415' }),
        );
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow(/Unsupported image type/);
    });

    it('maps 401 to a session message — the failure a raw request can now have', async () => {
        // NEW with the raw-fetch rewrite: an expired token (or a dropped
        // apikey) is rejected by the gateway, which supabase-js's own client
        // could never surface here because it always attached both headers.
        fetchMock.mockResolvedValue(
            storageResponse(401, { message: 'Invalid JWT', statusCode: '401' }),
        );
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow(/session expired/i);
    });

    it('falls back to the HTTP status when the body carries no statusCode', async () => {
        // A gateway 403 with a bare `{message}` body must still map, or the
        // friendly text silently degrades to raw server prose.
        fetchMock.mockResolvedValue(storageResponse(403, { message: 'no' }));
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('Not authorized to upload to this activity.');
    });

    it('surfaces an unrecognized error message verbatim', async () => {
        fetchMock.mockResolvedValue(
            storageResponse(500, { message: 'internal error', statusCode: '500' }),
        );
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('internal error');
    });

    it('survives a non-JSON error body instead of throwing a parse error', async () => {
        // A proxy 502 is HTML. The status still carries the meaning; a JSON
        // parse blowing up here would replace a useful message with a
        // SyntaxError.
        fetchMock.mockResolvedValue(
            new Response('<html>bad gateway</html>', {
                status: 502,
                headers: { 'content-type': 'text/html' },
            }),
        );
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('Upload failed (502).');
    });

    it('surfaces a dead network in the browser’s own words', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
        await expect(
            uploadImage(ACTIVITY_ID, makeFile('image/png')),
        ).rejects.toThrow('Failed to fetch');
    });
});
