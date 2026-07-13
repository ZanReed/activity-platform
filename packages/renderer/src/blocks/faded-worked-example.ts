// =============================================================================
// faded-worked-example.ts — Render a scaffolded ("faded") worked example
// -----------------------------------------------------------------------------
// A scaffold frame whose SHOWN steps (paragraph / math / list / image) render
// through the shared renderBlock dispatch. The whole box is ONE numbered problem
// — it pulls ctx.nextProblemNumber once (the number leads its title). The FADED
// steps are fill_in_blank children rendered in `fadedStep` mode: no problem
// number, a compact local "(a)/(b)" label (omitted when showStepLabels is
// false), so they do NOT consume worksheet numbers. They still emit the
// `data-block-type="fill_in_blank"` + `.blank` markup the runtime scans each
// section for, so this frame needs NO runtime wiring — scoring rides its child
// blanks (data-block-category="scaffold"; a CONTAINER, like `problem`).
// =============================================================================

import type { FadedWorkedExampleBlock } from '@activity/schema';
import type { BlockRenderContext } from './index.js';
import { renderBlock } from './index.js';
import { renderFillInBlank } from './fill-in-blank.js';
import { stepLetter } from './step-letter.js';
import { attr, escape } from '../html.js';

export function renderFadedWorkedExample(
  block: FadedWorkedExampleBlock,
  ctx: BlockRenderContext,
): string {
  // The whole box is ONE numbered problem: pull the sequence once, here, so the
  // number leads the title. The faded fill_in_blank steps are lettered locally
  // and never touch ctx.nextProblemNumber — that's what keeps them out of the
  // worksheet's problem count. Shown steps (paragraph/math/list/image) still go
  // through the shared renderBlock dispatch.
  const boxNumber = ctx.nextProblemNumber();
  const showStepLabels = block.showStepLabels !== false;
  let stepIndex = 0;
  const body = block.content
    .map((child) => {
      if (child.type === 'fill_in_blank') {
        const stepLabel = showStepLabels
          ? '(' + stepLetter(stepIndex) + ')'
          : '';
        stepIndex += 1;
        return renderFillInBlank(child, {
          problemNumber: boxNumber, // unused in faded mode; kept type-complete
          showAnswers: ctx.showAnswers,
          fadedStep: true,
          stepLabel,
        });
      }
      return renderBlock(child, ctx);
    })
    .join('');

  const title = block.title.trim();
  const label = title || 'Guided practice';
  const titleHtml =
    '<p class="block-faded-example__title">' +
    '<span class="block-faded-example__number">' +
    escape(String(boxNumber)) +
    '.</span> ' +
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
