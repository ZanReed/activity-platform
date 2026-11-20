// =============================================================================
// inline/MathText.tsx — a PLAIN-STRING field that may carry `$…$` math
// -----------------------------------------------------------------------------
// A worked/faded example's `title` is a plain string, not inline content, and
// the import format promises math in it (its own example is
// `title: Solving $2x + 3 = 11$`). The viewer printed it verbatim, dollars and
// all, on screen and on paper (walkthrough stress test, 2026-11-20).
//
// This splits the string with the SAME delimiter rules the importer uses for
// prose (markdownToTiptap.ts's inline scan): `$$…$$`, or `$…$` whose inside
// neither starts nor ends with a space and whose closing `$` is not followed by
// a digit — so "Save $5 on a $20 item" stays text. An escaped `\$` is never a
// delimiter and reads as a bare `$`. Each math run goes through InlineMath, so
// the KaTeX options, the readable fallback and print readiness's
// `data-math-pending` wait are the ones every other equation gets.
// =============================================================================

import type { ReactNode } from 'react';
import { InlineMath } from './InlineContent.js';
import { splitMathText } from './splitMathText.js';

export function MathText({ text }: { text: string }) {
  const out: ReactNode[] = splitMathText(text).map((part, i) =>
    'latex' in part ? <InlineMath key={i} latex={part.latex} /> : part.text,
  );
  return <>{out}</>;
}
