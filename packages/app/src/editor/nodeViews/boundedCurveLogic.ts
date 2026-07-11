import { parseGraphFormula, type ParsedDomain } from '@activity/graph-kit';
import type {
    FunctionInteractionAttr,
    FunctionModelAttr,
    RayInteractionAttr,
    SegmentInteractionAttr,
} from '../extensions/InteractiveGraph';
import { toCurveDomain } from '../../lib/graphDomain';

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

// ============================================================================
// routeCurveFormula — the shared "an equation typed into a graded answer field
// becomes the right interaction" router.
// ----------------------------------------------------------------------------
// Both the plot_function answer field and the plot_ray/plot_segment answer
// field delegate here, so a curve-with-domain like `x^2 {-1<x<1}` authors the
// same way regardless of the question's current type — mirroring the static
// (display) graph's unified `drawablesFromFreeform` router. Family + bounds
// decide the interaction:
//
//   nonlinear, no clause  → plot_function (full curve)
//   nonlinear + domain    → plot_function + domains[] (bounded-curve handles)
//   linear   + domain     → ray/segment (linearDomainToRayOrSegment)
//   linear/vertical, bare → plot_function (a full line question)
//
// `prevModel`, when the caller is already in plot_function mode with the same
// family, carries the teacher's tuned tolerances forward. Coordinates and
// inequalities are steered to their own question types with a teacher-safe
// message (they aren't curves).
// ============================================================================

export type CurveRoute =
    | { ok: true; interaction: FunctionInteractionAttr | RayInteractionAttr | SegmentInteractionAttr }
    | { ok: false; message: string };

export function routeCurveFormula(raw: string, prevModel?: FunctionModelAttr): CurveRoute {
    const parsed = parseGraphFormula(raw);
    if (parsed.kind === 'error') return { ok: false, message: parsed.message };
    if (parsed.kind === 'points') {
        return { ok: false, message: 'That looks like coordinates — switch the question type to "Plot a point"' };
    }
    if (parsed.kind === 'inequality') {
        // Graded inequalities are their own interaction (Drop 4); steer there.
        return { ok: false, message: 'That is an inequality — switch the question type to "Graph an inequality"' };
    }

    let model = parsed.model as FunctionModelAttr;
    // Same family → keep the teacher's tuned tolerances; new family → defaults.
    if (prevModel && model.family === prevModel.family) {
        const tolerances = Object.fromEntries(
            Object.entries(prevModel).filter(([k]) => k.endsWith('Tolerance')),
        );
        model = { ...model, ...tolerances } as FunctionModelAttr;
    }

    if (parsed.domain) {
        if (model.family === 'vertical') {
            return {
                ok: false,
                message: 'A vertical line can’t take an x-range. For a vertical segment, type "segment (4, 1) to (4, 5)".',
            };
        }
        if (model.family === 'linear') {
            return { ok: true, interaction: linearDomainToRayOrSegment(model, parsed.domain) };
        }
        return {
            ok: true,
            interaction: { type: 'plot_function', models: [model], domains: [toCurveDomain(parsed.domain)] },
        };
    }
    return { ok: true, interaction: { type: 'plot_function', models: [model] } };
}
