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
  scoreRay,
  scoreRayParts,
  scoreSegment,
  scoreSegmentParts,
  canonicalPair,
  type PointAnswerKey,
  type FunctionModel,
  type InequalitySide,
  type RayAnswerKey,
  type SegmentAnswerKey,
  type LinearShape,
  type LinearPieceStudentAnswer,
} from './graph-score.js';
import { parseGraphFormula, parsePointList, parseRaySegment } from './formula.js';

// The student's current answer, as the widget knows it. One shape for every
// interaction type — irrelevant fields are simply absent.
export interface StudentGraphAnswer {
  points: [number, number][];
  strict?: boolean;
  side?: InequalitySide | null;
  /** plot_ray / plot_segment: the student's chosen shape (null = unchosen). */
  shape?: LinearShape | null;
  /** plot_ray / plot_segment: visible endpoint style choices (see
   *  LinearPieceStudentAnswer.endpointStyles). */
  endpointStyles?: ('open' | 'closed')[];
}

// Coerce a StudentGraphAnswer into the linear-piece scorer's shape.
function toLinearAnswer(ans: StudentGraphAnswer): LinearPieceStudentAnswer {
  const a = ans.points[0] ?? ([0, 0] as [number, number]);
  const b = ans.points[1] ?? ([0, 0] as [number, number]);
  const [lesser, greater] = canonicalPair(a, b);
  return {
    points: [lesser, greater],
    shape: ans.shape ?? null,
    endpointStyles: ans.endpointStyles ?? [],
  };
}

// ---- 1. Authored anticipated mistakes ---------------------------------------

export interface CompiledMistake {
  /** Index into the block's authored mistakeFeedback array (→ its template). */
  index: number;
  test(ans: StudentGraphAnswer): boolean;
}

export interface MistakeCompileContext {
  interactionType: string;
  /** plot_point: the answer key's tolerance, reused for match comparison.
   *  plot_ray / plot_segment reuse it as the endpoint tolerance. */
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
    if (ctx.interactionType === 'plot_ray' || ctx.interactionType === 'plot_segment') {
      // A match string may describe EITHER figure — the anticipated mistake on
      // a ray question is often the segment (or opposite ray) version of it.
      const parsed = parseRaySegment(raw);
      if (parsed.kind === 'ray') {
        const key: RayAnswerKey = {
          from: parsed.from,
          through: parsed.through,
          fromStyle: parsed.fromStyle,
          tolerance: ctx.pointTolerance ?? 0.25,
        };
        return { index, test: (ans) => scoreRay(key, toLinearAnswer(ans)) };
      }
      if (parsed.kind === 'segment') {
        const key: SegmentAnswerKey = {
          from: parsed.from,
          to: parsed.to,
          endpoints: parsed.endpoints,
          tolerance: ctx.pointTolerance ?? 0.25,
        };
        return { index, test: (ans) => scoreSegment(key, toLinearAnswer(ans)) };
      }
      return never;
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

/** plot_function: linear slope/intercept mix-ups + quadratic shape nudges.
 * Exponential/logarithmic classifiers wait on observed student data (author
 * call 2026-07-10) — authored mistakeFeedback covers those families today. */
export function classifyFunctionMistake(
  model: FunctionModel,
  studentPoints: [number, number][],
): string | null {
  if (model.family === 'quadratic') {
    const fitted = fitFunction('quadratic', studentPoints);
    if (!fitted || fitted.family !== 'quadratic') return null;
    const aOk = Math.abs(fitted.a - model.a) <= model.aTolerance;
    const bOk = Math.abs(fitted.b - model.b) <= model.bTolerance;
    const cOk = Math.abs(fitted.c - model.c) <= model.cTolerance;
    // Opens the wrong way dominates: a mirrored parabola usually disturbs b and
    // c too, so test the flipped leading coefficient before the part-wise
    // nudges. Skip when the key's parabola is (near-)degenerate — a ≈ −a would
    // fire on every answer.
    if (
      !aOk &&
      Math.abs(model.a) > model.aTolerance &&
      Math.abs(fitted.a + model.a) <= model.aTolerance
    ) {
      return 'Check which way your parabola opens — upward or downward?';
    }
    if (aOk && bOk && !cOk) {
      return 'The shape of your parabola looks right — check where it crosses the y-axis.';
    }
    if (aOk && !bOk && cOk) {
      return 'Your parabola opens the right way and crosses the y-axis in the right place — check where its lowest or highest point sits.';
    }
    if (!aOk && bOk && cOk) {
      return 'Check how wide or narrow your parabola should be.';
    }
    return null;
  }
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

/**
 * plot_ray: which part (shape choice / placement / endpoint style) to revisit.
 * Same nudge-not-lesson posture: never teaches the open/closed convention.
 */
export function classifyRayMistake(
  key: RayAnswerKey,
  ans: LinearPieceStudentAnswer,
): string | null {
  const parts = scoreRayParts(key, ans);
  // Shape misses dominate: with the wrong shape chosen, the student's styled
  // endpoint may sit at the other end entirely, so the style part carries no
  // signal — nudge the shape whenever the LINE itself is right.
  if (parts.placement && !parts.shape) {
    if (ans.shape === null) {
      return 'Your line looks right — now choose its shape with the buttons.';
    }
    if (ans.shape !== 'segment') {
      // The opposite ray direction — the classic one, worth naming.
      return 'Your line is right — check which way the arrow should point.';
    }
    return 'Your line is in the right place — take another look at the shape you chose.';
  }
  if (parts.shape && !parts.placement) {
    return 'Your shape looks right — check where your line sits and where it starts.';
  }
  if (parts.shape && parts.placement && !parts.style) {
    return 'So close — take another look at the style of the endpoint.';
  }
  return null;
}

/** plot_segment: shape vs endpoints vs styles nudges. */
export function classifySegmentMistake(
  key: SegmentAnswerKey,
  ans: LinearPieceStudentAnswer,
): string | null {
  const parts = scoreSegmentParts(key, ans);
  if (parts.earned === parts.total) return null;
  if (!parts.shape && parts.positions === 2) {
    if (ans.shape === null) {
      return 'Your endpoints look right — now choose the shape with the buttons.';
    }
    return 'Your endpoints are in the right place — take another look at the shape you chose.';
  }
  if (parts.shape && parts.positions === 2 && parts.styles < 2) {
    return 'Your segment is in the right place — take another look at the endpoint styles.';
  }
  if (parts.shape && parts.styles === 2 && parts.positions < 2) {
    return 'Your endpoint styles look right — check where the segment starts and ends.';
  }
  return null;
}
