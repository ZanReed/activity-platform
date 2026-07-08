// =============================================================================
// mistakes.ts — mistake classification for the graded graph widget (pure)
// -----------------------------------------------------------------------------
// Two layers, both DOM-free and unit-testable like graph-score.ts:
//
//   1. AUTHORED anticipated mistakes — the graph twin of a blank's
//      mistakeFeedback. The teacher types a wrong answer in the SAME freeform
//      syntax the authoring formula field accepts ("(4, 3)", "y = x + 2",
//      "y < 2x + 1"); compileMistakeMatchers parses each once (with the kit's
//      own parser — the shared contract) and compares the student's answer
//      using the same scorers and tolerances as grading. First match wins.
//
//   2. BUILT-IN classifiers — zero-authoring nudges for the classic wrong
//      answers (swapped coordinates, swapped slope/intercept, right-boundary-
//      wrong-side…). Deliberately nudges, not lessons: they say WHICH part to
//      revisit without teaching the convention being assessed (e.g. never
//      "dotted means strict").
//
// The widget (graph-question.ts) evaluates authored matchers first, then the
// built-ins (when the block hasn't disabled them), and reports the hit on its
// response; the page runtime displays it after the section is checked.
//
// Lives in its own module (not graph-score.ts) because it needs the formula
// parser, and formula.ts already imports graph-score.ts — this direction keeps
// the import graph acyclic.
// =============================================================================

import {
  scorePoints,
  scoreFunction,
  fitFunction,
  type PointAnswerKey,
  type FunctionModel,
  type InequalitySide,
} from './graph-score.js';
import { parseGraphFormula, parsePointList } from './formula.js';

// The student's current answer, as the widget knows it. One shape for every
// interaction type — irrelevant fields are simply absent.
export interface StudentGraphAnswer {
  points: [number, number][];
  strict?: boolean;
  side?: InequalitySide | null;
}

// ---- 1. Authored anticipated mistakes ---------------------------------------

export interface CompiledMistake {
  /** Index into the block's authored mistakeFeedback array (→ its template). */
  index: number;
  test(ans: StudentGraphAnswer): boolean;
}

export interface MistakeCompileContext {
  interactionType: string;
  /** plot_point: the answer key's tolerance, reused for match comparison. */
  pointTolerance?: number;
  /** plot_function / graph_inequality: the key's model — same-family matches
   *  inherit its tuned tolerances so "match" and "score" agree on closeness. */
  keyModel?: FunctionModel;
}

// Transplant the answer key's tuned per-parameter tolerances onto a parsed
// match model of the same family (the parser only knows its 0.1 defaults).
function withKeyTolerances(
  model: FunctionModel,
  keyModel: FunctionModel | undefined,
): FunctionModel {
  if (!keyModel || keyModel.family !== model.family) return model;
  const tolerances = Object.fromEntries(
    Object.entries(keyModel).filter(([k]) => k.endsWith('Tolerance')),
  );
  return { ...model, ...tolerances } as FunctionModel;
}

/**
 * Parse each authored match string into a predicate over the student's answer.
 * Unparseable or type-mismatched entries compile to never-matching predicates
 * (the editor validates on entry; a stale string must not break the page).
 */
export function compileMistakeMatchers(
  matches: string[],
  ctx: MistakeCompileContext,
): CompiledMistake[] {
  return matches.map((raw, index) => {
    const never: CompiledMistake = { index, test: () => false };
    if (typeof raw !== 'string' || raw.trim() === '') return never;

    if (ctx.interactionType === 'plot_point') {
      const points = parsePointList(raw);
      if (!points || points.length === 0) return never;
      const key: PointAnswerKey = {
        correctPoints: points,
        tolerance: ctx.pointTolerance ?? 0.1,
      };
      return { index, test: (ans) => scorePoints(key, ans.points) };
    }

    const parsed = parseGraphFormula(raw);
    if (ctx.interactionType === 'plot_function') {
      if (parsed.kind !== 'function') return never;
      const model = withKeyTolerances(parsed.model, ctx.keyModel);
      return { index, test: (ans) => scoreFunction(model, ans.points) };
    }
    if (ctx.interactionType === 'graph_inequality') {
      if (parsed.kind === 'inequality') {
        const boundary = withKeyTolerances(parsed.boundary, ctx.keyModel);
        return {
          index,
          test: (ans) =>
            scoreFunction(boundary, ans.points) &&
            ans.strict === parsed.strict &&
            ans.side === parsed.side,
        };
      }
      if (parsed.kind === 'function') {
        // A bare equation anticipates a wrong BOUNDARY regardless of the
        // student's shading choices.
        const model = withKeyTolerances(parsed.model, ctx.keyModel);
        return { index, test: (ans) => scoreFunction(model, ans.points) };
      }
      return never;
    }
    return never;
  });
}

