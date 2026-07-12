// =============================================================================
// worked-example.ts — Render a boxed, fully-worked example to study
// -----------------------------------------------------------------------------
// A pure content block: a titled frame whose body is nested content blocks
// (paragraphs, block math, lists, images) rendered through the shared
// renderBlock dispatch — the same recursion columns uses. data-block-category=
// "content" keeps it out of scoring/indexing; its children are a curated
// content-only subset (see the schema's WorkedExampleChild) so none of them is
// a numbered question, and the shared ctx.nextProblemNumber is never pulled.
// =============================================================================

import type { WorkedExampleBlock } from '@activity/schema';
import type { BlockRenderContext } from './index.js';
import { renderBlock } from './index.js';
import { attr, escape } from '../html.js';

export function renderWorkedExample(
  block: WorkedExampleBlock,
  ctx: BlockRenderContext,
): string {
  const body = block.content.map((child) => renderBlock(child, ctx)).join('');

  const title = block.title.trim();
  const label = title || 'Worked example';
  const titleHtml =
    '<p class="block-worked-example__title">' +
    '<span class="block-worked-example__icon" aria-hidden="true">✎</span>' +
    escape(label) +
    '</p>';

  return (
    '<section class="block block-worked-example"' +
    ' data-block-category="content"' +
    ' data-block-type="worked_example"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' aria-label="' + attr(label) + '">' +
    titleHtml +
    '<div class="block-worked-example__body">' + body + '</div>' +
    '</section>'
  );
}
