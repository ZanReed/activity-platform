import { z } from 'zod';
import { sizingFields } from '../sizing.js';
import { CHART_MAX_CATEGORIES, CHART_MAX_SERIES } from '../chart-limits.js';

// =============================================================================
// ChartBlock — a static statistics chart of CATEGORY data (Y7 charts, T9)
// -----------------------------------------------------------------------------
// docs/design/y7-figures-and-charts.md D7 / D8 / Q7 / N1–N6. A pure CONTENT
// block: display-only in this slice (D8), never numbered, no submission wire.
//
// NOT a `data_plot` extension (D7). data_plot draws ONE numeric dataset on a
// number axis (dot plot / histogram / box plot) and can be a graded question;
// this block draws category → value series (bar, stacked bar, clustered bar,
// and a time-series line on evenly spaced categories) and can never accept
// student input by construction.
//
// Every field below is read by the viewer's Chart block and guarded by
// packages/viewer/tests/components/chart.test.tsx (Q9, bound to rendered
// output).
//
// The limits are N2's, enforced HERE as well as at import so a document that
// reaches the renderer by any other door (the editor, a hand-written draft)
// cannot hold a chart the renderer was never laid out for. They live in
// ../chart-limits.ts, a zod-free module, because the viewer's chart chunk
// reads them and must not pull zod onto the student path to do it (the
// table-blank-ids.ts precedent).
//
// "One value per category in every series" is NOT a `.refine` here: ChartBlock
// is a discriminatedUnion member and a refined object cannot be discriminated
// (the ImageBlock precedent). The importer refuses a mismatched series by line
// (N2); the viewer checks chartIsDrawable and draws "Chart unavailable".
// =============================================================================

export const ChartKind = z.enum(['bar', 'stacked', 'clustered', 'line']);
export type ChartKind = z.infer<typeof ChartKind>;

export const ChartSeries = z.object({
  // A NAMED series produces a legend (Q7). One unnamed series is the plain
  // bar chart; the importer refuses unnamed series beside named ones.
  name: z.string().min(1).optional(),
  // The baseline is ALWAYS zero (Q7: no truncated axes at Y7), so a negative
  // value has nowhere to be drawn.
  values: z.array(z.number().finite().nonnegative()).min(1),
});
export type ChartSeries = z.infer<typeof ChartSeries>;

export const ChartBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('chart'),
  chart: ChartKind,
  // Drawn above the plot, and the hidden data table's caption (N3).
  title: z.string().optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  // Names the chart for a screen reader when present (N3). Optional, unlike
  // a figure's: the data table is always there.
  alt: z.string().optional(),
  categories: z.array(z.string().min(1)).min(1).max(CHART_MAX_CATEGORIES),
  series: z.array(ChartSeries).min(1).max(CHART_MAX_SERIES),
  // The value axis's top and step. Absent = the next 1/2/5 × 10ⁿ step above
  // the largest value (stacked: the largest total), computed by the renderer.
  yMax: z.number().positive().optional(),
  yStep: z.number().positive().optional(),
  // Width fraction + align (N6), the same fragment image/math/data_plot carry.
  ...sizingFields,
});

export type ChartBlock = z.infer<typeof ChartBlock>;
