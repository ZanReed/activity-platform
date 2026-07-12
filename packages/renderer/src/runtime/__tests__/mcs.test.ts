/**
 * @vitest-environment jsdom
 */
// =============================================================================
// mcs.test.ts — Multiple-choice runtime: refs, scoring, check, gather, render
// -----------------------------------------------------------------------------
// JSDOM-backed, on hand-written fixtures mirroring the renderer's MC markup
// (the data-attribute contract); render.test.ts (renderer suite) pins the
// markup itself. Covers: init walking, all-or-nothing scoring, omission
// semantics, checkSection aggregation, gatherResponses' choices map + v5
// payload, render's selection sync / verdict classes / feedback reveal /
// locked freeze, and storage round-trip of the mcs map.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { buildRefs } from '../init.js';
import { createInitialState, type RuntimeState } from '../state.js';
import type { Refs } from '../refs.js';
import { isSelectionCorrect, scoreMcBlocks, wireMcChoices } from '../mcs.js';
import { checkSection } from '../checkpoints.js';
import { gatherResponses, buildSubmissionPayload } from '../submission.js';
import { render } from '../render.js';
import type { RuntimeConfig } from '../config.js';

const SEC = 'sec-1';
const MC = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001';
const B = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002';
const C = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000003';

const CONFIG: RuntimeConfig = {
    activityId: '11111111-1111-1111-1111-111111111111',
    versionNum: 1,
    submissionEndpoint: 'https://example.com/submit',
    submissionMode: 'free',
    revisionMode: 'free',
    gradingMode: 'auto',
    answerFeedback: 'on_check',
};

function mcBlockHtml(opts: {
    multi?: boolean;
    correct?: string[];
    feedbackFor?: string[];
    solution?: boolean;
}): string {
    const correct = opts.correct ?? [A];
    const type = opts.multi ? 'checkbox' : 'radio';
    const choices = [A, B, C]
        .map(
            (id, i) =>
                '<label class="mc-choice">' +
                `<input type="${type}" name="mc-${MC}" value="${id}" data-choice-id="${id}" />` +
                `<span class="mc-choice-letter">${'ABC'[i]}.</span>` +
                '<span class="mc-choice-content">choice</span>' +
                '</label>' +
                ((opts.feedbackFor ?? []).indexOf(id) !== -1
                    ? `<div class="js-mc-feedback mc-choice-feedback" data-choice-id="${id}" hidden>Think again.</div>`
                    : ''),
        )
        .join('');
    return (
        `<section class="activity-section" data-section-id="${SEC}">` +
        `<div class="block block-multiple-choice" data-block-type="multiple_choice"` +
        ` data-block-id="${MC}"` +
        ` data-mc-answer='${JSON.stringify(correct)}'` +
        (opts.multi ? ' data-mc-multi="true"' : '') +
        '>' +
        '<div class="block-problem-body">' +
        '<fieldset class="mc-choices">' +
        choices +
        '</fieldset>' +
        (opts.solution
            ? `<div class="js-solution" data-for-block="${MC}" hidden>Because.</div>`
            : '') +
        '</div></div>' +
        '<button class="js-checkpoint-btn">Check</button>' +
        '<span class="js-section-score" hidden></span>' +
        '</section>'
    );
}

