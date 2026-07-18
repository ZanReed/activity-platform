// =============================================================================
// number-line-question.ts — the graded number-line widget + author mount
// -----------------------------------------------------------------------------
// The kit-side half of the number_line block. The runtime sidecar dynamic-
// imports the kit and calls mountNumberLineQuestion() per block; this owns the
// interactive answer surface (the 1-D board + the student's handles/interval)
// and reports the answer through hooks. The runtime owns persistence, checkpoint
// scoring, the submit payload, and the block's aria-live region.
//
// mountNumberLineAuthor is the editor's twin — the teacher drags to define the
// key (handle positions ARE correctPoints; the interval ends + pills ARE the
// correctInterval), so authoring is literally the student experience.
//
// JSXGraph stays lazy: these entries live in the kit, but the board (which
// statically imports JSXGraph) is dynamic-imported here.
// =============================================================================

import {
  scoreNumberLinePoints,
  scoreNumberLineInterval,
  type EndpointStyle,
  type StudentInterval,
} from './number-line-score.js';
import type {
  NumberLineBoardConfig,
  NumberLineBoardController,
  IntervalEndState,
} from './number-line-board.js';
import {
    chromeColors,
    detectBoardTheme,
    type ChromeColors,
} from './graph-colors.js';

const numOr = (v: unknown, d: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : d;

// ---- Config parsing (defends against malformed data-* like graph-question) --
function readLineConfig(raw: unknown): Omit<NumberLineBoardConfig, 'mode' | 'count' | 'starts'> {
  const a = (raw ?? {}) as Record<string, unknown>;
  const min = numOr(a.min, 0);
  const max = numOr(a.max, 10);
  return {
    min,
    max: max > min ? max : min + 10,
    tickStep: (() => {
      const t = numOr(a.tickStep, 1);
      return t > 0 ? t : 1;
    })(),
    minorTicksPerStep: (() => {
      const m = numOr(a.minorTicksPerStep, 0);
      return m >= 0 ? Math.floor(m) : 0;
    })(),
    snapToTick: a.snapToTick !== false,
  };
}

function readPointKey(raw: unknown): { correctPoints: number[]; tolerance: number } {
  const k = (raw ?? {}) as Record<string, unknown>;
  const pts = Array.isArray(k.correctPoints)
    ? k.correctPoints.filter((p): p is number => typeof p === 'number' && Number.isFinite(p))
    : [];
  const tol = typeof k.tolerance === 'number' && k.tolerance >= 0 ? k.tolerance : 0.1;
  return { correctPoints: pts, tolerance: tol };
}

const style = (v: unknown): EndpointStyle => (v === 'open' ? 'open' : 'closed');

function readIntervalKey(raw: unknown): {
  correctInterval: StudentInterval;
  tolerance: number;
} {
  const k = (raw ?? {}) as Record<string, unknown>;
  const ci = (k.correctInterval ?? {}) as Record<string, unknown>;
  const interval: StudentInterval = {};
  if (typeof ci.min === 'number') {
    interval.min = ci.min;
    interval.minStyle = style(ci.minStyle);
  }
  if (typeof ci.max === 'number') {
    interval.max = ci.max;
    interval.maxStyle = style(ci.maxStyle);
  }
  const tol = typeof k.tolerance === 'number' && k.tolerance >= 0 ? k.tolerance : 0.1;
  return { correctInterval: interval, tolerance: tol };
}

export interface NumberLineQuestionConfig {
  interactionType: 'plot_point' | 'plot_interval' | string;
  config: unknown; // NumberLineConfig
  answerKey: unknown; // { correctPoints, tolerance } | { correctInterval, tolerance }
}

// What the widget reports on every change and at gather time. Shaped to the
// submission response union: point answers carry studentPoints; interval answers
// carry the bounds + styles.
export interface NumberLineResponseData {
  interactionType: 'plot_point' | 'plot_interval';
  answered: boolean;
  correct: boolean;
  studentPoints?: number[];
  interval?: StudentInterval;
}

export interface NumberLineRestoreExtras {
  interval?: {
    min?: number;
    minStyle?: EndpointStyle;
    max?: number;
    maxStyle?: EndpointStyle;
  };
}

export interface NumberLineQuestionHooks {
  onChange?: (resp: NumberLineResponseData) => void;
}

export interface NumberLineQuestionHandle {
  getResponse(): NumberLineResponseData;
  restore(values: number[], extras?: NumberLineRestoreExtras): void;
  setLocked(locked: boolean): void;
  destroy(): void;
}

// A small pill button for the interval control bar (matches graph-question's).
// `chrome` is theme-resolved so the strip reads on both the light and dark board.
function pill(label: string, onClick: () => void, chrome: ChromeColors): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText =
    `font:inherit;font-size:0.75rem;padding:0.15rem 0.5rem;border:1px solid ${chrome.pillBorder};` +
    `border-radius:999px;background:${chrome.pillBg};color:${chrome.pillText};cursor:pointer;`;
  b.addEventListener('click', onClick);
  return b;
}
function setPillActive(b: HTMLButtonElement, on: boolean, chrome: ChromeColors): void {
  b.style.background = on ? chrome.accent : chrome.pillBg;
  b.style.color = on ? chrome.onAccent : chrome.pillText;
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
}

