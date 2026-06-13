import { z } from 'zod';
import { sizingFields } from '../sizing.js';

// Phase 1: URL-only. No upload pipeline; teachers paste a public URL.
// Phase 2+: a separate variant with a Supabase Storage upload, with src
// pointing to a signed URL. Schema is forward-compatible — adding a new
// `source` discriminator field later is non-breaking if existing rows are
// treated as `source: 'url'` by default.
export const ImageBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('image'),
  src: z.string().url(),
  // alt is required for accessibility but defaults to empty string for
  // decorative images. Editors should warn (not block) on empty alt.
  alt: z.string().default(''),
  caption: z.string().optional(),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // This IS the image display-size mechanism — no separate intrinsic size.
  ...sizingFields,
  // Optional fixed display height in rem (scales with the print font-size
  // config, like Column.minHeight). When BOTH width and height are set and
  // disagree with the image's natural aspect ratio, the renderer center-CROPS
  // (object-fit: cover) rather than stretching — author decision 2026-06-12.
  // Height alone scales the image proportionally (width follows). Reflow-safe:
  // a fixed image height measures honestly in print/foldable pagination.
  height: z.number().positive().optional(),
});
export type ImageBlock = z.infer<typeof ImageBlock>;
