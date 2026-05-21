// =============================================================================
// strategies.test.ts — Pure-function tests for the runtime
// -----------------------------------------------------------------------------
// First test file in the runtime suite. Scope is deliberately narrow: the pure
// functions that emerged from the Stage 11 module split — evaluateAnswer +
// the list strategy + the unknown-strategy fallback path, and the computeScore
// arithmetic from submission.ts. JSDOM-backed tests for wireBlanks, gather-
// Responses, and submit() are Stages 12–14 work (RUNTIME.md "Testing").
//
// evaluateAnswer's argument is typed as `Element`, but it only ever calls
// `getAttribute` on it. Rather than spin up JSDOM (slow, more dependencies, a
// different test category), we pass a minimal fake that implements just the
// one method and cast through `unknown`. The cast is honest about what's
// happening: this isn't a real Element, it's the shape evaluateAnswer needs.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';

import { evaluateAnswer } from '../strategies.js';
import { computeScore } from '../submission.js';

/** Build a minimal Element-like fake with the given data-* attributes. */
function fakeBlank(attrs: Record<string, string>): Element {
    return {
        getAttribute(name: string): string | null {
            // noUncheckedIndexedAccess: attrs[name] is string | undefined. Normalize
            // an absent key (undefined) to null so the shape matches getAttribute.
            const value = attrs[name];
            return value === undefined ? null : value;
        },
    } as unknown as Element;
}

describe('evaluateAnswer — list strategy', () => {
    it('accepts the canonical answer', () => {
        const blank = fakeBlank({ 'data-blank-answers': 'x^2' });
        expect(evaluateAnswer(blank, 'x^2')).toBe(true);
    });

    it('rejects a wrong answer', () => {
        const blank = fakeBlank({ 'data-blank-answers': 'x^2' });
        expect(evaluateAnswer(blank, 'x^3')).toBe(false);
    });

    it('accepts any of multiple pipe-separated answers', () => {
        const blank = fakeBlank({ 'data-blank-answers': '1/2|0.5|.5' });
        expect(evaluateAnswer(blank, '1/2')).toBe(true);
        expect(evaluateAnswer(blank, '0.5')).toBe(true);
        expect(evaluateAnswer(blank, '.5')).toBe(true);
    });

    it('is case-sensitive (deliberate, matches teacher expectations for math)', () => {
        const blank = fakeBlank({ 'data-blank-answers': 'X' });
        expect(evaluateAnswer(blank, 'X')).toBe(true);
        expect(evaluateAnswer(blank, 'x')).toBe(false);
    });

    it('defaults to the list strategy when no data-blank-strategy is set', () => {
        // No data-blank-strategy attribute — should still use list.
        const blank = fakeBlank({ 'data-blank-answers': 'pi' });
        expect(evaluateAnswer(blank, 'pi')).toBe(true);
    });

    it('rejects when data-blank-answers is missing', () => {
        // No answers attribute means an empty answer list; nothing matches.
        const blank = fakeBlank({});
        expect(evaluateAnswer(blank, 'anything')).toBe(false);
    });
});

describe('evaluateAnswer — unknown-strategy fallback', () => {
    // Spy is created inline in each test (rather than shared via beforeEach/
    // afterEach with a typed `let` variable) — simpler, no type juggling for
    // Vitest's MockInstance generic, and each test cleans up its own spy.

    it('warns and falls back to list comparison on an unknown strategy', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const blank = fakeBlank({
                'data-blank-strategy': 'expression', // Phase 2.5, not yet implemented
                'data-blank-answers': 'x+1',
            });
            expect(evaluateAnswer(blank, 'x+1')).toBe(true);
            expect(warnSpy).toHaveBeenCalledOnce();
            expect(warnSpy.mock.calls[0]?.[0]).toMatch(/Unknown blank strategy/);
        } finally {
            warnSpy.mockRestore();
        }
    });

    it('the fallback path still rejects a wrong answer', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const blank = fakeBlank({
                'data-blank-strategy': 'nonsense',
                'data-blank-answers': 'x+1',
            });
            expect(evaluateAnswer(blank, 'x+2')).toBe(false);
        } finally {
            warnSpy.mockRestore();
        }
    });
});

describe('computeScore', () => {
    it('returns 0 when no blanks were scored (avoid NaN from 0/0)', () => {
        expect(computeScore(0, 0)).toBe(0);
    });

    it('returns a fraction in [0, 1]', () => {
        expect(computeScore(3, 4)).toBe(0.75);
        expect(computeScore(0, 5)).toBe(0);
        expect(computeScore(5, 5)).toBe(1);
    });

    it('handles a single-blank activity', () => {
        expect(computeScore(1, 1)).toBe(1);
        expect(computeScore(0, 1)).toBe(0);
    });
});
