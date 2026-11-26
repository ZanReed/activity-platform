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

// Review A5 follow-up: the page patches a saved row instead of re-reading.
// The integration lane compares the patch to the REAL server's re-read; these
// rows pin the edges that lane's one fixture cannot reach.
import { applySavedGrade, parseStoredGrade, storedFeedback } from '../lib/queuePatch';
import type { GradingQueueRow } from '../lib/grading';

describe('the in-place patch after a Save', () => {
    it("stores feedback the way upsert_check_grade does: Postgres trim() strips SPACES only", () => {
        expect(storedFeedback('  ok  ')).toBe('ok');
        expect(storedFeedback('   ')).toBeNull();
        expect(storedFeedback('')).toBeNull();
        expect(storedFeedback('\nok\n')).toBe('\nok\n');
    });

    it('patches only the saved (check, block) row, and refuses a row it cannot find', () => {
        const base = { graded: false, criteria: null, general_feedback: null, graded_at: null,
            released_at: null, has_grader: false, stale: true } as unknown as GradingQueueRow;
        const rows = [
            { ...base, check_id: 'c1', block_id: 'b1' },
            { ...base, check_id: 'c1', block_id: 'b2' },
        ] as GradingQueueRow[];
        const grade = parseStoredGrade({ criteria: [], graded_at: '2026-11-26T00:00:00Z', released_at: '2026-11-25T00:00:00Z' })!;
        const next = applySavedGrade(rows, { checkId: 'c1', blockId: 'b1', grade, generalFeedback: ' hi ' })!;
        expect(next[0]).toMatchObject({ graded: true, has_grader: true, stale: false, general_feedback: 'hi',
            graded_at: '2026-11-26T00:00:00Z', released_at: '2026-11-25T00:00:00Z' });
        expect(next[1]).toBe(rows[1]);
        expect(applySavedGrade(rows, { checkId: 'cX', blockId: 'b1', grade, generalFeedback: '' })).toBeNull();
    });

    // The queue shows the grade with the LATEST graded_at across a row's
    // checks, and a re-save keeps graded_at. If the row showed a NEWER grade
    // (an older attempt graded later), the server still picks that one: only
    // a re-read can say, so the patch refuses.
    it('refuses when the row already shows a NEWER grade than the one saved', () => {
        const shown = { check_id: 'c2', block_id: 'b1', graded: true, graded_at: '2026-11-26T12:00:00.5+00:00',
            criteria: [], general_feedback: 'older attempt, graded later', released_at: null, has_grader: true,
            stale: true } as unknown as GradingQueueRow;
        const older = parseStoredGrade({ criteria: [], graded_at: '2026-11-26T09:00:00+00:00', released_at: null })!;
        expect(applySavedGrade([shown], { checkId: 'c2', blockId: 'b1', grade: older, generalFeedback: 'x' })).toBeNull();
        // Same instant, same text: this check's own grade re-saved — patched.
        const same = parseStoredGrade({ criteria: [], graded_at: '2026-11-26T12:00:00.5+00:00', released_at: null })!;
        expect(applySavedGrade([shown], { checkId: 'c2', blockId: 'b1', grade: same, generalFeedback: 'x' })).not.toBeNull();
        // Newer: wins.
        const newer = parseStoredGrade({ criteria: [], graded_at: '2026-11-26T13:00:00+00:00', released_at: null })!;
        expect(applySavedGrade([shown], { checkId: 'c2', blockId: 'b1', grade: newer, generalFeedback: 'x' })).not.toBeNull();
    });

    it('a reply without a grade is not patched from', () => {
        expect(parseStoredGrade(null)).toBeNull();
        expect(parseStoredGrade({ status: 'ok' })).toBeNull();
    });
});
