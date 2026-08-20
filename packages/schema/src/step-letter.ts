// =============================================================================
// step-letter.ts — bijective base-26 index → letter (0→"a" … 25→"z", 26→"aa")
// -----------------------------------------------------------------------------
// The compact marker used wherever something is lettered rather than numbered:
// a faded worked example's steps, and the sub-part letters on a numbered
// multi-blank fill_in_blank ("(a) ___ (b) ___").
//
// WHY IT LIVES IN SCHEMA (viewer-numbering ruling N9). There were two copies and
// there was about to be a third. The renderer had one
// (packages/renderer/src/blocks/step-letter.ts) and it died with the package at
// S9 Drop 4; the editor has one (problemNumbering.ts); and the viewer needs one
// now that sub-part lettering is coming back. Three copies of a bijective
// base-26 function is the repetition worth deleting, and schema is already the
// shared home for the numbering vocabulary these callers reach for anyway
// (isPageNumbered, pageLabel, BlockLabel) — both packages depend on it.
//
// BIJECTIVE, not plain base-26, and the difference shows up at 26: the sequence
// is a…z, aa, ab, … There is no "digit zero", so index 26 is "aa" rather than
// "ba" or "a0". That is the convention worksheets use for sub-parts, and the
// renderer's version behaved the same way — this is a move, not a rewrite.
// =============================================================================

/**
 * Zero-based index → its lowercase letter marker.
 *
 * @example stepLetter(0)  // "a"
 * @example stepLetter(25) // "z"
 * @example stepLetter(26) // "aa"
 */
export function stepLetter(index: number): string {
  let n = index + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(97 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}
