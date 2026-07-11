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
import {
    curveFromFormula,
    drawablesFromFreeform,
} from '../editor/components/drawableFormulaLogic';
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

// ---- drawablesFromFreeform — the unified add box ------------------------------

const ALL: readonly DrawableAttr['kind'][] = [
    'point', 'curve', 'expression', 'segment', 'ray', 'polygon',
];
const KIT_FREE = ALL.filter((k) => k !== 'expression');

const ok = (raw: string, kinds = ALL): DrawableAttr[] => {
    const res = drawablesFromFreeform(raw, kinds);
    if (res.kind !== 'ok') throw new Error(`unexpected error for ${raw}: ${res.message}`);
    return res.drawables;
};

describe('drawablesFromFreeform — routing', () => {
    it('routes a point list to one point drawable per pair', () => {
        expect(ok('(2, 3), (4, -1)')).toEqual([
            { kind: 'point', at: [2, 3] },
            { kind: 'point', at: [4, -1] },
        ]);
    });

    it('routes an equation to a curve with a fitted family', () => {
        const out = ok('y = x^2 - 4');
        expect(out).toHaveLength(1);
        expect(out[0]).toMatchObject({ kind: 'curve', model: { family: 'quadratic' } });
    });

    it('routes an inequality to a shaded curve (strict → dashed)', () => {
        expect(ok('y > 2x + 1')[0]).toMatchObject({
            kind: 'curve', shade: 'above', style: 'dashed',
            model: { family: 'linear', slope: 2, intercept: 1 },
        });
    });

    it('carries a domain clause onto the curve', () => {
        expect(ok('y = 2x for x >= 0')[0]).toMatchObject({
            kind: 'curve', domain: { min: 0, minStyle: 'closed' },
        });
    });

    it('routes ray syntax, keeping an open start style', () => {
        expect(ok('ray (1, 2) through (3, 4) open')).toEqual([
            { kind: 'ray', from: [1, 2], through: [3, 4], fromStyle: 'open' },
        ]);
    });

    it('omits the default closed ray style', () => {
        expect(ok('ray (0, 0) through (2, 1)')).toEqual([
            { kind: 'ray', from: [0, 0], through: [2, 1] },
        ]);
    });

    it('routes segment syntax with per-endpoint styles', () => {
        expect(ok('segment (0, 0) to (2, 2) open closed')).toEqual([
            { kind: 'segment', from: [0, 0], to: [2, 2], endpoints: ['open', 'closed'] },
        ]);
    });

    it('falls back to a sampled expression for non-family formulas', () => {
        expect(ok('sin(x)')).toEqual([{ kind: 'expression', expression: 'sin(x)' }]);
    });

    it('strips a leading y = from the expression fallback', () => {
        expect(ok('y = sin(x) + 1')).toEqual([
            { kind: 'expression', expression: 'sin(x) + 1' },
        ]);
    });

    it('accepts positives-only expressions (ln) via the probe', () => {
        expect(ok('x*ln(x)')[0]).toMatchObject({ kind: 'expression' });
    });
});

describe('drawablesFromFreeform — errors and kind gating', () => {
    it('rejects garbage with the parser message, not a NaN expression', () => {
        const res = drawablesFromFreeform('helo(x', ALL);
        expect(res.kind).toBe('error');
    });

    it('rejects an unknown bare word with a typo message, not "use a Display graph"', () => {
        const res = drawablesFromFreeform('hello', ALL);
        expect(res).toMatchObject({
            kind: 'error',
            message: expect.stringContaining('check for typos'),
        });
    });

    it('surfaces ray syntax errors from parseRaySegment', () => {
        const res = drawablesFromFreeform('ray (1, 2)', ALL);
        expect(res).toMatchObject({ kind: 'error', message: expect.stringContaining('two points') });
    });

    it('explains the expression gate on kit-free figures instead of adding silently', () => {
        const res = drawablesFromFreeform('sin(x)', KIT_FREE);
        expect(res).toMatchObject({
            kind: 'error',
            message: expect.stringContaining('known families'),
        });
    });

    it('still routes families and points on kit-free figures', () => {
        expect(ok('y = 2x + 1', KIT_FREE)[0]).toMatchObject({ kind: 'curve' });
        expect(ok('(1, 1)', KIT_FREE)[0]).toMatchObject({ kind: 'point' });
    });
});
