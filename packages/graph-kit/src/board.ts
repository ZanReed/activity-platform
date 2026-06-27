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

export interface BoardController {
  /** Plot (or replace) the single function curve; pass null to clear it. */
  plot(fn: ((x: number) => number) | null): void;
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
}

let boardSeq = 0;

const CURVE_COLOR = '#2563eb';

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
    boundingbox: [-10, 10, 10, -10], // [xMin, yMax, xMax, yMin]
    axis: true,
    grid: true,
    keepAspectRatio: false,
    showCopyright: false,
    showNavigation: false, // no nav buttons (avoids needing JSXGraph's CSS)
    pan: { enabled: true, needTwoFingers: false },
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
      case '+': case '=': bb = [xMin * 0.8, yMax * 0.8, xMax * 0.8, yMin * 0.8]; break;
      case '-': case '_': bb = [xMin * 1.25, yMax * 1.25, xMax * 1.25, yMin * 1.25]; break;
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

  function destroy(): void {
    JSXGraph.freeBoard(board as unknown as Parameters<typeof JSXGraph.freeBoard>[0]);
  }

  return { plot, destroy };
}
