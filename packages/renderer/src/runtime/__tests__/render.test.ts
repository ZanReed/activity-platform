/**
 * @vitest-environment jsdom
 */
// =============================================================================
// render.test.ts — JSDOM-backed tests for the state → DOM renderer
// -----------------------------------------------------------------------------
// render() is the only DOM mutator in the runtime after init. Tests
// construct a state + a minimal DOM fragment mirroring renderer output,
// call render(), and assert the resulting DOM state.
//
// Session 4 adds the "render — confidence reflection" describe block,
// covering the renderBlock confidence-radio sync. makeFillInBlankRef
// gains an optional withConfidence flag for the fixture.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '../render.js';
import type {
    Refs,
    BlankRef,
    FillInBlankRef,
    SectionRef,
    PopoverRef,
} from '../refs.js';
import type {
    RuntimeState,
    BlankState,
    BlockState,
    SectionState,
} from '../state.js';

function makeBlankRef(blankId: string): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);
    return {
        input,
        hintButton: null,
        mistakeButton: null,
        answers: ['x'],
        strategy: 'list',
        hintContent: null,
        mistakeFeedback: [],
        blockId: 'block-1',
        sectionId: 'sec-1',
        groupId: null,
    };
}

function makeBlankRefWithHint(blankId: string): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    const hintButton = document.createElement('button');
    hintButton.className = 'js-blank-hint';
    hintButton.setAttribute('aria-expanded', 'false');
    const hintContent = document.createElement('template');
    hintContent.className = 'js-blank-hint-content';
    hintContent.innerHTML = 'Try <strong>factoring</strong>.';
    wrapper.appendChild(input);
    wrapper.appendChild(hintButton);
    wrapper.appendChild(hintContent);
    document.body.appendChild(wrapper);
    return {
        input,
        hintButton,
        mistakeButton: null,
        answers: ['x'],
        strategy: 'list',
        hintContent,
        mistakeFeedback: [],
        blockId: 'block-1',
        sectionId: 'sec-1',
        groupId: null,
    };
}

function makeBlankRefWithMistake(blankId: string): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    const mistakeButton = document.createElement('button');
    mistakeButton.className = 'js-blank-mistake';
    mistakeButton.setAttribute('aria-expanded', 'false');
    mistakeButton.hidden = true;
    const mistakeContent = document.createElement('template');
    mistakeContent.className = 'js-blank-mistake-content';
    mistakeContent.setAttribute('data-match', 'wrong');
    mistakeContent.innerHTML = 'Targeted feedback.';
    wrapper.appendChild(input);
    wrapper.appendChild(mistakeButton);
    wrapper.appendChild(mistakeContent);
    document.body.appendChild(wrapper);
    return {
        input,
        hintButton: null,
        mistakeButton,
        answers: ['x'],
        strategy: 'list',
        hintContent: null,
        mistakeFeedback: [{ match: 'wrong', content: mistakeContent }],
        blockId: 'block-1',
        sectionId: 'sec-1',
        groupId: null,
    };
}

function makePopoverRef(): PopoverRef {
    const el = document.createElement('div');
    el.className = 'js-popover';
    el.hidden = true;
    const header = document.createElement('div');
    header.className = 'js-popover-header';
    const titleEl = document.createElement('h2');
    titleEl.className = 'js-popover-title';
    const closeButton = document.createElement('button');
    closeButton.className = 'js-popover-close';
    const bodyEl = document.createElement('div');
    bodyEl.className = 'js-popover-body';
    header.appendChild(titleEl);
    header.appendChild(closeButton);
    el.appendChild(header);
    el.appendChild(bodyEl);
    document.body.appendChild(el);
    return { el, header, titleEl, bodyEl, closeButton };
}

