// =============================================================================
// runtime/graph-integration.ts — the interactive-graph feature, in one seam
// -----------------------------------------------------------------------------
// Every line of graph-specific runtime logic lives behind this one module. The
// base runtime's shared files (init, state, render, checkpoints, submission,
// index) touch graphs ONLY through the `graphExt` object exported here — they
// never contain a graph branch themselves.
//
// Why a seam: the base runtime IIFE is inlined into EVERY published page,
// including the majority that have no graph. To keep those pages from carrying
// graph code, scripts/bundle-renderer.mjs builds two runtime variants from the
// same source — a "base" build that swaps this module for graph-integration.
// noop.ts (an onResolve alias, so nothing here is bundled) and a "graphs" build
// that keeps it. document.ts inlines the graphs variant only when the rendered
// body contains a `data-block-type="interactive_graph"` block. So a new graph
// feature (a new interaction, a new scorer) adds bytes HERE — never to the base
// runtime every page pays for.
//
// Because the source always imports the REAL module, dev, `tsc`, and the vitest
// suite all see the full graph behavior; only the base esbuild bundle gets the
// no-op. The two must stay shape-identical — `graph-integration.noop.ts` imports
// the `GraphExt` type from here so a drift is a type error, not a silent gap.
//
// This module owns its own DOM subtree (the .graph-canvas the kit mounts into)
// the same way the calculator / definitions sidecars do — the sanctioned
// exception to "init.ts is the only walker / render() is the only mutator". The
// board itself is the lazy-loaded @activity/graph-kit's to draw; render() here
// drives only the surrounding block chrome (feedback line, solution, confidence,
// lock).
// =============================================================================

import { $$ } from './dom.js';
import type {
  Refs,
  GraphRef,
  GraphDisplayRef,
  GraphResponseData,
  GraphWidgetHandle,
  SectionRef,
} from './refs.js';
import type { RuntimeState, GraphBlockState } from './state.js';
import type { GraphResult } from './submission.js';

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
  /** render.ts: reflect every graph block's state into its chrome. */
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
  /** index.ts: mount graded graph widgets (lazy kit) + bridge moves into state. */
  wireGraphs(state: RuntimeState, refs: Refs, onUpdate: () => void): void;
  /** index.ts: mount static display graphs (read-only figures). */
  wireGraphDisplays(refs: Refs): void;
}

function warn(message: string): void {
  if (typeof console !== 'undefined') {
    console.warn('[activity-runtime graph] ' + message);
  }
}

// ---- init: DOM → refs -------------------------------------------------------

// Shared JSON-attribute parser for graph blocks: undefined on absence, undefined
// + a warning on malformed JSON (the kit then defaults it). One helper for both
// the graded and display graph builders.
function parseGraphAttr(
  raw: string | undefined,
  blockId: string,
  label: string,
): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    warn('Graph block ' + blockId + ' has malformed ' + label + '; ignoring.');
    return undefined;
  }
}

/**
 * Build a GraphDisplayRef for one display-mode interactive_graph block. Returns
 * null (skipping it) when the id or the .graph-canvas is missing. Malformed
 * config/drawables parse to undefined and are defaulted by the kit — a bad
 * attribute degrades to a blank/partial figure rather than dropping the block.
 */
function buildGraphDisplayRef(
  el: HTMLElement,
): { id: string; ref: GraphDisplayRef } | null {
  const blockId = el.dataset.graphBlockId;
  if (!blockId) {
    warn('Display-graph block is missing data-graph-block-id; skipping.');
    return null;
  }
  const canvas = el.querySelector<HTMLElement>('.graph-canvas');
  if (!canvas) {
    warn('Display-graph block ' + blockId + ' has no .graph-canvas; skipping.');
    return null;
  }
  return {
    id: blockId,
    ref: {
      canvas,
      kitSrc: el.dataset.graphKitSrc ?? null,
      config: parseGraphAttr(el.dataset.graphConfig, blockId, 'data-graph-config'),
      drawables: parseGraphAttr(
        el.dataset.graphDrawables,
        blockId,
        'data-graph-drawables',
      ),
    },
  };
}

/**
 * Build a GraphRef for one interactive_graph block. Returns null (skipping the
 * block) only when its id is missing. Malformed data-graph-config / -answer-key
 * are tolerated: parsed to undefined here and defaulted by the kit, so a bad
 * attribute degrades to a permissive graph rather than dropping the question.
 */
