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
  scorePointsPartial,
  scoreFunction,
  scoreRegion,
  scoreInequalityParts,
  scoreInequality,
  scoreInequalitySystem,
  scoreFunctionSystem,
  scoreDomainParts,
  scoreRayParts,
  scoreSegmentParts,
  canonicalPair,
  rayArrowGlyphs,
  endpointLabels,
  fitFunction,
  handlesForFamily,
  startsForFamily,
  type SeedWindow,
  type PointAnswerKey,
  type FunctionModel,
  type RegionAnswerKey,
  type InequalityAnswerKey,
  type DomainAnswerKey,
  type RayAnswerKey,
  type SegmentAnswerKey,
  type LinearShape,
  type LinearPieceStudentAnswer,
} from './graph-score.js';
import {
  compileMistakeMatchers,
  matchAuthoredMistake,
  classifyPointMistake,
  classifyFunctionMistake,
  classifyInequalityMistake,
  classifyRayMistake,
  classifySegmentMistake,
  type StudentGraphAnswer,
} from './mistakes.js';
import type {
  PointAnswerConfig,
  PointAnswerController,
  SystemBoundarySpec,
  DisplayDrawable,
} from './board.js';

const isPointPair = (p: unknown): p is [number, number] =>
  Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number';

const numOr = (v: unknown, d: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : d;

// Read the shade_region answer key from data-graph-answer-key (`{ regions: [{
// correctVertices, minOverlap }, …] }`). The single-region widget uses the FIRST
// region; a malformed/empty payload defaults to a benign empty region. (Multi-
// region authoring/widget is a future enhancement — the array is here so it's
// additive.)
function readRegionKey(raw: unknown): RegionAnswerKey {
  const regions = ((raw ?? {}) as { regions?: unknown }).regions;
  const first = (Array.isArray(regions) ? regions[0] : undefined) ?? {};
  const k = first as { correctVertices?: unknown; minOverlap?: unknown };
  const verts = Array.isArray(k.correctVertices)
    ? k.correctVertices.filter(isPointPair)
    : [];
  const minOverlap =
    typeof k.minOverlap === 'number' && k.minOverlap >= 0 && k.minOverlap <= 1
      ? k.minOverlap
      : 0.9;
  return { correctVertices: verts, minOverlap };
}

// Parse ONE FunctionModel of any family from a raw object, defaulting a
// malformed/absent one to a benign model of that family (linear when the family
// is unrecognised) rather than throwing.
function parseModel(raw: unknown): FunctionModel {
  const o = (raw ?? {}) as Record<string, unknown>;
  switch (o.family) {
    case 'quadratic':
      return {
        family: 'quadratic',
        a: numOr(o.a, 1), b: numOr(o.b, 0), c: numOr(o.c, 0),
        aTolerance: numOr(o.aTolerance, 0.1),
        bTolerance: numOr(o.bTolerance, 0.1),
        cTolerance: numOr(o.cTolerance, 0.1),
      };
    case 'exponential':
      return {
        family: 'exponential',
        a: numOr(o.a, 1), b: numOr(o.b, 2),
        aTolerance: numOr(o.aTolerance, 0.1),
        bTolerance: numOr(o.bTolerance, 0.1),
      };
    case 'logarithmic':
      return {
        family: 'logarithmic',
        a: numOr(o.a, 0), b: numOr(o.b, 1),
        aTolerance: numOr(o.aTolerance, 0.1),
        bTolerance: numOr(o.bTolerance, 0.1),
      };
    case 'vertical':
      return { family: 'vertical', x: numOr(o.x, 0), xTolerance: numOr(o.xTolerance, 0.1) };
    default:
      return {
        family: 'linear',
        slope: numOr(o.slope, 1), intercept: numOr(o.intercept, 0),
        slopeTolerance: numOr(o.slopeTolerance, 0.1),
        interceptTolerance: numOr(o.interceptTolerance, 0.1),
      };
  }
}

// Read the plot_function models out of the data-graph-answer-key payload (`{
// models: [{...}, …] }`). The single-curve widget uses the FIRST model; a
// malformed/absent payload defaults to a benign linear model.
function readModel(raw: unknown): FunctionModel {
  const models = ((raw ?? {}) as { models?: unknown }).models;
  const first = Array.isArray(models) ? models[0] : undefined;
  return parseModel(first);
}

// Drop 6 follow-up: the first curve's authored domain, or null when unbounded.
function readDomainKey(raw: unknown): DomainAnswerKey | null {
  const domains = ((raw ?? {}) as { domains?: unknown }).domains;
  const d = (Array.isArray(domains) ? domains[0] : undefined) as
    | Record<string, unknown>
    | null
    | undefined;
  if (!d || typeof d !== 'object') return null;
  const out: DomainAnswerKey = {};
  if (typeof d.min === 'number') {
    out.min = d.min;
    out.minStyle = d.minStyle === 'open' ? 'open' : 'closed';
  }
  if (typeof d.max === 'number') {
    out.max = d.max;
    out.maxStyle = d.maxStyle === 'open' ? 'open' : 'closed';
  }
  return out.min === undefined && out.max === undefined ? null : out;
}

// The board recipe (handle count, curve/polygon to draw, scorer) for one
// interaction type.
interface Recipe {
  count: number;
  scorer: (points: [number, number][]) => boolean;
  deriveCurve?: PointAnswerConfig['deriveCurve'];
  lineThroughHandles?: boolean;
  polygon?: boolean;
  starts?: [number, number][];
}

function recipeFor(
  interactionType: string,
  answerKey: unknown,
  axis: SeedWindow,
): Recipe {
  if (interactionType === 'plot_function') {
    const model = readModel(answerKey);
    const family = model.family;
    return {
      count: handlesForFamily(family),
      starts: startsForFamily(family, axis, handlesForFamily(family)),
      scorer: (pts) => scoreFunction(model, pts),
      deriveCurve: (pts) => {
        const f = fitFunction(family, pts);
        // vertical has no y = f(x) predict; lineThroughHandles draws it instead.
        return f && 'predict' in f ? f.predict : null;
      },
      lineThroughHandles: family === 'vertical',
    };
  }
  if (interactionType === 'shade_region') {
    const key = readRegionKey(answerKey);
    return {
      count: Math.max(3, key.correctVertices.length),
      scorer: (pts) => scoreRegion(key, pts),
      polygon: true,
    };
  }
  const key = readAnswerKey(answerKey);
  return {
    count: Math.max(1, key.correctPoints.length),
    scorer: (pts) => scorePoints(key, pts),
  };
}

// ---- Shared linear-shape controls (student widget + author board) -----------
// The ray/segment interaction is "two handles + a SHAPE choice + endpoint
// styles". The pills, their TRUE-direction labels (8-way arrows computed from
// the drawn line, so a pill never claims ↑ while drawing ↓ on a steep
// negative slope), and the board sync (arrowhead + hollow/filled dots) live
// HERE, once — the
// student widget and the teacher's authoring board mount the SAME controls,
// so authoring is literally the student experience and the two can't drift.

export interface LinearControlsState {
  shape: LinearShape | null;
  rayEndpointStyle: 'open' | 'closed';
  segStyles: ['open' | 'closed', 'open' | 'closed'];
}

interface LinearControls {
  readonly state: LinearControlsState;
  /** Append the six pills (3 shape + 3 style) to a control bar. */
  attach(bar: HTMLElement): void;
  /** Re-sync board visuals + pill labels/visibility/active states. Call after
   *  any state change AND after handle moves (canonical order can flip). */
  sync(): void;
  /** Restore-path state application (does not fire onUserChange). */
  setState(next: Partial<LinearControlsState>): void;
  setDisabled(disabled: boolean): void;
  /** The drawn figure as the scorers see it (canonical points + visible
   *  endpoint styles for the chosen shape). */
  answer(points: [number, number][]): LinearPieceStudentAnswer;
}

function createLinearShapeControls(
  board: PointAnswerController,
  onUserChange: () => void,
): LinearControls {
  const state: LinearControlsState = {
    shape: null,
    rayEndpointStyle: 'closed',
    segStyles: ['closed', 'closed'],
  };

  const pickShape = (shape: LinearShape): void => {
    state.shape = shape;
    sync();
    onUserChange();
  };
  const rayPosBtn = pill('Ray →', () => pickShape('ray_positive'));
  const rayNegBtn = pill('Ray ←', () => pickShape('ray_negative'));
  const segmentBtn = pill('Segment', () => pickShape('segment'));
  const rayStyleBtn = pill('Endpoint: ● closed', () => {
    state.rayEndpointStyle = state.rayEndpointStyle === 'closed' ? 'open' : 'closed';
    sync();
    onUserChange();
  });
  const segStartBtn = pill('Left: ● closed', () => {
    state.segStyles = [state.segStyles[0] === 'closed' ? 'open' : 'closed', state.segStyles[1]];
    sync();
    onUserChange();
  });
  const segEndBtn = pill('Right: ● closed', () => {
    state.segStyles = [state.segStyles[0], state.segStyles[1] === 'closed' ? 'open' : 'closed'];
    sync();
    onUserChange();
  });
  const buttons = [rayPosBtn, rayNegBtn, segmentBtn, rayStyleBtn, segStartBtn, segEndBtn];

  function sync(): void {
    // Board visuals: the figure mirrors the answer state — neutral faint line
    // until a shape is chosen; arrowhead on the chosen ray direction; endpoint
    // dots hollow (open) / filled (closed). A ray styles only its ENDPOINT
    // handle (opposite the arrow); the direction handle stays a plain grip.
    board.setShape?.(state.shape);
    const pts = board.getPoints();
    const a = pts[0] ?? ([0, 0] as [number, number]);
    const b = pts[1] ?? ([0, 0] as [number, number]);
    const [lesser] = canonicalPair(a, b);
    const lesserIdx = lesser === a ? 0 : 1;
    const greaterIdx = 1 - lesserIdx;
    const styles: ('open' | 'closed' | null)[] = [null, null];
    if (state.shape === 'segment') {
      styles[lesserIdx] = state.segStyles[0];
      styles[greaterIdx] = state.segStyles[1];
    } else if (state.shape === 'ray_positive') {
      styles[lesserIdx] = state.rayEndpointStyle; // arrow → positive; endpoint is the lesser handle
    } else if (state.shape === 'ray_negative') {
      styles[greaterIdx] = state.rayEndpointStyle;
    }
    board.setEndpointStyles?.(styles);

    // Pills: TRUE-direction glyphs — each ray pill shows the actual 8-way
    // direction its arrowhead would draw for the line as currently plotted
    // (a steep negative-slope line reads "Ray ↘ / Ray ↖", never a lying
    // "Ray ↑"); segment style labels name each endpoint's real position.
    const glyphs = rayArrowGlyphs(a, b);
    rayPosBtn.textContent = 'Ray ' + glyphs.positive;
    rayNegBtn.textContent = 'Ray ' + glyphs.negative;
    setPillActive(rayPosBtn, state.shape === 'ray_positive');
    setPillActive(rayNegBtn, state.shape === 'ray_negative');
    setPillActive(segmentBtn, state.shape === 'segment');
    rayStyleBtn.hidden = !(state.shape === 'ray_positive' || state.shape === 'ray_negative');
    rayStyleBtn.textContent =
      state.rayEndpointStyle === 'closed' ? 'Endpoint: ● closed' : 'Endpoint: ○ open';
    const names = endpointLabels(a, b);
    const segLabelFor = (which: 0 | 1): string => {
      const name = names[which];
      return state.segStyles[which] === 'closed' ? name + ': ● closed' : name + ': ○ open';
    };
    segStartBtn.hidden = state.shape !== 'segment';
    segStartBtn.textContent = segLabelFor(0);
    segEndBtn.hidden = state.shape !== 'segment';
    segEndBtn.textContent = segLabelFor(1);
  }

  return {
    state,
    attach(bar: HTMLElement): void {
      bar.append(...buttons);
    },
    sync,
    setState(next: Partial<LinearControlsState>): void {
      if (next.shape !== undefined) state.shape = next.shape;
      if (next.rayEndpointStyle) state.rayEndpointStyle = next.rayEndpointStyle;
      if (next.segStyles) state.segStyles = next.segStyles;
      sync();
    },
    setDisabled(disabled: boolean): void {
      for (const b of buttons) b.disabled = disabled;
    },
    answer(points: [number, number][]): LinearPieceStudentAnswer {
      const a = points[0] ?? ([0, 0] as [number, number]);
      const b = points[1] ?? ([0, 0] as [number, number]);
      const [lesser, greater] = canonicalPair(a, b);
      return {
        points: [lesser, greater],
        shape: state.shape,
        endpointStyles:
          state.shape === 'segment'
            ? [state.segStyles[0], state.segStyles[1]]
            : state.shape !== null
              ? [state.rayEndpointStyle]
              : [],
      };
    },
  };
}

// The parsed block config the runtime hands us (from the data-* attributes).
export interface GraphQuestionConfig {
  interactionType: string;
  axisConfig: PointAnswerConfig;
  answerKey: PointAnswerKey;
  /** Per-part fractional scoring (Drop 4). earned/total ride the response. */
  partialCredit?: boolean;
  /** Offer a "cannot be graphed / no solution" choice (Drop 4). */
  allowNoSolution?: boolean;
  /** Trick question: no-solution IS the correct answer (Drop 4). */
  noSolutionCorrect?: boolean;
  /** Authored anticipated-mistake match strings (freeform answer syntax),
   *  index-aligned with the block's feedback templates (Drop B). */
  mistakes?: string[];
  /** Built-in mistake classifiers on/off (Drop B). Default ON. */
  builtinFeedback?: boolean;
}

// What the widget reports on every change and at gather time. `answered` lets
// the runtime distinguish "student engaged" from the untouched starting point.
// The Drop 4 optionals: strict/side for graph_inequality, noSolution when the
// student chose "cannot be graphed", earned/total under partialCredit.
export interface GraphResponseData {
  studentPoints: [number, number][];
  correct: boolean;
  answered: boolean;
  strict?: boolean;
  side?: 'above' | 'below' | 'left' | 'right';
  noSolution?: boolean;
  earned?: number;
  total?: number;
  /** Domain-restricted plot_function (Drop 6): endpoint positions + styles. */
  domain?: {
    minX?: number;
    minStyle?: 'open' | 'closed';
    maxX?: number;
    maxStyle?: 'open' | 'closed';
  };
  /** plot_ray / plot_segment: the student's chosen shape (ray direction or
   *  segment). Absent while unchosen — an unanswered part. */
  shape?: LinearShape;
  /** plot_ray: the drawn endpoint's open/closed choice. */
  fromStyle?: 'open' | 'closed';
  /** plot_segment: per-endpoint open/closed, canonical order (lesser first). */
  endpoints?: ['open' | 'closed', 'open' | 'closed'];
  /** graph_inequality SYSTEM (inequalities.length > 1): one entry per plotted
   *  boundary. Present only for a system; studentPoints stays empty (the answer
   *  lives here). Per-part `correct` = the boundary matches ≥1 authored
   *  inequality; the block's overall `correct` is the order-independent set-match. */
  parts?: {
    points: [number, number][];
    strict: boolean;
    side: 'above' | 'below' | 'left' | 'right';
    correct: boolean;
  }[];
  /** plot_function SYSTEM (models.length > 1): one entry per plotted curve.
   *  Present only for a functions-system; studentPoints stays empty. Per-curve
   *  `correct` = the curve matches ≥1 authored model; the block's overall
   *  `correct` is the order-independent set-match. */
  curveParts?: {
    points: [number, number][];
    correct: boolean;
  }[];
  /** Drop B: matched authored anticipated mistake (index into the block's
   *  feedback templates). Only set when the answer is wrong. */
  mistakeIndex?: number;
  /** Drop B: built-in classifier message for a recognized wrong answer.
   *  Only set when the answer is wrong and no authored entry matched. */
  mistakeText?: string;
}

/** Extra widget state restored alongside the points on reload. */
export interface GraphRestoreExtras {
  strict?: boolean;
  side?: 'above' | 'below' | 'left' | 'right';
  noSolution?: boolean;
  domain?: GraphResponseData['domain'];
  shape?: LinearShape;
  fromStyle?: 'open' | 'closed';
  endpoints?: ['open' | 'closed', 'open' | 'closed'];
  /** graph_inequality SYSTEM: the N plotted boundaries to restore (mountGraph-
   *  SystemQuestion reads this instead of the single points/strict/side above). */
  parts?: {
    points: [number, number][];
    strict: boolean;
    side: 'above' | 'below' | 'left' | 'right';
  }[];
  /** plot_function SYSTEM: the N plotted curves to restore (mountGraphFunction-
   *  SystemQuestion reads this instead of the single points above). */
  curveParts?: {
    points: [number, number][];
  }[];
}

export interface GraphQuestionHooks {
  /** Fired on every student move (drag or keyboard). The runtime persists +
   *  narrates from this. */
  onChange?: (resp: GraphResponseData) => void;
}

export interface GraphQuestionHandle {
  /** The current answer — read at check/submit time. */
  getResponse(): GraphResponseData;
  /** Restore a previously-stored answer (bootstrap on reload). */
  restore(points: [number, number][], extras?: GraphRestoreExtras): void;
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

// Read the graph_inequality answer key (`{ inequalities: [{ boundary, strict,
// shadeSide }, …] }`; the single-inequality widget uses the FIRST).
function readInequalityKey(raw: unknown): InequalityAnswerKey {
  const arr = ((raw ?? {}) as { inequalities?: unknown }).inequalities;
  const first = ((Array.isArray(arr) ? arr[0] : undefined) ?? {}) as Record<string, unknown>;
  const side = first.shadeSide;
  return {
    boundary: parseModel(first.boundary),
    strict: first.strict === true,
    shadeSide:
      side === 'above' || side === 'below' || side === 'left' || side === 'right'
        ? side
        : 'above',
  };
}

// Read ALL inequalities from a graph_inequality answer key — the SYSTEM path
// (inequalities.length > 1). Each entry mirrors readInequalityKey's single read.
function readInequalitySystemKey(raw: unknown): InequalityAnswerKey[] {
  const arr = ((raw ?? {}) as { inequalities?: unknown }).inequalities;
  if (!Array.isArray(arr)) return [];
  return arr.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const side = item.shadeSide;
    return {
      boundary: parseModel(item.boundary),
      strict: item.strict === true,
      shadeSide:
        side === 'above' || side === 'below' || side === 'left' || side === 'right'
          ? side
          : 'above',
    };
  });
}

