// =============================================================================
// blocks/kitSurfaces.ts — the lazy graph-kit seams (S3 V9)
// -----------------------------------------------------------------------------
// The same shape as inline/math.ts, for the same reasons. graph-kit drags
// JSXGraph behind it, which is exactly the weight ruling D16 reserves the
// 'lazy' binding for — so the dynamic import below is the chunk boundary, taken
// only when a worksheet actually contains an interactive graph.
//
// It is also a TEST seam. The kit mounts a real JSXGraph board, which needs a
// real browser (packages/graph-kit's own suite says so: the widget-mount path
// stays browser-verified). Behind this interface the component's own logic —
// response wiring, verdict chrome, locking, restore — is fully testable in
// jsdom against a fake surface, and the board itself is verified in
// /dev/viewer where a browser exists.
//
// The configs deliberately carry NO answer key: these seams only ever mount
// the kit's ungraded input mode (author ruling A, 2026-07-31). `questionShape`
// comes from the served block, derived and whitelisted by the sanitizer.
//
// One file, three widgets (graph / number line / data plot), because they are
// the same three decisions each time — lazy import, work-only narrowing,
// injectable for tests — and keeping them adjacent is what makes the fourth
// one obvious to write.
// =============================================================================

// SUBPATHS, never the package barrel (review D1, 2026-11-26). The barrel
// re-exports the math-prompt mount, so importing it put MathLive (~225 KiB gz)
// and mathjs (~44 KiB gz) on every graph, number line and data plot. Each seam
// below imports only its own widget; scripts/tests/graph-kit-barrel.test.mjs
// fails on a barrel import anywhere in the repo, and the perf budget's student
// journeys check the built chunks.
//
// TYPED AGAINST THE KIT (review C4, 2026-11-28). Every config below is the
// kit's own config type minus its answer-key fields, every response is read
// from the kit's own response type, and the kit's mounts take those types
// instead of `unknown`. So an option the kit does not have, a field it reports
// in another shape, or a restore argument it does not take is a compile error
// here. The three defects the 2026-11-26 review found in this file (A1, A2,
// A3) all sat behind `as never` / `as unknown as` on these calls.
// `kitSeam.test.ts` fails if a cast returns to this file.
import type {
  DataPlotQuestionConfig,
  DataPlotQuestionHandle,
  DataPlotResponseData,
} from '@activity/graph-kit/data-plot-question';
import type {
  GraphQuestionConfig,
  GraphQuestionHandle,
  GraphResponseData,
} from '@activity/graph-kit/graph-question';
import type {
  NumberLineQuestionConfig,
  NumberLineQuestionHandle,
  NumberLineResponseData,
} from '@activity/graph-kit/number-line-question';
import type { MathPromptMountOptions } from '@activity/graph-kit/math-prompt-mount';
import type { CalculatorConfig, MountHooks } from '@activity/graph-kit/calculator';
import type { GraphWork } from '../check/wire.js';
import { retryableModule } from '../lazy/retryableChunk.js';

/** The chunk boundary for each widget: ONE dynamic import per subpath, shared
 * with the preload (kitPreload.ts) so the two cannot drift apart and the
 * student shell carries each import site once.
 *
 * Each goes through retryableModule (2026-11-28, lazy/retryableChunk.ts):
 * Chromium and WebKit refuse to fetch again a URL whose import failed, so
 * after a failure the next call — the mount after a failed preload, a later
 * mount — asks for the chunk under a new URL. There is no timed schedule here
 * and the failure is not claimed, so the app's stale-chunk recovery still
 * answers the first failure as it always has. LIMITS, as built today: the
 * graph and number-line widgets sit inside SHARED chunks (their importers end
 * `.then(n=>n.D)`), so they get no URL retry, only the old re-call; data plot,
 * maths prompts and the calculator do. And a new URL cannot revive a failed
 * shared dependency or stylesheet of a chunk; those stay failed until a
 * reload. */
export const loadGraphQuestion = retryableModule(
  () => import('@activity/graph-kit/graph-question'),
  import.meta.url,
);
export const loadNumberLineQuestion = retryableModule(
  () => import('@activity/graph-kit/number-line-question'),
  import.meta.url,
);
export const loadDataPlotQuestion = retryableModule(
  () => import('@activity/graph-kit/data-plot-question'),
  import.meta.url,
);
const loadMathPromptMount = retryableModule(
  () => import('@activity/graph-kit/math-prompt-mount'),
  import.meta.url,
);
const loadCalculator = retryableModule(
  () => import('@activity/graph-kit/calculator'),
  import.meta.url,
);

