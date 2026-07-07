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
// =============================================================================

import type { Refs } from './refs.js';

export interface SectionState {
    /** True once the student has clicked the check button for this section. */
    checked: boolean;
    /** True after check in locked submissionMode — blank inputs freeze. */
    locked: boolean;
    /** Number of blanks scored correct in this section at last check. */
    score: number;
    /**
     * Total blanks in this section — the denominator for the score display.
     * Equals sectionRef.blankIds.length, NOT the attempted (non-empty) count.
     * Empty blanks count as omissions in the score "{score} / {total} correct".
     */
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
     * Index of the matched entry in BlankRef.mistakeFeedback, or null when the
     * typed value didn't match any configured mistake. Set by the scoring path
     * (event handler); read by render to reveal the `!` button and clone the
     * matching content template into the popover. An index (not the content
     * text) keeps persisted state lean.
     */
    matchedMistake: number | null;
}

/** Which kind of popover is open — drives its title + body source. */
export type PopoverKind = 'hint' | 'mistake';

export interface PopoverState {
    /** 'hint' shows the blank's authored hint; 'mistake' shows its matched mistake feedback. */
    kind: PopoverKind;
    /** blank.id the popover belongs to — its trigger and owning input. */
    blankId: string;
    /**
     * Viewport-fixed position in px (left/top). Seeded beside the trigger
     * button when the popover opens, then updated as the student drags it.
     * Always set while the popover is open (the open handler measures the
     * trigger and writes coordinates), so it's a plain number, not nullable.
     */
    x: number;
    y: number;
}

export interface BlockState {
    /**
     * Whether this fill_in_blank block's solution slot has been revealed
     * (true after the containing section is checked, when the block has
     * a solution authored). Once true, never unset — re-checking in free
     * mode keeps solutions visible.
     */
    solutionRevealed: boolean;
    /**
     * Student's selected confidence value for this block. Null until the
     * student picks one. Populated in Session 4.
     */
    confidence: 'unsure' | 'think_so' | 'certain' | null;
}

export interface GraphBlockState {
    /**
     * The student's plotted point(s) in graph units — one per answer handle
     * (usually one; a "plot both roots" question has more). Empty before they've
     * touched the widget. Persisted so a reload restores the plotted answer (the
     * sidecar calls the kit's restore() with it).
     */
    points: [number, number][];
    /** True once the student has moved a handle (drag or keyboard) at least once. */
    answered: boolean;
    /**
     * Scoring result: true correct, false incorrect, null unscored. Null until
     * the student answers — an untouched graph is an omission (counts in the
     * section total, not the correct count), exactly like an empty blank.
     */
    result: boolean | null;
    /** Whether this block's solution slot has been revealed (post-check). */
    solutionRevealed: boolean;
    /** Student's per-block confidence selection (null until picked). */
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
    /**
     * The single popover currently open (hint or mistake feedback), or null
     * when none is open. One-at-a-time is a policy, not a structural limit —
     * the popover is anchored per-trigger and could become multi-instance
     * later. Deliberately NOT persisted — an open popover (and its dragged
     * position) shouldn't survive a reload (see storage.ts, which snapshots
     * only blanks/blocks/sections).
     */
    popover: PopoverState | null;
    /** Per-section status, keyed by section.id. */
    sections: Record<string, SectionState>;
    /** Per-blank status, keyed by blank.id. */
    blanks: Record<string, BlankState>;
    /** Per-fill-in-blank-block status, keyed by block.id. */
    blocks: Record<string, BlockState>;
    /** Per-interactive-graph-block status, keyed by block.id. */
    graphs: Record<string, GraphBlockState>;
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
        };
    }
    const blocks: Record<string, BlockState> = {};
    for (const [id] of refs.fillInBlanks) {
        blocks[id] = {
            solutionRevealed: false,
            confidence: null,
        };
    }
    const graphs: Record<string, GraphBlockState> = {};
    for (const [id] of refs.graphs) {
        graphs[id] = {
            points: [],
            answered: false,
            result: null,
            solutionRevealed: false,
            confidence: null,
        };
    }
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        popover: null,
        sections,
        blanks,
        blocks,
        graphs,
    };
}
