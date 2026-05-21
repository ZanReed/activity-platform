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
// classList.toggle(name, condition) is inherently idempotent — it only
// emits a mutation when the class state changes. For attribute and text
// updates (added in Session 2), explicit current-vs-target checks guard
// each write.
//
// Stage 13 Session 1 scope: per-blank correct/incorrect classes on the
// .blank input. Session 2 expands this to feedback slot text/visibility,
// hint affordance state, solution reveal, section score text, and
// locked-mode input.disabled.
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
    // Session 2 expands here:
    //   for (const [id, ref] of refs.fillInBlanks) renderBlock(state.blocks[id], ref);
    //   for (const [id, ref] of refs.sections)     renderSection(state.sections[id], ref, state);
}

/**
 * Apply per-blank state to the DOM. Currently drives only the correct/
 * incorrect classes; Session 2 adds the feedback slot text/visibility,
 * hint affordance state, and (via SectionState lookup) the locked-mode
 * input.disabled toggle.
 *
 * classList.toggle(name, condition) is the change-guard for class state —
 * it only writes when the class state actually differs.
 */
function renderBlank(blankState: BlankState, ref: BlankRef): void {
    const { result } = blankState;
    ref.input.classList.toggle('correct', result === true);
    ref.input.classList.toggle('incorrect', result === false);
}