// ---- Restore, and its echo --------------------------------------------------
// Every kit's restore moves the handles through the same path a drag takes, so
// it fires `onChange`. Until 2026-11-26 that echo went straight to the store:
// the seam restored points only, the kit reported its DEFAULT shape, styles and
// side, and the block wrote those over the student's saved work, so a reloaded
// ray or inequality was graded on choices the student never made. Each seam
// below now restores the WHOLE saved work and drops the echo while it does.
//
// Why drop it here rather than add a silent restore to the kit: the work being
// restored is already in the store (that is where it came from), so the echo
// can only ever repeat it or corrupt it. One flag in this file covers all three
// kits and every block, and the kit's own contract stays as its other callers
// (the editor preview, the dev harness) rely on. Every kit restore emits
// synchronously, which is what makes a plain flag sufficient.
function quietRestorer(): {
  readonly restoring: boolean;
  run(restore: () => void): void;
} {
  let restoring = false;
  return {
    get restoring() {
      return restoring;
    },
    run(restore) {
      restoring = true;
      try {
        restore();
      } finally {
        restoring = false;
      }
    },
  };
}

/** What the student built, as the kit reports it. Mirrors the kit's
 * GraphResponseData minus everything grading-related — in ungraded mode the
 * kit reports `scored: false` and a meaningless `correct`, and this seam does
 * not re-export either, so a verdict cannot enter the viewer from here. */
export interface GraphSurfaceResponse {
  points: [number, number][];
  answered: boolean;
  noSolution?: boolean;
  strict?: boolean;
  side?: GraphSide;
  domain?: GraphResponseData['domain'];
  /** plot_ray / plot_segment: the chosen shape and the endpoint open/closed
   * choices. These are ANSWER CONTENT ("2 ≤ x < 7" ≠ "2 < x < 7"), not
   * presentation — they were being dropped here, which left the two
   * linear-piece interactions ungradable server-side. Work-only still holds:
   * a shape is what the student drew, not whether it was right. */
  shape?: GraphResponseData['shape'];
  endpointStyles?: Array<'open' | 'closed'>;
  /** transform_curve: the typed equation (ascii-math) + the drag channel's
   * answered bit. Work-only still holds — a typed equation is what the
   * student wrote, not whether it was right (the server parses and judges). */
  equation?: string;
  dragged?: boolean;
  /** A SYSTEM board's per-part work: one entry per curve or boundary. For an
   * inequality system each part carries its line style and, once picked, its
   * side; a function system's parts are points only. */
  parts?: Array<{
    points: [number, number][];
    strict?: boolean;
    side?: GraphSide;
  }>;
}

type GraphSide = NonNullable<GraphResponseData['side']>;

/** The kit's own question config, minus the two fields that carry the answer:
 * a caller of this seam CANNOT pass a key, by type. Each remaining field is
 * documented on the kit's `GraphQuestionConfig`. */
export type GraphSurfaceConfig = Omit<GraphQuestionConfig, 'answerKey' | 'noSolutionCorrect'>;

export interface GraphSurfaceHandle {
  getResponse(): GraphSurfaceResponse;
  /** Put the student's saved work back on the board: points AND every choice
   * that rides with them (shape, endpoint styles, line style, side, "no
   * solution"). Writes nothing to the store: see quietRestorer. */
  restore(work: GraphWork): void;
  setLocked(locked: boolean): void;
  destroy(): void;
}

export interface GraphSurface {
  (
    mount: HTMLElement,
    config: GraphSurfaceConfig,
    hooks: { onChange?: (response: GraphSurfaceResponse) => void },
  ): Promise<GraphSurfaceHandle>;
}

let override: GraphSurface | null = null;

/** Replace the surface (tests, dev harness). null restores the lazy kit. */
export function setGraphSurface(surface: GraphSurface | null): void {
  override = surface;
}

/** The active surface: an injected one, else the lazily-imported kit. */
export function graphSurface(): GraphSurface {
  return override ?? kitSurface;
}

