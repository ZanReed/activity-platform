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

import { evaluateAnswer, parseNumericValue } from '../strategies.js';
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

describe('parseNumericValue', () => {
    it('parses plain decimals with optional sign and bare leading dot', () => {
        expect(parseNumericValue('3')).toBe(3);
        expect(parseNumericValue('-2.5')).toBe(-2.5);
        expect(parseNumericValue('.75')).toBe(0.75);
        expect(parseNumericValue('+4')).toBe(4);
    });

    it('parses scientific notation', () => {
        expect(parseNumericValue('1e3')).toBe(1000);
        expect(parseNumericValue('2.5E-2')).toBe(0.025);
    });

    it('parses fractions', () => {
        expect(parseNumericValue('3/4')).toBe(0.75);
        expect(parseNumericValue('-3/4')).toBe(-0.75);
        expect(parseNumericValue('1.5/3')).toBe(0.5);
    });

    it('parses mixed numbers', () => {
        expect(parseNumericValue('1 1/2')).toBe(1.5);
        expect(parseNumericValue('-2 3/4')).toBe(-2.75);
    });

    it('strips comma separators and a leading dollar sign', () => {
        expect(parseNumericValue('1,234.5')).toBe(1234.5);
        expect(parseNumericValue('$3.50')).toBe(3.5);
        expect(parseNumericValue('$ 1,000')).toBe(1000);
    });

    it('returns null for non-numbers, empty strings, and zero denominators', () => {
        expect(parseNumericValue('x + 1')).toBeNull();
        expect(parseNumericValue('')).toBeNull();
        expect(parseNumericValue('   ')).toBeNull();
        expect(parseNumericValue('1/0')).toBeNull();
        expect(parseNumericValue('no solution')).toBeNull();
        expect(parseNumericValue('3..5')).toBeNull();
    });
});

describe('evaluateAnswer — numeric strategy', () => {
    function numericBlank(answers: string, tolerance?: string): Element {
        const attrs: Record<string, string> = {
            'data-blank-strategy': 'numeric',
            'data-blank-answers': answers,
        };
        if (tolerance !== undefined) attrs['data-blank-tolerance'] = tolerance;
        return fakeBlank(attrs);
    }

    it('accepts every equivalent numeric form of the key', () => {
        const blank = numericBlank('1/2');
        expect(evaluateAnswer(blank, '0.5')).toBe(true);
        expect(evaluateAnswer(blank, '.5')).toBe(true);
        expect(evaluateAnswer(blank, '1/2')).toBe(true);
        expect(evaluateAnswer(blank, '2/4')).toBe(true);
        expect(evaluateAnswer(blank, '0.51')).toBe(false);
    });

    it('accepts within tolerance, rejects outside it', () => {
        const blank = numericBlank('3.14', '0.01');
        expect(evaluateAnswer(blank, '3.14159')).toBe(true);
        expect(evaluateAnswer(blank, '3.13')).toBe(true);
        expect(evaluateAnswer(blank, '3.12')).toBe(false);
    });

    it('exact tolerance boundary counts (with float-noise epsilon)', () => {
        const blank = numericBlank('0.3');
        // 0.1 + 0.2 !== 0.3 in floats; the epsilon must absorb it.
        expect(evaluateAnswer(blank, '0.30000000000000004')).toBe(true);
    });

    it('handles mixed numbers and formatted input', () => {
        const blank = numericBlank('1.5');
        expect(evaluateAnswer(blank, '1 1/2')).toBe(true);
        expect(evaluateAnswer(blank, '3/2')).toBe(true);
        const money = numericBlank('1234.5');
        expect(evaluateAnswer(money, '$1,234.50')).toBe(true);
    });

    it('falls back to exact string match for a non-numeric key entry', () => {
        // A key like "no solution" alongside a numeric answer still scores.
        const blank = numericBlank('4|no solution');
        expect(evaluateAnswer(blank, 'no solution')).toBe(true);
        expect(evaluateAnswer(blank, '4.0')).toBe(true);
        expect(evaluateAnswer(blank, 'anything else')).toBe(false);
    });

    it('rejects non-numeric input against a numeric key', () => {
        const blank = numericBlank('4');
        expect(evaluateAnswer(blank, 'four')).toBe(false);
    });

    it('ignores a malformed tolerance attribute (treats as exact)', () => {
        const blank = numericBlank('4', 'abc');
        expect(evaluateAnswer(blank, '4')).toBe(true);
        expect(evaluateAnswer(blank, '4.1')).toBe(false);
    });

    it('negative numbers compare correctly', () => {
        const blank = numericBlank('-3/4');
        expect(evaluateAnswer(blank, '-0.75')).toBe(true);
        expect(evaluateAnswer(blank, '0.75')).toBe(false);
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
