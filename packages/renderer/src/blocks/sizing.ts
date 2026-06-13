// =============================================================================
// sizing.ts — Per-block width/align emission (variable block sizing, Drop 1)
// -----------------------------------------------------------------------------
// The shared render path for the schema's sizing fragment (width fraction +
// align). A sized block gets:
//   * class "block-sized"                — hooks the width/centering CSS
//   * style="--block-width:<pct>%"       — a custom property, not a direct
//     width, so the narrow-screen @media rule can relax it back to 100%
//     (custom properties lose to later rules; an inline width would win) —
//     the same pattern as --columns-template
//   * data-block-align="left"|"right"    — only when not centered; absence IS
//     the center default, mirroring how data-grid-lines absence means unruled
//
// align without width is a no-op by design (full-width blocks have nothing to
// align), so both emissions key off width being present.
// =============================================================================

import type { BlockAlign } from '@activity/schema';

interface SizedBlock {
  width?: number;
  align?: BlockAlign;
}

// Trim float artifacts (0.33 * 100 → 33.000000000000004 → "33") while keeping
// intentional precision ("66.5"). Inputs are schema-validated numbers, so the
// output is a safe numeric token, never a user string.
function formatNumber(n: number): string {
  return String(Number(n.toFixed(4)));
}

/** Extra class for a sized block ('' when unsized). Append to the class list. */
export function sizingClass(block: SizedBlock): string {
  return block.width !== undefined ? ' block-sized' : '';
}

/**
 * Extra attributes for a sized block ('' when unsized). Append before the
 * closing '>' of the block's opening tag — includes its own leading space.
 *
 * extraStyleVars lets a block type contribute its own custom properties to
 * the same style attribute (the image block's --block-height) — they emit
 * even when width is absent, since e.g. a height-only image is still sized.
 */
export function sizingAttrs(
  block: SizedBlock,
  extraStyleVars: string[] = [],
): string {
  const vars: string[] = [];
  if (block.width !== undefined) {
    vars.push('--block-width:' + formatNumber(block.width * 100) + '%');
  }
  vars.push(...extraStyleVars);
  const alignAttr =
    block.width !== undefined &&
    (block.align === 'left' || block.align === 'right')
      ? ' data-block-align="' + block.align + '"'
      : '';
  const styleAttr =
    vars.length > 0 ? ' style="' + vars.join(';') + '"' : '';
  return alignAttr + styleAttr;
}

/** Format a rem length for a style emission (used by Column.minHeight). */
export function remLength(n: number): string {
  return formatNumber(n) + 'rem';
}
