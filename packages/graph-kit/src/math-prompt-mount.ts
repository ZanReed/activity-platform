// =============================================================================
// math-prompt-mount.ts — Model A: the interactive MathLive field (MA-T4, kit)
// -----------------------------------------------------------------------------
// The kit half of the SWAP. The base-runtime bridge (math-prompt-bridge.ts)
// lazy-loads the kit and calls mountMathPrompts once per equation with a gap. We
// mount a read-only MathLive field whose only editable regions are the
// `\placeholder[id]{}` prompts, hydrate any restored answers, and on every edit
// convert each prompt's LaTeX -> ascii (the graph-kit convert leaf) and hand it
// back through onValue — which the bridge writes into the hidden mirror <input>,
// so the existing blank machinery grades/persists it. The static KaTeX render is
// hidden (not removed) once the field is in; if the kit never loads, that static
// render stays and the gap is answered on paper / scores as an omission.
//
// This module is MathLive-DOM code: it can't run under jsdom (web component), so
// it's covered by typecheck + owner-manual verification on a published page, not
// unit tests — the same ceiling as the calculator mount. The pure conversion it
// leans on (latexToAscii / asciiToLatex) is unit-tested separately.
// =============================================================================

import { MathfieldElement } from 'mathlive';
import { configureMathLive } from './mathlive-setup.js';
import { latexToAscii, asciiToLatex } from './math-prompt-convert.js';

export interface MathPromptMountOptions {
  /** Raw latex with `\placeholder[id]{}` markers. */
  latex: string;
  /** promptId -> restored ascii value (hydrate the field on load). */
  initialValues: Record<string, string>;
  /** Fired on every prompt edit: (promptId, ascii). */
  onValue: (promptId: string, ascii: string) => void;
}

/** Handle for the state->view sync (reveal / lock / correct-incorrect) — wired
 *  by the runtime's render on check/reveal in a follow-up (MA-D5). Exposed now
 *  so the contract is stable; MathLive renders the correct/incorrect state. */
export interface MountedMathPrompts {
  setResult(promptId: string, correct: boolean | null, lock: boolean): void;
  reveal(promptId: string, ascii: string): void;
  destroy(): void;
}

export function mountMathPrompts(
  host: HTMLElement,
  opts: MathPromptMountOptions,
): MountedMathPrompts {
  // Set MathLive's fonts/sounds before the first field mounts (MA-T6). Idempotent
  // and shared with the calculator, so a math-prompt page without a calculator
  // still gets the self-hosted fonts.
  configureMathLive();
  const field = new MathfieldElement();
  // Read-only: only the \placeholder prompts are editable, the equation is not.
  field.readOnly = true;
  field.value = opts.latex;
  // MathLive pops its own virtual keyboard on focus; keep it manual so it
  // doesn't fight the page (matches the editor's math-field policy).
  field.mathVirtualKeyboardPolicy = 'manual';

  // Hydrate restored answers: ascii (stored) -> LaTeX (field).
  for (const [id, ascii] of Object.entries(opts.initialValues)) {
    if (ascii) field.setPromptValue(id, asciiToLatex(ascii), {});
  }

  // Every edit: read each prompt's LaTeX, convert to ascii, hand back. The
  // bridge dedupes unchanged values, so reporting all prompts each time is fine.
  field.addEventListener('input', () => {
    for (const id of field.getPrompts()) {
      opts.onValue(id, latexToAscii(field.getPromptValue(id)));
    }
  });

  // Swap: hide the static KaTeX render (kept in the DOM for a clean destroy),
  // keep the hidden mirror group (the value carrier), insert the live field.
  const staticMath = host.querySelector<HTMLElement>('.katex');
  if (staticMath) staticMath.style.display = 'none';
  host.insertBefore(field, host.firstChild);

  return {
    setResult(promptId, correct, lock) {
      const state =
        correct === null ? 'undefined' : correct ? 'correct' : 'incorrect';
      field.setPromptState(promptId, state, lock);
    },
    reveal(promptId, ascii) {
      field.setPromptValue(promptId, asciiToLatex(ascii), {});
      field.setPromptState(promptId, 'correct', true);
    },
    destroy() {
      field.remove();
      if (staticMath) staticMath.style.display = '';
    },
  };
}
