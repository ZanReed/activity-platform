import { describe, it, expect } from 'vitest';
import { slugify, slugWithSuffix } from '../lib/slug';

describe('slugify', () => {
    it('lowercases and hyphenates', () => {
        expect(slugify('Factoring Quadratics')).toBe('factoring-quadratics');
    });

    it('collapses runs of non-alphanumerics into a single hyphen', () => {
        expect(slugify('Solve:  2x + 3 = 0')).toBe('solve-2x-3-0');
    });

    it('trims leading and trailing hyphens', () => {
        expect(slugify('!!! Warm-up !!!')).toBe('warm-up');
    });

    it('strips diacritics', () => {
        expect(slugify('Émile’s Café')).toBe('emile-s-cafe');
    });

    it('falls back to "activity" for an all-punctuation title', () => {
        expect(slugify('!!!')).toBe('activity');
    });

    it('falls back to "activity" for a whitespace-only title', () => {
        expect(slugify('   ')).toBe('activity');
    });
});

describe('slugWithSuffix', () => {
    it('returns the base unchanged on the first attempt', () => {
        expect(slugWithSuffix('factoring-quadratics', 0)).toBe(
            'factoring-quadratics',
        );
    });

    it('appends an incrementing suffix on later attempts', () => {
        expect(slugWithSuffix('factoring-quadratics', 1)).toBe(
            'factoring-quadratics-2',
        );
        expect(slugWithSuffix('factoring-quadratics', 4)).toBe(
            'factoring-quadratics-5',
        );
    });

    // Attempts past the numeric ladder switch to a random token so the retry
    // loop terminates even when an owner holds many same-base slugs (routine
    // under instant-create's "untitled-activity" base, since slugs stay
    // frozen after rename).
    it('falls back to a random token past attempt 4', () => {
        const slug = slugWithSuffix('untitled-activity', 5);
        expect(slug).toMatch(/^untitled-activity-[a-z0-9]{1,6}$/);
        // Not the numeric continuation — the ladder is abandoned, not extended.
        expect(slug).not.toBe('untitled-activity-6');
    });

    it('random tokens differ across attempts (collision escape)', () => {
        const seen = new Set(
            Array.from({ length: 8 }, () =>
                slugWithSuffix('untitled-activity', 6),
            ),
        );
        // 8 draws from a 36^6 space colliding into one value is effectively
        // impossible; >1 distinct value proves the suffix isn't deterministic.
        expect(seen.size).toBeGreaterThan(1);
    });
});
