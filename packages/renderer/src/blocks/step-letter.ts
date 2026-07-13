// =============================================================================
// stepLetter — a bijective base-26 index → letter label for faded-example steps.
// -----------------------------------------------------------------------------
// 0 → "a", 1 → "b", … 25 → "z", 26 → "aa", 27 → "ab", … Mirrored by the editor's
// own copy in packages/app/src/editor/problemNumbering.ts (parallel helper, like
// isNumberedBlock / problemNumberAt) so the editor and published page label
// steps identically.
// =============================================================================

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
