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
});
export type HeadingBlock = z.infer<typeof HeadingBlock>;
