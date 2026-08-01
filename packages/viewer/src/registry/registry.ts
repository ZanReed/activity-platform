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
        'position ("gap 1 of 2 in problem 3"). Values type as plain text; ' +
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
    print: { breakInside: 'avoid', treatment: 'underline-blanks', answerKeyVariant: true },
    a11y: {
      story:
        'Each blank is a text input in tab order with a label naming its ' +
        'problem and sub-part ("blank (a), problem 3"). Hint and mistake ' +
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
        'partialCredit',
        'builtinFeedback',
      ],
    },
    print: { breakInside: 'avoid', treatment: 'static-svg', answerKeyVariant: true },
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
      strip: ['choices[].correct', 'choices[].feedback', 'solution'],
    },
    print: { breakInside: 'avoid', treatment: 'choice-letters', answerKeyVariant: true },
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
    print: { breakInside: 'avoid', treatment: 'letter-bank', answerKeyVariant: true },
    a11y: {
      story:
        'Pointer drag with a keyboard select-then-place grammar underneath: ' +
        'target cards are focusable, Space/Enter lifts, arrows choose a dock, ' +
        'Space/Enter places, Escape cancels. Every move narrates to a ' +
        'visually-hidden aria-live region ("Card B placed on item 2").',
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
    print: { breakInside: 'avoid', treatment: 'number-boxes', answerKeyVariant: true },
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
    print: { breakInside: 'avoid', treatment: 'static-svg', answerKeyVariant: true },
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
    print: { breakInside: 'avoid', treatment: 'static-svg', answerKeyVariant: true },
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
    numbered: 'never',
    analyticsKey: 'short_answer',
    // Rubrics are teacher-side data — already correctly withheld from student
    // HTML today; the registry makes that a declared invariant.
    sanitize: { strip: ['rubric'] },
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
    numbered: 'never',
    analyticsKey: 'essay',
    sanitize: { strip: ['rubric'] },
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
