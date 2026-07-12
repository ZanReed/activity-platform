// =============================================================================
// runtime/graph-integration.noop.ts — the base-build stand-in for graphs
// -----------------------------------------------------------------------------
// The "base" runtime build (scripts/bundle-renderer.mjs) resolves imports of
// `./graph-integration.js` to THIS file via an esbuild onResolve alias, so a
// page with no interactive_graph block ships zero graph code. Every method is a
// no-op returning the empty result the base runtime treats as "no graphs": the
// refs maps stay empty, state.graphs stays {}, nothing renders/scores/submits.
//
// It implements the SAME `GraphExt` interface as the real module (imported as a
// type below), so if the seam contract ever changes and this file isn't updated
// in lockstep, it's a compile error — the two can't silently drift.
//
// Never imported by source directly; only the base esbuild build reaches it.
// The real graph-integration.ts is what dev, tsc, and the vitest suite see.
// =============================================================================

import type { GraphExt, NumberLineExt } from './graph-integration.js';
import type { GraphBlockState, NumberLineBlockState } from './state.js';

export const graphExt: GraphExt = {
  walkGraphBlocks: () => [],
  initGraphState: (): Record<string, GraphBlockState> => ({}),
  renderGraphs: () => {},
  scoreSectionGraphs: () => ({ correct: 0, total: 0 }),
  revealGraphSolutions: () => {},
  gatherGraphResponses: () => ({ correct: 0, scored: 0 }),
  wireGraphs: () => {},
};

export const numberLineExt: NumberLineExt = {
  walkNumberLineBlocks: () => [],
  initNumberLineState: (): Record<string, NumberLineBlockState> => ({}),
  renderNumberLines: () => {},
  scoreSectionNumberLines: () => ({ correct: 0, total: 0 }),
  revealNumberLineSolutions: () => {},
  gatherNumberLineResponses: () => ({ correct: 0, scored: 0 }),
  wireNumberLines: () => {},
};
