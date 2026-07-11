import {
    parseGraphFormula,
    parseRaySegment,
    compileFunction,
} from '@activity/graph-kit';
import type { ParsedFormula } from '@activity/graph-kit';
import type {
    DrawableAttr,
    FunctionModelAttr,
} from '../extensions/InteractiveGraph';
import { toCurveDomain } from '../../lib/graphDomain';

// Map a parsed formula onto a curve drawable — the pure core of the
// DrawableListEditor curve row, in its own file (the blankPopoverLogic.ts
// pattern) so it unit-tests without the component.
//
// The formula text is the full statement of intent: an INEQUALITY maps to
// boundary + shade + strict→dashed (the same convention the ```graph import
// branch writes); a plain EQUATION clears any prior shade; a clause-free
// formula clears any prior domain. Arrows survive every edit, and a style
// survives an equation edit — they're independent display options with their
// own checkboxes. The one style exception: an INCLUSIVE inequality drops a
// stale 'dashed' (dashed ⇄ strict is the shade convention, and the field
// displays a shaded-dashed row as strict).
export function curveFromFormula(
    d: Extract<DrawableAttr, { kind: 'curve' }>,
    parsed: Extract<ParsedFormula, { kind: 'function' | 'inequality' }>,
): Extract<DrawableAttr, { kind: 'curve' }> {
    const arrows = d.arrows !== undefined ? { arrows: d.arrows } : {};
    const domain = parsed.domain ? { domain: toCurveDomain(parsed.domain) } : {};
    if (parsed.kind === 'inequality') {
        return {
            kind: 'curve',
            model: parsed.boundary as FunctionModelAttr,
            shade: parsed.side,
            ...(parsed.strict
                ? { style: 'dashed' as const }
                : d.style && d.style !== 'dashed'
                  ? { style: d.style }
                  : {}),
            ...arrows,
            ...domain,
        };
    }
    return {
        kind: 'curve',
        model: parsed.model as FunctionModelAttr,
        ...(d.style ? { style: d.style } : {}),
        ...arrows,
        ...domain,
    };
}

// ---- The unified add box ----------------------------------------------------
// One calculator-style input that routes whatever the author types to the right
// drawable kind — points, equations/inequalities (curve), ray/segment commands,
// and the sampled-expression escape hatch — instead of a per-kind button row.
// `kinds` gates what the CONTEXT can render (MC choice figures are kit-free, so
// `expression` is excluded there); polygon has no text syntax and keeps its
// button.

export type FreeformAddResult =
    | { kind: 'ok'; drawables: DrawableAttr[] }
    | { kind: 'error'; message: string };

const FRESH_CURVE: Extract<DrawableAttr, { kind: 'curve' }> = {
    kind: 'curve',
    model: { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 },
};

// A compiled expression that never evaluates to a finite number is a typo
// ("hello"), not a plot — compileFunction can't tell (unknown symbols compile
// fine and sample NaN), so probe a spread of x values including positives-only
// territory for ln/sqrt. Three-way so the caller can word the error: 'ok',
// 'no-compile' (syntax), or 'never-finite' (typo/unknown name).
const PROBE_XS = [-4, -2.5, -1, 0.5, 1, 2, 3.5, 5];
function probeExpression(expression: string): 'ok' | 'no-compile' | 'never-finite' {
    const fn = compileFunction(expression);
    if (!fn) return 'no-compile';
    return PROBE_XS.some((x) => Number.isFinite(fn(x))) ? 'ok' : 'never-finite';
}

export function drawablesFromFreeform(
    raw: string,
    kinds: readonly DrawableAttr['kind'][],
): FreeformAddResult {
    // Command words first — parseGraphFormula would reject them as equations.
    if (/^\s*(ray|segment)\b/i.test(raw)) {
        const rs = parseRaySegment(raw);
        if (rs.kind === 'error') return { kind: 'error', message: rs.message };
        if (!kinds.includes(rs.kind)) {
            return { kind: 'error', message: `A ${rs.kind} isn't available on this graph.` };
        }
        if (rs.kind === 'ray') {
            return {
                kind: 'ok',
                drawables: [{
                    kind: 'ray',
                    from: rs.from,
                    through: rs.through,
                    ...(rs.fromStyle === 'open' ? { fromStyle: 'open' as const } : {}),
                }],
            };
        }
        return {
            kind: 'ok',
            drawables: [{
                kind: 'segment',
                from: rs.from,
                to: rs.to,
                ...(rs.endpoints.includes('open') ? { endpoints: rs.endpoints } : {}),
            }],
        };
    }

    const parsed = parseGraphFormula(raw);
    if (parsed.kind === 'points') {
        if (!kinds.includes('point')) {
            return { kind: 'error', message: "Points aren't available on this graph." };
        }
        return {
            kind: 'ok',
            drawables: parsed.points.map((at) => ({ kind: 'point' as const, at })),
        };
    }
    if (parsed.kind === 'function' || parsed.kind === 'inequality') {
        if (!kinds.includes('curve')) {
            return { kind: 'error', message: "Curves aren't available on this graph." };
        }
        return { kind: 'ok', drawables: [curveFromFormula(FRESH_CURVE, parsed)] };
    }

    // Family fit failed (sin(x), rationals, …) — the sampled-expression escape
    // hatch, when the context can render it and the input is a bare y = f(x).
    const expression = raw.replace(/^\s*(y|f\(x\))\s*=/i, '').trim();
    if (!/[=<>]/.test(expression)) {
        const probe = probeExpression(expression);
        if (probe === 'ok') {
            if (!kinds.includes('expression')) {
                return {
                    kind: 'error',
                    message:
                        'This figure only draws known families (linear, quadratic, exponential, logarithmic) — freeform formulas aren\'t available here.',
                };
            }
            return { kind: 'ok', drawables: [{ kind: 'expression', expression }] };
        }
        if (probe === 'never-finite') {
            // parseGraphFormula's message would say "use a Display graph" — but
            // this IS one; the input just never yields a number.
            return {
                kind: 'error',
                message: "That formula never produces a plottable value — check for typos.",
            };
        }
    }
    return { kind: 'error', message: parsed.message };
}
