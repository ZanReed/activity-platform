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

const END_LABEL: Record<IntervalEndState, string> = {
  closed: '● closed',
  open: '○ open',
  unbounded: '→ unbounded',
};
const nextEndState = (s: IntervalEndState): IntervalEndState =>
  s === 'closed' ? 'open' : s === 'open' ? 'unbounded' : 'closed';

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
  // Interval endpoint states, owned here (the board mirrors them visually).
  const endStates: [IntervalEndState, IntervalEndState] = ['closed', 'closed'];

  const board: NumberLineBoardController = createNumberLineBoard(
    mount,
    {
      ...line,
      mode: isInterval ? 'interval' : 'points',
      count: isInterval ? 2 : Math.max(1, pointKey!.correctPoints.length),
    },
    { onMove: () => handleMove() },
  );

  // Build the student's interval from the two handle positions + endpoint states.
  function studentInterval(): StudentInterval {
    const vals = board.getValues();
    const a = vals[0] ?? 0;
    const b = vals[1] ?? 0;
    const leftX = Math.min(a, b);
    const rightX = Math.max(a, b);
    const out: StudentInterval = {};
    if (endStates[0] !== 'unbounded') {
      out.min = leftX;
      out.minStyle = endStates[0];
    }
    if (endStates[1] !== 'unbounded') {
      out.max = rightX;
      out.maxStyle = endStates[1];
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

  // Interval control bar: one 3-state pill per end (closed → open → unbounded).
  const bar = document.createElement('div');
  const endButtons: HTMLButtonElement[] = [];
  if (isInterval) {
    bar.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;display:flex;gap:0.35rem;' +
      'flex-wrap:wrap;padding:0.3rem;background:rgba(255,255,255,0.88);' +
      'border-top:1px solid #e2e8f0;z-index:5;';
    (['left', 'right'] as const).forEach((which, i) => {
      const label = which === 'left' ? 'Left' : 'Right';
      const btn = pill(`${label}: ${END_LABEL[endStates[i]!]}`, () => {
        const next = nextEndState(endStates[i]!);
        endStates[i] = next;
        btn.textContent = `${label}: ${END_LABEL[next]}`;
        board.setEndState?.(which, next);
        answered = true;
        hooks.onChange?.(build());
      });
      endButtons.push(btn);
      bar.appendChild(btn);
    });
    mount.appendChild(bar);
  }

  return {
    getResponse: build,
    restore(values: number[], extras?: NumberLineRestoreExtras): void {
      answered = true;
      if (isInterval && extras?.interval) {
        const iv = extras.interval;
        endStates[0] = iv.min === undefined ? 'unbounded' : iv.minStyle ?? 'closed';
        endStates[1] = iv.max === undefined ? 'unbounded' : iv.maxStyle ?? 'closed';
        endButtons.forEach((btn, i) => {
          const label = i === 0 ? 'Left' : 'Right';
          btn.textContent = `${label}: ${END_LABEL[endStates[i]!]}`;
        });
        board.setEndState?.('left', endStates[0]);
        board.setEndState?.('right', endStates[1]);
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
      for (const b of endButtons) b.disabled = locked;
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

  const endStates: [IntervalEndState, IntervalEndState] = [
    cfg.correctInterval?.min === undefined ? 'unbounded' : cfg.correctInterval.minStyle ?? 'closed',
    cfg.correctInterval?.max === undefined ? 'unbounded' : cfg.correctInterval.maxStyle ?? 'closed',
  ];

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

  function currentInterval(): StudentInterval {
    const vals = board.getValues();
    const leftX = Math.min(vals[0] ?? 0, vals[1] ?? 0);
    const rightX = Math.max(vals[0] ?? 0, vals[1] ?? 0);
    const out: StudentInterval = {};
    if (endStates[0] !== 'unbounded') {
      out.min = leftX;
      out.minStyle = endStates[0];
    }
    if (endStates[1] !== 'unbounded') {
      out.max = rightX;
      out.maxStyle = endStates[1];
    }
    return out;
  }

  function emit(): void {
    if (isInterval) hooks.onIntervalChange?.(currentInterval());
    else hooks.onChange?.(board.getValues());
  }

  if (isInterval) {
    const bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;display:flex;gap:0.35rem;' +
      'flex-wrap:wrap;padding:0.3rem;background:rgba(255,255,255,0.88);' +
      'border-top:1px solid #e2e8f0;z-index:5;';
    (['left', 'right'] as const).forEach((which, i) => {
      const label = which === 'left' ? 'Left' : 'Right';
      board.setEndState?.(which, endStates[i]!);
      const btn = pill(`${label}: ${END_LABEL[endStates[i]!]}`, () => {
        const next = nextEndState(endStates[i]!);
        endStates[i] = next;
        btn.textContent = `${label}: ${END_LABEL[next]}`;
        board.setEndState?.(which, next);
        emit();
      });
      bar.appendChild(btn);
    });
    mount.appendChild(bar);
  }

  return { destroy: board.destroy };
}
