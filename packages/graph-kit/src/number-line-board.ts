// =============================================================================
// number-line-board.ts — the 1-D number-line board (JSXGraph wrapper)
// -----------------------------------------------------------------------------
// The 1-D sibling of board.ts's createPointAnswerBoard. Statically imports
// JSXGraph (so callers dynamic-import THIS module to keep JSXGraph lazy). A
// horizontal number line with draggable, tick-snapping, keyboard-navigable
// handles — points (plot_point) or the two endpoints of an interval/ray
// (plot_interval). No pan/zoom; the line IS the problem.
//
// Design mirrors createPointAnswerBoard: fixed window, our own keydown owns the
// arrows, snap to the authored tick, an active-handle cue, onMove on every user
// move + focus change, setInteractive locks it post-check. Endpoints are gliders
// constrained to the axis so a drag can only slide horizontally.
// =============================================================================

import { JSXGraph } from 'jsxgraph';

const ANSWER_COLOR = '#7c3aed';
const AXIS_COLOR = '#64748b';
const HANDLE_SIZE = 6;
const HANDLE_SIZE_ACTIVE = 9;

// The two ends of an interval. 'closed'/'open' = a bounded endpoint (filled /
// hollow); 'unbounded' = a ray on that side (the bar extends to the edge with an
// arrow; that handle is hidden). The same 3-state control on BOTH ends never
// leaks whether the answer is a ray or a bounded interval.
export type IntervalEndState = 'closed' | 'open' | 'unbounded';

export interface NumberLineBoardConfig {
  min: number;
  max: number;
  tickStep: number;
  minorTicksPerStep: number;
  snapToTick: boolean;
  /** 'points' → count draggable handles; 'interval' → two endpoint handles. */
  mode: 'points' | 'interval';
  /** plot_point handle count (defaults to 1). Ignored for interval mode. */
  count?: number;
  /** Per-handle start positions (line units). */
  starts?: number[];
}

export interface NumberLineBoardHooks {
  /** Fired on every move or focus change with the active handle index + all
   *  handle positions (line units). */
  onMove?: (activeIndex: number, values: number[]) => void;
}

export interface NumberLineBoardController {
  /** Every handle's current position (line units), in handle order. For interval
   *  mode: [leftX, rightX] (only meaningful for bounded ends). */
  getValues(): number[];
  /** True once the student dragged or keyed a handle at least once. */
  hasMoved(): boolean;
  /** Reposition handles programmatically (state restore on reload). */
  setValues(values: number[]): void;
  /** Lock / unlock dragging + keyboard on every handle. */
  setInteractive(on: boolean): void;
  /** interval mode: set one end's state (closed/open/unbounded). Redraws the bar
   *  + endpoint dot. */
  setEndState?(which: 'left' | 'right', state: IntervalEndState): void;
  destroy(): void;
}

// A minimal structural view of the JSXGraph objects we touch.
interface JxgObj {
  X(): number;
  moveTo(coords: [number, number]): void;
  setAttribute(attrs: Record<string, unknown>): void;
  on(event: string, handler: () => void): void;
}
interface JxgBoard {
  create(type: string, parents: unknown[], attrs?: unknown): unknown;
  update(): void;
}

let boardSeq = 0;

