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

/** The shape the grouper needs. Every field is optional. */
export interface GroupableActivity {
    unit?: string | null;
    draft_unit?: string | null;
    course?: string | null;
    draft_course?: string | null;
    /**
     * The catalogue file this activity was imported from (0038). NULL for every
     * hand-made activity, which is the common case — see comparePaths below for
     * what the ordering does with that.
     */
    source_path?: string | null;
    /** ISO timestamp. The recency fallback for rows with no catalogue path. */
    updated_at?: string;
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
 * Group activities under their unit.
 *
 * Row order WITHIN a group is preserved from the input, so the caller's sort
 * survives — that contract is unchanged, and the caller now sorts with
 * `sortForOutline` (catalogue path, then recency) rather than by recency alone.
 *
 * GROUP order is where Lane B forked from the plan, and `options.orderFrom` is
 * that fork made explicit. Ordering groups by their lowest catalogue path means
 * group order is derived from ROW DATA — and this function's one caller passes
 * the FILTERED array, so without `orderFrom` the group order would be
 * recomputed on every keystroke: a search matching only the app-authored rows
 * in a mixed unit removes that group's min-path and relocates the group while
 * the teacher is still typing. D6 rules "group order stays stable among
 * survivors", and its own rationale is that the UNFILTERED outline is the
 * stable spatial map. So the ordering key is computed from `orderFrom` — the
 * full set — while the buckets come from `rows`. Filtering can then only ever
 * REMOVE a group, never move one.
 *
 * Groups are ordered: lowest catalogue path first (comparePaths), then
 * path-less groups by unit name (compareUnits, D5's natural sort), with the
 * unfiled "No unit" group always last regardless of either — it is a holding
 * pen, and a file-backed activity that declares no unit does not earn a place
 * in the curriculum sequence.
 *
 * @param options.orderFrom The UNFILTERED activity set to derive group order
 *   from. Omitted, it falls back to `rows`, which is correct only when `rows`
 *   is itself unfiltered.
 */
export function groupByUnit<T extends GroupableActivity>(
    rows: readonly T[],
    options?: { orderFrom?: readonly GroupableActivity[] },
): UnitGroup<T>[] {
    const byUnit = new Map<string | null, T[]>();
    for (const row of rows) {
        const unit = unitOf(row);
        const bucket = byUnit.get(unit);
        if (bucket) bucket.push(row);
        else byUnit.set(unit, [row]);
    }

    // Each unit's lowest catalogue path, over the UNFILTERED set.
    const minPath = new Map<string | null, string>();
    for (const row of options?.orderFrom ?? rows) {
        const path = pathOf(row);
        if (path === null) continue;
        const unit = unitOf(row);
        const current = minPath.get(unit);
        if (current === undefined || comparePaths(path, current) < 0) {
            minPath.set(unit, path);
        }
    }

    return [...byUnit.entries()]
        .sort(([a], [b]) => {
            // "No unit" is last whatever its rows carry (D5).
            if (a === null) return 1;
            if (b === null) return -1;
            const pa = minPath.get(a);
            const pb = minPath.get(b);
            if (pa !== undefined && pb !== undefined) {
                return comparePaths(pa, pb);
            }
            if (pa !== undefined) return -1;
            if (pb !== undefined) return 1;
            return compareUnits(a, b);
        })
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

// =============================================================================
// LANE B — catalogue-path ordering (2026-08-31)
// -----------------------------------------------------------------------------
// The outline's ordering source of truth is the catalogue PATH, not a number
// typed into the unit name. Ruled in curriculum-alignment; it supersedes D5's
// naming convention ("1: Quadratics") for every file-backed activity, and it
// is not cosmetic: `unit` is student-visible in BOTH student surfaces
// (StudentViewer's `course · unit · type` line and the print layer), so
// numbering the unit string puts curriculum bookkeeping in front of students on
// every worksheet. Ordering by path is what keeps the chain ordinal out of it.
// =============================================================================

/** The source path of this activity, or null for a hand-made one. */
function pathOf(a: GroupableActivity): string | null {
    return clean(a.source_path);
}

/**
 * Total order over catalogue paths. Three properties, each of which was a
 * measured defect in the plan this replaces:
 *
 * 1. SEGMENT-WISE, split on '/'. Whole-string localeCompare does not sort
 *    paths, because '-' precedes '/': measured, '01-chain.a-review/01-z.md'
 *    sorted BEFORE '01-chain.a/01-a.md', so a folder whose name prefixes a
 *    sibling's interleaves its children across the boundary.
 * 2. DEFAULT SENSITIVITY, not 'base'. compareUnits uses sensitivity:'base'
 *    deliberately (D5 — unit names are free text and case is not meaningful),
 *    and that is why this is a SEPARATE comparator rather than a reused one.
 *    ⚠ What this buys is narrower than it first looks, and mutation testing
 *    is what established the difference: it does NOT carry distinctness for
 *    'A.md' vs 'a.md' — property 3 below already does that, and reverting
 *    this to 'base' left the distinctness test green. What it carries is
 *    CONSISTENT case ordering: under 'base' a case difference in an earlier
 *    segment is ignored and the decision falls to a later one, so 'a/B.md'
 *    and 'A/b.md' swap. Case is decided where it differs.
 * 3. RAW-STRING TIE-BREAK, and it is the load-bearing half. Default
 *    sensitivity alone does NOT separate '01-x.md' from '1-x.md' — measured 0
 *    under {numeric:true} at default sensitivity, because numeric collation
 *    reads both segments as the number 1. Without the tie-break, distinct
 *    paths compare equal and fall silently through to recency.
 *
 * A path that is a prefix of another sorts first ('01-a/01-x.md' before
 * '01-a/01-x.md/…' can't occur, but 'a/b' before 'a/b/c' is well defined).
 */
export function comparePaths(a: string, b: string): number {
    const as = a.split('/');
    const bs = b.split('/');
    const shared = Math.min(as.length, bs.length);
    for (let i = 0; i < shared; i++) {
        // Non-null: i < the length of both arrays.
        const cmp = (as[i] as string).localeCompare(bs[i] as string, undefined, {
            numeric: true,
        });
        if (cmp !== 0) return cmp;
    }
    if (as.length !== bs.length) return as.length - bs.length;
    // Every segment collated equal but the strings may still differ (leading
    // zeros, case). Raw comparison makes the order total.
    return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Row order inside a unit group: catalogue path first, path-less rows after,
 * recency among those.
 *
 * WHY RECENCY LOST ITS PRIMACY. D4's recently-edited strip already serves
 * resume-work at page level, so within-unit recency was redundant with a
 * feature that had already shipped — while chain teaching order was invisible
 * on the one screen a teacher teaches from.
 *
 * Path-less rows sort AFTER path-backed ones for the same reason "No unit" is
 * last: a hand-made activity has no place in the curriculum sequence, and
 * interleaving it by name would assert one it does not have.
 */
function compareForOutline(
    a: GroupableActivity,
    b: GroupableActivity,
): number {
    const pa = pathOf(a);
    const pb = pathOf(b);
    if (pa !== null && pb !== null) {
        const cmp = comparePaths(pa, pb);
        if (cmp !== 0) return cmp;
    } else if (pa !== null) return -1;
    else if (pb !== null) return 1;
    // Recency, newest first — the order the list query already returns.
    const ua = a.updated_at ?? '';
    const ub = b.updated_at ?? '';
    return ub.localeCompare(ua);
}

/** Sort a copy of `rows` into outline order. Never mutates the input. */
export function sortForOutline<T extends GroupableActivity>(
    rows: readonly T[],
): T[] {
    return [...rows].sort(compareForOutline);
}