const kitSurface: GraphSurface = async (mount, config, hooks) => {
  // The chunk boundary (P1A / D16). mathjs comes with it (the board draws
  // curves with it); MathLive does not: transform_curve's equation field
  // loads it on demand.
  const kit = await loadGraphQuestion();
  const quiet = quietRestorer();
  const system = isSystem(config);
  // A system ("graph both lines", a system of inequalities) has its own board,
  // one curve or boundary per part; everything else is the one-part board.
  const mountQuestion = !system
    ? kit.mountGraphQuestion
    : config.interactionType === 'graph_inequality'
      ? kit.mountGraphSystemQuestion
      : kit.mountGraphFunctionSystemQuestion;
  const handle = await mountQuestion(
    mount,
    {
      interactionType: config.interactionType,
      axisConfig: config.axisConfig,
      // No answerKey — ungraded input mode. The server grades.
      questionShape: config.questionShape,
      allowNoSolution: config.allowNoSolution,
      startModel: config.startModel,
      stimulus: config.stimulus,
      requireEquation: config.requireEquation,
      initialEquation: config.initialEquation,
      initialDragged: config.initialDragged,
    },
    {
      onChange: (resp) => {
        if (!quiet.restoring) hooks.onChange?.(toSurfaceResponse(resp));
      },
    },
  );
  return {
    getResponse: () => toSurfaceResponse(handle.getResponse()),
    restore: (work) => {
      const args = toGraphRestore(work, system);
      if (args) quiet.run(() => handle.restore(...args));
    },
    setLocked: (locked) => handle.setLocked(locked),
    destroy: () => handle.destroy(),
  };
};

/** Does this question mount a SYSTEM board? Only the two kinds that have one,
 * and only with several parts served. */
function isSystem(config: GraphSurfaceConfig): boolean {
  return (
    (config.interactionType === 'graph_inequality' ||
      config.interactionType === 'plot_function') &&
    (config.questionShape?.partFamilies?.length ?? 0) > 1
  );
}

type GraphRestoreArgs = Parameters<GraphQuestionHandle['restore']>;
type GraphRestoreExtras = NonNullable<GraphRestoreArgs[1]>;

const SIDES = ['above', 'below', 'left', 'right'] as const;
const asSide = (v: unknown): GraphRestoreExtras['side'] =>
  SIDES.find((s) => s === v);

/** Saved work → the graph kit's restore arguments: the inverse of
 * `toSurfaceResponse` plus the block's own wire mapping. null when there is
 * nothing to put back.
 *
 * transform_curve is the exception: its typed equation and drag bit ride the
 * MOUNT config (`initialEquation`, `initialDragged`), and its points are
 * restored only for work that was really dragged. Undragged work carries the
 * seed positions, which sit on the parent curve; restoring them would read as
 * drawn work (design A1). */
export function toGraphRestore(work: GraphWork, system = false): GraphRestoreArgs | null {
  if (system) {
    // A system board restores from its parts alone; its top-level points are
    // empty by construction. An inequality part keeps its style, and its side
    // only when one was picked.
    const parts = work.parts ?? [];
    if (parts.length === 0) return null;
    if (work.interaction === 'graph_inequality') {
      return [
        [],
        {
          parts: parts.map((p) => {
            const side = asSide(p.side);
            return {
              points: p.points ?? [],
              strict: p.strict === true,
              ...(side !== undefined ? { side } : {}),
            };
          }),
        },
      ];
    }
    return [[], { curveParts: parts.map((p) => ({ points: p.points ?? [] })) }];
  }
  if (work.interaction === 'transform_curve') {
    return work.dragged === true && work.points.length > 0 ? [work.points] : null;
  }
  const extras: GraphRestoreExtras = {};
  if (work.noSolution === true) extras.noSolution = true;
  if (work.domain !== undefined) extras.domain = work.domain;
  if (work.shape !== undefined) {
    extras.shape = work.shape;
    const [first, second] = work.endpointStyles ?? [];
    if (work.shape === 'segment') {
      if (first !== undefined && second !== undefined) extras.endpoints = [first, second];
    } else if (first !== undefined) {
      extras.fromStyle = first;
    }
  }
  // graph_inequality: the line style and the shaded side travel in parts[0]
  // (the wire's per-object slot; a single inequality is one part).
  const part = work.parts?.[0];
  if (part?.strict !== undefined) extras.strict = part.strict;
  const side = asSide(part?.side);
  if (side !== undefined) extras.side = side;

  const points = extras.noSolution ? [] : work.points;
  if (points.length === 0 && !extras.noSolution) return null;
  return Object.keys(extras).length > 0 ? [points, extras] : [points];
}

