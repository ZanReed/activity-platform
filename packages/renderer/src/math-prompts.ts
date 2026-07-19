// =============================================================================
// math-prompts.ts — Model A in-equation blanks: renderer emission (MA-T2)
// -----------------------------------------------------------------------------
// A math node (math_block or math_inline) may carry `prompts` — gradeable gaps
// inside the equation (schema MathPrompt). We render the equation the SWAP way,
// mirroring the interactive-graph static-SVG↔board precedent:
//
//   1. Static KaTeX for print / no-kit: the raw latex has `\placeholder[id]{}`
//      markers, which KaTeX can't render, so preprocessPromptLatex() rewrites
//      each into a KaTeX-safe `\boxed{\phantom{…}}` gap. This is what the
//      student sees on paper, offline, or before the kit loads. No KaTeX `trust`
//      is needed (the gap is plain `\boxed`/`\phantom`), so math.ts stays
//      trust:false.
//   2. `data-math-prompt-latex` carries the RAW latex (markers intact) so the
//      lazy graph-kit can mount an interactive MathLive read-only-with-prompt
//      field over the equation on load (the rendered KaTeX HTML isn't reversible
//      to latex). One additive, permanent attribute.
//   3. A hidden mirror `<input>` per prompt, carrying the EXISTING Model B blank
//      contract verbatim (data-blank-strategy="math", data-blank-answers,
//      data-blank-equivalence, data-blank-tolerance, keyed by data-blank-id =
//      the prompt/placeholder id). The runtime bridge (MA-T5) walks these and
//      reuses buildBlankRef / gather / restore / score unchanged — the mirror is
//      the single source of value/score/storage; MathLive writes into it.
//
// A prompt-free math node renders exactly as before (no new attrs, no mirrors) —
// the CRITICAL byte-identity pin. See docs/design/math-blanks.md (Model A).
// =============================================================================

import type { MathPrompt } from '@activity/schema';
import { renderMath } from './math.js';
import { attr } from './html.js';

// Matches `\placeholder[id]{…}` with a non-nested value (the editor keeps the
// stored value empty — the answer lives in prompts[] — but we tolerate a simple
// value so a mid-edit save still renders). An unmatched/nested placeholder is
// left as-is (KaTeX renders it as a visible error, which is the right signal).
const PLACEHOLDER_RE = /\\placeholder\[([^\]]+)\]\{[^{}]*\}/g;

const MIN_GAP = 2;
const MAX_GAP = 12;

// Width of the printed/static box, sized to the answer's footprint using `0`
// glyphs (safe inside \phantom, unlike raw ascii answers that may contain
// latex-breaking characters). Clamped so a one-char answer isn't a sliver and a
// long one doesn't blow out the line.
function gapPhantom(answerLen: number): string {
  const n = Math.min(Math.max(answerLen, MIN_GAP), MAX_GAP);
  return '\\boxed{\\phantom{' + '0'.repeat(n) + '}}';
}

/**
 * Rewrite `\placeholder[id]{}` markers into KaTeX-safe boxed gaps for the static
 * render. Gap width is sized from the matching prompt's answer; an orphan marker
 * (no matching prompt) gets the minimum box.
 */
export function preprocessPromptLatex(
  latex: string,
  prompts: MathPrompt[],
): string {
  const byId = new Map(prompts.map((p) => [p.id, p]));
  return latex.replace(PLACEHOLDER_RE, (_full, id: string) => {
    const answer = byId.get(id)?.answer ?? '';
    return gapPhantom(answer.length);
  });
}

/**
 * The hidden mirror `<input>`s — one per prompt, carrying the Model B blank
 * contract so the runtime's existing blank machinery grades/gathers/restores
 * them. Wrapped like a normal blank (`.blank-wrapper` > `.blank`) so
 * buildBlankRef works unchanged; the whole group is `hidden` (the visible layer
 * is the KaTeX gap, upgraded to a MathLive field by the kit).
 */
export function renderMathPromptMirrors(prompts: MathPrompt[]): string {
  const inputs = prompts
    .map((p) => {
      const answers = [p.answer, ...p.acceptableAnswers].join('|');
      const equivalenceAttr =
        p.equivalence === 'exact-form'
          ? ' data-blank-equivalence="exact-form"'
          : '';
      const toleranceAttr =
        p.tolerance !== undefined
          ? ' data-blank-tolerance="' + p.tolerance + '"'
          : '';
      return (
        '<span class="blank-wrapper">' +
        '<input type="text"' +
        ' class="blank"' +
        ' data-blank-id="' + attr(p.id) + '"' +
        ' data-blank-answers="' + attr(answers) + '"' +
        ' data-blank-strategy="math"' +
        equivalenceAttr +
        toleranceAttr +
        ' aria-label="Math blank"' +
        ' autocomplete="off" autocapitalize="off"' +
        ' autocorrect="off" spellcheck="false"' +
        ' />' +
        '</span>'
      );
    })
    .join('');
  return '<span class="math-prompt-mirrors" hidden>' + inputs + '</span>';
}

/**
 * True when a math node carries at least one prompt. Prompt-free nodes take the
 * unchanged legacy render path (byte-identity pin).
 */
export function hasMathPrompts(
  prompts: MathPrompt[] | undefined,
): prompts is MathPrompt[] {
  return prompts !== undefined && prompts.length > 0;
}

/**
 * The inner HTML shared by both math renderers when prompts are present: the
 * static KaTeX gap render + the hidden mirror inputs. The caller owns the outer
 * wrapper (block <div> or inline <span>) and the `data-math-prompt-latex` attr.
 */
export function renderMathPromptBody(
  latex: string,
  prompts: MathPrompt[],
  displayMode: boolean,
): string {
  const staticMath = renderMath(preprocessPromptLatex(latex, prompts), {
    displayMode,
  });
  return staticMath + renderMathPromptMirrors(prompts);
}
