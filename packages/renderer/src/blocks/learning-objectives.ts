import type { LearningObjectivesBlock } from '@activity/schema';
import { renderInline } from '../inline.js';
import { attr, escape } from '../html.js';

// A pure content block: a titled <ul> of learning objectives. No runtime
// wiring, no data-* attributes the runtime reads — data-block-category="content"
// keeps it out of scoring/indexing. Empty items are dropped so a stray blank
// objective doesn't render an empty bullet.
export function renderLearningObjectives(block: LearningObjectivesBlock): string {
  const items = block.items
    .map((item) => item.map(renderInline).join(''))
    .filter((html) => html.trim().length > 0)
    .map((html) => '<li class="block-learning-objectives__item">' + html + '</li>')
    .join('');

  const title = block.title.trim();
  const label = title || 'Learning objectives';
  // Always render the titled header with the type icon (matching worked_example):
  // the leading glyph is the non-colour cue that replaces the old accent
  // left-stripe, so it must be present even when the author left the title blank.
  const titleHtml =
    '<p class="block-learning-objectives__title">' +
    '<span class="block-learning-objectives__icon" aria-hidden="true">◎</span>' +
    escape(label) +
    '</p>';

  return (
    '<section class="block block-learning-objectives"' +
    ' data-block-category="content"' +
    ' data-block-type="learning_objectives"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' aria-label="' + attr(label) + '">' +
    titleHtml +
    '<ul class="block-learning-objectives__list">' + items + '</ul>' +
    '</section>'
  );
}
