// =============================================================================
// runtime/graph-integration.ts — the interactive-graph BRIDGE (thin inline half)
// -----------------------------------------------------------------------------
// Every graph branch in the base runtime still goes through the `graphExt`
// seam exported here — init, state, render, checkpoints, submission never
// contain graph logic themselves. But since the 2026-07-10 bundle-budget move,
// this module is only the THIN half: the DOM-heavy plumbing (attribute
// parsing, block-chrome rendering, widget mounting, display figures) lives in
// the lazy graph kit (@activity/graph-kit src/runtime.ts, attachGraphRuntime),
// which graph pages fetch from R2 at bootstrap anyway. A new graph runtime
// feature therefore adds bytes to the CACHED kit — not to this bridge, and
// never to the inlined runtime every page pays for.
//
// What stays inline, and why — exactly the pieces that must survive the kit
// FAILING to load (offline, blocked CDN):
//   - the cheap init walk (ids, canvas, kit URL, section, interaction type),
//     so section totals count graph blocks;
//   - state seeding + (via state.ts types) the storage round-trip, so a
//     restored answer isn't lost;
//   - the scoring fold + submit gather (pure state → JSON), so restored
//     answers still score and submit.
// Without the kit the student loses only the visuals: the board and its
// chrome. The block still counts as an omission if unanswered, and a restored
// answer still scores.
//
// The bridge↔kit contract is typed by @activity/graph-kit/runtime-contract,
// which BOTH sides import — this side with `import type` (erased at build:
// zero bytes, no runtime dependency; the kit arrives via dynamic import of the
// page's pinned, content-hashed kit URL, so bridge and kit always ship as a
// matched pair). Drift is a compile error, the same lockstep discipline the
// graph-integration.noop.ts stub uses for the seam itself.
//
// Two build variants still apply (scripts/bundle-renderer.mjs): the base build
// swaps this module for graph-integration.noop.ts, so non-graph pages ship
// zero graph bytes — including zero bridge bytes.
// =============================================================================

import { $$ } from './dom.js';
import type {
  Refs,
  GraphRef,
  GraphDisplayRef,
  NumberLineRef,
  DataPlotRef,
  SectionRef,
} from './refs.js';
import type {
  RuntimeState,
  GraphBlockState,
  NumberLineBlockState,
  DataPlotBlockState,
} from './state.js';
import type {
  GraphResult,
  NumberLineResult,
  DataPlotResult,
} from './submission.js';
import type {
  GraphRuntimeBlockRef,
  GraphRuntimeContext,
  GraphRuntimeDisplayRef,
  GraphRuntimeExt,
  NumberLineRuntimeBlockRef,
  NumberLineRuntimeContext,
  NumberLineRuntimeExt,
  DataPlotRuntimeBlockRef,
  DataPlotRuntimeContext,
  DataPlotRuntimeExt,
} from '@activity/graph-kit/runtime-contract';

// ---- The seam contract ------------------------------------------------------
// One method per integration point in the base runtime. `graph-integration.
// noop.ts` implements this same interface with no-ops for the base build.
export interface GraphExt {
  /**
   * init.ts: walk one section's interactive_graph blocks, populating the two
   * refs maps (graded → `graphs`, display → `graphDisplays`). Returns the
   * section's graded-graph block ids (for SectionRef.graphBlockIds).
   */
  walkGraphBlocks(
    sectionEl: HTMLElement,
    sectionId: string,
    graphs: Map<string, GraphRef>,
    graphDisplays: Map<string, GraphDisplayRef>,
  ): string[];
  /** state.ts: build the initial per-graph-block state map from refs. */
  initGraphState(refs: Refs): Record<string, GraphBlockState>;
  /**
   * render.ts: reflect graph-block state into chrome. Delegates to the kit's
   * attached plumbing; a no-op until the kit lands (the chrome then paints in
   * the same beat the board does).
   */
  renderGraphs(state: RuntimeState, refs: Refs): void;
  /**
   * checkpoints.ts: the section's graph contribution to the score — how many
   * graphs are correct and how many count toward the total (each graph is one
   * scorable unit; an unanswered one is an omission, counted in total only).
   */
  scoreSectionGraphs(
    sectionRef: SectionRef,
    state: RuntimeState,
  ): { correct: number; total: number };
  /** checkpoints.ts: reveal solution slots for the section's graphs post-check. */
  revealGraphSolutions(
    sectionRef: SectionRef,
    refs: Refs,
    state: RuntimeState,
  ): void;
  /**
   * submission.ts: gather graph responses for the payload plus their score
   * contribution (correct + scored counts, folded into the overall fraction).
   */
  gatherGraphResponses(
    state: RuntimeState,
    refs: Refs,
  ): {
    graphResponses?: Record<string, GraphResult>;
    correct: number;
    scored: number;
  };
  /**
   * index.ts: fetch the lazy kit once and hand it the page's graph blocks —
   * graded widgets AND static display figures (one attach covers both).
   */
  wireGraphs(state: RuntimeState, refs: Refs, onUpdate: () => void): void;
}

