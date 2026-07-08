import type { InteractiveGraphBlock } from '@activity/schema';
import { renderInlineNodes } from '../inline.js';
import { attr, escape } from '../html.js';

export interface InteractiveGraphRenderContext {
  problemNumber: number;
  /**
   * Absolute URL of the shared, content-hashed graph kit on R2 (the SAME kit
   * the calculator uses). When absent (dev without R2, or the print path), the
   * data-graph-kit-src attribute is omitted: the runtime sidecar then leaves
   * the canvas as a static placeholder instead of trying to hydrate it. Threaded
   * from RenderContext.calculatorKitUrl.
   */
  graphKitUrl?: string;
}

// The graded interactive-graph block (Phase 2.7, Stage 5). Emits ONLY the cheap,
// always-shipped shell — the prompt, an empty canvas mount, and the data-* the
// runtime reads. The heavy widget (JSXGraph) rides the lazy-loaded @activity/
// graph-kit, dynamic-imported from data-graph-kit-src by the graph-block sidecar
// on first hydrate — never inlined, never loaded on pages without a graph block.
//
// Data-attribute contract (additive; see packages/renderer/RUNTIME.md):
//   data-graph-block-id        — the block's stable uuid (submission key).
//   data-graph-interaction-type — the interaction discriminant ('plot_point').
//   data-graph-config          — JSON of the AxisConfig (the coordinate plane).
//   data-graph-answer-key      — JSON of the interaction's answer key. Baked
//     into the HTML like data-blank-answers: the kit scores client-side, so
//     this is the same security ceiling as fill-in-blank (Phase 5 server-side
//     grading removes it — the design doc flags graph blocks as the first case).
//   data-graph-kit-src         — the R2 kit URL (omitted when unavailable).
//   data-has-confidence-rating — presence signal, "true" only (omit when false).
//   data-skills                — JSON array, only when non-empty.
export function renderInteractiveGraph(
  block: InteractiveGraphBlock,
  ctx: InteractiveGraphRenderContext,
): string {
  // Display mode: a static, ungraded figure — no number, no answer key, no
  // confidence/solution surface. Split out entirely (its own markup contract)
  // because it shares none of the graded block's scoring shell.
  if (block.interaction.type === 'display') {
    return renderDisplayGraph(block, ctx);
  }

  const num = block.number ?? ctx.problemNumber;
  const promptHtml = renderInlineNodes(block.prompt);

  // The AxisConfig goes out whole; the answer key is the interaction minus its
  // discriminant (the kit's scorer reads correctPoints + tolerance). Both are
  // schema-validated plain data, JSON-encoded and attribute-escaped.
  const configJson = JSON.stringify(block.axisConfig);
  const { type: interactionType, ...answerKey } = block.interaction;
  const answerKeyJson = JSON.stringify(answerKey);

  const kitSrcAttr = ctx.graphKitUrl
    ? ' data-graph-kit-src="' + attr(ctx.graphKitUrl) + '"'
    : '';

  const skills = block.skills;
  const skillsAttr =
    skills.length > 0
      ? ' data-skills="' + attr(JSON.stringify(skills)) + '"'
      : '';

  const hasConfidenceRating = block.hasConfidenceRating;
  const ratingAttr = hasConfidenceRating ? ' data-has-confidence-rating="true"' : '';

  // Confidence fieldset — identical pattern to fill-in-blank (one per block, the
  // runtime replicates the chosen value into the block's GraphResponse). The
  // radio group name is namespaced by block id so multiple blocks don't share
  // state (radio names are document-wide).
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

  // Print-only hand-markable confidence row (screen-hidden; @media print shows
  // it in place of the radio widget). Same mirror as fill-in-blank.
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

  // Solution slot — rich content pre-rendered, hidden until the section is
  // checked (runtime toggles `hidden`). Fail-closed: initial `hidden` means the
  // student never sees it if the runtime fails to init. The slot's presence is
  // the runtime's "has a solution" signal.
  const solution = block.solution;
  const hasSolution = solution && solution.length > 0;
  const solutionSlot = hasSolution
    ? '<div class="js-solution"' +
      ' data-for-block="' + attr(block.id) + '"' +
      ' hidden>' +
      renderInlineNodes(solution) +
      '</div>'
    : '';

  // The canvas is role="application" with an instructional aria-label — the kit
  // narrates handle position into the js-graph-feedback live region as the
  // student moves. It starts empty (the kit mounts JSXGraph into it) and carries
  // a static "requires JavaScript" fallback for the no-JS / no-kit / print case.
  const canvas =
    '<div class="graph-canvas"' +
    ' data-graph-canvas="' + attr(block.id) + '"' +
    ' role="application"' +
    ' aria-label="Interactive coordinate plane. Tab to the point, then use arrow keys to move it; hold Shift for fine steps."' +
    ' tabindex="0">' +
    '<p class="graph-nojs">This question needs JavaScript to plot your answer.</p>' +
    '</div>';

  // aria-live feedback / narration region. Empty + hidden until the kit writes
  // to it (position narration on move; correct/incorrect after a check).
  const feedback =
    '<div class="js-graph-feedback"' +
    ' data-for-graph="' + attr(block.id) + '"' +
    ' aria-live="polite" hidden></div>';

  // Authored anticipated mistakes (Drop B) — the graph twin of a blank's
  // mistakeFeedback. The match strings ride data-graph-mistakes (the kit parses
  // them with its own freeform parser); each entry's RICH feedback is
  // pre-rendered into an inert <template class="js-graph-mistake-content">
  // (index-aligned), which the runtime clones into the feedback line when that
  // entry matches after a check. Omitted entirely when none are authored.
  const mistakeFeedback = block.mistakeFeedback;
  const mistakesAttr =
    mistakeFeedback.length > 0
      ? ' data-graph-mistakes="' +
        attr(JSON.stringify(mistakeFeedback.map((m) => m.match))) +
        '"'
      : '';
  const mistakeTemplates =
    mistakeFeedback.length > 0
      ? mistakeFeedback
          .map(
            (entry) =>
              '<template class="js-graph-mistake-content">' +
              renderInlineNodes(entry.feedback) +
              '</template>',
          )
          .join('')
      : '';
  // Built-in mistake classifiers default ON; emit the attribute only when the
  // teacher turned them off (omit-when-default, like the other flags).
  const builtinAttr =
    block.builtinFeedback === false ? ' data-graph-builtin-feedback="false"' : '';

  return (
    '<div class="block block-interactive-graph"' +
    ' data-block-category="question"' +
    ' data-block-type="interactive_graph"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' data-graph-block-id="' + attr(block.id) + '"' +
    ' data-graph-interaction-type="' + attr(interactionType) + '"' +
    ' data-graph-config="' + attr(configJson) + '"' +
    ' data-graph-answer-key="' + attr(answerKeyJson) + '"' +
    // Drop 4 flags — additive data attrs the runtime threads into the widget.
    (block.partialCredit ? ' data-graph-partial-credit="true"' : '') +
    (block.allowNoSolution ? ' data-graph-allow-no-solution="true"' : '') +
    (block.noSolutionCorrect ? ' data-graph-no-solution-correct="true"' : '') +
    mistakesAttr +
    builtinAttr +
    kitSrcAttr +
    ratingAttr +
    skillsAttr +
    '>' +
    '<div class="block-problem-number">' + escape(String(num)) + '.</div>' +
    '<div class="block-problem-body">' +
    '<div class="graph-prompt">' + promptHtml + '</div>' +
    canvas +
    feedback +
    mistakeTemplates +
    confidenceFieldset +
    printConfidence +
    solutionSlot +
    '</div>' +
    '</div>'
  );
}

