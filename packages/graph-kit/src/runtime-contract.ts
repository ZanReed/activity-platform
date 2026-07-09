// =============================================================================
// runtime-contract.ts — the bridge↔kit contract for published-page graph blocks
// -----------------------------------------------------------------------------
// TYPES ONLY. This file is the single source of truth for the shapes shared
// between two separately-delivered bundles:
//
//   - the published page's INLINE runtime bridge (packages/renderer/src/
//     runtime/graph-integration.ts), which imports these with `import type`
//     (erased at build — the inlined runtime gains zero bytes and no runtime
//     dependency on the kit), and
//   - the kit-side plumbing (./runtime.ts, attachGraphRuntime), which the
//     bridge dynamic-imports from R2 and hands control of the graph blocks.
//
// Because BOTH sides import the same declarations, drift between the bridge
// and the kit is a compile error, not a silent runtime gap — the same
// discipline the old graph-integration.ts/.noop.ts pair used within one
// package, now enforced across the package boundary.
//
// Versioning: published pages pin a content-hashed kit URL at publish time, so
// a page's inline bridge and its kit always ship as a matched pair — there is
// no cross-version skew to design for. Changes here still follow the additive
// discipline (like the wire format), because GraphBlockState is persisted in
// the runtime's localStorage blob: widening it incompatibly means bumping
// STORAGE_SCHEMA_VERSION in the runtime (see runtime/storage.ts).
//
// No imports, no values — this module must stay erasable.
// =============================================================================

/** Per-block confidence selection (mirrors the runtime's other block states). */
export type GraphConfidence = 'unsure' | 'think_so' | 'certain';

/** Domain-restricted plot_function: endpoint positions + open/closed styles. */
export interface GraphDomainAnswer {
  minX?: number;
  minStyle?: 'open' | 'closed';
  maxX?: number;
  maxStyle?: 'open' | 'closed';
}

/**
 * Per-interactive-graph-block state. Lives in the runtime's RuntimeState (and
 * its persisted localStorage blob — see the versioning note above); written by
 * the kit-side plumbing as the student answers; read by the runtime's inline
 * scoring fold and submit gather, which stay in the bridge so a kit that fails
 * to load never breaks scoring or submission of restored answers.
 */
export interface GraphBlockState {
  /**
   * The student's plotted point(s) in graph units — one per answer handle
   * (usually one; a "plot both roots" question has more). Empty before they've
   * touched the widget. Persisted so a reload restores the plotted answer
   * (the kit plumbing calls the widget's restore() with it).
   */
  points: [number, number][];
  /** True once the student has moved a handle (drag or keyboard) at least once. */
  answered: boolean;
  /**
   * Scoring result: true correct, false incorrect, null unscored. Null until
   * the student answers — an untouched graph is an omission (counts in the
   * section total, not the correct count), exactly like an empty blank.
   */
  result: boolean | null;
  /** Whether this block's solution slot has been revealed (post-check). */
  solutionRevealed: boolean;
  /** Student's per-block confidence selection (null until picked). */
  confidence: GraphConfidence | null;
  /** graph_inequality: dotted (strict) vs solid boundary choice. */
  strict?: boolean;
  /** graph_inequality: which side the student shaded. */
  side?: 'above' | 'below' | 'left' | 'right';
  /** The student chose "cannot be graphed / no solution". */
  noSolution?: boolean;
  /** Partial credit: parts earned / parts total (partialCredit blocks only). */
  earned?: number;
  total?: number;
  /** Domain-restricted plot_function: endpoint positions + open/closed. */
  domain?: GraphDomainAnswer;
  /** plot_ray / plot_segment: the student's chosen shape. */
  shape?: 'ray_positive' | 'ray_negative' | 'segment';
  /** plot_ray: the drawn endpoint's style choice. */
  fromStyle?: 'open' | 'closed';
  /** plot_segment: per-endpoint style choices, canonical order. */
  endpoints?: ['open' | 'closed', 'open' | 'closed'];
  /**
   * Mistake feedback for a WRONG answer: the matched authored entry's template
   * index, or a built-in classifier's message text. At most one is set; both
   * absent on correct/unanswered graphs. Additive optional fields — an older
   * stored blob simply lacks them, which reads as "no targeted feedback".
   */
  mistakeIndex?: number;
  mistakeText?: string;
}

/**
 * The slice of a section's state the kit plumbing reads. The bridge passes the
 * runtime's full SectionState objects; these are the only fields the kit may
 * touch (checked gates the verdict reveal, locked freezes the widget).
 */
export interface GraphSectionStateView {
  checked: boolean;
  locked: boolean;
}

/**
 * The slice of the runtime's live state object the kit plumbing sees. This is
 * the SAME object the runtime renders and persists from (not a copy): the kit
 * mutates state.graphs[id] on widget changes, then calls ctx.onUpdate() so the
 * runtime re-renders and persists — the runtime's "every handler writes state,
 * then calls onUpdate" rule, followed from the kit side.
 */
export interface GraphRuntimeStateView {
  sections: Record<string, GraphSectionStateView>;
  graphs: Record<string, GraphBlockState>;
}

/**
 * One graded interactive_graph block, as the bridge's cheap init walk found it.
 * Deliberately minimal: everything else (config, answer key, mistake templates,
 * feedback/solution elements) the kit parses from `el`'s data attributes and
 * children itself — those bytes belong in the kit, not the inlined runtime.
 */
export interface GraphRuntimeBlockRef {
  /** The block root (`[data-block-type="interactive_graph"]`) — data-* attrs live here. */
  el: HTMLElement;
  /** The .graph-canvas the kit mounts the board into. */
  canvas: HTMLElement;
  /** ID of the section the block belongs to (keys state.sections). */
  sectionId: string;
  /** The block's interaction discriminant (e.g. 'plot_point'). */
  interactionType: string;
}

/** One DISPLAY (static, ungraded) graph block — mounted read-only, never scored. */
export interface GraphRuntimeDisplayRef {
  /** The block root — the kit parses config/drawables from its data attributes. */
  el: HTMLElement;
  /** The .graph-canvas the kit draws the static figure into. */
  canvas: HTMLElement;
}

/** Everything attachGraphRuntime needs from the inline bridge. */
export interface GraphRuntimeContext {
  /** The runtime's LIVE state (structural view — see GraphRuntimeStateView). */
  state: GraphRuntimeStateView;
  /** Graded graph blocks by block id. */
  blocks: ReadonlyMap<string, GraphRuntimeBlockRef>;
  /** Static display blocks (no state, no scoring — just figures to draw). */
  displays: readonly GraphRuntimeDisplayRef[];
  /** render + persist. Call after ANY mutation of state.graphs. */
  onUpdate(): void;
}

/**
 * What attachGraphRuntime hands back. The bridge stores it and delegates its
 * seam's renderGraphs to render() on every runtime render tick.
 */
export interface GraphRuntimeExt {
  /**
   * Reflect state.graphs + section checked/locked into every graph block's
   * chrome (feedback line, solution slot, confidence radios) and widget lock.
   * Idempotent; called on every runtime render.
   */
  render(): void;
}
