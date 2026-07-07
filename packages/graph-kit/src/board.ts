// =============================================================================
// board.ts — the coordinate-plane board layer (JSXGraph wrapper)
// -----------------------------------------------------------------------------
// Layer 2 of the kit (shared, eventually, by the graded interactive-graph block).
// This module STATICALLY imports JSXGraph; everything that wants a board
// dynamic-imports THIS module (`await import('./board.js')`) so esbuild splits
// JSXGraph (~240 KiB gz) into its own chunk — scientific-only calculators never
// download it (the "lazy-split" decision). JSXGraph is framework-agnostic
// (vanilla DOM), so the same board works in published pages and the editor.
//
// Stage 2 scope: plot one function y = f(x), drag-to-pan, wheel-to-zoom, a
// baseline-accessible canvas (labelled, focusable, arrow-key pan, an aria-live
// readout of the viewport). Deeper screen-reader trace narration is a later pass.
// =============================================================================

import { JSXGraph } from 'jsxgraph';
import { compileFunction } from './evaluate.js';

// Stage 4: what one expression-list row contributes to the board. Coordinates
// and functions are CLOSURES over the caller's live slider scope — JSXGraph
// re-evaluates them on every update, so a slider drag only needs refresh().
export type PlotItem =
  | { kind: 'curve'; color: string; fn: (x: number) => number }
  | { kind: 'point'; color: string; px: () => number; py: () => number };

export interface BoardController {
  /** Plot (or replace) the single function curve; pass null to clear it. */
  plot(fn: ((x: number) => number) | null): void;
  /** Replace the expression-list plots (curves + points). (Stage 4) */
  setPlots(items: PlotItem[]): void;
  /** Re-sample all plots in place — the slider-drag fast path. (Stage 4) */
  refresh(): void;
  /** Scatter (or replace) the data points; pass [] to clear them. (Stage 3) */
  setScatter(points: { x: number; y: number }[]): void;
  /** Plot (or replace) the regression fit curve; pass null to clear it. (Stage 3) */
  plotFit(fn: ((x: number) => number) | null): void;
  /** Move the viewport to frame the given points (10% margin). (Stage 3) */
  fitView(points: { x: number; y: number }[]): void;
  /** Tear down the board and free JSXGraph's resources. */
  destroy(): void;
}

// JSXGraph's types are loose; a minimal structural view of what we call.
interface JxgBoard {
  create(type: string, parents: unknown[], attrs?: unknown): unknown;
  removeObject(obj: unknown): void;
  update(): void;
  setBoundingBox(bb: [number, number, number, number], keepAspect?: boolean): void;
  getBoundingBox(): [number, number, number, number];
  getUsrCoordsOfMouse(evt: Event): [number, number];
  on(event: string, handler: (e: Event) => void): void;
}

// A JSXGraph point handle. `moveTo` repositions (used by the trace and the
// answer point); X/Y read the current user coords; `on` subscribes to drag.
interface JxgPoint {
  moveTo(coords: [number, number]): void;
  setAttribute(attrs: Record<string, unknown>): void;
  X(): number;
  Y(): number;
  on(event: string, handler: () => void): void;
}

let boardSeq = 0;

const CURVE_COLOR = '#2563eb';
const SCATTER_COLOR = '#0f172a';
const FIT_COLOR = '#16a34a';

const DEFAULT_BB: [number, number, number, number] = [-10, 10, 10, -10];