function buildGraphRef(el: HTMLElement, sectionId: string): GraphRef | null {
  const blockId = el.dataset.graphBlockId;
  if (!blockId) {
    warn('Interactive-graph block is missing data-graph-block-id; skipping.');
    return null;
  }
  const canvas = el.querySelector<HTMLElement>('.graph-canvas');
  if (!canvas) {
    warn('Graph block ' + blockId + ' has no .graph-canvas; skipping.');
    return null;
  }

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

  let skills: string[] = [];
  const rawSkills = el.dataset.skills;
  if (rawSkills) {
    try {
      const parsed = JSON.parse(rawSkills);
      if (Array.isArray(parsed)) skills = parsed;
    } catch {
      warn('Graph block ' + blockId + ' has malformed data-skills; ignoring.');
    }
  }

  return {
    el,
    canvas,
    feedbackEl: el.querySelector<HTMLElement>('.js-graph-feedback'),
    solutionEl: el.querySelector<HTMLElement>('.js-solution'),
    kitSrc: el.dataset.graphKitSrc ?? null,
    interactionType: el.dataset.graphInteractionType ?? 'plot_point',
    config: parseGraphAttr(el.dataset.graphConfig, blockId, 'data-graph-config'),
    answerKey: parseGraphAttr(
      el.dataset.graphAnswerKey,
      blockId,
      'data-graph-answer-key',
    ),
    hasConfidenceRating: el.dataset.hasConfidenceRating === 'true',
    confidenceRadios,
    skills,
    partialCredit: el.dataset.graphPartialCredit === 'true',
    allowNoSolution: el.dataset.graphAllowNoSolution === 'true',
    noSolutionCorrect: el.dataset.graphNoSolutionCorrect === 'true',
    sectionId,
    handle: null,
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
    // Display (static) graphs are ungraded: mount a read-only figure, but keep
    // them OUT of the scored graphs map and out of graphBlockIds so they never
    // count toward a section's score or the submit payload.
    if (graphEl.dataset.graphInteractionType === 'display') {
      const dref = buildGraphDisplayRef(graphEl);
      if (dref) graphDisplays.set(dref.id, dref.ref);
      continue;
    }
    const ref = buildGraphRef(graphEl, sectionId);
    if (!ref) continue;
    graphs.set(graphEl.dataset.graphBlockId as string, ref);
    sectionGraphBlockIds.push(graphEl.dataset.graphBlockId as string);
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

// ---- render: state → chrome -------------------------------------------------

// Reflect one interactive-graph block's state into the DOM regions the runtime
// owns: the aria-live feedback line, the solution slot, the confidence radios,
// and the widget lock. The canvas board itself is the kit's (mounted by
// wireGraphs); render only drives the surrounding block chrome.
function renderGraph(
  graphState: GraphBlockState,
  ref: GraphRef,
  state: RuntimeState,
): void {
  // Solution slot — hidden until revealed at check time (fail-closed).
  if (ref.solutionEl) {
    const wantHidden = !graphState.solutionRevealed;
    if (ref.solutionEl.hidden !== wantHidden) {
      ref.solutionEl.hidden = wantHidden;
    }
  }

  // Confidence radios reflect the stored selection (restore-on-load + keep
  // state↔DOM consistent). No-op when the block has no fieldset.
  for (const radio of ref.confidenceRadios) {
    const wantChecked = radio.value === graphState.confidence;
    if (radio.checked !== wantChecked) {
      radio.checked = wantChecked;
    }
  }

  // Feedback line: after the section is checked, reveal correctness (respecting
  // "don't reveal before checking"); before that, narrate the plotted position
  // for screen-reader users on every move. aria-live announces on text change.
  if (ref.feedbackEl) {
    const checked = state.sections[ref.sectionId]?.checked === true;
    let text = '';
    let dataState: string | null = null;
    if (checked && graphState.result !== null) {
      text = graphState.result ? 'Correct!' : 'Not quite — try again.';
      dataState = graphState.result ? 'correct' : 'incorrect';
    } else if (graphState.answered && graphState.points.length > 0) {
      const plotted = graphState.points
        .map((p) => '(' + p[0] + ', ' + p[1] + ')')
        .join(', ');
      const label =
        graphState.points.length > 1 ? 'Points plotted at ' : 'Point plotted at ';
      text = label + plotted + '.';
    }
    const wantHidden = text === '';
    if (ref.feedbackEl.hidden !== wantHidden) ref.feedbackEl.hidden = wantHidden;
    if (ref.feedbackEl.textContent !== text) ref.feedbackEl.textContent = text;
    const current = ref.feedbackEl.getAttribute('data-state');
    if (dataState !== current) {
      if (dataState === null) ref.feedbackEl.removeAttribute('data-state');
      else ref.feedbackEl.setAttribute('data-state', dataState);
    }
  }

  // Lock the widget in locked mode once the section is checked. The handle is
  // acquired asynchronously by wireGraphs, so this no-ops until the board has
  // mounted; wireGraphs also applies the restored lock on mount.
  if (ref.handle) {
    ref.handle.setLocked(state.sections[ref.sectionId]?.locked === true);
  }
}

function renderGraphs(state: RuntimeState, refs: Refs): void {
  for (const [id, ref] of refs.graphs) {
    const graphState = state.graphs[id];
    if (graphState) renderGraph(graphState, ref, state);
  }
}

// ---- checkpoints: scoring + solution reveal ---------------------------------

// Each graph is one scorable unit. The kit computed correctness live
// (state.graphs[id].result) as the student moved the point; an unanswered graph
// is null → an omission, counted in total but not in correct, like an empty
// blank.
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

function revealGraphSolutions(
  sectionRef: SectionRef,
  refs: Refs,
  state: RuntimeState,
): void {
  for (const graphId of sectionRef.graphBlockIds) {
    const graphRef = refs.graphs.get(graphId);
    const graphState = state.graphs[graphId];
    if (!graphRef || !graphState) continue;
    if (graphRef.solutionEl !== null) {
      graphState.solutionRevealed = true;
    }
  }
}

// ---- submission: gather responses -------------------------------------------

// Interactive-graph blocks score alongside blanks (each is one scorable unit,
// client-side-scored by the kit as the student moved the point). An unanswered
// graph is an omission — counted in neither scored nor correct, and absent from
// the graphResponses map (nothing to record).
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

// ---- sidecar: mount the kit widgets -----------------------------------------

// Structural view of the kit entry the sidecar dynamic-imports. The runtime and
// the kit are separate bundles joined only by this shape (mirrors how the wire
// payload is the contract with the Edge Function).
interface GraphKitModule {
  mountGraphQuestion(
    mount: HTMLElement,
    config: unknown,
    hooks: { onChange?: (resp: GraphResponseData) => void },
  ): Promise<GraphWidgetHandle>;
  mountGraphDisplay(
    mount: HTMLElement,
    config: unknown,
  ): Promise<{ destroy(): void }>;
}

/**
 * Mount every graph block's widget and wire its moves into state. Called once
 * during bootstrap wiring (after the initial render). Each mount is async (the
 * kit is fetched on demand); state/refs are mutated as handles resolve.
 *
 * Defensive throughout: no kit URL, a failed import, or a missing canvas leaves
 * the static "needs JavaScript" placeholder in place and the rest of the page
 * working — the graph just can't be answered (it still submits as unanswered).
 */
function wireGraphs(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [blockId, ref] of refs.graphs) {
    if (!ref.kitSrc) continue; // no kit available → leave the placeholder

    const config = {
      interactionType: ref.interactionType,
      axisConfig: ref.config,
      answerKey: ref.answerKey,
      partialCredit: ref.partialCredit,
      allowNoSolution: ref.allowNoSolution,
      noSolutionCorrect: ref.noSolutionCorrect,
    };

    // Dynamic import by URL. The `/* @vite-ignore */` keeps the app bundler from
    // trying to resolve the runtime-only R2 URL at build time; in the published
    // page this is just a native dynamic import.
    import(/* @vite-ignore */ ref.kitSrc)
      .then((mod: GraphKitModule) =>
        mod.mountGraphQuestion(ref.canvas, config, {
          onChange: (resp) => {
            const gs = state.graphs[blockId];
            if (!gs) return;
            gs.points = resp.studentPoints;
            gs.answered = resp.answered;
            // Unanswered → unscored (an omission), like an empty blank; once the
            // student has moved a handle, its correctness is live.
            gs.result = resp.answered ? resp.correct : null;
            // Drop 4 extras, present only when the widget reports them.
            gs.strict = resp.strict;
            gs.side = resp.side;
            gs.noSolution = resp.noSolution;
            gs.earned = resp.earned;
            gs.total = resp.total;
            gs.domain = resp.domain;
            onUpdate();
          },
        }),
      )
      .then((handle) => {
        ref.handle = handle;
        // Restore the answer persisted on a prior load. Its onChange re-populates
        // state.graphs[blockId] (answered + result), so a checked-and-reloaded
        // graph comes back scored.
        const gs = state.graphs[blockId];
        if (gs && (gs.points.length > 0 || gs.noSolution)) {
          handle.restore(gs.points, {
            strict: gs.strict,
            side: gs.side,
            noSolution: gs.noSolution,
            domain: gs.domain,
          });
        }
        // Reflect any restored lock (locked mode after a prior check).
        if (state.sections[ref.sectionId]?.locked) handle.setLocked(true);
      })
      .catch((err) => {
        console.error('[activity-runtime] graph kit failed to load', err);
      });
  }
}

/**
 * Mount every DISPLAY (static, ungraded) graph block's read-only figure. Like
 * wireGraphs but far simpler: no state, no hooks, no scoring — just draw the
 * authored drawables. A failed import or missing kit leaves the static no-JS
 * placeholder in place. Called once during bootstrap wiring.
 */
function wireGraphDisplays(refs: Refs): void {
  for (const ref of refs.graphDisplays.values()) {
    if (!ref.kitSrc) continue; // no kit available → leave the placeholder

    const config = { axisConfig: ref.config, drawables: ref.drawables };

    import(/* @vite-ignore */ ref.kitSrc)
      .then((mod: GraphKitModule) => mod.mountGraphDisplay(ref.canvas, config))
      .catch((err) => {
        console.error('[activity-runtime] display graph kit failed to load', err);
      });
  }
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
  wireGraphDisplays,
};
