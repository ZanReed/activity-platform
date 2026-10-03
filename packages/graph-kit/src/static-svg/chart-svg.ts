// =============================================================================
// chart-svg.ts — static statistics charts of CATEGORY data (Y7 charts, T10)
// -----------------------------------------------------------------------------
// docs/design/y7-figures-and-charts.md D7 / Q7 / N1 / N4. Bar, stacked bar,
// clustered bar, and a time-series line on evenly spaced categories, as a pure
// SVG string (no DOM, aria-hidden — the block shell owns the accessible name
// and the hidden data table, N3).
//
// The sibling of data-plot-svg.ts, and it reuses that file's CONVENTIONS (the
// 500-wide viewBox, var()-in-style chrome) rather than its private functions:
// data_plot draws one numeric dataset on a number axis, this draws category →
// value series, and the two share no geometry.
//
// CHROME IS `--gk-svg-*`, NOT `--gk-board-*`. data-plot-svg.ts uses the board
// variables because its SVG is a PRINT TWIN in the viewer (hidden on screen,
// where a live board draws instead). This SVG is the chart a student sees ON
// SCREEN, so it uses the variables the viewer defines for every theme
// (tokens.css) — the same ones graph-svg.ts uses, for the same reason.
//
// THE RULES THE PICTURE KEEPS (Q7):
//   * the value axis ALWAYS starts at zero — no truncated axes at Y7;
//   * its top is the next 1/2/5 × 10ⁿ step at or above the largest value
//     (stacked: the largest total) unless the author set `y:`;
//   * categories and series draw in authored order;
//   * a NAMED series produces a legend;
//   * series 2+ carry a hatch pattern as well as a colour (N1), and lines a
//     dash pattern and a marker shape, so the chart still reads in grayscale;
//   * category labels wrap to at most two lines and are never rotated (N4).
// =============================================================================
import { DRAWABLE_PALETTE } from '../drawable-palette.js';
import { attr, escape } from './html.js';

/** The structural shape this renderer reads — a ChartBlock, minus zod. */
export interface ChartSpec {
  chart: 'bar' | 'stacked' | 'clustered' | 'line';
  title?: string | undefined;
  xLabel?: string | undefined;
  yLabel?: string | undefined;
  categories: readonly string[];
  series: readonly { name?: string | undefined; values: readonly number[] }[];
  yMax?: number | undefined;
  yStep?: number | undefined;
}

const WIDTH = 500;
const PLOT_H = 180;
const LEFT = 46; // room for the value labels
const RIGHT = 12;
const LINE_H = 13; // category-label line height
/** Category labels wrap at about this many characters (N4). */
export const CHART_LABEL_WRAP = 10;

const GRID_COLOR = 'var(--gk-svg-grid, #cbd5e1)';
const AXIS_COLOR = 'var(--gk-svg-axis, #64748b)';
const LABEL_FALLBACK = '#475569';
const INK = 'var(--gk-svg-ink,#1e293b)';

// Series colours, in order. Chosen for separation in colour AND in luminance,
// and backed by the hatch set below so nothing depends on colour alone.
const SERIES_COLORS = [
  DRAWABLE_PALETTE.blue,
  DRAWABLE_PALETTE.amber,
  DRAWABLE_PALETTE.teal,
  DRAWABLE_PALETTE.violet,
] as const;

// Line series: dash pattern and marker shape per series (the line chart's
// answer to N1 — two solid lines in two blues print identically).
const DASHES = ['', '6 4', '2 3', '8 3 2 3'] as const;

/** Thin space between groups of three, for numbers of five or more digits. */
export function formatChartValue(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  const [whole = '0', frac] = String(Math.abs(rounded)).split('.');
  const grouped = whole.length >= 5 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : whole;
  return (rounded < 0 ? '-' : '') + grouped + (frac ? `.${frac}` : '');
}

/** Wrap a category label to at most two lines of about CHART_LABEL_WRAP. */
export function wrapChartLabel(label: string): string[] {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line === '') line = word;
    else if ((line + ' ' + word).length <= CHART_LABEL_WRAP || lines.length >= 1) line += ' ' + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines.slice(0, 2);
}

