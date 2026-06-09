import { z } from 'zod';
import { FillInBlankInline, InlineNode } from '../inline.js';

// The architecturally interesting block. content is an array of inline nodes
// that may include BlankToken — students see prose with editable blanks.
// Each blank's id is a stable reference used in submissions.responses, so
// reordering blocks doesn't break grading on past submissions.
//
// auto-numbered like ProblemBlock for the problem header (e.g., "Problem 3").
// Why not just use ProblemBlock? They have different rendering and different
// student interaction; conflating them would force every problem to either
// have or not have blanks, instead of being a per-problem decision.
//
// Per-blank fields (hint, mistakeFeedback) live on BlankToken in inline.ts.
// Per-block fields below:
//   - solution: one worked explanation for the whole problem (a "simplify
//     __x² + __x - 12" prompt has one solution covering all blanks, not one
//     per blank). Shown post-check regardless of correctness.
//   - hasConfidenceRating: when true, students see a 3-point confidence
//     selector (unsure / think_so / certain) for this problem before
//     checking. Asked once per problem, not per blank. The runtime stores
//     the rating per-blank in SubmissionResponses (applied uniformly to
//     every blank in this problem).
//   - skills: universal skill tags (see ActivityMeta.skills). Editor UI for
//     this field is Phase 2; field exists in Phase 1 so per-skill analytics
//     can reach back to Phase 1 problems when the editor lands.
export const FillInBlankBlock = z.object({
  id: z.string().uuid(),
                                         type: z.literal('fill_in_blank'),
                                         number: z.number().int().positive().optional(),
                                         content: z.array(FillInBlankInline),
                                         solution: z.array(InlineNode).optional(),
                                         hasConfidenceRating: z.boolean().default(false),
                                         skills: z.array(z.string()).default([]),
});
export type FillInBlankBlock = z.infer<typeof FillInBlankBlock>;
