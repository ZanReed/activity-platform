// =============================================================================
// registry/printExpectations.ts — the print rules the gate asserts (S5/T6)
// -----------------------------------------------------------------------------
// ONE location for the per-block print contract, consumed by the print gate
// (packages/app/e2e/print-rules.e2e.ts). Written for TWO surfaces originally —
// the retiring renderer's published page and the viewer's print mode — and
// reduced to one when the cross-surface half retired (S5-abs); the rules
// themselves did not change, only the number of pages they run against.
//
// HONEST NAMING (ruling S5-5, conceding outside-voice finding #4): this is NOT
// "derived from PrintSpec so it cannot drift". Two parts genuinely derive from
// the registry — `break-inside` and `break-after` come straight off PrintSpec,
// and the roster comes off `registeredBlockTypes` — but the rest is a written
// table, because the real rules are per-BLOCK, not per-treatment (a graph
// canvas caps at 3.5in while a number line caps at 5in, both `static-svg`), and
// and because it needs a selector per rule. The guarantee this file offers is
// SINGLE LOCATION + ROSTER GUARDS, not derivation. That distinction matters: S4 shipped a test double that diverged
// from the helper it stood in for, and both sides passed their own tests
// (learning `test-double-divergence-hides-integration-bugs`). A table that
// claims to be derived invites exactly that under-assertion.
//
// WHY the gate asserts THIS instead of comparing the two surfaces pixel to
// pixel (ruling S5-6): the surfaces are deliberately different renderings —
// different DOM, different container layout, different font pipelines — so a
// cross-surface pixel threshold is either permanently red or vacuously loose.
// Parity that can be falsified is "every ruled print RULE holds on both
// surfaces". Pixels are compared viewer-against-viewer only (screenshot
// baselines, T8), and the subjective half is one recorded human sign-off on a
// generated contact sheet (T10).
//
// SOME SELECTORS BELOW DO NOT EXIST YET. T1 (viewer print CSS) and T2 (the
// print-only static SVG twins) implement them; a check whose target is missing
// FAILS, and that failing list is the build's to-do. That is the gate working,
// not a bug. Nothing here asserts against the renderer's own output as the
// source of truth — the renderer surface is held to the same declared rules, so
// the two deliberate improvements ruled in S5-OV6 (below) are improvements on
// the VIEWER without touching published pages.
//
// BUNDLE DISCIPLINE: this module imports FROM registry.ts and is never imported
// BY it, and it is not re-exported from server/index.ts — so it cannot reach
// the get-activity Edge Function bundle. (V9 lesson: component bindings on
// registry entries leaked the whole component tree into that bundle, 888 KiB →
// 21 MB, because the read API imports the registry.)
// =============================================================================

import { blockRegistry, registeredBlockTypes } from './registry.js';
import type { BlockType, PrintTreatment } from './types.js';

// -----------------------------------------------------------------------------
// Vocabulary
// -----------------------------------------------------------------------------

/** Sentinel target meaning "the block root element itself" rather than a
 * descendant query. The harness resolves it to the element it scoped to
 * (`[data-block-type="…"]`), which every block emits. */
export const BLOCK_ROOT = ':block-root';

// NOTE (S5.5, cross-surface retirement): `target` used to be a per-surface map
// with an explicit `notApplicable` escape, because a rule could apply to the
// viewer and not to the retiring renderer. With one surface left there is
// nothing to except a rule FROM — a rule a block should not be held to is
// declared in `suppressedChecksFor`, which already carries a reason — so the
// target is simply the selector.

