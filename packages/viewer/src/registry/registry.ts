// =============================================================================
// registry/registry.ts — the single block registry (S0, ruling Q1A)
// -----------------------------------------------------------------------------
// One entry per schema block type. The guard suite (tests/registry.test.ts)
// proves: coverage is exact against the Block union, numbering declarations
// agree with block-predicates.ts, families agree with isGradeable, variants
// agree with the schema's interaction unions, and every interactive entry
// carries an a11y story. Add a block type to the schema and this file fails to
// compile (BlockRegistry is keyed by the union) — that is the point.
//
// Print declarations started FAITHFUL to the baseline print layer
// (renderer/src/runtime/styles.ts @media print), including its known oddities,
// so that improving them would be a deliberate decision rather than a silent
// registry side effect. S5 (the print slice) IS that decision point, and it
// ruled (S5-OV6): math_block, data_plot, and self_explanation now declare
// break-inside: avoid — a numbered equation, a chart, or a prompt separated
// from its writing box is a print bug on any surface — and the author extended
// it to short_answer and essay, the two unnamed siblings that share
// self_explanation's writing-box structure. The parity gate asserts
// THIS spec on both surfaces rather than diffing against renderer output
// (printExpectations.ts), which is exactly what makes the improvement
// expressible; published pages keep their current behavior until they retire.
// =============================================================================

import {
  isGradeable,
  isPageNumbered,
  type Block,
} from '@activity/schema';
import type {
  BlockCategory,
  BlockRegistry,
  BlockType,
  CheckedStateFamily,
} from './types.js';

/** BlankToken fields stripped from inline content wherever
 * SanitizeSpec.inlineBlankSecrets is set. `hint` deliberately survives — it is
 * a pre-check affordance the student may open; per-mistake feedback is
 * returned by the check RPC (ruling 2.1A), so the whole mistakeFeedback array
 * (match strings AND feedback text) strips. `answerType` survives: it shapes
 * the input (numeric keyboards). */
export const BLANK_SECRET_FIELDS = [
  'answer',
  'acceptableAnswers',
  'mistakeFeedback',
  'tolerance',
  'equivalence',
  // The required unit and its alternates are answer-key material: a served
  // unit would prompt the very recall the unit-bearing blank tests.
  'unit',
  'acceptableUnits',
] as const;

/** MathPrompt fields stripped wherever a prompts array appears (math_block
 * blocks AND math_inline nodes). The gap markers in the latex are the gaps
 * themselves (already served empty today — serialize.ts precedent); the
 * prompt's answer/grading config is the secret. `acceptableAnswers` was
 * MISSING from the S0 declaration ("also accept" alternative answers — a real
 * key leak) — caught by S2's cross-check against the MathPrompt schema and
 * added before the first sanitized byte was served. */
export const MATH_PROMPT_SECRET_FIELDS = [
  'answer',
  'acceptableAnswers',
  'equivalence',
  'tolerance',
] as const;

