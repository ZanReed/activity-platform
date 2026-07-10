// =============================================================================
// drawableFormula.test.ts — the curve row's formula → drawable mapping
// -----------------------------------------------------------------------------
// curveFromFormula is the pure core of the DrawableListEditor curve row
// (calculator-parity batch): inequalities map to shade + strict→dashed, plain
// equations CLEAR a prior shade, and domains follow the formula text. The
// display round trip (formatInequality) is covered kit-side in formula.test.ts.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { parseGraphFormula } from '@activity/graph-kit';
import type { ParsedFormula } from '@activity/graph-kit';
import { curveFromFormula } from '../editor/components/drawableFormulaLogic';
import type { DrawableAttr } from '../editor/extensions/InteractiveGraph';

type Curve = Extract<DrawableAttr, { kind: 'curve' }>;

const LINE: Curve = {
    kind: 'curve',
    model: { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 },
};

const parsed = (
    src: string,
): Extract<ParsedFormula, { kind: 'function' | 'inequality' }> => {
    const p = parseGraphFormula(src);
    if (p.kind !== 'function' && p.kind !== 'inequality') {
        throw new Error(`unexpected parse for ${src}: ${p.kind}`);
    }
    return p;
};

describe('curveFromFormula — inequalities', () => {
    it('maps a strict inequality to shade + dashed boundary', () => {
        const out = curveFromFormula(LINE, parsed('y > 2x + 1'));
        expect(out.shade).toBe('above');
        expect(out.style).toBe('dashed');
        expect(out.model).toMatchObject({ family: 'linear', slope: 2, intercept: 1 });
    });

    it('maps an inclusive inequality to shade + solid boundary', () => {
        const out = curveFromFormula(LINE, parsed('y <= x^2'));
        expect(out.shade).toBe('below');
        expect(out.style).toBeUndefined();
        expect(out.model.family).toBe('quadratic');
    });

    it('drops a stale dashed style when the inequality is inclusive', () => {
        const out = curveFromFormula({ ...LINE, style: 'dashed' }, parsed('y >= x'));
        expect(out.style).toBeUndefined();
    });

    it('carries a domain clause through toCurveDomain', () => {
        const out = curveFromFormula(LINE, parsed('y > 2x for x >= 0'));
        expect(out.domain).toEqual({ min: 0, minStyle: 'closed' });
    });

    it('maps a vertical inequality to a vertical boundary + left/right shade', () => {
        const out = curveFromFormula(LINE, parsed('x < 3'));
        expect(out.model).toMatchObject({ family: 'vertical', x: 3 });
        expect(out.shade).toBe('left');
        expect(out.style).toBe('dashed');
    });
});

describe('curveFromFormula — equations', () => {
    it('CLEARS a prior shade — the formula text is the full statement of intent', () => {
        const shaded: Curve = { ...LINE, shade: 'above', style: 'dashed' };
        const out = curveFromFormula(shaded, parsed('y = 3x - 2'));
        expect(out.shade).toBeUndefined();
        expect(out.style).toBe('dashed'); // style is its own checkbox — survives
    });

    it('preserves arrows on every edit', () => {
        const out = curveFromFormula({ ...LINE, arrows: false }, parsed('y > x'));
        expect(out.arrows).toBe(false);
    });

    it('clears a prior domain when the new formula has no clause', () => {
        const restricted: Curve = { ...LINE, domain: { min: 0, minStyle: 'closed' } };
        const out = curveFromFormula(restricted, parsed('y = 2x'));
        expect(out.domain).toBeUndefined();
    });
});
