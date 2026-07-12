// =============================================================================
// number-line-score.ts — pure scorer for the number_line block (1-D)
// -----------------------------------------------------------------------------
// DOM-free and JSXGraph-free, so it unit-tests without a board (the same
// discipline as graph-score.ts). The kit's number-line widget and the runtime
// both score through here; keeping it pure also keeps Phase-5 server-side
// grading cheap (strip data-numberline-answer-key, run this).
//
// Two interactions: plot_point (consume-once, all-or-nothing) and plot_interval
// (endpoints within tolerance + open/closed styles match + the same bounded /
// unbounded sides).
// =============================================================================

export type EndpointStyle = 'open' | 'closed';

export interface NumberLinePointKey {
  /** Acceptable position(s) on the line. */
  correctPoints: number[];
  /** Match radius in line units (|student - target| <= tolerance). */
  tolerance: number;
}

export interface NumberLineIntervalKey {
  correctInterval: {
    min?: number;
    minStyle?: EndpointStyle;
    max?: number;
    maxStyle?: EndpointStyle;
  };
  tolerance: number;
}

// A student's plotted interval/ray (present bounds carry a style; an absent
// bound is unbounded that direction).
export interface StudentInterval {
  min?: number;
  minStyle?: EndpointStyle;
  max?: number;
  maxStyle?: EndpointStyle;
}

// plot_point: the student places one handle per authored correct point and must
// land EVERY correct point (order-independent, consume-once) — "plot both" can't
// be satisfied by stacking one handle. The single-point case reduces to a plain
// within-tolerance check.
export function scoreNumberLinePoints(
  key: NumberLinePointKey,
  studentPoints: number[],
): boolean {
  if (key.correctPoints.length === 0) return false;
  if (studentPoints.length < key.correctPoints.length) return false;
  const used = new Set<number>();
  for (const target of key.correctPoints) {
    let matched = -1;
    for (let i = 0; i < studentPoints.length; i++) {
      if (used.has(i)) continue;
      if (Math.abs(studentPoints[i]! - target) <= key.tolerance) {
        matched = i;
        break;
      }
    }
    if (matched === -1) return false;
    used.add(matched);
  }
  return true;
}

// plot_interval: correct iff, for each side, the student and the key AGREE on
// bounded-vs-unbounded, and where bounded the position is within tolerance AND
// the open/closed style matches exactly (the inequality distinction — x > 3 vs
// x >= 3 is the whole point). All-or-nothing (decision 6).
export function scoreNumberLineInterval(
  key: NumberLineIntervalKey,
  student: StudentInterval,
): boolean {
  const k = key.correctInterval;
  return (
    sideMatches(k.min, k.minStyle, student.min, student.minStyle, key.tolerance) &&
    sideMatches(k.max, k.maxStyle, student.max, student.maxStyle, key.tolerance)
  );
}

// One side (min or max) of an interval. Both absent = both unbounded that way
// (agree). One absent = disagree. Both present = position within tolerance and
// styles equal (a missing style defaults to closed, mirroring the schema/board).
function sideMatches(
  keyBound: number | undefined,
  keyStyle: EndpointStyle | undefined,
  studentBound: number | undefined,
  studentStyle: EndpointStyle | undefined,
  tolerance: number,
): boolean {
  const keyHas = keyBound !== undefined;
  const studentHas = studentBound !== undefined;
  if (keyHas !== studentHas) return false;
  if (!keyHas) return true; // both unbounded this side
  if (Math.abs(studentBound! - keyBound!) > tolerance) return false;
  return (studentStyle ?? 'closed') === (keyStyle ?? 'closed');
}
