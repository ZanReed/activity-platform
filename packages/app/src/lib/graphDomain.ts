import type { ParsedDomain } from '@activity/graph-kit';

// The curve-drawable domain shape (schema `CurveDomain`): endpoint inclusion is
// carried as a style word, not a boolean, because that's what the renderers
// read. Structurally identical to the inline `domain` field on the `curve`
// member of DrawableAttr / the schema's CurveDrawable.
export interface CurveDomainAttr {
    min?: number;
    minStyle?: 'open' | 'closed';
    max?: number;
    maxStyle?: 'open' | 'closed';
}

// ParsedDomain (from the freeform formula parser) carries minClosed/maxClosed
// booleans; CurveDomain wants minStyle/maxStyle ('open' | 'closed'). Both
// renderers default a missing style to 'closed', so passing the booleans
// through unchanged silently renders an open endpoint ("for x > 0") as a
// closed dot. Shared by the markdown importer and the drawable-list editor —
// the two places that turn a parsed `for …` clause into a drawable.
export function toCurveDomain(d: ParsedDomain): CurveDomainAttr {
    return {
        ...(d.min !== undefined ? { min: d.min, minStyle: d.minClosed ? 'closed' : 'open' } : {}),
        ...(d.max !== undefined ? { max: d.max, maxStyle: d.maxClosed ? 'closed' : 'open' } : {}),
    };
}

// Round-trip the reverse direction: render a curve's domain back to the ` for …`
// clause the freeform parser accepts, so the drawable editor can show the
// authored restriction as editable text. Empty string when unbounded both ways.
// `>=`/`<=` for closed ends (the default when style is absent), `>`/`<` for open.
export function formatCurveDomain(domain?: CurveDomainAttr | null): string {
    if (!domain) return '';
    const hasMin = domain.min !== undefined;
    const hasMax = domain.max !== undefined;
    if (hasMin && hasMax) {
        const lo = domain.minStyle === 'open' ? '<' : '<=';
        const hi = domain.maxStyle === 'open' ? '<' : '<=';
        return ` for ${domain.min} ${lo} x ${hi} ${domain.max}`;
    }
    if (hasMin) {
        return ` for x ${domain.minStyle === 'open' ? '>' : '>='} ${domain.min}`;
    }
    if (hasMax) {
        return ` for x ${domain.maxStyle === 'open' ? '<' : '<='} ${domain.max}`;
    }
    return '';
}
