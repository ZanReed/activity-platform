import { z } from 'zod';
import { InlineNode } from '../inline.js';
import { NumberLineConfig } from './number-line.js';
import { sizingFields } from '../sizing.js';

// =============================================================================
// data-plot.ts — the data_plot block (statistics charts)
// -----------------------------------------------------------------------------
// The statistics sibling of interactive_graph (2-D functions) and number_line
// (1-D geometry). A data_plot renders a dot plot, histogram, or box plot from a
// dataset — either as a static STIMULUS the student reads ("what is the median
// of this box plot?", paired with a sibling numeric/MC block) or as a graded
// CONSTRUCTION the student builds ("make a dot plot of these values").
//
// A SEPARATE block family, not a GraphInteraction variant (taxonomy fixed
// 2026-07-10, STATE): stats charts are their own shape and must not be forced
// under the graph block's 2-D AxisConfig. Design + 9 decisions in
// docs/design/data-plot-block.md (author approved the recommended answers).
//
// THE ANSWER IS COMPUTED FROM THE DATA (design decision 3a): a dot plot,
// histogram, and box plot are each a deterministic function of `data`, so the
// author enters the raw dataset ONCE and the correct plot is derived by the kit
// scorer — there is no separately-authored answer key to drift from the data.
// The same `data` renders the chart in display mode and is the source the
// student plots (and the key it's scored against) in build mode.
//
// Slice 1 ships TWO interactions — `display` (all three chart types, ungraded
// stimulus) and `build_dotplot` (the simplest graded construction) —
// discriminated on `type` from day one so `build_histogram` / `build_boxplot`
// slot in additively later, exactly how GraphInteraction and NumberLineInteraction
// grow. Same three structural consequences as the graph/number-line blocks: a
// structured answer with its OWN submission map (dataPlotResponses, not the
// blanks map), frequency/summary scoring done by the lazy graph-kit (not the
// runtime's string strategies), and a widget that rides @activity/graph-kit.
// =============================================================================

// ---- Chart configuration ----------------------------------------------------
// The numeric axis is reused VERBATIM from NumberLineConfig (design decision 5):
// a dot plot stacks dots above their value on a 1-D number line, and a box plot
// sits on that same axis, so the tick/minor/snap semantics are identical. The
// histogram-only extras (equal-width bins + an optional y-scale ceiling) are
// consulted only when the chart is a histogram; unequal-bin `binEdges` is a
// documented later lever (YAGNI in slice 1).
export const DataPlotConfig = NumberLineConfig.extend({
  // Equal-width bin size spanning [min, max]; only read when chart ==
  // 'histogram'. Absent → the histogram falls back to `tickStep` as the bin
  // width. Positive.
  binWidth: z.number().positive().optional(),
  // Fixed ceiling for the histogram/dot-plot vertical scale. Absent → the
  // scale auto-fits the tallest bar/stack from `data`. A fixed value keeps
  // several plots on a page visually comparable. Positive integer (frequency).
  maxFrequency: z.number().int().positive().optional(),
});
export type DataPlotConfig = z.infer<typeof DataPlotConfig>;

// The chart shape. Shared by the `display` member (which one to render) and
// implied by each `build_*` member. Named by shape, not by grade band.
export const DataPlotChart = z.enum(['dotplot', 'histogram', 'boxplot']);
export type DataPlotChart = z.infer<typeof DataPlotChart>;

// ---- Interaction variants ---------------------------------------------------
// display: a static, ungraded chart of `data` — a stimulus the student reads.
// Like interactive_graph's `display` member it pulls no problem number, is
// never scored, and never joins the submission payload; a "read this chart then
// answer" task composes a display data_plot with a sibling numeric/MC block
// (the pattern that replaced the retired answer-surface-as-a-field seam).
export const DataPlotDisplayInteraction = z.object({
  type: z.literal('display'),
  chart: DataPlotChart,
});
export type DataPlotDisplayInteraction = z.infer<
  typeof DataPlotDisplayInteraction
>;

// build_dotplot: the student stacks dots above the axis to reproduce the
// frequency distribution of `data`. Scored all-or-nothing on frequency-map
// equality (design decision 8) — dot values are discrete (the widget snaps each
// dot to a tick), so the comparison is exact, no tolerance field. The correct
// distribution is COMPUTED from `data` (decision 3a); nothing to author here
// beyond the dataset itself, so this is a bare marker variant that grows
// build_histogram / build_boxplot siblings later.
export const DataPlotDotplotInteraction = z.object({
  type: z.literal('build_dotplot'),
});
export type DataPlotDotplotInteraction = z.infer<
  typeof DataPlotDotplotInteraction
>;

// build_histogram: the student sets each bar's frequency to reproduce the
// histogram of `data` (binned by config.binWidth over [min,max]). Scored
// all-or-nothing on exact per-bin integer-frequency equality (a bar is a whole
// count — no tolerance), the frequency-distribution twin of build_dotplot. The
// correct heights are COMPUTED from `data`, so this too is a bare marker variant.
export const DataPlotHistogramInteraction = z.object({
  type: z.literal('build_histogram'),
});
export type DataPlotHistogramInteraction = z.infer<
  typeof DataPlotHistogramInteraction
>;

// build_boxplot: the student drags the five-number-summary handles (min, Q1,
// median, Q3, max) to build the box + whiskers of `data`. Scored all-or-nothing
// with each handle within `tolerance` line units of the computed summary. Unlike
// the frequency builds this carries a tolerance because box positions are
// continuous and the two common quartile methods can differ by a data point on
// even-length sets — the key uses the TI-84 exclusive-median method (locked,
// design decision 4) and the tolerance absorbs the adjacent-method answer.
export const DataPlotBoxplotInteraction = z.object({
  type: z.literal('build_boxplot'),
  // Match radius in line units, applied to each of the five handles. Default
  // half a unit tick.
  tolerance: z.number().nonnegative().default(0.5),
});
export type DataPlotBoxplotInteraction = z.infer<
  typeof DataPlotBoxplotInteraction
>;

// Discriminated on `type` so consumers branch uniformly and the wire format
// always carries it. Growing a variant is a new member here + a new scorer
// branch in the kit — no other block touched.
export const DataPlotInteraction = z.discriminatedUnion('type', [
  DataPlotDisplayInteraction,
  DataPlotDotplotInteraction,
  DataPlotHistogramInteraction,
  DataPlotBoxplotInteraction,
]);
export type DataPlotInteraction = z.infer<typeof DataPlotInteraction>;

// ---- The block --------------------------------------------------------------
// Auto-numbered like the other question blocks WHEN GRADED — a `display`
// data_plot pulls no number (the renderer's isNumberedBlock returns false for
// it, exactly as it does for a display interactive_graph). hasConfidenceRating
// + skills + solution follow the same opt-in patterns the graph / number-line
// blocks established, and (like them) matter only in build mode. Deliberately
// LEAN for slice 1 (no partialCredit / mistakeFeedback) — all-or-nothing
// scoring (decision 8); those fields are additive later if asked for (YAGNI).
export const DataPlotBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('data_plot'),
  number: z.number().int().positive().optional(),
  prompt: z.array(InlineNode),
  // The dataset. Single source of truth: the chart is drawn from it and, in
  // build mode, the correct answer is derived from it. Non-empty.
  data: z.array(z.number()).min(1),
  config: DataPlotConfig,
  interaction: DataPlotInteraction,
  solution: z.array(InlineNode).optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // Additive/optional — no schemaVersion bump.
  ...sizingFields,
});
export type DataPlotBlock = z.infer<typeof DataPlotBlock>;
