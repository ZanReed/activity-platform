// =============================================================================
// answer-key/types.ts — the teacher answer-key contract (S5.5 T1, ruling D3A)
// -----------------------------------------------------------------------------
// The answer key travels BESIDE the served document, never inside it. That is
// the whole point of ruling D3A: the viewer's components stay typed against
// SanitizedActivityDocument — the shape whose defining property is that answers
// have been stripped — and the teacher-print route supplies answers through a
// second, separately-typed channel that only it mounts. A student route that
// never provides the channel cannot render an answer no matter what a component
// asks for, and that is a property of the import graph rather than of anyone
// remembering a flag.
//
// KEYED BY ID, NEVER BY POSITION. Every entry names the thing it answers by its
// authored id: a choice id, a target id, an item id. It deliberately does NOT
// carry "the answer is B" or "this goes third", because the letter and the
// number depend on the order the sheet was SERVED in, and print shuffles that
// order per version (D15A/D5). A component derives the visible letter from the
// order it is rendering, so one canonical key stays correct for every printed
// variant. Bake a position in here and every version after the first prints a
// key that quietly disagrees with its own worksheet.
//
// CANONICAL ONLY. A blank prefills with `answer`, never the acceptableAnswers
// alternates — a key wants one definitive value on the line (the renderer made
// the same call in inline.ts). Grading still accepts every alternate; this is
// about what a teacher reads while marking.
// =============================================================================

import type { Drawable, InlineNode } from '@activity/schema';
import type { NumberLineMark } from '@activity/graph-kit/static-svg';
import type { BlockType } from '../registry/types.js';

/**
 * Everything known about one block's answers. A composite rather than a
 * discriminated union because a single block can legitimately carry more than
 * one kind at once — a fill_in_blank whose content holds both blank tokens and
 * a prompted math_inline answers in two channels, and the deep walk that finds
 * them does not care which block type it is standing in.
 *
 * Every field is optional and absent when empty, so a block with no answers is
 * simply not in the map.
 */
export interface BlockAnswerKey {
  /** Blank token id → canonical answer text. In-band (see extract.ts). */
  readonly blanks?: Readonly<Record<string, string>>;
  /** Math-gap prompt id → canonical answer latex. In-band. */
  readonly mathGaps?: Readonly<Record<string, string>>;
  /** Ids of the correct choices — plural: multiSelect questions have several. */
  readonly correctChoiceIds?: readonly string[];
  /** Matching item id → the target id it pairs with (NOT the printed letter). */
  readonly targetIdByItemId?: Readonly<Record<string, string>>;
  /** Ordering item id → its 1-based position in the AUTHORED (correct) order. */
  readonly positionByItemId?: Readonly<Record<string, number>>;
  /**
   * Drawables the graph twin overlays on otherwise-empty axes (D8A). A DISTINCT
   * channel from a display figure's authored `drawables`: S5-OV4 narrowed the
   * twin so a question variant cannot carry those at all, and that narrowing is
   * what proves a student's worksheet prints blank axes. Teacher answers must
   * therefore arrive somewhere else — here — rather than by widening it.
   */
  readonly graphOverlay?: readonly Drawable[];
  /**
   * The graded answer is "no solution" (`noSolutionCorrect`), for which the
   * overlay is legitimately empty. Surfaced because an empty overlay alone is
   * ambiguous with "this question has no key", and a teacher reading a blank
   * grid cannot tell which they are looking at.
   */
  readonly graphNoSolution?: true;
  /** Marks the number-line twin overlays (points, or an interval/ray). */
  readonly numberLineMarks?: readonly NumberLineMark[];
  /**
   * The dataset the correct chart is built from. Not a secret — the student is
   * given this data to plot (the registry's documented `derivableFromServed`
   * residual) — but it IS what the key draws, so it travels the same channel.
   */
  readonly dataPlotValues?: readonly number[];
  /**
   * A WRITTEN answer, as rich inline content (answer-key slice, ruling E2/§2).
   * The first channel here that is prose rather than a value or a coordinate,
   * because the blocks it serves — short_answer and essay — are marked by a
   * human reading what a student wrote against what the teacher wrote.
   *
   * The EXTRACTOR resolves which field this came from (`answer`, else
   * `solution`), and that placement is deliberate: components render the
   * SANITIZED document, in which neither field exists any more, so a component
   * that tried to fall back would be reaching for something that is gone by
   * construction. Ruling §2 puts the fallback where the fields still exist.
   */
  readonly writtenAnswer?: readonly InlineNode[];
  /**
   * Which field `writtenAnswer` came from. A post-check EXPLANATION printed
   * under the word "Answer" would misrepresent it to the teacher marking with
   * it, so the component labels the fallback for what it is.
   */
  readonly writtenAnswerSource?: 'answer' | 'solution';
  /**
   * The block is keyed as MANUALLY GRADED: it is a question a teacher marks,
   * and the author supplied neither an answer nor a solution. Present so the
   * key prints a row saying so ("manually graded — see rubric") instead of
   * silently omitting the question — a key with a hole in it is worse than a
   * key that says the hole is intentional, because the teacher discovers the
   * difference mid-marking.
   */
  readonly manuallyGraded?: true;
}