export function createBoard(container: HTMLElement): BoardController {
  // JSXGraph identifies the board by the container's id.
  if (!container.id) container.id = `gk-board-${(boardSeq += 1)}`;

  // Accessible canvas: announce purpose + controls; focusable for keyboard pan.
  container.setAttribute('role', 'application');
  container.setAttribute('tabindex', '0');
  container.setAttribute(
    'aria-label',
    'Function graph. Drag to pan, scroll to zoom, arrow keys to move the view.',
  );

  const board = JSXGraph.initBoard(container.id, {
    boundingbox: DEFAULT_BB, // [xMin, yMax, xMax, yMin]
    axis: true,
    // Sticky axes (Desmos-style): when an axis would scroll off-screen while
    // panning, it pins to the nearest visible edge and keeps its number labels,
    // so the scale is never lost (author feedback, 2026-07-06). anchor
    // 'left right' lets each axis stick to whichever edge it nears. anchorDist
    // insets the pinned axis ~55px from the frame so its number labels (a y-axis
    // draws them to its LEFT) stay on-board instead of clipping to the ones
    // digit. (JSXGraph's `ticksAutoPos` is NOT the fix — it pushes labels into
    // the narrow gap toward the near edge, i.e. the wrong way for edge-pinning.)
    defaultAxes: {
      x: { position: 'sticky', anchor: 'left right', anchorDist: '55px' },
      y: { position: 'sticky', anchor: 'left right', anchorDist: '55px' },
    },
    grid: true,
    keepAspectRatio: false,
    showCopyright: false,
    showNavigation: false, // no nav buttons (avoids needing JSXGraph's CSS)
    // needShift: false is load-bearing — JSXGraph's DEFAULT mouse pan requires
    // shift+drag, which reads as "panning is broken" (author feedback,
    // 2026-07-05). Plain click-drag pans, Desmos-style.
    pan: { enabled: true, needShift: false, needTwoFingers: false },
    zoom: { wheel: true, needShift: false, min: 0.001, max: 1000 },
  } as Parameters<typeof JSXGraph.initBoard>[1]) as unknown as JxgBoard;

  // aria-live readout of the visible window, updated as the view changes.
  const live = document.createElement('div');
  live.setAttribute('aria-live', 'polite');
  live.className = 'gk-board-live';
  // visually-hidden (announced, not shown)
  live.style.cssText =
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
  container.appendChild(live);
  const announceView = (): void => {
    const [xMin, yMax, xMax, yMin] = board.getBoundingBox();
    live.textContent =
      `View x from ${xMin.toFixed(1)} to ${xMax.toFixed(1)}, ` +
      `y from ${yMin.toFixed(1)} to ${yMax.toFixed(1)}.`;
  };
  announceView();

  // Mouse/touch pan and wheel zoom change the view WITHOUT going through our
  // helpers, so announce on the board's own boundingbox event too (debounced —
  // a drag fires it continuously).
  let announceTimer: ReturnType<typeof setTimeout> | undefined;
  board.on('boundingbox', () => {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(announceView, 250);
  });

  // Zoom scales the half-spans around the CENTER of the current view (not the
  // origin — origin-relative zoom "runs away" once the user has panned).
  function zoomBy(factor: number): void {
    const [xMin, yMax, xMax, yMin] = board.getBoundingBox();
    const cx = (xMin + xMax) / 2;
    const cy = (yMin + yMax) / 2;
    const hx = ((xMax - xMin) / 2) * factor;
    const hy = ((yMax - yMin) / 2) * factor;
    board.setBoundingBox([cx - hx, cy + hy, cx + hx, cy - hy], false);
    board.update();
    announceView();
  }

  function resetView(): void {
    board.setBoundingBox(DEFAULT_BB, false);
    board.update();
    announceView();
  }

  // On-graph nav buttons (Desmos-style): + / − / reset, stacked bottom-right.
  // Real <button>s — clickable, focusable, labelled — layered over the SVG.
  const nav = document.createElement('div');
  nav.className = 'gk-board-nav';
  const navButtons: [string, string, () => void][] = [
    ['+', 'Zoom in', () => zoomBy(0.8)],
    ['−', 'Zoom out', () => zoomBy(1.25)],
    ['⌂', 'Reset the view', resetView],
  ];
  for (const [labelText, aria, act] of navButtons) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = labelText;
    btn.setAttribute('aria-label', aria);
    btn.addEventListener('click', act);
    // JSXGraph listens for pointer events on the container to start a pan;
    // don't let a button press double as a drag start.
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    nav.appendChild(btn);
  }
  container.appendChild(nav);

  // Keyboard pan/zoom (arrows shift the view by 20% of its span; +/- zoom).
  container.addEventListener('keydown', (e: KeyboardEvent) => {
    const [xMin, yMax, xMax, yMin] = board.getBoundingBox();
    const dx = (xMax - xMin) * 0.2;
    const dy = (yMax - yMin) * 0.2;
    let bb: [number, number, number, number] | null = null;
    switch (e.key) {
      case 'ArrowLeft': bb = [xMin - dx, yMax, xMax - dx, yMin]; break;
      case 'ArrowRight': bb = [xMin + dx, yMax, xMax + dx, yMin]; break;
      case 'ArrowUp': bb = [xMin, yMax + dy, xMax, yMin + dy]; break;
      case 'ArrowDown': bb = [xMin, yMax - dy, xMax, yMin - dy]; break;
      case '+': case '=': zoomBy(0.8); e.preventDefault(); return;
      case '-': case '_': zoomBy(1.25); e.preventDefault(); return;
      default: return;
    }
    e.preventDefault();
    board.setBoundingBox(bb, false);
    board.update();
    announceView();
  });

  let curve: unknown = null;

  function plot(fn: ((x: number) => number) | null): void {
    if (curve) {
      board.removeObject(curve);
      curve = null;
    }
    if (fn) {
      curve = board.create('functiongraph', [fn], {
        strokeColor: CURVE_COLOR,
        strokeWidth: 2,
        highlight: false,
      });
    }
    board.update();
    announceView();
  }

  // ---- Stage 4: the expression-list plots ------------------------------------

  let listObjects: unknown[] = [];
  let plotItems: PlotItem[] = []; // kept for trace + fit (need the fns/coords)

  function setPlots(items: PlotItem[]): void {
    for (const obj of listObjects) board.removeObject(obj);
    plotItems = items;
    listObjects = items.map((item) =>
      item.kind === 'curve'
        ? board.create('functiongraph', [item.fn], {
            strokeColor: item.color,
            strokeWidth: 2,
            highlight: false,
          })
        : board.create('point', [item.px, item.py], {
            fixed: true,
            withLabel: false,
            size: 3,
            strokeColor: item.color,
            fillColor: item.color,
            highlight: false,
          }),
    );
    board.update();
  }

  function refresh(): void {
    board.update();
  }

  // ---- Hover trace: read (x, y) off the nearest curve ------------------------
  // Moving the pointer over the board snaps a marker to the nearest plotted
  // curve at the cursor's x and shows the coordinate — the Desmos "read the
  // graph" affordance. Only when hovering (no button held, so it never fights a
  // drag-pan) and only near a curve (within ~24px).
  const readout = document.createElement('div');
  readout.className = 'gk-board-readout';
  readout.hidden = true;
  container.appendChild(readout);
  let tracePoint: JxgPoint | null = null;

  function hideTrace(): void {
    readout.hidden = true;
    tracePoint?.setAttribute({ visible: false });
  }

  container.addEventListener('pointermove', (e: PointerEvent) => {
    const curves = plotItems.filter((it) => it.kind === 'curve');
    if (e.buttons !== 0 || curves.length === 0) {
      hideTrace();
      return;
    }
    const [ux, uy] = board.getUsrCoordsOfMouse(e);
    const [, yMax, , yMin] = board.getBoundingBox();
    const pxPerY = container.offsetHeight / (yMax - yMin);
    let best: { x: number; y: number; color: string } | null = null;
    let bestPx = Infinity;
    for (const c of curves) {
      if (c.kind !== 'curve') continue;
      const cy = c.fn(ux);
      if (!Number.isFinite(cy)) continue;
      const dPx = Math.abs(cy - uy) * pxPerY;
      if (dPx < bestPx) {
        bestPx = dPx;
        best = { x: ux, y: cy, color: c.color };
      }
    }
    if (!best || bestPx > 24) {
      hideTrace();
      return;
    }
    if (!tracePoint) {
      tracePoint = board.create('point', [best.x, best.y], {
        withLabel: false, fixed: true, size: 4, strokeColor: '#0f172a',
        fillColor: best.color, highlight: false,
      }) as unknown as JxgPoint;
    }
    tracePoint.setAttribute({ visible: true, fillColor: best.color });
    tracePoint.moveTo([best.x, best.y]);
    // A hair of rounding keeps the readout stable while tracing.
    readout.textContent = `(${best.x.toFixed(2)}, ${best.y.toFixed(2)})`;
    readout.hidden = false;
    board.update();
  });
  container.addEventListener('pointerleave', hideTrace);

  // ---- Zoom to fit: frame every plotted curve + point -----------------------
  function fitToPlots(): void {
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    const add = (x: number, y: number): void => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      xMin = Math.min(xMin, x); xMax = Math.max(xMax, x);
      yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
    };
    for (const p of scatterPoints) add(p.x, p.y);
    for (const it of plotItems) {
      if (it.kind === 'point') add(it.px(), it.py());
    }
    // Curves are unbounded in x, so sample them across the CURRENT x window to
    // find a sensible y-range rather than inventing an x-range.
    const [cxMin, , cxMax] = board.getBoundingBox();
    const hasPoints = Number.isFinite(xMin);
    const sampleMin = hasPoints ? xMin : cxMin;
    const sampleMax = hasPoints ? xMax : cxMax;
    for (const it of plotItems) {
      if (it.kind !== 'curve') continue;
      for (let i = 0; i <= 60; i++) {
        const x = sampleMin + ((sampleMax - sampleMin) * i) / 60;
        add(x, it.fn(x));
      }
    }
    if (!Number.isFinite(xMin)) { resetView(); return; }
    const xPad = Math.max((xMax - xMin) * 0.1, 1);
    const yPad = Math.max((yMax - yMin) * 0.1, 1);
    board.setBoundingBox([xMin - xPad, yMax + yPad, xMax + xPad, yMin - yPad], false);
    board.update();
    announceView();
  }

  // ---- Stage 3: scatter + fit curve (the data/regression panel) --------------

  let scatterDots: unknown[] = [];
  let scatterPoints: { x: number; y: number }[] = []; // raw coords for fit
  let fitCurve: unknown = null;

  function setScatter(points: { x: number; y: number }[]): void {
    for (const dot of scatterDots) board.removeObject(dot);
    scatterPoints = points;
    scatterDots = points.map((p) =>
      board.create('point', [p.x, p.y], {
        fixed: true,
        withLabel: false,
        size: 2,
        strokeColor: SCATTER_COLOR,
        fillColor: SCATTER_COLOR,
        highlight: false,
      }),
    );
    board.update();
  }

  function plotFit(fn: ((x: number) => number) | null): void {
    if (fitCurve) {
      board.removeObject(fitCurve);
      fitCurve = null;
    }
    if (fn) {
      fitCurve = board.create('functiongraph', [fn], {
        strokeColor: FIT_COLOR,
        strokeWidth: 2,
        dash: 2, // distinguishes the fit from a student's own y = f(x) curve
        highlight: false,
      });
    }
    board.update();
  }

  function fitView(points: { x: number; y: number }[]): void {
    if (points.length === 0) return;
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (const p of points) {
      xMin = Math.min(xMin, p.x); xMax = Math.max(xMax, p.x);
      yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y);
    }
    // 10% margin; guard degenerate spans (a single point, a horizontal run) so
    // the window never collapses to zero area.
    const xPad = Math.max((xMax - xMin) * 0.1, 1);
    const yPad = Math.max((yMax - yMin) * 0.1, 1);
    board.setBoundingBox([xMin - xPad, yMax + yPad, xMax + xPad, yMin - yPad], false);
    board.update();
    announceView();
  }

  // "Zoom to fit" nav button (added after fitToPlots is defined). Sits below the
  // reset-home button in the same stack.
  const fitBtn = document.createElement('button');
  fitBtn.type = 'button';
  fitBtn.textContent = '⤢';
  fitBtn.setAttribute('aria-label', 'Zoom to fit all plots');
  fitBtn.addEventListener('click', fitToPlots);
  fitBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  nav.appendChild(fitBtn);

  function destroy(): void {
    JSXGraph.freeBoard(board as unknown as Parameters<typeof JSXGraph.freeBoard>[0]);
  }

  return { plot, setPlots, refresh, setScatter, plotFit, fitView, destroy };
}

