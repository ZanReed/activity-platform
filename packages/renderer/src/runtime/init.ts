// =============================================================================
// runtime/init.ts — DOM-walking initialization
// -----------------------------------------------------------------------------
// One function: read the published HTML once and produce typed refs maps,
// a parsed config, and a clean initial state. Everything downstream (event
// handlers, scoring, render) consumes these and never re-queries the DOM
// for the same information (RUNTIME.md "Don't query the DOM inside scoring
// or state functions").
//
// Failure modes:
//   - Missing/malformed #activity-config → init() returns null. The caller
//     falls back to a no-op runtime (per RUNTIME.md "graceful degradation").
//   - A malformed per-element data attribute (bad JSON in
//     data-mistake-feedback, missing data-block-id, etc.) is logged via
//     console.warn and the specific blank/block is silently skipped from
//     the refs maps. The rest of the page still works.
//
// This is the ONLY file in the runtime that may run querySelector against
// document.body. Once init returns, the runtime is pure(ish) state→DOM logic.
// =============================================================================

import { parseConfig, type RuntimeConfig } from './config.js';
import {
    type Refs,
    type BlankRef,
    type FillInBlankRef,
    type SectionRef,
} from './refs.js';
import { createInitialState, type RuntimeState } from './state.js';
import { $$ } from './dom.js';

export interface InitResult {
    config: RuntimeConfig;
    refs: Refs;
    state: RuntimeState;
}

/**
 * Run the init pass. Returns null when config is unavailable (the caller
 * falls back to a no-op runtime). All DOM access happens here; downstream
 * code consumes the typed refs maps.
 */
export function init(doc: Document = document): InitResult | null {
    const config = parseConfig(doc);
    if (!config) return null;

    const refs = buildRefs(doc);
    const state = createInitialState(refs);
    return { config, refs, state };
}

/**
 * Walk the body and build the three refs maps. Exported so tests can
 * exercise the DOM-walk without going through parseConfig (useful when
 * fixturing a partial document without the config blob).
 */
export function buildRefs(doc: Document = document): Refs {
    const sections = new Map<string, SectionRef>();
    const fillInBlanks = new Map<string, FillInBlankRef>();
    const blanks = new Map<string, BlankRef>();

    for (const sectionEl of $$<HTMLElement>('.activity-section', doc)) {
        const sectionId = sectionEl.dataset.sectionId;
        if (!sectionId) {
            warn('Section is missing data-section-id; skipping.');
            continue;
        }

        const sectionBlockIds: string[] = [];
        const sectionBlankIds: string[] = [];

        // Walk fill-in-blank blocks inside this section. data-block-type uses
        // the snake_case schema discriminant verbatim ('fill_in_blank'), per
        // STATE.md's "Block identity attributes" decision.
        for (const blockEl of $$<HTMLElement>(
            '[data-block-type="fill_in_blank"]',
            sectionEl,
        )) {
            const blockId = blockEl.dataset.blockId;
            if (!blockId) {
                warn('Fill-in-blank block is missing data-block-id; skipping.');
                continue;
            }
            sectionBlockIds.push(blockId);

            const blockBlankIds: string[] = [];
            for (const input of $$<HTMLInputElement>('.blank', blockEl)) {
                const ref = buildBlankRef(input, blockId, sectionId);
                if (!ref) continue;
                const blankId = ref.input.dataset.blankId as string;
                blanks.set(blankId, ref);
                blockBlankIds.push(blankId);
            }
            sectionBlankIds.push(...blockBlankIds);

            fillInBlanks.set(
                blockId,
                buildFillInBlankRef(blockEl, blockId, sectionId, blockBlankIds),
            );
        }

        sections.set(
            sectionId,
            buildSectionRef(sectionEl, sectionBlockIds, sectionBlankIds),
        );
    }

    return { blanks, fillInBlanks, sections };
}

