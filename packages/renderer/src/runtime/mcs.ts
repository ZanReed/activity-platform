// =============================================================================
// runtime/mcs.ts — Multiple-choice selection + scoring
// -----------------------------------------------------------------------------
// File pattern matches blanks.ts/checkpoints.ts: pure decision functions
// (isSelectionCorrect, scoreMcBlocks — mutate state, no DOM writes) + a thin
// event-handler wrapper (wireMcChoices). Tests drive the pure functions with
// fixtured state + refs; the wrapper is wiring-only.
//
// Scoring is ALL-OR-NOTHING set equality: the selected choice ids must equal
// the block's correct set exactly (order-free). Per-choice partial credit is
// a future additive flag (the graph block's partialCredit precedent). An
// empty selection scores null — an omission, like an empty blank: counted in
// the section total, not the correct count, and absent from the submission's
// choices map.
//
// MC deliberately has no immediate-feedback mode: results appear only at
// check/submit. A closed-form question with instant verdicts is a click-
// through-the-options invitation, unlike a typed blank where the answer
// space is open.
// =============================================================================

import type { Refs } from './refs.js';
import type { RuntimeState } from './state.js';

/**
 * All-or-nothing set equality between the selected ids and the correct ids.
 * Duplicate-free by construction (both come from unique choice ids), so a
 * length check + containment is sufficient.
 */
export function isSelectionCorrect(
    selected: string[],
    correctIds: string[],
): boolean {
    if (selected.length !== correctIds.length) return false;
    for (const id of correctIds) {
        if (selected.indexOf(id) === -1) return false;
    }
    return true;
}

/**
 * Score the given multiple-choice blocks into state. Unanswered blocks
 * (empty selection) score null — unscored omission. Mutates state
 * (deliberate); no DOM access.
 */
export function scoreMcBlocks(
    state: RuntimeState,
    refs: Refs,
    blockIds: Iterable<string>,
): void {
    for (const blockId of blockIds) {
        const ref = refs.mcs.get(blockId);
        const mcState = state.mcs[blockId];
        if (!ref || !mcState) continue;
        mcState.result =
            mcState.selected.length === 0
                ? null
                : isSelectionCorrect(mcState.selected, ref.correctIds);
    }
}

/**
 * Attach change handlers to every choice input. On change, rebuild the
 * block's selection from the inputs' checked flags (in document order —
 * for radios the browser has already unchecked the siblings by the time
 * change fires, so this holds for both input types) and trigger onUpdate.
 * The verdict is NOT recomputed here — results appear at check/submit.
 */
export function wireMcChoices(
    state: RuntimeState,
    refs: Refs,
    onUpdate: () => void,
): void {
    for (const [blockId, ref] of refs.mcs) {
        for (const input of ref.inputs) {
            input.addEventListener('change', () => {
                const mcState = state.mcs[blockId];
                if (!mcState) return;
                mcState.selected = ref.choiceIds.filter(
                    (_, index) => ref.inputs[index]?.checked === true,
                );
                onUpdate();
            });
        }
    }
}