// Read ALL models from a plot_function answer key — the SYSTEM path
// (models.length > 1). Each entry parsed like readModel's single read.
function readFunctionSystemModels(raw: unknown): FunctionModel[] {
  const models = ((raw ?? {}) as { models?: unknown }).models;
  if (!Array.isArray(models)) return [];
  return models.map((m) => parseModel(m));
}

// Read the plot_ray answer key (`{ rays: [{ from, through, fromStyle,
// tolerance }, …] }`; the single-ray widget uses the FIRST).
function readRayKey(raw: unknown): RayAnswerKey {
  const arr = ((raw ?? {}) as { rays?: unknown }).rays;
  const first = ((Array.isArray(arr) ? arr[0] : undefined) ?? {}) as Record<string, unknown>;
  return {
    from: isPointPair(first.from) ? first.from : [0, 0],
    through: isPointPair(first.through) ? first.through : [1, 1],
    fromStyle: first.fromStyle === 'open' ? 'open' : 'closed',
    tolerance: numOr(first.tolerance, 0.25),
  };
}

// Read the plot_segment answer key (`{ segments: [{ from, to, endpoints,
// tolerance }, …] }`; the single-segment widget uses the FIRST).
function readSegmentKey(raw: unknown): SegmentAnswerKey {
  const arr = ((raw ?? {}) as { segments?: unknown }).segments;
  const first = ((Array.isArray(arr) ? arr[0] : undefined) ?? {}) as Record<string, unknown>;
  const eps = Array.isArray(first.endpoints) ? first.endpoints : [];
  const style = (v: unknown): 'open' | 'closed' => (v === 'open' ? 'open' : 'closed');
  return {
    from: isPointPair(first.from) ? first.from : [0, 0],
    to: isPointPair(first.to) ? first.to : [2, 2],
    endpoints: [style(eps[0]), style(eps[1])],
    tolerance: numOr(first.tolerance, 0.25),
  };
}

