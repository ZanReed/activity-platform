// =============================================================================
// perfMarks.test.ts — the S8 timing contract (rulings D2 / R2)
// -----------------------------------------------------------------------------
// These marks are the only thing the throttled Chromebook lane measures, and
// the numbers they produce are compared against a committed baseline across
// months. Two properties have to hold or the whole measurement is quietly
// worthless:
//
//   1. FIRES EXACTLY ONCE. The viewer re-renders on every keystroke and React
//      StrictMode double-invokes effects in dev; a mark that accumulates
//      entries makes `getEntriesByName()[0]` depend on render count.
//   2. NEVER THROWS. Measurement must not be able to break the page it
//      measures — a student's worksheet does not fail because a browser lacks
//      the User Timing API.
// =============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MARKS, markOnce, resetMarksForTest } from '../src/perf/marks.js';
// The root budget config is plain .mjs: a root script cannot import package
// TypeScript under pnpm's strict layout, so the mark names exist in two places.
// This import is what stops that duplication from drifting.
import { MARKS as CONFIG_MARKS } from '../../../scripts/perf-budgets.mjs';

describe('performance mark contract', () => {
  beforeEach(() => {
    resetMarksForTest();
    performance.clearMarks?.();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stamps the mark on first call', () => {
    markOnce(MARKS.preAuthInteractive);
    expect(performance.getEntriesByName(MARKS.preAuthInteractive)).toHaveLength(1);
  });

  it('stamps at most once no matter how many times it is called', () => {
    // The realistic shape: an effect that re-runs, or StrictMode's double
    // invoke. Ten calls, one entry.
    for (let i = 0; i < 10; i++) markOnce(MARKS.worksheetInteractive);
    expect(performance.getEntriesByName(MARKS.worksheetInteractive)).toHaveLength(1);
  });

  it('keeps marks independent of one another', () => {
    markOnce(MARKS.preAuthInteractive);
    markOnce(MARKS.worksheetInteractive);
    expect(performance.getEntriesByName(MARKS.preAuthInteractive)).toHaveLength(1);
    expect(performance.getEntriesByName(MARKS.worksheetInteractive)).toHaveLength(1);
  });

  it('never throws when the User Timing API is unavailable', () => {
    vi.spyOn(performance, 'mark').mockImplementation(() => {
      throw new Error('performance.mark is not a function');
    });
    // The assertion IS that this does not propagate: an old embedded browser
    // must still render the worksheet.
    expect(() => markOnce(MARKS.mathRendered)).not.toThrow();
  });

  it('mark names are namespaced, unique, and additive-only in shape', () => {
    const names = Object.values(MARKS);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^student-interactive:/);
    // Pinned literally. Renaming a mark does not fail loudly at runtime — the
    // numbers keep flowing and silently stop meaning the same thing — so the
    // pin is here instead. Changing one of these strings is a contract break
    // that must be a deliberate, reviewed decision (ruling R2).
    expect(MARKS.preAuthInteractive).toBe('student-interactive:pre-auth');
    expect(MARKS.worksheetInteractive).toBe('student-interactive:worksheet');
    expect(MARKS.mathRendered).toBe('student-interactive:math-rendered');
  });

  it('matches the copy in scripts/perf-budgets.mjs', () => {
    // The failure this prevents is silent and slow: rename a mark here, and
    // the perf lane keeps measuring while the committed calibration target in
    // perf-budgets.mjs now keys on a name nothing stamps. Nothing errors — the
    // baseline comparison just quietly stops happening.
    expect(CONFIG_MARKS).toEqual({ ...MARKS });
  });
});
