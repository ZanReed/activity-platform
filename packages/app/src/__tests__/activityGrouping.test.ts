import { describe, it, expect } from 'vitest';
import {
    UNFILED_KEY,
    comparePaths,
    compareUnits,
    courseOf,
    distinctCourses,
    groupByUnit,
    sortForOutline,
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

// =============================================================================
// LANE B — catalogue-path ordering
// -----------------------------------------------------------------------------
// ⚠ THE DENSITY THESE TESTS EXIST TO CARRY. Lane B was built against 4
// file-backed rows out of 51 planned parts, so every failure mode below is
// invisible in the live database today and obvious at full catalogue. The
// fixtures deliberately carry what the database does not: multi-chain units,
// mixed path/no-path groups, and the two pairs that a whole-string comparator
// collapses to equal.
// =============================================================================

describe('comparePaths — a total order over catalogue paths', () => {
    // Defect 3. Whole-string localeCompare gets this backwards because '-'
    // precedes '/', so a folder whose name prefixes a sibling's interleaves
    // its children across the boundary.
    it('compares segment-by-segment, not as one string', () => {
        expect(
            comparePaths(
                '01-chain.a/01-a.md',
                '01-chain.a-review/01-z.md',
            ),
        ).toBeLessThan(0);
        // The whole-string comparator this replaces returned the opposite.
        expect(
            '01-chain.a/01-a.md'.localeCompare(
                '01-chain.a-review/01-z.md',
                undefined,
                { numeric: true, sensitivity: 'base' },
            ),
        ).toBeGreaterThan(0);
    });

    it('sorts numerals numerically inside a segment', () => {
        expect(
            comparePaths('01-chain.a/02-x.md', '01-chain.a/10-x.md'),
        ).toBeLessThan(0);
    });

    // Defect 2, pair one. Measured 0 under the plan's options AND still 0 at
    // default sensitivity — numeric collation reads both as the number 1, so
    // the raw-string tie-break is the half that actually separates them.
    it('separates paths that differ only by a leading zero', () => {
        expect(comparePaths('01-a/01-x.md', '01-a/1-x.md')).not.toBe(0);
    });

    // Defect 2, pair two — and a note about WHICH half of the fix carries it.
    // Distinctness here is carried by the raw-string tie-break, NOT by the
    // sensitivity setting: mutating sensitivity back to 'base' left this
    // assertion GREEN, so on its own it is a vacuous guard for that half.
    it('separates paths that differ only by case', () => {
        expect(comparePaths('A.md', 'a.md')).not.toBe(0);
    });

    // This is the assertion that actually binds default sensitivity. Under
    // 'base' an earlier segment's case difference is ignored, the decision
    // falls through to a later segment, and these two swap places (measured:
    // -1 at default sensitivity, +1 under 'base'). Case is decided at the
    // segment that differs, not at a later one.
    it('decides case at the segment where it differs', () => {
        expect(comparePaths('a/B.md', 'A/b.md')).toBeLessThan(0);
    });

    it('sorts a path before one it prefixes', () => {
        expect(comparePaths('a/b', 'a/b/c')).toBeLessThan(0);
    });

    it('is zero only for identical strings', () => {
        expect(comparePaths('01-a/01-x.md', '01-a/01-x.md')).toBe(0);
    });

    // The property the two pairs above are instances of: distinct paths must
    // never compare equal, or they fall silently through to recency.
    it('is total and antisymmetric across a dense corpus', () => {
        const corpus = [
            '01-chain.a/01-a.md',
            '01-chain.a/1-a.md',
            '01-chain.a/02-b.md',
            '01-chain.a/10-b.md',
            '01-chain.a-review/01-z.md',
            '01-chain.b/01-a.md',
            '02-chain.a/01-a.md',
            'A.md',
            'a.md',
            'a/b',
            'a/b/c',
        ];
        for (const x of corpus) {
            for (const y of corpus) {
                const cmp = comparePaths(x, y);
                if (x === y) {
                    expect(cmp).toBe(0);
                    continue;
                }
                expect(cmp).not.toBe(0);
                // Antisymmetry. Asserted only for distinct strings — for
                // equal ones -Math.sign(0) is -0, which Object.is separates
                // from 0, and that is an artifact of the assertion rather
                // than anything about the comparator.
                expect(Math.sign(comparePaths(y, x))).toBe(-Math.sign(cmp));
            }
        }
        // Transitivity, over every ordered triple of the sorted corpus.
        const sorted = [...corpus].sort(comparePaths);
        for (let i = 0; i < sorted.length; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                expect(
                    comparePaths(sorted[i] as string, sorted[j] as string),
                ).toBeLessThan(0);
            }
        }
    });
});

