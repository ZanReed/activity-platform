import type { DataPlotBlock } from '@activity/schema';
import { renderInlineNodes } from '../inline.js';
import { attr, escape } from '../html.js';
import { renderDataPlotSvg } from '../data-plot-svg.js';

export interface DataPlotRenderContext {
  problemNumber: number;
  /**
   * Absolute URL of the shared, content-hashed graph kit on R2 — the SAME kit
   * the calculator / interactive_graph / number_line use (data plots ride it
   * too). Forwarded only to the graded build variant; when absent (dev without
   * R2, or the print path) data-dataplot-kit-src is omitted and the static SVG
   * fallback stays in place. Threaded from RenderContext.calculatorKitUrl.
   */
  graphKitUrl?: string;
  /**
   * Answer-key print variant: draw the correct (computed-from-data) plot onto
   * the build block's static fallback, the data-plot twin of blanks prefilling.
   */
  showAnswers?: boolean;
}

// The data_plot block (Phase 2.7, statistics charts). Two shapes:
//   • display  — an ungraded static chart of the dataset (a stimulus). Pure SVG,
//     no hydration and no kit: dot plots / histograms / box plots are fully
//     static-drawable (unlike graph `expression` drawables that need a parser),
//     so display needs zero runtime/kit code. Categorized as content: no problem
//     number, no answer key, no confidence/solution.
//   • build_dotplot — the graded construction. Emits the cheap always-shipped
//     shell (prompt, the source dataset to plot, an empty dot-plot mount, and
//     the data-* the runtime reads); the heavy widget rides the lazy graph-kit.
//
// Data-attribute contract (additive; see packages/renderer/RUNTIME.md):
//   data-dataplot-block-id         — the block's stable uuid (submission key).
//   data-dataplot-interaction-type — 'build_dotplot' (display carries none).
//   data-dataplot-config           — JSON of the DataPlotConfig (the axis).
//   data-dataplot-data             — JSON of the dataset. This IS the answer key
//     (the correct frequencies are computed from it), baked in like
//     data-graph-answer-key; Phase-5 server grading strips it, same as graphs.
//   data-dataplot-kit-src          — the R2 kit URL (omitted when unavailable).
//   data-has-confidence-rating     — presence signal, "true" only.
//   data-skills                    — JSON array, only when non-empty.
export function renderDataPlot(
  block: DataPlotBlock,
  ctx: DataPlotRenderContext,
): string {
  if (block.interaction.type === 'display') {
    return renderDisplayDataPlot(block);
  }
  return renderBuildDotplot(block, ctx);
}

// display: a static figure, role="img", categorized as content (no number).
function renderDisplayDataPlot(block: DataPlotBlock): string {
  if (block.interaction.type !== 'display') return ''; // narrowing
  const chart = block.interaction.chart;
  const skills = block.skills;
  const skillsAttr =
    skills.length > 0
      ? ' data-skills="' + attr(JSON.stringify(skills)) + '"'
      : '';

  const captionHtml =
    block.prompt.length > 0
      ? '<div class="data-plot-prompt data-plot-caption">' +
        renderInlineNodes(block.prompt) +
        '</div>'
      : '';

  const canvas =
    '<div class="data-plot-canvas data-plot-static"' +
    ' role="img" aria-label="' + attr(chartLabel(chart)) + '">' +
    renderDataPlotSvg(block.config, chart, block.data, block.id) +
    '</div>';

  return (
    '<div class="block block-data-plot block-data-plot-display"' +
    ' data-block-category="content"' +
    ' data-block-type="data_plot"' +
    ' data-block-id="' + attr(block.id) + '"' +
    skillsAttr +
    '>' +
    '<div class="block-problem-body">' +
    captionHtml +
    canvas +
    '</div>' +
    '</div>'
  );
}

// build_dotplot: the graded shell. Mirrors renderNumberLine.
function renderBuildDotplot(
  block: DataPlotBlock,
  ctx: DataPlotRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  const promptHtml = renderInlineNodes(block.prompt);
  const configJson = JSON.stringify(block.config);
  const dataJson = JSON.stringify(block.data);

  const kitSrcAttr = ctx.graphKitUrl
    ? ' data-dataplot-kit-src="' + attr(ctx.graphKitUrl) + '"'
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

  // The dataset the student is asked to plot, shown sorted. Also the answer key
  // (its frequencies), so it's both prompt material and the scoring source.
  const sorted = [...block.data].sort((a, b) => a - b);
  const dataList =
    '<p class="data-plot-source">Plot these values: ' +
    escape(sorted.join(', ')) +
    '</p>';

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

  // Pre-hydration content: the static fallback (empty dot-plot axis to mark by
  // hand; the computed dot plot in the showAnswers print variant) plus a
  // screen-only "needs JavaScript" cue. The kit clears it on mount.
  const fallbackSvg = renderDataPlotSvg(
    block.config,
    'dotplot',
    ctx.showAnswers ? block.data : [],
    block.id,
  );
  const canvas =
    '<div class="data-plot-canvas"' +
    ' data-dataplot-canvas="' + attr(block.id) + '"' +
    ' role="application"' +
    ' aria-label="Interactive dot plot. Tab to the plot, then use arrow keys to choose a value and Enter to add or remove a dot."' +
    ' tabindex="0">' +
    fallbackSvg +
    '<p class="data-plot-nojs">This question needs JavaScript to mark your answer.</p>' +
    '</div>';

  const feedback =
    '<div class="js-dataplot-feedback"' +
    ' data-for-dataplot="' + attr(block.id) + '"' +
    ' aria-live="polite" hidden></div>';

  return (
    '<div class="block block-data-plot"' +
    ' data-block-category="question"' +
    ' data-block-type="data_plot"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' data-dataplot-block-id="' + attr(block.id) + '"' +
    ' data-dataplot-interaction-type="build_dotplot"' +
    ' data-dataplot-config="' + attr(configJson) + '"' +
    ' data-dataplot-data="' + attr(dataJson) + '"' +
    kitSrcAttr +
    ratingAttr +
    skillsAttr +
    '>' +
    '<div class="block-problem-number">' + escape(String(num)) + '.</div>' +
    '<div class="block-problem-body">' +
    '<div class="data-plot-prompt">' + promptHtml + '</div>' +
    dataList +
    canvas +
    feedback +
    confidenceFieldset +
    printConfidence +
    solutionSlot +
    '</div>' +
    '</div>'
  );
}

function chartLabel(chart: 'dotplot' | 'histogram' | 'boxplot'): string {
  return chart === 'histogram'
    ? 'Histogram'
    : chart === 'boxplot'
      ? 'Box plot'
      : 'Dot plot';
}