// =============================================================================
// createPointAnswerBoard — the graded interactive-graph block's answer surface
// -----------------------------------------------------------------------------
// A sibling of createBoard for the plot-a-point question (Stage 5). Deliberately
// NOT the calculator board: the working window is FIXED to the authored axis
// config (a student answering "plot (3, 4)" shouldn't be able to pan the plane
// away), there is no zoom/trace/nav chrome, and the arrow keys move the ANSWER
// POINT, not the view. It shares this module's single JSXGraph import so the
// graded block reuses the same lazy chunk the calculator's graphing mode loads.
//
// Accessibility (a first-class slice-1 commitment, not a follow-up):
//   - each handle is a large (touch-friendly) draggable point;
//   - Tab focuses the canvas (the renderer set role=application + tabindex);
//   - arrows nudge the ACTIVE handle by one grid step, Shift+arrow by a fine 0.1
//     step, clamped to the plane;
//   - with multiple handles, Tab / Shift+Tab cycle the active handle and only
//     let focus LEAVE the widget at the ends (no focus trap); the active handle
//     is visually enlarged;
//   - every move (drag OR keyboard) and every focus change calls onMove so the
//     caller can narrate into the block's aria-live region.
// =============================================================================

const ANSWER_COLOR = '#7c3aed';
const HANDLE_SIZE = 6;
const HANDLE_SIZE_ACTIVE = 9;

