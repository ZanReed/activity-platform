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
    type McRef,
    type MatchRef,
    type MatchItemRef,
    type MatchTargetRef,
    type OrderingRef,
    type GraphRef,
    type GraphDisplayRef,
    type NumberLineRef,
    type SectionRef,
    type PopoverRef,
} from './refs.js';
import { createInitialState, type RuntimeState } from './state.js';
import { graphExt, numberLineExt } from './graph-integration.js';
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
    const mcs = new Map<string, McRef>();
    const matches = new Map<string, MatchRef>();
    const orderings = new Map<string, OrderingRef>();
    const graphs = new Map<string, GraphRef>();
    const graphDisplays = new Map<string, GraphDisplayRef>();
    const numberLines = new Map<string, NumberLineRef>();

    for (const sectionEl of $$<HTMLElement>('.activity-section', doc)) {
        const sectionId = sectionEl.dataset.sectionId;
        if (!sectionId) {
            warn('Section is missing data-section-id; skipping.');
            continue;
        }

        const sectionBlockIds: string[] = [];
        const sectionBlankIds: string[] = [];
        const sectionMcBlockIds: string[] = [];
        const sectionMatchBlockIds: string[] = [];
        const sectionOrderingBlockIds: string[] = [];
        const sectionGraphBlockIds: string[] = [];
        const sectionNumberLineBlockIds: string[] = [];

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

        // Multiple-choice blocks — one scorable unit each, like graphs.
        for (const blockEl of $$<HTMLElement>(
            '[data-block-type="multiple_choice"]',
            sectionEl,
        )) {
            const blockId = blockEl.dataset.blockId;
            if (!blockId) {
                warn('Multiple-choice block is missing data-block-id; skipping.');
                continue;
            }
            const ref = buildMcRef(blockEl, blockId, sectionId);
            if (!ref) continue;
            mcs.set(blockId, ref);
            sectionMcBlockIds.push(blockId);
        }

        // Matching blocks — scored per pair (each item is one point).
        for (const blockEl of $$<HTMLElement>(
            '[data-block-type="matching"]',
            sectionEl,
        )) {
            const blockId = blockEl.dataset.blockId;
            if (!blockId) {
                warn('Matching block is missing data-block-id; skipping.');
                continue;
            }
            const ref = buildMatchRef(blockEl, blockId, sectionId);
            if (!ref) continue;
            matches.set(blockId, ref);
            sectionMatchBlockIds.push(blockId);
        }

        // Ordering blocks — one scorable unit each, all-or-nothing.
        for (const blockEl of $$<HTMLElement>(
            '[data-block-type="ordering"]',
            sectionEl,
        )) {
            const blockId = blockEl.dataset.blockId;
            if (!blockId) {
                warn('Ordering block is missing data-block-id; skipping.');
                continue;
            }
            const ref = buildOrderingRef(blockEl, blockId, sectionId);
            if (!ref) continue;
            orderings.set(blockId, ref);
            sectionOrderingBlockIds.push(blockId);
        }

        // Graph blocks (graded + display) are the graph feature's to walk: in
        // the base runtime build this is a no-op and no graph code ships.
        sectionGraphBlockIds.push(
            ...graphExt.walkGraphBlocks(sectionEl, sectionId, graphs, graphDisplays),
        );

        // Number-line blocks — the number_line feature's to walk (same lazy kit
        // as graphs; a no-op in the base build).
        sectionNumberLineBlockIds.push(
            ...numberLineExt.walkNumberLineBlocks(sectionEl, sectionId, numberLines),
        );

        sections.set(
            sectionId,
            buildSectionRef(
                sectionEl,
                sectionBlockIds,
                sectionBlankIds,
                sectionMcBlockIds,
                sectionMatchBlockIds,
                sectionOrderingBlockIds,
                sectionGraphBlockIds,
                sectionNumberLineBlockIds,
            ),
        );
    }

    return {
        blanks,
        fillInBlanks,
        mcs,
        matches,
        orderings,
        graphs,
        graphDisplays,
        numberLines,
        sections,
        popover: buildPopoverRef(doc),
    };
}

/**
 * Locate the single shared popover markup emitted by document.ts. Returns
 * null when any required part is missing — the runtime then treats trigger
 * buttons as no-ops rather than throwing. All parts must be present for the
 * popover to function, so it's all-or-nothing.
 */
