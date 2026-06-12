// =============================================================================
// sizing.ts — Shared per-block sizing fragment (variable block sizing, Drop 1)
// -----------------------------------------------------------------------------
// One unified mechanism for "this block renders narrower than its container":
// an optional width FRACTION plus an optional alignment. Applied today to
// ImageBlock and MathBlock (the sizable set with a real authoring surface);
// extends to other blocks additively when their editing UI lands. Design:
// docs/design/variable-block-sizing.md.
//
// Reflow-safe by construction: width is relative (a fraction of whatever
// container the block sits in — page or column cell), never absolute pixels,
// and a narrowed block stays in normal flow (no wrap-around/float), so print
// pagination and the foldable's height measurement keep working.
//
// width — fraction of the container's content width, in (0, 1]. Absent = full
// width (today's behavior). The editor UI snaps to clean stops (25/33/50/66/
// 75/100%) but the schema accepts any fraction so fine-grained drags validate.
//
// align — where the narrowed block sits horizontally. Absent = center (the
// natural read for figures on a worksheet); only meaningful when width is
// present, and the renderer ignores it otherwise. Stored only when width is
// set and the value is 'left'/'right', so round-trip equality holds for the
// default case.
// =============================================================================

import { z } from 'zod';

export const BlockAlign = z.enum(['left', 'center', 'right']);
export type BlockAlign = z.infer<typeof BlockAlign>;

// Fraction of container width. gt(0) not min(0) — a zero-width block is a
// hidden block, which is a different (nonexistent) feature.
export const BlockWidthFraction = z.number().gt(0).max(1);

// Spread into a block's z.object({...}) shape. A plain object (not a Zod
// schema) so each block keeps a flat field list and discriminatedUnion keeps
// working untouched.
export const sizingFields = {
  width: BlockWidthFraction.optional(),
  align: BlockAlign.optional(),
};
