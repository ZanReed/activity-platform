import { z } from 'zod';
import { InlineNode } from '../inline.js';

// =============================================================================
// SelfExplanationBlock — an ungraded free-text reflection prompt.
// -----------------------------------------------------------------------------
// Metacognitive self-explanation (Chi et al.): the student writes WHY, in their
// own words. Deliberately UNGRADED (author decision, 2026-07-12) — the runtime
// captures the text and the teacher dashboard shows it raw; there is no answer
// key, no correct/incorrect, and it never contributes to the score. This keeps
// it clear of Phase 2.6 rubric grading.
//
// It is the FIRST free-text response type, so it introduces the `freeResponses`
// map on SubmissionResponses (wire v8 → v9) — the map name the schema reserved
// for exactly this shape. Phase 2.6 short_answer / essay reuse the same map (a
// string per block) with no further wire bump; grading, when it lands, lives in
// a separate table, not in the response shape.
//
// Shape: a `prompt` (rich inline — text + inline math + marks, like every other
// question prompt) plus an optional `placeholder` (a sentence-starter / hint
// shown in the empty textarea). No answer key.
// =============================================================================

export const SelfExplanationBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('self_explanation'),
  prompt: z.array(InlineNode),
  placeholder: z.string().optional(),
});
export type SelfExplanationBlock = z.infer<typeof SelfExplanationBlock>;
