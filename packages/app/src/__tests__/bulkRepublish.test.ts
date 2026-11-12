// =============================================================================
// bulkRepublish.test.ts — the "Republish changed" loop (R-5)
// -----------------------------------------------------------------------------
// The same publish the editor makes, one at a time: validate each draft as
// usePublish does, call publish_activity, name every failure, keep going, and
// never throw. The page's list and count rules are pinned in Activities.test.
// =============================================================================

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityMeta, createEmptyDocument } from '@activity/schema';
import { tiptapToActivityBare as tiptapToActivity } from '../lib/serializeTestBridge';

const h = vi.hoisted(() => ({
    session: { current: { user: { id: 'owner-1' } } as unknown },
    drafts: { current: { data: [] as unknown[], error: null as unknown } },
    rpc: vi.fn(),
    inIds: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: { getSession: async () => ({ data: { session: h.session.current } }) },
        from: () => ({
            select: () => ({
                in: (_col: string, ids: string[]) => {
                    h.inIds(ids);
                    return Promise.resolve(h.drafts.current);
                },
            }),
        }),
        rpc: h.rpc,
    },
}));

import { republishMany } from '../lib/bulkRepublish';
import { INVALID_DOC_MESSAGE } from '../lib/usePublish';

const valid = createEmptyDocument();

beforeEach(() => {
    h.session.current = { user: { id: 'owner-1' } };
    h.drafts.current = {
        data: [
            { id: 'a', draft_content: valid },
            { id: 'b', draft_content: valid },
            { id: 'c', draft_content: valid },
        ],
        error: null,
    };
    h.rpc.mockReset();
    h.rpc.mockResolvedValue({ data: 'version-id', error: null });
    h.inIds.mockReset();
});

describe('republishMany', () => {
    it('publishes each id in order through publish_activity, reporting progress', async () => {
        const progress: number[] = [];
        const out = await republishMany(['a', 'b', 'c'], (done) => progress.push(done));
        expect(h.rpc.mock.calls.map((c) => c[1])).toEqual([
            { p_activity_id: 'a' },
            { p_activity_id: 'b' },
            { p_activity_id: 'c' },
        ]);
        expect(h.rpc.mock.calls.every((c) => c[0] === 'publish_activity')).toBe(true);
        expect(out).toEqual([
            { id: 'a', ok: true },
            { id: 'b', ok: true },
            { id: 'c', ok: true },
        ]);
        expect(progress).toEqual([1, 2, 3]);
        // One read for every draft, not one per activity.
        expect(h.inIds).toHaveBeenCalledTimes(1);
    });

    it('names a failure in teacher words and keeps going', async () => {
        h.rpc.mockImplementation(async (_n: string, args: { p_activity_id: string }) =>
            args.p_activity_id === 'b'
                ? { data: null, error: { message: 'No draft to publish' } }
                : { data: 'v', error: null },
        );
        const out = await republishMany(['a', 'b', 'c']);
        expect(out[1]).toEqual({
            id: 'b',
            ok: false,
            message: 'Nothing to publish — this activity has no unpublished changes.',
        });
        expect(out[2]).toEqual({ id: 'c', ok: true });
    });

    it('refuses an invalid draft without calling publish, as the editor does', async () => {
        h.drafts.current = {
            data: [
                { id: 'a', draft_content: { not: 'a document' } },
                { id: 'b', draft_content: valid },
            ],
            error: null,
        };
        const out = await republishMany(['a', 'b']);
        expect(out[0]).toEqual({ id: 'a', ok: false, message: INVALID_DOC_MESSAGE });
        expect(h.rpc).toHaveBeenCalledTimes(1);
        expect(h.rpc.mock.calls[0]?.[1]).toEqual({ p_activity_id: 'b' });
    });

    it('refuses a draft with an empty blank, by name, as the editor does (G-2)', async () => {
        const withEmptyBlank = tiptapToActivity(
            {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib' },
                        content: [
                            { type: 'text', text: 'x = ' },
                            { type: 'blank', attrs: { id: '11111111-1111-4111-8111-111111111111', answer: '', acceptableAnswers: [] } },
                        ],
                    },
                ],
            },
            ActivityMeta.parse({ title: 'G-2' }),
        );
        h.drafts.current = {
            data: [
                { id: 'a', draft_content: withEmptyBlank },
                { id: 'b', draft_content: valid },
            ],
            error: null,
        };
        const out = await republishMany(['a', 'b']);
        expect(out[0]).toEqual({ id: 'a', ok: false, message: 'A blank has no answer yet, so nothing was published.' });
        expect(h.rpc).toHaveBeenCalledTimes(1);
        expect(h.rpc.mock.calls[0]?.[1]).toEqual({ p_activity_id: 'b' });
    });

    it('signed out: publishes nothing and says so for every id', async () => {
        h.session.current = null;
        const out = await republishMany(['a', 'b']);
        expect(h.rpc).not.toHaveBeenCalled();
        expect(out).toEqual([
            { id: 'a', ok: false, message: 'Not signed in' },
            { id: 'b', ok: false, message: 'Not signed in' },
        ]);
    });

    it('a failed draft read publishes nothing', async () => {
        h.drafts.current = { data: null as unknown as unknown[], error: { message: 'Failed to fetch' } };
        const out = await republishMany(['a']);
        expect(h.rpc).not.toHaveBeenCalled();
        expect(out[0]).toMatchObject({ ok: false, message: expect.stringMatching(/Couldn't reach the server/) });
    });
});
