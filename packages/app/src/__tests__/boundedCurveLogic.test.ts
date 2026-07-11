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
import { linearDomainToRayOrSegment, type LinearModel } from '../editor/nodeViews/boundedCurveLogic';

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
