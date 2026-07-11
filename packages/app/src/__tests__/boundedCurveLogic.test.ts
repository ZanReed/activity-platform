// =============================================================================
// boundedCurveLogic.test.ts — linear + domain → ray/segment routing
// -----------------------------------------------------------------------------
// The unified "plot a bounded curve" authoring routes a LINEAR family with a
// domain clause to the ray/segment pills mechanic (a curved family stays
// plot_function + domains[], covered by the runtime harness). This pins the
// linear conversion: endpoints from f(x) at the bounds, open/closed from the
// clause, one-sided → ray with the right direction.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { parseGraphFormula } from '@activity/graph-kit';
import type { ParsedFormula } from '@activity/graph-kit';
import { linearDomainToRayOrSegment, routeCurveFormula, type LinearModel } from '../editor/nodeViews/boundedCurveLogic';

// Pull a linear model + domain straight from the parser, so the test exercises
// the real clause parsing the editor feeds in.
const linearWithDomain = (src: string): { model: LinearModel; domain: NonNullable<Extract<ParsedFormula, { kind: 'function' }>['domain']> } => {
    const p = parseGraphFormula(src);
    if (p.kind !== 'function' || p.model.family !== 'linear' || !p.domain) {
        throw new Error(`expected linear+domain for ${src}, got ${JSON.stringify(p)}`);
    }
    return { model: p.model, domain: p.domain };
};

describe('linearDomainToRayOrSegment', () => {
    it('two-sided domain → segment with endpoints at f(min) and f(max)', () => {
        const { model, domain } = linearWithDomain('y = 2x + 3 for 0 <= x <= 4');
        const out = linearDomainToRayOrSegment(model, domain);
        expect(out).toEqual({
            type: 'plot_segment',
            segments: [{
                from: [0, 3],
                to: [4, 11],
                endpoints: ['closed', 'closed'],
                tolerance: 0.25,
            }],
        });
    });

    it('carries open/closed from strict vs inclusive bounds', () => {
        const { model, domain } = linearWithDomain('y = x for 0 < x <= 4');
        const out = linearDomainToRayOrSegment(model, domain);
        expect(out.type).toBe('plot_segment');
        if (out.type === 'plot_segment') {
            expect(out.segments[0]!.endpoints).toEqual(['open', 'closed']);
        }
    });

    it('one-sided x >= min → ray heading +x from (min, f(min))', () => {
        const { model, domain } = linearWithDomain('y = 2x + 1 for x >= 0');
        const out = linearDomainToRayOrSegment(model, domain);
        expect(out).toEqual({
            type: 'plot_ray',
            rays: [{
                from: [0, 1],
                through: [1, 3], // one unit along +x names the direction
                fromStyle: 'closed',
                tolerance: 0.25,
            }],
        });
    });

    it('one-sided x <= max → ray heading −x from (max, f(max))', () => {
        const { model, domain } = linearWithDomain('y = 2x + 1 for x <= 3');
        const out = linearDomainToRayOrSegment(model, domain);
        expect(out).toEqual({
            type: 'plot_ray',
            rays: [{
                from: [3, 7],
                through: [2, 5], // one unit along −x
                fromStyle: 'closed',
                tolerance: 0.25,
            }],
        });
    });

    it('strict one-sided bound → open ray endpoint', () => {
        const { model, domain } = linearWithDomain('y = x for x > 2');
        const out = linearDomainToRayOrSegment(model, domain);
        if (out.type === 'plot_ray') expect(out.rays[0]!.fromStyle).toBe('open');
        else throw new Error('expected a ray');
    });
});

// The shared router the graded answer field uses regardless of the current
// question type — so a curve typed into a ray/segment field (the bug) routes
// the same way it does in a plot_function field.
describe('routeCurveFormula', () => {
    it('curved family + brace domain → bounded plot_function (the reported bug)', () => {
        const r = routeCurveFormula('x^2 {-1<x<1}');
        expect(r.ok).toBe(true);
        if (!r.ok || r.interaction.type !== 'plot_function') throw new Error('expected plot_function');
        // The whole point: the {…} clause survives as a domain (a bounded curve),
        // not dropped like the ray/segment field used to do.
        expect(r.interaction.domains).toEqual([{ min: -1, minStyle: 'open', max: 1, maxStyle: 'open' }]);
        const m = r.interaction.models[0]!;
        expect(m.family).toBe('quadratic');
        if (m.family === 'quadratic') {
            expect(m.a).toBe(1);
            expect(m.b).toBeCloseTo(0); // fitter yields ±0; either is y = x^2
            expect(m.c).toBeCloseTo(0);
        }
    });

    it('brace and `for` domain forms route identically', () => {
        const brace = routeCurveFormula('x^2 {-1<x<1}');
        const forClause = routeCurveFormula('x^2 for -1 < x < 1');
        expect(brace).toEqual(forClause);
    });

    it('linear + domain routes to a ray/segment (not plot_function)', () => {
        const r = routeCurveFormula('2x + 1 for 0 <= x <= 3');
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.interaction.type).toBe('plot_segment');
    });

    it('bare curve, no clause → full plot_function curve (no domains)', () => {
        const r = routeCurveFormula('x^2');
        expect(r.ok).toBe(true);
        if (!r.ok || r.interaction.type !== 'plot_function') throw new Error('expected plot_function');
        expect(r.interaction.domains).toBeUndefined();
        expect(r.interaction.models[0]).toMatchObject({ family: 'quadratic', a: 1 });
    });

    it('preserves a same-family model’s tuned tolerances', () => {
        const prev = { family: 'quadratic', a: 0, b: 0, c: 0, aTolerance: 0.5, bTolerance: 0.5, cTolerance: 0.5 } as const;
        const r = routeCurveFormula('x^2', prev);
        expect(r.ok).toBe(true);
        if (!r.ok || r.interaction.type !== 'plot_function') throw new Error('expected plot_function');
        expect(r.interaction.models[0]).toMatchObject({ aTolerance: 0.5, bTolerance: 0.5, cTolerance: 0.5 });
    });

    it('vertical + domain is steered with a teacher-safe message', () => {
        const r = routeCurveFormula('x = 4 {0 < x < 3}');
        // x = 4 with an x-range is contradictory; router rejects rather than
        // silently dropping the clause.
        expect(r.ok).toBe(false);
    });

    it('coordinates and inequalities are steered to their own question types', () => {
        expect(routeCurveFormula('(1, 2), (3, 4)')).toMatchObject({ ok: false });
        expect(routeCurveFormula('y > 2x + 1')).toMatchObject({ ok: false });
    });
});
