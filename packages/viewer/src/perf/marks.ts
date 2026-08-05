// =============================================================================
// perfMarks.ts — the student-facing performance contract (S8 rulings D2 / R2)
// -----------------------------------------------------------------------------
// WHY A CUSTOM MARK AT ALL. Ruling P1A asked for a "TTI target on school
// Chromebooks". Time to Interactive as an industry metric is gone — Google
// removed it from Lighthouse in v10 because it was too sensitive to outlier
// network requests and long tasks, which in a CI gate means random red builds
// people learn to re-run instead of read. The lab metrics that replaced it
// (LCP, Total Blocking Time) measure paint and main-thread blocking, neither of
// which is "the student can start answering question 1" — a slow document fetch
// delays the worksheet while leaving TBT untouched.
//
// So the viewer says it itself. These marks are stamped at the moments the
// product actually promises, and the perf lane asserts against them.
//
// THIS IS A CONTRACT (ruling R2). The names below are keyed on by the perf lane,
// by the committed calibration targets in scripts/perf-budgets.mjs, and
// (post-S9, compliance permitting) by any field measurement on real devices.
// Treat them exactly like the runtime's data-attribute contract: ADD new marks
// freely, never rename or remove one. A rename does not break loudly — the
// numbers keep flowing, they just quietly stop meaning the same thing, and
// every historical comparison silently becomes a lie.
//
// WHY THIS LIVES IN @activity/viewer AND NOT THE APP. Two different layers
// stamp these: StudentViewer (app) owns the pre-auth and worksheet moments,
// while inline/math.ts (viewer) is the only code that knows when the KaTeX
// chunk actually landed. The viewer is the lower package, so putting the
// contract here lets both import ONE definition instead of keeping two copies
// in sync. It is a dependency-free leaf — no React, no DOM beyond the User
// Timing API — and the read-API server bundle enters at server/index.ts, so it
// never reaches the Edge Function.
//
// The strings are duplicated ONCE more, in scripts/perf-budgets.mjs, because a
// root .mjs script cannot import package TypeScript under pnpm's strict layout.
// e2e/perf/marks.e2e.ts imports BOTH and asserts they are identical, so that
// duplication cannot drift unnoticed.
// =============================================================================

export const MARKS = {
    /** A signed-out student can act on the pre-auth screen (ruling 3.2A). */
    preAuthInteractive: 'student-interactive:pre-auth',
    /** A signed-in student can answer the first section of the worksheet. */
    worksheetInteractive: 'student-interactive:worksheet',
    /** Math in the served document has finished typesetting (feeds S8 T7). */
    mathRendered: 'student-interactive:math-rendered',
} as const;

export type MarkName = (typeof MARKS)[keyof typeof MARKS];

/** Marks already stamped this page load. */
const stamped = new Set<string>();

/**
 * Stamp a performance mark at most once per page load.
 *
 * Idempotent on purpose, for two reasons that both really happen: React
 * StrictMode double-invokes effects in development, and the viewer re-renders
 * on every state change, so a mark placed in a render path would otherwise
 * accumulate hundreds of entries and make `getEntriesByName()[0]` a lottery.
 *
 * Silently does nothing where the User Timing API is absent (older embedded
 * browsers, jsdom without a polyfill). Measurement must never be able to break
 * the page it is measuring — a student's worksheet does not fail because a
 * timing API is missing.
 */
export function markOnce(name: MarkName): void {
    if (stamped.has(name)) return;
    stamped.add(name);
    try {
        performance.mark(name);
    } catch {
        // Measurement is never load-bearing. Swallow deliberately.
    }
}

/** Test-only: forget what has been stamped so a case can start clean. */
export function resetMarksForTest(): void {
    stamped.clear();
}
