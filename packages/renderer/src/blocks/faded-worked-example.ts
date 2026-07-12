// =============================================================================
// faded-worked-example.ts — Render a scaffolded ("faded") worked example
// -----------------------------------------------------------------------------
// A scaffold frame whose body is nested content blocks rendered through the
// shared renderBlock dispatch — the same recursion columns / worked_example
// use. The FADED steps are fill_in_blank children: renderBlock routes them to
// renderFillInBlank, which pulls ctx.nextProblemNumber (so they number as
// ordinary problems) and emits the `data-block-type="fill_in_blank"` + `.blank`
// markup the runtime already scans each section for. So this frame needs NO
// runtime wiring of its own — data-block-category="scaffold" reflects that its
// scoring rides its child blanks (it is a CONTAINER, like `problem`).
// =============================================================================

import type { FadedWorkedExampleBlock } from '@activity/schema';
import type { BlockRenderContext } from './index.js';
import { renderBlock } from './index.js';
import { attr, escape } from '../html.js';

export function renderFadedWorkedExample(
  block: FadedWorkedExampleBlock,
  ctx: BlockRenderContext,
): string {
  const body = block.content.map((child) => renderBlock(child, ctx)).join('');

  const title = block.title.trim();
  const label = title || 'Guided practice';
  const titleHtml =
    '<p class="block-faded-example__title">' +
    '<span class="block-faded-example__icon" aria-hidden="true">✍</span>' +
    escape(label) +
    '</p>';

  return (
    '<section class="block block-faded-example"' +
    ' data-block-category="scaffold"' +
    ' data-block-type="faded_worked_example"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' aria-label="' + attr(label) + '">' +
    titleHtml +
    '<div class="block-faded-example__body">' + body + '</div>' +
    '</section>'
  );
}