function warn(message: string): void {
  if (typeof console !== 'undefined') {
    console.warn('[activity-runtime graph] ' + message);
  }
}

// ---- init: DOM → slim refs ---------------------------------------------------

/**
 * Build the slim GraphRef for one graded interactive_graph block — only the
 * fields the INLINE runtime consumes (scoring totals, submit gather, the
 * confidence wiring in confidence.ts, and the kit hand-off). Everything else
 * (config, answer key, mistakes, chrome elements) the kit parses from `el`
 * itself. The caller (walkGraphBlocks) already verified id + canvas.
 */
function buildGraphRef(
  el: HTMLElement,
  canvas: HTMLElement,
  sectionId: string,
): GraphRef {
  const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
    '.js-confidence-rating',
  );
  const confidenceRadios: HTMLInputElement[] = confidenceFieldset
    ? Array.prototype.slice.call(
        confidenceFieldset.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]',
        ),
      )
    : [];

  return {
    el,
    canvas,
    kitSrc: el.dataset.graphKitSrc ?? null,
    interactionType: el.dataset.graphInteractionType ?? 'plot_point',
    hasConfidenceRating: el.dataset.hasConfidenceRating === 'true',
    confidenceRadios,
    sectionId,
  };
}

function walkGraphBlocks(
  sectionEl: HTMLElement,
  sectionId: string,
  graphs: Map<string, GraphRef>,
  graphDisplays: Map<string, GraphDisplayRef>,
): string[] {
  const sectionGraphBlockIds: string[] = [];
  for (const graphEl of $$<HTMLElement>(
    '[data-block-type="interactive_graph"]',
    sectionEl,
  )) {
    const blockId = graphEl.dataset.graphBlockId;
    if (!blockId) {
      warn('Interactive-graph block is missing data-graph-block-id; skipping.');
      continue;
    }
    const canvas = graphEl.querySelector<HTMLElement>('.graph-canvas');
    if (!canvas) {
      warn('Graph block ' + blockId + ' has no .graph-canvas; skipping.');
      continue;
    }
    // Display (static) graphs are ungraded: the kit mounts a read-only figure,
    // but they stay OUT of the scored graphs map and out of graphBlockIds so
    // they never count toward a section's score or the submit payload.
    if (graphEl.dataset.graphInteractionType === 'display') {
      graphDisplays.set(blockId, {
        el: graphEl,
        canvas,
        kitSrc: graphEl.dataset.graphKitSrc ?? null,
      });
      continue;
    }
    graphs.set(blockId, buildGraphRef(graphEl, canvas, sectionId));
    sectionGraphBlockIds.push(blockId);
  }
  return sectionGraphBlockIds;
}

// ---- state: initial per-block state ----------------------------------------

function initGraphState(refs: Refs): Record<string, GraphBlockState> {
  const graphs: Record<string, GraphBlockState> = {};
  for (const [id] of refs.graphs) {
    graphs[id] = {
      points: [],
      answered: false,
      result: null,
      solutionRevealed: false,
      confidence: null,
    };
  }
  return graphs;
}

// ---- render: delegate to the attached kit plumbing ---------------------------