export interface PointAnswerConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xGridStep: number;
  yGridStep: number;
  showGrid: boolean;
  snapToGrid: boolean;
  /** How many answer handles to show (defaults to 1; typically = correctPoints.length). */
  count?: number;
  /** Per-handle start positions; defaults to points spread across the x-axis. */
  starts?: [number, number][];
  /**
   * plot_function: given the current handle positions, return the curve fn to
   * draw through them (or null when they don't define one — e.g. a vertical
   * line). When set, the board plots a live curve that follows the handles as
   * they drag. Absent for plain plot_point.
   */
  deriveCurve?: (points: [number, number][]) => ((x: number) => number) | null;
  /**
   * plot_function, vertical family: draw a straight line THROUGH the first two
   * handles (JSXGraph lines handle any orientation, including vertical, which
   * deriveCurve's y = f(x) cannot express). Follows the handles as they drag.
   */
  lineThroughHandles?: boolean;
  /**
   * graph_inequality: enable half-plane shading against the boundary drawn by
   * deriveCurve / lineThroughHandles. The controller gains setShadeSide /
   * setBoundaryDashed, and clicking empty board space fires hooks.onSideClick
   * with the side of the boundary that was clicked.
   */
  shadeBoundary?: boolean;
  /**
   * Drop 6 follow-up: domain endpoint handles. For each authored bound, a
   * GLIDER point rides the derived curve — the student drags it along the curve
   * to mark where the ray/segment starts/ends. Requires deriveCurve.
   */
  domainEndpoints?: { min?: boolean; max?: boolean };
  /**
   * shade_region: draw a filled polygon through the handles (in order). It
   * follows the handles as they drag. Absent for plot_point / plot_function.
   */
  polygon?: boolean;
}

export interface PointAnswerHooks {
  /** Called on every move or focus change with the active handle index + all points. */
  onMove?: (activeIndex: number, points: [number, number][]) => void;
  /**
   * shadeBoundary boards: the student clicked empty space on one side of the
   * boundary. 'above'/'below' against a y = f(x) boundary; 'left'/'right'
   * against a vertical one.
   */
  onSideClick?: (side: 'above' | 'below' | 'left' | 'right') => void;
}

export interface PointAnswerController {
  /** Every handle's current user coordinates, in handle order. */
  getPoints(): [number, number][];
  /** True once the student has dragged or keyed a handle at least once. */
  hasMoved(): boolean;
  /** Reposition handles programmatically (state restore on reload). */
  setPoints(points: [number, number][]): void;
  /** Lock (post-check) or unlock dragging + keyboard on every handle. */
  setInteractive(on: boolean): void;
  /** domainEndpoints boards: the gliders' current x positions. */
  getDomainXs?(): { minX?: number; maxX?: number };
  /** domainEndpoints boards: reposition the gliders (state restore). */
  setDomainXs?(xs: { minX?: number; maxX?: number }): void;
  /** shadeBoundary boards: shade one side of the boundary (null clears). */
  setShadeSide?(side: 'above' | 'below' | 'left' | 'right' | null): void;
  /** shadeBoundary boards: dotted (strict) vs solid (inclusive) boundary. */
  setBoundaryDashed?(dashed: boolean): void;
  destroy(): void;
}

