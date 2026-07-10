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
  formatPoints,
  parseRaySegment,
  formatRay,
  formatSegment,
} from './formula.js';
export type { ParsedFormula, ParsedDomain, ShadeSide, ParsedRaySegment } from './formula.js';

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

// NOTE: board.ts (JSXGraph) is deliberately NOT re-exported here — that would
// static-import it into the entry and defeat the lazy-split. Consumers that need
// the board (the calculator's graphing mode, the future graded block) dynamic-
// import('./board.js') so JSXGraph stays in its own on-demand chunk. The same
// applies to calculator.ts (MathLive) — reachable only through the async
// mountCalculator wrapper above, never a static re-export.
