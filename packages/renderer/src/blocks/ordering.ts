import type { OrderingBlock, PageLabel } from '@activity/schema';
import { renderInlineNodes } from '../inline.js';
import { attr, escape } from '../html.js';
import { renderNumberGutter } from './number-gutter.js';
import { seededShuffle } from './shuffle.js';

export interface OrderingRenderContext {
  problemNumber: number;
  label?: PageLabel;
  /** Answer-key print variant: fill each item's number box (Drop C parity). */
  showAnswers?: boolean;
}

/**
 * Ordering / sequencing question block. Mirrors renderMultipleChoice's chrome
 * (problem number + body grid, confidence fieldset + print row, solution
 * slot) so the runtime treats every question family uniformly.
 *
 * Contract with the runtime (all read once at init):
 *   - data-block-type="ordering" on the block root; data-block-id.
 *   - data-order-answer: JSON array of item ids in the AUTHORED (correct)
 *     order — the baked-in answer key (same client-side-scoring ceiling as
 *     data-mc-answer).
 *   - each .order-item carries data-item-id; items are emitted in the
 *     PUBLISH-TIME SHUFFLED order (deterministic, seeded by block id; never
 *     the authored order). render() re-sequences the list as the student
 *     drags.
 *
 * Print: drag is unavailable, so each item shows a write-in number box
 * (.order-number-box — blank, or the item's correct 1-based position in the
 * answer-key variant): "number the steps 1–N."
 */
export function renderOrdering(
  block: OrderingBlock,
  ctx: OrderingRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  const showAnswers = ctx.showAnswers ?? false;

  const correctIds = block.items.map((item) => item.id);
  const positionByItemId = new Map<string, number>(
    correctIds.map((id, i) => [id, i + 1]),
  );
  const shuffledItems = seededShuffle(block.items, block.id);

  const itemsHtml = shuffledItems
    .map((item) => {
      const answerNumber = showAnswers
        ? String(positionByItemId.get(item.id) ?? '')
        : '';
      const numberBox = answerNumber
        ? '<span class="order-number-box order-key-correct" aria-hidden="true">' +
          escape(answerNumber) +
          '</span>'
        : '<span class="order-number-box" aria-hidden="true"></span>';
      return (
        '<div class="order-item" role="listitem"' +
        ' data-item-id="' + attr(item.id) + '"' +
        ' tabindex="0">' +
        numberBox +
        '<span class="order-item-grip" aria-hidden="true">⠿</span>' +
        '<span class="order-item-content">' +
        renderInlineNodes(item.content) +
        '</span>' +
        '</div>'
      );
    })
    .join('');

  // Block-level chrome — identical patterns to renderMultipleChoice.
  const hasSolution = block.solution && block.solution.length > 0;
  const hasConfidenceRating = block.hasConfidenceRating;

  const ratingAttr = hasConfidenceRating
    ? ' data-has-confidence-rating="true"'
    : '';
  const skillsAttr =
    block.skills.length > 0
      ? ' data-skills="' + attr(JSON.stringify(block.skills)) + '"'
      : '';
  const workSpaceStyle =
    block.workSpace !== undefined
      ? ' style="--print-work-space:' + block.workSpace + 'rem"'
      : '';

  const confidenceFieldset = hasConfidenceRating
    ? '<fieldset class="js-confidence-rating"' +
      ' data-for-block="' + attr(block.id) + '">' +
      '<legend>How confident are you?</legend>' +
      '<label><input type="radio"' +
      ' name="conf-' + attr(block.id) + '"' +
      ' value="unsure" /> Unsure</label>' +
      '<label><input type="radio"' +
      ' name="conf-' + attr(block.id) + '"' +
      ' value="think_so" /> Think so</label>' +
      '<label><input type="radio"' +
      ' name="conf-' + attr(block.id) + '"' +
      ' value="certain" /> Certain</label>' +
      '</fieldset>'
    : '';

  const printConfidence = hasConfidenceRating
    ? '<div class="print-confidence" aria-hidden="true">' +
      '<span class="print-confidence-label">How confident are you?</span>' +
      '<span class="print-confidence-option">' +
      '<span class="print-confidence-box"></span> Unsure</span>' +
      '<span class="print-confidence-option">' +
      '<span class="print-confidence-box"></span> Think so</span>' +
      '<span class="print-confidence-option">' +
      '<span class="print-confidence-box"></span> Certain</span>' +
      '</div>'
    : '';

  const solutionSlot = hasSolution
    ? '<div class="js-solution"' +
      ' data-for-block="' + attr(block.id) + '"' +
      ' hidden>' +
      renderInlineNodes(block.solution!) +
      '</div>'
    : '';

  return (
    '<div class="block block-ordering"' +
    ' data-block-category="question"' +
    ' data-block-type="ordering"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' data-order-answer="' + attr(JSON.stringify(correctIds)) + '"' +
    ratingAttr +
    skillsAttr +
    workSpaceStyle +
    '>' +
    renderNumberGutter(ctx.label, num) +
    '<div class="block-problem-body">' +
    '<div class="order-prompt">' + renderInlineNodes(block.prompt) + '</div>' +
    '<div class="order-list" role="list" aria-label="Items to put in order">' +
    itemsHtml +
    '</div>' +
    // Screen-reader narration line (see matching.ts for the reasoning).
    '<span class="sr-status js-order-status" aria-live="polite"></span>' +
    confidenceFieldset +
    printConfidence +
    solutionSlot +
    '</div>' +
    '</div>'
  );
}
