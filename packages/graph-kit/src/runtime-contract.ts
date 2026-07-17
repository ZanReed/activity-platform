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
 * One boundary of a graph_inequality SYSTEM (inequalities.length > 1): the
 * student's plotted boundary points + their side/style choice, plus whether
 * that boundary matches at least one authored inequality (a per-boundary signal
 * the dashboard can show; the block's OVERALL correctness is the order-
 * independent set-match, not the AND of these). Mirrors the wire's per-part
 * InequalityResponse minus its `type` tag (added at emit).
 */
export interface GraphInequalityPart {
  points: [number, number][];
  strict: boolean;
  side: 'above' | 'below' | 'left' | 'right';
  correct: boolean;
}

/**
 * One curve of a plot_function SYSTEM (models.length > 1, "graph both lines"):
 * the student's plotted points defining that curve, plus whether the curve
 * matches at least one authored model (a per-curve dashboard signal; the block's
 * OVERALL correctness is the order-independent set-match). The functions-system
 * analogue of GraphInequalityPart — no side/style (a curve, not a boundary).
 */
export interface GraphCurvePart {
  points: [number, number][];
  correct: boolean;
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
   * graph_inequality SYSTEM (inequalities.length > 1): one entry per authored
   * boundary the student plotted — the N-boundary answer the single `points`/
   * `strict`/`side` fields above cannot hold. Present ONLY for a system; a
   * single-inequality block (N=1) leaves this undefined and keeps using
   * points/strict/side, so N=1 state + emit + scoring stay byte-identical to
   * today. Additive optional field — an older stored blob simply lacks it.
   */
  parts?: GraphInequalityPart[];
  /**
   * plot_function SYSTEM (models.length > 1): one entry per curve the student
   * plotted — the N-curve answer the single `points` field cannot hold. Present
   * ONLY for a functions-system; a single curve (N=1) keeps using `points`, so
   * N=1 state + emit + scoring stay byte-identical to today. Additive optional.
   */
  curveParts?: GraphCurvePart[];
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

// =============================================================================
// Number-line block (number_line) — the 1-D sibling of the graph contract
// -----------------------------------------------------------------------------
// The number_line block rides the SAME lazy kit as the graph feature (one
// bundle, one fetch), so its bridge↔kit contract lives here too. The shapes
// mirror the graph ones but are deliberately LEANER (decision 6, all-or-
// nothing): no mistake feedback, no partial credit, no domain/shape variants.
// The runtime persists NumberLineBlockState in its localStorage blob, so the
// same additive discipline applies (widening it incompatibly means bumping
// STORAGE_SCHEMA_VERSION in runtime/storage.ts).
// =============================================================================

/** A student's plotted interval/ray: present bounds carry a style; an absent
 *  bound is unbounded that direction (a ray). Mirrors the schema's answer key. */
export interface NumberLineInterval {
  min?: number;
  minStyle?: 'open' | 'closed';
  max?: number;
  maxStyle?: 'open' | 'closed';
}

/**
 * Per-number_line-block state. Lives in the runtime's RuntimeState (and its
 * persisted blob); written by the kit-side plumbing as the student answers;
 * read by the runtime's inline scoring fold and submit gather (which stay in
 * the bridge so a kit that fails to load never breaks scoring/submission of
 * restored answers).
 */
export interface NumberLineBlockState {
  /**
   * plot_point: the student's plotted position(s) in line units — one per
   * answer handle (usually one; "plot both" has more). Empty before they've
   * touched the widget. Persisted so a reload restores the plotted answer.
   */
  studentPoints: number[];
  /**
   * plot_interval: the student's interval/ray (bounds + open/closed styles).
   * Absent on plot_point blocks and before the student touches an interval
   * widget. Persisted so a reload restores the interval + endpoint choices.
   */
  interval?: NumberLineInterval;
  /** True once the student has moved a handle or cycled an endpoint pill. */
  answered: boolean;
  /**
   * Scoring result: true correct, false incorrect, null unscored. Null until
   * the student answers — an untouched line is an omission (counts in the
   * section total, not the correct count), exactly like an empty blank.
   */
  result: boolean | null;
  /** Whether this block's solution slot has been revealed (post-check). */
  solutionRevealed: boolean;
  /** Student's per-block confidence selection (null until picked). */
  confidence: GraphConfidence | null;
}

/**
 * One graded number_line block, as the bridge's cheap init walk found it.
 * Minimal by design: the kit parses config + answer key from `el`'s data
 * attributes itself.
 */
export interface NumberLineRuntimeBlockRef {
  /** The block root (`[data-block-type="number_line"]`) — data-* attrs live here. */
  el: HTMLElement;
  /** The .number-line-canvas the kit mounts the board into. */
  canvas: HTMLElement;
  /** ID of the section the block belongs to (keys state.sections). */
  sectionId: string;
  /** The block's interaction discriminant ('plot_point' | 'plot_interval'). */
  interactionType: string;
}

/**
 * The slice of the runtime's live state the number-line plumbing sees — the
 * SAME object the runtime renders and persists from. The kit mutates
 * state.numberLines[id] on widget changes, then calls ctx.onUpdate().
 */
export interface NumberLineRuntimeStateView {
  sections: Record<string, GraphSectionStateView>;
  numberLines: Record<string, NumberLineBlockState>;
}

/** Everything attachNumberLineRuntime needs from the inline bridge. */
export interface NumberLineRuntimeContext {
  /** The runtime's LIVE state (structural view). */
  state: NumberLineRuntimeStateView;
  /** Graded number-line blocks by block id. */
  blocks: ReadonlyMap<string, NumberLineRuntimeBlockRef>;
  /** render + persist. Call after ANY mutation of state.numberLines. */
  onUpdate(): void;
}

/**
 * What attachNumberLineRuntime hands back. The bridge stores it and delegates
 * its seam's renderNumberLines to render() on every runtime render tick.
 */
export interface NumberLineRuntimeExt {
  /**
   * Reflect state.numberLines + section checked/locked into every number-line
   * block's chrome (feedback line, solution slot, confidence radios) and widget
   * lock. Idempotent; called on every runtime render.
   */
  render(): void;
}

// =============================================================================
// Data-plot block (data_plot) — the statistics sibling of the graph contract
// -----------------------------------------------------------------------------
// The GRADED data_plot (build_dotplot) rides the SAME lazy kit as the graph
// feature, so its bridge↔kit contract lives here too. Even leaner than the
// number-line contract: one interaction (build_dotplot), all-or-nothing, no
// interval/endpoint state. (display data_plots are ungraded static SVG rendered
// entirely by the renderer — they never reach the kit runtime, so there is no
// display ref here, unlike the graph contract.) The runtime persists
// DataPlotBlockState in its blob, so the same additive discipline applies (a
// wider shape means bumping STORAGE_SCHEMA_VERSION in runtime/storage.ts).
// =============================================================================

/**
 * Per-graded-data_plot-block state. Lives in the runtime's RuntimeState (and its
 * persisted blob); written by the kit-side plumbing as the student builds the
 * plot; read by the runtime's inline scoring fold and submit gather (which stay
 * in the bridge so a kit that fails to load never breaks scoring/submission of
 * restored answers).
 */
export interface DataPlotBlockState {
  /**
   * build_dotplot: the student's plotted dot values (a multiset — one entry per
   * dot). Empty before they've touched the widget. Persisted so a reload
   * restores the built plot (the kit plumbing calls the widget's restore()).
   */
  studentValues: number[];
  /**
   * build_histogram: the student's per-bin frequencies, in bin order. Additive
   * optional field (an older blob simply lacks it — no STORAGE_SCHEMA_VERSION
   * bump). Present only on histogram blocks the student has touched.
   */
  studentBins?: number[];
  /**
   * build_boxplot: the student's placed five-number summary. Additive optional
   * field, same discipline as studentBins. Present only on box-plot blocks the
   * student has touched.
   */
  studentFive?: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  /** True once the student has interacted with the widget at least once. */
  answered: boolean;
  /**
   * Scoring result: true correct, false incorrect, null unscored. Null until
   * the student answers — an untouched plot is an omission (counts in the
   * section total, not the correct count), exactly like an empty blank.
   */
  result: boolean | null;
  /** Whether this block's solution slot has been revealed (post-check). */
  solutionRevealed: boolean;
  /** Student's per-block confidence selection (null until picked). */
  confidence: GraphConfidence | null;
}

/**
 * One graded data_plot block, as the bridge's cheap init walk found it. Minimal
 * by design: the kit parses config + the dataset (the answer source) from `el`'s
 * data attributes itself.
 */
export interface DataPlotRuntimeBlockRef {
  /** The block root (`[data-block-type="data_plot"]`) — data-* attrs live here. */
  el: HTMLElement;
  /** The .data-plot-canvas the kit mounts the board into. */
  canvas: HTMLElement;
  /** ID of the section the block belongs to (keys state.sections). */
  sectionId: string;
  /** The block's interaction discriminant ('build_dotplot'). */
  interactionType: string;
}

/**
 * The slice of the runtime's live state the data-plot plumbing sees — the SAME
 * object the runtime renders and persists from. The kit mutates
 * state.dataPlots[id] on widget changes, then calls ctx.onUpdate().
 */
export interface DataPlotRuntimeStateView {
  sections: Record<string, GraphSectionStateView>;
  dataPlots: Record<string, DataPlotBlockState>;
}

/** Everything attachDataPlotRuntime needs from the inline bridge. */
export interface DataPlotRuntimeContext {
  /** The runtime's LIVE state (structural view). */
  state: DataPlotRuntimeStateView;
  /** Graded data-plot blocks by block id. */
  blocks: ReadonlyMap<string, DataPlotRuntimeBlockRef>;
  /** render + persist. Call after ANY mutation of state.dataPlots. */
  onUpdate(): void;
}

/**
 * What attachDataPlotRuntime hands back. The bridge stores it and delegates its
 * seam's renderDataPlots to render() on every runtime render tick.
 */
export interface DataPlotRuntimeExt {
  /**
   * Reflect state.dataPlots + section checked/locked into every data-plot
   * block's chrome (feedback line, solution slot, confidence radios) and widget
   * lock. Idempotent; called on every runtime render.
   */
  render(): void;
}
