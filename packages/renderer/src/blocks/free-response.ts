import type { ShortAnswerBlock, EssayBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr } from '../html.js';

// =============================================================================
// free-response.ts — render short_answer + essay (manually-graded free text)
// -----------------------------------------------------------------------------
// A prompt over a <textarea> the student writes in. Both carry the shared
// `.free-text-input` class (+ data-for-block) so ONE runtime — the free-text
// capture, which also handles self_explanation — persists + submits the value,
// keyed by block id, into `freeResponses`. INTERACTIVE but never auto-scored:
// no answer key, no problem number, data-block-category="question" (the teacher
// grades it manually; the dashboard surfaces the text). Essay adds a live word
// counter (.free-text-wordcount) + an optional target range in data-* attrs the
// runtime reads to colour in/out of range. The word count is computed-on-read,
// never stored in the wire.
// =============================================================================

function renderPromptAndTextarea(
  blockType: 'short_answer' | 'essay',
  id: string,
  prompt: string,
  placeholder: string | undefined,
  rows: number,
  extra: string,
): string {
  const placeholderAttr = placeholder
    ? ' placeholder="' + attr(placeholder) + '"'
    : '';
  const cls = 'block-free-response block-' + blockType.replace('_', '-');
  return (
    '<div class="block ' + cls + '"' +
    ' data-block-category="question"' +
    ' data-block-type="' + blockType + '"' +
    ' data-block-id="' + attr(id) + '">' +
    '<div class="block-free-response__prompt">' + prompt + '</div>' +
    '<textarea class="free-text-input"' +
    ' data-for-block="' + attr(id) + '"' +
    ' rows="' + rows + '"' +
    placeholderAttr +
    ' aria-label="Your answer"></textarea>' +
    extra +
    '</div>'
  );
}

export function renderShortAnswer(block: ShortAnswerBlock): string {
  const prompt = block.prompt.map(renderInline).join('');
  return renderPromptAndTextarea(
    'short_answer',
    block.id,
    prompt,
    block.placeholder?.trim() || undefined,
    3,
    '',
  );
}

export function renderEssay(block: EssayBlock): string {
  const prompt = block.prompt.map(renderInline).join('');
  const hint = block.wordCountHint;
  const minAttr =
    hint?.min !== undefined ? ' data-word-min="' + hint.min + '"' : '';
  const maxAttr =
    hint?.max !== undefined ? ' data-word-max="' + hint.max + '"' : '';
  // Live counter. Starts empty (the runtime fills it on init + input); a no-JS
  // page simply shows nothing here. aria-live so the count is announced.
  const counter =
    '<div class="free-text-wordcount"' +
    ' data-for-block="' + attr(block.id) + '"' +
    minAttr +
    maxAttr +
    ' aria-live="polite"></div>';
  return renderPromptAndTextarea(
    'essay',
    block.id,
    prompt,
    block.placeholder?.trim() || undefined,
    10,
    counter,
  );
}
