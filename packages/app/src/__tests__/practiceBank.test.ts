// lib/practiceBank.ts — the chain page's bank read must FAIL SOFT (a database
// without 0058, a network error): the page it feeds is the hook page.
import { describe, expect, it, vi } from 'vitest';

const q = vi.hoisted(() => ({ result: { data: null as unknown, error: null as unknown }, throws: false, calls: [] as string[] }));

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: (table: string) => {
            if (q.throws) throw new Error('boom');
            q.calls.push(`from:${table}`);
            const qb: Record<string, unknown> = {};
            for (const k of ['select', 'eq', 'is', 'order']) {
                qb[k] = (...args: unknown[]) => {
                    q.calls.push(`${k}:${args.map(String).join(',')}`);
                    return k === 'order' && q.calls.filter((c) => c.startsWith('order')).length === 2
                        ? Promise.resolve(q.result)
                        : qb;
                };
            }
            return qb;
        },
    },
}));

import { groupBankItemsByFile, listBankItems } from '../lib/practiceBank';

describe('listBankItems', () => {
    it('reads live items for the chain, in file then template order', async () => {
        q.calls = [];
        q.result = { data: [{ item_id: 'a#t1' }], error: null };
        expect(await listBankItems('chain.x')).toEqual([{ item_id: 'a#t1' }]);
        expect(q.calls).toContain('eq:chain_id,chain.x');
        expect(q.calls).toContain('is:retired_at,null');
        expect(q.calls.filter((c) => c.startsWith('order'))).toEqual(['order:bank_path', 'order:position']);
    });

    it('returns [] on a PostgREST error (e.g. 0058 not applied)', async () => {
        q.calls = [];
        q.result = { data: null, error: { code: 'PGRST205', message: 'relation missing' } };
        expect(await listBankItems('chain.x')).toEqual([]);
    });

    it('returns [] when the client throws', async () => {
        q.throws = true;
        expect(await listBankItems('chain.x')).toEqual([]);
        q.throws = false;
    });
});

describe('groupBankItemsByFile', () => {
    it('keeps path order and groups each file once', () => {
        const row = (item_id: string, bank_path: string) => ({ item_id, bank_path }) as never;
        expect(
            groupBankItemsByFile([row('a#t1', 'p/a.md'), row('a#t2', 'p/a.md'), row('b#t1', 'p/b.md')]).map(
                ([p, items]) => [p, items.length],
            ),
        ).toEqual([['p/a.md', 2], ['p/b.md', 1]]);
    });
});
