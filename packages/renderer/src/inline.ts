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
  return (
    '<input type="text"' +
    ' class="blank"' +
    ' data-blank-id="' + attr(node.id) + '"' +
    ' data-blank-answers="' + attr(acceptable) + '"' +
    ' aria-label="' + attr(label) + '"' +
    ' style="--blank-width:' + width + 'ch"' +
    ' autocomplete="off"' +
    ' autocapitalize="off"' +
    ' autocorrect="off"' +
    ' spellcheck="false"' +
    ' />'
  );
}
