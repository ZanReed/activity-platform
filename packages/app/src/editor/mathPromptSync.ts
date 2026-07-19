// =============================================================================
// mathPromptSync.ts — Model A: latex <-> prompts reconcile (MA-T7)
// -----------------------------------------------------------------------------
// The author types the answer directly INTO a gap (MA-DR3 answer-in-gap), so the
// live MathLive field's latex embeds it: `x=2+\placeholder[g1]{2a}`. But the
// STORED latex — which the renderer copies verbatim into `data-math-prompt-latex`
// for the kit to mount from — MUST empty every placeholder, or the answer LEAKS
// to the student (they'd see it pre-filled). So on every edit we:
//   1. read each gap's answer from the field (getPromptValue), and
//   2. store the EMPTIED latex (`\placeholder[g1]{}`) — answers live only in the
//      `prompts` attr.
// On edit re-entry the NodeView re-hydrates the field from prompts[] (asciiToLatex
// -> setPromptValue), so the author sees their answers again.
//
// This module is the pure string half: empty the placeholder values and list the
// gap ids, with a BALANCED-BRACE scan (MathLive nests braces, e.g. \frac{12}{34}).
// The answer extraction + ascii conversion lives in the NodeView (it needs the
// live field). See docs/design/math-blanks.md (Model A, MA-DR3 / Q5).
// =============================================================================

import { latexToAscii } from '@activity/graph-kit';
import type { MathPrompt } from '@activity/schema';

const MARKER = '\\placeholder[';

interface PlaceholderSpan {
  id: string;
  /** index of the `{` that opens the value. */
  openBrace: number;
  /** index of the matching `}` that closes the value. */
  closeBrace: number;
}

// Scan latex for `\placeholder[id]{…}` spans with balanced braces. A malformed
// marker (no closing `]`, no `{`, or unbalanced braces) ends the scan at that
// point — we never throw on half-typed latex.
function scanPlaceholders(latex: string): PlaceholderSpan[] {
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
    spans.push({ id: latex.slice(idStart, idEnd), openBrace, closeBrace: j });
    i = j + 1;
  }
  return spans;
}

/**
 * Replace every `\placeholder[id]{value}` with `\placeholder[id]{}` — the safe,
 * answer-free latex to store + emit. Balanced-brace aware. A latex with no
 * placeholders is returned unchanged.
 */
export function emptyPlaceholders(latex: string): string {
  const spans = scanPlaceholders(latex);
  if (spans.length === 0) return latex;
  let out = '';
  let cursor = 0;
  for (const s of spans) {
    out += latex.slice(cursor, s.openBrace + 1); // up to and including `{`
    cursor = s.closeBrace; // skip the value; the `}` is re-emitted below
    out += latex.slice(s.closeBrace, s.closeBrace + 1); // the `}`
    cursor = s.closeBrace + 1;
  }
  out += latex.slice(cursor);
  return out;
}

/** The gap ids present in the latex, in document order (duplicates preserved). */
export function placeholderIds(latex: string): string[] {
  return scanPlaceholders(latex).map((s) => s.id);
}

/** Whether the latex carries at least one `\placeholder[id]{}` gap. */
export function hasPlaceholders(latex: string): boolean {
  return scanPlaceholders(latex).length > 0;
}

/**
 * The pure core of the on-edit reconcile: turn each gap's answer LaTeX (read
 * from the live field) into a schema MathPrompt (answer as ascii), preserving an
 * existing gap's equivalence/tolerance/acceptableAnswers. A gap with no answer
 * yet is dropped — it exists in the latex but isn't a scorable prompt until the
 * author fills it (the empty-gap signifier flags it). The thin MathLive reads
 * (getPrompts / getPromptValue) stay in the NodeView; this half is unit-tested.
 */
export function buildMathPrompts(
  gaps: { id: string; answerLatex: string }[],
  existing: MathPrompt[],
): MathPrompt[] {
  const byId = new Map(existing.map((p) => [p.id, p]));
  const out: MathPrompt[] = [];
  for (const { id, answerLatex } of gaps) {
    const answer = latexToAscii(answerLatex);
    if (answer === '') continue;
    const prev = byId.get(id);
    out.push({
      id,
      answer,
      acceptableAnswers: prev?.acceptableAnswers ?? [],
      ...(prev?.equivalence ? { equivalence: prev.equivalence } : {}),
      ...(prev?.tolerance !== undefined ? { tolerance: prev.tolerance } : {}),
    });
  }
  return out;
}
