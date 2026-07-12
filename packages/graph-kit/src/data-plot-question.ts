// =============================================================================
// data-plot-question.ts — the graded data-plot widget mount
// -----------------------------------------------------------------------------
// The kit-side half of the data_plot block. The runtime sidecar dynamic-imports
// the kit and calls mountDataPlotQuestion() per graded block; this owns the
// interactive answer surface (a dot-plot / histogram / box-plot builder) and
// reports the answer through hooks. The runtime owns persistence, checkpoint
// scoring, the submit payload, and the block's aria-live region.
//
// The answer key is the DATASET itself (design decision 3a): the correct plot is
// computed from `data` by the pure scorer — no separately-authored key. This
// mount branches on interactionType across the three builds:
//   build_dotplot   → the SVG dot board, scored by frequency-map equality
//   build_histogram → the bar-height board, scored by per-bin frequency equality
//   build_boxplot   → the five-handle board, scored by within-tolerance summary
// The boards (which own pointer/keyboard) are dynamic-imported here.
//
// There is deliberately NO author mount twin: a data_plot is authored by editing
// the dataset numerically (the editor's data-table) with the renderer's static
// preview — "author = enter data + see the computed plot," no drag-to-define.
// =============================================================================

import { scoreDotplot, scoreHistogram, scoreBoxplot } from './data-plot-score.js';
import type {
  DataPlotBoardConfig,
  DataPlotBoardController,
  HistogramBoardController,
  BoxplotBoardController,
  FiveHandles,
} from './data-plot-board.js';

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
  if (typeof a.binWidth === 'number' && a.binWidth > 0) {
    cfg.binWidth = a.binWidth;
  }
  return cfg;
}

function readData(raw: unknown): number[] {
  return Array.isArray(raw)
    ? raw.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
    : [];
}

type BuildType = 'build_dotplot' | 'build_histogram' | 'build_boxplot';

export interface DataPlotQuestionConfig {
  interactionType: BuildType | string;
  config: unknown; // DataPlotConfig
  data: unknown; // number[] — the dataset (the answer source)
  answerKey?: unknown; // build_boxplot: { tolerance } (the only authored field)
}

// What the widget reports on every change and at gather time. Shaped to the
// submission response union — exactly one of studentValues / studentBins /
// studentFive is set per interaction type.
export interface DataPlotResponseData {
  interactionType: BuildType;
  answered: boolean;
  correct: boolean;
  studentValues?: number[];
  studentBins?: number[];
  studentFive?: FiveHandles;
  /** A short SR-narration hint of what the student's cursor last touched. */
  cursor?: string;
}

// The persisted state the runtime restores from (a slice of DataPlotBlockState).
export interface DataPlotRestore {
  studentValues?: number[];
  studentBins?: number[];
  studentFive?: FiveHandles;
}

export interface DataPlotQuestionHooks {
  onChange?: (resp: DataPlotResponseData) => void;
}

export interface DataPlotQuestionHandle {
  getResponse(): DataPlotResponseData;
  restore(state: DataPlotRestore): void;
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
  const type: BuildType =
    cfg.interactionType === 'build_histogram'
      ? 'build_histogram'
      : cfg.interactionType === 'build_boxplot'
        ? 'build_boxplot'
        : 'build_dotplot';
  const tolerance = (() => {
    const k = (cfg.answerKey ?? {}) as Record<string, unknown>;
    return typeof k.tolerance === 'number' && k.tolerance >= 0 ? k.tolerance : 0.5;
  })();

  // Clear the renderer's static SVG placeholder before the board mounts.
  mount.textContent = '';
  const board = await import('./data-plot-board.js');

  const onChange = ({ fromKeyboard }: { fromKeyboard: boolean }): void =>
    hooks.onChange?.(build(fromKeyboard));

  if (type === 'build_histogram') {
    const b: HistogramBoardController = board.createHistogramBoard(mount, config, data, { onChange });
    function build(fromKeyboard = false): DataPlotResponseData {
      const studentBins = b.getBins();
      const answered = b.hasAnswered();
      const a = b.getActive();
      return {
        interactionType: 'build_histogram',
        answered,
        correct: answered && scoreHistogram(data, config, studentBins),
        studentBins,
        ...(fromKeyboard ? { cursor: `bin ${a.bin + 1}: ${a.freq}` } : {}),
      };
    }
    return {
      getResponse: () => build(),
      restore: (s) => { if (s.studentBins) b.setBins(s.studentBins); },
      setLocked: (locked) => b.setInteractive(!locked),
      destroy: () => b.destroy(),
    };
  }

  if (type === 'build_boxplot') {
    const b: BoxplotBoardController = board.createBoxplotBoard(mount, config, { onChange });
    function build(fromKeyboard = false): DataPlotResponseData {
      const studentFive = b.getFive();
      const answered = b.hasAnswered();
      const a = b.getActive();
      return {
        interactionType: 'build_boxplot',
        answered,
        correct: answered && scoreBoxplot(data, tolerance, studentFive),
        studentFive,
        ...(fromKeyboard ? { cursor: `${a.label}: ${a.value}` } : {}),
      };
    }
    return {
      getResponse: () => build(),
      restore: (s) => { if (s.studentFive) b.setFive(s.studentFive); },
      setLocked: (locked) => b.setInteractive(!locked),
      destroy: () => b.destroy(),
    };
  }

  // build_dotplot (default)
  const b: DataPlotBoardController = board.createDataPlotBoard(mount, config, { onChange });
  function build(fromKeyboard = false): DataPlotResponseData {
    const studentValues = b.getValues();
    const answered = b.hasAnswered();
    const c = b.getCursor();
    return {
      interactionType: 'build_dotplot',
      answered,
      correct: answered && scoreDotplot(data, studentValues),
      studentValues,
      ...(fromKeyboard ? { cursor: `${c.value}: ${c.count}` } : {}),
    };
  }
  return {
    getResponse: () => build(),
    restore: (s) => { if (s.studentValues) b.setValues(s.studentValues); },
    setLocked: (locked) => b.setInteractive(!locked),
    destroy: () => b.destroy(),
  };
}
