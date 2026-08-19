import { describe, it, expect } from 'vitest';
import { createCalculatorTool, createEmptyDocument } from '@activity/schema';
import {
    applyImportedMeta,
    DEFAULT_COURSE,
    DEFAULT_TITLE,
    type ImportMetaTarget,
} from '../lib/applyImportedMeta';

// Ruling D16 — never-clobber. These tests exist because the rule is the kind of
// thing a future session will be tempted to "simplify" into an overwrite: the
// fresh-activity case (which dominates) behaves identically either way, so the
// protective behavior is only visible in the cases below.

const freshMeta = createEmptyDocument({ title: DEFAULT_TITLE }).meta;

const fresh: ImportMetaTarget = {
    meta: freshMeta,
    tags: [],
    pedagogicalRole: null,
    calculator: undefined,
};

const settled: ImportMetaTarget = {
    meta: {
        ...freshMeta,
        course: 'Geometry',
        unit: 'Circles',
        submissionMode: 'locked',
        activityType: 'exit_ticket',
        answerFeedback: 'immediate',
    },
    tags: ['existing'],
    pedagogicalRole: 'lesson',
    calculator: createCalculatorTool(),
};

describe('applyImportedMeta — the fresh activity (the dominant workflow)', () => {
    it('applies every key when nothing is set', () => {
        const out = applyImportedMeta(
            {
                title: 'Factoring Trinomials',
                course: 'Algebra I',
                unit: 'Quadratics',
                tags: ['factoring'],
                pedagogicalRole: 'review',
            },
            fresh,
        );
        expect(out.meta.title).toBe('Factoring Trinomials');
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
    // The catalogue case: a freshly created activity still holds the
    // create-time placeholder, so the imported title names it.
    it('names an activity still holding the "Untitled activity" placeholder', () => {
        const out = applyImportedMeta({ title: 'Factoring Trinomials' }, fresh);
        expect(out.meta.title).toBe('Factoring Trinomials');
        expect(out.warnings).toEqual([]);
        expect(out.changed).toBe(true);
    });

    it('keeps a title the author already gave, and says so', () => {
        const named: ImportMetaTarget = {
            ...fresh,
            meta: { ...freshMeta, title: 'My Own Name' },
        };
        const out = applyImportedMeta({ title: 'Factoring Trinomials' }, named);
        expect(out.meta.title).toBe('My Own Name');
        expect(out.warnings.join(' ')).toMatch(/My Own Name/);
        expect(out.changed).toBe(false);
    });

    it('treats a blank title as unset', () => {
        const blank: ImportMetaTarget = {
            ...fresh,
            meta: { ...freshMeta, title: '   ' },
        };
        expect(applyImportedMeta({ title: 'Named' }, blank).meta.title).toBe(
            'Named',
        );
    });

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
            calculator: undefined,
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

describe('applyImportedMeta — activity settings', () => {
    it('applies every setting to an untouched activity', () => {
        const out = applyImportedMeta(
            {
                submissionMode: 'locked',
                revisionMode: 'locked',
                activityType: 'exit_ticket',
                answerFeedback: 'immediate',
                calculatorMode: 'graphing',
            },
            fresh,
        );
        expect(out.meta.submissionMode).toBe('locked');
        expect(out.meta.revisionMode).toBe('locked');
        expect(out.meta.activityType).toBe('exit_ticket');
        expect(out.meta.answerFeedback).toBe('immediate');
        expect(out.calculator?.enabled).toBe(true);
        expect(out.calculator?.restrictions.mode).toBe('graphing');
        expect(out.warnings).toEqual([]);
        expect(out.changed).toBe(true);
    });

    // Each setting's "unset" test is its SCHEMA DEFAULT — they always have a
    // value, so an absence test could never let the fence set them.
    it('treats each schema default as unset', () => {
        expect(freshMeta.submissionMode).toBe('free');
        expect(freshMeta.revisionMode).toBe('free');
        expect(freshMeta.activityType).toBe('worksheet');
        expect(freshMeta.answerFeedback).toBe('on_check');
    });

    it('keeps settings the author already changed, and says so', () => {
        const out = applyImportedMeta(
            {
                submissionMode: 'free',
                activityType: 'worksheet',
                answerFeedback: 'on_check',
            },
            settled,
        );
        expect(out.meta.submissionMode).toBe('locked');
        expect(out.meta.activityType).toBe('exit_ticket');
        expect(out.meta.answerFeedback).toBe('immediate');
        expect(out.warnings).toHaveLength(3);
        expect(out.changed).toBe(false);
    });

    it('stays silent when a setting agrees with what is already there', () => {
        const out = applyImportedMeta({ submissionMode: 'locked' }, settled);
        expect(out.warnings).toEqual([]);
        expect(out.changed).toBe(false);
    });

    it('builds the calculator from the schema factory, not re-listed defaults', () => {
        const out = applyImportedMeta({ calculatorMode: 'scientific' }, fresh);
        expect(out.calculator).toEqual(createCalculatorTool());
    });

    // 'off' on an activity that has no calculator agrees with reality — there
    // is nothing to change and nothing worth saying.
    it('is a silent no-op for calculator: off on an activity with none', () => {
        const out = applyImportedMeta({ calculatorMode: 'off' }, fresh);
        expect(out.calculator).toBeUndefined();
        expect(out.changed).toBe(false);
        expect(out.warnings).toEqual([]);
    });

    it('never turns OFF a calculator the author enabled', () => {
        const out = applyImportedMeta({ calculatorMode: 'off' }, settled);
        expect(out.calculator).toBe(settled.calculator);
        expect(out.warnings.join(' ')).toMatch(/calculator/);
    });

    it('never switches the mode of a calculator already configured', () => {
        const out = applyImportedMeta({ calculatorMode: 'graphing' }, settled);
        expect(out.calculator?.restrictions.mode).toBe('scientific');
        expect(out.warnings.join(' ')).toMatch(/scientific/);
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
