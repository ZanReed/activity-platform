// =============================================================================
// runtime/render.ts — State → DOM rendering
// -----------------------------------------------------------------------------
// The ONLY function in the runtime that mutates the DOM after init. Every
// event handler writes to state, then calls render(state, refs). Concentrating
// the DOM-mutation exception in one file makes the "no DOM writes outside
// render" rule grep-able and enforceable.
//
// Change-guard pattern: every write checks the current DOM state and only
// touches the DOM when it differs from the target. For class toggles,
// classList.toggle(name, condition) is inherently idempotent. For attribute
// and text updates, explicit current-vs-target checks guard each write.
//
// Stage 13 Session 2 scope: per-blank rendering — correct/incorrect class,
// aria-invalid, feedback slot text + visibility, hint affordance state.
// Session 3 adds renderBlock (solution slot) and renderSection (score
// text, locked-mode input disabling).
// =============================================================================

import type { Refs, BlankRef } from './refs.js';
import type { RuntimeState, BlankState } from './state.js';

/**
 * Render the entire activity from state. Idempotent — calling twice with
 * the same state produces no observable DOM change on the second call.
 */
export function render(state: RuntimeState, refs: Refs): void {
    for (const [id, ref] of refs.blanks) {
        const blankState = state.blanks[id];
        if (blankState) renderBlank(blankState, ref);
    }
    // Session 3 expands here:
    //   for (const [id, ref] of refs.fillInBlanks) renderBlock(state.blocks[id], ref);
    //   for (const [id, ref] of refs.sections)     renderSection(state.sections[id], ref, state);
}

/**
 * Apply per-blank state to the DOM. Drives four things, in order:
 *   1. .correct / .incorrect class on the input (visual signal)
 *   2. aria-invalid attribute on the input (screen reader signal)
 *   3. Feedback slot text + hidden attribute (mistake-specific text only;
 *      visual signal for correct/generic-incorrect lives on the input)
 *   4. Hint button aria-expanded + hint text hidden attribute
 *
 * Each write is change-guarded against the current DOM value. classList
 * .toggle(name, condition) is inherently idempotent; attribute and
 * hidden-property writes get explicit checks.
 */
function renderBlank(blankState: BlankState, ref: BlankRef): void {
    const { result, matchedMistake, hintRevealed } = blankState;

    // 1. Correct / incorrect class — visual signal.
    ref.input.classList.toggle('correct', result === true);
    ref.input.classList.toggle('incorrect', result === false);

    // 2. aria-invalid — screen reader signal complementing the visual class.
    // Removed (not set to "false") when result is null so the attribute
    // doesn't shout "this is valid" before the student has even attempted.
    const targetAriaInvalid: 'true' | 'false' | null =
    result === null ? null : result ? 'false' : 'true';
    const currentAriaInvalid = ref.input.getAttribute('aria-invalid');
    if (targetAriaInvalid !== currentAriaInvalid) {
        if (targetAriaInvalid === null) {
            ref.input.removeAttribute('aria-invalid');
        } else {
            ref.input.setAttribute('aria-invalid', targetAriaInvalid);
        }
    }

    // 3. Feedback slot — mistake-specific text only. Hidden in every other
    // case (correct, incorrect-without-match, unscored). Keeps a 30-blank
    // worksheet visually uncluttered; the red/green border + aria-invalid
    // carry the always-on feedback.
    if (matchedMistake !== null) {
        if (ref.feedbackEl.textContent !== matchedMistake) {
            ref.feedbackEl.textContent = matchedMistake;
        }
        if (ref.feedbackEl.hidden) ref.feedbackEl.hidden = false;
    } else {
        if (!ref.feedbackEl.hidden) ref.feedbackEl.hidden = true;
        // Stale textContent stays in the hidden slot. ARIA spec: hidden
        // live regions don't announce. Re-revealing with new text fires
        // a polite announcement; re-revealing with the same text doesn't.
        // Saves a DOM write on every hide.
    }

    // 4. Hint affordance — button aria-expanded + text span hidden, both
    // driven by hintRevealed. No-op when the blank has no hint (button
    // and text are both null — renderer only emits them for blanks with
    // data-hint authored).
    if (ref.hintButton && ref.hintTextEl) {
        const wantExpanded = hintRevealed ? 'true' : 'false';
        if (ref.hintButton.getAttribute('aria-expanded') !== wantExpanded) {
            ref.hintButton.setAttribute('aria-expanded', wantExpanded);
        }
        const wantHidden = !hintRevealed;
        if (ref.hintTextEl.hidden !== wantHidden) {
            ref.hintTextEl.hidden = wantHidden;
        }
    }
}