export function createPointAnswerBoard(
  container: HTMLElement,
  config: PointAnswerConfig,
  hooks: PointAnswerHooks = {},
): PointAnswerController {
  if (!container.id) container.id = `gk-answer-${(boardSeq += 1)}`;

  // JSXGraph.initBoard rewrites the container's ARIA (role -> "region",
  // aria-label -> ""), clobbering the renderer's role=application + instructional
  // label. Capture the caller's label now and re-apply everything AFTER init so
  // the focusable application semantics survive (see below).
  const callerLabel = container.getAttribute('aria-label');

  // Fixed window from the authored axis config. JSXGraph's boundingbox order is
  // [xMin, yMax, xMax, yMin]. Pan/zoom/keyboard-nav are OFF — the plane is the
  // problem, and our own keydown handler owns the arrows.
  const board = JSXGraph.initBoard(container.id, {
    boundingbox: [config.xMin, config.yMax, config.xMax, config.yMin],
    axis: true,
    grid: config.showGrid,
    keepAspectRatio: false,
    showCopyright: false,
    showNavigation: false,
    pan: { enabled: false, needShift: false, needTwoFingers: false },
    zoom: { wheel: false, needShift: true, min: 1, max: 1 },
    keyboard: { enabled: false },
  } as Parameters<typeof JSXGraph.initBoard>[1]) as unknown as JxgBoard;

  // Re-apply the focusable application semantics JSXGraph just overwrote. The
  // arrow keys reach our keydown handler because the container is tabbable; the
  // aria-label is the renderer's rich instruction (or a sensible default when
  // mounted into a bare element, e.g. the dev harness).
  container.setAttribute('role', 'application');
  container.setAttribute('tabindex', '0');
  container.setAttribute(
    'aria-label',
    callerLabel ??
      'Interactive coordinate plane. Use arrow keys to move the point; hold Shift for fine steps.',
  );

  const clampX = (x: number): number => Math.min(Math.max(x, config.xMin), config.xMax);
  const clampY = (y: number): number => Math.min(Math.max(y, config.yMin), config.yMax);

  const count = Math.max(1, Math.floor(config.count ?? 1));

  // Default starts: spread handles evenly across the x-axis at y = 0 so multiple
  // handles don't stack on the origin. One handle lands at the plane's x-centre
  // (the origin for a symmetric plane) — the slice-1 single-point default.
  const defaultStarts = (): [number, number][] => {
    const out: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const x = config.xMin + ((i + 1) * (config.xMax - config.xMin)) / (count + 1);
      out.push([clampX(x), clampY(0)]);
    }
    return out;
  };
  const starts =
    config.starts && config.starts.length === count
      ? config.starts.map(([x, y]) => [clampX(x), clampY(y)] as [number, number])
      : defaultStarts();

  // One draggable handle per start. snapToGrid pins drags to grid intersections
  // when the author enabled it; showInfobox off — narration is ours.
  const points: JxgPoint[] = starts.map(
    (s) =>
      board.create('point', s, {
        name: '',
        withLabel: false,
        size: HANDLE_SIZE,
        strokeColor: ANSWER_COLOR,
        fillColor: ANSWER_COLOR,
        highlightStrokeColor: ANSWER_COLOR,
        highlightFillColor: ANSWER_COLOR,
        showInfobox: false,
        snapToGrid: config.snapToGrid,
        snapSizeX: config.xGridStep,
        snapSizeY: config.yGridStep,
      }) as unknown as JxgPoint,
  );

  let activeIndex = 0;
  let moved = false;
  let interactive = true;

  const currentPoints = (): [number, number][] =>
    points.map((p) => [p.X(), p.Y()]);

  // shade_region: a filled polygon whose vertices ARE the draggable handles, so
  // it follows them as they drag (JSXGraph re-renders the polygon when its
  // vertex points move). Non-interactive itself — only the handles move; the
  // borders/inner region don't grab the pointer away from the vertices.
  if (config.polygon && points.length >= 3) {
    board.create('polygon', points as unknown[], {
      fillColor: ANSWER_COLOR,
      fillOpacity: 0.2,
      highlightFillOpacity: 0.2,
      hasInnerPoints: false,
      fixed: true,
      borders: {
        strokeColor: ANSWER_COLOR,
        strokeWidth: 2,
        highlight: false,
        fixed: true,
      },
    });
  }

  // plot_function: a single curve drawn THROUGH the handles. The functiongraph
  // holds a closure that re-derives the curve from the live handle positions on
  // every board.update(), so dragging a handle re-plots the curve for free (no
  // manual redraw). NaN where the points don't currently define a curve.
  // Boundary objects are captured so shadeBoundary can dash them (strict) and
  // the shading polygon can follow them.
  let curveObj: { setAttribute(attrs: Record<string, unknown>): void } | null = null;
  let lineObj: { setAttribute(attrs: Record<string, unknown>): void } | null = null;

  if (config.deriveCurve) {
    const derive = config.deriveCurve;
    curveObj = board.create(
      'functiongraph',
      [
        (x: number): number => {
          const fn = derive(currentPoints());
          return fn ? fn(x) : NaN;
        },
      ],
      { strokeColor: ANSWER_COLOR, strokeWidth: 2, highlight: false, fixed: true },
    ) as unknown as { setAttribute(attrs: Record<string, unknown>): void };
  }

  // Vertical family: a straight line through the first two handles. A JSXGraph
  // line bound to the point objects follows drags for free and draws vertical
  // orientations deriveCurve's y = f(x) cannot.
  if (config.lineThroughHandles && points.length >= 2) {
    lineObj = board.create('line', [points[0], points[1]], {
      strokeColor: ANSWER_COLOR,
      strokeWidth: 2,
      highlight: false,
      fixed: true,
    }) as unknown as { setAttribute(attrs: Record<string, unknown>): void };
  }

  // Domain endpoint gliders (Drop 6): points constrained to the derived curve.
  // JSXGraph re-projects a glider onto its parent on every update, so they stay
  // ON the curve as the curve handles drag. Distinct look (diamond-ish square,
  // amber) so students read them as boundary markers, not curve handles.
  const domainGliders: { which: 'min' | 'max'; p: JxgPoint }[] = [];
  if (config.domainEndpoints && config.deriveCurve) {
    const curveParent = curveObj as unknown;
    const span = config.xMax - config.xMin;
    const mk = (which: 'min' | 'max', frac: number): void => {
      const x0 = config.xMin + span * frac;
      const g = board.create('glider', [x0, 0, curveParent], {
        face: 'diamond',
        size: 5,
        strokeColor: '#b45309',
        fillColor: '#f59e0b',
        highlight: false,
        showInfobox: false,
        withLabel: false,
      }) as unknown as JxgPoint;
      domainGliders.push({ which, p: g });
      g.on('drag', () => {
        moved = true;
        hooks.onMove?.(activeIndex, currentPoints());
      });
    };
    if (config.domainEndpoints.min) mk('min', 0.25);
    if (config.domainEndpoints.max) mk('max', 0.75);
  }

  // graph_inequality: a filled half-plane region computed by hand (a closed
  // polygon against the window edges), so above/below/left/right all render the
  // same way for every boundary shape — no reliance on JSXGraph's inequality-
  // element orientation rules. The curve's updateDataArray re-derives from the
  // live handle positions on every board.update(), so it tracks drags for free.
  let shadeSide: 'above' | 'below' | 'left' | 'right' | null = null;
  if (config.shadeBoundary) {
    const derive = config.deriveCurve;
    const SAMPLES = 120;
    const shade = board.create('curve', [[], []], {
      strokeWidth: 0,
      highlight: false,
      fixed: true,
      fillColor: ANSWER_COLOR,
      fillOpacity: 0.15,
    }) as unknown as { dataX: number[]; dataY: number[]; updateDataArray?: () => void };
    (shade as { updateDataArray: () => void }).updateDataArray = function (this: {
      dataX: number[];
      dataY: number[];
    }): void {
      this.dataX = [];
      this.dataY = [];
      if (!shadeSide) return;
      const pts = currentPoints();
      if (shadeSide === 'left' || shadeSide === 'right') {
        // Vertical boundary: the handles' mean x names the line.
        if (pts.length < 2) return;
        const k = pts.reduce((s, [px]) => s + px, 0) / pts.length;
        const edge = shadeSide === 'right' ? config.xMax : config.xMin;
        this.dataX = [k, k, edge, edge, k];
        this.dataY = [config.yMin, config.yMax, config.yMax, config.yMin, config.yMin];
        return;
      }
      const fn = derive ? derive(pts) : null;
      if (!fn) return;
      const edge = shadeSide === 'above' ? config.yMax : config.yMin;
      const clamp = (y: number): number =>
        Math.min(config.yMax, Math.max(config.yMin, y));
      for (let i = 0; i <= SAMPLES; i++) {
        const x = config.xMin + ((config.xMax - config.xMin) * i) / SAMPLES;
        const y = fn(x);
        this.dataX.push(x);
        this.dataY.push(Number.isFinite(y) ? clamp(y) : edge);
      }
      // Close the region against the window edge.
      this.dataX.push(config.xMax, config.xMin, this.dataX[0]!);
      this.dataY.push(edge, edge, this.dataY[0]!);
    };

    // Click empty space → report which side of the boundary was clicked. Drags
    // end with an 'up' too, so require the pointer to have stayed put since
    // 'down' AND no handle drag in flight.
    const xSpan = config.xMax - config.xMin;
    const ySpan = config.yMax - config.yMin;
    let downUsr: [number, number] | null = null;
    let draggedSinceDown = false;
    board.on('down', (e: Event) => {
      draggedSinceDown = false;
      downUsr = board.getUsrCoordsOfMouse(e);
    });
    points.forEach((p) => p.on('drag', () => { draggedSinceDown = true; }));
    board.on('up', (e: Event) => {
      if (draggedSinceDown || !downUsr) return;
      const [cx, cy] = board.getUsrCoordsOfMouse(e);
      if (Math.abs(cx - downUsr[0]) > xSpan / 100 || Math.abs(cy - downUsr[1]) > ySpan / 100) {
        return;
      }
      const pts = currentPoints();
      if (config.lineThroughHandles) {
        if (pts.length < 2) return;
        const k = pts.reduce((s, [px]) => s + px, 0) / pts.length;
        if (Math.abs(cx - k) < (config.xMax - config.xMin) / 100) return; // too close to call
        hooks.onSideClick?.(cx > k ? 'right' : 'left');
        return;
      }
      const fn = config.deriveCurve ? config.deriveCurve(pts) : null;
      if (!fn) return;
      const by = fn(cx);
      if (!Number.isFinite(by) || Math.abs(cy - by) < (config.yMax - config.yMin) / 100) return;
      hooks.onSideClick?.(cy > by ? 'above' : 'below');
    });
  }

  // Enlarge the active handle so keyboard users can see which one the arrows
  // move. No-op visual noise for the single-handle case (index always 0).
  const styleActive = (): void => {
    if (count < 2) return;
    points.forEach((p, i) =>
      p.setAttribute({ size: i === activeIndex ? HANDLE_SIZE_ACTIVE : HANDLE_SIZE }),
    );
    board.update();
  };
  styleActive();

  const notify = (fromUser: boolean): void => {
    if (fromUser) moved = true;
    hooks.onMove?.(activeIndex, currentPoints());
  };

  // Drag (mouse/touch): the dragged handle becomes active, then JSXGraph fires
  // 'drag' after snapping.
  points.forEach((p, i) =>
    p.on('drag', () => {
      if (activeIndex !== i) {
        activeIndex = i;
        styleActive();
      }
      notify(true);
    }),
  );

  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!interactive) return;

    // Tab / Shift+Tab cycle the active handle, but only INSIDE the range — at the
    // ends we don't preventDefault, so focus leaves the widget normally (no trap).
    if (e.key === 'Tab' && count > 1) {
      const next = activeIndex + (e.shiftKey ? -1 : 1);
      if (next >= 0 && next < count) {
        e.preventDefault();
        activeIndex = next;
        styleActive();
        hooks.onMove?.(activeIndex, currentPoints()); // narrate the new focus (not a move)
      }
      return;
    }

    const active = points[activeIndex];
    if (!active) return;
    const fine = e.shiftKey;
    const stepX = fine ? 0.1 : config.xGridStep;
    const stepY = fine ? 0.1 : config.yGridStep;
    let nx = active.X();
    let ny = active.Y();
    switch (e.key) {
      case 'ArrowLeft': nx -= stepX; break;
      case 'ArrowRight': nx += stepX; break;
      case 'ArrowUp': ny += stepY; break;
      case 'ArrowDown': ny -= stepY; break;
      default: return;
    }
    e.preventDefault();
    active.moveTo([clampX(nx), clampY(ny)]);
    board.update();
    notify(true);
  });

  // Note: onMove is NOT fired at construction — only on real user moves, focus
  // changes, and an explicit setPoints (state restore). The caller reads the
  // initial positions via getPoints() after mounting if it needs them.

  return {
    getPoints: currentPoints,
    hasMoved: () => moved,
    setPoints(next: [number, number][]): void {
      next.forEach((coords, i) => {
        const p = points[i];
        if (p) p.moveTo([clampX(coords[0]), clampY(coords[1])]);
      });
      board.update();
      notify(false);
    },
    setInteractive(on: boolean): void {
      interactive = on;
      for (const p of points) p.setAttribute({ fixed: !on });
      for (const { p } of domainGliders) p.setAttribute({ fixed: !on });
    },
    getDomainXs(): { minX?: number; maxX?: number } {
      const out: { minX?: number; maxX?: number } = {};
      for (const { which, p } of domainGliders) {
        if (which === 'min') out.minX = p.X();
        else out.maxX = p.X();
      }
      return out;
    },
    setDomainXs(xs): void {
      for (const { which, p } of domainGliders) {
        const x = which === 'min' ? xs.minX : xs.maxX;
        if (typeof x === 'number') p.moveTo([x, 0]); // glider re-projects onto the curve
      }
      board.update();
    },
    setShadeSide(side): void {
      shadeSide = side;
      board.update();
    },
    setBoundaryDashed(dashed: boolean): void {
      const attrs = { dash: dashed ? 2 : 0 };
      curveObj?.setAttribute(attrs);
      lineObj?.setAttribute(attrs);
      board.update();
    },
    destroy(): void {
      JSXGraph.freeBoard(board as unknown as Parameters<typeof JSXGraph.freeBoard>[0]);
    },
  };
}

