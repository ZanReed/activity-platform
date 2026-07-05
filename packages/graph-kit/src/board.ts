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
    grid: true,
    keepAspectRatio: false,
    showCopyright: false,
    showNavigation: false, // no nav buttons (avoids needing JSXGraph's CSS)
    // needShift: false is load-bearing — JSXGraph's DEFAULT mouse pan requires
    // shift+drag, which reads as "panning is broken" (author feedback,
    // 2026-07-05). Plain click-drag pans, Desmos-style.
    pan: { enabled: true, needShift: false, needTwoFingers: false },
    zoom: { wheel: true, needShift: false, min: 0.001, max: 1000 },
  }) as unknown as JxgBoard;

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

  function setPlots(items: PlotItem[]): void {
    for (const obj of listObjects) board.removeObject(obj);
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

  // ---- Stage 3: scatter + fit curve (the data/regression panel) --------------

  let scatterDots: unknown[] = [];
  let fitCurve: unknown = null;

  function setScatter(points: { x: number; y: number }[]): void {
    for (const dot of scatterDots) board.removeObject(dot);
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

  function destroy(): void {
    JSXGraph.freeBoard(board as unknown as Parameters<typeof JSXGraph.freeBoard>[0]);
  }

  return { plot, setPlots, refresh, setScatter, plotFit, fitView, destroy };
}
