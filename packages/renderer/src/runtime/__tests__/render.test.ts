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
// Session 2 scope expands from Session 1's class-only coverage to also
// exercise aria-invalid (screen reader signal), the feedback slot text +
// hidden behavior, and the hint affordance state.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '../render.js';
import type { Refs, BlankRef } from '../refs.js';
import type { RuntimeState, BlankState } from '../state.js';

/** Minimal BlankRef — no hint affordance, no mistake feedback. */
function makeBlankRef(blankId: string): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    const feedbackEl = document.createElement('span');
    feedbackEl.className = 'js-blank-feedback';
    feedbackEl.hidden = true;
    wrapper.appendChild(input);
    wrapper.appendChild(feedbackEl);
    document.body.appendChild(wrapper);
    return {
        input,
        feedbackEl,
        hintButton: null,
        hintTextEl: null,
        answers: ['x'],
        strategy: 'list',
        hint: null,
        mistakeFeedback: [],
        blockId: 'block-1',
        sectionId: 'sec-1',
    };
}

/** BlankRef with hint affordance — for hint-state rendering tests. */
function makeBlankRefWithHint(blankId: string): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    const hintButton = document.createElement('button');
    hintButton.className = 'js-blank-hint';
    hintButton.setAttribute('aria-expanded', 'false');
    const hintTextEl = document.createElement('span');
    hintTextEl.className = 'js-blank-hint-text';
    hintTextEl.hidden = true;
    hintTextEl.textContent = 'Try factoring.';
    const feedbackEl = document.createElement('span');
    feedbackEl.className = 'js-blank-feedback';
    feedbackEl.hidden = true;
    wrapper.appendChild(input);
    wrapper.appendChild(hintButton);
    wrapper.appendChild(hintTextEl);
    wrapper.appendChild(feedbackEl);
    document.body.appendChild(wrapper);
    return {
        input,
        feedbackEl,
        hintButton,
        hintTextEl,
        answers: ['x'],
        strategy: 'list',
        hint: 'Try factoring.',
        mistakeFeedback: [],
        blockId: 'block-1',
        sectionId: 'sec-1',
    };
}

function makeBlankState(
    result: boolean | null,
    overrides: Partial<BlankState> = {},
): BlankState {
    return {
        result,
        matchedMistake: null,
        hintRevealed: false,
        ...overrides,
    };
}

function makeRefs(blanks: Map<string, BlankRef>): Refs {
    return {
        blanks,
        fillInBlanks: new Map(),
        sections: new Map(),
    };
}

function makeState(blankStates: Record<string, BlankState>): RuntimeState {
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        sections: {},
        blanks: blankStates,
        blocks: {},
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

describe('render — feedback slot', () => {
    it('shows mistake-feedback text when matchedMistake is set', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({
            'b1': makeBlankState(false, {
                matchedMistake: 'You forgot the constant.',
            }),
        });
        render(state, refs);
        expect(ref.feedbackEl.textContent).toBe('You forgot the constant.');
        expect(ref.feedbackEl.hidden).toBe(false);
    });

    it('keeps slot hidden for incorrect without a matching mistake entry', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(false) });
        render(state, refs);
        expect(ref.feedbackEl.hidden).toBe(true);
    });

    it('keeps slot hidden for correct answers (no slot clutter)', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(true) });
        render(state, refs);
        expect(ref.feedbackEl.hidden).toBe(true);
    });

    it('hides slot on transition from matched → no-match', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const blankState = makeBlankState(false, {
            matchedMistake: 'First message.',
        });
        const state = makeState({ 'b1': blankState });
        render(state, refs);
        expect(ref.feedbackEl.hidden).toBe(false);
        blankState.matchedMistake = null;
        render(state, refs);
        expect(ref.feedbackEl.hidden).toBe(true);
    });

    it('updates slot text when matchedMistake changes', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const blankState = makeBlankState(false, {
            matchedMistake: 'First.',
        });
        const state = makeState({ 'b1': blankState });
        render(state, refs);
        expect(ref.feedbackEl.textContent).toBe('First.');
        blankState.matchedMistake = 'Second.';
        render(state, refs);
        expect(ref.feedbackEl.textContent).toBe('Second.');
    });
});

describe('render — hint affordance', () => {
    it('reveals hint text and flips aria-expanded when hintRevealed=true', () => {
        const ref = makeBlankRefWithHint('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({
            'b1': makeBlankState(null, { hintRevealed: true }),
        });
        render(state, refs);
        expect(ref.hintButton!.getAttribute('aria-expanded')).toBe('true');
        expect(ref.hintTextEl!.hidden).toBe(false);
    });

    it('keeps hint hidden when hintRevealed=false', () => {
        const ref = makeBlankRefWithHint('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({ 'b1': makeBlankState(null) });
        render(state, refs);
        expect(ref.hintButton!.getAttribute('aria-expanded')).toBe('false');
        expect(ref.hintTextEl!.hidden).toBe(true);
    });

    it('toggles hint back when hintRevealed flips true → false', () => {
        const ref = makeBlankRefWithHint('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const blankState = makeBlankState(null, { hintRevealed: true });
        const state = makeState({ 'b1': blankState });
        render(state, refs);
        blankState.hintRevealed = false;
        render(state, refs);
        expect(ref.hintButton!.getAttribute('aria-expanded')).toBe('false');
        expect(ref.hintTextEl!.hidden).toBe(true);
    });

    it('no-ops on blanks without a hint affordance', () => {
        const ref = makeBlankRef('b1');
        const refs = makeRefs(new Map([['b1', ref]]));
        const state = makeState({
            'b1': makeBlankState(null, { hintRevealed: true }),
        });
        expect(() => render(state, refs)).not.toThrow();
    });
});