function makeFillInBlankRef(
    blockId: string,
    solution: string | null,
    withConfidence: boolean = false,
): FillInBlankRef {
    const el = document.createElement('div');
    el.className = 'block block-fill-in-blank';
    el.setAttribute('data-block-id', blockId);
    let solutionEl: HTMLElement | null = null;
    if (solution !== null) {
        solutionEl = document.createElement('div');
        solutionEl.className = 'js-solution';
        solutionEl.hidden = true;
        solutionEl.textContent = solution;
        el.appendChild(solutionEl);
    }
    let confidenceFieldset: HTMLFieldSetElement | null = null;
    const confidenceRadios: HTMLInputElement[] = [];
    if (withConfidence) {
        confidenceFieldset = document.createElement('fieldset');
        confidenceFieldset.className = 'js-confidence-rating';
        for (const value of ['unsure', 'think_so', 'certain']) {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'conf-' + blockId;
            radio.value = value;
            confidenceFieldset.appendChild(radio);
            confidenceRadios.push(radio);
        }
        el.appendChild(confidenceFieldset);
    }
    document.body.appendChild(el);
    return {
        el,
        blankIds: [],
        solutionEl,
        hasConfidenceRating: withConfidence,
        confidenceFieldset,
        confidenceRadios,
        skills: [],
        sectionId: 'sec-1',
    };
}

function makeSectionRefHelper(
    sectionId: string,
    withCheckButton: boolean,
): SectionRef {
    const el = document.createElement('section');
    el.className = 'activity-section';
    el.setAttribute('data-section-id', sectionId);
    let checkButton: HTMLButtonElement | null = null;
    let scoreEl: HTMLElement | null = null;
    if (withCheckButton) {
        checkButton = document.createElement('button');
        checkButton.className = 'js-checkpoint-btn';
        checkButton.type = 'button';
        scoreEl = document.createElement('div');
        scoreEl.className = 'js-section-score';
        scoreEl.hidden = true;
        el.appendChild(checkButton);
        el.appendChild(scoreEl);
    }
    document.body.appendChild(el);
    return {
        el,
        isCheckpoint: withCheckButton,
        blankIds: [],
        blockIds: [],
        mcBlockIds: [], matchBlockIds: [], orderingBlockIds: [],
        graphBlockIds: [],
        checkButton,
        scoreEl,
    };
}

function makeBlankState(
    result: boolean | null,
    overrides: Partial<BlankState> = {},
): BlankState {
    return {
        result,
        matchedMistake: null,
        ...overrides,
    };
}

function makeRefs(
    blanks: Map<string, BlankRef> = new Map(),
                  fillInBlanks: Map<string, FillInBlankRef> = new Map(),
                  sections: Map<string, SectionRef> = new Map(),
                  popover: PopoverRef | null = null,
): Refs {
    return { blanks, fillInBlanks, mcs: new Map(), matches: new Map(), orderings: new Map(), graphs: new Map(), graphDisplays: new Map(), sections, popover };
}

function makeState(
    blankStates: Record<string, BlankState> = {},
    blockStates: Record<string, BlockState> = {},
    sectionStates: Record<string, SectionState> = {},
): RuntimeState {
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        popover: null,
        sections: sectionStates,
        blanks: blankStates,
        blocks: blockStates,
        mcs: {}, matches: {}, orderings: {}, arrange: null,
    graphs: {},
    };
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('render — blanks (correct/incorrect class)', () => {
    it('adds .correct class when state.result === true', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(true) });
        render(state, refs);
        expect(ref.input.classList.contains('correct')).toBe(true);
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });

    it('adds .incorrect class when state.result === false', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(false) });
        render(state, refs);
        expect(ref.input.classList.contains('incorrect')).toBe(true);
        expect(ref.input.classList.contains('correct')).toBe(false);
    });

    it('removes both classes when state.result === null', () => {
        const ref = makeBlankRef('b1');
        ref.input.classList.add('correct');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(null) });
        render(state, refs);
        expect(ref.input.classList.contains('correct')).toBe(false);
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });

    it('transitions correct → incorrect without leaving stale .correct', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const blankState = makeBlankState(true);
        const state = makeState({ 'b1': blankState });
        render(state, refs);
        blankState.result = false;
        render(state, refs);
        expect(ref.input.classList.contains('correct')).toBe(false);
        expect(ref.input.classList.contains('incorrect')).toBe(true);
    });

    it('renders multiple blanks independently from their own state', () => {
        const r1 = makeBlankRef('b1');
        const r2 = makeBlankRef('b2');
        const refs = makeRefs(new Map([['b1', r1], ['b2', r2]]));
        const state = makeState({
            'b1': makeBlankState(true),
                                'b2': makeBlankState(false),
        });
        render(state, refs);
        expect(r1.input.classList.contains('correct')).toBe(true);
        expect(r2.input.classList.contains('incorrect')).toBe(true);
    });

    it('is idempotent — second render with unchanged state preserves DOM', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(true) });
        render(state, refs);
        const after1 = Array.from(ref.input.classList).sort();
        render(state, refs);
        const after2 = Array.from(ref.input.classList).sort();
        expect(after2).toEqual(after1);
    });

    it('silently skips a blank when state.blanks[id] is absent', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({});
        expect(() => render(state, refs)).not.toThrow();
        expect(ref.input.classList.contains('correct')).toBe(false);
    });
});