/** The largest value the axis has to reach: a stack's total, else a value. */
function dataCeiling(spec: ChartSpec): number {
  let max = 0;
  for (let c = 0; c < spec.categories.length; c++) {
    if (spec.chart === 'stacked') {
      max = Math.max(max, spec.series.reduce((sum, s) => sum + (s.values[c] ?? 0), 0));
    } else {
      for (const s of spec.series) max = Math.max(max, s.values[c] ?? 0);
    }
  }
  return max;
}

/**
 * The value axis: its top and its step (Q7).
 *
 * Without an override the step is the smallest 1/2/5 × 10ⁿ that needs at most
 * five intervals, and the top is the first multiple of it at or above the data.
 * Whole-number data never gets a fractional step. An authored `yMax` below the
 * data is ignored rather than drawn — a bar that leaves the plot is worse than
 * an axis the author did not ask for (the importer refuses it by line first).
 */
export function chartAxis(spec: ChartSpec): { yMax: number; yStep: number } {
  const ceiling = dataCeiling(spec);
  const whole = spec.series.every((s) => s.values.every((v) => Number.isInteger(v)));
  const niceStep = (top: number): number => {
    if (!(top > 0)) return 1;
    const raw = top / 5;
    const pow = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw - 1e-12) ?? 10 * pow;
    return whole ? Math.max(1, step) : step;
  };
  const authored = spec.yMax !== undefined && spec.yMax >= ceiling ? spec.yMax : undefined;
  let yStep = spec.yStep !== undefined && spec.yStep > 0 ? spec.yStep : niceStep(authored ?? ceiling);
  const yMax = authored ?? Math.max(yStep, Math.ceil(ceiling / yStep - 1e-9) * yStep);
  // A step that would draw more than 20 gridlines is a typo, not a choice.
  if (yMax / yStep > 20) yStep = niceStep(yMax);
  return { yMax, yStep };
}

// ---- hatches (N1) ------------------------------------------------------------

function hatchId(uid: string, i: number): string {
  return `ch-${uid}-${i}`;
}

/** The fill a series' bars and its legend swatch use. Series 0 is solid. */
function seriesFill(uid: string, i: number): string {
  return i === 0 ? SERIES_COLORS[0] : `url(#${attr(hatchId(uid, i))})`;
}

/** One <pattern> per series after the first: diagonal, cross, dots. */
function hatchDefs(uid: string, count: number): string {
  let out = '';
  for (let i = 1; i < count; i++) {
    const color = SERIES_COLORS[i % SERIES_COLORS.length]!;
    const stroke = `stroke="${color}" stroke-width="1.6"`;
    const body =
      i === 1
        ? `<path d="M-2 2L2 -2M0 8L8 0M6 10L10 6" ${stroke}/>`
        : i === 2
          ? `<path d="M0 0L8 8M8 0L0 8" ${stroke}/>`
          : `<circle cx="2" cy="2" r="1.4" fill="${color}"/><circle cx="6" cy="6" r="1.4" fill="${color}"/>`;
    out +=
      `<pattern id="${attr(hatchId(uid, i))}" width="8" height="8" patternUnits="userSpaceOnUse">` +
      body +
      '</pattern>';
  }
  return out ? `<defs>${out}</defs>` : '';
}

// ---- markers (line charts) ---------------------------------------------------

function marker(i: number, x: number, y: number, color: string): string {
  const common = `data-point="" fill="${color}" style="stroke:${INK}" stroke-width="1"`;
  const r = 4;
  if (i === 0) return `<circle cx="${x}" cy="${y}" r="${r}" ${common}/>`;
  if (i === 1) return `<path d="M${x - r} ${y - r}h${2 * r}v${2 * r}h${-2 * r}z" ${common}/>`;
  if (i === 2) return `<path d="M${x} ${y - r - 1}L${x + r + 1} ${y + r}L${x - r - 1} ${y + r}z" ${common}/>`;
  return `<path d="M${x} ${y - r - 1}L${x + r + 1} ${y}L${x} ${y + r + 1}L${x - r - 1} ${y}z" ${common}/>`;
}