// The kit's render delegate, installed when attachGraphRuntime resolves. Null
// until then (and forever if the kit fails to load) — renderGraphs no-ops and
// the static no-JS placeholders stay in place.
let installed: GraphRuntimeExt | null = null;

function renderGraphs(): void {
  if (installed) installed.render();
}

// ---- checkpoints: scoring + solution reveal ---------------------------------

// Each graph is one scorable unit. The kit computed correctness live
// (state.graphs[id].result) as the student answered; an unanswered graph is
// null → an omission, counted in total but not in correct, like an empty
// blank. Pure state math — works with or without the kit.
function scoreSectionGraphs(
  sectionRef: SectionRef,
  state: RuntimeState,
): { correct: number; total: number } {
  let correct = 0;
  for (const graphId of sectionRef.graphBlockIds) {
    const gs = state.graphs[graphId];
    if (!gs) continue;
    // Partial credit: an answered graph contributes its earned/total fraction.
    // All-or-nothing blocks (no earned/total reported) contribute 1 or 0.
    if (gs.result !== null && typeof gs.earned === 'number' && typeof gs.total === 'number' && gs.total > 0) {
      correct += gs.earned / gs.total;
    } else if (gs.result === true) {
      correct += 1;
    }
  }
  return { correct, total: sectionRef.graphBlockIds.length };
}

// Flip the state gate; the kit's chrome render unhides the slot (and guards on
// the element actually existing, so a block with no authored solution is a
// harmless no-op).
function revealGraphSolutions(
  sectionRef: SectionRef,
  refs: Refs,
  state: RuntimeState,
): void {
  for (const graphId of sectionRef.graphBlockIds) {
    const graphState = state.graphs[graphId];
    if (graphState) graphState.solutionRevealed = true;
  }
}

// ---- submission: gather responses -------------------------------------------

// Interactive-graph blocks score alongside blanks (each is one scorable unit,
// client-side-scored by the kit as the student answered). An unanswered graph
// is an omission — counted in neither scored nor correct, and absent from the
// graphResponses map (nothing to record). Pure state → JSON: a restored answer
// gathers and submits even when the kit never loaded this visit.
function gatherGraphResponses(
  state: RuntimeState,
  refs: Refs,
): {
  graphResponses?: Record<string, GraphResult>;
  correct: number;
  scored: number;
} {
  const graphResponses: Record<string, GraphResult> = {};
  let graphCount = 0;
  let correct = 0;
  let scored = 0;
  for (const [graphId, ref] of refs.graphs) {
    const gs = state.graphs[graphId];
    if (!gs) continue;
    if (gs.result !== null) {
      scored += 1;
      // Partial credit contributes its fraction to the overall score.
      if (typeof gs.earned === 'number' && typeof gs.total === 'number' && gs.total > 0) {
        correct += gs.earned / gs.total;
      } else if (gs.result === true) {
        correct += 1;
      }
    }
    if (gs.answered && (gs.points.length > 0 || gs.noSolution)) {
      const result: GraphResult = {
        type: ref.interactionType,
        studentPoints: gs.points,
        correct: gs.result === true,
      };
      if (gs.confidence) result.confidence = gs.confidence;
      // v4 fields — emitted only when present so v3-shaped consumers of point/
      // line/region responses see the exact old shape.
      if (ref.interactionType === 'graph_inequality') {
        result.strict = gs.strict === true;
        result.side = gs.side ?? 'above';
      }
      if (ref.interactionType === 'plot_ray' || ref.interactionType === 'plot_segment') {
        // The chosen shape is part of the answer; styles ride per shape family
        // (a ray records its endpoint style, a segment both).
        if (gs.shape) result.shape = gs.shape;
        if (ref.interactionType === 'plot_ray') result.fromStyle = gs.fromStyle ?? 'closed';
        else result.endpoints = gs.endpoints ?? ['closed', 'closed'];
      }
      if (gs.noSolution) result.noSolution = true;
      if (gs.domain) result.domain = gs.domain;
      if (typeof gs.earned === 'number' && typeof gs.total === 'number') {
        result.earned = gs.earned;
        result.total = gs.total;
      }
      graphResponses[graphId] = result;
      graphCount += 1;
    }
  }
  return { ...(graphCount > 0 && { graphResponses }), correct, scored };
}

