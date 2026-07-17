// =============================================================================
// index.ts — Public API for @activity/graph-kit
// -----------------------------------------------------------------------------
// The shared graphing kit. Stage 1 ships the scientific calculator (one of the
// kit's "two faces"); the graded interactive-graph block drops onto the same kit
// later. Consumed two ways from one implementation:
//   - published pages lazy-import() the built bundle (the calculator-summon
//     sidecar mounts it on first click);
//   - the editor preview imports it directly so authors see what students get.
// =============================================================================

// LAZY: the calculator half (MathLive + the panel chrome) is dynamic-imported
// behind this async wrapper, so it splits into its own chunk — a graph-only
// page loads the entry (scorers + widget mounts + the runtime plumbing below)
// without ever fetching MathLive. Cost: the first calculator open pays one
// extra round trip (entry, then the calculator chunk) — accepted 2026-07-10,
// same call as the JSXGraph split. Consumers await the handle; both call
// sites (the summon sidecar, the editor preview) were updated with it.
export async function mountCalculator(
  mount: HTMLElement,
  rawConfig?: unknown,
  hooks: MountHooks = {},
): Promise<CalculatorHandle> {
  const mod = await import('./calculator.js');
  return mod.mountCalculator(mount, rawConfig, hooks);
}
export type { CalculatorConfig, CalculatorHandle, MountHooks } from './calculator.js';
import type { CalculatorHandle, MountHooks } from './calculator.js';

// The evaluation seam — exported so the future graded regression block can score
// with the SAME engine (see docs/design/interactive-graph-block.md), and so it
// stays unit-testable in isolation.
export {
  evaluate,
  normalizeAsciiMath,
  compileFunction,
  classifyExpression,
} from './evaluate.js';
export type { EvalOptions, EvalResult, ExpressionRow } from './evaluate.js';

// The least-squares engine (Stage 3) — pure math, standalone, so the future
// graded regression block scores with the SAME fits the calculator shows.
export {
  fitModel,
  fitLinear,
  fitQuadratic,
  fitExponential,
} from './regression.js';
export type {
  RegressionModel,
  DataPoint,
  Fit,
  FitOutcome,
} from './regression.js';
export { equationText, r2Text, formatCoefficient } from './fit-format.js';
export { createDataTable } from './data-table.js';
export type { DataTableHandle } from './data-table.js';

// The graded interactive-graph widget (Stage 5). mountGraphQuestion is the entry
// the published page's runtime sidecar calls; it dynamic-imports the board so
// JSXGraph stays in its own chunk (a scientific-only page never loads it).
export {
  mountGraphQuestion,
  mountGraphSystemQuestion,
  mountGraphFunctionSystemQuestion,
  mountGraphAuthor,
  mountGraphDisplay,
} from './graph-question.js';
export type {
  GraphQuestionConfig,
  GraphQuestionHandle,
  GraphQuestionHooks,
  GraphResponseData,
  GraphAuthorConfig,
  GraphAuthorHandle,
  GraphAuthorHooks,
  GraphDisplayConfig,
  GraphDisplayHandle,
} from './graph-question.js';
export type { DisplayDrawable } from './board.js';

// The graded number-line widget (1-D). mountNumberLineQuestion is what the
// runtime sidecar calls per number_line block; mountNumberLineAuthor is the
// editor's authoring twin. Both dynamic-import the 1-D board so JSXGraph stays
// in its own chunk. The pure scorers are exported for the runtime/tests/server.
export {
  mountNumberLineQuestion,
  mountNumberLineAuthor,
} from './number-line-question.js';
export type {
  NumberLineQuestionConfig,
  NumberLineQuestionHandle,
  NumberLineQuestionHooks,
  NumberLineResponseData,
  NumberLineRestoreExtras,
  NumberLineAuthorConfig,
  NumberLineAuthorHandle,
  NumberLineAuthorHooks,
} from './number-line-question.js';
export {
  scoreNumberLinePoints,
  scoreNumberLineInterval,
} from './number-line-score.js';
export type {
  NumberLinePointKey,
  NumberLineIntervalKey,
  StudentInterval,
} from './number-line-score.js';

// The graded data-plot widget (statistics charts). mountDataPlotQuestion is what
// the runtime sidecar calls per graded data_plot block; it dynamic-imports the
// SVG dot-plot board (no JSXGraph). There is no author twin — a data_plot is
// authored by editing its dataset and previewed with the renderer's static SVG.
export { mountDataPlotQuestion } from './data-plot-question.js';
export type {
  DataPlotQuestionConfig,
  DataPlotQuestionHandle,
  DataPlotQuestionHooks,
  DataPlotResponseData,
} from './data-plot-question.js';
export {
  scoreDotplot,
  frequencyMap,
  scoreHistogram,
  histogramCounts,
  scoreBoxplot,
  fiveNumberSummary,
} from './data-plot-score.js';
export type { FiveNumberSummary } from './data-plot-score.js';
export type {
  DataPlotBoardConfig,
  DataPlotBoardController,
  HistogramBoardController,
  BoxplotBoardController,
  FiveHandles,
} from './data-plot-board.js';

