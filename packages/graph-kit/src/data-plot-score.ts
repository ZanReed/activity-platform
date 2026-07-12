// =============================================================================
// data-plot-score.ts — pure scorer for the data_plot block (statistics charts)
// -----------------------------------------------------------------------------
// DOM-free and JSXGraph-free, so it unit-tests without a board (the same
// discipline as graph-score.ts / number-line-score.ts). The kit's data-plot
// widget and the runtime both score through here; keeping it pure keeps Phase-5
// server-side grading cheap (strip data-dataplot-data, run this).
//
// Scores all three graded builds: build_dotplot (frequency-map equality),
// build_histogram (per-bin frequency equality), build_boxplot (each of the five
// summary values within tolerance). All all-or-nothing (design decision 8/6).
//
// histogramBins + fiveNumberSummary are DUPLICATED from the renderer's
// data-plot-svg.ts (the kit can't import @activity/renderer — separate lazy
// bundle) — kept byte-for-byte in step; the renderer's copies draw, these score.
// =============================================================================

export interface FiveNumberSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface HistogramConfig {
  min: number;
  max: number;
  tickStep: number;
  binWidth?: number;
}

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

// Equal-width histogram bin counts spanning [min, max]. Bin width is
// config.binWidth (falls back to tickStep); each bin counts values in [x0, x1),
// the final bin inclusive of max. Returns the frequency per bin, left→right.
// (Byte-for-byte the counting logic in renderer/data-plot-svg.ts histogramBins.)
export function histogramCounts(
  data: number[],
  config: HistogramConfig,
): number[] {
  const width =
    config.binWidth && config.binWidth > 0 ? config.binWidth : config.tickStep;
  const counts: number[] = [];
  const maxBins = 200;
  for (
    let i = 0, x0 = config.min;
    x0 < config.max - 1e-9 && i < maxBins;
    i++, x0 += width
  ) {
    const x1 = Math.min(x0 + width, config.max);
    const isLast = x1 >= config.max - 1e-9;
    counts.push(
      data.filter(
        (v) => v >= x0 - 1e-9 && (isLast ? v <= x1 + 1e-9 : v < x1 - 1e-9),
      ).length,
    );
  }
  return counts;
}

// build_histogram: correct iff every bin's frequency matches exactly (integers,
// no tolerance — a bar is a whole count). All-or-nothing.
export function scoreHistogram(
  data: number[],
  config: HistogramConfig,
  studentBins: number[],
): boolean {
  if (data.length === 0) return false;
  const key = histogramCounts(data, config);
  if (studentBins.length !== key.length) return false;
  return key.every((c, i) => studentBins[i] === c);
}

function median(sorted: number[]): number {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

// The five-number summary using the EXCLUSIVE-median (Tukey / TI-84 1-Var Stats)
// method (design decision 4, LOCKED). Duplicated from renderer/data-plot-svg.ts.
export function fiveNumberSummary(data: number[]): FiveNumberSummary {
  const s = [...data].sort((a, b) => a - b);
  const n = s.length;
  const mid = Math.floor(n / 2);
  const lower = s.slice(0, mid);
  const upper = n % 2 ? s.slice(mid + 1) : s.slice(mid);
  return {
    min: s[0]!,
    q1: lower.length ? median(lower) : s[0]!,
    median: median(s),
    q3: upper.length ? median(upper) : s[n - 1]!,
    max: s[n - 1]!,
  };
}

// build_boxplot: correct iff each of the five placed handles is within
// `tolerance` line units of the computed summary. All-or-nothing.
export function scoreBoxplot(
  data: number[],
  tolerance: number,
  student: FiveNumberSummary,
): boolean {
  if (data.length === 0) return false;
  const key = fiveNumberSummary(data);
  const close = (a: number, b: number): boolean => Math.abs(a - b) <= tolerance;
  return (
    close(student.min, key.min) &&
    close(student.q1, key.q1) &&
    close(student.median, key.median) &&
    close(student.q3, key.q3) &&
    close(student.max, key.max)
  );
}
