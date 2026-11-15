import { z } from 'zod';
import { InlineNode } from '../inline.js';

// Three levels is a deliberate constraint. Worksheets don't need deeper
// hierarchy and capping it at 3 keeps the visual hierarchy meaningful.
export const HeadingLevel = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type HeadingLevel = z.infer<typeof HeadingLevel>;

export const HeadingBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('heading'),
  level: HeadingLevel,
  content: z.array(InlineNode),
  // Left / centre / right (schema-shortlist.md S6-a, 2026-11-15). Absent =
  // left, so older documents re-serialize unchanged.
  align: z.enum(['center', 'right']).optional(),
});
export type HeadingBlock = z.infer<typeof HeadingBlock>;
