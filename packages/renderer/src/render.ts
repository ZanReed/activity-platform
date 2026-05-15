// =============================================================================
// render.ts — Render the document body (sections + blocks)
// -----------------------------------------------------------------------------
// Produces the body HTML — sections and blocks. Walks the document in order,
// maintaining a single problem counter that increments on every problem or
// fill_in_blank block across all sections. The document.ts wrapper layers the
// <main>, <head>, runtime JS, and submission UI on top of this.
//
// Exported separately so the editor preview can render the body without the
// surrounding chrome (the editor IS the chrome).
// =============================================================================

import type { ActivityDocument, Section } from '@activity/schema';
import { renderBlock, isNumberedBlock } from './blocks/index.js';
import { attr, escape } from './html.js';

export function renderBody(doc: ActivityDocument): string {
  // Single counter, threaded across sections. Resetting per-section would
  // produce "Problem 1" appearing twice in the same worksheet, which is
  // confusing; this matches what teachers expect from a print worksheet.
  let problemNumber = 0;

  return doc.sections.map((section) => {
    return renderSection(section, () => ++problemNumber);
  }).join('');
}

function renderSection(section: Section, nextProblemNumber: () => number): string {
  const titleHtml = section.title
    ? '<h2 class="section-title">' + escape(section.title) + '</h2>'
    : '';

  const blocksHtml = section.blocks.map((block) => {
    // Increment the counter BEFORE rendering so the rendered number is
    // 1-indexed and matches the position in the auto-counted sequence.
    // Non-numbered blocks don't increment.
    const num = isNumberedBlock(block) ? nextProblemNumber() : 0;
    return renderBlock(block, { problemNumber: num });
  }).join('');

  return (
    '<section class="activity-section" data-block-category="content" data-id="' + attr(section.id) + '">' +
      titleHtml +
      blocksHtml +
    '</section>'
  );
}
