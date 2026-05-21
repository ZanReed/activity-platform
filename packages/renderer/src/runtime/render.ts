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
// Stage 13 Session 3 expands rendering from per-blank only to per-blank +
// per-block + per-section. renderBlank now takes the full state object so
// it can look up SectionState.locked for its parent section (cleaner than
// denormalizing locked into BlankState).
// =============================================================================

import type { Refs, BlankRef, FillInBlankRef, SectionRef } from './refs.js';
import type {
    RuntimeState,
    BlankState,
    BlockState,
    SectionState,
} from './state.js';

/**
 * Render the entire activity from state. Idempotent — calling twice with
 * the same state produces no observable DOM change on the second call.
 */
export function render(state: RuntimeState, refs: Refs): void {
    for (const [id, ref] of refs.blanks) {
        const blankState = state.blanks[id];
        if (blankState) renderBlank(blankState, ref, state);
    }
    for (const [id, ref] of refs.fillInBlanks) {
        const blockState = state.blocks[id];
        if (blockState) renderBlock(blockState, ref);
    }
    for (const [id, ref] of refs.sections) {
        const sectionState = state.sections[id];
        if (sectionState) renderSection(sectionState, ref);
    }
}

/**
 * Apply per-blank state to the DOM. Drives five things, in order:
 *   1. .correct / .incorrect class on the input (visual signal)
 *   2. aria-invalid attribute on the input (screen reader signal)
 *   3. Feedback slot text + hidden attribute (mistake-specific text only)
 *   4. Hint button aria-expanded + hint text hidden attribute
 *   5. input.disabled — locked-mode freeze, read from SectionState
 *
 * Each write is change-guarded against the current DOM value.
 */
function renderBlank(
    blankState: BlankState,
    ref: BlankRef,
    state: RuntimeState,
): void {
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
    // case (correct, incorrect-without-match, unscored). The visual class
    // + aria-invalid carry the always-on feedback.
    if (matchedMistake !== null) {
        if (ref.feedbackEl.textContent !== matchedMistake) {
            ref.feedbackEl.textContent = matchedMistake;
        }
        if (ref.feedbackEl.hidden) ref.feedbackEl.hidden = false;
    } else {
        if (!ref.feedbackEl.hidden) ref.feedbackEl.hidden = true;
    }

    // 4. Hint affordance — button aria-expanded + text span hidden.
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

    // 5. Locked-mode input freeze. Reads SectionState.locked for this
    // blank's parent section. SectionState.locked is set only by
    // checkSection in locked submissionMode; in free/single mode (and
    // pre-check in locked mode) it stays false and the input is editable.
    // Absent SectionState (refs/state disagreement) is treated as not-
    // locked — graceful degradation, never throw to the student.
    const sectionState = state.sections[ref.sectionId];
    const wantDisabled = sectionState?.locked === true;
    if (ref.input.disabled !== wantDisabled) {
        ref.input.disabled = wantDisabled;
    }
}

/**
 * Apply per-block state to the DOM. Drives one thing today: the
 * .js-solution slot's hidden attribute. Session 4 will add confidence
 * rating UI state (which radio is checked).
 *
 * Blocks without a solution slot (renderer doesn't emit it when the
 * block has no solution authored) get a null solutionEl — silently no-op.
 */
function renderBlock(blockState: BlockState, ref: FillInBlankRef): void {
    if (ref.solutionEl) {
        const wantHidden = !blockState.solutionRevealed;
        if (ref.solutionEl.hidden !== wantHidden) {
            ref.solutionEl.hidden = wantHidden;
        }
    }
}

/**
 * Apply per-section state to the DOM. Drives two things:
 *   1. .js-section-score text + hidden — "{score} / {total} correct" on
 *      a checkpoint section that's been checked at least once.
 *   2. .js-checkpoint-btn disabled — true after a locked-mode check.
 *
 * Sections without a check button or score slot (single mode, non-
 * checkpoint sections) have null refs — silently no-op on those.
 */
function renderSection(
    sectionState: SectionState,
    ref: SectionRef,
): void {
    if (ref.scoreEl) {
        if (sectionState.checked) {
            const text =
            sectionState.score + ' / ' + sectionState.total + ' correct';
            if (ref.scoreEl.textContent !== text) {
                ref.scoreEl.textContent = text;
            }
            if (ref.scoreEl.hidden) ref.scoreEl.hidden = false;
        } else {
            if (!ref.scoreEl.hidden) ref.scoreEl.hidden = true;
        }
    }

    if (ref.checkButton) {
        // SectionState.locked is true only post-check in locked mode, so
        // reading it covers both "stay enabled in free mode" and "disable
        // after one click in locked mode" without branching on config.
        if (ref.checkButton.disabled !== sectionState.locked) {
            ref.checkButton.disabled = sectionState.locked;
        }
    }
}