export function createNumberLineBoard(
  container: HTMLElement,
  config: NumberLineBoardConfig,
  hooks: NumberLineBoardHooks = {},
): NumberLineBoardController {
  if (!container.id) container.id = `nl-board-${(boardSeq += 1)}`;
  const callerLabel = container.getAttribute('aria-label');

  const span = config.max - config.min;
  const pad = span * 0.06;
  // boundingbox is [xMin, yMax, xMax, yMin]. A short band around y=0 leaves room
  // for tick labels below the line and the interval bar above it.
  const board = JSXGraph.initBoard(container.id, {
    boundingbox: [config.min - pad, 1.4, config.max + pad, -1.8],
    axis: false,
    grid: false,
    keepAspectRatio: false,
    showCopyright: false,
    showNavigation: false,
    pan: { enabled: false, needShift: false, needTwoFingers: false },
    zoom: { wheel: false, needShift: true, min: 1, max: 1 },
    keyboard: { enabled: false },
  } as Parameters<typeof JSXGraph.initBoard>[1]) as unknown as JxgBoard;

  // Re-apply focusable application semantics JSXGraph overwrites on init.
  container.setAttribute('role', 'application');
  container.setAttribute('tabindex', '0');
  container.setAttribute(
    'aria-label',
    callerLabel ??
      'Interactive number line. Use arrow keys to move the handle; hold Shift for fine steps.',
  );

  // The number-line axis at y = 0: ticks, labels, and an arrowhead each end (the
  // line continues past the window). JSXGraph's axis owns tick spacing + labels.
  const axis = board.create('axis', [[0, 0], [1, 0]], {
    strokeColor: AXIS_COLOR,
    strokeWidth: 1.5,
    firstArrow: { size: 6 },
    lastArrow: { size: 6 },
    ticks: {
      drawLabels: true,
      drawZero: true,
      ticksDistance: config.tickStep,
      minorTicks: config.minorTicksPerStep,
      majorHeight: 14,
      minorHeight: 8,
      strokeColor: AXIS_COLOR,
      label: { offset: [0, -14], anchorX: 'middle', fontSize: 12, strokeColor: '#475569' },
    },
    highlight: false,
    fixed: true,
    name: '',
    withLabel: false,
  }) as unknown as JxgObj;

  const clamp = (x: number): number => Math.min(Math.max(x, config.min), config.max);

  // Snap unit: the minor-tick spacing when there are minor ticks, else the
  // labeled step. Keyboard nudge uses the same unit; Shift = one-tenth of it.
  const snapUnit =
    config.minorTicksPerStep > 0
      ? config.tickStep / (config.minorTicksPerStep + 1)
      : config.tickStep;
  const snap = (x: number): number =>
    config.snapToTick ? Math.round(x / snapUnit) * snapUnit : x;

  const isInterval = config.mode === 'interval';
  const count = isInterval ? 2 : Math.max(1, Math.floor(config.count ?? 1));

  const defaultStarts = (): number[] => {
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      out.push(clamp(config.min + ((i + 1) * span) / (count + 1)));
    }
    return out;
  };
  const starts =
    config.starts && config.starts.length === count
      ? config.starts.map(clamp)
      : defaultStarts();

  // One glider per handle, constrained to the axis (so a drag can only slide
  // along the line). showInfobox off — narration is the runtime's job.
  const handles: JxgObj[] = starts.map(
    (s) =>
      board.create('glider', [s, 0, axis], {
        name: '',
        withLabel: false,
        size: HANDLE_SIZE,
        strokeColor: ANSWER_COLOR,
        fillColor: ANSWER_COLOR,
        highlightStrokeColor: ANSWER_COLOR,
        highlightFillColor: ANSWER_COLOR,
        showInfobox: false,
      }) as unknown as JxgObj,
  );

  // Interval bar: a line through the two handles. straightFirst/Last extend it
  // into a ray when an end is unbounded; the arrow rides the unbounded side.
  const endStates: [IntervalEndState, IntervalEndState] = ['closed', 'closed'];
  let bar: JxgObj | null = null;
  if (isInterval && handles.length === 2) {
    bar = board.create('line', [handles[0], handles[1]], {
      strokeColor: ANSWER_COLOR,
      strokeWidth: 4,
      highlight: false,
      fixed: true,
      straightFirst: false,
      straightLast: false,
    }) as unknown as JxgObj;
  }

  let activeIndex = 0;
  let moved = false;
  let interactive = true;

  const values = (): number[] => handles.map((h) => h.X());

  // Which handle is the left (lesser-x) end right now — the pair can cross.
  const leftIdx = (): number => (handles[0]!.X() <= handles[1]!.X() ? 0 : 1);

  const applyIntervalVisuals = (): void => {
    if (!isInterval || !bar || handles.length < 2) return;
    const li = leftIdx();
    const ri = 1 - li;
    const leftState = endStates[0];
    const rightState = endStates[1];
    // The bar spans the two handles; a ray extends past whichever end is
    // unbounded, with the arrow on that side and that handle hidden.
    bar.setAttribute({
      straightFirst: leftState === 'unbounded',
      straightLast: rightState === 'unbounded',
      firstArrow: leftState === 'unbounded',
      lastArrow: rightState === 'unbounded',
    });
    const styleFor = (state: IntervalEndState): Record<string, unknown> => {
      if (state === 'unbounded') return { visible: false };
      return state === 'open'
        ? { visible: true, fillColor: '#ffffff', highlightFillColor: '#ffffff' }
        : { visible: true, fillColor: ANSWER_COLOR, highlightFillColor: ANSWER_COLOR };
    };
    handles[li]!.setAttribute(styleFor(leftState));
    handles[ri]!.setAttribute(styleFor(rightState));
    board.update();
  };
  applyIntervalVisuals();

  const styleActive = (): void => {
    if (count < 2) return;
    handles.forEach((h, i) =>
      h.setAttribute({ size: i === activeIndex ? HANDLE_SIZE_ACTIVE : HANDLE_SIZE }),
    );
    board.update();
  };
  styleActive();

  const notify = (fromUser: boolean): void => {
    if (fromUser) moved = true;
    if (isInterval) applyIntervalVisuals();
    hooks.onMove?.(activeIndex, values());
  };

  // Drag: snap to the tick, mark active, report.
  handles.forEach((h, i) =>
    h.on('drag', () => {
      const sx = snap(h.X());
      if (Math.abs(sx - h.X()) > 1e-9) h.moveTo([clamp(sx), 0]);
      if (activeIndex !== i) {
        activeIndex = i;
        styleActive();
      }
      notify(true);
    }),
  );

  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!interactive) return;
    // Tab / Shift+Tab cycle the active handle inside the range (no focus trap).
    if (e.key === 'Tab' && count > 1) {
      const next = activeIndex + (e.shiftKey ? -1 : 1);
      if (next >= 0 && next < count) {
        e.preventDefault();
        activeIndex = next;
        styleActive();
        hooks.onMove?.(activeIndex, values());
      }
      return;
    }
    const active = handles[activeIndex];
    if (!active) return;
    const step = e.shiftKey ? snapUnit / 10 : snapUnit;
    let nx = active.X();
    if (e.key === 'ArrowLeft') nx -= step;
    else if (e.key === 'ArrowRight') nx += step;
    else return;
    e.preventDefault();
    active.moveTo([clamp(nx), 0]);
    board.update();
    notify(true);
  });

  return {
    getValues: values,
    hasMoved: () => moved,
    setValues(next: number[]): void {
      next.forEach((x, i) => {
        const h = handles[i];
        if (h) h.moveTo([clamp(x), 0]);
      });
      board.update();
      notify(false);
    },
    setInteractive(on: boolean): void {
      interactive = on;
      for (const h of handles) h.setAttribute({ fixed: !on });
    },
    setEndState(which: 'left' | 'right', state: IntervalEndState): void {
      endStates[which === 'left' ? 0 : 1] = state;
      applyIntervalVisuals();
    },
    destroy(): void {
      JSXGraph.freeBoard(
        board as unknown as Parameters<typeof JSXGraph.freeBoard>[0],
      );
    },
  };
}
