import { describe, it, expect } from 'vitest';
import {
    UNFILED_KEY,
    compareUnits,
    courseOf,
    distinctCourses,
    groupByUnit,
    unitOf,
} from '../lib/activityGrouping';

// The curriculum outline's grouping contract (design review D3/D5). The
// draft-first rule is the load-bearing part: activities.unit is publish-truth
// (taxonomy R1), so grouping on the column alone would file an entire
// authoring sprint — which is mostly drafts — under "No unit".

describe('unitOf / courseOf — draft-first', () => {
    it('prefers the draft value over the published column', () => {
        expect(unitOf({ unit: 'Old Unit', draft_unit: 'New Unit' })).toBe(
            'New Unit',
        );
        expect(
            courseOf({ course: 'Algebra II', draft_course: 'Geometry' }),
        ).toBe('Geometry');
    });

    // The case the rule exists for: a never-published draft has NO column
    // value, only a draft one.
    it('reads the draft when the column is null (unpublished activity)', () => {
        expect(unitOf({ unit: null, draft_unit: 'Quadratics' })).toBe(
            'Quadratics',
        );
    });

    // And the reverse: a published activity with no pending draft.
    it('falls back to the column when there is no draft', () => {
        expect(unitOf({ unit: 'Quadratics', draft_unit: null })).toBe(
            'Quadratics',
        );
    });

    it('treats blank and whitespace-only values as unset', () => {
        expect(unitOf({ unit: '   ', draft_unit: '' })).toBeNull();
        expect(unitOf({ unit: 'Quadratics', draft_unit: '  ' })).toBe(
            'Quadratics',
        );
    });

    it('is null when nothing is set', () => {
        expect(unitOf({})).toBeNull();
        expect(courseOf({})).toBeNull();
    });

    it('trims a real value', () => {
        expect(unitOf({ draft_unit: '  Quadratics  ' })).toBe('Quadratics');
    });
});

describe('compareUnits — natural sort, unfiled last (D5)', () => {
    it('sorts numerals numerically, not alphabetically', () => {
        expect(compareUnits('Unit 2', 'Unit 10')).toBeLessThan(0);
    });

    it('sorts plain names alphabetically', () => {
        expect(compareUnits('Polynomials', 'Quadratics')).toBeLessThan(0);
    });

    it('puts null (No unit) last against any named unit', () => {
        expect(compareUnits(null, 'Quadratics')).toBeGreaterThan(0);
        expect(compareUnits('Quadratics', null)).toBeLessThan(0);
    });

    it('treats two nulls as equal', () => {
        expect(compareUnits(null, null)).toBe(0);
    });

    it('is case-insensitive', () => {
        expect(compareUnits('quadratics', 'Quadratics')).toBe(0);
    });
});

describe('groupByUnit', () => {
    const rows = [
        { id: 'a', draft_unit: 'Unit 10: Radicals' },
        { id: 'b', draft_unit: 'Unit 2: Quadratics' },
        { id: 'c', draft_unit: null, unit: null },
        { id: 'd', draft_unit: 'Unit 2: Quadratics' },
    ];

    it('groups by unit with natural-sorted groups and No-unit last', () => {
        const groups = groupByUnit(rows);
        expect(groups.map((g) => g.unit)).toEqual([
            'Unit 2: Quadratics',
            'Unit 10: Radicals',
            null,
        ]);
    });

    it('preserves input row order within a group (recency survives)', () => {
        const groups = groupByUnit(rows);
        const quad = groups.find((g) => g.unit === 'Unit 2: Quadratics');
        expect(quad?.rows.map((r) => r.id)).toEqual(['b', 'd']);
    });

    it('gives the unfiled group a key no real unit can collide with', () => {
        const groups = groupByUnit(rows);
        const unfiled = groups.find((g) => g.unit === null);
        expect(unfiled?.key).toBe(UNFILED_KEY);
        // A unit literally named "no-unit" must not share the sentinel.
        const collide = groupByUnit([{ draft_unit: 'no-unit' }]);
        expect(collide[0]?.key).toBe('no-unit');
    });

    it('returns an empty array for no rows', () => {
        expect(groupByUnit([])).toEqual([]);
    });

    it('produces one group when nothing is filed', () => {
        const groups = groupByUnit([{}, {}]);
        expect(groups).toHaveLength(1);
        expect(groups[0]?.unit).toBeNull();
        expect(groups[0]?.rows).toHaveLength(2);
    });
});

describe('distinctCourses', () => {
    it('dedupes and sorts, ignoring unset', () => {
        expect(
            distinctCourses([
                { draft_course: 'Geometry' },
                { course: 'Algebra II' },
                { draft_course: 'Geometry' },
                {},
            ]),
        ).toEqual(['Algebra II', 'Geometry']);
    });

    // Drives whether headers name the course at all — one course means the
    // name is a constant, and constants are noise.
    it('returns one entry when the whole library is one course', () => {
        expect(
            distinctCourses([{ course: 'Algebra II' }, { course: 'Algebra II' }]),
        ).toHaveLength(1);
    });
});
