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

// The single-handle plot_point question: the student's one point is correct
// when it lands within `tolerance` of ANY authored correct point (each axis
// independently — a snap-to-grid axis-aligned box, which matches how students
// read a grid). Multiple correctPoints means "any of these is acceptable"
// (e.g. plot either root); a must-plot-all, N-handle variant is future work.
export function isPointCorrect(
  key: PointAnswerKey,
  point: [number, number],
): boolean {
  const [px, py] = point;
  return key.correctPoints.some(
    ([cx, cy]) =>
      Math.abs(px - cx) <= key.tolerance && Math.abs(py - cy) <= key.tolerance,
  );
}
