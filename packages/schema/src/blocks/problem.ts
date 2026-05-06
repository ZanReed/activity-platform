import { z } from 'zod';
import { InlineNode } from '../inline.js';

// Auto-numbered at render time by walking the document and counting problem
// blocks in order. The optional `number` field overrides the auto-number
// (rare cases like "Problem 5a" or hand-numbered legacy worksheets).
export const ProblemBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('problem'),
  number: z.number().int().positive().optional(),
  content: z.array(InlineNode),
});
export type ProblemBlock = z.infer<typeof ProblemBlock>;