describe('render — aria-invalid', () => {
    it('sets aria-invalid="false" on correct blanks', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(true) });
        render(state, refs);
        expect(ref.input.getAttribute('aria-invalid')).toBe('false');
    });

    it('sets aria-invalid="true" on incorrect blanks', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(false) });
        render(state, refs);
        expect(ref.input.getAttribute('aria-invalid')).toBe('true');
    });

    it('removes aria-invalid when result is null (unscored)', () => {
        const ref = makeBlankRef('b1');
        ref.input.setAttribute('aria-invalid', 'true');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(null) });
        render(state, refs);
        expect(ref.input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('does not set aria-invalid on a fresh blank with null result', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(null) });
        render(state, refs);
        expect(ref.input.hasAttribute('aria-invalid')).toBe(false);
    });
});

describe('render — mistake affordance', () => {
    it('reveals the ! button when matchedMistake is set', () => {
        const ref = makeBlankRefWithMistake('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({
            'b1': makeBlankState(false, { matchedMistake: 0 }),
        });
        render(state, refs);
        expect(ref.mistakeButton!.hidden).toBe(false);
    });

    it('keeps the ! button hidden for incorrect without a matching mistake', () => {
        const ref = makeBlankRefWithMistake('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(false) });
        render(state, refs);
        expect(ref.mistakeButton!.hidden).toBe(true);
    });

    it('keeps the ! button hidden for correct answers', () => {
        const ref = makeBlankRefWithMistake('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(true) });
        render(state, refs);
        expect(ref.mistakeButton!.hidden).toBe(true);
    });

    it('hides the ! button on transition from matched → no-match', () => {
        const ref = makeBlankRefWithMistake('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const blankState = makeBlankState(false, { matchedMistake: 0 });
        const state = makeState({ 'b1': blankState });
        render(state, refs);
        expect(ref.mistakeButton!.hidden).toBe(false);
        blankState.matchedMistake = null;
        render(state, refs);
        expect(ref.mistakeButton!.hidden).toBe(true);
    });

    it('flips aria-expanded when this blank\'s mistake popover is open', () => {
        const ref = makeBlankRefWithMistake('b1');
        const popover = makePopoverRef();
        const refs = makeRefs(new Map([['b1', ref]]), new Map(), new Map(), popover);
        const state = makeState({
            'b1': makeBlankState(false, { matchedMistake: 0 }),
        });
        render(state, refs);
        expect(ref.mistakeButton!.getAttribute('aria-expanded')).toBe('false');
        state.popover = { kind: 'mistake', blankId: 'b1', x: 10, y: 20 };
        render(state, refs);
        expect(ref.mistakeButton!.getAttribute('aria-expanded')).toBe('true');
    });
});

describe('render — popover', () => {
    it('opens with the active blank hint text and position', () => {
        const ref = makeBlankRefWithHint('b1');
        const popover = makePopoverRef();
        const refs = makeRefs(new Map([['b1', ref]]), new Map(), new Map(), popover);
        const state = makeState({ 'b1': makeBlankState(null) });
        state.popover = { kind: 'hint', blankId: 'b1', x: 40, y: 60 };
        render(state, refs);
        expect(popover.el.hidden).toBe(false);
        expect(popover.titleEl.textContent).toBe('Hint');
        // The body is the cloned template content — rich markup preserved.
        expect(popover.bodyEl.innerHTML).toBe('Try <strong>factoring</strong>.');
        expect(popover.el.dataset.kind).toBe('hint');
        expect(popover.el.style.left).toBe('40px');
        expect(popover.el.style.top).toBe('60px');
        expect(ref.hintButton!.getAttribute('aria-expanded')).toBe('true');
    });

    it('opens with the matched mistake feedback for a mistake popover', () => {
        const ref = makeBlankRefWithMistake('b1');
        const popover = makePopoverRef();
        const refs = makeRefs(new Map([['b1', ref]]), new Map(), new Map(), popover);
        const state = makeState({
            'b1': makeBlankState(false, { matchedMistake: 0 }),
        });
        state.popover = { kind: 'mistake', blankId: 'b1', x: 5, y: 7 };
        render(state, refs);
        expect(popover.el.hidden).toBe(false);
        expect(popover.titleEl.textContent).toBe('Feedback');
        expect(popover.bodyEl.innerHTML).toBe('Targeted feedback.');
        expect(popover.el.dataset.kind).toBe('mistake');
    });

    it('stays closed when state.popover is null', () => {
        const ref = makeBlankRefWithHint('b1');
        const popover = makePopoverRef();
        const refs = makeRefs(new Map([['b1', ref]]), new Map(), new Map(), popover);
        const state = makeState({ 'b1': makeBlankState(null) });
        render(state, refs);
        expect(popover.el.hidden).toBe(true);
        expect(ref.hintButton!.getAttribute('aria-expanded')).toBe('false');
    });

    it('stays closed when the referenced hint text is gone', () => {
        const ref = makeBlankRef('b1'); // hint: null
        const popover = makePopoverRef();
        const refs = makeRefs(new Map([['b1', ref]]), new Map(), new Map(), popover);
        const state = makeState({ 'b1': makeBlankState(null) });
        state.popover = { kind: 'hint', blankId: 'b1', x: 0, y: 0 };
        render(state, refs);
        expect(popover.el.hidden).toBe(true);
    });

    it('stays closed when the matched mistake cleared after edit', () => {
        const ref = makeBlankRefWithMistake('b1');
        const popover = makePopoverRef();
        const refs = makeRefs(new Map([['b1', ref]]), new Map(), new Map(), popover);
        const state = makeState({ 'b1': makeBlankState(null) }); // matchedMistake null
        state.popover = { kind: 'mistake', blankId: 'b1', x: 0, y: 0 };
        render(state, refs);
        expect(popover.el.hidden).toBe(true);
    });

    it('closes the popover when state.popover flips back to null', () => {
        const ref = makeBlankRefWithHint('b1');
        const popover = makePopoverRef();
        const refs = makeRefs(new Map([['b1', ref]]), new Map(), new Map(), popover);
        const state = makeState({ 'b1': makeBlankState(null) });
        state.popover = { kind: 'hint', blankId: 'b1', x: 0, y: 0 };
        render(state, refs);
        expect(popover.el.hidden).toBe(false);
        state.popover = null;
        render(state, refs);
        expect(popover.el.hidden).toBe(true);
        expect(ref.hintButton!.getAttribute('aria-expanded')).toBe('false');
    });

    it('no-ops when the page has no popover markup (refs.popover null)', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(null) });
        state.popover = { kind: 'hint', blankId: 'b1', x: 0, y: 0 };
        expect(() => render(state, refs)).not.toThrow();
    });
});