// ---- Shared shape controls (student widget + author board) -------------------
// The interval interaction is "two handles + a SHAPE choice + endpoint styles",
// mirroring the graph's ray/segment control set (graph-question.ts) so the two
// widgets can't drift and authoring is literally the student experience. Three
// shape pills — "Ray →" / "Ray ←" / "Segment" — plus contextual style pills.
//
// A number line has only two directions, so the ray labels are static (no need
// for the graph's 8-way true-direction glyphs). The chosen shape maps onto the
// board's two end-states: segment = both bounded; ray_positive = left bounded +
// right unbounded (→ +∞); ray_negative = left unbounded + right bounded (→ −∞).
// A ray = one bound omitted, which is exactly how scoreNumberLineInterval and
// the stored interval already model it — so this is a control swap only.
type IntervalShape = 'segment' | 'ray_positive' | 'ray_negative';

interface IntervalShapeControls {
  /** Append the shape + style pills to a control bar and sync visuals. */
  attach(bar: HTMLElement): void;
  /** Current end-states derived from the shape choice (for the board + answer). */
  endStates(): [IntervalEndState, IntervalEndState];
  /** Restore the shape + styles from a stored interval (which bound is omitted
   *  picks the shape). Does not fire onUserChange. */
  setFromInterval(iv: NumberLineRestoreExtras['interval']): void;
  setDisabled(disabled: boolean): void;
}

const styleLabel = (s: EndpointStyle): string => (s === 'closed' ? '● closed' : '○ open');
const toggleStyle = (s: EndpointStyle): EndpointStyle => (s === 'closed' ? 'open' : 'closed');

function createIntervalShapeControls(
  board: Pick<NumberLineBoardController, 'setEndState'>,
  onUserChange: () => void,
  chrome: ChromeColors,
): IntervalShapeControls {
  const state = {
    shape: 'segment' as IntervalShape,
    segStyles: ['closed', 'closed'] as [EndpointStyle, EndpointStyle],
    rayStyle: 'closed' as EndpointStyle,
  };

  const ends = (): [IntervalEndState, IntervalEndState] => {
    switch (state.shape) {
      case 'ray_positive':
        return [state.rayStyle, 'unbounded'];
      case 'ray_negative':
        return ['unbounded', state.rayStyle];
      default:
        return [state.segStyles[0], state.segStyles[1]];
    }
  };

  const pickShape = (shape: IntervalShape): void => {
    state.shape = shape;
    sync();
    onUserChange();
  };
  const rayPosBtn = pill('Ray →', () => pickShape('ray_positive'), chrome);
  const rayNegBtn = pill('Ray ←', () => pickShape('ray_negative'), chrome);
  const segmentBtn = pill('Segment', () => pickShape('segment'), chrome);
  const rayStyleBtn = pill('Endpoint: ● closed', () => {
    state.rayStyle = toggleStyle(state.rayStyle);
    sync();
    onUserChange();
  }, chrome);
  const segLeftBtn = pill('Left: ● closed', () => {
    state.segStyles = [toggleStyle(state.segStyles[0]), state.segStyles[1]];
    sync();
    onUserChange();
  }, chrome);
  const segRightBtn = pill('Right: ● closed', () => {
    state.segStyles = [state.segStyles[0], toggleStyle(state.segStyles[1])];
    sync();
    onUserChange();
  }, chrome);
  const buttons = [rayPosBtn, rayNegBtn, segmentBtn, rayStyleBtn, segLeftBtn, segRightBtn];

  function sync(): void {
    const [l, r] = ends();
    board.setEndState?.('left', l);
    board.setEndState?.('right', r);
    setPillActive(rayPosBtn, state.shape === 'ray_positive', chrome);
    setPillActive(rayNegBtn, state.shape === 'ray_negative', chrome);
    setPillActive(segmentBtn, state.shape === 'segment', chrome);
    const isRay = state.shape !== 'segment';
    // Ray: one endpoint style (the bounded end; the arrow end has no style).
    rayStyleBtn.hidden = !isRay;
    rayStyleBtn.textContent = `Endpoint: ${styleLabel(state.rayStyle)}`;
    // Segment: a style pill per end.
    segLeftBtn.hidden = isRay;
    segRightBtn.hidden = isRay;
    segLeftBtn.textContent = `Left: ${styleLabel(state.segStyles[0])}`;
    segRightBtn.textContent = `Right: ${styleLabel(state.segStyles[1])}`;
  }

  return {
    attach(bar: HTMLElement): void {
      bar.append(...buttons);
      sync();
    },
    endStates: ends,
    setFromInterval(iv): void {
      const hasMin = iv?.min !== undefined;
      const hasMax = iv?.max !== undefined;
      if (hasMin && hasMax) {
        state.shape = 'segment';
        state.segStyles = [iv?.minStyle ?? 'closed', iv?.maxStyle ?? 'closed'];
      } else if (hasMin) {
        state.shape = 'ray_positive';
        state.rayStyle = iv?.minStyle ?? 'closed';
      } else if (hasMax) {
        state.shape = 'ray_negative';
        state.rayStyle = iv?.maxStyle ?? 'closed';
      }
      sync();
    },
    setDisabled(disabled: boolean): void {
      for (const b of buttons) b.disabled = disabled;
    },
  };
}