// The static-display variant (interaction.type === 'display'). Same lazy-kit
// hydration path as the graded block — a .graph-canvas the sidecar mounts a
// READ-ONLY board into (mountGraphDisplay) — but categorized as content, not a
// question: no problem number, no answer key, no confidence/solution. The
// drawables ride as data-graph-drawables (the analogue of data-graph-answer-key).
// The prompt, when present, is an optional caption; an empty prompt is the
// standalone-exemplar case. See RUNTIME.md (additive attributes).
function renderDisplayGraph(
  block: InteractiveGraphBlock,
  ctx: InteractiveGraphRenderContext,
): string {
  if (block.interaction.type !== 'display') return ''; // narrowing (unreachable)
  const configJson = JSON.stringify(block.axisConfig);
  const drawablesJson = JSON.stringify(block.interaction.drawables);

  const kitSrcAttr = ctx.graphKitUrl
    ? ' data-graph-kit-src="' + attr(ctx.graphKitUrl) + '"'
    : '';
  const skills = block.skills;
  const skillsAttr =
    skills.length > 0
      ? ' data-skills="' + attr(JSON.stringify(skills)) + '"'
      : '';

  // Optional caption (the prompt). Omitted entirely for a standalone exemplar so
  // no empty caption box prints.
  const captionHtml =
    block.prompt.length > 0
      ? '<div class="graph-prompt graph-caption">' +
        renderInlineNodes(block.prompt) +
        '</div>'
      : '';

  // A static figure: role="img", not role="application"; not focusable. The
  // sidecar draws into it; the no-JS/print fallback stays if the kit can't load.
  const canvas =
    '<div class="graph-canvas"' +
    ' data-graph-canvas="' + attr(block.id) + '"' +
    ' role="img"' +
    ' aria-label="Graph">' +
    '<p class="graph-nojs">This graph needs JavaScript to display.</p>' +
    '</div>';

  return (
    '<div class="block block-interactive-graph block-graph-display"' +
    ' data-block-category="content"' +
    ' data-block-type="interactive_graph"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' data-graph-block-id="' + attr(block.id) + '"' +
    ' data-graph-interaction-type="display"' +
    ' data-graph-config="' + attr(configJson) + '"' +
    ' data-graph-drawables="' + attr(drawablesJson) + '"' +
    kitSrcAttr +
    skillsAttr +
    '>' +
    '<div class="block-problem-body">' +
    captionHtml +
    canvas +
    '</div>' +
    '</div>'
  );
}
