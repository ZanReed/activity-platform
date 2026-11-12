// =============================================================================
// listFilters.test.ts — the filter bar's pure rules (activity-list-filters.md)
// =============================================================================

import { describe, expect, it } from 'vitest';
import { matchesQuery, parseStatus, topicCount, topicGroups } from '../lib/listFilters';

const row = (unit: string | null, tags: string[] | null) => ({ unit, tags });

describe('topicGroups (F-1)', () => {
    it('groups topics under the units they appear in, most-used first, No unit last', () => {
        const groups = topicGroups(
            [row(null, ['misc']), row('U1', ['area', 'perimeter']), row('U1', ['area']), row('U2', ['area', 'net']), row('U2', null)],
            (r) => r.tags,
            (r) => r.unit,
        );
        expect(groups).toEqual([
            { unit: 'U1', topics: [{ tag: 'area', count: 2 }, { tag: 'perimeter', count: 1 }] },
            { unit: 'U2', topics: [{ tag: 'area', count: 1 }, { tag: 'net', count: 1 }] },
            { unit: null, topics: [{ tag: 'misc', count: 1 }] },
        ]);
        // A topic in two units counts once on the button.
        expect(topicCount(groups)).toBe(4);
    });
});

describe('matchesQuery (F-3)', () => {
    it('matches the title or any topic, case-insensitively; empty matches all', () => {
        expect(matchesQuery('Area of Triangles', ['base'], 'TRIANG')).toBe(true);
        expect(matchesQuery('Shapes', ['composite shape'], 'composite')).toBe(true);
        expect(matchesQuery('Shapes', ['net'], 'volume')).toBe(false);
        expect(matchesQuery('Shapes', null, '  ')).toBe(true);
    });
});

describe('parseStatus (F-4, F-6)', () => {
    it('reads a known value from the URL and falls back to all', () => {
        expect(parseStatus('changed')).toBe('changed');
        expect(parseStatus('bogus')).toBe('all');
        expect(parseStatus(null)).toBe('all');
    });
});
