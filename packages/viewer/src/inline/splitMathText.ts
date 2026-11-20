// =============================================================================
// inline/splitMathText.ts — `$…$` runs in a PLAIN-STRING field (see MathText.tsx)
// -----------------------------------------------------------------------------
// Pure, so the KaTeX preload can ask "does this title carry math?" without
// importing a React component. Delimiter rules mirror the importer's prose
// scan in packages/app/src/lib/markdownToTiptap.ts — keep them in step.
// =============================================================================

const MATH_RUN =
  /(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|(?<!\\)\$(?=\S)([^$\n]*?\S)(?<!\\)\$(?!\d)/g;

const unescapeDollar = (s: string) => s.replace(/\\\$/g, '$');

export type MathTextPart = { text: string } | { latex: string };

/** Split a plain string into text and math runs. */
export function splitMathText(value: string): MathTextPart[] {
  const parts: MathTextPart[] = [];
  let last = 0;
  for (const m of value.matchAll(MATH_RUN)) {
    const at = m.index ?? 0;
    if (at > last) parts.push({ text: unescapeDollar(value.slice(last, at)) });
    parts.push({ latex: (m[1] ?? m[2] ?? '').trim() });
    last = at + m[0].length;
  }
  if (last < value.length) parts.push({ text: unescapeDollar(value.slice(last)) });
  return parts;
}

/** Whether a plain string carries any math run (for the KaTeX preload). */
export function hasMathText(value: string): boolean {
  return splitMathText(value).some((p) => 'latex' in p);
}

