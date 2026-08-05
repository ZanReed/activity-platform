// =============================================================================
// Types for perf-budgets.mjs.
// -----------------------------------------------------------------------------
// The config itself is plain ESM with zero dependencies on purpose: root scripts
// cannot import package TypeScript under pnpm's strict node_modules, so it has
// to stay runnable by bare `node`. This file exists only so the ONE typechecked
// consumer — packages/viewer/tests/perfMarks.test.ts, which asserts the mark
// names here match the ones the viewer actually stamps — compiles.
//
// Deliberately declares only what typechecked code imports. The Playwright perf
// specs import more (THROTTLE, TIMING_TARGET_MS, timingCeilingMs), but e2e is
// outside the tsconfig include, so widening this to cover them would be types
// nobody checks and one more thing to keep in sync.
// =============================================================================

export const MARKS: {
    preAuthInteractive: string;
    worksheetInteractive: string;
    mathRendered: string;
};