describe('render — block solution slot', () => {
    it('reveals the solution slot when solutionRevealed=true', () => {
        const blockRef = makeFillInBlankRef('block-1', 'Combine like terms.');
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const state = makeState(
            {},
            { 'block-1': { solutionRevealed: true, confidence: null } },
        );
        render(state, refs);
        expect(blockRef.solutionEl!.hidden).toBe(false);
    });

    it('keeps the solution slot hidden when solutionRevealed=false', () => {
        const blockRef = makeFillInBlankRef('block-1', 'Combine like terms.');
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const state = makeState(
            {},
            { 'block-1': { solutionRevealed: false, confidence: null } },
        );
        render(state, refs);
        expect(blockRef.solutionEl!.hidden).toBe(true);
    });

    it('no-ops on blocks without a solution slot', () => {
        const blockRef = makeFillInBlankRef('block-1', null);
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const state = makeState(
            {},
            { 'block-1': { solutionRevealed: true, confidence: null } },
        );
        expect(() => render(state, refs)).not.toThrow();
    });

    it('transitions hidden → revealed when state flips (matches checkSection)', () => {
        const blockRef = makeFillInBlankRef('block-1', 'Combine like terms.');
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const blockState: BlockState = {
            solutionRevealed: false,
            confidence: null,
        };
        const state = makeState({}, { 'block-1': blockState });
        render(state, refs);
        expect(blockRef.solutionEl!.hidden).toBe(true);
        blockState.solutionRevealed = true;
        render(state, refs);
        expect(blockRef.solutionEl!.hidden).toBe(false);
    });
});