// ---- wire: fetch the kit, hand over the graph blocks -------------------------

// Structural view of the kit entry's runtime export. Typed by the SHARED
// contract module, so this can't drift from what attachGraphRuntime actually
// accepts — a mismatch is a compile error on either side.
interface GraphKitRuntimeModule {
  attachGraphRuntime(ctx: GraphRuntimeContext): GraphRuntimeExt;
}

/**
 * Fetch the lazy kit once and hand it every graph block on the page — graded
 * widgets and static display figures alike. Called once during bootstrap
 * wiring (after the initial render); the kit builds its own full refs from
 * the elements, mounts the boards, bridges widget moves into `state`, and
 * returns the render delegate `renderGraphs` drives from then on.
 *
 * Defensive throughout: no kit URL or a failed import leaves the static
 * "needs JavaScript" placeholders in place and the rest of the page working —
 * the graphs just can't be answered (they still submit as unanswered, and a
 * RESTORED answer still scores + submits via the inline fold/gather above).
 */
function wireGraphs(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  installed = null;

  // The kit URL is page-wide (document.ts threads one calculatorKitUrl into
  // every block), so take the first one present; blocks that somehow lack it
  // are left out, matching the old per-block "no kit → leave the placeholder".
  let kitSrc: string | null = null;
  const blocks = new Map<string, GraphRuntimeBlockRef>();
  for (const [blockId, ref] of refs.graphs) {
    if (!ref.kitSrc) continue;
    kitSrc = kitSrc ?? ref.kitSrc;
    blocks.set(blockId, {
      el: ref.el,
      canvas: ref.canvas,
      sectionId: ref.sectionId,
      interactionType: ref.interactionType,
    });
  }
  const displays: GraphRuntimeDisplayRef[] = [];
  for (const dref of refs.graphDisplays.values()) {
    if (!dref.kitSrc) continue;
    kitSrc = kitSrc ?? dref.kitSrc;
    displays.push({ el: dref.el, canvas: dref.canvas });
  }
  if (!kitSrc) return;

  // Dynamic import by URL. The `/* @vite-ignore */` keeps the app bundler from
  // trying to resolve the runtime-only R2 URL at build time; in the published
  // page this is just a native dynamic import.
  import(/* @vite-ignore */ kitSrc)
    .then((mod: GraphKitRuntimeModule) => {
      installed = mod.attachGraphRuntime({ state, blocks, displays, onUpdate });
    })
    .catch((err) => {
      console.error('[activity-runtime] graph kit failed to load', err);
    });
}

/** The real graph feature, wired into the base runtime's seam. */
export const graphExt: GraphExt = {
  walkGraphBlocks,
  initGraphState,
  renderGraphs,
  scoreSectionGraphs,
  revealGraphSolutions,
  gatherGraphResponses,
  wireGraphs,
};

// =============================================================================
// numberLineExt — the number_line BRIDGE (1-D sibling of graphExt)
// -----------------------------------------------------------------------------
// The number_line block rides the SAME lazy kit as graphs, so its bridge lives
// in THIS module — the base build's noop alias and the graphs-variant split
// therefore cover it for free (a page with a number_line block is emitted with
// the graphs variant; see document.ts). Same thin-inline discipline as graphExt:
// the cheap init walk + state seed + scoring fold + submit gather stay inline
// (so a kit that fails to load never breaks scoring/submission of restored
// answers); the DOM-heavy plumbing (attribute parsing, chrome, board) is
// attachNumberLineRuntime in the kit. Leaner than graphs — no partial credit,
// no mistakes (decision 6, all-or-nothing).
// =============================================================================

