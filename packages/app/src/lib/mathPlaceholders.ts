// =============================================================================
// mathPlaceholders.ts — find `\placeholder[id]{…}` gaps in maths latex
// -----------------------------------------------------------------------------
// Moved out of editor/mathPromptSync.ts (UI review B-1) so the pre-publish
// check can count unanswered gaps without importing the maths converter,
// which would land on the activities list (it runs "Republish changed").
// =============================================================================

const MARKER = '\\placeholder[';

export interface PlaceholderSpan {
  id: string;
  /** the answer latex between the braces (may be empty). */
  value: string;
  /** index of the `{` that opens the value. */
  openBrace: number;
  /** index of the matching `}` that closes the value. */
  closeBrace: number;
  /** index of the `\placeholder[` marker start. */
  start: number;
}

// Scan latex for `\placeholder[id]{…}` spans with balanced braces. A malformed
// marker (no closing `]`, no `{`, or unbalanced braces) ends the scan at that
// point — we never throw on half-typed latex.
export function scanPlaceholders(latex: string): PlaceholderSpan[] {
  const spans: PlaceholderSpan[] = [];
  let i = 0;
  while (i < latex.length) {
    const start = latex.indexOf(MARKER, i);
    if (start === -1) break;
    const idStart = start + MARKER.length;
    const idEnd = latex.indexOf(']', idStart);
    if (idEnd === -1) break;
    const openBrace = idEnd + 1;
    if (latex[openBrace] !== '{') {
      i = idEnd + 1;
      continue;
    }
    let depth = 0;
    let j = openBrace;
    for (; j < latex.length; j++) {
      if (latex[j] === '{') depth++;
      else if (latex[j] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    if (depth !== 0) break; // unbalanced — bail without throwing
    spans.push({
      id: latex.slice(idStart, idEnd),
      value: latex.slice(openBrace + 1, j),
      openBrace,
      closeBrace: j,
      start,
    });
    i = j + 1;
  }
  return spans;
}
