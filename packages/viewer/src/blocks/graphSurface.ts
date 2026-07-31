// =============================================================================
// blocks/graphSurface.ts — the lazy graph-kit seam (S3 V9)
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
// The config deliberately carries NO answer key: this seam only ever mounts
// the kit's ungraded input mode (author ruling A, 2026-07-31). `questionShape`
// comes from the served block, derived and whitelisted by the sanitizer.
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
}): GraphSurfaceResponse {
  return {
    points: resp.studentPoints,
    answered: resp.answered,
    ...(resp.noSolution !== undefined ? { noSolution: resp.noSolution } : {}),
    ...(resp.strict !== undefined ? { strict: resp.strict } : {}),
    ...(resp.side !== undefined ? { side: resp.side } : {}),
    ...(resp.domain !== undefined ? { domain: resp.domain } : {}),
  };
}
