// =============================================================================
// gradingQueueRead.test.ts — the responses screen's reads are never cut at
// PostgREST's max_rows (0104, review A5)
// -----------------------------------------------------------------------------
// The row-set `list_grading_queue` was cut at PostgREST's 1,000 rows with no
// error. These rows pin that the app asks 0104's scalar wrapper, passes its
// array through whole; the same for the AI suggestions; and that photo states, one row per
// id asked, are asked in chunks under the cap. The over-1,000 proof is verify-0104 §B (a real database); this file
// cannot reach PostgREST.
// =============================================================================

import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    calls: [] as { name: string; args: unknown }[],
    reply: { data: null as unknown, error: null as { message: string } | null },
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        rpc: async (name: string, args: unknown) => {
            h.calls.push({ name, args });
            return h.reply;
        },
    },
    functionsBase: () => 'http://functions.invalid',
}));

import { fetchGradingQueue } from '../lib/grading';
import { GRADE_SUGGESTIONS_RPC, GRADING_QUEUE_RPC } from '../lib/gradingQueueRpc';
import { fetchSuggestions } from '../lib/gradingAssist';
import { fetchPhotoStates, PHOTO_STATES_CHUNK } from '../lib/workPhotos';

beforeEach(() => {
    h.calls.length = 0;
    h.reply = { data: null, error: null };
});

describe('fetchGradingQueue', () => {
    it("asks 0104's one-jsonb wrapper, never the row set", async () => {
        await fetchGradingQueue('act-1');
        expect(GRADING_QUEUE_RPC).toBe('grading_queue');
        expect(h.calls).toEqual([{ name: 'grading_queue', args: { p_activity_id: 'act-1' } }]);
    });

    it('passes every element through, past 1,000', async () => {
        h.reply.data = Array.from({ length: 1200 }, (_, i) => ({ check_id: `c${i}` }));
        const got = await fetchGradingQueue('act-1');
        expect(got).toHaveLength(1200);
        expect(got[1199]?.check_id).toBe('c1199');
    });

    it('null is an empty queue', async () => {
        expect(await fetchGradingQueue('act-1')).toEqual([]);
    });

    it("the server's refusal reaches the caller", async () => {
        h.reply = { data: null, error: { message: 'Not your activity' } };
        await expect(fetchGradingQueue('act-1')).rejects.toThrow('Not your activity');
    });
});

describe('fetchSuggestions', () => {
    it("asks 0104's one-jsonb wrapper and passes every element through", async () => {
        h.reply.data = Array.from({ length: 1200 }, (_, i) => ({ suggestion_id: `s${i}` }));
        const got = await fetchSuggestions('act-1');
        expect(GRADE_SUGGESTIONS_RPC).toBe('grade_suggestions');
        expect(h.calls).toEqual([{ name: 'grade_suggestions', args: { p_activity_id: 'act-1' } }]);
        expect(got).toHaveLength(1200);
    });

});

describe('fetchPhotoStates', () => {
    it('asks in chunks at or under the cap and keeps every answer', async () => {
        const ids = Array.from({ length: 2 * PHOTO_STATES_CHUNK + 7 }, (_, i) => `p${i}`);
        // The mock answers "ok" for whichever ids the last call asked about.
        h.reply = { data: null, error: null };
        const answered: string[][] = [];
        Object.defineProperty(h, 'reply', {
            configurable: true,
            get: () => {
                const asked = (h.calls.at(-1)?.args as { p_photo_ids: string[] }).p_photo_ids;
                answered.push(asked);
                return { data: asked.map((id) => ({ photo_id: id, state: 'ok' })), error: null };
            },
        });
        try {
            const got = await fetchPhotoStates('act-1', ids);
            expect(PHOTO_STATES_CHUNK).toBeLessThanOrEqual(1000);
            expect(answered.map((a) => a.length)).toEqual([PHOTO_STATES_CHUNK, PHOTO_STATES_CHUNK, 7]);
            expect(Object.keys(got)).toHaveLength(ids.length);
            expect(h.calls.every((c) => c.name === 'work_photo_states')).toBe(true);
        } finally {
            Object.defineProperty(h, 'reply', { configurable: true, writable: true, value: { data: null, error: null } });
        }
    });

    it('no ids, no call', async () => {
        expect(await fetchPhotoStates('act-1', [])).toEqual({});
        expect(h.calls).toHaveLength(0);
    });
});