function buildBlankRef(
    input: HTMLInputElement,
    blockId: string,
    sectionId: string,
): BlankRef | null {
    const blankId = input.dataset.blankId;
    if (!blankId) {
        warn('Blank input is missing data-blank-id; skipping.');
        return null;
    }

    // The wrapper holds the input and its sibling feedback / hint elements
    // (Step 1 introduced this structural wrapper). Without a wrapper there's
    // no feedback slot to render into, so we skip the blank rather than
    // populate a half-refs entry.
    const wrapper = input.parentElement;
    if (!wrapper) {
        warn('Blank ' + blankId + ' has no parent element; skipping.');
        return null;
    }

    const feedbackEl = wrapper.querySelector<HTMLElement>('.js-blank-feedback');
    if (!feedbackEl) {
        warn('Blank ' + blankId + ' has no .js-blank-feedback sibling; skipping.');
        return null;
    }

    // Hint affordances are only emitted when the blank has a hint, so a null
    // here is normal (not a malformed state). Same for hintTextEl.
    const hintButton = wrapper.querySelector<HTMLButtonElement>('.js-blank-hint');
    const hintTextEl = wrapper.querySelector<HTMLElement>('.js-blank-hint-text');

    const answers = (input.dataset.blankAnswers ?? '').split('|').filter(Boolean);
    const strategy = input.dataset.blankStrategy ?? 'list';
    const hint = input.dataset.hint ?? null;

    let mistakeFeedback: BlankRef['mistakeFeedback'] = [];
    const rawMistake = input.dataset.mistakeFeedback;
    if (rawMistake) {
        try {
            const parsed = JSON.parse(rawMistake);
            if (Array.isArray(parsed)) {
                mistakeFeedback = parsed;
            }
        } catch {
            warn('Blank ' + blankId + ' has malformed data-mistake-feedback; ignoring.');
        }
    }

    return {
        input,
        feedbackEl,
        hintButton,
        hintTextEl,
        answers,
        strategy,
        hint,
        mistakeFeedback,
        blockId,
        sectionId,
    };
}

function buildFillInBlankRef(
    el: HTMLElement,
    blockId: string,
    sectionId: string,
    blankIds: string[],
): FillInBlankRef {
    const solution = el.dataset.solution ?? null;
    const solutionEl = el.querySelector<HTMLElement>('.js-solution');
    const hasConfidenceRating = el.dataset.hasConfidenceRating === 'true';
    const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
        '.js-confidence-rating',
    );

    let skills: string[] = [];
    const rawSkills = el.dataset.skills;
    if (rawSkills) {
        try {
            const parsed = JSON.parse(rawSkills);
            if (Array.isArray(parsed)) {
                skills = parsed;
            }
        } catch {
            warn('Block ' + blockId + ' has malformed data-skills; ignoring.');
        }
    }

    return {
        el,
        blankIds,
        solution,
        solutionEl,
        hasConfidenceRating,
        confidenceFieldset,
        skills,
        sectionId,
    };
}

function buildSectionRef(
    el: HTMLElement,
    blockIds: string[],
    blankIds: string[],
): SectionRef {
    // data-is-checkpoint is absent entirely in single submissionMode.
    // Present-and-"true" means this specific section is a checkpoint.
    // Present-and-"false" means the activity uses checkpoints but this
    // section isn't one. We surface only the boolean here; the checkButton
    // / scoreEl presence already encodes the "is the activity in checkpoint
    // mode at all" signal via the renderer's omission pattern.
    const isCheckpoint = el.dataset.isCheckpoint === 'true';
    const checkButton = el.querySelector<HTMLButtonElement>('.js-checkpoint-btn');
    const scoreEl = el.querySelector<HTMLElement>('.js-section-score');

    return {
        el,
        isCheckpoint,
        blankIds,
        blockIds,
        checkButton,
        scoreEl,
    };
}

function warn(message: string): void {
    if (typeof console !== 'undefined') {
        console.warn('[activity-runtime init] ' + message);
    }
}