function setup(opts: Parameters<typeof mcBlockHtml>[0] = {}): {
    refs: Refs;
    state: RuntimeState;
} {
    document.body.innerHTML = mcBlockHtml(opts);
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    return { refs, state };
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('isSelectionCorrect', () => {
    it('exact set match, order-free', () => {
        expect(isSelectionCorrect([A], [A])).toBe(true);
        expect(isSelectionCorrect([B, A], [A, B])).toBe(true);
    });
    it('subset, superset, and disjoint all fail (all-or-nothing)', () => {
        expect(isSelectionCorrect([A], [A, B])).toBe(false);
        expect(isSelectionCorrect([A, B, C], [A, B])).toBe(false);
        expect(isSelectionCorrect([C], [A])).toBe(false);
        expect(isSelectionCorrect([], [A])).toBe(false);
    });
});

describe('init walking', () => {
    it('builds an McRef with parsed answer key, ids, labels, and section membership', () => {
        const { refs } = setup({ feedbackFor: [B], solution: true });
        const ref = refs.mcs.get(MC)!;
        expect(ref).toBeDefined();
        expect(ref.correctIds).toEqual([A]);
        expect(ref.choiceIds).toEqual([A, B, C]);
        expect(ref.inputs).toHaveLength(3);
        expect(ref.labels[0]!.classList.contains('mc-choice')).toBe(true);
        expect(ref.multiSelect).toBe(false);
        expect(Object.keys(ref.feedbackEls)).toEqual([B]);
        expect(ref.solutionEl).not.toBeNull();
        expect(ref.sectionId).toBe(SEC);
        expect(refs.sections.get(SEC)!.mcBlockIds).toEqual([MC]);
    });

    it('skips a block with a malformed answer key (rest of page unaffected)', () => {
        document.body.innerHTML = mcBlockHtml({}).replace(
            `data-mc-answer='["${A}"]'`,
            "data-mc-answer='not json'",
        );
        const refs = buildRefs(document);
        expect(refs.mcs.size).toBe(0);
        expect(refs.sections.get(SEC)!.mcBlockIds).toEqual([]);
    });

    it('initial state has an entry per MC block', () => {
        const { state } = setup();
        expect(state.mcs[MC]).toEqual({
            selected: [],
            result: null,
            solutionRevealed: false,
            confidence: null,
        });
    });
});

describe('scoring + checkSection', () => {
    it('scores the correct single selection true, wrong false, none null', () => {
        const { refs, state } = setup();
        state.mcs[MC]!.selected = [A];
        scoreMcBlocks(state, refs, [MC]);
        expect(state.mcs[MC]!.result).toBe(true);

        state.mcs[MC]!.selected = [B];
        scoreMcBlocks(state, refs, [MC]);
        expect(state.mcs[MC]!.result).toBe(false);

        state.mcs[MC]!.selected = [];
        scoreMcBlocks(state, refs, [MC]);
        expect(state.mcs[MC]!.result).toBeNull();
    });

    it('multi-select requires the exact set', () => {
        const { refs, state } = setup({ multi: true, correct: [A, C] });
        state.mcs[MC]!.selected = [A, C];
        scoreMcBlocks(state, refs, [MC]);
        expect(state.mcs[MC]!.result).toBe(true);
        state.mcs[MC]!.selected = [A];
        scoreMcBlocks(state, refs, [MC]);
        expect(state.mcs[MC]!.result).toBe(false);
    });

    it('checkSection counts the MC block in the total (omission when unanswered) and reveals the solution', () => {
        const { refs, state } = setup({ solution: true });
        checkSection(CONFIG, state, refs, SEC);
        expect(state.sections[SEC]!.total).toBe(1);
        expect(state.sections[SEC]!.score).toBe(0);
        expect(state.mcs[MC]!.solutionRevealed).toBe(true);

        state.mcs[MC]!.selected = [A];
        checkSection(CONFIG, state, refs, SEC);
        expect(state.sections[SEC]!.score).toBe(1);
    });

    it('locked mode freezes the section', () => {
        const { refs, state } = setup();
        state.mcs[MC]!.selected = [A];
        checkSection({ ...CONFIG, submissionMode: 'locked' }, state, refs, SEC);
        expect(state.sections[SEC]!.locked).toBe(true);
    });
});

describe('gatherResponses + payload (v7)', () => {
    it('answered MC lands in the choices map and the score', () => {
        const { refs, state } = setup();
        state.mcs[MC]!.selected = [A];
        state.mcs[MC]!.confidence = 'certain';
        const gathered = gatherResponses(state, refs);
        expect(gathered.choices).toEqual({
            [MC]: { selected: [A], correct: true, confidence: 'certain' },
        });
        expect(gathered.score).toBe(1);
        expect(gathered.totalScored).toBe(1);

        const payload = buildSubmissionPayload(CONFIG, 'Kid', gathered, undefined);
        expect(payload.responses.schemaVersion).toBe(7);
        expect(payload.responses.choices).toEqual(gathered.choices);
    });

    it('an unanswered MC is an omission — absent from the map, not in the denominator', () => {
        const { refs, state } = setup();
        const gathered = gatherResponses(state, refs);
        expect(gathered.choices).toBeUndefined();
        expect(gathered.totalScored).toBe(0);

        const payload = buildSubmissionPayload(CONFIG, 'Kid', gathered, undefined);
        expect(payload.responses.choices).toBeUndefined();
    });

    it('a wrong selection scores 0 but still submits', () => {
        const { refs, state } = setup();
        state.mcs[MC]!.selected = [B];
        const gathered = gatherResponses(state, refs);
        expect(gathered.choices![MC]).toEqual({ selected: [B], correct: false });
        expect(gathered.score).toBe(0);
        expect(gathered.totalScored).toBe(1);
    });
});

describe('render', () => {
    it('syncs checked state from selection (restore path) and shows no verdict pre-check', () => {
        const { refs, state } = setup();
        state.mcs[MC]!.selected = [B];
        render(state, refs);
        const ref = refs.mcs.get(MC)!;
        expect(ref.inputs[0]!.checked).toBe(false);
        expect(ref.inputs[1]!.checked).toBe(true);
        expect(ref.labels[1]!.classList.contains('correct')).toBe(false);
        expect(ref.labels[1]!.classList.contains('incorrect')).toBe(false);
    });

    it('post-check: selected choices get verdict classes + aria-invalid; feedback reveals for selected only', () => {
        const { refs, state } = setup({ feedbackFor: [B, C] });
        state.mcs[MC]!.selected = [B];
        checkSection(CONFIG, state, refs, SEC);
        render(state, refs);
        const ref = refs.mcs.get(MC)!;
        expect(ref.labels[1]!.classList.contains('incorrect')).toBe(true);
        expect(ref.inputs[1]!.getAttribute('aria-invalid')).toBe('true');
        // Unselected choices carry no verdict — the right answer isn't leaked.
        expect(ref.labels[0]!.classList.contains('correct')).toBe(false);
        expect(ref.feedbackEls[B]!.hidden).toBe(false);
        expect(ref.feedbackEls[C]!.hidden).toBe(true);
    });

    it('locked section disables every choice input', () => {
        const { refs, state } = setup();
        state.mcs[MC]!.selected = [A];
        checkSection({ ...CONFIG, submissionMode: 'locked' }, state, refs, SEC);
        render(state, refs);
        for (const input of refs.mcs.get(MC)!.inputs) {
            expect(input.disabled).toBe(true);
        }
    });
});

describe('wireMcChoices', () => {
    it('a change event rebuilds the selection in document order', () => {
        const { refs, state } = setup({ multi: true, correct: [A, C] });
        let updates = 0;
        wireMcChoices(state, refs, () => {
            updates += 1;
        });
        const ref = refs.mcs.get(MC)!;
        ref.inputs[2]!.checked = true;
        ref.inputs[2]!.dispatchEvent(new Event('change'));
        ref.inputs[0]!.checked = true;
        ref.inputs[0]!.dispatchEvent(new Event('change'));
        // Document order, regardless of click order.
        expect(state.mcs[MC]!.selected).toEqual([A, C]);
        expect(updates).toBe(2);
    });
});
