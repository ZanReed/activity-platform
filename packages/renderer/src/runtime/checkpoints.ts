// =============================================================================
// runtime/checkpoints.ts — Per-section check button + score aggregation
// -----------------------------------------------------------------------------
// Wires the check button on each checkpoint section. Click handler scores
// every blank in the section, aggregates score + total into SectionState,
// reveals solutions for blocks that have them, and (in locked mode) flips
// SectionState.locked so render() disables the section's inputs.
//
// File pattern matches blanks.ts: a testable pure-ish function
// (checkSection — mutates state, no DOM writes) + a thin event-handler
// wrapper (wireCheckpoints). Tests drive checkSection directly with a
// fixtured state + refs; wireCheckpoints is wiring-only.
//
// Score format: "{correct} / {sectionTotal} correct" — denominator is the
// section's total blank count, NOT the attempted count. Honest about
// omissions. SectionState.total is set to sectionRef.blankIds.length on
// every check (idempotent for a given section — blanks don't appear or
// disappear mid-page).
// =============================================================================

import type { RuntimeConfig } from './config.js';
import type { Refs } from './refs.js';
import type { RuntimeState } from './state.js';
import { scoreBlankAndUpdateState } from './blanks.js';

/**
 * Score every blank in the section, aggregate state, reveal solutions for
 * blocks that have them. In locked mode, also flip SectionState.locked so
 * render() disables the section's inputs.
 *
 * Mutates state (deliberate); no DOM writes. Caller fires onUpdate to
 * render afterward.
 *
 * Re-checks in free mode are well-defined: score + total recompute against
 * the current input values, solutions stay revealed (once true, never
 * unset), and locked stays false because config.submissionMode is 'free'.
 *
 * Silently returns when sectionId is unknown — defense-in-depth for refs/
 * state disagreement (shouldn't happen post-init).
 */
export function checkSection(
    config: RuntimeConfig,
    state: RuntimeState,
    refs: Refs,
    sectionId: string,
): void {
    const sectionRef = refs.sections.get(sectionId);
    const sectionState = state.sections[sectionId];
    if (!sectionRef || !sectionState) return;

    let correct = 0;
    for (const blankId of sectionRef.blankIds) {
        const blankRef = refs.blanks.get(blankId);
        if (!blankRef) continue;
        const result = scoreBlankAndUpdateState(state, blankId, blankRef);
        if (result === true) correct += 1;
    }

    sectionState.checked = true;
    sectionState.score = correct;
    sectionState.total = sectionRef.blankIds.length;
    sectionState.checkedAt = new Date().toISOString();
    if (config.submissionMode === 'locked') {
        sectionState.locked = true;
    }

    // Reveal solutions for every block in the section that has one. Once
    // true, never unset — re-checking in free mode keeps solutions visible
    // (the student already saw it; hiding would feel like a magic trick).
    for (const blockId of sectionRef.blockIds) {
        const blockRef = refs.fillInBlanks.get(blockId);
        const blockState = state.blocks[blockId];
        if (!blockRef || !blockState) continue;
        if (blockRef.solution !== null) {
            blockState.solutionRevealed = true;
        }
    }
}

/**
 * Attach click handlers to every section's check button. Sections without
 * a check button are skipped silently — the renderer only emits the button
 * for checkpoint sections in locked/free modes (single mode + non-
 * checkpoint sections both have null checkButton refs).
 */
export function wireCheckpoints(
    config: RuntimeConfig,
    state: RuntimeState,
    refs: Refs,
    onUpdate: () => void,
): void {
    for (const [sectionId, ref] of refs.sections) {
        if (!ref.checkButton) continue;
        ref.checkButton.addEventListener('click', () => {
            checkSection(config, state, refs, sectionId);
            onUpdate();
        });
    }
}
