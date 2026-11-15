// discardDraft.test.ts — "Discard changes" clears the draft, restores the
// published title, and refuses to throw away a newer edit from elsewhere.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => {
    const calls: { table: string; op: string; args: unknown[] }[] = [];
    const results: Record<string, { data: unknown; error: unknown }> = {};
    const from = vi.fn((table: string) => {
        const qb: Record<string, unknown> = {};
        const chain = (op: string) => (...args: unknown[]) => {
            calls.push({ table, op, args });
            return qb;
        };
        for (const op of ['select', 'eq', 'update']) qb[op] = chain(op);
        qb.maybeSingle = () => Promise.resolve(results[`${table}:read`]);
        qb.then = (resolve: (v: unknown) => void) => resolve(results[`${table}:write`]);
        return qb;
    });
    return { calls, results, from };
});
vi.mock('../lib/supabase', () => ({ supabase: { from: h.from } }));

const { discardDraft, DISCARD_COPY } = await import('../lib/discardDraft');

beforeEach(() => {
    h.calls.length = 0;
    h.results['activities:read'] = { data: { current_version_id: 'v1' }, error: null };
    h.results['activity_versions:read'] = { data: { title: 'Published title' }, error: null };
    h.results['activities:write'] = { data: [{ updated_at: 'now' }], error: null };
});

describe('discardDraft', () => {
    it('clears the draft and puts the published title back, over the row this tab saw', async () => {
        await discardDraft('a1', '2026-11-15T00:00:00Z');
        const update = h.calls.find((c) => c.op === 'update')!;
        expect(update.args[0]).toMatchObject({ draft_content: null, title: 'Published title' });
        const eqs = h.calls.filter((c) => c.table === 'activities' && c.op === 'eq').map((c) => c.args);
        expect(eqs).toContainEqual(['updated_at', '2026-11-15T00:00:00Z']);
    });

    it('refuses when the row changed elsewhere (nothing matched the guard)', async () => {
        h.results['activities:write'] = { data: [], error: null };
        await expect(discardDraft('a1', 'old')).rejects.toThrow(DISCARD_COPY.conflict);
    });

    it('refuses when there is no published version to go back to', async () => {
        h.results['activities:read'] = { data: { current_version_id: null }, error: null };
        await expect(discardDraft('a1', 'x')).rejects.toThrow(DISCARD_COPY.gone);
        expect(h.calls.some((c) => c.op === 'update')).toBe(false);
    });
});
