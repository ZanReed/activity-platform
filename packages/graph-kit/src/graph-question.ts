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
  scoreDomainParts,
  fitFunction,
  handlesForFamily,
  type PointAnswerKey,
  type FunctionModel,
  type RegionAnswerKey,
  type InequalityAnswerKey,
  type DomainAnswerKey,
} from './graph-score.js';
import type {
  PointAnswerConfig,
  PointAnswerController,
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
}

/** Extra widget state restored alongside the points on reload. */
export interface GraphRestoreExtras {
  strict?: boolean;
  side?: 'above' | 'below' | 'left' | 'right';
  noSolution?: boolean;
  domain?: GraphResponseData['domain'];
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
  const ineqKey = isInequality ? readInequalityKey(cfg.answerKey) : null;
  const domainKey =
    interactionType === 'plot_function' ? readDomainKey(cfg.answerKey) : null;
  const recipe = isInequality
    ? // Boundary rides the plot_function machinery for its family.
      recipeFor('plot_function', { models: [ineqKey!.boundary] })
    : recipeFor(interactionType, cfg.answerKey);

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

  function build(): GraphResponseData {
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
      deriveCurve: recipe.deriveCurve,
      lineThroughHandles: recipe.lineThroughHandles,
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
  if (isInequality || cfg.allowNoSolution || domainKey) {
    const bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;display:flex;gap:0.35rem;' +
      'flex-wrap:wrap;padding:0.3rem;background:rgba(255,255,255,0.88);' +
      'border-top:1px solid #e2e8f0;z-index:5;';
    if (isInequality) {
      solidBtn = pill('Solid line (≤ ≥)', () => {
        strict = false;
        answered = true;
        board.setBoundaryDashed?.(false);
        syncBar();
        hooks.onChange?.(build());
      });
      dottedBtn = pill('Dotted line (< >)', () => {
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
      // One toggle per authored bound: open (hollow, excluded) vs closed.
      if (typeof domainKey.min === 'number') {
        minStyleBtn = pill('Start: ● closed', () => {
          minStyle = minStyle === 'closed' ? 'open' : 'closed';
          minStyleBtn!.textContent = minStyle === 'closed' ? 'Start: ● closed' : 'Start: ○ open';
          answered = true;
          hooks.onChange?.(build());
        });
        bar.append(minStyleBtn);
      }
      if (typeof domainKey.max === 'number') {
        maxStyleBtn = pill('End: ● closed', () => {
          maxStyle = maxStyle === 'closed' ? 'open' : 'closed';
          maxStyleBtn!.textContent = maxStyle === 'closed' ? 'End: ● closed' : 'End: ○ open';
          answered = true;
          hooks.onChange?.(build());
        });
        bar.append(maxStyleBtn);
      }
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
      if (points.length > 0) board.setPoints(points);
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
        if (extras.domain) {
          board.setDomainXs?.({ minX: extras.domain.minX, maxX: extras.domain.maxX });
          if (extras.domain.minStyle) {
            minStyle = extras.domain.minStyle;
            if (minStyleBtn) minStyleBtn.textContent = minStyle === 'closed' ? 'Start: ● closed' : 'Start: ○ open';
          }
          if (extras.domain.maxStyle) {
            maxStyle = extras.domain.maxStyle;
            if (maxStyleBtn) maxStyleBtn.textContent = maxStyle === 'closed' ? 'End: ● closed' : 'End: ○ open';
          }
        }
        syncBar();
      }
    },
    setLocked(locked: boolean): void {
      board.setInteractive(!locked && !noSolution);
      const buttons = [solidBtn, dottedBtn, sideABtn, sideBBtn, noSolBtn, minStyleBtn, maxStyleBtn];
      for (const b of buttons) if (b) b.disabled = locked;
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
  const polygon = cfg.interactionType === 'shade_region';
  // plot_function fixes the handle count by family; shade_region uses one vertex
  // per handle (≥3); plot_point uses one per point.
  const count = family
    ? handlesForFamily(family)
    : polygon
      ? Math.max(3, points.length)
      : Math.max(1, points.length);
  const deriveCurve: PointAnswerConfig['deriveCurve'] | undefined = family
    ? (pts) => {
        const f = fitFunction(family, pts);
        return f && 'predict' in f ? f.predict : null;
      }
    : undefined;
  const lineThroughHandles = family === 'vertical';

  mount.textContent = '';
  const { createPointAnswerBoard } = await import('./board.js');

  const board = createPointAnswerBoard(
    mount,
    {
      ...axis,
      count,
      starts: points.length === count ? points : undefined,
      deriveCurve,
      lineThroughHandles,
      polygon,
    },
    { onMove: (_active, pts) => hooks.onChange?.(pts) },
  );

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
  const kinds = ['point', 'curve', 'segment', 'polygon'];
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
