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

/** What the student built, as the kit reports it. Mirrors the kit's
 * GraphResponseData minus everything grading-related — in ungraded mode the
 * kit reports `scored: false` and a meaningless `correct`, and this seam does
 * not re-export either, so a verdict cannot enter the viewer from here. */
export interface GraphSurfaceResponse {
  points: [number, number][];
  answered: boolean;
  noSolution?: boolean;
  strict?: boolean;
  side?: string;
  domain?: {
    minX?: number;
    minStyle?: 'open' | 'closed';
    maxX?: number;
    maxStyle?: 'open' | 'closed';
  };
  /** plot_ray / plot_segment: the chosen shape and the endpoint open/closed
   * choices. These are ANSWER CONTENT ("2 ≤ x < 7" ≠ "2 < x < 7"), not
   * presentation — they were being dropped here, which left the two
   * linear-piece interactions ungradable server-side. Work-only still holds:
   * a shape is what the student drew, not whether it was right. */
  shape?: 'ray_positive' | 'ray_negative' | 'segment';
  endpointStyles?: Array<'open' | 'closed'>;
}

export interface GraphSurfaceConfig {
  interactionType: string;
  axisConfig: unknown;
  questionShape?: {
    handleCount?: number;
    family?: string;
    vertexCount?: number;
  };
  allowNoSolution?: boolean;
}

export interface GraphSurfaceHandle {
  getResponse(): GraphSurfaceResponse;
  restore(points: [number, number][]): void;
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
  // The chunk boundary (P1A / D16).
  const kit = await import('@activity/graph-kit');
  const handle = await kit.mountGraphQuestion(
    mount,
    {
      interactionType: config.interactionType,
      axisConfig: config.axisConfig,
      // No answerKey — ungraded input mode. The server grades.
      questionShape: config.questionShape,
      allowNoSolution: config.allowNoSolution,
    },
    {
      onChange: (resp) => hooks.onChange?.(toSurfaceResponse(resp)),
    },
  );
  return {
    getResponse: () => toSurfaceResponse(handle.getResponse()),
    restore: (points) => handle.restore(points),
    setLocked: (locked) => handle.setLocked(locked),
    destroy: () => handle.destroy(),
  };
};

/** Narrow the kit's response to the work-only shape. `correct`, `scored`,
 * `earned`, `total`, and mistake fields are dropped HERE so no grading signal
 * can reach the viewer from the client side. */
function toSurfaceResponse(resp: {
  studentPoints: [number, number][];
  answered: boolean;
  noSolution?: boolean;
  strict?: boolean;
  side?: string;
  domain?: GraphSurfaceResponse['domain'];
  shape?: 'ray_positive' | 'ray_negative' | 'segment';
  fromStyle?: 'open' | 'closed';
  endpoints?: ['open' | 'closed', 'open' | 'closed'];
}): GraphSurfaceResponse {
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
  };
}


// ---- Number line ------------------------------------------------------------
// A number line is a 1-D graph, so it gets the same treatment. `points` here
// are line positions; the viewer stores them as [x, 0] pairs so ONE wire
// category carries every canvas block (check/wire.ts).

export interface NumberLineSurfaceResponse {
  values: number[];
  answered: boolean;
  interval?: {
    min?: number;
    minStyle?: 'open' | 'closed';
    max?: number;
    maxStyle?: 'open' | 'closed';
  };
}

export interface NumberLineSurfaceConfig {
  interactionType: string;
  config: unknown;
  questionShape?: { handleCount?: number };
}

export interface NumberLineSurfaceHandle {
  restore(values: number[]): void;
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
  const kit = await import('@activity/graph-kit');
  const handle = await kit.mountNumberLineQuestion(
    mount,
    {
      interactionType: config.interactionType,
      config: config.config,
      // No answerKey — ungraded input mode.
      questionShape: config.questionShape,
    },
    {
      onChange: (resp) =>
        hooks.onChange?.({
          values: resp.studentPoints ?? [],
          answered: resp.answered,
          ...(resp.interval ? { interval: resp.interval } : {}),
        }),
    },
  );
  return {
    restore: (values) => handle.restore(values),
    destroy: () => handle.destroy(),
  };
};

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

export interface DataPlotSurfaceConfig {
  interactionType: string;
  data: number[];
  config: unknown;
}

export interface DataPlotSurfaceHandle {
  restore(values: number[]): void;
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
  const kit = await import('@activity/graph-kit');
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
      onChange: (resp) =>
        hooks.onChange?.({
          values: readPlotValues(resp as unknown as Record<string, unknown>),
          answered: resp.answered,
        }),
    },
  );
  return {
    restore: (values) => handle.restore(values as never),
    destroy: () => handle.destroy(),
  };
};

/** Flatten whichever payload the chart reports into a plain number list —
 * `correct` is deliberately not among the fields read. */
function readPlotValues(resp: Record<string, unknown>): number[] {
  for (const field of ['studentValues', 'studentBins', 'studentFive']) {
    const value = resp[field];
    if (Array.isArray(value)) {
      return value.filter((n): n is number => typeof n === 'number');
    }
  }
  return [];
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
    opts: {
      latex: string;
      initialValues: Record<string, string>;
      onValue: (promptId: string, ascii: string) => void;
    },
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
  const kit = await import('@activity/graph-kit');
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
    restrictions: unknown,
    hooks: { onToggle?: (open: boolean) => void; floating?: boolean },
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
  const kit = await import('@activity/graph-kit');
  // The kit's own mountCalculator is already async (it splits MathLive into a
  // second chunk behind the entry), so this awaits two boundaries, not one.
  return kit.mountCalculator(mount, restrictions, hooks);
};
