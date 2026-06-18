/**
 * @vitest-environment jsdom
 */
// =============================================================================
// blanks.test.ts — JSDOM-backed tests for the blank scoring + state layer
// -----------------------------------------------------------------------------
// Post-Session-2 scope:
//   - trimValue: leading/trailing only, middle whitespace preserved
//   - scoreBlank: empty input returns null (the "unscored" sentinel)
//   - matchMistakeFeedback: case-insensitive match, trim, first wins
//   - scoreBlankAndUpdateState: writes result + matchedMistake to state
//   - clearBlankState: clears stale state, returns change indicator
//
// applyBlankFeedback's class-toggling tests live in render.test.ts —
// the function itself is gone post-Session-1; that logic now lives in
// renderBlank inside render.ts.
//
// Strategy dispatch (evaluateAnswer + the 'list' strategy + unknown-
// strategy fallback) is covered by strategies.test.ts and not duplicated.
//
// wireBlanks and wireHints are wiring-only — their event-handler bodies
// just call the pure functions tested here. Integration coverage will
// arrive when end-to-end JSDOM tests land in Stage 14 alongside submit.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    scoreBlank,
    scoreBlankAndUpdateState,
    matchMistakeFeedback,
    clearBlankState,
    trimValue,
    wireBlanks,
} from '../blanks.js';
import type { BlankRef, Refs } from '../refs.js';
import type { RuntimeState, BlankState } from '../state.js';

/**
 * Build a minimal BlankRef wired up to real (JSDOM) DOM nodes. mistakeFeedback
 * is authored as {match, feedback} pairs for test ergonomics; the helper
 * materializes each as a <template> sibling (matching the server output) and
 * builds the ref's {match, content} array from those template elements.
 */
function buildBlankRef(
    answers: string[],
    value: string = '',
    blankId: string = 'b1',
    mistakeFeedback: Array<{ match: string; feedback: string }> = [],
): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    input.setAttribute('data-blank-answers', answers.join('|'));
    input.value = value;
    wrapper.appendChild(input);
    const mistakeRefs = mistakeFeedback.map((entry) => {
        const tpl = document.createElement('template');
        tpl.className = 'js-blank-mistake-content';
        tpl.setAttribute('data-match', entry.match);
        tpl.innerHTML = entry.feedback;
        wrapper.appendChild(tpl);
        return { match: entry.match, content: tpl };
    });
    document.body.appendChild(wrapper);
    return {
        input,
        hintButton: null,
        mistakeButton: null,
        answers,
        strategy: 'list',
        hintContent: null,
        mistakeFeedback: mistakeRefs,
        blockId: 'block-1',
        sectionId: 'sec-1',
        groupId: null,
    };
}

/**
 * Build a minimal RuntimeState with one BlankState entry, for testing the
 * state-write side of scoreBlankAndUpdateState and clearBlankState.
 */
function buildStateWithBlank(id: string = 'b1'): RuntimeState {
    const blankState: BlankState = {
        result: null,
        matchedMistake: null,
    };
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        popover: null,
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

describe('matchMistakeFeedback', () => {
    it('returns the matched entry index for an exact match', () => {
        const ref = buildBlankRef(['x+3'], '', 'b1', [
            { match: '2x', feedback: 'Did you forget the constant?' },
        ]);
        expect(matchMistakeFeedback(ref, '2x')).toBe(0);
    });

    it('returns null when no entries match', () => {
        const ref = buildBlankRef(['x+3'], '', 'b1', [
            { match: '2x', feedback: 'Did you forget the constant?' },
        ]);
        expect(matchMistakeFeedback(ref, '3x')).toBeNull();
    });

    it('trims typed before comparing', () => {
        const ref = buildBlankRef(['x+3'], '', 'b1', [
            { match: '2x', feedback: 'Did you forget the constant?' },
        ]);
        expect(matchMistakeFeedback(ref, '  2x  ')).toBe(0);
    });

    it('is case-insensitive (a student shouldnt lose targeted help over case)', () => {
        const ref = buildBlankRef(['x+3'], '', 'b1', [
            { match: 'slope', feedback: 'Mind the slope.' },
        ]);
        expect(matchMistakeFeedback(ref, 'Slope')).toBe(0);
        expect(matchMistakeFeedback(ref, 'SLOPE')).toBe(0);
        expect(matchMistakeFeedback(ref, 'slope')).toBe(0);
    });

    it('returns the first matching index when multiple entries could apply', () => {
        const ref = buildBlankRef(['x+3'], '', 'b1', [
            { match: '2x', feedback: 'First.' },
            { match: '2x', feedback: 'Second.' },
        ]);
        expect(matchMistakeFeedback(ref, '2x')).toBe(0);
    });

    it('returns null for empty typed value, even with an empty-match entry', () => {
        // Empty typed values are "unscored," not a specific kind of wrong.
        const ref = buildBlankRef(['x+3'], '', 'b1', [
            { match: '', feedback: 'Empty entry.' },
        ]);
        expect(matchMistakeFeedback(ref, '')).toBeNull();
        expect(matchMistakeFeedback(ref, '   ')).toBeNull();
    });

    it('returns null when the mistakeFeedback array is empty', () => {
        const ref = buildBlankRef(['x+3'], '', 'b1', []);
        expect(matchMistakeFeedback(ref, '2x')).toBeNull();
    });
});

describe('scoreBlankAndUpdateState', () => {
    it('writes a true result for a correct answer; clears matchedMistake', () => {
        const state = buildStateWithBlank('b1');
        state.blanks['b1']!.matchedMistake = 0;
    const ref = buildBlankRef(['x'], 'x', 'b1', [
        { match: 'y', feedback: "shouldn't surface" },
    ]);
    const result = scoreBlankAndUpdateState(state, 'b1', ref);
    expect(result).toBe(true);
    expect(state.blanks['b1']?.result).toBe(true);
    expect(state.blanks['b1']?.matchedMistake).toBeNull();
    });

    it('writes a false result + matched mistake index when one matches', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x+3'], '2x', 'b1', [
            { match: 'foo', feedback: 'Not this one.' },
            { match: '2x', feedback: 'Did you forget the constant?' },
        ]);
        const result = scoreBlankAndUpdateState(state, 'b1', ref);
        expect(result).toBe(false);
        expect(state.blanks['b1']?.result).toBe(false);
        expect(state.blanks['b1']?.matchedMistake).toBe(1);
    });

    it('writes a false result with null matchedMistake when no entry matches', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x+3'], 'wrong', 'b1', [
            { match: '2x', feedback: 'Specific mistake.' },
        ]);
        scoreBlankAndUpdateState(state, 'b1', ref);
        expect(state.blanks['b1']?.result).toBe(false);
        expect(state.blanks['b1']?.matchedMistake).toBeNull();
    });

    it('writes a null result and null matchedMistake when input is empty', () => {
        const state = buildStateWithBlank('b1');
        state.blanks['b1']!.matchedMistake = 0;
        const ref = buildBlankRef(['x'], '', 'b1');
        const result = scoreBlankAndUpdateState(state, 'b1', ref);
        expect(result).toBeNull();
        expect(state.blanks['b1']?.result).toBeNull();
        expect(state.blanks['b1']?.matchedMistake).toBeNull();
    });

    it('does not touch DOM classes — render is responsible for that', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b1');
        scoreBlankAndUpdateState(state, 'b1', ref);
        expect(ref.input.classList.contains('correct')).toBe(false);
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });

    it('silently no-ops the state write when state.blanks[id] is absent', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b2');
        const result = scoreBlankAndUpdateState(state, 'b2', ref);
        expect(result).toBe(true);
        expect(state.blanks['b2']).toBeUndefined();
    });
});