function buildPopoverRef(doc: Document): PopoverRef | null {
    const el = doc.querySelector<HTMLElement>('.js-popover');
    if (!el) return null;
    const header = el.querySelector<HTMLElement>('.js-popover-header');
    const titleEl = el.querySelector<HTMLElement>('.js-popover-title');
    const bodyEl = el.querySelector<HTMLElement>('.js-popover-body');
    const closeButton = el.querySelector<HTMLButtonElement>('.js-popover-close');
    if (!header || !titleEl || !bodyEl || !closeButton) {
        warn('Popover markup is incomplete; hint/mistake buttons will be inert.');
        return null;
    }
    return { el, header, titleEl, bodyEl, closeButton };
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

    const hintButton = wrapper.querySelector<HTMLButtonElement>('.js-blank-hint');
    const mistakeButton =
        wrapper.querySelector<HTMLButtonElement>('.js-blank-mistake');

    const answers = (input.dataset.blankAnswers ?? '').split('|').filter(Boolean);
    const strategy = input.dataset.blankStrategy ?? 'list';

    // Order-independent grouping: present only on blanks the renderer placed in
    // a group (2+ adjacent interchangeable blanks). Absent → null → scored
    // independently. The id is the group's anchor blank id; equality is all the
    // runtime needs to bucket members together.
    const groupId = input.dataset.blankGroup ?? null;

    // Rich feedback content lives in hidden <template> siblings, pre-rendered
    // server-side. The runtime never parses or re-renders it — it clones the
    // template into the popover on demand.
    const hintContent = wrapper.querySelector<HTMLTemplateElement>(
        '.js-blank-hint-content',
    );

    // One template per mistakeFeedback entry, in document order. The match
    // string lives on data-match; matching happens against these in order
    // (first match wins).
    const mistakeFeedback: BlankRef['mistakeFeedback'] = Array.prototype.slice
        .call(
            wrapper.querySelectorAll<HTMLTemplateElement>(
                '.js-blank-mistake-content',
            ),
        )
        .map((content: HTMLTemplateElement) => ({
            match: content.dataset.match ?? '',
            content,
        }));

    return {
        input,
        hintButton,
        mistakeButton,
        answers,
        strategy,
        hintContent,
        mistakeFeedback,
        blockId,
        sectionId,
        groupId,
    };
}

function buildFillInBlankRef(
    el: HTMLElement,
    blockId: string,
    sectionId: string,
    blankIds: string[],
): FillInBlankRef {
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
        solutionEl,
        hasConfidenceRating,
        confidenceFieldset,
        confidenceRadios,
        skills,
        sectionId,
    };
}

/**
 * Build the ref for one multiple_choice block. Returns null when the baked
 * answer key (data-mc-answer) is missing or malformed — a block the runtime
 * can't score is skipped whole (its inputs stay inert), the rest of the page
 * still works.
 */
function buildMcRef(
    el: HTMLElement,
    blockId: string,
    sectionId: string,
): McRef | null {
    let correctIds: string[] | null = null;
    try {
        const parsed = JSON.parse(el.dataset.mcAnswer ?? '');
        if (
            Array.isArray(parsed) &&
            parsed.every((v) => typeof v === 'string')
        ) {
            correctIds = parsed;
        }
    } catch {
        /* fall through to the warn below */
    }
    if (correctIds === null) {
        warn('Block ' + blockId + ' has malformed data-mc-answer; skipping.');
        return null;
    }

    const inputs: HTMLInputElement[] = [];
    const choiceIds: string[] = [];
    const labels: HTMLElement[] = [];
    for (const input of $$<HTMLInputElement>(
        '.mc-choice input[data-choice-id]',
        el,
    )) {
        const choiceId = input.dataset.choiceId;
        const label = input.parentElement;
        if (!choiceId || !label) continue;
        inputs.push(input);
        choiceIds.push(choiceId);
        labels.push(label);
    }

    const feedbackEls: Record<string, HTMLElement> = {};
    for (const div of $$<HTMLElement>('.js-mc-feedback', el)) {
        const choiceId = div.dataset.choiceId;
        if (choiceId) feedbackEls[choiceId] = div;
    }

    const solutionEl = el.querySelector<HTMLElement>('.js-solution');
    const hasConfidenceRating = el.dataset.hasConfidenceRating === 'true';
    const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
        '.js-confidence-rating',
    );
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
            if (Array.isArray(parsed)) skills = parsed;
        } catch {
            warn('Block ' + blockId + ' has malformed data-skills; ignoring.');
        }
    }

    return {
        el,
        inputs,
        choiceIds,
        labels,
        correctIds,
        multiSelect: el.dataset.mcMulti === 'true',
        feedbackEls,
        solutionEl,
        hasConfidenceRating,
        confidenceRadios,
        skills,
        sectionId,
    };
}

/**
 * Build the ref for one matching block. Returns null when the baked answer
 * key (data-match-key) is missing or malformed — a block the runtime can't
 * score is skipped whole (its cards stay inert), the rest of the page works.
 */
