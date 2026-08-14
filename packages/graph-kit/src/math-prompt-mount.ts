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

/** MathLive builds a `.ML__keyboard-sink` span with `role="textbox"` and NO
 *  accessible name, and 0.109.2 exposes no API to give it one — `ariaLabel` in
 *  its types belongs to menu items, and an `aria-label` on the HOST element does
 *  not reach the sink (both verified against the running component). A role
 *  without a name is axe `aria-input-field-name`, serious, WCAG A: a screen
 *  reader announces the student's math answer box as an unlabeled textbox.
 *
 *  So we name the shadow node directly. That reaches into MathLive's internals
 *  and a future rename would silently un-name the field again — which is why
 *  this is deliberately NOT a silent best-effort: the a11y lane's axe row scans
 *  the mounted worksheet and goes red the moment the sink stops being found.
 *  The guard lives in CI rather than in a runtime throw, because failing a
 *  student's page over a missing aria-label would be the worse trade. */
function nameKeyboardSink(field: HTMLElement, label: string): void {
  // The sink is built during the custom element's upgrade, which has not
  // necessarily happened by the time we return from insertBefore — so retry
  // across a few frames before giving up to CI.
  let attempts = 0;
  const apply = (): void => {
    const sink = field.shadowRoot?.querySelector('.ML__keyboard-sink');
    if (sink) {
      sink.setAttribute('aria-label', label);
      return;
    }
    if (attempts++ < 10) requestAnimationFrame(apply);
  };
  apply();
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
  // Deliberately generic: the field holds the whole equation, and reading its
  // LaTeX aloud as a label would be worse than useless. "Math answer" names the
  // control's PURPOSE, which is what the name is for; the equation itself is
  // still in the accessible tree as content.
  // No per-block override until something needs one (YAGNI — the repo's rule).
  nameKeyboardSink(field, 'Math answer');

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
