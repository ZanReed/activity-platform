import type { MatchingBlock, MatchingItem, MatchingTarget, PageLabel } from '@activity/schema';
import { renderInlineNodes } from '../inline.js';
import { attr, escape } from '../html.js';
import { renderNumberGutter } from './number-gutter.js';
import { renderGraphSvg } from '../graph-svg.js';
import { seededShuffle } from './shuffle.js';

export interface MatchingRenderContext {
  problemNumber: number;
  label?: PageLabel;
  /** Answer-key print variant: fill each item's letter line (Drop C parity). */
  showAnswers?: boolean;
}

// Target letters A., B., C., … — assigned by position AFTER the publish-time
// shuffle (never authored), so the letters students discuss are the letters
// on paper. Same 26-cap reasoning as MC choice letters.
function targetLetter(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

/**
 * Optional figure (image and/or static graph) on an item or target — the same
 * single-figure-slot treatment as MC choices (multiple-choice.ts): kit-free
 * SVG engine, works on paper, `expression` drawables absent by that engine's
 * documented limitation. SVG ids namespaced by block+owner id.
 */
function renderMatchFigure(
  owner: MatchingItem | MatchingTarget,
  blockId: string,
): string {
  const image = owner.image
    ? '<img src="' + attr(owner.image.src) + '"' +
      ' alt="' + attr(owner.image.alt) + '"' +
      ' loading="lazy"' +
      ' decoding="async"' +
      ' />'
    : '';
  const graph = owner.graph
    ? renderGraphSvg(owner.graph.axis, owner.graph.drawables, blockId + '-' + owner.id)
    : '';
  if (!image && !graph) return '';
  return '<span class="match-figure">' + image + graph + '</span>';
}

/**
 * Matching question block. Mirrors renderMultipleChoice's chrome (problem
 * number + body grid, confidence fieldset + print row, solution slot) so the
 * runtime treats every question family uniformly.
 *
 * Contract with the runtime (all read once at init):
 *   - data-block-type="matching" on the block root; data-block-id.
 *   - data-match-key: JSON object of item id → correct target id — the
 *     baked-in answer key (same client-side-scoring ceiling as
 *     data-mc-answer).
 *   - data-match-reuse="true" only when allowTargetReuse. Omit-when-default.
 *   - each .match-item carries data-item-id and contains an empty .match-slot
 *     (the dock: render() moves — or under reuse, copies — a target card in).
 *   - each .match-target carries data-target-id and sits inside a
 *     .match-target-slot (also data-target-id) holding a ghost letter that
 *     render() reveals while the card is docked elsewhere.
 *   - targets are emitted in the PUBLISH-TIME SHUFFLED order (deterministic,
 *     seeded by block id); letters follow the shuffled positions.
 *
 * Print: the native interaction is unavailable, so each item shows a
 * write-the-letter line (.match-letter-line — blank, or the correct letter in
 * the answer-key variant) and the target column reads as the lettered bank.
 */
export function renderMatching(
  block: MatchingBlock,
  ctx: MatchingRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  const showAnswers = ctx.showAnswers ?? false;

  const shuffledTargets = seededShuffle(block.targets, block.id);
  const letterByTargetId = new Map<string, string>(
    shuffledTargets.map((t, i) => [t.id, targetLetter(i)]),
  );

  const itemsHtml = block.items
    .map((item) => {
      const keyedTarget = block.key[item.id];
      const answerLetter =
        showAnswers && keyedTarget
          ? letterByTargetId.get(keyedTarget) ?? ''
          : '';
      const letterLine = answerLetter
        ? '<span class="match-letter-line match-key-correct" aria-hidden="true">' +
          escape(answerLetter) +
          '</span>'
        : '<span class="match-letter-line" aria-hidden="true"></span>';
      return (
        '<div class="match-item" role="listitem"' +
        ' data-item-id="' + attr(item.id) + '">' +
        letterLine +
        '<span class="match-item-content">' +
        renderInlineNodes(item.content) +
        renderMatchFigure(item, block.id) +
        '</span>' +
        '<span class="match-slot" data-item-id="' + attr(item.id) + '"></span>' +
        '</div>'
      );
    })
    .join('');

  const targetsHtml = shuffledTargets
    .map((target, index) => {
      const letter = targetLetter(index);
      return (
        '<div class="match-target-slot" role="listitem"' +
        ' data-target-id="' + attr(target.id) + '">' +
        '<span class="match-slot-ghost" aria-hidden="true">' +
        escape(letter) +
        '.</span>' +
        '<div class="match-target" data-target-id="' + attr(target.id) + '"' +
        ' tabindex="0">' +
        '<span class="match-target-letter" aria-hidden="true">' +
        escape(letter) +
        '.</span>' +
        '<span class="match-target-content">' +
        renderInlineNodes(target.content) +
        renderMatchFigure(target, block.id) +
        '</span>' +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  // Block-level chrome — identical patterns to renderMultipleChoice (see
  // renderFillInBlank for the original reasoning on each piece).
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
  const reuseAttr = block.allowTargetReuse ? ' data-match-reuse="true"' : '';

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

  // Visible instruction parity with MC's "Select all that apply." hint —
  // reuse changes the interaction contract, so say so.
  const reuseHint = block.allowTargetReuse
    ? '<div class="match-reuse-hint">Options may be used more than once.</div>'
    : '';

  return (
    '<div class="block block-matching"' +
    ' data-block-category="question"' +
    ' data-block-type="matching"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' data-match-key="' + attr(JSON.stringify(block.key)) + '"' +
    reuseAttr +
    ratingAttr +
    skillsAttr +
    workSpaceStyle +
    '>' +
    renderNumberGutter(ctx.label, num) +
    '<div class="block-problem-body">' +
    '<div class="match-prompt">' + renderInlineNodes(block.prompt) + '</div>' +
    reuseHint +
    '<div class="match-columns">' +
    '<div class="match-items" role="list" aria-label="Items to match">' +
    itemsHtml +
    '</div>' +
    '<div class="match-targets" role="list" aria-label="Answer options">' +
    targetsHtml +
    '</div>' +
    '</div>' +
    // Screen-reader narration line for the drag/keyboard interaction (the
    // runtime writes short status messages into it — the graph widget's
    // narrate-line precedent).
    '<span class="sr-status js-match-status" aria-live="polite"></span>' +
    confidenceFieldset +
    printConfidence +
    solutionSlot +
    '</div>' +
    '</div>'
  );
}
