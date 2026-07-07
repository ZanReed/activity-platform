// =============================================================================
// graph-question.ts — the graded interactive-graph widget (Stage 5)
// -----------------------------------------------------------------------------
// The kit-side half of the interactive-graph block. The published page's runtime
// sidecar dynamic-imports the kit and calls mountGraphQuestion() for each graph
// block; this module owns the interactive answer surface (the JSXGraph board +
// the student's point) and reports the answer back through hooks. The runtime
// owns everything outside the canvas — persistence, checkpoint scoring, the
// submit payload, and the block's aria-live region (it narrates from onChange).
//
// JSXGraph stays lazy: mountGraphQuestion lives in the kit ENTRY, but the board
// (which statically imports JSXGraph) is dynamic-imported here — the same split
// the calculator's graphing mode uses, so a page only pays for JSXGraph once the
// widget actually mounts.
// =============================================================================

import {
  scorePoints,
  scoreFunction,
  fitFunction,
  handlesForFamily,
  type PointAnswerKey,
  type FunctionModel,
} from './graph-score.js';
import type { PointAnswerConfig, PointAnswerController } from './board.js';

// Read the plot_function model out of the data-graph-answer-key payload (which
// for plot_function is `{ model: {...} }`), defaulting a malformed/absent one to
// a benign linear model rather than throwing. Only `linear` is modelled today.
function readModel(raw: unknown): FunctionModel {
  const m = ((raw ?? {}) as { model?: Partial<FunctionModel> }).model ?? {};
  const numOr = (v: unknown, d: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? v : d;
  return {
    family: 'linear',
    slope: numOr(m.slope, 1),
    intercept: numOr(m.intercept, 0),
    slopeTolerance: numOr((m as { slopeTolerance?: unknown }).slopeTolerance, 0.1),
    interceptTolerance: numOr(
      (m as { interceptTolerance?: unknown }).interceptTolerance,
      0.1,
    ),
  };
}

// The board recipe (handle count, curve to draw, scorer) for one interaction.
interface Recipe {
  count: number;
  scorer: (points: [number, number][]) => boolean;
  deriveCurve?: PointAnswerConfig['deriveCurve'];
}

function recipeFor(interactionType: string, answerKey: unknown): Recipe {
  if (interactionType === 'plot_function') {
    const model = readModel(answerKey);
    const family = model.family;
    return {
      count: handlesForFamily(family),
      scorer: (pts) => scoreFunction(model, pts),
      deriveCurve: (pts) => {
        const f = fitFunction(family, pts);
        return f ? f.predict : null;
      },
    };
  }
  const key = readAnswerKey(answerKey);
  return {
    count: Math.max(1, key.correctPoints.length),
    scorer: (pts) => scorePoints(key, pts),
  };
}

// The parsed block config the runtime hands us (from the data-* attributes).
export interface GraphQuestionConfig {
  interactionType: string;
  axisConfig: PointAnswerConfig;
  answerKey: PointAnswerKey;
}

// What the widget reports on every change and at gather time. `answered` lets
// the runtime distinguish "student engaged" from the untouched starting point.
export interface GraphResponseData {
  studentPoints: [number, number][];
  correct: boolean;
  answered: boolean;
}

export interface GraphQuestionHooks {
  /** Fired on every student move (drag or keyboard). The runtime persists +
   *  narrates from this. */
  onChange?: (resp: GraphResponseData) => void;
}

export interface GraphQuestionHandle {
  /** The current answer — read at check/submit time. */
  getResponse(): GraphResponseData;
  /** Restore a previously-stored point (bootstrap on reload). */
  restore(points: [number, number][]): void;
  /** Lock (post-check) or unlock the handle. */
  setLocked(locked: boolean): void;
  destroy(): void;
}

// Coerce the runtime-supplied config into a safe PointAnswerConfig, defaulting
// anything malformed rather than throwing — a graph that renders with sane
// defaults beats a page-breaking parse error.
function readAxis(raw: unknown): PointAnswerConfig {
  const a = (raw ?? {}) as Partial<PointAnswerConfig>;
  const num = (v: unknown, d: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? v : d;
  const pos = (v: unknown, d: number): number => {
    const n = num(v, d);
    return n > 0 ? n : d;
  };
  return {
    xMin: num(a.xMin, -10),
    xMax: num(a.xMax, 10),
    yMin: num(a.yMin, -10),
    yMax: num(a.yMax, 10),
    xGridStep: pos(a.xGridStep, 1),
    yGridStep: pos(a.yGridStep, 1),
    showGrid: a.showGrid !== false,
    snapToGrid: a.snapToGrid !== false,
  };
}

function readAnswerKey(raw: unknown): PointAnswerKey {
  const k = (raw ?? {}) as Partial<PointAnswerKey>;
  const pts = Array.isArray(k.correctPoints)
    ? k.correctPoints.filter(
        (p): p is [number, number] =>
          Array.isArray(p) &&
          p.length === 2 &&
          typeof p[0] === 'number' &&
          typeof p[1] === 'number',
      )
    : [];
  const tol =
    typeof k.tolerance === 'number' && k.tolerance >= 0 ? k.tolerance : 0.1;
  return { correctPoints: pts, tolerance: tol };
}

export async function mountGraphQuestion(
  mount: HTMLElement,
  rawConfig: unknown,
  hooks: GraphQuestionHooks = {},
): Promise<GraphQuestionHandle> {
  const cfg = (rawConfig ?? {}) as Partial<GraphQuestionConfig>;
  const axis = readAxis(cfg.axisConfig);
  const interactionType =
    typeof cfg.interactionType === 'string' ? cfg.interactionType : 'plot_point';
  const recipe = recipeFor(interactionType, cfg.answerKey);

  // The renderer seeds a static no-JS placeholder inside the canvas; clear it
  // before JSXGraph mounts so the two don't overlap.
  mount.textContent = '';

  // Lazy-load the board layer (JSXGraph in its own chunk).
  const { createPointAnswerBoard } = await import('./board.js');

  let answered = false;

  // Function declarations (hoisted) so they can close over `board`, which is
  // assigned just below and only ever read after the board exists.
  function build(): GraphResponseData {
    const pts = board.getPoints();
    return {
      studentPoints: pts,
      correct: recipe.scorer(pts),
      answered,
    };
  }
  function handleMove(): void {
    if (board.hasMoved()) answered = true;
    hooks.onChange?.(build());
  }

  const board: PointAnswerController = createPointAnswerBoard(
    mount,
    { ...axis, count: recipe.count, deriveCurve: recipe.deriveCurve },
    { onMove: handleMove },
  );

  return {
    getResponse: build,
    restore(points: [number, number][]): void {
      if (points.length === 0) return;
      answered = true;
      board.setPoints(points);
    },
    setLocked(locked: boolean): void {
      board.setInteractive(!locked);
    },
    destroy(): void {
      board.destroy();
    },
  };
}

// ---- Authoring -------------------------------------------------------------
// The editor NodeView mounts THIS (not mountGraphQuestion) so a teacher defines
// the answer by dragging: the handle positions ARE correctPoints. Same board,
// same snap-to-grid, no scoring — the author is setting the key, not answering
// against it. Reuses the lazy JSXGraph chunk. (Stage 5 slice 2.)

export interface GraphAuthorConfig {
  interactionType: string;
  axisConfig: unknown;
  /**
   * The starting handle positions. For plot_point these ARE the correct points.
   * For plot_function the NodeView passes points ON the current curve (computed
   * from the model) so the handles start on the authored line; the NodeView then
   * re-derives the model from the dragged points on each onChange.
   */
  correctPoints: [number, number][];
  /**
   * For plot_function: the curve family, so the author board draws the fitted
   * curve through the handles (and shows the right number of them). Absent for
   * plot_point.
   */
  family?: string;
}

export interface GraphAuthorHooks {
  /** Fired as the author drags/keys a handle — the new correctPoints. */
  onChange?: (correctPoints: [number, number][]) => void;
}

export interface GraphAuthorHandle {
  getPoints(): [number, number][];
  destroy(): void;
}

export async function mountGraphAuthor(
  mount: HTMLElement,
  rawConfig: unknown,
  hooks: GraphAuthorHooks = {},
): Promise<GraphAuthorHandle> {
  const cfg = (rawConfig ?? {}) as Partial<GraphAuthorConfig>;
  const axis = readAxis(cfg.axisConfig);
  const points = Array.isArray(cfg.correctPoints)
    ? cfg.correctPoints.filter(
        (p): p is [number, number] =>
          Array.isArray(p) &&
          p.length === 2 &&
          typeof p[0] === 'number' &&
          typeof p[1] === 'number',
      )
    : [];
  const family = typeof cfg.family === 'string' ? cfg.family : undefined;
  // plot_function fixes the handle count by family; plot_point uses one per point.
  const count = family ? handlesForFamily(family) : Math.max(1, points.length);
  const deriveCurve: PointAnswerConfig['deriveCurve'] | undefined = family
    ? (pts) => {
        const f = fitFunction(family, pts);
        return f ? f.predict : null;
      }
    : undefined;

  mount.textContent = '';
  const { createPointAnswerBoard } = await import('./board.js');

  const board = createPointAnswerBoard(
    mount,
    {
      ...axis,
      count,
      starts: points.length === count ? points : undefined,
      deriveCurve,
    },
    { onMove: (_active, pts) => hooks.onChange?.(pts) },
  );

  return {
    getPoints: board.getPoints,
    destroy: board.destroy,
  };
}
