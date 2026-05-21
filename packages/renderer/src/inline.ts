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
  }
}

// Renders the inline content of a fill_in_blank block. Equivalent to mapping
// renderInline over the array, except blank tokens are dispatched to
// renderBlank with their 1-based position (index + total) so each <input>
// can carry a positional aria-label. Blanks are counted once, up front.
export function renderFillInBlankContent(content: FillInBlankInline[]): string {
  const total = content.reduce(
    (count, node) => (node.type === 'blank' ? count + 1 : count),
                               0,
  );
  let index = 0;
  return content
  .map((node) =>
  node.type === 'blank'
  ? renderBlank(node, ++index, total)
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

// index/total are the blank's 1-based position within its fill_in_blank block.
// They exist only to build the aria-label: a blank inside prose with no label
// is announced by screen readers as just "edit text", which gives the student
// no way to tell which blank has focus. A positional label ("Blank 2 of 3")
// fixes that; a lone blank gets "Fill in the blank" (no awkward "1 of 1").
function renderBlank(node: BlankToken, index: number, total: number): string {
  // The width attribute drives a CSS variable on the input. Default ~6 chars
  // (a typical short answer). The answer key is embedded as a data attribute
  // for client-side scoring — see the security ceiling note in the
  // architecture discussion.
  const width = node.width ?? 6;
  // Acceptable answers are pipe-separated for compact transport in the
  // attribute. The runtime JS splits on `|` to compare. This is fine because
  // a `|` in an actual math answer would be unusual; if it ever matters,
  // switch to a JSON-encoded data attribute.
  const acceptable = [node.answer, ...node.acceptableAnswers].join('|');
  const label = total > 1 ? `Blank ${index} of ${total}` : 'Fill in the blank';

  // Per-blank feedback layers (Stage 9a schema additions, emitted Stage 12
  // step 2). Both are optional; both are read by the runtime on init but
  // produce visible content only after a checkpoint check (Stage 13 work).
  //
  //   hint:
  //     Static teacher-authored nudge, available to the student via an
  //     always-visible `?` button. Rendered as text content inside a
  //     .js-blank-hint-text span, paired with the .js-blank-hint button
  //     via aria-controls/id. data-hint on the input mirrors the span's
  //     text (RUNTIME.md names it as the runtime's read source); cheap
  //     duplication, clear separation between data contract (data-*) and
  //     render target (the span). The button + span are emitted only when
  //     there is a non-empty hint.
  //
  //   mistakeFeedback:
  //     Array of {match, feedback} pairs. JSON-encoded into a single
  //     data-mistake-feedback attribute. The runtime parses it once at init
  //     and dispatches the matching feedback into .js-blank-feedback at
  //     check time (first match wins, per RUNTIME.md). Omitted when the
  //     array is empty or undefined — the absence of the attribute is the
  //     signal "no targeted feedback to consider".
  //
  // Empty-string hints and empty-array mistakeFeedback are treated as
  // "absent": no button to reveal an empty hint, no attribute for an empty
  // list. The schema permits both (hint is z.string().optional() with no
  // .min(1); mistakeFeedback is z.array(...).optional() with no .min(1)),
  // so a teacher saving a stub field shouldn't surface a useless control.
  const hint = node.hint;
  const hintTextId = 'hint-' + node.id;
  const hintAttr = hint ? ' data-hint="' + attr(hint) + '"' : '';
  const hintButton = hint
  ? '<button class="js-blank-hint" type="button"' +
  ' aria-expanded="false"' +
  ' aria-controls="' + attr(hintTextId) + '"' +
  ' aria-label="Show hint">?</button>'
  : '';
  const hintText = hint
  ? '<span class="js-blank-hint-text"' +
  ' id="' + attr(hintTextId) + '"' +
  ' hidden>' +
  escape(hint) +
  '</span>'
  : '';

  const mistakeFeedback = node.mistakeFeedback;
  const mistakeFeedbackAttr =
  mistakeFeedback && mistakeFeedback.length > 0
  ? ' data-mistake-feedback="' + attr(JSON.stringify(mistakeFeedback)) + '"'
  : '';

  // The blank token renders as a wrapper around its siblings:
  //   1. the <input> (carrying class="blank" plus every data-* attribute —
  //      every existing .blank selector and the runtime's $('.blank')
  //      lookup keep working unchanged),
  //   2. an optional hint button + hint-text span (only when node.hint is
  //      set), inline-revealed via the runtime toggling `hidden` and
  //      `aria-expanded`,
  //   3. a `js-blank-feedback` span the Stage 13 runtime renders ✓/✗ and
  //      targeted mistake feedback into after a checkpoint check.
  //
  // The wrapper exists because <input> is a void element — the feedback
  // span and hint text cannot be its children. It also keeps the whole
  // affordance group together as a single inline unit, so the input, its
  // hint, and its feedback can't wrap onto separate lines mid-prose. The
  // wrapper itself carries no data-* attributes; the runtime reaches each
  // child via class selectors and/or input.nextElementSibling walking.
  //
  // `aria-live="polite"` MUST be in the source HTML — RUNTIME.md flags
  // that setting aria-live later on an existing element is unreliable
  // across screen readers. `hidden` keeps the slot out of layout (and out
  // of the accessibility tree) until the runtime populates it; once
  // visible, content changes are announced politely without interrupting
  // focus.
  return (
    '<span class="blank-wrapper">' +
    '<input type="text"' +
    ' class="blank"' +
    ' data-blank-id="' + attr(node.id) + '"' +
    ' data-blank-answers="' + attr(acceptable) + '"' +
    hintAttr +
    mistakeFeedbackAttr +
    ' aria-label="' + attr(label) + '"' +
    ' style="--blank-width:' + width + 'ch"' +
    ' autocomplete="off"' +
    ' autocapitalize="off"' +
    ' autocorrect="off"' +
    ' spellcheck="false"' +
    ' />' +
    hintButton +
    hintText +
    '<span class="js-blank-feedback"' +
    ' data-for-blank="' + attr(node.id) + '"' +
    ' aria-live="polite"' +
    ' hidden></span>' +
    '</span>'
  );
}
