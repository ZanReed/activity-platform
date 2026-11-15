import { z } from 'zod';
import { InlineNode } from '../inline.js';

export const ParagraphBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('paragraph'),
  content: z.array(InlineNode),
  // Left / centre / right (schema-shortlist.md S6-a, 2026-11-15). Absent =
  // left, so older documents re-serialize unchanged.
  align: z.enum(['center', 'right']).optional(),
});
export type ParagraphBlock = z.infer<typeof ParagraphBlock>;
