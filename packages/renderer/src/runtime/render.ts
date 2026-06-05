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
// classList.toggle(name, condition) is inherently idempotent. For attribute,
// hidden, and checked updates, explicit current-vs-target checks guard
// each write.
//
// Stage 13 Session 4 adds confidence radio reflection to renderBlock, so a
// restored-on-load confidence selection re-checks the right radio when the
// page first renders (bootstrap calls render() after applyStoredState).
// =============================================================================

import type {
    Refs,
    BlankRef,
    FillInBlankRef,
    SectionRef,
    HintModalRef,
} from './refs.js';
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
        if (blankState) renderBlank(id, blankState, ref, state);
    }
    for (const [id, ref] of refs.fillInBlanks) {
        const blockState = state.blocks[id];
        if (blockState) renderBlock(blockState, ref);
    }
    for (const [id, ref] of refs.sections) {
        const sectionState = state.sections[id];
        if (sectionState) renderSection(sectionState, ref);
    }
    if (refs.hintModal) renderHintModal(state, refs.hintModal, refs);
}

function renderBlank(
    id: string,
    blankState: BlankState,
    ref: BlankRef,
    state: RuntimeState,
): void {
    const { result, matchedMistake } = blankState;

    // 1. Correct / incorrect class — visual signal.
    ref.input.classList.toggle('correct', result === true);
    ref.input.classList.toggle('incorrect', result === false);

    // 2. aria-invalid — screen reader signal complementing the visual class.
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

    // 3. Feedback slot — mistake-specific text only.
    if (matchedMistake !== null) {
        if (ref.feedbackEl.textContent !== matchedMistake) {
            ref.feedbackEl.textContent = matchedMistake;
        }
        if (ref.feedbackEl.hidden) ref.feedbackEl.hidden = false;
    } else {
        if (!ref.feedbackEl.hidden) ref.feedbackEl.hidden = true;
    }

    // 4. Hint affordance — button aria-expanded reflects whether THIS blank's
    // hint is the one currently open in the global modal. The modal content
    // itself is handled by renderHintModal.
    if (ref.hintButton) {
        const wantExpanded = state.hintModalBlankId === id ? 'true' : 'false';
        if (ref.hintButton.getAttribute('aria-expanded') !== wantExpanded) {
            ref.hintButton.setAttribute('aria-expanded', wantExpanded);
        }
    }

    // 5. Locked-mode input freeze — section locked == this blank's
    // input.disabled. Absent SectionState (refs/state disagreement)
    // treated as not-locked.
    const sectionState = state.sections[ref.sectionId];
    const wantDisabled = sectionState?.locked === true;
    if (ref.input.disabled !== wantDisabled) {
        ref.input.disabled = wantDisabled;
    }
}

function renderBlock(blockState: BlockState, ref: FillInBlankRef): void {
    // Solution slot — hidden until solutionRevealed flips true.
    if (ref.solutionEl) {
        const wantHidden = !blockState.solutionRevealed;
        if (ref.solutionEl.hidden !== wantHidden) {
            ref.solutionEl.hidden = wantHidden;
        }
    }

    // Confidence radio reflection — sync each radio's checked state to
    // state.blocks[id].confidence. Drives restoration-on-load (a stored
    // confidence selection re-checks the right radio when bootstrap
    // renders for the first time) and keeps state ↔ DOM consistent if
    // anything other than the user's click ever sets state.
    //
    // No explicit guard for hasConfidenceRating — when confidenceRadios
    // is empty (no fieldset), the loop iterates zero times.
    for (const radio of ref.confidenceRadios) {
        const wantChecked = radio.value === blockState.confidence;
        if (radio.checked !== wantChecked) {
            radio.checked = wantChecked;
        }
    }
}

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
        if (ref.checkButton.disabled !== sectionState.locked) {
            ref.checkButton.disabled = sectionState.locked;
        }
    }
}

/**
 * Show or hide the global hint modal from state.hintModalBlankId. When open,
 * the body text is the active blank's authored hint (BlankRef.hint). When the
 * referenced blank has no hint (defensive — shouldn't happen, the button only
 * exists for blanks with hints) the modal stays closed.
 *
 * Pure state→DOM like the rest of render: no focus management here (that's
 * done in the open/close event handlers so focus isn't yanked on every render
 * tick). Idempotent via the hidden-attribute guard.
 */
function renderHintModal(
    state: RuntimeState,
    modal: HintModalRef,
    refs: Refs,
): void {
    const activeId = state.hintModalBlankId;
    const hint = activeId ? refs.blanks.get(activeId)?.hint ?? null : null;
    const wantOpen = hint !== null;

    if (wantOpen) {
        if (modal.bodyEl.textContent !== hint) modal.bodyEl.textContent = hint;
        if (modal.overlay.hidden) modal.overlay.hidden = false;
    } else {
        if (!modal.overlay.hidden) modal.overlay.hidden = true;
    }
}
