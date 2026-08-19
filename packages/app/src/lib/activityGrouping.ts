// =============================================================================
// activityGrouping.ts — the curriculum outline's grouping + ordering (D3/D5)
// -----------------------------------------------------------------------------
// Ruled in the list-surface design review (docs/design/activities-list-surface.md
// D3, D5). The Activities list is the teacher's year as an outline: activities
// nested under natural-sorted unit headers, "No unit" always last.
//
// ⚠ THE DRAFT-FIRST READ — the thing not to "simplify" back to the column.
//
//   activities.unit / .course are PUBLISH-truth (0037 / taxonomy R1): the
//   publish RPC stamps them from the frozen snapshot, and NOTHING else writes
//   them. That is correct for the catalog, which lists published activities.
//
//   But this list is the AUTHOR's own view, and during a bulk-authoring sprint
//   most activities are drafts whose unit lives only in draft_content's meta —
//   the column is still NULL. Grouping on the column alone would file the
//   entire sprint under "No unit", i.e. break the outline for the exact
//   workload it was designed for.
//
//   So the list reads DRAFT-FIRST, mirroring the editor's own load priority
//   (draft > published version). The caller supplies both values; the column
//   keeps its single writer, and the outline groups by what you would see if
//   you opened the activity. The draft value is extracted SERVER-side via a
//   PostgREST json path (`draft_content->meta->>unit`), so a 150-row list
//   never ships 150 whole documents to read one string.
// =============================================================================

/** The shape the grouper needs. Both halves of each pair are optional. */
export interface GroupableActivity {
    unit?: string | null;
    draft_unit?: string | null;
    course?: string | null;
    draft_course?: string | null;
}

/** Trim to a real value, or null. '' and whitespace are "unset". */
function clean(value: string | null | undefined): string | null {
    if (typeof value !== 'string') return null;
    const t = value.trim();
    return t === '' ? null : t;
}

/** The unit this activity belongs to, draft-first. Null = unfiled. */
export function unitOf(a: GroupableActivity): string | null {
    return clean(a.draft_unit) ?? clean(a.unit);
}

/** The course this activity belongs to, draft-first. */
export function courseOf(a: GroupableActivity): string | null {
    return clean(a.draft_course) ?? clean(a.course);
}

/**
 * Natural, numeric-aware unit comparison (D5): "Unit 2" sorts before
 * "Unit 10", which plain alphabetical gets wrong. Null (unfiled) always sorts
 * LAST — the "No unit" group is a holding pen, never the top of the year.
 *
 * Deliberately NOT a stored order: units are free text with no order column,
 * and D5 ruled a naming convention ("1: Quadratics") over building a units
 * entity. Rename a unit and the outline reorders; that is the intended cost.
 */
export function compareUnits(a: string | null, b: string | null): number {
    if (a === b) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base',
    });
}

/**
 * React key for the unfiled group. Written as an explicit \u0000 escape rather
 * than a literal control character (a raw NUL in source is invisible in diffs
 * and trips tooling) — NUL is used because no real unit name can contain one,
 * so the sentinel can never collide with a unit literally named "no-unit".
 */
export const UNFILED_KEY = '\u0000no-unit';

export interface UnitGroup<T> {
    /** The unit name, or null for the trailing unfiled group. */
    unit: string | null;
    /** Stable React key — null becomes a sentinel no real unit can collide with. */
    key: string;
    rows: T[];
}

/**
 * Group activities under their unit, units natural-sorted, "No unit" last.
 *
 * Row order WITHIN a group is preserved from the input, so the caller's sort
 * (recency, from the list query) survives. That is deliberate: the outline
 * orders GROUPS by curriculum and rows by recency, which is what makes the
 * most-recently-touched activity in a unit sit at the top of that unit.
 */
export function groupByUnit<T extends GroupableActivity>(
    rows: readonly T[],
): UnitGroup<T>[] {
    const byUnit = new Map<string | null, T[]>();
    for (const row of rows) {
        const unit = unitOf(row);
        const bucket = byUnit.get(unit);
        if (bucket) bucket.push(row);
        else byUnit.set(unit, [row]);
    }
    return [...byUnit.entries()]
        .sort(([a], [b]) => compareUnits(a, b))
        .map(([unit, groupRows]) => ({
            unit,
            key: unit ?? UNFILED_KEY,
            rows: groupRows,
        }));
}

/**
 * Distinct courses present, for deciding whether headers should name the
 * course at all. A teacher with one course does not need "Algebra II" repeated
 * above every unit — that is constant, and constants are noise.
 */
export function distinctCourses(
    rows: readonly GroupableActivity[],
): string[] {
    const seen = new Set<string>();
    for (const row of rows) {
        const c = courseOf(row);
        if (c !== null) seen.add(c);
    }
    return [...seen].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );
}
