// =============================================================================
// blocks/Chart.tsx — static statistics chart (Y7 charts, T11)
// -----------------------------------------------------------------------------
// docs/design/y7-figures-and-charts.md D7 / N3 / N5 / N6. Display-only: bar,
// stacked, clustered, and a time-series line, drawn by graph-kit's static chart
// engine as an SVG string. No JSXGraph, no runtime, no student input.
//
//   block (categories, series, …)
//         │
//         ├── chartIsDrawable(block) false  →  <figure data-figure-unavailable=
//         │                                     "degenerate-chart"> "Chart unavailable"
//         ▼
//   <figure class="viewer-figure-wrap" data-block-type="chart">
//     <div class="viewer-figure" role="img" aria-label={alt ?? title ?? "Chart"}
//          dangerouslySetInnerHTML={svg}/>   ← engine output, authored strings escaped
//     <table data-chart-table style={VISUALLY_HIDDEN}>   ← N3
//   </figure>
//
// LAZY (N5). Bound `loading: 'lazy'` in registry/bindings.ts like data_plot, so
// the chart engine costs the student shell nothing; once the chunk is in, the
// SVG renders synchronously, and print rides the lazy-block path data_plot
// already prints through.
//
// IT REUSES THE FIGURE'S MARKUP, DELIBERATELY: `.viewer-figure > svg` already
// carries the width cap, the print cap and the dark-mode label rule, so this
// block adds NO CSS — the shell stylesheet has about 300 bytes of headroom
// (ER-9), and a lazy block's rules would land in it anyway. A chart is wider
// than a triangle, so it raises the two cap custom properties inline.
//
// THE HIDDEN TABLE (N3) is the chart's accessible content: built from the same
// data the bars are, so it cannot drift from the picture and costs the author
// nothing. `alt:` is optional here for that reason. The table is a SIBLING of
// the role="img" div, never a child — role="img" makes children
// presentational, which would hide the table from the reader it exists for.
// =============================================================================

import type { CSSProperties } from 'react';
import { chartIsDrawable, type ChartBlock } from '@activity/schema';
import { formatChartValue, renderChartSvg } from '@activity/graph-kit/chart-svg';
import type { BlockComponentProps } from '../registry/types.js';
import { VISUALLY_HIDDEN } from './canvasChrome.js';

export default function Chart({ block }: BlockComponentProps<ChartBlock>) {
  // An unsized chart takes more room than a geometry figure (a 500-wide plot
  // with a legend is unreadable at 20rem); a sized one fills its footprint.
  const sized = block.width !== undefined;
  const caps = {
    '--vw-figure-cap-standalone': sized ? '100%' : '34rem',
    '--vw-figure-cap-standalone-print': sized ? '100%' : '5.5in',
  } as CSSProperties;

  const svg = chartIsDrawable(block) ? renderChartSvg(block, block.id) : '';
  if (svg === '') {
    return (
      <figure
        className="viewer-figure viewer-figure--unavailable"
        data-block-type="chart"
        data-figure-unavailable="degenerate-chart"
        role="img"
        aria-label="Chart unavailable"
        style={{ ...caps, aspectRatio: '5 / 3' }}
      >
        Chart unavailable
      </figure>
    );
  }

  const title = block.title?.trim();
  const alt = block.alt?.trim();
  return (
    <figure className="viewer-figure-wrap" data-block-type="chart" style={caps}>
      <div
        className="viewer-figure"
        role="img"
        aria-label={alt || title || 'Chart'}
        // The ONE dangerouslySetInnerHTML in this block. Input is always
        // renderChartSvg output, which escapes every authored string.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <table data-chart-table="" style={VISUALLY_HIDDEN}>
        {title ? <caption>{title}</caption> : null}
        <thead>
          <tr>
            <th scope="col">{block.xLabel?.trim() || 'Category'}</th>
            {block.categories.map((category, c) => (
              <th key={c} scope="col">
                {category}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.series.map((series, i) => (
            <tr key={i}>
              <th scope="row">{series.name || block.yLabel?.trim() || 'Value'}</th>
              {series.values.map((value, c) => (
                <td key={c}>{formatChartValue(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
