// =============================================================================
// grading/corpus.ts — the golden grading corpus (ruling S4-8)
// -----------------------------------------------------------------------------
// THE PARITY GATE. Ruling T1A makes retiring `@activity/renderer` and its inline
// runtime conditional on proving that the server engine marks student work the
// same way the published page does. This file is that proof's input: pure DATA
// — an authored block, a student's raw input, and the mark a student should get
// — executed by BOTH engines.
//
// WHY DATA AND NOT TWO TEST SUITES. Each case states the EXPECTED verdict
// independently, and both engines are checked against it. Comparing the engines
// only to each other would let them agree and both be wrong; more to the point,
// the server engine was ported by reading the runtime, so a misreading would be
// reproduced identically in a hand-written server test and pass. The expected
// column is the part a human can review on its own.
//
// WHAT IS IN SCOPE, AND WHY IT IS NOT EVERYTHING.
// The graph family is deliberately absent. The server engine IMPORTS graph-kit's
// pure scorers (`scorePoints`, `scoreFunction`, `scoreNumberLineInterval`,
// `scoreDotplot`, …) — the very functions the published-page runtime calls
// through its widgets. Graph parity is therefore true BY CONSTRUCTION, not by
// measurement, and a corpus there would be testing that `f === f`. What needed
// porting, and so what needs pinning, is the four ELEMENT-COUPLED scorers the
// runtime reads off data-attributes and the server re-implements against schema
// fields: blanks (text / numeric / math / interchangeable groups), multiple
// choice, matching, and ordering. That is finding R2's "port as SEMANTICS
// pinned by the golden corpus", scoped to the half that actually was ported.
// Per-variant graph dispatch is covered in grading-section.test.ts instead.
//
// INTENTIONAL DIFFERENCES ARE DATA, NOT EXCEPTIONS. Two rulings deliberately
// changed behavior (G1 normalization, 2.1A's hint fallback). Those cases carry
// `runtimeDiffers` with the reason, so the gate asserts the difference EXISTS
// rather than tolerating it — a silent regression back to the old behavior
// fails, and so does an undeclared new divergence.
// =============================================================================

import type { BlankKey } from './blanks.js';

/** The mark a student ends up with. `unscored` means NO mark is shown at all —
 * the wire omits the item entirely, which is how an omission travels. */
export type ExpectedVerdict = 'correct' | 'incorrect' | 'unscored';

export interface BlankCase {
  /** Stable, human-readable — this is what a reviewer reads in a failure. */
  name: string;
  /** The authored blank(s). More than one means an interchangeable group. */
  blanks: Array<Partial<BlankKey> & { answers: string[] }>;
  /** What the student typed into each, index-aligned to `blanks`. */
  typed: string[];
  /** The mark each should receive, index-aligned. */
  expect: ExpectedVerdict[];
  /**
   * Set when the PUBLISHED PAGE would mark this differently, with the ruling
   * that authorized the change. The gate asserts the divergence is real.
   */
  runtimeDiffers?: { runtimeExpect: ExpectedVerdict[]; because: string };
}

export interface ChoiceCase {
  name: string;
  /** Choice ids in document order; `correct` marks the key. */
  choices: Array<{ id: string; correct: boolean }>;
  multiSelect: boolean;
  selected: string[];
  expect: ExpectedVerdict;
}

export interface MatchingCase {
  name: string;
  itemIds: string[];
  key: Record<string, string>;
  pairs: Record<string, string>;
  expect: ExpectedVerdict;
  /** Partial credit the block verdict throws away but the score keeps. */
  expectEarned: number;
  expectTotal: number;
}

export interface OrderingCase {
  name: string;
  authoredOrder: string[];
  servedOrder: string[];
  submitted: string[];
  expect: ExpectedVerdict;
}

// ---- blanks -----------------------------------------------------------------