export interface NumberLineExt {
  /**
   * init.ts: walk one section's number_line blocks into the `numberLines` refs
   * map. Returns the section's number-line block ids (for
   * SectionRef.numberLineBlockIds).
   */
  walkNumberLineBlocks(
    sectionEl: HTMLElement,
    sectionId: string,
    numberLines: Map<string, NumberLineRef>,
  ): string[];
  /** state.ts: build the initial per-number-line-block state map from refs. */
  initNumberLineState(refs: Refs): Record<string, NumberLineBlockState>;
  /** render.ts: reflect number-line-block state into chrome (kit-attached). */
  renderNumberLines(state: RuntimeState, refs: Refs): void;
  /**
   * checkpoints.ts: the section's number-line contribution to the score — how
   * many are correct and how many count toward the total (each is one scorable
   * unit; an unanswered one is an omission, counted in total only).
   */
  scoreSectionNumberLines(
    sectionRef: SectionRef,
    state: RuntimeState,
  ): { correct: number; total: number };
  /** checkpoints.ts: reveal solution slots for the section's number lines. */
  revealNumberLineSolutions(
    sectionRef: SectionRef,
    refs: Refs,
    state: RuntimeState,
  ): void;
  /**
   * submission.ts: gather number-line responses for the payload plus their
   * score contribution (correct + scored counts).
   */
  gatherNumberLineResponses(
    state: RuntimeState,
    refs: Refs,
  ): {
    numberLineResponses?: Record<string, NumberLineResult>;
    correct: number;
    scored: number;
  };
  /** index.ts: fetch the lazy kit once and hand it the page's number lines. */
  wireNumberLines(state: RuntimeState, refs: Refs, onUpdate: () => void): void;
}

// ---- init: DOM → slim refs ---------------------------------------------------

function buildNumberLineRef(
  el: HTMLElement,
  canvas: HTMLElement,
  sectionId: string,
): NumberLineRef {
  const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
    '.js-confidence-rating',
  );
  const confidenceRadios: HTMLInputElement[] = confidenceFieldset
    ? Array.prototype.slice.call(
        confidenceFieldset.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]',
        ),
      )
    : [];

  return {
    el,
    canvas,
    kitSrc: el.dataset.numberlineKitSrc ?? null,
    interactionType: el.dataset.numberlineInteractionType ?? 'plot_point',
    hasConfidenceRating: el.dataset.hasConfidenceRating === 'true',
    confidenceRadios,
    sectionId,
  };
}

function walkNumberLineBlocks(
  sectionEl: HTMLElement,
  sectionId: string,
  numberLines: Map<string, NumberLineRef>,
): string[] {
  const sectionNumberLineBlockIds: string[] = [];
  for (const el of $$<HTMLElement>('[data-block-type="number_line"]', sectionEl)) {
    const blockId = el.dataset.numberlineBlockId;
    if (!blockId) {
      warn('Number-line block is missing data-numberline-block-id; skipping.');
      continue;
    }
    const canvas = el.querySelector<HTMLElement>('.number-line-canvas');
    if (!canvas) {
      warn('Number-line block ' + blockId + ' has no .number-line-canvas; skipping.');
      continue;
    }
    numberLines.set(blockId, buildNumberLineRef(el, canvas, sectionId));
    sectionNumberLineBlockIds.push(blockId);
  }
  return sectionNumberLineBlockIds;
}

// ---- state: initial per-block state ----------------------------------------

function initNumberLineState(refs: Refs): Record<string, NumberLineBlockState> {
  const numberLines: Record<string, NumberLineBlockState> = {};
  for (const [id] of refs.numberLines) {
    numberLines[id] = {
      studentPoints: [],
      answered: false,
      result: null,
      solutionRevealed: false,
      confidence: null,
    };
  }
  return numberLines;
}

// ---- render: delegate to the attached kit plumbing ---------------------------

let numberLineInstalled: NumberLineRuntimeExt | null = null;

function renderNumberLines(): void {
  if (numberLineInstalled) numberLineInstalled.render();
}

// ---- checkpoints: scoring + solution reveal ---------------------------------

// Each number line is one scorable unit, all-or-nothing (no partial credit).
// The kit computed correctness live (state.numberLines[id].result) as the
// student answered; an unanswered line is null → an omission (in total, not
// correct), like an empty blank. Pure state math — works with or without the kit.
function scoreSectionNumberLines(
  sectionRef: SectionRef,
  state: RuntimeState,
): { correct: number; total: number } {
  let correct = 0;
  for (const id of sectionRef.numberLineBlockIds) {
    if (state.numberLines[id]?.result === true) correct += 1;
  }
  return { correct, total: sectionRef.numberLineBlockIds.length };
}