describe('sortForOutline — path first, path-less by recency after', () => {
    it('orders file-backed rows by catalogue path, ignoring recency', () => {
        const rows = [
            { id: 'c', source_path: '01-chain.a/03-c.md', updated_at: '2026-08-30T00:00:00Z' },
            { id: 'a', source_path: '01-chain.a/01-a.md', updated_at: '2026-08-01T00:00:00Z' },
            { id: 'b', source_path: '01-chain.a/02-b.md', updated_at: '2026-08-20T00:00:00Z' },
        ];
        expect(sortForOutline(rows).map((r) => r.id)).toEqual(['a', 'b', 'c']);
    });

    // The mixed group — today's 100% case is the all-path-less end of it.
    it('puts path-less rows after every file-backed row, newest first', () => {
        const rows = [
            { id: 'hand-old', updated_at: '2026-08-01T00:00:00Z' },
            { id: 'file-b', source_path: '01-chain.a/02-b.md', updated_at: '2026-07-01T00:00:00Z' },
            { id: 'hand-new', updated_at: '2026-08-29T00:00:00Z' },
            { id: 'file-a', source_path: '01-chain.a/01-a.md', updated_at: '2026-07-02T00:00:00Z' },
        ];
        expect(sortForOutline(rows).map((r) => r.id)).toEqual([
            'file-a',
            'file-b',
            'hand-new',
            'hand-old',
        ]);
    });

    it('does not mutate its input', () => {
        const rows = [
            { id: 'b', source_path: '01-chain.a/02-b.md' },
            { id: 'a', source_path: '01-chain.a/01-a.md' },
        ];
        sortForOutline(rows);
        expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
    });
});

describe('groupByUnit — group order by catalogue path', () => {
    // A MULTI-CHAIN UNIT: one unit whose rows come from two chain folders.
    // The unit's order key is its LOWEST path, so a later chain cannot drag
    // the unit down the page.
    const multiChain = [
        { id: 'r1', draft_unit: 'Rates', source_path: '02-chain.rate.compare/01-a.md' },
        { id: 'r2', draft_unit: 'Rates', source_path: '01-chain.rate.proportional/01-a.md' },
        { id: 'g1', draft_unit: 'Graphs', source_path: '03-chain.graph/01-a.md' },
    ];

    it('orders groups by their LOWEST catalogue path', () => {
        const groups = groupByUnit(multiChain);
        expect(groups.map((g) => g.unit)).toEqual(['Rates', 'Graphs']);
    });

    it('puts groups with no catalogue path after every group that has one', () => {
        const groups = groupByUnit([
            { draft_unit: 'Aardvarks' },
            { draft_unit: 'Zebras', source_path: '09-chain.z/01-a.md' },
        ]);
        // Alphabetically Aardvarks wins; by curriculum path it does not.
        expect(groups.map((g) => g.unit)).toEqual(['Zebras', 'Aardvarks']);
    });

    // Today's 100% case: no row anywhere has a path, so D5's natural sort has
    // to remain the whole fallback.
    it('falls back to compareUnits when no group has a path', () => {
        const groups = groupByUnit([
            { draft_unit: 'Unit 10: Radicals' },
            { draft_unit: 'Unit 2: Quadratics' },
        ]);
        expect(groups.map((g) => g.unit)).toEqual([
            'Unit 2: Quadratics',
            'Unit 10: Radicals',
        ]);
    });

    it('keeps "No unit" last even when its rows carry a path', () => {
        const groups = groupByUnit([
            { draft_unit: null, source_path: '00-aaa/01-a.md' },
            { draft_unit: 'Rates', source_path: '01-chain.a/01-a.md' },
        ]);
        expect(groups.map((g) => g.unit)).toEqual(['Rates', null]);
    });

    // ── D6, at the library level ────────────────────────────────────────────
    // The component test is the binding guard (it renders the filtered view);
    // this pins the mechanism directly.
    it('derives group order from orderFrom, not from the rows passed in', () => {
        const all = [
            { id: 'file', draft_unit: 'Rates', source_path: '01-chain.a/01-a.md' },
            { id: 'hand', draft_unit: 'Rates' },
            { id: 'other', draft_unit: 'Algebra', source_path: '02-chain.b/01-a.md' },
        ];
        // A filter that removes the ONLY row carrying the Rates min-path.
        const filtered = all.filter((r) => r.id !== 'file');
        expect(
            groupByUnit(filtered, { orderFrom: all }).map((g) => g.unit),
        ).toEqual(['Rates', 'Algebra']);
        // Without orderFrom the group moves — which is the defect.
        expect(groupByUnit(filtered).map((g) => g.unit)).toEqual([
            'Algebra',
            'Rates',
        ]);
    });

    it('still preserves input row order within a group', () => {
        const groups = groupByUnit(multiChain);
        expect(
            groups.find((g) => g.unit === 'Rates')?.rows.map((r) => r.id),
        ).toEqual(['r1', 'r2']);
    });
});
