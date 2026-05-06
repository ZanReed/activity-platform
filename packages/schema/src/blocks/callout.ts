import { z } from 'zod';
import { InlineNode } from '../inline.js';

// Four variants is a deliberate constraint. More than this and styling
// becomes inconsistent across worksheets. Adding a new variant later is a
// breaking schema change — consider that before extending.
export const CalloutVariant = z.enum(['info', 'warning', 'success', 'note']);
export type CalloutVariant = z.infer<typeof CalloutVariant>;

export const CalloutBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('callout'),
  variant: CalloutVariant,
  content: z.array(InlineNode),
});
export type CalloutBlock = z.infer<typeof CalloutBlock>;
