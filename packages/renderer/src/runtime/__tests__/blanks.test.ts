/**
 * @vitest-environment jsdom
 */
// =============================================================================
// blanks.test.ts — JSDOM-backed tests for the blank scoring + feedback layer
// -----------------------------------------------------------------------------
// Covers the rules unique to blanks.ts:
//   - trimValue: leading/trailing only, middle whitespace preserved
//   - scoreBlank: empty input returns null (the "unscored" sentinel)
//   - applyBlankFeedback: class toggling rules, including correct→incorrect
//     transitions that mustn't leave stale classes behind
//   - checkBlank: composition of scoreBlank + applyBlankFeedback in one call
//
// Strategy dispatch (evaluateAnswer + the 'list' strategy + unknown-strategy
// fallback) is covered by strategies.test.ts and not duplicated here.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    scoreBlank,
    applyBlankFeedback,
    checkBlank,
    trimValue,
} from '../blanks.js';
import type { BlankRef } from '../refs.js';

/**
 * Build a minimal BlankRef wired up to real (JSDOM) DOM nodes. Strategy
 * 'list' is hard-coded; tests that exercise other strategies belong in
 * strategies.test.ts.
 */
function buildBlankRef(answers: string[], value: string = ''): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', 'b1');
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

describe('applyBlankFeedback', () => {
    it('adds correct class when result is true', () => {
        const ref = buildBlankRef(['x']);
        applyBlankFeedback(ref, true);
        expect(ref.input.classList.contains('correct')).toBe(true);
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });

    it('adds incorrect class when result is false', () => {
        const ref = buildBlankRef(['x']);
        applyBlankFeedback(ref, false);
        expect(ref.input.classList.contains('incorrect')).toBe(true);
        expect(ref.input.classList.contains('correct')).toBe(false);
    });

    it('removes both classes when result is null (cleared)', () => {
        const ref = buildBlankRef(['x']);
        ref.input.classList.add('correct');
        applyBlankFeedback(ref, null);
        expect(ref.input.classList.contains('correct')).toBe(false);
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });

    it('transitions correct → incorrect without leaving a stale correct class', () => {
        const ref = buildBlankRef(['x']);
        applyBlankFeedback(ref, true);
        applyBlankFeedback(ref, false);
        expect(ref.input.classList.contains('correct')).toBe(false);
        expect(ref.input.classList.contains('incorrect')).toBe(true);
    });
});

describe('checkBlank', () => {
    it('reads ref.input.value, scores, and applies feedback in one call', () => {
        const ref = buildBlankRef(['x'], 'x');
        const result = checkBlank(ref);
        expect(result).toBe(true);
        expect(ref.input.classList.contains('correct')).toBe(true);
    });

    it('returns null and clears stale classes when the input is empty', () => {
        const ref = buildBlankRef(['x'], '');
        ref.input.classList.add('incorrect');
        const result = checkBlank(ref);
        expect(result).toBeNull();
        expect(ref.input.classList.contains('incorrect')).toBe(false);
    });
});
