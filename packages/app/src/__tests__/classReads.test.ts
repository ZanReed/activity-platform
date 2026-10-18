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

function chain(table: string) {
    const entry = { table, ops: [] as [string, ...unknown[]][] };
    calls.push(entry);
    const q: Record<string, unknown> = {};
    for (const op of ['select', 'eq', 'is', 'order', 'in']) {
        q[op] = (...args: unknown[]) => {
            entry.ops.push([op, ...args]);
            return q;
        };
    }
    q.then = (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
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
import { listTeacherClassActivities } from '../lib/classActivities';

beforeEach(() => {
    calls.length = 0;
    uid = 'user-1';
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

    it('signed out: no read, no rows', async () => {
        uid = null;
        expect(await listTeacherClassActivities()).toEqual([]);
        expect(calls).toHaveLength(0);
    });
});
