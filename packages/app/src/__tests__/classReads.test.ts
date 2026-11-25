// =============================================================================
// classReads.test.ts — the two list reads narrowed to "mine" (audit #4)
// -----------------------------------------------------------------------------
// RLS returns the same rows either way; the filter is what lets Postgres use
// an index instead of scanning the platform's whole table with a DEFINER call
// per row. These rows pin that the filter is SENT (same-rows was proven once
// against local PostgREST on 2026-10-18, see the commit), and that a signed-out
// caller makes no read at all.
// =============================================================================

import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: { table: string; ops: [string, ...unknown[]][] }[] = [];
let uid: string | null = 'user-1';
// Rows each successive read returns (then []), for the paging rows.
let pages: unknown[][] = [];

function chain(table: string) {
    const entry = { table, ops: [] as [string, ...unknown[]][] };
    calls.push(entry);
    const q: Record<string, unknown> = {};
    for (const op of ['select', 'eq', 'is', 'order', 'in', 'range']) {
        q[op] = (...args: unknown[]) => {
            entry.ops.push([op, ...args]);
            return q;
        };
    }
    q.then = (resolve: (v: unknown) => void) => resolve({ data: pages.shift() ?? [], error: null });
    return q;
}

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: { getSession: async () => ({ data: { session: uid ? { user: { id: uid } } : null } }) },
        from: (table: string) => chain(table),
    },
    functionsBase: () => 'http://functions.invalid',
}));

import { listMyClasses } from '../lib/classes';
import { CLASS_ACTIVITY_PAGE, listTeacherClassActivities } from '../lib/classActivities';

beforeEach(() => {
    calls.length = 0;
    uid = 'user-1';
    pages = [];
});

describe('listMyClasses', () => {
    it("filters to the caller's own memberships", async () => {
        await listMyClasses();
        expect(calls).toHaveLength(1);
        expect(calls[0]?.table).toBe('class_members');
        expect(calls[0]?.ops).toContainEqual(['eq', 'student_id', 'user-1']);
        expect(calls[0]?.ops).toContainEqual(['is', 'removed_at', null]);
    });

    it('signed out: no read, no rows', async () => {
        uid = null;
        expect(await listMyClasses()).toEqual([]);
        expect(calls).toHaveLength(0);
    });
});

describe('listTeacherClassActivities', () => {
    it("filters through the caller's own classes", async () => {
        await listTeacherClassActivities();
        expect(calls[0]?.table).toBe('class_activities');
        const select = calls[0]?.ops.find(([op]) => op === 'select')?.[1] as string;
        expect(select).toContain('classes!inner(teacher_id)');
        expect(calls[0]?.ops).toContainEqual(['eq', 'classes.teacher_id', 'user-1']);
    });

    // Review A5: PostgREST cuts a read at max_rows with no error, so one read
    // of a long-serving teacher's rows lost the oldest. A full page asks for
    // the next; a short page ends it; the order is total so no row straddles.
    it('reads past a full page instead of stopping at the cap', async () => {
        const row = (i: number) => ({
            class_id: `c${i}`, activity_id: `a${i}`, added_at: '2026-10-01T00:00:00Z', due_on: null,
            activities: { title: `t${i}`, status: 'published', deleted_at: null, current_version_id: 'v' },
        });
        pages = [
            Array.from({ length: CLASS_ACTIVITY_PAGE }, (_, i) => row(i)),
            [row(CLASS_ACTIVITY_PAGE), row(CLASS_ACTIVITY_PAGE + 1)],
        ];
        const got = await listTeacherClassActivities();
        expect(got).toHaveLength(CLASS_ACTIVITY_PAGE + 2);
        expect(got.at(-1)?.activityId).toBe(`a${CLASS_ACTIVITY_PAGE + 1}`);
        expect(calls.map((c) => c.ops.find(([op]) => op === 'range')?.slice(1))).toEqual([
            [0, CLASS_ACTIVITY_PAGE - 1],
            [CLASS_ACTIVITY_PAGE, 2 * CLASS_ACTIVITY_PAGE - 1],
        ]);
        for (const c of calls) expect(c.ops).toContainEqual(['order', 'class_id']);
    });

    it('one short page is one read', async () => {
        await listTeacherClassActivities();
        expect(calls).toHaveLength(1);
    });

    it('signed out: no read, no rows', async () => {
        uid = null;
        expect(await listTeacherClassActivities()).toEqual([]);
        expect(calls).toHaveLength(0);
    });
});
