// =============================================================================
// data-plot-svg.ts — server-rendered static statistics charts (print / no-JS)
// -----------------------------------------------------------------------------
// The statistics analogue of graph-svg.ts / number-line-svg.ts. Draws a dot
// plot, histogram, or box plot from a dataset as pure SVG string output (no DOM,
// aria-hidden — the block shell owns the accessible name). One routine, three
// consumers (design decision 6/7): the `display` block renders it directly, the
// print path uses it, and the build_dotplot widget's no-JS fallback shows the
// empty-axis version (values = []).
//
// The chart is ALWAYS derivable from the data (design decision 3a): the dot
// stacks, the histogram bins, and the five-number summary are each deterministic
// functions of the values, so there is no separately-drawn answer to drift.
// =============================================================================
import type { DataPlotConfig, DataPlotChart } from '@activity/schema';
import { attr, escape } from './html.js';

const WIDTH = 500;
const HEIGHT = 200;
const MARGIN = 28; // px inset on each end so end labels fit
const AXIS_Y = 168; // baseline y of the axis (plot area is above it)
const TOP_PAD = 18; // px kept clear at the top of the plot area
const TICK = 6; // labeled-tick half-height
const MINOR_TICK = 3;

// Structural colors emitted as CSS custom properties with a LIGHT hex fallback,
// so the same SVG themes itself from the cascade (docs/design/graph-kit-board-dark.md):
// the editor defines --gk-board-* (dark) → the data-plot preview goes dark;
// published pages leave them undefined → the light fallback → unchanged. var()
// works only in an inline `style` (not a presentation attribute), so the emission
// sites use style="stroke:…" / style="fill:…". Fallbacks == today's values.
const AXIS_COLOR = 'var(--gk-board-axis,#64748b)';
const LABEL_COLOR = 'var(--gk-board-label,#475569)';
const INK = 'var(--gk-board-ink,#1e293b)';
const FILL = '#93c5fd'; // bars / box fill (light blue, prints as mid-gray)
const DOT_R = 6;

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
}

// Value → viewBox px. min at the left inset, max at the right inset.
function scaler(config: DataPlotConfig): (v: number) => number {
  const span = config.max - config.min;
  return (v) => MARGIN + ((v - config.min) / span) * (WIDTH - 2 * MARGIN);
}

// ---- Statistics derived from the dataset (pure, exported for reuse/tests) ----

// Dot-plot stacks: one entry per distinct value, ascending, with its count.
export function dotCounts(
  values: number[],
): { value: number; count: number }[] {
  const m = new Map<number, number>();
  for (const v of values) {
    const key = Math.round(v * 1e6) / 1e6;
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value - b.value);
}

// Equal-width histogram bins spanning [min, max]. Bin width is config.binWidth
// (falls back to tickStep). Each bin counts values in [x0, x1); the final bin is
// inclusive of max so the largest value isn't dropped.
export function histogramBins(
  values: number[],
  config: DataPlotConfig,
): { x0: number; x1: number; count: number }[] {
  const width =
    config.binWidth && config.binWidth > 0 ? config.binWidth : config.tickStep;
  const bins: { x0: number; x1: number; count: number }[] = [];
  const maxCount = 200;
  for (
    let i = 0, x0 = config.min;
    x0 < config.max - 1e-9 && i < maxCount;
    i++, x0 += width
  ) {
    const x1 = Math.min(x0 + width, config.max);
    const isLast = x1 >= config.max - 1e-9;
    const count = values.filter(
      (v) => v >= x0 - 1e-9 && (isLast ? v <= x1 + 1e-9 : v < x1 - 1e-9),
    ).length;
    bins.push({ x0, x1, count });
  }
  return bins;
}

