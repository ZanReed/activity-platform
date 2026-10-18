// =============================================================================
// versionContent.test.ts — the teacher pages' version-document cache
// (efficiency audit #8 + #12, decision 2). Pins the four promises the module
// header makes: one read per readable version per user, one request per batch with
// in-flight sharing, a failed read is forgotten, a different user starts empty.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

const inMock = vi.fn();
let userId = 'teacher-a';
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: { getSession: async () => ({ data: { session: { user: { id: userId } } } }) },
        from: (table: string) => ({
            select: (cols: string) => ({ in: (col: string, ids: string[]) => inMock(table, cols, col, ids) }),
        }),
    },
}));

import { getVersionContents, resetVersionContentCache } from '../lib/versionContent';

const row = (id: string) => ({ id, version_num: 1, content: { title: id } });

beforeEach(() => {
    resetVersionContentCache();
    inMock.mockReset();
    userId = 'teacher-a';
    inMock.mockImplementation(async (_t: string, _c: string, _col: string, ids: string[]) => ({
        data: ids.map(row),
        error: null,
    }));
});

describe('getVersionContents', () => {
    it('reads a version once, then serves it from memory', async () => {
        const first = await getVersionContents(['v1', 'v2']);
        const again = await getVersionContents(['v2', 'v1']);
        expect(inMock).toHaveBeenCalledTimes(1);
        expect(inMock).toHaveBeenCalledWith('activity_versions', 'id, version_num, content', 'id', ['v1', 'v2']);
        expect(again.get('v1')).toEqual(first.get('v1'));
        expect([...again.keys()].sort()).toEqual(['v1', 'v2']);
    });

    it('asks only for the ids it has not seen', async () => {
        await getVersionContents(['v1']);
        await getVersionContents(['v1', 'v3']);
        expect(inMock).toHaveBeenCalledTimes(2);
        expect(inMock.mock.calls[1]?.[3]).toEqual(['v3']);
    });

    it('shares one request between concurrent asks', async () => {
        const [a, b] = await Promise.all([getVersionContents(['v1']), getVersionContents(['v1'])]);
        expect(inMock).toHaveBeenCalledTimes(1);
        expect(a.get('v1')).toEqual(b.get('v1'));
    });

    it('reports an id the read did not return as absent, and asks again next time', async () => {
        inMock.mockImplementationOnce(async () => ({ data: [row('v1')], error: null }));
        const got = await getVersionContents(['v1', 'hidden']);
        expect(got.has('hidden')).toBe(false);
        // Access can be granted later in the tab: absent is not remembered.
        const later = await getVersionContents(['v1', 'hidden']);
        expect(inMock).toHaveBeenCalledTimes(2);
        expect(inMock.mock.calls[1]?.[3]).toEqual(['hidden']);
        expect(later.has('hidden')).toBe(true);
    });

    it('forgets a failed read, so the next ask tries again', async () => {
        inMock.mockImplementationOnce(async () => ({ data: null, error: { message: 'boom' } }));
        await expect(getVersionContents(['v1'])).rejects.toThrow('boom');
        const got = await getVersionContents(['v1']);
        expect(got.get('v1')).toEqual({ version_num: 1, content: { title: 'v1' } });
        expect(inMock).toHaveBeenCalledTimes(2);
    });

    it('starts empty for a different signed-in user', async () => {
        await getVersionContents(['v1']);
        userId = 'teacher-b';
        await getVersionContents(['v1']);
        expect(inMock).toHaveBeenCalledTimes(2);
    });
});
