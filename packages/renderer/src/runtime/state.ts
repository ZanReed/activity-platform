// =============================================================================
// runtime/state.ts — Mutable runtime state
// -----------------------------------------------------------------------------
// Single source of truth for what's currently happening on the page. Event
// handlers mutate state; render() reads state. The DOM is never queried for
// "current value" — state is.
//
// Why Record (not Map) for the three keyed sub-stores: state is JSON-
// serializable so it can be diffed in dev and (eventually) serialized into
// submission payloads. Plain objects serialize naturally; Map does not.
//
// Stage 13 Session 1 expansion: BlankState and BlockState join SectionState
// as the three per-entity state maps. Together they carry every mutable bit
// the runtime needs — render() reads from these, never from the DOM.
// =============================================================================

import type { Refs } from './refs.js';

export interface SectionState {
    /** True once the student has clicked the check button for this section. */
    checked: boolean;
    /** True after check in locked submissionMode — blank inputs freeze. */
    locked: boolean;
    /** Number of blanks scored correct in this section at last check. */
    score: number;
    /** Number of blanks attempted (non-empty) in this section at last check. */
    total: number;
    /** ISO timestamp of the most recent check (null until first checked). */
    checkedAt: string | null;
}

export interface BlankState {
    /**
     * Scoring result. True = correct, false = incorrect, null = unscored
     * (empty input, or never blurred/checked). Render uses this to drive
     * the .correct / .incorrect classes on the input.
     */
    result: boolean | null;
    /**
     * Matched mistake-feedback text from BlankRef.mistakeFeedback, or null
     * when the typed value didn't match any configured mistake. Set by the
     * scoring path (event handler); read by render. Populated in Session 2;
     * stays null in Session 1.
     */
    matchedMistake: string | null;
    /**
     * Whether the student has clicked this blank's hint button. Drives the
     * hint text's hidden attribute and the button's aria-expanded value.
     * Populated in Session 2; stays false in Session 1.
     */
    hintRevealed: boolean;
}

export interface BlockState {
    /**
     * Whether this fill_in_blank block's solution slot has been revealed
     * (true after the containing section is checked, when the block has a
     * solution authored). Populated in Session 2.
     */
    solutionRevealed: boolean;
    /**
     * Student's selected confidence value for this block. Null until the
     * student picks one. Populated in Session 3.
     */
    confidence: 'unsure' | 'think_so' | 'certain' | null;
}

export interface RuntimeState {
    /** True once the final submit has completed successfully. */
    submitted: boolean;
    /**
     * Server-derived attempt number. The Edge Function returns the canonical
     * value in its HTTP response; the client value is advisory only. Starts
     * at 1 (the first attempt before any resubmit).
     */
    attemptNumber: number;
    /** Current value of the name input (mirrored from .identity-prompt input). */
    studentName: string;
    /** Per-section status, keyed by section.id. */
    sections: Record<string, SectionState>;
    /** Per-blank status, keyed by blank.id. */
    blanks: Record<string, BlankState>;
    /** Per-fill-in-blank-block status, keyed by block.id. */
    blocks: Record<string, BlockState>;
}

/**
 * Build the initial state. Every section/blank/block gets an entry with
 * sensible defaults (unchecked, unlocked, zero score; result null; not
 * revealed; no confidence selected). studentName starts empty — the
 * name-persistence layer in index.ts populates it from localStorage as a
 * separate concern during event-handler wiring.
 *
 * Pure function of refs — no DOM access, no globals read. Replays
 * deterministically against the same refs.
 */
export function createInitialState(refs: Refs): RuntimeState {
    const sections: Record<string, SectionState> = {};
    for (const [id] of refs.sections) {
        sections[id] = {
            checked: false,
            locked: false,
            score: 0,
            total: 0,
            checkedAt: null,
        };
    }
    const blanks: Record<string, BlankState> = {};
    for (const [id] of refs.blanks) {
        blanks[id] = {
            result: null,
            matchedMistake: null,
            hintRevealed: false,
        };
    }
    const blocks: Record<string, BlockState> = {};
    for (const [id] of refs.fillInBlanks) {
        blocks[id] = {
            solutionRevealed: false,
            confidence: null,
        };
    }
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        sections,
        blanks,
        blocks,
    };
}
