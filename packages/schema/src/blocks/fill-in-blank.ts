import { z } from 'zod';
import { FillInBlankInline } from '../inline.js';

// The architecturally interesting block. content is an array of inline nodes
// that may include BlankToken — students see prose with editable blanks.
// Each blank's id is a stable reference used in submissions.responses, so
// reordering blocks doesn't break grading on past submissions.
//
// auto-numbered like ProblemBlock for the problem header (e.g., "Problem 3").
// Why not just use ProblemBlock? They have different rendering and different
// student interaction; conflating them would force every problem to either
// have or not have blanks, instead of being a per-problem decision.
export const FillInBlankBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('fill_in_blank'),
  number: z.number().int().positive().optional(),
  content: z.array(FillInBlankInline),
});
export type FillInBlankBlock = z.infer<typeof FillInBlankBlock>;
