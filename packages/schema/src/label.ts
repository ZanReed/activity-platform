// =============================================================================
// label.ts — Shared per-block display-label fragment (numbering/label decouple)
// -----------------------------------------------------------------------------
// Decouples "is this gradeable?" from "does it wear a problem number?". A
// gradeable block is always scored and always reviewable; this field controls
// only what shows on the page:
//
//   auto   — the default: a numbered problem, consuming one slot of the
//            document-wide sequence (today's behavior for every gradeable block).
//   custom — show authored text ("Warm-up", "Challenge") instead of a number,
//            and DON'T consume a sequence slot (out-of-sequence label).
//   none   — show nothing; DON'T consume a slot. The notes keyword-blank case:
//            a gradeable gap that keeps students reading without looking like a
//            quiz question. Still scored, still in the teacher's results view
//            (located by its surrounding text, not a number).
//
// Optional with NO default, exactly like sizingFields and math_block.prompts:
// an absent `label` means `auto`, so a block authored before this feature — or
// one left at the default — re-serializes BYTE-IDENTICALLY. The renderer and
// editor treat `undefined` and `{mode:'auto'}` identically.
//
// The per-block manual integer `number` override is orthogonal and still lives
// on the individual blocks: it relabels the shown integer while STAYING in
// sequence, and it applies only when the label mode is auto (custom/none win).
// See docs/design + block-predicates.ts.
// =============================================================================

import { z } from 'zod';

export const BlockLabel = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('auto') }),
  // min(1): an empty custom label is meaningless — author either wants text or
  // wants `none`. Keeps round-trip honest (no empty-string ghosts).
  z.object({ mode: z.literal('custom'), text: z.string().min(1) }),
  z.object({ mode: z.literal('none') }),
]);
export type BlockLabel = z.infer<typeof BlockLabel>;

// Spread into a gradeable block's z.object({...}) shape. Plain object (not a Zod
// schema) so each block keeps a flat field list and discriminatedUnion keeps
// working, mirroring sizingFields.
export const labelFields = {
  label: BlockLabel.optional(),
};
