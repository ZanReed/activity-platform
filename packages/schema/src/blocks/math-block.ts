import { z } from 'zod';

// Display math (centered, full width). Inline math is in inline.ts as
// InlineMathNode. They're separate node types because they render
// differently and have different semantic meaning.
export const MathBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('math_block'),
  latex: z.string(),
});
export type MathBlock = z.infer<typeof MathBlock>;