// =============================================================================
// createDisplayBoard — the STATIC (ungraded) graph, for interaction.type
// 'display'
// -----------------------------------------------------------------------------
// Draws a fixed picture — points, curves, segments, filled polygons — with NO
// handles, NO drag, NO pan/zoom/keyboard, NO scoring. Used two ways from one
// call: a stimulus a graded question refers to, and a standalone exemplar. The
// board is a figure, not a control: role="img" with a text summary, not
// role="application"/tabindex (nothing to operate). Shares this module's single
// JSXGraph import, so a page already paying for a graded graph pays nothing more.
//
// Defensive per drawable: a malformed one (a vertical "linear" curve, a polygon
// with <3 vertices) is skipped rather than throwing — a partial figure beats a
// blank page.
// =============================================================================

const DISPLAY_CURVE_COLOR = '#2563eb';
const DISPLAY_POINT_COLOR = '#0f172a';
const DISPLAY_FILL_COLOR = '#2563eb';

// The kit's own parallel view of a schema Drawable (the kit never imports
// @activity/schema; the wire shape is the contract). Optional fields are read
// per `kind`.
export interface DisplayDrawable {
  kind: 'point' | 'curve' | 'expression' | 'segment' | 'ray' | 'polygon';
  at?: [number, number];
  label?: string;
  model?: Record<string, unknown>;
  from?: [number, number];
  to?: [number, number];
  through?: [number, number];
  vertices?: [number, number][];
  filled?: boolean;
  // Drop 5 additions
  style?: 'solid' | 'dashed';
  shade?: 'above' | 'below' | 'left' | 'right';
  domain?: { min?: number; minStyle?: string; max?: number; maxStyle?: string };
  expression?: string;
  endpoints?: [string, string];
  fromStyle?: string;
}