// A small pill button for the widget's control bar.
function pill(label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText =
    'font:inherit;font-size:0.75rem;padding:0.15rem 0.5rem;border:1px solid #cbd5e1;' +
    'border-radius:999px;background:#fff;cursor:pointer;';
  b.addEventListener('click', onClick);
  return b;
}
function setPillActive(b: HTMLButtonElement, on: boolean): void {
  b.style.background = on ? '#2563eb' : '#fff';
  b.style.color = on ? '#fff' : 'inherit';
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
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
  const isInequality = interactionType === 'graph_inequality';
  const isRay = interactionType === 'plot_ray';
  const isSegment = interactionType === 'plot_segment';
  const ineqKey = isInequality ? readInequalityKey(cfg.answerKey) : null;
  const rayKey = isRay ? readRayKey(cfg.answerKey) : null;
  const segmentKey = isSegment ? readSegmentKey(cfg.answerKey) : null;
  const domainKey =
    interactionType === 'plot_function' ? readDomainKey(cfg.answerKey) : null;
  const recipe: Recipe = isInequality
    ? // Boundary rides the plot_function machinery for its family.
      recipeFor('plot_function', { models: [ineqKey!.boundary] }, axis)
    : isRay || isSegment
      ? // Two endpoint handles; scoring is parts-based in build() (styles ride
        // alongside points), so the recipe scorer is a stub.
        { count: 2, scorer: () => false }
      : recipeFor(interactionType, cfg.answerKey, axis);

  // The renderer seeds a static no-JS placeholder inside the canvas; clear it
  // before JSXGraph mounts so the two don't overlap.
  mount.textContent = '';

  // Lazy-load the board layer (JSXGraph in its own chunk).
  const { createPointAnswerBoard } = await import('./board.js');

  let answered = false;
  // graph_inequality student choices. strict defaults to false (solid) — a
  // visible default the student must actively flip for a strict inequality.
  let strict = false;
  let side: 'above' | 'below' | 'left' | 'right' | null = null;
  let noSolution = false;
  // Domain endpoint open/closed choices (Drop 6). Positions live on the board's
  // gliders; styles start closed (solid dot) and the student flips them.
  let minStyle: 'open' | 'closed' = 'closed';
  let maxStyle: 'open' | 'closed' = 'closed';
  // Ray/segment student choices live in the SHARED linear controls (the same
  // ones the authoring board mounts). Created after the board below; null for
  // other interaction types. The shape is part of the answer — never
  // pre-drawn; null until the student picks.
  let linear: LinearControls | null = null;

  // Drop B: authored anticipated-mistake matchers, parsed once at mount with
  // the kit's own freeform parser + the block's scoring tolerances.
  const mistakeMatchers = compileMistakeMatchers(cfg.mistakes ?? [], {
    interactionType,
    pointTolerance:
      interactionType === 'plot_point'
        ? readAnswerKey(cfg.answerKey).tolerance
        : undefined,
    keyModel:
      interactionType === 'plot_function'
        ? readModel(cfg.answerKey)
        : isInequality
          ? ineqKey!.boundary
          : undefined,
  });

  // Annotate a WRONG answer with mistake feedback: first authored match wins;
  // built-in classifiers (unless disabled) are the fallback. Correct/unanswered
  // /no-solution responses carry nothing — feedback only ever nudges a miss.
  function annotateMistake(resp: GraphResponseData): GraphResponseData {
    if (!resp.answered || resp.correct || resp.noSolution) return resp;
    const ans: StudentGraphAnswer = {
      points: resp.studentPoints,
      strict,
      side,
      shape: linear?.state.shape ?? null,
      endpointStyles: linearAnswer(resp.studentPoints).endpointStyles,
    };
    const idx = matchAuthoredMistake(mistakeMatchers, ans);
    if (idx !== null) {
      resp.mistakeIndex = idx;
      return resp;
    }
    if (cfg.builtinFeedback === false) return resp;
    let text: string | null = null;
    if (interactionType === 'plot_point') {
      text = classifyPointMistake(readAnswerKey(cfg.answerKey), resp.studentPoints);
    } else if (interactionType === 'plot_function') {
      text = classifyFunctionMistake(readModel(cfg.answerKey), resp.studentPoints);
    } else if (isInequality && ineqKey) {
      const parts = scoreInequalityParts(ineqKey, {
        points: resp.studentPoints,
        strict,
        side: side ?? 'above',
      });
      text = classifyInequalityMistake(parts, side !== null);
    } else if (isRay && rayKey) {
      text = classifyRayMistake(rayKey, linearAnswer(resp.studentPoints));
    } else if (isSegment && segmentKey) {
      text = classifySegmentMistake(segmentKey, linearAnswer(resp.studentPoints));
    }
    if (text) resp.mistakeText = text;
    return resp;
  }

  function build(): GraphResponseData {
    return annotateMistake(buildBase());
  }

  function buildBase(): GraphResponseData {
    const pts = board.getPoints();
    const resp: GraphResponseData = {
      studentPoints: noSolution ? [] : pts,
      correct: false,
      answered,
    };
    if (noSolution) {
      resp.noSolution = true;
      resp.correct = cfg.noSolutionCorrect === true;
      if (cfg.partialCredit) {
        resp.earned = resp.correct ? 1 : 0;
        resp.total = 1;
      }
      return resp;
    }
    if (cfg.noSolutionCorrect === true) {
      // Trick question: anything drawn is wrong by definition.
      resp.correct = false;
      if (cfg.partialCredit) {
        resp.earned = 0;
        resp.total = 1;
      }
      return resp;
    }
    if ((isRay && rayKey) || (isSegment && segmentKey)) {
      const ans = linearAnswer(pts);
      // Canonicalize the reported points + carry the shape/style choices so
      // the dashboard shows exactly the figure the student drew.
      resp.studentPoints = noSolution ? [] : ans.points;
      const shape = linear?.state.shape ?? null;
      if (shape) resp.shape = shape;
      if (shape === 'segment' && linear) {
        resp.endpoints = [linear.state.segStyles[0], linear.state.segStyles[1]];
      } else if (shape !== null && linear) {
        resp.fromStyle = linear.state.rayEndpointStyle;
      }
      if (isRay && rayKey) {
        const parts = scoreRayParts(rayKey, ans);
        resp.correct = parts.shape && parts.placement && parts.style;
        if (cfg.partialCredit) {
          resp.earned = Number(parts.shape) + Number(parts.placement) + Number(parts.style);
          resp.total = 3;
        }
      } else if (segmentKey) {
        const parts = scoreSegmentParts(segmentKey, ans);
        resp.correct = parts.earned === parts.total;
        if (cfg.partialCredit) {
          resp.earned = parts.earned;
          resp.total = parts.total;
        }
      }
      return resp;
    }
    if (isInequality && ineqKey) {
      const ans = { points: pts, strict, side: side ?? ('above' as const) };
      resp.strict = strict;
      if (side) resp.side = side;
      const parts = scoreInequalityParts(ineqKey, ans);
      // An unpicked side is an unanswered part, never a lucky default.
      const sideOk = side !== null && parts.side;
      resp.correct = parts.boundary && sideOk && parts.style;
      if (cfg.partialCredit) {
        resp.earned = Number(parts.boundary) + Number(sideOk) + Number(parts.style);
        resp.total = 3;
      }
      return resp;
    }
    resp.correct = recipe.scorer(pts);
    if (domainKey) {
      const xs = board.getDomainXs?.() ?? {};
      const ans = { minX: xs.minX, minStyle, maxX: xs.maxX, maxStyle };
      resp.domain = {
        ...(typeof xs.minX === 'number' && { minX: xs.minX, minStyle }),
        ...(typeof xs.maxX === 'number' && { maxX: xs.maxX, maxStyle }),
      };
      const dp = scoreDomainParts(domainKey, ans);
      const curveOk = resp.correct;
      resp.correct = curveOk && dp.earned === dp.total;
      if (cfg.partialCredit) {
        resp.earned = Number(curveOk) + dp.earned;
        resp.total = 1 + dp.total;
      }
      return resp;
    }
    if (cfg.partialCredit) {
      if (interactionType === 'plot_point') {
        const partial = scorePointsPartial(readAnswerKey(cfg.answerKey), pts);
        resp.earned = partial.earned;
        resp.total = partial.total;
      } else {
        resp.earned = resp.correct ? 1 : 0;
        resp.total = 1;
      }
    }
    return resp;
  }
  function handleMove(): void {
    if (board.hasMoved()) answered = true;
    linear?.sync(); // canonical order can flip mid-drag; glyphs re-orient
    hooks.onChange?.(build());
  }
  function pickSide(s: 'above' | 'below' | 'left' | 'right'): void {
    side = s;
    answered = true;
    board.setShadeSide?.(s);
    syncBar();
    hooks.onChange?.(build());
  }

  const board: PointAnswerController = createPointAnswerBoard(
    mount,
    {
      ...axis,
      count: recipe.count,
      starts: recipe.starts,
      deriveCurve: recipe.deriveCurve,
      lineThroughHandles: recipe.lineThroughHandles,
      // Student ray/segment boards use the DYNAMIC shape mode — the figure is
      // the student's choice, never pre-drawn (the author board uses the fixed
      // rayThroughHandles/segmentBetweenHandles flags instead).
      linearShape: isRay || isSegment,
      domainEndpoints: domainKey
        ? {
            min: typeof domainKey.min === 'number',
            max: typeof domainKey.max === 'number',
          }
        : undefined,
      shadeBoundary: isInequality,
      polygon: recipe.polygon,
    },
    { onMove: handleMove, onSideClick: pickSide },
  );

  // The student's drawn figure in the scorer's canonical shape (points lesser
  // first; styles per the chosen shape's visible endpoints).
  function linearAnswer(pts: [number, number][]): LinearPieceStudentAnswer {
    if (linear) return linear.answer(pts);
    const a = pts[0] ?? ([0, 0] as [number, number]);
    const b = pts[1] ?? ([0, 0] as [number, number]);
    const [lesser, greater] = canonicalPair(a, b);
    return { points: [lesser, greater], shape: null, endpointStyles: [] };
  }

  // The shared shape/style controls (same ones the authoring board mounts).
  // Any user change marks the question answered and reports the new answer.
  if (isRay || isSegment) {
    linear = createLinearShapeControls(board, () => {
      answered = true;
      hooks.onChange?.(build());
    });
    linear.sync();
  }

  // ---- Control bar (inequality style/side + the no-solution choice) ----------
  // The kit owns the .graph-canvas subtree; the bar overlays its bottom edge.
  const vertical = isInequality && ineqKey?.boundary.family === 'vertical';
  const sideA = vertical ? ('left' as const) : ('above' as const);
  const sideB = vertical ? ('right' as const) : ('below' as const);
  let solidBtn: HTMLButtonElement | null = null;
  let dottedBtn: HTMLButtonElement | null = null;
  let sideABtn: HTMLButtonElement | null = null;
  let sideBBtn: HTMLButtonElement | null = null;
  let noSolBtn: HTMLButtonElement | null = null;

  function syncBar(): void {
    if (solidBtn && dottedBtn) {
      setPillActive(solidBtn, !strict);
      setPillActive(dottedBtn, strict);
    }
    if (sideABtn && sideBBtn) {
      setPillActive(sideABtn, side === sideA);
      setPillActive(sideBBtn, side === sideB);
    }
    if (noSolBtn) setPillActive(noSolBtn, noSolution);
  }

  let minStyleBtn: HTMLButtonElement | null = null;
  let maxStyleBtn: HTMLButtonElement | null = null;

  if (isInequality || cfg.allowNoSolution || domainKey || isRay || isSegment) {
    const bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;display:flex;gap:0.35rem;' +
      'flex-wrap:wrap;padding:0.3rem;background:rgba(255,255,255,0.88);' +
      'border-top:1px solid #e2e8f0;z-index:5;';
    if (isInequality) {
      // Plain labels only — no (≤ ≥) legend. Knowing which sign means a solid
      // vs dotted boundary is part of what an inequality question assesses;
      // the control must not teach it.
      solidBtn = pill('Solid line', () => {
        strict = false;
        answered = true;
        board.setBoundaryDashed?.(false);
        syncBar();
        hooks.onChange?.(build());
      });
      dottedBtn = pill('Dotted line', () => {
        strict = true;
        answered = true;
        board.setBoundaryDashed?.(true);
        syncBar();
        hooks.onChange?.(build());
      });
      sideABtn = pill(vertical ? 'Shade left' : 'Shade above', () => pickSide(sideA));
      sideBBtn = pill(vertical ? 'Shade right' : 'Shade below', () => pickSide(sideB));
      bar.append(solidBtn, dottedBtn, sideABtn, sideBBtn);
    }
    if (domainKey) {
      // One toggle per authored bound: open (hollow, excluded) vs closed. The
      // toggle also restyles the endpoint handle hollow/filled — same as the
      // ray/segment endpoints, so the pill and the drawn point always agree.
      if (typeof domainKey.min === 'number') {
        minStyleBtn = pill('Start: ● closed', () => {
          minStyle = minStyle === 'closed' ? 'open' : 'closed';
          minStyleBtn!.textContent = minStyle === 'closed' ? 'Start: ● closed' : 'Start: ○ open';
          board.setDomainStyles?.({ min: minStyle });
          answered = true;
          hooks.onChange?.(build());
        });
        bar.append(minStyleBtn);
      }
      if (typeof domainKey.max === 'number') {
        maxStyleBtn = pill('End: ● closed', () => {
          maxStyle = maxStyle === 'closed' ? 'open' : 'closed';
          maxStyleBtn!.textContent = maxStyle === 'closed' ? 'End: ● closed' : 'End: ○ open';
          board.setDomainStyles?.({ max: maxStyle });
          answered = true;
          hooks.onChange?.(build());
        });
        bar.append(maxStyleBtn);
      }
    }
    if (linear) {
      // The SHAPE is the student's call — identical three-way choice on BOTH
      // ray and segment questions (different controls per question type would
      // leak the answer). The shared controls keep the drawn figure mirroring
      // every choice (arrowhead / plain segment / endpoint dots).
      linear.attach(bar);
      linear.sync();
    }
    if (cfg.allowNoSolution) {
      noSolBtn = pill('Cannot be graphed', () => {
        noSolution = !noSolution;
        answered = true;
        board.setInteractive(!noSolution);
        syncBar();
        hooks.onChange?.(build());
      });
      bar.append(noSolBtn);
    }
    mount.appendChild(bar);
    syncBar();
  }

  return {
    getResponse: build,
    restore(points: [number, number][], extras?: GraphRestoreExtras): void {
      if (points.length === 0 && !extras?.noSolution) return;
      answered = true;
      // Apply the extras BEFORE setPoints: setPoints fires onChange, which
      // re-scores and persists — scoring with stale style/side/strict choices
      // would overwrite the restored result with a wrong one (found live: a
      // reloaded open-endpoint ray re-scored as closed).
      if (extras) {
        if (typeof extras.strict === 'boolean') {
          strict = extras.strict;
          board.setBoundaryDashed?.(strict);
        }
        if (extras.side) {
          side = extras.side;
          board.setShadeSide?.(side);
        }
        if (extras.noSolution) {
          noSolution = true;
          board.setInteractive(false);
        }
        if (linear) {
          linear.setState({
            ...(extras.shape !== undefined && { shape: extras.shape }),
            ...(extras.fromStyle && { rayEndpointStyle: extras.fromStyle }),
            ...(extras.endpoints && { segStyles: extras.endpoints }),
          });
        }
        if (extras.domain) {
          // Positions ride the restored HANDLES (setPoints below); only the
          // open/closed styles need re-applying here.
          if (extras.domain.minStyle) {
            minStyle = extras.domain.minStyle;
            if (minStyleBtn) minStyleBtn.textContent = minStyle === 'closed' ? 'Start: ● closed' : 'Start: ○ open';
          }
          if (extras.domain.maxStyle) {
            maxStyle = extras.domain.maxStyle;
            if (maxStyleBtn) maxStyleBtn.textContent = maxStyle === 'closed' ? 'End: ● closed' : 'End: ○ open';
          }
          board.setDomainStyles?.({ min: minStyle, max: maxStyle });
        }
        syncBar();
      }
      if (points.length > 0) board.setPoints(points);
      else hooks.onChange?.(build()); // no-points restore (noSolution) still reports
    },
    setLocked(locked: boolean): void {
      board.setInteractive(!locked && !noSolution);
      const buttons = [solidBtn, dottedBtn, sideABtn, sideBBtn, noSolBtn, minStyleBtn, maxStyleBtn];
      for (const b of buttons) if (b) b.disabled = locked;
      linear?.setDisabled(locked);
    },
    destroy(): void {
      board.destroy();
    },
  };
}

