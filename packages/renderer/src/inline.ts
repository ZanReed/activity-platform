// =============================================================================
// inline.ts — Render inline content (text, math_inline, blanks)
// -----------------------------------------------------------------------------
// renderInline accepts either an InlineNode or a FillInBlankInline. The
// type system enforces that blanks only appear in fill_in_blank blocks
// (because the schema forbids them elsewhere); this function just dispatches
// on the discriminator.
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

export function renderInline(node: InlineNode | FillInBlankInline): string {
  switch (node.type) {
    case 'text':
      return renderText(node);
    case 'math_inline':
      return renderInlineMath(node);
    case 'blank':
      return renderBlank(node);
  }
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

function renderBlank(node: BlankToken): string {
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
  return (
    '<input type="text"' +
    ' class="blank"' +
    ' data-blank-id="' + attr(node.id) + '"' +
    ' data-blank-answers="' + attr(acceptable) + '"' +
    ' style="--blank-width:' + width + 'ch"' +
    ' autocomplete="off"' +
    ' autocapitalize="off"' +
    ' autocorrect="off"' +
    ' spellcheck="false"' +
    ' />'
  );
}