/** Narrow the kit's response to the work-only shape. `correct`, `scored`,
 * `earned`, `total`, and mistake fields are dropped HERE so no grading signal
 * can reach the viewer from the client side. */
function toSurfaceResponse(resp: GraphResponseData): GraphSurfaceResponse {
  // The kit reports a ray's single endpoint style as `fromStyle` and a
  // segment's pair as `endpoints`; the wire carries one ordered array for
  // both, matching the kit scorer's own `endpointStyles` parameter.
  const endpointStyles =
    resp.endpoints ?? (resp.fromStyle !== undefined ? [resp.fromStyle] : undefined);
  return {
    points: resp.studentPoints,
    answered: resp.answered,
    ...(resp.noSolution !== undefined ? { noSolution: resp.noSolution } : {}),
    ...(resp.strict !== undefined ? { strict: resp.strict } : {}),
    ...(resp.side !== undefined ? { side: resp.side } : {}),
    ...(resp.domain !== undefined ? { domain: resp.domain } : {}),
    ...(resp.shape !== undefined ? { shape: resp.shape } : {}),
    ...(endpointStyles !== undefined ? { endpointStyles } : {}),
    ...(resp.equation !== undefined ? { equation: resp.equation } : {}),
    ...(resp.dragged !== undefined ? { dragged: resp.dragged } : {}),
    // A system's parts, narrowed field by field: each part's `correct` (a
    // keyed board's per-part verdict) is dropped here like the rest.
    ...(resp.parts
      ? {
          parts: resp.parts.map((p) => ({
            points: p.points,
            strict: p.strict,
            ...(p.side !== undefined ? { side: p.side } : {}),
          })),
        }
      : resp.curveParts
        ? { parts: resp.curveParts.map((p) => ({ points: p.points })) }
        : {}),
  };
}


// ---- Number line ------------------------------------------------------------
// A number line is a 1-D graph, so it gets the same treatment. `points` here
// are line positions; the viewer stores them as [x, 0] pairs so ONE wire
// category carries every canvas block (check/wire.ts).

export interface NumberLineSurfaceResponse {
  values: number[];
  answered: boolean;
  interval?: NumberLineResponseData['interval'];
}

/** The kit's number-line config, minus the answer key. */
export type NumberLineSurfaceConfig = Omit<NumberLineQuestionConfig, 'answerKey'>;

export interface NumberLineSurfaceHandle {
  /** What the board shows now, narrowed like `onChange`. Read back by the
   * restore tests; the block itself learns of changes through `onChange`. */
  getResponse(): NumberLineSurfaceResponse;
  /** Put the saved work back: point positions, or an interval's bounds AND
   * their open/closed styles. Writes nothing to the store (quietRestorer). */
  restore(work: GraphWork): void;
  setLocked(locked: boolean): void;
  destroy(): void;
}

export interface NumberLineSurface {
  (
    mount: HTMLElement,
    config: NumberLineSurfaceConfig,
    hooks: { onChange?: (response: NumberLineSurfaceResponse) => void },
  ): Promise<NumberLineSurfaceHandle>;
}

let numberLineOverride: NumberLineSurface | null = null;

export function setNumberLineSurface(surface: NumberLineSurface | null): void {
  numberLineOverride = surface;
}

export function numberLineSurface(): NumberLineSurface {
  return numberLineOverride ?? kitNumberLineSurface;
}

const kitNumberLineSurface: NumberLineSurface = async (mount, config, hooks) => {
  const kit = await loadNumberLineQuestion();
  const quiet = quietRestorer();
  const handle = await kit.mountNumberLineQuestion(
    mount,
    {
      interactionType: config.interactionType,
      config: config.config,
      // No answerKey — ungraded input mode.
      questionShape: config.questionShape,
    },
    {
      onChange: (resp) => {
        if (!quiet.restoring) hooks.onChange?.(toNumberLineResponse(resp));
      },
    },
  );
  return {
    getResponse: () => toNumberLineResponse(handle.getResponse()),
    restore: (work) => {
      const args = toNumberLineRestore(work);
      if (args) quiet.run(() => handle.restore(...args));
    },
    setLocked: (locked) => handle.setLocked(locked),
    destroy: () => handle.destroy(),
  };
};

/** The kit's number-line report, minus `correct` and `scored`. */
function toNumberLineResponse(resp: NumberLineResponseData): NumberLineSurfaceResponse {
  return {
    values: resp.studentPoints ?? [],
    answered: resp.answered,
    ...(resp.interval ? { interval: resp.interval } : {}),
  };
}

