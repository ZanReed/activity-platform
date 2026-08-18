import { describe, it, expect } from 'vitest';
import { createEmptyDocument } from '@activity/schema';
import {
    applyImportedMeta,
    DEFAULT_COURSE,
    type ImportMetaTarget,
} from '../lib/applyImportedMeta';

// Ruling D16 — never-clobber. These tests exist because the rule is the kind of
// thing a future session will be tempted to "simplify" into an overwrite: the
// fresh-activity case (which dominates) behaves identically either way, so the
// protective behavior is only visible in the cases below.

const freshMeta = createEmptyDocument({ title: 'T' }).meta;

const fresh: ImportMetaTarget = {
    meta: freshMeta,
    tags: [],
    pedagogicalRole: null,
};

const settled: ImportMetaTarget = {
    meta: { ...freshMeta, course: 'Geometry', unit: 'Circles' },
    tags: ['existing'],
    pedagogicalRole: 'lesson',
};

describe('applyImportedMeta — the fresh activity (the dominant workflow)', () => {
    it('applies every key when nothing is set', () => {
        const out = applyImportedMeta(
            {
                course: 'Algebra I',
                unit: 'Quadratics',
                tags: ['factoring'],
                pedagogicalRole: 'review',
            },
            fresh,
        );
        expect(out.meta.course).toBe('Algebra I');
        expect(out.meta.unit).toBe('Quadratics');
        expect(out.tags).toEqual(['factoring']);
        expect(out.pedagogicalRole).toBe('review');
        expect(out.warnings).toEqual([]);
        expect(out.changed).toBe(true);
    });

    it('treats the untouched default course as unset', () => {
        expect(fresh.meta.course).toBe(DEFAULT_COURSE);
        const out = applyImportedMeta({ course: 'Algebra I' }, fresh);
        expect(out.meta.course).toBe('Algebra I');
        expect(out.warnings).toEqual([]);
    });
});

describe('applyImportedMeta — never-clobber (the case the rule exists for)', () => {
    it('keeps a course the author already set, and says so', () => {
        const out = applyImportedMeta({ course: 'Algebra I' }, settled);
        expect(out.meta.course).toBe('Geometry');
        expect(out.warnings.join(' ')).toMatch(/Geometry/);
        expect(out.warnings.join(' ')).toMatch(/Algebra I/);
    });

    it('keeps a unit the author already set, and says so', () => {
        const out = applyImportedMeta({ unit: 'Quadratics' }, settled);
        expect(out.meta.unit).toBe('Circles');
        expect(out.warnings.join(' ')).toMatch(/Circles/);
    });

    it('keeps a role the author already set, and says so', () => {
        const out = applyImportedMeta({ pedagogicalRole: 'practice' }, settled);
        expect(out.pedagogicalRole).toBe('lesson');
        expect(out.warnings.join(' ')).toMatch(/lesson/);
    });

    // The realistic incidental-paste case: the AI emitted a fence agreeing with
    // what is already there. Nothing changed and nothing is worth saying.
    it('stays silent when the fence AGREES with the current value', () => {
        const out = applyImportedMeta(
            { course: 'Geometry', unit: 'Circles', pedagogicalRole: 'lesson' },
            settled,
        );
        expect(out.warnings).toEqual([]);
        expect(out.changed).toBe(false);
    });

    it('reports changed=false when nothing could be applied', () => {
        const out = applyImportedMeta({ course: 'Algebra I' }, settled);
        expect(out.changed).toBe(false);
    });

    it('fills only the empty fields, leaving set ones alone', () => {
        const partial: ImportMetaTarget = {
            meta: { ...freshMeta, course: 'Geometry' },
            tags: [],
            pedagogicalRole: null,
        };
        const out = applyImportedMeta(
            { course: 'Algebra I', unit: 'Quadratics', pedagogicalRole: 'review' },
            partial,
        );
        expect(out.meta.course).toBe('Geometry');
        expect(out.meta.unit).toBe('Quadratics');
        expect(out.pedagogicalRole).toBe('review');
        expect(out.warnings.length).toBe(1);
    });
});

describe('applyImportedMeta — tags union (the deliberate exception)', () => {
    it('adds to existing tags rather than replacing them', () => {
        const out = applyImportedMeta({ tags: ['factoring'] }, settled);
        expect(out.tags).toEqual(['existing', 'factoring']);
        expect(out.warnings).toEqual([]);
    });

    it('never removes a tag the activity already has', () => {
        const out = applyImportedMeta({ tags: ['brand new'] }, settled);
        expect(out.tags).toContain('existing');
    });

    it('dedupes against existing tags without warning', () => {
        const out = applyImportedMeta({ tags: ['existing'] }, settled);
        expect(out.tags).toEqual(['existing']);
        expect(out.changed).toBe(false);
        expect(out.warnings).toEqual([]);
    });

    it('normalizes imported tags against the stored form', () => {
        const out = applyImportedMeta({ tags: ['  EXISTING  '] }, settled);
        expect(out.tags).toEqual(['existing']);
    });
});

describe('applyImportedMeta — empties and no-ops', () => {
    it('is a no-op for an empty fence', () => {
        const out = applyImportedMeta({}, settled);
        expect(out.changed).toBe(false);
        expect(out.warnings).toEqual([]);
        expect(out.meta).toBe(settled.meta);
    });

    it('treats an empty-string unit as unset', () => {
        const out = applyImportedMeta(
            { unit: 'Quadratics' },
            { ...fresh, meta: { ...freshMeta, unit: '' } },
        );
        expect(out.meta.unit).toBe('Quadratics');
    });

    it('does not mutate the target', () => {
        const before = { ...settled.meta };
        applyImportedMeta({ course: 'Algebra I', tags: ['x'] }, settled);
        expect(settled.meta).toEqual(before);
        expect(settled.tags).toEqual(['existing']);
    });
});
