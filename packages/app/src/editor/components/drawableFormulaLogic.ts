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
