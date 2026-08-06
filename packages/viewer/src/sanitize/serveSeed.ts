// =============================================================================
// sanitize/serveSeed.ts — the ONE spelling of the serve-shuffle seed (G1)
// -----------------------------------------------------------------------------
// The seed that decides what arrangement each student is SERVED — and
// therefore what the grader must recompute to tell "arranged deliberately"
// from "never touched" (the ordering omission rule). Until 2026-08-06 the
// contract existed as two spellings agreeing by luck: the read path composed
// `${versionId}:${userId}` inline while the grading side had its own
// serveSeed() (s2-retro finding 7). Two strings drifting here would silently
// mis-grade a subset of students — close to undiagnosable from a bug report.
//
// Dependency-free leaf ON PURPOSE: imported by the read bundle (the handler)
// and the grading bundle (servedOrder), so it must never grow an import.
//
// NB the seeded shuffle behind this seed is load-bearing for S4's ordering
// omission rule and carries an unexplained one-off flake in STATE's watch
// items (sanitize.test "differs across students", 2026-08-01, 1-in-14) — if
// that test misbehaves after any change here, treat it as the second sighting.
// =============================================================================

/** Compose the seed the read path serves with and the grader recomputes from. */
export function serveSeed(versionId: string, studentId: string): string {
  return `${versionId}:${studentId}`;
}
