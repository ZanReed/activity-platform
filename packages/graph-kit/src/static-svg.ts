// =============================================================================
// static-svg.ts — kit-free static SVG rendering (@activity/graph-kit/static-svg)
// -----------------------------------------------------------------------------
// A narrow, PURE entry point: string in, SVG string out. No DOM, no JSXGraph,
// no MathLive — the same discipline as ./scorers, and for the same reason. The
// package barrel re-exports the mount functions and the LaTeX bridge, so
// importing through it drags a megabyte of MathLive into anything that only
// wanted to draw axes (the S4 bundle leak, learning
// `graph-kit-barrel-pulls-mathlive-into-server-bundles`).
//
// WHY IT LIVES HERE. Both surfaces need identical static graphs on paper: the
// renderer prints them today, and the viewer's print twins must match (S5-1 as
// amended by OV4 — question variants print empty axes, display variants print
// their authored drawables). The viewer must not import the renderer, which
// dies at S5.5; the renderer must not import the viewer either, since it is the
// one being replaced. graph-kit is the package BOTH already depend on and the
// one that outlives the cutover, so it is the only home that creates no new
// dependency edge and leaves nothing dangling.
//
// Moved wholesale from packages/renderer/src/*-svg.ts; the renderer now
// re-exports these, so its output stays byte-identical and its existing suite
// is the proof of that.
// =============================================================================

export { renderGraphSvg, answerKeyDrawables } from './static-svg/graph-svg.js';
export {
  renderNumberLineSvg,
  answerKeyMarks,
} from './static-svg/number-line-svg.js';
export type { NumberLineMark } from './static-svg/number-line-svg.js';
export {
  renderDataPlotSvg,
  dotCounts,
  histogramBins,
  fiveNumberSummary,
} from './static-svg/data-plot-svg.js';
export { escape, attr } from './static-svg/html.js';