/** Block id → its answers. Flat: nested blocks key by their OWN id, so a
 * component looks itself up without knowing how deeply it is contained. */
export type AnswerKeyMap = Readonly<Record<string, BlockAnswerKey>>;

/**
 * The ink an answer overlay draws in — a distinct neutral layer rather than the
 * display palette, so a teacher reads "this was added for the key" instead of
 * mistaking it for authored content. The value the renderer's answer-key print
 * has always used; kept here so the components and the parity gate share ONE
 * definition instead of each spelling the hex out.
 */
export const ANSWER_KEY_INK = '#1e293b';

/**
 * How each keyed block type's answers reach the key.
 *
 * ⚠ THE ROSTER CONTRACT WAS AMENDED 2026-08-20 (answer-key slice, ruling §2).
 * It used to be an EQUALITY — coverage named exactly the `auto_gradable`
 * types — and it is now a CONTAINMENT: **keyed ⊇ auto-gradable**. Every
 * auto_gradable type must still appear (a machine-graded question with no key
 * is the failure the roster exists to catch), but a keyed type need not be
 * auto-gradable: short_answer and essay are `recorded`-family blocks that carry
 * a teacher's written answer precisely BECAUSE no machine will grade them.
 *
 * The widening is bounded, and the bound is the point: a keyed type must be a
 * QUESTION (registry category), never static content. `self_explanation` is a
 * question block that is deliberately NOT keyed — ungraded reflection has no
 * right answer to print — and the guard pins that exclusion by name so it stays
 * a decision rather than an omission (E5/finding 11).
 *
 * The forced-choice shape is unchanged, and so is its reason: silence in a
 * coverage map reads as "handled" when it actually means "nobody looked"
 * (S4's CORPUS_COVERAGE, same shape).
 */
export type AnswerKeyCoverage =
  /** A per-type extractor reads the block's own answer fields. */
  | { readonly via: 'extractor' }
  /** Answers live in-band (blank tokens / math gaps) and are found by the deep
   *  structural walk, so no per-type code exists or should. */
  | { readonly via: 'in-band'; readonly note?: string }
  /** A container: it answers through its child blocks, which key by their own
   *  ids. Mirrors the conformance factory's container invariant. */
  | { readonly via: 'children'; readonly reason: string };

export const ANSWER_KEY_COVERAGE: Readonly<
  Partial<Record<BlockType, AnswerKeyCoverage>>
> = {
  fill_in_blank: { via: 'in-band' },
  math_block: {
    via: 'in-band',
    // VIEWER-ONLY IMPROVEMENT, recorded deliberately (the S5-OV6 pattern).
    // The renderer's answer key leaves math gaps EMPTY — renderMathBlock is
    // called without showAnswers (blocks/index.ts) and renderMathPromptBody
    // takes displayMode, not answers — so a gap-bearing equation, which IS a
    // graded question, printed a key with nothing in it. Extracting the gap
    // answers here closes that hole; the parity gate must name this as a
    // viewer-only improvement rather than assert it on both surfaces.
    note: 'renderer printed empty gaps; the viewer fills them (viewer-only)',
  },
  // A table's cell blanks ARE blank tokens, found by the same unconditional
  // in-band walk that finds them in prose — no per-type extractor, and none
  // wanted: the day a new block embeds blanks, its key is already correct.
  table: { via: 'in-band' },
  multiple_choice: { via: 'extractor' },
  matching: { via: 'extractor' },
  ordering: { via: 'extractor' },
  interactive_graph: { via: 'extractor' },
  number_line: { via: 'extractor' },
  data_plot: { via: 'extractor' },
  faded_worked_example: {
    via: 'children',
    reason:
      'a scaffold whose steps are nested fill_in_blank blocks; each step keys ' +
      'by its own block id, exactly as the renderer delegated showAnswers to ' +
      'renderFillInBlank per child',
  },
  // The two RECORDED-family entries — the containment amendment above in the
  // concrete. Their key is the teacher's own words, and the extractor resolves
  // answer → solution → "manually graded".
  short_answer: { via: 'extractor' },
  essay: { via: 'extractor' },
};
