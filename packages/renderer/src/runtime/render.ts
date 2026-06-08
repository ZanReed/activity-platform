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
    PopoverRef,
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
    if (refs.popover) renderPopover(state, refs.popover, refs);
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

    // 3. Mistake affordance — reveal the red '!' button only when a wrong
    // answer matched an authored mistake entry. The feedback text itself lives
    // in the popover (renderPopover reads state.blanks[id].matchedMistake), so
    // here we just toggle the button's visibility and its aria-expanded.
    if (ref.mistakeButton) {
        const wantHidden = matchedMistake === null;
        if (ref.mistakeButton.hidden !== wantHidden) {
            ref.mistakeButton.hidden = wantHidden;
        }
        const wantExpanded =
            state.popover?.kind === 'mistake' && state.popover.blankId === id
                ? 'true'
                : 'false';
        if (ref.mistakeButton.getAttribute('aria-expanded') !== wantExpanded) {
            ref.mistakeButton.setAttribute('aria-expanded', wantExpanded);
        }
    }

    // 4. Hint affordance — button aria-expanded reflects whether THIS blank's
    // hint is the one currently open in the popover. The popover content
    // itself is handled by renderPopover.
    if (ref.hintButton) {
        const wantExpanded =
            state.popover?.kind === 'hint' && state.popover.blankId === id
                ? 'true'
                : 'false';
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
 * Show or hide the shared popover from state.popover. When open, the title and
 * body depend on the popover kind: a 'hint' shows the active blank's authored
 * hint (BlankRef.hint); a 'mistake' shows its matched mistake feedback
 * (BlankState.matchedMistake). The data-kind attribute drives the red-tinted
 * header for mistakes. Position (left/top) is read straight from state and
 * applied — the open handler seeds it beside the trigger and drag updates it.
 *
 * When the referenced text is gone (no hint, or the matched mistake cleared
 * because the student edited the blank) the popover stays closed even if
 * state.popover is still set — the close handlers reconcile state.popover to
 * null on the next interaction.
 *
 * Pure state→DOM like the rest of render: no focus management here (that's
 * done in the open/close event handlers so focus isn't yanked on every render
 * tick). Idempotent via the hidden-attribute guard.
 */
function renderPopover(
    state: RuntimeState,
    popover: PopoverRef,
    refs: Refs,
): void {
    const p = state.popover;
    const body = p
        ? p.kind === 'hint'
            ? refs.blanks.get(p.blankId)?.hint ?? null
            : state.blanks[p.blankId]?.matchedMistake ?? null
        : null;
    const wantOpen = p !== null && body !== null;

    if (wantOpen) {
        const title = p!.kind === 'hint' ? 'Hint' : 'Feedback';
        if (popover.titleEl.textContent !== title) {
            popover.titleEl.textContent = title;
        }
        if (popover.bodyEl.textContent !== body) {
            popover.bodyEl.textContent = body;
        }
        if (popover.el.dataset.kind !== p!.kind) {
            popover.el.dataset.kind = p!.kind;
        }
        const left = p!.x + 'px';
        const top = p!.y + 'px';
        if (popover.el.style.left !== left) popover.el.style.left = left;
        if (popover.el.style.top !== top) popover.el.style.top = top;
        if (popover.el.hidden) popover.el.hidden = false;
    } else {
        if (!popover.el.hidden) popover.el.hidden = true;
    }
}
