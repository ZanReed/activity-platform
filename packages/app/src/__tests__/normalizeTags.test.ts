import { describe, it, expect } from 'vitest';
import {
    normalizeTag,
    normalizeTags,
    collectTagVocabulary,
} from '../lib/normalizeTags';

// The taxonomy slice's normalization contract (docs/design/activity-taxonomy.md
// R5). These tests ARE the contract — every write path routes through this one
// function precisely so the vocabulary can't fragment, and a second write path
// that skipped it would fragment silently, which is only visible once the
// corpus is too large to fix by hand.

describe('normalizeTag', () => {
    it('lowercases', () => {
        expect(normalizeTag('Factoring')).toBe('factoring');
    });

    it('trims', () => {
        expect(normalizeTag('  factoring  ')).toBe('factoring');
    });

    it('collapses internal whitespace runs to one space', () => {
        expect(normalizeTag('word    problems')).toBe('word problems');
    });

    it('collapses tabs and newlines, not just spaces', () => {
        expect(normalizeTag('word\t\nproblems')).toBe('word problems');
    });

    it('returns null for an empty string', () => {
        expect(normalizeTag('')).toBeNull();
    });

    it('returns null for a whitespace-only string', () => {
        expect(normalizeTag('   \t ')).toBeNull();
    });

    // The reason a strict ASCII kebab slug was rejected in review: this is a
    // personal curriculum vocabulary, and the author is in NZ.
    it('preserves unicode letters, including macrons', () => {
        expect(normalizeTag('Māori')).toBe('māori');
    });

    it('preserves accents rather than stripping them (unlike slugify)', () => {
        expect(normalizeTag('Café')).toBe('café');
    });

    it('keeps punctuation and hyphens intact', () => {
        expect(normalizeTag('AP-prep')).toBe('ap-prep');
    });
});

describe('normalizeTags', () => {
    it('normalizes every entry', () => {
        expect(normalizeTags(['Factoring', '  Word  Problems '])).toEqual([
            'factoring',
            'word problems',
        ]);
    });

    it('dedupes entries that collide only after normalizing', () => {
        expect(
            normalizeTags(['Factoring', 'factoring', 'FACTORING  ']),
        ).toEqual(['factoring']);
    });

    it('keeps first-occurrence order, not sorted order', () => {
        expect(normalizeTags(['zebra', 'apple', 'mango'])).toEqual([
            'zebra',
            'apple',
            'mango',
        ]);
    });

    it('drops empty and whitespace-only entries', () => {
        expect(normalizeTags(['factoring', '', '   ', 'graphing'])).toEqual([
            'factoring',
            'graphing',
        ]);
    });

    // A malformed import must not be able to inject "[object Object]" or
    // "null" into the vocabulary — non-strings are dropped, never coerced.
    it('drops non-string entries rather than coercing them', () => {
        expect(
            normalizeTags(['factoring', null, undefined, 42, {}, ['nested']]),
        ).toEqual(['factoring']);
    });

    it('returns an empty array for empty input', () => {
        expect(normalizeTags([])).toEqual([]);
    });

    it('is idempotent — normalizing stored tags changes nothing', () => {
        const once = normalizeTags(['  Word  Problems ', 'Factoring']);
        expect(normalizeTags(once)).toEqual(once);
    });

    // Deliberately NOT resolved: synonym/plural drift is editorial, held by
    // curation plus the typeahead. Pinned so a future session doesn't "fix"
    // it into the function without ruling the controlled vocabulary first.
    it('does NOT resolve singular/plural or synonyms', () => {
        expect(normalizeTags(['factoring', 'factorising'])).toEqual([
            'factoring',
            'factorising',
        ]);
        expect(normalizeTags(['word problem', 'word problems'])).toEqual([
            'word problem',
            'word problems',
        ]);
    });
});

describe('collectTagVocabulary', () => {
    it('unions tags across activities, deduped and sorted', () => {
        expect(
            collectTagVocabulary([
                { tags: ['graphing', 'factoring'] },
                { tags: ['factoring', 'apple'] },
            ]),
        ).toEqual(['apple', 'factoring', 'graphing']);
    });

    it('tolerates missing and null tag arrays', () => {
        expect(
            collectTagVocabulary([
                { tags: ['factoring'] },
                { tags: null },
                {},
            ]),
        ).toEqual(['factoring']);
    });

    it('normalizes on the way in, so legacy rows cannot fragment the list', () => {
        expect(
            collectTagVocabulary([
                { tags: ['Factoring'] },
                { tags: ['  factoring  '] },
            ]),
        ).toEqual(['factoring']);
    });

    it('returns an empty array when nothing is tagged', () => {
        expect(collectTagVocabulary([{ tags: [] }, {}])).toEqual([]);
    });
});
