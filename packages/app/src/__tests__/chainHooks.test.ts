// =============================================================================
// chainHooks.test.ts — the chain hook data helpers (0057; chain-hooks-view.md)
// -----------------------------------------------------------------------------
// The date helpers exist because `new Date('2026-02-12')` is UTC midnight, so a
// US browser shows Feb 11 (design Pass 5; eng re-run S2 #2 / RT4). These rows
// hold in ANY timezone: they assert the local date PARTS, which is exactly what
// a regression back to `new Date(str)` breaks for a browser west of UTC.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
    chainHooksPath,
    chainsWithHooks,
    dateOnlyToLocalDate,
    hookShortName,
    localToday,
    type MyChainHooks,
} from '../lib/chainHooks';

describe('dates (RT4)', () => {
    it('reads a date column as that LOCAL day', () => {
        const d = dateOnlyToLocalDate('2026-02-12');
        expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 1, 12]);
        expect([d.getHours(), d.getMinutes()]).toEqual([0, 0]);
    });

    it("today is the browser's own date, as YYYY-MM-DD", () => {
        expect(localToday(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
        expect(localToday(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31');
    });
});

describe('hookShortName (RT1)', () => {
    it('keeps a short prompt whole and cuts a long one to eight words', () => {
        expect(hookShortName('Which is better value?')).toBe('Which is better value?');
        expect(
            hookShortName('Draw two long straight lines that cross, like a squashed X.'),
        ).toBe('Draw two long straight lines that cross, like…');
    });
});

describe('chainsWithHooks', () => {
    const data: MyChainHooks = {
        activityChains: { a1: 'chain.x', a2: 'chain.x', a3: 'chain.y', a4: 'chain.empty' },
        chains: {
            'chain.x': [{ id: 'hook.x', connects_to: [], prompt: 'p', note: 'n' }],
            'chain.y': [{ id: 'hook.y', connects_to: [], prompt: 'p', note: 'n' }],
        },
    };
    it('lists each distinct chain WITH a pool, in first-seen order', () => {
        expect(chainsWithHooks(data, ['a3', 'a1', 'a2', 'a4', 'unknown'])).toEqual(['chain.y', 'chain.x']);
        expect(chainsWithHooks(data, ['a4'])).toEqual([]);
    });
    it('builds the page path', () => {
        expect(chainHooksPath('chain.geom.parallel-lines')).toBe('/chains/chain.geom.parallel-lines');
    });
});
