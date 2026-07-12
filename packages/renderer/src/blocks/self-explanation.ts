import type { SelfExplanationBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr } from '../html.js';

// =============================================================================
// self-explanation.ts — Render an ungraded free-text reflection prompt
// -----------------------------------------------------------------------------
// A prompt (rich inline) over a <textarea> the student writes in. INTERACTIVE:
// the runtime reads the textarea value at submit/persist time keyed by the
// block id (data-block-type="self_explanation" + the .self-explanation-input
// textarea — see RUNTIME.md's contract). Ungraded, so no answer key, no problem
// number (it isn't a scored/numbered question), and no showAnswers variant.
// data-block-category="question" because it collects a submitted response the
// teacher dashboard surfaces.
// =============================================================================

export function renderSelfExplanation(block: SelfExplanationBlock): string {
  const prompt = block.prompt.map(renderInline).join('');
  const placeholder = block.placeholder?.trim();
  const placeholderAttr = placeholder
    ? ' placeholder="' + attr(placeholder) + '"'
    : '';

  return (
    '<div class="block block-self-explanation"' +
    ' data-block-category="question"' +
    ' data-block-type="self_explanation"' +
    ' data-block-id="' + attr(block.id) + '">' +
    '<div class="block-self-explanation__prompt">' + prompt + '</div>' +
    // Carries the shared `.free-text-input` hook (the runtime captures all
    // three free-text block types by it) plus its original class for the
    // existing data-attribute contract.
    '<textarea class="free-text-input self-explanation-input"' +
    ' data-for-block="' + attr(block.id) + '"' +
    ' rows="4"' +
    placeholderAttr +
    ' aria-label="Your explanation"></textarea>' +
    '</div>'
  );
}