function revealNumberLineSolutions(
  sectionRef: SectionRef,
  refs: Refs,
  state: RuntimeState,
): void {
  for (const id of sectionRef.numberLineBlockIds) {
    const ns = state.numberLines[id];
    if (ns) ns.solutionRevealed = true;
  }
}

// ---- submission: gather responses -------------------------------------------

// One scorable unit each, client-side-scored by the kit. An unanswered line is
// an omission — absent from the map, out of scored + correct. Pure state → JSON:
// a restored answer gathers and submits even when the kit never loaded. The
// response is discriminated on `type`: a plot_point carries studentPoints, a
// plot_interval its bounds + styles (never both — the schema union requires it).
function gatherNumberLineResponses(
  state: RuntimeState,
  refs: Refs,
): {
  numberLineResponses?: Record<string, NumberLineResult>;
  correct: number;
  scored: number;
} {
  const numberLineResponses: Record<string, NumberLineResult> = {};
  let count = 0;
  let correct = 0;
  let scored = 0;
  for (const [id, ref] of refs.numberLines) {
    const ns = state.numberLines[id];
    if (!ns) continue;
    if (ns.result !== null) {
      scored += 1;
      if (ns.result === true) correct += 1;
    }
    const iv = ns.interval;
    const hasInterval = iv !== undefined && (iv.min !== undefined || iv.max !== undefined);
    if (!ns.answered || (ns.studentPoints.length === 0 && !hasInterval)) continue;
    let result: NumberLineResult;
    if (ref.interactionType === 'plot_interval') {
      result = { type: 'plot_interval', correct: ns.result === true };
      if (iv?.min !== undefined) {
        result.min = iv.min;
        result.minStyle = iv.minStyle ?? 'closed';
      }
      if (iv?.max !== undefined) {
        result.max = iv.max;
        result.maxStyle = iv.maxStyle ?? 'closed';
      }
    } else {
      result = {
        type: 'plot_point',
        studentPoints: ns.studentPoints,
        correct: ns.result === true,
      };
    }
    if (ns.confidence) result.confidence = ns.confidence;
    numberLineResponses[id] = result;
    count += 1;
  }
  return { ...(count > 0 && { numberLineResponses }), correct, scored };
}

// ---- wire: fetch the kit, hand over the number-line blocks -------------------

interface NumberLineKitRuntimeModule {
  attachNumberLineRuntime(ctx: NumberLineRuntimeContext): NumberLineRuntimeExt;
}

function wireNumberLines(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  numberLineInstalled = null;

  let kitSrc: string | null = null;
  const blocks = new Map<string, NumberLineRuntimeBlockRef>();
  for (const [blockId, ref] of refs.numberLines) {
    if (!ref.kitSrc) continue;
    kitSrc = kitSrc ?? ref.kitSrc;
    blocks.set(blockId, {
      el: ref.el,
      canvas: ref.canvas,
      sectionId: ref.sectionId,
      interactionType: ref.interactionType,
    });
  }
  if (!kitSrc) return;

  import(/* @vite-ignore */ kitSrc)
    .then((mod: NumberLineKitRuntimeModule) => {
      numberLineInstalled = mod.attachNumberLineRuntime({ state, blocks, onUpdate });
    })
    .catch((err) => {
      console.error('[activity-runtime] number-line kit failed to load', err);
    });
}

/** The real number-line feature, wired into the base runtime's seam. */
export const numberLineExt: NumberLineExt = {
  walkNumberLineBlocks,
  initNumberLineState,
  renderNumberLines,
  scoreSectionNumberLines,
  revealNumberLineSolutions,
  gatherNumberLineResponses,
  wireNumberLines,
};

