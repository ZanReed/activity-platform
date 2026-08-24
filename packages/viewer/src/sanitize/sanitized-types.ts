// =============================================================================
// sanitize/sanitized-types.ts — the type-level sanitized projection (S2)
// -----------------------------------------------------------------------------
// The wire shape the viewer receives: schema-typed, but with the answer-key
// fields ABSENT — the deliverable registry/types.ts promised for
// BlockComponentProps.block. TYPES ONLY (nothing here exists at runtime); the
// runtime truth is sanitize.ts, and the guard tests hold the two together:
// the leak suite proves the runtime strips what these types say is gone, and
// the type assertions in tests/sanitized-types.test.ts prove these types say
// gone what the registry declares stripped.
//
// Construction: a targeted DEEP replacement (DeepSanitizeInline) swaps the two
// in-band secret carriers (BlankToken, MathPrompt) for their sanitized twins
// anywhere they appear, then SanitizeBlockType applies each block type's
// declared top-level strips by discriminant. Explicit Omit-key unions per
// block (mirroring registry entries) rather than a string-literal derivation
// from the SanitizeSpec paths — the spec grammar ('choices[].correct',
// 'interaction.tolerance') doesn't map to keyof mechanically, and the guard
// tests are the anti-drift mechanism, not type gymnastics.
// =============================================================================

import type {
  ActivityDocument,
  BlankToken,
  Block,
  Column,
  DataPlotInteraction,
  GraphInteraction,
  HardBreakNode,
  InlineMathNode,
  MathPrompt,
  NumberLineInteraction,
  Row,
  Section,
  TextNode,
} from '@activity/schema';
import type {
  BLANK_SECRET_FIELDS,
  MATH_PROMPT_SECRET_FIELDS,
} from '../registry/registry.js';

// ---- In-band carriers -------------------------------------------------------

/** The secret-field unions, derived from the registry's runtime lists so the
 * types can't silently diverge from what the sanitizer actually deletes. */
export type BlankSecretField = (typeof BLANK_SECRET_FIELDS)[number];
export type MathPromptSecretField = (typeof MATH_PROMPT_SECRET_FIELDS)[number];

/** A blank as the student receives it: id/width/hint/answerType survive (they
 * shape the input and the pre-check affordances); the key does not. */
export type SanitizedBlankToken = Omit<BlankToken, BlankSecretField>;

/** A math gap as served: the placeholder id survives (it IS the gap); the
 * answer and grading knobs do not. */
export type SanitizedMathPrompt = Omit<MathPrompt, MathPromptSecretField>;

export type SanitizedInlineMathNode = Omit<InlineMathNode, 'prompts'> & {
  prompts?: SanitizedMathPrompt[];
};

export type SanitizedInlineNode =
  | TextNode
  | SanitizedInlineMathNode
  | HardBreakNode;

export type SanitizedFillInBlankInline =
  | TextNode
  | SanitizedInlineMathNode
  | HardBreakNode
  | SanitizedBlankToken;

// ---- Deep in-band replacement ----------------------------------------------

/** Replace BlankToken / MathPrompt with their sanitized twins wherever they
 * appear in a type — content arrays, hints, list items, choice content.
 * Distributes over unions; leaves everything else structurally intact. */
export type DeepSanitizeInline<T> = T extends InlineMathNode
  ? SanitizedInlineMathNode
  : T extends BlankToken
    ? SanitizedBlankToken
    : T extends MathPrompt
      ? SanitizedMathPrompt
      : T extends readonly (infer U)[]
        ? DeepSanitizeInline<U>[]
        : T extends object
          ? { [K in keyof T]: DeepSanitizeInline<T[K]> }
          : T;

// ---- Interaction projections (variant-scoped strips) ------------------------

/** Distributive Omit — applies per union member, keeping discriminants. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K & keyof T>
  : never;

/** interactive_graph: every variant loses its answer geometry + tolerance;
 * `display` (no key) passes through structurally unchanged. */
export type SanitizedGraphInteraction = DistributiveOmit<
  DeepSanitizeInline<GraphInteraction>,
  | 'correctPoints'
  | 'tolerance'
  | 'models'
  | 'domains'
  | 'regions'
  | 'inequalities'
  | 'rays'
  | 'segments'
>;

