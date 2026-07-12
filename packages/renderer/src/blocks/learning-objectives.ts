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
  const titleHtml = title
    ? '<p class="block-learning-objectives__title">' + escape(title) + '</p>'
    : '';

  return (
    '<section class="block block-learning-objectives"' +
    ' data-block-category="content"' +
    ' data-block-type="learning_objectives"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ' aria-label="' + attr(title || 'Learning objectives') + '">' +
    titleHtml +
    '<ul class="block-learning-objectives__list">' + items + '</ul>' +
    '</section>'
  );
}
