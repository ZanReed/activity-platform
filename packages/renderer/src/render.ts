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
//
// Stage 12 step 4: sections grow checkpoint markup when the activity's
// submissionMode is 'locked' or 'free'. data-is-checkpoint signals to the
// runtime which sections gate progression / scoring; the .js-checkpoint-btn
// and .js-section-score elements give the runtime targets to wire and
// populate. In 'single' submissionMode the entire checkpoint contract is
// elided — single is the no-checkpoint mode, full stop; the attribute's
// absence is the signal (decision 4).
// =============================================================================

import type { ActivityDocument, Section } from '@activity/schema';
import { renderBlock } from './blocks/index.js';
import { attr, escape } from './html.js';

// Local mirror of the schema enum — keeps the renderer free of a non-type
// schema import. If the schema's enum drifts (a new mode added) the
// ActivityDocument import below pulls in the wider type and tsc catches
// the mismatch at this assignment.
type SubmissionMode = 'single' | 'locked' | 'free';

interface SectionRenderContext {
  nextProblemNumber: () => number;
  submissionMode: SubmissionMode;
  showAnswers: boolean;
  gridLinesDefault: boolean;
}

// opts.showAnswers drives the answer-key print variant (Drop C): blanks render
// prefilled with their canonical answer. Defaults to false, so the published
// page and editor preview (both call renderBody(doc)) are unaffected.
export function renderBody(
  doc: ActivityDocument,
  opts: { showAnswers?: boolean } = {},
): string {
  // Single counter, threaded across sections. Resetting per-section would
  // produce "Problem 1" appearing twice in the same worksheet, which is
  // confusing; this matches what teachers expect from a print worksheet.
  let problemNumber = 0;
  const submissionMode = doc.meta.submissionMode;
  const showAnswers = opts.showAnswers ?? false;
  // Optional-chained: a schema-parsed doc always carries meta.print, but the
  // editor preview / lightweight callers may hand renderBody a doc whose print
  // defaults haven't been materialized. gridLines defaults to false there.
  const gridLinesDefault = doc.meta.print?.gridLines ?? false;

  return doc.sections.map((section) => {
    return renderSection(section, {
      nextProblemNumber: () => ++problemNumber,
                         submissionMode,
                         showAnswers,
                         gridLinesDefault,
    });
  }).join('');
}

function renderSection(section: Section, ctx: SectionRenderContext): string {
  const titleHtml = section.title
  ? '<h2 class="section-title">' + escape(section.title) + '</h2>'
  : '';

  const blocksHtml = section.blocks.map((block) => {
    // renderBlock pulls auto-numbers from the shared sequence itself (once per
    // numbered block, in render order) — including problems nested inside a
    // columns container, which draw from the same closure for column-major
    // numbering. Non-numbered blocks simply don't pull.
    return renderBlock(block, {
      nextProblemNumber: ctx.nextProblemNumber,
      showAnswers: ctx.showAnswers,
      gridLinesDefault: ctx.gridLinesDefault,
    });
  }).join('');

  // Checkpoint contract (Stage 12 step 4).
  //
  // In 'locked' and 'free' submissionMode every section emits
  // data-is-checkpoint with a true/false value — the attribute's PRESENCE
  // tells the runtime "this activity uses checkpoints in general", the
  // VALUE tells it whether this specific section is one. In 'single' mode
  // the attribute is omitted entirely (decision 4); the runtime sees no
  // contract surface and treats the activity as a flat submit-at-end flow.
  //
  // The button + score-display pair renders only when both conditions
  // hold: the activity is checkpoint-capable AND this section is flagged
  // isCheckpoint. They sit at the end of the section after the blocks,
  // matching the natural reading flow (work problems → check section →
  // see score).
  //
  // type="button" on the checkpoint button is non-negotiable per
  // RUNTIME.md — without it browsers default to type="submit", which
  // submits the parent form (if any) and the runtime never sees the
  // click. The score display starts hidden; the runtime un-hides it
  // after a check and populates it with text like "4 / 6 correct".
  const isCheckpointMode = ctx.submissionMode !== 'single';
  const isCheckpointAttr = isCheckpointMode
  ? ' data-is-checkpoint="' + (section.isCheckpoint ? 'true' : 'false') + '"'
  : '';
  const checkpointControls =
  isCheckpointMode && section.isCheckpoint
  ? '<button class="js-checkpoint-btn"' +
  ' data-for-section="' + attr(section.id) + '"' +
  ' type="button">Check this section</button>' +
  '<div class="js-section-score"' +
  ' data-for-section="' + attr(section.id) + '"' +
  ' hidden></div>'
  : '';

  return (
    '<section class="activity-section"' +
    ' data-block-category="content"' +
    ' data-section-id="' + attr(section.id) + '"' +
    isCheckpointAttr +
    '>' +
    titleHtml +
    blocksHtml +
    checkpointControls +
    '</section>'
  );
}
