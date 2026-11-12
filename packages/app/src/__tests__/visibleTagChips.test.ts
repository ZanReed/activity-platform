// My activities' tag chips are capped like the Bank's (playtest sweep 2026-11-12).
import { describe, expect, it } from 'vitest';
import { visibleTagChips } from '../lib/normalizeTags';

const acts = [
    { tags: ['fractions', 'decimals'] },
    { tags: ['fractions', 'area'] },
    { tags: ['fractions', 'zebra'] },
];

describe('visibleTagChips', () => {
    it('shows the most-used first and caps the rest behind a count', () => {
        expect(visibleTagChips(acts, [], 2, false)).toEqual({ shown: ['fractions', 'area'], hidden: 2 });
    });
    it('a tag that is ON always shows, even past the cap', () => {
        expect(visibleTagChips(acts, ['zebra'], 2, false)).toEqual({ shown: ['fractions', 'area', 'zebra'], hidden: 1 });
    });
    it('"all" shows everything', () => {
        expect(visibleTagChips(acts, [], 2, true).shown).toHaveLength(4);
    });
});