export const blockRegistry: BlockRegistry = {
  paragraph: {
    type: 'paragraph',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'paragraph',
    sanitize: { strip: [] },
    print: { breakInside: 'auto', treatment: 'prose' },
  },

  heading: {
    type: 'heading',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'heading',
    sanitize: { strip: [] },
    print: { breakInside: 'auto', treatment: 'prose', keepWithNext: true },
  },

  math_block: {
    type: 'math_block',
    // Gap-bearing (Model A prompts) → auto-gradable + numbered + interactive;
    // a plain display equation resolves static through familyOf().
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'content', // faithful: renderer emits content even when gap-bearing
    numbered: 'when_gradable',
    analyticsKey: 'math_block',
    sanitize: { strip: ['solution'], inlineBlankSecrets: true },
    // WAS a faithful oddity (absent from the baseline break-inside:avoid list,
    // so a numbered display equation could split across a page). FIXED by
    // ruling S5-OV6 — still not in the showAnswers set, which is the separate
    // answer-key-variant question S5.5 owns.
    print: { breakInside: 'avoid', treatment: 'underline-blanks' },
    a11y: {
      story:
        'Each in-equation gap is a text input in tab order, labeled with its ' +
        'position within the equation ("gap 1 of 2"). The PROBLEM number is ' +
        'announced once by the block wrapper, which is a labelled group — not ' +
        'repeated on every gap (viewer-numbering D3). Values type as plain text; ' +
        'verdicts are announced via the shared state-pill aria-live region.',
    },
  },

  image: {
    type: 'image',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'image',
    sanitize: { strip: [] },
    print: { breakInside: 'auto', treatment: 'figure' },
  },

  callout: {
    type: 'callout',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'callout',
    sanitize: { strip: [] },
    print: { breakInside: 'auto', treatment: 'variant-border-box' },
  },

  problem: {
    type: 'problem',
    // Numbered legacy prose problem; carries a solution but no auto-graded
    // response (isGradeable: false) → static family, no state chrome. Schema
    // orphan: no editor NodeView; still renderable, so it keeps an entry.
    family: 'static',
    interactivity: 'container',
    category: 'question',
    numbered: 'always',
    analyticsKey: 'problem',
    sanitize: { strip: ['solution'] },
    print: { breakInside: 'avoid', treatment: 'prose' },
  },

  fill_in_blank: {
    type: 'fill_in_blank',
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'always',
    analyticsKey: 'fill_in_blank',
    sanitize: { strip: ['solution'], inlineBlankSecrets: true },
    print: { breakInside: 'avoid', treatment: 'underline-blanks' },
    a11y: {
      story:
        'Each blank is a text input in tab order, labeled with its sub-part ' +
        'and position ("Part b, blank 2 of 3") on a numbered multi-blank ' +
        'problem, and "Blank 2 of 3" otherwise. The PROBLEM number is ' +
        'announced once by the block wrapper, which is a labelled group, ' +
        'rather than repeated on every blank (viewer-numbering D3/N7). ' +
        'Hint and mistake ' +
        'affordances are buttons reachable by Tab; the opened popover traps ' +
        'no focus and closes on Escape. Verdicts announce via aria-live.',
    },
  },

  bullet_list: {
    type: 'bullet_list',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'bullet_list',
    sanitize: { strip: [] },
    print: { breakInside: 'auto', treatment: 'prose' },
  },

  ordered_list: {
    type: 'ordered_list',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'ordered_list',
    sanitize: { strip: [] },
    print: { breakInside: 'auto', treatment: 'prose' },
  },

  interactive_graph: {
    type: 'interactive_graph',
    family: 'auto_gradable', // display variant resolves static via familyOf()
    interactivity: 'interactive',
    category: 'question', // display variant resolves content via categoryOf()
    numbered: 'when_gradable',
    analyticsKey: 'interactive_graph',
    variants: [
      'plot_point',
      'plot_function',
      'shade_region',
      'graph_inequality',
      'plot_ray',
      'plot_segment',
      'transform_curve',
      'display',
    ],
    sanitize: {
      // The widget needs handle count / family, which live in the key the
      // viewer never gets. Derived + whitelisted; see SanitizeSpec.
      deriveQuestionShape: true,
      // Variant-scoped keys: paths that don't exist on an instance's
      // interaction simply don't match. `allowNoSolution` SURVIVES (it renders
      // the "no solution" control); `noSolutionCorrect` is the answer.
      strip: [
        'interaction.correctPoints',
        'interaction.tolerance',
        'interaction.models',
        'interaction.domains',
        'interaction.regions',
        'interaction.inequalities',
        'interaction.rays',
        'interaction.segments',
        'mistakeFeedback',
        'solution',
        'noSolutionCorrect',
        'builtinFeedback',
      ],
    },
    print: { breakInside: 'avoid', treatment: 'static-svg' },
    a11y: {
      story:
        'The canvas is focusable; handles move by arrow keys with position ' +
        'narration to a visually-hidden aria-live region (a visible readout ' +
        'would hand over the answer — reading the grid is the skill). ' +
        'Post-check results are visible text. Touch targets meet 44px.',
    },
  },

  multiple_choice: {
    type: 'multiple_choice',
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'always',
    analyticsKey: 'multiple_choice',
    sanitize: {
      // Per-choice feedback returns via the check RPC (2.1A), like blanks'.
      // misconceptionId is server-side metadata (a distractor→registry
      // binding); a pre-check client could otherwise read which wrong
      // answers were anticipated.
      strip: [
        'choices[].correct',
        'choices[].feedback',
        'choices[].misconceptionId',
        'solution',
      ],
    },
    print: {
      breakInside: 'avoid',
      treatment: 'choice-letters',
      // Printed versions rearrange the choices; a question that says "all of
      // the above" opts out per-block (D17A). NOT serveShuffled: the student
      // screen keeps the authored order, because the answer is the choice id
      // and rearranging it there buys nothing.
      shuffled: ['choices'],
      shuffleLockedBy: 'lockChoiceOrder',
    },
    a11y: {
      story:
        'Native radio (single) / checkbox (multi) inputs grouped in a ' +
        'fieldset whose legend is the prompt; full label click targets. ' +
        'Standard arrow-key radio behavior; verdicts announce via aria-live.',
    },
  },

  matching: {
    type: 'matching',
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'always',
    analyticsKey: 'matching',
    sanitize: { strip: ['key', 'solution'] },
    // A9/E3: conditional, and declared as such — the bank drops its
    // unbreakability once it holds figures. See PrintSpec.breakInside.
    print: { breakInside: 'avoid-unless-figures', treatment: 'letter-bank' },
    a11y: {
      story:
        'Pointer drag with a keyboard select-then-place grammar underneath: ' +
        'target cards are focusable, Space/Enter lifts, arrows choose a dock, ' +
        'Space/Enter places, Escape cancels. Every move narrates to a ' +
        'visually-hidden aria-live region ("Card B placed on item 2").',
    },
  },

  correspondence: {
    type: 'correspondence',
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'always',
    analyticsKey: 'correspondence',
    sanitize: { strip: ['key', 'solution'] },
    // Same conditional as matching, for the same reason: the banks drop
    // unbreakability once they hold figures.
    print: { breakInside: 'avoid-unless-figures', treatment: 'letter-bank' },
    a11y: {
      story:
        'One native <select> per (item, column) cell — operable by keyboard, ' +
        'screen reader, and touch with no custom grammar (the shipped ' +
        'matching affordance, generalized). Each select is labeled with its ' +
        'item and column ("Graph for item 2"); options carry the column\'s ' +
        'derived letters. Verdicts announce via the shared state-pill ' +
        'aria-live region.',
    },
  },

  ordering: {
    type: 'ordering',
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'always',
    analyticsKey: 'ordering',
    sanitize: {
      strip: ['solution'],
      // The authored items order IS the key — the server serves a shuffle
      // (stable per version + student so reloads don't reshuffle).
      serveShuffled: ['items'],
    },
    print: {
      breakInside: 'avoid',
      treatment: 'number-boxes',
      // The authored order is the answer, so paper must never show it. The
      // server already shuffles for students (serveShuffled above); teacher
      // print gets its own, because that path deliberately does not run the
      // per-student serve shuffle.
      shuffled: ['items'],
    },
    a11y: {
      story:
        'Rows are focusable and reorder via the shared lift grammar: ' +
        'Space/Enter lifts, arrows move the row, Space/Enter drops, Escape ' +
        'cancels; positions narrate to a visually-hidden aria-live region.',
    },
  },

  number_line: {
    type: 'number_line',
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'always',
    analyticsKey: 'number_line',
    variants: ['plot_point', 'plot_interval'],
    sanitize: {
      // The widget needs handle count / family, which live in the key the
      // viewer never gets. Derived + whitelisted; see SanitizeSpec.
      deriveQuestionShape: true,
      strip: [
        'interaction.correctPoints',
        'interaction.tolerance',
        'interaction.correctInterval',
        'solution',
      ],
    },
    print: { breakInside: 'avoid', treatment: 'static-svg' },
    a11y: {
      story:
        'The line is focusable; points/interval endpoints move by arrow keys ' +
        'with value narration to a visually-hidden aria-live region (visible ' +
        'readout would reveal the answer). Post-check results are visible.',
    },
  },

  data_plot: {
    type: 'data_plot',
    family: 'auto_gradable', // display variant resolves static via familyOf()
    interactivity: 'interactive',
    category: 'question', // display variant resolves content via categoryOf()
    numbered: 'when_gradable',
    analyticsKey: 'data_plot',
    variants: ['display', 'build_dotplot', 'build_histogram', 'build_boxplot'],
    sanitize: {
      // The widget needs handle count / family, which live in the key the
      // viewer never gets. Derived + whitelisted; see SanitizeSpec.
      deriveQuestionShape: true,
      strip: ['solution', 'interaction.tolerance'],
      derivableFromServed:
        'The data set is the working material the student builds the chart ' +
        'FROM, and the correct chart is computed from it — withholding the ' +
        'data would remove the task. Server-authoritative grading still gates ' +
        'verdicts; the leak tests whitelist `data` for this block explicitly.',
    },
    // WAS a faithful oddity (absent from the baseline break-inside:avoid list,
    // unlike the graph and number-line canvases). FIXED by ruling S5-OV6 — a
    // chart split across a page boundary is unreadable.
    print: { breakInside: 'avoid', treatment: 'static-svg' },
    a11y: {
      story:
        'Chart-building controls are focusable; dots/bars/box handles adjust ' +
        'by arrow keys with value narration to a visually-hidden aria-live ' +
        'region. Post-check results are visible text.',
    },
  },

  learning_objectives: {
    type: 'learning_objectives',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'learning_objectives',
    sanitize: { strip: [] },
    print: { breakInside: 'avoid', treatment: 'bordered-box' },
  },

  worked_example: {
    type: 'worked_example',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'worked_example',
    sanitize: { strip: [], childBlocks: ['content'] },
    print: { breakInside: 'avoid', treatment: 'bordered-box' },
  },

  faded_worked_example: {
    type: 'faded_worked_example',
    // The box counts as ONE numbered problem; grading rides its child
    // fill_in_blank steps, each sanitized by its own entry via childBlocks.
    family: 'auto_gradable',
    interactivity: 'container',
    category: 'scaffold',
    numbered: 'always',
    analyticsKey: 'faded_worked_example',
    sanitize: { strip: [], childBlocks: ['content'] },
    print: { breakInside: 'avoid', treatment: 'bordered-box' },
  },

  table: {
    type: 'table',
    // DUAL-NATURED, resolved per instance rather than declared per type: a
    // table whose cells hold blanks is a question; a blankless one is a
    // stimulus (a rates chart to READ). familyOf()/categoryOf() route through
    // isGradeable, which answers from CONTENT — the math_block precedent, and
    // the reason there is no authored `interactive` flag to drift.
    family: 'auto_gradable',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'when_gradable',
    analyticsKey: 'table',
    // Cells are NOT blocks, so `childBlocks` would be a category error here.
    // The cell blanks are in-band content of THIS block: the deep strip walks
    // them unconditionally (it never stops at nested arrays), and this flag is
    // the declaration + the type projection that says so.
    sanitize: { strip: [], inlineBlankSecrets: true },
    print: { breakInside: 'avoid', treatment: 'data-table' },
    a11y: {
      story:
        'The table is a real <table> with <th> cells on whichever axis the ' +
        'author marked (headerRow / headerColumn), so a screen reader ' +
        'announces a blank cell with its row and column headers — "Kilograms ' +
        '2, Cost, blank" — which is the information a sighted student reads ' +
        'off the grid. Each blank is a text input in tab order, reading order ' +
        'left to right then down. On a multi-blank table the input also ' +
        'carries its sub-part letter ("Part b"), matching the (b) marker ' +
        'printed beside it; that marker is aria-hidden so it is not announced ' +
        'twice. The PROBLEM number is announced once by the block wrapper, ' +
        'never repeated per cell (viewer-numbering D3). Verdicts announce via ' +
        'the shared state-pill aria-live region.',
    },
  },

  self_explanation: {
    type: 'self_explanation',
    family: 'recorded',
    interactivity: 'interactive',
    category: 'question',
    numbered: 'never',
    analyticsKey: 'self_explanation',
    sanitize: { strip: [] },
    // WAS a faithful oddity: the baseline avoid rides the textarea, not the
    // block, so a long prompt could separate from its writing box. FIXED by
    // ruling S5-OV6 — a prompt on one page and its answer space on the next is
    // the same defect class as a split equation.
    print: { breakInside: 'avoid', treatment: 'writing-box' },
    a11y: {
      story:
        'A labeled textarea in tab order. On check the block announces ' +
        '"Recorded — your teacher will review" via aria-live; never a verdict.',
    },
  },

  short_answer: {
    type: 'short_answer',
    family: 'recorded',
    interactivity: 'interactive',
    category: 'question',
    // WAS 'never' — a pre-paper-first choice. Ruling E7 (2026-08-19): a graded
    // question a teacher marks on paper needs a number, and the numbering walk
    // that already exists gives the scan arc its paper→block mapping for free.
    numbered: 'always',
    analyticsKey: 'short_answer',
    // Rubrics are teacher-side data — already correctly withheld from student
    // HTML today; the registry makes that a declared invariant.
    //
    // `answer` and `solution` joined it with the answer-key slice (ruling E2/E3)
    // and the ORDER OF EVENTS matters more than the list does: E3 declares the
    // anti-leak chain ONE INSEPARABLE UNIT — this strip entry, the leakFixture
    // sentinel row that observes it, the sanitize unit assertion, and the
    // schema-vs-registry completeness gate all land together. A strip entry
    // without its fixture row is a claim nothing checks (the "passing because
    // of what is absent" class), which is exactly how a key leaks quietly.
    sanitize: { strip: ['rubric', 'answer', 'solution'] },
    // Same former oddity as self_explanation, and fixed with it: the baseline
    // avoid rides the textarea, not the block, so a prompt could print on one
    // page with its answer space on the next. S5-OV6 named only the three
    // types its comments flagged; the author extended the ruling to the two
    // unnamed siblings of the same family rather than leave the defect in
    // place for them (the plot_ray/plot_segment lesson: audit the family).
    print: { breakInside: 'avoid', treatment: 'writing-box' },
    a11y: {
      story:
        'A labeled textarea in tab order. Recorded state announces via ' +
        'aria-live; teacher feedback, once released, renders as a labeled ' +
        'region announced on arrival.',
    },
  },

  essay: {
    type: 'essay',
    family: 'recorded',
    interactivity: 'interactive',
    category: 'question',
    // Numbered with short_answer — see the note there (ruling E7).
    numbered: 'always',
    analyticsKey: 'essay',
    // answer + solution ride the same anti-leak unit as short_answer's; E4's
    // parity ruling is what keeps these two lists identical.
    sanitize: { strip: ['rubric', 'answer', 'solution'] },
    // Extended with short_answer + self_explanation — see the note there.
    print: { breakInside: 'avoid', treatment: 'writing-box' },
    a11y: {
      story:
        'A labeled textarea in tab order. The live word counter is ' +
        'aria-live=polite and debounced so it never chatters per keystroke. ' +
        'Recorded state and released teacher feedback announce via aria-live.',
    },
  },

  graph_figure: {
    type: 'graph_figure',
    family: 'static',
    interactivity: 'container',
    category: 'content',
    numbered: 'never',
    analyticsKey: 'graph_figure',
    sanitize: { strip: [] },
    print: { breakInside: 'auto', treatment: 'figure' },
  },
};