/**
 * The closed set of things the gate knows how to assert. Closed on purpose:
 * the harness implements each kind exactly once, so a new rule is a new entry
 * in a table rather than new assertion code scattered through the suite.
 *
 *  - computed        — a computed CSS property must be one of these values.
 *  - hidden          — not rendered, or `display: none`.
 *  - visible         — present and not `display: none`.
 *  - bare-underline  — top/left/right borders none; bottom solid with non-zero
 *                      width. The shared "blanks neutralize to writing lines"
 *                      rule, asserted without pinning a COLOUR (the renderer
 *                      says `black`, the viewer resolves an ink token).
 *  - boxed           — a real border on all four sides, in the given style.
 *  - ink-not-paper   — the computed colour is not a paper colour. This is the
 *                      S5-9 dark-mode guard: viewer print colours resolve from
 *                      theme tokens, so a dark-mode student could otherwise
 *                      print white ink on white paper.
 *  - max-width-capped— computed max-width is a real length, not `none`, so a
 *                      figure cannot run off the sheet.
 *  - writing-space   — computed min-height is at least N times the font size:
 *                      there is room to answer by hand.
 *  - drawable-count  — the print SVG declares how many authored drawables it
 *                      contains via `data-drawables`. `zero: true` means the
 *                      empty axes a student plots ONTO; `zero: false` means the
 *                      authored content a display figure exists to show. This
 *                      is the falsifiable form of ruling S5-1-as-amended
 *                      (OV4) and is a CONTRACT ON T2's extracted SVG module:
 *                      both surfaces emit the attribute from the same code.
 */
export type PrintExpectation =
  | { readonly kind: 'computed'; readonly property: string; readonly oneOf: readonly string[] }
  | { readonly kind: 'hidden' }
  | { readonly kind: 'visible' }
  | { readonly kind: 'bare-underline' }
  | { readonly kind: 'boxed'; readonly style: 'solid' | 'dashed' | 'double' | 'dotted' }
  | { readonly kind: 'ink-not-paper' }
  | { readonly kind: 'max-width-capped' }
  | { readonly kind: 'writing-space'; readonly minEm: number }
  | { readonly kind: 'drawable-count'; readonly zero: boolean };

export interface PrintCheck {
  /** Stable id — appears in failure output and in the coverage guard. */
  readonly id: string;
  /** The rule in one human sentence. Failure messages quote it, so a red gate
   * reads as "blanks must print as bare writing lines", not a selector dump. */
  readonly rule: string;
  readonly target: string;
  readonly expect: PrintExpectation;
}

/** Instance facts a check may depend on. Both are real axes in the schema:
 * callout carries a `variant`, and the graph family carries
 * `interaction.type` (whose `display` value is the content-not-question
 * case). The fixture supplies them; absent means "the type's base case". */
export interface PrintInstanceContext {
  readonly variant?: string;
  readonly interaction?: string;
}

// -----------------------------------------------------------------------------
// Universal checks — true of EVERY block on a printed worksheet (ruling 7.3A:
// the clean-worksheet default) plus the dark-mode ink guard (S5-9).
// -----------------------------------------------------------------------------

const UNIVERSAL_CHECKS: readonly PrintCheck[] = [
  {
    id: 'chrome/state-pill',
    rule: 'Check-state chrome never prints — a printed worksheet is the blank version.',
    target: '.viewer-state-pill',
    expect: { kind: 'hidden' },
  },
  {
    id: 'chrome/server-feedback',
    rule: 'Server feedback is an online-only affordance and never prints.',
    target: '[data-feedback="server"]',
    expect: { kind: 'hidden' },
  },
  {
    id: 'chrome/solutions',
    rule: 'Solutions are excluded from the default print (ruling 7.4A).',
    target: '.viewer-solution',
    expect: { kind: 'hidden' },
  },
  {
    id: 'ink/not-paper',
    rule: 'Printed text is ink-coloured regardless of the screen theme — a dark-mode student must not print white on white (S5-9).',
    target: BLOCK_ROOT,
    expect: { kind: 'ink-not-paper' },
  },
];

/** Values a computed `color` may not take on paper. */
export const PAPER_COLOURS: readonly string[] = [
  'transparent',
  'rgba(0, 0, 0, 0)',
  'rgb(255, 255, 255)',
  '#ffffff',
  'white',
];

// -----------------------------------------------------------------------------
// Treatment table — the shared per-treatment rules.
// -----------------------------------------------------------------------------

