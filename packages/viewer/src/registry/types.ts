// =============================================================================
// registry/types.ts — the block-registry CONTRACT (S0, ruling Q1A)
// -----------------------------------------------------------------------------
// ONE declarative encoding of per-block-type metadata for the student path,
// consolidating what today lives in four drifting places (renderBlock's switch,
// the runtime's data-block-type selectors, data-block-category emission, and
// RUNTIME.md's per-type contract sections) plus the rulings this arc added:
// checked-state family (7.2A), answer-key sanitize spec (TV4-A), analytics key
// (P3A), and the per-block a11y story (6.1A).
//
// What the registry deliberately does NOT absorb:
//  - packages/schema/src/block-predicates.ts stays the RULE ENGINE for
//    numbering and gradability — it is shared with the renderer and editor,
//    which outlive S0. The registry DECLARES each block's numbering mode and
//    the guard suite proves the declaration and the predicates agree, so the
//    two can never drift silently. Instance-level resolution (familyOf,
//    categoryOf) delegates to isGradeable/isPageNumbered.
//  - Editor-only metadata (slash-menu entries, import fences, Tiptap node
//    names) stays in @activity/app — the registry is the STUDENT-path truth;
//    Q1A shares presentational internals with NodeViews, not authoring config.
//
// Lanes A (read API S2→S4) and B (viewer S3→S5/S6) both consume this file.
// Per the S0 conflict rule: changes to the contract land HERE first, never
// forked per-lane.
// =============================================================================

import type { ComponentType } from 'react';
import type { Block } from '@activity/schema';

/** Every schema block type, derived from the union so a new block type is a
 * compile error here before it is a missing registry entry. */
export type BlockType = Block['type'];

/** Checked-state family (ruling 7.2A — the one-page spec lives in
 * docs/design/checked-state-families.md and GATES T6):
 *  - auto_gradable — server-checked; may show ✓ / ✗ + optional feedback.
 *  - recorded     — captured for teacher review; shows "Recorded ✓", NEVER a
 *                   verdict glyph.
 *  - static       — no state chrome of any kind.
 * A type's declared family is its MAXIMAL family; an instance resolves through
 * familyOf() (a display-mode graph or promptless math block is static). */
export type CheckedStateFamily = 'auto_gradable' | 'recorded' | 'static';

/** Whether this block type CAN accept student input (drives store wiring and
 * the a11y-story guard). Maximal, like family: an interactive type's static
 * instances (display graph) take no input — resolve via familyOf(), where
 * 'static' means no input surface.
 *
 * NOTE one deliberate divergence from the old runtime classification
 * (runtime-doc-contract.test.ts): math_block was CONTAINER there because its
 * gaps carry the data contract, not the block. In the React world the
 * component owns its gaps, so a gap-bearing math_block is INTERACTIVE — the
 * registry classifies by what the component does, and the guard suite is the
 * new invariant home (TV4-A guard-suite arc). */
export type Interactivity = 'interactive' | 'container';

/** The renderer's data-block-category axis, carried over: question / content /
 * scaffold. Declared maximal (a display graph serves as content — resolve per
 * instance via categoryOf()). */
export type BlockCategory = 'question' | 'content' | 'scaffold';

/** Page-numbering participation. Declarative mirror of block-predicates.ts:
 *  - always        — draws "Problem N" (modulo the per-block label override).
 *  - when_gradable — numbered iff the instance is gradable (graphs/data plots
 *                    outside display mode; math blocks with prompts).
 *  - never         — no number.
 * Guard-enforced against isPageNumberedType so this can't drift from the rule
 * engine while both exist. */
export type NumberingRule = 'always' | 'when_gradable' | 'never';

/** Answer-key sanitize spec (ruling TV4-A). The S2/T3 sanitizer is a generic
 * transform driven ENTIRELY by these declarations — it holds no per-type
 * knowledge of its own. Wire-level leak tests assert the outcome.
 *
 * Path grammar (kept deliberately tiny; the sanitizer implements exactly this):
 *  - 'field'            — delete the block's top-level field.
 *  - 'field[].sub'      — delete `sub` from every element of array `field`.
 *  - 'interaction.field'— delete `field` from the interaction object when
 *                          present (variant-scoped keys simply don't match on
 *                          other variants). */
export interface SanitizeSpec {
  /** Field paths deleted before a block reaches any student client. */
  readonly strip: readonly string[];
  /** This block's inline content carries in-band secrets: BlankToken fields
   * (BLANK_SECRET_FIELDS) in `content`, and MathPrompt fields
   * (MATH_PROMPT_SECRET_FIELDS) in `prompts`. DECLARATIVE, not load-bearing:
   * the S2 sanitizer strips in-band secrets by a deep walk over EVERY block
   * regardless of this flag (defense in depth — the schema admits a prompted
   * math_inline in any content array, not just where declared), so a missing
   * flag can never leak. The flag remains the documented expectation and the
   * type-projection signal (which blocks get sanitized inline unions). */
  readonly inlineBlankSecrets?: boolean;
  /** Arrays whose AUTHORED ORDER is the answer key (ordering.items). The
   * sanitizer must re-shuffle them per serve (deterministically per version +
   * student, so a reload doesn't reshuffle under the student's feet) — a strip
   * can't help when the order itself is the secret. */
  readonly serveShuffled?: readonly string[];
  /** Documented residual: the answer is derivable from data the student MUST
   * receive (data_plot: the correct chart is computed from the data set the
   * student plots). States WHY that is acceptable, so the leak tests can
   * whitelist it explicitly instead of silently skipping the block. */
  readonly derivableFromServed?: string;
  /** Nested Block[] fields the sanitizer recurses into (worked examples).
   * Children are sanitized by their OWN registry entries. */
  readonly childBlocks?: readonly string[];
}