type NumberLineRestoreArgs = Parameters<NumberLineQuestionHandle['restore']>;

/** Saved work → the number-line kit's restore arguments. An interval is stored
 * in `domain` with NO points (NumberLine.tsx), so keying the restore on points,
 * as the block did until 2026-11-26, never restored an interval at all. */
export function toNumberLineRestore(work: GraphWork): NumberLineRestoreArgs | null {
  const d = work.domain;
  if (d && (d.minX !== undefined || d.maxX !== undefined)) {
    return [
      [],
      {
        interval: {
          ...(d.minX !== undefined ? { min: d.minX } : {}),
          ...(d.minStyle !== undefined ? { minStyle: d.minStyle } : {}),
          ...(d.maxX !== undefined ? { max: d.maxX } : {}),
          ...(d.maxStyle !== undefined ? { maxStyle: d.maxStyle } : {}),
        },
      },
    ];
  }
  if (work.points.length === 0) return null;
  return [work.points.map(([v]) => v)];
}

// ---- Data plot --------------------------------------------------------------
// The one canvas block whose kit widget already took an optional key: its
// answer is COMPUTED from `data`, which the student must receive to plot at
// all (the registry's documented `derivableFromServed` residual). So no kit
// change was needed here — but the client's computed `correct` is still
// dropped below, because under Q2B the server's verdict is the only one that
// reaches a student.

export interface DataPlotSurfaceResponse {
  /** Shape depends on the chart: dot values, bin heights, or the five-number
   * summary. Carried through as points by the caller. */
  values: number[];
  answered: boolean;
}

/** The kit's data-plot config, minus the answer key (a box plot's tolerance,
 * a grading knob the server owns). */
export type DataPlotSurfaceConfig = Omit<DataPlotQuestionConfig, 'answerKey'>;

export interface DataPlotSurfaceHandle {
  /** What the board shows now, narrowed like `onChange` (restore tests). */
  getResponse(): DataPlotSurfaceResponse;
  restore(values: number[]): void;
  setLocked(locked: boolean): void;
  destroy(): void;
}

export interface DataPlotSurface {
  (
    mount: HTMLElement,
    config: DataPlotSurfaceConfig,
    hooks: { onChange?: (response: DataPlotSurfaceResponse) => void },
  ): Promise<DataPlotSurfaceHandle>;
}

let dataPlotOverride: DataPlotSurface | null = null;

export function setDataPlotSurface(surface: DataPlotSurface | null): void {
  dataPlotOverride = surface;
}

export function dataPlotSurface(): DataPlotSurface {
  return dataPlotOverride ?? kitDataPlotSurface;
}

const kitDataPlotSurface: DataPlotSurface = async (mount, config, hooks) => {
  const kit = await loadDataPlotQuestion();
  const quiet = quietRestorer();
  const handle = await kit.mountDataPlotQuestion(
    mount,
    {
      interactionType: config.interactionType,
      data: config.data,
      config: config.config,
      // No answerKey: boxplot's tolerance is the only authored field and it is
      // a grading knob, so the server owns it.
    },
    {
      onChange: (resp) => {
        if (!quiet.restoring) {
          hooks.onChange?.({ values: readPlotValues(resp), answered: resp.answered });
        }
      },
    },
  );
  return {
    getResponse: () => {
      const resp = handle.getResponse();
      return { values: readPlotValues(resp), answered: resp.answered };
    },
    restore: (values) =>
      quiet.run(() => handle.restore(toPlotRestore(config.interactionType, values))),
    setLocked: (locked) => handle.setLocked(locked),
    destroy: () => handle.destroy(),
  };
};

/** The order a box plot's five handles travel in on the wire: the grader reads
 * them back by position (server/grading/graphs.ts, `build_boxplot`). */
const FIVE_ORDER = ['min', 'q1', 'median', 'q3', 'max'] as const;

/** Flatten whichever payload the chart reports into a plain number list.
 * `correct` is deliberately not among the fields read.
 *
 * Typed against the kit's own response (2026-11-26). It used to take a
 * `Record<string, unknown>` behind a cast and read all three fields as arrays,
 * but the box plot reports an OBJECT ({min,q1,median,q3,max}), so a box-plot
 * answer was stored as [] and the grader called every one unanswered. */
