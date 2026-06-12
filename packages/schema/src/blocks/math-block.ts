import { z } from 'zod';
import { sizingFields } from '../sizing.js';

// Display math (centered, full width by default). Inline math is in inline.ts
// as InlineMathNode. They're separate node types because they render
// differently and have different semantic meaning.
export const MathBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('math_block'),
  latex: z.string(),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  ...sizingFields,
});
export type MathBlock = z.infer<typeof MathBlock>;