/** Named paper treatments — the print vocabulary T8 builds against (ported
 * from the baseline print layer in renderer/src/runtime/styles.ts). */
export type PrintTreatment =
  | 'prose' /* text flows as-is */
  | 'figure' /* image / static SVG figure, capped width */
  | 'variant-border-box' /* callout: variant encoded in border STYLE for grayscale */
  | 'bordered-box' /* scaffold card: plain black border (faded example: dashed) */
  | 'underline-blanks' /* inputs neutralize to bare writing lines */
  | 'choice-letters' /* native inputs hidden; letters are the circle-me markers */
  | 'letter-bank' /* matching: lettered bank + write-the-letter line per item */
  | 'number-boxes' /* ordering: write-in sequence box per row */
  | 'static-svg' /* interactive canvas prints its server-rendered fallback SVG */
  | 'writing-box'; /* free text: bordered hand-writing area */

export interface PrintSpec {
  /** break-inside: avoid — the block stays whole across page/column breaks.
   * Declared FAITHFUL to the current baseline print CSS (T8 parity gate
   * compares against it); known oddities are commented on the entries. */
  readonly breakInside: 'avoid' | 'auto';
  readonly treatment: PrintTreatment;
  /** Never strand this block at a page bottom (headings). */
  readonly keepWithNext?: boolean;
  /** Participates in the answer-key print variant (showAnswers today; the T8
   * teacher answer-key variant later). */
  readonly answerKeyVariant?: boolean;
}

/** Per-block a11y story (ruling 6.1A). REQUIRED for every interactive type —
 * guard-enforced. Free text, one paragraph: the full keyboard path and what
 * gets announced. The T6 component must implement what its story says. */
export interface A11ySpec {
  readonly story: string;
}

/** Props every block component receives. Deliberately minimal in S0 — the
 * store seam (S3) extends this; extending is additive, lanes must not fork it.
 * `block` is the SANITIZED wire shape: schema-typed, but answer-key fields are
 * absent at runtime per the entry's SanitizeSpec (the type-level sanitized
 * projection is S2's deliverable). */
export interface BlockComponentProps<B extends Block = Block> {
  readonly block: B;
  readonly mode: 'screen' | 'print';
}

/** Lazy component binding — the dynamic import IS the per-block chunk (P1A). */
export type LazyBlockComponent = () => Promise<{
  default: ComponentType<BlockComponentProps>;
}>;

/** How a block's component reaches the page (ruling D16, amending P1A as
 * applied). Lazy-loading EVERY block was over-broad: paragraph/heading/lists
 * appear on ~100% of worksheets, so chunking them buys ~1 KiB at the cost of a
 * request waterfall and a Suspense boundary in every test. The split:
 *
 *  - 'eager' — statically imported into the shell. Light, near-universal
 *    blocks. Renders on first paint, no fallback flash, sync in tests.
 *  - 'lazy'  — the dynamic import IS the chunk. Reserved for blocks that drag
 *    real weight behind them (the graph-kit family; anything pulling MathLive).
 *    Inline math is separately lazy (inline/math.ts), so carrying math does not
 *    by itself make a block lazy.
 *
 * S8's perf budget measures and corrects; this declaration is what it measures.
 * Unset in S0 (no components existed); V5 binds the exemplars. */
/** Parameterized by block type so a component may be written against its OWN
 * block (`BlockComponentProps<ParagraphBlock>`) instead of the whole union —
 * a component that had to accept every block would need a discriminant switch
 * it can never hit. The container casts once at the resolution seam. */
export type BlockComponentBinding<T extends BlockType = BlockType> =
  | {
      readonly loading: 'eager';
      readonly component: ComponentType<BlockComponentProps<Extract<Block, { type: T }>>>;
    }
  | {
      readonly loading: 'lazy';
      readonly load: () => Promise<{
        default: ComponentType<BlockComponentProps<Extract<Block, { type: T }>>>;
      }>;
    };

export interface BlockRegistryEntry<T extends BlockType = BlockType> {
  readonly type: T;
  readonly family: CheckedStateFamily;
  readonly interactivity: Interactivity;
  readonly category: BlockCategory;
  readonly numbered: NumberingRule;
  /** Census key (P3A). By convention identical to `type`; blocks with an
   * interaction axis get per-variant keys via censusKeyOf() —
   * `interactive_graph.plot_point`. */
  readonly analyticsKey: string;
  /** interaction.type values, for the three blocks with an interaction axis.
   * Guard-checked against the schema's inner discriminated union. */
  readonly variants?: readonly string[];
  readonly sanitize: SanitizeSpec;
  readonly print: PrintSpec;
  /** Required when interactivity === 'interactive' (guard-enforced). */
  readonly a11y?: A11ySpec;
  /** How this block's component loads. Unset = not yet built (the container
   * renders an honest placeholder). */
  readonly binding?: BlockComponentBinding<T>;
}

export type BlockRegistry = { readonly [T in BlockType]: BlockRegistryEntry<T> };