/** Every registered type, in registry declaration order. */
export const registeredBlockTypes = Object.keys(blockRegistry) as BlockType[];

/** Resolve an INSTANCE's checked-state family. A type's declared family is
 * maximal; ungradable instances of gradable types (display graph/data plot,
 * promptless math block) resolve to static — one rule engine, isGradeable. */
export function familyOf(block: Block): CheckedStateFamily {
  const entry = blockRegistry[block.type];
  if (entry.family === 'static') return 'static';
  return isGradeable(block) ? entry.family : 'static';
}

/** Resolve an INSTANCE's category: a display-mode graph/data plot serves as
 * content, matching the renderer's data-block-category emission. */
export function categoryOf(block: Block): BlockCategory {
  const entry = blockRegistry[block.type];
  if (entry.category === 'question' && entry.numbered === 'when_gradable') {
    return isGradeable(block) ? 'question' : 'content';
  }
  return entry.category;
}

/** Census key for an instance (P3A): the analytics key, with the interaction
 * variant appended for the blocks that have one — `data_plot.build_histogram`. */
export function censusKeyOf(block: Block): string {
  const entry = blockRegistry[block.type];
  if ('interaction' in block && entry.variants) {
    return `${entry.analyticsKey}.${block.interaction.type}`;
  }
  return entry.analyticsKey;
}

/** Whether an INSTANCE draws a problem number (delegates to the schema rule
 * engine — re-exported here so viewer code has one import surface). */
export { isPageNumbered };