/** First authored match against the student's answer, or null. */
export function matchAuthoredMistake(
  matchers: CompiledMistake[],
  ans: StudentGraphAnswer,
): number | null {
  for (const m of matchers) {
    if (m.test(ans)) return m.index;
  }
  return null;
}

// ---- 2. Built-in classifiers -------------------------------------------------
// Each returns a default message for a recognized wrong-answer pattern, or null
// (caller falls back to the generic "Not quite"). Callers invoke these only
// AFTER scoring said wrong — a classifier never re-decides correctness.

/** plot_point: swapped (x, y) order, then sign errors. */
export function classifyPointMistake(
  key: PointAnswerKey,
  studentPoints: [number, number][],
): string | null {
  if (studentPoints.length === 0) return null;
  const swap = studentPoints.map(([x, y]) => [y, x] as [number, number]);
  if (scorePoints(key, swap)) {
    return 'Check the order of your coordinates — a point is (x, y): x first, then y.';
  }
  const flips: [number, number][] = [[-1, 1], [1, -1], [-1, -1]];
  for (const [fx, fy] of flips) {
    const flipped = studentPoints.map(([x, y]) => [fx * x, fy * y] as [number, number]);
    if (scorePoints(key, flipped)) {
      return 'Check the signs of your coordinates — positive or negative?';
    }
  }
  return null;
}

/** plot_function (linear only in v1): slope/intercept mix-ups. */
export function classifyFunctionMistake(
  model: FunctionModel,
  studentPoints: [number, number][],
): string | null {
  if (model.family !== 'linear') return null;
  const fitted = fitFunction('linear', studentPoints);
  if (!fitted || fitted.family !== 'linear') return null;
  const slopeOk = Math.abs(fitted.slope - model.slope) <= model.slopeTolerance;
  const interceptOk =
    Math.abs(fitted.intercept - model.intercept) <= model.interceptTolerance;
  if (slopeOk && !interceptOk) {
    return 'Your slope looks right — check where the line crosses the y-axis.';
  }
  if (!slopeOk && interceptOk) {
    if (Math.abs(fitted.slope + model.slope) <= model.slopeTolerance) {
      return 'Check the sign of your slope — should the line rise or fall left to right?';
    }
    return 'Your y-intercept looks right — check the steepness of your line.';
  }
  if (
    Math.abs(fitted.slope - model.intercept) <= model.slopeTolerance &&
    Math.abs(fitted.intercept - model.slope) <= model.interceptTolerance
  ) {
    return 'It looks like the slope and the y-intercept may have traded places.';
  }
  return null;
}

/**
 * graph_inequality: which of the three parts (boundary / side / style) to
 * revisit. `sidePicked` distinguishes a WRONG side from an unpicked one (an
 * unanswered part gets no "check your shading" nudge — there is nothing to
 * check yet). Messages nudge the part without teaching the solid/dotted
 * convention (that mapping is what the question assesses).
 */
export function classifyInequalityMistake(
  parts: { boundary: boolean; side: boolean; style: boolean },
  sidePicked: boolean,
): string | null {
  const sideWrong = sidePicked && !parts.side;
  if (parts.boundary && !sidePicked && parts.style) {
    return 'Your boundary line looks right — now choose which side to shade.';
  }
  if (parts.boundary && sideWrong && parts.style) {
    return 'Your boundary line is right — take another look at which side you shaded.';
  }
  if (parts.boundary && parts.side && !parts.style) {
    return 'So close — take another look at the style of your boundary line.';
  }
  if (parts.boundary && sideWrong && !parts.style) {
    return 'Your boundary line is right — check your shading and the line style.';
  }
  if (!parts.boundary && parts.side && parts.style) {
    return 'Your shading choices look right — check your boundary line.';
  }
  return null;
}