const round = (n: number): number => Math.round(n * 100) / 100;

function text(
  x: number,
  y: number,
  body: string,
  opts: { anchor?: 'start' | 'middle' | 'end'; size?: number; color?: string; bold?: boolean; role?: string } = {},
): string {
  return (
    `<text x="${round(x)}" y="${round(y)}" text-anchor="${opts.anchor ?? 'middle'}"` +
    (opts.role ? ` data-chart-text="${opts.role}"` : '') +
    // A label carries its colour as a presentation ATTRIBUTE, on purpose: the
    // viewer's `.viewer-figure > svg text` rule then re-points it at the
    // surface's own muted-ink token (dark mode, forced-light print), exactly as
    // it does for graph-svg's tick labels. Only the title is pinned with an
    // inline style, to the ink variable.
    (opts.color ? ` style="fill:${opts.color}"` : ` fill="${LABEL_FALLBACK}"`) +
    ` font-size="${opts.size ?? 12}"` +
    (opts.bold ? ' font-weight="600"' : '') +
    ` font-family="inherit">${escape(body)}</text>`
  );
}

/**
 * Draw the chart. Returns '' when the data cannot be drawn (no categories, no
 * series, or a series whose length differs from the categories) — the caller
 * shows its "unavailable" state, exactly as renderGraphSvg's callers do.
 * `uid` keeps pattern ids unique when several charts share a page.
 */
