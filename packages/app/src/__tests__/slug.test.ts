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
});