function median(sorted: number[]): number {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

// The five-number summary using the EXCLUSIVE-median (Tukey / TI-84 1-Var Stats)
// method (design decision 4): the median is excluded from both halves on an
// odd-length set before taking Q1/Q3. Consistent with the calculator kit's
// TI-84 regression conventions.
export function fiveNumberSummary(values: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
} {
  const s = [...values].sort((a, b) => a - b);
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

// ---- Drawing ----------------------------------------------------------------

function renderAxisAndTicks(
  config: DataPlotConfig,
  px: (v: number) => number,
): string {
  const step = config.tickStep > 0 ? config.tickStep : 1;
  const minors = config.minorTicksPerStep;

  // Positions of labeled ticks from min, stepping by tickStep (guarded loop).
  const labeled: number[] = [];
  for (let i = 0, v = config.min; v <= config.max + 1e-9 && i < 200; i++) {
    labeled.push(Math.round(v * 1e6) / 1e6);
    v += step;
  }

  let out =
    `<line x1="${MARGIN - 8}" y1="${AXIS_Y}" x2="${WIDTH - MARGIN + 8}" y2="${AXIS_Y}"` +
    ` style="stroke:${AXIS_COLOR}" stroke-width="1.5"/>`;

  if (minors > 0) {
    let m = '';
    for (let i = 0; i + 1 < labeled.length; i++) {
      const a = labeled[i]!;
      for (let k = 1; k <= minors; k++) {
        const v = a + (step * k) / (minors + 1);
        if (v > config.max + 1e-9) break;
        const x = px(v);
        m += `<line x1="${x}" y1="${AXIS_Y - MINOR_TICK}" x2="${x}" y2="${AXIS_Y + MINOR_TICK}"/>`;
      }
    }
    if (m) out += `<g style="stroke:${AXIS_COLOR}" stroke-width="1">${m}</g>`;
  }

  let ticks = '';
  let labels = '';
  for (const v of labeled) {
    const x = px(v);
    ticks += `<line x1="${x}" y1="${AXIS_Y - TICK}" x2="${x}" y2="${AXIS_Y + TICK}"/>`;
    labels +=
      `<text x="${x}" y="${AXIS_Y + TICK + 14}" text-anchor="middle"` +
      ` style="fill:${LABEL_COLOR}" font-size="12" font-family="inherit">${escape(fmt(v))}</text>`;
  }
  out += `<g style="stroke:${AXIS_COLOR}" stroke-width="1.5">${ticks}</g>`;
  return out + labels;
}

function renderDotplot(
  values: number[],
  config: DataPlotConfig,
  px: (v: number) => number,
): string {
  const stacks = dotCounts(values);
  const tallest = stacks.reduce((m, s) => Math.max(m, s.count), 0);
  const cap = config.maxFrequency ?? tallest;
  const plotH = AXIS_Y - TOP_PAD;
  // Vertical spacing per dot: fit the tallest stack (or the cap) in the plot
  // area, but never larger than a comfortable 2*radius+pad.
  const spacing = Math.min(2 * DOT_R + 3, cap > 0 ? plotH / cap : plotH);
  let out = '';
  for (const { value, count } of stacks) {
    const x = px(value);
    for (let k = 0; k < count; k++) {
      const cy = AXIS_Y - DOT_R - k * spacing;
      out += `<circle cx="${x}" cy="${cy}" r="${DOT_R}" fill="${FILL}" style="stroke:${INK}" stroke-width="1.5"/>`;
    }
  }
  return out;
}

function renderHistogram(
  values: number[],
  config: DataPlotConfig,
  px: (v: number) => number,
): string {
  const bins = histogramBins(values, config);
  const tallest = bins.reduce((m, b) => Math.max(m, b.count), 0);
  const cap = config.maxFrequency ?? tallest;
  const plotH = AXIS_Y - TOP_PAD;
  let out = '';
  for (const { x0, x1, count } of bins) {
    if (count <= 0) continue;
    const left = px(x0);
    const right = px(x1);
    const h = cap > 0 ? (count / cap) * plotH : 0;
    out +=
      `<rect x="${left}" y="${AXIS_Y - h}" width="${Math.max(0, right - left)}" height="${h}"` +
      ` fill="${FILL}" style="stroke:${INK}" stroke-width="1.5"/>`;
  }
  return out;
}

function renderBoxplot(
  values: number[],
  px: (v: number) => number,
): string {
  const { min, q1, median: med, q3, max } = fiveNumberSummary(values);
  const cy = Math.round((TOP_PAD + AXIS_Y) / 2); // box centered in the plot area
  const half = 26; // box half-height
  const xMin = px(min);
  const xQ1 = px(q1);
  const xMed = px(med);
  const xQ3 = px(q3);
  const xMax = px(max);
  const g = `style="stroke:${INK}" stroke-width="2"`;
  return (
    // whiskers
    `<line x1="${xMin}" y1="${cy}" x2="${xQ1}" y2="${cy}" ${g}/>` +
    `<line x1="${xQ3}" y1="${cy}" x2="${xMax}" y2="${cy}" ${g}/>` +
    // whisker caps
    `<line x1="${xMin}" y1="${cy - 12}" x2="${xMin}" y2="${cy + 12}" ${g}/>` +
    `<line x1="${xMax}" y1="${cy - 12}" x2="${xMax}" y2="${cy + 12}" ${g}/>` +
    // box
    `<rect x="${xQ1}" y="${cy - half}" width="${Math.max(0, xQ3 - xQ1)}" height="${2 * half}"` +
    ` fill="${FILL}" ${g}/>` +
    // median line
    `<line x1="${xMed}" y1="${cy - half}" x2="${xMed}" y2="${cy + half}" ${g}/>`
  );
}

// Draw a chart of `values` on the configured axis. An empty `values` yields just
// the axis + ticks — the blank grid a student marks on paper (the build_dotplot
// no-JS fallback). uid disambiguates ids if multiple charts share a page.
export function renderDataPlotSvg(
  config: DataPlotConfig,
  chart: DataPlotChart,
  values: number[],
  uid: string,
): string {
  if (!(config.max > config.min)) return '';
  const px = scaler(config);
  let plot = '';
  if (values.length > 0) {
    plot =
      chart === 'histogram'
        ? renderHistogram(values, config, px)
        : chart === 'boxplot'
          ? renderBoxplot(values, px)
          : renderDotplot(values, config, px);
  }
  return (
    `<svg class="data-plot-paper" data-uid="${attr(uid)}"` +
    ` viewBox="0 0 ${WIDTH} ${HEIGHT}"` +
    ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    plot +
    renderAxisAndTicks(config, px) +
    '</svg>'
  );
}
