/**
 * @vitest-environment jsdom
 */
// =============================================================================
// render.test.ts — JSDOM-backed tests for the state → DOM renderer
// -----------------------------------------------------------------------------
// render() is the only DOM mutator in the runtime after init. The tests
// here exercise the state→DOM mapping by constructing a state + a minimal
// DOM fragment that mirrors what the renderer emits, calling render(),
// and asserting the resulting DOM state.
//
// Session 1 scope: per-blank correct/incorrect class rendering. The
// "idempotence" property (calling render twice with unchanged state
// produces no observable diff) is exercised by snapshotting class state
// before and after a second call — overkill mutation observers are
// reserved for Session 2 when render does enough work to make them useful.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '../render.js';
import type { Refs, BlankRef } from '../refs.js';
import type { RuntimeState, BlankState } from '../state.js';

function makeBlankRef(blankId: string): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    const feedbackEl = document.createElement('span');
    feedbackEl.className = 'js-blank-feedback';
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

function makeBlankState(result: boolean | null): BlankState {
    return { result, matchedMistake: null, hintRevealed: false };
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

describe('render — blanks', () => {
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
        ref.input.classList.add('correct'); // simulate a prior render
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
        expect(ref.input.classList.contains('correct')).toBe(true);
        // Mutate state in place — the same state object now reflects the
        // student typing a different answer and re-blurring.
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
        const state = makeState({}); // no entry for b1
        expect(() => render(state, refs)).not.toThrow();
        expect(ref.input.classList.contains('correct')).toBe(false);
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });
});
