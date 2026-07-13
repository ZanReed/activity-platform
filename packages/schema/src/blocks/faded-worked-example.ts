import { z } from 'zod';
import { ParagraphBlock } from './paragraph.js';
import { HeadingBlock } from './heading.js';
import { MathBlock } from './math-block.js';
import { ImageBlock } from './image.js';
import { BulletListBlock, OrderedListBlock } from './list.js';
import { FillInBlankBlock } from './fill-in-blank.js';

// =============================================================================
// FadedWorkedExampleBlock — a scaffolded ("faded") worked example.
// -----------------------------------------------------------------------------
// The interactive sibling of worked_example (Renkl/Atkinson completion
// problems): early steps are fully shown, later steps are FADED — the student
// fills them in. Structurally it's a worked_example frame whose child union
// ALSO admits fill_in_blank blocks: a shown step is a paragraph / block math /
// list / image; a faded step is a fill_in_blank block carrying the blanks.
//
// Reuse over reinvention (decided at design, 2026-07-12):
//   - The faded steps ARE fill_in_blank blocks, so the runtime scores them with
//     ZERO new runtime code — init.ts already scans each .activity-section for
//     `[data-block-type="fill_in_blank"]` and finds NESTED ones. They ride the
//     existing BlankResponse map, so there is NO submission wire/storage bump.
//   - Scoring rides the child blanks; this frame reads no type-specific
//     attributes itself → it is a CONTAINER (like `problem`), not INTERACTIVE.
//   - Numbering (revised 2026-07-13): the WHOLE box is one numbered problem —
//     its number leads the title, and the faded fill_in_blank steps are lettered
//     (a)/(b)… LOCALLY (showStepLabels toggles them off), so they no longer
//     consume worksheet problem numbers. See renderFadedWorkedExample and the
//     editor's problemNumberAt (which treats the box as atomic). This reversed
//     the original "steps number as ordinary problems" choice, which wasted
//     writing/print width and polluted the worksheet's numbering.
//
// The child union still excludes questions OTHER than fill_in_blank, plus
// columns / worked_example / faded_worked_example itself — so nesting
// terminates and the dashboard index recurses only one predictable level.
// `content` may be empty for the same round-trip-safety reason as
// worked_example.
// =============================================================================

export const FadedWorkedExampleChild = z.discriminatedUnion('type', [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  BulletListBlock,
  OrderedListBlock,
  FillInBlankBlock,
]);
export type FadedWorkedExampleChild = z.infer<typeof FadedWorkedExampleChild>;

export const FadedWorkedExampleBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('faded_worked_example'),
  title: z.string(),
  content: z.array(FadedWorkedExampleChild),
  // The whole box is ONE numbered problem (its number leads the title); the
  // faded fill_in_blank steps are lettered (a), (b)… WITHIN the box instead of
  // consuming worksheet problem numbers. showStepLabels toggles those letters
  // off per box (bare blanks, no gutter) for teachers who want maximum writing
  // room. Defaulted so pre-existing documents (no field) render labelled.
  showStepLabels: z.boolean().default(true),
});
export type FadedWorkedExampleBlock = z.infer<typeof FadedWorkedExampleBlock>;
