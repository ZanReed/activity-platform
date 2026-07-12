// =============================================================================
// data-plot-score.ts — pure scorer for the data_plot block (statistics charts)
// -----------------------------------------------------------------------------
// DOM-free and JSXGraph-free, so it unit-tests without a board (the same
// discipline as graph-score.ts / number-line-score.ts). The kit's data-plot
// widget and the runtime both score through here; keeping it pure keeps Phase-5
// server-side grading cheap (strip data-dataplot-data, run this).
//
// Slice 1 scores build_dotplot: the student's dot plot is correct iff its
// frequency distribution (value → count) exactly matches the dataset's. Dot
// values are discrete (the widget snaps every dot to a tick), so the comparison
// is exact — no tolerance (design decision 8). All-or-nothing per plot.
// build_histogram / build_boxplot scorers land with those variants later.
// =============================================================================

// Count occurrences per (rounded) value. Rounding to 1e-6 absorbs float noise
// from the widget's tick snapping so 3 and 2.9999999 collapse to one column.
export function frequencyMap(values: number[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const v of values) {
    const key = Math.round(v * 1e6) / 1e6;
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return m;
}

// build_dotplot: correct iff the student's dot distribution equals the dataset's
// — same set of values, each with the same count. An empty student answer is
// wrong (an answered-but-empty plot never reaches here; the runtime omits an
// untouched block). An empty dataset is a defensive false.
export function scoreDotplot(data: number[], studentValues: number[]): boolean {
  if (data.length === 0) return false;
  const key = frequencyMap(data);
  const student = frequencyMap(studentValues);
  if (student.size !== key.size) return false;
  for (const [value, count] of key) {
    if (student.get(value) !== count) return false;
  }
  return true;
}
