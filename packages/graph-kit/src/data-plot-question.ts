// =============================================================================
// data-plot-question.ts — the graded data-plot widget mount
// -----------------------------------------------------------------------------
// The kit-side half of the data_plot block. The runtime sidecar dynamic-imports
// the kit and calls mountDataPlotQuestion() per graded block; this owns the
// interactive answer surface (the SVG dot-plot builder) and reports the answer
// through hooks. The runtime owns persistence, checkpoint scoring, the submit
// payload, and the block's aria-live region.
//
// The answer key is the DATASET itself (design decision 3a): the correct dot
// plot is the frequency distribution of `data`, computed by the pure scorer —
// there is no separately-authored key. Slice 1 handles build_dotplot; the board
// (which owns pointer/keyboard) is dynamic-imported here, parallel to how
// number-line-question lazy-loads its JSXGraph board.
//
// There is deliberately NO author mount twin (unlike number-line): a data_plot
// is authored by editing the dataset numerically (the editor's data-table), and
// the live preview is the renderer's static renderDataPlotSvg — so "author =
// enter data + see the computed plot," no drag-to-define board needed.
// =============================================================================

import { scoreDotplot } from './data-plot-score.js';
import type { DataPlotBoardConfig, DataPlotBoardController } from './data-plot-board.js';

const numOr = (v: unknown, d: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : d;

// Defends against malformed data-* like graph-question / number-line-question.
function readConfig(raw: unknown): DataPlotBoardConfig {
  const a = (raw ?? {}) as Record<string, unknown>;
  const min = numOr(a.min, 0);
  const max = numOr(a.max, 10);
  const cfg: DataPlotBoardConfig = {
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
  if (typeof a.maxFrequency === 'number' && a.maxFrequency > 0) {
    cfg.maxFrequency = Math.floor(a.maxFrequency);
  }
  return cfg;
}

function readData(raw: unknown): number[] {
  return Array.isArray(raw)
    ? raw.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
    : [];
}

export interface DataPlotQuestionConfig {
  interactionType: 'build_dotplot' | string;
  config: unknown; // DataPlotConfig
  data: unknown; // number[] — the dataset (the answer source)
}

// What the widget reports on every change and at gather time. Shaped to the
// submission response union: build_dotplot carries the plotted values.
export interface DataPlotResponseData {
  interactionType: 'build_dotplot';
  answered: boolean;
  correct: boolean;
  studentValues: number[];
  /** The column the student's cursor last touched — for SR narration on change. */
  cursor?: { value: number; count: number };
}

export interface DataPlotQuestionHooks {
  onChange?: (resp: DataPlotResponseData) => void;
}

export interface DataPlotQuestionHandle {
  getResponse(): DataPlotResponseData;
  restore(values: number[]): void;
  setLocked(locked: boolean): void;
  destroy(): void;
}

export async function mountDataPlotQuestion(
  mount: HTMLElement,
  rawConfig: unknown,
  hooks: DataPlotQuestionHooks = {},
): Promise<DataPlotQuestionHandle> {
  const cfg = (rawConfig ?? {}) as Partial<DataPlotQuestionConfig>;
  const config = readConfig(cfg.config);
  const data = readData(cfg.data);

  // Clear the renderer's static SVG placeholder before the board mounts.
  mount.textContent = '';
  const { createDataPlotBoard } = await import('./data-plot-board.js');

  const board: DataPlotBoardController = createDataPlotBoard(
    mount,
    config,
    { onChange: ({ fromKeyboard }) => hooks.onChange?.(build(fromKeyboard)) },
  );

  function build(fromKeyboard = false): DataPlotResponseData {
    const studentValues = board.getValues();
    const answered = board.hasAnswered();
    return {
      interactionType: 'build_dotplot',
      answered,
      correct: answered && scoreDotplot(data, studentValues),
      studentValues,
      ...(fromKeyboard ? { cursor: board.getCursor() } : {}),
    };
  }

  return {
    getResponse: () => build(),
    restore(values: number[]): void {
      board.setValues(values);
    },
    setLocked(locked: boolean): void {
      board.setInteractive(!locked);
    },
    destroy(): void {
      board.destroy();
    },
  };
}