describe('render — confidence reflection', () => {
    it('checks the matching radio when confidence is set', () => {
        const blockRef = makeFillInBlankRef('block-1', null, true);
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const state = makeState(
            {},
            { 'block-1': { solutionRevealed: false, confidence: 'think_so' } },
        );
        render(state, refs);
        expect(blockRef.confidenceRadios[0]!.checked).toBe(false); // unsure
        expect(blockRef.confidenceRadios[1]!.checked).toBe(true);  // think_so
        expect(blockRef.confidenceRadios[2]!.checked).toBe(false); // certain
    });

    it('leaves all radios unchecked when confidence is null', () => {
        const blockRef = makeFillInBlankRef('block-1', null, true);
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const state = makeState(
            {},
            { 'block-1': { solutionRevealed: false, confidence: null } },
        );
        render(state, refs);
        for (const radio of blockRef.confidenceRadios) {
            expect(radio.checked).toBe(false);
        }
    });

    it('transitions checked radio when confidence value changes', () => {
        const blockRef = makeFillInBlankRef('block-1', null, true);
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const blockState: BlockState = {
            solutionRevealed: false,
            confidence: 'unsure',
        };
        const state = makeState({}, { 'block-1': blockState });
        render(state, refs);
        expect(blockRef.confidenceRadios[0]!.checked).toBe(true);
        blockState.confidence = 'certain';
        render(state, refs);
        expect(blockRef.confidenceRadios[0]!.checked).toBe(false);
        expect(blockRef.confidenceRadios[2]!.checked).toBe(true);
    });

    it('no-ops on blocks without a confidence fieldset', () => {
        const blockRef = makeFillInBlankRef('block-1', null, false);
        const refs = makeRefs(
            new Map(),
                              new Map([['block-1', blockRef]]),
        );
        const state = makeState(
            {},
            { 'block-1': { solutionRevealed: false, confidence: 'certain' } },
        );
        expect(() => render(state, refs)).not.toThrow();
    });
});

