// =============================================================================
// inline.ts — Render inline content (text, math_inline, blanks)
// -----------------------------------------------------------------------------
// renderInline handles standard inline nodes (text + inline math). Blank
// tokens are NOT handled here: they only ever appear inside a fill_in_blank
// block, and that block's content is rendered through renderFillInBlankContent,
// which numbers each blank so the renderer can give it a positional aria-label.
// =============================================================================

import type {
  InlineNode,
  FillInBlankInline,
  TextNode,
  InlineMathNode,
  BlankToken,
} from '@activity/schema';
import { escape, attr } from './html.js';
import { renderMath } from './math.js';

export function renderInline(node: InlineNode): string {
  switch (node.type) {
    case 'text':
      return renderText(node);
    case 'math_inline':
      return renderInlineMath(node);
    case 'hard_break':
      return '<br>';
  }
}

// Renders an InlineNode array to a single HTML string. Used for rich feedback
// fields (hint, mistakeFeedback, solution) that carry formatted text + inline
// math — the same alphabet as block prose. KaTeX runs here, server-side, so
// the runtime never needs it: the output is stashed in a hidden <template> and
// cloned into the popover on demand.
export function renderInlineNodes(nodes: InlineNode[]): string {
  return nodes.map(renderInline).join('');
}

// Renders the inline content of a fill_in_blank block. Equivalent to mapping
// renderInline over the array, except blank tokens are dispatched to
// renderBlank with their 1-based position (index + total) so each <input>
// can carry a positional aria-label. Blanks are counted once, up front.
// showAnswers fills each blank with its canonical answer (the answer-key print
// variant, Drop C). Defaults to false so every existing caller — the published
// page, the editor preview — keeps rendering empty inputs unchanged.
export function renderFillInBlankContent(
  content: FillInBlankInline[],
  showAnswers = false,
): string {
  const total = content.reduce(
    (count, node) => (node.type === 'blank' ? count + 1 : count),
                               0,
  );
  let index = 0;
  return content
  .map((node) =>
  node.type === 'blank'
  ? renderBlank(node, ++index, total, showAnswers)
  : renderInline(node),
  )
  .join('');
}

function renderText(node: TextNode): string {
  let html = escape(node.text);
  // Marks are applied outermost-last so the visual nesting matches the
  // canonical order. Order doesn't affect rendered output (a bold-italic
  // word looks the same either way), but a stable order produces stable
  // HTML, which makes snapshot tests reliable.
  for (const mark of node.marks) {
    switch (mark) {
      case 'bold':
        html = '<strong>' + html + '</strong>';
        break;
      case 'italic':
        html = '<em>' + html + '</em>';
        break;
      case 'underline':
        html = '<u>' + html + '</u>';
        break;
      case 'code':
        html = '<code>' + html + '</code>';
        break;
      case 'subscript':
        html = '<sub>' + html + '</sub>';
        break;
      case 'superscript':
        html = '<sup>' + html + '</sup>';
        break;
      default: {
        const _exhaustive: never = mark;
        void _exhaustive;
      }
    }
  }
  return html;
}

function renderInlineMath(node: InlineMathNode): string {
  // KaTeX produces a <span class="katex">...</span> for inline mode.
  return renderMath(node.latex, { displayMode: false });
}

// Width formula for the blank input. Used when no explicit width is set on
// the BlankToken — produces an input sized to roughly match the canonical
// answer's character count, with a +1 to leave breathing room, a floor of 4
// to keep single-character answers from looking like a sliver, and a ceiling
// of MAX_BLANK_WIDTH so a long canonical answer can't blow out the inline
// flow — an unclamped width breaks line wrapping in prose and, worse, can
// exceed a column in multi-column print. Past the ceiling the input scrolls
// its text rather than growing. The editor's BlankView.tsx uses the IDENTICAL
// formula so an authored chip matches the published input.
//
// IMPORTANT: keep this in sync with deriveBlankWidth() in
// packages/app/src/editor/nodeViews/BlankView.tsx. The two formulas
// MUST agree or author preview drifts from student view.
const MAX_BLANK_WIDTH = 24;
function deriveBlankWidth(answer: string): number {
  return Math.min(Math.max(answer.length + 1, 4), MAX_BLANK_WIDTH);
}

