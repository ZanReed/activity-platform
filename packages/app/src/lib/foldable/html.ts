// =============================================================================
// html.ts — minimal HTML-text escaping for the foldable document builder
// -----------------------------------------------------------------------------
// The foldable assembler emits one piece of teacher-controlled plain text into
// markup: the document <title>. Everything else it places is already-rendered,
// renderer-escaped block HTML. This is the one spot that needs escaping; we keep
// a tiny local helper rather than widening the renderer's public API.
// =============================================================================

export function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