// ---- mountGraphSystemQuestion: a SYSTEM of inequalities ----------------------
// The STUDENT widget for a graph_inequality with inequalities.length > 1. Mounts
// N draggable boundaries on ONE shared plane (createSystemAnswerBoard) with a
// per-boundary control row (solid/dotted + shade side); the overlapping
// translucent shades render the running intersection. Reports the N-boundary
// answer as GraphResponseData.parts, scored order-independently, match-all by
// scoreInequalitySystem, honoring the block's partialCredit flag (matched / N).
// The single-inequality path (mountGraphQuestion) is untouched — N=1 never
// reaches here; the runtime routes by inequalities.length.
export async function mountGraphSystemQuestion(
  mount: HTMLElement,
  rawConfig: unknown,
  hooks: GraphQuestionHooks = {},
): Promise<GraphQuestionHandle> {
  const cfg = (rawConfig ?? {}) as Partial<GraphQuestionConfig>;
  const axis = readAxis(cfg.axisConfig);
  const keys = readInequalitySystemKey(cfg.answerKey);

  // Per-boundary board recipe (handle count + curve derive), from each
  // boundary's family — the same plot_function machinery a single inequality's
  // boundary rides.
  const specs: SystemBoundarySpec[] = keys.map((key) => {
    const r = recipeFor('plot_function', { models: [key.boundary] }, axis);
    return {
      count: r.count,
      starts: r.starts,
      deriveCurve: r.deriveCurve,
      lineThroughHandles: r.lineThroughHandles,
    };
  });

  mount.textContent = '';
  const { createSystemAnswerBoard } = await import('./board.js');

  let answered = false;
  const stricts: boolean[] = keys.map(() => false);
  const sides: ('above' | 'below' | 'left' | 'right' | null)[] = keys.map(() => null);

  function buildBase(): GraphResponseData {
    const allPts = board.getAllPoints();
    const parts = keys.map((_, i) => {
      const pts = allPts[i] ?? [];
      const sideI = sides[i] ?? null;
      const strictI = stricts[i] ?? false;
      // Per-boundary signal for the dashboard: does this boundary match ANY
      // authored inequality (with a picked side)? The block's OVERALL grade is
      // the set-match below, not the AND of these.
      const partCorrect =
        sideI !== null &&
        keys.some((k) => scoreInequality(k, { points: pts, strict: strictI, side: sideI }));
      return {
        points: pts,
        strict: strictI,
        side: sideI ?? ('above' as const),
        correct: partCorrect,
      };
    });
    // Only side-picked boundaries can match; an unpicked side is unanswered, so
    // leaving it out of the match set keeps the system from scoring fully correct
    // until every side is chosen.
    const answeredParts = keys
      .map((_, i) => ({ points: allPts[i] ?? [], strict: stricts[i] ?? false, side: sides[i] }))
      .filter(
        (p): p is { points: [number, number][]; strict: boolean; side: 'above' | 'below' | 'left' | 'right' } =>
          p.side !== null,
      );
    const sys = scoreInequalitySystem(keys, answeredParts);
    const resp: GraphResponseData = {
      studentPoints: [],
      correct: sys.correct,
      answered,
      parts,
    };
    if (cfg.partialCredit) {
      resp.earned = sys.earned;
      resp.total = sys.total;
    }
    return resp;
  }

  function report(): void {
    hooks.onChange?.(buildBase());
  }

  const board = createSystemAnswerBoard(
    mount,
    { ...axis, boundaries: specs },
    {
      onMove: () => {
        if (board.hasMoved()) answered = true;
        report();
      },
      // Tapping a boundary line on the board selects it; clicking a half-plane
      // while one is selected shades that side. (selectBoundary / setSide are
      // defined below; the closures resolve them at click time.)
      onSelect: (i) => selectBoundary(i),
      onRegionShade: (i, side) => setSide(i, side),
    },
  );

  // ---- Controls: a single-line chip strip + a contextual popover -------------
  // At rest, ONE thin row of chips (a swatch + the shaded-side arrow per
  // boundary) — footprint stays one line at any N. Selecting a boundary (tap its
  // chip, tap its line on the board, or the board fires onSelect) highlights it
  // and opens a compact controls popover ABOVE the strip for just that boundary;
  // clicking a half-plane while it's selected shades that side. The container is
  // pointer-events:none so board clicks pass through everywhere except the chips
  // and the popover themselves.
  let selectedIndex: number | null = null;
  let locked = false;

  const arrowOf = (s: 'above' | 'below' | 'left' | 'right' | null): string =>
    s === 'above' ? '↑' : s === 'below' ? '↓' : s === 'left' ? '←' : s === 'right' ? '→' : '·';
  const wordOf = (s: 'above' | 'below' | 'left' | 'right' | null): string =>
    s == null ? 'tap to shade a side' : `shaded ${s}`;

  const bar = document.createElement('div');
  bar.style.cssText =
    'position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;' +
    'z-index:5;pointer-events:none;';
  const popEl = document.createElement('div');
  popEl.style.cssText =
    'display:none;pointer-events:auto;margin:0 0.3rem;padding:0.3rem 0.4rem;' +
    'background:rgba(255,255,255,0.97);border:1px solid #e2e8f0;border-radius:8px;' +
    'box-shadow:0 1px 4px rgba(0,0,0,0.08);align-items:center;gap:0.3rem;flex-wrap:wrap;';
  const stripEl = document.createElement('div');
  stripEl.style.cssText =
    'pointer-events:auto;display:flex;gap:0.3rem;padding:0.3rem;flex-wrap:wrap;' +
    'background:rgba(255,255,255,0.9);border-top:1px solid #e2e8f0;';
  bar.append(popEl, stripEl);
  mount.appendChild(bar);

  // The strip + popover overlay the JSXGraph board; stop their pointer events from
  // bubbling to the board's own down/up handlers, so tapping a chip or a control
  // button (incl. ✕) never also selects/shades the board underneath. Board clicks
  // land only on the actual plane (click-to-shade) — never on a control.
  for (const el of [popEl, stripEl]) {
    el.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.addEventListener('pointerup', (e) => e.stopPropagation());
  }

  const setStrict = (i: number, v: boolean): void => {
    stricts[i] = v;
    answered = true;
    board.setBoundaryDashed(i, v);
    renderStrip();
    renderPopover();
    report();
  };
  const setSide = (i: number, s: 'above' | 'below' | 'left' | 'right'): void => {
    sides[i] = s;
    answered = true;
    board.setShadeSide(i, s);
    renderStrip();
    renderPopover();
    report();
  };
  // The keyboard-accessible shade path (click-to-shade is pointer only): cycle the
  // selected boundary's side. null → sideA → sideB → sideA (never back to null —
  // an answer needs a side). Vertical boundaries flip left/right.
  const flipSide = (i: number): void => {
    const vertical = keys[i]!.boundary.family === 'vertical';
    const a = vertical ? ('left' as const) : ('above' as const);
    const b = vertical ? ('right' as const) : ('below' as const);
    setSide(i, sides[i] === a ? b : a);
  };
  const selectBoundary = (i: number): void => {
    selectedIndex = i;
    board.setSelected(i);
    renderStrip();
    renderPopover();
  };
  const deselect = (): void => {
    selectedIndex = null;
    board.setSelected(null);
    renderStrip();
    renderPopover();
  };

  function renderStrip(): void {
    stripEl.innerHTML = '';
    keys.forEach((_key, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.disabled = locked;
      const on = selectedIndex === i;
      chip.style.cssText =
        'pointer-events:auto;font:inherit;font-size:0.75rem;display:inline-flex;' +
        'align-items:center;gap:0.3rem;padding:0.2rem 0.5rem;border-radius:999px;' +
        'cursor:pointer;background:#fff;border:1.5px solid ' +
        (on ? board.boundaryColor(i) : '#cbd5e1') + ';';
      chip.title = `Line ${i + 1}: ${stricts[i] ? 'dotted' : 'solid'}, ${wordOf(sides[i] ?? null)}`;
      chip.setAttribute('aria-label', chip.title);
      const sw = document.createElement('span');
      sw.style.cssText =
        'width:0.7rem;height:0.7rem;border-radius:2px;flex:none;background:' +
        board.boundaryColor(i) + ';';
      const txt = document.createElement('span');
      txt.textContent = `${i + 1} ${arrowOf(sides[i] ?? null)}`;
      chip.append(sw, txt);
      chip.addEventListener('click', () => (selectedIndex === i ? deselect() : selectBoundary(i)));
      stripEl.appendChild(chip);
    });
  }

  function renderPopover(): void {
    if (selectedIndex === null) {
      popEl.style.display = 'none';
      popEl.innerHTML = '';
      return;
    }
    const i = selectedIndex;
    popEl.style.display = 'flex';
    popEl.innerHTML = '';
    const lbl = document.createElement('span');
    lbl.style.cssText = 'display:inline-flex;align-items:center;gap:0.3rem;font-size:0.75rem;font-weight:600;';
    lbl.innerHTML =
      `<span style="width:0.7rem;height:0.7rem;border-radius:2px;background:${board.boundaryColor(i)}"></span>Line ${i + 1}`;
    // Only the line-STYLE toggle lives here now — the shaded side is chosen by
    // clicking the graph (below), so Shade above/below buttons were removed.
    const solidBtn = pill('Solid', () => setStrict(i, false));
    const dottedBtn = pill('Dotted', () => setStrict(i, true));
    setPillActive(solidBtn, stricts[i] === false);
    setPillActive(dottedBtn, stricts[i] === true);
    // The keyboard-accessible shade control — one button that flips the side
    // (click-to-shade below is the pointer path). aria-label carries the current
    // side so a screen-reader user knows the state before flipping.
    const flipBtn = pill('Flip shade', () => flipSide(i));
    flipBtn.setAttribute(
      'aria-label',
      `Flip shaded side (currently ${sides[i] ? `shaded ${sides[i]}` : 'not shaded'})`,
    );
    const doneBtn = pill('✕', deselect);
    doneBtn.setAttribute('aria-label', 'Close controls');
    for (const b of [solidBtn, dottedBtn, flipBtn, doneBtn]) b.disabled = locked;
    // The primary (pointer) shading instruction, on its own line below the buttons.
    const hint = document.createElement('span');
    hint.textContent = 'Or click the graph on the side you want to shade.';
    hint.style.cssText = 'flex-basis:100%;font-size:0.7rem;color:#64748b;margin-top:0.1rem;';
    popEl.append(lbl, solidBtn, dottedBtn, flipBtn, doneBtn, hint);
  }

  renderStrip();

  // NB: no first-paint report() — like the single-answer widget, onChange fires
  // only on a real student action (move/side/style). Reporting at construction
  // would persist the unanswered default state, and the runtime's restore gate
  // would then re-apply it on a fresh load, spuriously marking the block answered.

  return {
    getResponse: buildBase,
    restore(_points: [number, number][], extras?: GraphRestoreExtras): void {
      const parts = extras?.parts;
      if (!parts || parts.length === 0) return;
      answered = true;
      parts.forEach((p, i) => {
        if (i >= keys.length) return;
        stricts[i] = p.strict;
        sides[i] = p.side;
        board.setBoundaryDashed(i, p.strict);
        board.setShadeSide(i, p.side);
        if (p.points.length > 0) board.setPoints(i, p.points);
      });
      renderStrip();
      report();
    },
    setLocked(lock: boolean): void {
      locked = lock;
      board.setInteractive(!lock);
      renderStrip();
      renderPopover();
    },
    destroy(): void {
      board.destroy();
    },
  };
}

