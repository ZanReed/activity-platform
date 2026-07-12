import { z } from 'zod';
import { InlineNode } from '../inline.js';

// =============================================================================
// LearningObjectivesBlock — a titled list of learning objectives.
// -----------------------------------------------------------------------------
// A pure CONTENT block (data-block-category="content"): non-interactive,
// non-numbered, no runtime wiring, no submission wire impact. Pedagogically it
// fronts an activity (or a section) with the "students will be able to…" goals
// that Sweller-style scaffolding is built around.
//
// Shape: an editable `title` (defaulted, but the teacher can rename it) plus a
// list of `items`, each a rich inline run (text + inline math + marks) — the
// same alphabet paragraphs use. Items map 1:1 to editable paragraphs in the
// editor NodeView; the renderer emits them as a <ul>.
//
// `items` may be empty: the editor's content spec keeps at least one paragraph
// live, but a serialized round-trip can legitimately produce an empty list
// (e.g. every item cleared), and that must not fail publish validation.
// =============================================================================

export const LearningObjectivesBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('learning_objectives'),
  title: z.string(),
  items: z.array(z.array(InlineNode)),
});
export type LearningObjectivesBlock = z.infer<typeof LearningObjectivesBlock>;