describe('render — section score', () => {
    it('populates score text with "{score} / {total} correct" on check', () => {
        const sectionRef = makeSectionRefHelper('sec-1', true);
        const refs = makeRefs(
            new Map(),
                              new Map(),
                              new Map([['sec-1', sectionRef]]),
        );
        const state = makeState({}, {}, {
            'sec-1': {
                checked: true,
                locked: false,
                score: 4,
                total: 6,
                checkedAt: '2026-01-01T00:00:00.000Z',
            },
        });
        render(state, refs);
        expect(sectionRef.scoreEl!.textContent).toBe('4 / 6 correct');
        expect(sectionRef.scoreEl!.hidden).toBe(false);
    });

    it('keeps score hidden before first check', () => {
        const sectionRef = makeSectionRefHelper('sec-1', true);
        const refs = makeRefs(
            new Map(),
                              new Map(),
                              new Map([['sec-1', sectionRef]]),
        );
        const state = makeState({}, {}, {
            'sec-1': {
                checked: false,
                locked: false,
                score: 0,
                total: 0,
                checkedAt: null,
            },
        });
        render(state, refs);
        expect(sectionRef.scoreEl!.hidden).toBe(true);
    });

    it('disables the check button when SectionState.locked=true', () => {
        const sectionRef = makeSectionRefHelper('sec-1', true);
        const refs = makeRefs(
            new Map(),
                              new Map(),
                              new Map([['sec-1', sectionRef]]),
        );
        const state = makeState({}, {}, {
            'sec-1': {
                checked: true,
                locked: true,
                score: 1,
                total: 1,
                checkedAt: '2026-01-01T00:00:00.000Z',
            },
        });
        render(state, refs);
        expect(sectionRef.checkButton!.disabled).toBe(true);
    });

    it('leaves the check button enabled in free mode (locked=false)', () => {
        const sectionRef = makeSectionRefHelper('sec-1', true);
        const refs = makeRefs(
            new Map(),
                              new Map(),
                              new Map([['sec-1', sectionRef]]),
        );
        const state = makeState({}, {}, {
            'sec-1': {
                checked: true,
                locked: false,
                score: 1,
                total: 1,
                checkedAt: '2026-01-01T00:00:00.000Z',
            },
        });
        render(state, refs);
        expect(sectionRef.checkButton!.disabled).toBe(false);
    });

    it('no-ops on sections without a check button or score slot', () => {
        const sectionRef = makeSectionRefHelper('sec-1', false);
        const refs = makeRefs(
            new Map(),
                              new Map(),
                              new Map([['sec-1', sectionRef]]),
        );
        const state = makeState({}, {}, {
            'sec-1': {
                checked: true,
                locked: false,
                score: 0,
                total: 0,
                checkedAt: null,
            },
        });
        expect(() => render(state, refs)).not.toThrow();
    });
});

describe('render — locked-mode input freeze', () => {
    it('disables a blank input when its section is locked', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState(
            { 'b1': makeBlankState(true) },
                                {},
                                {
                                    'sec-1': {
                                        checked: true,
                                        locked: true,
                                        score: 1,
                                        total: 1,
                                        checkedAt: null,
                                    },
                                },
        );
        render(state, refs);
        expect(ref.input.disabled).toBe(true);
    });

    it('leaves a blank input enabled when its section is not locked', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState(
            { 'b1': makeBlankState(true) },
                                {},
                                {
                                    'sec-1': {
                                        checked: true,
                                        locked: false,
                                        score: 1,
                                        total: 1,
                                        checkedAt: null,
                                    },
                                },
        );
        render(state, refs);
        expect(ref.input.disabled).toBe(false);
    });

    it('leaves a blank input enabled when no SectionState entry exists', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(true) });
        render(state, refs);
        expect(ref.input.disabled).toBe(false);
    });

    it('transitions disabled → enabled when locked flips (forward compat)', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const sectionState: SectionState = {
            checked: true,
            locked: true,
            score: 1,
            total: 1,
            checkedAt: null,
        };
        const state = makeState(
            { 'b1': makeBlankState(true) },
                                {},
                                { 'sec-1': sectionState },
        );
        render(state, refs);
        expect(ref.input.disabled).toBe(true);
        sectionState.locked = false;
        render(state, refs);
        expect(ref.input.disabled).toBe(false);
    });
});
