// =============================================================================
// activityMinutes.ts — an activity's time estimate (period planner PP-5, 0088)
// -----------------------------------------------------------------------------
// `activities.minutes` is a ROW column (1–120, NULL = not set), like
// pedagogical_role, and never document meta. It has THREE writers and one rule
// between them:
//   - the batch importer, from a file's `minutes:` (NOT_CONTENT: a minutes-only
//     change writes no draft; an absent key leaves the column alone);
//   - the settings drawer's field, which writes `minutes` ALONE (autosave sends
//     row fields with draft_content, so riding along would draft a published
//     Bank copy);
//   - a paste's ```meta fence, which fills it only when the activity has none
//     (D16's never-clobber rule).
// No guessed default anywhere: "time not set" is shown, never the graph's 32,
// which is a cap and not an estimate.
// =============================================================================

// A LEAF on purpose (no imports): the Activities list and the settings drawer
// read it, so it must not drag the markdown parser into the eager bundle.

/** The `activities.minutes` CHECK's ceiling (0088). */
export const MAX_ACTIVITY_MINUTES = 120;

/**
 * The drawer's (and a paste's) UPDATE body: `minutes` ALONE. No draft_content
 * (it would draft a published activity) and no updated_at (it would move G-8's
 * conflict baseline under an open tab). Pinned exactly by its test.
 */
export function minutesUpdate(next: number | null): { minutes: number | null } {
    return { minutes: next };
}

/** The list and card wording. */
export function formatActivityMinutes(minutes: number): string {
    return `about ${minutes} min`;
}

export type MinutesInput =
    | { ok: true; minutes: number | null }
    | { ok: false; message: string };

/** The drawer field's text → a column value. Blank clears it. */
export function parseMinutesInput(raw: string): MinutesInput {
    const text = raw.trim();
    if (text === '') return { ok: true, minutes: null };
    if (!/^\d+$/.test(text)) {
        return { ok: false, message: `Whole minutes, 1 to ${MAX_ACTIVITY_MINUTES}.` };
    }
    const n = Number(text);
    if (n < 1 || n > MAX_ACTIVITY_MINUTES) {
        return { ok: false, message: `Whole minutes, 1 to ${MAX_ACTIVITY_MINUTES}.` };
    }
    return { ok: true, minutes: n };
}

/**
 * A paste's `minutes:` against the activity's current value (D16).
 *   write   — the value to save, or undefined for "write nothing"
 *   warning — what the teacher is told when their value was kept
 */
export function mergeImportedMinutes(
    imported: number | undefined,
    current: number | null,
): { write: number | undefined; warning: string | null } {
    if (imported === undefined || imported === current) return { write: undefined, warning: null };
    if (current === null) return { write: imported, warning: null };
    return {
        write: undefined,
        warning: `Meta: kept the time you already set (${current} min) — the paste said ${imported} min.`,
    };
}
