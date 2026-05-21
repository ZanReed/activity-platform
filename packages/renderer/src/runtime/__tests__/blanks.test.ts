/**
 * @vitest-environment jsdom
 */
// =============================================================================
// blanks.test.ts — JSDOM-backed tests for the blank scoring + state layer
// -----------------------------------------------------------------------------
// Post-Session-1 scope: covers the rules unique to blanks.ts after the
// Session 1 migration moved DOM mutation out of this file.
//
//   - trimValue: leading/trailing only, middle whitespace preserved
//   - scoreBlank: empty input returns null (the "unscored" sentinel)
//   - scoreBlankAndUpdateState (was checkBlank): writes to state, no DOM
//
// applyBlankFeedback's class-toggling tests moved to render.test.ts —
// the function itself is gone; that logic now lives in renderBlank
// inside render.ts.
//
// Strategy dispatch (evaluateAnswer + the 'list' strategy + unknown-
// strategy fallback) is covered by strategies.test.ts and not duplicated.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    scoreBlank,
    scoreBlankAndUpdateState,
    trimValue,
} from '../blanks.js';
import type { BlankRef } from '../refs.js';
import type { RuntimeState, BlankState } from '../state.js';

/** Build a minimal BlankRef wired up to real (JSDOM) DOM nodes. */
function buildBlankRef(
    answers: string[],
    value: string = '',
    blankId: string = 'b1',
): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    input.setAttribute('data-blank-answers', answers.join('|'));
    input.value = value;
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
        answers,
        strategy: 'list',
        hint: null,
        mistakeFeedback: [],
        blockId: 'block-1',
        sectionId: 'sec-1',
    };
}

/**
 * Build a minimal RuntimeState with one BlankState entry, for testing the
 * state-write side of scoreBlankAndUpdateState.
 */
function buildStateWithBlank(id: string = 'b1'): RuntimeState {
    const blankState: BlankState = {
        result: null,
        matchedMistake: null,
        hintRevealed: false,
    };
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        sections: {},
        blanks: { [id]: blankState },
        blocks: {},
    };
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('trimValue', () => {
    it('strips leading/trailing whitespace, leaves middle whitespace alone', () => {
        expect(trimValue('  x + 1  ')).toBe('x + 1');
        expect(trimValue('x')).toBe('x');
        expect(trimValue('')).toBe('');
        expect(trimValue('   ')).toBe('');
    });
});

describe('scoreBlank', () => {
    it('returns null for empty input (after trim)', () => {
        const ref = buildBlankRef(['x']);
        expect(scoreBlank(ref, '')).toBeNull();
        expect(scoreBlank(ref, '   ')).toBeNull();
    });

    it('returns true for an exact match', () => {
        const ref = buildBlankRef(['x+1']);
        expect(scoreBlank(ref, 'x+1')).toBe(true);
    });

    it('returns false for a non-match', () => {
        const ref = buildBlankRef(['x+1']);
        expect(scoreBlank(ref, 'x+2')).toBe(false);
    });

    it('trims before comparing', () => {
        const ref = buildBlankRef(['x+1']);
        expect(scoreBlank(ref, '  x+1  ')).toBe(true);
    });

    it('treats acceptableAnswers as equivalent to the canonical answer', () => {
        const ref = buildBlankRef(['x+1', 'x + 1', '1+x']);
        expect(scoreBlank(ref, '1+x')).toBe(true);
        expect(scoreBlank(ref, 'x + 1')).toBe(true);
    });
});

describe('scoreBlankAndUpdateState', () => {
    it('reads ref.input.value, scores, and writes the result to state', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b1');
        const result = scoreBlankAndUpdateState(state, 'b1', ref);
        expect(result).toBe(true);
        expect(state.blanks['b1']?.result).toBe(true);
    });

    it('writes null result and returns null when input is empty', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], '', 'b1');
        const result = scoreBlankAndUpdateState(state, 'b1', ref);
        expect(result).toBeNull();
        expect(state.blanks['b1']?.result).toBeNull();
    });

    it('writes false result when answer is incorrect', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'y', 'b1');
        const result = scoreBlankAndUpdateState(state, 'b1', ref);
        expect(result).toBe(false);
        expect(state.blanks['b1']?.result).toBe(false);
    });

    it('does not touch DOM classes — render is responsible for that', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b1');
        scoreBlankAndUpdateState(state, 'b1', ref);
        expect(ref.input.classList.contains('correct')).toBe(false);
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });

    it('silently no-ops the state write when state.blanks[id] is absent', () => {
        // Defense-in-depth: if refs and state ever disagree, scoring still
        // returns the result without throwing.
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b2');
        const result = scoreBlankAndUpdateState(state, 'b2', ref);
        expect(result).toBe(true);
        expect(state.blanks['b2']).toBeUndefined();
    });

    it('overwrites a previous result on re-scoring (transitions are clean)', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b1');
        scoreBlankAndUpdateState(state, 'b1', ref);
        expect(state.blanks['b1']?.result).toBe(true);
        // Student edits to a wrong answer and blurs again
        ref.input.value = 'y';
        scoreBlankAndUpdateState(state, 'b1', ref);
        expect(state.blanks['b1']?.result).toBe(false);
    });
});
