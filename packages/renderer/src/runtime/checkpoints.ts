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
import { scoreBlanksInScope } from './blanks.js';
import { scoreMcBlocks } from './mcs.js';
import { scoreMatchBlocks } from './matches.js';
import { scoreOrderingBlocks } from './orderings.js';
import { graphExt, numberLineExt, dataPlotExt } from './graph-integration.js';

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

    // Score every blank in the section, honoring order-independent groups
    // (consume-once matching). A group is always wholly inside one section, so
    // this scope never splits one. Then tally correct from the written results.
    scoreBlanksInScope(state, refs, sectionRef.blankIds);
    let correct = 0;
    for (const blankId of sectionRef.blankIds) {
        if (state.blanks[blankId]?.result === true) correct += 1;
    }

    // Multiple-choice blocks — each is one scorable unit, all-or-nothing.
    // An unselected block scores null (omission): in the total, not correct.
    scoreMcBlocks(state, refs, sectionRef.mcBlockIds);
    for (const mcId of sectionRef.mcBlockIds) {
        if (state.mcs[mcId]?.result === true) correct += 1;
    }

    // Matching blocks — scored PER PAIR: every item is one point in the
    // section total (like every blank is), earned pairs count as correct.
    // An unanswered block contributes its items to the total only (omission).
    scoreMatchBlocks(state, refs, sectionRef.matchBlockIds);
    let matchPairTotal = 0;
    for (const matchId of sectionRef.matchBlockIds) {
        const matchState = state.matches[matchId];
        const itemCount = refs.matches.get(matchId)?.itemIds.length ?? 0;
        matchPairTotal += itemCount;
        if (matchState && matchState.result !== null) {
            correct += matchState.earned;
        }
    }

    // Ordering blocks — one scorable unit each, all-or-nothing. An untouched
    // list is an omission: in the total, not correct.
    scoreOrderingBlocks(state, refs, sectionRef.orderingBlockIds);
    for (const orderingId of sectionRef.orderingBlockIds) {
        if (state.orderings[orderingId]?.result === true) correct += 1;
    }

    // Interactive-graph blocks score too — each is one scorable unit (the graph
    // feature computed correctness live as the student moved the point). In the
    // base runtime build this contributes nothing (no graph blocks exist).
    const graphScore = graphExt.scoreSectionGraphs(sectionRef, state);
    correct += graphScore.correct;

    // Number-line blocks — one scorable unit each, all-or-nothing (same shape as
    // graphs). A no-op in the base build (no number-line blocks exist).
    const numberLineScore = numberLineExt.scoreSectionNumberLines(sectionRef, state);
    correct += numberLineScore.correct;

    // Data-plot blocks — one scorable unit each, all-or-nothing (same shape as
    // graphs). A no-op in the base build (no data-plot blocks exist).
    const dataPlotScore = dataPlotExt.scoreSectionDataPlots(sectionRef, state);
    correct += dataPlotScore.correct;

    sectionState.checked = true;
    sectionState.score = correct;
    sectionState.total =
        sectionRef.blankIds.length +
        sectionRef.mcBlockIds.length +
        matchPairTotal +
        sectionRef.orderingBlockIds.length +
        graphScore.total +
        numberLineScore.total +
        dataPlotScore.total;
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
        if (blockRef.solutionEl !== null) {
            blockState.solutionRevealed = true;
        }
    }
    for (const mcId of sectionRef.mcBlockIds) {
        const mcRef = refs.mcs.get(mcId);
        const mcState = state.mcs[mcId];
        if (!mcRef || !mcState) continue;
        if (mcRef.solutionEl !== null) {
            mcState.solutionRevealed = true;
        }
    }
    for (const matchId of sectionRef.matchBlockIds) {
        const matchRef = refs.matches.get(matchId);
        const matchState = state.matches[matchId];
        if (!matchRef || !matchState) continue;
        if (matchRef.solutionEl !== null) {
            matchState.solutionRevealed = true;
        }
    }
    for (const orderingId of sectionRef.orderingBlockIds) {
        const orderingRef = refs.orderings.get(orderingId);
        const orderState = state.orderings[orderingId];
        if (!orderingRef || !orderState) continue;
        if (orderingRef.solutionEl !== null) {
            orderState.solutionRevealed = true;
        }
    }
    graphExt.revealGraphSolutions(sectionRef, refs, state);
    numberLineExt.revealNumberLineSolutions(sectionRef, refs, state);
    dataPlotExt.revealDataPlotSolutions(sectionRef, refs, state);
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
