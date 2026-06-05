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
    type HintModalRef,
} from './refs.js';
import { createInitialState, type RuntimeState } from './state.js';
import { $$ } from './dom.js';

export interface InitResult {
    config: RuntimeConfig;
    refs: Refs;
    state: RuntimeState;
}

export function init(doc: Document = document): InitResult | null {
    const config = parseConfig(doc);
    if (!config) return null;

    const refs = buildRefs(doc);
    const state = createInitialState(refs);
    return { config, refs, state };
}

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

    return { blanks, fillInBlanks, sections, hintModal: buildHintModalRef(doc) };
}

/**
 * Locate the single global hint-modal markup emitted by document.ts. Returns
 * null when any required part is missing — the runtime then treats hint
 * buttons as no-ops rather than throwing. All four nodes must be present for
 * the modal to function, so it's all-or-nothing.
 */
function buildHintModalRef(doc: Document): HintModalRef | null {
    const overlay = doc.querySelector<HTMLElement>('.js-hint-modal');
    if (!overlay) return null;
    const dialog = overlay.querySelector<HTMLElement>('.js-hint-modal-dialog');
    const bodyEl = overlay.querySelector<HTMLElement>('.js-hint-modal-body');
    const closeButton = overlay.querySelector<HTMLButtonElement>(
        '.js-hint-modal-close',
    );
    if (!dialog || !bodyEl || !closeButton) {
        warn('Hint modal markup is incomplete; hint buttons will be inert.');
        return null;
    }
    return { overlay, dialog, bodyEl, closeButton };
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

    const hintButton = wrapper.querySelector<HTMLButtonElement>('.js-blank-hint');

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
    // Walk radios once at init. Empty array when no fieldset exists or
    // the fieldset contains no radios. Downstream (render, wireConfidence)
    // consumes this and never re-queries the DOM.
    const confidenceRadios: HTMLInputElement[] = confidenceFieldset
    ? Array.prototype.slice.call(
        confidenceFieldset.querySelectorAll<HTMLInputElement>(
            'input[type="radio"]',
        ),
    )
    : [];

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
        confidenceRadios,
        skills,
        sectionId,
    };
}

function buildSectionRef(
    el: HTMLElement,
    blockIds: string[],
    blankIds: string[],
): SectionRef {
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