export const BLANK_CASES: BlankCase[] = [
  // -- text: the default answerType, and byte-exact by design ----------------
  { name: 'text: exact match', blanks: [{ answers: ['7'] }], typed: ['7'], expect: ['correct'] },
  { name: 'text: wrong answer', blanks: [{ answers: ['7'] }], typed: ['8'], expect: ['incorrect'] },
  {
    name: 'text: an alternate acceptable answer',
    blanks: [{ answers: ['x+1', 'x + 1', '1+x'] }],
    typed: ['1+x'],
    expect: ['correct'],
  },
  {
    name: 'text: case matters — X and x are different in algebra',
    blanks: [{ answers: ['X'] }],
    typed: ['x'],
    expect: ['incorrect'],
  },
  {
    name: 'text: interior spacing is significant',
    blanks: [{ answers: ['x + 1'] }],
    typed: ['x+1'],
    expect: ['incorrect'],
  },
  {
    name: 'text: surrounding whitespace is trimmed off the student value',
    blanks: [{ answers: ['7'] }],
    typed: ['   7   '],
    expect: ['correct'],
  },
  {
    name: 'text: empty is unscored, not wrong',
    blanks: [{ answers: ['7'] }],
    typed: [''],
    expect: ['unscored'],
  },
  {
    name: 'text: whitespace-only is unscored, not wrong',
    blanks: [{ answers: ['7'] }],
    typed: ['     '],
    expect: ['unscored'],
  },

  // -- numeric ---------------------------------------------------------------
  {
    name: 'numeric: an equivalent fraction for a decimal key',
    blanks: [{ answers: ['0.75'], answerType: 'numeric' }],
    typed: ['3/4'],
    expect: ['correct'],
  },
  {
    name: 'numeric: a mixed number',
    blanks: [{ answers: ['1.5'], answerType: 'numeric' }],
    typed: ['1 1/2'],
    expect: ['correct'],
  },
  {
    name: 'numeric: comma thousands separators',
    blanks: [{ answers: ['1234.5'], answerType: 'numeric' }],
    typed: ['1,234.5'],
    expect: ['correct'],
  },
  {
    name: 'numeric: a leading dollar sign',
    blanks: [{ answers: ['3.5'], answerType: 'numeric' }],
    typed: ['$3.50'],
    expect: ['correct'],
  },
  {
    name: 'numeric: inside an absolute tolerance',
    blanks: [{ answers: ['3.14159'], answerType: 'numeric', tolerance: 0.01 }],
    typed: ['3.14'],
    expect: ['correct'],
  },
  {
    name: 'numeric: outside the tolerance',
    blanks: [{ answers: ['3.14159'], answerType: 'numeric', tolerance: 0.01 }],
    typed: ['3.1'],
    expect: ['incorrect'],
  },
  {
    name: 'numeric: float noise is absorbed at zero tolerance',
    blanks: [{ answers: ['0.3'], answerType: 'numeric' }],
    typed: ['0.30000000000000004'],
    expect: ['correct'],
  },
  {
    name: 'numeric: a non-numeric key entry still matches as text',
    blanks: [{ answers: ['no solution'], answerType: 'numeric' }],
    typed: ['no solution'],
    expect: ['correct'],
  },

  // -- math ------------------------------------------------------------------
  {
    name: 'math: value-equivalent rearrangement',
    blanks: [{ answers: ['2a'], answerType: 'math' }],
    typed: ['a+a'],
    expect: ['correct'],
  },
  {
    name: 'math: not equivalent',
    blanks: [{ answers: ['2a'], answerType: 'math' }],
    typed: ['3a'],
    expect: ['incorrect'],
  },
  {
    name: 'math: exact-form rejects an equivalent rearrangement',
    blanks: [{ answers: ['2a'], answerType: 'math', equivalence: 'exact-form' }],
    typed: ['a+a'],
    expect: ['incorrect'],
  },
  {
    name: 'math: exact-form accepts the literal form',
    blanks: [{ answers: ['2a'], answerType: 'math', equivalence: 'exact-form' }],
    typed: ['2a'],
    expect: ['correct'],
  },

  // -- interchangeable groups (consume-once) ---------------------------------
  {
    name: 'group: authored order',
    blanks: [{ answers: ['2'] }, { answers: ['3'], interchangeableWithPrevious: true }],
    typed: ['2', '3'],
    expect: ['correct', 'correct'],
  },
  {
    name: 'group: swapped order is equally correct',
    blanks: [{ answers: ['2'] }, { answers: ['3'], interchangeableWithPrevious: true }],
    typed: ['3', '2'],
    expect: ['correct', 'correct'],
  },
  {
    name: 'group: a duplicate can only be consumed once',
    blanks: [{ answers: ['2'] }, { answers: ['3'], interchangeableWithPrevious: true }],
    typed: ['2', '2'],
    expect: ['correct', 'incorrect'],
  },
  {
    name: 'group: the later duplicate is the one that loses',
    blanks: [{ answers: ['2'] }, { answers: ['3'], interchangeableWithPrevious: true }],
    typed: ['3', '3'],
    expect: ['correct', 'incorrect'],
  },
  {
    name: 'group: each slot keeps its own answer list',
    blanks: [
      { answers: ['x^3', 'x*x*x'] },
      { answers: ['5x'], interchangeableWithPrevious: true },
    ],
    typed: ['5x', 'x*x*x'],
    expect: ['correct', 'correct'],
  },
  {
    name: 'group: an empty member is unscored, its partner still counts',
    blanks: [{ answers: ['3'] }, { answers: ['2'], interchangeableWithPrevious: true }],
    typed: ['3', ''],
    expect: ['correct', 'unscored'],
  },
  {
    name: 'group: three blanks, partial credit on a duplicate',
    blanks: [
      { answers: ['2'] },
      { answers: ['3'], interchangeableWithPrevious: true },
      { answers: ['5'], interchangeableWithPrevious: true },
    ],
    typed: ['2', '2', '5'],
    expect: ['correct', 'incorrect', 'correct'],
  },
  {
    name: 'group: a complete assignment a greedy matcher would miss',
    // Greedy parks the first "3" in the slot that accepts both and then has
    // nowhere for the second, marking a fully correct student wrong.
    blanks: [
      { answers: ['2', '3'] },
      { answers: ['3'], interchangeableWithPrevious: true },
      { answers: ['2'], interchangeableWithPrevious: true },
    ],
    typed: ['3', '3', '2'],
    expect: ['correct', 'correct', 'correct'],
  },

  // -- intentional differences (ruled, not accidental) -----------------------
  {
    name: 'normalization: a unicode minus from a math keyboard',
    blanks: [{ answers: ['-5'] }],
    typed: ['−5'],
    expect: ['correct'],
    runtimeDiffers: {
      runtimeExpect: ['incorrect'],
      because:
        'Author ruling G1. The published page compares byte-exactly, so U+2212 ' +
        'never matched U+002D and a visually identical correct answer was ' +
        'marked wrong. An input-method fix, not a pedagogy change.',
    },
  },
  {
    name: 'normalization: a smart apostrophe',
    blanks: [{ answers: ["f'(x)"] }],
    typed: ['f’(x)'],
    expect: ['correct'],
    runtimeDiffers: {
      runtimeExpect: ['incorrect'],
      because: 'Author ruling G1 — same class as the unicode minus.',
    },
  },
  {
    name: 'normalization: an answer key pasted with a unicode minus',
    blanks: [{ answers: ['−5'] }],
    typed: ['-5'],
    expect: ['correct'],
    runtimeDiffers: {
      runtimeExpect: ['incorrect'],
      because:
        'Author ruling G1 normalizes BOTH sides — a key pasted out of a doc ' +
        'was previously unmatchable by anything typeable on a plain keyboard.',
    },
  },
];

