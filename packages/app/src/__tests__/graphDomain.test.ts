import { describe, expect, it } from 'vitest';
import { parseGraphFormula } from '@activity/graph-kit';
import { toCurveDomain, formatCurveDomain } from '../lib/graphDomain';

describe('toCurveDomain', () => {
    it('maps minClosed/maxClosed booleans to open/closed style words', () => {
        expect(toCurveDomain({ min: 0, minClosed: false })).toEqual({
            min: 0,
            minStyle: 'open',
        });
        expect(toCurveDomain({ min: -2, minClosed: true, max: 5, maxClosed: false })).toEqual({
            min: -2,
            minStyle: 'closed',
            max: 5,
            maxStyle: 'open',
        });
        expect(toCurveDomain({ max: 5, maxClosed: true })).toEqual({
            max: 5,
            maxStyle: 'closed',
        });
    });
});

describe('formatCurveDomain', () => {
    it('renders each bound back to a `for …` clause', () => {
        expect(formatCurveDomain({ min: 0, minStyle: 'open' })).toBe(' for x > 0');
        expect(formatCurveDomain({ min: 0, minStyle: 'closed' })).toBe(' for x >= 0');
        expect(formatCurveDomain({ max: 5, maxStyle: 'open' })).toBe(' for x < 5');
        expect(formatCurveDomain({ min: -2, minStyle: 'closed', max: 5, maxStyle: 'open' })).toBe(
            ' for -2 <= x < 5',
        );
    });

    it('defaults an absent style to closed (matching the renderers)', () => {
        expect(formatCurveDomain({ min: 3 })).toBe(' for x >= 3');
        expect(formatCurveDomain({ max: 3 })).toBe(' for x <= 3');
    });

    it('is empty for no domain', () => {
        expect(formatCurveDomain(undefined)).toBe('');
        expect(formatCurveDomain(null)).toBe('');
        expect(formatCurveDomain({})).toBe('');
    });
});

describe('round trip through the parser', () => {
    // The drawable editor formats a curve's domain to text, the user edits, and
    // parseGraphFormula → toCurveDomain turns it back. Format → parse → convert
    // must land on the same domain shape.
    for (const domain of [
        { min: 0, minStyle: 'open' as const },
        { min: 0, minStyle: 'closed' as const },
        { max: 5, maxStyle: 'open' as const },
        { min: -2, minStyle: 'closed' as const, max: 5, maxStyle: 'open' as const },
    ]) {
        it(`round-trips ${JSON.stringify(domain)}`, () => {
            const text = `y = x^2${formatCurveDomain(domain)}`;
            const parsed = parseGraphFormula(text);
            expect(parsed.kind).toBe('function');
            if (parsed.kind !== 'function') return;
            expect(parsed.domain).toBeDefined();
            expect(toCurveDomain(parsed.domain!)).toEqual(domain);
        });
    }
});
