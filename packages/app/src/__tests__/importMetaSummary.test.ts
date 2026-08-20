// =============================================================================
// importMetaSummary.test.ts — the ```meta fence's summary line
// -----------------------------------------------------------------------------
// The behaviour under test is small; ONE row here is not.
//
// "an unknown fence key still appears" is the whole reason this module derives
// its field set from Object.keys() instead of listing the keys it knows. This
// repo has paid twice this month for a hand-maintained list nobody remembered
// to join (the renderer's per-type numbering grid, LABELED_BLOCK_TYPES), and a
// list inside a SUMMARY LINE is the worst kind: when it goes stale the feature
// keeps working, the tests keep passing, and the only symptom is that an
// author cannot see a field they typed.
//
// So that row passes a key this module has never heard of and asserts it is
// still reported. It is deliberately written to fail if someone "tidies" the
// derivation into a fixed array.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
    importedMetaFields,
    importMetaSummary,
} from '../lib/importMetaSummary';
import type { ImportedMeta } from '../lib/markdownToTiptap';

describe('importMetaSummary', () => {
    it('reports nothing when there was no meta fence', () => {
        expect(importMetaSummary(undefined)).toBe('');
        expect(importedMetaFields(undefined)).toEqual([]);
    });

    it('names each field the fence carried, in parser order', () => {
        const meta: ImportedMeta = {
            title: 'Factoring Quadratics',
            course: 'Algebra I',
            unit: 'Unit 3',
            pedagogicalRole: 'practice',
        };
        expect(importMetaSummary(meta)).toBe(
            'meta: title · course · unit · role',
        );
    });

    it('counts tags rather than naming them', () => {
        expect(importedMetaFields({ tags: ['a', 'b', 'c'] })).toEqual(['3 tags']);
        expect(importedMetaFields({ tags: ['a'] })).toEqual(['1 tag']);
    });

    it('drops an empty tag list — nothing landed, so nothing is claimed', () => {
        expect(importedMetaFields({ tags: [] })).toEqual([]);
    });

    it('reports the settings keys the fence can carry', () => {
        const meta: ImportedMeta = {
            submissionMode: 'locked',
            activityType: 'exit_ticket',
            calculatorMode: 'scientific',
        };
        expect(importMetaSummary(meta)).toBe(
            'meta: submission mode · activity type · calculator',
        );
    });

    it('distinguishes "fence read, nothing recognised" from "no fence"', () => {
        // A typo'd fence parses to an empty object. Reporting that identically
        // to "no fence at all" would send the author looking in the wrong file.
        expect(importMetaSummary({})).toBe(
            'meta fence read, but no fields recognised',
        );
        expect(importMetaSummary(undefined)).toBe('');
    });

    it('still reports a fence key this module has never heard of', () => {
        // THE LOAD-BEARING ROW — see the header. `gradeLevel` does not exist in
        // ImportedMeta today. When some future slice adds a fence key, the
        // summary line must show it on day one, reading a little awkwardly,
        // rather than staying silent until someone remembers this file.
        //
        // The cast is the point: it constructs the future, which is exactly
        // what a type cannot do for us here.
        const future = { gradeLevel: '9' } as unknown as ImportedMeta;

        expect(importedMetaFields(future)).toEqual(['gradeLevel']);
        expect(importMetaSummary(future)).toBe('meta: gradeLevel');
    });

    it('skips a key whose value is explicitly undefined', () => {
        const meta = { title: 'T', course: undefined } as ImportedMeta;
        expect(importedMetaFields(meta)).toEqual(['title']);
    });
});