const TREATMENT_CHECKS: { readonly [T in PrintTreatment]: readonly PrintCheck[] } = {
  prose: [],

  figure: [
    {
      id: 'figure/capped',
      rule: 'A figure is capped so it cannot run off the sheet.',
      // Capping EVERY figure (not just an interactive canvas) was one of the
      // improvements the cross-surface gate surfaced before it retired: a wide
      // static graph_figure could otherwise overrun the page box.
      target: '.viewer-image__img, .viewer-figure__svg',
      expect: { kind: 'max-width-capped' },
    },
  ],

  'variant-border-box': [
    // The variant-specific border STYLE is added per-instance below: colour
    // carries the variant on screen, and in grayscale only the style survives.
    {
      id: 'callout/bordered',
      rule: 'A callout prints as a bordered box (its variant rides the border style, which survives grayscale).',
      // BLOCK_ROOT on both: the callout component's own root carries
      // data-block-type, so it IS the block root rather than a descendant of
      // one — a descendant selector finds nothing when the gate is already
      // scoped to that element.
      target: BLOCK_ROOT,
      expect: { kind: 'visible' },
    },
  ],

  'bordered-box': [
    {
      id: 'scaffold/box-visible',
      rule: 'A scaffold card prints as a plain bordered box — colour carries no meaning in black and white, the border and label do.',
      target: BLOCK_ROOT,
      expect: { kind: 'visible' },
    },
  ],

  'underline-blanks': [
    {
      id: 'blanks/bare-underline',
      rule: 'Blanks neutralize to bare writing lines.',
      target: '.viewer-blank__input',
      expect: { kind: 'bare-underline' },
    },
    {
      id: 'blanks/no-verdict-fill',
      rule: 'Correct/incorrect fills are neutralized — a printed worksheet has no scored state to convey.',
      target: '.viewer-blank__input',
      expect: {
        kind: 'computed',
        property: 'background-color',
        oneOf: ['transparent', 'rgba(0, 0, 0, 0)'],
      },
    },
    {
      id: 'blanks/hint-affordances-hidden',
      rule: 'Hint and mistake buttons are screen affordances and never print.',
      target: '.viewer-blank__feedback',
      expect: { kind: 'hidden' },
    },
  ],

  'choice-letters': [
    {
      id: 'mc/inputs-hidden',
      rule: 'Native radio/checkbox controls never print — the choice letters are the circle-me markers.',
      target: '.viewer-mc__choice input',
      expect: { kind: 'hidden' },
    },
    {
      id: 'mc/letter-visible',
      rule: 'Each choice prints its letter, which is what the student circles.',
      target: '.viewer-mc__letter',
      expect: { kind: 'visible' },
    },
    {
      id: 'mc/no-verdict-fill',
      rule: 'Post-check choice highlighting is neutralized on paper.',
      target: '.viewer-mc__choice',
      expect: {
        kind: 'computed',
        property: 'background-color',
        oneOf: ['transparent', 'rgba(0, 0, 0, 0)'],
      },
    },
  ],

  'letter-bank': [
    {
      id: 'matching/interactive-hidden',
      rule: 'The interactive dock and its controls never print.',
      target: '.viewer-matching__select',
      expect: { kind: 'hidden' },
    },
    {
      id: 'matching/letter-line',
      rule: 'Each item prints a write-the-letter line — the century-old paper convention.',
      target: '.viewer-matching__letter-line',
      expect: { kind: 'bare-underline' },
    },
    {
      id: 'matching/bank-visible',
      rule: 'The lettered bank prints so the student can read the options.',
      target: '.viewer-matching__bank',
      expect: { kind: 'visible' },
    },
  ],

  'number-boxes': [
    {
      id: 'ordering/controls-hidden',
      rule: 'Reorder controls and grips never print.',
      target: '.viewer-ordering__controls',
      expect: { kind: 'hidden' },
    },
    {
      id: 'ordering/number-box',
      rule: 'Each row prints a write-in box — "number the steps 1 to N".',
      target: '.viewer-ordering__number-box',
      expect: { kind: 'boxed', style: 'solid' },
    },
  ],

  'static-svg': [
    {
      id: 'canvas/live-board-hidden',
      rule: 'The interactive board never prints — it would print the student’s in-progress work onto a clean worksheet, and it depends on a lazily-loaded kit (S5-1).',
      target: '.viewer-graph__canvas, .viewer-number-line__canvas, .viewer-data-plot__canvas',
      expect: { kind: 'hidden' },
    },
    {
      id: 'canvas/print-svg-visible',
      rule: 'A kit-free static SVG prints in the board’s place — a real grid the student works on by hand.',
      target: '[data-print-svg]',
      expect: { kind: 'visible' },
    },
  ],

  'writing-box': [
    {
      id: 'freetext/writing-area',
      rule: 'Free text prints as a bordered area with room to write by hand.',
      target: '.viewer-short-answer__input, .viewer-self-explanation__input, .viewer-essay__input',
      expect: { kind: 'writing-space', minEm: 4 },
    },
    {
      id: 'freetext/wordcount-hidden',
      rule: 'The live word counter is a screen affordance and never prints.',
      target: '.viewer-essay__count',
      expect: { kind: 'hidden' },
    },
  ],
};

