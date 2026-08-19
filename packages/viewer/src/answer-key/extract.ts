// =============================================================================
// answer-key/extract.ts — raw document → the teacher's answer key (S5.5 T1)
// -----------------------------------------------------------------------------
// Reads the AUTHORED document (the one that still has answers in it) and
// produces the block-id-keyed map the teacher-print route hands to the viewer
// through the AnswerKey context. Runs only on that route: nothing here is
// imported by the server bundle or by the student path, and a guard test proves
// the first half of that.
//
// TWO CHANNELS, ONE WALK — the same split the S2 sanitizer and S3's blockIndex
// already settled on:
//
//   IN-BAND answers (blank tokens, math gaps) are found STRUCTURALLY, at any
//   depth, without asking the registry what a block contains. A blank lives in
//   fill_in_blank.content, but also inside a faded_worked_example's steps, and a
//   prompted math_inline may appear in ANY content array — the schema admits it,
//   which is exactly why the sanitizer strips in-band secrets unconditionally
//   rather than by declaration. Mirroring that posture means a future block type
//   that embeds blanks gets a correct answer key the day it renders. The failure
//   this avoids is a printed key that is silently missing answers, which a
//   teacher discovers mid-marking.
//
//   OUT-OF-BAND answers (which choice is correct, which target pairs with which
//   item) live in per-type fields, so they need per-type code. Every gradable
//   type is accounted for in ANSWER_KEY_COVERAGE and a guard fails when a new
//   one appears without a decision.
//
// ⚠ WHAT "KEYED" MEANS WIDENED 2026-08-20 (answer-key slice). The roster used
// to be exactly the auto_gradable types; it is now **keyed ⊇ auto-gradable**,
// because short_answer and essay carry a teacher's written answer precisely
// because no machine grades them. See ANSWER_KEY_COVERAGE's own note.
//
// DISPLAY VARIANTS HAVE NO ANSWERS. familyOf() resolves a display-mode graph or
// chart to 'static' — it is a stimulus, not a question — so it contributes
// nothing, matching how blockIndex declines to put it in a check payload.
// =============================================================================

import { answerKeyDrawables, answerKeyMarks } from '@activity/graph-kit/static-svg';
import type { ActivityDocument, Block } from '@activity/schema';
import { childBlocksOf, looksLikeBlockArray } from '../container/blockIndex.js';
import { familyOf } from '../registry/registry.js';
import type { AnswerKeyMap, BlockAnswerKey } from './types.js';

interface InBandAnswers {
  blanks: Record<string, string>;
  mathGaps: Record<string, string>;
}

/**
 * Deep-walk one block for in-band answers, stopping at nested Block arrays so a
 * child's answers attribute to the child's own id rather than its container's.
 */
function collectInBand(value: unknown, out: InBandAnswers): void {
  if (Array.isArray(value)) {
    if (looksLikeBlockArray(value)) return;
    for (const item of value) collectInBand(item, out);
    return;
  }
  if (typeof value !== 'object' || value === null) return;

  const node = value as Record<string, unknown>;

  if (node.type === 'blank' && typeof node.id === 'string') {
    // Canonical answer only — never the acceptableAnswers alternates. A key
    // wants one definitive value on the line (the renderer's same call).
    if (typeof node.answer === 'string') out.blanks[node.id] = node.answer;
    return;
  }

  // A MathPrompt carrier: `latex` + `prompts`. Matched STRUCTURALLY rather than
  // by node type because the identical carrier shape is both an inline
  // math_inline node and a top-level math_block, and the schema admits it in
  // either position.
  if (typeof node.latex === 'string' && Array.isArray(node.prompts)) {
    for (const prompt of node.prompts) {
      const p = prompt as { id?: unknown; answer?: unknown } | null;
      if (typeof p?.id === 'string' && typeof p.answer === 'string') {
        out.mathGaps[p.id] = p.answer;
      }
    }
    // Keep walking siblings: a math_block also carries content fields.
  }

  for (const child of Object.values(node)) collectInBand(child, out);
}

