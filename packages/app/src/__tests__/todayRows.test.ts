import { describe, expect, it } from 'vitest';
import { nextActivity, todayRows } from '../practice/todayRows';

const A = { id: 'a', title: 'A', status: null };
const B = { id: 'b', title: 'B', status: null };

describe('nextActivity (PA-7)', () => {
    it('after number facts, the first activity', () => {
        expect(nextActivity([A, B], null)?.id).toBe('a');
    });
    it('after number facts, skips an activity already done', () => {
        expect(nextActivity([{ ...A, status: 'Done ✓' }, B], null)?.id).toBe('b');
    });
    it('after a first practice on a double, the second activity', () => {
        expect(nextActivity([A, B], 1)?.id).toBe('b');
    });
    it('after a practice, never offers an activity Today marks done (sweep 2026-11-12)', () => {
        const C = { id: 'c', title: 'C', status: null };
        expect(nextActivity([A, { ...B, status: 'Done ✓' }, C], 1)?.id).toBe('c');
        // Done with an earlier version still counts as something to do.
        expect(nextActivity([A, { ...B, status: 'Done (earlier version)' }], 1)?.id).toBe('b');
    });
    it('after the last practice, nothing: the done screen offers the list', () => {
        expect(nextActivity([A], 1)).toBeUndefined();
        expect(nextActivity([A, B], 2)).toBeUndefined();
    });
});

describe('todayRows (PA-5)', () => {
    it('marks each practice block by how many sessions are done', () => {
        const rows = todayRows({
            facts: null,
            practice: { minutes: '6–9', doneToday: 1 },
            activities: [A, B],
        });
        expect(rows.map((r) => r.kind)).toEqual(['hook', 'activity', 'practice', 'activity', 'practice']);
        expect(rows.filter((r) => r.kind === 'practice').map((r) => r.kind === 'practice' && r.done)).toEqual([
            true,
            false,
        ]);
    });
});