// -----------------------------------------------------------------------------
// Per-TYPE checks — the honest part of the table (outside-voice #4). Two blocks
// can share a treatment and still owe different rules.
// -----------------------------------------------------------------------------

const TYPE_CHECKS: Partial<Record<BlockType, readonly PrintCheck[]>> = {
  interactive_graph: [
    {
      id: 'graph/hand-plottable-cap',
      rule: 'The grid caps at a hand-plottable paper size (3.5in today).',
      target: '[data-print-svg]',
      expect: { kind: 'max-width-capped' },
    },
  ],
  number_line: [
    {
      id: 'number-line/hand-markable-cap',
      rule: 'The line caps at a hand-markable width (5in today) — wider than a graph grid, because a number line is one-dimensional.',
      target: '[data-print-svg]',
      expect: { kind: 'max-width-capped' },
    },
  ],
  faded_worked_example: [
    {
      id: 'faded-example/dashed-border',
      rule: 'The faded example keeps a DASHED border so it stays distinct from the solid worked-example box in grayscale.',
      target: BLOCK_ROOT,
      expect: { kind: 'boxed', style: 'dashed' },
    },
  ],
  worked_example: [
    {
      id: 'worked-example/solid-border',
      rule: 'The worked example prints as a solid bordered box.',
      target: BLOCK_ROOT,
      expect: { kind: 'boxed', style: 'solid' },
    },
  ],
  learning_objectives: [
    {
      id: 'objectives/solid-border',
      rule: 'The objectives card prints as a solid bordered box.',
      target: BLOCK_ROOT,
      expect: { kind: 'boxed', style: 'solid' },
    },
  ],
  essay: [
    {
      id: 'essay/taller-writing-space',
      rule: 'An essay gets a taller writing area than a short answer — the paper affordance should match the expected length.',
      // An essay gets more room than a one-line answer — an improvement the
      // cross-surface gate surfaced (the page it replaced gave every free-text
      // block the same box).
      target: '.viewer-essay__input',
      expect: { kind: 'writing-space', minEm: 8 },
    },
  ],
};

/** Callout variant → the border style that carries it in grayscale. Both
 * surfaces encode the same mapping (the renderer as literal styles, the viewer
 * as `--callout-*-print-border` tokens). */
const CALLOUT_VARIANT_BORDERS: Readonly<Record<string, 'solid' | 'dashed' | 'double' | 'dotted'>> =
  {
    info: 'solid',
    warning: 'dashed',
    success: 'double',
    note: 'dotted',
  };

/** Graph-family interaction values that are CONTENT rather than a question.
 * A display figure must print the drawables it exists to show; a question
 * prints empty axes for the student to work on (ruling S5-1 as amended by
 * OV4 — an empty-axes twin would have deleted authored content from paper). */
const DISPLAY_INTERACTIONS: readonly string[] = ['display'];

/**
 * Treatment checks a specific type opts OUT of, each with the reason.
 *
 * A treatment describes the usual shape of a paper affordance; a type can
 * legitimately realise it differently. Suppression is per-check and must be
 * justified, so the alternative to a wrong assertion is a written exemption
 * rather than a quietly weakened rule.
 */
const SUPPRESSED: Partial<Record<BlockType, Readonly<Record<string, string>>>> = {
  math_block: {
    'blanks/bare-underline':
      'A math gap is rendered MATH, not an input: in print it is a KaTeX \\square inside the equation, which is the writing affordance. There is no input element to neutralise.',
    'blanks/no-verdict-fill':
      'Same: no input element exists to carry a verdict fill in print.',
    'blanks/hint-affordances-hidden':
      'Math gaps carry no hint or mistake buttons — those belong to fill_in_blank.',
  },
};