export interface DisplayConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xGridStep: number;
  yGridStep: number;
  showGrid: boolean;
  drawables: DisplayDrawable[];
}

export interface DisplayController {
  destroy(): void;
}

// A FunctionModel → f(x). Only 'linear' today; quadratic/exp/log slot in beside
// it (matching graph-score's fitFunction), so a curve drawable grows with the
// graded families for free.
function modelToFn(
  model: Record<string, unknown> | undefined,
): ((x: number) => number) | null {
  if (!model) return null;
  const n = (v: unknown): number => (typeof v === 'number' ? v : NaN);
  switch (model.family ?? 'linear') {
    case 'linear': {
      const m = n(model.slope);
      const b = n(model.intercept);
      return Number.isFinite(m) && Number.isFinite(b) ? (x) => m * x + b : null;
    }
    case 'quadratic': {
      const a = n(model.a); const b = n(model.b); const c = n(model.c);
      return [a, b, c].every(Number.isFinite) ? (x) => a * x * x + b * x + c : null;
    }
    case 'exponential': {
      const a = n(model.a); const b = n(model.b);
      return [a, b].every(Number.isFinite) ? (x) => a * Math.pow(b, x) : null;
    }
    case 'logarithmic': {
      const a = n(model.a); const b = n(model.b);
      return [a, b].every(Number.isFinite) ? (x) => a + b * Math.log(x) : null;
    }
    default:
      return null; // vertical + unknown: drawn by the caller, not as y = f(x)
  }
}

// Open (hollow) vs closed (filled) endpoint dot attributes.
function dotAttrs(style: string | undefined): Record<string, unknown> {
  return {
    fixed: true,
    size: 3,
    strokeColor: DISPLAY_POINT_COLOR,
    fillColor: style === 'open' ? '#ffffff' : DISPLAY_POINT_COLOR,
    highlight: false,
    showInfobox: false,
    withLabel: false,
  };
}

const isPair = (p: unknown): p is [number, number] =>
  Array.isArray(p) &&
  p.length === 2 &&
  typeof p[0] === 'number' &&
  typeof p[1] === 'number';

