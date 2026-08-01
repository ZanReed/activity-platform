// =============================================================================
// static-svg/html.ts — the two escapes the static SVG renderers need
// -----------------------------------------------------------------------------
// These moved here with the SVG renderers rather than being duplicated: the
// renderer's html.ts now re-exports them, so there is exactly one
// implementation and the two packages cannot drift on what counts as escaped.
// The renderer's copy carries block-level helpers that stay behind, because
// they are about ITS markup, not about SVG.
// =============================================================================

/** Escape a string for use as HTML/SVG text content. */
export function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape a string for use as a double-quoted attribute value. */
export function attr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
