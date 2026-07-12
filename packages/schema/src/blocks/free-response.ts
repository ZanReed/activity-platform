import { z } from 'zod';
import { InlineNode } from '../inline.js';

// =============================================================================
// free-response.ts — short_answer + essay (manually-graded free text)
// -----------------------------------------------------------------------------
// The Phase 2.6 graded free-text siblings of self_explanation. All three write
// their student text into the SAME `freeResponses` map (wire v9) — the response
// shape is identical (a string); what differs is intent + grading:
//   - self_explanation — ungraded reflection (already shipped).
//   - short_answer     — a brief graded response (manual rubric grading, 2.6).
//   - essay            — a long graded response; adds optional word-count
//                        guidance (a target range shown as a live counter).
// Grading itself lives in a separate `grades` table (Phase 2.6 later slices),
// never in the submission jsonb — grades are mutable, submissions are not. These
// blocks carry NO answer key and are never auto-scored by the runtime.
//
// wordCountHint (essay only): an optional {min?, max?} target. The renderer
// shows a live word counter; the count itself is computed-on-read (never stored
// in the wire — it's derivable from the text), so this is display guidance only.
// =============================================================================

export const ShortAnswerBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('short_answer'),
  prompt: z.array(InlineNode),
  placeholder: z.string().optional(),
});
export type ShortAnswerBlock = z.infer<typeof ShortAnswerBlock>;

export const WordCountHint = z
  .object({
    min: z.number().int().positive().optional(),
    max: z.number().int().positive().optional(),
  })
  // Guard against an inverted range (min > max) — a nonsense hint the editor
  // shouldn't be able to produce, but validation is the schema's job.
  .refine(
    (h) => h.min === undefined || h.max === undefined || h.min <= h.max,
    { message: 'wordCountHint.min must be ≤ max' },
  );
export type WordCountHint = z.infer<typeof WordCountHint>;

export const EssayBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('essay'),
  prompt: z.array(InlineNode),
  placeholder: z.string().optional(),
  wordCountHint: WordCountHint.optional(),
});
export type EssayBlock = z.infer<typeof EssayBlock>;
