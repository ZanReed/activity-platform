// =============================================================================
// scorers.ts — the pure scoring surface, safe for server-side grading
// -----------------------------------------------------------------------------
// A DELIBERATELY NARROW ENTRY POINT, added in S4. Everything re-exported here is
// pure: no DOM, no JSXGraph, no MathLive, no browser globals. It is what the
// server-side grading bundle imports, and importing from here rather than from
// the package barrel is load-bearing, not stylistic.
//
// WHY IT EXISTS. The barrel (`index.ts`) re-exports the mount functions and the
// LaTeX↔ascii bridge, which pull JSXGraph and MathLive. Importing the scorers
// through it put **1 MB of MathLive into the grading Edge Function** — caught by
// the bundle's size ceiling on its first run. That is exactly what the R2
// investigation said must not happen: the graded and persisted form of a math
// answer is already ascii (ruling MA-D3), so the server needs no LaTeX
// conversion and therefore no MathLive at all. Tree-shaking does not save you
// here — these libraries have module-level side effects.
//
// THE RULE FOR ADDING TO THIS FILE: a function belongs here only if it is pure
// and reachable without touching a browser API. If you find yourself wanting to
// export something that transitively imports a mount function, the answer is to
// split that module, not to widen this one.
// =============================================================================

// Expression equivalence — the math-blank grader. `mathjs/number` only.
export { mathEquivalent } from './math-equivalent.js';
export type { EquivalenceMode, MathEquivalentOptions } from './math-equivalent.js';

// 2-D graph scorers.
export {
  scorePoints,
  scorePointsPartial,
  isPointCorrect,
  scoreFunction,
  scoreFunctionsPartial,
  scoreFunctionSystem,
  scoreInequality,
  scoreInequalityParts,
  scoreInequalityPartial,
  scoreInequalitySystem,
  scoreDomain,
  scoreDomainParts,
  fitFunction,
  handlesForFamily,
  startsForFamily,
  modelToPredict,
  pointsOnModel,
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
} from './graph-score.js';
export type {
  PointAnswerKey,
  FunctionModel,
  Fitted,
  RegionAnswerKey,
  RayAnswerKey,
  SegmentAnswerKey,
  LinearShape,
  LinearPieceStudentAnswer,
  InequalityAnswerKey,
  InequalityStudentAnswer,
  InequalitySide,
  DomainAnswerKey,
  DomainStudentAnswer,
} from './graph-score.js';

// 1-D (number line) scorers.
export {
  scoreNumberLinePoints,
  scoreNumberLineInterval,
} from './number-line-score.js';
export type {
  NumberLinePointKey,
  NumberLineIntervalKey,
  StudentInterval,
} from './number-line-score.js';

// Statistics-chart scorers. The key is computed from the dataset, not authored.
export {
  scoreDotplot,
  frequencyMap,
  scoreHistogram,
  histogramCounts,
  scoreBoxplot,
  fiveNumberSummary,
} from './data-plot-score.js';
export type { FiveNumberSummary } from './data-plot-score.js';

// Mistake classification — authored matchers + built-in classifiers. Pure
// (formula parser + scorers only); the server's check path uses these to
// annotate a wrong graph answer with feedback and a misconception id.
// The shared formula parser — the transform_curve typed channel parses the
// student's equation server-side with the SAME parser the editor and importer
// use (no second grammar). Already in the grading bundle via mistakes.ts.
export { parseGraphFormula } from './formula.js';

// Seeded answer keys (wishlist #6, R6): the grading side evaluates a bound
// key expression ("(6)*(1.75)") to the literal the numeric compare expects.
// compileFunction is already pure mathjs/number — no size change to the
// grading bundle, which carried it transitively via formula.
export { compileFunction, freeVariables } from './evaluate.js';

export {
  compileMistakeMatchers,
  matchAuthoredMistake,
  classifyPointMistake,
  classifyFunctionMistake,
  classifyInequalityMistake,
  classifyRayMistake,
  classifySegmentMistake,
} from './mistakes.js';
export type {
  CompiledMistake,
  MistakeCompileContext,
  StudentGraphAnswer,
} from './mistakes.js';
