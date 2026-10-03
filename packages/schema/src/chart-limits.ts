// =============================================================================
// chart-limits.ts — the chart block's limits and its drawable check, zod-FREE
// -----------------------------------------------------------------------------
// Split out of blocks/chart.ts for the reason table-blank-ids.ts was split out
// of blocks/table.ts: the viewer reads these on the student path, and importing
// them from a zod schema module would carry zod into a student chunk.
// =============================================================================

/** At most this many categories on the axis (design N2). */
export const CHART_MAX_CATEGORIES = 12;
/** At most this many series (N2); the hatch set (N1) covers exactly this many. */
export const CHART_MAX_SERIES = 4;

/** One value per category, in every series — the shape the renderer needs. */
export function chartIsDrawable(block: {
  categories: readonly string[];
  series: readonly { values: readonly number[] }[];
}): boolean {
  return (
    block.categories.length > 0 &&
    block.series.length > 0 &&
    block.series.every((s) => s.values.length === block.categories.length)
  );
}