export function renderChartSvg(spec: ChartSpec, uid: string): string {
  const cats = spec.categories;
  const series = spec.series;
  if (cats.length === 0 || series.length === 0) return '';
  if (series.some((s) => s.values.length !== cats.length)) return '';

  const { yMax, yStep } = chartAxis(spec);
  const named = series.some((s) => s.name);
  const labelLines = cats.map(wrapChartLabel);
  const labelRows = Math.max(...labelLines.map((l) => l.length));

  // ---- vertical layout: title, legend, y label, plot, labels, x label -------
  let y = 4;
  let head = '';
  if (spec.title) {
    y += 16;
    head += text(WIDTH / 2, y, spec.title, { size: 15, color: INK, bold: true, role: 'title' });
    y += 8;
  }
  if (named) {
    // Swatch + name per series, wrapped onto rows by an estimated text width.
    let x = LEFT;
    y += 12;
    for (let i = 0; i < series.length; i++) {
      const name = series[i]!.name ?? `Series ${i + 1}`;
      const w = 22 + name.length * 6.6 + 14;
      if (x + w > WIDTH - RIGHT && x > LEFT) {
        x = LEFT;
        y += 18;
      }
      const color = SERIES_COLORS[i % SERIES_COLORS.length]!;
      head +=
        spec.chart === 'line'
          ? `<path data-legend="" d="M${x} ${y - 4}h16" fill="none" stroke="${color}" stroke-width="2.5"` +
            (DASHES[i % DASHES.length] ? ` stroke-dasharray="${DASHES[i % DASHES.length]}"` : '') +
            '/>' +
            marker(i, x + 8, y - 4, color).replace('data-point=""', 'data-legend-point=""')
          : `<path data-legend="" d="M${x} ${y - 10}h14v12h-14z" fill="${seriesFill(uid, i)}"` +
            ` style="stroke:${INK}" stroke-width="1"/>`;
      head += text(x + 20, y, name, { anchor: 'start', role: 'legend' });
      x += w;
    }
    y += 8;
  }
  if (spec.yLabel) {
    // Horizontal, above the axis: rotated text is a reading load at Y7 (N4).
    y += 12;
    head += text(4, y, spec.yLabel, { anchor: 'start', role: 'ylabel' });
    y += 4;
  }
  const top = y + 10;
  const base = top + PLOT_H;
  const plotW = WIDTH - LEFT - RIGHT;
  const py = (v: number): number => round(base - (Math.min(v, yMax) / yMax) * PLOT_H);

  // ---- value axis: gridlines + labels ---------------------------------------
  let grid = '';
  let valueLabels = '';
  for (let k = 0; k <= Math.round(yMax / yStep) && k <= 40; k++) {
    const v = Math.min(yMax, Math.round(k * yStep * 1e6) / 1e6);
    const gy = py(v);
    if (k > 0) grid += `<line x1="${LEFT}" y1="${gy}" x2="${WIDTH - RIGHT}" y2="${gy}"/>`;
    valueLabels += text(LEFT - 6, gy + 4, formatChartValue(v), { anchor: 'end', role: 'value' });
  }

  // ---- the marks -------------------------------------------------------------
  const band = plotW / cats.length;
  const cx = (c: number): number => LEFT + band * (c + 0.5);
  let marks = '';
  if (spec.chart === 'line') {
    series.forEach((s, i) => {
      const color = SERIES_COLORS[i % SERIES_COLORS.length]!;
      const pts = s.values.map((v, c) => `${round(cx(c))},${py(v)}`).join(' ');
      const dash = DASHES[i % DASHES.length];
      marks +=
        `<polyline data-series="${i}" points="${pts}" fill="none" stroke="${color}" stroke-width="2.5"` +
        ` stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
      s.values.forEach((v, c) => {
        marks += marker(i, round(cx(c)), py(v), color);
      });
    });
  } else {
    // 'bar' with several series draws as clustered: one bar per series per
    // category is the only reading that loses no data.
    const stacked = spec.chart === 'stacked';
    const groupW = band * 0.72;
    const barW = stacked ? groupW : groupW / series.length;
    for (let c = 0; c < cats.length; c++) {
      let running = 0;
      series.forEach((s, i) => {
        const v = s.values[c] ?? 0;
        const x = stacked ? cx(c) - groupW / 2 : cx(c) - groupW / 2 + barW * i;
        const yTop = py(stacked ? running + v : v);
        const yBottom = stacked ? py(running) : base;
        running += v;
        marks +=
          `<rect data-bar="" data-series="${i}" x="${round(x)}" y="${yTop}" width="${round(barW)}"` +
          ` height="${round(Math.max(0, yBottom - yTop))}" fill="${seriesFill(uid, i)}"` +
          ` style="stroke:${INK}" stroke-width="1.2"/>`;
      });
    }
  }

  // ---- category labels + axis ------------------------------------------------
  let catLabels = '';
  labelLines.forEach((lines, c) => {
    lines.forEach((line, k) => {
      catLabels += text(cx(c), base + 16 + k * LINE_H, line, { role: 'category' });
    });
  });
  let bottom = base + 16 + (labelRows - 1) * LINE_H + 6;
  let foot = '';
  if (spec.xLabel) {
    bottom += 16;
    foot = text(LEFT + plotW / 2, bottom, spec.xLabel, { role: 'xlabel' });
    bottom += 4;
  }
  const height = Math.ceil(bottom + 4);

  return (
    `<svg class="chart-paper" data-uid="${attr(uid)}" data-chart="${spec.chart}"` +
    ` data-series-count="${series.length}" data-categories="${cats.length}"` +
    // The print gate's `drawable-count` contract (graph-svg.ts, data-plot-svg.ts):
    // a chart's drawables are its plotted VALUES.
    ` data-drawables="${series.length * cats.length}"` +
    ` viewBox="0 0 ${WIDTH} ${height}"` +
    ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    (spec.chart === 'line' ? '' : hatchDefs(uid, series.length)) +
    head +
    `<g data-chart-grid="" style="stroke:${GRID_COLOR}" stroke-width="1">${grid}</g>` +
    marks +
    // The two axes last, so a bar's outline never covers the baseline.
    `<path d="M${LEFT} ${top}V${base}H${WIDTH - RIGHT}" fill="none" style="stroke:${AXIS_COLOR}" stroke-width="1.5"/>` +
    valueLabels +
    catLabels +
    foot +
    '</svg>'
  );
}