// -----------------------------------------------------------------------------
// The public helper
// -----------------------------------------------------------------------------

/**
 * Every print rule that must hold for one block instance, on both surfaces.
 *
 * Composition, in order:
 *   1. break-inside / break-after — DERIVED from the registry's PrintSpec.
 *   2. universal clean-worksheet chrome + the dark-mode ink guard.
 *   3. the block's treatment table.
 *   4. per-type additions (caps, border styles, writing-space depth).
 *   5. per-instance additions (callout variant border, graph display-vs-question).
 */
export function printExpectations(
  type: BlockType,
  ctx: PrintInstanceContext = {},
): readonly PrintCheck[] {
  const spec = blockRegistry[type].print;

  const derived: PrintCheck[] = [
    {
      id: 'spec/break-inside',
      rule: `PrintSpec declares break-inside: ${spec.breakInside} for ${type}.`,
      target: BLOCK_ROOT,
      expect: { kind: 'computed', property: 'break-inside', oneOf: [spec.breakInside] },
    },
  ];

  if (spec.keepWithNext) {
    derived.push({
      id: 'spec/keep-with-next',
      rule: `${type} must never be stranded at a page bottom, away from what it introduces.`,
      target: BLOCK_ROOT,
      expect: { kind: 'computed', property: 'break-after', oneOf: ['avoid'] },
    });
  }

  const perInstance: PrintCheck[] = [];

  if (type === 'callout') {
    const variant = ctx.variant ?? 'info';
    const style = CALLOUT_VARIANT_BORDERS[variant];
    if (style !== undefined) {
      perInstance.push({
        id: `callout/border-style/${variant}`,
        rule: `A ${variant} callout encodes its variant in the border STYLE (${style}), which survives grayscale.`,
        target: BLOCK_ROOT,
        expect: { kind: 'computed', property: 'border-left-style', oneOf: [style] },
      });
    }
  }

  if (spec.treatment === 'static-svg') {
    const isDisplay = ctx.interaction !== undefined && DISPLAY_INTERACTIONS.includes(ctx.interaction);
    perInstance.push({
      id: isDisplay ? 'canvas/display-keeps-drawables' : 'canvas/question-prints-empty',
      rule: isDisplay
        ? 'A display figure prints the authored drawables it exists to show — printing empty axes would delete the content.'
        : 'A question prints empty axes for the student to plot onto; their in-progress work is stripped (7.3A).',
      // The attribute is on the SVG element, not on the container that holds
      // it — the first gate run caught this reading null off the wrapper.
      target: '[data-print-svg] svg',
      expect: { kind: 'drawable-count', zero: !isDisplay },
    });
  }

  // A suppressed check is OMITTED, not emitted as unrunnable. Emitting it with
  // both surfaces marked not-applicable produced a check that could never fail,
  // which the guard suite correctly rejected: a rule that cannot run is not a
  // rule. The exemption still has to be declared and justified — see
  // suppressedChecksFor — it just does not masquerade as coverage.
  const suppressed = SUPPRESSED[type] ?? {};
  const treatment = TREATMENT_CHECKS[spec.treatment].filter(
    (check) => suppressed[check.id] === undefined,
  );

  return [
    ...derived,
    ...UNIVERSAL_CHECKS,
    ...treatment,
    ...(TYPE_CHECKS[type] ?? []),
    ...perInstance,
  ];
}

/**
 * Treatment checks this block type opts out of, with the reason for each.
 *
 * Exposed so the guard suite can prove every exemption names a real check and
 * carries a real justification: the alternative to a wrong assertion has to be
 * a written exemption, not a silently missing rule.
 */
export function suppressedChecksFor(
  type: BlockType,
): Readonly<Record<string, string>> {
  return SUPPRESSED[type] ?? {};
}

/** A check's selector. Kept as a function rather than a field read because the
 * harness resolves BLOCK_ROOT through it. */
export function targetFor(check: PrintCheck): string {
  return check.target;
}

// -----------------------------------------------------------------------------
// Rosters — what the gate must cover (S5-6). Three classes, because a fixture
// set keyed only to the block registry is structurally blind to layout and to
// the document-level print layer (outside-voice #1 and #2).
// -----------------------------------------------------------------------------

