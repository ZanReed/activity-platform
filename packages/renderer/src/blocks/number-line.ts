import type { NumberLineBlock } from '@activity/schema';
import { renderInlineNodes } from '../inline.js';
import { attr, escape } from '../html.js';
import { renderNumberLineSvg, answerKeyMarks } from '../number-line-svg.js';

export interface NumberLineRenderContext {
  problemNumber: number;
  /**
   * Absolute URL of the shared, content-hashed graph kit on R2 — the SAME kit
   * the calculator and interactive_graph use (number lines ride it too). When
   * absent (dev without R2, or the print path), data-numberline-kit-src is
   * omitted: the sidecar leaves the static SVG fallback in place instead of
   * hydrating. Threaded from RenderContext.calculatorKitUrl.
   */
  graphKitUrl?: string;
  /**
   * Answer-key print variant (renderActivityForPrint showAnswers): draw the
   * graded answer onto the static fallback SVG — the number-line twin of blanks
   * prefilling with their canonical answer.
   */
  showAnswers?: boolean;
}

// The graded number_line block (Phase 2.7, 1-D). Emits the cheap, always-shipped
// shell — the prompt, an empty line mount, and the data-* the runtime reads. The
// heavy widget rides the lazy @activity/graph-kit (dynamic-imported by the
// number-line sidecar on first hydrate), never inlined.
//
// Data-attribute contract (additive; see packages/renderer/RUNTIME.md):
//   data-numberline-block-id         — the block's stable uuid (submission key).
//   data-numberline-interaction-type — 'plot_point' | 'plot_interval'.
//   data-numberline-config           — JSON of the NumberLineConfig (the line).
//   data-numberline-answer-key       — JSON of the interaction's answer key
//     (correctPoints/correctInterval + tolerance). Baked in like
//     data-graph-answer-key: the kit scores client-side (Phase-5 server grading
//     removes it, same as graphs/blanks).
//   data-numberline-kit-src          — the R2 kit URL (omitted when unavailable).
//   data-has-confidence-rating       — presence signal, "true" only.
//   data-skills                      — JSON array, only when non-empty.
export function renderNumberLine(
  block: NumberLineBlock,
  ctx: NumberLineRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  const promptHtml = renderInlineNodes(block.prompt);

  const configJson = JSON.stringify(block.config);
  const { type: interactionType, ...answerKey } = block.interaction;
  const answerKeyJson = JSON.stringify(answerKey);

  const kitSrcAttr = ctx.graphKitUrl
    ? ' data-numberline-kit-src="' + attr(ctx.graphKitUrl) + '"'
    : '';

  const skills = block.skills;
  const skillsAttr =
    skills.length > 0
      ? ' data-skills="' + attr(JSON.stringify(skills)) + '"'
      : '';

  const hasConfidenceRating = block.hasConfidenceRating;
  const ratingAttr = hasConfidenceRating
    ? ' data-has-confidence-rating="true"'
    : '';

  // Confidence fieldset — identical pattern to fill-in-blank / graph blocks.
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

  const solution = block.solution;
  const hasSolution = solution && solution.length > 0;
  const solutionSlot = hasSolution
    ? '<div class="js-solution"' +
      ' data-for-block="' + attr(block.id) + '"' +
      ' hidden>' +
      renderInlineNodes(solution) +
      '</div>'
    : '';

  // The mount is role="application" with an instructional aria-label — the kit
  // narrates handle position into the js-numberline-feedback live region on
  // move. Its pre-hydration content is the static fallback (a blank number line
  // to hand-mark; the answer key drawn onto it in the showAnswers print variant)
  // plus a screen-only "needs JavaScript" cue. The kit clears it on mount.
  const fallbackSvg = renderNumberLineSvg(
    block.config,
    ctx.showAnswers ? answerKeyMarks(block.interaction) : [],
    block.id,
  );
  const canvas =
    '<div class="number-line-canvas"' +
    ' data-numberline-canvas="' + attr(block.id) + '"' +
    ' role="application"' +
    ' aria-label="Interactive number line. Tab to a handle, then use arrow keys to move it; hold Shift for fine steps."' +
    ' tabindex="0">' +
    fallbackSvg +
    '<p class="number-line-nojs">This question needs JavaScript to mark your answer.</p>' +
    '</div>';

  const feedback =
    '<div class="js-numberline-feedback"' +
    ' data-for-numberline="' + attr(block.id) + '"' +
    ' aria-live="polite" hidden></div>';

  return (
    '<div class="block block-number-line"' +
    ' data-block-category="question"' +
    ' data-block-type="number_line"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' data-numberline-block-id="' + attr(block.id) + '"' +
    ' data-numberline-interaction-type="' + attr(interactionType) + '"' +
    ' data-numberline-config="' + attr(configJson) + '"' +
    ' data-numberline-answer-key="' + attr(answerKeyJson) + '"' +
    kitSrcAttr +
    ratingAttr +
    skillsAttr +
    '>' +
    '<div class="block-problem-number">' + escape(String(num)) + '.</div>' +
    '<div class="block-problem-body">' +
    '<div class="number-line-prompt">' + promptHtml + '</div>' +
    canvas +
    feedback +
    confidenceFieldset +
    printConfidence +
    solutionSlot +
    '</div>' +
    '</div>'
  );
}
