// =============================================================================
// copyActivity.test.ts — E-1 "Make a copy" (ui-review-group-e.md)
// =============================================================================

import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => {
    const state: { source: Record<string, unknown>; version: unknown; inserted: Record<string, unknown>[]; taken: number } = {
        source: {},
        version: null,
        inserted: [],
        taken: 0,
    };
    const from = vi.fn((table: string) => {
        if (table === 'activity_versions') {
            return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { content: state.version }, error: null }) }) }) };
        }
        return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: state.source, error: null }) }) }),
            insert: (row: Record<string, unknown>) => ({
                select: () => ({
                    single: () => {
                        state.inserted.push(row);
                        if (state.taken > 0) {
                            state.taken -= 1;
                            return Promise.resolve({ data: null, error: { code: '23505', message: 'slug taken' } });
                        }
                        return Promise.resolve({ data: { id: 'new-1' }, error: null });
                    },
                }),
            }),
        };
    });
    return { state, from };
});
vi.mock('../lib/supabase', () => ({ supabase: { from: h.from } }));

import { copyOwnActivity } from '../lib/copyActivity';

const doc = (title: string) => ({ schemaVersion: 2, meta: { title }, sections: [] });

beforeEach(() => {
    h.state.inserted = [];
    h.state.taken = 0;
    h.state.version = null;
});

describe('copyOwnActivity', () => {
    it('copies the draft as a new draft titled "(copy)", without its file identity', async () => {
        h.state.source = {
            title: 'Fractions 2', course: 'Algebra I', unit: 'U1', description: null, tags: ['fractions'],
            pedagogical_role: 'lesson', draft_content: doc('Fractions 2'), current_version_id: 'v1',
            source_path: 'y7/fractions.md', source_key: 'act.fractions', source_fingerprint: 'abc',
        };
        expect(await copyOwnActivity('a1', 'teacher-1')).toBe('new-1');
        const row = h.state.inserted[0]!;
        expect(row.title).toBe('Fractions 2 (copy)');
        expect((row.draft_content as { meta: { title: string } }).meta.title).toBe('Fractions 2 (copy)');
        expect(row.owner_id).toBe('teacher-1');
        expect(row.tags).toEqual(['fractions']);
        // Not the file, not a Bank copy, not published.
        for (const k of ['source_path', 'source_key', 'source_fingerprint', 'copied_from_activity_id', 'status', 'current_version_id']) {
            expect(row).not.toHaveProperty(k);
        }
    });

    it('with no draft (just published), copies the published version', async () => {
        h.state.source = { title: 'Ratios', draft_content: null, current_version_id: 'v3', tags: null };
        h.state.version = doc('Ratios');
        await copyOwnActivity('a2', 'teacher-1');
        expect((h.state.inserted[0]!.draft_content as { meta: { title: string } }).meta.title).toBe('Ratios (copy)');
    });

    it('tries the next slug when one is taken', async () => {
        h.state.source = { title: 'Ratios', draft_content: doc('Ratios'), current_version_id: null };
        h.state.taken = 1;
        await copyOwnActivity('a2', 'teacher-1');
        expect(h.state.inserted).toHaveLength(2);
        expect(h.state.inserted[0]!.slug).not.toBe(h.state.inserted[1]!.slug);
    });
});