// ---- multiple choice --------------------------------------------------------

export const CHOICE_CASES: ChoiceCase[] = [
  {
    name: 'single: the correct choice',
    choices: [
      { id: 'a', correct: true },
      { id: 'b', correct: false },
    ],
    multiSelect: false,
    selected: ['a'],
    expect: 'correct',
  },
  {
    name: 'single: a wrong choice',
    choices: [
      { id: 'a', correct: true },
      { id: 'b', correct: false },
    ],
    multiSelect: false,
    selected: ['b'],
    expect: 'incorrect',
  },
  {
    name: 'single: nothing selected is unscored, not wrong',
    choices: [
      { id: 'a', correct: true },
      { id: 'b', correct: false },
    ],
    multiSelect: false,
    selected: [],
    expect: 'unscored',
  },
  {
    name: 'multi: the exact set, order-free',
    choices: [
      { id: 'a', correct: true },
      { id: 'b', correct: true },
      { id: 'c', correct: false },
    ],
    multiSelect: true,
    selected: ['b', 'a'],
    expect: 'correct',
  },
  {
    name: 'multi: a subset earns nothing (all-or-nothing)',
    choices: [
      { id: 'a', correct: true },
      { id: 'b', correct: true },
      { id: 'c', correct: false },
    ],
    multiSelect: true,
    selected: ['a'],
    expect: 'incorrect',
  },
  {
    name: 'multi: a superset is wrong',
    choices: [
      { id: 'a', correct: true },
      { id: 'b', correct: true },
      { id: 'c', correct: false },
    ],
    multiSelect: true,
    selected: ['a', 'b', 'c'],
    expect: 'incorrect',
  },
];

// ---- matching ---------------------------------------------------------------

