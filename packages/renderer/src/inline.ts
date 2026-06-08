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

// Width formula for the blank input. Used when no explicit width is set on
// the BlankToken — produces an input sized to roughly match the canonical
// answer's character count, with a +1 to leave breathing room and a floor
// of 4 to keep single-character answers from looking like a sliver. The
// editor's BlankView.tsx uses the IDENTICAL formula so an authored chip
// matches the published input. Stage 15 may add an author UI for explicit
// width overrides; until then this default produces visually consistent
// sizing across authoring and published views.
//
// IMPORTANT: keep this in sync with deriveBlankWidth() in
// packages/app/src/editor/nodeViews/BlankView.tsx. The two formulas
// MUST agree or author preview drifts from student view.
function deriveBlankWidth(answer: string): number {
  return Math.max(answer.length + 1, 4);
}

// index/total are the blank's 1-based position within its fill_in_blank block.
// They exist only to build the aria-label: a blank inside prose with no label
// is announced by screen readers as just "edit text", which gives the student
// no way to tell which blank has focus. A positional label ("Blank 2 of 3")
// fixes that; a lone blank gets "Fill in the blank" (no awkward "1 of 1").
function renderBlank(node: BlankToken, index: number, total: number): string {
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

  // Per-blank feedback layers (Stage 9a schema additions, emitted Stage 12
  // step 2). Both are optional; both are read by the runtime on init but
  // produce visible content only after a checkpoint check (Stage 13 work).
  //
  //   hint:
  //     Static teacher-authored nudge, available to the student via an
  //     always-visible `?` button. The text rides on data-hint (the runtime's
  //     read source per RUNTIME.md); clicking the button opens the shared
  //     popover (emitted by document.ts) and the runtime copies this blank's
  //     data-hint into it. The button is emitted only when there is a
  //     non-empty hint.
  //
  //   mistakeFeedback:
  //     Array of {match, feedback} pairs. JSON-encoded into a single
  //     data-mistake-feedback attribute. The runtime parses it once at init;
  //     when a wrong answer matches an entry it reveals the `!` button (first
  //     match wins, per RUNTIME.md), and clicking that button opens the shared
  //     popover with the matched feedback. Omitted when the array is empty or
  //     undefined — the absence of the attribute is the signal "no targeted
  //     feedback to consider".
  //
  // Empty-string hints and empty-array mistakeFeedback are treated as
  // "absent": no button to reveal an empty hint, no attribute (and no `!`
  // button) for an empty list. The schema permits both (hint is
  // z.string().optional() with no .min(1); mistakeFeedback is
  // z.array(...).optional() with no .min(1)), so a teacher saving a stub
  // field shouldn't surface a useless control. Both buttons are dialog
  // openers (aria-haspopup="dialog" + aria-controls pointing at the popover).
  const hint = node.hint;
  const hintAttr = hint ? ' data-hint="' + attr(hint) + '"' : '';
  const hintButton = hint
  ? '<button class="js-blank-hint" type="button"' +
  ' aria-haspopup="dialog"' +
  ' aria-expanded="false"' +
  ' aria-controls="activity-popover"' +
  ' aria-label="Show hint">?</button>'
  : '';

  // The red `!` mistake button is emitted (but `hidden`) for any blank with
  // authored mistake feedback. The runtime reveals it only when a wrong answer
  // matches an entry, and clicking it opens the shared popover with that
  // entry's text (carried on data-mistake-feedback below). Blanks without
  // authored mistake feedback get no button.
  const mistakeFeedback = node.mistakeFeedback;
  const hasMistakeFeedback = mistakeFeedback && mistakeFeedback.length > 0;
  const mistakeFeedbackAttr = hasMistakeFeedback
  ? ' data-mistake-feedback="' + attr(JSON.stringify(mistakeFeedback)) + '"'
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
  //   2. an optional `?` hint button (only when node.hint is set) that opens
  //      the shared popover; the hint text rides on data-hint,
  //   3. an optional red `!` mistake button (only when mistakeFeedback is
  //      authored) — emitted `hidden`, revealed by the runtime when a wrong
  //      answer matches an entry, and opening the shared popover with that
  //      feedback text.
  //
  // The wrapper exists because <input> is a void element — the buttons can't
  // be its children. It also keeps the whole affordance group together as a
  // single inline unit, so the input and its buttons can't wrap onto separate
  // lines mid-prose. The wrapper itself carries no data-* attributes; the
  // runtime reaches each child via class selectors.
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
    mistakeButton +
    '</span>'
  );
}