export function createDisplayBoard(
  container: HTMLElement,
  config: DisplayConfig,
): DisplayController {
  if (!container.id) container.id = `gk-display-${(boardSeq += 1)}`;

  const board = JSXGraph.initBoard(container.id, {
    boundingbox: [config.xMin, config.yMax, config.xMax, config.yMin],
    axis: true,
    grid: config.showGrid,
    keepAspectRatio: false,
    showCopyright: false,
    showNavigation: false,
    pan: { enabled: false, needShift: false, needTwoFingers: false },
    zoom: { wheel: false, needShift: true, min: 1, max: 1 },
    keyboard: { enabled: false },
  } as Parameters<typeof JSXGraph.initBoard>[1]) as unknown as JxgBoard;

  // A static figure: announce it as an image, not an application. (JSXGraph sets
  // role="region" on init; we override to img and drop any tabindex so it isn't
  // a focus stop with nothing to operate.)
  container.setAttribute('role', 'img');
  container.removeAttribute('tabindex');
  if (!container.getAttribute('aria-label')) {
    container.setAttribute('aria-label', 'Graph');
  }

  for (const d of config.drawables) {
    switch (d.kind) {
      case 'point': {
        if (!isPair(d.at)) break;
        board.create('point', d.at, {
          ...dotAttrs(d.style),
          name: d.label ?? '',
          withLabel: Boolean(d.label),
        });
        break;
      }
      case 'curve': {
        const attrs = {
          strokeColor: DISPLAY_CURVE_COLOR,
          strokeWidth: 2,
          highlight: false,
          fixed: true,
          dash: d.style === 'dashed' ? 2 : 0,
        };
        const model = d.model ?? {};
        if (model.family === 'vertical') {
          const k = typeof model.x === 'number' ? model.x : NaN;
          if (!Number.isFinite(k)) break;
          board.create('segment', [[k, config.yMin], [k, config.yMax]], attrs);
          if (d.shade === 'left' || d.shade === 'right') {
            const edge = d.shade === 'right' ? config.xMax : config.xMin;
            board.create('polygon', [[k, config.yMin], [k, config.yMax], [edge, config.yMax], [edge, config.yMin]] as unknown[], {
              fillColor: DISPLAY_FILL_COLOR, fillOpacity: 0.15, fixed: true,
              vertices: { visible: false, fixed: true }, borders: { strokeWidth: 0, highlight: false },
            });
          }
          break;
        }
        const fn = modelToFn(model);
        if (!fn) break;
        const lo = typeof d.domain?.min === 'number' ? d.domain.min : config.xMin;
        const hi = typeof d.domain?.max === 'number' ? d.domain.max : config.xMax;
        board.create('functiongraph', [fn, lo, hi], attrs);
        // Domain endpoint dots (open/closed) where a bound was authored.
        if (typeof d.domain?.min === 'number') {
          board.create('point', [d.domain.min, fn(d.domain.min)], dotAttrs(d.domain.minStyle));
        }
        if (typeof d.domain?.max === 'number') {
          board.create('point', [d.domain.max, fn(d.domain.max)], dotAttrs(d.domain.maxStyle));
        }
        if (d.shade === 'above' || d.shade === 'below') {
          const edge = d.shade === 'above' ? config.yMax : config.yMin;
          const xs: number[] = []; const ys: number[] = [];
          const N = 120;
          for (let i = 0; i <= N; i++) {
            const x = config.xMin + ((config.xMax - config.xMin) * i) / N;
            const y = fn(x);
            xs.push(x);
            ys.push(Number.isFinite(y) ? Math.min(config.yMax, Math.max(config.yMin, y)) : edge);
          }
          xs.push(config.xMax, config.xMin, xs[0]!);
          ys.push(edge, edge, ys[0]!);
          board.create('curve', [xs, ys], {
            strokeWidth: 0, fixed: true, highlight: false,
            fillColor: DISPLAY_FILL_COLOR, fillOpacity: 0.15,
          });
        }
        break;
      }
      case 'expression': {
        if (typeof d.expression !== 'string' || !d.expression) break;
        const fn = compileFunction(d.expression);
        if (!fn) break;
        board.create('functiongraph', [(x: number) => fn(x)], {
          strokeColor: DISPLAY_CURVE_COLOR,
          strokeWidth: 2,
          highlight: false,
          fixed: true,
          dash: d.style === 'dashed' ? 2 : 0,
        });
        break;
      }
      case 'ray': {
        if (!isPair(d.from) || !isPair(d.through)) break;
        board.create('line', [d.from, d.through], {
          straightFirst: false,
          straightLast: true,
          strokeColor: DISPLAY_CURVE_COLOR,
          strokeWidth: 2,
          highlight: false,
          fixed: true,
        });
        board.create('point', d.from, dotAttrs(d.fromStyle));
        break;
      }
      case 'segment': {
        if (!isPair(d.from) || !isPair(d.to)) break;
        board.create('segment', [d.from, d.to], {
          strokeColor: DISPLAY_CURVE_COLOR,
          strokeWidth: 2,
          highlight: false,
          fixed: true,
        });
        if (d.endpoints) {
          board.create('point', d.from, dotAttrs(d.endpoints[0]));
          board.create('point', d.to, dotAttrs(d.endpoints[1]));
        }
        break;
      }
      case 'polygon': {
        const verts = Array.isArray(d.vertices) ? d.vertices.filter(isPair) : [];
        if (verts.length < 3) break;
        board.create('polygon', verts as unknown[], {
          fillColor: DISPLAY_FILL_COLOR,
          fillOpacity: d.filled === false ? 0 : 0.2,
          hasInnerPoints: false,
          fixed: true,
          vertices: { visible: false, fixed: true },
          borders: {
            strokeColor: DISPLAY_CURVE_COLOR,
            strokeWidth: 2,
            highlight: false,
            fixed: true,
          },
        });
        break;
      }
      default:
        break;
    }
  }

  board.update();

  return {
    destroy(): void {
      JSXGraph.freeBoard(board as unknown as Parameters<typeof JSXGraph.freeBoard>[0]);
    },
  };
}