export type SanitizedNumberLineInteraction = DistributiveOmit<
  DeepSanitizeInline<NumberLineInteraction>,
  'correctPoints' | 'correctInterval' | 'tolerance'
>;

export type SanitizedDataPlotInteraction = DistributiveOmit<
  DeepSanitizeInline<DataPlotInteraction>,
  'tolerance'
>;

// ---- Per-block projection ---------------------------------------------------

/** Apply one block type's declared strips (mirroring its registry entry) on
 * top of the deep in-band replacement. Distributes over any block union, so
 * nested unions (WorkedExampleChild, FadedWorkedExampleChild) project through
 * the same rules as top-level blocks — a child fill_in_blank loses its
 * solution exactly like a top-level one. */
/** The one field the sanitizer ADDS (SanitizeSpec.deriveQuestionShape): the
 * question's layout shape, derived from the answer key and whitelisted to
 * counts + a closed family enum. Optional because a display-mode instance
 * takes no input and gets none. */
export interface SanitizedQuestionShape {
  handleCount?: number;
  family?: string;
  vertexCount?: number;
}

export type SanitizeBlockType<B> = B extends { type: 'math_block' }
  ? Omit<DeepSanitizeInline<B>, 'solution'>
  : B extends { type: 'problem' }
    ? Omit<DeepSanitizeInline<B>, 'solution'>
    : B extends { type: 'fill_in_blank' }
      ? Omit<DeepSanitizeInline<B>, 'solution'>
      : B extends { type: 'interactive_graph' }
        ? Omit<
            DeepSanitizeInline<B>,
            | 'interaction'
            | 'mistakeFeedback'
            | 'solution'
            | 'noSolutionCorrect'
            | 'builtinFeedback'
          > & {
            interaction: SanitizedGraphInteraction;
            questionShape?: SanitizedQuestionShape;
          }
        : B extends { type: 'multiple_choice'; choices: readonly (infer C)[] }
          ? Omit<DeepSanitizeInline<B>, 'solution' | 'choices'> & {
              choices: Omit<
                DeepSanitizeInline<C>,
                'correct' | 'feedback' | 'misconceptionId'
              >[];
            }
          : B extends { type: 'matching' }
            ? Omit<DeepSanitizeInline<B>, 'key' | 'solution'>
            : B extends { type: 'ordering' }
              ? Omit<DeepSanitizeInline<B>, 'solution'>
              : B extends { type: 'number_line' }
                ? Omit<DeepSanitizeInline<B>, 'solution' | 'interaction'> & {
                    interaction: SanitizedNumberLineInteraction;
                    questionShape?: SanitizedQuestionShape;
                  }
                : B extends { type: 'data_plot' }
                  ? Omit<DeepSanitizeInline<B>, 'solution' | 'interaction'> & {
                      interaction: SanitizedDataPlotInteraction;
                      questionShape?: SanitizedQuestionShape;
                    }
                  : B extends { type: 'short_answer' }
                    ? Omit<DeepSanitizeInline<B>, 'rubric'>
                    : B extends { type: 'essay' }
                      ? Omit<DeepSanitizeInline<B>, 'rubric'>
                      : B extends {
                            type: 'worked_example' | 'faded_worked_example';
                            content: readonly (infer C)[];
                          }
                        ? Omit<DeepSanitizeInline<B>, 'content'> & {
                            content: SanitizeBlockType<C>[];
                          }
                        : DeepSanitizeInline<B>;

/** Every block, as served. The type BlockComponentProps.block resolves to at
 * runtime (registry/types.ts documents the promise; this is the delivery). */
export type SanitizedBlock = SanitizeBlockType<Block>;

// ---- Document projection ----------------------------------------------------

export type SanitizedColumn = Omit<Column, 'blocks'> & {
  blocks: SanitizedBlock[];
};
export type SanitizedRow = Omit<Row, 'columns'> & {
  columns: SanitizedColumn[];
};
export type SanitizedSection = Omit<Section, 'rows'> & {
  rows: SanitizedRow[];
};

/** The full wire document: everything the viewer receives from get-activity.
 * meta and referencePanel pass through untouched at the type level (they
 * declare no answer keys; the runtime deep walk still covers them). */
export type SanitizedActivityDocument = Omit<ActivityDocument, 'sections'> & {
  sections: SanitizedSection[];
};