export const MATCHING_CASES: MatchingCase[] = [
  {
    name: 'every pair correct',
    itemIds: ['i1', 'i2'],
    key: { i1: 't1', i2: 't2' },
    pairs: { i1: 't1', i2: 't2' },
    expect: 'correct',
    expectEarned: 2,
    expectTotal: 2,
  },
  {
    name: 'one pair right, one wrong — partial credit, block still wrong',
    itemIds: ['i1', 'i2'],
    key: { i1: 't1', i2: 't2' },
    pairs: { i1: 't1', i2: 't1' },
    expect: 'incorrect',
    expectEarned: 1,
    expectTotal: 2,
  },
  {
    name: 'a missing pair still counts in the denominator',
    itemIds: ['i1', 'i2'],
    key: { i1: 't1', i2: 't2' },
    pairs: { i1: 't1' },
    expect: 'incorrect',
    expectEarned: 1,
    expectTotal: 2,
  },
  {
    name: 'no pairs placed at all is unscored, not wrong',
    itemIds: ['i1', 'i2'],
    key: { i1: 't1', i2: 't2' },
    pairs: {},
    expect: 'unscored',
    expectEarned: 0,
    expectTotal: 2,
  },
  {
    name: 'every pair wrong is answered-and-incorrect, not unscored',
    itemIds: ['i1', 'i2'],
    key: { i1: 't1', i2: 't2' },
    pairs: { i1: 't2', i2: 't1' },
    expect: 'incorrect',
    expectEarned: 0,
    expectTotal: 2,
  },
];

// ---- ordering ---------------------------------------------------------------

export const ORDERING_CASES: OrderingCase[] = [
  {
    name: 'the authored sequence',
    authoredOrder: ['a', 'b', 'c'],
    servedOrder: ['c', 'a', 'b'],
    submitted: ['a', 'b', 'c'],
    expect: 'correct',
  },
  {
    name: 'a rearrangement that is not the authored one',
    authoredOrder: ['a', 'b', 'c'],
    servedOrder: ['c', 'a', 'b'],
    submitted: ['b', 'a', 'c'],
    expect: 'incorrect',
  },
  {
    name: 'an untouched list is unscored even though it is a valid sequence',
    authoredOrder: ['a', 'b', 'c'],
    servedOrder: ['c', 'a', 'b'],
    submitted: ['c', 'a', 'b'],
    expect: 'unscored',
  },
  {
    name: 'a shuffle that happened to land on the authored order stays answerable',
    authoredOrder: ['a', 'b', 'c'],
    servedOrder: ['a', 'b', 'c'],
    submitted: ['a', 'b', 'c'],
    expect: 'correct',
  },
];

// ---- completeness (ruling S4-8) ---------------------------------------------

/**
 * How each auto-gradable block type is covered. The guard in
 * grading-corpus.test.ts requires EVERY `auto_gradable` registry entry to
 * appear here, so a new gradable block type cannot ship without someone
 * deciding — in writing — how its grading is proven.
 *
 * "Not covered" is not an available answer. The three values are:
 *
 *   cases          — this file carries explicit corpus cases for it.
 *   shared-scorer  — it grades through a scorer another entry's cases already
 *                    pin (a math gap IS a math blank).
 *   by-construction— the server IMPORTS the same function the published page
 *                    runs, so there is no second implementation to diverge.
 *                    Measuring this would be asserting `f === f`.
 *
 * The last one is only honest while the import is real. If a graph scorer is
 * ever re-implemented server-side instead of imported from graph-kit, its entry
 * must move to `cases` and gain them.
 */
export const CORPUS_COVERAGE: Record<
  string,
  { how: 'cases' | 'shared-scorer' | 'by-construction'; why: string }
> = {
  fill_in_blank: {
    how: 'cases',
    why: 'BLANK_CASES — text/numeric/math, tolerances, interchangeable groups.',
  },
  multiple_choice: { how: 'cases', why: 'CHOICE_CASES — single and multi select.' },
  matching: { how: 'cases', why: 'MATCHING_CASES — partial credit and omission.' },
  ordering: { how: 'cases', why: 'ORDERING_CASES — including the untouched-list rule.' },
  math_block: {
    how: 'shared-scorer',
    why:
      'A gap-bearing math_block grades its MathPrompts through the same math ' +
      'blank path BLANK_CASES pins (answerType math, both equivalence modes). ' +
      'A promptless math_block is static and takes no input.',
  },
  faded_worked_example: {
    how: 'shared-scorer',
    why:
      'A container: its gradable content is nested fill_in_blank blocks, whose ' +
      'blanks are collected by the same deep walk and scored by the same path ' +
      'BLANK_CASES pins.',
  },
  interactive_graph: {
    how: 'by-construction',
    why:
      'The engine imports graph-kit scorePoints / scoreFunction(System) / ' +
      'scoreInequality(System) / scoreRegion / scoreRay / scoreSegment — the ' +
      'same functions the published page calls through its widgets. Per-variant ' +
      'dispatch is covered in grading-section.test.ts.',
  },
  number_line: {
    how: 'by-construction',
    why: 'Imports scoreNumberLinePoints / scoreNumberLineInterval from graph-kit.',
  },
  data_plot: {
    how: 'by-construction',
    why: 'Imports scoreDotplot / scoreHistogram / scoreBoxplot from graph-kit.',
  },
};
