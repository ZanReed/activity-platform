import { z } from 'zod';
import { sizingFields } from '../sizing.js';

// A crop window: the visible rectangle inside the source image, as fractions of
// the source's own width/height. x,y = top-left of the window; w,h = its size.
// The window must stay inside the source (x+w ≤ 1, y+h ≤ 1). A tiny epsilon
// absorbs float error from the editor's px→fraction math. The renderer is pure
// (no image dimensions), so the crop pixel aspect is derived from the separately
// stored `srcAspect` (see ImageBlock). Design: docs/design/image-crop.md.
const CROP_EPSILON = 1e-6;
export const CropRect = z
  .object({
    x: z.number().min(0).lt(1),
    y: z.number().min(0).lt(1),
    w: z.number().gt(0).max(1),
    h: z.number().gt(0).max(1),
  })
  .refine(
    (c) => c.x + c.w <= 1 + CROP_EPSILON && c.y + c.h <= 1 + CROP_EPSILON,
    { message: 'crop window must stay within the source (x+w ≤ 1, y+h ≤ 1)' },
  );
export type CropRect = z.infer<typeof CropRect>;

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
  // Crop (reframe) — the visible sub-rectangle of the source (docs/design/
  // image-crop.md). `srcAspect` (the source's natural W/H ratio) lets the pure
  // renderer derive the crop pixel aspect A = srcAspect·(w/h) without reading
  // image dimensions. Stored BOTH-OR-NEITHER: an uncropped image carries
  // neither (byte-identical to today). The pairing is enforced in the editor +
  // serialize (not a schema .refine — ImageBlock is a discriminatedUnion member
  // and refined objects can't be discriminated); see serialize.ts + CR-INV-both.
  crop: CropRect.optional(),
  srcAspect: z.number().positive().optional(),
});
export type ImageBlock = z.infer<typeof ImageBlock>;
