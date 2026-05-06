import { z } from 'zod';
import { InlineNode } from '../inline.js';

export const ParagraphBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('paragraph'),
  content: z.array(InlineNode),
});
export type ParagraphBlock = z.infer<typeof ParagraphBlock>;