// =============================================================================
// dataPlotExt — the data_plot BRIDGE (statistics sibling of numberLineExt)
// -----------------------------------------------------------------------------
// The graded data_plot block rides the SAME lazy kit as graphs, so its bridge
// lives here too (the base-build noop alias + graphs-variant split cover it for
// free; a page with a data_plot block is emitted with the graphs variant — see
// document.ts). Same thin-inline discipline: the cheap init walk + state seed +
// scoring fold + submit gather stay inline (so a kit that fails to load never
// breaks scoring/submission of restored answers); the DOM-heavy plumbing is
// attachDataPlotRuntime in the kit. Leaner still than number-line — one
// interaction (build_dotplot), all-or-nothing.
//
// display data_plots are ungraded static SVG the renderer draws; they carry NO
// data-dataplot-* runtime attrs and never reach this bridge — so there is no
// display walk/wire here (unlike graphs).
// =============================================================================

export interface DataPlotExt {
  /** init.ts: walk one section's graded data_plot blocks into the `dataPlots`
   *  refs map. Returns the section's data_plot block ids. */
  walkDataPlotBlocks(
    sectionEl: HTMLElement,
    sectionId: string,
    dataPlots: Map<string, DataPlotRef>,
  ): string[];
  /** state.ts: build the initial per-data-plot-block state map from refs. */
  initDataPlotState(refs: Refs): Record<string, DataPlotBlockState>;
  /** render.ts: reflect data-plot-block state into chrome (kit-attached). */
  renderDataPlots(state: RuntimeState, refs: Refs): void;
  /** checkpoints.ts: the section's data-plot contribution to the score. */
  scoreSectionDataPlots(
    sectionRef: SectionRef,
    state: RuntimeState,
  ): { correct: number; total: number };
  /** checkpoints.ts: reveal solution slots for the section's data plots. */
  revealDataPlotSolutions(
    sectionRef: SectionRef,
    refs: Refs,
    state: RuntimeState,
  ): void;
  /** submission.ts: gather data-plot responses + their score contribution. */
  gatherDataPlotResponses(
    state: RuntimeState,
    refs: Refs,
  ): {
    dataPlotResponses?: Record<string, DataPlotResult>;
    correct: number;
    scored: number;
  };
  /** index.ts: fetch the lazy kit once and hand it the page's data plots. */
  wireDataPlots(state: RuntimeState, refs: Refs, onUpdate: () => void): void;
}

// ---- init: DOM → slim refs ---------------------------------------------------

function buildDataPlotRef(
  el: HTMLElement,
  canvas: HTMLElement,
  sectionId: string,
): DataPlotRef {
  const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
    '.js-confidence-rating',
  );
  const confidenceRadios: HTMLInputElement[] = confidenceFieldset
    ? Array.prototype.slice.call(
        confidenceFieldset.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]',
        ),
      )
    : [];

  return {
    el,
    canvas,
    kitSrc: el.dataset.dataplotKitSrc ?? null,
    interactionType: el.dataset.dataplotInteractionType ?? 'build_dotplot',
    hasConfidenceRating: el.dataset.hasConfidenceRating === 'true',
    confidenceRadios,
    sectionId,
  };
}

function walkDataPlotBlocks(
  sectionEl: HTMLElement,
  sectionId: string,
  dataPlots: Map<string, DataPlotRef>,
): string[] {
  const sectionDataPlotBlockIds: string[] = [];
  for (const el of $$<HTMLElement>('[data-block-type="data_plot"]', sectionEl)) {
    // Only GRADED data plots carry data-dataplot-block-id (display ones don't);
    // a display block therefore falls out here without any special-casing.
    const blockId = el.dataset.dataplotBlockId;
    if (!blockId) continue;
    const canvas = el.querySelector<HTMLElement>('.data-plot-canvas');
    if (!canvas) {
      warn('Data-plot block ' + blockId + ' has no .data-plot-canvas; skipping.');
      continue;
    }
    dataPlots.set(blockId, buildDataPlotRef(el, canvas, sectionId));
    sectionDataPlotBlockIds.push(blockId);
  }
  return sectionDataPlotBlockIds;
}

// ---- state: initial per-block state ----------------------------------------