// The control bar chrome (shared by student + author mounts).
function makeControlBar(chrome: ChromeColors): HTMLDivElement {
  const bar = document.createElement('div');
  bar.style.cssText =
    'position:absolute;left:0;right:0;bottom:0;display:flex;gap:0.35rem;' +
    `flex-wrap:wrap;padding:0.3rem;background:${chrome.barBg};` +
    `border-top:1px solid ${chrome.barBorder};z-index:5;`;
  return bar;
}

export async function mountNumberLineQuestion(
  mount: HTMLElement,
  rawConfig: unknown,
  hooks: NumberLineQuestionHooks = {},
): Promise<NumberLineQuestionHandle> {
  const cfg = (rawConfig ?? {}) as Partial<NumberLineQuestionConfig>;
  const line = readLineConfig(cfg.config);
  const interactionType = cfg.interactionType === 'plot_interval' ? 'plot_interval' : 'plot_point';
  const isInterval = interactionType === 'plot_interval';

  const pointKey = !isInterval ? readPointKey(cfg.answerKey) : null;
  const intervalKey = isInterval ? readIntervalKey(cfg.answerKey) : null;

  // Clear the renderer's static SVG placeholder before JSXGraph mounts.
  mount.textContent = '';
  const { createNumberLineBoard } = await import('./number-line-board.js');

  let answered = false;

  const board: NumberLineBoardController = createNumberLineBoard(
    mount,
    {
      ...line,
      mode: isInterval ? 'interval' : 'points',
      count: isInterval ? 2 : Math.max(1, pointKey!.correctPoints.length),
    },
    { onMove: () => handleMove() },
  );

  // The strip self-detects theme like the board, so its pills read on dark.
  const chrome = chromeColors(detectBoardTheme(mount));

  // Interval shape/style controls (the board mirrors them visually). Owns the
  // shape choice; endStates() derives the per-end bounded/unbounded from it.
  const controls: IntervalShapeControls | null = isInterval
    ? createIntervalShapeControls(board, () => {
        answered = true;
        hooks.onChange?.(build());
      }, chrome)
    : null;

  // Build the student's interval from the two handle positions + endpoint states.
  function studentInterval(): StudentInterval {
    const vals = board.getValues();
    const a = vals[0] ?? 0;
    const b = vals[1] ?? 0;
    const leftX = Math.min(a, b);
    const rightX = Math.max(a, b);
    const [l, r] = controls!.endStates();
    const out: StudentInterval = {};
    if (l !== 'unbounded') {
      out.min = leftX;
      out.minStyle = l;
    }
    if (r !== 'unbounded') {
      out.max = rightX;
      out.maxStyle = r;
    }
    return out;
  }

  function build(): NumberLineResponseData {
    if (isInterval) {
      const interval = studentInterval();
      return {
        interactionType: 'plot_interval',
        answered,
        correct: answered && scoreNumberLineInterval(intervalKey!, interval),
        interval,
      };
    }
    const studentPoints = board.getValues();
    return {
      interactionType: 'plot_point',
      answered,
      correct: answered && scoreNumberLinePoints(pointKey!, studentPoints),
      studentPoints,
    };
  }

  function handleMove(): void {
    if (board.hasMoved()) answered = true;
    hooks.onChange?.(build());
  }

  // Interval control bar: the shared Ray →/Ray ←/Segment shape pills + styles.
  if (isInterval && controls) {
    const bar = makeControlBar(chrome);
    controls.attach(bar);
    mount.appendChild(bar);
  }

  return {
    getResponse: build,
    restore(values: number[], extras?: NumberLineRestoreExtras): void {
      answered = true;
      if (isInterval && controls && extras?.interval) {
        const iv = extras.interval;
        controls.setFromInterval(iv);
        // Position the bounded handles at the restored bounds; leave unbounded
        // ones at their default (hidden) spot.
        const left = iv.min ?? line.min;
        const right = iv.max ?? line.max;
        board.setValues([left, right]);
      } else if (values.length > 0) {
        board.setValues(values);
      } else {
        hooks.onChange?.(build());
      }
    },
    setLocked(locked: boolean): void {
      board.setInteractive(!locked);
      controls?.setDisabled(locked);
    },
    destroy(): void {
      board.destroy();
    },
  };
}