// index/total are the blank's 1-based position within its fill_in_blank block.
// They exist only to build the aria-label: a blank inside prose with no label
// is announced by screen readers as just "edit text", which gives the student
// no way to tell which blank has focus. A positional label ("Blank 2 of 3")
// fixes that; a lone blank gets "Fill in the blank" (no awkward "1 of 1").
function renderBlank(
  node: BlankToken,
  index: number,
  total: number,
  showAnswers: boolean,
): string {
  // Width: explicit override if set on the BlankToken, otherwise auto-derive
  // from the canonical answer's length. Drives a CSS variable on the input
  // (--blank-width in ch units). See deriveBlankWidth above for the formula
  // and its in-sync sibling in the editor.
  const width = node.width ?? deriveBlankWidth(node.answer);
  // Acceptable answers are pipe-separated for compact transport in the
  // attribute. The runtime JS splits on `|` to compare. This is fine because
  // a `|` in an actual math answer would be unusual; if it ever matters,
  // switch to a JSON-encoded data attribute.
  const acceptable = [node.answer, ...node.acceptableAnswers].join('|');
  const label = total > 1 ? `Blank ${index} of ${total}` : 'Fill in the blank';

  // Answer-key variant (Drop C): prefill the input with the canonical answer so
  // the printed sheet doubles as a key. Only the canonical answer is shown (not
  // the acceptable-answer alternates) — a key wants one definitive value on the
  // line. Omitted entirely when showAnswers is false, so the student-facing
  // input stays empty.
  const valueAttr = showAnswers ? ' value="' + attr(node.answer) + '"' : '';

  // Per-blank feedback layers (rich inline content: formatted text + math).
  // Both are optional; both are read by the runtime on init but produce
  // visible content only after a checkpoint check.
  //
  //   hint:
  //     Static teacher-authored nudge, available to the student via an
  //     always-visible `?` button. Its rich content is pre-rendered here
  //     (KaTeX runs server-side) into a hidden <template class="js-blank-
  //     hint-content"> sitting in the wrapper. Clicking the button opens the
  //     shared popover (emitted by document.ts) and the runtime clones this
  //     template into it. The button + template are emitted only when a hint
  //     is present and non-empty.
  //
  //   mistakeFeedback:
  //     Array of {match, feedback} pairs. Each entry's `feedback` is
  //     pre-rendered into its own <template class="js-blank-mistake-content"
  //     data-match="..."> in document order. The runtime matches a wrong
  //     answer against the templates' data-match (first match wins), reveals
  //     the `!` button, and clones the matching template into the popover.
  //
  // Empty hints and empty-array mistakeFeedback are treated as "absent": no
  // button and no template for an empty hint, no `!` button or templates for
  // an empty list. Both buttons are dialog openers (aria-haspopup="dialog" +
  // aria-controls pointing at the popover).
  const hint = node.hint;
  const hasHint = hint && hint.length > 0;
  const hintTemplate = hasHint
  ? '<template class="js-blank-hint-content">' +
  renderInlineNodes(hint) +
  '</template>'
  : '';
  const hintButton = hasHint
  ? '<button class="js-blank-hint" type="button"' +
  ' aria-haspopup="dialog"' +
  ' aria-expanded="false"' +
  ' aria-controls="activity-popover"' +
  ' aria-label="Show hint">?</button>'
  : '';

  // The red `!` mistake button is emitted (but `hidden`) for any blank with
  // authored mistake feedback. The runtime reveals it only when a wrong answer
  // matches an entry, and clicking it opens the shared popover with that
  // entry's pre-rendered content. Blanks without authored mistake feedback get
  // no button and no templates.
  const mistakeFeedback = node.mistakeFeedback;
  const hasMistakeFeedback = mistakeFeedback && mistakeFeedback.length > 0;
  const mistakeTemplates = hasMistakeFeedback
  ? mistakeFeedback
  .map(
    (entry) =>
    '<template class="js-blank-mistake-content"' +
    ' data-match="' + attr(entry.match) + '">' +
    renderInlineNodes(entry.feedback) +
    '</template>',
  )
  .join('')
  : '';
  const mistakeButton = hasMistakeFeedback
  ? '<button class="js-blank-mistake" type="button"' +
  ' aria-haspopup="dialog"' +
  ' aria-expanded="false"' +
  ' aria-controls="activity-popover"' +
  ' aria-label="Show feedback" hidden>!</button>'
  : '';

  // The blank token renders as a wrapper around its siblings:
  //   1. the <input> (carrying class="blank" plus every data-* attribute —
  //      every existing .blank selector and the runtime's $('.blank')
  //      lookup keep working unchanged),
  //   2. an optional `?` hint button (only when a hint is set) that opens the
  //      shared popover; the hint's rich content lives in a sibling
  //      <template class="js-blank-hint-content">,
  //   3. an optional red `!` mistake button (only when mistakeFeedback is
  //      authored) — emitted `hidden`, revealed by the runtime when a wrong
  //      answer matches an entry; each entry's rich content lives in its own
  //      sibling <template class="js-blank-mistake-content" data-match="...">.
  //
  // The wrapper exists because <input> is a void element — the buttons can't
  // be its children. It also keeps the whole affordance group together as a
  // single inline unit, so the input and its buttons can't wrap onto separate
  // lines mid-prose. The wrapper itself carries no data-* attributes; the
  // runtime reaches each child via class selectors. Templates are inert
  // (their content isn't rendered until cloned), so they add no visual weight.
  return (
    '<span class="blank-wrapper">' +
    '<input type="text"' +
    ' class="blank"' +
    ' data-blank-id="' + attr(node.id) + '"' +
    ' data-blank-answers="' + attr(acceptable) + '"' +
    ' aria-label="' + attr(label) + '"' +
    ' style="--blank-width:' + width + 'ch"' +
    valueAttr +
    ' autocomplete="off"' +
    ' autocapitalize="off"' +
    ' autocorrect="off"' +
    ' spellcheck="false"' +
    ' />' +
    hintButton +
    mistakeButton +
    hintTemplate +
    mistakeTemplates +
    '</span>'
  );
}