/** Class 1 — one fixture per registry entry (plus the variants below). Derived,
 * so a new block type cannot skip the gate. */
export const blockPrintRoster: readonly BlockType[] = registeredBlockTypes;

/** Variants that need their OWN fixture because a rule differs across them —
 * not every variant, only the ones that change a printed rule. */
export const variantPrintRoster: readonly {
  readonly type: BlockType;
  readonly ctx: PrintInstanceContext;
  readonly why: string;
}[] = [
  { type: 'callout', ctx: { variant: 'info' }, why: 'solid border style' },
  { type: 'callout', ctx: { variant: 'warning' }, why: 'dashed border style' },
  { type: 'callout', ctx: { variant: 'success' }, why: 'double border style' },
  { type: 'callout', ctx: { variant: 'note' }, why: 'dotted border style' },
  {
    type: 'interactive_graph',
    ctx: { interaction: 'plot_point' },
    why: 'question variant prints EMPTY axes',
  },
  {
    type: 'interactive_graph',
    ctx: { interaction: 'display' },
    why: 'display variant prints its AUTHORED drawables (OV4)',
  },
  {
    type: 'data_plot',
    ctx: { interaction: 'display' },
    why: 'display variant prints the authored chart',
  },
  {
    type: 'data_plot',
    ctx: { interaction: 'build_histogram' },
    why: 'build variant prints an empty chart frame',
  },
  {
    type: 'number_line',
    ctx: { interaction: 'plot_interval' },
    why: 'interval endpoints are answer content, so the printed line must be blank',
  },
];

/** Class 2 — STRUCTURAL fixtures. Layout is rows-of-columns in the schema and
 * the renderer's print layer keeps columns side by side and applies per-block
 * footprint sizing; a per-block roster cannot express any of that
 * (outside-voice #2). Enumerated by hand, guard-checked for completeness
 * against this list so adding one is deliberate. */
export const structuralPrintRoster: readonly {
  readonly id: string;
  readonly rule: string;
}[] = [
  {
    id: 'structure/multi-column-row',
    rule: 'A two-column row prints side by side, not collapsed to one column.',
  },
  {
    id: 'structure/block-sizing',
    rule: 'Per-block footprint sizing (width preset, work space) is honored on paper — footprint control is the point of the feature.',
  },
  {
    id: 'structure/section-confidence',
    rule: 'A section with confidence-rating problems prints hand-tickable boxes in place of the interactive fieldset.',
  },
  {
    id: 'structure/section-flow',
    rule: 'Sections flow naturally rather than forcing a page break.',
  },
];

/** Class 3 — DOCUMENT fixtures. These reach STUDENTS today via Ctrl+P on a
 * published page, and none of them is a block, so the per-block roster is blind
 * to them (outside-voice #1 — the finding that moved the whole document print
 * layer into S5 rather than the S5.5 teacher-print slice). */
export const documentPrintRoster: readonly {
  readonly id: string;
  readonly rule: string;
}[] = [
  {
    id: 'document/print-header',
    rule: 'Configured header fields (Name, Date, …) print as labeled fill-in lines, with custom labels honored and the header omitted entirely when no field is enabled.',
  },
  {
    id: 'document/reference-panel',
    rule: 'The reference panel prints as a static box at the top when the teacher left printReferencePanel on, and not at all when off; the screen tool never prints.',
  },
  {
    id: 'document/definition-glossary',
    rule: 'Inline definitions print as an end-of-worksheet glossary appendix when printDefinitionGlossary is on; the popover never prints.',
  },
  {
    id: 'document/page-size',
    rule: 'The configured paper size and margin reach the @page box (letter vs A4).',
  },
  {
    id: 'document/print-vars',
    rule: 'Configured font size, problem spacing, and work space take effect on paper.',
  },
  {
    id: 'document/worksheet-heading',
    rule: 'The worksheet prints its own title and course line: on screen the top bar carries them, and the top bar is chrome that does not print.',
  },
  {
    id: 'document/typography',
    rule: 'A teacher-chosen worksheet font is applied by NAME on both surfaces (never pixel-compared — the font pipelines differ by design).',
  },
];