/** Out-of-band, per-type answers. Empty for anything that resolves to static. */
function extractByType(block: Block): BlockAnswerKey {
  if (familyOf(block) === 'static') return {};

  switch (block.type) {
    case 'multiple_choice': {
      const correctChoiceIds = block.choices
        .filter((choice) => choice.correct)
        .map((choice) => choice.id);
      // Plural by design: a multiSelect question has several correct choices.
      return correctChoiceIds.length > 0 ? { correctChoiceIds } : {};
    }

    case 'matching': {
      // The authored pairing, item id → target id. The printed LETTER is not
      // stored: it depends on the order the targets were served in, which print
      // shuffles per version, so the component derives it from what it renders.
      const targetIdByItemId = { ...block.key };
      return Object.keys(targetIdByItemId).length > 0
        ? { targetIdByItemId }
        : {};
    }

    case 'ordering': {
      // The AUTHORED item order is the answer key (there is no separate key
      // field), so position n is simply the item's index in it.
      const positionByItemId: Record<string, number> = {};
      block.items.forEach((item, index) => {
        positionByItemId[item.id] = index + 1;
      });
      return { positionByItemId };
    }

    case 'interactive_graph': {
      const graphOverlay = answerKeyDrawables(block);
      // noSolutionCorrect draws NOTHING on purpose (the stored key is a decoy).
      // Flagged so the key can say "no solution" instead of printing a blank
      // grid a teacher cannot distinguish from a missing answer.
      return block.noSolutionCorrect
        ? { graphOverlay, graphNoSolution: true }
        : { graphOverlay };
    }

    case 'number_line':
      return { numberLineMarks: answerKeyMarks(block.interaction) };

    case 'data_plot':
      // The correct chart is computed from the dataset the student is given —
      // the same values the renderer handed its static SVG under showAnswers.
      return { dataPlotValues: block.data };

    // The manually-graded free-response pair (answer-key slice, ruling §2).
    // THE FALLBACK CHAIN LIVES HERE, and only here, because this function is
    // the last place both fields exist: `answer` and `solution` are stripped
    // from the served document, so the component that renders the key is
    // holding a block on which neither field is even a key any more. A
    // component-side fallback would be reaching for something already gone.
    //
    // Every one of these blocks produces an entry, including the empty case —
    // `manuallyGraded` is a positive statement ("a teacher marks this by hand,
    // against the rubric"), not the absence of one. A question missing from a
    // printed key is indistinguishable from a question the key forgot.
    case 'short_answer':
    case 'essay': {
      if (block.answer && block.answer.length > 0) {
        return { writtenAnswer: block.answer, writtenAnswerSource: 'answer' };
      }
      if (block.solution && block.solution.length > 0) {
        return { writtenAnswer: block.solution, writtenAnswerSource: 'solution' };
      }
      return { manuallyGraded: true };
    }

    default:
      return {};
  }
}

/**
 * One block's complete answer key, both channels merged. Exported for the
 * component layer and its tests; the document-level walk below is the normal
 * entry point.
 */
export function extractBlockAnswerKey(block: Block): BlockAnswerKey {
  const inBand: InBandAnswers = { blanks: {}, mathGaps: {} };
  collectInBand(block, inBand);
  return {
    ...extractByType(block),
    ...(Object.keys(inBand.blanks).length > 0 ? { blanks: inBand.blanks } : {}),
    ...(Object.keys(inBand.mathGaps).length > 0
      ? { mathGaps: inBand.mathGaps }
      : {}),
  };
}

/**
 * Walk an authored document into its answer key. Pure and cheap enough to run
 * on load; blocks with no answers are omitted entirely, so the map's key set is
 * itself a meaningful "what can be keyed" roster.
 */
export function extractAnswerKey(doc: ActivityDocument): AnswerKeyMap {
  const map: Record<string, BlockAnswerKey> = {};

  const visit = (block: Block): void => {
    const entry = extractBlockAnswerKey(block);
    if (Object.keys(entry).length > 0) map[block.id] = entry;
    // Children key by their OWN ids — the flat map is what lets a nested
    // fill_in_blank step look itself up without knowing it is nested.
    for (const child of childBlocksOf(block)) visit(child);
  };

  for (const section of doc.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) visit(block);
      }
    }
  }

  return map;
}
