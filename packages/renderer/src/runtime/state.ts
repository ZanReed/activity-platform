// =============================================================================
// runtime/state.ts — Mutable runtime state
// -----------------------------------------------------------------------------
// Single source of truth for what's currently happening on the page. Event
// handlers mutate state; render() reads state. The DOM is never queried for
// "current value" — state is.
//
// Why Record (not Map) for sections: state is JSON-serializable so it can
// be diffed in dev and (eventually) serialized into submission payloads.
// Plain objects serialize naturally; Map does not.
//
// State is intentionally narrow in Step 6 — it carries only what the
// minimal current behavior needs (submitted, attemptNumber, studentName,
// per-section status with sensible defaults). The shapes here are the
// targets for Stage 13's checkpoint scoring + feedback rendering, which
// populates fields that initialize to safe defaults today.
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
}

/**
 * Build the initial state. Every section gets a SectionState entry in
 * sensible defaults (unchecked, unlocked, zero score); studentName starts
 * empty (the name-persistence layer populates it from localStorage as a
 * separate concern during event-handler wiring).
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
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        sections,
    };
}
