// =============================================================================
// math-prompt-convert.ts — LaTeX <-> ascii-math bridge for Model A prompts
// -----------------------------------------------------------------------------
// Model A (docs/design/math-blanks.md) puts an interactive MathLive field over
// an equation's gap. MathLive speaks LaTeX (getPromptValue / setPromptValue),
// but the grader (mathEquivalent) and the stored mirror value are ascii-math
// (2a, (a+b)/2). This leaf wraps MathLive's own pure converters so the kit and
// the editor share ONE conversion (the graph-kit-leaf single-source pattern,
// like mathEquivalent) — never a second parser.
//
// Direction, by MA-D3: the mirror <input> stores ASCII (the graded + persisted
// form). On a MathLive edit the kit converts LaTeX -> ascii into the mirror; on
// restore/hydrate it converts the mirror's ascii -> LaTeX back into the field.
// Storing ascii keeps grading byte-identical to Model B.
//
// The converters are pure (no DOM) — mathlive re-exports them from its SSR entry
// (mathlive.d.ts: `export * from './mathlive-ssr'`), so they run headless in the
// runtime, the editor, and node tests alike. Both wrap in try/catch: a student's
// mid-edit expression can be malformed, and a thrown converter must never break
// the check/gather/restore path.
// =============================================================================

import { convertLatexToAsciiMath, convertAsciiMathToLatex } from 'mathlive';

/**
 * MathLive LaTeX -> ascii-math (the graded + stored form). Empty in → empty out;
 * a malformed LaTeX yields '' rather than throwing (the gap scores as unanswered
 * rather than crashing the section check).
 */
export function latexToAscii(latex: string): string {
  const src = latex.trim();
  if (src === '') return '';
  try {
    return convertLatexToAsciiMath(src).trim();
  } catch {
    return '';
  }
}

/**
 * ascii-math -> MathLive LaTeX (for hydrating a restored value back into the
 * field). On failure, falls back to the raw ascii so the field still shows
 * something typeable rather than nothing.
 */
export function asciiToLatex(ascii: string): string {
  const src = ascii.trim();
  if (src === '') return '';
  try {
    return convertAsciiMathToLatex(src);
  } catch {
    return src;
  }
}
