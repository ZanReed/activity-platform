// =============================================================================
// graph-score.ts — pure scoring for the interactive-graph block (Stage 5)
// -----------------------------------------------------------------------------
// Framework-agnostic, DOM-free, JSXGraph-free — so it unit-tests in isolation
// and can later be shared with server-side grading (Phase 5). Mirrors the
// runtime's "pure boolean, tolerance-based" scoring seam. Slice 1 ships the
// plot_point scorer; plot_line / shade_region add their own scorers here.
// =============================================================================

export interface PointAnswerKey {
  /** Acceptable target point(s), in graph units. */
  correctPoints: [number, number][];
  /** Per-axis tolerance (a box half-width), in graph units. */
  tolerance: number;
}

// Is a student point within tolerance of a target (each axis independently — a
// snap-to-grid axis-aligned box, which matches how students read a grid)?
function withinTolerance(
  student: [number, number],
  target: [number, number],
  tolerance: number,
): boolean {
  return (
    Math.abs(student[0] - target[0]) <= tolerance &&
    Math.abs(student[1] - target[1]) <= tolerance
  );
}

// The plot_point question: the student plots one handle per authored correct
// point and must land EVERY correct point (order-independent). Scored with
// consume-once matching (the same shape as order-independent blank groups):
// each correct point is matched to a DISTINCT student point within tolerance,
// so "plot both roots" can't be satisfied by stacking one handle on one root.
// The common single-point case (one correct point, one handle) reduces to a
// plain within-tolerance check.
export function scorePoints(
  key: PointAnswerKey,
  studentPoints: [number, number][],
): boolean {
  if (key.correctPoints.length === 0) return false;
  if (studentPoints.length < key.correctPoints.length) return false;
  const used = new Set<number>();
  for (const target of key.correctPoints) {
    let matched = -1;
    for (let i = 0; i < studentPoints.length; i++) {
      if (used.has(i)) continue;
      if (withinTolerance(studentPoints[i]!, target, key.tolerance)) {
        matched = i;
        break;
      }
    }
    if (matched === -1) return false;
    used.add(matched);
  }
  return true;
}

// Convenience for the single-handle case (kept for callers/tests that score one
// point). Equivalent to scorePoints with a one-point student array.
export function isPointCorrect(
  key: PointAnswerKey,
  point: [number, number],
): boolean {
  return scorePoints(key, [point]);
}
