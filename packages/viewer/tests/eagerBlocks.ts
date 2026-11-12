// =============================================================================
// tests/eagerBlocks.ts — the EAGER allow-list for block bindings (policy P-4)
// -----------------------------------------------------------------------------
// Shell-size review D4 (ruled 2026-11-13): a block binding is LAZY by default.
// An eager binding puts its component, and everything it imports, in the
// student shell, which has a fixed ceiling (scripts/perf-budgets.mjs →
// SHELL_JS_GZ_KIB). So eager is an exception that is named here with a reason,
// and eagerBlocks.test.ts fails when bindings.ts and this list disagree in
// either direction.
//
// Test-side on purpose: the reasons are prose, and prose in the registry ships
// to every student (that is how R1's 1.3 KiB of a11y stories got there).
//
// Adding a row is a decision with a byte cost: state it in the design pass
// (P-5) and record it in SHELL_SPEND (P-2). The 20 rows below entered as they
// stood on 2026-11-13; the reasons are the ones bindings.ts already gave.
// =============================================================================

import type { BlockType } from '../src/index.js';

export const EAGER_BLOCKS: Partial<Record<BlockType, string>> = {
  paragraph: 'Text on every page; first paint is mostly paragraphs.',
  heading: 'Text on every page.',
  callout: 'Light text container, common in lessons.',
  bullet_list: 'Light text container.',
  ordered_list: 'Light text container.',
  learning_objectives: 'Light; heads most lessons, at the top of the page.',
  image: 'An <img>; no dependency, and a fallback flash would shift the layout.',
  graph_figure:
    'Y7 ER-9: static figures sit inline in worksheets. Making the static figure ' +
    'engine lazy is reserve rung R6 (~5 KiB est.), first in the reserve.',
  problem: 'The container every question sits in.',
  multiple_choice: 'Near-universal question type; light (no kit).',
  fill_in_blank: 'Near-universal question type; light (no kit).',
  matching: 'Question type, light. Lazy is part of reserve rung R7.',
  correspondence: 'Question type, light. Lazy is part of reserve rung R7.',
  ordering: 'Question type, light. Lazy is part of reserve rung R7.',
  short_answer: 'Near-universal question type; a textarea.',
  self_explanation: 'Common prompt; a textarea.',
  essay: 'A textarea. Lazy is part of reserve rung R7.',
  worked_example: 'Light text container, common in lessons.',
  faded_worked_example: 'Light; a worked example with blanks. Lazy is part of reserve rung R7.',
  table:
    'Text and inputs in a <table>, no canvas or kit; it sits inline with prose, ' +
    'where a Suspense fallback would flash. Stays eager even under R7 (D8).',
};