// ---- mountGraphFunctionSystemQuestion: a SYSTEM of functions -----------------
// The STUDENT widget for a plot_function with models.length > 1 ("graph both
// lines"). Mounts N draggable curves on ONE shared plane (createSystemAnswerBoard
// with NO shade/control bar — curves, not boundaries; the student just places
// each curve's handles). Reports the N-curve answer as GraphResponseData.curveParts,
// scored order-independently, match-all by scoreFunctionSystem (matched / N under
// partialCredit). N=1 never reaches here; the runtime routes by models.length, so
// a single curve stays the unchanged mountGraphQuestion.
export async function mountGraphFunctionSystemQuestion(
  mount: HTMLElement,
  rawConfig: unknown,
  hooks: GraphQuestionHooks = {},
): Promise<GraphQuestionHandle> {
  const cfg = (rawConfig ?? {}) as Partial<GraphQuestionConfig>;
  const axis = readAxis(cfg.axisConfig);
  const models = readFunctionSystemModels(cfg.answerKey);

  // Per-curve board recipe from each model's family — same plot_function
  // machinery a single curve rides (handle count + fit-through-handles derive).
  const specs: SystemBoundarySpec[] = models.map((model) => ({
    count: handlesForFamily(model.family),
    starts: startsForFamily(model.family, axis, handlesForFamily(model.family)),
    deriveCurve: (pts) => {
      const f = fitFunction(model.family, pts);
      return f && 'predict' in f ? f.predict : null;
    },
    lineThroughHandles: model.family === 'vertical',
  }));

  mount.textContent = '';
  const { createSystemAnswerBoard } = await import('./board.js');

  let answered = false;

  function buildBase(): GraphResponseData {
    const allPts = board.getAllPoints();
    const curveParts = models.map((_, i) => {
      const pts = allPts[i] ?? [];
      // Per-curve dashboard signal: does this curve match ANY authored model?
      // The block's OVERALL grade is the set-match below.
      const correct = models.some((m) => scoreFunction(m, pts));
      return { points: pts, correct };
    });
    const sys = scoreFunctionSystem(models, allPts);
    const resp: GraphResponseData = {
      studentPoints: [],
      correct: sys.correct,
      answered,
      curveParts,
    };
    if (cfg.partialCredit) {
      resp.earned = sys.earned;
      resp.total = sys.total;
    }
    return resp;
  }

  function report(): void {
    hooks.onChange?.(buildBase());
  }

  const board = createSystemAnswerBoard(
    mount,
    { ...axis, boundaries: specs },
    {
      onMove: () => {
        if (board.hasMoved()) answered = true;
        report();
      },
    },
  );

  // NB: no first-paint report() (see mountGraphSystemQuestion) — onChange fires
  // only on a real student move, so a fresh load stays unanswered.

  return {
    getResponse: buildBase,
    restore(_points: [number, number][], extras?: GraphRestoreExtras): void {
      const curveParts = extras?.curveParts;
      if (!curveParts || curveParts.length === 0) return;
      answered = true;
      curveParts.forEach((p, i) => {
        if (i >= models.length) return;
        if (p.points.length > 0) board.setPoints(i, p.points);
      });
      report();
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
  /**
   * Ray/segment authoring: the current answer's shape + endpoint styles, so
   * the shared controls mount pre-set to the stored key.
   */
  linear?: {
    shape?: LinearShape | null;
    rayEndpointStyle?: 'open' | 'closed';
    segStyles?: ['open' | 'closed', 'open' | 'closed'];
  };
  /**
   * Bounded plot_function authoring: the authored domain, so the preview clips
   * the curve and mounts the two endpoint handles + Start/End pills the STUDENT
   * gets ("what the teacher sees is what the student gets"). Curved family only
   * — a linear/vertical bound is a ray/segment (routed before this board).
   */
  domain?: { min?: number; minStyle?: 'open' | 'closed'; max?: number; maxStyle?: 'open' | 'closed' };
  /**
   * graph_inequality authoring: the authored shade side + strict flag, so the
   * author preview shades the correct half-plane and dashes a strict boundary —
   * "what the teacher marks correct is what the teacher sees". Reuses the same
   * shadeBoundary machinery the STUDENT board uses (setShadeSide /
   * setBoundaryDashed); the side is driven ONLY by the typed inequality (the
   * author board wires no onSideClick, so a stray click can't desync it).
   */
  inequality?: {
    shadeSide: 'above' | 'below' | 'left' | 'right';
    strict: boolean;
  };
}

export interface GraphAuthorHooks {
  /** Fired as the author drags/keys a handle — the new correctPoints. */
  onChange?: (correctPoints: [number, number][]) => void;
  /**
   * Ray/segment authoring (the shared shape-toggle controls): fired on every
   * handle move AND every pill change with the full drawn figure. The NodeView
   * converts it into a plot_ray or plot_segment interaction — the teacher
   * authors with EXACTLY the student controls.
   */
  onLinearChange?: (out: {
    points: [number, number][];
    shape: LinearShape | null;
    rayEndpointStyle: 'open' | 'closed';
    segStyles: ['open' | 'closed', 'open' | 'closed'];
  }) => void;
  /**
   * Bounded plot_function authoring: fired as the teacher drags an endpoint
   * handle OR toggles a Start/End pill, with the current bound. The NodeView
   * folds it into interaction.domains[0].
   */
  onDomainChange?: (domain: {
    min?: number;
    minStyle?: 'open' | 'closed';
    max?: number;
    maxStyle?: 'open' | 'closed';
  }) => void;
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
  const polygon = cfg.interactionType === 'shade_region';
  const authorRay = cfg.interactionType === 'plot_ray';
  const authorSegment = cfg.interactionType === 'plot_segment';
  // plot_function fixes the handle count by family; shade_region uses one vertex
  // per handle (≥3); ray/segment always two; plot_point uses one per point.
  const count = family
    ? handlesForFamily(family)
    : polygon
      ? Math.max(3, points.length)
      : authorRay || authorSegment
        ? 2
        : Math.max(1, points.length);
  const deriveCurve: PointAnswerConfig['deriveCurve'] | undefined = family
    ? (pts) => {
        const f = fitFunction(family, pts);
        return f && 'predict' in f ? f.predict : null;
      }
    : undefined;
  const lineThroughHandles = family === 'vertical';

  // Bounded plot_function authoring: a curved family with an authored bound
  // gets the student's clip + endpoint handles + pills, so the preview IS the
  // student figure. (Linear bounds are ray/segment, routed before this board.)
  const dom = cfg.domain;
  const hasMin = typeof dom?.min === 'number';
  const hasMax = typeof dom?.max === 'number';
  const hasDomain = Boolean(deriveCurve) && (hasMin || hasMax);
  let minStyle: 'open' | 'closed' = dom?.minStyle === 'open' ? 'open' : 'closed';
  let maxStyle: 'open' | 'closed' = dom?.maxStyle === 'open' ? 'open' : 'closed';

  mount.textContent = '';
  const { createPointAnswerBoard } = await import('./board.js');

  const isLinear = authorRay || authorSegment;
  const isInequality = cfg.interactionType === 'graph_inequality';
  const board = createPointAnswerBoard(
    mount,
    {
      ...axis,
      count,
      starts: points.length === count ? points : undefined,
      deriveCurve,
      lineThroughHandles,
      polygon,
      // graph_inequality: shade the authored half-plane so the teacher SEES
      // which side they marked correct (the student board's own machinery).
      shadeBoundary: isInequality,
      // Ray/segment authoring uses the SAME dynamic shape mode students get —
      // the teacher chooses the figure with the same pills.
      linearShape: isLinear,
      // Bounded curve: the outer HANDLES are the endpoints. The teacher seeds
      // them at the typed range (functionStartPoints) and can drag them — a
      // drag reports through onChange, and the NodeView recomputes the bound
      // from the handles (one update, no clobber).
      domainEndpoints: hasDomain ? { min: hasMin, max: hasMax } : undefined,
    },
    {
      onMove: (_active, pts) => {
        if (isLinear && linear) {
          linear.sync(); // canonical order can flip mid-drag
          emitLinear();
        }
        hooks.onChange?.(pts);
      },
    },
  );

  // graph_inequality: seed the shade from the typed answer. The side is fixed by
  // the inequality's sign (not clickable on the author board); the shade curve
  // then tracks the boundary as the teacher drags its handles (updateDataArray
  // re-derives from the handles on every board.update). A strict inequality
  // dashes the boundary, matching the student view + the published render.
  if (isInequality && cfg.inequality) {
    board.setBoundaryDashed?.(cfg.inequality.strict);
    board.setShadeSide?.(cfg.inequality.shadeSide);
  }

  // Seed the endpoint open/closed styles, then mount the Start/End pills (the
  // SAME controls the student gets). Positions come from the handles.
  if (hasDomain) {
    board.setDomainStyles?.({ min: minStyle, max: maxStyle });
    const bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;display:flex;gap:0.35rem;' +
      'flex-wrap:wrap;padding:0.3rem;background:rgba(255,255,255,0.88);' +
      'border-top:1px solid #e2e8f0;z-index:5;';
    // The pills change only the endpoint STYLE; positions are the handles, so
    // report just the style and let the NodeView merge it.
    if (hasMin) {
      const btn = pill(minStyle === 'closed' ? 'Start: ● closed' : 'Start: ○ open', () => {
        minStyle = minStyle === 'closed' ? 'open' : 'closed';
        btn.textContent = minStyle === 'closed' ? 'Start: ● closed' : 'Start: ○ open';
        board.setDomainStyles?.({ min: minStyle });
        hooks.onDomainChange?.({ minStyle });
      });
      bar.appendChild(btn);
    }
    if (hasMax) {
      const btn = pill(maxStyle === 'closed' ? 'End: ● closed' : 'End: ○ open', () => {
        maxStyle = maxStyle === 'closed' ? 'open' : 'closed';
        btn.textContent = maxStyle === 'closed' ? 'End: ● closed' : 'End: ○ open';
        board.setDomainStyles?.({ max: maxStyle });
        hooks.onDomainChange?.({ maxStyle });
      });
      bar.appendChild(btn);
    }
    mount.appendChild(bar);
  }

  // Shared shape/style controls (identical to the student widget's), mounted
  // in the author's own control bar. Pre-set from the stored answer.
  let linear: LinearControls | null = null;
  function emitLinear(): void {
    if (!linear) return;
    hooks.onLinearChange?.({
      points: board.getPoints(),
      shape: linear.state.shape,
      rayEndpointStyle: linear.state.rayEndpointStyle,
      segStyles: linear.state.segStyles,
    });
  }
  if (isLinear) {
    linear = createLinearShapeControls(board, emitLinear);
    const bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;display:flex;gap:0.35rem;' +
      'flex-wrap:wrap;padding:0.3rem;background:rgba(255,255,255,0.88);' +
      'border-top:1px solid #e2e8f0;z-index:5;';
    linear.attach(bar);
    mount.appendChild(bar);
    linear.setState({
      shape: cfg.linear?.shape ?? (authorSegment ? 'segment' : 'ray_positive'),
      ...(cfg.linear?.rayEndpointStyle && { rayEndpointStyle: cfg.linear.rayEndpointStyle }),
      ...(cfg.linear?.segStyles && { segStyles: cfg.linear.segStyles }),
    });
  }

  return {
    getPoints: board.getPoints,
    destroy: board.destroy,
  };
}

// ---- Display (static, ungraded) --------------------------------------------
// The runtime sidecar calls THIS for interaction.type 'display'. It draws the
// authored drawables read-only — no answer, no scoring, no hooks. The editor
// NodeView also calls it so the author previews the exact figure students see.
// Reuses the lazy JSXGraph chunk via the same dynamic board import.

export interface GraphDisplayConfig {
  axisConfig: unknown;
  drawables: DisplayDrawable[];
}

export interface GraphDisplayHandle {
  destroy(): void;
}

// Coerce a raw drawables payload to a safe array — filtering anything that
// isn't a recognized `kind` rather than throwing (a malformed one is dropped;
// createDisplayBoard defends each field again on draw).
function readDrawables(raw: unknown): DisplayDrawable[] {
  if (!Array.isArray(raw)) return [];
  // Every Drawable kind the board renders. This list once lagged the Drop 5
  // additions (expression/ray silently vanished from published figures) —
  // keep it in lockstep with board.ts's DisplayDrawable switch.
  const kinds = ['point', 'curve', 'expression', 'segment', 'ray', 'polygon'];
  return raw.filter(
    (d): d is DisplayDrawable =>
      typeof d === 'object' &&
      d !== null &&
      kinds.includes((d as { kind?: unknown }).kind as string),
  );
}

export async function mountGraphDisplay(
  mount: HTMLElement,
  rawConfig: unknown,
): Promise<GraphDisplayHandle> {
  const cfg = (rawConfig ?? {}) as Partial<GraphDisplayConfig>;
  const axis = readAxis(cfg.axisConfig);
  const drawables = readDrawables(cfg.drawables);

  // Clear the renderer's no-JS placeholder before JSXGraph mounts.
  mount.textContent = '';
  const { createDisplayBoard } = await import('./board.js');

  const board = createDisplayBoard(mount, { ...axis, drawables });
  return { destroy: board.destroy };
}