// ---- Authoring --------------------------------------------------------------
// The editor NodeView mounts THIS so the teacher defines the key by dragging.
// Same board, same snap; no scoring. onChange reports the current key as the
// NodeView stores it (correctPoints for plot_point, correctInterval for
// plot_interval).

export interface NumberLineAuthorConfig {
  interactionType: 'plot_point' | 'plot_interval' | string;
  config: unknown;
  /** Starting handle positions (plot_point: the correct points). */
  correctPoints?: number[];
  /** plot_interval: the current authored interval, so the board + pills start
   *  on the stored key. */
  correctInterval?: {
    min?: number;
    minStyle?: EndpointStyle;
    max?: number;
    maxStyle?: EndpointStyle;
  };
}

export interface NumberLineAuthorHooks {
  /** plot_point: the new correct points as the teacher drags. */
  onChange?: (correctPoints: number[]) => void;
  /** plot_interval: the new authored interval (bounds + styles). */
  onIntervalChange?: (interval: StudentInterval) => void;
}

export interface NumberLineAuthorHandle {
  destroy(): void;
}

export async function mountNumberLineAuthor(
  mount: HTMLElement,
  rawConfig: unknown,
  hooks: NumberLineAuthorHooks = {},
): Promise<NumberLineAuthorHandle> {
  const cfg = (rawConfig ?? {}) as Partial<NumberLineAuthorConfig>;
  const line = readLineConfig(cfg.config);
  const isInterval = cfg.interactionType === 'plot_interval';

  const points = Array.isArray(cfg.correctPoints)
    ? cfg.correctPoints.filter((p): p is number => typeof p === 'number' && Number.isFinite(p))
    : [];

  mount.textContent = '';
  const { createNumberLineBoard } = await import('./number-line-board.js');

  const starts = isInterval
    ? [cfg.correctInterval?.min ?? line.min, cfg.correctInterval?.max ?? line.max]
    : points;

  const board = createNumberLineBoard(
    mount,
    {
      ...line,
      mode: isInterval ? 'interval' : 'points',
      count: isInterval ? 2 : Math.max(1, points.length),
      starts: starts.length === (isInterval ? 2 : Math.max(1, points.length)) ? starts : undefined,
    },
    { onMove: () => emit() },
  );

  // The strip self-detects theme like the board, so its pills read on dark.
  const chrome = chromeColors(detectBoardTheme(mount));

  // Same shape controls the student sees, so the authored key is defined the
  // same way it's answered. Seeded from the stored correctInterval.
  const controls: IntervalShapeControls | null = isInterval
    ? createIntervalShapeControls(board, () => emit(), chrome)
    : null;

  function currentInterval(): StudentInterval {
    const vals = board.getValues();
    const leftX = Math.min(vals[0] ?? 0, vals[1] ?? 0);
    const rightX = Math.max(vals[0] ?? 0, vals[1] ?? 0);
    const [l, r] = controls!.endStates();
    const out: StudentInterval = {};
    if (l !== 'unbounded') {
      out.min = leftX;
      out.minStyle = l;
    }
    if (r !== 'unbounded') {
      out.max = rightX;
      out.maxStyle = r;
    }
    return out;
  }

  function emit(): void {
    if (isInterval) hooks.onIntervalChange?.(currentInterval());
    else hooks.onChange?.(board.getValues());
  }

  if (isInterval && controls) {
    controls.setFromInterval(cfg.correctInterval);
    const bar = makeControlBar(chrome);
    controls.attach(bar);
    mount.appendChild(bar);
  }

  return { destroy: board.destroy };
}
