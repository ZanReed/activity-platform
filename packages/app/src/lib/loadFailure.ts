// =============================================================================
// lib/loadFailure.ts — where a failed load on a teacher screen is reported
// -----------------------------------------------------------------------------
// Review C5 (docs/design/shared-data-loading.md). The reporting half of
// lib/useLoad.ts, apart so a screen that only needs `leaveOut` (slice 3: an
// optional part of the page that failed) does not download the loader.
// No React here. TEACHER SCREENS ONLY: perf-budgets.mjs → SHELL_EVICTED keeps
// it out of the student shell by the `[load] ` console prefix.
// =============================================================================

/** The database's refusals (42501): not the caller's class, activity, or
 *  student — or not a teacher at all (the Bank's reads, 0054). */
export function isRefusal(e: unknown): boolean {
    const m = e instanceof Error ? e.message : '';
    return /not_class_teacher|not_your_activity|not_in_scope|The Activity Bank is for teachers/.test(m);
}

export type LoadFailureKind = 'load_failed' | 'refresh_failed' | 'refused';

export interface LoadFailure {
    /** The key's first part: names the data, never carries an id. */
    what: string;
    kind: LoadFailureKind;
    error: unknown;
}

/** Where every failed load is reported: the console, and the teacher-only
 *  error log (slice 4, lib/clientErrors.ts — which checks the role itself).
 *  Loaded on demand: the teacher journeys' size caps (perf-budgets.mjs →
 *  TEACHER_JOURNEYS) count static imports, and the log never blocks a page. */
export function reportLoadFailure(failure: LoadFailure): void {
    console.warn(`[load] ${failure.what}: ${failure.kind}`, failure.error);
    void import('./clientErrors').then(
        (m) => m.reportClientError({ kind: failure.kind, source: failure.what || null, error: failure.error }),
        // The log's own chunk failed to load: dropped, never re-reported (clientErrors.ts, BEST EFFORT).
        () => undefined,
    );
}

/** The `.catch` for an OPTIONAL part of a teacher screen (slice 3, decision
 *  9): the screen leaves the part out exactly as before, and the failure goes
 *  to the error log instead of vanishing. `what` names the part (the log's
 *  `source`). Teacher screens only — student screens never report. */
export function leaveOut(what: string, kind?: LoadFailureKind): (error: unknown) => null {
    return (error) => {
        reportLoadFailure({ what, kind: kind ?? (isRefusal(error) ? 'refused' : 'load_failed'), error });
        return null;
    };
}

export function messageOf(e: unknown): string {
    if (e instanceof Error) return e.message;
    return typeof e === 'string' ? e : 'Unknown error';
}