function initDataPlotState(refs: Refs): Record<string, DataPlotBlockState> {
  const dataPlots: Record<string, DataPlotBlockState> = {};
  for (const [id] of refs.dataPlots) {
    dataPlots[id] = {
      studentValues: [],
      answered: false,
      result: null,
      solutionRevealed: false,
      confidence: null,
    };
  }
  return dataPlots;
}

// ---- render: delegate to the attached kit plumbing ---------------------------

let dataPlotInstalled: DataPlotRuntimeExt | null = null;

function renderDataPlots(): void {
  if (dataPlotInstalled) dataPlotInstalled.render();
}

// ---- checkpoints: scoring + solution reveal ---------------------------------

// Each data plot is one scorable unit, all-or-nothing. The kit computed
// correctness live as the student built the plot; an unanswered one is null → an
// omission (in total, not correct), like an empty blank. Pure state math.
function scoreSectionDataPlots(
  sectionRef: SectionRef,
  state: RuntimeState,
): { correct: number; total: number } {
  let correct = 0;
  for (const id of sectionRef.dataPlotBlockIds) {
    if (state.dataPlots[id]?.result === true) correct += 1;
  }
  return { correct, total: sectionRef.dataPlotBlockIds.length };
}

function revealDataPlotSolutions(
  sectionRef: SectionRef,
  refs: Refs,
  state: RuntimeState,
): void {
  for (const id of sectionRef.dataPlotBlockIds) {
    const dp = state.dataPlots[id];
    if (dp) dp.solutionRevealed = true;
  }
}

// ---- submission: gather responses -------------------------------------------

// One scorable unit each, client-side-scored by the kit. An unanswered plot is
// an omission — absent from the map, out of scored + correct. Pure state → JSON:
// a restored answer gathers and submits even when the kit never loaded.
function gatherDataPlotResponses(
  state: RuntimeState,
  refs: Refs,
): {
  dataPlotResponses?: Record<string, DataPlotResult>;
  correct: number;
  scored: number;
} {
  const dataPlotResponses: Record<string, DataPlotResult> = {};
  let count = 0;
  let correct = 0;
  let scored = 0;
  for (const [id, ref] of refs.dataPlots) {
    const dp = state.dataPlots[id];
    if (!dp) continue;
    if (dp.result !== null) {
      scored += 1;
      if (dp.result === true) correct += 1;
    }
    if (!dp.answered || dp.studentValues.length === 0) continue;
    const result: DataPlotResult = {
      type: ref.interactionType,
      studentValues: dp.studentValues,
      correct: dp.result === true,
    };
    if (dp.confidence) result.confidence = dp.confidence;
    dataPlotResponses[id] = result;
    count += 1;
  }
  return { ...(count > 0 && { dataPlotResponses }), correct, scored };
}

// ---- wire: fetch the kit, hand over the data-plot blocks --------------------

interface DataPlotKitRuntimeModule {
  attachDataPlotRuntime(ctx: DataPlotRuntimeContext): DataPlotRuntimeExt;
}

function wireDataPlots(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  dataPlotInstalled = null;

  let kitSrc: string | null = null;
  const blocks = new Map<string, DataPlotRuntimeBlockRef>();
  for (const [blockId, ref] of refs.dataPlots) {
    if (!ref.kitSrc) continue;
    kitSrc = kitSrc ?? ref.kitSrc;
    blocks.set(blockId, {
      el: ref.el,
      canvas: ref.canvas,
      sectionId: ref.sectionId,
      interactionType: ref.interactionType,
    });
  }
  if (!kitSrc) return;

  import(/* @vite-ignore */ kitSrc)
    .then((mod: DataPlotKitRuntimeModule) => {
      dataPlotInstalled = mod.attachDataPlotRuntime({ state, blocks, onUpdate });
    })
    .catch((err) => {
      console.error('[activity-runtime] data-plot kit failed to load', err);
    });
}

/** The real data-plot feature, wired into the base runtime's seam. */
export const dataPlotExt: DataPlotExt = {
  walkDataPlotBlocks,
  initDataPlotState,
  renderDataPlots,
  scoreSectionDataPlots,
  revealDataPlotSolutions,
  gatherDataPlotResponses,
  wireDataPlots,
};
