// =============================================================================
// html.ts — HTML escape utilities
// -----------------------------------------------------------------------------
// EVERY string that comes from an ActivityDocument and gets concatenated
// into output HTML must pass through one of these functions. The renderer's
// security model assumes:
//   * Teachers may type anything, including angle brackets.
//   * Students never see content that wasn't escaped.
//
// `escape` for text content (between tags). `attr` for attribute values
// (also escapes quotes). `js` for embedding strings in inline JS — only
// used for the auto-generated runtime, never for arbitrary user content.
// =============================================================================

/** Escape a string for use as text content between HTML tags. */
export function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape a string for use as an HTML attribute value (double-quoted). */
export function attr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render the ` data-block-id="…"` attribute, or nothing when the block has no
 * id. Every block in a section carries a required uuid, so this is a no-op
 * there and output stays byte-identical. Definition-content blocks
 * (schema: DefinitionBlock) carry an OPTIONAL id — nothing addresses them and
 * the legacy upgrades must stay deterministic, so they mint none — and an empty
 * `data-block-id=""` would be noise inside the definition <template>.
 */
export function blockIdAttr(id: string | undefined): string {
  return id === undefined ? '' : ' data-block-id="' + attr(id) + '"';
}

/** Escape a string for safe embedding in a JSON-encoded JS string literal. */
export function js(s: string): string {
  // JSON.stringify handles all the edge cases (control chars, surrogates, etc.)
  // and produces a valid JS string literal at the same time.
  return JSON.stringify(s);
}
