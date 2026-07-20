import type { MultipleChoiceBlock, MultipleChoiceOption, PageLabel } from '@activity/schema';
import { renderInlineNodes } from '../inline.js';
import { attr } from '../html.js';
import { renderNumberGutter } from './number-gutter.js';
import { renderGraphSvg } from '../graph-svg.js';

export interface MultipleChoiceRenderContext {
  problemNumber: number;
  label?: PageLabel;
  /** Answer-key print variant: pre-check the correct choice(s) (Drop C). */
  showAnswers?: boolean;
}

// Choice letters A., B., C., … — teachers and students talk about "choice B",
// and the letters double as circle-me markers on paper (print hides the
// native inputs). 26 choices is far past any sane authoring, so wrap-around
// (AA…) is not handled.
function choiceLetter(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

/**
 * Optional per-choice figure (image and/or static graph), rendered below the
 * choice text inside the label so clicking the figure selects the choice.
 * The graph is the SAME kit-free SVG engine as the interactive block's
 * print/no-JS fallback (graph-svg.ts) — inline, static, works on paper;
 * `expression` drawables are absent by the engine's documented limitation.
 * The SVG's internal ids are namespaced by block+choice id (ids are
 * document-global and one block can hold several choice graphs).
 */
function renderChoiceFigure(
  choice: MultipleChoiceOption,
  blockId: string,
): string {
  const image = choice.image
    ? '<img src="' + attr(choice.image.src) + '"' +
      ' alt="' + attr(choice.image.alt) + '"' +
      ' loading="lazy"' +
      ' decoding="async"' +
      ' />'
    : '';
  const graph = choice.graph
    ? renderGraphSvg(
        choice.graph.axis,
        choice.graph.drawables,
        blockId + '-' + choice.id,
      )
    : '';
  if (!image && !graph) return '';
  return '<span class="mc-choice-figure">' + image + graph + '</span>';
}

/**
 * Multiple-choice question block. Mirrors renderFillInBlank's chrome exactly
 * (problem number + body grid, confidence fieldset + print row, solution
 * slot) so the runtime treats both question families uniformly.
 *
 * Contract with the runtime (all read once at init):
 *   - data-block-type="multiple_choice" on the block root; data-block-id.
 *   - data-mc-multi="true" only for multi-select ("select all that apply");
 *     absent = single-select (radios). Omit-when-default.
 *   - data-mc-answer: JSON array of the correct choice ids — the baked-in
 *     answer key (same client-side-scoring ceiling as data-blank-answers).
 *   - each <input> carries data-choice-id; name is namespaced by block id so
 *     two MC blocks never share a radio group.
 *   - per-choice feedback pre-rendered into a hidden .js-mc-feedback div
 *     (data-choice-id keyed) directly after its choice label; the runtime
 *     reveals it post-check when that choice was selected. Rich content is
 *     rendered server-side (KaTeX included) — the runtime only toggles
 *     `hidden`, mirroring the solution-slot pattern.
 */
export function renderMultipleChoice(
  block: MultipleChoiceBlock,
  ctx: MultipleChoiceRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  const showAnswers = ctx.showAnswers ?? false;
  const inputType = block.multiSelect ? 'checkbox' : 'radio';

  const correctIds = block.choices.filter((c) => c.correct).map((c) => c.id);

  const choicesHtml = block.choices
    .map((choice, index) => {
      // Answer-key print variant: pre-check the correct inputs so the printed
      // key shows the answer (the letter also gets a filled marker via the
      // .mc-key-correct print style).
      const checkedAttr = showAnswers && choice.correct ? ' checked' : '';
      const keyClass =
        showAnswers && choice.correct ? ' mc-key-correct' : '';
      const label =
        '<label class="mc-choice' + keyClass + '">' +
        '<input type="' + inputType + '"' +
        ' name="mc-' + attr(block.id) + '"' +
        ' value="' + attr(choice.id) + '"' +
        ' data-choice-id="' + attr(choice.id) + '"' +
        checkedAttr +
        ' />' +
        '<span class="mc-choice-letter" aria-hidden="true">' +
        choiceLetter(index) +
        '.</span>' +
        '<span class="mc-choice-content">' +
        renderInlineNodes(choice.content) +
        renderChoiceFigure(choice, block.id) +
        '</span>' +
        '</label>';
      // Per-choice feedback (the MC analogue of blank mistakeFeedback):
      // pre-rendered, hidden, revealed by the runtime post-check when this
      // choice was selected. Emitted only when authored and non-empty.
      const feedback =
        choice.feedback && choice.feedback.length > 0
          ? '<div class="js-mc-feedback mc-choice-feedback"' +
            ' data-choice-id="' + attr(choice.id) + '"' +
            ' hidden>' +
            renderInlineNodes(choice.feedback) +
            '</div>'
          : '';
      return label + feedback;
    })
    .join('');

  // Block-level chrome — identical patterns to renderFillInBlank (see that
  // file for the reasoning on each piece).
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
  const multiAttr = block.multiSelect ? ' data-mc-multi="true"' : '';

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

  // "Select all that apply." is rendered as visible instruction text for
  // multi-select — students shouldn't have to infer it from checkbox styling.
  const multiHint = block.multiSelect
    ? '<div class="mc-multi-hint">Select all that apply.</div>'
    : '';

  // Two or more figured choices switch the list to a 2-up grid — the classic
  // "which graph shows…" textbook layout. A single figure keeps the vertical
  // list (a lone 2-up cell reads as a mistake).
  const figureCount = block.choices.filter((c) => c.image || c.graph).length;
  const gridClass = figureCount >= 2 ? ' mc-choices-grid' : '';

  return (
    '<div class="block block-multiple-choice"' +
    ' data-block-category="question"' +
    ' data-block-type="multiple_choice"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' data-mc-answer="' + attr(JSON.stringify(correctIds)) + '"' +
    multiAttr +
    ratingAttr +
    skillsAttr +
    workSpaceStyle +
    '>' +
    renderNumberGutter(ctx.label, num) +
    '<div class="block-problem-body">' +
    '<div class="mc-prompt">' + renderInlineNodes(block.prompt) + '</div>' +
    multiHint +
    '<fieldset class="mc-choices' + gridClass + '" aria-label="Answer choices">' +
    choicesHtml +
    '</fieldset>' +
    confidenceFieldset +
    printConfidence +
    solutionSlot +
    '</div>' +
    '</div>'
  );
}
