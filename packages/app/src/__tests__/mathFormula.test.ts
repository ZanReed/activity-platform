// =============================================================================
// mathFormula.test.ts — canonical ASCII ⇄ LaTeX seam for math-mode input
// -----------------------------------------------------------------------------
// The invariant that matters: for every canonical string the formatters emit,
// seeding a math-field (formulaToLatex) and reading it back out (MathLive's
// ascii-math serialization + mathFieldAsciiToFormula) must reproduce the same
// parse. convertLatexToAsciiMath is the same serializer the live field uses
// for getValue('ascii-math'), so the round trip here is the real one.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { convertLatexToAsciiMath } from 'mathlive';
import { parseGraphFormula, parseRaySegment, parsePointList } from '@activity/graph-kit';
import { formulaToLatex, mathFieldAsciiToFormula } from '../lib/mathFormula';

// Seed → serialize → clean: what a teacher sees committed from math mode.
const roundTrip = (canonical: string): string =>
    mathFieldAsciiToFormula(convertLatexToAsciiMath(formulaToLatex(canonical)));

describe('formulaToLatex — display quality', () => {
    it('renders powers and operators as LaTeX', () => {
        expect(formulaToLatex('y = x^2 - 4')).toBe('y=x^{2}-4');
        expect(formulaToLatex('y <= x^2')).toBe('y\\le x^{2}');
    });

    it('renders a domain clause with an upright for, not the product x·f·o·r', () => {
        expect(formulaToLatex('y = 2x for x >= 0')).toBe('y=2x\\;\\mathrm{for}\\;x\\ge 0');
    });
});

describe('math-mode round trip — every canonical family reparses identically', () => {
    const equations = [
        ['y = 2x + 3', { family: 'linear', slope: 2, intercept: 3 }],
        ['y = x^2 - 4', { family: 'quadratic' }],
        ['y = 2*3^x', { family: 'exponential' }],
        ['y = 1 + 2ln(x)', { family: 'logarithmic' }],
        ['x = 4', { family: 'vertical', x: 4 }],
        ['y = -0.5x + 2.25', { family: 'linear', slope: -0.5, intercept: 2.25 }],
    ] as const;

    it.each(equations)('%s', (canonical, model) => {
        const parsed = parseGraphFormula(roundTrip(canonical));
        expect(parsed.kind).toBe('function');
        if (parsed.kind === 'function') expect(parsed.model).toMatchObject(model);
    });

    it('inequality with shade + strictness', () => {
        const parsed = parseGraphFormula(roundTrip('y > 2x + 1'));
        expect(parsed).toMatchObject({
            kind: 'inequality',
            strict: true,
            side: 'above',
            boundary: { family: 'linear', slope: 2, intercept: 1 },
        });
    });

    it('domain clause survives the upright-for rendering', () => {
        const parsed = parseGraphFormula(roundTrip('y = 2x for x >= 0'));
        expect(parsed).toMatchObject({
            kind: 'function',
            domain: { min: 0, minClosed: true },
        });
    });

    it('point lists', () => {
        const parsed = parseGraphFormula(roundTrip('(2, 3), (4, -1)'));
        expect(parsed).toEqual({ kind: 'points', points: [[2, 3], [4, -1]] });
    });

    it('two bare points (math-mode ray/segment input) parse as a point list', () => {
        expect(parsePointList(roundTrip('(1, 2), (3, 4)'))).toEqual([[1, 2], [3, 4]]);
    });
});

describe('mathFieldAsciiToFormula — quoted \\text groups', () => {
    it('blanks quotes so a \\text{for} clause still parses', () => {
        const parsed = parseGraphFormula(mathFieldAsciiToFormula('y=2x "for"  x>=0'));
        expect(parsed).toMatchObject({ kind: 'function', domain: { min: 0 } });
    });
});

describe('ray/segment text syntax is untouched by the cleanup', () => {
    it('parseRaySegment still reads the command form', () => {
        const parsed = parseRaySegment(mathFieldAsciiToFormula('ray (1, 2) through (3, 4) open'));
        expect(parsed).toMatchObject({ kind: 'ray', fromStyle: 'open' });
    });
});