// Continuation-arrow geometry (pure) — exported for tests; board.ts is the
// real consumer.
export {
  curveEndArrows,
  rayArrowSpec,
  verticalArrowSpecs,
  arrowLength,
} from './display-arrows.js';
export type { ArrowSpec, ArrowWindow } from './display-arrows.js';

// The pure scorers — exported so the runtime/tests (and, later, server-side
// grading) score with the SAME logic the widget uses. scorePoints is the
// plot_point (consume-once, N-point) scorer; scoreFunction fits a curve of a
// family to the student's points and compares its parameters; fitFunction +
// handlesForFamily are the shared points↔curve helpers the editor authoring
// uses too.
export {
  scorePoints,
  scorePointsPartial,
  isPointCorrect,
  scoreFunction,
  scoreFunctionsPartial,
  fitFunction,
  handlesForFamily,
  startsForFamily,
  scoreRegion,
  scoreRegionsPartial,
  polygonOverlap,
  scoreRay,
  scoreRayParts,
  scoreRayPartial,
  scoreSegment,
  scoreSegmentParts,
  rayKeyShape,
  canonicalPair,
  rayArrowGlyphs,
  endpointLabels,
} from './graph-score.js';
export type {
  PointAnswerKey,
  FunctionModel,
  Fitted,
  SeedWindow,
  RegionAnswerKey,
  RayAnswerKey,
  SegmentAnswerKey,
  LinearShape,
  LinearPieceStudentAnswer,
} from './graph-score.js';

// Mistake feedback (Drop B): authored anticipated-mistake matching + built-in
// classifiers. Pure like the scorers; the widget consumes these internally and
// tests/tooling reach them here.
export {
  compileMistakeMatchers,
  matchAuthoredMistake,
  classifyPointMistake,
  classifyFunctionMistake,
  classifyInequalityMistake,
} from './mistakes.js';

// The freeform teacher command line (Drop 3): parse ANY equation/inequality/
// point-list format into a graph answer; format models back to canonical,
// reparseable strings. Shared by the editor's answer field, inequality
// authoring, and the markdown ```graph importer.
export {
  parseGraphFormula,
  parsePointList,
  formatModel,
  formatInequality,
  formatDomainClause,
  formatPoints,
  parseRaySegment,
  formatRay,
  formatSegment,
} from './formula.js';
export type { ParsedFormula, ParsedDomain, ShadeSide, ParsedRaySegment } from './formula.js';

// Authored drawable colors: a stored palette KEY resolves to a hex here, the
// single source shared by the board, the renderer SVG, and the app picker.
export {
  DRAWABLE_PALETTE,
  DRAWABLE_PALETTE_KEYS,
  DRAWABLE_DEFAULT_COLOR,
  resolveDrawableColor,
} from './drawable-palette.js';
export type { DrawableColorKey } from './drawable-palette.js';

// The published-page graph plumbing (2026-07-10 bundle-budget move): the page's
// inline runtime bridge dynamic-imports this entry and calls attachGraphRuntime
// once, handing over the graph blocks + live state. The contract types are the
// compile-enforced seam BOTH sides import (the bridge type-only) — see
// runtime-contract.ts.
export { attachGraphRuntime, buildGraphChrome, renderGraphChrome } from './runtime.js';
export type { GraphChromeRef } from './runtime.js';
export type {
  GraphBlockState,
  GraphConfidence,
  GraphDomainAnswer,
  GraphRuntimeBlockRef,
  GraphRuntimeContext,
  GraphRuntimeDisplayRef,
  GraphRuntimeExt,
  GraphRuntimeStateView,
  GraphSectionStateView,
} from './runtime-contract.js';

// The number-line plumbing (1-D sibling, same lazy kit): the bridge's
// numberLineExt seam dynamic-imports this entry and calls attachNumberLineRuntime.
export {
  attachNumberLineRuntime,
  buildNumberLineChrome,
  renderNumberLineChrome,
} from './runtime.js';
export type { NumberLineChromeRef } from './runtime.js';
export type {
  NumberLineBlockState,
  NumberLineInterval,
  NumberLineRuntimeBlockRef,
  NumberLineRuntimeContext,
  NumberLineRuntimeExt,
  NumberLineRuntimeStateView,
} from './runtime-contract.js';

// The data-plot plumbing (statistics sibling, same lazy kit): the bridge's
// dataPlotExt seam dynamic-imports this entry and calls attachDataPlotRuntime.
export {
  attachDataPlotRuntime,
  buildDataPlotChrome,
  renderDataPlotChrome,
} from './runtime.js';
export type {
  DataPlotBlockState,
  DataPlotRuntimeBlockRef,
  DataPlotRuntimeContext,
  DataPlotRuntimeExt,
  DataPlotRuntimeStateView,
} from './runtime-contract.js';

// NOTE: board.ts (JSXGraph) is deliberately NOT re-exported here — that would
// static-import it into the entry and defeat the lazy-split. Consumers that need
// the board (the calculator's graphing mode, the future graded block) dynamic-
// import('./board.js') so JSXGraph stays in its own on-demand chunk. The same
// applies to calculator.ts (MathLive) — reachable only through the async
// mountCalculator wrapper above, never a static re-export.