function readPlotValues(resp: DataPlotResponseData): number[] {
  if (resp.studentValues) return [...resp.studentValues];
  if (resp.studentBins) return [...resp.studentBins];
  if (resp.studentFive) {
    const five = resp.studentFive;
    return FIVE_ORDER.map((k) => five[k]);
  }
  return [];
}

/** The inverse, for a reload: the stored number list back into the one field
 * the kit restores from for this chart. A box plot with fewer than five stored
 * values has nothing to restore. */
function toPlotRestore(
  interactionType: DataPlotSurfaceConfig['interactionType'],
  values: number[],
): Parameters<DataPlotQuestionHandle['restore']>[0] {
  if (interactionType === 'build_histogram') return { studentBins: values };
  if (interactionType === 'build_boxplot') {
    const [min, q1, median, q3, max] = values;
    if (
      min === undefined ||
      q1 === undefined ||
      median === undefined ||
      q3 === undefined ||
      max === undefined
    ) {
      return {};
    }
    return { studentFive: { min, q1, median, q3, max } };
  }
  return { studentValues: values };
}


// ---- Math prompts (Model A gaps) --------------------------------------------
// The heaviest lazy chunk: MathLive. A math_block with no gaps is static
// content that KaTeX already renders, so this seam is reached ONLY by a
// gap-bearing block — which is why math_block is a lazy binding and why
// CLAUDE.md's rule that MathLive never joins the base page weight still holds.

export interface MathPromptsSurfaceHandle {
  destroy(): void;
}

export interface MathPromptsSurface {
  (
    host: HTMLElement,
    opts: MathPromptMountOptions,
  ): Promise<MathPromptsSurfaceHandle>;
}

let mathPromptsOverride: MathPromptsSurface | null = null;

export function setMathPromptsSurface(surface: MathPromptsSurface | null): void {
  mathPromptsOverride = surface;
}

export function mathPromptsSurface(): MathPromptsSurface {
  return mathPromptsOverride ?? kitMathPromptsSurface;
}

const kitMathPromptsSurface: MathPromptsSurface = async (host, opts) => {
  const kit = await loadMathPromptMount();
  const mounted = kit.mountMathPrompts(host, opts);
  return { destroy: () => mounted.destroy() };
};


// ---- The calculator tool (the floating scaffold, not a block) ---------------
// The fifth seam, and the first that is NOT a block: the calculator is an
// activity-level scaffold a student SUMMONS. Same three decisions as the four
// above — lazy import, narrowed surface, injectable for tests — which is why it
// lives here rather than growing its own file.
//
// Two things make the injectability load-bearing rather than tidy. The mount
// pulls MathLive AND (in graphing mode) JSXGraph — ~515 KiB gz on first click,
// so the PENDING state is a normal path, not an edge case; and the failed load
// (offline, or a chunk 404 after a deploy) is a designed state the cluster has
// to recover from. Neither is reachable in jsdom against the real kit, and both
// are exactly what a fake surface can drive.
//
// The config is the teacher's `CalculatorTool['restrictions']` verbatim. It
// carries no answer key and no scoring: the calculator is ungraded scaffold by
// design (a `scaffold` category, never a `question`), so unlike the four seams
// above there is nothing here to narrow AWAY.

export interface CalculatorSurfaceHandle {
  readonly isOpen: boolean;
  open(): void;
  /** Put the tool away WITHOUT tearing down the student's expressions (C15). */
  close(): void;
  toggle(): void;
  /** Tear down for real — activity unmount only. */
  destroy(): void;
}

export interface CalculatorSurface {
  (
    mount: HTMLElement,
    restrictions: CalculatorConfig | undefined,
    hooks: MountHooks,
  ): Promise<CalculatorSurfaceHandle>;
}

let calculatorOverride: CalculatorSurface | null = null;

export function setCalculatorSurface(surface: CalculatorSurface | null): void {
  calculatorOverride = surface;
}

export function calculatorSurface(): CalculatorSurface {
  return calculatorOverride ?? kitCalculatorSurface;
}

const kitCalculatorSurface: CalculatorSurface = async (mount, restrictions, hooks) => {
  // The calculator module itself, not the barrel's async wrapper around it:
  // one boundary instead of two (barrel, then calculator), and the barrel's
  // own static imports stay off this path too. Its mount is synchronous.
  const kit = await loadCalculator();
  return kit.mountCalculator(mount, restrictions, hooks);
};
