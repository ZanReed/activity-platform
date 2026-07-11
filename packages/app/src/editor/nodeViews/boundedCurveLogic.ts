import type { ParsedDomain } from '@activity/graph-kit';
import type {
    FunctionModelAttr,
    RayInteractionAttr,
    SegmentInteractionAttr,
} from '../extensions/InteractiveGraph';

// ============================================================================
// boundedCurveLogic — unified authoring for "a bounded curve".
// ----------------------------------------------------------------------------
// A teacher types one equation with an optional domain clause. Family + bounds
// decide the interaction, without the teacher choosing a question type:
//
//   LINEAR + domain    → a ray (one-sided) or segment (two-sided). Routes to
//                        the ray/segment PILLS mechanic — the student drags two
//                        endpoint handles and picks the shape.
//   NON-LINEAR + domain → stays plot_function with domains[] — the bounded-curve
//                        endpoint-handle mechanic (student drags the two ends
//                        along the curve).
//
// This module owns the linear → ray/segment conversion (pure, unit-tested).
// The endpoints derive from the line evaluated at the domain bounds; open/closed
// carries from the clause (`>` / `<` = open). A one-sided domain names a ray in
// the +x (min bound) or −x (max bound) direction; a second point one unit along
// names the direction.
// ============================================================================

const TOLERANCE = 0.25; // matches RayAnswer/SegmentAnswer schema defaults
const style = (closed: boolean | undefined): 'open' | 'closed' =>
    closed === false ? 'open' : 'closed';

// A finite number rounded to kill float fuzz from slope*x + intercept.
const at = (slope: number, intercept: number, x: number): number =>
    Math.round((slope * x + intercept) * 1e6) / 1e6;

export type LinearModel = Extract<FunctionModelAttr, { family: 'linear' }>;

// Convert a linear model + domain into the ray/segment interaction it describes.
// The caller guarantees the model is linear and the domain has at least one
// bound (parseGraphFormula only attaches a domain when a clause was present).
export function linearDomainToRayOrSegment(
    model: LinearModel,
    domain: ParsedDomain,
): RayInteractionAttr | SegmentInteractionAttr {
    const { slope, intercept } = model;
    const hasMin = domain.min !== undefined;
    const hasMax = domain.max !== undefined;

    if (hasMin && hasMax) {
        const min = domain.min as number;
        const max = domain.max as number;
        return {
            type: 'plot_segment',
            segments: [
                {
                    from: [min, at(slope, intercept, min)],
                    to: [max, at(slope, intercept, max)],
                    endpoints: [style(domain.minClosed), style(domain.maxClosed)],
                    tolerance: TOLERANCE,
                },
            ],
        };
    }

    if (hasMin) {
        // x ≥ min → ray starting at (min, f(min)) heading in +x.
        const min = domain.min as number;
        return {
            type: 'plot_ray',
            rays: [
                {
                    from: [min, at(slope, intercept, min)],
                    through: [min + 1, at(slope, intercept, min + 1)],
                    fromStyle: style(domain.minClosed),
                    tolerance: TOLERANCE,
                },
            ],
        };
    }

    // x ≤ max → ray starting at (max, f(max)) heading in −x.
    const max = domain.max as number;
    return {
        type: 'plot_ray',
        rays: [
            {
                from: [max, at(slope, intercept, max)],
                through: [max - 1, at(slope, intercept, max - 1)],
                fromStyle: style(domain.maxClosed),
                tolerance: TOLERANCE,
            },
        ],
    };
}