describe('clearBlankState', () => {
    it('clears result and matchedMistake when either is set', () => {
        const state = buildStateWithBlank('b1');
        state.blanks['b1']!.result = false;
        state.blanks['b1']!.matchedMistake = 0;
        const changed = clearBlankState(state, 'b1');
        expect(changed).toBe(true);
        expect(state.blanks['b1']?.result).toBeNull();
        expect(state.blanks['b1']?.matchedMistake).toBeNull();
    });

    it('returns false when both are already null (perf optimization)', () => {
        const state = buildStateWithBlank('b1');
        const changed = clearBlankState(state, 'b1');
        expect(changed).toBe(false);
    });

    it('returns false when state.blanks[id] is absent', () => {
        const state = buildStateWithBlank('b1');
        const changed = clearBlankState(state, 'unknown');
        expect(changed).toBe(false);
    });

    it('returns true even when only matchedMistake was set (result already null)', () => {
        // Edge case: post-edit-clear, render's already null'd the result; but
        // matchedMistake might still linger from an earlier scoring pass if
        // some future code path forgets to clear it. Keep clear robust.
        const state = buildStateWithBlank('b1');
        state.blanks['b1']!.matchedMistake = 2;
        const changed = clearBlankState(state, 'b1');
        expect(changed).toBe(true);
        expect(state.blanks['b1']?.matchedMistake).toBeNull();
    });
});

describe('wireBlanks answerFeedback gating', () => {
    /** Wrap a single BlankRef into a Refs bundle keyed by its blank id. */
    function buildRefs(id: string, ref: BlankRef): Refs {
        return {
            blanks: new Map([[id, ref]]),
            fillInBlanks: new Map(),
            sections: new Map(),
            popover: null,
        };
    }

    it("scores on blur in 'immediate' mode (self-check)", () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b1');
        let updates = 0;
        wireBlanks('immediate', state, buildRefs('b1', ref), () => {
            updates++;
        });
        ref.input.dispatchEvent(new Event('blur'));
        expect(state.blanks['b1']?.result).toBe(true);
        expect(updates).toBe(1);
    });

    it("does NOT score on blur in 'on_check' mode (correctness stays hidden)", () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b1');
        let updates = 0;
        wireBlanks('on_check', state, buildRefs('b1', ref), () => {
            updates++;
        });
        ref.input.dispatchEvent(new Event('blur'));
        expect(state.blanks['b1']?.result).toBeNull();
        expect(updates).toBe(0);
    });

    it("clears stale state on input (edit-to-clear) in 'on_check' mode too", () => {
        // After a section check sets a result, editing must still clear it.
        const state = buildStateWithBlank('b1');
        state.blanks['b1']!.result = false;
        const ref = buildBlankRef(['x'], 'x', 'b1');
        let updates = 0;
        wireBlanks('on_check', state, buildRefs('b1', ref), () => {
            updates++;
        });
        ref.input.dispatchEvent(new Event('input'));
        expect(state.blanks['b1']?.result).toBeNull();
        expect(updates).toBe(1);
    });

    it('input on already-clean state does not fire onUpdate (perf)', () => {
        const state = buildStateWithBlank('b1');
        const ref = buildBlankRef(['x'], 'x', 'b1');
        let updates = 0;
        wireBlanks('immediate', state, buildRefs('b1', ref), () => {
            updates++;
        });
        ref.input.dispatchEvent(new Event('input'));
        expect(updates).toBe(0);
    });
});