function buildMatchRef(
    el: HTMLElement,
    blockId: string,
    sectionId: string,
): MatchRef | null {
    let key: Record<string, string> | null = null;
    try {
        const parsed = JSON.parse(el.dataset.matchKey ?? '') as unknown;
        if (
            parsed !== null &&
            typeof parsed === 'object' &&
            !Array.isArray(parsed) &&
            Object.values(parsed).every((v) => typeof v === 'string')
        ) {
            key = parsed as Record<string, string>;
        }
    } catch {
        /* fall through to the warn below */
    }
    if (key === null) {
        warn('Block ' + blockId + ' has malformed data-match-key; skipping.');
        return null;
    }

    const itemIds: string[] = [];
    const items = new Map<string, MatchItemRef>();
    for (const itemEl of $$<HTMLElement>('.match-item', el)) {
        const itemId = itemEl.dataset.itemId;
        const slot = itemEl.querySelector<HTMLElement>('.match-slot');
        if (!itemId || !slot) continue;
        itemIds.push(itemId);
        items.set(itemId, { el: itemEl, slot });
    }

    const targetIds: string[] = [];
    const targets = new Map<string, MatchTargetRef>();
    for (const home of $$<HTMLElement>('.match-target-slot', el)) {
        const targetId = home.dataset.targetId;
        const card = home.querySelector<HTMLElement>('.match-target');
        const letterEl = home.querySelector<HTMLElement>('.match-target-letter');
        if (!targetId || !card) continue;
        targetIds.push(targetId);
        targets.set(targetId, {
            card,
            home,
            letter: (letterEl?.textContent ?? '').replace('.', ''),
        });
    }

    const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
        '.js-confidence-rating',
    );
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
            if (Array.isArray(parsed)) skills = parsed;
        } catch {
            warn('Block ' + blockId + ' has malformed data-skills; ignoring.');
        }
    }

    return {
        el,
        itemIds,
        items,
        targetIds,
        targets,
        key,
        allowReuse: el.dataset.matchReuse === 'true',
        statusEl: el.querySelector<HTMLElement>('.js-match-status'),
        solutionEl: el.querySelector<HTMLElement>('.js-solution'),
        hasConfidenceRating: el.dataset.hasConfidenceRating === 'true',
        confidenceRadios,
        skills,
        sectionId,
    };
}

/**
 * Build the ref for one ordering block. Returns null when the baked answer
 * key (data-order-answer) is missing or malformed.
 */
function buildOrderingRef(
    el: HTMLElement,
    blockId: string,
    sectionId: string,
): OrderingRef | null {
    let answer: string[] | null = null;
    try {
        const parsed = JSON.parse(el.dataset.orderAnswer ?? '');
        if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
            answer = parsed;
        }
    } catch {
        /* fall through to the warn below */
    }
    if (answer === null) {
        warn('Block ' + blockId + ' has malformed data-order-answer; skipping.');
        return null;
    }

    const list = el.querySelector<HTMLElement>('.order-list');
    if (!list) {
        warn('Block ' + blockId + ' has no .order-list; skipping.');
        return null;
    }

    const initialOrder: string[] = [];
    const items = new Map<string, HTMLElement>();
    for (const itemEl of $$<HTMLElement>('.order-item', el)) {
        const itemId = itemEl.dataset.itemId;
        if (!itemId) continue;
        initialOrder.push(itemId);
        items.set(itemId, itemEl);
    }

    const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
        '.js-confidence-rating',
    );
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
            if (Array.isArray(parsed)) skills = parsed;
        } catch {
            warn('Block ' + blockId + ' has malformed data-skills; ignoring.');
        }
    }

    return {
        el,
        list,
        items,
        initialOrder,
        answer,
        statusEl: el.querySelector<HTMLElement>('.js-order-status'),
        solutionEl: el.querySelector<HTMLElement>('.js-solution'),
        hasConfidenceRating: el.dataset.hasConfidenceRating === 'true',
        confidenceRadios,
        skills,
        sectionId,
    };
}

function buildSectionRef(
    el: HTMLElement,
    blockIds: string[],
    blankIds: string[],
    mcBlockIds: string[],
    matchBlockIds: string[],
    orderingBlockIds: string[],
    graphBlockIds: string[],
    numberLineBlockIds: string[],
): SectionRef {
    const isCheckpoint = el.dataset.isCheckpoint === 'true';
    const checkButton = el.querySelector<HTMLButtonElement>('.js-checkpoint-btn');
    const scoreEl = el.querySelector<HTMLElement>('.js-section-score');

    return {
        el,
        isCheckpoint,
        blankIds,
        blockIds,
        mcBlockIds,
        matchBlockIds,
        orderingBlockIds,
        graphBlockIds,
        numberLineBlockIds,
        checkButton,
        scoreEl,
    };
}

function warn(message: string): void {
    if (typeof console !== 'undefined') {
        console.warn('[activity-runtime init] ' + message);
    }
}
